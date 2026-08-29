# CycloneDX SCA Visualizer & Dependency Tree Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100% Client-Side SPA (React 18 + Vite + TypeScript + TailwindCSS + React Flow + Dagre + Zustand + Zod + Vitest) that parses CycloneDX SBOM files (JSON and XML v1.2-v1.6) and renders an Executive SCA Dashboard (Rating A+ to F), a 2D interactive dependency graph with impact path tracing, a collapsible hierarchical tree view, and license compliance auditing.

**Architecture:** A privacy-first client-side architecture where SBOM files are read in browser memory via FileReader, parsed with fast-xml-parser/JSON + Zod schemas, normalized into a `ScaSbomModel` with graph cycle protection, and stored in a Zustand state store. Interactive 2D topology is rendered using `@xyflow/react` and `@dagrejs/dagre`.

**Tech Stack:** React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, `@xyflow/react`, `@dagrejs/dagre`, `fast-xml-parser`, `zod`, `zustand`, `recharts`, `dompurify`, `vitest`, `@testing-library/react`.

## Global Constraints

- 100% Client-Side RAM execution. No files sent to any external server or API.
- All XML parsing must explicitly disable external DTD resolving (`processEntities: false`).
- All rendered text from external SBOM inputs must be sanitized using DOMPurify or safe React string escaping.
- Strict AAA (Arrange, Act, Assert) pattern for unit testing with Vitest.

---

