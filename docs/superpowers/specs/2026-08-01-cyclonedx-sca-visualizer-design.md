# 🛡️ CycloneDX SCA Visualizer & Dependency Tree Platform
## Specification & Architecture Design Document (SDD)

> **Date:** 2026-08-01  
> **Status:** Approved  
> **Architecture Pattern:** 100% Client-Side SPA (Privacy-First & Zero Server Persistence)  
> **Target Formats:** CycloneDX SBOM (JSON & XML, versions 1.2 to 1.6)

---

## 1. Executive Summary & Purpose

The **CycloneDX SCA Visualizer & Dependency Tree Platform** is a web-based Single Page Application (SPA) designed to parse Software Bill of Materials (SBOM) files in **CycloneDX JSON and XML** formats. 

Inspired by executive visualizers for security tools (such as Semgrep CLI Visualizer), this platform converts raw SBOM data into:
1. **C-Level Executive Security Dashboard**: A log-weighted SCA Health Rating (0–100 with Letter Grades A+ to F), OWASP Dependency / Supply Chain Risk indicators, and ROI Quick Wins.
2. **Hybrid 2D Graph & Hierarchical Tree Visualizer**: An interactive visual canvas powered by `@xyflow/react` and `@dagrejs/dagre` that displays the complete dependency topology, tracing direct vs. transitive libraries, license compliance tiers, and embedded vulnerability impact paths.
3. **100% Client-Side & Privacy-First Architecture**: All file parsing, XML entity sanitization, graph calculations, and UI rendering happen exclusively in the user's browser memory (RAM local). No source code or SBOM data is sent to any external server or cloud service.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      USER BROWSER (LOCAL RAM)                          │
│                                                                        │
│  ┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐ │
│  │ Upload Zone  │ ──> │ Fast XML / JSON     │ ──> │ Zod Schema      │ │
│  │ Drag & Drop  │     │ Parser Engine       │     │ Validator       │ │
│  └──────────────┘     └─────────────────────┘     └─────────────────┘ │
│                                                            │           │
│                                                            ▼           │
│                                                   ┌─────────────────┐  │
│                                                   │ Unified ScaStore│  │
│                                                   │ (Zustand)       │  │
│                                                   └─────────────────┘  │
│                                                            │           │
│       ┌──────────────────────┬─────────────────────────────┼───────────┤
│       ▼                      ▼                             ▼           │
│ ┌──────────────┐   ┌───────────────────┐        ┌──────────────────┐   │
│ │ Executive    │   │ Hybrid Tree &     │        │ License & CVE    │   │
│ │ Dashboard    │   │ Graph (React Flow)│        │ Explorer         │   │
│ └──────────────┘   └───────────────────┘        └──────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models & Normalization Engine

All ingested CycloneDX files (JSON or XML, versions 1.2 through 1.6) are validated and normalized into a unified TypeScript data structure:

```typescript
export interface ScaSbomModel {
  metadata: {
    componentName: string;
    componentVersion: string;
    specVersion: '1.2' | '1.3' | '1.4' | '1.5' | '1.6';
    format: 'json' | 'xml';
    timestamp?: string;
    tools?: string[];
  };
  components: Map<string, ScaComponent>; // keyed by bom-ref or purl
  dependenciesGraph: Map<string, string[]>; // bom-ref -> dependsOn bom-refs
  vulnerabilities: ScaVulnerability[];
  summary: {
    totalComponents: number;
    directComponentsCount: number;
    transitiveComponentsCount: number;
    maxTreeDepth: number;
    vulnerabilityCounts: { critical: number; high: number; medium: number; low: number };
    licenseBreakdown: { permissive: number; copyleft: number; unknown: number };
    scaHealthScore: number; // 0 to 100
    securityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  };
}

export interface ScaComponent {
  bomRef: string;
  name: string;
  version: string;
  purl?: string;
  group?: string;
  scope?: 'required' | 'optional' | 'excluded';
  isDirect: boolean;
  depth: number;
  licenses: ScaLicense[];
  vulnerabilities: ScaVulnerability[];
  ancestorRefs: string[]; // Path from root node to this package
}

export interface ScaLicense {
  id?: string;
  name: string;
  type: 'permissive' | 'copyleft' | 'unknown';
  url?: string;
}

export interface ScaVulnerability {
  id: string; // CVE-XXXX-XXXX or GHSA-XXXX-XXXX
  source?: string;
  description?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvssScore?: number;
  epssScore?: number;
  cwes?: number[];
  affectsBomRef: string;
  recommendation?: string;
}
```

