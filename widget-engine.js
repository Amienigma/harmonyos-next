/**
 * WidgetEngine for HarmonyOS NEXT Simulator
 * Widget management, positioning, stacking, interactions,
 * and dynamic updates for phone/tablet home screens.
 */

class WidgetEngine {
  constructor() {
    this.widgets = new Map();
    this.stack = [];
    this.grid = { columns: 4, rows: 6 };
    this.active = null;
  }

  createWidget(id, config = {}) {
    const widget = {
      id,
      type: config.type || 'info',
      position: config.position || { x: 0, y: 0 },
      size: config.size || { w: 2, h: 1 },
      data: config.data || {},
      style: config.style || {},
      interactive: config.interactive !== false,
      createdAt: Date.now()
    };
    this.widgets.set(id, widget);
    this.stack.push(id);
    return widget;
  }

  updateWidget(id, updates) {
    const w = this.widgets.get(id);
    if (!w) return false;
    Object.assign(w, updates);
    w.updatedAt = Date.now();
    return true;
  }

  moveWidget(id, x, y) {
    const w = this.widgets.get(id);
    if (!w) return false;
    if (this.isValidPosition(x, y, w.size)) {
      w.position = { x, y };
      return true;
    }
    return false;
  }

  isValidPosition(x, y, size) {
    return x >= 0 && y >= 0 && x + size.w <= this.grid.columns && y + size.h <= this.grid.rows;
  }

  resizeWidget(id, w, h) {
    const widget = this.widgets.get(id);
    if (!widget) return false;
    if (this.isValidPosition(widget.position.x, widget.position.y, { w, h })) {
      widget.size = { w, h };
      return true;
    }
    return false;
  }

  removeWidget(id) {
    this.widgets.delete(id);
    this.stack = this.stack.filter(s => s !== id);
    if (this.active === id) this.active = null;
  }

  bringToFront(id) {
    this.stack = this.stack.filter(s => s !== id);
    this.stack.push(id);
    this.active = id;
  }

  getVisibleWidgets() {
    return this.stack.map(id => this.widgets.get(id)).filter(Boolean);
  }

  handleTap(id) {
    const w = this.widgets.get(id);
    if (w && w.interactive) {
      this.active = id;
      return { action: 'tap', widget: w };
    }
    return null;
  }

  // Advanced
  autoArrange() {
    let x = 0, y = 0;
    for (const id of this.stack) {
      const w = this.widgets.get(id);
      if (!w) continue;
      if (x + w.size.w > this.grid.columns) {
        x = 0;
        y += 1;
      }
      if (y + w.size.h <= this.grid.rows) {
        w.position = { x, y };
        x += w.size.w;
      }
    }
  }

  getWidgetsByType(type) {
    return Array.from(this.widgets.values()).filter(w => w.type === type);
  }

  setGrid(columns, rows) {
    this.grid = { columns, rows };
  }

  exportLayout() {
    return {
      grid: this.grid,
      widgets: Array.from(this.widgets.values()).map(w => ({
        id: w.id,
        type: w.type,
        position: w.position,
        size: w.size,
        data: w.data
      }))
    };
  }

  importLayout(layout) {
    this.widgets.clear();
    this.stack = [];
    this.grid = layout.grid || this.grid;
    for (const w of layout.widgets || []) {
      this.createWidget(w.id, w);
    }
  }

  // Utils
  listWidgets() {
    return Array.from(this.widgets.keys());
  }

  getActive() {
    return this.active ? this.widgets.get(this.active) : null;
  }

  clearAll() {
    this.widgets.clear();
    this.stack = [];
    this.active = null;
  }

  // End of WidgetEngine
}

export function createWidgetEngine() {
  return new WidgetEngine();
}

export default WidgetEngine;
