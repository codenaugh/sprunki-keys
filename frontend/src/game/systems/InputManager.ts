import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  private listeners: Array<(key: string) => void> = [];
  private cooldownMs = 80;
  private lastKeyTime = 0;
  private hiddenInput: HTMLInputElement | null = null;
  private mobileInputCreated = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.input.keyboard!.on('keydown', this.handleKeyDown, this);

    // Create mobile input lazily on first tap (avoids browser permission prompts)
    this.scene.input.on('pointerdown', this.onFirstTap, this);
  }

  onKeyPress(callback: (key: string) => void) {
    this.listeners.push(callback);
  }

  private onFirstTap = () => {
    if (this.mobileInputCreated) {
      this.hiddenInput?.focus();
      return;
    }
    this.mobileInputCreated = true;

    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'text';
    this.hiddenInput.autocapitalize = 'off';
    this.hiddenInput.autocomplete = 'off';
    this.hiddenInput.setAttribute('autocorrect', 'off');
    this.hiddenInput.setAttribute('spellcheck', 'false');
    // Position at top-left but invisible — avoid top:-100px which causes
    // the browser to scroll when focusing. fontSize:16px prevents iOS zoom.
    this.hiddenInput.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;z-index:-1;';
    document.body.appendChild(this.hiddenInput);
    this.hiddenInput.addEventListener('input', this.handleMobileInput);
    this.hiddenInput.addEventListener('focus', this.preventScrollOnFocus);
    this.hiddenInput.focus();
  };

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

  private preventScrollOnFocus = () => {
    // Immediately undo any scroll the browser did to reveal the input
    window.scrollTo(0, 0);
  };

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

  destroy() {
    this.scene.input.keyboard?.off('keydown', this.handleKeyDown, this);
    this.scene.input.off('pointerdown', this.onFirstTap, this);
    if (this.hiddenInput) {
      this.hiddenInput.removeEventListener('input', this.handleMobileInput);
      this.hiddenInput.removeEventListener('focus', this.preventScrollOnFocus);
      this.hiddenInput.remove();
      this.hiddenInput = null;
    }
    this.listeners = [];
  }
}
