import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dropzone } from '../Dropzone';
import { SampleLoader } from '../SampleLoader';
import { useScaStore } from '../../../store/useScaStore';
import { LanguageProvider } from '../../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider defaultLanguage="pt-BR">
      {ui}
    </LanguageProvider>
  );
};

describe('Dropzone Component', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  it('should render dropzone interface correctly', () => {
    // Arrange & Act
    renderWithProviders(<Dropzone />);

    // Assert
    expect(screen.getByRole('button', { name: /zona de upload/i })).toBeInTheDocument();
    expect(screen.getByText(/carregar sbom cyclonedx/i)).toBeInTheDocument();
    expect(screen.getByText(/arraste um arquivo cyclonedx json ou xml/i)).toBeInTheDocument();
  });

  it('should parse and load valid CycloneDX JSON file via file input', async () => {
    // Arrange
    renderWithProviders(<Dropzone />);
    const validJsonContent = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: {
        component: { name: 'test-app', version: '1.0.0', 'bom-ref': 'root-ref' }
      },
      components: [
        { name: 'express', version: '4.18.2', 'bom-ref': 'pkg:npm/express@4.18.2' }
      ],
      dependencies: [
        { ref: 'root-ref', dependsOn: ['pkg:npm/express@4.18.2'] }
      ]
    });

    const file = new File([validJsonContent], 'bom.json', { type: 'application/json' });
    const fileInput = screen.getByTestId('file-input');

    // Act
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Assert
    await waitFor(() => {
      const model = useScaStore.getState().model;
      expect(model).not.toBeNull();
      expect(model?.metadata.componentName).toBe('test-app');
      expect(model?.summary.totalComponents).toBe(1);
    });

    expect(screen.getByTestId('dropzone-success')).toHaveTextContent('bom.json');
  });

  it('should display error message when unsupported file extension is selected', async () => {
    // Arrange
    renderWithProviders(<Dropzone />);
    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('file-input');

    // Act
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('dropzone-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dropzone-error')).toHaveTextContent('Formato não suportado');
    expect(useScaStore.getState().model).toBeNull();
  });

  it('should handle drop event with valid XML file', async () => {
    // Arrange
    renderWithProviders(<Dropzone />);
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.4" version="1">
  <metadata>
    <component bom-ref="pkg:pypi/my-python-app@1.0.0" type="application">
      <name>my-python-app</name>
      <version>1.0.0</version>
    </component>
  </metadata>
  <components>
    <component bom-ref="pkg:pypi/requests@2.31.0" type="library">
      <name>requests</name>
      <version>2.31.0</version>
    </component>
  </components>
  <dependencies>
    <dependency ref="pkg:pypi/my-python-app@1.0.0">
      <dependency ref="pkg:pypi/requests@2.31.0" />
    </dependency>
  </dependencies>
</bom>`;

    const file = new File([xmlContent], 'bom.xml', { type: 'text/xml' });
    const dropzoneEl = screen.getByRole('button', { name: /zona de upload/i });

    // Act
    fireEvent.drop(dropzoneEl, {
      dataTransfer: {
        files: [file],
      },
    });

    // Assert
    await waitFor(() => {
      const model = useScaStore.getState().model;
      expect(model).not.toBeNull();
      expect(model?.metadata.componentName).toBe('my-python-app');
      expect(model?.metadata.format).toBe('xml');
    });
  });
});

describe('SampleLoader Component', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  it('should load OWASP Juice Shop JSON sample when Juice Shop sample button is clicked', async () => {
    // Arrange
    renderWithProviders(<SampleLoader />);
    const juiceShopButton = screen.getByTestId('sample-juiceshop-button');

    // Act
    fireEvent.click(juiceShopButton);

    // Assert
    await waitFor(() => {
      const model = useScaStore.getState().model;
      expect(model).not.toBeNull();
      expect(model?.metadata.componentName).toBe('OWASP Juice Shop');
    });
  });

  it('should load Python XML sample when Python sample button is clicked', async () => {
    // Arrange
    renderWithProviders(<SampleLoader />);
    const pythonButton = screen.getByTestId('sample-python-button');

    // Act
    fireEvent.click(pythonButton);

    // Assert
    await waitFor(() => {
      const model = useScaStore.getState().model;
      expect(model).not.toBeNull();
      expect(model?.metadata.componentName).toBe('api-service');
      expect(model?.metadata.format).toBe('xml');
    });
  });
});
