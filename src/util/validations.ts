import { hasIn } from 'lodash'
import { config as internalConfig } from '../config'

const requiredKeys = internalConfig.assetStore.internal.requiredKeys

export const validateConfig = (config) => {
  if (typeof config.bucketParams !== 'object' || !(config.bucketParams.Bucket || config.bucketParams.name)) {
    throw new Error('Kindly provide valid bucket config')
  } else if (typeof config.region === 'undefined' && typeof process.env.AWS_REGION !== 'string') {
    throw new Error('Kindly provide s3 \'region\'')
  } else {
    if (typeof config.bucketParams.name !== 'string' && typeof config.bucketParams.Bucket !== 'string') {
      throw new Error('Kindly provide a valid bucket name')
    }
  }

  return config
}

export const validateLogger = (logger) => {
  let flag = false
  if (!logger) {
    return flag
  }
  const requiredFn = ['info', 'warn', 'log', 'error', 'debug']
  requiredFn.forEach((name) => {
    if (typeof logger[name] !== 'function') {
      flag = true
    }
  })

  return !flag
}

const validateObject = (action, asset) => {
  if (typeof asset !== 'object' || asset === null || asset instanceof Array) {
    throw new Error(`Asset ${asset} should be of type 'plain object'`)
  }

  const keys = requiredKeys[action]
  keys.forEach((key) => {
    if (!(hasIn(asset, key))) {
      throw new Error(`Required key:${key} not found in ${JSON.stringify(asset)}`)
    }
  })
}

export const validatePublishedObject = (obj) => {
  validateObject('publish', obj)
}

export const validateUnpublishedObject = (obj) => {
  validateObject('unpublish', obj)
}

export const validateDeletedObject = (obj) => {
  validateObject('delete', obj)
}