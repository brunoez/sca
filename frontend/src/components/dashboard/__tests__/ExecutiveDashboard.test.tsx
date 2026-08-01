import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExecutiveDashboard } from '../ExecutiveDashboard';
import { useScaStore } from '../../../store/useScaStore';
import { LanguageProvider } from '../../../context/LanguageContext';
import { ScaSbomModel } from '../../../models/sca';

// Mock Recharts ResponsiveContainer to avoid size measuring issues in JSDOM
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  };
});

const mockSbomModel: ScaSbomModel = {
  metadata: {
    componentName: 'enterprise-core-service',
    componentVersion: '2.5.0',
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
        isDirect: true,
        depth: 1,
        licenses: [{ id: 'MIT', name: 'MIT License', type: 'permissive' }],
        vulnerabilities: [],
        ancestorRefs: ['root'],
      },
    ],
    [
      'pkg:npm/qs@6.11.0',
      {
        bomRef: 'pkg:npm/qs@6.11.0',
        name: 'qs',
        version: '6.11.0',
        isDirect: false,
        depth: 2,
        licenses: [{ id: 'BSD-3-Clause', name: 'BSD 3-Clause', type: 'permissive' }],
        vulnerabilities: [],
        ancestorRefs: ['root', 'pkg:npm/express@4.18.2'],
      },
    ],
    [
      'pkg:npm/gpl-lib@1.0.0',
      {
        bomRef: 'pkg:npm/gpl-lib@1.0.0',
        name: 'gpl-lib',
        version: '1.0.0',
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
    ['pkg:npm/express@4.18.2', ['pkg:npm/qs@6.11.0', 'pkg:npm/gpl-lib@1.0.0']],
  ]),
  vulnerabilities: [],
  summary: {
    totalComponents: 3,
    directComponentsCount: 1,
    transitiveComponentsCount: 2,
    maxTreeDepth: 2,
    vulnerabilityCounts: { critical: 1, high: 2, medium: 0, low: 1 },
    licenseBreakdown: { permissive: 2, copyleft: 1, unknown: 0 },
    scaHealthScore: 78,
    securityGrade: 'B+',
  },
};

const renderDashboard = () => {
  return render(
    <LanguageProvider defaultLanguage="pt-BR">
      <ExecutiveDashboard />
    </LanguageProvider>
  );
};

describe('ExecutiveDashboard Component Suite', () => {
  beforeEach(() => {
    useScaStore.getState().clearModel();
  });

  it('should render nothing when no SBOM model is loaded in store', () => {
    // Arrange & Act
    const { container } = renderDashboard();

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('should render Executive Dashboard with correct component name and rating when model is present', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);

    // Act
    renderDashboard();

    // Assert
    expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
    expect(screen.getAllByTestId('component-name')[0]).toHaveTextContent('enterprise-core-service');
  });

  it('should calculate and display vulnerability breakdown in ExecutiveScoreCard', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);

    // Act
    renderDashboard();

    // Assert
    expect(screen.getByTestId('executive-score-card')).toBeInTheDocument();
    expect(screen.getByTestId('cve-critical')).toHaveTextContent('1');
    expect(screen.getByTestId('cve-high')).toHaveTextContent('2');
    expect(screen.getByTestId('cve-medium')).toHaveTextContent('0');
    expect(screen.getByTestId('cve-low')).toHaveTextContent('1');
  });

  it('should render LicenseMatrixChart with copyleft warning alert when copyleft licenses are present', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);

    // Act
    renderDashboard();

    // Assert
    expect(screen.getByTestId('license-matrix-chart')).toBeInTheDocument();
    expect(screen.getByTestId('license-permissive')).toHaveTextContent('2');
    expect(screen.getByTestId('license-copyleft')).toHaveTextContent('1');
    expect(screen.getByText(/licenças copyleft detectadas/i)).toBeInTheDocument();
  });

  it('should render SupplyChainDepthChart with direct vs transitive metrics and max depth', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);

    // Act
    renderDashboard();

    // Assert
    expect(screen.getByTestId('supply-chain-depth-chart')).toBeInTheDocument();
    expect(screen.getByTestId('direct-count')).toHaveTextContent('1');
    expect(screen.getByTestId('transitive-count')).toHaveTextContent('2');
    expect(screen.getByTestId('max-depth-val')).toHaveTextContent('2');
  });

  it('should render QuickWinsList with direct dependency recommendations sorted by impact', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);

    // Act
    renderDashboard();

    // Assert
    expect(screen.getByTestId('quick-wins-list')).toBeInTheDocument();
    expect(screen.getByText('express')).toBeInTheDocument();
    expect(screen.getByTestId('quick-win-item-0')).toBeInTheDocument();
  });

  it('should clear SBOM model when clicking Reset button', () => {
    // Arrange
    useScaStore.getState().setModel(mockSbomModel);
    renderDashboard();

    // Act
    const resetButton = screen.getByTestId('reset-sbom-button');
    fireEvent.click(resetButton);

    // Assert
    expect(useScaStore.getState().model).toBeNull();
  });
});
