import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'

export const requestImagePermissions = async () => {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
  const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  
  return {
    camera: cameraPermission.status === 'granted',
    mediaLibrary: mediaLibraryPermission.status === 'granted',
  }
}

export const pickImageFromLibrary = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  
  if (permission.status !== 'granted') {
    throw new Error('Permission to access media library is required!')
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [9, 16],
    quality: 0.8,
  })

  if (!result.canceled) {
    return result.assets[0]
  }
  
  return null
}

export const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  
  if (permission.status !== 'granted') {
    throw new Error('Permission to access camera is required!')
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [9, 16],
    quality: 0.8,
  })

  if (!result.canceled) {
    return result.assets[0]
  }
  
  return null
}

export const saveImageToLibrary = async (uri: string) => {
  const permission = await MediaLibrary.requestPermissionsAsync()
  
  if (permission.status !== 'granted') {
    throw new Error('Permission to save images is required!')
  }

  await MediaLibrary.saveToLibraryAsync(uri)
}