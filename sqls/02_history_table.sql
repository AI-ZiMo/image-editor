-- =====================================================
-- 图片历史表 (ai_images_creator_history) - 支持多作品
-- =====================================================

-- 创建图片历史表
CREATE TABLE ai_images_creator_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID NOT NULL, -- 作品项目ID，原图的ID作为整个项目的标识
  parent_id UUID REFERENCES ai_images_creator_history(id) ON DELETE SET NULL, -- 父图片ID，支持分支
  
  -- 图片信息
  image_url TEXT NOT NULL,
  storage_path TEXT, -- Supabase storage path
  prompt TEXT,
  style TEXT,
  aspect_ratio TEXT DEFAULT 'match_input_image',
  
  -- 图片类型和状态
  is_original BOOLEAN DEFAULT false, -- 是否为原始图片
  is_deleted BOOLEAN DEFAULT false, -- 软删除标记
  generation_order INTEGER NOT NULL DEFAULT 1, -- 生成顺序（同一父图片下的顺序）
  
  -- 作品元数据
  project_name TEXT, -- 用户可以为作品命名
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 创建基础索引
CREATE INDEX idx_history_user_id ON ai_images_creator_history(user_id);
CREATE INDEX idx_history_project_id ON ai_images_creator_history(project_id);
CREATE INDEX idx_history_parent_id ON ai_images_creator_history(parent_id);

-- 创建性能优化的复合索引
CREATE INDEX idx_history_user_original_active ON ai_images_creator_history(user_id, is_original, is_deleted, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_history_user_project_active_created ON ai_images_creator_history(user_id, project_id, is_deleted, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_history_project_created_desc ON ai_images_creator_history(project_id, created_at DESC, is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_history_parent_user_project ON ai_images_creator_history(parent_id, user_id, project_id, is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_history_user_updated_desc ON ai_images_creator_history(user_id, updated_at DESC, is_deleted) WHERE is_deleted = false;

-- 覆盖索引，包含查询中需要的所有字段
CREATE INDEX idx_history_covering_user_projects ON ai_images_creator_history(user_id, is_original, project_id, project_name, image_url, created_at, updated_at) WHERE is_deleted = false AND is_original = true;

-- 约束：原图的project_id必须等于自己的id
ALTER TABLE ai_images_creator_history 
ADD CONSTRAINT check_original_project_id 
CHECK (NOT is_original OR project_id = id);

-- 启用 RLS
ALTER TABLE ai_images_creator_history ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can manage own history" ON ai_images_creator_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all history" ON ai_images_creator_history
  FOR ALL USING (auth.role() = 'service_role');

-- 自动更新 updated_at
CREATE TRIGGER update_history_updated_at 
  BEFORE UPDATE ON ai_images_creator_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();