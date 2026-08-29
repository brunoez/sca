import { create } from 'zustand';
import { ScaSbomModel } from '../models/sca';

export type ActiveTab = 'dashboard' | 'graph' | 'tree' | 'explorer';

export interface ScaState {
  model: ScaSbomModel | null;
  selectedComponentRef: string | null;
  activeTab: ActiveTab;
  searchFilter: string;
  impactPathRefs: string[];

  // Actions
  setModel: (model: ScaSbomModel | null) => void;
  setSelectedComponentRef: (ref: string | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSearchFilter: (filter: string) => void;
  setImpactPathRefs: (refs: string[]) => void;
  selectComponent: (ref: string | null) => void;
  reset: () => void;
  clearModel: () => void;
}

export const useScaStore = create<ScaState>((set, get) => ({
  model: null,
  selectedComponentRef: null,
  activeTab: 'dashboard',
  searchFilter: '',
  impactPathRefs: [],

  setModel: (model) =>
    set({
      model,
      selectedComponentRef: null,
      impactPathRefs: [],
    }),

  setSelectedComponentRef: (ref) => set({ selectedComponentRef: ref }),

  setActiveTab: (activeTab) => set({ activeTab }),

  setSearchFilter: (searchFilter) => set({ searchFilter }),

  setImpactPathRefs: (impactPathRefs) => set({ impactPathRefs }),

  selectComponent: (ref) => {
    const { model } = get();
    if (!ref || !model) {
      set({ selectedComponentRef: null, impactPathRefs: [] });
      return;
    }

    const component = model.components.get(ref);
    if (component) {
      const impactPath = [...component.ancestorRefs, ref];
      set({ selectedComponentRef: ref, impactPathRefs: impactPath });
    } else {
      set({ selectedComponentRef: ref, impactPathRefs: [ref] });
    }
  },

  reset: () =>
    set({
      model: null,
      selectedComponentRef: null,
      activeTab: 'dashboard',
      searchFilter: '',
      impactPathRefs: [],
    }),

  clearModel: () =>
    set({
      model: null,
      selectedComponentRef: null,
      impactPathRefs: [],
    }),
}));
