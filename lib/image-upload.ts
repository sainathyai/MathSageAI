/**
 * Image upload utilities for S3 storage
 */

export interface UploadImageResponse {
  success: boolean
  url: string
  key: string
  fileName: string
}

/**
 * Upload an image file to S3
 */
export async function uploadImageToS3(
  file: File,
  sessionId: string,
  userId?: string
): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sessionId', sessionId)
    if (userId) {
      formData.append('userId', userId)
    }

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload image')
    }

    const data: UploadImageResponse = await response.json()
    return data.url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Convert File to base64 for OpenAI Vision API
 * (Still needed for parsing, but we also save to S3 for persistence)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64String = reader.result as string
      // Remove data URL prefix (data:image/png;base64,)
      const base64Data = base64String.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = error => reject(error)
  })
}

