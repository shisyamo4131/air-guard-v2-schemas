// prettier-ignore
export const SITE_OPERATION_SCHEDULE_DEFAULT = "DRAFT";

export const SITE_OPERATION_SCHEDULE = Object.freeze({
  DRAFT: "下書き",
  ARRANGED: "配置確定",
  CONFIRMED: "実績確定",
});

export const SITE_OPERATION_SCHEDULE_ARRAY = Object.entries(
  SITE_OPERATION_SCHEDULE
).map(([key, value]) => {
  return { value: key, title: value };
});
