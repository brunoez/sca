# Task 2 Execution Report: Data Models, Zod Schemas & Normalizer Service

- **Task Name:** Task 2: Data Models, Zod Schemas & Normalizer Service
- **Date:** 2026-08-01
- **Status:** Completed
- **Commit:** `feat: add CycloneDX JSON/XML normalizer with graph cycle protection`

---

## 1. Summary of Work Delivered

### Data Models & Zod Schemas (`src/models/sca.ts`)
- Defined Zod schemas (`scaLicenseSchema`, `scaVulnerabilitySchema`, `scaComponentSchema`) and TypeScript interfaces (`ScaLicense`, `ScaVulnerability`, `ScaComponent`, `ScaSbomModel`).
- Models accurately capture root metadata, components map, direct/transitive flags, depth, ancestor paths, vulnerability lists, and executive summary metrics.

### Secure XML & JSON Parsers (`src/services/parsers/`)
- `xmlParser.ts`: Configured `fast-xml-parser` with `processEntities: false` to enforce security against XXE (XML External Entity) attacks.
- `jsonParser.ts`: Clean JSON deserialization wrapper.

### Normalizer Service (`src/services/normalizer.ts`)
- Created `parseAndNormalizeSbom(content: string, filename: string): ScaSbomModel`.
- Detects format (JSON vs. XML) automatically based on file extension and root content.
- Normalizes component lists, attributes (`bom-ref`, `@_bom-ref`, `purl`, group, version), licenses (categorizing into `permissive`, `copyleft`, `unknown`), and vulnerabilities.
- **Graph Cycle Protection & Depth Calculation**:
  - Implemented DFS graph traversal starting from the root component (`rootRef`).
  - Uses a per-path `visited` set and caps recursion at `maxDepth = 32`.
  - Prevents infinite loops when traversing circular graph relationships (e.g., `A -> B -> A`).
  - Correctly computes component `depth`, flags direct vs. transitive dependencies (`isDirect`), and tracks `ancestorRefs`.

### Unit Test Suite (`src/services/__tests__/normalizer.test.ts`)
- Written using **Vitest** following the **AAA (Arrange, Act, Assert)** pattern.
- Test Cases Covered:
  1. Valid CycloneDX JSON parsing and depth/ancestor calculation.
  2. Cyclic dependency graph resilience without stack overflow or infinite loops.
  3. Secure CycloneDX XML parsing with attribute normalization.
  4. Vulnerability extraction and attachment to target affected components.
  5. License categorization (permissive vs. copyleft vs. unknown).

---

## 2. Verification Checklist

- [x] `src/models/sca.ts` created with Zod schemas and TypeScript types
- [x] `src/services/normalizer.ts` created with `parseAndNormalizeSbom`
- [x] XML parser configured with `processEntities: false` (XXE mitigation)
- [x] Graph cycle protection implemented via DFS with visited set and maxDepth=32
- [x] `src/services/__tests__/normalizer.test.ts` created with AAA pattern
- [x] Git commit executed: `git add src/ && git commit -m "feat: add CycloneDX JSON/XML normalizer with graph cycle protection"`
