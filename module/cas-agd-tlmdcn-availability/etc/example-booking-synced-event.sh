AWS_ACCESS_KEY_ID=local \
AWS_SECRET_ACCESS_KEY=local \
AWS_REGION=us-east-1 \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapBookingSynced \
  --payload '{
    "detail": {
      "body": {
        "id": "8191712",
        "date": "2022-09-08T15:30:00",
        "companyId": "2",
        "officeId": "11",
        "serviceId": "265",
        "professionalId": "3178",
        "patientId": "4019659",
        "calendarId": "30660",
        "blockDurationInMinutes": 30,
        "isEnabled": true,
        "createdAt": "2022-10-14T15:09:54.918Z",
        "updatedAt": "2022-10-15T17:37:32.093Z"
      }
    }
  }'
