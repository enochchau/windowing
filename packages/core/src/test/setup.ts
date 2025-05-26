import '@testing-library/jest-dom'

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollTo for tests
Element.prototype.scrollTo = vi.fn()
HTMLElement.prototype.scrollTo = vi.fn()

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}))
