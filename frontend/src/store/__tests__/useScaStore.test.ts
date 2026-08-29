import { describe, it, expect, beforeEach } from 'vitest';
import { useScaStore } from '../useScaStore';
import { ScaSbomModel } from '../../models/sca';

describe('useScaStore', () => {
  beforeEach(() => {
    useScaStore.getState().reset();
  });

  it('should initialize with default state', () => {
    const state = useScaStore.getState();
    expect(state.model).toBeNull();
    expect(state.selectedComponentRef).toBeNull();
    expect(state.activeTab).toBe('dashboard');
    expect(state.searchFilter).toBe('');
    expect(state.impactPathRefs).toEqual([]);
  });

  it('should update activeTab and searchFilter', () => {
    useScaStore.getState().setActiveTab('graph');
    expect(useScaStore.getState().activeTab).toBe('graph');

    useScaStore.getState().setSearchFilter('react');
    expect(useScaStore.getState().searchFilter).toBe('react');
  });

  it('should set model and reset selections', () => {
    const mockModel: ScaSbomModel = {
      metadata: {
        componentName: 'test-app',
        componentVersion: '1.0.0',
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
            licenses: [],
            vulnerabilities: [],
            ancestorRefs: ['root'],
          },
        ],
      ]),
      dependenciesGraph: new Map([['root', ['pkg:npm/express@4.18.2']]]),
      vulnerabilities: [],
      summary: {
        totalComponents: 1,
        directComponentsCount: 1,
        transitiveComponentsCount: 0,
        maxTreeDepth: 1,
        vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        licenseBreakdown: { permissive: 1, copyleft: 0, unknown: 0 },
        scaHealthScore: 100,
        securityGrade: 'A+',
      },
    };

    useScaStore.getState().setModel(mockModel);
    expect(useScaStore.getState().model).toBe(mockModel);
  });

  it('should select component and calculate impact path containing ancestors', () => {
    const mockModel: ScaSbomModel = {
      metadata: {
        componentName: 'test-app',
        componentVersion: '1.0.0',
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
            licenses: [],
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
            licenses: [],
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
        vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
        licenseBreakdown: { permissive: 2, copyleft: 0, unknown: 0 },
        scaHealthScore: 100,
        securityGrade: 'A+',
      },
    };

    useScaStore.getState().setModel(mockModel);
    useScaStore.getState().selectComponent('pkg:npm/qs@6.11.0');

    expect(useScaStore.getState().selectedComponentRef).toBe('pkg:npm/qs@6.11.0');
    expect(useScaStore.getState().impactPathRefs).toEqual([
      'root',
      'pkg:npm/express@4.18.2',
      'pkg:npm/qs@6.11.0',
    ]);
  });

  it('should reset store state back to initial values', () => {
    useScaStore.getState().setActiveTab('explorer');
    useScaStore.getState().setSearchFilter('qs');
    useScaStore.getState().reset();

    const state = useScaStore.getState();
    expect(state.activeTab).toBe('dashboard');
    expect(state.searchFilter).toBe('');
  });
});
