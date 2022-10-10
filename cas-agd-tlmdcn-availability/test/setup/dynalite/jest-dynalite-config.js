const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const service = yaml.load(
  fs.readFileSync(path.join(process.cwd(), 'serverless.yml'), 'utf8')
)

const tables = Object.keys(service.resources.Resources)
  .map((name) => ({ name, resource: service.resources.Resources[name] }))
  .filter((item) => item.resource.Type === 'AWS::DynamoDB::Table')
  .map((item) => {
    delete item.resource.Properties.TimeToLiveSpecification
    delete item.resource.Properties.PointInTimeRecoverySpecification
    item.resource.Properties.TableName = item.name
    return item.resource.Properties
  })

module.exports = {
  tables,
  basePort: 9000
}
