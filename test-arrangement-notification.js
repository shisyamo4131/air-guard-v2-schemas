import test from "node:test";
import assert from "node:assert/strict";

// Keep date assertions independent from the machine's local time zone.
process.env.TZ = "UTC";

import ArrangementNotification from "./src/ArrangementNotification.js";
import SiteOperationScheduleDetail from "./src/SiteOperationScheduleDetail.js";
import { getDateAt } from "./src/utils/index.js";

const dateAt = new Date("2026-01-15T00:00:00.000Z");

function notification(overrides = {}) {
  return new ArrangementNotification({
    dateAt,
    dayType: "WEEKDAY",
    shiftType: "DAY",
    startTime: "09:00",
    endTime: "17:00",
    siteOperationScheduleId: "schedule-1",
    id: "worker-1",
    siteId: "site-1",
    status: ArrangementNotification.STATUS.ARRIVED.value,
    actualStartTime: "09:00",
    actualEndTime: "17:00",
    ...overrides,
  });
}

async function withoutFirestore(callback) {
  const originalUpdate = SiteOperationScheduleDetail.prototype.update;
  SiteOperationScheduleDetail.prototype.update = async () => {};
  try {
    await callback();
  } finally {
    SiteOperationScheduleDetail.prototype.update = originalUpdate;
  }
}

test("toArrived preserves an existing confirmedAt", async () => {
  const confirmedAt = new Date("2026-01-15T01:02:03.000Z");
  const item = notification({ confirmedAt });

  await withoutFirestore(() => item.toArrived());

  assert.equal(item.confirmedAt.getTime(), confirmedAt.getTime());
});

test("toLeaved preserves an existing confirmedAt", async () => {
  const confirmedAt = new Date("2026-01-15T02:03:04.000Z");
  const item = notification({ confirmedAt });

  await withoutFirestore(() => item.toLeaved());

  assert.equal(item.confirmedAt.getTime(), confirmedAt.getTime());
});

test("actualStartAt follows actualIsStartNextDay instead of the scheduled flag", () => {
  const item = notification({
    isStartNextDay: true,
    actualIsStartNextDay: false,
    actualStartTime: "09:00",
  });

  assert.equal(item.actualStartAt.getTime(), getDateAt(item.dateAt, "09:00").getTime());
  assert.notEqual(item.actualStartAt.getTime(), item.startAt.getTime());
});

test("actualEndAt uses the next day when actual times cross midnight", () => {
  const item = notification({
    isSpansNextDay: false,
    isStartNextDay: false,
    actualIsStartNextDay: false,
    actualStartTime: "23:00",
    actualEndTime: "01:00",
  });

  assert.equal(item.actualEndAt.toISOString(), "2026-01-15T16:00:00.000Z");
});

test("actualStartAt follows actualIsStartNextDay when the actual start is next day", () => {
  const item = notification({
    isStartNextDay: false,
    actualIsStartNextDay: true,
    actualStartTime: "01:00",
  });

  assert.equal(item.actualStartAt.toISOString(), "2026-01-15T16:00:00.000Z");
});

test("actualEndAt treats equal actual times as a 24-hour duration", () => {
  const item = notification({ actualStartTime: "09:00", actualEndTime: "09:00" });

  assert.equal(item.actualEndAt.getTime() - item.actualStartAt.getTime(), 24 * 60 * 60 * 1000);
});

test("actualEndAt remains after actualStartAt across process time zones", () => {
  const item = notification({ actualStartTime: "01:00", actualEndTime: "00:00" });

  assert.equal(item.actualEndAt.toISOString(), "2026-01-15T15:00:00.000Z");
  assert.ok(item.actualEndAt.getTime() > item.actualStartAt.getTime());
});

test("actual date getters return null when actual times are missing", () => {
  const item = notification({ actualStartTime: null, actualEndTime: null });

  assert.equal(item.actualStartAt, null);
  assert.equal(item.actualEndAt, null);
});
