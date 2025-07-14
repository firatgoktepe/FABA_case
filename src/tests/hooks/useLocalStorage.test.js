import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Initial Value Handling', () => {
    it('should return initial value when localStorage is empty', () => {
      localStorage.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      expect(result.current[0]).toBe('initial-value')
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return parsed value from localStorage when available', () => {
      const storedValue = { name: 'test', id: 123 }
      localStorage.getItem.mockReturnValue(JSON.stringify(storedValue))
      
      const { result } = renderHook(() => useLocalStorage('test-key', {}))
      
      expect(result.current[0]).toEqual(storedValue)
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid-json{')
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))
      
      expect(result.current[0]).toBe('fallback')
      expect(console.warn).toHaveBeenCalledWith(
        'Error reading localStorage key "test-key":',
        expect.any(SyntaxError)
      )
    })
  })

  describe('setValue Function', () => {
    it('should update state and localStorage when setting a value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', ''))
      
      act(() => {
        result.current[1]('new-value')
      })
      
      expect(result.current[0]).toBe('new-value')
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '"new-value"')
    })

    it('should handle function values like useState', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0))
      
      act(() => {
        result.current[1](prev => prev + 1)
      })
      
      expect(result.current[0]).toBe(1)
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '1')
    })

    it('should remove item from localStorage when value is undefined', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      act(() => {
        result.current[1](undefined)
      })
      
      expect(result.current[0]).toBeUndefined()
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle localStorage.setItem errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', ''))
      
      act(() => {
        result.current[1]('new-value')
      })
      
      expect(console.error).toHaveBeenCalledWith(
        'Error setting localStorage key "test-key":',
        expect.any(Error)
      )
    })
  })

  describe('removeValue Function', () => {
    it('should reset to initial value and remove from localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      // First set a value
      act(() => {
        result.current[1]('changed-value')
      })
      
      // Then remove it
      act(() => {
        result.current[2]()
      })
      
      expect(result.current[0]).toBe('initial')
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle localStorage.removeItem errors gracefully', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed')
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      act(() => {
        result.current[2]()
      })
      
      expect(console.error).toHaveBeenCalledWith(
        'Error removing localStorage key "test-key":',
        expect.any(Error)
      )
    })
  })

  describe('Complex Data Types', () => {
    it('should handle arrays correctly', () => {
      const initialArray = [1, 2, 3]
      const { result } = renderHook(() => useLocalStorage('test-array', initialArray))
      
      const newArray = [4, 5, 6]
      act(() => {
        result.current[1](newArray)
      })
      
      expect(result.current[0]).toEqual(newArray)
      expect(localStorage.setItem).toHaveBeenCalledWith('test-array', JSON.stringify(newArray))
    })

    it('should handle objects correctly', () => {
      const initialObj = { a: 1, b: 2 }
      const { result } = renderHook(() => useLocalStorage('test-obj', initialObj))
      
      const newObj = { c: 3, d: 4 }
      act(() => {
        result.current[1](newObj)
      })
      
      expect(result.current[0]).toEqual(newObj)
      expect(localStorage.setItem).toHaveBeenCalledWith('test-obj', JSON.stringify(newObj))
    })
  })
}) 