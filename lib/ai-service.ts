// AI服务集成模块，支持Replicate和兔子AI
import http from 'http'
import https from 'https'

export interface AIServiceResponse {
  success: boolean
  predictionId?: string
  status?: string
  output?: string[]
  error?: string
  data?: any
}

export interface AIEditRequest {
  inputImage: string
  prompt: string
  aspectRatio?: string
  model?: string
}

class AIService {
  private provider: string
  private model: string

  constructor() {
    this.provider = process.env.PROVIDER || 'replicate'
    this.model = process.env.MODEL || 'flux-kontext-max'
  }

  async editImage(request: AIEditRequest): Promise<AIServiceResponse> {
    if (this.provider === 'tuzi') {
      return this.editImageWithTuzi(request)
    } else {
      return this.editImageWithReplicate(request)
    }
  }

  async checkPredictionStatus(predictionId: string): Promise<AIServiceResponse> {
    if (this.provider === 'tuzi') {
      // 兔子AI是同步返回结果，不需要轮询
      return {
        success: true,
        status: 'succeeded',
        output: [predictionId] // predictionId实际上是图片URL
      }
    } else {
      return this.checkReplicateStatus(predictionId)
    }
  }

  private async editImageWithTuzi(request: AIEditRequest): Promise<AIServiceResponse> {
    try {
      const { inputImage, prompt, aspectRatio = "1:1" } = request

      // 构建兔子AI的请求参数
      const payloadData = {
        model: this.model, // 使用环境变量中的模型
        prompt: `${inputImage} ${prompt}`,
        aspect_ratio: aspectRatio,
        output_format: "png",
        safety_tolerance: 2,
        prompt_upsampling: false
      }

      const payload = JSON.stringify(payloadData)
      const payloadBuffer = Buffer.from(payload, 'utf8')

      const options = {
        hostname: 'api.tu-zi.com',
        port: 443,
        path: '/v1/images/generations',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TUZI_API_KEY}`,
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': payloadBuffer.length
        }
      }

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = ''

          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            try {
              const response = JSON.parse(data)
              
              if (res.statusCode === 200 && response.data && response.data.length > 0) {
                // 兔子AI同步返回结果
                resolve({
                  success: true,
                  predictionId: response.data[0].url, // 直接返回图片URL作为predictionId
                  status: 'succeeded',
                  output: [response.data[0].url]
                })
              } else {
                resolve({
                  success: false,
                  error: response.error || 'Unknown error from Tuzi AI'
                })
              }
            } catch (parseError) {
              resolve({
                success: false,
                error: 'Failed to parse Tuzi AI response'
              })
            }
          })
        })

        req.on('error', (error) => {
          resolve({
            success: false,
            error: `Tuzi AI request failed: ${error.message}`
          })
        })

        req.write(payloadBuffer)
        req.end()
      })

    } catch (error) {
      return {
        success: false,
        error: `Tuzi AI error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async editImageWithReplicate(request: AIEditRequest): Promise<AIServiceResponse> {
    try {
      const { inputImage, prompt, aspectRatio = "match_input_image" } = request

      // 根据模型选择对应的Replicate模型路径
      const modelPath = this.model === 'flux-kontext-pro' 
        ? 'black-forest-labs/flux-kontext-pro/predictions'
        : 'black-forest-labs/flux-kontext-max/predictions'

      const predictionResponse = await fetch(`https://api.replicate.com/v1/models/${modelPath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            aspect_ratio: aspectRatio,
            input_image: inputImage,
            output_format: "png",
            prompt: prompt,
            safety_tolerance: 2
          }
        }),
      })

      if (!predictionResponse.ok) {
        const error = await predictionResponse.text()
        return {
          success: false,
          error: `Replicate prediction error: ${error}`
        }
      }

      const prediction = await predictionResponse.json()
      
      return {
        success: true,
        predictionId: prediction.id,
        status: prediction.status
      }

    } catch (error) {
      return {
        success: false,
        error: `Replicate error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async checkReplicateStatus(predictionId: string): Promise<AIServiceResponse> {
    try {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (!statusResponse.ok) {
        const error = await statusResponse.text()
        return {
          success: false,
          error: `Failed to check Replicate status: ${error}`
        }
      }

      const prediction = await statusResponse.json()
      
      return {
        success: true,
        status: prediction.status,
        output: prediction.output,
        error: prediction.error
      }

    } catch (error) {
      return {
        success: false,
        error: `Replicate status check error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

export const aiService = new AIService() 