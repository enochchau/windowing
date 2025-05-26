import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVirtualList } from '../useVirtualList'
import { useVirtualGrid } from '../useVirtualGrid'

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useVirtualList + usePlacer integration', () => {
    it('should work correctly with dynamic item sizes', () => {
      const getItemHeight = (index: number) => {
        if (index < 5) return 30
        if (index < 10) return 50
        return 40
      }

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 20,
          itemHeight: getItemHeight,
          height: 300,
        })
      )

      // Test placer integration
      expect(result.current.listProps.getItemHeight(0)).toBe(30)
      expect(result.current.listProps.getItemHeight(7)).toBe(50)
      expect(result.current.listProps.getItemHeight(15)).toBe(40)

      // Test placement calculations
      expect(result.current.listProps.getItemPlacement(0)).toBe(0)
      expect(result.current.listProps.getItemPlacement(5)).toBe(150) // 5 * 30
      expect(result.current.listProps.getItemPlacement(10)).toBe(400) // 5*30 + 5*50
    })

    it('should handle complex scroll scenarios with sticky items', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
          stickyItemCount: 3,
        })
      )

      const mockElement = {
        scrollTop: 500,
        clientHeight: 400,
      }
      result.current.listProps.outerRef.current = mockElement as any

      act(() => {
        result.current.listProps.onOuterScroll({} as any)
      })

      // Visible range should account for scroll position
      expect(result.current.listProps.visibleIndex.start).toBe(10) // 500 / 50
      expect(result.current.listProps.visibleIndex.end).toBe(18) // (500 + 400) / 50

      // Scroll to item should account for sticky offset
      const mockScrollTo = vi.fn()
      mockElement.scrollTo = mockScrollTo

      act(() => {
        result.current.scrollToItem(20)
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 850, // 20 * 50 - 3 * 50 (sticky offset)
      })
    })
  })

  describe('useVirtualGrid + usePlacer integration', () => {
    it('should work correctly with variable dimensions', () => {
      const getRowHeight = (index: number) => (index % 2 === 0 ? 30 : 40)
      const getColumnWidth = (index: number) => (index % 3 === 0 ? 100 : 80)

      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 10,
          columnCount: 15,
          rowHeight: getRowHeight,
          columnWidth: getColumnWidth,
          height: 400,
          width: 600,
        })
      )

      // Test dimension functions
      expect(result.current.gridProps.getRowHeight(0)).toBe(30)
      expect(result.current.gridProps.getRowHeight(1)).toBe(40)
      expect(result.current.gridProps.getColumnWidth(0)).toBe(100)
      expect(result.current.gridProps.getColumnWidth(1)).toBe(80)

      // Test placement calculations
      expect(result.current.gridProps.getRowPlacement(0)).toBe(0)
      expect(result.current.gridProps.getRowPlacement(2)).toBe(70) // 30 + 40
      expect(result.current.gridProps.getColumnPlacement(0)).toBe(0)
      expect(result.current.gridProps.getColumnPlacement(3)).toBe(260) // 100 + 80 + 80
    })

    it('should handle bidirectional scrolling with sticky headers', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
          stickyRowCount: 2,
          stickyColumnCount: 1,
        })
      )

      const mockElement = {
        scrollTop: 180,
        clientHeight: 400,
        scrollLeft: 360,
        clientWidth: 600,
      }
      result.current.gridProps.outerRef.current = mockElement as any

      act(() => {
        result.current.gridProps.onOuterScroll({} as any)
      })

      // Check visible indices
      expect(result.current.gridProps.visibleIndex.row.start).toBe(6) // 180 / 30
      expect(result.current.gridProps.visibleIndex.row.end).toBe(20) // (180 + 400) / 30, rounded up
      expect(result.current.gridProps.visibleIndex.column.start).toBe(3) // 360 / 120
      expect(result.current.gridProps.visibleIndex.column.end).toBe(8) // (360 + 600) / 120

      // Test scrollToCell with sticky offsets
      const mockScrollTo = vi.fn()
      mockElement.scrollTo = mockScrollTo

      act(() => {
        result.current.scrollToCell({
          rowIndex: 20,
          columnIndex: 10,
        })
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 540, // 20 * 30 - 2 * 30 (sticky row offset)
        left: 1080, // 10 * 120 - 1 * 120 (sticky column offset)
      })
    })
  })

  describe('Performance scenarios', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = performance.now()

      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100000,
          itemHeight: 50,
          height: 400,
        })
      )

      const endTime = performance.now()
      const initTime = endTime - startTime

      // Should initialize quickly (under 100ms is reasonable)
      expect(initTime).toBeLessThan(100)

      // Should handle scroll events efficiently
      const scrollStartTime = performance.now()

      const mockElement = {
        scrollTop: 250000, // Scroll to middle
        clientHeight: 400,
      }
      result.current.listProps.outerRef.current = mockElement as any

      act(() => {
        result.current.listProps.onOuterScroll({} as any)
      })

      const scrollEndTime = performance.now()
      const scrollTime = scrollEndTime - scrollStartTime

      expect(scrollTime).toBeLessThan(50)
      expect(result.current.listProps.visibleIndex.start).toBe(5000) // 250000 / 50
    })

    it('should handle rapid configuration changes', () => {
      const { result, rerender } = renderHook(
        ({ itemCount, height }) =>
          useVirtualList({
            itemCount,
            itemHeight: 50,
            height,
          }),
        {
          initialProps: { itemCount: 100, height: 400 },
        }
      )

      // Rapid changes should not cause errors
      for (let i = 0; i < 10; i++) {
        rerender({
          itemCount: 100 + i * 10,
          height: 400 + i * 50,
        })
      }

      expect(result.current.listProps.itemCount).toBe(190)
      expect(result.current.listProps.outerHeight).toBe(850)
    })
  })

  describe('Memory and cleanup', () => {
    it('should not leak memory on rapid re-renders', () => {
      const { result, rerender, unmount } = renderHook(() =>
        useVirtualList({
          itemCount: 1000,
          itemHeight: 50,
          height: 400,
        })
      )

      // Simulate rapid re-renders
      for (let i = 0; i < 100; i++) {
        rerender()
      }

      // Should still work correctly
      expect(result.current.listProps.itemCount).toBe(1000)

      // Should unmount without errors
      unmount()
    })

    it('should handle ref cleanup properly', () => {
      const { result, unmount } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      const mockElement = {
        scrollTop: 100,
        clientHeight: 400,
      }
      result.current.listProps.outerRef.current = mockElement as any

      // Should not throw on unmount
      unmount()
    })
  })

  describe('Error boundaries', () => {
    it('should handle invalid dimensions gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: () => NaN,
          height: 400,
        })
      )

      // Should not throw, but may have unexpected behavior
      expect(result.current.listProps.itemCount).toBe(100)
    })

    it('should handle negative scroll positions', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      const mockElement = {
        scrollTop: -100, // Negative scroll
        clientHeight: 400,
      }
      result.current.listProps.outerRef.current = mockElement as any

      // Should not throw
      act(() => {
        result.current.listProps.onOuterScroll({} as any)
      })

      // Should handle gracefully (likely clamp to 0)
      expect(result.current.listProps.visibleIndex.start).toBeGreaterThanOrEqual(0)
    })
  })
})
