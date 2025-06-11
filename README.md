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
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
EXPO_PUBLIC_AI_PROVIDER=tuzi  # or "replicate"
EXPO_PUBLIC_AI_MODEL=flux-kontext-pro  # or "flux-kontext-max"

# AI Provider Keys (choose based on provider)
EXPO_PUBLIC_TUZI_API_KEY=your_tuzi_api_key  # if using tuzi provider
EXPO_PUBLIC_REPLICATE_API_TOKEN=your_replicate_token  # if using replicate provider
```

## Features

- 📱 Native mobile UI optimized for iOS and Android
- 📷 Camera and gallery integration
- 🎨 Direct AI-powered image editing (Tuzi AI & Replicate)
- ☁️ Direct Supabase storage and database operations
- 🔐 Supabase authentication with JWT tokens
- 💳 Automatic credit management and deduction
- 📊 Project-based image organization and history
- 🚀 Independent operation (no web API dependency)
- 📱 Complete offline-ready architecture

## Architecture

This mobile app operates completely independently from the web application:

- **Direct AI Integration**: Makes API calls directly to Tuzi AI or Replicate
- **Direct Storage**: Uploads images directly to Supabase storage
- **Direct Database**: Saves history and manages credits via Supabase client
- **No Web API**: Bypasses the web application's API entirely for better performance

## Branch Structure

- `main` - Web application only
- `mobile-app-only` - Mobile application only (this branch)

This separation ensures clean deployments and focused development.