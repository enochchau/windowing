import { describe, it, expect } from 'vitest'
import * as CoreExports from '../index'

describe('Core exports', () => {
  it('should export all expected types and utilities', () => {
    // Hook exports
    expect(CoreExports.usePlacer).toBeDefined()
    expect(CoreExports.useVirtualList).toBeDefined()
    expect(CoreExports.useVirtualGrid).toBeDefined()
    expect(CoreExports.useAutoSizer).toBeDefined()
    
    // Component exports
    expect(CoreExports.VirtualList).toBeDefined()
    expect(CoreExports.VirtualGrid).toBeDefined()
    expect(CoreExports.AutoSizer).toBeDefined()
  })

  it('should export functions and components as expected types', () => {
    expect(typeof CoreExports.usePlacer).toBe('function')
    expect(typeof CoreExports.useVirtualList).toBe('function')
    expect(typeof CoreExports.useVirtualGrid).toBe('function')
    expect(typeof CoreExports.useAutoSizer).toBe('function')
    
    expect(typeof CoreExports.VirtualList).toBe('function')
    expect(typeof CoreExports.VirtualGrid).toBe('function')
    expect(typeof CoreExports.AutoSizer).toBe('function')
  })
})
