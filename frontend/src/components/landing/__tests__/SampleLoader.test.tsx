import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SampleLoader } from '../SampleLoader';
import { useScaStore } from '../../../store/useScaStore';

describe('SampleLoader Resilience & Downstream Timeout Suite', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render sample buttons for OWASP Juice Shop and Python API', () => {
    render(<SampleLoader />);

    expect(screen.getByTestId('sample-juiceshop-button')).toBeInTheDocument();
    expect(screen.getByTestId('sample-python-button')).toBeInTheDocument();
  });

  it('should pass an AbortSignal timeout to fetch when loading a sample', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      // Assert that signal is passed
      expect(init?.signal).toBeDefined();
      return {
        ok: true,
        text: async () => JSON.stringify({
          bomFormat: 'CycloneDX',
          specVersion: '1.4',
          metadata: { component: { name: 'Fetched App', version: '2.0.0' } },
          components: [],
        }),
      } as any;
    });

    const onLoadedMock = vi.fn();
    render(<SampleLoader onLoaded={onLoadedMock} />);

    const juiceShopBtn = screen.getByTestId('sample-juiceshop-button');
    fireEvent.click(juiceShopBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
      expect(onLoadedMock).toHaveBeenCalled();
    });

    const model = useScaStore.getState().model;
    expect(model).not.toBeNull();
    expect(model?.metadata.componentName).toBe('Fetched App');
  });

  it('should gracefully fallback to embedded content when fetch fails with network error or timeout', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network Timeout / Connection Refused'));

    const onLoadedMock = vi.fn();
    render(<SampleLoader onLoaded={onLoadedMock} />);

    const juiceShopBtn = screen.getByTestId('sample-juiceshop-button');
    fireEvent.click(juiceShopBtn);

    await waitFor(() => {
      expect(onLoadedMock).toHaveBeenCalled();
    });

    const model = useScaStore.getState().model;
    expect(model).not.toBeNull();
    expect(model?.metadata.componentName).toBe('OWASP Juice Shop');
  });
});
