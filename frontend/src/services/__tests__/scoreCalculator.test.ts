import { describe, it, expect } from 'vitest';
import { calculateScaMetrics, calculateQuickWins } from '../scoreCalculator';
import { ScaSbomModel, ScaComponent, ScaVulnerability } from '../../models/sca';

describe('scoreCalculator', () => {
  describe('calculateScaMetrics (AAA Pattern)', () => {
    it('should return Grade A+ and score 100 for clean SBOM with no vulnerabilities and no risk licenses', () => {
      // Arrange
      const input = {
        vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        licenseBreakdown: { permissive: 15, copyleft: 0, unknown: 0 },
      };

      // Act
      const result = calculateScaMetrics(input);

      // Assert
      expect(result.score).toBe(100);
      expect(result.grade).toBe('A+');
    });

    it('should return Grade A for SBOM with minor vulnerabilities', () => {
      // Arrange
      const input = {
        vulnerabilityCounts: { critical: 0, high: 1, medium: 2, low: 0 }, // 6 + 4 = 10 penalty points
        licenseBreakdown: { permissive: 10, copyleft: 0, unknown: 0 },
      };

      // Act
      const result = calculateScaMetrics(input);

      // Assert
      expect(result.score).toBe(90);
      expect(result.grade).toBe('A');
    });

    it('should return Grade F and low score for highly vulnerable SBOM', () => {
      // Arrange
      const input = {
        vulnerabilityCounts: { critical: 10, high: 20, medium: 15, low: 5 }, // 150 + 120 + 30 + 2.5 = 302.5
        licenseBreakdown: { permissive: 5, copyleft: 8, unknown: 10 }, // 80 + 20 = 100 -> total penalty = 402.5
      };

      // Act
      const result = calculateScaMetrics(input);

      // Assert
      expect(result.score).toBeLessThan(35);
      expect(result.grade).toBe('F');
    });

    it('should correctly calculate logarithmic score bounds between 0 and 100', () => {
      // Arrange
      const massivePenaltyInput = {
        vulnerabilityCounts: { critical: 500, high: 1000, medium: 500, low: 200 },
        licenseBreakdown: { permissive: 0, copyleft: 100, unknown: 100 },
      };

      // Act
      const result = calculateScaMetrics(massivePenaltyInput);

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBe('F');
    });
  });

  describe('calculateQuickWins (AAA Pattern)', () => {
    it('should return empty array when SBOM has no vulnerabilities', () => {
      // Arrange
      const mockModel: ScaSbomModel = {
        metadata: { componentName: 'app', componentVersion: '1.0.0', specVersion: '1.4', format: 'json' },
        components: new Map([
          ['pkg:npm/express@4.18.2', {
            bomRef: 'pkg:npm/express@4.18.2',
            name: 'express',
            version: '4.18.2',
            isDirect: true,
            depth: 1,
            licenses: [{ name: 'MIT', type: 'permissive' }],
            vulnerabilities: [],
            ancestorRefs: ['root'],
          }],
        ]),
        dependenciesGraph: new Map([['root', ['pkg:npm/express@4.18.2']]]),
        vulnerabilities: [],
        summary: {
          totalComponents: 1,
          directComponentsCount: 1,
          transitiveComponentsCount: 0,
          maxTreeDepth: 1,
          vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
          licenseBreakdown: { permissive: 1, copyleft: 0, unknown: 0 },
          scaHealthScore: 100,
          securityGrade: 'A+',
        },
      };

      // Act
      const quickWins = calculateQuickWins(mockModel);

      // Assert
      expect(quickWins).toEqual([]);
    });

    it('should identify direct packages that bring the highest number of transitive vulnerabilities', () => {
      // Arrange
      const vulCritical: ScaVulnerability = {
        id: 'CVE-2026-0001',
        severity: 'critical',
        affectsBomRef: 'pkg:npm/nested-bad@1.0.0',
        description: 'Critical RCE in nested package',
      };
      const vulHigh: ScaVulnerability = {
        id: 'CVE-2026-0002',
        severity: 'high',
        affectsBomRef: 'pkg:npm/nested-bad@1.0.0',
        description: 'High severity prototype pollution',
      };

      const expressComp: ScaComponent = {
        bomRef: 'pkg:npm/express@4.18.2',
        name: 'express',
        version: '4.18.2',
        isDirect: true,
        depth: 1,
        licenses: [{ name: 'MIT', type: 'permissive' }],
        vulnerabilities: [],
        ancestorRefs: ['root'],
      };

      const lodashComp: ScaComponent = {
        bomRef: 'pkg:npm/lodash@4.17.21',
        name: 'lodash',
        version: '4.17.21',
        isDirect: true,
        depth: 1,
        licenses: [{ name: 'MIT', type: 'permissive' }],
        vulnerabilities: [],
        ancestorRefs: ['root'],
      };

      const nestedBadComp: ScaComponent = {
        bomRef: 'pkg:npm/nested-bad@1.0.0',
        name: 'nested-bad',
        version: '1.0.0',
        isDirect: false,
        depth: 2,
        licenses: [{ name: 'MIT', type: 'permissive' }],
        vulnerabilities: [vulCritical, vulHigh],
        ancestorRefs: ['root', 'pkg:npm/express@4.18.2'],
      };

      const componentsMap = new Map<string, ScaComponent>([
        [expressComp.bomRef, expressComp],
        [lodashComp.bomRef, lodashComp],
        [nestedBadComp.bomRef, nestedBadComp],
      ]);

      const dependenciesGraph = new Map<string, string[]>([
        ['root', [expressComp.bomRef, lodashComp.bomRef]],
        [expressComp.bomRef, [nestedBadComp.bomRef]],
        [lodashComp.bomRef, []],
        [nestedBadComp.bomRef, []],
      ]);

      const mockModel: ScaSbomModel = {
        metadata: { componentName: 'vulnerable-app', componentVersion: '1.0.0', specVersion: '1.4', format: 'json' },
        components: componentsMap,
        dependenciesGraph,
        vulnerabilities: [vulCritical, vulHigh],
        summary: {
          totalComponents: 3,
          directComponentsCount: 2,
          transitiveComponentsCount: 1,
          maxTreeDepth: 2,
          vulnerabilityCounts: { critical: 1, high: 1, medium: 0, low: 0 },
          licenseBreakdown: { permissive: 3, copyleft: 0, unknown: 0 },
          scaHealthScore: 70,
          securityGrade: 'B',
        },
      };

      // Act
      const quickWins = calculateQuickWins(mockModel);

      // Assert
      expect(quickWins.length).toBe(1);
      expect(quickWins[0].directComponent.name).toBe('express');
      expect(quickWins[0].transitiveVulnerabilityCount).toBe(2);
      expect(quickWins[0].vulnerabilityBreakdown.critical).toBe(1);
      expect(quickWins[0].vulnerabilityBreakdown.high).toBe(1);
      expect(quickWins[0].recommendation).toContain('express');
      expect(quickWins[0].recommendation).toContain('2 vulnerabilidades transitivas');
    });
  });
});
