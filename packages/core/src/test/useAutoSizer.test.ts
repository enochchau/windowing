import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAutoSizer } from '../useAutoSizer'

// Mock ResizeObserver
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}))

describe('useAutoSizer', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', mockResizeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useAutoSizer())

    expect(result.current.ref).toBeDefined()
    expect(result.current.ref.current).toBeNull()
    expect(result.current.dimensions).toEqual({ width: 0, height: 0 })
    expect(result.current.isReady).toBe(false)
  })

  it('should maintain stable ref reference', () => {
    const { result, rerender } = renderHook(() => useAutoSizer())

    const initialRef = result.current.ref
    rerender()

    expect(result.current.ref).toBe(initialRef)
  })

  it('should provide consistent API', () => {
    const { result } = renderHook(() => useAutoSizer())

    // Check that the hook returns expected properties
    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('dimensions')
    expect(result.current).toHaveProperty('isReady')

    // Check types
    expect(typeof result.current.dimensions.width).toBe('number')
    expect(typeof result.current.dimensions.height).toBe('number')
    expect(typeof result.current.isReady).toBe('boolean')
  })

  it('should not crash when ResizeObserver is not available', () => {
    vi.unstubAllGlobals()
    vi.stubGlobal('ResizeObserver', undefined)

    expect(() => {
      renderHook(() => useAutoSizer())
    }).not.toThrow()
  })

  it('should handle ref assignment without crashing', () => {
    const { result } = renderHook(() => useAutoSizer())
    
    // Create a mock element with minimal required properties
    const mockElement = document.createElement('div')
    
    expect(() => {
      // @ts-expect-error - Testing ref assignment
      result.current.ref.current = mockElement
    }).not.toThrow()
  })

  it('should maintain state consistency across renders', () => {
    const { result, rerender } = renderHook(() => useAutoSizer())

    const initialDimensions = result.current.dimensions
    const initialIsReady = result.current.isReady

    rerender()

    expect(result.current.dimensions).toEqual(initialDimensions)
    expect(result.current.isReady).toBe(initialIsReady)
  })
})
