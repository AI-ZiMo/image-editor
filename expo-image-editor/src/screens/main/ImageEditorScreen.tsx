import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Colors } from '../../constants/Colors'
import { RootStackParamList } from '../../types'
import { aiService } from '../../services/aiService'
import { saveImageToLibrary } from '../../utils/imageUtils'

type ImageEditorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageEditor'>
type ImageEditorScreenRouteProp = RouteProp<RootStackParamList, 'ImageEditor'>

const { width } = Dimensions.get('window')

export const ImageEditorScreen: React.FC = () => {
  const navigation = useNavigation<ImageEditorScreenNavigationProp>()
  const route = useRoute<ImageEditorScreenRouteProp>()
  
  const [imageUri, setImageUri] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [aspectRatio, setAspectRatio] = useState<string>('9:16')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')

  useEffect(() => {
    if (route.params?.imageUri) {
      setImageUri(route.params.imageUri)
      uploadImage(route.params.imageUri)
    } else if (route.params?.imageUrl) {
      setUploadedImageUrl(route.params.imageUrl)
      setImageUri(route.params.imageUrl)
    }
  }, [route.params])

  const uploadImage = async (uri: string) => {
    try {
      setIsProcessing(true)
      const result = await aiService.uploadImage(uri)
      
      if (result.success && result.fileUrl) {
        setUploadedImageUrl(result.fileUrl)
      } else {
        Alert.alert('错误', result.error || '图片上传失败')
      }
    } catch (error) {
      Alert.alert('错误', '图片上传失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditImage = async () => {
    if (!uploadedImageUrl) {
      Alert.alert('错误', '请先上传图片')
      return
    }

    if (!prompt.trim()) {
      Alert.alert('错误', '请输入编辑指令')
      return
    }

    try {
      setIsProcessing(true)
      setProcessedImageUrl('')

      const result = await aiService.editImage({
        inputImage: uploadedImageUrl,
        prompt: prompt.trim(),
        aspectRatio,
        parentImageId: route.params?.imageId,
      })

      if (result.success && result.predictionId) {
        // Start polling for prediction status
        await pollPredictionStatus(result.predictionId)
      } else {
        Alert.alert('错误', result.error || '图片处理失败')
      }
    } catch (error) {
      Alert.alert('错误', '图片处理失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveImage = async () => {
    if (!processedImageUrl) {
      Alert.alert('错误', '没有可保存的图片')
      return
    }

    try {
      await saveImageToLibrary(processedImageUrl)
      Alert.alert('成功', '图片已保存到相册')
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '保存失败')
    }
  }

  const pollPredictionStatus = async (predictionId: string) => {
    const maxAttempts = 60 // 最多等待5分钟 (每5秒检查一次)
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const statusResult = await aiService.checkPredictionStatus(predictionId)
        
        if (statusResult.success) {
          if (statusResult.status === 'succeeded' && statusResult.output) {
            setProcessedImageUrl(statusResult.output)
            return
          } else if (statusResult.status === 'failed') {
            Alert.alert('错误', '图片处理失败')
            return
          }
          // If status is 'processing' or 'starting', continue polling
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)) // 等待5秒
        attempts++
      } catch (error) {
        console.error('Polling error:', error)
        Alert.alert('错误', '检查处理状态失败')
        return
      }
    }
    
    Alert.alert('超时', '图片处理时间过长，请稍后查看历史记录')
  }

  const aspectRatios = [
    { label: '9:16', value: '9:16' },
    { label: '1:1', value: '1:1' },
    { label: '16:9', value: '16:9' },
    { label: '4:3', value: '4:3' },
  ]

  const promptSuggestions = [
    '增加温暖的光线效果',
    '转换为油画风格',
    '去除背景',
    '增加花朵装饰',
    '变成黑白照片',
    '添加阳光',
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Display */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: processedImageUrl || imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.placeholderText}>未选择图片</Text>
            </View>
          )}
          
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.processingText}>AI处理中...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Aspect Ratio Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>输出比例</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.aspectRatioContainer}>
                {aspectRatios.map((ratio) => (
                  <TouchableOpacity
                    key={ratio.value}
                    style={[
                      styles.aspectRatioButton,
                      aspectRatio === ratio.value && styles.aspectRatioButtonActive,
                    ]}
                    onPress={() => setAspectRatio(ratio.value)}
                  >
                    <Text
                      style={[
                        styles.aspectRatioText,
                        aspectRatio === ratio.value && styles.aspectRatioTextActive,
                      ]}
                    >
                      {ratio.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Prompt Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>编辑指令</Text>
            <TextInput
              style={styles.promptInput}
              placeholder="描述您想要的编辑效果..."
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Prompt Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>快速指令</Text>
            <View style={styles.suggestionsContainer}>
              {promptSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => setPrompt(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleEditImage}
              disabled={isProcessing || !uploadedImageUrl}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.buttonText}>开始编辑</Text>
            </TouchableOpacity>

            {processedImageUrl && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSaveImage}
              >
                <Ionicons name="download-outline" size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>保存图片</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width - 40,
    height: (width - 40) * 16 / 9,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  imagePlaceholder: {
    width: width - 40,
    height: (width - 40) * 16 / 9,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: Colors.textSecondary,
    marginTop: 8,
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  aspectRatioContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  aspectRatioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aspectRatioButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  aspectRatioText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  aspectRatioTextActive: {
    color: 'white',
  },
  promptInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
})