
[![Contentstack](https://www.contentstack.com/docs/static/images/contentstack.png)](https://www.contentstack.com/)

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest. [Read More](https://www.contentstack.com/).


## Contentstack DataSync Content Store AWS-S3

Contentstack DataSync lets you sync your Contentstack data with your database, enabling you to save data locally and serve content directly from your database. It is a combination of four powerful modules that is [DataSync Webhook Listener](https://github.com/contentstack/webhook-listener), [DataSync Manager](https://github.com/contentstack/datasync-manager), DataSync Asset Store - [Filesystem](https://github.com/contentstack/datasync-asset-store-filesystem) and [AWS S3](https://github.com/contentstack/datasync-asset-store-aws-s3), DataSync Content Store — [Filesystem](https://github.com/contentstack/datasync-content-store-filesystem),  [MongoDB](https://github.com/contentstack/datasync-content-store-mongodb) and [AWS S3](https://github.com/contentstack/datasync-content-store-aws-s3).
 
The Cotentstack AWS S3 Content Store is part of Contentstack DataSync's content storage drivers and is used to store data in the AWS S3. Any publish, unpublish, or delete action performed on data will be tracked by the  Webhook Listener and the relevant content will be synced accordingly in your AWS S3.

Along with syncing and storing your content on Filesystem and MongoDB databases, you can configure DataSync to sync and store your content on Amazon S3 server as well. 

**Please note that this is still work-in-progress and we are working on developing the complete functionality.**

###  Prerequisite

- Nodejs v8 or above

### Usage

This is how the datasync-content-store-filesystem is defined in the boilerplate:

```js
const assetStore = require('@contentstack/datasync-asset-store-aws-s3') 
const contentStore = require('@contentstack/datasync-content-store-aws-s3') // <<--
const listener = require('@contentstack/webhook-listener')
const syncManager = require('@contentstack/datasync-manager')
const config = require('./config')

syncManager.setAssetStore(assetStore)
syncManager.setContentStore(contentStore) 
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start()
.then(() => {
	console.log('Contentstack sync started successfully!')
})
.catch(console.error)
```

### Configuration
Here is the config table for the module:

|Property|Data Type|Default value|Description|
|--|--|--|--|
|pattern|object|**[see config below](https://github.com/contentstack/datasync-content-store-aws-s3#detailed-configs)**|**Optional.** The patterns to store contents is s3|
|region|string|us-east-1|**Optional.** The aws region|
|apiVersion|string|2006-03-01|**Optional.** The aws api version|
|credentials| object |**[see config below](https://github.com/contentstack/datasync-content-store-aws-s3#detailed-configs)** |**Required.** Specify access key and secret key|
|bucketParams| object |**[see config below](https://github.com/contentstack/datasync-content-store-aws-s3#detailed-configs)** |**Required.** Specify bucket name and ACL|
|uploadParams|object|**[see config below](https://github.com/contentstack/datasync-content-store-aws-s3#detailed-configs)** |**Optional.** Specify upload params|
|CORSConfiguration|object|**[see config below](https://github.com/contentstack/datasync-content-store-aws-s3#detailed-configs)** |**Optional.** CORS configs|
|Policy|object|**[see config below](https://github.com/contentstack/datasync-content-store-aws-s3#detailed-configs)** |**Required.** Specify policy|

### Detailed configs

By default, this module uses the following internal configuration.

```js
{
  patterns: {
    asset: '/:locale/assets/:uid/:version/index.json',
    entry: '/:locale/entries/:content_type_uid/:uid/:version/index.json',
    contentType: '/schemas/:uid/index.json',
  },
  region: 'us-east-1',
  apiVersion: '2006-03-01',
  credentials: {                                             // Required 
    accessKeyId: '',
    secretAccessKey: ''
  },
  bucketParams: {
    ACL: 'public-read',
    Bucket: ''                                               // Required
  },
  uploadParams: {
    ACL: 'public-read'
  },
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ['Authorization'],
        AllowedMethods: ['PUT', 'POST', 'GET', 'DELETE'],
        AllowedOrigins: ['*'],
        ExposeHeaders: [],
        MaxAgeSeconds: 3000
      }
    ]
  },
  Policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AddPerm',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: ['arn:aws:s3:::<bucket-name>/*']       // Required
        }
      ]
  },
}
```

### Further Reading

- [Getting started with Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync)   

### Support and Feature requests

If you have any issues working with the library, please file an issue [here](https://github.com/contentstack/datasync-content-store-mongodb/issues) at Github.

You can send us an e-mail at [support@contentstack.com](mailto:support@contentstack.com) if you have any support or feature requests. Our support team is available 24/7 on the intercom. You can always get in touch and give us an opportunity to serve you better!

### License

This repository is published under the [MIT license](LICENSE).
