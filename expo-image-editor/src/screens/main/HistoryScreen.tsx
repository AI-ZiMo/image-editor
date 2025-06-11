import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Colors } from '../../constants/Colors'
import { RootStackParamList, ImageProject } from '../../types'
import { aiService } from '../../services/aiService'

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>

const { width } = Dimensions.get('window')
const imageWidth = (width - 60) / 2

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>()
  const [projects, setProjects] = useState<ImageProject[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      loadHistory()
    }, [])
  )

  const loadHistory = async () => {
    try {
      const historyData = await aiService.getUserHistory()
      setProjects(historyData)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadHistory()
  }

  const renderProjectItem = ({ item }: { item: ImageProject }) => {
    const latestImage = item.images[item.images.length - 1] || {
      image_url: item.original_image_url,
      created_at: item.created_at,
      prompt: null,
    }

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => {
          navigation.navigate('ImageEditor', {
            imageUrl: latestImage.image_url,
            imageId: latestImage.id,
          })
        }}
      >
        <Image
          source={{ uri: latestImage.image_url }}
          style={styles.projectImage}
          resizeMode="cover"
        />
        
        <View style={styles.projectInfo}>
          <Text style={styles.projectDate}>
            {new Date(latestImage.created_at).toLocaleDateString('zh-CN')}
          </Text>
          
          {latestImage.prompt && (
            <Text style={styles.projectPrompt} numberOfLines={2}>
              {latestImage.prompt}
            </Text>
          )}
          
          <View style={styles.projectStats}>
            <View style={styles.statItem}>
              <Ionicons name="images-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{item.images.length} 张</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            navigation.navigate('ImageViewer', {
              imageUrl: latestImage.image_url,
              imageId: latestImage.id,
            })
          }}
        >
          <Ionicons name="eye-outline" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>暂无编辑历史</Text>
      <Text style={styles.emptySubtitle}>开始编辑您的第一张图片吧</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.startButtonText}>开始创作</Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>编辑历史</Text>
        <Text style={styles.subtitle}>查看您的所有创作作品</Text>
      </View>

      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  projectCard: {
    width: imageWidth,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectImage: {
    width: '100%',
    height: imageWidth * 1.2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  projectInfo: {
    padding: 12,
  },
  projectDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  projectPrompt: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  viewButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
})