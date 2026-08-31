import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerWebMcpTools } from '../webMcp';
import { useScaStore } from '../../store/useScaStore';

describe('WebMCP Tools API Security & Resilience Suite', () => {
  let mockProvideContext: any;

  beforeEach(() => {
    useScaStore.getState().reset();
    mockProvideContext = vi.fn();

    // Mock navigator.modelContext
    Object.defineProperty(global.navigator, 'modelContext', {
      value: {
        provideContext: mockProvideContext,
      },
      writable: true,
      configurable: true,
    });
  });

  it('should register analyze_sbom and get_security_score tools on navigator.modelContext', () => {
    registerWebMcpTools();

    expect(mockProvideContext).toHaveBeenCalledTimes(1);
    const contextArg = mockProvideContext.mock.calls[0][0];
    expect(contextArg.tools).toHaveLength(2);

    const toolNames = contextArg.tools.map((t: any) => t.name);
    expect(toolNames).toContain('analyze_sbom');
    expect(toolNames).toContain('get_security_score');
  });

  it('should reject payloads exceeding 50MB limit with a structured error', async () => {
    registerWebMcpTools();
    const contextArg = mockProvideContext.mock.calls[0][0];
    const analyzeTool = contextArg.tools.find((t: any) => t.name === 'analyze_sbom');

    // Create string larger than 50MB (50 * 1024 * 1024 + 10 bytes)
    const largeContent = 'a'.repeat(50 * 1024 * 1024 + 10);

    const result = await analyzeTool.execute({
      sbomContent: largeContent,
      fileName: 'huge.json',
    });

    expect(result).toEqual({
      success: false,
      error: 'Payload excede o limite máximo permitido de 50MB.',
    });

    // Store should remain empty
    expect(useScaStore.getState().model).toBeNull();
  });

  it('should return structured error without crashing on invalid or malformed SBOM content', async () => {
    registerWebMcpTools();
    const contextArg = mockProvideContext.mock.calls[0][0];
    const analyzeTool = contextArg.tools.find((t: any) => t.name === 'analyze_sbom');

    const result = await analyzeTool.execute({
      sbomContent: '{ invalid json content !!!',
      fileName: 'corrupted.json',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(useScaStore.getState().model).toBeNull();
  });

  it('should parse and set valid CycloneDX SBOM model in central store', async () => {
    registerWebMcpTools();
    const contextArg = mockProvideContext.mock.calls[0][0];
    const analyzeTool = contextArg.tools.find((t: any) => t.name === 'analyze_sbom');

    const validSbom = JSON.stringify({
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      metadata: {
        component: {
          name: 'Test App',
          version: '1.0.0',
        },
      },
      components: [
        {
          name: 'lodash',
          version: '4.17.21',
          licenses: [{ license: { id: 'MIT' } }],
        },
      ],
    });

    const result = await analyzeTool.execute({
      sbomContent: validSbom,
      fileName: 'test-sbom.json',
    });

    expect(result.success).toBe(true);
    expect(result.componentName).toBe('Test App');
    expect(result.totalComponents).toBe(1);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A+');

    // Store must be populated
    const model = useScaStore.getState().model;
    expect(model).not.toBeNull();
    expect(model?.metadata.componentName).toBe('Test App');
  });

  it('should return error on get_security_score when no model is loaded, and return score when loaded', async () => {
    registerWebMcpTools();
    const contextArg = mockProvideContext.mock.calls[0][0];
    const scoreTool = contextArg.tools.find((t: any) => t.name === 'get_security_score');

    // Case 1: No model loaded
    const emptyResult = await scoreTool.execute({});
    expect(emptyResult).toEqual({ error: 'No SBOM model currently loaded' });

    // Case 2: Model loaded
    const analyzeTool = contextArg.tools.find((t: any) => t.name === 'analyze_sbom');
    await analyzeTool.execute({
      sbomContent: JSON.stringify({
        bomFormat: 'CycloneDX',
        specVersion: '1.4',
        metadata: { component: { name: 'App', version: '1.0' } },
        components: [],
      }),
      fileName: 'app.json',
    });

    const populatedResult = await scoreTool.execute({});
    expect(populatedResult.score).toBe(100);
    expect(populatedResult.grade).toBe('A+');
    expect(populatedResult.vulnerabilities).toBeDefined();
    expect(populatedResult.licenses).toBeDefined();
  });
});
