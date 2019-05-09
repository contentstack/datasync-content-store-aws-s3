const assetStore = require('../../contentstack-asset-store-filesystem/dist')
const contentStore = require('../../contentstack-content-store-mongodb/dist')
const listener = require('@contentstack/webhook-listener')
const syncManager = require('../dist')
const config = require('./mock/config')

config.contentstack.apiKey = 'blt01e28ab17409dbb8'
config.contentstack.deliveryToken = 'cscecad16299816ad5036d07c9'

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
