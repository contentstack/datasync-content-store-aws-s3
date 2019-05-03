import { merge } from 'lodash'
import { config as internalConfig } from './config'
import { S3 } from './s3'
import { init } from './setup'
import { setLogger } from './util/logger'
import { validateConfig } from './util/validations'

let appConfig: any = {}

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
 * @summary Logger instance interface
 */
export interface ILogger {
  warn(): any,
  info(): any,
  log(): any,
  error(): any,
}

/**
 * @summary Set the application's config
 * @param {Object} config - Application config
 */
export const setConfig = (config: IConfig) => {
  appConfig = config
}

/**
 * @summary Returns the application's configuration
 * @returns {Object} - Application config
 */
export const getConfig = (): IConfig => {
  return appConfig
}

/**
 * @summary Set custom logger for logging
 * @param {Object} instance - Custom logger instance
 */
export { setLogger }

/**
 * @summary
 *  Starts the sync manager utility
 * @description
 *  Registers, validates asset, content stores and listener instances.
 *  Once done, builds the app's config and logger
 * @param {Object} config - Optional application config.
 */
export const start = (config?: IConfig) => {
  return new Promise((resolve, reject) => {
    try {
      appConfig = merge(internalConfig, appConfig, config || {})
      validateConfig(appConfig.assetStore)
      return init(appConfig.assetStore)
        .then((awsInstance) => {
          const s3 = new S3(awsInstance, appConfig)
          
          return resolve(s3)
        })
        .catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}
