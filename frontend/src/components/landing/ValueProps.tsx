import React from 'react';
import { Gauge, GitFork, ListTree, PackageSearch, Sparkles, FileCode } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const ValueProps: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Gauge,
      title: t('landing.vp1Title'),
      description: t('landing.vp1Desc'),
      badge: t('landing.vp1Badge'),
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
    },
    {
      icon: GitFork,
      title: t('landing.vp2Title'),
      description: t('landing.vp2Desc'),
      badge: t('landing.vp2Badge'),
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    },
    {
      icon: ListTree,
      title: t('landing.vp3Title'),
      description: t('landing.vp3Desc'),
      badge: t('landing.vp3Badge'),
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    },
    {
      icon: PackageSearch,
      title: t('landing.vp4Title'),
      description: t('landing.vp4Desc'),
      badge: t('landing.vp4Badge'),
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    },
    {
      icon: Sparkles,
      title: t('landing.vp5Title'),
      description: t('landing.vp5Desc'),
      badge: t('landing.vp5Badge'),
      color: 'text-orange-400 border-orange-500/20 bg-orange-500/10',
    },
    {
      icon: FileCode,
      title: t('landing.vp6Title'),
      description: t('landing.vp6Desc'),
      badge: t('landing.vp6Badge'),
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
            {t('landing.valuePropsBadge')}
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            {t('landing.valuePropsTitle')}
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            {t('landing.valuePropsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const IconComponent = f.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${f.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
