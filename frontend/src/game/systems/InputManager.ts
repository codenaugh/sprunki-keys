import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  private listeners: Array<(key: string) => void> = [];
  private cooldownMs = 80;
  private lastKeyTime = 0;
  private hiddenInput: HTMLInputElement | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.input.keyboard!.on('keydown', this.handleKeyDown, this);

    // Hidden input for mobile keyboard support
    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'text';
    this.hiddenInput.autocapitalize = 'off';
    this.hiddenInput.autocomplete = 'off';
    this.hiddenInput.setAttribute('autocorrect', 'off');
    this.hiddenInput.setAttribute('spellcheck', 'false');
    this.hiddenInput.style.cssText =
      'position:fixed;top:-100px;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(this.hiddenInput);
    this.hiddenInput.addEventListener('input', this.handleMobileInput);

    // Focus on tap/click for mobile
    this.scene.input.on('pointerdown', this.focusMobileInput, this);
    // Auto-focus on start
    this.focusMobileInput();
  }

  onKeyPress(callback: (key: string) => void) {
    this.listeners.push(callback);
  }

  private handleKeyDown(event: KeyboardEvent) {
    const now = Date.now();
    if (now - this.lastKeyTime < this.cooldownMs) return;

    // Only handle printable characters
    if (event.key.length === 1) {
      this.lastKeyTime = now;
      for (const listener of this.listeners) {
        listener(event.key);
      }
    }
  }

  private handleMobileInput = () => {
    if (!this.hiddenInput) return;
    const val = this.hiddenInput.value;
    if (val.length > 0) {
      const now = Date.now();
      if (now - this.lastKeyTime >= this.cooldownMs) {
        this.lastKeyTime = now;
        const key = val[val.length - 1];
        for (const listener of this.listeners) {
          listener(key);
        }
      }
      this.hiddenInput.value = '';
    }
  };

  private focusMobileInput = () => {
    this.hiddenInput?.focus();
  };

  destroy() {
    this.scene.input.keyboard?.off('keydown', this.handleKeyDown, this);
    this.scene.input.off('pointerdown', this.focusMobileInput, this);
    if (this.hiddenInput) {
      this.hiddenInput.removeEventListener('input', this.handleMobileInput);
      this.hiddenInput.remove();
      this.hiddenInput = null;
    }
    this.listeners = [];
  }
}
