import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Package,
  Layers,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';
import { ScaComponent } from '../../models/sca';
import { PackageDetailModal } from './PackageDetailModal';

type SortField = 'name' | 'depth' | 'cveSeverity' | 'license';
type SortOrder = 'asc' | 'desc';

export const ComponentExplorer: React.FC = () => {
  const { model, selectedComponentRef, selectComponent, searchFilter, setSearchFilter } = useScaStore();
  const { t } = useTranslation();

  const [typeFilter, setTypeFilter] = useState<'all' | 'direct' | 'transitive'>('all');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'permissive' | 'copyleft' | 'unknown'>('all');
  const [cveFilter, setCveFilter] = useState<'all' | 'vulnerable' | 'critical-high'>('all');

  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [modalCompRef, setModalCompRef] = useState<string | null>(null);

  if (!model) return null;

  const allComponents = Array.from(model.components.values());

  // Filter components
  const filteredComponents = useMemo(() => {
    return allComponents.filter((comp) => {
      // Text Search
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const nameMatch = comp.name.toLowerCase().includes(query);
        const versionMatch = comp.version.toLowerCase().includes(query);
        const groupMatch = comp.group?.toLowerCase().includes(query) || false;
        const purlMatch = comp.purl?.toLowerCase().includes(query) || false;
        const licenseMatch = comp.licenses.some((l) => l.name.toLowerCase().includes(query) || l.id?.toLowerCase().includes(query));

        if (!nameMatch && !versionMatch && !groupMatch && !purlMatch && !licenseMatch) {
          return false;
        }
      }

      // Type Filter
      if (typeFilter === 'direct' && !comp.isDirect) return false;
      if (typeFilter === 'transitive' && comp.isDirect) return false;

      // License Filter
      if (licenseFilter !== 'all') {
        const hasMatchingLic = comp.licenses.some((l) => l.type === licenseFilter);
        if (!hasMatchingLic) return false;
      }

      // CVE Filter
      if (cveFilter === 'vulnerable' && comp.vulnerabilities.length === 0) return false;
      if (cveFilter === 'critical-high') {
        const hasCritOrHigh = comp.vulnerabilities.some((v) => v.severity === 'critical' || v.severity === 'high');
        if (!hasCritOrHigh) return false;
      }

      return true;
    });
  }, [allComponents, searchFilter, typeFilter, licenseFilter, cveFilter]);

  // Sort components
  const sortedComponents = useMemo(() => {
    return [...filteredComponents].sort((a, b) => {
      let result = 0;

      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortBy === 'depth') {
        result = a.depth - b.depth;
      } else if (sortBy === 'cveSeverity') {
        const getSeverityScore = (comp: ScaComponent) => {
          if (comp.vulnerabilities.length === 0) return 0;
          let maxScore = 0;
          for (const v of comp.vulnerabilities) {
            const val = v.severity === 'critical' ? 5 : v.severity === 'high' ? 4 : v.severity === 'medium' ? 3 : v.severity === 'low' ? 2 : 1;
            if (val > maxScore) maxScore = val;
          }
          return maxScore;
        };
        result = getSeverityScore(b) - getSeverityScore(a);
      } else if (sortBy === 'license') {
        const getLicWeight = (comp: ScaComponent) => {
          if (comp.licenses.some((l) => l.type === 'copyleft')) return 3;
          if (comp.licenses.some((l) => l.type === 'unknown')) return 2;
          return 1;
        };
        result = getLicWeight(b) - getLicWeight(a);
      }

      return sortOrder === 'asc' ? result : -result;
    });
  }, [filteredComponents, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedComponents.length / pageSize) || 1;
  const paginatedComponents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedComponents.slice(start, start + pageSize);
  }, [sortedComponents, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleInspectPackage = (compRef: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(compRef);
    setModalCompRef(compRef);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div data-testid="component-explorer" className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">{t('metrics.totalComponents')}</p>
            <p data-testid="explorer-total-count" className="text-2xl font-bold text-white mt-1">
              {model.summary.totalComponents}
            </p>
          </div>
          <Package className="w-8 h-8 text-cyan-400/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">{t('metrics.direct')}</p>
            <p data-testid="explorer-direct-count" className="text-2xl font-bold text-emerald-400 mt-1">
              {model.summary.directComponentsCount}
            </p>
          </div>
          <Layers className="w-8 h-8 text-emerald-400/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">{t('metrics.transitive')}</p>
            <p data-testid="explorer-transitive-count" className="text-2xl font-bold text-indigo-400 mt-1">
              {model.summary.transitiveComponentsCount}
            </p>
          </div>
          <Layers className="w-8 h-8 text-indigo-400/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">{t('metrics.copyleft')}</p>
            <p data-testid="explorer-copyleft-count" className="text-2xl font-bold text-rose-400 mt-1">
              {model.summary.licenseBreakdown.copyleft}
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-400/60" />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="explorer-search-input"
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('explorer.searchPlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            {searchFilter && (
              <button
                data-testid="clear-search-button"
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                data-testid="type-filter"
                value={typeFilter}
                onChange={(e: any) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">Todos os Tipos</option>
                <option value="direct" className="bg-slate-900 text-white">Apenas Diretas</option>
                <option value="transitive" className="bg-slate-900 text-white">Apenas Transitivas</option>
              </select>
            </div>

            {/* License Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <select
                data-testid="license-filter"
                value={licenseFilter}
                onChange={(e: any) => {
                  setLicenseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">Todas as Licenças</option>
                <option value="permissive" className="bg-slate-900 text-white">Permissivas</option>
                <option value="copyleft" className="bg-slate-900 text-white">Copyleft</option>
                <option value="unknown" className="bg-slate-900 text-white">Desconhecidas</option>
              </select>
            </div>

            {/* CVE Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <select
                data-testid="cve-filter"
                value={cveFilter}
                onChange={(e: any) => {
                  setCveFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-300 font-semibold outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">Todas as Vulnerabilidades</option>
                <option value="vulnerable" className="bg-slate-900 text-white">Com CVE (Vulneráveis)</option>
                <option value="critical-high" className="bg-slate-900 text-white">Críticas / Altas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>
            Exibindo <strong className="text-cyan-400" data-testid="filtered-count">{sortedComponents.length}</strong> de{' '}
            <strong className="text-white">{allComponents.length}</strong> pacotes
          </span>

          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <select
              data-testid="page-size-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-md px-2 py-0.5 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th
                  data-testid="sort-name"
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{t('explorer.tableHeaderName')}</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-4">{t('explorer.tableHeaderVersion')}</th>
                <th
                  data-testid="sort-depth"
                  onClick={() => handleSort('depth')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{t('explorer.tableHeaderType')} / {t('explorer.tableHeaderDepth')}</span>
                    {renderSortIcon('depth')}
                  </div>
                </th>
                <th
                  data-testid="sort-license"
                  onClick={() => handleSort('license')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{t('explorer.tableHeaderLicense')}</span>
                    {renderSortIcon('license')}
                  </div>
                </th>
                <th
                  data-testid="sort-cve"
                  onClick={() => handleSort('cveSeverity')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>Vulnerabilidades (CVEs)</span>
                    {renderSortIcon('cveSeverity')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">{t('explorer.tableHeaderActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedComponents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic" data-testid="no-components-message">
                    {t('explorer.noComponents')}
                  </td>
                </tr>
              ) : (
                paginatedComponents.map((comp) => {
                  const isSelected = selectedComponentRef === comp.bomRef;
                  const hasCopyleft = comp.licenses.some((l) => l.type === 'copyleft');
                  const critCount = comp.vulnerabilities.filter((v) => v.severity === 'critical').length;
                  const highCount = comp.vulnerabilities.filter((v) => v.severity === 'high').length;

                  return (
                    <tr
                      key={comp.bomRef}
                      data-testid={`explorer-row-${comp.bomRef}`}
                      onClick={() => {
                        selectComponent(comp.bomRef);
                        setModalCompRef(comp.bomRef);
                      }}
                      className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-950/40 ring-1 ring-cyan-500/50' : ''
                      }`}
                    >
                      {/* Name & Group */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{comp.name}</span>
                        </div>
                        {comp.group && <div className="text-xs text-slate-500 font-mono pl-6">{comp.group}</div>}
                      </td>

                      {/* Version */}
                      <td className="px-6 py-4 font-mono text-xs text-cyan-300 font-semibold">v{comp.version}</td>

                      {/* Type & Depth */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            comp.isDirect
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                              : 'bg-indigo-950/60 text-indigo-400 border-indigo-800'
                          }`}
                        >
                          {comp.isDirect ? t('metrics.direct') : t('metrics.transitive')}
                          <span className="opacity-75">(L{comp.depth})</span>
                        </span>
                      </td>

                      {/* Licenses */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {comp.licenses.length === 0 ? (
                            <span className="text-xs text-slate-600 italic">N/A</span>
                          ) : (
                            comp.licenses.map((lic, i) => (
                              <span
                                key={i}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                  lic.type === 'permissive'
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                                    : lic.type === 'copyleft'
                                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 font-bold'
                                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                                }`}
                              >
                                {lic.name || lic.id}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Vulnerabilities */}
                      <td className="px-6 py-4">
                        {comp.vulnerabilities.length === 0 ? (
                          <span className="text-xs text-emerald-400 font-medium inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Limpo
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-full">
                              {comp.vulnerabilities.length} CVEs
                            </span>
                            {critCount > 0 && (
                              <span className="text-[10px] font-bold bg-rose-900 text-white px-1.5 py-0.5 rounded">
                                {critCount} Crit
                              </span>
                            )}
                            {highCount > 0 && (
                              <span className="text-[10px] font-bold bg-orange-900 text-white px-1.5 py-0.5 rounded">
                                {highCount} High
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          data-testid={`inspect-button-${comp.bomRef}`}
                          onClick={(e) => handleInspectPackage(comp.bomRef, e)}
                          className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/60 rounded-lg border border-transparent hover:border-cyan-800 transition-all inline-flex items-center gap-1 text-xs font-semibold"
                          title="Inspecionar Detalhes do Pacote"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span className="hidden sm:inline">Inspecionar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span data-testid="pagination-info">
            Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              data-testid="pagination-prev"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              data-testid="pagination-next"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Package Inspection Modal */}
      {modalCompRef && (
        <PackageDetailModal compRef={modalCompRef} onClose={() => setModalCompRef(null)} />
      )}
    </div>
  );
};
