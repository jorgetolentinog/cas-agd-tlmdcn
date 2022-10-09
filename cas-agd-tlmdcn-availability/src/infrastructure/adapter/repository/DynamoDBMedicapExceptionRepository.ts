import { MedicapExceptionRepository } from "@/domain/repository/MedicapExceptionRepository";
import { MedicapException } from "@/domain/schema/MedicapException";
import { injectable } from "tsyringe";
import { DynamoDBDocument } from "@/infrastructure/aws/DynamoDBDocument";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { chunkArray } from "@/domain/service/chunk-array";

@injectable()
export class DynamoDBMedicapExceptionRepository
  implements MedicapExceptionRepository
{
  private readonly _table =
    process.env.DYNAMODB_TABLE_MEDICAP_EXCEPTION ?? "MedicapExceptionTable";

  constructor(private readonly dynamodb: DynamoDBDocument) {}

  async create(exception: MedicapException): Promise<void> {
    await this.dynamodb.client
      .put({
        TableName: this._table,
        Item: {
          id: exception.id,
          startDate: exception.startDate,
          endDate: exception.endDate,
          isEnabled: exception.isEnabled,
          recurrence: exception.recurrence,
          repeatRecurrenceEvery: exception.repeatRecurrenceEvery,
          professionalIds: exception.professionalIds,
          serviceIds: exception.serviceIds,
          dayOfMonth: exception.dayOfMonth,
          weekOfMonth: exception.weekOfMonth,
          dayOfWeek: exception.dayOfWeek,
          days: exception.days,
          createdAt: exception.createdAt,
          updatedAt: exception.updatedAt,

          // Interno
          _pk: exception.id,
          _sk: exception.id,
        },
        ExpressionAttributeNames: {
          "#_pk": "_pk",
        },
        ConditionExpression: "attribute_not_exists(#_pk)",
      })
      .promise();

    // la replica se hace despues de registrar para asegurar idempotencia.
    // Seria mejor usar SQS-FIFO para procesar una replica a la vez
    await this._replicate(exception);
  }

  async update(exception: MedicapException): Promise<void> {
    const attrs = {
      startDate: exception.startDate,
      endDate: exception.endDate,
      isEnabled: exception.isEnabled,
      recurrence: exception.recurrence,
      repeatRecurrenceEvery: exception.repeatRecurrenceEvery,
      professionalIds: exception.professionalIds,
      serviceIds: exception.serviceIds,
      dayOfMonth: exception.dayOfMonth,
      weekOfMonth: exception.weekOfMonth,
      dayOfWeek: exception.dayOfWeek,
      days: exception.days,
      createdAt: exception.createdAt,
      updatedAt: exception.updatedAt,
    };

    let updateExpression = "set ";
    const expressionAttributeNames: Record<string, string> = { "#_pk": "_pk" };
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
          _pk: exception.id,
          _sk: exception.id,
        },
        UpdateExpression: updateExpression,
        ConditionExpression:
          "attribute_exists(#_pk) and #updatedAt < :updatedAt",
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();

    // la replica se hace despues de actualizar para asegurar idempotencia
    // Seria mejor usar SQS-FIFO para procesar una replica a la vez
    await this._replicate(exception);
  }

  async findById(exceptionId: string): Promise<MedicapException | null> {
    const result = await this.dynamodb.client
      .query({
        TableName: this._table,
        KeyConditionExpression: "#_pk = :_pk and #_sk = :_sk",
        ExpressionAttributeNames: { "#_pk": "_pk", "#_sk": "_sk" },
        ExpressionAttributeValues: {
          ":_pk": exceptionId,
          ":_sk": exceptionId,
        },
      })
      .promise();

    const item = result.Items?.[0];
    if (item == null) {
      return null;
    }

    return {
      id: item.id,
      startDate: item.startDate,
      endDate: item.endDate,
      isEnabled: item.isEnabled,
      recurrence: item.recurrence,
      repeatRecurrenceEvery: item.repeatRecurrenceEvery,
      professionalIds: item.professionalIds,
      serviceIds: item.serviceIds,
      dayOfMonth: item.dayOfMonth,
      weekOfMonth: item.weekOfMonth,
      dayOfWeek: item.dayOfWeek,
      days: item.days,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private async _replicate(exception: MedicapException) {
    try {
      await this._deleteReplicaById(exception.id);

      const keys: Record<string, string>[] = [];
      for (const serviceId of exception.serviceIds) {
        for (const professionalId of exception.professionalIds) {
          const gsi1pk = `${serviceId}#${professionalId}#${exception.isEnabled}`;
          keys.push({
            _pk: exception.id,
            _sk: gsi1pk,
            _gsi1pk: gsi1pk,
            _gsi1sk: exception.startDate,
          });
        }
      }

      const request = keys.map((key) => {
        return {
          PutRequest: {
            Item: {
              id: exception.id,
              startDate: exception.startDate,
              endDate: exception.endDate,
              isEnabled: exception.isEnabled,
              recurrence: exception.recurrence,
              repeatRecurrenceEvery: exception.repeatRecurrenceEvery,
              professionalIds: exception.professionalIds,
              serviceIds: exception.serviceIds,
              dayOfMonth: exception.dayOfMonth,
              weekOfMonth: exception.weekOfMonth,
              dayOfWeek: exception.dayOfWeek,
              days: exception.days,
              createdAt: exception.createdAt,
              updatedAt: exception.updatedAt,

              // Interno
              _pk: key._pk,
              _sk: key._sk,
              _gsi1pk: key._gsi1pk,
              _gsi1sk: key._gsi1sk,
            },
          },
        };
      });

      for (const chunk of chunkArray(request, this.dynamodb.batchMaxSize)) {
        await this.dynamodb.client
          .batchWrite({
            RequestItems: { [this._table]: chunk },
          })
          .promise();
      }
    } catch (error) {
      console.error(error);
      throw new Error("Replica failed");
    }
  }

  private async _deleteReplicaById(exceptionId: string) {
    try {
      const query: DocumentClient.QueryInput = {
        TableName: this._table,
        KeyConditionExpression: "#_pk = :_pk",
        ExpressionAttributeNames: {
          "#_pk": "_pk",
        },
        ExpressionAttributeValues: {
          ":_pk": exceptionId,
        },
      };

      const items: DocumentClient.AttributeMap[] = [];
      let queryResult;

      do {
        queryResult = await this.dynamodb.client.query(query).promise();
        queryResult.Items?.forEach((item) => {
          if (item._sk !== exceptionId) {
            items.push(item);
          }
        });
        query.ExclusiveStartKey = queryResult.LastEvaluatedKey;
      } while (query.ExclusiveStartKey != null);

      const request = items.map((item) => ({
        DeleteRequest: { Key: { _pk: item._pk, _sk: item._sk } },
      }));

      for (const chunk of chunkArray(request, this.dynamodb.batchMaxSize)) {
        await this.dynamodb.client
          .batchWrite({
            RequestItems: { [this._table]: chunk },
          })
          .promise();
      }
    } catch (error) {
      console.error(error);
      throw new Error("Delete replica failed");
    }
  }
}
