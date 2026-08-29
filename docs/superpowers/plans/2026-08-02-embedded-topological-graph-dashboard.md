# Embedded 2D Topological Navigator in Executive Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed the interactive 2D Topological Graph Navigator into the Executive Security Dashboard directly between the Executive Score Card (SCA Health Rating & CVE Breakdown) and the Analytics Grid (License Matrix & Supply Chain Depth), while preserving its presence on the dedicated "Grafo 2D de Dependências" tab.

**Architecture:** Render the reusable `<GraphCanvas />` component directly inside `ExecutiveDashboard.tsx` between `ExecutiveScoreCard` and the `LicenseMatrixChart` / `SupplyChainDepthChart` grid. Update unit and E2E integration tests to verify graph rendering in both views and maintain 100% test coverage.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, React Flow (`@xyflow/react`), Dagre (`@dagrejs/dagre`), Zustand (`useScaStore`), Vitest, Testing Library.

## Global Constraints

- Preserve `GraphCanvas` functionality on the dedicated "Grafo 2D de Dependências" tab (`activeTab === 'graph'`).
- Ensure no layout shift or duplicate element ID conflicts when `GraphCanvas` is rendered.
- Maintain 100% test passage across all 13 Vitest test suites (67+ tests).

---

### Task 1: Embed GraphCanvas into ExecutiveDashboard Layout

**Files:**
- Modify: `frontend/src/components/dashboard/ExecutiveDashboard.tsx:1-60`
- Test: `frontend/src/components/dashboard/__tests__/ExecutiveDashboard.test.tsx`

**Interfaces:**
- Consumes: `GraphCanvas` component from `../graph/GraphCanvas`
- Produces: Updated `ExecutiveDashboard` layout containing the embedded 2D topological graph navigator between the score card and analytics charts.

- [ ] **Step 1: Write the failing test for embedded graph canvas in ExecutiveDashboard**

Open `frontend/src/components/dashboard/__tests__/ExecutiveDashboard.test.tsx` and add a test verifying that `graph-canvas-container` is present within the rendered Executive Dashboard:

```tsx
it('should render embedded 2D topological graph navigator between score card and analytics charts', () => {
  const model = parseAndNormalizeSbom(sampleSbomJson, 'sample.json');
  useScaStore.getState().setModel(model);

  renderWithProviders(<ExecutiveDashboard />);

  expect(screen.getByTestId('executive-score-card')).toBeInTheDocument();
  expect(screen.getByTestId('graph-canvas-container')).toBeInTheDocument();
  expect(screen.getByTestId('license-matrix-chart')).toBeInTheDocument();
  expect(screen.getByTestId('supply-chain-depth-chart')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- --run`
Expected: FAIL due to missing `graph-canvas-container` in `ExecutiveDashboard`.

- [ ] **Step 3: Implement minimal code to embed GraphCanvas in ExecutiveDashboard**

Update `frontend/src/components/dashboard/ExecutiveDashboard.tsx`:

```tsx
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
            Carregar Outro SBOM
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/dashboard/ExecutiveDashboard.tsx frontend/src/components/dashboard/__tests__/ExecutiveDashboard.test.tsx
git commit -m "feat: embed 2D topological graph navigator in Executive Dashboard layout"
```

---

### Task 2: Verify End-to-End Integration and Dual Graph Access

**Files:**
- Modify: `frontend/src/__tests__/AppIntegration.test.tsx`

**Interfaces:**
- Consumes: `App` component
- Produces: E2E test confirmation that graph is visible in Executive Dashboard tab AND in the dedicated Graph tab.

- [ ] **Step 1: Write integration test for dual graph accessibility**

In `frontend/src/__tests__/AppIntegration.test.tsx`, add an integration test case:

```tsx
it('should display 2D graph canvas in both Executive Dashboard and dedicated Graph tab', () => {
  const model = parseAndNormalizeSbom(sampleSbomJson, 'sample.json');
  useScaStore.getState().setModel(model);

  render(<App />);

  // 1. In Executive Dashboard tab
  expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
  expect(screen.getByTestId('graph-canvas-container')).toBeInTheDocument();

  // 2. In dedicated Graph tab
  fireEvent.click(screen.getByTestId('tab-graph'));
  expect(screen.getByTestId('graph-canvas-container')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test suite**

Run: `npm run test -- --run`
Expected: PASS across all 13 test files.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/__tests__/AppIntegration.test.tsx
git commit -m "test: add dual graph canvas accessibility integration test"
```
