import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeView } from '../TreeView';
import { useScaStore } from '../../../store/useScaStore';
import { LanguageProvider } from '../../../context/LanguageContext';
import { ScaSbomModel } from '../../../models/sca';

const mockSbomModel: ScaSbomModel = {
  metadata: {
    componentName: 'my-microservice',
    componentVersion: '1.2.0',
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
            id: 'CVE-2024-1001',
            severity: 'critical',
            cvssScore: 9.8,
            affectsBomRef: 'pkg:npm/express@4.18.2',
            description: 'Critical RCE in express',
            recommendation: 'Upgrade to 4.19.0',
          },
        ],
        ancestorRefs: ['root'],
      },
    ],
    [
      'pkg:npm/qs@6.11.0',
      {
        bomRef: 'pkg:npm/qs@6.11.0',
        name: 'qs',
        version: '6.11.0',
        group: 'npm',
        purl: 'pkg:npm/qs@6.11.0',
        isDirect: false,
        depth: 2,
        licenses: [{ id: 'BSD-3-Clause', name: 'BSD 3-Clause', type: 'permissive' }],
        vulnerabilities: [],
        ancestorRefs: ['root', 'pkg:npm/express@4.18.2'],
      },
    ],
  ]),
  dependenciesGraph: new Map([
    ['root', ['pkg:npm/express@4.18.2']],
    ['pkg:npm/express@4.18.2', ['pkg:npm/qs@6.11.0']],
  ]),
  vulnerabilities: [],
  summary: {
    totalComponents: 2,
    directComponentsCount: 1,
    transitiveComponentsCount: 1,
    maxTreeDepth: 2,
    vulnerabilityCounts: { critical: 1, high: 0, medium: 0, low: 0 },
    licenseBreakdown: { permissive: 2, copyleft: 0, unknown: 0 },
    scaHealthScore: 85,
    securityGrade: 'A',
  },
};

const renderTreeView = () => {
  return render(
    <LanguageProvider defaultLanguage="pt-BR">
      <TreeView />
    </LanguageProvider>
  );
};

describe('TreeView Component Suite', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  it('should render nothing when no SBOM model is loaded in store', () => {
    // Arrange & Act
    const { container } = renderTreeView();

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should render root application and direct dependencies in tree view', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);

    // Act
    renderTreeView();

    // Assert
    expect(screen.getByTestId('tree-view')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-root')).toBeInTheDocument();
    expect(screen.getByText('my-microservice')).toBeInTheDocument();
    expect(screen.getByText('express')).toBeInTheDocument();
  });

  it('should expand node to reveal transitive dependencies when clicking toggle button', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    renderTreeView();

    // Act - Click toggle button for express (root is expanded by default)
    const expressToggle = screen.getByTestId('tree-node-toggle-pkg:npm/express@4.18.2');
    fireEvent.click(expressToggle);

    // Assert
    expect(screen.getByText('qs')).toBeInTheDocument();
    expect(screen.getByTestId('depth-indicator-pkg:npm/qs@6.11.0')).toHaveTextContent('L2 (Transitiva)');
  });

  it('should expand all nodes when clicking Expandir Todos button', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    renderTreeView();

    // Act
    const expandAllBtn = screen.getByTestId('expand-all-button');
    fireEvent.click(expandAllBtn);

    // Assert
    expect(screen.getByText('qs')).toBeInTheDocument();
  });

  it('should collapse all nodes when clicking Recolher Todos button', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    renderTreeView();

    // Expand all first
    fireEvent.click(screen.getByTestId('expand-all-button'));
    expect(screen.getByText('qs')).toBeInTheDocument();

    // Act
    const collapseAllBtn = screen.getByTestId('collapse-all-button');
    fireEvent.click(collapseAllBtn);

    // Assert - Transitive node qs should be collapsed
    expect(screen.queryByText('qs')).not.toBeInTheDocument();
  });

  it('should filter tree nodes when search text is typed in search input', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    renderTreeView();

    // Act
    const searchInput = screen.getByTestId('tree-search-input');
    fireEvent.change(searchInput, { target: { value: 'qs' } });

    // Assert - Search should auto-expand tree and find 'qs'
    expect(screen.getByText('qs')).toBeInTheDocument();
  });

  it('should highlight impact path when a node in impact path is selected', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    useScaStore.getState().selectComponent('pkg:npm/qs@6.11.0');
    renderTreeView();

    // Act - Expand root and express
    fireEvent.click(screen.getByTestId('expand-all-button'));

    // Assert - Both express and qs should be in impact path
    expect(screen.getByTestId('impact-path-highlight-pkg:npm/qs@6.11.0')).toBeInTheDocument();
    expect(screen.getByTestId('impact-path-highlight-pkg:npm/express@4.18.2')).toBeInTheDocument();
  });

  it('should open PackageDetailModal when clicking inspect button on a tree node', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    renderTreeView();
    fireEvent.click(screen.getByTestId('expand-all-button'));

    // Act
    const inspectBtn = screen.getByTestId('inspect-tree-node-pkg:npm/express@4.18.2');
    fireEvent.click(inspectBtn);

    // Assert - Modal should open
    expect(screen.getByTestId('package-detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-package-name')).toHaveTextContent('express');
  });
});
