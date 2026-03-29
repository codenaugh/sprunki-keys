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
  private hills!: Phaser.GameObjects.TileSprite;

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

  private qualityText!: Phaser.GameObjects.Text;
  private wordDisplayText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: { levelConfig: LevelConfig; words: string[]; characterId?: string }) {
    this.levelConfig = data.levelConfig;
    this.wordList = data.words;
    this.characterId = data.characterId || 'pinki';
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

    // Sky background
    this.add.image(512, 288, 'sky-bg');

    // Parallax hills
    this.hills = this.add.tileSprite(512, this.groundY - 60, 1024, 200, 'hills');
    this.hills.setDepth(1);

    // Ground
    this.ground = this.add.tileSprite(512, this.groundY + 32, 1024, 64, 'ground');
    this.ground.setDepth(2);

    // Ground top line
    const groundLine = this.add.graphics();
    groundLine.fillStyle(0x5d8a3c);
    groundLine.fillRect(0, this.groundY, 1024, 4);
    groundLine.setDepth(3);

    // Player - use PNG character sprite, fall back to procedural if missing
    const textureKey = `char-${this.characterId}`;
    this.player = new Player(this, this.playerScreenX, this.groundY - 35, textureKey);

    // Quality text (Perfect! Good! etc)
    this.qualityText = this.add.text(this.playerScreenX, this.groundY - 100, '', {
      fontSize: '22px',
      fontFamily: 'system-ui',
      color: '#f1c40f',
      fontStyle: 'bold',
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

    // Start the game after a brief countdown
    this.showCountdown();

    EventBus.emit('current-scene-ready', this);
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
      const quality = activeBlock.getTimingQuality(this.playerScreenX, this.cameraOffset);
      if (quality) {
        // Grab the letter immediately (don't gate on jump animation)
        activeBlock.grab();
        this.player.jump(this.letterY, () => { /* visual only */ });
        this.scoreManager.onLetterGrabbed(quality);
        EventBus.emit('letter-grabbed');
        this.showQualityText(quality);
        current.letterIndex++;
        this.updateWordDisplay();

        // Check if word is complete
        if (current.letterIndex >= current.word.length) {
          this.wordsCompleted++;
          this.scrollManager.increaseSpeed(this.levelConfig!.speedIncrement);
          this.time.delayedCall(600, () => {
            this.spawnNextWord();
          });
        }
      } else {
        // Right key but bad timing - treat as wrong
        activeBlock.wrongKey();
        this.player.stumble();
        this.scoreManager.onWrongKey();
        EventBus.emit('wrong-key');
        this.scrollManager.applyPenalty(500);
      }
    } else {
      // Wrong key
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
      perfect: 'PERFECT!',
      good: 'GOOD!',
      ok: 'OK',
    };

    this.qualityText.setText(labels[quality] || quality);
    this.qualityText.setColor(colors[quality] || '#ffffff');
    this.qualityText.setAlpha(1);
    this.qualityText.setScale(0.5);

    this.tweens.add({
      targets: this.qualityText,
      alpha: 0,
      y: this.groundY - 140,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.qualityText.y = this.groundY - 100;
      },
    });
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

    // Scroll ground and hills
    this.ground.tilePositionX += scrollAmount;
    this.hills.tilePositionX += scrollAmount * 0.3;

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
            this.wordsCompleted++;
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
