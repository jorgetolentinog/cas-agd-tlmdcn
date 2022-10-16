AWS_ACCESS_KEY_ID=local \
AWS_SECRET_ACCESS_KEY=local \
AWS_REGION=us-east-1 \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapPreBookingSynced \
  --payload '{
    "detail": {
      "body": {
        "id": "8191710",
        "date": "2022-09-08T17:00:00",
        "companyId": "2",
        "officeId": "11",
        "serviceId": "265",
        "professionalId": "2048",
        "calendarId": "28746",
        "blockDurationInMinutes": 30,
        "isEnabled": true,
        "createdAt": "2022-10-16T15:29:26.259Z",
        "updatedAt": "2022-10-16T15:29:26.259Z"
      }
    }
  }'
