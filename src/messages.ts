/**
 * @module messages
 * @description Centralized log and error messages for datasync-content-store-aws-s3
 * This file contains all user-facing messages to ensure consistency and maintainability
 */

/**
 * Setup-related messages
 */
export const setupMessages = {
  factoryConfig: (config: any) => `Factory configuration: ${JSON.stringify(config)}`,
  factoryResult: (result: any) => `Result: ${JSON.stringify(result)}`,
}

/**
 * S3 operation messages - Entry operations
 */
export const entryMessages = {
  publishing: (entry: any) => `Publishing entry: ${JSON.stringify(entry)}`,
  uploadResponse: (response: any) => `Entry S3 upload response: ${JSON.stringify(response)}`,
}

/**
 * S3 operation messages - Content Type operations
 */
export const contentTypeMessages = {
  uploadResponse: (response: any) => `Content type S3 upload response: ${JSON.stringify(response)}`,
}

/**
 * S3 operation messages - Asset operations
 */
export const assetMessages = {
  publishing: (asset: any) => `Publishing asset: ${JSON.stringify(asset)}`,
  uploadResponse: (response: any) => `Asset S3 upload response: ${JSON.stringify(response)}`,
  unpublishing: (asset: any) => `Unpublishing asset: ${JSON.stringify(asset)}`,
}

/**
 * S3 operation messages - Search operations
 */
export const searchMessages = {
  params: (params: any) => `Search S3 parameters: ${JSON.stringify(params)}`,
  listObjectsResponse: (response: any) => `Search S3 – ListObjects response: ${JSON.stringify(response, null, 2)}`,
}

/**
 * S3 operation messages - Fetch operations
 */
export const fetchMessages = {
  params: (params: any) => `Fetching contents with parameters: ${JSON.stringify(params)}`,
  response: (response: any) => `Fetch contents response: ${JSON.stringify(response, null, 2)}`,
  uniquePrefixes: (prefixes: any) => `Unique prefixes found: ${JSON.stringify(prefixes)}`,
  uniqueContents: (contents: any) => `Unique contents found: ${JSON.stringify(contents)}`,
}

/**
 * S3 operation messages - Delete operations
 */
export const deleteMessages = {
  deleting: (input: any) => `Deleting item: ${JSON.stringify(input)}`,
  deleteObjectResponse: (response: any) => `Delete object response: ${JSON.stringify(response, null, 2)}`,
  removingFolders: (item: any) => `Removing folders: ${JSON.stringify(item)}`,
}

/**
 * S3 operation messages - General operations
 */
export const s3Messages = {
  itemsFound: (items: any) => `Items found: ${JSON.stringify(items)}`,
  getObjectParams: (params: any) => `getObject called with parameters: ${JSON.stringify(params)}`,
}

/**
 * Error messages
 */
export const errorMessages = {
  keyNotExist: (key: string, input: any) => `Key '${key}' does not exist in: ${JSON.stringify(input)}`,
}

