# Task 3 Report: SCA Health Score & Metrics Calculator Service

**Execution Status:** Completed Successfully  
**Date:** 2026-08-01  
**Target Folder:** `frontend/src/services`

---

## 🎯 Task Objectives

1. **Logarithmic SCA Health Score Calculation (`calculateScaMetrics`)**:
   - Compute a normalized score (0 - 100) and security grade (`A+`, `A`, `B+`, `B`, `C`, `D`, `F`).
   - Weighted penalties:
     - **Vulnerabilities:** Critical (15), High (6), Medium (2), Low (0.5).
     - **Risk Licenses:** Copyleft (10), Unknown (2).
   - Logarithmic decay formula:
     $$\text{rawScore} = 100 - \ln(1 + \text{totalPenalty}) \times 11$$
     $$\text{score} = \max(0, \min(100, \text{round}(\text{rawScore})))$$

2. **Quick Wins Calculator (`calculateQuickWins`)**:
   - Analyzes direct dependencies (`depth = 1` or `isDirect === true`).
   - Traverses the downstream graph (`dependenciesGraph`) to identify transitive dependencies.
   - Calculates aggregated transitive CVEs per direct dependency.
   - Generates prioritized update recommendations ranked by impact score and transitive vulnerability count.

3. **Vitest Unit Test Suite (`scoreCalculator.test.ts`)**:
   - Formatted strictly according to the **Arrange-Act-Assert (AAA)** pattern.
   - Includes tests for clean SBOMs (Grade A+), minor low-risk SBOMs (Grade A), highly vulnerable SBOMs (Grade F), boundary constraints (0 <= score <= 100), empty vulnerability lists, and transitive Quick Wins detection.

---

## 🛠️ Created / Modified Files

| File Path | Description |
|-----------|-------------|
| [scoreCalculator.ts](file:///home/bruno/Projetos/sca/frontend/src/services/scoreCalculator.ts) | Implementation of `calculateScaMetrics` and `calculateQuickWins` |
| [scoreCalculator.test.ts](file:///home/bruno/Projetos/sca/frontend/src/services/__tests__/scoreCalculator.test.ts) | AAA unit test suite for score calculations and Quick Wins |

---

## 🧪 Test Execution Results

Executed `npm run test` in `/home/bruno/Projetos/sca/frontend`:

```text
 RUN  v3.2.7 /home/bruno/Projetos/sca/frontend

 ✓ src/__tests__/setup.test.ts (1 test) 3ms
 ✓ src/services/__tests__/normalizer.test.ts (5 tests) 9ms
 ✓ src/services/__tests__/scoreCalculator.test.ts (6 tests) 7ms

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Start at  17:49:36
   Duration  1.01s
```

All 12 tests passed cleanly.

---

## 🛡️ Security & Quality Verification

- **Pure Functions:** Zero side effects, fully deterministic RAM-only execution.
- **Input Validation:** Strict type safety via TypeScript interfaces derived from `ScaSbomModel`.
- **Graph Safety:** Graph traversal uses `visited` sets to prevent infinite loops in cyclic dependency structures.
- **Data Protection:** No external API calls or file writes; 100% browser-side privacy.
