'use client';

import React from 'react';
import { X, Sliders, Volume2, Sparkles, Gauge, Compass } from 'lucide-react';
import { GameSettings, ControlMode } from '@/lib/types';
import { SNAKE_THEMES } from '@/lib/themes';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Configurações do Jogo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Control Mode */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <label className="text-sm font-semibold text-slate-200">
                Modo de Controle do Mouse
              </label>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Defina como a serpente responde ao movimento livre em 360 graus:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ controlMode: 'FOLLOW' })}
                className={`p-3 text-left rounded-xl border transition-all ${
                  settings.controlMode === 'FOLLOW'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="font-medium text-sm mb-1">Seguir Cursor (360°)</div>
                <div className="text-xs text-slate-400">
                  A cabeça persegue o cursor fluidamente com turbo no clique.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ controlMode: 'DIRECT' })}
                className={`p-3 text-left rounded-xl border transition-all ${
                  settings.controlMode === 'DIRECT'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="font-medium text-sm mb-1">Cursor Direto</div>
                <div className="text-xs text-slate-400">
                  A cabeça é a posição exata do cursor e o corpo traça a rota.
                </div>
              </button>
            </div>
          </div>

          {/* Skin Theme Picker */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <label className="text-sm font-semibold text-slate-200">
                Aparência da Serpente
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SNAKE_THEMES.map((theme) => {
                const isSelected = settings.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onUpdateSettings({ themeId: theme.id })}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 border border-white/20"
                      style={{
                        background: `radial-gradient(circle, ${theme.headColor} 40%, ${theme.bodyGradientEnd} 100%)`,
                      }}
                    />
                    <span className="text-xs font-medium truncate">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Speed */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <label className="text-sm font-semibold text-slate-200">
                Velocidade da Partida
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'chill', label: 'Suave' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'fast', label: 'Rápido' },
                ] as const
              ).map((spd) => (
                <button
                  key={spd.id}
                  type="button"
                  onClick={() => onUpdateSettings({ speedMode: spd.id })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                    settings.speedMode === spd.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Screen Shake Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span>Efeitos Sonoros Sintetizados</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Vibração da Tela em Impactos</span>
              </div>
              <input
                type="checkbox"
                checked={settings.screenShake}
                onChange={(e) => onUpdateSettings({ screenShake: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
