'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SnakeCanvas } from '@/components/SnakeCanvas';
import { GameHUD } from '@/components/GameHUD';
import { GameOverModal } from '@/components/GameOverModal';
import { PauseOverlay } from '@/components/PauseOverlay';
import { TitleScreen } from '@/components/TitleScreen';
import { GameInstructions } from '@/components/GameInstructions';
import { SettingsModal } from '@/components/SettingsModal';
import { NicknameModal } from '@/components/NicknameModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { InstructionsModal } from '@/components/InstructionsModal';
import { GameState, GameStats } from '@/lib/types';
import {
  useHighScore,
  useGameSettings,
  usePlayerNickname,
} from '@/hooks/use-local-storage';
import { ensureAnonymousAuth, submitPlayerScore } from '@/lib/firebase';
import { Sparkles, Trophy } from 'lucide-react';

const APP_VERSION = 'v1.3.2';

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
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);

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

  // Start game: automatically expands the game screen to full browser window
  const handleStartGame = () => {
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

  const handleGoToTitle = () => {
    setGameState('TITLE');
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
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard shortcut listener for Esc (Pause/Modals), R (Restart), F (Fullscreen)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isInstructionsOpen) {
          setIsInstructionsOpen(false);
          return;
        }
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
      } else if (e.key === 'f' || e.key === 'F') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          handleToggleFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, isSettingsOpen, isLeaderboardOpen, isNicknameModalOpen, isInstructionsOpen]);

  const isGameRunning = gameState !== 'TITLE';

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MODO JOGO: EXPANDIDO AUTOMATICAMENTE PARA O TAMANHO DO NAVEGADOR */}
      {/* ============================================================== */}
      {isGameRunning ? (
        <main
          ref={containerRef}
          className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#060a11] text-slate-100 select-none z-10 flex flex-col"
        >
          {/* Barra Superior Integrada: delimita o topo exato da arena */}
          <div className="w-full flex-shrink-0 z-30 px-2.5 py-2 sm:px-4 sm:py-2.5 bg-[#080d17]/95 border-b border-slate-800 shadow-md flex justify-center">
            <div className="w-full max-w-7xl">
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
                onOpenInstructions={() => setIsInstructionsOpen(true)}
                onGoToTitle={handleGoToTitle}
              />
            </div>
          </div>

          {/* Arena do Jogo: Ocupa todo o espaço restante até o limite total da tela */}
          <div className="relative flex-1 w-full h-full overflow-hidden bg-[#060a11]">
            <SnakeCanvas
              gameState={gameState}
              settings={settings}
              onGameOver={handleGameOver}
              onScoreUpdate={handleScoreUpdate}
            />

            {/* Overlays durante a partida */}
            {gameState === 'PAUSED' && (
              <PauseOverlay
                onResume={handleTogglePause}
                onRestart={handleRestart}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onGoToTitle={handleGoToTitle}
              />
            )}

            {gameState === 'GAME_OVER' && lastStats && (
              <GameOverModal
                stats={lastStats}
                onRestart={handleRestart}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onGoToTitle={handleGoToTitle}
                isSubmittingGlobal={isSubmittingGlobal}
                globalSubmissionResult={globalSubmissionResult}
              />
            )}
          </div>
        </main>
      ) : (
        /* ============================================================== */
        /* 2. PRIMEIRA TELA: APRESENTAÇÃO COMPLETA COM INFORMAÇÕES E GUIA */
        /* ============================================================== */
        <main
          ref={containerRef}
          className="min-h-screen bg-[#060a11] text-slate-100 flex flex-col items-center p-3 sm:p-6 md:p-8"
        >
          <div className="w-full max-w-6xl flex flex-col gap-5 sm:gap-6 my-auto">
            {/* Top Bar Header com Logo, Versão e Tabela Global */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Snake 360°
                    </h1>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {APP_VERSION}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Movimentação livre 360° no mouse • Tabela de Pontuação Global
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLeaderboardOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tabela Global</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>•</span>
                  <span>HTML5 Canvas</span>
                  <span>•</span>
                  <span className="text-emerald-400">60 FPS</span>
                </div>
              </div>
            </header>

            {/* Game HUD Bar */}
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
              onOpenInstructions={() => setIsInstructionsOpen(true)}
            />

            {/* Arena Centralizada na Primeira Tela com TitleScreen */}
            <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[560px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#060a11]">
              <SnakeCanvas
                gameState={gameState}
                settings={settings}
                onGameOver={handleGameOver}
                onScoreUpdate={handleScoreUpdate}
              />

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
                onOpenInstructions={() => setIsInstructionsOpen(true)}
                highScore={highScore}
              />
            </div>

            {/* Painel COMO JOGAR & MECÂNICAS (Orbes, Controles, Regras) */}
            <GameInstructions />

            {/* Rodapé de Informações e Atalhos */}
            <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&gt;_</span>
                <span>Snake 360° {APP_VERSION} • Leaderboard em tempo real com Firebase Firestore</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Atalhos: <kbd className="text-slate-300">[Espaço]</kbd> Turbo •{' '}
                <kbd className="text-slate-300">[Esc]</kbd> Pausar •{' '}
                <kbd className="text-slate-300">[R]</kbd> Reiniciar
              </div>
            </footer>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 3. MODAIS GLOBAIS (CONFIGURAÇÕES, RANKING, NICKNAME, INSTRUÇÕES) */}
      {/* ============================================================== */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isNicknameModalOpen && (
        <NicknameModal
          currentNickname={nickname}
          isOpen={isNicknameModalOpen}
          isFirstTime={isFirstTimeNickname}
          onSave={handleSaveNickname}
          onClose={() => setIsNicknameModalOpen(false)}
        />
      )}

      {isLeaderboardOpen && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          currentUserId={currentUserId}
          currentPlayerNickname={nickname}
        />
      )}

      {isInstructionsOpen && (
        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />
      )}
    </>
  );
}
