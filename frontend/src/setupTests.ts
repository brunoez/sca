import '@testing-library/jest-dom';

// Polyfill ResizeObserver for React Flow / xyflow
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserver;

// Polyfill DOMMatrixReadOnly if needed by SVG/Canvas in React Flow
if (typeof window.DOMMatrixReadOnly === 'undefined') {
  (window as any).DOMMatrixReadOnly = class DOMMatrixReadOnly {
    m11 = 1; m12 = 0; m21 = 0; m22 = 1; m41 = 0; m42 = 0;
  };
}
