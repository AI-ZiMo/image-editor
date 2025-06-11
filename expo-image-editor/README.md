# 小猫AI图片编辑 - Mobile App

React Native/Expo mobile application for AI-powered image editing.

## Features

- 📱 **Native Mobile Experience**: Optimized for iOS and Android
- 📸 **Camera Integration**: Take photos directly within the app
- 🖼️ **Gallery Access**: Select images from device gallery
- 🤖 **AI Image Editing**: Text-based image editing using AI
- 🎨 **Style Transfer**: Convert images to different artistic styles
- 📁 **Project Management**: Organize images by projects
- 💎 **Credit System**: In-app credit management
- 🔐 **Authentication**: Secure login with phone/email
- 📱 **Touch Gestures**: Pinch-to-zoom, swipe navigation
- 💾 **Offline Support**: Cache recently edited images
- 📤 **Native Sharing**: Share images to social media/messaging

## Prerequisites

- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual values
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_API_BASE_URL=your_api_base_url
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web version (for testing)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # App constants (colors, etc.)
├── navigation/         # Navigation configuration
├── screens/           # App screens
│   ├── auth/         # Authentication screens
│   └── main/         # Main app screens
├── services/         # API and external services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Key Screens

### Authentication
- **LoginScreen**: Phone/email login with OTP support
- **SignUpScreen**: User registration
- **AuthScreen**: Authentication flow coordinator

### Main App
- **HomeScreen**: Main dashboard with quick actions
- **ImageEditorScreen**: AI image editing interface
- **HistoryScreen**: View editing history
- **ProfileScreen**: User profile and settings
- **CreditsScreen**: Credit management and purchasing
- **ImageViewerScreen**: Full-screen image viewing

## API Integration

The mobile app consumes the same backend APIs as the web application:

- `/api/upload-image` - Upload images
- `/api/edit-image` - AI image editing
- `/api/user-credits` - Credit management
- `/api/user-history` - User history
- `/api/payment/*` - Payment processing

## Deployment

### Development Build
```bash
# Build for development
expo build:android --type apk
expo build:ios --type simulator
```

### Production Build
```bash
# Build for app stores
expo build:android --type app-bundle
expo build:ios --type archive
```

### Over-the-Air Updates
```bash
# Publish updates
expo publish
```

## Native Features

### Camera & Gallery
- Camera permission handling
- Image picker integration
- Image quality optimization
- Aspect ratio selection

### Storage & Permissions
- Save images to device gallery
- Secure storage for user data
- Permission management

### Performance Optimizations
- Image caching
- Lazy loading
- Memory management
- Background processing

## Configuration

### app.config.js
Main Expo configuration including:
- App metadata (name, version, icons)
- Platform-specific settings
- Plugin configurations
- Environment variables

### Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_API_BASE_URL`: Backend API base URL

## Development Notes

1. **Hot Reloading**: Changes automatically reload in development
2. **TypeScript**: Full TypeScript support with strict type checking
3. **Navigation**: React Navigation v6 for native navigation
4. **State Management**: React Context for simple state management
5. **UI Components**: Custom components following iOS/Android design guidelines

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS Simulator not opening**
   ```bash
   npx expo run:ios
   ```

3. **Android build errors**
   ```bash
   cd android && ./gradlew clean && cd ..
   npx expo run:android
   ```

### Environment Setup

Make sure you have the correct environment variables set in your `.env` file and that your backend API is running and accessible from your mobile device.

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Test on both iOS and Android
4. Follow React Native best practices
5. Update documentation for new features