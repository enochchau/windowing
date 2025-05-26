import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVirtualList } from '../useVirtualList'

describe('useVirtualList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      expect(result.current.listProps.itemCount).toBe(100)
      expect(result.current.listProps.outerHeight).toBe(400)
      expect(result.current.listProps.innerHeight).toBe(5000) // 100 * 50
      expect(result.current.listProps.stickyItemCount).toBe(0)
      expect(result.current.listProps.visibleIndex.start).toBe(0)
    })

    it('should handle sticky items', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
          stickyItemCount: 3,
        })
      )

      expect(result.current.listProps.stickyItemCount).toBe(3)
    })

    it('should handle variable item heights', () => {
      const getHeight = (index: number) => (index % 2 === 0 ? 50 : 30)
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 4,
          itemHeight: getHeight,
          height: 400,
        })
      )

      expect(result.current.listProps.getItemHeight(0)).toBe(50)
      expect(result.current.listProps.getItemHeight(1)).toBe(30)
      expect(result.current.listProps.getItemHeight(2)).toBe(50)
      expect(result.current.listProps.getItemHeight(3)).toBe(30)
      expect(result.current.listProps.innerHeight).toBe(160) // 50+30+50+30
    })
  })

  describe('edge cases', () => {
    it('should handle zero items', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 0,
          itemHeight: 50,
          height: 400,
        })
      )

      expect(result.current.listProps.itemCount).toBe(0)
      expect(result.current.listProps.innerHeight).toBe(0)
    })

    it('should handle single item', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 1,
          itemHeight: 50,
          height: 400,
        })
      )

      expect(result.current.listProps.itemCount).toBe(1)
      expect(result.current.listProps.innerHeight).toBe(50)
    })

    it('should handle zero height', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 0,
          height: 400,
        })
      )

      expect(result.current.listProps.innerHeight).toBe(0)
    })

    it('should handle very large item counts', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100000,
          itemHeight: 50,
          height: 400,
        })
      )

      expect(result.current.listProps.itemCount).toBe(100000)
      expect(result.current.listProps.innerHeight).toBe(5000000)
    })
  })

  describe('scrollToItem functionality', () => {
    it('should scroll to item at start position', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.listProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToItem(10)
      })

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 500 }) // 10 * 50
    })

    it('should scroll to item at center position', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.listProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToItem(10, { block: 'center' })
      })

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 300 }) // 500 - 400/2
    })

    it('should scroll to item at end position', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.listProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToItem(10, { block: 'end' })
      })

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 150 }) // 500 - (400 - 50)
    })

    it('should handle sticky items when scrolling', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
          stickyItemCount: 2,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.listProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToItem(10)
      })

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 400 }) // 500 - 100 (sticky offset)
    })

    it('should handle missing ref gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      // Should not throw
      act(() => {
        result.current.scrollToItem(10)
      })
    })
  })

  describe('scroll event handling', () => {
    it('should update visible indices on scroll', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      const mockElement = {
        scrollTop: 250,
        clientHeight: 400,
      }
      result.current.listProps.outerRef.current = mockElement as any

      act(() => {
        result.current.listProps.onOuterScroll({} as any)
      })

      expect(result.current.listProps.visibleIndex.start).toBe(5) // 250 / 50
      expect(result.current.listProps.visibleIndex.end).toBe(13) // (250 + 400) / 50
    })

    it('should handle scroll with no element gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          itemCount: 100,
          itemHeight: 50,
          height: 400,
        })
      )

      // Should not throw
      act(() => {
        result.current.listProps.onOuterScroll({} as any)
      })
    })
  })

  describe('configuration changes', () => {
    it('should update when height changes', () => {
      const { result, rerender } = renderHook(
        ({ height }) =>
          useVirtualList({
            itemCount: 100,
            itemHeight: 50,
            height,
          }),
        {
          initialProps: { height: 400 },
        }
      )

      expect(result.current.listProps.outerHeight).toBe(400)

      rerender({ height: 600 })

      expect(result.current.listProps.outerHeight).toBe(600)
    })

    it('should update when item count changes', () => {
      const { result, rerender } = renderHook(
        ({ itemCount }) =>
          useVirtualList({
            itemCount,
            itemHeight: 50,
            height: 400,
          }),
        {
          initialProps: { itemCount: 100 },
        }
      )

      expect(result.current.listProps.itemCount).toBe(100)
      expect(result.current.listProps.innerHeight).toBe(5000)

      rerender({ itemCount: 200 })

      expect(result.current.listProps.itemCount).toBe(200)
      expect(result.current.listProps.innerHeight).toBe(10000)
    })
  })
})
