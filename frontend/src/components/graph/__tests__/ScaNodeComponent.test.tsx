import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScaNodeComponent } from '../ScaNodeComponent';
import { ScaNodeData } from '../../../services/graphLayout';
import { ReactFlowProvider } from '@xyflow/react';

describe('ScaNodeComponent', () => {
  const renderNode = (data: ScaNodeData) => {
    return render(
      <ReactFlowProvider>
        <ScaNodeComponent
          id={data.bomRef}
          data={data}
          type="scaNode"
          selected={false}
          zIndex={1}
          isConnectable={true}
          positionAbsoluteX={0}
          positionAbsoluteY={0}
          dragging={false}
        />
      </ReactFlowProvider>
    );
  };

  it('should render root package details correctly', () => {
    // Arrange & Act
    renderNode({
      bomRef: 'root',
      name: 'my-root-app',
      version: '1.0.0',
      isRoot: true,
      isDirect: false,
      depth: 0,
      licenses: [],
      vulnerabilities: [],
      isImpactPath: false,
      isSelected: false,
    });

    // Assert
    expect(screen.getByText('my-root-app')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Raiz')).toBeInTheDocument();
    expect(screen.getByText('Sem Licença')).toBeInTheDocument();
    expect(screen.getByText('0 CVEs')).toBeInTheDocument();
  });

  it('should render direct dependency with permissive license and CVE badge', () => {
    // Arrange & Act
    renderNode({
      bomRef: 'pkg:npm/react@18.3.1',
      name: 'react',
      version: '18.3.1',
      isRoot: false,
      isDirect: true,
      depth: 1,
      licenses: [{ id: 'MIT', name: 'MIT License', type: 'permissive' }],
      vulnerabilities: [
        {
          id: 'CVE-2024-9999',
          severity: 'high',
          affectsBomRef: 'pkg:npm/react@18.3.1',
        },
      ],
      isImpactPath: true,
      isSelected: true,
    });

    // Assert
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('v18.3.1')).toBeInTheDocument();
    expect(screen.getByText('Direta')).toBeInTheDocument();
    expect(screen.getByText('MIT License')).toBeInTheDocument();
    expect(screen.getByText('1 CVE')).toBeInTheDocument();
  });

  it('should render transitive dependency with level depth badge', () => {
    // Arrange & Act
    renderNode({
      bomRef: 'pkg:npm/loose-envify@1.4.0',
      name: 'loose-envify',
      version: '1.4.0',
      isRoot: false,
      isDirect: false,
      depth: 3,
      licenses: [{ id: 'MIT', name: 'MIT', type: 'permissive' }],
      vulnerabilities: [],
      isImpactPath: false,
      isSelected: false,
    });

    // Assert
    expect(screen.getByText('loose-envify')).toBeInTheDocument();
    expect(screen.getByText('Transitiva Lvl 3')).toBeInTheDocument();
  });
});
