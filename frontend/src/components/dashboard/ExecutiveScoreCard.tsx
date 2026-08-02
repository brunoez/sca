import { ShieldCheck, ShieldAlert, AlertTriangle, Layers, Bug, Info } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { calculateScaMetrics } from '../../services/scoreCalculator';
import { useTranslation } from '../../context/LanguageContext';

export const ExecutiveScoreCard: React.FC = () => {
  const { model } = useScaStore();
  const { t } = useTranslation();

  if (!model) return null;

  const { score, grade, breakdown } = calculateScaMetrics({
    vulnerabilityCounts: model.summary.vulnerabilityCounts,
    licenseBreakdown: model.summary.licenseBreakdown,
  });

  const { critical, high, medium, low } = model.summary.vulnerabilityCounts;
  const { copyleft, unknown } = model.summary.licenseBreakdown;
  const totalCves = critical + high + medium + low;

  const gradeStyles: Record<string, { color: string; bg: string; border: string; ring: string }> = {
    'A+': { color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500', ring: 'stroke-emerald-400' },
    'A': { color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500', ring: 'stroke-emerald-400' },
    'B+': { color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-500', ring: 'stroke-cyan-400' },
    'B': { color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-500', ring: 'stroke-cyan-400' },
    'C': { color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-500', ring: 'stroke-amber-400' },
    'D': { color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-500', ring: 'stroke-orange-400' },
    'F': { color: 'text-rose-500', bg: 'bg-rose-950/40', border: 'border-rose-500', ring: 'stroke-rose-500' },
  };

  const style = gradeStyles[grade] || gradeStyles['F'];

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const ScorePopoverCard = (
    <div 
      data-testid="score-breakdown-tooltip"
      className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 bottom-full mb-3 w-80 p-4 bg-slate-950/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50 text-left text-xs space-y-3"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-slate-100 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
          {t('dashboard.scoreHelpTitle')}
        </span>
        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
          {grade} ({score}/100)
        </span>
      </div>

      <div className="space-y-2 text-slate-300">
        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-200">{t('dashboard.cvePenaltyLabel')}:</span>
            <span className="font-mono font-bold text-rose-400">-{breakdown.cvePenalty.toFixed(1)} pts</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5 pl-1">
            <div>• Crítica (x25): {critical} | Alta (x10): {high}</div>
            <div>• Média (x3): {medium} | Baixa (x0.5): {low}</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-200">{t('dashboard.licensePenaltyLabel')}:</span>
            <span className="font-mono font-bold text-amber-400">-{(breakdown.copyleftPenalty + breakdown.unknownPenalty).toFixed(1)} pts</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5 pl-1">
            <div>• Copyleft ({copyleft}): -{breakdown.copyleftPenalty.toFixed(1)} pts</div>
            <div>• Desconhecidas ({unknown}): -{breakdown.unknownPenalty.toFixed(1)} pts (máx 4)</div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-medium">
        <span className="text-slate-300">{t('dashboard.totalPenaltyLabel')}:</span>
        <span className="font-mono font-extrabold text-slate-100">-{breakdown.totalPenalty.toFixed(1)} pts</span>
      </div>

      <p className="text-[10px] text-slate-500 italic border-t border-slate-800/60 pt-2">
        {t('dashboard.scoreHelpFormula')}
      </p>
    </div>
  );

  return (
    <div 
      data-testid="executive-score-card"
      className="relative z-30 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm"
    >
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
        {/* Left Section: Grade Gauge & Metadata */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          {/* SVG Circular Gauge with Hover Tooltip */}
          <div className="group relative w-32 h-32 flex items-center justify-center shrink-0 cursor-help">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`${style.ring} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold tracking-tight ${style.color}`} data-testid="score-grade">
                {grade}
              </span>
              <span className="text-xs text-slate-400 font-medium" data-testid="score-value">
                {score}/100
              </span>
            </div>

            {/* Score calculation hover popup card */}
            {ScorePopoverCard}
          </div>

          {/* Project Details & Risk Badge */}
          <div className="text-center sm:text-left space-y-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {t('metrics.scoreLabel')}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight" data-testid="component-name">
                {model.metadata.componentName}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                v{model.metadata.componentVersion} • CycloneDX {model.metadata.specVersion} ({model.metadata.format.toUpperCase()})
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <div className="group relative cursor-help">
                {score >= 85 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    {t('dashboard.lowRisk')}
                  </span>
                ) : score >= 70 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 shadow-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {t('dashboard.moderateRisk')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/80 shadow-sm">
                    <ShieldAlert className="w-4 h-4" />
                    {t('dashboard.highRisk')}
                  </span>
                )}

                {/* Risk badge hover popup card */}
                {ScorePopoverCard}
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-400 bg-slate-800/80 border border-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {model.summary.totalComponents} {t('metrics.totalComponents').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Vulnerability / CVE Counters Grid */}
        <div className="w-full xl:w-auto bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-cyan-400" />
              {t('dashboard.cveBreakdown')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {totalCves} {t('dashboard.cveTotal')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[280px]">
            <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                {t('metrics.critical')}
              </span>
              <span className="text-xl font-black text-rose-300" data-testid="cve-critical">
                {critical}
              </span>
            </div>

            <div className="bg-orange-950/40 border border-orange-900/60 p-2.5 rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                {t('metrics.high')}
              </span>
              <span className="text-xl font-black text-orange-300" data-testid="cve-high">
                {high}
              </span>
            </div>

            <div className="bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                {t('metrics.medium')}
              </span>
              <span className="text-xl font-black text-amber-300" data-testid="cve-medium">
                {medium}
              </span>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 p-2.5 rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('metrics.low')}
              </span>
              <span className="text-xl font-black text-slate-300" data-testid="cve-low">
                {low}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
