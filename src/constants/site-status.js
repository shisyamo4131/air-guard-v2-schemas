/**
 * @file src/constants/site-status.js
 * @description Site status constants and options.
 * @author shisyamo4131
 */

export const VALUES = Object.freeze({
  ACTIVE: { value: "ACTIVE", title: "稼働中" },
  TERMINATED: { value: "TERMINATED", title: "終了" },
});

export const OPTIONS = [
  { title: VALUES.ACTIVE.title, value: VALUES.ACTIVE.value },
  { title: VALUES.TERMINATED.title, value: VALUES.TERMINATED.value },
];
