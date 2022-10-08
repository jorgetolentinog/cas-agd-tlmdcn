

## Ejecutar función EventMedicapBookingSynced

```
AWS_PROFILE=alemana-telemedicina-dev \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapBookingSynced \
  --payload '{
    "detail": {
      "detail": {
        "id": "10001",
        "date": "2020-10-01 12:00:00",
        "companyId": "02",
        "officeId": "11",
        "serviceId": "256",
        "professionalId": "10001",
        "patientId": "10001",
        "calendarId": "10001",
        "blockDurationInMinutes": 30,
        "isEnabled": true,
        "createdAt": "2020-10-01T12:00:00Z",
        "updatedAt": "2020-10-01T12:00:00Z"
      }
    }
  }'
```
