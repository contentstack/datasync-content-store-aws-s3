/**
 * @description Default application's internal config
 */
export const config = {
  contentStore: {
    // Optional: Use this, if any key passed in the pattern doesn't exist on the asset by default Or if the key exists on the asset, but needs overriding
    patterns: {
      asset: '/:locale/assets/:uid/:version/index.json',
      entry: '/:locale/entries/:content_type_uid/:uid/:version/index.json',
      contentType: '/schemas/:uid/index.json',
    },
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
      unwantedKeys: {
        asset: {
          action: true,
          checkpoint: true,
          'data.created_by': true,
          event_at: true,
          type: true,
          'data.updated_by': true
        },
        contentType: {
          'data.created_by': true,
          'data.updated_by': true,
          'data.DEFAULT_ACL': true,
          'data.SYS_ACL': true,
          'data.abilities': true,
          'data.last_activity': true
        },
        entry: {
          action: true,
          checkpoint: true,
          'data.created_by': true,
          event_at: true,
          type: true,
          'data.updated_by': true
        }
      },
      requiredKeys: {
        asset: {
          locale: true,
          uid: true,
          url: true,
        },
        contentType: {
          title: true,
          uid: true,
          schema: true,
          _version: true,
        },
        entry: {
          uid: true,
          _version: true,
        }
      }
    }
  }
}
