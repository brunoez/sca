import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider, useTranslation } from '../LanguageContext';

const TestComponent: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <h1 data-testid="title">{t('appTitle')}</h1>
      <p data-testid="subtitle">{t('subtitle')}</p>
      <span data-testid="tab-dash">{t('tabs.dashboard')}</span>
      <span data-testid="non-existent">{t('non.existent.key')}</span>
      <button data-testid="btn-en" onClick={() => setLanguage('en-US')}>
        EN
      </button>
      <button data-testid="btn-pt" onClick={() => setLanguage('pt-BR')}>
        PT
      </button>
    </div>
  );
};

describe('LanguageContext i18n', () => {
  beforeEach(() => {
    document.documentElement.lang = '';
  });

  it('should render default pt-BR translation and synchronize html lang attribute', () => {
    // Arrange & Act
    render(
      <LanguageProvider defaultLanguage="pt-BR">
        <TestComponent />
      </LanguageProvider>
    );

    // Assert
    expect(screen.getByTestId('current-lang')).toHaveTextContent('pt-BR');
    expect(screen.getByTestId('subtitle')).toHaveTextContent(
      'Inteligência Executiva & Visualizador de Grafo de Supply Chain'
    );
    expect(screen.getByTestId('tab-dash')).toHaveTextContent('Dashboard Executivo');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('should dynamically switch language from pt-BR to en-US and update html lang attribute', () => {
    // Arrange
    render(
      <LanguageProvider defaultLanguage="pt-BR">
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('subtitle')).toHaveTextContent(
      'Inteligência Executiva & Visualizador de Grafo de Supply Chain'
    );

    // Act
    act(() => {
      screen.getByTestId('btn-en').click();
    });

    // Assert
    expect(screen.getByTestId('current-lang')).toHaveTextContent('en-US');
    expect(screen.getByTestId('subtitle')).toHaveTextContent(
      'Executive Security Dashboard & Supply Chain Graph Visualizer'
    );
    expect(screen.getByTestId('tab-dash')).toHaveTextContent('Executive Dashboard');
    expect(document.documentElement.lang).toBe('en-US');
  });

  it('should fallback to missing key path when translation key does not exist', () => {
    // Arrange & Act
    render(
      <LanguageProvider defaultLanguage="en-US">
        <TestComponent />
      </LanguageProvider>
    );

    // Assert
    expect(screen.getByTestId('non-existent')).toHaveTextContent('non.existent.key');
  });

  it('should provide default fallback context when useTranslation is called outside LanguageProvider', () => {
    // Arrange
    const TestFallbackComponent = () => {
      const { language, t } = useTranslation();
      return (
        <div>
          <span data-testid="fallback-lang">{language}</span>
          <span data-testid="fallback-t">{t('tabs.dashboard')}</span>
        </div>
      );
    };

    // Act
    render(<TestFallbackComponent />);

    // Assert
    expect(screen.getByTestId('fallback-lang')).toHaveTextContent('pt-BR');
    expect(screen.getByTestId('fallback-t')).toHaveTextContent('Dashboard Executivo');
  });
});
