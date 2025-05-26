import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { AutoSizer } from '../AutoSizer'

describe('AutoSizer', () => {
  describe('basic rendering', () => {
    it('should render with default styles', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      const container = screen.getByText('Test content').parentElement
      expect(container).toHaveStyle({
        width: '100%',
        height: '100%',
      })
    })

    it('should render children', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <div data-testid="child">Child content</div>
          <span>Another child</span>
        </AutoSizer>
      )
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Another child')).toBeInTheDocument()
    })

    it('should forward ref correctly', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toHaveTextContent('Test content')
    })
  })

  describe('styling', () => {
    it('should apply custom className', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref} className="custom-class">
          <div>Test content</div>
        </AutoSizer>
      )
      
      const container = screen.getByText('Test content').parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('should merge custom styles with defaults', () => {
      const ref = createRef<HTMLDivElement>()
      const customStyle = {
        backgroundColor: 'red',
        border: '1px solid blue',
        width: '50%', // Should override default
      }
      
      render(
        <AutoSizer autoSizerRef={ref} style={customStyle}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      const container = screen.getByText('Test content').parentElement
      expect(container).toHaveStyle('width: 50%') // Custom style overrides default
      expect(container).toHaveStyle('height: 100%') // Default style preserved
      expect(container).toHaveStyle('background-color: rgb(255, 0, 0)') // Custom style added
      expect(container).toHaveStyle('border: 1px solid blue') // Custom style added
    })

    it('should handle undefined className gracefully', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref} className={undefined}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      const container = screen.getByText('Test content').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should handle undefined style gracefully', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref} style={undefined}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      const container = screen.getByText('Test content').parentElement
      expect(container).toHaveStyle({
        width: '100%',
        height: '100%',
      })
    })
  })

  describe('ref handling', () => {
    it('should work with callback refs', () => {
      let capturedRef: HTMLDivElement | null = null
      const callbackRef = vi.fn((el: HTMLDivElement | null) => {
        capturedRef = el
      })
      
      const refObject = { current: null }
      Object.defineProperty(refObject, 'current', {
        set: callbackRef,
        get: () => capturedRef,
      })
      
      render(
        <AutoSizer autoSizerRef={refObject}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLDivElement))
      expect(capturedRef).toBeInstanceOf(HTMLDivElement)
    })

    it('should handle ref assignment correctly', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <div>Test content</div>
        </AutoSizer>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })
  })

  describe('complex children', () => {
    it('should handle complex nested children', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <div>
            <header>Header</header>
            <main>
              <section>
                <h1>Title</h1>
                <p>Paragraph</p>
              </section>
            </main>
            <footer>Footer</footer>
          </div>
        </AutoSizer>
      )
      
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should handle React fragments', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <>
            <div>First</div>
            <div>Second</div>
          </>
        </AutoSizer>
      )
      
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('should handle conditional rendering', () => {
      const ref = createRef<HTMLDivElement>()
      const showSecond = false
      
      render(
        <AutoSizer autoSizerRef={ref}>
          <div>First</div>
          {showSecond && <div>Second</div>}
        </AutoSizer>
      )
      
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.queryByText('Second')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty children', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          {null}
        </AutoSizer>
      )
      
      expect(ref.current).toBeInTheDocument()
      expect(ref.current).toBeEmptyDOMElement()
    })

    it('should handle string children', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          Just a string
        </AutoSizer>
      )
      
      expect(screen.getByText('Just a string')).toBeInTheDocument()
    })

    it('should handle number children', () => {
      const ref = createRef<HTMLDivElement>()
      
      render(
        <AutoSizer autoSizerRef={ref}>
          {42}
        </AutoSizer>
      )
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })
})
