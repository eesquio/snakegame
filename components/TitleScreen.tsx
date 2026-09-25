'use client';

import React from 'react';
import { Play, Sparkles, MousePointer, Shield, Sliders, Trophy, User, HelpCircle } from 'lucide-react';
import { GameSettings, ControlMode } from '@/lib/types';
import { SNAKE_THEMES } from '@/lib/themes';
import { useIsMounted } from '@/hooks/use-local-storage';

interface TitleScreenProps {
  settings: GameSettings;
  playerNickname: string;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: (mode?: ControlMode) => void;
  onOpenNicknameModal: () => void;
  onOpenInstructions: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  settings,
  playerNickname,
  onStart,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenNicknameModal,
  onOpenInstructions,
  highScore,
}) => {
  const isMounted = useIsMounted();
  const currentTheme = SNAKE_THEMES.find((t) => t.id === settings.themeId) || SNAKE_THEMES[0];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        {/* Animated Icon Avatar */}
        <div className="relative mb-3 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-emerald-500/40 animate-bounce duration-1000"
            style={{
              background: `radial-gradient(circle, ${currentTheme.headColor} 30%, ${currentTheme.bodyGradientEnd} 100%)`,
              boxShadow: `0 0 25px ${currentTheme.headGlow}`,
            }}
          >
            <Sparkles className="w-8 h-8 text-white drop-shadow" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          Snake <span className="text-emerald-400">360°</span>
        </h1>

        {/* Player Profile Quick Badge */}
        {isMounted && (
          <button
            onClick={onOpenNicknameModal}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jogador: <strong className="text-emerald-300">{playerNickname || 'Convidado'}</strong></span>
            <span className="text-[10px] text-slate-500 underline ml-1">alterar</span>
          </button>
        )}

        <p className="text-sm text-slate-300 max-w-sm mb-4 leading-relaxed">
          Movimentação livre sem grades ou ângulos de 90°. O cursor lidera a cabeça e o corpo
          traça suavemente sua trajetória.
        </p>

        {isMounted && highScore > 0 && (
          <div className="mb-5 py-1.5 px-4 bg-slate-800/80 border border-slate-700 rounded-full text-xs text-amber-300 font-mono">
            🏆 Seu Recorde: <strong className="text-amber-200" suppressHydrationWarning>{highScore.toLocaleString()}</strong> pts
          </div>
        )}

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5 text-center">
          <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <MousePointer className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-300 font-medium block">Controle 360°</span>
          </div>
          <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <Sparkles className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-300 font-medium block">Orbes Luminosos</span>
          </div>
          <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <Shield className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-300 font-medium block">Física de Colisão</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onStart}
            autoFocus
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Iniciar Partida</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOpenLeaderboard(settings.controlMode)}
              className="py-2.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Ranking</span>
            </button>

            <button
              onClick={onOpenInstructions}
              className="py-2.5 px-2 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Como Jogar</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="py-2.5 px-2 bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

