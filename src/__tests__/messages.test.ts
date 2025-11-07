/**
 * Tests for centralized message functions
 */
import {
  assetMessages,
  contentTypeMessages,
  deleteMessages,
  entryMessages,
  errorMessages,
  fetchMessages,
  s3Messages,
  searchMessages,
  setupMessages,
} from '../messages'

describe('Messages Module', () => {
  describe('setupMessages', () => {
    it('should format factory configuration message correctly', () => {
      const config = { bucket: 'test-bucket', region: 'us-east-1' }
      const message = setupMessages.factoryConfig(config)
      expect(message).toBe('Factory configuration: {"bucket":"test-bucket","region":"us-east-1"}')
    })

    it('should format factory result message correctly', () => {
      const result = { success: true }
      const message = setupMessages.factoryResult(result)
      expect(message).toBe('Result: {"success":true}')
    })
  })

  describe('entryMessages', () => {
    it('should format publishing entry message correctly', () => {
      const entry = { uid: 'entry123', locale: 'en-us' }
      const message = entryMessages.publishing(entry)
      expect(message).toBe('Publishing entry: {"uid":"entry123","locale":"en-us"}')
    })

    it('should format entry upload response message correctly', () => {
      const response = { ETag: '"abc123"', VersionId: 'v1' }
      const message = entryMessages.uploadResponse(response)
      expect(message).toBe('Entry S3 upload response: {"ETag":"\\"abc123\\"","VersionId":"v1"}')
    })
  })

  describe('contentTypeMessages', () => {
    it('should format content type upload response message correctly', () => {
      const response = { ETag: '"def456"' }
      const message = contentTypeMessages.uploadResponse(response)
      expect(message).toBe('Content type S3 upload response: {"ETag":"\\"def456\\""}')
    })
  })

  describe('assetMessages', () => {
    it('should format publishing asset message correctly', () => {
      const asset = { uid: 'asset123', url: 'https://example.com/image.jpg' }
      const message = assetMessages.publishing(asset)
      expect(message).toBe('Publishing asset: {"uid":"asset123","url":"https://example.com/image.jpg"}')
    })

    it('should format asset upload response message correctly', () => {
      const response = { Location: 's3://bucket/key', ETag: '"xyz789"' }
      const message = assetMessages.uploadResponse(response)
      expect(message).toBe('Asset S3 upload response: {"Location":"s3://bucket/key","ETag":"\\"xyz789\\""}')
    })

    it('should format unpublishing asset message correctly', () => {
      const asset = { uid: 'asset456', locale: 'en-us' }
      const message = assetMessages.unpublishing(asset)
      expect(message).toBe('Unpublishing asset: {"uid":"asset456","locale":"en-us"}')
    })
  })

  describe('searchMessages', () => {
    it('should format search parameters message correctly', () => {
      const params = { Bucket: 'my-bucket', Delimiter: '/', Prefix: 'folder/' }
      const message = searchMessages.params(params)
      expect(message).toBe('Search S3 parameters: {"Bucket":"my-bucket","Delimiter":"/","Prefix":"folder/"}')
    })

    it('should format listObjects response message correctly', () => {
      const response = { CommonPrefixes: [{ Prefix: 'folder1/' }], Contents: [] }
      const message = searchMessages.listObjectsResponse(response)
      expect(message).toContain('Search S3 – ListObjects response:')
      expect(message).toContain('"CommonPrefixes"')
    })
  })

  describe('fetchMessages', () => {
    it('should format fetch parameters message correctly', () => {
      const params = { Bucket: 'my-bucket', Prefix: 'path/to/folder/' }
      const message = fetchMessages.params(params)
      expect(message).toBe('Fetching contents with parameters: {"Bucket":"my-bucket","Prefix":"path/to/folder/"}')
    })

    it('should format fetch response message correctly', () => {
      const response = { Contents: [{ Key: 'file.json' }] }
      const message = fetchMessages.response(response)
      expect(message).toContain('Fetch contents response:')
      expect(message).toContain('"Contents"')
    })

    it('should format unique prefixes message correctly', () => {
      const prefixes = [{ Prefix: 'folder1/' }, { Prefix: 'folder2/' }]
      const message = fetchMessages.uniquePrefixes(prefixes)
      expect(message).toBe('Unique prefixes found: [{"Prefix":"folder1/"},{"Prefix":"folder2/"}]')
    })

    it('should format unique contents message correctly', () => {
      const contents = [{ Key: 'file1.json' }, { Key: 'file2.json' }]
      const message = fetchMessages.uniqueContents(contents)
      expect(message).toBe('Unique contents found: [{"Key":"file1.json"},{"Key":"file2.json"}]')
    })
  })

  describe('deleteMessages', () => {
    it('should format deleting message correctly', () => {
      const input = { uid: 'item123', content_type_uid: 'blog_post' }
      const message = deleteMessages.deleting(input)
      expect(message).toBe('Deleting item: {"uid":"item123","content_type_uid":"blog_post"}')
    })

    it('should format delete object response message correctly', () => {
      const response = { DeleteMarker: true, VersionId: 'v2' }
      const message = deleteMessages.deleteObjectResponse(response)
      expect(message).toContain('Delete object response:')
      expect(message).toContain('"DeleteMarker"')
    })

    it('should format removing folders message correctly', () => {
      const item = { Key: 'folder/', Size: 0 }
      const message = deleteMessages.removingFolders(item)
      expect(message).toBe('Removing folders: {"Key":"folder/","Size":0}')
    })
  })

  describe('s3Messages', () => {
    it('should format items found message correctly', () => {
      const items = [{ Key: 'file1.json' }, { Key: 'file2.json' }]
      const message = s3Messages.itemsFound(items)
      expect(message).toBe('Items found: [{"Key":"file1.json"},{"Key":"file2.json"}]')
    })

    it('should format getObject parameters message correctly', () => {
      const params = { Bucket: 'my-bucket', Key: 'path/to/file.json' }
      const message = s3Messages.getObjectParams(params)
      expect(message).toBe('getObject called with parameters: {"Bucket":"my-bucket","Key":"path/to/file.json"}')
    })
  })

  describe('errorMessages', () => {
    it('should format key not exist error message correctly', () => {
      const key = 'missingKey'
      const input = { existingKey: 'value' }
      const message = errorMessages.keyNotExist(key, input)
      expect(message).toBe('Key \'missingKey\' does not exist in: {"existingKey":"value"}')
    })

    it('should handle special characters in key name', () => {
      const key = 'special_key-123'
      const input = { someKey: 'someValue' }
      const message = errorMessages.keyNotExist(key, input)
      expect(message).toContain('Key \'special_key-123\'')
    })

    it('should handle complex input objects', () => {
      const key = 'nested'
      const input = { 
        data: { 
          uid: 'test123', 
          nested: { value: 'deep' } 
        } 
      }
      const message = errorMessages.keyNotExist(key, input)
      expect(message).toContain('Key \'nested\' does not exist in:')
      expect(message).toContain('"data"')
    })
  })

  describe('Message format consistency', () => {
    it('all messages should use JSON.stringify for objects', () => {
      const testObj = { test: 'value' }
      const messages = [
        setupMessages.factoryConfig(testObj),
        entryMessages.publishing(testObj),
        assetMessages.publishing(testObj),
      ]

      messages.forEach(msg => {
        expect(msg).toContain(JSON.stringify(testObj))
      })
    })

    it('S3 should be capitalized consistently', () => {
      const response = { data: 'test' }
      const messages = [
        entryMessages.uploadResponse(response),
        contentTypeMessages.uploadResponse(response),
        assetMessages.uploadResponse(response),
      ]

      messages.forEach(msg => {
        expect(msg).toContain('S3')
        expect(msg).not.toContain(' s3 ')
      })
    })

    it('parameters should be spelled out fully (not params)', () => {
      const params = { test: 'value' }
      const messages = [
        searchMessages.params(params),
        fetchMessages.params(params),
        s3Messages.getObjectParams(params),
      ]

      messages.forEach(msg => {
        expect(msg).toContain('parameters')
      })
    })
  })
})

