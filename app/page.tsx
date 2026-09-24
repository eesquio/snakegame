'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SnakeCanvas } from '@/components/SnakeCanvas';
import { GameHUD } from '@/components/GameHUD';
import { GameOverModal } from '@/components/GameOverModal';
import { PauseOverlay } from '@/components/PauseOverlay';
import { TitleScreen } from '@/components/TitleScreen';
import { SettingsModal } from '@/components/SettingsModal';
import { NicknameModal } from '@/components/NicknameModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { GameInstructions } from '@/components/GameInstructions';
import { GameState, GameStats, GameSettings } from '@/lib/types';
import {
  useHighScore,
  useGameSettings,
  usePlayerNickname,
} from '@/hooks/use-local-storage';
import { ensureAnonymousAuth, submitPlayerScore } from '@/lib/firebase';
import { Sparkles, Terminal, Trophy } from 'lucide-react';

const APP_VERSION = 'v1.2.0';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useHighScore();
  const [nickname, setNickname] = usePlayerNickname();
  const [snakeLength, setSnakeLength] = useState<number>(20);
  const [combo, setCombo] = useState<number>(1);
  const [lastStats, setLastStats] = useState<GameStats | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState<boolean>(false);
  const [isFirstTimeNickname, setIsFirstTimeNickname] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Firebase auth & global score state
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isSubmittingGlobal, setIsSubmittingGlobal] = useState<boolean>(false);
  const [globalSubmissionResult, setGlobalSubmissionResult] = useState<{
    isNewBest: boolean;
  } | null>(null);

  const [settings, handleUpdateSettings] = useGameSettings();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Firebase Auth and check for initial Nickname registration
  useEffect(() => {
    ensureAnonymousAuth()
      .then((user) => {
        setCurrentUserId(user.uid);
      })
      .catch((err) => {
        console.warn('Anonymous auth note:', err);
      });

    // Check if player already registered a nickname
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('snake_360_nickname');
        if (!stored) {
          setIsFirstTimeNickname(true);
          setIsNicknameModalOpen(true);
        }
      } catch {}
    }, 100);

    return () => clearTimeout(timer);
  }, []);


  const handleSaveNickname = (newNick: string) => {
    setNickname(newNick);
    setIsNicknameModalOpen(false);
  };

  const handleStartGame = () => {
    // If player has never set a nickname, prompt once before starting
    if (!nickname) {
      setIsFirstTimeNickname(true);
      setIsNicknameModalOpen(true);
      return;
    }
    setGameState('PLAYING');
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  const handleRestart = () => {
    setGlobalSubmissionResult(null);
    setGameState('PLAYING');
  };

  const handleGameOver = useCallback(
    (stats: GameStats) => {
      setLastStats(stats);
      setGameState('GAME_OVER');
      if (stats.score > stats.highScore) {
        setHighScore(stats.score);
      }

      // Automatically sync score with Global Leaderboard in Firebase Firestore
      if (stats.score > 0) {
        setIsSubmittingGlobal(true);
        const playerNick = nickname?.trim() || 'Jogador';
        submitPlayerScore(playerNick, {
          score: stats.score,
          length: stats.length,
          maxCombo: stats.maxCombo,
          timeSurvivedSeconds: stats.timeSurvivedSeconds,
          themeId: settings.themeId,
        })
          .then((res) => {
            setGlobalSubmissionResult(res);
          })
          .catch((err) => {
            console.warn('Score submission error:', err);
          })
          .finally(() => {
            setIsSubmittingGlobal(false);
          });
      }
    },
    [nickname, settings.themeId, setHighScore]
  );

  const handleScoreUpdate = useCallback(
    (newScore: number, newLength: number, newCombo: number) => {
      setScore(newScore);
      setSnakeLength(newLength);
      setCombo(newCombo);
    },
    []
  );

  const handleToggleSound = () => {
    handleUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard shortcut listener for Esc (Pause/Modals) and R (Restart)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isNicknameModalOpen) {
          setIsNicknameModalOpen(false);
          return;
        }
        if (isLeaderboardOpen) {
          setIsLeaderboardOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'GAME_OVER' || gameState === 'PAUSED') {
          handleRestart();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, isSettingsOpen, isLeaderboardOpen, isNicknameModalOpen]);

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-4 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Snake 360°</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                {APP_VERSION}
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Movimentação livre 360° no mouse · Tabela de Pontuação Global
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Tabela Global</span>
          </button>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span className="hidden md:inline">HTML5 Canvas · 60 FPS</span>
        </div>
      </div>

      {/* Main Game Arena Container */}
      <div
        ref={containerRef}
        className="w-full max-w-6xl flex flex-col gap-3 relative my-auto"
      >
        {/* Responsive HUD */}
        <GameHUD
          gameState={gameState}
          score={score}
          highScore={highScore}
          snakeLength={snakeLength}
          combo={combo}
          settings={settings}
          playerNickname={nickname}
          onTogglePause={handleTogglePause}
          onRestart={handleRestart}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenNicknameModal={() => {
            setIsFirstTimeNickname(false);
            setIsNicknameModalOpen(true);
          }}
        />

        {/* Canvas Gameport */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[72vh] min-h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/90 bg-[#060a11]">
          <SnakeCanvas
            gameState={gameState}
            settings={settings}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />

          {/* Overlays */}
          {gameState === 'TITLE' && (
            <TitleScreen
              settings={settings}
              playerNickname={nickname}
              onStart={handleStartGame}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenNicknameModal={() => {
                setIsFirstTimeNickname(false);
                setIsNicknameModalOpen(true);
              }}
              highScore={highScore}
            />
          )}

          {gameState === 'PAUSED' && (
            <PauseOverlay
              onResume={handleTogglePause}
              onRestart={handleRestart}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {gameState === 'GAME_OVER' && lastStats && (
            <GameOverModal
              stats={lastStats}
              onRestart={handleRestart}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              isSubmittingGlobal={isSubmittingGlobal}
              globalSubmissionResult={globalSubmissionResult}
            />
          )}

          {isSettingsOpen && (
            <SettingsModal
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}

          {/* Nickname Registration / Edit Modal */}
          {isNicknameModalOpen && (
            <NicknameModal
              currentNickname={nickname}
              isOpen={isNicknameModalOpen}
              isFirstTime={isFirstTimeNickname}
              onSave={handleSaveNickname}
              onClose={() => setIsNicknameModalOpen(false)}
            />
          )}

          {/* Global Leaderboard Modal */}
          {isLeaderboardOpen && (
            <LeaderboardModal
              isOpen={isLeaderboardOpen}
              onClose={() => setIsLeaderboardOpen(false)}
              currentUserId={currentUserId}
              currentPlayerNickname={nickname}
            />
          )}
        </div>
      </div>

      {/* Bottom Instructions & Legend */}
      <div className="w-full max-w-6xl mt-6">
        <GameInstructions />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-8 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-600" />
          <span>Snake 360° {APP_VERSION} · Leaderboard em tempo real com Firebase Firestore</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Atalhos: [Espaço] Turbo · [Esc] Pausar · [R] Reiniciar</span>
        </div>
      </footer>
    </main>
  );
}
