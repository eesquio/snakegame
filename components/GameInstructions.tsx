'use client';

import React from 'react';
import { MousePointer, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { ORB_TYPES } from '@/lib/themes';

export const GameInstructions: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-slate-300">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>Como Jogar & Mecânicas</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 font-medium text-slate-100 mb-1 text-sm">
            <MousePointer className="w-4 h-4 text-emerald-400" />
            <span>Controle 360° Livre</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mova o mouse em qualquer direção pela arena. Sem restrição de ângulos de 90°: o corpo
            acompanha cada curva traçada pela cabeça com física suave e contínua.
          </p>
        </div>

        <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 font-medium text-slate-100 mb-1 text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Aceleração Turbo</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pressione e segure o <strong>botão esquerdo do mouse</strong> ou a tecla{' '}
            <strong>Espaço</strong> para ativar o impulso turbo e desviar rapidamente.
          </p>
        </div>

        <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-2 font-medium text-slate-100 mb-1 text-sm">
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
      <div>
        <span className="text-xs font-medium text-slate-400 block mb-2">
          Orbes Luminosos & Recompensas:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ORB_TYPES.map((orb) => (
            <div
              key={orb.id}
              className="flex items-center gap-2.5 p-2 bg-slate-800/30 border border-slate-800/80 rounded-lg"
            >
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm"
                style={{
                  backgroundColor: orb.color,
                  boxShadow: `0 0 8px ${orb.glowColor}`,
                }}
              />
              <div className="text-xs truncate">
                <span className="text-slate-200 font-medium block truncate">{orb.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  +{orb.points} pts · +{orb.growth} seg
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
