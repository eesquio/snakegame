'use client';

import React, { useEffect } from 'react';
import {
  X,
  MousePointer,
  Zap,
  ShieldAlert,
  Sparkles,
  Keyboard,
  Trophy,
} from 'lucide-react';
import { ORB_TYPES } from '@/lib/themes';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Como Jogar & Mecânicas</h2>
              <p className="text-xs text-slate-400">
                Guia completo de movimentação 360°, orbes e regras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fechar (Esc)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1.5 text-sm">
              <MousePointer className="w-4 h-4 text-emerald-400" />
              <span>Controle 360° Livre</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mova o mouse em qualquer direção pela arena. Sem restrição de ângulos de 90°: o corpo
              acompanha cada curva traçada pela cabeça com cinemática suave.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1.5 text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Aceleração Turbo</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pressione e segure o <strong>botão esquerdo do mouse</strong> ou a tecla{' '}
              <strong>Espaço</strong> para ativar o impulso turbo e realizar manobras rápidas.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1.5 text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Regras de Colisão</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tocar nas bordas da arena ou colidir contra o próprio corpo após a área do pescoço encerra
              a partida imediatamente.
            </p>
          </div>
        </div>

        {/* Orbs Legend */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Orbes Luminosos & Recompensas</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ORB_TYPES.map((orb) => (
              <div
                key={orb.id}
                className="flex items-center gap-3 p-2.5 bg-slate-800/30 border border-slate-800/80 rounded-xl"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: orb.color,
                    boxShadow: `0 0 10px ${orb.glowColor}`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {orb.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {orb.rarity}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 block">
                    +{orb.points} pts · +{orb.growth} segmentos de corpo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Atalhos Rápidos de Teclado & Mouse</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-emerald-400 rounded border border-slate-700">
                Mouse
              </kbd>
              <span className="block mt-1 text-[11px] text-slate-400">Direção 360°</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-amber-400 rounded border border-slate-700">
                Espaço / Botão Esq.
              </kbd>
              <span className="block mt-1 text-[11px] text-slate-400">Turbo Boost</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Esc
              </kbd>
              <span className="block mt-1 text-[11px] text-slate-400">Pausar / Janelas</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                R
              </kbd>
              <span className="block mt-1 text-[11px] text-slate-400">Reiniciar Jogo</span>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Entendido, Vamos Jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
