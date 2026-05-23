import * as THREE from 'three'

export class Carousel {
  constructor(scene, camera, renderer, manager) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.manager = manager
    this.group = new THREE.Group()
    this.currentIndex = 0
    this.period = null
    this.isActive = false
    this._loadToken = 0
    this.onBack = null

    this.buildUI()
    scene.add(this.group)
  }

  buildUI() {
    this.leftArrow = document.createElement('button')
    this.leftArrow.className = 'carousel-arrow left'
    this.leftArrow.innerHTML = '&#8592;'
    this.leftArrow.addEventListener('click', () => this.prev())

    this.rightArrow = document.createElement('button')
    this.rightArrow.className = 'carousel-arrow right'
    this.rightArrow.innerHTML = '&#8594;'
    this.rightArrow.addEventListener('click', () => this.next())

    this.dots = document.createElement('div')
    this.dots.className = 'carousel-dots'

    this.backBtn = document.createElement('button')
    this.backBtn.className = 'carousel-back'
    this.backBtn.textContent = 'Back to gallery'
    this.backBtn.addEventListener('click', () => {
      if (this.onBack) this.onBack()
    })

    this.elements = [this.leftArrow, this.rightArrow, this.dots, this.backBtn]
  }

  show(period) {
    this.period = period
    this.currentIndex = 0
    this.isActive = true
    this.paintings = period.paintings

    this.elements.forEach(el => document.body.appendChild(el))

    if (this.paintings.length <= 1) {
      this.leftArrow.style.display = 'none'
      this.rightArrow.style.display = 'none'
    } else {
      this.leftArrow.style.display = 'block'
      this.rightArrow.style.display = 'block'
    }

    if (this.paintings.length === 0) return
    this.showPainting(0)
  }

  hide() {
    this.isActive = false
    this.elements.forEach(el => el.remove())
    if (this.paintingMesh) {
      this.group.remove(this.paintingMesh)
      this.paintingMesh = null
    }
  }

  showPainting(index) {
    if (this.paintingMesh) {
      this.group.remove(this.paintingMesh)
      this.paintingMesh = null
    }

    const token = ++this._loadToken
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, 1024, 768)
    ctx.fillStyle = '#cccccc'
    ctx.font = '32px Helvetica, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(this.paintings[index].title, 512, 384)

    const texture = new THREE.CanvasTexture(canvas)
    const mat = new THREE.MeshBasicMaterial({ map: texture })
    const geo = new THREE.PlaneGeometry(3.5, 2.6)
    this.paintingMesh = new THREE.Mesh(geo, mat)
    this.group.add(this.paintingMesh)

    const loader = new THREE.TextureLoader(this.manager)
    loader.load(this.paintings[index].src, (tex) => {
      if (this.paintingMesh && this.isActive && token === this._loadToken) {
        this.paintingMesh.material.map = tex
        this.paintingMesh.material.needsUpdate = true
      }
    }, undefined, () => {})

    this.updateDots()
  }

  next() {
    if (!this.isActive || this.paintings.length < 2) return
    this.currentIndex = (this.currentIndex + 1) % this.paintings.length
    this.showPainting(this.currentIndex)
  }

  prev() {
    if (!this.isActive || this.paintings.length < 2) return
    this.currentIndex = (this.currentIndex - 1 + this.paintings.length) % this.paintings.length
    this.showPainting(this.currentIndex)
  }

  updateDots() {
    this.dots.innerHTML = ''
    if (!this.paintings) return
    this.paintings.forEach((_, i) => {
      const dot = document.createElement('span')
      dot.className = 'dot' + (i === this.currentIndex ? ' active' : '')
      this.dots.appendChild(dot)
    })
  }
}
