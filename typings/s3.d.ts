interface IPublish {
    locale: string;
    uid: string;
    content_type_uid: string;
    data: any;
}
interface IPublishedAsset extends IPublish {
    data: {
        locale: string;
        url: string;
        uid: string;
        _internal_url?: string;
        _version?: string;
        apiVersion?: string;
        apiKey?: string;
        download_id?: string;
        downloadId?: string;
        filename?: string;
        title?: string;
        Key?: string;
        Location?: string;
        VersionId?: string;
    };
}
interface IPublishedEntry extends IPublish {
    content_type: any;
}
interface IUnpublish {
    locale: string;
    uid: string;
    content_type_uid: string;
    data: any;
}
interface IUnpublishedAsset extends IUnpublish {
    data: {
        uid: string;
        locale: string;
    };
}
interface IUnpublishedEntry extends IUnpublish {
    data: {
        uid: string;
        locale: string;
    };
}
interface IDelete {
    locale: string;
    uid: string;
    content_type_uid: string;
    data: any;
}
interface IDeletedAsset extends IDelete {
}
interface IDeletedEntry extends IDelete {
}
interface IContentStore {
    publish(input: IPublishedAsset | IPublishedEntry): Promise<any>;
    unpublish(input: IUnpublishedAsset | IUnpublishedEntry): Promise<any>;
    delete(input: IDeletedAsset | IDeletedEntry): Promise<any>;
}
export declare class S3 implements IContentStore {
    private assetStore;
    private config;
    private keys;
    private s3;
    private patterns;
    private unwantedKeys;
    private requiredKeys;
    constructor(assetStore: any, s3: any, config: any);
    publish(publishedObject: any): Promise<{}>;
    publishEntry(publishedEntry: IPublishedEntry): Promise<{}>;
    publishAsset(publishedAsset: IPublishedAsset): Promise<{}>;
    unpublish(unpublishedObject: IUnpublishedAsset | IUnpublishedEntry): Promise<{}>;
    private searchS3;
    private fetchContents;
    private fetch;
    private getObject;
    private unpublishAsset;
    private unpublishEntry;
    delete(deletedObject: IDeletedAsset | IDeletedEntry): Promise<{}>;
}
export {};
