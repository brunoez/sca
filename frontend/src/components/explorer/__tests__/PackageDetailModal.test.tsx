import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PackageDetailModal } from '../PackageDetailModal';
import { useScaStore } from '../../../store/useScaStore';
import { LanguageProvider } from '../../../context/LanguageContext';
import { ScaSbomModel } from '../../../models/sca';

const mockSbom: ScaSbomModel = {
  metadata: {
    componentName: 'secure-app',
    componentVersion: '1.0.0',
    specVersion: '1.4',
    format: 'json',
  },
  components: new Map([
    [
      'pkg:npm/test-lib@1.0.0',
      {
        bomRef: 'pkg:npm/test-lib@1.0.0',
        name: 'test-lib',
        version: '1.0.0',
        group: '<span id="malicious-group">malicious.group</span>',
        purl: 'pkg:npm/test-lib@1.0.0',
        isDirect: true,
        depth: 1,
        licenses: [{ id: 'MIT', name: 'MIT', type: 'permissive' }],
        vulnerabilities: [
          {
            id: 'CVE-2026-0001',
            severity: 'critical',
            cvssScore: 9.8,
            affectsBomRef: 'pkg:npm/test-lib@1.0.0',
            description: '<img src=x onerror=alert("XSS")><b>Critical vulnerability in parser</b><script>alert(1)</script>',
            recommendation: 'Upgrade to version 2.0.0 <a href="javascript:alert(1)">Click here</a>',
          },
        ],
        ancestorRefs: ['root'],
      },
    ],
  ]),
  dependenciesGraph: new Map([['root', ['pkg:npm/test-lib@1.0.0']]]),
  vulnerabilities: [],
  summary: {
    totalComponents: 1,
    directComponentsCount: 1,
    transitiveComponentsCount: 0,
    maxTreeDepth: 1,
    vulnerabilityCounts: { critical: 1, high: 0, medium: 0, low: 0 },
    licenseBreakdown: { permissive: 1, copyleft: 0, unknown: 0 },
    scaHealthScore: 75,
    securityGrade: 'B+',
  },
};

const renderModal = (compRef: string | null = 'pkg:npm/test-lib@1.0.0', onClose = vi.fn()) => {
  return render(
    <LanguageProvider defaultLanguage="pt-BR">
      <PackageDetailModal compRef={compRef} onClose={onClose} />
    </LanguageProvider>
  );
};

describe('PackageDetailModal Security Suite', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
    useScaStore.getState().setModel(mockSbom);
  });

  it('should render component.group as plain text without HTML element injection', () => {
    // Arrange & Act
    const { container } = renderModal();

    // Assert: Malicious span should NOT exist in DOM as an HTML tag
    expect(container.querySelector('#malicious-group')).toBeNull();
    // It should be rendered as literal text
    expect(screen.getByText(/<span id="malicious-group">malicious.group<\/span>/i)).toBeInTheDocument();
  });

  it('should strictly sanitize CVE descriptions by removing script and img tags with error handlers', () => {
    // Arrange & Act
    const { container } = renderModal();

    // Assert: img and script tags must be stripped by DOMPurify
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();

    // Safe bold tag should remain
    const sanitizedDesc = screen.getByTestId('sanitized-description');
    expect(sanitizedDesc.querySelector('b')).toBeInTheDocument();
    expect(sanitizedDesc).toHaveTextContent('Critical vulnerability in parser');
  });

  it('should sanitize recommendations and neutralize dangerous hrefs', () => {
    // Arrange & Act
    const { container } = renderModal();

    // Assert: Recommendation is displayed safely
    const recElement = screen.getByTestId('sanitized-recommendation');
    expect(recElement).toHaveTextContent('Upgrade to version 2.0.0');

    // javascript: link should be sanitized out
    const link = container.querySelector('a[href^="javascript:"]');
    expect(link).toBeNull();
  });
});
