import { MedicapReleaseRepository } from "@/domain/repository/MedicapReleaseRepository";
import { MedicapRelease } from "@/domain/schema/MedicapRelease";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/DynamoDBDocument";

@injectable()
export class DynamoDBMedicapReleaseRepository
  implements MedicapReleaseRepository
{
  private readonly _table =
    process.env.DYNAMODB_TABLE_MEDICAP_RELEASE ?? "MedicapReleaseTable";

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
          // GSI
          gsi_serviceId_professionalId_isEnabled: `${release.serviceId}#${release.professionalId}#${release.isEnabled}`,
        },
        ConditionExpression: "attribute_not_exists(id)",
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
      // GSI
      gsi_serviceId_professionalId_isEnabled: `${release.serviceId}#${release.professionalId}#${release.isEnabled}`,
    };

    let updateExpression = "set ";
    const expressionAttributeNames: Record<string, string> = {};
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
          id: release.id,
        },
        UpdateExpression: updateExpression,
        ConditionExpression: "attribute_exists(id) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  async findById(releaseId: string): Promise<MedicapRelease | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: { "#id": "id" },
        ExpressionAttributeValues: {
          ":id": releaseId,
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
