import * as THREE from 'three'

export class CameraFly {
  constructor(camera) {
    this.camera = camera
    this.isAnimating = false
    this.onComplete = null
  }

  fly(fromPos, fromTarget, toPos, toTarget, duration = 1000) {
    this.isAnimating = true
    const startTime = performance.now()
    const startPos = fromPos.clone()
    const startTarget = fromTarget.clone()
    const endPos = toPos.clone()
    const endTarget = toTarget.clone()

    const animate = () => {
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

      this.camera.position.lerpVectors(startPos, endPos, ease)
      const lookTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, ease)
      this.camera.lookAt(lookTarget)

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        this.isAnimating = false
        if (this.onComplete) this.onComplete()
      }
    }
    animate()
  }
}
