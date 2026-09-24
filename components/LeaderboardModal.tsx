'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  X,
  Medal,
  Flame,
  Clock,
  RotateCw,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';
import { subscribeLeaderboard } from '@/lib/firebase';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentPlayerNickname?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentPlayerNickname,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeLeaderboard((list) => {
      setEntries(list);
      setLoading(false);
    }, 50);

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const userRankIndex = entries.findIndex((e) => e.id === currentUserId);
  const userEntry = userRankIndex !== -1 ? entries[userRankIndex] : null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Tabela Global de Pontuação</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ao Vivo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Os melhores jogadores do Snake 360° em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Banner */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-emerald-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400">
              {userEntry ? `Sua posição: #${userRankIndex + 1}` : 'Classificação'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-semibold text-slate-200">
              {userEntry?.nickname || currentPlayerNickname || 'Você'}
            </span>
          </div>
          {userEntry ? (
            <div className="flex items-center gap-3 font-mono">
              <span className="text-amber-300 font-bold">
                {userEntry.score.toLocaleString()} pts
              </span>
              <span className="text-slate-500 hidden sm:inline">
                (Comp: {userEntry.length})
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] font-mono">
              Jogue uma partida para entrar no ranking!
            </span>
          )}
        </div>


        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RotateCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs font-mono">Carregando classificação global...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6 text-slate-400">
              <Trophy className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-300">
                Nenhum recorde registrado ainda
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Seja o primeiro a jogar uma partida para registrar sua pontuação no topo do ranking global!
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 border-b border-slate-800/60">
                <span className="col-span-2 sm:col-span-1">#</span>
                <span className="col-span-6 sm:col-span-5">Jogador</span>
                <span className="col-span-4 sm:col-span-3 text-right">Pontos</span>
                <span className="hidden sm:block col-span-2 text-right">Combo Máx</span>
                <span className="hidden sm:block col-span-1 text-right">Tam.</span>
              </div>

              {entries.map((entry, index) => {
                const isMe = currentUserId && entry.id === currentUserId;
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 items-center text-xs px-3 py-2.5 rounded-xl border transition-all ${
                      isMe
                        ? 'bg-emerald-950/40 border-emerald-500/40 shadow-sm'
                        : isTop1
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : isTop2
                        ? 'bg-slate-400/5 border-slate-400/20'
                        : isTop3
                        ? 'bg-amber-700/5 border-amber-700/20'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 sm:col-span-1 font-mono font-bold flex items-center gap-1.5">
                      {isTop1 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px]">
                          🥇
                        </span>
                      ) : isTop2 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-300/20 text-slate-200 flex items-center justify-center text-[10px]">
                          🥈
                        </span>
                      ) : isTop3 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600/20 text-amber-500 flex items-center justify-center text-[10px]">
                          🥉
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs pl-1">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Nickname & Badge */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-2 truncate pr-2">
                      <span
                        className={`font-semibold truncate ${
                          isMe ? 'text-emerald-300' : 'text-slate-200'
                        }`}
                      >
                        {entry.nickname}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-mono uppercase bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded shrink-0">
                          Você
                        </span>
                      )}
                    </div>

                    {/* Score */}
                    <div className="col-span-4 sm:col-span-3 text-right font-mono font-bold text-amber-300 tabular-nums">
                      {entry.score.toLocaleString()}
                    </div>

                    {/* Max Combo */}
                    <div className="hidden sm:flex col-span-2 justify-end items-center gap-1 font-mono text-slate-400 tabular-nums">
                      {entry.maxCombo > 1 && (
                        <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                      <span>{entry.maxCombo}x</span>
                    </div>

                    {/* Snake length */}
                    <div className="hidden sm:block col-span-1 text-right font-mono text-slate-400 tabular-nums">
                      {entry.length}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sincronizado automaticamente via Firebase Firestore</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
