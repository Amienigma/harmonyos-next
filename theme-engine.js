/**
 * ThemeEngine for HarmonyOS NEXT Simulator
 * Manages dynamic theming, color schemes, dark/light modes, and skinning for the phone/tablet simulator.
 * Supports HarmonyOS, One UI, and iOS style presets.
 * Added 2026-11-22 as daily code addition.
 */

class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.currentTheme = null;
    this.customProperties = new Map();
    this.presets = this.getDefaultPresets();
    this.transitionDuration = 300;
    this.debug = false;
  }

  init() {
    this.loadDefaultThemes();
    this.applyTheme('harmony-dark');
    console.log('ThemeEngine initialized');
  }

  getDefaultPresets() {
    return {
      'harmony-dark': {
        name: 'Harmony Dark',
        primary: '#007DFF',
        secondary: '#00C4FF',
        background: '#1A1A1A',
        surface: '#2C2C2C',
        text: '#FFFFFF',
        accent: '#FF6B9D',
        mode: 'dark'
      },
      'harmony-light': {
        name: 'Harmony Light',
        primary: '#007DFF',
        secondary: '#00C4FF',
        background: '#F5F5F5',
        surface: '#FFFFFF',
        text: '#000000',
        accent: '#FF6B9D',
        mode: 'light'
      },
      'oneui-dark': {
        name: 'One UI Dark',
        primary: '#1A73E8',
        secondary: '#8AB4F8',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#E8EAED',
        accent: '#BB86FC',
        mode: 'dark'
      },
      'ios-dark': {
        name: 'iOS Dark',
        primary: '#0A84FF',
        secondary: '#64D2FF',
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        accent: '#FF375F',
        mode: 'dark'
      }
    };
  }

  loadDefaultThemes() {
    for (const [id, preset] of Object.entries(this.presets)) {
      this.themes.set(id, { ...preset, id });
    }
  }

  applyTheme(themeId) {
    const theme = this.themes.get(themeId);
    if (!theme) return false;
    this.currentTheme = theme;
    this.applyToDOM(theme);
    this.emit('themeApplied', theme);
    return true;
  }

  applyToDOM(theme) {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--accent', theme.accent);
    root.setAttribute('data-theme', theme.mode);
    root.setAttribute('data-skin', theme.id);
  }

  createCustomTheme(name, colors) {
    const id = `custom-${Date.now()}`;
    const theme = {
      id,
      name,
      ...colors,
      mode: colors.mode || 'dark',
      custom: true
    };
    this.themes.set(id, theme);
    return theme;
  }

  setCustomProperty(name, value) {
    this.customProperties.set(name, value);
    document.documentElement.style.setProperty(`--${name}`, value);
  }

  getCustomProperty(name) {
    return this.customProperties.get(name);
  }

  toggleMode() {
    if (!this.currentTheme) return;
    const newMode = this.currentTheme.mode === 'dark' ? 'light' : 'dark';
    const oppositeId = this.currentTheme.id.replace('dark', newMode).replace('light', newMode);
    if (this.themes.has(oppositeId)) {
      this.applyTheme(oppositeId);
    } else {
      this.currentTheme.mode = newMode;
      this.applyToDOM(this.currentTheme);
    }
  }

  getAvailableThemes() {
    return Array.from(this.themes.values()).map(t => ({
      id: t.id,
      name: t.name,
      mode: t.mode,
      primary: t.primary
    }));
  }

  exportTheme(themeId) {
    const theme = this.themes.get(themeId);
    return theme ? JSON.stringify(theme, null, 2) : null;
  }

  importTheme(json) {
    try {
      const theme = typeof json === 'string' ? JSON.parse(json) : json;
      this.themes.set(theme.id, theme);
      return theme;
    } catch {
      return null;
    }
  }

  interpolateColors(color1, color2, factor) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  animateThemeTransition(fromId, toId, duration = 300) {
    const from = this.themes.get(fromId);
    const to = this.themes.get(toId);
    if (!from || !to) return;
    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      const factor = step / steps;
      const interpolated = {
        primary: this.interpolateColors(from.primary, to.primary, factor),
        background: this.interpolateColors(from.background, to.background, factor),
        text: this.interpolateColors(from.text, to.text, factor)
      };
      this.applyToDOM({ ...to, ...interpolated });
      step++;
      if (step > steps) {
        clearInterval(interval);
        this.applyTheme(toId);
      }
    }, duration / steps);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getStats() {
    return {
      themeCount: this.themes.size,
      customCount: Array.from(this.themes.values()).filter(t => t.custom).length,
      currentTheme: this.currentTheme?.id || null
    };
  }

  on(event, callback) {
    if (!this._listeners) this._listeners = new Map();
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (!this._listeners) return;
    const listeners = this._listeners.get(event) || [];
    listeners.forEach(cb => cb(data));
  }

  version = '1.0.0';
  description = 'Dynamic theming system for HarmonyOS NEXT simulator';
}

export default ThemeEngine;
