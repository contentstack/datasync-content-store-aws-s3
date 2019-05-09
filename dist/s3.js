"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const lodash_1 = require("lodash");
const index_1 = require("./util/index");
const validations_1 = require("./util/validations");
const debug = debug_1.default('content-store-aws-s3');
class S3 {
    constructor(assetStore, s3, config) {
        this.assetStore = assetStore;
        this.config = config.contentStore;
        this.keys = this.config.internal.keys;
        this.s3 = s3;
        this.unwantedKeys = this.config.internal.unwantedKeys;
        this.requiredKeys = this.config.internal.requiredKeys;
        this.patterns = {
            asset: this.config.patterns.asset.split('/'),
            entry: this.config.patterns.entry.split('/'),
            contentType: this.config.patterns.contentType.split('/')
        };
    }
    publish(publishedObject) {
        if (publishedObject.content_type_uid === this.keys.assets) {
            return this.publishAsset(publishedObject);
        }
        return this.publishEntry(publishedObject);
    }
    publishEntry(publishedEntry) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const clonedObject = lodash_1.cloneDeep(publishedEntry);
                const entry = {
                    locale: clonedObject.locale,
                    uid: clonedObject.uid,
                    content_type_uid: clonedObject.content_type_uid,
                    data: clonedObject.data
                };
                const contentType = {
                    uid: clonedObject.content_type_uid,
                    content_type_uid: this.keys.content_type_uid,
                    data: clonedObject.content_type
                };
                validations_1.validatePublishedObject(entry.data, this.requiredKeys.entry);
                validations_1.validatePublishedObject(contentType.data, this.requiredKeys.contentType);
                index_1.filterKeys(entry.data, this.unwantedKeys.entry);
                index_1.filterKeys(contentType.data, this.unwantedKeys.entry);
                const entryPath = index_1.getPath(this.patterns.entry, entry, this.config.versioning);
                const schemaPath = index_1.getPath(this.patterns.contentType, contentType, this.config.versioning);
                const params = lodash_1.cloneDeep(this.config.uploadParams);
                params.Key = entryPath;
                params.Body = JSON.stringify(entry);
                return this.s3.putObject(params)
                    .on('error', reject)
                    .promise()
                    .then((entryUploadResponse) => {
                    debug(`Entry s3 upload response: ${JSON.stringify(entryUploadResponse)}`);
                    const params2 = lodash_1.cloneDeep(this.config.uploadParams);
                    params2.Key = schemaPath;
                    params2.Body = JSON.stringify(contentType);
                    return this.s3.putObject(params2)
                        .on('error', reject)
                        .promise();
                })
                    .then((ctUploadResponse) => {
                    debug(`Content type s3 upload response: ${JSON.stringify(ctUploadResponse)}`);
                    return resolve(publishedEntry);
                })
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    publishAsset(publishedAsset) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const asset = lodash_1.cloneDeep(publishedAsset);
                validations_1.validatePublishedObject(asset.data, this.requiredKeys.asset);
                index_1.filterKeys(asset.data, this.unwantedKeys.asset);
                yield this.assetStore.download(asset.data);
                const assetPath = index_1.getPath(this.patterns.asset, asset, this.config.versioning);
                const params = lodash_1.cloneDeep(this.config.uploadParams);
                params.Key = assetPath;
                params.Body = JSON.stringify(asset);
                const req = this.s3.upload(params)
                    .on('httpUploadProgress', debug)
                    .on('error', reject)
                    .promise()
                    .then((s3Response) => {
                    debug(`Asset s3 upload response: ${JSON.stringify(s3Response)}`);
                    return resolve(publishedAsset);
                })
                    .catch(reject);
                req.on('build', () => {
                    if (asset.data._version) {
                        req.httpRequest.headers['x-amz-meta-download_id'] = asset.data._version;
                    }
                });
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    unpublish(unpublishedObject) {
        return new Promise((resolve) => {
            return resolve(unpublishedObject);
        });
    }
    delete(deletedObject) {
        return new Promise((resolve) => {
            return resolve(deletedObject);
        });
    }
}
exports.S3 = S3;
