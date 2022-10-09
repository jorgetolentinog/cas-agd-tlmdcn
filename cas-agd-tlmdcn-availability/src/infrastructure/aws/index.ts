import AWSXRay from 'aws-xray-sdk-core'
import * as AWSType from 'aws-sdk'

let AWS = AWSType

if (process.env.IS_OFFLINE == null) {
  AWS = AWSXRay.captureAWS(AWSType)
}

export { AWSType, AWS }
