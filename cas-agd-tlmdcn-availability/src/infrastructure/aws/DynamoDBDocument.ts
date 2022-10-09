import { AWSType, AWS } from '@/infrastructure/aws'

export class DynamoDBDocument {
  readonly client: AWSType.DynamoDB.DocumentClient

  constructor() {
    this.client = new AWS.DynamoDB.DocumentClient(this.getOptions())
  }

  private getOptions() {
    let options = {}
    if (process.env.NODE_ENV === 'test') {
      options = {
        endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
        sslEnabled: false,
        region: 'local'
      }
    } else if (process.env.IS_OFFLINE) {
      options = {
        endpoint: 'http://localhost:8000',
        region: 'local'
      }
    }
    return options
  }
}
