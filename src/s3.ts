import Debug from 'debug'
import { cloneDeep, map, uniqBy } from 'lodash'
import { getPath, filterKeys } from './util/index'
import { validatePublishedObject } from './util/validations'
import {
  assetMessages,
  contentTypeMessages,
  deleteMessages,
  entryMessages,
  fetchMessages,
  s3Messages,
  searchMessages,
} from './messages'

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
        debug(entryMessages.publishing(publishedEntry))
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
          data: clonedObject.content_type
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
            debug(entryMessages.uploadResponse(entryUploadResponse))
            const params2 = cloneDeep(this.config.uploadParams)
            params2.Key = schemaPath
            params2.Body = JSON.stringify(contentType)

            // Upload content type schema json
            return this.s3.putObject(params2)
            .on('error', reject)
            .promise()
          })
          .then((ctUploadResponse) => {
            debug(contentTypeMessages.uploadResponse(ctUploadResponse))

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
        debug(assetMessages.publishing(publishedAsset))
        const asset = cloneDeep(publishedAsset)
        // if (asset.data._version) {
        //   await this.unpublish(asset)
        // }
        validatePublishedObject(asset.data, this.requiredKeys.asset)
        filterKeys(asset.data, this.unwantedKeys.asset)
        await this.assetStore.download(asset.data)

        const assetPath = getPath(this.patterns.asset, asset, this.config.versioning)

        const params = cloneDeep(this.config.uploadParams)
        params.Key = assetPath
        params.Body = JSON.stringify(asset)

        return this.s3.upload(params)
          .on('httpUploadProgress', debug)
          .on('error', reject)
          .promise()
          .then((s3Response) => {
            debug(assetMessages.uploadResponse(s3Response))

            return resolve(publishedAsset)
          })
          .catch(reject)
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
      delete params.ACL
      params.Delimiter = uid
      // params.MaxKeys = 0
      debug(searchMessages.params(params))
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
      // params.RequestPayer = 'requester'

      return this.s3.listObjects(params)
        .on('httpUploadProgress', debug)
        .on('error', reject)
        .promise()
        .then((s3Response) => {
          debug(searchMessages.listObjectsResponse(s3Response))

          return resolve(s3Response.CommonPrefixes)
        })
        .catch(reject)
    })
  }

  private fetchContents (Prefix, Contents) {
    return new Promise((resolve, reject) => {
      const params = cloneDeep(this.config.uploadParams)
      delete params.ACL
      params.Prefix = Prefix
      debug(fetchMessages.params(params))
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
      // params.RequestPayer = 'requester'

      return this.s3.listObjects(params)
        .on('httpUploadProgress', debug)
        .on('error', reject)
        .promise()
        .then((s3Response) => {
          debug(fetchMessages.response(s3Response))
          // TODO: Consideration, what if there are more than 1000 keys? Pagination Required!
          s3Response.Contents.forEach((Content: IContents) => {
            Contents.push(Content)
          })
          return resolve(undefined)
        })
        .catch(reject)
    })
  }

  private fetch (uid: string, isDelete: boolean = false) {
    return new Promise(async (resolve, reject) => {
      try {
        const Prefixes: { Prefix: string }[] = (await this.searchS3(uid) as { Prefix: string}[])
        const UniqPrefixes = uniqBy(Prefixes, 'Prefix')
        debug(fetchMessages.uniquePrefixes(UniqPrefixes))
        const Contents: IContents[] = []
        const promises: Promise<any>[] = []

        UniqPrefixes.forEach((CommonPrefix) => {
          promises.push(this.fetchContents(CommonPrefix.Prefix, Contents))
        })

        return Promise.all(promises)
          .then(() => {
            const UniqContents: IContents[] = uniqBy(Contents, 'Key')
            const promises2: Promise<any>[] = []
            const Items: IContents[] = []
            debug(fetchMessages.uniqueContents(UniqContents))

            UniqContents.forEach((Content: IContents) => {
              promises2.push(this.fetchContents(Content.Key, Items))
            })

            return Promise.all(promises2)
              .then(() => {
                for (let i = 0; i < Items.length; i++) {
                  // Items that have '/' at the end of their Key are folders
                  if (Items[i].Key.charAt(Items[i].Key.length - 1) === '/') {
                    debug(deleteMessages.removingFolders(Items[i]))
                    Items.splice(i, 1)
                    i--
                  }
                }
                debug(s3Messages.itemsFound(Items))

                return Items
              })
          })
          .then((Items) => {
            if (isDelete) {
              return Items
            }
            const promises3: Promise<any>[] = []
            const ItemsData: any = []
            Items.forEach((Item) => {
              promises3.push(this.getObject(Item, ItemsData))
            })

            return Promise.all(promises3)
              .then(() => {
                return ItemsData
              })
          })
          .then((ItemsData) => resolve(ItemsData))
          .catch(reject)
        } catch (error) {
          return reject(error)
        }
    })
  }

  private getObject (Item, ItemsData) {
    return new Promise((resolve, reject) => {
      const params = cloneDeep(this.config.uploadParams)
      delete params.ACL
      params.Key = Item.Key
      debug(s3Messages.getObjectParams(params))

      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
      // params.RequestPayer = 'requester'

      return this.s3.getObject(params)
        .on('httpUploadProgress', debug)
        .on('error', reject)
        .promise()
        .then((s3Response) => {
          const data = JSON.parse(s3Response.Body)
          // TODO: Consideration, what if there are more than 1000 keys? Pagination Required!
          ItemsData.push(data)
          return resolve(undefined)
        })
        .catch(reject)
    })
  }

  private unpublishAsset (asset: IUnpublishedAsset) {
    return new Promise(async (resolve, reject) => {
      try {
        debug(assetMessages.unpublishing(asset))
        const assets: any = await this.fetch(asset.uid)
        let publishedAsset: any

        // what if there are more than 1 matches? TODO: Investigate
        for (let i = 0; i < assets.length; i++) {
          if (assets[i].data._version) {
            publishedAsset = assets[i]
            break
          }
        }
        
        if (typeof publishedAsset === 'undefined') {
          return resolve(asset)
        }

        await this.assetStore.unpublish(publishedAsset.data)

        const params = cloneDeep(this.config.uploadParams)
        delete params.ACL
        params.Key = getPath(this.patterns.asset, publishedAsset, this.config.versioning)
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
        // params.RequestPayer = 'requester'

        return this.s3.deleteObject(params)
          .on('httpUploadProgress', debug)
          .on('error', reject)
          .promise()
          .then((s3Response) => {
            debug(deleteMessages.deleteObjectResponse(s3Response))
            
            // TODO: Consideration, what if there are more than 1000 keys? Pagination Required!
            return resolve(asset)
          })
          .catch(reject)
      } catch (error) {
        return reject(error)
      }
    })
  }

  private unpublishEntry (entry: IUnpublishedEntry) {
    return new Promise(async (resolve, reject) => {
      try {
        const entries: any = await this.fetch(entry.uid)
        let publishedEntry: any

        // what if there are more than 1 matches? TODO: Investigate
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].data._version) {
            publishedEntry = entries[i]
            break
          }
        }

        if (typeof publishedEntry === 'undefined') {
          return resolve(entry)
        }

        const params = cloneDeep(this.config.uploadParams)
        delete params.ACL
        params.Key = getPath(this.patterns.entry, publishedEntry, this.config.versioning)
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
        // params.RequestPayer = 'requester'

        return this.s3.deleteObject(params)
          .on('httpUploadProgress', debug)
          .on('error', reject)
          .promise()
          .then((s3Response) => {
            debug(deleteMessages.deleteObjectResponse(s3Response))
            
            // TODO: Consideration, what if there are more than 1000 keys? Pagination Required!
            return resolve(entry)
          })
          .catch(reject)
      } catch (error) {
        return reject(error)
      }
    })
  }

  public delete (input: any) {
    return new Promise(async (resolve, reject) => {
      try {
        debug(deleteMessages.deleting(input))
        const matches: any = await this.fetch(input.uid)
        const Keys: any = await this.fetch(input.uid, true)
        // what if there are more than 1 matches? TODO: Investigate
        if (matches.length === 0) {
          return resolve(input)
        }
        const datas: any[] = map(matches, 'data')

        if (input.content_type_uid === this.keys.assets) {
          await this.assetStore.delete(datas)
        }
        const params = cloneDeep(this.config.uploadParams)
        delete params.ACL

        params.Delete = {
          Objects: [],
          Quiet: false
        }
        Keys.forEach((data) => {
          params.Delete.Objects.push({
            Key: data.Key
          })
        })

        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
        // params.RequestPayer = 'requester'

        return this.s3.deleteObjects(params)
          .on('httpUploadProgress', debug)
          .on('error', reject)
          .promise()
          .then((s3Response) => {
            debug(deleteMessages.deleteObjectResponse(s3Response))
            
            // TODO: Consideration, what if there are more than 1000 keys? Pagination Required!
            return resolve(input)
          })
          .catch(reject)
      } catch (error) {
        return reject(error)
      }
    })
  }
}