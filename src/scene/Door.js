import * as THREE from 'three'
import { DragPhysics } from '../controls/DragPhysics.js'

export class Door {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.group = new THREE.Group()
    this.angle = 0
    this.targetAngle = 0
    this.isOpen = false
    this.onOpened = null

    this.buildDoors()
    this.setupDrag(renderer)
    this.setupSkipButton()

    scene.add(this.group)
  }

  buildDoors() {
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.7,
      metalness: 0.1
    })
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a0f0a, roughness: 0.9 })

    const doorW = 2, doorH = 4.5, doorD = 0.15

    this.leftPivot = new THREE.Group()
    this.leftPivot.position.set(-2, 0, 0)
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorD), doorMat)
    leftDoor.position.x = doorW / 2
    this.leftPivot.add(leftDoor)
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorH + 0.4, doorD + 0.2), frameMat)
    leftFrame.position.set(-0.05, 0, 0)
    this.leftPivot.add(leftFrame)
    this.group.add(this.leftPivot)

    this.rightPivot = new THREE.Group()
    this.rightPivot.position.set(2, 0, 0)
    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorD), doorMat)
    rightDoor.position.x = -doorW / 2
    this.rightPivot.add(rightDoor)
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorH + 0.4, doorD + 0.2), frameMat)
    rightFrame.position.set(0.05, 0, 0)
    this.rightPivot.add(rightFrame)
    this.group.add(this.rightPivot)

    const archMat = new THREE.MeshStandardMaterial({ color: 0x1a0f0a })
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.15, doorD + 0.2), archMat)
    top.position.set(0, doorH / 2 + 0.2, 0)
    this.group.add(top)
  }

  setupDrag(renderer) {
    this.drag = new DragPhysics(renderer.domElement)
    this.drag.on('drag', ({ delta }) => {
      if (this.isOpen) return
      this.angle = Math.max(0, Math.min(Math.PI * 0.7, this.angle - delta * 0.005))
      this.updateDoors()
    })
    this.drag.on('release', ({ velocity }) => {
      if (this.isOpen) return
      const absVel = Math.abs(velocity)
      if (absVel > 0.5 && this.angle > 0.5) {
        this.isOpen = true
        this.targetAngle = Math.PI * 0.7
        if (this.onOpened) this.onOpened()
      } else {
        this.targetAngle = 0
      }
    })
  }

  updateDoors() {
    this.leftPivot.rotation.y = -this.angle
    this.rightPivot.rotation.y = this.angle
  }

  setupSkipButton() {
    const btn = document.createElement('button')
    btn.textContent = 'Skip the door'
    btn.className = 'skip-door-btn'
    document.body.appendChild(btn)
    btn.addEventListener('click', () => {
      if (this.isOpen) return
      this.isOpen = true
      this.angle = Math.PI * 0.7
      this.updateDoors()
      if (this.onOpened) this.onOpened()
    })
  }

  animate() {
    if (this.angle !== this.targetAngle) {
      const diff = this.targetAngle - this.angle
      this.angle += diff * 0.08
      if (Math.abs(diff) < 0.001) this.angle = this.targetAngle
      this.updateDoors()
    }
  }

  destroy() {
    this.drag.destroy()
    const btn = document.querySelector('.skip-door-btn')
    if (btn) btn.remove()
    this.scene.remove(this.group)
  }
}
