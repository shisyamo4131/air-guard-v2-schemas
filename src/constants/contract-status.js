/**
 * @file src/constants/contract-status.js
 * @description Contract status constants and options.
 * @author shisyamo4131
 */

export const VALUES = Object.freeze({
  ACTIVE: { value: "ACTIVE", title: "契約中" },
  TERMINATED: { value: "TERMINATED", title: "契約終了" },
});

export const OPTIONS = [
  { title: VALUES.ACTIVE.title, value: VALUES.ACTIVE.value },
  { title: VALUES.TERMINATED.title, value: VALUES.TERMINATED.value },
];
