'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Maximize2,
  Zap,
  Trophy,
  User,
  HelpCircle,
  Home,
} from 'lucide-react';
import { GameState, GameSettings, ControlMode } from '@/lib/types';

interface GameHUDProps {
  gameState: GameState;
  score: number;
  highScore: number;
  snakeLength: number;
  combo: number;
  settings: GameSettings;
  playerNickname: string;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onOpenLeaderboard: (mode?: ControlMode) => void;
  onOpenNicknameModal: () => void;
  onOpenInstructions: () => void;
  onGoToTitle?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  score,
  highScore,
  snakeLength,
  combo,
  settings,
  playerNickname,
  onTogglePause,
  onRestart,
  onOpenSettings,
  onToggleSound,
  onToggleFullscreen,
  onOpenLeaderboard,
  onOpenNicknameModal,
  onOpenInstructions,
  onGoToTitle,
}) => {

  return (
    <header className="w-full flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl text-slate-200">
      {/* Left: Score & High Score */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
            Pontuação
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="h-8 w-px bg-slate-800" aria-hidden="true" />

        <div className="flex flex-col">
          <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
            Recorde
          </span>
          <span
            className="text-xl font-semibold font-mono tabular-nums text-amber-300"
            suppressHydrationWarning
          >
            {highScore.toLocaleString()}
          </span>
        </div>

        <div className="hidden sm:flex flex-col">
          <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
            Comprimento
          </span>
          <span className="text-xl font-medium font-mono tabular-nums text-slate-200">
            {snakeLength} seg
          </span>
        </div>
      </div>

      {/* Center: Dynamic Combo & Boost indicator */}
      <div className="flex items-center gap-3">
        {combo > 1 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 animate-pulse text-xs font-semibold">
            <span>🔥 Combo</span>
            <span className="font-mono tabular-nums font-bold text-emerald-400">
              {combo.toFixed(1)}x
            </span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Turbo: Botão Esq. / Espaço</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Player Profile / Nickname button */}
        <button
          onClick={onOpenNicknameModal}
          title="Alterar seu Nickname"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors"
        >
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span className="max-w-[100px] truncate">{playerNickname || 'Jogador'}</span>
        </button>

        {/* Control Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{settings.controlMode === 'DIRECT' ? 'Cursor Direto' : 'Seguir 360°'}</span>
        </div>

        {/* Global Leaderboard Button */}
        <button
          onClick={() => onOpenLeaderboard(settings.controlMode)}
          title="Ver Tabelas Globais de Pontuação"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ranking</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-0.5" aria-hidden="true" />

        <button
          onClick={onToggleSound}
          title={settings.soundEnabled ? 'Silenciar som' : 'Ativar som'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label={settings.soundEnabled ? 'Silenciar' : 'Ativar som'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>


        {gameState === 'PLAYING' && (
          <button
            onClick={onTogglePause}
            title="Pausar jogo (Esc)"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Pausar"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {gameState === 'PAUSED' && (
          <button
            onClick={onTogglePause}
            title="Continuar jogo"
            className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-950/50 transition-colors"
            aria-label="Continuar"
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        {gameState !== 'TITLE' && onGoToTitle && (
          <button
            onClick={onGoToTitle}
            title="Voltar ao Menu Principal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Menu Principal"
          >
            <Home className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onRestart}
          title="Reiniciar partida (R)"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenInstructions}
          title="Como Jogar e Mecânicas"
          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          aria-label="Como Jogar"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title="Alternar Tela Cheia"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors hidden sm:inline-flex"
          aria-label="Tela cheia"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Configurações e Skins"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Configurações"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
