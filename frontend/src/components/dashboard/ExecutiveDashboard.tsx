import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';
import { ExecutiveScoreCard } from './ExecutiveScoreCard';
import { GraphCanvas } from '../graph/GraphCanvas';
import { LicenseMatrixChart } from './LicenseMatrixChart';
import { SupplyChainDepthChart } from './SupplyChainDepthChart';
import { QuickWinsList } from './QuickWinsList';

export const ExecutiveDashboard: React.FC = () => {
  const { model, clearModel } = useScaStore();
  const { t } = useTranslation();

  if (!model) return null;

  const { totalComponents } = model.summary;

  return (
    <div data-testid="executive-dashboard" className="space-y-6 animate-fadeIn pb-12">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            {t('dashboard.title')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {model.metadata.componentName}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('dashboard.subtitle')} • {t('dashboard.totalDeps')}: <strong className="text-slate-200">{totalComponents}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearModel}
            data-testid="reset-sbom-button"
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('dashboard.loadAnotherSbom')}
          </button>
        </div>
      </div>

      {/* Top Main Score Card */}
      <ExecutiveScoreCard />

      {/* Embedded 2D Topological Graph Navigator */}
      <GraphCanvas />

      {/* Analytics Charts Grid: License Matrix & Supply Chain Depth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LicenseMatrixChart />
        <SupplyChainDepthChart />
      </div>

      {/* Bottom Actionable ROI Section: Quick Wins List */}
      <QuickWinsList />
    </div>
  );
};

