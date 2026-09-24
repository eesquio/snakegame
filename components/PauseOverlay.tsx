'use client';

import React from 'react';
import { Play, RotateCcw, Sliders } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onGoToTitle?: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onGoToTitle,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Jogo Pausado</h3>
        <p className="text-xs text-slate-400 mb-6">Pressione Esc ou o botão abaixo para continuar</p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Continuar Partida</span>
          </button>

          <button
            onClick={onRestart}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Partida (R)</span>
          </button>

          {onGoToTitle && (
            <button
              onClick={onGoToTitle}
              className="py-2 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700/50 transition-colors cursor-pointer"
            >
              <span>Voltar ao Menu Principal</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="py-2 px-4 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configurações & Controles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
