import { parseAndNormalizeSbom } from '../services/normalizer';
import { useScaStore } from '../store/useScaStore';

declare global {
  interface Navigator {
    modelContext?: {
      provideContext?: (context: {
        tools: Array<{
          name: string;
          description: string;
          inputSchema: object;
          execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
        }>;
      }) => void;
    };
  }
}

/**
 * Initializes WebMCP in-browser tools API (navigator.modelContext.provideContext)
 * Exposes WebMCP capabilities to AI agents natively in browser context.
 */
export function registerWebMcpTools() {
  if (typeof window === 'undefined' || !navigator.modelContext?.provideContext) {
    return;
  }

  try {
    navigator.modelContext.provideContext({
      tools: [
        {
          name: 'analyze_sbom',
          description: 'Parses a CycloneDX JSON or XML SBOM raw string, normalizes the dependency graph, and populates the SCA store.',
          inputSchema: {
            type: 'object',
            properties: {
              sbomContent: { type: 'string', description: 'Raw CycloneDX JSON or XML string' },
              fileName: { type: 'string', description: 'Name of the uploaded file' }
            },
            required: ['sbomContent']
          },
          execute: async ({ sbomContent, fileName = 'agent_input.json' }) => {
            const content = String(sbomContent);
            const name = String(fileName);
            const model = parseAndNormalizeSbom(content, name);
            useScaStore.getState().setModel(model);
            return {
              success: true,
              componentName: model.metadata.componentName,
              totalComponents: model.stats.totalComponents,
              score: model.score.score,
              grade: model.score.grade
            };
          }
        },
        {
          name: 'get_security_score',
          description: 'Returns the current loaded SBOM SCA Health Rating score, grade, and vulnerability/license breakdown.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          execute: () => {
            const model = useScaStore.getState().model;
            if (!model) {
              return { error: 'No SBOM model currently loaded' };
            }
            return {
              score: model.score.score,
              grade: model.score.grade,
              vulnerabilities: model.vulnerabilities.summary,
              licenses: model.licenseBreakdown
            };
          }
        }
      ]
    });
  } catch (err) {
    console.warn('WebMCP registration notice:', err);
  }
}
