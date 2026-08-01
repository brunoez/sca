import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ScaLicense, ScaVulnerability } from '../../models/sca';

export const ScaNodeComponent = memo(({ data }: NodeProps<any>) => {
  const {
    name,
    version,
    isRoot,
    isDirect,
    depth,
    licenses = [],
    vulnerabilities = [],
    isImpactPath,
    isSelected,
  } = data;

  // Determine Primary License & Category
  const hasCopyleft = licenses.some((l: ScaLicense) => l.type === 'copyleft');
  const hasPermissive = licenses.some((l: ScaLicense) => l.type === 'permissive');
  const primaryLicenseName = licenses[0]?.name || licenses[0]?.id || 'Desconhecida';

  let licenseBadgeClass = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
  let licenseLabel = primaryLicenseName;

  if (hasCopyleft) {
    licenseBadgeClass = 'bg-rose-950/80 text-rose-400 border-rose-800/80';
  } else if (hasPermissive) {
    licenseBadgeClass = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
  } else if (licenses.length === 0) {
    licenseLabel = 'Sem Licença';
  }

  // Determine Vulnerability Status
  const criticalHighCount = vulnerabilities.filter(
    (v: ScaVulnerability) => v.severity === 'critical' || v.severity === 'high'
  ).length;
  const totalCveCount = vulnerabilities.length;

  let cveBadgeClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
  if (criticalHighCount > 0) {
    cveBadgeClass = 'bg-rose-950/90 text-rose-400 border-rose-800 shadow-rose-900/40';
  } else if (totalCveCount > 0) {
    cveBadgeClass = 'bg-amber-950/90 text-amber-400 border-amber-800';
  }

  // Determine Container Styling
  let borderStyle = 'border-slate-800 bg-slate-900/90 hover:border-slate-600';
  if (isImpactPath) {
    borderStyle =
      'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] bg-slate-900';
  }
  if (isSelected) {
    borderStyle =
      'border-cyan-300 ring-4 ring-cyan-500/60 shadow-[0_0_25px_rgba(34,211,238,0.6)] bg-slate-950';
  }

  return (
    <div
      className={`relative w-[240px] rounded-xl border p-3 transition-all duration-200 backdrop-blur-md cursor-pointer select-none ${borderStyle}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-cyan-500 border-2 border-slate-900 rounded-full !left-[-6px]"
      />

      {/* Header: Name & Type Badge */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span
          className="font-bold text-sm text-slate-100 truncate max-w-[130px]"
          title={name}
        >
          {name}
        </span>
        {isRoot ? (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
            Raiz
          </span>
        ) : isDirect ? (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            Direta
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Transitiva Lvl {depth}
          </span>
        )}
      </div>

      {/* Version */}
      <div className="text-xs font-mono text-slate-400 mb-2 truncate">
        v{version}
      </div>

      {/* Badges Footer: License & CVEs */}
      <div className="flex items-center justify-between gap-1 border-t border-slate-800/80 pt-2">
        {/* License Badge */}
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border truncate max-w-[110px] ${licenseBadgeClass}`}
          title={`Licença: ${licenseLabel}`}
        >
          {licenseLabel}
        </span>

        {/* CVE Badge */}
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${cveBadgeClass}`}
        >
          {criticalHighCount > 0 ? (
            <ShieldAlert className="w-3 h-3 text-rose-400" />
          ) : totalCveCount > 0 ? (
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          ) : (
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          )}
          <span>
            {totalCveCount > 0 ? `${totalCveCount} CVE${totalCveCount > 1 ? 's' : ''}` : '0 CVEs'}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-cyan-500 border-2 border-slate-900 rounded-full !right-[-6px]"
      />
    </div>
  );
});

ScaNodeComponent.displayName = 'ScaNodeComponent';
