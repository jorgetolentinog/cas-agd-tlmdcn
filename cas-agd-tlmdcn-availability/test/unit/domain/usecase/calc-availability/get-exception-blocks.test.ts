import { dayjs } from "@/domain/service/date";
import { config } from "@/domain/config";
import { getExceptionBlocks } from "@/domain/usecase/calc-availability/get-exception-blocks";

test.skip("No debe devolver bloques con duración incompleta", async () => {
  // Arrange
  const startDate = dayjs.tz("2022-08-01", config.timezone);
  const endDate = dayjs.tz("2022-08-02", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 1,
    recurrence: "weekly",
    repeatRecurrenceEvery: 1,
    days: [
      {
        dayOfWeek: 1,
        blocks: [{ startTime: "23:58:00", endTime: "23:59:58" }],
      },
      {
        dayOfWeek: 2,
        blocks: [{ startTime: "23:58:00", endTime: "23:59:58" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 1,
      start: {
        local: "2022-08-01T23:58:00-04:00",
        utc: "2022-08-02T03:58:00.000Z",
      },
      end: {
        local: "2022-08-01T23:58:59-04:00",
        utc: "2022-08-02T03:58:59.000Z",
      },
    },
    {
      durationInMinutes: 1,
      start: {
        local: "2022-08-02T23:58:00-04:00",
        utc: "2022-08-03T03:58:00.000Z",
      },
      end: {
        local: "2022-08-02T23:58:59-04:00",
        utc: "2022-08-03T03:58:59.000Z",
      },
    },
  ]);
});

test("No debe devolver bloques de días no configurados", async () => {
  // Arrange
  const startDate = dayjs.tz("2022-08-01", config.timezone);
  const endDate = dayjs.tz("2022-08-07", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "weekly",
    repeatRecurrenceEvery: 1,
    days: [
      {
        dayOfWeek: 2,
        blocks: [{ startTime: "15:00:00", endTime: "15:30:00" }],
      },
      {
        dayOfWeek: 4,
        blocks: [{ startTime: "15:00:00", endTime: "15:30:00" }],
      },
      {
        dayOfWeek: 6,
        blocks: [{ startTime: "15:00:00", endTime: "15:30:00" }],
      },
    ],
  });

  // Act
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2022-08-02T15:00:00-04:00",
        utc: "2022-08-02T19:00:00.000Z",
      },
      end: {
        local: "2022-08-02T15:29:59-04:00",
        utc: "2022-08-02T19:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2022-08-04T15:00:00-04:00",
        utc: "2022-08-04T19:00:00.000Z",
      },
      end: {
        local: "2022-08-04T15:29:59-04:00",
        utc: "2022-08-04T19:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2022-08-06T15:00:00-04:00",
        utc: "2022-08-06T19:00:00.000Z",
      },
      end: {
        local: "2022-08-06T15:29:59-04:00",
        utc: "2022-08-06T19:29:59.000Z",
      },
    },
  ]);
});

test.skip("No debe devolver bloque deshabilitado", async () => {
  // Arrange
  const startDate = dayjs.tz("2022-08-01", config.timezone);
  const endDate = dayjs.tz("2022-08-01", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 20,
    recurrence: "weekly",
    repeatRecurrenceEvery: 1,
    days: [
      {
        dayOfWeek: 1,
        blocks: [{ startTime: "15:00:00", endTime: "15:59:59" }],
      },
    ],
    shouldDisableBlock(block) {
      return block.start.local === "2022-08-01T15:20:00-04:00";
    },
  });

  // Act
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 20,
      start: {
        local: "2022-08-01T15:00:00-04:00",
        utc: "2022-08-01T19:00:00.000Z",
      },
      end: {
        local: "2022-08-01T15:19:59-04:00",
        utc: "2022-08-01T19:19:59.000Z",
      },
    },
    {
      durationInMinutes: 20,
      start: {
        local: "2022-08-01T15:40:00-04:00",
        utc: "2022-08-01T19:40:00.000Z",
      },
      end: {
        local: "2022-08-01T15:59:59-04:00",
        utc: "2022-08-01T19:59:59.000Z",
      },
    },
  ]);
});

