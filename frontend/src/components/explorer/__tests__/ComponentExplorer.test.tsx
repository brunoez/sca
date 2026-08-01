import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentExplorer } from '../ComponentExplorer';
import { useScaStore } from '../../../store/useScaStore';
import { LanguageProvider } from '../../../context/LanguageContext';
import { ScaSbomModel } from '../../../models/sca';

const mockSbomWithXss: ScaSbomModel = {
  metadata: {
    componentName: 'secure-app',
    componentVersion: '1.0.0',
    specVersion: '1.4',
    format: 'json',
  },
  components: new Map([
    [
      'pkg:npm/express@4.18.2',
      {
        bomRef: 'pkg:npm/express@4.18.2',
        name: 'express',
        version: '4.18.2',
        group: 'npm',
        purl: 'pkg:npm/express@4.18.2',
        isDirect: true,
        depth: 1,
        licenses: [{ id: 'MIT', name: 'MIT License', type: 'permissive' }],
        vulnerabilities: [
          {
            id: 'CVE-2024-9999',
            severity: 'critical',
            cvssScore: 9.8,
            affectsBomRef: 'pkg:npm/express@4.18.2',
            description: '<img src=x onerror=alert("XSS_ATTACK")> <script>alert("HACKED")</script>Critical vulnerability',
            recommendation: 'Upgrade immediately <iframe src="http://malicious.com"></iframe>',
          },
        ],
        ancestorRefs: ['root'],
      },
    ],
    [
      'pkg:npm/gpl-library@2.0.0',
      {
        bomRef: 'pkg:npm/gpl-library@2.0.0',
        name: 'gpl-library',
        version: '2.0.0',
        group: 'npm',
        purl: 'pkg:npm/gpl-library@2.0.0',
        isDirect: false,
        depth: 2,
        licenses: [{ id: 'GPL-3.0', name: 'GNU General Public License', type: 'copyleft' }],
        vulnerabilities: [],
        ancestorRefs: ['root', 'pkg:npm/express@4.18.2'],
      },
    ],
  ]),
  dependenciesGraph: new Map([
    ['root', ['pkg:npm/express@4.18.2']],
    ['pkg:npm/express@4.18.2', ['pkg:npm/gpl-library@2.0.0']],
  ]),
  vulnerabilities: [],
  summary: {
    totalComponents: 2,
    directComponentsCount: 1,
    transitiveComponentsCount: 1,
    maxTreeDepth: 2,
    vulnerabilityCounts: { critical: 1, high: 0, medium: 0, low: 0 },
    licenseBreakdown: { permissive: 1, copyleft: 1, unknown: 0 },
    scaHealthScore: 70,
    securityGrade: 'B',
  },
};

const renderExplorer = () => {
  return render(
    <LanguageProvider>
      <ComponentExplorer />
    </LanguageProvider>
  );
};

describe('ComponentExplorer Component Suite', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  it('should render nothing when no SBOM model is loaded in store', () => {
    // Arrange & Act
    const { container } = renderExplorer();

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should render Component Explorer with total counts and component table rows', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);

    // Act
    renderExplorer();

    // Assert
    expect(screen.getByTestId('component-explorer')).toBeInTheDocument();
    expect(screen.getByTestId('explorer-total-count')).toHaveTextContent('2');
    expect(screen.getByTestId('explorer-direct-count')).toHaveTextContent('1');
    expect(screen.getByTestId('explorer-transitive-count')).toHaveTextContent('1');
    expect(screen.getByTestId('explorer-copyleft-count')).toHaveTextContent('1');
    expect(screen.getByTestId('explorer-row-pkg:npm/express@4.18.2')).toBeInTheDocument();
    expect(screen.getByTestId('explorer-row-pkg:npm/gpl-library@2.0.0')).toBeInTheDocument();
  });

  it('should filter packages when search query is entered', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act
    const searchInput = screen.getByTestId('explorer-search-input');
    fireEvent.change(searchInput, { target: { value: 'express' } });

    // Assert
    expect(screen.getByTestId('explorer-row-pkg:npm/express@4.18.2')).toBeInTheDocument();
    expect(screen.queryByTestId('explorer-row-pkg:npm/gpl-library@2.0.0')).not.toBeInTheDocument();
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
  });

  it('should filter packages by type (direct vs transitive)', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act - Filter Direct
    const typeSelect = screen.getByTestId('type-filter');
    fireEvent.change(typeSelect, { target: { value: 'direct' } });

    // Assert
    expect(screen.getByTestId('explorer-row-pkg:npm/express@4.18.2')).toBeInTheDocument();
    expect(screen.queryByTestId('explorer-row-pkg:npm/gpl-library@2.0.0')).not.toBeInTheDocument();
  });

  it('should filter packages by license category (copyleft)', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act - Filter Copyleft
    const licenseSelect = screen.getByTestId('license-filter');
    fireEvent.change(licenseSelect, { target: { value: 'copyleft' } });

    // Assert
    expect(screen.queryByTestId('explorer-row-pkg:npm/express@4.18.2')).not.toBeInTheDocument();
    expect(screen.getByTestId('explorer-row-pkg:npm/gpl-library@2.0.0')).toBeInTheDocument();
  });

  it('should filter packages by vulnerability status (vulnerable only)', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act - Filter Vulnerable
    const cveSelect = screen.getByTestId('cve-filter');
    fireEvent.change(cveSelect, { target: { value: 'vulnerable' } });

    // Assert
    expect(screen.getByTestId('explorer-row-pkg:npm/express@4.18.2')).toBeInTheDocument();
    expect(screen.queryByTestId('explorer-row-pkg:npm/gpl-library@2.0.0')).not.toBeInTheDocument();
  });

  it('should sort packages when clicking table headers', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act - Click depth sort header
    const depthHeader = screen.getByTestId('sort-depth');
    fireEvent.click(depthHeader);

    // Assert
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
  });

  it('should open PackageDetailModal when clicking inspect button', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act
    const inspectBtn = screen.getByTestId('inspect-button-pkg:npm/express@4.18.2');
    fireEvent.click(inspectBtn);

    // Assert - Modal opens
    expect(screen.getByTestId('package-detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-package-name')).toHaveTextContent('express');
  });

  it('should sanitize malicious script and iframe tags using DOMPurify when modal is opened', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();

    // Act - Open modal for express package containing XSS payloads
    const inspectBtn = screen.getByTestId('inspect-button-pkg:npm/express@4.18.2');
    fireEvent.click(inspectBtn);

    // Assert
    const descElement = screen.getByTestId('sanitized-description');
    const recElement = screen.getByTestId('sanitized-recommendation');

    // DOMPurify removes <script>, <iframesrc>, onerror attributes
    expect(descElement.innerHTML).not.toContain('<script>');
    expect(descElement.innerHTML).not.toContain('onerror');
    expect(recElement.innerHTML).not.toContain('<iframe');
    expect(descElement.innerHTML).toContain('Critical vulnerability');
  });

  it('should close PackageDetailModal when clicking close button', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomWithXss);
    renderExplorer();
    fireEvent.click(screen.getByTestId('inspect-button-pkg:npm/express@4.18.2'));
    expect(screen.getByTestId('package-detail-modal')).toBeInTheDocument();

    // Act
    const closeBtn = screen.getByTestId('modal-close-button');
    fireEvent.click(closeBtn);

    // Assert
    expect(screen.queryByTestId('package-detail-modal')).not.toBeInTheDocument();
  });
});
