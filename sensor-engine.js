/**
 * SensorEngine for HarmonyOS NEXT Simulator
 * Simulates accelerometer, gyroscope, ambient light, proximity,
 * and device orientation for interactive phone/tablet demos.
 * 
 * @version 1.0.0
 * @date 2026-11-18
 */

class SensorEngine {
  constructor() {
    this.sensors = {
      accelerometer: { x: 0, y: 0, z: 9.8, active: false },
      gyroscope: { alpha: 0, beta: 0, gamma: 0, active: false },
      light: { lux: 300, active: false },
      proximity: { near: false, active: false },
      orientation: { absolute: false, alpha: 0, beta: 0, gamma: 0 },
    };
    this.listeners = new Map();
    this.interval = null;
  }

  enable(sensorName) {
    if (this.sensors[sensorName]) {
      this.sensors[sensorName].active = true;
      this.startSimulation();
    }
  }

  disable(sensorName) {
    if (this.sensors[sensorName]) {
      this.sensors[sensorName].active = false;
    }
  }

  startSimulation() {
    if (this.interval) return;
    this.interval = setInterval(() => this.tick(), 100);
  }

  tick() {
    // Simulated values with slight noise
    if (this.sensors.accelerometer.active) {
      this.sensors.accelerometer.x = (Math.random() - 0.5) * 0.4;
      this.sensors.accelerometer.y = (Math.random() - 0.5) * 0.4;
    }
    if (this.sensors.gyroscope.active) {
      this.sensors.gyroscope.alpha += (Math.random() - 0.5) * 2;
      this.sensors.gyroscope.beta += (Math.random() - 0.5) * 1;
    }
    if (this.sensors.light.active) {
      this.sensors.light.lux = 200 + Math.random() * 400;
    }
    this.emit("update", this.getReadings());
  }

  getReadings() {
    const out = {};
    for (const [name, data] of Object.entries(this.sensors)) {
      if (data.active) out[name] = { ...data };
    }
    return out;
  }

  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
  }

  emit(event, data) {
    const cbs = this.listeners.get(event) || [];
    cbs.forEach((cb) => cb(data));
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

if (typeof module !== "undefined") module.exports = SensorEngine;
