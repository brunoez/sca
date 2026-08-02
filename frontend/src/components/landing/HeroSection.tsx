import React from 'react';
import { Play, Upload, Shield } from 'lucide-react';
import { Dropzone } from './Dropzone';
import { SampleLoader } from './SampleLoader';
import { useTranslation } from '../../context/LanguageContext';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  const scrollToDropzone = () => {
    const el = document.getElementById('hero-dropzone-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-12 md:py-20 bg-slate-950 overflow-hidden">
      {/* Radial Glow Gradient */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold shadow-lg">
              <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
              <span className="uppercase tracking-wider">{t('landing.heroBadge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {t('landing.heroTitlePrefix')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                {t('landing.heroTitleHighlight')}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
              {t('landing.heroDescription')}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={scrollToDropzone}
                className="px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-600/25 border border-cyan-400/50 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Upload className="w-4 h-4" />
                {t('landing.analyzeBtn')}
              </button>

              <button
                type="button"
                onClick={scrollToDropzone}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl font-bold text-sm border border-slate-800 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 text-cyan-400 fill-current" />
                {t('landing.viewSampleBtn')}
              </button>
            </div>
          </div>

          {/* Right Column: Dropzone & Sample Loader */}
          <div id="hero-dropzone-card" className="lg:col-span-6 space-y-6">
            <Dropzone />
            <SampleLoader />
          </div>
        </div>
      </div>
    </section>
  );
};
