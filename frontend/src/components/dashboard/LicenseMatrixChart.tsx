import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Scale, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';

export const LicenseMatrixChart: React.FC = () => {
  const { model } = useScaStore();
  const { t } = useTranslation();

  if (!model) return null;

  const { permissive, copyleft, unknown } = model.summary.licenseBreakdown;
  const totalLicenses = permissive + copyleft + unknown;

  const data = [
    { name: t('metrics.permissive'), value: permissive, color: '#10b981' },
    { name: t('metrics.copyleft'), value: copyleft, color: '#f43f5e' },
    { name: t('metrics.unknown'), value: unknown, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  // Fallback if no license information at all
  const chartData = data.length > 0 ? data : [
    { name: t('metrics.unknown'), value: 1, color: '#64748b' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = totalLicenses > 0 ? ((item.value / totalLicenses) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
            {item.name}
          </p>
          <p className="text-slate-300">
            Total: <span className="font-semibold text-white">{item.value}</span> ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      data-testid="license-matrix-chart"
      className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">{t('metrics.licenseMatrix')}</h3>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-medium">
            {totalLicenses} {t('dashboard.licenseDistribution').toLowerCase()}
          </span>
        </div>

        {copyleft > 0 ? (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{t('dashboard.licenseWarning')}</span>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Conformidade de licenças validada. Nenhuma licença restritiva detectada.</span>
          </div>
        )}
      </div>

      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="#0f172a"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown stat pills */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800 text-center text-xs">
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] text-emerald-400 font-bold block uppercase">{t('metrics.permissive')}</span>
          <span className="text-base font-bold text-white" data-testid="license-permissive">{permissive}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] text-rose-400 font-bold block uppercase">{t('metrics.copyleft')}</span>
          <span className="text-base font-bold text-white" data-testid="license-copyleft">{copyleft}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-[10px] text-amber-400 font-bold block uppercase">{t('metrics.unknown')}</span>
          <span className="text-base font-bold text-white" data-testid="license-unknown">{unknown}</span>
        </div>
      </div>
    </div>
  );
};
