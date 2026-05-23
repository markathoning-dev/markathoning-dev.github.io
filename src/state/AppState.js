export const VIEWS = { LOADING: 'LOADING', DOOR: 'DOOR', GALLERY: 'GALLERY', CAROUSEL: 'CAROUSEL' }

export class AppState {
  constructor() {
    this._view = VIEWS.LOADING
    this._selectedFrame = -1
    this.listeners = {}
  }

  get view() { return this._view }
  get selectedFrame() { return this._selectedFrame }

  setView(view) {
    if (this._view === view) return
    const prev = this._view
    this._view = view
    this.emit('viewChanged', { from: prev, to: view })
  }

  selectFrame(index) {
    if (this._selectedFrame === index || index < 0) return
    this._selectedFrame = index
    this.emit('frameSelected', { index })
  }

  clearSelection() {
    this._selectedFrame = -1
    this.emit('frameSelected', { index: -1 })
  }

  on(event, fn) {
    (this.listeners[event] = this.listeners[event] || []).push(fn)
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data))
  }
}
