-- =====================================================
-- 性能优化 - 索引优化和查询改进
-- =====================================================

-- 删除可能重复或效率低的索引，添加更精确的复合索引

-- 1. 针对用户历史记录查询的复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_user_original_active 
ON ai_images_creator_history(user_id, is_original, is_deleted, created_at DESC)
WHERE is_deleted = false;

-- 2. 针对项目内图片查询的复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_user_project_active_created 
ON ai_images_creator_history(user_id, project_id, is_deleted, created_at DESC)
WHERE is_deleted = false;

-- 3. 针对最新图片查询的复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_project_created_desc 
ON ai_images_creator_history(project_id, created_at DESC, is_deleted)
WHERE is_deleted = false;

-- 4. 针对父子关系查询的索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_parent_user_project 
ON ai_images_creator_history(parent_id, user_id, project_id, is_deleted)
WHERE is_deleted = false;

-- 5. 针对更新时间排序的复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_user_updated_desc 
ON ai_images_creator_history(user_id, updated_at DESC, is_deleted)
WHERE is_deleted = false;

-- 注意：get_user_projects 函数已在 03_functions.sql 中优化
-- 此文件主要包含索引优化，函数优化已合并到主函数文件中

-- 注意：get_project_image_chain 函数也已在 03_functions.sql 中优化
-- 如果需要进一步优化，可以在此处添加

-- 分析统计信息
ANALYZE ai_images_creator_history;

-- 创建部分索引以提高性能（如果表数据量大）
-- 这些索引只对活跃数据生效，减少索引大小
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_active_by_user_time 
ON ai_images_creator_history(user_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_active_by_project_time 
ON ai_images_creator_history(project_id, created_at DESC) 
WHERE is_deleted = false;

-- 为经常查询的字段组合创建covering index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_covering_user_projects
ON ai_images_creator_history(user_id, is_original, project_id, project_name, image_url, created_at, updated_at)
WHERE is_deleted = false AND is_original = true;