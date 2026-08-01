import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { useScaStore } from '../store/useScaStore';
import { parseAndNormalizeSbom } from '../services/normalizer';

const sampleSbomJson = JSON.stringify({
  bomFormat: 'CycloneDX',
  specVersion: '1.4',
  metadata: {
    component: {
      name: 'ecommerce-backend',
      version: '2.5.0',
      type: 'application',
      'bom-ref': 'root',
    },
  },
  components: [
    {
      name: 'express',
      version: '4.18.2',
      group: 'npm',
      type: 'library',
      'bom-ref': 'pkg:npm/express@4.18.2',
      purl: 'pkg:npm/express@4.18.2',
      licenses: [{ license: { id: 'MIT', name: 'MIT License' } }],
    },
    {
      name: 'qs',
      version: '6.11.0',
      group: 'npm',
      type: 'library',
      'bom-ref': 'pkg:npm/qs@6.11.0',
      purl: 'pkg:npm/qs@6.11.0',
      licenses: [{ license: { id: 'BSD-3-Clause', name: 'BSD 3-Clause License' } }],
    },
  ],
  dependencies: [
    { ref: 'root', dependsOn: ['pkg:npm/express@4.18.2'] },
    { ref: 'pkg:npm/express@4.18.2', dependsOn: ['pkg:npm/qs@6.11.0'] },
  ],
  vulnerabilities: [
    {
      id: 'CVE-2024-1234',
      ratings: [{ severity: 'critical', score: 9.8 }],
      description: 'Critical Remote Code Execution in express',
      recommendation: 'Upgrade express to 4.19.0 or higher',
      affects: [{ ref: 'pkg:npm/express@4.18.2' }],
    },
  ],
});

describe('CycloneDX SCA Visualizer - End-to-End Application Integration', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  it('should render initial landing page with header, dropzone, and sample loaders', () => {
    // Arrange & Act
    render(<App />);

    // Assert
    expect(screen.getByText('CycloneDX SCA Visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    expect(screen.getByTestId('sample-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-dashboard')).not.toBeInTheDocument();
  });

  it('should load SBOM model and render Executive Dashboard when sample is loaded', async () => {
    // Arrange
    render(<App />);

    // Act - Click sample SBOM loader button
    const sampleButton = screen.getByTestId('sample-npm-button');
    fireEvent.click(sampleButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tab-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('tab-graph')).toBeInTheDocument();
    expect(screen.getByTestId('tab-tree')).toBeInTheDocument();
    expect(screen.getByTestId('tab-explorer')).toBeInTheDocument();
  });

  it('should allow switching across all 4 main tabs seamlessly', () => {
    // Arrange - Load model into Zustand store directly
    const model = parseAndNormalizeSbom(sampleSbomJson, 'sample.json');
    useScaStore.getState().setModel(model);

    render(<App />);

    // Assert initial Dashboard active
    expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();

    // Act 1 - Switch to Graph tab
    fireEvent.click(screen.getByTestId('tab-graph'));
    expect(screen.getByTestId('graph-canvas-container')).toBeInTheDocument();

    // Act 2 - Switch to Tree tab
    fireEvent.click(screen.getByTestId('tab-tree'));
    expect(screen.getByTestId('tree-view')).toBeInTheDocument();

    // Act 3 - Switch to Explorer tab
    fireEvent.click(screen.getByTestId('tab-explorer'));
    expect(screen.getByTestId('component-explorer')).toBeInTheDocument();
  });

  it('should trigger global PackageDetailModal when a package is inspected from Explorer tab', () => {
    // Arrange
    const model = parseAndNormalizeSbom(sampleSbomJson, 'sample.json');
    useScaStore.getState().setModel(model);
    useScaStore.getState().setActiveTab('explorer');

    render(<App />);

    // Act - Click inspect button on express row
    const inspectBtn = screen.getByTestId('inspect-button-pkg:npm/express@4.18.2');
    fireEvent.click(inspectBtn);

    // Assert - Global modal renders
    expect(screen.getByTestId('package-detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-package-name')).toHaveTextContent('express');

    // Act - Close modal
    const closeBtn = screen.getByTestId('modal-close-button');
    fireEvent.click(closeBtn);

    // Assert - Modal disappears
    expect(screen.queryByTestId('package-detail-modal')).not.toBeInTheDocument();
  });

  it('should switch application language between PT-BR and EN-US via header selector', () => {
    // Arrange
    render(<App />);
    const select = screen.getByTestId('language-select');

    // Act - Switch to English
    fireEvent.change(select, { target: { value: 'en-US' } });

    // Assert
    expect(screen.getByText('Executive Security Dashboard & Supply Chain Graph Visualizer')).toBeInTheDocument();

    // Act - Switch back to Portuguese
    fireEvent.change(select, { target: { value: 'pt-BR' } });
    expect(screen.getByText('Inteligência Executiva & Visualizador de Grafo de Supply Chain')).toBeInTheDocument();
  });

  it('should reset loaded SBOM and return to landing dropzone when clicking Novo SBOM button', () => {
    // Arrange
    const model = parseAndNormalizeSbom(sampleSbomJson, 'sample.json');
    useScaStore.getState().setModel(model);
    render(<App />);

    const resetBtn = screen.getAllByTestId('reset-sbom-button')[0];
    expect(resetBtn).toBeInTheDocument();

    // Act - Click reset button
    fireEvent.click(resetBtn);

    // Assert - Returned to landing page dropzone
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    expect(screen.queryByTestId('executive-dashboard')).not.toBeInTheDocument();
  });
});
