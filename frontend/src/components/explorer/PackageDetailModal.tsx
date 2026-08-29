import { useEffect, useState, useRef, useCallback, Fragment } from 'react';
import { X, Copy, Check, ShieldAlert, ShieldCheck, AlertTriangle, Info, GitCommit } from 'lucide-react';
import DOMPurify from 'dompurify';
import gsap from 'gsap';
import { useScaStore } from '../../store/useScaStore';
import { useTranslation } from '../../context/LanguageContext';
import { ScaVulnerability } from '../../models/sca';

interface PackageDetailModalProps {
  compRef: string | null;
  onClose: () => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ compRef, onClose }) => {
  const { model, selectComponent } = useScaStore();
  const { t } = useTranslation();
  const [copiedPurl, setCopiedPurl] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  const animDuration = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 0.2;
  const enterDuration = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 0.3;

  const animateAndClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (backdropRef.current && contentRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: animDuration,
        ease: 'power2.in',
      });
      gsap.to(contentRef.current, {
        scale: 0.95,
        y: 15,
        opacity: 0,
        duration: animDuration,
        ease: 'power2.in',
        onComplete: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  }, [onClose, animDuration]);

  useEffect(() => {
    isClosingRef.current = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        animateAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (compRef && backdropRef.current && contentRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: enterDuration, ease: 'power2.out' }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.92, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: enterDuration, ease: 'power3.out' }
      );
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compRef, animateAndClose, enterDuration]);

  if (!compRef || !model) return null;

  const component = model.components.get(compRef);
  if (!component) return null;

  const handleCopyPurl = () => {
    if (component.purl) {
      navigator.clipboard.writeText(component.purl);
      setCopiedPurl(true);
      setTimeout(() => setCopiedPurl(false), 2000);
    }
  };

  // Build full ancestor path for display
  const ancestorPath = [...component.ancestorRefs, component.bomRef].map((ref) => {
    if (ref === 'root') {
      return {
        ref: 'root',
        name: model.metadata.componentName,
        version: model.metadata.componentVersion,
        isRoot: true,
      };
    }
    const ancestor = model.components.get(ref);
    return {
      ref,
      name: ancestor?.name || ref,
      version: ancestor?.version || '',
      isRoot: false,
    };
  });

  // Strict text sanitization helper using DOMPurify
  const sanitizeText = (text?: string): string => {
    if (!text) return '';
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'p', 'br'],
      ALLOWED_ATTR: [],
    });
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-400 border-rose-800 shadow-rose-950/50';
      case 'high':
        return 'bg-orange-950/80 text-orange-400 border-orange-800 shadow-orange-950/50';
      case 'medium':
        return 'bg-amber-950/80 text-amber-400 border-amber-800 shadow-amber-950/50';
      case 'low':
        return 'bg-blue-950/80 text-blue-400 border-blue-800 shadow-blue-950/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div
      ref={backdropRef}
      data-testid="package-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={animateAndClose}
    >
      <div
        ref={contentRef}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                data-testid="modal-package-name"
                className="text-2xl font-bold text-white tracking-tight"
              >
                {component.name}
              </h2>
              <span className="text-sm font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded-full">
                v{component.version}
              </span>
              <span
                data-testid="modal-type-badge"
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  component.isDirect
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    : 'bg-indigo-950/60 text-indigo-400 border-indigo-800'
                }`}
              >
                {component.isDirect ? `${t('metrics.direct')} (Nível ${component.depth})` : `${t('metrics.transitive')} (Nível ${component.depth})`}
              </span>
            </div>

            {component.group && (
              <p className="text-xs text-slate-400 font-mono">
                {t('details.group')}: {component.group}
              </p>
            )}
          </div>

          <button
            data-testid="modal-close-button"
            onClick={animateAndClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* PURL Box */}
          {component.purl && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{t('details.purl')} (Package URL)</span>
                <button
                  data-testid="copy-purl-button"
                  onClick={handleCopyPurl}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {copiedPurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPurl ? t('details.copied') : t('details.copyPurl')}</span>
                </button>
              </div>
              <p data-testid="modal-purl-value" className="text-xs font-mono text-cyan-300 break-all bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                {component.purl}
              </p>
            </div>
          )}

          {/* Impact Path / Ancestor Chain */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-cyan-400" />
              {t('details.impactPath')} / {t('details.ancestors')}
            </h4>
            <div data-testid="impact-path-breadcrumbs" className="flex items-center flex-wrap gap-2 text-xs">
              {ancestorPath.map((item, index) => (
                <Fragment key={item.ref + index}>
                  <button
                    onClick={() => item.ref !== 'root' && selectComponent(item.ref)}
                    className={`px-2.5 py-1 rounded-md font-mono border transition-all ${
                      item.ref === component.bomRef
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold ring-1 ring-cyan-500'
                        : item.isRoot
                        ? 'bg-slate-900 text-amber-300 border-amber-800/60'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500'
                    }`}
                  >
                    {item.name} {item.version && `v${item.version}`}
                  </button>
                  {index < ancestorPath.length - 1 && <span className="text-slate-600 font-bold">→</span>}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Licenses Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">{t('metrics.licenseMatrix')}</h4>
            {component.licenses.length === 0 ? (
              <p className="text-xs text-slate-500 italic">{t('details.noLicensesDeclared')}</p>
            ) : (
              <div className="flex flex-wrap gap-2" data-testid="modal-licenses-list">
                {component.licenses.map((lic, i) => (
                  <span
                    key={i}
                    className={`text-xs font-semibold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                      lic.type === 'permissive'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : lic.type === 'copyleft'
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800 shadow-rose-950/50 font-bold'
                        : 'bg-amber-950/60 text-amber-400 border-amber-800'
                    }`}
                  >
                    {lic.type === 'copyleft' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{lic.name || lic.id}</span>
                    <span className="text-[10px] opacity-75">({lic.type.toUpperCase()})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Vulnerabilities (CVEs) Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                {t('details.knownVulnerabilities')}
              </h4>
              <span className="text-xs text-slate-400">Total: {component.vulnerabilities.length}</span>
            </div>

            {component.vulnerabilities.length === 0 ? (
              <div data-testid="no-vulnerabilities-banner" className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('details.noVulnerabilities')}</span>
              </div>
            ) : (
              <div className="space-y-3" data-testid="modal-cve-list">
                {component.vulnerabilities.map((vuln: ScaVulnerability, idx) => (
                  <div key={vuln.id || idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-mono text-cyan-300">{vuln.id}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadgeClass(vuln.severity)}`}>
                          {vuln.severity.toUpperCase()}
                        </span>
                      </div>

                      {vuln.cvssScore !== undefined && (
                        <div className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                          CVSS: <span className="text-amber-400 font-bold">{vuln.cvssScore.toFixed(1)}</span> / 10
                        </div>
                      )}
                    </div>

                    {vuln.description && (
                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                        <p
                          data-testid="sanitized-description"
                          dangerouslySetInnerHTML={{ __html: sanitizeText(vuln.description) }}
                        />
                      </div>
                    )}

                    {vuln.recommendation && (
                      <div className="bg-cyan-950/30 border border-cyan-800/60 p-3 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t('details.remediationRecommendation')}</span>
                        </div>
                        <div
                          data-testid="sanitized-recommendation"
                          className="text-cyan-200"
                          dangerouslySetInnerHTML={{ __html: sanitizeText(vuln.recommendation) }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            data-testid="modal-close-footer-button"
            onClick={animateAndClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            {t('details.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

