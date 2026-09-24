'use client';

import React, { useState } from 'react';
import { RotateCcw, Trophy, Award, Clock, Flame, Check, Share2, Globe2 } from 'lucide-react';
import { GameStats } from '@/lib/types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  isSubmittingGlobal?: boolean;
  globalSubmissionResult?: { isNewBest: boolean } | null;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onOpenLeaderboard,
  isSubmittingGlobal,
  globalSubmissionResult,
}) => {
  const [copied, setCopied] = useState(false);
  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  const handleShare = () => {
    const text = `🐍 Fiz ${stats.score} pontos no Snake 360°! Consegui ${stats.length} segmentos e um combo de ${stats.maxCombo}x. Você consegue superar?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center">
        {/* Header Badge */}
        {isNewRecord ? (
          <div className="flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide uppercase">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Novo Recorde Pessoal!</span>
          </div>
        ) : (
          <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-2">
            Fim de Jogo
          </span>
        )}

        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">
          Colisão Detectada!
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Sua serpente colidiu com a parede ou seu próprio corpo.
        </p>

        {/* Global Sync Notification */}
        {globalSubmissionResult && (
          <div className="w-full mb-4 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {globalSubmissionResult.isNewBest
                  ? '🎉 Pontuação enviada ao Ranking Global!'
                  : 'Sincronizado com a Tabela Global'}
              </span>
            </div>
            <button
              onClick={onOpenLeaderboard}
              className="text-amber-300 hover:underline font-semibold font-mono text-[11px]"
            >
              Ver Ranking &rarr;
            </button>
          </div>
        )}

        {/* Big Score Box */}
        <div className="w-full py-4 px-6 bg-slate-800/60 border border-slate-700/50 rounded-xl mb-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Pontuação Final
          </span>
          <span className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-emerald-400">
            {stats.score.toLocaleString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-5 text-left">
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-md text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Comprimento</span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                {stats.length} seg
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-md text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Maior Combo</span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                {stats.maxCombo.toFixed(1)}x
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-md text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Tempo Sobrevivido</span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                {stats.timeSurvivedSeconds}s
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-md text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Melhor Pontuação</span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                {stats.highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
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
              onClick={onOpenLeaderboard}
              className="py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Ranking Global</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Placar Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar Placar para Amigos</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

