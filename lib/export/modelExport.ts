/**
 * 3D 모델 내보내기 유틸리티
 * Three.js 씬을 glTF, OBJ 등으로 내보내기
 */

import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js'
import { STLExporter } from 'three/addons/exporters/STLExporter.js'
import type { MasterJSON } from '@/types'
import { buildSceneFromMasterJSON } from '@/lib/three/sceneBuilder'

/**
 * Master JSON을 glTF 형식으로 내보내기
 */
export async function exportAsGLTF(
  masterJSON: MasterJSON,
  options?: {
    binary?: boolean
    includeCustomExtensions?: boolean
  }
): Promise<void> {
  const exporter = new GLTFExporter()
  const group = buildSceneFromMasterJSON(masterJSON, {
    showSpaces: true,
    showFloor: true,
  })

  return new Promise((resolve, reject) => {
    exporter.parse(
      group,
      (result) => {
        let blob: Blob

        if (options?.binary) {
          // GLB (binary) 형식
          blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' })
          downloadFile(blob, `model_${Date.now()}.glb`)
        } else {
          // glTF (JSON) 형식
          const json = JSON.stringify(result, null, 2)
          blob = new Blob([json], { type: 'model/gltf+json' })
          downloadFile(blob, `model_${Date.now()}.gltf`)
        }

        resolve()
      },
      (error) => {
        console.error('Error exporting glTF:', error)
        reject(error)
      },
      {
        binary: options?.binary || false,
        includeCustomExtensions: options?.includeCustomExtensions || false,
      }
    )
  })
}

/**
 * Master JSON을 OBJ 형식으로 내보내기
 */
export function exportAsOBJ(masterJSON: MasterJSON): void {
  const exporter = new OBJExporter()
  const group = buildSceneFromMasterJSON(masterJSON, {
    showSpaces: true,
    showFloor: true,
  })

  const result = exporter.parse(group)
  const blob = new Blob([result], { type: 'text/plain' })
  downloadFile(blob, `model_${Date.now()}.obj`)
}

/**
 * Master JSON을 STL 형식으로 내보내기
 */
export function exportAsSTL(
  masterJSON: MasterJSON,
  binary: boolean = true
): void {
  const exporter = new STLExporter()
  const group = buildSceneFromMasterJSON(masterJSON, {
    showSpaces: false, // STL은 주로 3D 프린팅용이므로 공간 제외
    showFloor: true,
  })

  const result = exporter.parse(group, { binary })

  let blob: Blob
  if (binary) {
    blob = new Blob([result as unknown as ArrayBuffer], { type: 'application/octet-stream' })
  } else {
    blob = new Blob([result as unknown as string], { type: 'text/plain' })
  }

  downloadFile(blob, `model_${Date.now()}.stl`)
}

/**
 * Three.js 씬을 이미지로 캡처
 */
export function captureSceneAsImage(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options?: {
    width?: number
    height?: number
    format?: 'png' | 'jpeg' | 'webp'
    quality?: number
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 원본 크기 저장
      const originalSize = new THREE.Vector2()
      renderer.getSize(originalSize)

      // 캡처 크기 설정
      if (options?.width && options?.height) {
        renderer.setSize(options.width, options.height)
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = options.width / options.height
          camera.updateProjectionMatrix()
        }
      }

      // 렌더링
      renderer.render(scene, camera)

      // 캔버스를 Blob으로 변환
      renderer.domElement.toBlob(
        (blob) => {
          if (blob) {
            // 원본 크기 복원
            renderer.setSize(originalSize.x, originalSize.y)
            if (camera instanceof THREE.PerspectiveCamera) {
              camera.aspect = originalSize.x / originalSize.y
              camera.updateProjectionMatrix()
            }

            resolve(blob)
          } else {
            reject(new Error('Failed to capture scene'))
          }
        },
        `image/${options?.format || 'png'}`,
        options?.quality || 0.95
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 캡처한 이미지를 다운로드
 */
export async function downloadSceneCapture(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  filename: string = 'capture',
  options?: {
    width?: number
    height?: number
    format?: 'png' | 'jpeg' | 'webp'
    quality?: number
  }
): Promise<void> {
  try {
    const blob = await captureSceneAsImage(renderer, scene, camera, options)
    const extension = options?.format || 'png'
    downloadFile(blob, `${filename}_${Date.now()}.${extension}`)
  } catch (error) {
    console.error('Error capturing scene:', error)
    throw error
  }
}

/**
 * Master JSON을 간단한 Collada (DAE) XML 형식으로 내보내기
 */
export function exportAsColladaSimple(masterJSON: MasterJSON): void {
  let dae = '<?xml version="1.0" encoding="UTF-8"?>\n'
  dae += '<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">\n'

  // Asset
  dae += '  <asset>\n'
  dae += '    <contributor>\n'
  dae += '      <authoring_tool>2D to 3D BIM Converter</authoring_tool>\n'
  dae += '    </contributor>\n'
  dae += `    <created>${new Date().toISOString()}</created>\n`
  dae += '    <unit meter="1" name="meter"/>\n'
  dae += '    <up_axis>Y_UP</up_axis>\n'
  dae += '  </asset>\n'

  // Library Geometries (simplified)
  dae += '  <library_geometries>\n'

  if (masterJSON.components?.walls) {
    masterJSON.components.walls.forEach((wall, index) => {
      dae += `    <geometry id="wall_${index}" name="Wall_${wall.id}">\n`
      dae += '      <!-- Wall geometry data would go here -->\n'
      dae += '    </geometry>\n'
    })
  }

  dae += '  </library_geometries>\n'

  // Visual Scene
  dae += '  <library_visual_scenes>\n'
  dae += '    <visual_scene id="Scene" name="Scene">\n'

  if (masterJSON.components?.walls) {
    masterJSON.components.walls.forEach((wall, index) => {
      dae += `      <node id="Wall_${index}" name="Wall_${wall.id}">\n`
      dae += `        <translate>${wall.start.x} 0 ${wall.start.y}</translate>\n`
      dae += `        <instance_geometry url="#wall_${index}"/>\n`
      dae += '      </node>\n'
    })
  }

  dae += '    </visual_scene>\n'
  dae += '  </library_visual_scenes>\n'

  // Scene
  dae += '  <scene>\n'
  dae += '    <instance_visual_scene url="#Scene"/>\n'
  dae += '  </scene>\n'

  dae += '</COLLADA>'

  const blob = new Blob([dae], { type: 'application/xml' })
  downloadFile(blob, `model_${Date.now()}.dae`)
}

/**
 * 파일 다운로드 헬퍼
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}