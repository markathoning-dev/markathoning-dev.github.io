import * as THREE from 'three'
import { Frame } from './Frame.js'

export class Gallery {
  constructor(scene) {
    this.scene = scene
    this.group = new THREE.Group()
    this.frames = []

    this.buildRoom()
    this.buildLighting()
  }

  buildRoom() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 })
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.1
    })

    const W = 20, H = 6, D = 16

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -H / 2
    this.group.add(floor)

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), wallMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = H / 2
    this.group.add(ceil)

    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat)
    back.position.z = -D / 2
    this.group.add(back)

    const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat)
    left.rotation.y = Math.PI / 2
    left.position.x = -W / 2
    this.group.add(left)

    const right = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat)
    right.rotation.y = -Math.PI / 2
    right.position.x = W / 2
    this.group.add(right)

    this.scene.add(this.group)
  }

  buildLighting() {
    const ambient = new THREE.AmbientLight(0x404060, 0.6)
    this.scene.add(ambient)

    for (let i = -1; i <= 1; i++) {
      const spot = new THREE.SpotLight(0xffeedd, 8, 12, Math.PI / 6, 0.5, 1)
      spot.position.set(i * 4, 2, 4)
      spot.target.position.set(i * 4, 0.5, -8)
      this.scene.add(spot)
      this.scene.add(spot.target)
    }
  }

  getFramePosition(index) {
    const x = (index - 1) * 4
    return { x, y: 0.5, z: -7.5 }
  }

  mountFrames(periods) {
    periods.forEach((period, i) => {
      const pos = this.getFramePosition(i)
      const frame = new Frame(this.scene, period, pos, i)
      frame.onClick = () => this.onFrameClick(i)
      this.frames.push(frame)
    })
  }

  onFrameClick(index) {
    // Will be overridden by main.js
  }
}
