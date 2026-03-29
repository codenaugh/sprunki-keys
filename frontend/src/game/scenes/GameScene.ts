import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { Player } from '../objects/Player';
import { LetterBlock } from '../objects/LetterBlock';
import { InputManager } from '../systems/InputManager';
import { ScrollManager } from '../systems/ScrollManager';
import { ScoreManager } from '../systems/ScoreManager';
import { WordSpawner } from '../systems/WordSpawner';
import { SoundManager } from '../systems/SoundManager';
import type { LevelConfig } from '../types';

interface WordInProgress {
  word: string;
  letterIndex: number;
  blocks: LetterBlock[];
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private scrollManager!: ScrollManager;
  private scoreManager!: ScoreManager;
  private wordSpawner!: WordSpawner;
  private soundManager!: SoundManager;

  private ground!: Phaser.GameObjects.TileSprite;
  private hillsFar!: Phaser.GameObjects.TileSprite;
  private hills!: Phaser.GameObjects.TileSprite;
  private clouds: Phaser.GameObjects.Image[] = [];

  private cameraOffset = 0;
  private playerScreenX = 200;
  private letterY = 200;
  private groundY = 480;

  private currentWord: WordInProgress | null = null;
  private wordsCompleted = 0;
  private levelConfig: LevelConfig | null = null;
  private wordList: string[] = [];
  private timingWindowPx = 120;
  private letterSpacing = 160;
  private gameActive = false;
  private characterId = 'pinki';
  private wordPerfect = true;

  private qualityText!: Phaser.GameObjects.Text;
  private wordDisplayText!: Phaser.GameObjects.Text;
  private progressBg!: Phaser.GameObjects.Graphics;
  private progressFill!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  private seenTiers: number[] = [];
  private isFirstGame = false;

  init(data: { levelConfig: LevelConfig; words: string[]; characterId?: string; seenTiers?: number[]; isFirstGame?: boolean }) {
    this.levelConfig = data.levelConfig;
    this.wordList = data.words;
    this.characterId = data.characterId || 'pinki';
    this.seenTiers = data.seenTiers || [];
    this.isFirstGame = data.isFirstGame || false;
    this.cameraOffset = 0;
    this.wordsCompleted = 0;
    this.currentWord = null;
    this.gameActive = false;
  }

  create() {
    if (!this.levelConfig) {
      // Fallback for direct scene start (dev/testing)
      this.levelConfig = {
        id: 1, name: 'Test', tier: 1, scrollSpeed: 60, speedIncrement: 2,
        timingWindowMs: 2000, wordCount: 5, allowedRows: ['home'],
        requireShift: false, speedWords: false, unlockRequirement: 0,
        starThresholds: [150, 275, 400],
      };
      this.wordList = ['sad', 'dad', 'had', 'ash', 'lad', 'flag', 'glad', 'dash', 'flash', 'hall'];
    }

    // Calculate timing window in pixels from ms and speed
    this.timingWindowPx = (this.levelConfig.timingWindowMs / 1000) * this.levelConfig.scrollSpeed;

    // Sky background (per-tier)
    const tier = this.levelConfig.tier;
    this.add.image(512, 288, `sky-bg-${tier}`);

    // Clouds — scattered at different heights and scales
    this.clouds = [];
    const cloudPositions = [
      { x: 150, y: 80, s: 1.2, a: 0.5 },
      { x: 450, y: 50, s: 0.8, a: 0.35 },
      { x: 700, y: 100, s: 1.0, a: 0.45 },
      { x: 900, y: 60, s: 0.6, a: 0.3 },
      { x: 300, y: 130, s: 0.7, a: 0.25 },
    ];
    for (const cp of cloudPositions) {
      const cloud = this.add.image(cp.x, cp.y, `cloud-${tier}`);
      cloud.setScale(cp.s);
      cloud.setAlpha(cp.a);
      cloud.setDepth(0);
      this.clouds.push(cloud);
    }

    // Far hills — darker silhouette layer
    this.hillsFar = this.add.tileSprite(512, this.groundY - 60, 1024, 200, `hills-far-${tier}`);
    this.hillsFar.setDepth(1);
    this.hillsFar.setAlpha(0.7);

    // Near hills
    this.hills = this.add.tileSprite(512, this.groundY - 40, 1024, 200, `hills-${tier}`);
    this.hills.setDepth(1);

    // Ground
    this.ground = this.add.tileSprite(512, this.groundY + 32, 1024, 64, `ground-${tier}`);
    this.ground.setDepth(2);

    // Player - use PNG character sprite, fall back to procedural if missing
    const textureKey = `char-${this.characterId}`;
    this.player = new Player(this, this.playerScreenX, this.groundY - 35, textureKey);
    this.player.body.setVisible(false);

    // Quality text (Perfect! Good! etc)
    this.qualityText = this.add.text(this.playerScreenX, this.groundY - 110, '', {
      fontSize: '32px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#f1c40f',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    });
    this.qualityText.setOrigin(0.5);
    this.qualityText.setDepth(20);
    this.qualityText.setAlpha(0);

    // Current word display at bottom
    this.wordDisplayText = this.add.text(512, this.groundY + 80, '', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 8,
    });
    this.wordDisplayText.setOrigin(0.5);
    this.wordDisplayText.setDepth(20);

