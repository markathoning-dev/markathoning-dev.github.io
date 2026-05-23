import * as THREE from 'three'

export class Frame {
  constructor(scene, period, position, index) {
    this.scene = scene
    this.period = period
    this.position = position
    this.index = index
    this.group = new THREE.Group()
    this.isClickable = period.paintings.length > 0
    this.onClick = null

    this.build()
    this.buildLabel()
    scene.add(this.group)
  }

  build() {
    const frameW = 2.8, frameH = 2, frameD = 0.08
    const matW = 0.06
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.2 })

    const top = new THREE.Mesh(new THREE.BoxGeometry(frameW, matW, frameD), borderMat)
    top.position.y = frameH / 2
    this.group.add(top)

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(frameW, matW, frameD), borderMat)
    bottom.position.y = -frameH / 2
    this.group.add(bottom)

    const left = new THREE.Mesh(new THREE.BoxGeometry(matW, frameH, frameD), borderMat)
    left.position.x = -frameW / 2
    this.group.add(left)

    const right = new THREE.Mesh(new THREE.BoxGeometry(matW, frameH, frameD), borderMat)
    right.position.x = frameW / 2
    this.group.add(right)

    const matColor = 0x333333
    const matMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(frameW - matW * 4, frameH - matW * 4),
      new THREE.MeshBasicMaterial({ color: matColor })
    )
    matMesh.position.z = -0.01
    this.group.add(matMesh)

    if (this.isClickable) {
      const imgW = frameW - matW * 6
      const imgH = frameH - matW * 6
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512 * (imgH / imgW)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#222'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#888'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(this.period.label, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      const imgMat = new THREE.MeshBasicMaterial({ map: texture })
      this.paintingMesh = new THREE.Mesh(new THREE.PlaneGeometry(imgW, imgH), imgMat)
      this.paintingMesh.position.z = 0.01
      this.group.add(this.paintingMesh)
    }

    this.group.position.set(this.position.x, this.position.y, this.position.z)
  }

  buildLabel() {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 48
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 256, 48)
    ctx.fillStyle = '#aaaaaa'
    ctx.font = '20px Helvetica, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(this.period.label, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.2),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
    )
    label.position.y = -1.3
    this.group.add(label)
  }

  setThumbnail(imageUrl, manager) {
    if (!this.paintingMesh) return
    const loader = new THREE.TextureLoader(manager)
    loader.load(imageUrl, (texture) => {
      this.paintingMesh.material.map = texture
      this.paintingMesh.material.needsUpdate = true
    })
  }
}
