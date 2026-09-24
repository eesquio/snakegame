import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snake 360° - Serpente de Movimento Livre',
  description: 'Jogo web moderno estilo Snake com movimentação livre em 360 graus no mouse, física de corpo, orbes luminosos, cadastro simples por nickname e tabela de pontuação global em tempo real via Firebase.',
  openGraph: {
    title: 'Snake 360° - Serpente de Movimento Livre',
    description: 'Jogo web moderno estilo Snake com movimentação livre em 360 graus no mouse, física de corpo, orbes luminosos, cadastro simples por nickname e tabela de pontuação global em tempo real via Firebase.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snake 360° - Serpente de Movimento Livre',
    description: 'Jogo web moderno estilo Snake com movimentação livre em 360 graus no mouse, física de corpo, orbes luminosos, cadastro simples por nickname e tabela de pontuação global em tempo real via Firebase.',
  },
};


export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#070b12] text-slate-100 antialiased overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
