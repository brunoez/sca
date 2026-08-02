import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HowItWorks } from '../HowItWorks';
import { LanguageProvider } from '../../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider defaultLanguage="pt-BR">
      {ui}
    </LanguageProvider>
  );
};

describe('HowItWorks Component with CLI Tool Selector', () => {
  it('should render all 3 steps and default Trivy CLI tool command', () => {
    // Arrange & Act
    renderWithProviders(<HowItWorks />);

    // Assert
    expect(screen.getByText('01. Gere o SBOM CycloneDX')).toBeInTheDocument();
    expect(screen.getByTestId('cli-tool-tab-trivy')).toBeInTheDocument();
    expect(screen.getByTestId('cli-tool-tab-cdxgen')).toBeInTheDocument();
    expect(screen.getByTestId('cli-tool-tab-syft')).toBeInTheDocument();
    expect(screen.getByTestId('cli-tool-tab-cyclonedx')).toBeInTheDocument();

    // Default Trivy command
    expect(screen.getByTestId('selected-cli-command')).toHaveTextContent(
      'trivy fs --format cyclonedx --output sbom.json .'
    );
  });

  it('should switch selected command when clicking cdxgen tool tab', () => {
    // Arrange
    renderWithProviders(<HowItWorks />);

    // Act
    fireEvent.click(screen.getByTestId('cli-tool-tab-cdxgen'));

    // Assert
    expect(screen.getByTestId('selected-cli-command')).toHaveTextContent(
      'cdxgen -o sbom.json'
    );
  });

  it('should switch selected command when clicking Syft tool tab', () => {
    // Arrange
    renderWithProviders(<HowItWorks />);

    // Act
    fireEvent.click(screen.getByTestId('cli-tool-tab-syft'));

    // Assert
    expect(screen.getByTestId('selected-cli-command')).toHaveTextContent(
      'syft . -o cyclonedx-json=sbom.json'
    );
  });

  it('should copy CLI command to clipboard when clicking copy button', () => {
    // Arrange
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderWithProviders(<HowItWorks />);

    // Act
    fireEvent.click(screen.getByTestId('copy-cli-command-trivy'));

    // Assert
    expect(writeTextMock).toHaveBeenCalledWith('trivy fs --format cyclonedx --output sbom.json .');
  });
});
