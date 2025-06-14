/**
 * 图片处理工具函数
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.8,
    maxSizeKB = 10240 // 10MB
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // 计算新的尺寸
        let { width, height } = calculateNewDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        // 设置画布尺寸
        canvas.width = width
        canvas.height = height

        if (!ctx) {
          reject(new Error('无法获取Canvas上下文'))
          return
        }

        // 绘制图片到画布
        ctx.drawImage(img, 0, 0, width, height)

        // 压缩图片
        compressWithQuality(canvas, file, quality, maxSizeKB)
          .then(resolve)
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    // 读取图片
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 计算新的图片尺寸（保持宽高比）
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth
  let height = originalHeight

  // 按比例缩放
  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * 根据质量和文件大小要求压缩图片
 */
async function compressWithQuality(
  canvas: HTMLCanvasElement,
  originalFile: File,
  initialQuality: number,
  maxSizeKB: number
): Promise<File> {
  let quality = initialQuality
  let compressedFile: File

  // 逐步降低质量直到满足大小要求
  while (quality > 0.1) {
    compressedFile = await canvasToFile(canvas, originalFile.type, quality)
    
    // 检查文件大小
    if (compressedFile.size <= maxSizeKB * 1024) {
      return compressedFile
    }

    // 降低质量
    quality -= 0.1
  }

  // 如果还是太大，最后尝试转换为JPEG并使用最低质量
  compressedFile = await canvasToFile(canvas, 'image/jpeg', 0.1)
  return compressedFile
}

/**
 * 将Canvas转换为File对象
 */
function canvasToFile(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'compressed-image.jpg', {
            type: mimeType.includes('jpeg') || mimeType.includes('jpg') 
              ? 'image/jpeg' 
              : mimeType
          })
          resolve(file)
        }
      },
      mimeType.includes('jpeg') || mimeType.includes('jpg') 
        ? 'image/jpeg' 
        : mimeType,
      quality
    )
  })
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查文件类型是否为支持的图片格式
 */
export function isValidImageType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
  return validTypes.includes(file.type)
}