"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const config_1 = require("../config");
const requiredKeys = config_1.config.contentStore.internal.requiredKeys;
exports.validateConfig = (config) => {
    if (typeof config.bucketParams !== 'object' || !(config.bucketParams.Bucket || config.bucketParams.name)) {
        throw new Error('Kindly provide valid bucket config!');
    }
    else if (typeof config.region === 'undefined' && typeof process.env.AWS_REGION !== 'string') {
        throw new Error('Kindly provide s3 \'region\'');
    }
    else {
        if (typeof config.bucketParams.name !== 'string' && typeof config.bucketParams.Bucket !== 'string') {
            throw new Error('Kindly provide a valid bucket name');
        }
    }
    return config;
};
exports.validateLogger = (logger) => {
    let flag = false;
    if (!logger) {
        return flag;
    }
    const requiredFn = ['info', 'warn', 'log', 'error', 'debug'];
    requiredFn.forEach((name) => {
        if (typeof logger[name] !== 'function') {
            flag = true;
        }
    });
    return !flag;
};
const validateObject = (action, asset) => {
    if (typeof asset !== 'object' || asset === null || asset instanceof Array) {
        throw new Error(`Asset ${asset} should be of type 'plain object'`);
    }
    const keys = requiredKeys[action];
    keys.forEach((key) => {
        if (!(lodash_1.hasIn(asset, key))) {
            throw new Error(`Required key '${key}' not found in ${JSON.stringify(asset)}`);
        }
    });
};
exports.validatePublishedObject = (obj, requiredKeys) => {
    if (requiredKeys && typeof requiredKeys === 'object') {
        for (const key in requiredKeys) {
            if (requiredKeys[key]) {
                if (!lodash_1.hasIn(obj, key)) {
                    throw new Error(`Required key '${key}' was not found in ${JSON.stringify(obj)}`);
                }
            }
        }
    }
};
exports.validateUnpublishedObject = (obj) => {
    validateObject('unpublish', obj);
};
exports.validateDeletedObject = (obj) => {
    validateObject('delete', obj);
};
