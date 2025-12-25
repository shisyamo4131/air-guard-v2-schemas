/**
 * @file src/constants/tag-size.js
 * @description Tag size constants and options.
 * @author shisyamo4131
 */
export const VALUES = Object.freeze({
  SMALL: { value: "SMALL", title: "小" },
  MEDIUM: { value: "MEDIUM", title: "中" },
  LARGE: { value: "LARGE", title: "大" },
});

export const OPTIONS = [
  { title: VALUES.SMALL.title, value: VALUES.SMALL.value },
  { title: VALUES.MEDIUM.title, value: VALUES.MEDIUM.value },
  { title: VALUES.LARGE.title, value: VALUES.LARGE.value },
];
