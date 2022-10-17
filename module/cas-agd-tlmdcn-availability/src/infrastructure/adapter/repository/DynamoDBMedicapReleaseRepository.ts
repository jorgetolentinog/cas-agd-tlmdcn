import { MedicapReleaseRepository } from "@/domain/repository/MedicapReleaseRepository";
import { MedicapRelease } from "@/domain/schema/MedicapRelease";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/dynamodb/DynamoDBDocument";

@injectable()
export class DynamoDBMedicapReleaseRepository
  implements MedicapReleaseRepository
{
  private readonly _table = process.env.DYNAMODB_TABLE ?? "DynamoDBTable";

  constructor(private readonly dynamodb: DynamoDBDocument) {}

  async create(release: MedicapRelease): Promise<void> {
    await this.dynamodb.client
      .put({
        TableName: this._table,
        Item: {
          id: release.id,
          date: release.date,
          blockDurationInMinutes: release.blockDurationInMinutes,
          professionalId: release.professionalId,
          serviceId: release.serviceId,
          isEnabled: release.isEnabled,
          createdAt: release.createdAt,
          updatedAt: release.updatedAt,

          // Interno
          _pk: `medicapRelease#${release.id}`,
          _sk: `medicapRelease#${release.id}`,
          _gsi1pk: `medicapRelease#serviceId#${release.serviceId}#professionalId#${release.professionalId}#isEnabled#${release.isEnabled}`,
          _gsi1sk: release.date,
        },
        ExpressionAttributeNames: {
          "#_pk": "_pk",
          "#_sk": "_sk",
        },
        ConditionExpression:
          "attribute_not_exists(#_pk) and attribute_not_exists(#_sk)",
      })
      .promise();
  }

  async update(release: MedicapRelease): Promise<void> {
    const attrs = {
      date: release.date,
      blockDurationInMinutes: release.blockDurationInMinutes,
      professionalId: release.professionalId,
      serviceId: release.serviceId,
      isEnabled: release.isEnabled,
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,

      // Interno
      _gsi1pk: `medicapRelease#serviceId#${release.serviceId}#professionalId#${release.professionalId}#isEnabled#${release.isEnabled}`,
      _gsi1sk: release.date,
    };

    let updateExpression = "set ";
    const expressionAttributeNames: Record<string, string> = {
      "#_pk": "_pk",
      "#_sk": "_sk",
    };
    const expressionAttributeValues: Record<string, unknown> = {};
    for (const prop in attrs) {
      const value = (attrs as Record<string, unknown>)[prop] ?? null;
      updateExpression += ` #${prop} = :${prop},`;
      expressionAttributeNames[`#${prop}`] = prop;
      expressionAttributeValues[`:${prop}`] = value;
    }
    updateExpression = updateExpression.slice(0, -1);

    await this.dynamodb.client
      .update({
        TableName: this._table,
        Key: {
          _pk: `medicapRelease#${release.id}`,
          _sk: `medicapRelease#${release.id}`,
        },
        UpdateExpression: updateExpression,
        ConditionExpression:
          "attribute_exists(#_pk) and attribute_exists(#_sk) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(releaseId: string): Promise<MedicapRelease | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#_pk = :_pk and #_sk = :_sk",
        ExpressionAttributeNames: { "#_pk": "_pk", "#_sk": "_sk" },
        ExpressionAttributeValues: {
          ":_pk": `medicapRelease#${releaseId}`,
          ":_sk": `medicapRelease#${releaseId}`,
        },
      })
      .promise();

    const item = result.Items?.[0];
    if (item == null) {
      return null;
    }

    return {
      id: item.id,
      date: item.date,
      blockDurationInMinutes: item.blockDurationInMinutes,
      professionalId: item.professionalId,
      serviceId: item.serviceId,
      isEnabled: item.isEnabled,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
