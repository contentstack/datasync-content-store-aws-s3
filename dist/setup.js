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
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const debug_1 = __importDefault(require("debug"));
const util_1 = require("./util");
const debug = debug_1.default('cs-s3-setup');
let S3;
const factory = (method, config) => {
    debug(`Factory: ${JSON.stringify(config)}`);
    return S3[method](config).promise().then((result) => {
        debug(`Result: ${JSON.stringify(result)}`);
        return;
    });
};
exports.init = (config) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            config = util_1.formatConfig(config);
            const awsConfig = util_1.buildAWSConfig(config);
            S3 = new aws_sdk_1.default.S3(awsConfig);
            yield factory('createBucket', config.bucketParams);
            yield factory('putBucketVersioning', {
                Bucket: config.bucketName,
                VersioningConfiguration: { MFADelete: 'Disabled', Status: 'Enabled' }
            });
            if (typeof config.CORSConfiguration === 'object' && !(config.CORSConfiguration instanceof Array)) {
                yield factory('putBucketCors', {
                    Bucket: config.bucketName,
                    CORSConfiguration: config.CORSConfiguration
                });
            }
            if (typeof config.Policy === 'object' && !(config.Policy instanceof Array)) {
                yield factory('putBucketPolicy', {
                    Bucket: config.bucketName,
                    Policy: JSON.stringify(config.Policy)
                });
            }
            return resolve(S3);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
