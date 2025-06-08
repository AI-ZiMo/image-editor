-- =====================================================
-- 支付记录表 (ai_images_creator_payments)
-- =====================================================

-- 创建支付记录表
CREATE TABLE ai_images_creator_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 订单信息
  out_trade_no TEXT UNIQUE NOT NULL, -- 商户订单号（我们生成）
  trade_no TEXT, -- 支付平台订单号（回调时获得）
  
  -- 支付信息  
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0), -- 支付金额
  credits_amount INTEGER NOT NULL CHECK (credits_amount > 0), -- 充值点数
  payment_type VARCHAR(20) NOT NULL DEFAULT 'alipay', -- 支付方式：alipay, wxpay
  
  -- 支付状态
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, cancelled
  
  -- 额外信息
  param TEXT, -- 附加参数
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE, -- 支付完成时间
  
  -- 索引
  CONSTRAINT check_status CHECK (status IN ('pending', 'success', 'failed', 'cancelled'))
);

-- 创建索引
CREATE INDEX idx_payments_user_id ON ai_images_creator_payments(user_id);
CREATE INDEX idx_payments_out_trade_no ON ai_images_creator_payments(out_trade_no);
CREATE INDEX idx_payments_trade_no ON ai_images_creator_payments(trade_no);
CREATE INDEX idx_payments_status ON ai_images_creator_payments(status);
CREATE INDEX idx_payments_created_at ON ai_images_creator_payments(created_at DESC);

-- 启用 RLS
ALTER TABLE ai_images_creator_payments ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own payments" ON ai_images_creator_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments" ON ai_images_creator_payments
  FOR ALL USING (auth.role() = 'service_role');

-- 授予权限
GRANT ALL ON ai_images_creator_payments TO authenticated;
GRANT ALL ON ai_images_creator_payments TO service_role;

-- 自动更新 updated_at 触发器
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON ai_images_creator_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建支付订单函数
CREATE OR REPLACE FUNCTION create_payment_order(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_credits_amount INTEGER,
  p_payment_type VARCHAR(20) DEFAULT 'alipay'
)
RETURNS TABLE (
  order_id UUID,
  out_trade_no TEXT
) AS $$
DECLARE
  v_order_id UUID;
  v_out_trade_no TEXT;
BEGIN
  -- 生成商户订单号：时间戳 + 随机数
  v_out_trade_no := TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  
  -- 插入支付记录
  INSERT INTO ai_images_creator_payments (
    user_id, out_trade_no, amount, credits_amount, payment_type
  ) VALUES (
    p_user_id, v_out_trade_no, p_amount, p_credits_amount, p_payment_type
  ) RETURNING id INTO v_order_id;
  
  RETURN QUERY SELECT v_order_id, v_out_trade_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新支付状态函数
CREATE OR REPLACE FUNCTION update_payment_status(
  p_out_trade_no TEXT,
  p_trade_no TEXT,
  p_status VARCHAR(20)
)
RETURNS TABLE (
  user_id UUID,
  credits_amount INTEGER,
  amount DECIMAL(10,2)
) AS $$
DECLARE
  v_user_id UUID;
  v_credits_amount INTEGER;
  v_amount DECIMAL(10,2);
BEGIN
  -- 更新支付状态
  UPDATE ai_images_creator_payments 
  SET 
    trade_no = p_trade_no,
    status = p_status,
    paid_at = CASE WHEN p_status = 'success' THEN NOW() ELSE paid_at END,
    updated_at = NOW()
  WHERE out_trade_no = p_out_trade_no
  RETURNING ai_images_creator_payments.user_id, ai_images_creator_payments.credits_amount, ai_images_creator_payments.amount
  INTO v_user_id, v_credits_amount, v_amount;
  
  -- 如果支付成功，增加用户积分
  IF p_status = 'success' AND v_user_id IS NOT NULL THEN
    PERFORM add_user_credits(v_user_id, v_credits_amount);
  END IF;
  
  RETURN QUERY SELECT v_user_id, v_credits_amount, v_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取支付状态函数
CREATE OR REPLACE FUNCTION get_payment_status(
  p_user_id UUID,
  p_out_trade_no TEXT
)
RETURNS TABLE (
  status VARCHAR(20),
  credits_amount INTEGER,
  amount DECIMAL(10,2),
  paid_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.status, p.credits_amount, p.amount, p.paid_at
  FROM ai_images_creator_payments p
  WHERE p.user_id = p_user_id AND p.out_trade_no = p_out_trade_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予函数权限
GRANT EXECUTE ON FUNCTION create_payment_order(UUID, DECIMAL(10,2), INTEGER, VARCHAR(20)) TO authenticated;
GRANT EXECUTE ON FUNCTION create_payment_order(UUID, DECIMAL(10,2), INTEGER, VARCHAR(20)) TO service_role;

GRANT EXECUTE ON FUNCTION update_payment_status(TEXT, TEXT, VARCHAR(20)) TO authenticated;
GRANT EXECUTE ON FUNCTION update_payment_status(TEXT, TEXT, VARCHAR(20)) TO service_role;

GRANT EXECUTE ON FUNCTION get_payment_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_status(UUID, TEXT) TO service_role; 