    // Progress bar (top center)
    const barWidth = 200;
    const barX = 512 - barWidth / 2;
    const barY = 18;

    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x000000, 0.35);
    this.progressBg.fillRoundedRect(barX, barY, barWidth, 12, 6);
    this.progressBg.setDepth(20);

    this.progressFill = this.add.graphics();
    this.progressFill.setDepth(20);

    this.progressText = this.add.text(512, barY + 24, '', {
      fontSize: '13px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.progressText.setOrigin(0.5, 0);
    this.progressText.setDepth(20);
    this.updateProgress();

    // Hide HUD elements until game starts
    this.progressBg.setVisible(false);
    this.progressFill.setVisible(false);
    this.progressText.setVisible(false);
    this.wordDisplayText.setVisible(false);
    this.qualityText.setVisible(false);

    // Systems
    this.scrollManager = new ScrollManager(this.levelConfig.scrollSpeed);
    this.scoreManager = new ScoreManager();
    this.wordSpawner = new WordSpawner(this.wordList);
    this.inputManager = new InputManager(this);
    this.inputManager.onKeyPress(this.handleKeyPress.bind(this));
    this.soundManager = new SoundManager();

    // Listen for pause/resume from React UI
    EventBus.on('game-pause', this.pauseGame, this);
    EventBus.on('game-resume', this.resumeGame, this);
    EventBus.on('game-restart', this.restartGame, this);

    // First time playing: show scoring rules first, then level screen
    // Otherwise: just show the level screen (same per tier)
    if (this.isFirstGame) {
      this.showInstructions();
    } else {
      this.showLevelScreen();
    }

    EventBus.emit('current-scene-ready', this);
  }

  private getRowTips(): { title: string; keys: string; tip: string; newBadge?: string } {
    const rows = this.levelConfig!.allowedRows;
    if (rows.length === 1 && rows[0] === 'home') {
      return {
        title: 'Home Row',
        keys: 'A  S  D  F  G  H  J  K  L  ;',
        tip: 'Place your fingers on the home row\nand try not to look at the keyboard!',
      };
    }
    if (rows.length === 2) {
      return {
        title: 'Home + Top Row',
        keys: 'Q W E R T Y U I O P\n A  S  D  F  G  H  J  K  L  ;',
        tip: 'Reach up for the top row keys,\nthen come back to home row!',
        newBadge: 'New: Top Row Keys!',
      };
    }
    if (this.levelConfig!.requireShift) {
      return {
        title: 'All Keys + Shift',
        keys: 'All letter keys + Shift for capitals',
        tip: 'Hold Shift with your pinky\nfor capital letters!',
        newBadge: 'New: Capital Letters!',
      };
    }
    return {
      title: 'Full Keyboard',
      keys: 'Q W E R T Y U I O P\n A  S  D  F  G  H  J  K  L  ;\n   Z  X  C  V  B  N  M',
      tip: 'Use all three rows!\nKeep your fingers on the home row between words.',
      newBadge: 'New: Bottom Row Keys!',
    };
  }

  private destroyScreen(items: Phaser.GameObjects.GameObject[]) {
    items.forEach(obj => obj.destroy());
    this.children.list
      .filter(c => c.depth === 31)
      .forEach(c => c.destroy());
  }

  // Screen 1: How scoring works
  private showInstructions() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1024, 576);
    overlay.setDepth(30);

    const charImg = this.add.image(160, 288, 'char-hanna');
    charImg.setScale(1.4);
    charImg.setDepth(31);

    const titleText = this.add.text(580, 100, 'How to Play', {
      fontSize: '32px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#f5c842',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(31);

    const rules = [
      { icon: '>', text: 'Type the correct letter to grab it', color: '#4ebd6b' },
      { icon: '!', text: 'Wrong keys break your combo', color: '#e94560' },
      { icon: '+', text: 'Grab every letter for a Word Bonus', color: '#f5c842' },
      { icon: 'x', text: 'Build combos for a score multiplier', color: '#5dade2' },
    ];

    rules.forEach((rule, i) => {
      const y = 170 + i * 45;
      const icon = this.add.text(420, y, rule.icon, {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: rule.color,
        fontStyle: 'bold',
      });
      icon.setOrigin(0.5);
      icon.setDepth(31);

      const text = this.add.text(445, y, rule.text, {
        fontSize: '18px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: '#ffffff',
      });
      text.setOrigin(0, 0.5);
      text.setDepth(31);
    });

    const continueText = this.add.text(580, 430, 'Click or press any key to continue', {
      fontSize: '20px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    continueText.setOrigin(0.5);
    continueText.setDepth(31);

    this.tweens.add({
      targets: continueText,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const screenItems = [overlay, charImg, titleText, continueText];

    const advance = () => {
      this.input.keyboard!.off('keydown', advance);
      this.input.off('pointerdown', advance);
      this.destroyScreen(screenItems);
      this.showLevelScreen();
    };

    // Delay slightly so a stray click/key doesn't skip instantly
    this.time.delayedCall(300, () => {
      this.input.keyboard!.on('keydown', advance);
      this.input.on('pointerdown', advance);
    });
  }

  // Screen 2: Level-specific instructions
  private showLevelScreen() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1024, 576);
    overlay.setDepth(30);

    const charImg = this.add.image(160, 288, 'char-hanna');
    charImg.setScale(1.4);
    charImg.setDepth(31);

    const rowInfo = this.getRowTips();

    const titleText = this.add.text(580, 100, this.levelConfig!.name, {
      fontSize: '36px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#f5c842',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(31);

    const subtitleText = this.add.text(580, 145, rowInfo.title, {
      fontSize: '22px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#ffffff',
      fontStyle: 'bold',
    });
    subtitleText.setOrigin(0.5);
    subtitleText.setDepth(31);

    const keysText = this.add.text(580, 210, rowInfo.keys, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#5dade2',
      align: 'center',
    });
    keysText.setOrigin(0.5);
    keysText.setDepth(31);

    const screenExtras: Phaser.GameObjects.GameObject[] = [];

    // Show "New:" badge for tier transitions
    const isNewTier = !this.seenTiers.includes(this.levelConfig!.tier);
    if (rowInfo.newBadge && isNewTier) {
      const badge = this.add.text(580, 265, rowInfo.newBadge, {
        fontSize: '20px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: '#2ecc71',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      badge.setOrigin(0.5);
      badge.setDepth(31);
      screenExtras.push(badge);

      this.tweens.add({
        targets: badge,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const tipText = this.add.text(580, 320, rowInfo.tip, {
      fontSize: '18px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#b8c5d6',
      align: 'center',
    });
    tipText.setOrigin(0.5);
    tipText.setDepth(31);

    const startText = this.add.text(580, 430, 'Press any key to begin!', {
      fontSize: '22px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    startText.setOrigin(0.5);
    startText.setDepth(31);

    this.tweens.add({
      targets: startText,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const screenItems = [overlay, charImg, titleText, subtitleText, keysText, tipText, startText, ...screenExtras];

    const start = () => {
      this.input.keyboard!.off('keydown', start);
      this.input.off('pointerdown', start);
      this.destroyScreen(screenItems);
      this.showCountdown();
    };

    this.time.delayedCall(300, () => {
      this.input.keyboard!.on('keydown', start);
      this.input.on('pointerdown', start);
    });
  }

  private showCountdown() {
    const countdownText = this.add.text(512, 250, '3', {
      fontSize: '72px',
      fontFamily: 'system-ui',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    countdownText.setOrigin(0.5);
    countdownText.setDepth(30);

    let count = 3;
    const timer = this.time.addEvent({
      delay: 600,
      callback: () => {
        count--;
        if (count > 0) {
          countdownText.setText(String(count));
          this.tweens.add({
            targets: countdownText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 150,
            yoyo: true,
          });
        } else {
          countdownText.setText('GO!');
          countdownText.setColor('#2ecc71');
          this.tweens.add({
            targets: countdownText,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 400,
            onComplete: () => {
              countdownText.destroy();
              timer.destroy();
              this.player.body.setVisible(true);
              this.progressBg.setVisible(true);
              this.progressFill.setVisible(true);
              this.progressText.setVisible(true);
              this.wordDisplayText.setVisible(true);
              this.qualityText.setVisible(true);
              EventBus.emit('game-started');
              this.gameActive = true;
              this.soundManager.startBGM();
              this.spawnNextWord();
            },
          });
        }
      },
      repeat: 3,
    });
  }

  private spawnNextWord() {
    if (this.wordsCompleted >= this.levelConfig!.wordCount) {
      this.completeLevel();
      return;
    }

    const word = this.wordSpawner.nextWord();
    const blocks: LetterBlock[] = [];

    // Place letters ahead of current camera position
    const startX = this.cameraOffset + this.playerScreenX + 400;

    for (let i = 0; i < word.length; i++) {
      const block = new LetterBlock(
        this,
        startX + i * this.letterSpacing,
        this.letterY,
        word[i],
        this.timingWindowPx
      );
      blocks.push(block);
    }

    this.currentWord = {
      word,
      letterIndex: 0,
      blocks,
    };
    this.wordPerfect = true;

    this.updateWordDisplay();
  }

  private handleKeyPress(key: string) {
    if (!this.gameActive || !this.currentWord) return;

    const current = this.currentWord;
    const activeBlock = current.blocks[current.letterIndex];
    if (!activeBlock || activeBlock.grabbed || activeBlock.missed) return;

    const expectedChar = current.word[current.letterIndex];
    const isCorrect = key === expectedChar;

    if (isCorrect) {
      // Correct key — always grab regardless of position
      activeBlock.grab();
      this.player.jump(this.letterY, () => { /* visual only */ });

      // Award more points if grabbed early (letter still ahead of player)
      const screenX = activeBlock.getScreenX(this.cameraOffset);
      const ahead = screenX - this.playerScreenX;
      const quality = ahead > 80 ? 'perfect' : ahead > 20 ? 'good' : 'ok';
      this.scoreManager.onLetterGrabbed(quality);
      EventBus.emit('letter-grabbed');
      this.showQualityText(quality);
      current.letterIndex++;
      this.updateWordDisplay();

      // Check if word is complete
      if (current.letterIndex >= current.word.length) {
        const perfect = this.wordPerfect && current.blocks.every(b => b.grabbed);
        this.scoreManager.onWordComplete(current.word.length, perfect);
        if (perfect) this.showWordBonus();
        this.wordsCompleted++;
        this.updateProgress();
        this.scrollManager.increaseSpeed(this.levelConfig!.speedIncrement);
        this.time.delayedCall(600, () => {
          this.spawnNextWord();
        });
      }
    } else {
      // Wrong key
      this.wordPerfect = false;
      activeBlock.wrongKey();
      this.player.stumble();
      this.scoreManager.onWrongKey();
      this.scrollManager.applyPenalty(500);
    }
  }

  private showQualityText(quality: string) {
    const colors: Record<string, string> = {
      perfect: '#f1c40f',
      good: '#2ecc71',
      ok: '#3498db',
    };
    const labels: Record<string, string> = {
      perfect: 'AMAZING!',
      good: 'GREAT!',
      ok: 'NICE!',
    };

    this.qualityText.setText(labels[quality] || quality);
    this.qualityText.setColor(colors[quality] || '#ffffff');
    this.qualityText.setAlpha(1);
    this.qualityText.setScale(0.6);
    this.qualityText.y = this.groundY - 110;

    this.tweens.add({
      targets: this.qualityText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: this.qualityText,
          alpha: 0,
          y: this.groundY - 180,
          duration: 800,
          ease: 'Quad.easeOut',
        });
      },
    });
  }

  private showWordBonus() {
    const bonusText = this.add.text(512, 250, 'WORD BONUS!', {
      fontSize: '28px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#f5c842',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    bonusText.setOrigin(0.5);
    bonusText.setDepth(25);
    bonusText.setScale(0.5);

    this.tweens.add({
      targets: bonusText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: bonusText,
          alpha: 0,
          y: 210,
          duration: 700,
          ease: 'Quad.easeOut',
          onComplete: () => bonusText.destroy(),
        });
      },
    });
  }

  private updateProgress() {
    const total = this.levelConfig!.wordCount;
    const done = this.wordsCompleted;
    const barWidth = 200;
    const barX = 512 - barWidth / 2;
    const barY = 18;
    const fillWidth = Math.max(0, (done / total) * (barWidth - 4));

    this.progressFill.clear();
    this.progressFill.fillStyle(0x4ebd6b);
    this.progressFill.fillRoundedRect(barX + 2, barY + 2, fillWidth, 8, 4);

    this.progressText.setText(`Word ${Math.min(done + 1, total)} of ${total}`);
  }

  private updateWordDisplay() {
    if (!this.currentWord) {
      this.wordDisplayText.setText('');
      return;
    }

    // Build colored word display
    const word = this.currentWord.word;
    const idx = this.currentWord.letterIndex;
    let display = '';
    for (let i = 0; i < word.length; i++) {
      if (i < idx) {
        display += word[i]; // Already grabbed (shown in default color, could add color later)
      } else {
        display += word[i];
      }
    }
    this.wordDisplayText.setText(display.toUpperCase());
  }

  update(_time: number, delta: number) {
    if (!this.gameActive) return;

    this.scrollManager.update(Date.now());
    const scrollAmount = this.scrollManager.getPixelsPerFrame(delta);
    this.cameraOffset += scrollAmount;

    // Scroll ground, hills, and clouds at different parallax rates
    this.ground.tilePositionX += scrollAmount;
    this.hills.tilePositionX += scrollAmount * 0.3;
    this.hillsFar.tilePositionX += scrollAmount * 0.15;
    for (const cloud of this.clouds) {
      cloud.x -= scrollAmount * 0.05;
      if (cloud.x < -100) cloud.x += 1200;
    }

    // Update player
    this.player.update(delta);

    // Update letter blocks
    if (this.currentWord) {
      for (let i = 0; i < this.currentWord.blocks.length; i++) {
        const block = this.currentWord.blocks[i];
        block.update(delta, this.cameraOffset);

        // Check if active letter has passed the player (missed)
        if (i === this.currentWord.letterIndex && !block.grabbed && !block.missed && block.container.x < this.playerScreenX - this.timingWindowPx) {
          block.miss();
          this.scoreManager.onLetterMissed();
          EventBus.emit('letter-missed');
          this.currentWord.letterIndex++;
          this.updateWordDisplay();

          // If all letters done (missed or grabbed), move to next word
          if (this.currentWord.letterIndex >= this.currentWord.word.length) {
            const perfect = this.wordPerfect && this.currentWord.blocks.every(b => b.grabbed);
            this.scoreManager.onWordComplete(this.currentWord.word.length, perfect);
            if (perfect) this.showWordBonus();
            this.wordsCompleted++;
            this.updateProgress();
            this.scrollManager.increaseSpeed(this.levelConfig!.speedIncrement);
            this.time.delayedCall(600, () => {
              this.spawnNextWord();
            });
          }
        }
      }
    }
  }

  private completeLevel() {
    this.gameActive = false;
    this.player.celebrate();

    const stars = this.scoreManager.getStars(this.levelConfig!.starThresholds);

    // Show completion text
    const completeText = this.add.text(512, 250, 'Level Complete!', {
      fontSize: '48px',
      fontFamily: 'system-ui',
      color: '#f1c40f',
      fontStyle: 'bold',
    });
    completeText.setOrigin(0.5);
    completeText.setDepth(30);

    this.tweens.add({
      targets: completeText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: 1,
    });

    this.time.delayedCall(2000, () => {
      EventBus.emit('level-complete', {
        score: this.scoreManager.score,
        stars,
        accuracy: this.scoreManager.getAccuracy(),
        bestCombo: this.scoreManager.bestCombo,
      });
    });
  }

  private pauseGame() {
    if (!this.gameActive) return;
    this.scene.pause();
    this.soundManager?.stopBGM();
    EventBus.emit('game-paused');
  }

  private resumeGame() {
    this.scene.resume();
    this.soundManager?.startBGM();
    EventBus.emit('game-resumed');
  }

  private restartGame() {
    this.soundManager?.destroy();
    this.inputManager?.destroy();
    this.scene.resume();
    this.scene.restart({
      levelConfig: this.levelConfig,
      words: this.wordList,
      characterId: this.characterId,
      seenTiers: this.seenTiers,
      isFirstGame: false,
    });
  }

  shutdown() {
    EventBus.off('game-pause', this.pauseGame, this);
    EventBus.off('game-resume', this.resumeGame, this);
    EventBus.off('game-restart', this.restartGame, this);
    this.inputManager?.destroy();
    this.soundManager?.destroy();
  }
}
