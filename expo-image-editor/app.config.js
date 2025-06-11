export default {
  expo: {
    name: "小猫AI图片编辑",
    slug: "xiaomao-ai-image-editor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#9333ea"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.xiaomao.ai.imageeditor"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#9333ea"
      },
      edgeToEdgeEnabled: true,
      package: "com.xiaomao.ai.imageeditor",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you edit images with AI.",
          cameraPermission: "The app accesses your camera to let you take photos for AI editing."
        }
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
          isAccessMediaLocationEnabled: true
        }
      ]
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY",
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000"
    }
  }
}