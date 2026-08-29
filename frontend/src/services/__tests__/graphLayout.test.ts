import { describe, it, expect } from 'vitest';
import { getLayoutedElements } from '../graphLayout';
import { ScaSbomModel, ScaComponent } from '../../models/sca';

describe('graphLayout Service', () => {
  const createMockModel = (): ScaSbomModel => {
    const componentsMap = new Map<string, ScaComponent>();

    componentsMap.set('pkg:npm/express@4.18.2', {
      bomRef: 'pkg:npm/express@4.18.2',
      name: 'express',
      version: '4.18.2',
      isDirect: true,
      depth: 1,
      licenses: [{ id: 'MIT', name: 'MIT License', type: 'permissive' }],
      vulnerabilities: [],
      ancestorRefs: ['root'],
    });

    componentsMap.set('pkg:npm/qs@6.11.0', {
      bomRef: 'pkg:npm/qs@6.11.0',
      name: 'qs',
      version: '6.11.0',
      isDirect: false,
      depth: 2,
      licenses: [{ id: 'BSD-3-Clause', name: 'BSD 3-Clause', type: 'permissive' }],
      vulnerabilities: [
        {
          id: 'CVE-2024-0001',
          severity: 'high',
          affectsBomRef: 'pkg:npm/qs@6.11.0',
          description: 'High risk issue',
        },
      ],
      ancestorRefs: ['root', 'pkg:npm/express@4.18.2'],
    });

    const dependenciesGraph = new Map<string, string[]>();
    dependenciesGraph.set('root', ['pkg:npm/express@4.18.2']);
    dependenciesGraph.set('pkg:npm/express@4.18.2', ['pkg:npm/qs@6.11.0']);

    return {
      metadata: {
        componentName: 'test-app',
        componentVersion: '1.0.0',
        specVersion: '1.4',
        format: 'json',
      },
      components: componentsMap,
      dependenciesGraph,
      vulnerabilities: [],
      summary: {
        totalComponents: 2,
        directComponentsCount: 1,
        transitiveComponentsCount: 1,
        maxTreeDepth: 2,
        vulnerabilityCounts: { critical: 0, high: 1, medium: 0, low: 0 },
        licenseBreakdown: { permissive: 2, copyleft: 0, unknown: 0 },
        scaHealthScore: 90,
        securityGrade: 'A',
      },
    };
  };

  it('should transform ScaSbomModel into layouted React Flow nodes and edges using Dagre', () => {
    // Arrange
    const model = createMockModel();

    // Act
    const { nodes, edges } = getLayoutedElements(model);

    // Assert
    expect(nodes).toHaveLength(3); // root + express + qs
    expect(edges).toHaveLength(2); // root -> express, express -> qs

    // Verify root node
    const rootNode = nodes.find((n) => n.id === 'root');
    expect(rootNode).toBeDefined();
    expect(rootNode?.data.isRoot).toBe(true);
    expect(rootNode?.data.name).toBe('test-app');
    expect(typeof rootNode?.position.x).toBe('number');
    expect(typeof rootNode?.position.y).toBe('number');

    // Verify express node
    const expressNode = nodes.find((n) => n.id === 'pkg:npm/express@4.18.2');
    expect(expressNode).toBeDefined();
    expect(expressNode?.data.isDirect).toBe(true);

    // Verify qs node
    const qsNode = nodes.find((n) => n.id === 'pkg:npm/qs@6.11.0');
    expect(qsNode).toBeDefined();
    expect(qsNode?.data.depth).toBe(2);
    expect(qsNode?.data.vulnerabilities).toHaveLength(1);
  });

  it('should flag nodes and edges on the impact path when impactPathRefs is provided', () => {
    // Arrange
    const model = createMockModel();
    const impactPathRefs = ['root', 'pkg:npm/express@4.18.2', 'pkg:npm/qs@6.11.0'];

    // Act
    const { nodes, edges } = getLayoutedElements(model, impactPathRefs, 'pkg:npm/qs@6.11.0');

    // Assert
    const rootNode = nodes.find((n) => n.id === 'root');
    const expressNode = nodes.find((n) => n.id === 'pkg:npm/express@4.18.2');
    const qsNode = nodes.find((n) => n.id === 'pkg:npm/qs@6.11.0');

    expect(rootNode?.data.isImpactPath).toBe(true);
    expect(expressNode?.data.isImpactPath).toBe(true);
    expect(qsNode?.data.isImpactPath).toBe(true);
    expect(qsNode?.data.isSelected).toBe(true);

    // Edges on impact path should be animated and highlighted in cyan
    edges.forEach((edge) => {
      expect(edge.animated).toBe(true);
      expect(edge.style?.stroke).toBe('#22d3ee');
    });
  });

  it('should handle root-only model with no dependencies', () => {
    // Arrange
    const model: ScaSbomModel = {
      metadata: {
        componentName: 'solo-app',
        componentVersion: '2.0.0',
        specVersion: '1.4',
        format: 'json',
      },
      components: new Map(),
      dependenciesGraph: new Map([['root', []]]),
      vulnerabilities: [],
      summary: {
        totalComponents: 0,
        directComponentsCount: 0,
        transitiveComponentsCount: 0,
        maxTreeDepth: 0,
        vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        licenseBreakdown: { permissive: 0, copyleft: 0, unknown: 0 },
        scaHealthScore: 100,
        securityGrade: 'A+',
      },
    };

    // Act
    const { nodes, edges } = getLayoutedElements(model);

    // Assert
    expect(nodes).toHaveLength(1);
    expect(nodes[0].data.isRoot).toBe(true);
    expect(edges).toHaveLength(0);
  });
});
