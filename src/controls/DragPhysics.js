const FRAME_MS = 16

export class DragPhysics {
  constructor(element) {
    this.element = element
    this.isDragging = false
    this.velocity = 0
    this.lastX = 0
    this.lastTime = 0
    this.listeners = { drag: [], release: [] }

    this.onPointerDown = (e) => {
      this.isDragging = true
      this.lastX = e.clientX
      this.lastTime = performance.now()
      this.velocity = 0
    }

    this.onPointerMove = (e) => {
      if (!this.isDragging) return
      const dx = e.clientX - this.lastX
      const dt = Math.max(performance.now() - this.lastTime, 1)
      this.velocity = dx / dt * FRAME_MS
      this.lastX = e.clientX
      this.lastTime = performance.now()
      this.emit('drag', { delta: dx, velocity: this.velocity })
    }

    this.onPointerUp = () => {
      this.isDragging = false
      this.emit('release', { velocity: this.velocity })
    }

    element.addEventListener('pointerdown', this.onPointerDown)
    element.addEventListener('pointermove', this.onPointerMove)
    element.addEventListener('pointerup', this.onPointerUp)
    element.addEventListener('pointerleave', this.onPointerUp)
  }

  on(event, fn) {
    if (!this.listeners[event]) return
    this.listeners[event].push(fn)
  }
  emit(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(fn => fn(data))
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.onPointerDown)
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerup', this.onPointerUp)
    this.element.removeEventListener('pointerleave', this.onPointerUp)
    this.listeners = { drag: [], release: [] }
  }
}
