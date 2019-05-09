import { join } from 'path'

export const getPath = (keys, input, versioning) => {
  const path = []

  keys.forEach((key) => {
    if (key.charAt(0) === ':') {
      key = key.slice(1)
      if (versioning && key === 'version') {
        if (input.data.url && input.data.download_id) {
          // instead of version, add the download_id (in case of RTE)
          path.push(input.data.download_id)
        } else {
          path.push(input.data._version.toString())
        }
      } else if (key in input) {
        path.push(input[key])
      } else {
        throw new TypeError(`${key} did not exist in ${JSON.stringify(input)}!`)
      }
    } else {
      path.push(key)
    }
  })

  return join.apply(this, path)
}

export const formatConfig = (config) => {
  const bucket = config.bucketParams
  if (bucket.name) {
    bucket.Bucket = bucket.name
    delete bucket.name
  }

  if (typeof bucket.ACL !== 'string') {
    bucket.ACL = 'public-read-write'
  }

  config.bucketName = bucket.Bucket
  config.uploadParams.Bucket = bucket.Bucket
  config.region = config.region || process.env.AWS_REGION
  config.apiVersion = config.apiVersion || 'latest'

  return config
}

export const buildAWSConfig = (config) => {
  const awsConfig = {
    apiVersion: config.apiVersion,
    region: config.region
  }

  // https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html
  if (process.env.AWS_ACCESS_KEY_ID || (config.credentials && config.credentials.accessKeyId)) {
    (awsConfig as any).accessKeyId = process.env.AWS_ACCESS_KEY_ID || config.credentials.accessKeyId
  }

  if (process.env.AWS_SECRET_ACCESS_KEY || (config.credentials && config.credentials.secretAccessKey)) {
    (awsConfig as any).secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || config.credentials.secretAccessKey
  }

  return awsConfig
}

export const filterKeys = (input, keys = {}) => {
  for (const key in keys) {
    if (keys[key]) {
      delete input[key]
    }
  }

  return input
}
