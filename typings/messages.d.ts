export declare const setupMessages: {
    factoryConfig: (config: any) => string;
    factoryResult: (result: any) => string;
};
export declare const entryMessages: {
    publishing: (entry: any) => string;
    uploadResponse: (response: any) => string;
};
export declare const contentTypeMessages: {
    uploadResponse: (response: any) => string;
};
export declare const assetMessages: {
    publishing: (asset: any) => string;
    uploadResponse: (response: any) => string;
    unpublishing: (asset: any) => string;
};
export declare const searchMessages: {
    params: (params: any) => string;
    listObjectsResponse: (response: any) => string;
};
export declare const fetchMessages: {
    params: (params: any) => string;
    response: (response: any) => string;
    uniquePrefixes: (prefixes: any) => string;
    uniqueContents: (contents: any) => string;
};
export declare const deleteMessages: {
    deleting: (input: any) => string;
    deleteObjectResponse: (response: any) => string;
    removingFolders: (item: any) => string;
};
export declare const s3Messages: {
    itemsFound: (items: any) => string;
    getObjectParams: (params: any) => string;
};
export declare const errorMessages: {
    keyNotExist: (key: string, input: any) => string;
};
