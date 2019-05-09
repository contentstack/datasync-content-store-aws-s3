import Debug from 'debug'
import { cloneDeep, uniqBy } from 'lodash'
import { getPath, filterKeys } from './util/index'
import { validatePublishedObject } from './util/validations'

const debug = Debug('content-store-aws-s3')

/**
 * @interface
 * @member IPublish
 * @summary Expected published object interface
 */
interface IPublish {
  locale: string,
  uid: string,
  content_type_uid: string,
  data: any
}

/**
 * @interface
 * @member IPublishedAsset
 * @summary Expected published asset interface
 */
interface IPublishedAsset extends IPublish {
  data: {
    locale: string,
    url: string,
    uid: string,
    _internal_url?: string,
    _version?: string,
    apiVersion?: string,
    apiKey?: string,
    download_id?: string,
    downloadId?: string,
    filename?: string,
    title?: string,
    Key?: string,
    Location?: string,
    VersionId?: string,
  }
}

/**
 * @interface
 * @member IPublishedEntry
 * @summary Expected published entry interface
 */
interface IPublishedEntry extends IPublish {
  content_type: any
}

interface IUnpublish {
  locale: string,
  uid: string,
  content_type_uid: string,
  data: any,
}

interface IUnpublishedAsset extends IUnpublish {
  data: {
    uid: string,
    locale: string,
  }
}

interface IUnpublishedEntry extends IUnpublish {
  data: {
    uid: string,
    locale: string,
  }
}

interface IDelete {
  locale: string,
  uid: string,
  content_type_uid: string,
  data: any,
}

interface IContents {
  Key: string,
  LastModified: string,
  ETag: string,
  Size: number,
  StorageClass: string,
  Owner: {
    DisplayName: string,
    ID: string
  }
}

interface IDeletedAsset extends IDelete {}
interface IDeletedEntry extends IDelete {}

/**
 * @interface
 * @member IContentStore
 * @summary Content store class interface
 */
interface IContentStore {
  publish(input: IPublishedAsset | IPublishedEntry): Promise<any>
  unpublish(input: IUnpublishedAsset | IUnpublishedEntry): Promise<any>
  delete(input: IDeletedAsset | IDeletedEntry): Promise<any>
}

/**
 * @class S3
 * @public
 * @summary Wrapper around AWS S3, to upload, unpublish and delete Contentstack's assets
 * @example
 * const s3 = new S3(awsS3Instance, appConfig)
 * return s3.download(asset: Iasset)
 *  .then((uploadResponse) => console.log)
 * @returns {S3} Returns S3 instance
 */
export class S3 implements IContentStore {
  private assetStore: any
  private config: any
  private keys: any
  private s3: any
  private patterns: {
    asset: string[],
    entry: string[],
    contentType: string[],
  }
  private unwantedKeys: {
    asset: any,
    contentType: any,
    entry: any
  }
  private requiredKeys: {
    asset: any,
    contentType: any,
    entry: any
  }

	constructor (assetStore, s3, config) {
    this.assetStore = assetStore
    this.config = config.contentStore
    this.keys = this.config.internal.keys
    this.s3 = s3
    this.unwantedKeys = this.config.internal.unwantedKeys
    this.requiredKeys = this.config.internal.requiredKeys
    this.patterns = {
      asset: this.config.patterns.asset.split('/'),
      entry: this.config.patterns.entry.split('/'),
      contentType: this.config.patterns.contentType.split('/')
    }
	}

  /**
   * @public
   * @method publish
   * @summary Save published json and upload it to AWS S3
   * @param {object} publishedObject JSON be stored in AWS S3
   * @example
   * const s3 = new S3(awsS3Instance, appConfig)
   * return s3.publish(input)
   *  .then((uploadResponse) => console.log(...))
   * 
   * @returns {Promise} Returns after uploading the file onto aws s3
   */
  public publish (publishedObject) {
    if (publishedObject.content_type_uid === this.keys.assets) {
      return this.publishAsset(publishedObject)
    }

    return this.publishEntry(publishedObject)
  }

  public publishEntry (publishedEntry: IPublishedEntry) {
    return new Promise(async (resolve, reject) => {
      try {
        const clonedObject = cloneDeep(publishedEntry)
        const entry = {
          locale: clonedObject.locale,
          uid: clonedObject.uid,
          content_type_uid: clonedObject.content_type_uid,
          data: clonedObject.data
        }

        const contentType = {
          uid: clonedObject.content_type_uid,
          content_type_uid: this.keys.content_type_uid,
          data: (clonedObject as IPublishedEntry).content_type
        }

        validatePublishedObject(entry.data, this.requiredKeys.entry)
        validatePublishedObject(contentType.data, this.requiredKeys.contentType)

        filterKeys(entry.data, this.unwantedKeys.entry)
        filterKeys(contentType.data, this.unwantedKeys.entry)

        const entryPath = getPath(this.patterns.entry, entry, this.config.versioning)
        const schemaPath = getPath(this.patterns.contentType, contentType, this.config.versioning)

        const params = cloneDeep(this.config.uploadParams)
        params.Key = entryPath
        params.Body = JSON.stringify(entry)

        // Upload entry json
        return this.s3.putObject(params)
          .on('error', reject)
          .promise()
          .then((entryUploadResponse) => {
            debug(`Entry s3 upload response: ${JSON.stringify(entryUploadResponse)}`)
            const params2 = cloneDeep(this.config.uploadParams)
            params2.Key = schemaPath
            params2.Body = JSON.stringify(contentType)

            // Upload content type schema json
            return this.s3.putObject(params2)
            .on('error', reject)
            .promise()
          })
          .then((ctUploadResponse) => {
            debug(`Content type s3 upload response: ${JSON.stringify(ctUploadResponse)}`)

            return resolve(publishedEntry)
          })
          .catch(reject)
        } catch (error) {
          return reject(error)
        }
    })
  }

