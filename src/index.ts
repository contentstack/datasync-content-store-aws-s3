import { merge } from 'lodash'
import { config as internalConfig } from './config'
import { S3 } from './s3'
import { init } from './setup'
import { validateConfig } from './util/validations'

let appConfig: any = {}
let assetStore: any

/**
 * @summary Application config interface
 */
export interface IConfig {
  assetStore: {
    region?: string,
    bucketParams: any,
    uploadParams?: any,
    apiVersion?: string,
    CORSConfiguration?: any,
    pattern?: string,
    Policy?: any,
  }
}

/**
 * @interface
 * @summary Asset store's interface
 */
interface IAssetStore {
  start(): Promise<any>
}

/**
 * @summary Set the application's config
 * @param {Object} config - Application config
 */
export const setConfig = (config: IConfig) => {
  appConfig = config
}

/**
 * @summary Set asset store
 * @param {object} 
 */
export const setAssetStore = (instance: IAssetStore) => {
  assetStore = instance
}

/**
 * @summary Returns the application's configuration
 * @returns {object} - Application config
 */
export const getConfig = (): IConfig => {
  return appConfig
}

/**
 * @summary
 *  Starts the sync manager utility
 * @description
 *  Registers, validates asset, content stores and listener instances
 *  Once done, builds the app's config and logger
 * @param {object} config Optional application config
 * @param {instance} assetStoreInstance Instance of asset store
 * @returns {promise} Returns AWS S3 content store instance
 */
export const start = (assetStoreInstance?: IAssetStore, config?: IConfig) => {
  return new Promise((resolve, reject) => {
    try {
      appConfig = merge(internalConfig, appConfig, config || {})
      validateConfig(appConfig.contentStore)
      assetStore = assetStoreInstance || assetStore
      return init(appConfig.contentStore)
        .then((awsInstance) => {
          const s3 = new S3(assetStore, awsInstance, appConfig)
          
          return resolve(s3)
        })
        .catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}
