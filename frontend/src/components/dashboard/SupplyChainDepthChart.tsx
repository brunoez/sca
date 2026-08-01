import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GitFork, Layers } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';

export const SupplyChainDepthChart: React.FC = () => {
  const { model } = useScaStore();
  const { t } = useTranslation();

  if (!model) return null;

  const { directComponentsCount, transitiveComponentsCount, maxTreeDepth, totalComponents } = model.summary;

  const directPercent = totalComponents > 0 ? ((directComponentsCount / totalComponents) * 100).toFixed(1) : '0';
  const transitivePercent = totalComponents > 0 ? ((transitiveComponentsCount / totalComponents) * 100).toFixed(1) : '0';

  const chartData = [
    { name: t('metrics.direct'), count: directComponentsCount, color: '#06b6d4' },
    { name: t('metrics.transitive'), count: transitiveComponentsCount, color: '#8b5cf6' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = totalComponents > 0 ? ((item.value / totalComponents) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
            {item.payload.name}
          </p>
          <p className="text-slate-300">
            Quantidade: <span className="font-semibold text-white">{item.value}</span> ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      data-testid="supply-chain-depth-chart"
      className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">{t('dashboard.depthTitle')}</h3>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            {t('metrics.maxDepth')}: <strong className="text-white" data-testid="max-depth-val">{maxTreeDepth}</strong>
          </span>
        </div>
      </div>

      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={48}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 gap-3 mt-2 pt-3 border-t border-slate-800 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-900/50 flex flex-col items-center justify-center">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{t('metrics.direct')}</span>
          <span className="text-xl font-extrabold text-white" data-testid="direct-count">
            {directComponentsCount} <span className="text-xs font-normal text-slate-400">({directPercent}%)</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/50 flex flex-col items-center justify-center">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{t('metrics.transitive')}</span>
          <span className="text-xl font-extrabold text-white" data-testid="transitive-count">
            {transitiveComponentsCount} <span className="text-xs font-normal text-slate-400">({transitivePercent}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
