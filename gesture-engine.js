/**
 * GestureEngine for HarmonyOS NEXT Simulator
 * Handles multi-touch, swipes, pinches, and long-presses
 */

class GestureEngine {
  constructor(element) {
    this.element = element;
    this.handlers = new Map();
    this.touches = new Map();
    this.gestures = {
      swipeThreshold: 50,
      pinchThreshold: 0.1,
      longPressDuration: 500,
      tapMaxDistance: 10
    };
    this.bindEvents();
  }

  bindEvents() {
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this));
    this.element.addEventListener('touchcancel', this.onTouchEnd.bind(this));
  }

  onTouchStart(e) {
    Array.from(e.changedTouches).forEach(touch => {
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        lastX: touch.clientX,
        lastY: touch.clientY
      });
    });
    if (this.touches.size === 1) {
      this.longPressTimer = setTimeout(() => {
        this.emit('longpress', this.getPrimaryTouch());
      }, this.gestures.longPressDuration);
    }
  }

  onTouchMove(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    Array.from(e.changedTouches).forEach(touch => {
      const tracked = this.touches.get(touch.identifier);
      if (tracked) {
        tracked.lastX = touch.clientX;
        tracked.lastY = touch.clientY;
        tracked.deltaX = touch.clientX - tracked.startX;
        tracked.deltaY = touch.clientY - tracked.startY;
      }
    });
    if (this.touches.size === 2) {
      this.handlePinch();
    }
  }

  onTouchEnd(e) {
    if (this.longPressTimer) clearTimeout(this.longPressTimer);
    Array.from(e.changedTouches).forEach(touch => {
      const tracked = this.touches.get(touch.identifier);
      if (tracked) {
        const duration = Date.now() - tracked.startTime;
        const distance = Math.hypot(tracked.deltaX || 0, tracked.deltaY || 0);
        if (distance < this.gestures.tapMaxDistance && duration < 300) {
          this.emit('tap', tracked);
        } else if (distance > this.gestures.swipeThreshold) {
          const direction = this.getSwipeDirection(tracked);
          this.emit('swipe', { ...tracked, direction });
        }
        this.touches.delete(touch.identifier);
      }
    });
    if (this.touches.size === 0) {
      this.emit('end');
    }
  }

  getSwipeDirection(touch) {
    const dx = touch.deltaX || 0;
    const dy = touch.deltaY || 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
  }

  handlePinch() {
    const touches = Array.from(this.touches.values());
    if (touches.length < 2) return;
    const [a, b] = touches;
    const currentDist = Math.hypot(a.lastX - b.lastX, a.lastY - b.lastY);
    const startDist = Math.hypot(a.startX - b.startX, a.startY - b.startY);
    const scale = currentDist / startDist;
    if (Math.abs(scale - 1) > this.gestures.pinchThreshold) {
      this.emit('pinch', { scale, center: this.getCenter(touches) });
    }
  }

  getCenter(touches) {
    const x = touches.reduce((sum, t) => sum + t.lastX, 0) / touches.length;
    const y = touches.reduce((sum, t) => sum + t.lastY, 0) / touches.length;
    return { x, y };
  }

  getPrimaryTouch() {
    return this.touches.values().next().value;
  }

  on(event, handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event).push(handler);
  }

  off(event, handler) {
    const list = this.handlers.get(event);
    if (list) {
      const idx = list.indexOf(handler);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  emit(event, data) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(h => h(data));
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);
    this.handlers.clear();
    this.touches.clear();
  }
}

export default GestureEngine;
