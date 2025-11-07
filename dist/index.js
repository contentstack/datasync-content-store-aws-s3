"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.getConfig = exports.setAssetStore = exports.setConfig = void 0;
const lodash_1 = require("lodash");
const config_1 = require("./config");
const s3_1 = require("./s3");
const setup_1 = require("./setup");
const validations_1 = require("./util/validations");
let appConfig = {};
let assetStore;
const setConfig = (config) => {
    appConfig = config;
};
exports.setConfig = setConfig;
const setAssetStore = (instance) => {
    assetStore = instance;
};
exports.setAssetStore = setAssetStore;
const getConfig = () => {
    return appConfig;
};
exports.getConfig = getConfig;
const start = (assetStoreInstance, config) => {
    return new Promise((resolve, reject) => {
        try {
            appConfig = (0, lodash_1.merge)(config_1.config, appConfig, config || {});
            (0, validations_1.validateConfig)(appConfig.contentStore);
            assetStore = assetStoreInstance || assetStore;
            return (0, setup_1.init)(appConfig.contentStore)
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
exports.start = start;
