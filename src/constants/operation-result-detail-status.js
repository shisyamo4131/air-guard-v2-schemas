// prettier-ignore
/**
 * @file OperationResultDetailStatus.js
 * SiteOperationSchedule クラスで使用される、作業員の配置状態を表すステータス定数を定義します。
 * SiteOperationSchedule インスタンスの operationResultId プロパティが null でない場合、ステータスは変更できないものとします。
 */
export const OPERATION_RESULT_DETAIL_STATUS_DEFAULT = "DRAFT";

export const OPERATION_RESULT_DETAIL_STATUS_DRAFT = "DRAFT";
export const OPERATION_RESULT_DETAIL_STATUS_ARRANGED = "ARRANGED";
export const OPERATION_RESULT_DETAIL_STATUS_CONFIRMED = "CONFIRMED";
export const OPERATION_RESULT_DETAIL_STATUS_ARRIVED = "ARRIVED";
export const OPERATION_RESULT_DETAIL_STATUS_CANCELED = "CANCELED";
export const OPERATION_RESULT_DETAIL_STATUS_LEAVED = "LEAVED";

export const OPERATION_RESULT_DETAIL_STATUS = Object.freeze({
  DRAFT: "仮配置",
  ARRANGED: "配置済",
  CONFIRMED: "確認済",
  ARRIVED: "上番済",
  LEAVED: "下番済",
  CANCELED: "現着中止",
});

export const OPERATION_RESULT_DETAIL_STATUS_ARRAY = Object.entries(
  OPERATION_RESULT_DETAIL_STATUS
).map(([key, value]) => {
  return { value: key, title: value };
});
