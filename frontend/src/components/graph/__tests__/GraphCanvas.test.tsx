import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { GraphCanvas } from '../GraphCanvas';
import { useScaStore } from '../../../store/useScaStore';
import { ScaSbomModel, ScaComponent } from '../../../models/sca';

describe('GraphCanvas Component', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  const createMockModel = (): ScaSbomModel => {
    const componentsMap = new Map<string, ScaComponent>();

    componentsMap.set('pkg:npm/express@4.18.2', {
      bomRef: 'pkg:npm/express@4.18.2',
      name: 'express',
      version: '4.18.2',
      isDirect: true,
      depth: 1,
      licenses: [{ id: 'MIT', name: 'MIT License', type: 'permissive' }],
      vulnerabilities: [],
      ancestorRefs: ['root'],
    });

    componentsMap.set('pkg:npm/qs@6.11.0', {
      bomRef: 'pkg:npm/qs@6.11.0',
      name: 'qs',
      version: '6.11.0',
      isDirect: false,
      depth: 2,
      licenses: [{ id: 'BSD-3-Clause', name: 'BSD 3-Clause', type: 'permissive' }],
      vulnerabilities: [],
      ancestorRefs: ['root', 'pkg:npm/express@4.18.2'],
    });

    const dependenciesGraph = new Map<string, string[]>();
    dependenciesGraph.set('root', ['pkg:npm/express@4.18.2']);
    dependenciesGraph.set('pkg:npm/express@4.18.2', ['pkg:npm/qs@6.11.0']);

    return {
      metadata: {
        componentName: 'my-app',
        componentVersion: '1.0.0',
        specVersion: '1.4',
        format: 'json',
      },
      components: componentsMap,
      dependenciesGraph,
      vulnerabilities: [],
      summary: {
        totalComponents: 2,
        directComponentsCount: 1,
        transitiveComponentsCount: 1,
        maxTreeDepth: 2,
        vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        licenseBreakdown: { permissive: 2, copyleft: 0, unknown: 0 },
        scaHealthScore: 100,
        securityGrade: 'A+',
      },
    };
  };

  it('should render empty state message when no model is available', () => {
    // Arrange
    useScaStore.getState().reset();

    // Act
    render(<GraphCanvas />);

    // Assert
    expect(screen.getByText('Grafo 2D de Dependências Indisponível')).toBeInTheDocument();
    expect(
      screen.getByText(/Carregue um arquivo SBOM no formato CycloneDX/i)
    ).toBeInTheDocument();
  });

  it('should render 2D canvas and panel header when model is loaded in store', () => {
    // Arrange
    const model = createMockModel();
    useScaStore.getState().setModel(model);

    // Act
    render(<GraphCanvas />);

    // Assert
    expect(screen.getByTestId('graph-canvas-container')).toBeInTheDocument();
    expect(screen.getByText('Navegador Topológico 2D')).toBeInTheDocument();
    expect(screen.getByText(/3 nós/i)).toBeInTheDocument();
  });

  it('should display impact path panel when a library component is selected', () => {
    // Arrange
    const model = createMockModel();
    useScaStore.getState().setModel(model);
    useScaStore.getState().selectComponent('pkg:npm/qs@6.11.0');

    // Act
    render(<GraphCanvas />);

    // Assert
    expect(screen.getByText('Caminho de Impacto: qs')).toBeInTheDocument();
    expect(screen.getByText('my-app')).toBeInTheDocument();
    expect(screen.getByText('express')).toBeInTheDocument();
    expect(screen.getByText('qs')).toBeInTheDocument();
  });
});