test("No debe devolver hora local invalida cuando inicie el horario de verano", async () => {
  // Arrange
  const startDate = dayjs.tz("2022-09-03", config.timezone);
  const endDate = dayjs.tz("2022-09-04", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 60,
    recurrence: "weekly",
    repeatRecurrenceEvery: 1,
    days: [
      {
        dayOfWeek: 6,
        blocks: [{ startTime: "23:00:00", endTime: "23:59:59" }],
      },
      {
        dayOfWeek: 7,
        blocks: [{ startTime: "00:00:00", endTime: "01:59:59" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 60,
      start: {
        local: "2022-09-03T23:00:00-04:00",
        utc: "2022-09-04T03:00:00.000Z",
      },
      end: {
        local: "2022-09-03T23:59:59-04:00",
        utc: "2022-09-04T03:59:59.000Z",
      },
    },
    {
      durationInMinutes: 60,
      start: {
        local: "2022-09-04T01:00:00-03:00",
        utc: "2022-09-04T04:00:00.000Z",
      },
      end: {
        local: "2022-09-04T01:59:59-03:00",
        utc: "2022-09-04T04:59:59.000Z",
      },
    },
  ]);
});

test("No debe devolver hora local invalida cuando termine el horario de verano", async () => {
  // Arrange
  const startDate = dayjs.tz("2023-04-01", config.timezone);
  const endDate = dayjs.tz("2023-04-02", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 60,
    recurrence: "weekly",
    repeatRecurrenceEvery: 1,
    days: [
      {
        dayOfWeek: 6,
        blocks: [{ startTime: "22:00:00", endTime: "23:59:59" }],
      },
      {
        dayOfWeek: 7,
        blocks: [{ startTime: "00:00:00", endTime: "00:59:59" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 60,
      start: {
        local: "2023-04-01T22:00:00-03:00",
        utc: "2023-04-02T01:00:00.000Z",
      },
      end: {
        local: "2023-04-01T22:59:59-03:00",
        utc: "2023-04-02T01:59:59.000Z",
      },
    },
    {
      durationInMinutes: 60,
      start: {
        local: "2023-04-01T23:00:00-03:00",
        utc: "2023-04-02T02:00:00.000Z",
      },
      end: {
        local: "2023-04-01T23:59:59-03:00",
        utc: "2023-04-02T02:59:59.000Z",
      },
    },
    {
      durationInMinutes: 60,
      start: {
        local: "2023-04-02T00:00:00-04:00",
        utc: "2023-04-02T04:00:00.000Z",
      },
      end: {
        local: "2023-04-02T00:59:59-04:00",
        utc: "2023-04-02T04:59:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día jueves de cada semana de octubre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-10-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "weekly",
    repeatRecurrenceEvery: 1,
    days: [
      {
        dayOfWeek: 4,
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-01T11:00:00-03:00",
        utc: "2020-10-01T14:00:00.000Z",
      },
      end: {
        local: "2020-10-01T11:29:59-03:00",
        utc: "2020-10-01T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-08T11:00:00-03:00",
        utc: "2020-10-08T14:00:00.000Z",
      },
      end: {
        local: "2020-10-08T11:29:59-03:00",
        utc: "2020-10-08T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-15T11:00:00-03:00",
        utc: "2020-10-15T14:00:00.000Z",
      },
      end: {
        local: "2020-10-15T11:29:59-03:00",
        utc: "2020-10-15T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-22T11:00:00-03:00",
        utc: "2020-10-22T14:00:00.000Z",
      },
      end: {
        local: "2020-10-22T11:29:59-03:00",
        utc: "2020-10-22T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-29T11:00:00-03:00",
        utc: "2020-10-29T14:00:00.000Z",
      },
      end: {
        local: "2020-10-29T11:29:59-03:00",
        utc: "2020-10-29T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día jueves cada dos semanas de octubre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-10-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "weekly",
    repeatRecurrenceEvery: 2,
    days: [
      {
        dayOfWeek: 4,
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-01T11:00:00-03:00",
        utc: "2020-10-01T14:00:00.000Z",
      },
      end: {
        local: "2020-10-01T11:29:59-03:00",
        utc: "2020-10-01T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-15T11:00:00-03:00",
        utc: "2020-10-15T14:00:00.000Z",
      },
      end: {
        local: "2020-10-15T11:29:59-03:00",
        utc: "2020-10-15T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-29T11:00:00-03:00",
        utc: "2020-10-29T14:00:00.000Z",
      },
      end: {
        local: "2020-10-29T11:29:59-03:00",
        utc: "2020-10-29T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día 21 de octubre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-10-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 1,
    dayOfMonth: 21,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-21T11:00:00-03:00",
        utc: "2020-10-21T14:00:00.000Z",
      },
      end: {
        local: "2020-10-21T11:29:59-03:00",
        utc: "2020-10-21T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día 21 de cada mes desde octubre a diciembre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 1,
    dayOfMonth: 21,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-21T11:00:00-03:00",
        utc: "2020-10-21T14:00:00.000Z",
      },
      end: {
        local: "2020-10-21T11:29:59-03:00",
        utc: "2020-10-21T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-11-21T11:00:00-03:00",
        utc: "2020-11-21T14:00:00.000Z",
      },
      end: {
        local: "2020-11-21T11:29:59-03:00",
        utc: "2020-11-21T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-21T11:00:00-03:00",
        utc: "2020-12-21T14:00:00.000Z",
      },
      end: {
        local: "2020-12-21T11:29:59-03:00",
        utc: "2020-12-21T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día 21 cada dos meses desde octubre a diciembre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 2,
    dayOfMonth: 21,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-21T11:00:00-03:00",
        utc: "2020-10-21T14:00:00.000Z",
      },
      end: {
        local: "2020-10-21T11:29:59-03:00",
        utc: "2020-10-21T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-21T11:00:00-03:00",
        utc: "2020-12-21T14:00:00.000Z",
      },
      end: {
        local: "2020-12-21T11:29:59-03:00",
        utc: "2020-12-21T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día lunes de cada semana de octubre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-10-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 1,
    dayOfWeek: 1,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-05T11:00:00-03:00",
        utc: "2020-10-05T14:00:00.000Z",
      },
      end: {
        local: "2020-10-05T11:29:59-03:00",
        utc: "2020-10-05T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-12T11:00:00-03:00",
        utc: "2020-10-12T14:00:00.000Z",
      },
      end: {
        local: "2020-10-12T11:29:59-03:00",
        utc: "2020-10-12T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-19T11:00:00-03:00",
        utc: "2020-10-19T14:00:00.000Z",
      },
      end: {
        local: "2020-10-19T11:29:59-03:00",
        utc: "2020-10-19T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-26T11:00:00-03:00",
        utc: "2020-10-26T14:00:00.000Z",
      },
      end: {
        local: "2020-10-26T11:29:59-03:00",
        utc: "2020-10-26T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día lunes de cada semana de cada dos meses de octubre a diciembre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 2,
    dayOfWeek: 1,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-05T11:00:00-03:00",
        utc: "2020-10-05T14:00:00.000Z",
      },
      end: {
        local: "2020-10-05T11:29:59-03:00",
        utc: "2020-10-05T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-12T11:00:00-03:00",
        utc: "2020-10-12T14:00:00.000Z",
      },
      end: {
        local: "2020-10-12T11:29:59-03:00",
        utc: "2020-10-12T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-19T11:00:00-03:00",
        utc: "2020-10-19T14:00:00.000Z",
      },
      end: {
        local: "2020-10-19T11:29:59-03:00",
        utc: "2020-10-19T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-26T11:00:00-03:00",
        utc: "2020-10-26T14:00:00.000Z",
      },
      end: {
        local: "2020-10-26T11:29:59-03:00",
        utc: "2020-10-26T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-07T11:00:00-03:00",
        utc: "2020-12-07T14:00:00.000Z",
      },
      end: {
        local: "2020-12-07T11:29:59-03:00",
        utc: "2020-12-07T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-14T11:00:00-03:00",
        utc: "2020-12-14T14:00:00.000Z",
      },
      end: {
        local: "2020-12-14T11:29:59-03:00",
        utc: "2020-12-14T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-21T11:00:00-03:00",
        utc: "2020-12-21T14:00:00.000Z",
      },
      end: {
        local: "2020-12-21T11:29:59-03:00",
        utc: "2020-12-21T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-28T11:00:00-03:00",
        utc: "2020-12-28T14:00:00.000Z",
      },
      end: {
        local: "2020-12-28T11:29:59-03:00",
        utc: "2020-12-28T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día lunes de la segunda semana de octubre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-10-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 2,
    dayOfWeek: 1,
    weekOfMonth: 2,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-05T11:00:00-03:00",
        utc: "2020-10-05T14:00:00.000Z",
      },
      end: {
        local: "2020-10-05T11:29:59-03:00",
        utc: "2020-10-05T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día lunes de la segunda de cada mes desde octubre a diciembre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 1,
    dayOfWeek: 1,
    weekOfMonth: 2,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-05T11:00:00-03:00",
        utc: "2020-10-05T14:00:00.000Z",
      },
      end: {
        local: "2020-10-05T11:29:59-03:00",
        utc: "2020-10-05T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-11-02T11:00:00-03:00",
        utc: "2020-11-02T14:00:00.000Z",
      },
      end: {
        local: "2020-11-02T11:29:59-03:00",
        utc: "2020-11-02T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-07T11:00:00-03:00",
        utc: "2020-12-07T14:00:00.000Z",
      },
      end: {
        local: "2020-12-07T11:29:59-03:00",
        utc: "2020-12-07T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia devolver un bloque el día lunes de la segunda semana del mes cada dos meses desde octubre a diciembre", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const blocks = getExceptionBlocks({
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    blockDurationInMinutes: 30,
    recurrence: "monthly",
    repeatRecurrenceEvery: 2,
    dayOfWeek: 1,
    weekOfMonth: 2,
    days: [
      {
        blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
      },
    ],
  });

  // Assert
  expect(blocks).toMatchObject([
    {
      durationInMinutes: 30,
      start: {
        local: "2020-10-05T11:00:00-03:00",
        utc: "2020-10-05T14:00:00.000Z",
      },
      end: {
        local: "2020-10-05T11:29:59-03:00",
        utc: "2020-10-05T14:29:59.000Z",
      },
    },
    {
      durationInMinutes: 30,
      start: {
        local: "2020-12-07T11:00:00-03:00",
        utc: "2020-12-07T14:00:00.000Z",
      },
      end: {
        local: "2020-12-07T11:29:59-03:00",
        utc: "2020-12-07T14:29:59.000Z",
      },
    },
  ]);
});

test("Deberia lanzar error si a la recurrencia semanal recibe el criterio dia de mes", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const wrapper = () => {
    getExceptionBlocks({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      blockDurationInMinutes: 30,
      recurrence: "weekly",
      repeatRecurrenceEvery: 1,
      dayOfMonth: 1,
      days: [
        {
          blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
        },
      ],
    });
  };

  // Assert
  expect(wrapper).toThrowError(/Week recurrence does not require specifying/i);
});

test("Deberia lanzar error si a la recurrencia semanal recibe el criterio semana del mes", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const wrapper = () => {
    getExceptionBlocks({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      blockDurationInMinutes: 30,
      recurrence: "weekly",
      repeatRecurrenceEvery: 1,
      weekOfMonth: 1,
      days: [
        {
          blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
        },
      ],
    });
  };

  // Assert
  expect(wrapper).toThrowError(/Week recurrence does not require specifying/i);
});

test("Deberia lanzar error si a la recurrencia semanal recibe el criterio día de semana", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const wrapper = () => {
    getExceptionBlocks({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      blockDurationInMinutes: 30,
      recurrence: "weekly",
      repeatRecurrenceEvery: 1,
      dayOfWeek: 1,
      days: [
        {
          blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
        },
      ],
    });
  };

  // Assert
  expect(wrapper).toThrowError(/Week recurrence does not require specifying/i);
});

test("Deberia lanzar error si a la recurrencia semanal no recibe dia de la semana en el bloque", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const wrapper = () => {
    getExceptionBlocks({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      blockDurationInMinutes: 30,
      recurrence: "weekly",
      repeatRecurrenceEvery: 1,
      days: [
        {
          blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
        },
      ],
    });
  };

  // Assert
  expect(wrapper).toThrowError(
    /Day of week of the block is required when recurrence is weekly/i
  );
});

test("Deberia lanzar error si a la recurrencia mensual no recibe ningun criterio válido para el mes", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const wrapper = () => {
    getExceptionBlocks({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      blockDurationInMinutes: 30,
      recurrence: "monthly",
      repeatRecurrenceEvery: 1,
      days: [
        {
          blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
        },
      ],
    });
  };

  // Assert
  expect(wrapper).toThrowError(/Monthly recurrence requires specifying/i);
});

test("Deberia lanzar error si a la recurrencia mensual recibe dia de la semana en el bloque", async () => {
  // Arrange
  const startDate = dayjs.tz("2020-10-01", config.timezone);
  const endDate = dayjs.tz("2020-12-31", config.timezone);

  // Act
  const wrapper = () => {
    getExceptionBlocks({
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      blockDurationInMinutes: 30,
      recurrence: "monthly",
      repeatRecurrenceEvery: 1,
      dayOfMonth: 1,
      days: [
        {
          dayOfWeek: 1,
          blocks: [{ startTime: "11:00:00", endTime: "11:30:00" }],
        },
      ],
    });
  };

  // Assert
  expect(wrapper).toThrowError(
    /Day of week of the block should be null when the recurrence is monthly/i
  );
});
