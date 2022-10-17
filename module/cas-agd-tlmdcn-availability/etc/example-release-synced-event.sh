AWS_ACCESS_KEY_ID=local \
  AWS_SECRET_ACCESS_KEY=local \
  AWS_REGION=us-east-1 \
  aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapReleaseSynced \
  --payload '{
    "detail": {
      "body": {
        "id": "838",
        "date": "2020-09-15T14:00:00",
        "blockDurationInMinutes": 30,
        "professionalId": "2549",
        "companyId": "2",
        "officeId": "11",
        "serviceId": "265",
        "calendarId": "21848",
        "isEnabled": true,
        "createdAt": "2022-10-16T15:29:42.727Z",
        "updatedAt": "2022-10-17T21:23:50.611Z"
      }
    }
  }'
