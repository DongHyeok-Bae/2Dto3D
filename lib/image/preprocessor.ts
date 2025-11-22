/**
 * 클라이언트 측 이미지 전처리 유틸리티
 *
 * Canvas API를 사용하여 브라우저에서 이미지 전처리 수행
 */

export interface PreprocessOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/png' | 'image/jpeg' | 'image/webp'
  grayscale?: boolean
  contrast?: number // 1.0 = 원본, >1.0 = 증가, <1.0 = 감소
  brightness?: number // 1.0 = 원본, >1.0 = 밝게, <1.0 = 어둡게
}

/**
 * 이미지 파일을 Base64로 변환
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 이미지 리사이징
 * 최대 너비/높이를 유지하면서 비율 유지
 */
export async function resizeImage(
  imageBase64: string,
  maxWidth: number = 2048,
  maxHeight: number = 2048
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height

      // 비율 유지하면서 리사이징
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageBase64
  })
}

/**
 * 이미지를 흑백(Grayscale)으로 변환
 */
export async function convertToGrayscale(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Grayscale 변환
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg // R
        data[i + 1] = avg // G
        data[i + 2] = avg // B
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageBase64
  })
}

/**
 * 이미지 대비(Contrast) 조정
 */
export async function adjustContrast(
  imageBase64: string,
  contrast: number = 1.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100))

      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128 // R
        data[i + 1] = factor * (data[i + 1] - 128) + 128 // G
        data[i + 2] = factor * (data[i + 2] - 128) + 128 // B
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageBase64
  })
}

/**
 * 이미지 밝기(Brightness) 조정
 */
export async function adjustBrightness(
  imageBase64: string,
  brightness: number = 1.2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.filter = `brightness(${brightness})`
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageBase64
  })
}

/**
 * 통합 전처리 함수
 * 여러 옵션을 한번에 적용
 */
export async function preprocessImage(
  imageBase64: string,
  options: PreprocessOptions = {}
): Promise<string> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    grayscale = false,
    contrast,
    brightness,
  } = options

  let result = imageBase64

  // 1. 리사이징
  result = await resizeImage(result, maxWidth, maxHeight)

  // 2. 흑백 변환
  if (grayscale) {
    result = await convertToGrayscale(result)
  }

  // 3. 대비 조정
  if (contrast !== undefined) {
    result = await adjustContrast(result, contrast)
  }

  // 4. 밝기 조정
  if (brightness !== undefined) {
    result = await adjustBrightness(result, brightness)
  }

  return result
}

/**
 * 이미지 메타데이터 추출
 */
export function getImageMetadata(imageBase64: string): Promise<{
  width: number
  height: number
  size: number // bytes
  format: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const matches = imageBase64.match(/^data:(.+);base64,(.+)$/)
      if (!matches) {
        reject(new Error('Invalid base64 format'))
        return
      }

      const mimeType = matches[1]
      const base64Data = matches[2]
      const size = Math.ceil((base64Data.length * 3) / 4)

      resolve({
        width: img.width,
        height: img.height,
        size,
        format: mimeType,
      })
    }
    img.onerror = reject
    img.src = imageBase64
  })
}

/**
 * 이미지 검증
 */
export async function validateImage(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // 파일 타입 검증
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 이미지 형식입니다. (PNG, JPEG, WebP만 지원)',
    }
  }

  // 파일 크기 검증 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '이미지 크기가 너무 큽니다. (최대 10MB)',
    }
  }

  try {
    const base64 = await fileToBase64(file)
    const metadata = await getImageMetadata(base64)

    // 최소 해상도 검증
    if (metadata.width < 100 || metadata.height < 100) {
      return {
        valid: false,
        error: '이미지 해상도가 너무 낮습니다. (최소 100x100)',
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: '이미지를 읽을 수 없습니다.',
    }
  }
}
