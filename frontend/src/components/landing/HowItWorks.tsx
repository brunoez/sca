import React, { useState } from 'react';
import { Terminal, Upload, BarChart3, ArrowRight, Copy, Check } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export interface CliToolOption {
  id: string;
  name: string;
  command: string;
}

const cliTools: CliToolOption[] = [
  {
    id: 'trivy',
    name: 'Trivy',
    command: 'trivy fs --format cyclonedx --output sbom.json .',
  },
  {
    id: 'cdxgen',
    name: 'cdxgen',
    command: 'cdxgen -o sbom.json',
  },
  {
    id: 'syft',
    name: 'Syft',
    command: 'syft . -o cyclonedx-json=sbom.json',
  },
  {
    id: 'cyclonedx',
    name: 'CycloneDX CLI',
    command: 'cyclonedx-cli convert -i bom.xml -o sbom.json',
  },
];

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const [selectedToolId, setSelectedToolId] = useState<string>('trivy');
  const [copiedToolId, setCopiedToolId] = useState<string | null>(null);

  const selectedTool = cliTools.find((tool) => tool.id === selectedToolId) || cliTools[0];

  const handleCopyCommand = (command: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(command);
      setCopiedToolId(id);
      setTimeout(() => setCopiedToolId(null), 2000);
    }
  };

  const steps = [
    {
      step: '01',
      icon: Terminal,
      title: t('landing.step1Title'),
      description: t('landing.step1Desc'),
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      step: '02',
      icon: Upload,
      title: t('landing.step2Title'),
      description: t('landing.step2Desc'),
      code: t('landing.step2Code'),
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      step: '03',
      icon: BarChart3,
      title: t('landing.step3Title'),
      description: t('landing.step3Desc'),
      code: t('landing.step3Code'),
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">
            {t('landing.howItWorksBadge')}
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            {t('landing.howItWorksTitle')}
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            {t('landing.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative flex flex-col justify-between group hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${s.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-700 font-mono group-hover:text-cyan-400 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>
                </div>

                {idx === 0 ? (
                  <div className="space-y-2">
                    {/* Tool Selection Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                      {cliTools.map((tool) => (
                        <button
                          key={tool.id}
                          data-testid={`cli-tool-tab-${tool.id}`}
                          onClick={() => setSelectedToolId(tool.id)}
                          className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                            selectedToolId === tool.id
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {tool.name}
                        </button>
                      ))}
                    </div>

                    {/* Tool Command Code Box */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 flex items-center justify-between gap-2">
                      <span className="truncate text-cyan-300 font-medium" data-testid="selected-cli-command" title={selectedTool.command}>
                        {selectedTool.command}
                      </span>
                      <button
                        data-testid={`copy-cli-command-${selectedTool.id}`}
                        onClick={() => handleCopyCommand(selectedTool.command, selectedTool.id)}
                        className="p-1 text-slate-400 hover:text-cyan-300 transition-colors shrink-0"
                        title="Copiar comando"
                      >
                        {copiedToolId === selectedTool.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="truncate">{s.code}</span>
                    {idx < 2 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
