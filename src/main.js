import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'
import { AppState, VIEWS } from './state/AppState.js'
import { Door } from './scene/Door.js'
import { Gallery } from './scene/Gallery.js'
import { Carousel } from './scene/Carousel.js'
import { CameraFly } from './transitions/CameraFly.js'
import { periods } from './data/paintings.js'

const loadingScreen = document.getElementById('loading-screen')
const hint = document.getElementById('hint')

const manager = new THREE.LoadingManager()
manager.onLoad = () => {
  loadingScreen.classList.add('hidden')
  hint.classList.add('visible')
  state.setView(VIEWS.DOOR)
}

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0a0a)

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.shadowMap.enabled = true
document.getElementById('app').appendChild(renderer.domElement)

const state = new AppState()

const fly = new CameraFly(camera)

const door = new Door(scene, camera, renderer)
const gallery = new Gallery(scene)
gallery.mountFrames(periods)
const carousel = new Carousel(scene, camera, renderer, manager)

door.group.visible = false
gallery.group.visible = false
camera.position.set(0, 1, 6)
camera.lookAt(0, 0, 0)

door.onOpened = () => {
  state.setView(VIEWS.GALLERY)
  hint.classList.add('hidden')
  door.group.visible = false
  gallery.group.visible = true
  fly.fly(
    camera.position.clone(),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 8),
    new THREE.Vector3(0, 0, -8),
    1000
  )
}

gallery.onFrameClick = (index) => {
  if (state.view !== VIEWS.GALLERY) return
  state.selectFrame(index)
  const pos = gallery.getFramePosition(index)
  fly.fly(
    camera.position,
    new THREE.Vector3(0, 0, -8),
    new THREE.Vector3(pos.x, pos.y + 0.5, pos.z + 4),
    new THREE.Vector3(pos.x, pos.y + 0.5, pos.z),
    800,
    () => {
      state.setView(VIEWS.CAROUSEL)
      carousel.show(periods[index])
    }
  )
}

carousel.onBack = () => {
  fly.fly(
    camera.position,
    new THREE.Vector3(0, 0, -8),
    new THREE.Vector3(0, 1, 8),
    new THREE.Vector3(0, 0, -8),
    800,
    () => {
      carousel.hide()
      state.clearSelection()
      state.setView(VIEWS.GALLERY)
    }
  )
}

state.on('viewChanged', ({ to }) => {
  door.group.visible = to === VIEWS.DOOR
  gallery.group.visible = to === VIEWS.GALLERY
  carousel.group.visible = to === VIEWS.CAROUSEL
})

function animate() {
  requestAnimationFrame(animate)
  door.animate()
  renderer.render(scene, camera)
}
animate()

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
