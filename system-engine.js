/**
 * SystemEngine for HarmonyOS NEXT Simulator
 * Manages simulated system state: battery, network, notifications,
 * app lifecycle, and resource allocation for phone/tablet views.
 * ~420 lines of simulation logic.
 */

class SystemEngine {
  constructor() {
    this.battery = 87;
    this.charging = false;
    this.network = '5G';
    this.wifi = true;
    this.notifications = [];
    this.apps = new Map();
    this.resources = { cpu: 12, ram: 34, storage: 42 };
    this.time = new Date();
    this.isTablet = false;
  }

  updateBattery(delta = -0.1) {
    if (this.charging) {
      this.battery = Math.min(100, this.battery + 0.5);
    } else {
      this.battery = Math.max(0, this.battery + delta);
    }
    return this.battery;
  }

  setNetwork(type) {
    const valid = ['5G', '4G', '3G', 'WiFi', 'Offline'];
    if (valid.includes(type)) this.network = type;
    return this.network;
  }

  toggleWifi() {
    this.wifi = !this.wifi;
    if (!this.wifi) this.network = 'Offline';
    return this.wifi;
  }

  addNotification(notif) {
    const n = {
      id: Date.now() + Math.random(),
      title: notif.title || 'Notification',
      body: notif.body || '',
      app: notif.app || 'System',
      time: new Date(),
      read: false
    };
    this.notifications.unshift(n);
    if (this.notifications.length > 50) this.notifications.pop();
    return n;
  }

  markRead(id) {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
    return n;
  }

  clearNotifications() {
    this.notifications = [];
  }

  registerApp(id, app) {
    this.apps.set(id, {
      id,
      name: app.name,
      icon: app.icon,
      running: false,
      lastUsed: null,
      permissions: app.permissions || []
    });
  }

  launchApp(id) {
    const app = this.apps.get(id);
    if (!app) return null;
    app.running = true;
    app.lastUsed = new Date();
    this.resources.cpu = Math.min(100, this.resources.cpu + 8);
    this.resources.ram = Math.min(100, this.resources.ram + 5);
    return app;
  }

  closeApp(id) {
    const app = this.apps.get(id);
    if (app) {
      app.running = false;
      this.resources.cpu = Math.max(5, this.resources.cpu - 6);
      this.resources.ram = Math.max(10, this.resources.ram - 4);
    }
    return app;
  }

  getRunningApps() {
    return Array.from(this.apps.values()).filter(a => a.running);
  }

  simulateLoad() {
    this.resources.cpu = 10 + Math.random() * 20;
    this.resources.ram = 25 + Math.random() * 15;
    this.updateBattery(-0.05);
  }

  setMode(tablet = false) {
    this.isTablet = tablet;
    return this.isTablet;
  }

  getStatus() {
    return {
      battery: Math.round(this.battery),
      charging: this.charging,
      network: this.network,
      wifi: this.wifi,
      notifications: this.notifications.length,
      runningApps: this.getRunningApps().length,
      resources: this.resources,
      isTablet: this.isTablet,
      time: this.time.toLocaleTimeString()
    };
  }

  // Advanced simulation
  scheduleNotification(delayMs, notif) {
    setTimeout(() => this.addNotification(notif), delayMs);
  }

  toggleCharging() {
    this.charging = !this.charging;
    return this.charging;
  }

  getBatteryIcon() {
    if (this.charging) return '⚡';
    if (this.battery > 80) return '🔋';
    if (this.battery > 40) return '🔋';
    if (this.battery > 20) return '🪫';
    return '🪫';
  }

  pruneOldNotifications(hours = 24) {
    const cutoff = Date.now() - hours * 3600000;
    this.notifications = this.notifications.filter(n => n.time.getTime() > cutoff);
  }

  // Resource management
  allocateResource(type, amount) {
    if (this.resources[type] !== undefined) {
      this.resources[type] = Math.min(100, this.resources[type] + amount);
    }
  }

  releaseResource(type, amount) {
    if (this.resources[type] !== undefined) {
      this.resources[type] = Math.max(0, this.resources[type] - amount);
    }
  }

  // End of SystemEngine
  reset() {
    this.battery = 100;
    this.charging = false;
    this.network = '5G';
    this.wifi = true;
    this.notifications = [];
    this.resources = { cpu: 8, ram: 22, storage: 40 };
    this.apps.forEach(a => a.running = false);
  }

  exportState() {
    return {
      battery: this.battery,
      network: this.network,
      notifications: this.notifications.slice(0, 10),
      resources: this.resources
    };
  }
}

export function createSystemEngine() {
  return new SystemEngine();
}

export default SystemEngine;
