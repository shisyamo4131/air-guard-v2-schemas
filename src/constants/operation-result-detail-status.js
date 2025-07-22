// prettier-ignore
export const OPERATION_RESULT_DETAIL_STATUS_DEFAULT = "DRAFT";

export const OPERATION_RESULT_DETAIL_STATUS = Object.freeze({
  DRAFT: "下書き",
  ARRANGED: "配置済",
  CONFIRMED: "確認済",
  ARRIVED: "上番済",
  CANCELED: "現着中止",
  LEAVED: "下番済",
});

export const OPERATION_RESULT_DETAIL_STATUS_ARRAY = Object.entries(
  OPERATION_RESULT_DETAIL_STATUS
).map(([key, value]) => {
  return { value: key, title: value };
});
