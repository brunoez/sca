import { z } from 'zod';

export const scaLicenseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['permissive', 'copyleft', 'unknown']),
});
export type ScaLicense = z.infer<typeof scaLicenseSchema>;

export const scaVulnerabilitySchema = z.object({
  id: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  cvssScore: z.number().optional(),
  description: z.string().optional(),
  affectsBomRef: z.string(),
  recommendation: z.string().optional(),
});
export type ScaVulnerability = z.infer<typeof scaVulnerabilitySchema>;

export const scaComponentSchema = z.object({
  bomRef: z.string(),
  name: z.string(),
  version: z.string(),
  purl: z.string().optional(),
  group: z.string().optional(),
  isDirect: z.boolean(),
  depth: z.number(),
  licenses: z.array(scaLicenseSchema),
  vulnerabilities: z.array(scaVulnerabilitySchema),
  ancestorRefs: z.array(z.string()),
});
export type ScaComponent = z.infer<typeof scaComponentSchema>;

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
