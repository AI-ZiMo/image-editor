-- =====================================================
-- 用户积分表 (ai_images_creator_credits)
-- =====================================================

-- 创建用户积分表
CREATE TABLE ai_images_creator_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credits INTEGER DEFAULT 0 NOT NULL CHECK (credits >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX idx_credits_user_id ON ai_images_creator_credits(user_id);

-- 启用 RLS
ALTER TABLE ai_images_creator_credits ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view own credits" ON ai_images_creator_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage credits" ON ai_images_creator_credits
  FOR ALL USING (auth.role() = 'service_role');

-- 授予必要权限
GRANT ALL ON ai_images_creator_credits TO authenticated;
GRANT ALL ON ai_images_creator_credits TO service_role;

-- 更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credits_updated_at 
  BEFORE UPDATE ON ai_images_creator_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 用户注册时自动给2个点数的触发器 (使用显式架构引用修复事务错误)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ai_images_creator_credits (user_id, credits)
  VALUES (NEW.id, 2);
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 为任何已存在但没有积分记录的用户创建积分记录
INSERT INTO public.ai_images_creator_credits (user_id, credits)
SELECT id, 2 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.ai_images_creator_credits);