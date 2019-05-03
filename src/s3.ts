import Debug from 'debug'
import { cloneDeep } from 'lodash'
import { getPath } from './util/index'
import { validatePublishedObject, validateUnpublishedObject, validateDeletedObject } from './util/validations'

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
interface IPublishedEntry extends IPublish {}

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
export class S3 {
  private assetStore: any
  private config: any
  private keys: any
  private patternKeys: string[]
  private s3: any

	constructor (assetStore, s3, config) {
    this.assetStore = assetStore
    this.config = config.assetStore
    this.keys = this.config.internal.keys
    this.s3 = s3
    this.patternKeys = this.config.pattern.split('/')
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
  public publish (publishedObject: IPublishedAsset | IPublishedEntry) {
    return new Promise(async (resolve, reject) => {
      try {
        const clonedObject = cloneDeep(publishedObject)
        validatePublishedObject(clonedObject)

        if (clonedObject.content_type_uid === this.keys.assets) {
          filterAssetKeys(clonedObject.data)
          await this.assetStore.download(clonedObject)
        } else {
          filterEntryKeys(clonedObject.data)
        }

        const filePath = getPath(this.patternKeys, clonedObject, this.config.versioning)

        const params = cloneDeep(this.config.uploadParams)
        params.Key = filePath
        params.Body = JSON.stringify(clonedObject)

        return this.s3.upload(params)
          .on('httpUploadProgress', debug)
          .on('error', reject)
          .promise()
          .then((s3Response) => {
            debug(`S3 upload response: ${JSON.stringify(s3Response)}`)
            return resolve(publishedObject)
          })
          .catch(reject)
        } catch (error) {
          return reject(error)
        }
    })
  }

  /**
   * @public
   * @method delete
   * @summary Delete the selected assets from AWS S3
   * @param {array} assets to be deleted from AWS S3. Asset is of type: IAsset
   * @example
   * const s3 = new S3(awsS3Instance, appConfig)
   * return s3.delete(asset: Iasset[])
   *  .then((deleteResponse) => console.log)
   * 
   * @returns {Promise} Returns the delete marker details embedded in the input asset object
  */
  public delete (assets) {
    assets.forEach((asset) => validateDeletedAsset(asset))

    const promisifiedBucket = []

    assets.forEach((asset) => {
      promisifiedBucket.push(
        (() => {
          return new Promise((resolve, reject) => {

            return this.s3.deleteObject({
              Bucket: this.config.bucketParams.Bucket,
              Key: asset.Key
            }, (error, response) => {
              if (error) {
                return reject(error)
              }
              debug(`S3 asset (${asset.uid}) response ${JSON.stringify(response)}`)
      
              return resolve(asset)
            })
          })
        }
      )())
    })

    return Promise.all(promisifiedBucket)
  }

  /**
   * @public
   * @method unpublish
   * @summary Unpublish the selected asset from AWS S3
   * @param {object} asset to be deleted from AWS S3. Asset is of type: IAsset
   * @example
   * const s3 = new S3(awsS3Instance, appConfig)
   * return s3.unpublish(asset: Iasset[])
   *  .then((deleteResponse) => console.log)
   * 
   * @returns {Promise} Returns the delete marker details embedded in the input asset object
  */
  public unpublish (asset) {

    return new Promise((resolve, reject) => {
      validateUnpublishedAsset(asset)

      return this.s3.deleteObject({
        Bucket: this.config.bucketParams.Bucket,
        Key: asset.Key
      }, (error, response) => {
        if (error) {
          return reject(error)
        }
        debug(`S3 asset (${asset.uid}) response ${JSON.stringify(response)}`)

        return resolve(asset)
      })
    })
  }
}