import { Shield, LayoutDashboard, GitFork, ListTree, PackageSearch, Globe, RefreshCw } from 'lucide-react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { useScaStore } from './store/useScaStore';
import { LandingPage } from './components/landing/LandingPage';
import { LandingFooter } from './components/landing/LandingFooter';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { TreeView } from './components/tree/TreeView';
import { ComponentExplorer } from './components/explorer/ComponentExplorer';
import { PackageDetailModal } from './components/explorer/PackageDetailModal';

export function MainApp() {
  const { model, activeTab, setActiveTab, reset, selectedComponentRef, selectComponent } = useScaStore();
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between antialiased selection:bg-cyan-500 selection:text-white">
      {/* Global Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { if (model) setActiveTab('dashboard'); else reset(); }}>
          <Shield className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{t('appTitle')}</h1>
            <p className="text-xs text-slate-400">{t('subtitle')}</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              data-testid="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'pt-BR' | 'en-US')}
              className="bg-transparent text-xs font-semibold text-slate-300 outline-none cursor-pointer"
            >
              <option value="pt-BR" className="bg-slate-900 text-white">Português (BR)</option>
              <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
            </select>
          </div>

          {model && (
            <button
              data-testid="reset-sbom-button"
              onClick={reset}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all shadow-sm"
              title="Carregar outro arquivo SBOM"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Novo SBOM</span>
            </button>
          )}
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

