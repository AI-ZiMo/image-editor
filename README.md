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
- **AI服务**: Replicate AI 模型
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
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   REPLICATE_API_TOKEN=your_replicate_api_token
   ```

4. **数据库设置**
   
   在 Supabase 项目中执行 `sqls/` 目录下的SQL脚本初始化数据库

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

   应用将运行在 [http://localhost:3000](http://localhost:3000)

## 部署

### Vercel 部署（推荐）

1. Fork 此项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 部署完成

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
