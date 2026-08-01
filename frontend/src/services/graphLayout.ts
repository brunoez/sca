import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';
import { ScaSbomModel, ScaLicense, ScaVulnerability } from '../models/sca';

export interface ScaNodeData extends Record<string, unknown> {
  bomRef: string;
  name: string;
  version: string;
  isRoot: boolean;
  isDirect: boolean;
  depth: number;
  licenses: ScaLicense[];
  vulnerabilities: ScaVulnerability[];
  isImpactPath: boolean;
  isSelected: boolean;
}

export interface GraphLayoutResult {
  nodes: Node<ScaNodeData>[];
  edges: Edge[];
}

export function getLayoutedElements(
  model: ScaSbomModel,
  impactPathRefs: string[] = [],
  selectedRef: string | null = null
): GraphLayoutResult {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 140 });

  const impactSet = new Set(impactPathRefs);
  const nodes: Node<ScaNodeData>[] = [];
  const edges: Edge[] = [];

  // Determine root component bomRef
  const rootRef =
    Array.from(model.dependenciesGraph.keys()).find((key) => !model.components.has(key)) || 'root';

  // 1. Process Root Node if present
  if (!model.components.has(rootRef)) {
    dagreGraph.setNode(rootRef, { width: 240, height: 95 });
    const isImpact = impactSet.has(rootRef);
    nodes.push({
      id: rootRef,
      type: 'scaNode',
      data: {
        bomRef: rootRef,
        name: model.metadata.componentName,
        version: model.metadata.componentVersion,
        isRoot: true,
        isDirect: false,
        depth: 0,
        licenses: [],
        vulnerabilities: [],
        isImpactPath: isImpact,
        isSelected: selectedRef === rootRef,
      },
      position: { x: 0, y: 0 },
    });
  }

  // 2. Process all components in model.components
  model.components.forEach((comp, ref) => {
    dagreGraph.setNode(ref, { width: 240, height: 95 });
    const isImpact = impactSet.has(ref);
    nodes.push({
      id: ref,
      type: 'scaNode',
      data: {
        bomRef: ref,
        name: comp.name,
        version: comp.version,
        isRoot: false,
        isDirect: comp.isDirect,
        depth: comp.depth,
        licenses: comp.licenses,
        vulnerabilities: comp.vulnerabilities,
        isImpactPath: isImpact,
        isSelected: selectedRef === ref,
      },
      position: { x: 0, y: 0 },
    });
  });

  // 3. Process edges from dependenciesGraph
  model.dependenciesGraph.forEach((children, parentRef) => {
    for (const childRef of children) {
      if (model.components.has(childRef) || childRef === rootRef) {
        dagreGraph.setEdge(parentRef, childRef);

        const isEdgeImpact = impactSet.has(parentRef) && impactSet.has(childRef);

        edges.push({
          id: `edge-${parentRef}->${childRef}`,
          source: parentRef,
          target: childRef,
          animated: isEdgeImpact,
          style: {
            stroke: isEdgeImpact ? '#22d3ee' : '#475569',
            strokeWidth: isEdgeImpact ? 3 : 1.5,
          },
        });
      }
    }
  });

  // 4. Calculate dagre layout
  dagre.layout(dagreGraph);

  // 5. Position nodes (convert center coordinates to top-left)
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: (nodeWithPosition?.x ?? 0) - 120,
        y: (nodeWithPosition?.y ?? 0) - 47.5,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