---

## 4. Key Features & Components

### 4.1. Hybrid Dependency Tree & 2D Graph Visualizer
- **Interactive 2D Graph Engine**: `@xyflow/react` + `@dagrejs/dagre` for automated top-down or left-to-right hierarchical graph layout.
- **Custom React Nodes (`ScaNodeComponent`)**: Renders package name, version, direct vs transitive level tag, license risk badge (Green/Yellow/Red), and vulnerability counter badge.
- **Impact Path Tracing**: Clicking on any transitive node highlights the exact ancestor chain up to the direct dependency responsible for introducing it.
- **Collapsible File-Explorer Tree**: Accordion-style tree view with keyboard navigation and instant text filtering.

### 4.2. Executive Dashboard & Metrics
- **Logarithmic SCA Health Rating (0–100 & A+ to F)**:
  $$\text{CVE Penalty} = 15 \times \text{Crit} + 6 \times \text{High} + 2 \times \text{Med} + 0.5 \times \text{Low}$$
  $$\text{License Penalty} = 10 \times \text{Copyleft} + 2 \times \text{Unknown}$$
  $$\text{Score} = \max\left(0, 100 - \log_{1.15}(1 + \text{CVE Penalty} + \text{License Penalty})\right)$$
- **Grades**:
  - `95–100`: **Grade A+**
  - `85–94`: **Grade A**
  - `70–84`: **Grade B**
  - `50–69`: **Grade C**
  - `30–49`: **Grade D**
  - `0–29`: **Grade F**

- **Visual Analytics**: Recharts charts for Direct vs Transitive ratio, License Matrix (Permissive vs Copyleft), and Quick Wins remediation recommendations.

---

## 5. Security & Threat Model

1. **Server Security**: 0% Server attack surface. No file upload endpoints exist. Files stay in browser RAM.
2. **XXE Protection**: `fast-xml-parser` configured with `processEntities: false` and external DTD resolution completely disabled.
3. **Circular Dependency Safeguard**: Visited Set DFS traversal with explicit maximum recursion depth (`maxDepth = 32`) to prevent stack overflow or DoS on malformed/malicious SBOM graphs.
4. **XSS Sanitization**: DOMPurify sanitization applied to all text fields (component descriptions, CVE details) prior to rendering.

---

## 6. File Structure

```
cyclonedx-sca-visualizer/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, LanguageToggle, Modal, Badge
│   │   │   ├── dashboard/      # Health Rating, License Matrix, Supply Chain Depth, Quick Wins
│   │   │   ├── explorer/       # Component Explorer, Filter Bar, Package Detail Modal
│   │   │   ├── graph/          # React Flow Graph Canvas, Controls, Node Components, Path Tracer
│   │   │   ├── tree/           # Collapsible Tree View
│   │   │   └── landing/        # Dropzone & Sample SBOM Selector
│   │   ├── context/            # LanguageContext (PT-BR / EN-US)
│   │   ├── locales/            # pt-BR.json, en-US.json
│   │   ├── models/             # Types & Zod Schemas
│   │   ├── services/           # CycloneDX Parsers (JSON & XML), Normalizer, Score Calculator, Graph Layout
│   │   ├── store/              # Zustand Store
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── docs/
│   └── specs/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 7. Testing Strategy

- **Vitest Unit Tests**:
  - Test JSON CycloneDX parsing (v1.4, v1.5, v1.6).
  - Test XML CycloneDX parsing (v1.3, v1.4) via `fast-xml-parser`.
  - Test cycle detection algorithm on cyclic graphs (`A -> B -> A`).
  - Test score calculator and license risk categorization.
- **Component Tests**:
  - Test language toggle switching (PT-BR <-> EN-US).
  - Test component search filter in Tree and Explorer views.
