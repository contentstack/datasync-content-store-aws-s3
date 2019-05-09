const assetStore = require('../../contentstack-asset-store-filesystem/dist')
const contentStore = require('../../datasync-content-store-filesystem/dist')
const listener = require('@contentstack/webhook-listener')
const syncManager = require('../dist/index')
const config = require('./mock/config')

config.contentstack.apiKey = '***REMOVED***'
config.contentstack.deliveryToken = '***REMOVED***'

config.assetStore.baseDir = '_fs_assets'
config.contentStore.baseDir = '_fs_json'

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
