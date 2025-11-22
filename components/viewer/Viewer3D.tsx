'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { buildSceneFromMasterJSON, addLights, addGridHelper, addAxesHelper } from '@/lib/three/sceneBuilder'
import { downloadSceneCapture } from '@/lib/export/modelExport'
import type { MasterJSON } from '@/types'

interface Viewer3DProps {
  masterJSON: MasterJSON | null
  showSpaces?: boolean
  showFloor?: boolean
  showGrid?: boolean
  showAxes?: boolean
  wireframe?: boolean
  onExportClick?: () => void
}

export default function Viewer3D({
  masterJSON,
  showSpaces = true,
  showFloor = true,
  showGrid = true,
  showAxes = false,
  wireframe = false,
  onExportClick,
}: Viewer3DProps) {
  const [selectedObject, setSelectedObject] = useState<any | null>(null)
  const sceneRef = useRef<THREE.Group | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)
  const [camera, setCamera] = useState<THREE.Camera | null>(null)

  const handleScreenshot = useCallback(async () => {
    if (!renderer || !scene || !camera) return

    try {
      await downloadSceneCapture(renderer, scene, camera, 'bim_3d_view', {
        format: 'png',
        quality: 1.0,
      })
    } catch (error) {
      console.error('Screenshot failed:', error)
    }
  }, [renderer, scene, camera])

  if (!masterJSON) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-warmGray/5 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-warmGray/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-neutral-warmGray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-warmGray">
            Phase 7을 실행하여
            <br />
            Master JSON을 생성하세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        shadows
        className="rounded-lg"
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          setRenderer(gl)
          setScene(scene)
          setCamera(camera)
        }}
      >
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />

        {/* 씬 */}
        <Scene
          masterJSON={masterJSON}
          showSpaces={showSpaces}
          showFloor={showFloor}
          showGrid={showGrid}
          showAxes={showAxes}
          wireframe={wireframe}
          sceneRef={sceneRef}
          onObjectClick={setSelectedObject}
        />
      </Canvas>

      {/* 선택된 객체 정보 */}
      {selectedObject && (
        <div className="absolute bottom-4 left-4 right-4 card max-w-md">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-primary-navy">
              {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}
            </h4>
            <button
              onClick={() => setSelectedObject(null)}
              className="text-neutral-warmGray hover:text-primary-crimson"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-warmGray">ID</span>
              <span className="font-medium">{selectedObject.data.id}</span>
            </div>

            {selectedObject.type === 'wall' && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-warmGray">타입</span>
                  <span className="font-medium">{selectedObject.data.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-warmGray">두께</span>
                  <span className="font-medium">{selectedObject.data.thickness}m</span>
                </div>
              </>
            )}

            {selectedObject.type === 'space' && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-warmGray">이름</span>
                  <span className="font-medium">{selectedObject.data.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-warmGray">면적</span>
                  <span className="font-medium">{selectedObject.data.area.toFixed(2)} m²</span>
                </div>
              </>
            )}

            {(selectedObject.type === 'door' || selectedObject.type === 'window') && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-warmGray">크기</span>
                  <span className="font-medium">
                    {selectedObject.data.width}m × {selectedObject.data.height}m
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={handleScreenshot}
          className="btn-secondary text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          스크린샷
        </button>

        {onExportClick && (
          <button
            onClick={onExportClick}
            className="btn-primary text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            내보내기
          </button>
        )}
      </div>

      {/* 컨트롤 가이드 */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs text-neutral-warmGray">
        <div className="font-medium text-primary-navy mb-1">컨트롤</div>
        <div>• 회전: 좌클릭 드래그</div>
        <div>• 이동: 우클릭 드래그</div>
        <div>• 줌: 마우스 휠</div>
        <div>• 선택: 객체 클릭</div>
      </div>
    </div>
  )
}

function Scene({
  masterJSON,
  showSpaces,
  showFloor,
  showGrid,
  showAxes,
  wireframe,
  sceneRef,
  onObjectClick,
}: {
  masterJSON: MasterJSON
  showSpaces: boolean
  showFloor: boolean
  showGrid: boolean
  showAxes: boolean
  wireframe: boolean
  sceneRef: React.MutableRefObject<THREE.Group | null>
  onObjectClick: (object: any) => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      // 기존 씬 제거
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0])
      }

      // 새 씬 생성
      const scene = buildSceneFromMasterJSON(masterJSON, {
        showSpaces,
        showFloor,
        wireframe,
      })

      groupRef.current.add(scene)
      sceneRef.current = scene
    }
  }, [masterJSON, showSpaces, showFloor, wireframe])

  const handleClick = (event: any) => {
    if (event.object.userData.type) {
      onObjectClick(event.object.userData)
    }
  }

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight args={[0xb1e1ff, 0xb97a20, 0.3]} />

      {/* 그리드 */}
      {showGrid && <gridHelper args={[20, 20, 0x888888, 0xcccccc]} />}

      {/* 축 */}
      {showAxes && <axesHelper args={[5]} />}

      {/* 모델 */}
      <group ref={groupRef} onClick={handleClick} />
    </>
  )
}
