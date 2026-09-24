'use client';

import React, { useState } from 'react';
import { User, Sparkles, Dices, ArrowRight, X } from 'lucide-react';

interface NicknameModalProps {
  currentNickname: string;
  isOpen: boolean;
  isFirstTime?: boolean;
  onSave: (nickname: string) => void;
  onClose: () => void;
}

const FUN_NICKNAMES = [
  'CobraCosmica',
  'ViperNeon',
  'SerpenteNinja',
  'PitonVeloz',
  'MambaSolar',
  'AnacondaPro',
  'VenomPulse',
  'DragonSnake',
  'CobraLunar',
  'CiberSerpente',
  'NajaEsmeralda',
  'TitanBoa',
];

export const NicknameModal: React.FC<NicknameModalProps> = ({
  currentNickname,
  isOpen,
  isFirstTime = false,
  onSave,
  onClose,
}) => {
  const [nickname, setNickname] = useState(currentNickname || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * FUN_NICKNAMES.length);
    const randomSuffix = Math.floor(Math.random() * 90) + 10;
    const generated = `${FUN_NICKNAMES[randomIndex]}${randomSuffix}`;
    setNickname(generated);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError('O nickname deve ter no mínimo 2 caracteres.');
      return;
    }
    if (trimmed.length > 20) {
      setError('O nickname deve ter no máximo 20 caracteres.');
      return;
    }
    // Simple sanitization: letters, numbers, hyphens, underscores and spaces
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      setError('Apenas letras, números, espaços e traços são permitidos.');
      return;
    }

    setError('');
    onSave(trimmed);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col relative">
        {!isFirstTime && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {isFirstTime ? 'Bem-vindo ao Snake 360°' : 'Editar Nickname'}
            </h3>
            <span className="text-xs text-slate-400">
              {isFirstTime ? 'Cadastro rápido de jogador' : 'Seu nome no Ranking Global'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 my-3 leading-relaxed">
          {isFirstTime
            ? 'Defina seu apelido para registrar seus recordes na Tabela de Pontuação Global e competir com outros jogadores.'
            : 'Atualize o apelido exibido nas suas pontuações do ranking global.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div>
            <label htmlFor="nickname-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Seu Nickname:
            </label>
            <div className="relative flex items-center">
              <input
                id="nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (error) setError('');
                }}
                maxLength={20}
                placeholder="Ex: CobraCosmica"
                autoFocus
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-sm font-medium rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-500 pr-12"
              />
              <button
                type="button"
                onClick={handleRandomize}
                title="Gerar sugestão aleatória"
                className="absolute right-2 p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700/60 transition-colors"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
            {error && <p className="text-xs text-rose-400 mt-2 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>2 a 20 caracteres</span>
            <button
              type="button"
              onClick={handleRandomize}
              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Sugerir nome</span>
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>{isFirstTime ? 'Entrar na Arena' : 'Salvar Nickname'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isFirstTime && (
              <button
                type="button"
                onClick={() => {
                  handleRandomize();
                  setTimeout(() => {
                    const fallback = `Serpente${Math.floor(Math.random() * 900) + 100}`;
                    onSave(fallback);
                  }, 50);
                }}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Continuar com nome sugerido rápido
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
