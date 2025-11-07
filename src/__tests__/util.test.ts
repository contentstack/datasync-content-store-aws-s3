/**
 * Tests for util functions, specifically error message handling
 */
import { getPath } from '../util/index'

describe('util/index', () => {
  describe('getPath', () => {
    it('should throw error with correct message format when key does not exist', () => {
      const keys = [':locale', ':uid']
      const input = { locale: 'en-us' } // missing 'uid'
      const versioning = false

      expect(() => {
        getPath(keys, input, versioning)
      }).toThrow(TypeError)

      expect(() => {
        getPath(keys, input, versioning)
      }).toThrow("Key 'uid' does not exist in: {\"locale\":\"en-us\"}")
    })

    it('should throw error with single quotes around key name', () => {
      const keys = [':missingKey']
      const input = { existingKey: 'value' }
      const versioning = false

      expect(() => {
        getPath(keys, input, versioning)
      }).toThrow("Key 'missingKey'")
    })

    it('should include JSON stringified input in error message', () => {
      const keys = [':nonExistent']
      const input = { 
        uid: 'test123', 
        locale: 'en-us',
        data: { name: 'Test' }
      }
      const versioning = false

      expect(() => {
        getPath(keys, input, versioning)
      }).toThrow(/Key 'nonExistent' does not exist in:/)

      try {
        getPath(keys, input, versioning)
      } catch (error) {
        expect(error.message).toContain(JSON.stringify(input))
        expect(error.message).toContain('"uid":"test123"')
        expect(error.message).toContain('"locale":"en-us"')
      }
    })

    it('should successfully build path when all keys exist', () => {
      const keys = ['entries', ':locale', ':uid']
      const input = { 
        locale: 'en-us',
        uid: 'entry123'
      }
      const versioning = false

      const result = getPath(keys, input, versioning)
      expect(result).toContain('entries')
      expect(result).toContain('en-us')
      expect(result).toContain('entry123')
    })

    it('should handle versioning correctly', () => {
      const keys = [':locale', ':uid', ':version']
      const input = { 
        locale: 'en-us',
        uid: 'entry123',
        data: {
          _version: 5
        }
      }
      const versioning = true

      const result = getPath(keys, input, versioning)
      expect(result).toContain('5')
    })

    it('should handle download_id for versioned assets', () => {
      const keys = [':locale', ':uid', ':version']
      const input = { 
        locale: 'en-us',
        uid: 'asset123',
        data: {
          url: 'https://example.com/image.jpg',
          download_id: 'dl_123456',
          _version: 3
        }
      }
      const versioning = true

      const result = getPath(keys, input, versioning)
      expect(result).toContain('dl_123456')
    })

    it('should handle static path parts', () => {
      const keys = ['static', 'path', ':locale']
      const input = { locale: 'fr-fr' }
      const versioning = false

      const result = getPath(keys, input, versioning)
      expect(result).toContain('static')
      expect(result).toContain('path')
      expect(result).toContain('fr-fr')
    })

    it('error message should not have exclamation mark at end', () => {
      const keys = [':missing']
      const input = { present: 'value' }
      const versioning = false

      try {
        getPath(keys, input, versioning)
        fail('Should have thrown an error')
      } catch (error) {
        // The old message had "...in {...}!" with exclamation
        // The new message should be "...in: {...}" without exclamation
        expect(error.message).not.toMatch(/\}!$/)
        expect(error.message).toMatch(/does not exist in:/)
      }
    })
  })
})

