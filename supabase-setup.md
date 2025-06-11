# Expo + Supabase 完整后端解决方案

## 🗄️ Supabase 数据库表结构

### 用户积分表
```sql
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 图片历史表
```sql
CREATE TABLE image_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT,
  edited_image_url TEXT,
  edit_type TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 支付订单表
```sql
CREATE TABLE user_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT UNIQUE,
  amount DECIMAL(10,2),
  credits_purchased INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📱 Expo 客户端配置

### 安装依赖
```bash
npx expo install @supabase/supabase-js expo-secure-store
npx expo install expo-image-picker expo-file-system expo-image-manipulator
```

### Supabase 客户端初始化
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

// 使用 SecureStore 进行安全存储
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// 处理应用状态变化
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
```

## 🖼️ 图片上传服务

### Supabase Storage 配置
```typescript
// services/imageService.ts
import { supabase } from '../lib/supabase'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

export class ImageService {
  static async uploadImage(uri: string, userId: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      })
      
      const fileName = `${userId}/${Date.now()}.jpg`
      const contentType = 'image/jpeg'
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: false
        })
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (error) {
      throw new Error(`图片上传失败: ${error.message}`)
    }
  }

  static async editImage(imageUrl: string, editType: string): Promise<string> {
    // 这里调用AI图片编辑API (Replicate, OpenAI, 或自建)
    const response = await fetch('YOUR_IMAGE_EDIT_API', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image_url: imageUrl, 
        edit_type: editType 
      })
    })
    
    const result = await response.json()
    return result.edited_image_url
  }
}
```

## 💰 积分系统

### 积分管理服务
```typescript
// services/creditsService.ts
import { supabase } from '../lib/supabase'

export class CreditsService {
  static async getUserCredits(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data?.credits || 0
  }

  static async useCredits(userId: string, amount: number = 1): Promise<boolean> {
    const { data, error } = await supabase.rpc('use_credits', {
      user_id: userId,
      credits_to_use: amount
    })
    
    if (error) throw error
    return data
  }

  static async addCredits(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('add_credits', {
      user_id: userId,
      credits_to_add: amount
    })
    
    if (error) throw error
  }
}
```

### Supabase 函数 (SQL)
```sql
-- 使用积分函数
CREATE OR REPLACE FUNCTION use_credits(user_id UUID, credits_to_use INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_credits 
  SET credits = credits - credits_to_use,
      updated_at = NOW()
  WHERE user_id = $1 AND credits >= credits_to_use;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 添加积分函数
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, credits_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES ($1, credits_to_add)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    credits = user_credits.credits + credits_to_add,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

## 💳 支付集成 (微信支付/支付宝)

### Expo 支付组件
```typescript
// components/PaymentModal.tsx
import React from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabase'

interface PaymentModalProps {
  visible: boolean
  onClose: () => void
  userId: string
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, userId }) => {
  const purchaseCredits = async (creditPack: { credits: number, price: number }) => {
    try {
      // 创建订单
      const { data: order } = await supabase
        .from('user_orders')
        .insert({
          user_id: userId,
          amount: creditPack.price,
          credits_purchased: creditPack.credits,
          status: 'pending'
        })
        .select()
        .single()

      // 调用支付API (这里需要集成微信支付或支付宝)
      const paymentResult = await initiatePayment(order.id, creditPack.price)
      
      if (paymentResult.success) {
        // 支付成功，添加积分
        await CreditsService.addCredits(userId, creditPack.credits)
        
        // 更新订单状态
        await supabase
          .from('user_orders')
          .update({ status: 'completed' })
          .eq('id', order.id)
      }
    } catch (error) {
      console.error('支付失败:', error)
    }
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 30 }}>
          购买积分
        </Text>
        
        {[
          { credits: 100, price: 9.9 },
          { credits: 500, price: 39.9 },
          { credits: 1000, price: 69.9 }
        ].map((pack, index) => (
          <TouchableOpacity
            key={index}
            style={{ padding: 15, backgroundColor: '#007AFF', margin: 10, borderRadius: 8 }}
            onPress={() => purchaseCredits(pack)}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
              {pack.credits} 积分 - ¥{pack.price}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={{ padding: 15, backgroundColor: '#ccc', margin: 10, borderRadius: 8 }}
          onPress={onClose}
        >
          <Text style={{ textAlign: 'center' }}>关闭</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}
```

## 🔗 API 整合

### Edge Functions (替代 Next.js API)
```typescript
// supabase/functions/edit-image/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { imageUrl, editType, userId } = await req.json()
  
  // 检查积分
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const canUseCredits = await supabase.rpc('use_credits', {
    user_id: userId,
    credits_to_use: 1
  })
  
  if (!canUseCredits) {
    return new Response(JSON.stringify({ error: '积分不足' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // 调用AI图片编辑API
  const editedImageUrl = await callImageEditAPI(imageUrl, editType)
  
  // 保存历史记录
  await supabase.from('image_history').insert({
    user_id: userId,
    original_image_url: imageUrl,
    edited_image_url: editedImageUrl,
    edit_type: editType,
    credits_used: 1
  })
  
  return new Response(JSON.stringify({ 
    success: true, 
    edited_image_url: editedImageUrl 
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## 📈 成本优势

### Supabase 免费额度 (非常充足！)
- 🗄️ **数据库**: 500MB 存储，无限读写
- 📁 **文件存储**: 1GB 存储，2GB 传输
- 👥 **用户认证**: 50,000 月活用户
- ⚡ **Edge Functions**: 500,000 调用/月
- 🔄 **实时订阅**: 200 并发连接

### 成本对比
```
传统方案 (服务器 + 数据库):
- 云服务器: ¥200+/月
- 数据库: ¥100+/月
- 图片存储: ¥50+/月
- 总计: ¥350+/月

Supabase 方案:
- 免费额度: ¥0/月 (足够初期使用)
- Pro 版本: $25/月 (约¥180/月)
- 包含所有功能，无需运维
```

## 🚀 部署建议

1. **开发阶段**: 完全使用 Supabase 免费版
2. **测试阶段**: 升级到 Pro 版获得更高限额
3. **生产阶段**: 按需扩展，成本透明可控

这个方案的最大优势是：
- ✅ **零运维**: 无需管理服务器
- ✅ **自动扩展**: 根据使用量自动调整
- ✅ **成本可控**: 用多少付多少
- ✅ **开发快速**: 专注业务逻辑，不用搭建基础设施

你觉得这个方案怎么样？我们可以开始实施了！ 