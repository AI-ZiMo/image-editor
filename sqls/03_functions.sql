-- =====================================================
-- 辅助函数集合 - 支持多作品
-- =====================================================

-- 创建新作品（上传原图）
CREATE OR REPLACE FUNCTION create_new_project(
  p_user_id UUID,
  p_image_url TEXT,
  p_storage_path TEXT,
  p_project_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_project_id UUID;
BEGIN
  -- 插入原图作为新项目
  INSERT INTO ai_images_creator_history (
    user_id, project_id, image_url, storage_path, is_original, project_name
  ) VALUES (
    p_user_id, gen_random_uuid(), p_image_url, p_storage_path, true, p_project_name
  ) RETURNING id INTO v_project_id;
  
  -- 更新project_id为自己的id（原图的特殊规则）
  UPDATE ai_images_creator_history 
  SET project_id = v_project_id 
  WHERE id = v_project_id;
  
  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- 智能删除图片的函数（基于项目）
CREATE OR REPLACE FUNCTION smart_delete_image(
  p_image_id UUID, 
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_parent_id UUID;
  v_child_ids UUID[];
  v_project_id UUID;
  v_found_count INTEGER;
BEGIN
  -- 检查图片是否存在且属于该用户
  SELECT parent_id, project_id INTO v_parent_id, v_project_id
  FROM ai_images_creator_history 
  WHERE id = p_image_id AND user_id = p_user_id AND is_deleted = false;
  
  GET DIAGNOSTICS v_found_count = ROW_COUNT;
  
  IF v_found_count = 0 THEN
    RAISE EXCEPTION '图片不存在或已被删除';
  END IF;
  
  -- 不允许删除原图
  IF EXISTS (
    SELECT 1 FROM ai_images_creator_history 
    WHERE id = p_image_id AND user_id = p_user_id AND is_original = true
  ) THEN
    RAISE EXCEPTION '不能删除原图';
  END IF;
  
  -- 获取被删除图片的所有直接子图片ID
  SELECT ARRAY_AGG(id) INTO v_child_ids
  FROM ai_images_creator_history 
  WHERE parent_id = p_image_id 
    AND user_id = p_user_id 
    AND project_id = v_project_id
    AND is_deleted = false;
  
  -- 软删除目标图片
  UPDATE ai_images_creator_history 
  SET is_deleted = true, deleted_at = NOW()
  WHERE id = p_image_id AND user_id = p_user_id;
  
  -- 重新连接子图片到父图片（跳过被删除的图片）
  IF v_child_ids IS NOT NULL AND array_length(v_child_ids, 1) > 0 THEN
    UPDATE ai_images_creator_history 
    SET parent_id = v_parent_id, updated_at = NOW()
    WHERE id = ANY(v_child_ids) AND user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 获取用户所有作品列表
CREATE OR REPLACE FUNCTION get_user_projects(p_user_id UUID)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  original_image_url TEXT,
  latest_image_url TEXT,
  total_images INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH project_stats AS (
    SELECT 
      h.project_id,
      h.project_name,
      h.image_url as original_image_url,
      h.created_at,
      COUNT(h2.id) as total_images,
      MAX(h2.updated_at) as updated_at
    FROM ai_images_creator_history h
    LEFT JOIN ai_images_creator_history h2 ON h.project_id = h2.project_id 
      AND h2.user_id = p_user_id 
      AND h2.is_deleted = false
    WHERE h.user_id = p_user_id 
      AND h.is_original = true 
      AND h.is_deleted = false
    GROUP BY h.project_id, h.project_name, h.image_url, h.created_at
  ),
  latest_images AS (
    SELECT DISTINCT ON (h.project_id)
      h.project_id,
      h.image_url as latest_image_url
    FROM ai_images_creator_history h
    WHERE h.user_id = p_user_id 
      AND h.is_deleted = false
    ORDER BY h.project_id, h.created_at DESC
  )
  SELECT 
    ps.project_id,
    ps.project_name,
    ps.original_image_url,
    li.latest_image_url,
    ps.total_images::INTEGER,
    ps.created_at,
    ps.updated_at
  FROM project_stats ps
  LEFT JOIN latest_images li ON ps.project_id = li.project_id
  ORDER BY ps.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 获取特定项目的活跃图片链
CREATE OR REPLACE FUNCTION get_project_image_chain(
  p_user_id UUID, 
  p_project_id UUID
)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  image_url TEXT,
  storage_path TEXT,
  prompt TEXT,
  style TEXT,
  is_original BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  chain_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE active_chain AS (
    -- 找到原始图片（起点）
    SELECT 
      h.id, h.parent_id, h.image_url, h.storage_path, h.prompt, h.style, 
      h.is_original, h.created_at, 1 as chain_order
    FROM ai_images_creator_history h
    WHERE h.user_id = p_user_id 
      AND h.project_id = p_project_id
      AND h.is_original = true 
      AND h.is_deleted = false
    
    UNION ALL
    
    -- 递归查找子图片（只选择未删除的）
    SELECT 
      h.id, h.parent_id, h.image_url, h.storage_path, h.prompt, h.style,
      h.is_original, h.created_at, ac.chain_order + 1
    FROM ai_images_creator_history h
    INNER JOIN active_chain ac ON h.parent_id = ac.id
    WHERE h.user_id = p_user_id 
      AND h.project_id = p_project_id
      AND h.is_deleted = false
  )
  SELECT * FROM active_chain ORDER BY chain_order;
END;
$$ LANGUAGE plpgsql;

-- 获取特定项目的最新图片
CREATE OR REPLACE FUNCTION get_project_latest_image(
  p_user_id UUID, 
  p_project_id UUID
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  storage_path TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH active_images AS (
    SELECT * FROM get_project_image_chain(p_user_id, p_project_id)
  )
  SELECT ai.id, ai.image_url, ai.storage_path
  FROM active_images ai
  ORDER BY ai.chain_order DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 添加生成图片到项目
CREATE OR REPLACE FUNCTION add_generated_image(
  p_user_id UUID,
  p_project_id UUID,
  p_parent_id UUID,
  p_image_url TEXT,
  p_storage_path TEXT,
  p_prompt TEXT,
  p_style TEXT,
  p_aspect_ratio TEXT DEFAULT 'match_input_image'
) RETURNS UUID AS $$
DECLARE
  v_new_image_id UUID;
  v_generation_order INTEGER;
BEGIN
  -- 获取下一个生成顺序号
  SELECT COALESCE(MAX(generation_order), 0) + 1 
  INTO v_generation_order
  FROM ai_images_creator_history 
  WHERE project_id = p_project_id AND user_id = p_user_id;
  
  -- 插入新图片记录
  INSERT INTO ai_images_creator_history (
    user_id, project_id, parent_id, image_url, storage_path,
    prompt, style, aspect_ratio, generation_order, is_original
  ) VALUES (
    p_user_id, p_project_id, p_parent_id, p_image_url, p_storage_path,
    p_prompt, p_style, p_aspect_ratio, v_generation_order, false
  ) RETURNING id INTO v_new_image_id;
  
  RETURN v_new_image_id;
END;
$$ LANGUAGE plpgsql;

-- 重命名项目
CREATE OR REPLACE FUNCTION rename_project(
  p_user_id UUID,
  p_project_id UUID,
  p_new_name TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_images_creator_history 
  SET project_name = p_new_name, updated_at = NOW()
  WHERE user_id = p_user_id 
    AND project_id = p_project_id 
    AND is_original = true;
END;
$$ LANGUAGE plpgsql;

-- 删除整个项目
CREATE OR REPLACE FUNCTION delete_project(
  p_user_id UUID,
  p_project_id UUID
) RETURNS VOID AS $$
BEGIN
  -- 软删除项目中的所有图片
  UPDATE ai_images_creator_history 
  SET is_deleted = true, deleted_at = NOW()
  WHERE user_id = p_user_id AND project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- 扣除用户积分的函数（保持不变）
CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  SELECT credits INTO v_current_credits
  FROM ai_images_creator_credits
  WHERE user_id = p_user_id;
  
  IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE ai_images_creator_credits
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 增加用户积分的函数（保持不变）
CREATE OR REPLACE FUNCTION add_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_images_creator_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits = ai_images_creator_credits.credits + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;