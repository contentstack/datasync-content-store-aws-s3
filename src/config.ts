/**
 * @description Default application's internal config
 */
export const config = {
  assetStore: {
    // Optional: Use this, if any key passed in the pattern doesn't exist on the asset by default Or if the key exists on the asset, but needs overriding
    pattern: '/:locale/:content_type_uid/:uid/:version/index.json',
    versioning: true,
    region: 'us-east-1', // Required
    apiVersion: '2006-03-01', // Required
    bucketParams: {
      // Bucket: '', // Required
      ACL: 'public-read'
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
          // Resource: ['arn:aws:s3:::<name>/*'] // Required
        }
      ]
    },
    internal: {
      keys: {
        assets: '_assets',
        content_type_uid: '_content_types'
      },
      requiredKeys: {
        publish: ['locale', 'uid', 'url'],
        unpublish: ['locale', 'uid', 'url', 'Key'],
        delete: ['locale', 'uid', 'url', 'Key']
      }
    }
  }
}
