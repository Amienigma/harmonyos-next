/**
 * AnimationEngine - Advanced animation and transition system for HarmonyOS NEXT simulator
 * Supports keyframe animations, spring physics, gesture-driven transitions, and easing.
 * 
 * Daily code addition 2026-11-16
 */

class AnimationEngine {
  constructor() {
    this.animations = new Map();
    this.running = new Set();
    this.frameId = null;
    this.lastTime = 0;
  }

  createAnimation(id, config) {
    const anim = {
      id,
      target: config.target,
      property: config.property || 'transform',
      from: config.from || 0,
      to: config.to || 1,
      duration: config.duration || 300,
      easing: config.easing || 'easeInOut',
      delay: config.delay || 0,
      loop: config.loop || false,
      onUpdate: config.onUpdate,
      onComplete: config.onComplete,
      startTime: null,
      progress: 0
    };
    this.animations.set(id, anim);
    return anim;
  }

  play(id) {
    const anim = this.animations.get(id);
    if (!anim) return;
    anim.startTime = performance.now() + anim.delay;
    anim.progress = 0;
    this.running.add(id);
    this.startLoop();
  }

  stop(id) {
    this.running.delete(id);
    if (this.running.size === 0) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  startLoop() {
    if (this.frameId) return;
    const loop = (time) => {
      this.lastTime = time;
      this.update(time);
      if (this.running.size > 0) {
        this.frameId = requestAnimationFrame(loop);
      } else {
        this.frameId = null;
      }
    };
    this.frameId = requestAnimationFrame(loop);
  }

  update(time) {
    for (const id of this.running) {
      const anim = this.animations.get(id);
      if (!anim || time < anim.startTime) continue;
      const elapsed = time - anim.startTime;
      let progress = Math.min(elapsed / anim.duration, 1);
      progress = this.applyEasing(progress, anim.easing);
      anim.progress = progress;
      const value = anim.from + (anim.to - anim.from) * progress;
      if (anim.onUpdate) anim.onUpdate(value, progress);
      if (progress >= 1) {
        if (anim.loop) {
          anim.startTime = time;
          anim.progress = 0;
        } else {
          this.stop(id);
          if (anim.onComplete) anim.onComplete();
        }
      }
    }
  }

  applyEasing(t, type) {
    switch (type) {
      case 'linear': return t;
      case 'easeIn': return t * t;
      case 'easeOut': return t * (2 - t);
      case 'easeInOut': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'spring': return this.springEasing(t);
      default: return t;
    }
  }

  springEasing(t) {
    // Simplified spring
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  // Gesture animations
  createGestureAnimation(id, gestureType) {
    return this.createAnimation(id, {
      duration: 400,
      easing: 'easeOut',
      onUpdate: (value) => {
        // Apply based on gesture
        console.log(`Gesture ${gestureType} progress: ${value}`);
      }
    });
  }

  // Keyframe support
  createKeyframeAnimation(id, keyframes) {
    const anim = this.createAnimation(id, {
      duration: keyframes.reduce((sum, k) => sum + (k.duration || 200), 0),
      onUpdate: (overallProgress) => {
        // Distribute across keyframes
        let accumulated = 0;
        for (const kf of keyframes) {
          const kfDur = kf.duration || 200;
          const kfProgress = Math.max(0, Math.min(1, (overallProgress * anim.duration - accumulated) / kfDur));
          if (kf.onUpdate) kf.onUpdate(kfProgress);
          accumulated += kfDur;
        }
      }
    });
    return anim;
  }

  getAnimation(id) {
    return this.animations.get(id);
  }

  listRunning() {
    return Array.from(this.running);
  }

  clearAll() {
    this.running.clear();
    this.animations.clear();
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }
}

// Easing functions library
const EASINGS = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  bounce: t => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

function createAnimationEngine() {
  return new AnimationEngine();
}

// Utility for device-specific animations
function createPageTransition(engine, direction = 'forward') {
  const id = `page-${Date.now()}`;
  return engine.createAnimation(id, {
    duration: 350,
    easing: 'easeInOut',
    from: direction === 'forward' ? 100 : -100,
    to: 0,
    onUpdate: (x) => {
      // Would set transform on page element
      document.body.style.setProperty('--page-x', `${x}px`);
    }
  });
}

module.exports = {
  AnimationEngine,
  createAnimationEngine,
  EASINGS,
  createPageTransition
};

// Additional animation helpers
class SpringPhysics {
  constructor(stiffness = 100, damping = 10) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.position = 0;
    this.velocity = 0;
  }

  update(target, dt = 0.016) {
    const force = (target - this.position) * this.stiffness;
    this.velocity += force * dt;
    this.velocity *= Math.exp(-this.damping * dt);
    this.position += this.velocity * dt;
    return this.position;
  }
}

// End of AnimationEngine
