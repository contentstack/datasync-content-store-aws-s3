export declare const config: {
    contentStore: {
        patterns: {
            asset: string;
            entry: string;
            contentType: string;
        };
        versioning: boolean;
        region: string;
        apiVersion: string;
        bucketParams: {
            ACL: string;
        };
        uploadParams: {
            ACL: string;
        };
        CORSConfiguration: {
            CORSRules: {
                AllowedHeaders: string[];
                AllowedMethods: string[];
                AllowedOrigins: string[];
                ExposeHeaders: any[];
                MaxAgeSeconds: number;
            }[];
        };
        Policy: {
            Version: string;
            Statement: {
                Sid: string;
                Effect: string;
                Principal: string;
                Action: string[];
            }[];
        };
        internal: {
            keys: {
                assets: string;
                content_type_uid: string;
            };
            unwantedKeys: {
                asset: {
                    action: boolean;
                    checkpoint: boolean;
                    'data.created_by': boolean;
                    event_at: boolean;
                    type: boolean;
                    'data.updated_by': boolean;
                };
                contentType: {
                    'data.created_by': boolean;
                    'data.updated_by': boolean;
                    'data.DEFAULT_ACL': boolean;
                    'data.SYS_ACL': boolean;
                    'data.abilities': boolean;
                    'data.last_activity': boolean;
                };
                entry: {
                    action: boolean;
                    checkpoint: boolean;
                    'data.created_by': boolean;
                    event_at: boolean;
                    type: boolean;
                    'data.updated_by': boolean;
                };
            };
            requiredKeys: {
                asset: {
                    locale: boolean;
                    uid: boolean;
                    url: boolean;
                };
                contentType: {
                    title: boolean;
                    uid: boolean;
                    schema: boolean;
                    _version: boolean;
                };
                entry: {
                    uid: boolean;
                    _version: boolean;
                };
            };
        };
    };
};
