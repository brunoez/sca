import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Package,
  Search,
  FolderTree,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Minimize2,
  X,
  Eye,
  GitCommit,
} from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';
import { PackageDetailModal } from '../explorer/PackageDetailModal';

export const TreeView: React.FC = () => {
  const { model, selectedComponentRef, selectComponent, searchFilter, setSearchFilter } = useScaStore();
  const { t } = useTranslation();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  if (!model) return null;

  const rootRef = 'root';
  const directComponents = Array.from(model.components.values()).filter((c) => c.isDirect);

  // Collect all expandable node refs for Expand All functionality
  const allExpandableRefs = useMemo(() => {
    const refs = new Set<string>();
    refs.add(rootRef);
    model.components.forEach((_, ref) => {
      const children = model.dependenciesGraph.get(ref);
      if (children && children.length > 0) {
        refs.add(ref);
      }
    });
    return refs;
  }, [model]);

  // Handle Search filtering auto-expansion
  useEffect(() => {
    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase().trim();
      const newExpanded = new Set<string>();
      newExpanded.add(rootRef);

      model.components.forEach((comp, ref) => {
        const matches =
          comp.name.toLowerCase().includes(query) ||
          comp.version.toLowerCase().includes(query) ||
          comp.group?.toLowerCase().includes(query) ||
          comp.purl?.toLowerCase().includes(query);

        if (matches) {
          // Expand all ancestors of matching component
          comp.ancestorRefs.forEach((ancestorRef) => newExpanded.add(ancestorRef));
          newExpanded.add(ref);
        }
      });

      setExpandedNodes(newExpanded);
    }
  }, [searchFilter, model]);

  const handleExpandAll = () => {
    setExpandedNodes(new Set(allExpandableRefs));
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set([rootRef]));
  };

  const toggleNode = (ref: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  return (
    <div data-testid="tree-view" className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FolderTree className="w-7 h-7 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-white">{t('tabs.tree')}</h3>
              <p className="text-xs text-slate-400">
                Visualização hierárquica estilo File-Explorer de todas as dependências da Supply Chain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              data-testid="expand-all-button"
              onClick={handleExpandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Expandir Todos</span>
            </button>

            <button
              data-testid="collapse-all-button"
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Recolher Todos</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            data-testid="tree-search-input"
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por pacote na árvore (nome, versão, grupo)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          {searchFilter && (
            <button
              data-testid="tree-clear-search"
              onClick={() => setSearchFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hierarchical Tree Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
        <div className="min-w-[600px] space-y-2">
          {/* Root Project Node */}
          <div className="space-y-1">
            <div
              data-testid="tree-node-root"
              onClick={() => toggleNode(rootRef)}
              className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-850 border border-cyan-900/50 rounded-xl cursor-pointer transition-all shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <button
                  data-testid="tree-node-toggle-root"
                  onClick={(e) => toggleNode(rootRef, e)}
                  className="p-1 hover:bg-slate-800 rounded text-cyan-400"
                >
                  {expandedNodes.has(rootRef) ? (
                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <FolderTree className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-base">{model.metadata.componentName}</span>
                <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                  v{model.metadata.componentVersion}
                </span>
                <span className="text-xs text-slate-500 font-mono">{t('tree.rootApp')}</span>
              </div>

              <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {directComponents.length} {t('tree.directDeps')}
              </span>
            </div>

            {/* Direct Dependencies Sub-tree */}
            {expandedNodes.has(rootRef) && (
              <div className="pl-6 border-l-2 border-slate-800/80 ml-4 space-y-1.5 pt-1.5">
                {directComponents.map((comp) => (
                  <TreeNodeItem
                    key={comp.bomRef}
                    compRef={comp.bomRef}
                    depthLevel={1}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    onInspect={(ref) => selectComponent(ref)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Inspection Modal */}
      {selectedComponentRef && (
        <PackageDetailModal compRef={selectedComponentRef} onClose={() => selectComponent(null)} />
      )}
    </div>
  );
};

interface TreeNodeItemProps {
  compRef: string;
  depthLevel: number;
  expandedNodes: Set<string>;
  toggleNode: (ref: string, e?: React.MouseEvent) => void;
  onInspect: (ref: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  compRef,
  depthLevel,
  expandedNodes,
  toggleNode,
  onInspect,
}) => {
  const { model, selectedComponentRef, impactPathRefs, selectComponent, searchFilter } = useScaStore();
  const { t } = useTranslation();

  if (!model) return null;
  const comp = model.components.get(compRef);
  if (!comp) return null;

  const childrenRefs = model.dependenciesGraph.get(compRef) || [];
  const isExpanded = expandedNodes.has(compRef);
  const isSelected = selectedComponentRef === compRef;
  const isInImpactPath = impactPathRefs.includes(compRef);

  // Check search filter match for highlighting matching text
  const searchMatch =
    searchFilter.trim() !== '' &&
    (comp.name.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      comp.version.toLowerCase().includes(searchFilter.toLowerCase().trim()));

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(compRef);
    if (childrenRefs.length > 0) {
      toggleNode(compRef);
    }
  };

  return (
    <div className="space-y-1">
      <div
        data-testid={`tree-node-${compRef}`}
        onClick={handleNodeClick}
        className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all cursor-pointer group ${
          isSelected
            ? 'bg-cyan-950/80 border-cyan-500 text-white ring-2 ring-cyan-500/60 shadow-lg shadow-cyan-950/50'
            : isInImpactPath
            ? 'bg-amber-950/40 border-amber-600/80 text-amber-100 ring-1 ring-amber-500/50'
            : searchMatch
            ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-200 font-semibold'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Expand / Collapse Icon */}
          {childrenRefs.length > 0 ? (
            <button
              data-testid={`tree-node-toggle-${compRef}`}
              onClick={(e) => toggleNode(compRef, e)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>
          ) : (
            <Package className="w-4 h-4 text-slate-600 shrink-0 ml-1" />
          )}

          {/* Package Name & Version */}
          <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-xs">{comp.name}</span>
          <span className="text-xs font-mono text-cyan-300 font-medium">v{comp.version}</span>

          {/* Depth Level Indicator */}
          <span
            data-testid={`depth-indicator-${compRef}`}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
              comp.isDirect
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : 'bg-indigo-950/60 text-indigo-400 border-indigo-800'
            }`}
          >
            L{depthLevel} ({comp.isDirect ? t('metrics.direct') : t('metrics.transitive')})
          </span>

          {/* Impact Path Badge if highlighted */}
          {isInImpactPath && (
            <span
              data-testid={`impact-path-highlight-${compRef}`}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 shrink-0 animate-pulse"
            >
              <GitCommit className="w-3 h-3" /> Impact Path
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* License Badges */}
          {comp.licenses.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {comp.licenses.map((lic, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    lic.type === 'permissive'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                      : lic.type === 'copyleft'
                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 font-bold'
                      : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                  }`}
                >
                  {lic.name || lic.id}
                </span>
              ))}
            </div>
          )}

          {/* Vulnerability Count Badge */}
          {comp.vulnerabilities.length > 0 ? (
            <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {comp.vulnerabilities.length}
            </span>
          ) : (
            <span className="text-xs text-emerald-400/80 hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('tree.clean')}
            </span>
          )}

          {/* Inspect Button */}
          <button
            data-testid={`inspect-tree-node-${compRef}`}
            onClick={(e) => {
              e.stopPropagation();
              onInspect(compRef);
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
            title={t('tree.inspectPackage')}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children Sub-tree Recursive Render */}
      {isExpanded && childrenRefs.length > 0 && (
        <div className="pl-6 border-l-2 border-slate-800 ml-4 space-y-1 pt-1">
          {childrenRefs.map((childRef) => (
            <TreeNodeItem
              key={childRef}
              compRef={childRef}
              depthLevel={depthLevel + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onInspect={onInspect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
