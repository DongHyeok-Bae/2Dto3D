/**
 * Master JSON → Three.js 씬 변환
 *
 * BIM JSON 데이터를 3D 씬으로 변환하는 유틸리티
 */

import * as THREE from 'three'
import type { MasterJSON } from '@/types'

// 색상 팔레트
const COLORS = {
  wall: {
    exterior: 0x9a212d, // Crimson
    interior: 0x8b8680, // Warm Gray
    loadBearing: 0x1a2b50, // Navy
    partition: 0xc5a059, // Gold
  },
  door: 0x00a86b, // Emerald
  window: 0x0066cc, // Sapphire
  space: {
    bedroom: 0xffc1cc,
    living: 0xc5e1a5,
    kitchen: 0xffe082,
    bathroom: 0xb3e5fc,
    corridor: 0xe0e0e0,
    storage: 0xd7ccc8,
    balcony: 0xc8e6c9,
    other: 0xf5f5f5,
  },
  column: 0x2c2c2c, // Charcoal
  floor: 0xf9fafb, // Marble White
}

export interface SceneBuilderOptions {
  defaultHeight?: number // 기본 층고 (m)
  wallThickness?: number // 기본 벽 두께 (m)
  showSpaces?: boolean // 공간 표시 여부
  showFloor?: boolean // 바닥 표시 여부
  wireframe?: boolean // 와이어프레임 모드
}

/**
 * Master JSON으로부터 Three.js 씬 생성
 */
export function buildSceneFromMasterJSON(
  masterJSON: MasterJSON,
  options: SceneBuilderOptions = {}
): THREE.Group {
  const {
    defaultHeight = 2.7,
    wallThickness = 0.15,
    showSpaces = true,
    showFloor = true,
    wireframe = false,
  } = options

  const group = new THREE.Group()
  group.name = 'BIM Model'

  // 1. 바닥 추가
  if (showFloor) {
    const floor = createFloor(masterJSON)
    if (floor) group.add(floor)
  }

  // 2. 벽 추가
  const walls = createWalls(masterJSON, defaultHeight, wireframe)
  walls.forEach(wall => group.add(wall))

  // 3. 기둥 추가
  if (masterJSON.building.columns) {
    const columns = createColumns(masterJSON, defaultHeight, wireframe)
    columns.forEach(column => group.add(column))
  }

  // 4. 문 추가
  const doors = createDoors(masterJSON, defaultHeight, wireframe)
  doors.forEach(door => group.add(door))

  // 5. 창문 추가
  const windows = createWindows(masterJSON, defaultHeight, wireframe)
  windows.forEach(window => group.add(window))

  // 6. 공간 추가 (반투명 바닥)
  if (showSpaces) {
    const spaces = createSpaces(masterJSON, wireframe)
    spaces.forEach(space => group.add(space))
  }

  // 중심점으로 이동
  centerGroup(group)

  return group
}

/**
 * 바닥 생성
 */
function createFloor(masterJSON: MasterJSON): THREE.Mesh | null {
  const { totalArea } = masterJSON.dimensions

  // 대략적인 바닥 크기 계산
  const size = Math.sqrt(totalArea) * 1.5

  const geometry = new THREE.PlaneGeometry(size, size)
  const material = new THREE.MeshStandardMaterial({
    color: COLORS.floor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  })

  const floor = new THREE.Mesh(geometry, material)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0
  floor.receiveShadow = true
  floor.name = 'Floor'

  return floor
}

/**
 * 벽 생성
 */
function createWalls(
  masterJSON: MasterJSON,
  defaultHeight: number,
  wireframe: boolean
): THREE.Mesh[] {
  const walls: THREE.Mesh[] = []

  masterJSON.building.walls.forEach((wall: any) => {
    const { geometry, thickness, type } = wall
    const { start, end } = geometry

    // 벽 길이 및 방향 계산
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    // 벽 높이 (wall.height 또는 기본값)
    const height = wall.height || defaultHeight

    // BoxGeometry 생성
    const boxGeometry = new THREE.BoxGeometry(length, height, thickness)
    const color = COLORS.wall[type as keyof typeof COLORS.wall] || COLORS.wall.interior
    const material = new THREE.MeshStandardMaterial({
      color,
      wireframe,
    })

    const mesh = new THREE.Mesh(boxGeometry, material)

    // 위치 및 회전 설정
    mesh.position.set((start.x + end.x) / 2, height / 2, (start.y + end.y) / 2)
    mesh.rotation.y = angle

    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { type: 'wall', id: wall.id, data: wall }
    mesh.name = `Wall-${wall.id}`

    walls.push(mesh)
  })

  return walls
}

/**
 * 기둥 생성
 */
