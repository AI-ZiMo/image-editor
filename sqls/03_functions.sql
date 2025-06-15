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
  -- 生成新的项目ID
  v_project_id := gen_random_uuid();
  
  -- 插入原图作为新项目，project_id设置为自己的id以满足约束
  INSERT INTO ai_images_creator_history (
    id, user_id, project_id, image_url, storage_path, is_original, project_name
  ) VALUES (
    v_project_id, p_user_id, v_project_id, p_image_url, p_storage_path, true, p_project_name
  );
  
  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户所有作品列表 (已优化)
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
  SELECT 
    orig.project_id,
    orig.project_name,
    orig.image_url as original_image_url,
    COALESCE(latest.image_url, orig.image_url) as latest_image_url,
    COALESCE(stats.total_images, 1)::INTEGER as total_images,
    orig.created_at,
    COALESCE(stats.max_updated_at, orig.updated_at) as updated_at
  FROM ai_images_creator_history orig
  LEFT JOIN (
    -- 获取每个项目的统计信息
    SELECT 
      h.project_id,
      COUNT(*) as total_images,
      MAX(h.updated_at) as max_updated_at
    FROM ai_images_creator_history h
    WHERE h.user_id = p_user_id 
      AND h.is_deleted = false
    GROUP BY h.project_id
  ) stats ON orig.project_id = stats.project_id
  LEFT JOIN (
    -- 获取每个项目的最新图片
    SELECT DISTINCT ON (h.project_id)
      h.project_id,
      h.image_url
    FROM ai_images_creator_history h
    WHERE h.user_id = p_user_id 
      AND h.is_deleted = false
    ORDER BY h.project_id, h.created_at DESC
  ) latest ON orig.project_id = latest.project_id
  WHERE orig.user_id = p_user_id 
    AND orig.is_original = true 
    AND orig.is_deleted = false
  ORDER BY COALESCE(stats.max_updated_at, orig.updated_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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
  p_storage_path TEXT DEFAULT NULL,
  p_prompt TEXT DEFAULT NULL,
  p_style TEXT DEFAULT NULL,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 扣除用户积分的函数（SECURITY DEFINER权限修复）
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 确保函数有正确的权限
GRANT EXECUTE ON FUNCTION deduct_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_user_credits(UUID, INTEGER) TO service_role;

-- 增加用户积分的函数（SECURITY DEFINER权限修复）
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 确保函数有正确的权限
GRANT EXECUTE ON FUNCTION add_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_credits(UUID, INTEGER) TO service_role;

-- 为所有其他函数授予权限
GRANT EXECUTE ON FUNCTION create_new_project(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_project(UUID, TEXT, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION smart_delete_image(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION smart_delete_image(UUID, UUID) TO service_role;

GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_projects(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION get_project_image_chain(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_image_chain(UUID, UUID) TO service_role;

GRANT EXECUTE ON FUNCTION get_project_latest_image(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_latest_image(UUID, UUID) TO service_role;

GRANT EXECUTE ON FUNCTION add_generated_image(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_generated_image(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION rename_project(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION rename_project(UUID, UUID, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION delete_project(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_project(UUID, UUID) TO service_role;