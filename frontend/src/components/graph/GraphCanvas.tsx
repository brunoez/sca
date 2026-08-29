import { useMemo, useCallback, Fragment } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  Panel,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitFork, Layers, X, Zap } from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { getLayoutedElements } from '../../services/graphLayout';
import { ScaNodeComponent } from './ScaNodeComponent';

import { useTranslation } from '../../context/LanguageContext';

export const GraphCanvas: React.FC = () => {
  const { model, selectedComponentRef, impactPathRefs, selectComponent } = useScaStore();
  const { t } = useTranslation();

  const nodeTypes = useMemo(() => ({ scaNode: ScaNodeComponent }), []);

  const { nodes, edges } = useMemo(() => {
    if (!model) return { nodes: [], edges: [] };
    return getLayoutedElements(model, impactPathRefs, selectedComponentRef);
  }, [model, impactPathRefs, selectedComponentRef]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectComponent(node.id);
    },
    [selectComponent]
  );

  const onPaneClick = useCallback(() => {
    selectComponent(null);
  }, [selectComponent]);

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center min-h-[400px]">
        <GitFork className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">
          {t('graph.unavailableTitle')}
        </h3>
        <p className="text-slate-400 text-sm max-w-md">
          {t('graph.unavailableDesc')}
        </p>
      </div>
    );
  }

  const selectedComp = selectedComponentRef ? model.components.get(selectedComponentRef) : null;

  return (
    <div
      data-testid="graph-canvas-container"
      className="relative w-full h-[650px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
    >
      <ReactFlow
        nodes={nodes as any}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} size={1.5} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 !rounded-xl overflow-hidden !shadow-lg" />
        <MiniMap
          nodeColor={(node: any) => {
            if (node.data?.isRoot) return '#a855f7';
            if (node.data?.isDirect) return '#06b6d4';
            return '#475569';
          }}
          nodeStrokeColor={(node: any) => {
            if (node.data?.isRoot) return '#c084fc';
            if (node.data?.isDirect) return '#22d3ee';
            return '#94a3b8';
          }}
          nodeBorderRadius={4}
          maskColor="rgba(15, 23, 42, 0.75)"
          className="!bg-slate-900 !border !border-slate-800 !rounded-xl overflow-hidden"
          zoomable
          pannable
        />

        {/* Panel Header: Legend & Impact Path Details */}
        <Panel position="top-left" className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-xl max-w-md">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-sm text-white">{t('graph.title')}</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {nodes.length} {t('graph.nodes')} • {edges.length} {t('graph.connections')}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {t('graph.instructionPrefix')}<strong className="text-cyan-300">{t('graph.instructionHighlight')}</strong>{t('graph.instructionSuffix')}
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 border-t border-slate-800 pt-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> {t('graph.root')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> {t('metrics.direct')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> {t('metrics.transitive')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-cyan-400 rounded"></span> {t('details.impactPath')}
            </span>
          </div>
        </Panel>

        {/* Panel Bottom: Impact Path Details when selected */}
        {selectedComponentRef && (
          <Panel position="bottom-center" className="bg-slate-900/95 border border-cyan-500/50 p-4 rounded-xl backdrop-blur-md shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="font-bold text-sm text-white">
                  {t('details.impactPath')}: {selectedComp ? selectedComp.name : model.metadata.componentName}
                </span>
              </div>
              <button
                onClick={() => selectComponent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title={t('graph.clearSelection')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-mono">
              {impactPathRefs.map((ref, idx) => {
                const comp = model.components.get(ref);
                const isLast = idx === impactPathRefs.length - 1;
                const compName = comp ? comp.name : model.metadata.componentName;
                return (
                  <Fragment key={ref}>
                    <span
                      className={`px-2.5 py-1 rounded-md border text-xs font-semibold whitespace-nowrap ${
                        isLast
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 ring-2 ring-cyan-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {compName}
                    </span>
                    {!isLast && <span className="text-slate-600 font-bold">→</span>}
                  </Fragment>
                );
              })}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
