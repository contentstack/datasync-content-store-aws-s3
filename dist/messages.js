"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessages = exports.s3Messages = exports.deleteMessages = exports.fetchMessages = exports.searchMessages = exports.assetMessages = exports.contentTypeMessages = exports.entryMessages = exports.setupMessages = void 0;
exports.setupMessages = {
    factoryConfig: (config) => `Factory configuration: ${JSON.stringify(config)}`,
    factoryResult: (result) => `Result: ${JSON.stringify(result)}`,
};
exports.entryMessages = {
    publishing: (entry) => `Publishing entry: ${JSON.stringify(entry)}`,
    uploadResponse: (response) => `Entry S3 upload response: ${JSON.stringify(response)}`,
};
exports.contentTypeMessages = {
    uploadResponse: (response) => `Content type S3 upload response: ${JSON.stringify(response)}`,
};
exports.assetMessages = {
    publishing: (asset) => `Publishing asset: ${JSON.stringify(asset)}`,
    uploadResponse: (response) => `Asset S3 upload response: ${JSON.stringify(response)}`,
    unpublishing: (asset) => `Unpublishing asset: ${JSON.stringify(asset)}`,
};
exports.searchMessages = {
    params: (params) => `Search S3 parameters: ${JSON.stringify(params)}`,
    listObjectsResponse: (response) => `Search S3 – ListObjects response: ${JSON.stringify(response, null, 2)}`,
};
exports.fetchMessages = {
    params: (params) => `Fetching contents with parameters: ${JSON.stringify(params)}`,
    response: (response) => `Fetch contents response: ${JSON.stringify(response, null, 2)}`,
    uniquePrefixes: (prefixes) => `Unique prefixes found: ${JSON.stringify(prefixes)}`,
    uniqueContents: (contents) => `Unique contents found: ${JSON.stringify(contents)}`,
};
exports.deleteMessages = {
    deleting: (input) => `Deleting item: ${JSON.stringify(input)}`,
    deleteObjectResponse: (response) => `Delete object response: ${JSON.stringify(response, null, 2)}`,
    removingFolders: (item) => `Removing folders: ${JSON.stringify(item)}`,
};
exports.s3Messages = {
    itemsFound: (items) => `Items found: ${JSON.stringify(items)}`,
    getObjectParams: (params) => `getObject called with parameters: ${JSON.stringify(params)}`,
};
exports.errorMessages = {
    keyNotExist: (key, input) => `Key '${key}' does not exist in: ${JSON.stringify(input)}`,
};
