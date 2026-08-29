import React from 'react';
import { Shield, Github, Globe, Tag } from 'lucide-react';
import packageJson from '../../../package.json';
import { useTranslation } from '../../context/LanguageContext';

export const LandingFooter: React.FC = () => {
  const version = packageJson.version;
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-xs mt-auto">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white tracking-tight">CycloneDX SCA Visualizer</h4>
              <span
                className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
                title={`v${version}`}
              >
                <Tag className="w-3 h-3 text-cyan-400" /> v{version}
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">{t('landing.footerSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400 font-mono text-[11px] flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            <Globe className="w-3.5 h-3.5" /> sca.brunoizidorio.com.br
          </span>
          <a
            href="https://github.com/brunoez/sca"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white text-slate-300 transition"
            data-testid="footer-github-link"
          >
            <Github className="w-3.5 h-3.5 text-cyan-400" /> {t('landing.footerProjectGithub')}
          </a>
          <a
            href="https://github.com/CycloneDX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Github className="w-3.5 h-3.5" /> CycloneDX Standard
          </a>
        </div>

        <div className="text-slate-500 text-center md:text-right">
          <p>© {new Date().getFullYear()} {t('landing.footerCopyright')}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">{t('landing.footerSecurityNote')}</p>
        </div>
      </div>
    </footer>
  );
};
