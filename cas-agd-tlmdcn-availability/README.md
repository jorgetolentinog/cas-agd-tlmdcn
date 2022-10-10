# CAS-AGD-TLMDCN-AVAILABILITY

## Agregar reserva

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
        "date": "2020-10-01T12:00:00",
        "companyId": "2",
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

## Agregar pre reserva

```
AWS_PROFILE=alemana-telemedicina-dev \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapPreBookingSynced \
  --payload '{
    "detail": {
      "detail": {
        "id": "10001",
        "date": "2022-09-08T17:00:00",
        "companyId": "2",
        "officeId": "11",
        "serviceId": "265",
        "professionalId": "334763",
        "calendarId": "28746",
        "blockDurationInMinutes": 30,
        "isEnabled": true,
        "createdAt": "2022-10-08T14:46:30.971Z",
        "updatedAt": "2022-10-08T21:14:19.062Z"
      }
    }
  }'
```


## Agregar liberación

```
AWS_PROFILE=alemana-telemedicina-dev \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapReleaseSynced \
  --payload '{
    "detail": {
      "detail": {
        "id": "100",
        "date": "2020-09-15T14:00:00",
        "blockDurationInMinutes": 30,
        "professionalId": "2549",
        "serviceId": "92",
        "isEnabled": true,
        "createdAt": "2022-10-07T16:40:36.192Z",
        "updatedAt": "2022-10-08T22:01:54.189Z"
      }
    }
  }'
```

## Agregar calendario

```
AWS_PROFILE=alemana-telemedicina-dev \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapCalendarSynced \
  --payload '{
    "detail": {
      "detail": {
        "id": "28173",
        "startDate": "2022-09-01",
        "endDate": "2022-09-30",
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
        "conditionsOfService": {},
        "days": [
          {
            "dayOfWeek": 1,
            "blocks": [
              {
                "startTime": "08:00:00",
                "endTime": "09:00:00"
              }
            ]
          }
        ],
        "createdAt": "2022-10-08T22:05:36Z",
        "updatedAt": "2022-10-08T22:10:36Z"
      }
    }
  }'
```

## Agregar excepción

```
AWS_PROFILE=alemana-telemedicina-dev \
aws lambda invoke /dev/null \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --endpoint-url http://localhost:3002 \
  --function-name cas-agd-tlmdcn-availability-dev-eventMedicapExceptionSynced \
  --payload '{
    "detail": {
      "detail": {
        "id": "35407",
        "startDate": "2021-08-01",
        "endDate": "2021-08-12",
        "isEnabled": true,
        "recurrence": "weekly",
        "repeatRecurrenceEvery": 1,
        "professionalIds": [
          "3432"
        ],
        "serviceIds": [
          "341"
        ],
        "days": [
          {
            "dayOfWeek": 1,
            "blocks": [
              {
                "startTime": "08:00:00",
                "endTime": "09:00:00"
              }
            ]
          }
        ],
        "createdAt": "2022-10-07T17:40:15Z",
        "updatedAt": "2022-10-07T17:45:15Z"
      }
    }
  }'
```
