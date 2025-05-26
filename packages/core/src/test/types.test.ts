import { describe, it, expect } from 'vitest'
import type * as Types from '../types'

describe('Types', () => {
  it('should have expected type definitions available', () => {
    // Test that types can be imported and used in type checks
    const scrollPlacement: Types.ScrollPlacement = 'start'
    expect(['start', 'center', 'end']).toContain(scrollPlacement)
    
    const numberOrFn: Types.NumberOrNumberFn = 100
    expect(typeof numberOrFn).toBe('number')
    
    const numberFn: Types.NumberOrNumberFn = (index: number) => index * 10
    expect(typeof numberFn).toBe('function')
    
    const visibleIndex: Types.VisibleIndex = { start: 0, end: 10 }
    expect(visibleIndex).toHaveProperty('start')
    expect(visibleIndex).toHaveProperty('end')
    
    const visibleGridIndex: Types.VisibleGridIndex = {
      column: { start: 0, end: 5 },
      row: { start: 0, end: 10 }
    }
    expect(visibleGridIndex).toHaveProperty('column')
    expect(visibleGridIndex).toHaveProperty('row')
  })

  it('should support different scroll placement values', () => {
    const placements: Types.ScrollPlacement[] = ['start', 'center', 'end']
    
    placements.forEach(placement => {
      expect(['start', 'center', 'end']).toContain(placement)
    })
  })

  it('should support NumberOrNumberFn as both number and function', () => {
    const numberValue: Types.NumberOrNumberFn = 42
    const functionValue: Types.NumberOrNumberFn = (index: number) => index * 2
    
    expect(typeof numberValue).toBe('number')
    expect(typeof functionValue).toBe('function')
    
    if (typeof functionValue === 'function') {
      expect(functionValue(5)).toBe(10)
    }
  })
})
