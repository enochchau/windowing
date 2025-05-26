import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVirtualGrid } from '../useVirtualGrid'

describe('useVirtualGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      expect(result.current.gridProps.rowCount).toBe(100)
      expect(result.current.gridProps.columnCount).toBe(50)
      expect(result.current.gridProps.outerHeight).toBe(400)
      expect(result.current.gridProps.outerWidth).toBe(600)
      expect(result.current.gridProps.innerHeight).toBe(3000) // 100 * 30
      expect(result.current.gridProps.innerWidth).toBe(6000) // 50 * 120
      expect(result.current.gridProps.stickyRowCount).toBe(0)
      expect(result.current.gridProps.stickyColumnCount).toBe(0)
    })

    it('should handle sticky rows and columns', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
          stickyRowCount: 2,
          stickyColumnCount: 3,
        })
      )

      expect(result.current.gridProps.stickyRowCount).toBe(2)
      expect(result.current.gridProps.stickyColumnCount).toBe(3)
    })

    it('should handle variable row heights and column widths', () => {
      const getRowHeight = (index: number) => (index % 2 === 0 ? 30 : 40)
      const getColumnWidth = (index: number) => (index % 2 === 0 ? 120 : 80)
      
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 4,
          columnCount: 4,
          rowHeight: getRowHeight,
          columnWidth: getColumnWidth,
          height: 400,
          width: 600,
        })
      )

      expect(result.current.gridProps.getRowHeight(0)).toBe(30)
      expect(result.current.gridProps.getRowHeight(1)).toBe(40)
      expect(result.current.gridProps.getColumnWidth(0)).toBe(120)
      expect(result.current.gridProps.getColumnWidth(1)).toBe(80)
      expect(result.current.gridProps.innerHeight).toBe(140) // 30+40+30+40
      expect(result.current.gridProps.innerWidth).toBe(400) // 120+80+120+80
    })
  })

  describe('edge cases', () => {
    it('should handle zero rows and columns', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 0,
          columnCount: 0,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      expect(result.current.gridProps.rowCount).toBe(0)
      expect(result.current.gridProps.columnCount).toBe(0)
      expect(result.current.gridProps.innerHeight).toBe(0)
      expect(result.current.gridProps.innerWidth).toBe(0)
    })

    it('should handle single row and column', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 1,
          columnCount: 1,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      expect(result.current.gridProps.rowCount).toBe(1)
      expect(result.current.gridProps.columnCount).toBe(1)
      expect(result.current.gridProps.innerHeight).toBe(30)
      expect(result.current.gridProps.innerWidth).toBe(120)
    })

    it('should handle zero dimensions', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 10,
          columnCount: 10,
          rowHeight: 0,
          columnWidth: 0,
          height: 400,
          width: 600,
        })
      )

      expect(result.current.gridProps.innerHeight).toBe(0)
      expect(result.current.gridProps.innerWidth).toBe(0)
    })

    it('should handle very large grids', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 10000,
          columnCount: 5000,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      expect(result.current.gridProps.rowCount).toBe(10000)
      expect(result.current.gridProps.columnCount).toBe(5000)
      expect(result.current.gridProps.innerHeight).toBe(300000)
      expect(result.current.gridProps.innerWidth).toBe(600000)
    })
  })

  describe('scrollToCell functionality', () => {
    it('should scroll to cell at start position', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.gridProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToCell({
          rowIndex: 10,
          columnIndex: 5,
        })
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 300, // 10 * 30
        left: 600, // 5 * 120
      })
    })

    it('should scroll to cell at center position', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.gridProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToCell(
          {
            rowIndex: 10,
            columnIndex: 5,
          },
          {
            block: 'center',
            inline: 'center',
          }
        )
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 100, // 300 - 400/2
        left: 300, // 600 - 600/2
      })
    })

    it('should scroll to cell at end position', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      const mockScrollTo = vi.fn()
      result.current.gridProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToCell(
          {
            rowIndex: 10,
            columnIndex: 5,
          },
          {
            block: 'end',
            inline: 'end',
          }
        )
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -70, // 300 - (400 - 30)
        left: 120, // 600 - (600 - 120)
      })
    })

    it('should handle sticky rows and columns when scrolling', () => {
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

      const mockScrollTo = vi.fn()
      result.current.gridProps.outerRef.current = {
        scrollTo: mockScrollTo,
      } as any

      act(() => {
        result.current.scrollToCell({
          rowIndex: 10,
          columnIndex: 5,
        })
      })

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 240, // 300 - 60 (sticky row offset: 2 * 30)
        left: 480, // 600 - 120 (sticky column offset: 1 * 120)
      })
    })

    it('should handle missing ref gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      // Should not throw
      act(() => {
        result.current.scrollToCell({
          rowIndex: 10,
          columnIndex: 5,
        })
      })
    })
  })

  describe('scroll event handling', () => {
    it('should update visible indices on scroll', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      const mockElement = {
        scrollTop: 150,
        clientHeight: 400,
        scrollLeft: 240,
        clientWidth: 600,
      }
      result.current.gridProps.outerRef.current = mockElement as any

      act(() => {
        result.current.gridProps.onOuterScroll({} as any)
      })

      expect(result.current.gridProps.visibleIndex.row.start).toBe(5) // 150 / 30
      expect(result.current.gridProps.visibleIndex.row.end).toBe(19) // (150 + 400) / 30, rounded up
      expect(result.current.gridProps.visibleIndex.column.start).toBe(2) // 240 / 120
      expect(result.current.gridProps.visibleIndex.column.end).toBe(7) // (240 + 600) / 120
    })

    it('should handle scroll with no element gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualGrid({
          rowCount: 100,
          columnCount: 50,
          rowHeight: 30,
          columnWidth: 120,
          height: 400,
          width: 600,
        })
      )

      // Should not throw
      act(() => {
        result.current.gridProps.onOuterScroll({} as any)
      })
    })
  })

  describe('configuration changes', () => {
    it('should update when dimensions change', () => {
      const { result, rerender } = renderHook(
        ({ height, width }) =>
          useVirtualGrid({
            rowCount: 100,
            columnCount: 50,
            rowHeight: 30,
            columnWidth: 120,
            height,
            width,
          }),
        {
          initialProps: { height: 400, width: 600 },
        }
      )

      expect(result.current.gridProps.outerHeight).toBe(400)
      expect(result.current.gridProps.outerWidth).toBe(600)

      rerender({ height: 500, width: 800 })

      expect(result.current.gridProps.outerHeight).toBe(500)
      expect(result.current.gridProps.outerWidth).toBe(800)
    })

    it('should update when counts change', () => {
      const { result, rerender } = renderHook(
        ({ rowCount, columnCount }) =>
          useVirtualGrid({
            rowCount,
            columnCount,
            rowHeight: 30,
            columnWidth: 120,
            height: 400,
            width: 600,
          }),
        {
          initialProps: { rowCount: 100, columnCount: 50 },
        }
      )

      expect(result.current.gridProps.rowCount).toBe(100)
      expect(result.current.gridProps.columnCount).toBe(50)
      expect(result.current.gridProps.innerHeight).toBe(3000)
      expect(result.current.gridProps.innerWidth).toBe(6000)

      rerender({ rowCount: 200, columnCount: 75 })

      expect(result.current.gridProps.rowCount).toBe(200)
      expect(result.current.gridProps.columnCount).toBe(75)
      expect(result.current.gridProps.innerHeight).toBe(6000)
      expect(result.current.gridProps.innerWidth).toBe(9000)
    })
  })
})
