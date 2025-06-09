# 小猫AI图片编辑

<p align="center">
  <img src="https://img.shields.io/badge/AI-图片编辑-purple" alt="AI图片编辑">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8" alt="Tailwind CSS">
</p>

<h1 align="center">小猫AI图片编辑</h1>

<p align="center">
 代替PS的AI图片编辑工具 - 采用最先进的图片大模型，保持图片一致性，拥有顶级的AI图片编辑体验
</p>

<p align="center">
  <a href="#features"><strong>功能特性</strong></a> ·
  <a href="#tech-stack"><strong>技术栈</strong></a> ·
  <a href="#getting-started"><strong>快速开始</strong></a> ·
  <a href="#deployment"><strong>部署</strong></a>
</p>
<br/>

## 功能特性

### 🎨 AI图片编辑
- **智能提示词编辑** - 通过文字描述轻松编辑图片内容
- **多种风格转换** - 支持水彩画、动漫、油画、贴纸等多种艺术风格
- **老照片上色** - AI智能为黑白照片添加自然色彩
- **高质量输出** - 保持原图质量，生成高分辨率结果

### 🚀 技术特性
- **Next.js 14** - 使用最新的App Router架构
- **TypeScript** - 完整的类型安全
- **Supabase** - 现代化的后端即服务
- **Tailwind CSS** - 响应式设计
- **Shadcn/ui** - 美观的UI组件库

### 💡 用户体验
- **全屏预览** - 点击任意对比图片可全屏查看详细效果
- **响应式设计** - 完美适配桌面端和移动端
- **用户认证** - 安全的登录注册系统
- **历史记录** - 保存和管理您的创作历史

## 技术栈

- **前端**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **AI服务**: 支持兔子AI (tu-zi.com) 和 Replicate AI 模型
- **部署**: Vercel
- **状态管理**: React Hooks
- **图片处理**: Next.js Image 组件

## 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm
- Supabase 账户

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/xiaomao-ai-image-editor.git
   cd xiaomao-ai-image-editor
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **环境配置**
   
   复制 `.env.example` 为 `.env.local` 并填入以下配置：
   
   ```env
   # Supabase配置
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # AI服务配置
   # PROVIDER: 选择AI服务提供商 ("tuzi" 或 "replicate")
   PROVIDER=tuzi
   # MODEL: 选择具体模型 ("flux-kontext-pro" 或 "flux-kontext-max")
   MODEL=flux-kontext-pro
   
   # Replicate配置 (当PROVIDER=replicate时需要)
   REPLICATE_API_TOKEN=your_replicate_api_token
   
   # 兔子AI配置 (当PROVIDER=tuzi时需要)
   TUZI_API_KEY=your_tuzi_api_key
   
   # 支付配置 (可选)
   ZPAY_PID=your_zpay_pid
   ZPAY_KEY=your_zpay_key
   
   # 网站URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   ### 环境变量说明
   
   #### 必需配置
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase项目URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名访问密钥
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase服务角色密钥
   - `PROVIDER`: AI服务提供商，可选值：
     - `tuzi`: 使用兔子AI服务 (推荐，速度快)
     - `replicate`: 使用Replicate AI服务
   - `MODEL`: AI模型选择，可选值：
     - `flux-kontext-pro`: 专业版模型，性能均衡
     - `flux-kontext-max`: 最大版模型，效果更好但速度稍慢
   
   #### AI服务密钥 (根据PROVIDER选择)
   - **使用兔子AI时需要**:
     - `TUZI_API_KEY`: 兔子AI的API密钥
   - **使用Replicate时需要**:
     - `REPLICATE_API_TOKEN`: Replicate的API令牌
   
   #### 可选配置
   - `ZPAY_PID`: 支付商户ID (如需集成支付功能)
   - `ZPAY_KEY`: 支付密钥
   - `NEXT_PUBLIC_SITE_URL`: 网站域名 (生产环境需要)
   - `NODE_ENV`: 环境模式 (development/production)

   ### AI服务对比
   
   | 特性 | 兔子AI (tu-zi.com) | Replicate |
   |------|------------------|-----------|
   | 速度 | 🚀 快速 (同步返回) | ⏳ 较慢 (异步轮询) |
   | 稳定性 | ⭐⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐ 中 |
   | 成本 | 💰 较低 | 💰💰 较高 |
   | 推荐场景 | 生产环境 | 开发测试 |

4. **数据库设置**
   
   在 Supabase 项目中执行 `sqls/` 目录下的SQL脚本初始化数据库

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

   应用将运行在 [http://localhost:3000](http://localhost:3000)

## AI服务切换

### 快速切换AI服务提供商

只需修改 `.env.local` 文件中的 `PROVIDER` 变量：

```bash
# 使用兔子AI (推荐)
PROVIDER=tuzi
MODEL=flux-kontext-pro

# 或使用Replicate
PROVIDER=replicate  
MODEL=flux-kontext-max
```

### 切换AI模型

在相同服务提供商下切换不同模型：

```bash
# 使用专业版模型 (速度更快)
MODEL=flux-kontext-pro

# 使用最大版模型 (效果更好)
MODEL=flux-kontext-max
```

**注意**: 修改环境变量后需要重启开发服务器

## 部署

### Vercel 部署（推荐）

1. Fork 此项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量 (参考上述环境配置章节)
   - 在 Vercel 项目设置中添加所有必需的环境变量
   - 确保 `NEXT_PUBLIC_SITE_URL` 设置为您的生产域名
4. 部署完成

### 生产环境配置注意事项

- 确保所有 API 密钥都是有效的生产环境密钥
- 建议在生产环境使用兔子AI (`PROVIDER=tuzi`) 以获得更好的性能
- 设置正确的 `NEXT_PUBLIC_SITE_URL` 
- 配置 Supabase 的生产环境数据库
- 如需支付功能，配置相应的支付服务商密钥

### 其他平台

项目支持部署到任何支持 Next.js 的平台，如 Netlify、Railway 等。

## 项目结构

```
xiaomao-ai-image-editor/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── protected/         # 需要登录的页面
│   ├── api/               # API 路由
│   └── page.tsx           # 首页
├── components/            # 可复用组件
│   ├── ui/               # UI 基础组件
│   └── navbar.tsx        # 导航栏
├── lib/                   # 工具库
│   ├── supabase/         # Supabase 配置
│   └── utils.ts          # 工具函数
├── sqls/                  # 数据库脚本
└── public/               # 静态资源
```

## 贡献

欢迎提交 Pull Request 或创建 Issue 来帮助改进项目。

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系我们

- 项目主页: [小猫AI图片编辑](https://your-domain.com)
- 问题反馈: [GitHub Issues](https://github.com/your-username/xiaomao-ai-image-editor/issues)

---

<p align="center">
  Made with ❤️ by 小猫AI图片编辑团队
</p>
