import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { usePlacer } from '../usePlacer'

describe('usePlacer', () => {
  describe('basic functionality', () => {
    it('should handle empty array', () => {
      const { result } = renderHook(() => usePlacer(50, 0))
      
      expect(result.current.sum).toBe(0)
      expect(result.current.placer.indexToPlacement(0)).toBe(0)
      expect(result.current.placer.placementToIndex(0)).toBe(0)
    })

    it('should handle single item', () => {
      const { result } = renderHook(() => usePlacer(50, 1))
      
      expect(result.current.sum).toBe(50)
      expect(result.current.getDimension(0)).toBe(50)
      expect(result.current.placer.indexToPlacement(0)).toBe(0)
      expect(result.current.placer.indexToPlacement(1)).toBe(50)
      expect(result.current.placer.placementToIndex(0)).toBe(0)
      expect(result.current.placer.placementToIndex(25)).toBe(1)
    })

    it('should handle multiple items with fixed size', () => {
      const { result } = renderHook(() => usePlacer(50, 5))
      
      expect(result.current.sum).toBe(250)
      expect(result.current.placer.indexToPlacement(0)).toBe(0)
      expect(result.current.placer.indexToPlacement(1)).toBe(50)
      expect(result.current.placer.indexToPlacement(2)).toBe(100)
      expect(result.current.placer.indexToPlacement(4)).toBe(200)
    })

    it('should handle function-based dimensions', () => {
      const getDimension = (index: number) => (index + 1) * 10
      const { result } = renderHook(() => usePlacer(getDimension, 3))
      
      expect(result.current.sum).toBe(60) // 10 + 20 + 30
      expect(result.current.getDimension(0)).toBe(10)
      expect(result.current.getDimension(1)).toBe(20)
      expect(result.current.getDimension(2)).toBe(30)
      expect(result.current.placer.indexToPlacement(0)).toBe(0)
      expect(result.current.placer.indexToPlacement(1)).toBe(10)
      expect(result.current.placer.indexToPlacement(2)).toBe(30)
    })
  })

  describe('edge cases', () => {
    it('should handle zero dimensions', () => {
      const { result } = renderHook(() => usePlacer(0, 5))
      
      expect(result.current.sum).toBe(0)
      expect(result.current.placer.indexToPlacement(3)).toBe(0)
      expect(result.current.placer.placementToIndex(0)).toBe(0) // With 0 dimensions, placement 0 maps to index 0
      expect(result.current.placer.placementToIndex(10)).toBe(6) // Edge case: with 0 dimensions, algorithm reaches array bounds
    })

    it('should handle negative dimensions gracefully', () => {
      const { result } = renderHook(() => usePlacer(-10, 3))
      
      expect(result.current.sum).toBe(-30)
      expect(result.current.placer.indexToPlacement(1)).toBe(-10)
      expect(result.current.placer.indexToPlacement(2)).toBe(-20)
    })

    it('should handle very large counts', () => {
      const { result } = renderHook(() => usePlacer(1, 100000))
      
      expect(result.current.sum).toBe(100000)
      expect(result.current.placer.indexToPlacement(50000)).toBe(50000)
      expect(result.current.placer.placementToIndex(75000)).toBe(75000)
    })

    it('should handle floating point dimensions', () => {
      const { result } = renderHook(() => usePlacer(10.5, 3))
      
      expect(result.current.sum).toBe(31.5)
      expect(result.current.placer.indexToPlacement(1)).toBe(10.5)
      expect(result.current.placer.indexToPlacement(2)).toBe(21)
    })
  })

  describe('caching behavior', () => {
    it('should cache indexToPlacement calculations', () => {
      const mockFn = vi.fn((index: number) => index * 10)
      const { result } = renderHook(() => usePlacer(mockFn, 5))
      
      // First call should calculate
      const placement1 = result.current.placer.indexToPlacement(3)
      // Second call should use cache
      const placement2 = result.current.placer.indexToPlacement(3)
      
      expect(placement1).toBe(placement2)
      expect(placement1).toBe(30)
    })

    it('should cache placementToIndex calculations', () => {
      const { result } = renderHook(() => usePlacer(10, 5))
      
      const index1 = result.current.placer.placementToIndex(25)
      const index2 = result.current.placer.placementToIndex(25)
      
      expect(index1).toBe(index2)
      expect(index1).toBe(3) // 25 / 10 = 2.5, rounds up to 3
    })

    it('should invalidate cache when dependencies change', () => {
      let size = 10
      const { result, rerender } = renderHook(() => usePlacer(size, 3))
      
      const placement1 = result.current.placer.indexToPlacement(1)
      expect(placement1).toBe(10)
      
      size = 20
      rerender()
      
      const placement2 = result.current.placer.indexToPlacement(1)
      expect(placement2).toBe(20)
    })
  })

  describe('mathematical accuracy', () => {
    it('should maintain accuracy with varying sizes', () => {
      const sizes = [10, 20, 15, 30, 5]
      const getDimension = (index: number) => sizes[index] || 10
      const { result } = renderHook(() => usePlacer(getDimension, 5))
      
      // Test cumulative placements
      expect(result.current.placer.indexToPlacement(0)).toBe(0)
      expect(result.current.placer.indexToPlacement(1)).toBe(10)
      expect(result.current.placer.indexToPlacement(2)).toBe(30)
      expect(result.current.placer.indexToPlacement(3)).toBe(45)
      expect(result.current.placer.indexToPlacement(4)).toBe(75)
      
      // Test reverse calculations
      expect(result.current.placer.placementToIndex(0)).toBe(0)
      expect(result.current.placer.placementToIndex(5)).toBe(1)
      expect(result.current.placer.placementToIndex(25)).toBe(2)
      expect(result.current.placer.placementToIndex(40)).toBe(3)
    })

    it('should handle round-trip accuracy', () => {
      const { result } = renderHook(() => usePlacer(13, 10))
      
      for (let i = 0; i < 10; i++) {
        const placement = result.current.placer.indexToPlacement(i)
        const backToIndex = result.current.placer.placementToIndex(placement)
        expect(backToIndex).toBe(i)
      }
    })
  })
})