  public publishAsset (publishedAsset: IPublishedAsset) {
    return new Promise(async (resolve, reject) => {
      try {
        const asset = cloneDeep(publishedAsset)

        validatePublishedObject(asset.data, this.requiredKeys.asset)
        filterKeys(asset.data, this.unwantedKeys.asset)
        await this.assetStore.download(asset.data)

        const assetPath = getPath(this.patterns.asset, asset, this.config.versioning)

        const params = cloneDeep(this.config.uploadParams)
        params.Key = assetPath
        params.Body = JSON.stringify(asset)

        const req = this.s3.upload(params)
          .on('httpUploadProgress', debug)
          .on('error', reject)
          .promise()
          .then((s3Response) => {
            debug(`Asset s3 upload response: ${JSON.stringify(s3Response)}`)

            return resolve(publishedAsset)
          })
          .catch(reject)
          req.on('build', () => {
            if (asset.data._version) {
              req.httpRequest.headers['x-amz-meta-download_id'] = asset.data._version
            }
          })
        } catch (error) {
          return reject(error)
        }
    })
  }

  public unpublish (unpublishedObject: IUnpublishedAsset | IUnpublishedEntry) {
    if (unpublishedObject.content_type_uid === this.keys.assets) {
      return this.unpublishAsset(unpublishedObject)
    }

    return this.unpublishEntry(unpublishedObject)
  }

  private searchS3 (uid: string) {
    return new Promise((resolve, reject) => {
      const params = cloneDeep(this.config.uploadParams)
      params.Delimiter = uid
      // params.MaxKeys = 0

      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
      // params.RequestPayer = 'requester'

      return this.s3.listObjects(params)
        .on('httpUploadProgress', debug)
        .on('error', reject)
        .promise()
        .then((s3Response) => {
          debug(`searchS3: list objects response: ${JSON.stringify(s3Response, null, 2)}`)

          return resolve(s3Response.CommonPrefixes)
        })
        .catch(reject)
    })
  }

  private fetchContents (Prefix, Contents) {
    return new Promise((resolve, reject) => {
      const params = cloneDeep(this.config.uploadParams)
      params.Prefix = Prefix

      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
      // params.RequestPayer = 'requester'

      return this.s3.listObjects(params)
        .on('httpUploadProgress', debug)
        .on('error', reject)
        .promise()
        .then((s3Response) => {
          debug(`fetchContents: list objects response: ${JSON.stringify(s3Response, null, 2)}`)

          // TODO: Consideration, what if there are more than 1000 keys? Pagination Required!
          Contents.concat(s3Response.Contents)
          return resolve()
        })
        .catch(reject)
    })
  }

  private fetch (input: any) {
    return new Promise(async (resolve, reject) => {
      const Prefixes: { Prefix: string }[] = (await this.searchS3(input.uid) as { Prefix: string}[])
      const UniqPrefixes = uniqBy(Prefixes, 'Prefix')

      const Contents: IContents[] = []
      const promises: Promise<any>[] = []

      UniqPrefixes.forEach((Prefix) => {
        promises.push(this.fetchContents(Prefix, Contents))
      })

      return Promise.all(promises)
        .then(() => {
          const UniqContents: IContents[] = uniqBy(Contents, 'Key')
          const promises2: Promise<any>[] = []
          const Items: IContents[] = []

          UniqContents.forEach((Content: IContents) => {
            promises2.push(this.fetchContents(Content.Key, Items))
          })

          return Promise.all(promises2)
            .then(() => {
              return Items
            })
        })
        .then((Items) => {
          const ItemsData: any = 
        })
    })
  }

  private unpublishAsset (asset: IUnpublishedAsset) {
    return new Promise(async (resolve, reject) => {
      try {
        const assets = await this.fetch(asset)
      } catch (error) {
        return reject(error)
      }
    })
  }

  private unpublishEntry (entry: IUnpublishedEntry) {
    return new Promise((resolve, reject) => {
      try {
        const entries = await this.fetch(entry)
      } catch (error) {
        return reject(error)
      }
    })
  }

  public delete (deletedObject: IDeletedAsset | IDeletedEntry) {
    return new Promise((resolve/* , reject */) => {
      return resolve(deletedObject)
    })
  }
}