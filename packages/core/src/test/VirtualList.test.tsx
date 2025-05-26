import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VirtualList } from '../VirtualList'
import type { VirtualListProps } from '../VirtualList'

// Mock refs for testing
const createMockRef = <T,>(value: T) => ({
  current: value,
})

const defaultProps: VirtualListProps = {
  innerRef: createMockRef(null),
  innerHeight: 1000,
  outerRef: createMockRef(null),
  outerHeight: 400,
  visibleIndex: { start: 0, end: 8 },
  itemCount: 20,
  stickyItemCount: 0,
  getItemHeight: () => 50,
  getItemPlacement: (index: number) => index * 50,
  onOuterScroll: vi.fn(),
  width: 300,
  itemRenderer: ({ index, isSticky }) => (
    <div data-testid={`item-${index}`} data-sticky={isSticky}>
      Item {index}
    </div>
  ),
}

describe('VirtualList', () => {
  describe('basic rendering', () => {
    it('should render outer container with correct styles', () => {
      const { container } = render(<VirtualList {...defaultProps} />)
      
      const outerContainer = container.firstChild as HTMLElement
      expect(outerContainer).toHaveStyle({
        height: '400px',
        overflow: 'auto',
        width: '300px',
      })
    })

    it('should render inner container with correct height', () => {
      const { container } = render(<VirtualList {...defaultProps} />)
      
      const innerContainer = container.querySelector('[style*="height: 1000px"]')
      expect(innerContainer).toBeInTheDocument()
    })

    it('should render visible items', () => {
      render(<VirtualList {...defaultProps} />)
      
      // Should render items 0-8 (visible range)
      for (let i = 0; i <= 8; i++) {
        expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument()
      }
      
      // Should not render item 9 (outside visible range)
      expect(screen.queryByTestId('item-9')).not.toBeInTheDocument()
    })

    it('should render items with correct positioning', () => {
      render(<VirtualList {...defaultProps} />)
      
      const firstItem = screen.getByTestId('item-0')
      const secondItem = screen.getByTestId('item-1')
      
      expect(firstItem.parentElement).toHaveStyle({
        transform: 'translateY(0px)',
        height: '50px',
        width: '100%',
        position: 'absolute',
      })
      
      expect(secondItem.parentElement).toHaveStyle({
        transform: 'translateY(50px)',
        height: '50px',
      })
    })
  })

  describe('overflow handling', () => {
    it('should render additional items with overflow count', () => {
      const propsWithOverflow = {
        ...defaultProps,
        overflowCount: 2,
        visibleIndex: { start: 5, end: 8 },
      }
      
      render(<VirtualList {...propsWithOverflow} />)
      
      // Should render from 3 to 10 (5-2 to 8+2)
      expect(screen.getByTestId('item-3')).toBeInTheDocument()
      expect(screen.getByTestId('item-10')).toBeInTheDocument()
      
      // Should not render items outside overflow range
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('item-11')).not.toBeInTheDocument()
    })

    it('should handle overflow at boundaries', () => {
      const propsWithOverflow = {
        ...defaultProps,
        overflowCount: 5,
        visibleIndex: { start: 0, end: 3 },
        itemCount: 10,
      }
      
      render(<VirtualList {...propsWithOverflow} />)
      
      // Should not render negative indices
      expect(screen.getByTestId('item-0')).toBeInTheDocument()
      expect(screen.getByTestId('item-8')).toBeInTheDocument() // 3 + 5
      expect(screen.queryByTestId('item-9')).not.toBeInTheDocument() // Beyond itemCount
    })
  })

  describe('sticky items', () => {
    it('should render sticky items separately', () => {
      const propsWithSticky = {
        ...defaultProps,
        stickyItemCount: 3,
        visibleIndex: { start: 5, end: 10 },
      }
      
      render(<VirtualList {...propsWithSticky} />)
      
      // Sticky items should be rendered
      const stickyItem0 = screen.getAllByTestId('item-0')[0]
      const stickyItem1 = screen.getAllByTestId('item-1')[0]
      const stickyItem2 = screen.getAllByTestId('item-2')[0]
      
      expect(stickyItem0).toHaveAttribute('data-sticky', 'true')
      expect(stickyItem1).toHaveAttribute('data-sticky', 'true')
      expect(stickyItem2).toHaveAttribute('data-sticky', 'true')
      
      // Regular items should not include sticky indices
      expect(screen.getByTestId('item-5')).toHaveAttribute('data-sticky', 'false')
      expect(screen.queryByTestId('item-0')).toHaveAttribute('data-sticky', 'true')
    })

    it('should position sticky items correctly', () => {
      const propsWithSticky = {
        ...defaultProps,
        stickyItemCount: 2,
      }
      
      const { container } = render(<VirtualList {...propsWithSticky} />)
      
      const stickyContainer = container.querySelector('[style*="position: sticky"]')
      expect(stickyContainer).toHaveStyle({
        position: 'sticky',
        top: '0px',
        left: '0px',
        height: '0px',
        zIndex: '2',
      })
    })

    it('should skip sticky items in regular rendering', () => {
      const propsWithSticky = {
        ...defaultProps,
        stickyItemCount: 2,
        visibleIndex: { start: 0, end: 5 },
      }
      
      render(<VirtualList {...propsWithSticky} />)
      
      // Items 0 and 1 should only appear as sticky (data-sticky="true")
      // Items 2-5 should appear as regular items (data-sticky="false")
      const regularItems = screen.getAllByTestId(/item-[2-5]/)
      regularItems.forEach(item => {
        expect(item).toHaveAttribute('data-sticky', 'false')
      })
      
      // Check that sticky items are not duplicated in regular rendering
      const allItem0 = screen.getAllByTestId('item-0')
      const allItem1 = screen.getAllByTestId('item-1')
      
      expect(allItem0).toHaveLength(1) // Only sticky version
      expect(allItem1).toHaveLength(1) // Only sticky version
    })
  })

  describe('item renderer', () => {
    it('should call item renderer with correct props', () => {
      const mockRenderer = vi.fn(({ index, isSticky }) => (
        <div data-testid={`item-${index}`}>Item {index}</div>
      ))
      
      const props = {
        ...defaultProps,
        itemRenderer: mockRenderer,
        stickyItemCount: 2,
        visibleIndex: { start: 1, end: 3 },
      }
      
      render(<VirtualList {...props} />)
      
      // Check sticky items
      expect(mockRenderer).toHaveBeenCalledWith({ index: 0, isSticky: true })
      expect(mockRenderer).toHaveBeenCalledWith({ index: 1, isSticky: true })
      
      // Check regular items (note: item 1 is sticky, so only 2 and 3 are regular)
      expect(mockRenderer).toHaveBeenCalledWith({ index: 2, isSticky: false })
      expect(mockRenderer).toHaveBeenCalledWith({ index: 3, isSticky: false })
    })

    it('should handle custom item content', () => {
      const customRenderer = ({ index }: { index: number; isSticky: boolean }) => (
        <div data-testid={`custom-${index}`}>
          <span>Custom content for {index}</span>
          <button>Action</button>
        </div>
      )
      
      const props = {
        ...defaultProps,
        itemRenderer: customRenderer,
        visibleIndex: { start: 0, end: 2 },
      }
      
      render(<VirtualList {...props} />)
      
      expect(screen.getByTestId('custom-0')).toBeInTheDocument()
      expect(screen.getByText('Custom content for 0')).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'Action' })).toHaveLength(3) // 3 visible items
    })
  })

  describe('event handling', () => {
    it('should attach scroll event handler', () => {
      const mockScrollHandler = vi.fn()
      const props = {
        ...defaultProps,
        onOuterScroll: mockScrollHandler,
      }
      
      const { container } = render(<VirtualList {...props} />)
      const outerContainer = container.firstChild as HTMLElement
      
      // Simulate scroll event
      outerContainer.dispatchEvent(new Event('scroll'))
      
      expect(mockScrollHandler).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle empty visible range', () => {
      const props = {
        ...defaultProps,
        visibleIndex: { start: 10, end: 5 }, // Invalid range
      }
      
      render(<VirtualList {...props} />)
      
      // Should not render any regular items
      expect(screen.queryByTestId('item-0')).not.toBeInTheDocument()
    })

    it('should handle zero item count', () => {
      const props = {
        ...defaultProps,
        itemCount: 0,
        visibleIndex: { start: 0, end: 0 },
      }
      
      render(<VirtualList {...props} />)
      
      // Should still render container structure
      const { container } = render(<VirtualList {...props} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle undefined sticky item count', () => {
      const props = {
        ...defaultProps,
        stickyItemCount: undefined as any,
      }
      
      // Should not throw
      render(<VirtualList {...props} />)
      
      expect(screen.getByTestId('item-0')).toBeInTheDocument()
    })
  })
})
