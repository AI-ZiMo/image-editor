export interface User {
  id: string
  email?: string
  phone?: string
  created_at: string
}

export interface ImageProject {
  id: string
  user_id: string
  original_image_url: string
  original_image_id: string
  created_at: string
  images: ImageHistory[]
}

export interface ImageHistory {
  id: string
  user_id: string
  image_url: string
  prompt?: string
  aspect_ratio?: string
  parent_image_id?: string
  project_id: string
  created_at: string
}

export interface UserCredits {
  user_id: string
  credits: number
  updated_at: string
}

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  ImageEditor: {
    imageUri?: string
    imageUrl?: string
    imageId?: string
  }
  ImageViewer: {
    imageUrl: string
    imageId: string
  }
  History: undefined
  Credits: undefined
  Profile: undefined
}

export type TabParamList = {
  Home: undefined
  History: undefined
  Profile: undefined
}