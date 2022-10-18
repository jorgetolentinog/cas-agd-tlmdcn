AWS_ACCESS_KEY_ID=local \
AWS_SECRET_ACCESS_KEY=local \
AWS_REGION=us-east-1 \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapCalendarSynced \
  --payload '{
    "detail": {
      "body": {
        "id": "28173",
        "startDate": "2022-09-01",
        "endDate": "2022-12-30",
        "isEnabled": true,
        "companyId": "2",
        "officeId": "11",
        "serviceId": "265",
        "medicalAreaIds": [
          "204",
          "78"
        ],
        "interestAreaIds": [
          "611",
          "612"
        ],
        "professionalId": "2048",
        "blockDurationInMinutes": 25,
        "conditionOfService": {},
        "days": [
          {
            "dayOfWeek": 1,
            "blocks": [
              {
                "startTime": "08:00:00",
                "endTime": "09:00:00"
              },
              {
                "startTime": "09:00:00",
                "endTime": "10:00:00"
              }
            ]
          },
          {
            "dayOfWeek": 3,
            "blocks": [
              {
                "startTime": "12:00:00",
                "endTime": "13:00:00"
              },
              {
                "startTime": "13:00:00",
                "endTime": "14:00:00"
              }
            ]
          }
        ],
        "createdAt": "2022-10-08T22:05:36Z",
        "updatedAt": "2022-10-08T22:12:36Z"
      }
    }
  }'
