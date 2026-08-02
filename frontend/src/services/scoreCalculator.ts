import { ScaSbomModel, ScaComponent } from '../models/sca';

export interface ScaScoreInput {
  vulnerabilityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  licenseBreakdown: {
    permissive: number;
    copyleft: number;
    unknown: number;
  };
}

export interface ScaScoreOutput {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
}

export interface QuickWinItem {
  directComponent: ScaComponent;
  transitiveVulnerabilityCount: number;
  totalVulnerabilityCount: number;
  transitiveComponentsCount: number;
  vulnerabilityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  impactScore: number;
  recommendation: string;
}

/**
 * Calculates the logarithmic SCA Health Score (0-100) and Security Grade (A+ to F).
 * Weights:
 * - Vulnerabilities: Critical = 15, High = 6, Medium = 2, Low = 0.5
 * - Risk Licenses: Copyleft = 10, Unknown = 2
 */
export function calculateScaMetrics(input: ScaScoreInput): ScaScoreOutput {
  const { critical, high, medium, low } = input.vulnerabilityCounts;
  const { copyleft, unknown } = input.licenseBreakdown;

  // Vulnerability Penalties (CVEs are primary security threats)
  const cvePenalty = critical * 25 + high * 10 + medium * 3 + low * 0.5;

  // License Penalties (Capped so missing/unknown licenses on dev/transitive packages don't overshadow 0-CVE projects)
  const copyleftPenalty = Math.min(30, copyleft * 5);
  const unknownPenalty = Math.min(4, unknown * 0.05);
  const licensePenalty = copyleftPenalty + unknownPenalty;

  const totalPenalty = cvePenalty + licensePenalty;

  if (totalPenalty === 0) {
    return { score: 100, grade: 'A+' };
  }

  // Logarithmic penalty scaling
  const rawScore = 100 - Math.log1p(totalPenalty) * 11;
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

/**
 * Analyzes direct packages that bring the largest number of transitive vulnerabilities
 * and recommends priority updates ("Quick Wins").
 */
export function calculateQuickWins(model: ScaSbomModel): QuickWinItem[] {
  const quickWins: QuickWinItem[] = [];

  // Filter direct components
  const directComponents: ScaComponent[] = [];
  model.components.forEach((comp) => {
    if (comp.isDirect || comp.depth === 1) {
      directComponents.push(comp);
    }
  });

  for (const directComp of directComponents) {
    // Collect all reachable components in downstream graph
    const reachableRefs = new Set<string>();
    const queue = [directComp.bomRef];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = model.dependenciesGraph.get(current) || [];

      for (const n of neighbors) {
        if (!reachableRefs.has(n) && n !== directComp.bomRef) {
          reachableRefs.add(n);
          queue.push(n);
        }
      }
    }

    // Filter reachable transitive components
    const transitiveComponents: ScaComponent[] = [];
    reachableRefs.forEach((ref) => {
      const comp = model.components.get(ref);
      if (comp) {
        transitiveComponents.push(comp);
      }
    });

    // Aggregate vulnerabilities on transitive dependencies
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let transitiveVulnerabilityCount = 0;

    for (const transComp of transitiveComponents) {
      for (const vuln of transComp.vulnerabilities) {
        transitiveVulnerabilityCount++;
        if (vuln.severity === 'critical') critical++;
        else if (vuln.severity === 'high') high++;
        else if (vuln.severity === 'medium') medium++;
        else if (vuln.severity === 'low') low++;
      }
    }

    const directVulnCount = directComp.vulnerabilities.length;
    const totalVulnerabilityCount = transitiveVulnerabilityCount + directVulnCount;

    if (totalVulnerabilityCount > 0) {
      const impactScore = critical * 15 + high * 6 + medium * 2 + low * 0.5;
      const recommendation = `Atualize ${directComp.name}@${directComp.version} para eliminar ${transitiveVulnerabilityCount} vulnerabilidades transitivas em suas dependências.`;

      quickWins.push({
        directComponent: directComp,
        transitiveVulnerabilityCount,
        totalVulnerabilityCount,
        transitiveComponentsCount: transitiveComponents.length,
        vulnerabilityBreakdown: { critical, high, medium, low },
        impactScore,
        recommendation,
      });
    }
  }

  // Sort by highest impact score and highest transitive vulnerability count
  return quickWins.sort((a, b) => {
    if (b.impactScore !== a.impactScore) {
      return b.impactScore - a.impactScore;
    }
    return b.transitiveVulnerabilityCount - a.transitiveVulnerabilityCount;
  });
}
