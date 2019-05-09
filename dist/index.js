"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const config_1 = require("./config");
const s3_1 = require("./s3");
const setup_1 = require("./setup");
const validations_1 = require("./util/validations");
let appConfig = {};
let assetStore;
exports.setConfig = (config) => {
    appConfig = config;
};
exports.setAssetStore = (instance) => {
    assetStore = instance;
};
exports.getConfig = () => {
    return appConfig;
};
exports.start = (assetStoreInstance, config) => {
    return new Promise((resolve, reject) => {
        try {
            appConfig = lodash_1.merge(config_1.config, appConfig, config || {});
            validations_1.validateConfig(appConfig.contentStore);
            assetStore = assetStoreInstance || assetStore;
            return setup_1.init(appConfig.contentStore)
                .then((awsInstance) => {
                const s3 = new s3_1.S3(assetStore, awsInstance, appConfig);
                return resolve(s3);
            })
                .catch(reject);
        }
        catch (error) {
            return reject(error);
        }
    });
};
