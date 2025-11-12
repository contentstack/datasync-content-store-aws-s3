"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = void 0;
const debug_1 = __importDefault(require("debug"));
const lodash_1 = require("lodash");
const index_1 = require("./util/index");
const validations_1 = require("./util/validations");
const messages_1 = require("./messages");
const debug = (0, debug_1.default)('content-store-aws-s3');
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
                debug(messages_1.entryMessages.publishing(publishedEntry));
                const clonedObject = (0, lodash_1.cloneDeep)(publishedEntry);
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
                (0, validations_1.validatePublishedObject)(entry.data, this.requiredKeys.entry);
                (0, validations_1.validatePublishedObject)(contentType.data, this.requiredKeys.contentType);
                (0, index_1.filterKeys)(entry.data, this.unwantedKeys.entry);
                (0, index_1.filterKeys)(contentType.data, this.unwantedKeys.entry);
                const entryPath = (0, index_1.getPath)(this.patterns.entry, entry, this.config.versioning);
                const schemaPath = (0, index_1.getPath)(this.patterns.contentType, contentType, this.config.versioning);
                const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
                params.Key = entryPath;
                params.Body = JSON.stringify(entry);
                return this.s3.putObject(params)
                    .on('error', reject)
                    .promise()
                    .then((entryUploadResponse) => {
                    debug(messages_1.entryMessages.uploadResponse(entryUploadResponse));
                    const params2 = (0, lodash_1.cloneDeep)(this.config.uploadParams);
                    params2.Key = schemaPath;
                    params2.Body = JSON.stringify(contentType);
                    return this.s3.putObject(params2)
                        .on('error', reject)
                        .promise();
                })
                    .then((ctUploadResponse) => {
                    debug(messages_1.contentTypeMessages.uploadResponse(ctUploadResponse));
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
                debug(messages_1.assetMessages.publishing(publishedAsset));
                const asset = (0, lodash_1.cloneDeep)(publishedAsset);
                (0, validations_1.validatePublishedObject)(asset.data, this.requiredKeys.asset);
                (0, index_1.filterKeys)(asset.data, this.unwantedKeys.asset);
                yield this.assetStore.download(asset.data);
                const assetPath = (0, index_1.getPath)(this.patterns.asset, asset, this.config.versioning);
                const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
                params.Key = assetPath;
                params.Body = JSON.stringify(asset);
                return this.s3.upload(params)
                    .on('httpUploadProgress', debug)
                    .on('error', reject)
                    .promise()
                    .then((s3Response) => {
                    debug(messages_1.assetMessages.uploadResponse(s3Response));
                    return resolve(publishedAsset);
                })
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    unpublish(unpublishedObject) {
        if (unpublishedObject.content_type_uid === this.keys.assets) {
            return this.unpublishAsset(unpublishedObject);
        }
        return this.unpublishEntry(unpublishedObject);
    }
    searchS3(uid) {
        return new Promise((resolve, reject) => {
            const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
            delete params.ACL;
            params.Delimiter = uid;
            debug(messages_1.searchMessages.params(params));
            return this.s3.listObjects(params)
                .on('httpUploadProgress', debug)
                .on('error', reject)
                .promise()
                .then((s3Response) => {
                debug(messages_1.searchMessages.listObjectsResponse(s3Response));
                return resolve(s3Response.CommonPrefixes);
            })
                .catch(reject);
        });
    }
    fetchContents(Prefix, Contents) {
        return new Promise((resolve, reject) => {
            const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
            delete params.ACL;
            params.Prefix = Prefix;
            debug(messages_1.fetchMessages.params(params));
            return this.s3.listObjects(params)
                .on('httpUploadProgress', debug)
                .on('error', reject)
                .promise()
                .then((s3Response) => {
                debug(messages_1.fetchMessages.response(s3Response));
                s3Response.Contents.forEach((Content) => {
                    Contents.push(Content);
                });
                return resolve(undefined);
            })
                .catch(reject);
        });
    }
    fetch(uid, isDelete = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const Prefixes = yield this.searchS3(uid);
                const UniqPrefixes = (0, lodash_1.uniqBy)(Prefixes, 'Prefix');
                debug(messages_1.fetchMessages.uniquePrefixes(UniqPrefixes));
                const Contents = [];
                const promises = [];
                UniqPrefixes.forEach((CommonPrefix) => {
                    promises.push(this.fetchContents(CommonPrefix.Prefix, Contents));
                });
                return Promise.all(promises)
                    .then(() => {
                    const UniqContents = (0, lodash_1.uniqBy)(Contents, 'Key');
                    const promises2 = [];
                    const Items = [];
                    debug(messages_1.fetchMessages.uniqueContents(UniqContents));
                    UniqContents.forEach((Content) => {
                        promises2.push(this.fetchContents(Content.Key, Items));
                    });
                    return Promise.all(promises2)
                        .then(() => {
                        for (let i = 0; i < Items.length; i++) {
                            if (Items[i].Key.charAt(Items[i].Key.length - 1) === '/') {
                                debug(messages_1.deleteMessages.removingFolders(Items[i]));
                                Items.splice(i, 1);
                                i--;
                            }
                        }
                        debug(messages_1.s3Messages.itemsFound(Items));
                        return Items;
                    });
                })
                    .then((Items) => {
                    if (isDelete) {
                        return Items;
                    }
                    const promises3 = [];
                    const ItemsData = [];
                    Items.forEach((Item) => {
                        promises3.push(this.getObject(Item, ItemsData));
                    });
                    return Promise.all(promises3)
                        .then(() => {
                        return ItemsData;
                    });
                })
                    .then((ItemsData) => resolve(ItemsData))
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    getObject(Item, ItemsData) {
        return new Promise((resolve, reject) => {
            const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
            delete params.ACL;
            params.Key = Item.Key;
            debug(messages_1.s3Messages.getObjectParams(params));
            return this.s3.getObject(params)
                .on('httpUploadProgress', debug)
                .on('error', reject)
                .promise()
                .then((s3Response) => {
                const data = JSON.parse(s3Response.Body);
                ItemsData.push(data);
                return resolve(undefined);
            })
                .catch(reject);
        });
    }
    unpublishAsset(asset) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug(messages_1.assetMessages.unpublishing(asset));
                const assets = yield this.fetch(asset.uid);
                let publishedAsset;
                for (let i = 0; i < assets.length; i++) {
                    if (assets[i].data._version) {
                        publishedAsset = assets[i];
                        break;
                    }
                }
                if (typeof publishedAsset === 'undefined') {
                    return resolve(asset);
                }
                yield this.assetStore.unpublish(publishedAsset.data);
                const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
                delete params.ACL;
                params.Key = (0, index_1.getPath)(this.patterns.asset, publishedAsset, this.config.versioning);
                return this.s3.deleteObject(params)
                    .on('httpUploadProgress', debug)
                    .on('error', reject)
                    .promise()
                    .then((s3Response) => {
                    debug(messages_1.deleteMessages.deleteObjectResponse(s3Response));
                    return resolve(asset);
                })
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    unpublishEntry(entry) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const entries = yield this.fetch(entry.uid);
                let publishedEntry;
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].data._version) {
                        publishedEntry = entries[i];
                        break;
                    }
                }
                if (typeof publishedEntry === 'undefined') {
                    return resolve(entry);
                }
                const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
                delete params.ACL;
                params.Key = (0, index_1.getPath)(this.patterns.entry, publishedEntry, this.config.versioning);
                return this.s3.deleteObject(params)
                    .on('httpUploadProgress', debug)
                    .on('error', reject)
                    .promise()
                    .then((s3Response) => {
                    debug(messages_1.deleteMessages.deleteObjectResponse(s3Response));
                    return resolve(entry);
                })
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
    delete(input) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug(messages_1.deleteMessages.deleting(input));
                const matches = yield this.fetch(input.uid);
                const Keys = yield this.fetch(input.uid, true);
                if (matches.length === 0) {
                    return resolve(input);
                }
                const datas = (0, lodash_1.map)(matches, 'data');
                if (input.content_type_uid === this.keys.assets) {
                    yield this.assetStore.delete(datas);
                }
                const params = (0, lodash_1.cloneDeep)(this.config.uploadParams);
                delete params.ACL;
                params.Delete = {
                    Objects: [],
                    Quiet: false
                };
                Keys.forEach((data) => {
                    params.Delete.Objects.push({
                        Key: data.Key
                    });
                });
                return this.s3.deleteObjects(params)
                    .on('httpUploadProgress', debug)
                    .on('error', reject)
                    .promise()
                    .then((s3Response) => {
                    debug(messages_1.deleteMessages.deleteObjectResponse(s3Response));
                    return resolve(input);
                })
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        }));
    }
}
exports.S3 = S3;
