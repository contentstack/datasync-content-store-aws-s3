const assetStore = require('../../asset-store-fs/dist')
// const contentStore = require('../dist')
const contentStore = require('../dist')
const listener = require('@contentstack/webhook-listener')
const syncManager = require('../../sync-manager/dist')
const config = require('./mock/config')

config.assetStore = {
  bucketParams: {
    name: 'content-store-aws-s3'
  },
  Policy: {
    Statement: [
      {
        Sid: 'AddPerm',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: ['arn:aws:s3:::content-store-aws-s3/*'] // Required
      }
    ]
  },
}

config.contentStore = {
  bucketParams: {
    name: 'content-store-aws-s3'
  },
  Policy: {
    Statement: [
      {
        Sid: 'AddPerm',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: ['arn:aws:s3:::content-store-aws-s3/*'] // Required
      }
    ]
  },
}

config.contentstack.apiKey = '***REMOVED***'
config.contentstack.deliveryToken = '***REMOVED***'

syncManager.setAssetStore(assetStore)
syncManager.setContentStore(contentStore)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start().then(() => {
  console.log('Sync utility started successfully!')
}).catch(console.error)

syncManager.notifications
  .on('publish', (obj) => {
    // console.log('SYNC-PUBLISH: ', obj)
  })
  .on('unpublish', (obj) => {
    // console.log('SYNC-UNPUBLISH: ', obj)
  })
  .on('delete', (obj) => {
    // console.log('SYNC-DELETE: ', obj)
  })
  .on('error', (obj) => {
    // console.log('SYNC-ERROR: ', obj)
  })
