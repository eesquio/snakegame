'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Trophy,
  Award,
  Clock,
  Flame,
  Check,
  Share2,
  Globe2,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';
import { GameStats, ControlMode } from '@/lib/types';

interface GameOverModalProps {
  stats: GameStats;
  controlMode?: ControlMode;
  onRestart: () => void;
  onOpenLeaderboard: (mode?: ControlMode) => void;
  onGoToTitle?: () => void;
  isSubmittingGlobal?: boolean;
  globalSubmissionResult?: { isNewBest: boolean } | null;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  controlMode = 'FOLLOW',
  onRestart,
  onOpenLeaderboard,
  onGoToTitle,
  isSubmittingGlobal,
  globalSubmissionResult,
}) => {
  const [copied, setCopied] = useState(false);
  const [showZoomedSnapshot, setShowZoomedSnapshot] = useState(false);
  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  const handleShare = () => {
    const text = `🐍 Fiz ${stats.score.toLocaleString()} pontos no Snake 360°! Minha serpente atingiu ${stats.length} segmentos com combo de ${stats.maxCombo.toFixed(1)}x. Você consegue superar?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col items-center text-center my-auto">
          {/* Header Badge */}
          {isNewRecord ? (
            <div className="flex items-center gap-1.5 px-3 py-1 mb-2.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Novo Recorde Pessoal!</span>
            </div>
          ) : (
            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1.5">
              Fim de Jogo
            </span>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            Colisão Detectada!
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Sua serpente colidiu com a parede ou seu próprio corpo.
          </p>

          {/* Mode indicator badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Modo: {controlMode === 'DIRECT' ? 'Cursor Direto' : 'Seguir Cursor (360°)'}</span>
          </div>

          {/* Global Sync Notification */}
          {isSubmittingGlobal ? (
            <div className="w-full mb-3 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center gap-2 text-xs text-amber-300">
              <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></span>
              <span>Enviando pontuação ao Ranking Global...</span>
            </div>
          ) : globalSubmissionResult ? (
            <div className="w-full mb-3 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 text-left">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {globalSubmissionResult.isNewBest
                    ? `🎉 Novo Recorde enviado ao Ranking de ${controlMode === 'DIRECT' ? 'Cursor Direto' : 'Seguir Cursor'}!`
                    : `Sincronizado no Ranking de ${controlMode === 'DIRECT' ? 'Cursor Direto' : 'Seguir Cursor'}`}
                </span>
              </div>
              <button
                onClick={() => onOpenLeaderboard(controlMode)}
                className="text-amber-300 hover:underline font-semibold font-mono text-[11px] shrink-0 ml-2 cursor-pointer"
              >
                Ver Ranking &rarr;
              </button>
            </div>
          ) : null}

          {/* Collision Moment Snapshot Card */}
          {stats.snapshotUrl && (
            <div className="w-full mb-4">
              <button
                type="button"
                onClick={() => setShowZoomedSnapshot(true)}
                className="w-full rounded-2xl overflow-hidden border border-slate-700/80 hover:border-emerald-500/70 shadow-lg bg-black/60 relative block transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title="Clique para ampliar a captura do momento da colisão"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stats.snapshotUrl}
                    alt={`Momento da colisão da serpente - Tamanho: ${stats.length} segmentos`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-slate-700 text-[10px] font-mono text-slate-200">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>Captura Automática</span>
                  </div>

                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/85 backdrop-blur-sm border border-emerald-500/60 text-[10px] font-bold font-mono text-emerald-300">
                    <span>Tamanho: {stats.length} seg</span>
                  </div>

                  {/* Hover prompt */}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                    <div className="px-3 py-1 rounded-full bg-slate-900/90 text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-xl">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Clique para Ampliar</span>
                    </div>
                  </div>
                </div>
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1">
                <span>📸 Registro visual da serpente ao colidir</span>
                <span className="font-mono text-emerald-400 font-semibold">{stats.length} segmentos</span>
              </div>
            </div>
          )}

          {/* Big Score Box */}
          <div className="w-full py-3 sm:py-4 px-6 bg-slate-800/60 border border-slate-700/50 rounded-2xl mb-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
              Pontuação Final
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-emerald-400">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-2.5 mb-4 text-left">
            <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Comprimento</span>
                <span className="text-sm font-semibold font-mono text-slate-200">
                  {stats.length} seg
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Maior Combo</span>
                <span className="text-sm font-semibold font-mono text-slate-200">
                  {stats.maxCombo.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Sobrevivência</span>
                <span className="text-sm font-semibold font-mono text-slate-200">
                  {stats.timeSurvivedSeconds}s
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Recorde Modo</span>
                <span className="text-sm font-semibold font-mono text-slate-200">
                  {stats.highScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              <button
                onClick={onRestart}
                autoFocus
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jogar Novamente (R)</span>
              </button>

              <button
                onClick={() => onOpenLeaderboard(controlMode)}
                className="py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Ranking</span>
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={handleShare}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Placar Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copiar Placar</span>
                  </>
                )}
              </button>

              {onGoToTitle && (
                <button
                  onClick={onGoToTitle}
                  className="py-2 px-4 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 font-medium text-xs rounded-xl transition-all cursor-pointer"
                >
                  Menu
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Snapshot Zoom Lightbox */}
      {showZoomedSnapshot && stats.snapshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150"
          onClick={() => setShowZoomedSnapshot(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Momento da Colisão — Tamanho da Serpente: <span className="text-emerald-400 font-mono">{stats.length} segmentos</span>
                </h3>
              </div>
              <button
                onClick={() => setShowZoomedSnapshot(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-[16/9] w-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stats.snapshotUrl}
                alt={`Captura em tela cheia do momento da colisão - ${stats.length} segmentos`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Pontuação final: <strong className="text-amber-300">{stats.score.toLocaleString()} pts</strong></span>
              <span>Tempo: <strong className="text-slate-200">{stats.timeSurvivedSeconds}s</strong></span>
              <span>Combo Máx: <strong className="text-amber-400">{stats.maxCombo.toFixed(1)}x</strong></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
