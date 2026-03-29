import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { EventBus } from '../game/EventBus';

interface PhaserGameProps {
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export function PhaserGame({ onSceneReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game(gameConfig);

    const handleSceneReady = (scene: Phaser.Scene) => {
      onSceneReady?.(scene);
    };

    EventBus.on('current-scene-ready', handleSceneReady);

    return () => {
      EventBus.off('current-scene-ready', handleSceneReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" />;
}
