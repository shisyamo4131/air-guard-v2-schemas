/**
 * @file src/constants/employment-status.js
 * @description Employment status constants and options.
 * @author shisyamo4131
 */

export const VALUES = Object.freeze({
  ACTIVE: { value: "ACTIVE", title: "在職中" },
  RESIGNED: { value: "RESIGNED", title: "退職済み" },
});

export const OPTIONS = [
  { title: VALUES.ACTIVE.title, value: VALUES.ACTIVE.value },
  { title: VALUES.RESIGNED.title, value: VALUES.RESIGNED.value },
];
