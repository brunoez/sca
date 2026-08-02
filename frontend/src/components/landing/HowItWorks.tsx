import React from 'react';
import { Terminal, Upload, BarChart3, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: '01',
      icon: Terminal,
      title: t('landing.step1Title'),
      description: t('landing.step1Desc'),
      code: t('landing.step1Code'),
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      step: '02',
      icon: Upload,
      title: t('landing.step2Title'),
      description: t('landing.step2Desc'),
      code: t('landing.step2Code'),
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      step: '03',
      icon: BarChart3,
      title: t('landing.step3Title'),
      description: t('landing.step3Desc'),
      code: t('landing.step3Code'),
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
            {t('landing.howItWorksBadge')}
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            {t('landing.howItWorksTitle')}
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            {t('landing.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative flex flex-col justify-between group hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${s.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-700 font-mono group-hover:text-cyan-400 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                  <span className="truncate">{s.code}</span>
                  {idx < 2 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
