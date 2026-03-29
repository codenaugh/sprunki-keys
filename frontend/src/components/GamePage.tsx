import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Phaser from 'phaser';
import { HUD } from './HUD';
import { EventBus } from '../game/EventBus';
import { scoreStore } from '../game/ScoreStore';
import { gameConfig } from '../game/config';
import { getLevels, getWordsForLevel } from '../services/progress';
import { loadPlayerData, saveLevelScore } from '../services/storage';
import type { LevelConfig } from '../game/types';

export function GamePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [gameReady, setGameReady] = useState(false);
  const gameRef = useRef<Phaser.Game | null>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    let levelRef: LevelConfig | undefined;
    let cancelled = false;

    const onLevelComplete = (results: { score: number; stars: number; accuracy: number; bestCombo: number }) => {
      if (levelRef) {
        saveLevelScore(levelRef.id, {
          bestScore: results.score,
          stars: results.stars,
          accuracy: results.accuracy,
          bestCombo: results.bestCombo,
          completedAt: new Date().toISOString(),
        });
      }
      navigateRef.current('/results', { state: { ...results, levelId: Number(levelId) } });
    };

    EventBus.on('level-complete', onLevelComplete);

    // Reset score store for fresh game
    scoreStore.reset();

    (async () => {
      const levels = await getLevels();
      if (cancelled) return;

      const level = levels.find(l => l.id === Number(levelId));
      if (!level) {
        navigateRef.current('/levels');
        return;
      }

      const words = await getWordsForLevel(level);
      if (cancelled) return;

      const playerData = loadPlayerData();
      levelRef = level;

      // Determine which tiers the player has already completed levels in
      const seenTiers = [...new Set(
        levels
          .filter(l => playerData.levelScores[l.id])
          .map(l => l.tier)
      )];
      const isFirstGame = Object.keys(playerData.levelScores).length === 0;

      const phaserGame = new Phaser.Game(gameConfig);
      gameRef.current = phaserGame;

      const onSceneReady = (scene: Phaser.Scene) => {
        if (scene.scene.key === 'Preloader') {
          EventBus.off('current-scene-ready', onSceneReady);
          phaserGame.scene.stop('GameScene');
          phaserGame.scene.start('GameScene', {
            levelConfig: level,
            words,
            characterId: playerData.selectedCharacterId,
            seenTiers,
            isFirstGame,
          });
        }
      };

      EventBus.on('current-scene-ready', onSceneReady);
      setGameReady(true);
    })();

    return () => {
      cancelled = true;
      EventBus.off('level-complete', onLevelComplete);

      // Properly destroy the Phaser game instance
      const game = gameRef.current;
      if (game) {
        // Trigger scene shutdown to clean up InputManager and SoundManager
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
          (gameScene as { shutdown?: () => void }).shutdown?.();
        }
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, [levelId]);

  return (
    <div className="game-wrapper">
      <div id="game-container" />
      {gameReady && <HUD />}
    </div>
  );
}
