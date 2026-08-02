import { useEffect, useState } from 'react';
import { Shield, LayoutDashboard, GitFork, ListTree, PackageSearch, Home, Download } from 'lucide-react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { useScaStore } from './store/useScaStore';
import { LandingPage } from './components/landing/LandingPage';
import { LandingFooter } from './components/landing/LandingFooter';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { TreeView } from './components/tree/TreeView';
import { ComponentExplorer } from './components/explorer/ComponentExplorer';
import { PackageDetailModal } from './components/explorer/PackageDetailModal';
import { registerWebMcpTools } from './utils/webMcp';

export function MainApp() {
  const { model, activeTab, setActiveTab, reset, selectedComponentRef, selectComponent } = useScaStore();
  const { t, language, setLanguage } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    registerWebMcpTools();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between antialiased selection:bg-cyan-500 selection:text-white">
      {/* Global Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div 
          data-testid="header-logo-button"
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={reset}
          title={t('dashboard.loadAnotherSbom')}
        >
          <Shield className="w-8 h-8 text-cyan-400 group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">{t('appTitle')}</h1>
            <p className="text-xs text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* PWA Install Button */}
          {installPrompt && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl transition-all shadow-md shadow-cyan-900/40 animate-pulse"
              title="Instalar como aplicativo Desktop/PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {/* Segmented Language Selector Pill */}
          <div 
            data-testid="language-select-container"
            className="flex items-center p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-inner"
          >
            <button
              type="button"
              data-testid="lang-btn-pt"
              onClick={() => setLanguage('pt-BR')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'pt-BR'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
              }`}
              title="Português (Brasil)"
            >
              <span className="text-sm leading-none" role="img" aria-label="Brasil">🇧🇷</span>
              <span>PT</span>
            </button>
            <button
              type="button"
              data-testid="lang-btn-en"
              onClick={() => setLanguage('en-US')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'en-US'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
              }`}
              title="English (United States)"
            >
              <span className="text-sm leading-none" role="img" aria-label="USA">🇺🇸</span>
              <span>EN</span>
            </button>
          </div>

          {/* Home / Reset Button */}
          <button
            data-testid="reset-sbom-button"
            onClick={reset}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-sm cursor-pointer"
            title={t('dashboard.loadAnotherSbom')}
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>{t('nav.home')}</span>
          </button>
        </div>
      </header>

      {/* Main App Container */}
      {!model ? (
        <LandingPage />
      ) : (
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            {/* View Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                data-testid="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> {t('tabs.dashboard')}
              </button>

              <button
                data-testid="tab-graph"
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'graph'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <GitFork className="w-4 h-4" /> {t('tabs.graph')}
              </button>

              <button
                data-testid="tab-tree"
                onClick={() => setActiveTab('tree')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'tree'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ListTree className="w-4 h-4" /> {t('tabs.tree')}
              </button>

              <button
                data-testid="tab-explorer"
                onClick={() => setActiveTab('explorer')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'explorer'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <PackageSearch className="w-4 h-4" /> {t('tabs.explorer')}
              </button>
            </div>

            {/* Tab Views */}
            <div className="mt-6">
              {activeTab === 'dashboard' && <ExecutiveDashboard />}
              {activeTab === 'graph' && <GraphCanvas />}
              {activeTab === 'tree' && <TreeView />}
              {activeTab === 'explorer' && <ComponentExplorer />}
            </div>
          </div>
        </main>
      )}

      {/* Global Package Detail Modal for Dashboard & Graph views */}
      {selectedComponentRef && (activeTab === 'dashboard' || activeTab === 'graph') && (
        <PackageDetailModal
          compRef={selectedComponentRef}
          onClose={() => selectComponent(null)}
        />
      )}

      {/* Global Footer */}
      <LandingFooter />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