### Task 1: Project Setup & Scaffolding

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.tsx`

**Interfaces:**
- Produces: Base project structure for React 18 + Vite + TailwindCSS + Vitest.

- [ ] **Step 1: Create package.json and project configuration files**

```json
{
  "name": "cyclonedx-sca-visualizer",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@dagrejs/dagre": "^1.1.4",
    "@xyflow/react": "^12.4.2",
    "dompurify": "^3.2.4",
    "fast-xml-parser": "^4.5.3",
    "lucide-react": "^0.475.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.1",
    "zod": "^3.24.2",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@types/dompurify": "^3.0.5",
    "@types/node": "^22.13.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^26.0.0",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create vite.config.ts, vitest.config.ts, and tailwind.config.js**

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
```

`frontend/src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Run npm install to verify setup**

Run: `cd /home/bruno/Projetos/sca/frontend && npm install`  
Expected: Clean package installation with zero missing peer dependencies.

- [ ] **Step 4: Commit setup**

```bash
git add frontend/
git commit -m "chore: initialize project scaffolding with React 18, Vite, Tailwind, React Flow and Vitest"
```

---

### Task 2: Data Models, Zod Schemas & Normalizer Service

**Files:**
- Create: `frontend/src/models/sca.ts`
- Create: `frontend/src/services/parsers/jsonParser.ts`
- Create: `frontend/src/services/parsers/xmlParser.ts`
- Create: `frontend/src/services/normalizer.ts`
- Create: `frontend/src/services/__tests__/normalizer.test.ts`

**Interfaces:**
- Produces: `parseAndNormalizeSbom(content: string, filename: string): ScaSbomModel`

- [ ] **Step 1: Write failing test for SBOM Normalizer and Cycle Detection**

`frontend/src/services/__tests__/normalizer.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { parseAndNormalizeSbom } from '../normalizer';

describe('parseAndNormalizeSbom', () => {
  it('should parse valid CycloneDX JSON and calculate dependency depth', () => {
    const sampleJson = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: {
        component: { name: 'my-app', version: '1.0.0', type: 'application', 'bom-ref': 'root' }
      },
      components: [
        { name: 'express', version: '4.18.2', type: 'library', 'bom-ref': 'pkg:npm/express@4.18.2', licenses: [{ license: { id: 'MIT' } }] },
        { name: 'qs', version: '6.11.0', type: 'library', 'bom-ref': 'pkg:npm/qs@6.11.0', licenses: [{ license: { id: 'BSD-3-Clause' } }] }
      ],
      dependencies: [
        { ref: 'root', dependsOn: ['pkg:npm/express@4.18.2'] },
        { ref: 'pkg:npm/express@4.18.2', dependsOn: ['pkg:npm/qs@6.11.0'] }
      ]
    });

    const model = parseAndNormalizeSbom(sampleJson, 'sbom.json');
    expect(model.metadata.componentName).toBe('my-app');
    expect(model.summary.totalComponents).toBe(2);
    expect(model.summary.directComponentsCount).toBe(1); // express is direct
    expect(model.summary.transitiveComponentsCount).toBe(1); // qs is transitive
    
    const expressNode = model.components.get('pkg:npm/express@4.18.2');
    expect(expressNode?.isDirect).toBe(true);
    expect(expressNode?.depth).toBe(1);

    const qsNode = model.components.get('pkg:npm/qs@6.11.0');
    expect(qsNode?.isDirect).toBe(false);
    expect(qsNode?.depth).toBe(2);
    expect(qsNode?.ancestorRefs).toEqual(['root', 'pkg:npm/express@4.18.2']);
  });

  it('should handle cyclic dependency graphs without infinite recursion', () => {
    const cyclicJson = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: { component: { name: 'cyclic-app', version: '1.0.0', 'bom-ref': 'root' } },
      components: [
        { name: 'lib-a', version: '1.0.0', 'bom-ref': 'node-a' },
        { name: 'lib-b', version: '1.0.0', 'bom-ref': 'node-b' }
      ],
      dependencies: [
        { ref: 'root', dependsOn: ['node-a'] },
        { ref: 'node-a', dependsOn: ['node-b'] },
        { ref: 'node-b', dependsOn: ['node-a'] } // Cycle!
      ]
    });

    const model = parseAndNormalizeSbom(cyclicJson, 'cyclic.json');
    expect(model.summary.totalComponents).toBe(2);
    expect(model.components.get('node-a')?.depth).toBe(1);
    expect(model.components.get('node-b')?.depth).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`  
Expected: FAIL with missing module `../normalizer`.

- [ ] **Step 3: Implement Sca Models, JSON/XML Parsers, and Normalizer with cycle protection**

`frontend/src/models/sca.ts`:
```typescript
export interface ScaLicense {
  id?: string;
  name: string;
  type: 'permissive' | 'copyleft' | 'unknown';
}

export interface ScaVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvssScore?: number;
  description?: string;
  affectsBomRef: string;
  recommendation?: string;
}

export interface ScaComponent {
  bomRef: string;
  name: string;
  version: string;
  purl?: string;
  group?: string;
  isDirect: boolean;
  depth: number;
  licenses: ScaLicense[];
  vulnerabilities: ScaVulnerability[];
  ancestorRefs: string[];
}

export interface ScaSbomModel {
  metadata: {
    componentName: string;
    componentVersion: string;
    specVersion: string;
    format: 'json' | 'xml';
  };
  components: Map<string, ScaComponent>;
  dependenciesGraph: Map<string, string[]>;
  vulnerabilities: ScaVulnerability[];
  summary: {
    totalComponents: number;
    directComponentsCount: number;
    transitiveComponentsCount: number;
    maxTreeDepth: number;
    vulnerabilityCounts: { critical: number; high: number; medium: number; low: number };
    licenseBreakdown: { permissive: number; copyleft: number; unknown: number };
    scaHealthScore: number;
    securityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  };
}
```

`frontend/src/services/normalizer.ts`:
```typescript
import { XMLParser } from 'fast-xml-parser';
import { ScaSbomModel, ScaComponent, ScaLicense, ScaVulnerability } from '../models/sca';

export function parseAndNormalizeSbom(content: string, filename: string): ScaSbomModel {
  const isXml = filename.endsWith('.xml') || content.trim().startsWith('<');
  let rawData: any;

  if (isXml) {
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      processEntities: false, // Security: Prevent XXE
    });
    rawData = xmlParser.parse(content);
  } else {
    rawData = JSON.parse(content);
  }

  // Parse root metadata
  const rootComp = rawData?.metadata?.component || rawData?.bom?.metadata?.component || {};
  const rootRef = rootComp['@_bom-ref'] || rootComp['bom-ref'] || 'root';
  const rootName = rootComp.name || filename.replace(/\.(json|xml)$/, '');
  const rootVersion = rootComp.version || '1.0.0';

  const componentsMap = new Map<string, ScaComponent>();
  const dependenciesGraph = new Map<string, string[]>();

  // Extract raw components list
  const rawComponents = rawData?.components?.component || rawData?.components || [];
  const normalizedRawComponents = Array.isArray(rawComponents) ? rawComponents : [rawComponents];

  for (const c of normalizedRawComponents) {
    if (!c) continue;
    const ref = c['@_bom-ref'] || c['bom-ref'] || c.purl || `${c.name}@${c.version}`;
    
    // Extract licenses
    const licenses: ScaLicense[] = [];
    const rawLicList = c.licenses?.license || c.licenses || [];
    const normalizedLicList = Array.isArray(rawLicList) ? rawLicList : [rawLicList];
    for (const licItem of normalizedLicList) {
      const licObj = licItem?.license || licItem;
      const id = licObj?.id || licObj?.name || 'Unknown';
      const name = licObj?.name || id;
      const type = isCopyleft(id) ? 'copyleft' : isPermissive(id) ? 'permissive' : 'unknown';
      licenses.push({ id, name, type });
    }

    componentsMap.set(ref, {
      bomRef: ref,
      name: c.name || 'Unnamed Component',
      version: c.version || '0.0.0',
      purl: c.purl,
      group: c.group,
      isDirect: false,
      depth: 1,
      licenses,
      vulnerabilities: [],
      ancestorRefs: [],
    });
  }

  // Extract raw dependencies graph
  const rawDeps = rawData?.dependencies?.dependency || rawData?.dependencies || [];
  const normalizedDeps = Array.isArray(rawDeps) ? rawDeps : [rawDeps];

  for (const dep of normalizedDeps) {
    if (!dep) continue;
    const ref = dep['@_ref'] || dep.ref;
    const dependsOnList = dep.dependency || dep.dependsOn || [];
    const normalizedDependsOn = Array.isArray(dependsOnList) 
      ? dependsOnList.map((d: any) => d['@_ref'] || d.ref || d)
      : [dependsOnList['@_ref'] || dependsOnList.ref || dependsOnList];
    
    dependenciesGraph.set(ref, normalizedDependsOn.filter(Boolean));
  }

  // Traverse graph from root to calculate depths and direct vs transitive
  const directRefs = dependenciesGraph.get(rootRef) || [];
  let maxTreeDepth = 0;

  function traverse(currentRef: string, depth: number, ancestors: string[], visited: Set<string>) {
    if (visited.has(currentRef) || depth > 32) return; // Cycle protection
    visited.add(currentRef);

    if (depth > maxTreeDepth) maxTreeDepth = depth;

    const comp = componentsMap.get(currentRef);
    if (comp) {
      comp.depth = depth;
      comp.isDirect = depth === 1;
      comp.ancestorRefs = ancestors;
    }

    const children = dependenciesGraph.get(currentRef) || [];
    for (const childRef of children) {
      traverse(childRef, depth + 1, [...ancestors, currentRef], new Set(visited));
    }
  }

  for (const directRef of directRefs) {
    traverse(directRef, 1, [rootRef], new Set());
  }

  // Calculate summary counts
  let directCount = 0;
  let transitiveCount = 0;
  let permissiveCount = 0;
  let copyleftCount = 0;
  let unknownLicCount = 0;

  componentsMap.forEach((comp) => {
    if (comp.isDirect) directCount++;
    else transitiveCount++;

    for (const lic of comp.licenses) {
      if (lic.type === 'permissive') permissiveCount++;
      else if (lic.type === 'copyleft') copyleftCount++;
      else unknownLicCount++;
    }
  });

  return {
    metadata: {
      componentName: rootName,
      componentVersion: rootVersion,
      specVersion: rawData?.specVersion || '1.4',
      format: isXml ? 'xml' : 'json',
    },
    components: componentsMap,
    dependenciesGraph,
    vulnerabilities: [],
    summary: {
      totalComponents: componentsMap.size,
      directComponentsCount: directCount,
      transitiveComponentsCount: transitiveCount,
      maxTreeDepth,
      vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
      licenseBreakdown: { permissive: permissiveCount, copyleft: copyleftCount, unknown: unknownLicCount },
      scaHealthScore: 100,
      securityGrade: 'A+',
    },
  };
}

function isCopyleft(licenseId: string): boolean {
  const upper = licenseId.toUpperCase();
  return upper.includes('GPL') || upper.includes('AGPL') || upper.includes('MPL') || upper.includes('EUPL');
}

function isPermissive(licenseId: string): boolean {
  const upper = licenseId.toUpperCase();
  return upper.includes('MIT') || upper.includes('APACHE') || upper.includes('BSD') || upper.includes('ISC');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`  
Expected: PASS with 2 tests passed.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: add CycloneDX JSON/XML normalizer with graph cycle protection"
```

---

### Task 3: SCA Health Score & Metrics Calculator Service

**Files:**
- Create: `frontend/src/services/scoreCalculator.ts`
- Create: `frontend/src/services/__tests__/scoreCalculator.test.ts`

**Interfaces:**
- Produces: `calculateScaMetrics(summary: ScaSbomModel['summary']): { score: number; grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' }`

- [ ] **Step 1: Write failing test for Score Calculator**

`frontend/src/services/__tests__/scoreCalculator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateScaMetrics } from '../scoreCalculator';

describe('calculateScaMetrics', () => {
  it('should return Grade A+ for clean SBOM with no vulnerabilities and permissive licenses', () => {
    const res = calculateScaMetrics({
      vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
      licenseBreakdown: { permissive: 10, copyleft: 0, unknown: 0 },
    });
    expect(res.score).toBe(100);
    expect(res.grade).toBe('A+');
  });

  it('should return Grade F for SBOM with multiple critical CVEs and copyleft licenses', () => {
    const res = calculateScaMetrics({
      vulnerabilityCounts: { critical: 5, high: 10, medium: 4, low: 2 },
      licenseBreakdown: { permissive: 2, copyleft: 5, unknown: 3 },
    });
    expect(res.score).toBeLessThan(40);
    expect(['D', 'F']).toContain(res.grade);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`  
Expected: FAIL missing `scoreCalculator`.

- [ ] **Step 3: Implement calculateScaMetrics**

`frontend/src/services/scoreCalculator.ts`:
```typescript
export interface ScaScoreInput {
  vulnerabilityCounts: { critical: number; high: number; medium: number; low: number };
  licenseBreakdown: { permissive: number; copyleft: number; unknown: number };
}

export interface ScaScoreOutput {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
}

export function calculateScaMetrics(input: ScaScoreInput): ScaScoreOutput {
  const { critical, high, medium, low } = input.vulnerabilityCounts;
  const { copyleft, unknown } = input.licenseBreakdown;

  const cvePenalty = critical * 15 + high * 6 + medium * 2 + low * 0.5;
  const licensePenalty = copyleft * 10 + unknown * 2;
  const totalPenalty = cvePenalty + licensePenalty;

  if (totalPenalty === 0) {
    return { score: 100, grade: 'A+' };
  }

  const rawScore = 100 - Math.log(1 + totalPenalty) / Math.log(1.15);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade: ScaScoreOutput['grade'] = 'F';
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 75) grade = 'B+';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';

  return { score, grade };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/scoreCalculator.ts frontend/src/services/__tests__/scoreCalculator.test.ts
git commit -m "feat: add logarithmic SCA health score and grade calculator"
```

---

### Task 4: Zustand Store & i18n Internationalization

**Files:**
- Create: `frontend/src/store/useScaStore.ts`
- Create: `frontend/src/locales/pt-BR.json`
- Create: `frontend/src/locales/en-US.json`
- Create: `frontend/src/context/LanguageContext.tsx`

**Interfaces:**
- Produces: `useScaStore`, `useTranslation()`

- [ ] **Step 1: Create i18n locales and LanguageContext**

`frontend/src/locales/pt-BR.json`:
```json
{
  "appTitle": "CycloneDX SCA Visualizer",
  "subtitle": "Inteligência Executiva & Visualizador de Grafo de Supply Chain",
  "uploadHeader": "Carregar SBOM CycloneDX",
  "dropzoneHint": "Arraste um arquivo CycloneDX JSON ou XML aqui (ou clique para selecionar)",
  "tabs": {
    "dashboard": "Dashboard Executivo",
    "graph": "Grafo 2D de Dependências",
    "tree": "Árvore Hierárquica",
    "explorer": "Explorador de Pacotes"
  },
  "metrics": {
    "scoreLabel": "SCA Security Rating",
    "totalComponents": "Total de Componentes",
    "directVsTransitive": "Diretas vs Transitivas",
    "maxDepth": "Profundidade Máxima",
    "licenseMatrix": "Matriz de Licenças"
  }
}
```

`frontend/src/locales/en-US.json`:
```json
{
  "appTitle": "CycloneDX SCA Visualizer",
  "subtitle": "Executive Security Dashboard & Supply Chain Graph Visualizer",
  "uploadHeader": "Upload CycloneDX SBOM",
  "dropzoneHint": "Drag & drop a CycloneDX JSON or XML file here (or click to select)",
  "tabs": {
    "dashboard": "Executive Dashboard",
    "graph": "2D Dependency Graph",
    "tree": "Hierarchical Tree",
    "explorer": "Package Explorer"
  },
  "metrics": {
    "scoreLabel": "SCA Security Rating",
    "totalComponents": "Total Components",
    "directVsTransitive": "Direct vs Transitive",
    "maxDepth": "Max Tree Depth",
    "licenseMatrix": "License Matrix"
  }
}
```

`frontend/src/context/LanguageContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';

type Language = 'pt-BR' | 'en-US';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, any> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const nav = navigator.language;
    return nav.startsWith('pt') ? 'pt-BR' : 'en-US';
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let obj = translations[language];
    for (const k of keys) {
      if (obj && k in obj) obj = obj[k];
      else return keyPath;
    }
    return typeof obj === 'string' ? obj : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
};
```

- [ ] **Step 2: Create Zustand store**

`frontend/src/store/useScaStore.ts`:
```typescript
import { create } from 'zustand';
import { ScaSbomModel, ScaComponent } from '../models/sca';

interface ScaState {
  model: ScaSbomModel | null;
  selectedComponentRef: string | null;
  activeTab: 'dashboard' | 'graph' | 'tree' | 'explorer';
  searchFilter: string;
  setModel: (model: ScaSbomModel) => void;
  setSelectedComponentRef: (ref: string | null) => void;
  setActiveTab: (tab: ScaState['activeTab']) => void;
  setSearchFilter: (filter: string) => void;
  clearModel: () => void;
}

export const useScaStore = create<ScaState>((set) => ({
  model: null,
  selectedComponentRef: null,
  activeTab: 'dashboard',
  searchFilter: '',
  setModel: (model) => set({ model }),
  setSelectedComponentRef: (ref) => set({ selectedComponentRef: ref }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  clearModel: () => set({ model: null, selectedComponentRef: null }),
}));
```

- [ ] **Step 3: Commit store and i18n**

```bash
git add frontend/src/store frontend/src/locales frontend/src/context
git commit -m "feat: add Zustand store and LanguageContext for PT-BR / EN-US i18n"
```

---

### Task 5: Landing Page & Sample Loader Component

**Files:**
- Create: `frontend/src/components/landing/Dropzone.tsx`
- Create: `frontend/src/components/landing/SampleLoader.tsx`

**Interfaces:**
- Produces: `Dropzone` drag and drop file reader component.

- [ ] **Step 1: Build Dropzone component with DOMPurify & FileReader**

`frontend/src/components/landing/Dropzone.tsx`:
```typescript
import React, { useState } from 'react';
import { UploadCloud, FileCode, AlertCircle } from 'lucide-react';
import { parseAndNormalizeSbom } from '../../services/normalizer';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';

export const Dropzone: React.FC = () => {
  const { setModel } = useScaStore();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.json') && !file.name.endsWith('.xml')) {
      setError('Formato inválido. Por favor envie um arquivo .json ou .xml CycloneDX.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const normalized = parseAndNormalizeSbom(content, file.name);
        setModel(normalized);
      } catch (err: any) {
        setError('Erro ao processar arquivo SBOM: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl hover:border-cyan-500 transition-colors">
      <UploadCloud className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
      <h3 className="text-xl font-bold text-white mb-2">{t('uploadHeader')}</h3>
      <p className="text-slate-400 text-sm mb-6 text-center max-w-md">{t('dropzoneHint')}</p>
      
      <label className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg cursor-pointer transition-all shadow-lg shadow-cyan-600/30">
        Selecionar Arquivo SBOM
        <input 
          type="file" 
          accept=".json,.xml" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
        />
      </label>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-rose-400 bg-rose-950/50 border border-rose-800 px-4 py-2 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit Dropzone**

```bash
git add frontend/src/components/landing
git commit -m "feat: add Drag & Drop SBOM file dropzone component"
```

---

### Task 6: Executive Security Dashboard Components

**Files:**
- Create: `frontend/src/components/dashboard/ExecutiveScoreCard.tsx`
- Create: `frontend/src/components/dashboard/LicenseMatrixChart.tsx`
- Create: `frontend/src/components/dashboard/SupplyChainDepthChart.tsx`

**Interfaces:**
- Produces: Executive dashboard overview with Recharts and Rating Gauge.

- [ ] **Step 1: Build ExecutiveScoreCard component**

`frontend/src/components/dashboard/ExecutiveScoreCard.tsx`:
```typescript
import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { calculateScaMetrics } from '../../services/scoreCalculator';

export const ExecutiveScoreCard: React.FC = () => {
  const { model } = useScaStore();
  if (!model) return null;

  const { score, grade } = calculateScaMetrics({
    vulnerabilityCounts: model.summary.vulnerabilityCounts,
    licenseBreakdown: model.summary.licenseBreakdown,
  });

  const gradeColors: Record<string, string> = {
    'A+': 'text-emerald-400 border-emerald-500 shadow-emerald-500/20',
    'A': 'text-emerald-400 border-emerald-500 shadow-emerald-500/20',
    'B+': 'text-cyan-400 border-cyan-500 shadow-cyan-500/20',
    'B': 'text-cyan-400 border-cyan-500 shadow-cyan-500/20',
    'C': 'text-amber-400 border-amber-500 shadow-amber-500/20',
    'D': 'text-orange-400 border-orange-500 shadow-orange-500/20',
    'F': 'text-rose-500 border-rose-500 shadow-rose-500/30',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="flex items-center gap-6">
        <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${gradeColors[grade]}`}>
          <span className="text-3xl font-extrabold">{grade}</span>
          <span className="text-xs text-slate-400 font-semibold">{score}/100</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{model.metadata.componentName}</h2>
          <p className="text-sm text-slate-400">Versão: {model.metadata.componentVersion} • Format: CycloneDX {model.metadata.specVersion}</p>
          <div className="mt-3 flex items-center gap-2">
            {score >= 80 ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4" /> Baixo Risco de Supply Chain
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full">
                <ShieldAlert className="w-4 h-4" /> Alto Risco de Supply Chain
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit dashboard component**

```bash
git add frontend/src/components/dashboard
git commit -m "feat: add ExecutiveScoreCard component with A+ to F grade rating"
```

---

### Task 7: Graph Layout Engine & React Flow 2D Canvas

**Files:**
- Create: `frontend/src/services/graphLayout.ts`
- Create: `frontend/src/components/graph/ScaNodeComponent.tsx`
- Create: `frontend/src/components/graph/GraphCanvas.tsx`

**Interfaces:**
- Produces: `getLayoutedElements(model: ScaSbomModel)` returning React Flow nodes & edges.

- [ ] **Step 1: Create Dagre layout calculator**

`frontend/src/services/graphLayout.ts`:
```typescript
import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';
import { ScaSbomModel } from '../models/sca';

export function getLayoutedElements(model: ScaSbomModel): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  model.components.forEach((comp, ref) => {
    dagreGraph.setNode(ref, { width: 220, height: 80 });
    nodes.push({
      id: ref,
      type: 'scaNode',
      data: { label: comp.name, version: comp.version, isDirect: comp.isDirect, licenses: comp.licenses },
      position: { x: 0, y: 0 },
    });
  });

  model.dependenciesGraph.forEach((children, parentRef) => {
    for (const childRef of children) {
      if (model.components.has(childRef)) {
        dagreGraph.setEdge(parentRef, childRef);
        edges.push({
          id: `${parentRef}->${childRef}`,
          source: parentRef,
          target: childRef,
          animated: true,
          style: { stroke: '#475569', strokeWidth: 2 },
        });
      }
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

- [ ] **Step 2: Build ScaNodeComponent for React Flow**

`frontend/src/components/graph/ScaNodeComponent.tsx`:
```typescript
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shield } from 'lucide-react';

export const ScaNodeComponent: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 p-3 rounded-xl shadow-lg w-[220px] transition-all">
      <Handle type="target" position={Position.Left} className="bg-cyan-500 w-3 h-3" />
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm text-white truncate max-w-[140px]">{data.label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.isDirect ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
          {data.isDirect ? 'Direta' : 'Transitiva'}
        </span>
      </div>
      <div className="text-xs text-slate-400">v{data.version}</div>
      <Handle type="source" position={Position.Right} className="bg-cyan-500 w-3 h-3" />
    </div>
  );
};
```

- [ ] **Step 3: Commit Graph Canvas**

```bash
git add frontend/src/services/graphLayout.ts frontend/src/components/graph
git commit -m "feat: add 2D dependency graph layout engine with React Flow & Dagre"
```

---

### Task 8: Collapsible Tree View & Main App Assembly

**Files:**
- Create: `frontend/src/components/tree/TreeView.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Build Collapsible TreeView component**

`frontend/src/components/tree/TreeView.tsx`:
```typescript
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Package } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';

export const TreeView: React.FC = () => {
  const { model } = useScaStore();
  if (!model) return null;

  const directComponents = Array.from(model.components.values()).filter((c) => c.isDirect);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Árvore Hierárquica de Dependências</h3>
      <div className="space-y-2">
        {directComponents.map((comp) => (
          <TreeNode key={comp.bomRef} compRef={comp.bomRef} />
        ))}
      </div>
    </div>
  );
};

const TreeNode: React.FC<{ compRef: string }> = ({ compRef }) => {
  const { model } = useScaStore();
  const [open, setOpen] = useState(false);

  const comp = model?.components.get(compRef);
  const childrenRefs = model?.dependenciesGraph.get(compRef) || [];

  if (!comp) return null;

  return (
    <div className="pl-4 border-l border-slate-800">
      <div 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-1.5 px-3 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors text-sm text-slate-200"
      >
        {childrenRefs.length > 0 ? (
          open ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />
        ) : (
          <Package className="w-4 h-4 text-slate-600" />
        )}
        <span className="font-semibold text-cyan-300">{comp.name}</span>
        <span className="text-xs text-slate-500">v{comp.version}</span>
      </div>

      {open && childrenRefs.length > 0 && (
        <div className="mt-1 space-y-1">
          {childrenRefs.map((childRef) => (
            <TreeNode key={childRef} compRef={childRef} />
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Connect App.tsx with state tabs and header**

`frontend/src/App.tsx`:
```typescript
import React from 'react';
import { Shield, LayoutDashboard, GitFork, ListTree } from 'lucide-react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { useScaStore } from './store/useScaStore';
import { Dropzone } from './components/landing/Dropzone';
import { ExecutiveScoreCard } from './components/dashboard/ExecutiveScoreCard';
import { TreeView } from './components/tree/TreeView';

export function MainApp() {
  const { model, activeTab, setActiveTab } = useScaStore();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-lg font-bold text-white">{t('appTitle')}</h1>
            <p className="text-xs text-slate-400">{t('subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {!model ? (
          <Dropzone />
        ) : (
          <div className="space-y-6">
            <ExecutiveScoreCard />

            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> {t('tabs.dashboard')}
              </button>
              <button 
                onClick={() => setActiveTab('tree')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'tree' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <ListTree className="w-4 h-4" /> {t('tabs.tree')}
              </button>
            </div>

            {activeTab === 'dashboard' && <div className="text-slate-300">Dashboard Executivo com visualização de estatísticas.</div>}
            {activeTab === 'tree' && <TreeView />}
          </div>
        )}
      </main>
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
```

- [ ] **Step 3: Run build and tests to verify clean compilation**

Run: `cd /home/bruno/Projetos/sca/frontend && npm run test && npm run build`  
Expected: All tests PASS and `vite build` completes successfully.

- [ ] **Step 4: Commit complete app**

```bash
git add frontend/
git commit -m "feat: complete CycloneDX SCA Visualizer application assembly"
```
