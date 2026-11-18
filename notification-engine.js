// NotificationEngine - Notification system for HarmonyOS NEXT simulator
// Supports toast, banner, and system notifications with scheduling
// Daily addition 2026-11-17

class NotificationEngine {
  constructor(container) {
    this.container = container || document.body;
    this.notifications = [];
    this.maxVisible = 3;
    this.defaultDuration = 5000;
  }

  show(title, message, options = {}) {
    const notification = {
      id: Date.now() + Math.random(),
      title,
      message,
      type: options.type || 'info',
      duration: options.duration || this.defaultDuration,
      icon: options.icon || this.getDefaultIcon(options.type),
      timestamp: new Date()
    };

    this.notifications.push(notification);
    this.render(notification);
    
    if (notification.duration > 0) {
      setTimeout(() => this.dismiss(notification.id), notification.duration);
    }

    return notification.id;
  }

  getDefaultIcon(type) {
    const icons = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕',
      system: '⚙'
    };
    return icons[type] || icons.info;
  }

  render(notification) {
    const el = document.createElement('div');
    el.className = `notification notification-${notification.type}`;
    el.dataset.id = notification.id;
    el.innerHTML = `
      <span class="notification-icon">${notification.icon}</span>
      <div class="notification-content">
        <strong>${notification.title}</strong>
        <p>${notification.message}</p>
      </div>
      <button class="notification-close">×</button>
    `;
    
    el.querySelector('.notification-close').onclick = () => this.dismiss(notification.id);
    this.container.appendChild(el);
    
    // Limit visible
    const visible = this.container.querySelectorAll('.notification');
    if (visible.length > this.maxVisible) {
      this.dismiss(visible[0].dataset.id);
    }
  }

  dismiss(id) {
    const el = this.container.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  dismissAll() {
    this.notifications.forEach(n => this.dismiss(n.id));
  }

  // Scheduled notifications
  schedule(title, message, delay, options) {
    return setTimeout(() => this.show(title, message, options), delay);
  }

  // System notification simulation
  showSystem(title, message) {
    return this.show(title, message, { type: 'system', duration: 8000 });
  }

  getHistory(limit = 20) {
    return this.notifications.slice(-limit);
  }
}

export default NotificationEngine;

// CSS injection helper
export function injectNotificationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .notification { position: fixed; top: 20px; right: 20px; background: #1a1a1a; color: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; gap: 10px; min-width: 280px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; transition: opacity 0.3s; }
    .notification-info { border-left: 4px solid #3498db; }
    .notification-success { border-left: 4px solid #2ecc71; }
    .notification-warning { border-left: 4px solid #f39c12; }
    .notification-error { border-left: 4px solid #e74c3c; }
    .notification-system { border-left: 4px solid #9b59b6; }
    .notification-close { background: none; border: none; color: white; font-size: 18px; cursor: pointer; }
  `;
  document.head.appendChild(style);
}

console.log('NotificationEngine for HarmonyOS NEXT - 2026-11-17');
