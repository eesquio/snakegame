'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  X,
  Flame,
  Clock,
  RotateCw,
  Compass,
  MousePointer,
  ShieldCheck,
  Camera,
  Maximize2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { LeaderboardEntry, ControlMode } from '@/lib/types';
import { subscribeLeaderboard } from '@/lib/firebase';
import { SNAKE_THEMES } from '@/lib/themes';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentPlayerNickname?: string;
  initialMode?: ControlMode;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentPlayerNickname,
  initialMode = 'FOLLOW',
}) => {
  const [selectedMode, setSelectedMode] = useState<ControlMode>(initialMode);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectedPlayer, setInspectedPlayer] = useState<LeaderboardEntry | null>(null);

  const handleSelectMode = (mode: ControlMode) => {
    if (mode !== selectedMode) {
      setSelectedMode(mode);
      setLoading(true);
      setInspectedPlayer(null);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeLeaderboard(
      selectedMode,
      (list) => {
        setEntries(list);
        setLoading(false);
      },
      50
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, selectedMode]);

  // Handle ESC key for closing sub-modal or main modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedPlayer) {
          setInspectedPlayer(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectedPlayer, onClose]);

  if (!isOpen) return null;

  const userRankIndex = entries.findIndex((e) => e.id === currentUserId);
  const userEntry = userRankIndex !== -1 ? entries[userRankIndex] : null;
  const isFollowMode = selectedMode === 'FOLLOW';

  const inspectedTheme = inspectedPlayer
    ? SNAKE_THEMES.find((t) => t.id === inspectedPlayer.themeId) || SNAKE_THEMES[0]
    : null;

  const inspectedRankIndex = inspectedPlayer
    ? entries.findIndex((e) => e.id === inspectedPlayer.id)
    : -1;

  return (
    <>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Rankings Globais Snake 360°</span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ao Vivo
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Clique em qualquer jogador para ver o tamanho e a foto da colisão
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="p-3 sm:px-6 bg-slate-950/70 border-b border-slate-800/80">
            <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectMode('FOLLOW')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isFollowMode
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Compass className={`w-4 h-4 ${isFollowMode ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span className="truncate">Seguir Cursor (360°)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('DIRECT')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  !isFollowMode
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <MousePointer className={`w-4 h-4 ${!isFollowMode ? 'text-slate-950' : 'text-sky-400'}`} />
                <span className="truncate">Cursor Direto</span>
              </button>
            </div>

            {/* Mode subtitle */}
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>
                {isFollowMode ? (
                  <>
                    <strong className="text-emerald-300">Modo Seguir Cursor (360°):</strong> Giro contínuo com física suave.
                  </>
                ) : (
                  <>
                    <strong className="text-sky-300">Modo Cursor Direto:</strong> A cabeça segue o cursor com precisão instantânea.
                  </>
                )}
              </span>
              <span className="font-mono text-emerald-400/90 text-[10px] flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Clique p/ ver captura
              </span>
            </div>
          </div>

          {/* User Mini Banner */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-emerald-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono font-bold text-emerald-400 shrink-0">
                {userEntry ? `Sua posição: #${userRankIndex + 1}` : 'Seu Placar'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="font-semibold text-slate-200 truncate">
                {userEntry?.nickname || currentPlayerNickname || 'Você'}
              </span>
            </div>
            {userEntry ? (
              <button
                type="button"
                onClick={() => setInspectedPlayer(userEntry)}
                className="flex items-center gap-2 font-mono shrink-0 hover:text-emerald-300 transition-colors cursor-pointer"
                title="Ver sua captura de colisão"
              >
                <span className="text-amber-300 font-bold">
                  {userEntry.score.toLocaleString()} pts
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  ({userEntry.length} seg)
                </span>
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <span className="text-slate-400 text-[11px] font-mono shrink-0">
                Jogue neste modo para registrar seu recorde!
              </span>
            )}
          </div>

          {/* Content list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar min-h-[260px]">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RotateCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs font-mono">
                  Carregando classificação do modo {isFollowMode ? 'Seguir Cursor (360°)' : 'Cursor Direto'}...
                </span>
              </div>
            ) : entries.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6 text-slate-400">
                <Trophy className="w-12 h-12 text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-300">
                  Nenhum recorde registrado ainda neste modo
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Seja o primeiro a jogar no modo <strong>{isFollowMode ? 'Seguir Cursor (360°)' : 'Cursor Direto'}</strong> e conquiste o topo do ranking global!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 border-b border-slate-800/60">
                  <span className="col-span-2 sm:col-span-1">#</span>
                  <span className="col-span-5 sm:col-span-4">Jogador</span>
                  <span className="col-span-3 sm:col-span-3 text-right">Pontos</span>
                  <span className="hidden sm:block col-span-2 text-right">Combo Máx</span>
                  <span className="col-span-2 text-right">Tamanho</span>
                </div>

                {entries.map((entry, index) => {
                  const isMe = currentUserId && entry.id === currentUserId;
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setInspectedPlayer(entry)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setInspectedPlayer(entry);
                        }
                      }}
                      className={`grid grid-cols-12 items-center text-xs px-3 py-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isMe
                          ? 'bg-emerald-950/50 border-emerald-500/50 shadow-sm hover:border-emerald-400 hover:bg-emerald-950/70'
                          : isTop1
                          ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/15'
                          : isTop2
                          ? 'bg-slate-400/10 border-slate-400/30 hover:border-slate-300/60 hover:bg-slate-400/15'
                          : isTop3
                          ? 'bg-amber-700/10 border-amber-700/30 hover:border-amber-600/60 hover:bg-amber-700/15'
                          : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                      title="Clique para ver o tamanho e a captura da colisão da serpente"
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

                      {/* Nickname & Badges */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-2 truncate pr-1">
                        <span
                          className={`font-semibold truncate ${
                            isMe ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'
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
                      <div className="col-span-3 sm:col-span-3 text-right font-mono font-bold text-amber-300 tabular-nums">
                        {entry.score.toLocaleString()}
                      </div>

                      {/* Max Combo */}
                      <div className="hidden sm:flex col-span-2 justify-end items-center gap-1 font-mono text-slate-400 tabular-nums">
                        {entry.maxCombo > 1 && (
                          <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                        <span>{entry.maxCombo.toFixed(1)}x</span>
                      </div>

                      {/* Snake length & Camera Icon */}
                      <div className="col-span-2 text-right font-mono tabular-nums flex items-center justify-end gap-1.5">
                        <span className="text-emerald-400 font-semibold">{entry.length} seg</span>
                        <Camera className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
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
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL DETALHADO DO JOGADOR: EXIBIÇÃO DO TAMANHO & FOTO DA COLISÃO */}
      {/* ============================================================== */}
      {inspectedPlayer && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150 overflow-y-auto custom-scrollbar"
          onClick={() => setInspectedPlayer(null)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-7 text-slate-100 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {inspectedPlayer.nickname}
                    </h3>
                    {inspectedRankIndex !== -1 && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        #{inspectedRankIndex + 1} no Ranking
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Modo: {inspectedPlayer.mode === 'DIRECT' ? 'Cursor Direto' : 'Seguir Cursor (360°)'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedPlayer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fechar Detalhes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destaque Principal do Tamanho da Serpente */}
            <div className="w-full mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Tamanho no Momento da Colisão
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    {inspectedPlayer.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    segmentos de comprimento
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">
                  Pontuação Registrada
                </span>
                <span className="text-lg sm:text-xl font-bold text-amber-300">
                  {inspectedPlayer.score.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Imagem / Captura da Tela da Colisão */}
            <div className="w-full mb-4">
              <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Foto da Arena & Serpente no Momento da Colisão</span>
              </span>

              {inspectedPlayer.snapshotUrl ? (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspectedPlayer.snapshotUrl}
                    alt={`Captura da colisão de ${inspectedPlayer.nickname} com ${inspectedPlayer.length} segmentos`}
                    className="w-full h-full object-contain bg-black"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-slate-700 text-[10px] font-mono text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Ponto de Impacto</span>
                  </div>
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-emerald-950/85 backdrop-blur-sm border border-emerald-500/60 text-[10px] font-mono text-emerald-300 font-bold">
                    {inspectedPlayer.length} segmentos
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] w-full rounded-2xl border border-slate-800/80 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md border border-slate-700"
                    style={{
                      background: inspectedTheme
                        ? `radial-gradient(circle, ${inspectedTheme.headColor} 20%, ${inspectedTheme.bodyGradientEnd} 100%)`
                        : '#10b981',
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">
                    Comprimento Oficial: {inspectedPlayer.length} segmentos
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Esta pontuação foi registrada anteriormente sem captura automática de imagem. A partir da versão v1.5.0, todas as partidas salvam a captura da colisão.
                  </p>
                </div>
              )}
            </div>

            {/* Grid de Estatísticas Complementares */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
              <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block mb-0.5">COMBO MÁXIMO</span>
                <span className="font-bold text-amber-400">{inspectedPlayer.maxCombo.toFixed(1)}x</span>
              </div>
              <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block mb-0.5">SOBREVIVÊNCIA</span>
                <span className="font-bold text-slate-200">{inspectedPlayer.timeSurvivedSeconds}s</span>
              </div>
              <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block mb-0.5">SKIN / TEMA</span>
                <span className="font-bold text-emerald-400 truncate block">
                  {inspectedTheme?.name || 'Esmeralda'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block mb-0.5">DATA REGISTRO</span>
                <span className="font-bold text-slate-300 text-[10px] block truncate">
                  {inspectedPlayer.updatedAt
                    ? new Date(inspectedPlayer.updatedAt).toLocaleDateString('pt-BR')
                    : 'Hoje'}
                </span>
              </div>
            </div>

            {/* Footer Modal Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedPlayer(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Voltar ao Ranking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
