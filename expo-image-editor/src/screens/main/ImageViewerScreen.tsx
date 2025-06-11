import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRoute, RouteProp } from '@react-navigation/native'

import { Colors } from '../../constants/Colors'
import { RootStackParamList } from '../../types'
import { saveImageToLibrary } from '../../utils/imageUtils'

type ImageViewerScreenRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>

const { width, height } = Dimensions.get('window')

export const ImageViewerScreen: React.FC = () => {
  const route = useRoute<ImageViewerScreenRouteProp>()
  const { imageUrl, imageId } = route.params

  const handleSaveImage = async () => {
    try {
      await saveImageToLibrary(imageUrl)
      Alert.alert('成功', '图片已保存到相册')
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '保存失败')
    }
  }

  const handleShareImage = () => {
    Alert.alert('分享', '分享功能开发中...')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSaveImage}>
          <Ionicons name="download-outline" size={24} color="white" />
          <Text style={styles.actionText}>保存</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShareImage}>
          <Ionicons name="share-outline" size={24} color="white" />
          <Text style={styles.actionText}>分享</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
})