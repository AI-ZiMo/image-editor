# 小猫AI图片编辑 - Mobile App

This branch contains only the mobile application built with Expo/React Native.

## Getting Started

```bash
# Install dependencies
cd expo-image-editor
npm install

# Start development server
npx expo start

# Run on specific platforms
npx expo start --ios
npx expo start --android
```

## Environment Setup

Create `.env` file in `expo-image-editor/` directory:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

- 📱 Native mobile UI optimized for iOS and Android
- 📷 Camera and gallery integration
- 🎨 AI-powered image editing
- 🔐 Supabase authentication
- 💳 Credit system integration
- 📊 Project-based image organization
- 📱 Offline-ready architecture

## Branch Structure

- `main` - Web application only
- `mobile-app-only` - Mobile application only (this branch)

This separation ensures clean deployments and focused development.