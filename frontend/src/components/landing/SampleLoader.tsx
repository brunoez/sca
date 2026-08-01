import React, { useState } from 'react';
import { Sparkles, FileJson, FileCode2, AlertCircle, Loader2 } from 'lucide-react';
import { parseAndNormalizeSbom } from '../../services/normalizer';
import { useScaStore } from '../../store/useScaStore';

const FALLBACK_NPM_SAMPLE = JSON.stringify({
  bomFormat: 'CycloneDX',
  specVersion: '1.4',
  metadata: {
    component: {
      'bom-ref': 'pkg:npm/sample-web-app@2.1.0',
      type: 'application',
      name: 'sample-web-app',
      version: '2.1.0',
      purl: 'pkg:npm/sample-web-app@2.1.0'
    }
  },
  components: [
    {
      'bom-ref': 'pkg:npm/express@4.19.2',
      type: 'library',
      name: 'express',
      version: '4.19.2',
      licenses: [{ license: { id: 'MIT' } }]
    },
    {
      'bom-ref': 'pkg:npm/body-parser@1.20.2',
      type: 'library',
      name: 'body-parser',
      version: '1.20.2',
      licenses: [{ license: { id: 'MIT' } }]
    },
    {
      'bom-ref': 'pkg:npm/qs@6.11.0',
      type: 'library',
      name: 'qs',
      version: '6.11.0',
      licenses: [{ license: { id: 'BSD-3-Clause' } }]
    },
    {
      'bom-ref': 'pkg:npm/gpl-logger@1.0.0',
      type: 'library',
      name: 'gpl-logger',
      version: '1.0.0',
      licenses: [{ license: { id: 'GPL-3.0-only' } }]
    }
  ],
  dependencies: [
    {
      ref: 'pkg:npm/sample-web-app@2.1.0',
      dependsOn: ['pkg:npm/express@4.19.2', 'pkg:npm/gpl-logger@1.0.0']
    },
    {
      ref: 'pkg:npm/express@4.19.2',
      dependsOn: ['pkg:npm/body-parser@1.20.2']
    },
    {
      ref: 'pkg:npm/body-parser@1.20.2',
      dependsOn: ['pkg:npm/qs@6.11.0']
    }
  ],
  vulnerabilities: [
    {
      id: 'CVE-2024-29018',
      ratings: [{ severity: 'high', score: 7.5 }],
      description: 'Polynomial time complexity in body-parser URL-encoded parser.',
      affects: [{ ref: 'pkg:npm/body-parser@1.20.2' }]
    }
  ]
});

const FALLBACK_PYTHON_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.4" version="1">
  <metadata>
    <component bom-ref="pkg:pypi/api-service@1.0.0" type="application">
      <name>api-service</name>
      <version>1.0.0</version>
    </component>
  </metadata>
  <components>
    <component bom-ref="pkg:pypi/fastapi@0.110.0" type="library">
      <name>fastapi</name>
      <version>0.110.0</version>
      <licenses><license><id>MIT</id></license></licenses>
    </component>
    <component bom-ref="pkg:pypi/pydantic@2.6.4" type="library">
      <name>pydantic</name>
      <version>2.6.4</version>
      <licenses><license><id>MIT</id></license></licenses>
    </component>
    <component bom-ref="pkg:pypi/starlette@0.36.3" type="library">
      <name>starlette</name>
      <version>0.36.3</version>
      <licenses><license><id>BSD-3-Clause</id></license></licenses>
    </component>
  </components>
  <dependencies>
    <dependency ref="pkg:pypi/api-service@1.0.0">
      <dependency ref="pkg:pypi/fastapi@0.110.0" />
    </dependency>
    <dependency ref="pkg:pypi/fastapi@0.110.0">
      <dependency ref="pkg:pypi/pydantic@2.6.4" />
      <dependency ref="pkg:pypi/starlette@0.36.3" />
    </dependency>
  </dependencies>
</bom>`;

export interface SampleLoaderProps {
  onLoaded?: () => void;
}

export const SampleLoader: React.FC<SampleLoaderProps> = ({ onLoaded }) => {
  const { setModel } = useScaStore();
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSample = async (samplePath: string, fileName: string, fallbackContent: string) => {
    try {
      setLoadingSample(fileName);
      setError(null);

      let content = '';
      try {
        const response = await fetch(samplePath);
        if (response.ok) {
          content = await response.text();
        } else {
          content = fallbackContent;
        }
      } catch {
        content = fallbackContent;
      }

      const normalized = parseAndNormalizeSbom(content, fileName);
      setModel(normalized);
      if (onLoaded) onLoaded();
    } catch (err: any) {
      console.error('Failed to load sample SBOM:', err);
      setError(`Erro ao carregar o exemplo "${fileName}": ${err?.message || 'Erro desconhecido'}`);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div data-testid="sample-loader" className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span>Ou experimente com um exemplo pré-configurado:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() =>
            loadSample(
              '/samples/sample-npm-cyclonedx.json',
              'sample-npm-cyclonedx.json',
              FALLBACK_NPM_SAMPLE
            )
          }
          disabled={loadingSample !== null}
          data-testid="sample-npm-button"
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/90 transition-all text-left group shadow-lg disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm group-hover:text-cyan-300 transition-colors">
                NPM App (JSON)
              </p>
              <p className="text-xs text-slate-400">Node.js, Express, Licenças & CVE</p>
            </div>
          </div>
          {loadingSample === 'sample-npm-cyclonedx.json' && (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            loadSample(
              '/samples/sample-python-cyclonedx.xml',
              'sample-python-cyclonedx.xml',
              FALLBACK_PYTHON_SAMPLE
            )
          }
          disabled={loadingSample !== null}
          data-testid="sample-python-button"
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all text-left group shadow-lg disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 group-hover:scale-105 transition-transform">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm group-hover:text-emerald-300 transition-colors">
                Python API (XML)
              </p>
              <p className="text-xs text-slate-400">FastAPI, Pydantic, Starlette</p>
            </div>
          </div>
          {loadingSample === 'sample-python-cyclonedx.xml' && (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-rose-400 bg-rose-950/40 border border-rose-800/80 px-3 py-2 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