function createColumns(
  masterJSON: MasterJSON,
  defaultHeight: number,
  wireframe: boolean
): THREE.Mesh[] {
  const columns: THREE.Mesh[] = []

  masterJSON.building.columns?.forEach((column: any) => {
    const { position, shape, dimensions } = column
    const { width, depth } = dimensions

    let geometry: THREE.BufferGeometry

    if (shape === 'circular') {
      geometry = new THREE.CylinderGeometry(width / 2, width / 2, defaultHeight, 16)
    } else {
      // rectangular, H-beam, I-beam 등
      geometry = new THREE.BoxGeometry(width, defaultHeight, depth || width)
    }

    const material = new THREE.MeshStandardMaterial({
      color: COLORS.column,
      wireframe,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, defaultHeight / 2, position.y)

    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { type: 'column', id: column.id, data: column }
    mesh.name = `Column-${column.id}`

    columns.push(mesh)
  })

  return columns
}

/**
 * 문 생성
 */
function createDoors(
  masterJSON: MasterJSON,
  defaultHeight: number,
  wireframe: boolean
): THREE.Mesh[] {
  const doors: THREE.Mesh[] = []

  masterJSON.building.doors.forEach((door: any) => {
    const { position, width, height } = door

    const geometry = new THREE.BoxGeometry(width, height, 0.05)
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.door,
      wireframe,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, height / 2, position.y)

    mesh.castShadow = true
    mesh.userData = { type: 'door', id: door.id, data: door }
    mesh.name = `Door-${door.id}`

    doors.push(mesh)
  })

  return doors
}

/**
 * 창문 생성
 */
function createWindows(
  masterJSON: MasterJSON,
  defaultHeight: number,
  wireframe: boolean
): THREE.Mesh[] {
  const windows: THREE.Mesh[] = []

  masterJSON.building.windows.forEach((window: any) => {
    const { position, width, height, sillHeight } = window

    const geometry = new THREE.BoxGeometry(width, height, 0.03)
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.window,
      transparent: true,
      opacity: 0.6,
      wireframe,
    })

    const mesh = new THREE.Mesh(geometry, material)
    const yPos = (sillHeight || 1.0) + height / 2
    mesh.position.set(position.x, yPos, position.y)

    mesh.castShadow = true
    mesh.userData = { type: 'window', id: window.id, data: window }
    mesh.name = `Window-${window.id}`

    windows.push(mesh)
  })

  return windows
}

/**
 * 공간 생성 (바닥 폴리곤)
 */
function createSpaces(masterJSON: MasterJSON, wireframe: boolean): THREE.Mesh[] {
  const spaces: THREE.Mesh[] = []

  masterJSON.building.spaces.forEach((space: any) => {
    const { boundary, type } = space

    // Shape 생성
    const shape = new THREE.Shape()
    boundary.forEach((point: any, index: number) => {
      if (index === 0) {
        shape.moveTo(point.x, point.y)
      } else {
        shape.lineTo(point.x, point.y)
      }
    })
    shape.closePath()

    const geometry = new THREE.ShapeGeometry(shape)
    const color = COLORS.space[type as keyof typeof COLORS.space] || COLORS.space.other
    const material = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
      wireframe,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = 0.01 // 바닥보다 약간 위
    mesh.receiveShadow = true
    mesh.userData = { type: 'space', id: space.id, data: space }
    mesh.name = `Space-${space.id}`

    spaces.push(mesh)
  })

  return spaces
}

/**
 * 그룹을 중심으로 이동
 */
function centerGroup(group: THREE.Group) {
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  group.position.sub(center)
  group.position.y = 0 // Y축은 0으로 유지
}

/**
 * 조명 추가
 */
export function addLights(scene: THREE.Scene) {
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // Directional Light (태양광)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50
  directionalLight.shadow.camera.left = -20
  directionalLight.shadow.camera.right = 20
  directionalLight.shadow.camera.top = 20
  directionalLight.shadow.camera.bottom = -20
  scene.add(directionalLight)

  // Hemisphere Light (하늘/지면 조명)
  const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.3)
  scene.add(hemisphereLight)
}

/**
 * 그리드 헬퍼 추가
 */
export function addGridHelper(scene: THREE.Scene, size: number = 20) {
  const gridHelper = new THREE.GridHelper(size, size, 0x888888, 0xcccccc)
  gridHelper.name = 'GridHelper'
  scene.add(gridHelper)
}

/**
 * 축 헬퍼 추가
 */
export function addAxesHelper(scene: THREE.Scene, size: number = 5) {
  const axesHelper = new THREE.AxesHelper(size)
  axesHelper.name = 'AxesHelper'
  scene.add(axesHelper)
}
