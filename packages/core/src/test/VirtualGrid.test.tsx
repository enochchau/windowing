import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { VirtualGrid, type VirtualGridProps } from '../VirtualGrid'

// Create a minimal mock for VirtualGrid props
const createMockGridProps = (): VirtualGridProps => ({
  outerRef: createRef<HTMLDivElement>(),
  outerWidth: 800,
  outerHeight: 600,
  innerRef: createRef<HTMLDivElement>(),
  innerWidth: 1000,
  innerHeight: 800,
  onOuterScroll: vi.fn(),
  getColumnWidth: vi.fn(() => 100),
  getRowHeight: vi.fn(() => 50),
  getColumnPlacement: vi.fn((index: number) => index * 100),
  getRowPlacement: vi.fn((index: number) => index * 50),
  visibleIndex: {
    row: { start: 0, end: 2 },
    column: { start: 0, end: 2 }
  },
  itemRenderer: ({ rowIndex, columnIndex }) => (
    <div data-testid={`cell-${rowIndex}-${columnIndex}`}>
      Cell {rowIndex},{columnIndex}
    </div>
  ),
  stickyColumnCount: 0,
  stickyRowCount: 0,
  rowCount: 10,
  columnCount: 10,
})

describe('VirtualGrid', () => {
  it('should render without crashing', () => {
    const props = createMockGridProps()
    expect(() => render(<VirtualGrid {...props} />)).not.toThrow()
  })

  it('should render the outer container with correct dimensions', () => {
    const props = createMockGridProps()
    const { container } = render(<VirtualGrid {...props} />)
    
    const outerContainer = container.firstChild as HTMLElement
    expect(outerContainer).toBeInTheDocument()
    expect(outerContainer).toHaveStyle({
      width: '800px',
      height: '600px',
      overflow: 'auto'
    })
  })

  it('should render visible cells', () => {
    const props = createMockGridProps()
    render(<VirtualGrid {...props} />)
    
    // Should render cells in the visible range (0-2, 0-2) plus overflow
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument()
    expect(screen.getByTestId('cell-1-1')).toBeInTheDocument()
    expect(screen.getByTestId('cell-2-2')).toBeInTheDocument()
  })

  it('should call itemRenderer with correct parameters', () => {
    const itemRenderer = vi.fn(({ rowIndex, columnIndex }) => (
      <div data-testid={`cell-${rowIndex}-${columnIndex}`}>
        Cell {rowIndex},{columnIndex}
      </div>
    ))
    
    const props = createMockGridProps()
    props.itemRenderer = itemRenderer
    
    render(<VirtualGrid {...props} />)
    
    expect(itemRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        rowIndex: expect.any(Number),
        columnIndex: expect.any(Number),
        isHovering: expect.any(Boolean),
        isSticky: expect.any(Boolean),
      })
    )
  })

  it('should handle sticky rows and columns', () => {
    const props = createMockGridProps()
    props.stickyRowCount = 1
    props.stickyColumnCount = 1
    
    render(<VirtualGrid {...props} />)
    
    // Should render sticky cells
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument()
  })

  it('should handle scroll events', () => {
    const onOuterScroll = vi.fn()
    const props = createMockGridProps()
    props.onOuterScroll = onOuterScroll
    
    const { container } = render(<VirtualGrid {...props} />)
    const outerContainer = container.firstChild as HTMLElement
    
    fireEvent.scroll(outerContainer, { target: { scrollTop: 100, scrollLeft: 50 } })
    
    expect(onOuterScroll).toHaveBeenCalled()
  })

  it('should handle row hover', () => {
    const props = createMockGridProps()
    props.rowHover = true
    
    render(<VirtualGrid {...props} />)
    
    const cell = screen.getByTestId('cell-0-0')
    fireEvent.mouseEnter(cell)
    
    // Mouse enter should be handled
    expect(cell).toBeInTheDocument()
  })

  it('should handle column hover', () => {
    const props = createMockGridProps()
    props.columnHover = true
    
    render(<VirtualGrid {...props} />)
    
    const cell = screen.getByTestId('cell-0-0')
    fireEvent.mouseEnter(cell)
    
    // Mouse enter should be handled
    expect(cell).toBeInTheDocument()
  })

  it('should reset mouse state on mouse leave', () => {
    const props = createMockGridProps()
    props.rowHover = true
    
    const { container } = render(<VirtualGrid {...props} />)
    const outerContainer = container.firstChild as HTMLElement
    
    // Enter and then leave
    const cell = screen.getByTestId('cell-0-0')
    fireEvent.mouseEnter(cell)
    fireEvent.mouseLeave(outerContainer)
    
    expect(cell).toBeInTheDocument()
  })

  it('should respect rowOverflow and columnOverflow props', () => {
    const props = createMockGridProps()
    props.rowOverflow = 1
    props.columnOverflow = 1
    
    render(<VirtualGrid {...props} />)
    
    // Should still render visible cells
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument()
  })

  it('should call placement functions with correct indices', () => {
    const getColumnPlacement = vi.fn((index: number) => index * 100)
    const getRowPlacement = vi.fn((index: number) => index * 50)
    
    const props = createMockGridProps()
    props.getColumnPlacement = getColumnPlacement
    props.getRowPlacement = getRowPlacement
    
    render(<VirtualGrid {...props} />)
    
    expect(getColumnPlacement).toHaveBeenCalledWith(expect.any(Number))
    expect(getRowPlacement).toHaveBeenCalledWith(expect.any(Number))
  })

  it('should call size functions with correct indices', () => {
    const getColumnWidth = vi.fn(() => 100)
    const getRowHeight = vi.fn(() => 50)
    
    const props = createMockGridProps()
    props.getColumnWidth = getColumnWidth
    props.getRowHeight = getRowHeight
    
    render(<VirtualGrid {...props} />)
    
    expect(getColumnWidth).toHaveBeenCalledWith(expect.any(Number))
    expect(getRowHeight).toHaveBeenCalledWith(expect.any(Number))
  })

  it('should render inner container with correct dimensions', () => {
    const props = createMockGridProps()
    const { container } = render(<VirtualGrid {...props} />)
    
    const outerContainer = container.firstChild as HTMLElement
    const innerContainer = outerContainer.firstChild as HTMLElement
    
    expect(innerContainer).toHaveStyle({
      position: 'relative',
      height: '800px',
      width: '1000px'
    })
  })

  it('should handle edge case with no visible items', () => {
    const props = createMockGridProps()
    props.visibleIndex = {
      row: { start: 10, end: 9 }, // Invalid range
      column: { start: 10, end: 9 }
    }
    
    expect(() => render(<VirtualGrid {...props} />)).not.toThrow()
  })

  it('should not handle mouse events when hover is disabled', () => {
    const props = createMockGridProps()
    props.rowHover = false
    props.columnHover = false
    
    render(<VirtualGrid {...props} />)
    
    const cell = screen.getByTestId('cell-0-0')
    fireEvent.mouseEnter(cell)
    
    // Should still render normally
    expect(cell).toBeInTheDocument()
  })

  it('should render sticky items with proper styles', () => {
    const props = createMockGridProps()
    props.stickyRowCount = 2
    props.stickyColumnCount = 2
    
    const { container } = render(<VirtualGrid {...props} />)
    
    // Check that sticky containers are rendered
    const stickyContainers = container.querySelectorAll('[style*="position: sticky"]')
    expect(stickyContainers.length).toBeGreaterThan(0)
  })

  it('should handle boundaries correctly with overflow', () => {
    const props = createMockGridProps()
    props.rowOverflow = 5
    props.columnOverflow = 5
    props.visibleIndex = {
      row: { start: 8, end: 9 }, // Near the end
      column: { start: 8, end: 9 }
    }
    
    render(<VirtualGrid {...props} />)
    
    // Should not crash and should render what it can
    expect(screen.getByTestId('cell-8-8')).toBeInTheDocument()
  })
})
