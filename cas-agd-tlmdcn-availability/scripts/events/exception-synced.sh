AWS_PROFILE=alemana-telemedicina-dev \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapExceptionSynced \
  --payload '{
    "detail": {
      "body": {
        "id": "35407",
        "startDate": "2022-09-01",
        "endDate": "2022-12-30",
        "isEnabled": true,
        "recurrence": "weekly",
        "repeatRecurrenceEvery": 1,
        "professionalIds": [
          "2048"
        ],
        "serviceIds": [
          "265"
        ],
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
                "startTime": "12:30:00",
                "endTime": "13:00:00"
              },
              {
                "startTime": "13:00:00",
                "endTime": "15:00:00"
              }
            ]
          }
        ],
        "createdAt": "2022-10-07T17:40:15Z",
        "updatedAt": "2022-10-07T17:48:15Z"
      }
    }
  }'
