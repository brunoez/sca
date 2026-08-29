import { Zap, ArrowUpRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';

export interface QuickWinItem {
  bomRef: string;
  name: string;
  version: string;
  transitiveCount: number;
  vulnerabilitiesCount: number;
}

export const QuickWinsList: React.FC = () => {
  const { model, setSelectedComponentRef, setActiveTab } = useScaStore();
  const { t } = useTranslation();

  if (!model) return null;

  // Calculate downstream transitive count for each direct component
  const quickWins: QuickWinItem[] = [];

  model.components.forEach((comp, ref) => {
    if (comp.isDirect) {
      // Find all downstream reachable components
      const visited = new Set<string>();
      const queue = [...(model.dependenciesGraph.get(ref) || [])];

      while (queue.length > 0) {
        const childRef = queue.shift()!;
        if (!visited.has(childRef)) {
          visited.add(childRef);
          const grandChildren = model.dependenciesGraph.get(childRef) || [];
          queue.push(...grandChildren);
        }
      }

      let vulnCount = comp.vulnerabilities.length;
      visited.forEach((visitedRef) => {
        const childComp = model.components.get(visitedRef);
        if (childComp) {
          vulnCount += childComp.vulnerabilities.length;
        }
      });

      quickWins.push({
        bomRef: ref,
        name: comp.name,
        version: comp.version,
        transitiveCount: visited.size,
        vulnerabilitiesCount: vulnCount,
      });
    }
  });

  // Sort by highest downstream impact (transitive count + vulnerabilities)
  quickWins.sort((a, b) => {
    const scoreA = a.transitiveCount * 2 + a.vulnerabilitiesCount * 5;
    const scoreB = b.transitiveCount * 2 + b.vulnerabilitiesCount * 5;
    return scoreB - scoreA;
  });

  // Take top 4 recommendations
  const topQuickWins = quickWins.slice(0, 4);

  const handleSelect = (ref: string) => {
    setSelectedComponentRef(ref);
    setActiveTab('explorer');
  };

  return (
    <div 
      data-testid="quick-wins-list"
      className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-pulse" />
            <h3 className="text-lg font-bold text-white">{t('dashboard.quickWinsTitle')}</h3>
          </div>
          <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-full font-semibold">
            {t('dashboard.highRoi')}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">{t('dashboard.quickWinsSubtitle')}</p>

        {topQuickWins.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-sm font-medium">{t('dashboard.noQuickWins')}</p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="quick-wins-items">
            {topQuickWins.map((item, idx) => (
              <div
                key={item.bomRef}
                onClick={() => handleSelect(item.bomRef)}
                data-testid={`quick-win-item-${idx}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/60 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {item.name}
                      <span className="text-xs font-normal text-slate-400">v{item.version}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {t('dashboard.downstreamImpact')}: <strong className="text-amber-300 font-semibold">{item.transitiveCount}</strong> {t('dashboard.depsCount')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.vulnerabilitiesCount > 0 && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {item.vulnerabilitiesCount} CVEs
                    </span>
                  )}
                  <button className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/60 px-2.5 py-1 rounded-lg transition-colors">
                    {t('explorer.inspect')} <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
