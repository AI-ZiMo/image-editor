# AI Image Editor - Database Setup

这个文件夹包含了AI图片编辑器的完整数据库设置脚本。请按照以下顺序执行以确保正确的数据库结构。

## 执行顺序

### 1. `01_credits_table.sql` - 用户积分系统
创建用户积分表和相关触发器
- `ai_images_creator_credits` 表
- 自动更新触发器
- 用户注册时自动分配2积分的触发器
- RLS 安全策略

### 2. `02_history_table.sql` - 图片历史记录
创建图片历史表，支持多项目管理
- `ai_images_creator_history` 表
- 项目分支结构支持
- 软删除机制
- 全面的索引优化
- RLS 安全策略

### 3. `03_functions.sql` - 数据库函数集
核心业务逻辑函数
- 项目管理函数
- 智能删除逻辑
- 积分管理
- 图片链查询

### 4. `04_storage_setup.sql` - 存储桶配置
配置 Supabase 存储
- 创建 `images` 存储桶
- 配置存储访问策略

## 重要说明

### ✅ 已修复的问题

1. **文件命名规范化**: 所有文件已按执行顺序重命名
   - ✅ `credits_table.sql` → `01_credits_table.sql`
   - ✅ `history_table.sql` → `02_history_table.sql`
   - ✅ `functions.sql` → `03_functions.sql`
   - ✅ `supabase-setup.sql` → `04_storage_setup.sql`

2. **存储策略优化**: 
   - ✅ 添加了 `ON CONFLICT DO NOTHING` 避免重复创建存储桶
   - ✅ 修复了用户文件夹隔离策略
   - ✅ 添加了 UPDATE 权限策略

3. **函数错误处理增强**:
   - ✅ `smart_delete_image()` 添加了存在性检查
   - ✅ 改进了数组长度验证
   - ✅ 添加了更新时间戳

### ⚠️ 部署注意事项

1. **函数依赖关系**: `03_functions.sql` 依赖于前两个表的存在，必须按顺序执行

2. **RLS 策略**: 所有表都启用了行级安全(RLS)，确保 Supabase 项目正确配置了认证

3. **存储权限**: 确保应用使用正确的 service_role 密钥进行文件操作

## 核心功能

### 积分系统
- 用户注册自动获得2积分
- 积分不能为负数（CHECK约束）
- 自动更新时间戳

### 多项目支持
- 每个原始图片创建一个独立项目
- 支持项目重命名和删除
- 树状结构支持图片编辑分支

### 智能删除
- 软删除机制保护数据
- 自动重连父子关系
- 不允许删除原始图片

### 存储集成
- Supabase 存储桶集成
- 公开访问配置
- 用户文件夹隔离

## 使用建议

1. **开发环境**: 建议先在开发分支测试所有脚本
2. **生产部署**: 确保数据库备份后再执行
3. **权限检查**: 验证 service_role 权限配置正确
4. **索引监控**: 大数据量时监控查询性能

## API 集成点

这些数据库函数设计为与以下 API 端点配合使用：
- `/api/upload-image` - 使用 `create_new_project()`
- `/api/edit-image` - 使用 `add_generated_image()` 和 `deduct_user_credits()`
- `/api/delete-image` - 使用 `smart_delete_image()`
- 用户界面 - 使用 `get_user_projects()` 和 `get_project_image_chain()`

## 故障排除

### 常见错误
1. **权限错误**: 检查 RLS 策略和用户认证
2. **约束违反**: 确保原图的 `project_id = id`
3. **触发器失败**: 检查 `auth.users` 表存在

### 调试查询
```sql
-- 检查用户积分
SELECT * FROM ai_images_creator_credits WHERE user_id = 'your-user-id';

-- 查看项目列表
SELECT * FROM get_user_projects('your-user-id');

-- 检查特定项目的图片链
SELECT * FROM get_project_image_chain('your-user-id', 'project-id');
```