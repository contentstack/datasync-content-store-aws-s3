export interface IConfig {
    assetStore: {
        region?: string;
        bucketParams: any;
        uploadParams?: any;
        apiVersion?: string;
        CORSConfiguration?: any;
        pattern?: string;
        Policy?: any;
    };
}
interface IAssetStore {
    start(): Promise<any>;
}
export declare const setConfig: (config: IConfig) => void;
export declare const setAssetStore: (instance: IAssetStore) => void;
export declare const getConfig: () => IConfig;
export declare const start: (assetStoreInstance?: IAssetStore, config?: IConfig) => Promise<{}>;
export {};
