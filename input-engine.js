/**
 * InputEngine for HarmonyOS NEXT Simulator
 * Handles touch, mouse, keyboard, and multi-touch input mapping
 * for the phone/tablet simulator.
 *
 * @module InputEngine
 * @version 1.0.0
 * @date 2026-11-20
 */

class InputEngine {
  constructor(simulator) {
    this.simulator = simulator;
    this.touches = new Map();
    this.keys = new Set();
    this.listeners = [];
    this.scale = 1;
  }

  init(canvas) {
    this.canvas = canvas;
    this.bindEvents();
  }

  bindEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onPointerDown(e) {
    const point = this.normalize(e);
    this.touches.set(e.pointerId, point);
    this.emit('touchstart', { ...point, id: e.pointerId });
  }

  onPointerMove(e) {
    if (!this.touches.has(e.pointerId)) return;
    const point = this.normalize(e);
    this.touches.set(e.pointerId, point);
    this.emit('touchmove', { ...point, id: e.pointerId });
  }

  onPointerUp(e) {
    const point = this.touches.get(e.pointerId);
    this.touches.delete(e.pointerId);
    this.emit('touchend', { ...point, id: e.pointerId });
  }

  onKeyDown(e) {
    this.keys.add(e.key);
    this.emit('keydown', { key: e.key, code: e.code });
  }

  onKeyUp(e) {
    this.keys.delete(e.key);
    this.emit('keyup', { key: e.key, code: e.code });
  }

  normalize(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.scale,
      y: (e.clientY - rect.top) / this.scale,
      pressure: e.pressure || 1,
    };
  }

  emit(type, data) {
    this.listeners.forEach(l => {
      if (l.type === type || l.type === '*') l.handler(data);
    });
  }

  on(type, handler) {
    this.listeners.push({ type, handler });
  }

  isKeyDown(key) {
    return this.keys.has(key);
  }

  getActiveTouches() {
    return Array.from(this.touches.values());
  }

  setScale(scale) {
    this.scale = scale;
  }

  destroy() {
    // Remove listeners in real impl
    this.listeners = [];
    this.touches.clear();
    this.keys.clear();
  }
}

export default InputEngine;
if (typeof module !== 'undefined') module.exports = InputEngine;
