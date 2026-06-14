// ==========================================
// app\publication\page.tsx
// ==========================================
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight:['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Условия публикации | cataclysm',
  description: 'Условия публикации в журнале cataclysm',
};

export default function PublicationPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col">
      <header className="border-b border-neutral-900 mb-8 relative bg-theme-bg overflow-hidden">
         
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden">
            <div className="relative w-[500px] h-[500px] bg-watermark">
              <Image 
                src="/logo.png" 
                alt="" 
                fill
                priority
                unoptimized
                className="object-contain"
              />
            </div>
        </div>

        <div className="max-w-[1200px] mx-auto relative py-6 px-4 z-10 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-end gap-y-4 md:gap-y-0">
            
            <div className="flex justify-start w-full md:w-auto order-2 md:order-1 md:mb-[6px] z-20">
                <Link 
                  href="/" 
                  className="text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white transition-colors border border-transparent hover:border-neutral-800 px-4 py-2.5"
                >
                ← Return to Index
                </Link>
            </div>

            <div className="flex flex-col items-center justify-end w-full md:w-auto order-1 md:order-2 h-12 md:h-[82px] mb-[2px]">
                <h1 className={`${orbitron.className} text-3xl md:text-5xl font-bold tracking-normal mb-[2px] text-white leading-none text-center`}>
                Условия публикации
                </h1>
                <p className="font-mono text-[12px] text-neutral-500 tracking-[0.2em] uppercase select-none cursor-default text-center">
                Rules & Requirements
                </p>
            </div>

            <div className="hidden md:block order-3"></div>
        </div>
      </header>

      <section className="flex-grow max-w-[800px] mx-auto px-6 pb-16 w-full pt-10">
        <div className="font-serif text-neutral-300 space-y-8 leading-relaxed text-xl">
          <p>
            Ваша работа будет рассматриваться редакторами журнала Cataclysm в чате телеграм канала:{' '}
            <a 
              href="https://t.me/ksenoimpulsi2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline decoration-neutral-600 underline-offset-4 hover:decoration-white transition-all"
            >
              https://t.me/ksenoimpulsi2
            </a>
          </p>

          <p>
            <span className="text-white font-medium">Требуется:</span> наличие заголовков, философско-литературная тематика или же академический философский текст, наличие общей темы в работе или проблематики. <span className="text-white font-medium">Минимальное количество слов: 2500.</span>
          </p>

          <p className="text-neutral-400 italic border-l-2 border-neutral-700 pl-6 py-2">
            Авторам необходимо поддерживать аффилиацию.
          </p>
        </div>
      </section>
    </div>
  );
}