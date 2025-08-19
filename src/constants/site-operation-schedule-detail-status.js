// prettier-ignore
/**
 * @file SiteOperationScheduleDetailStatus.js
 * SiteOperationSchedule クラスで使用される、作業員の配置状態を表すステータス定数を定義します。
 * SiteOperationSchedule インスタンスの operationResultId プロパティが null でない場合、ステータスは変更できないものとします。
 */
export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_DEFAULT = "DRAFT";

export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_DRAFT = "DRAFT";
export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_ARRANGED = "ARRANGED";
export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_CONFIRMED = "CONFIRMED";
export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_ARRIVED = "ARRIVED";
export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_CANCELED = "CANCELED";
export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_LEAVED = "LEAVED";

export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS = Object.freeze({
  DRAFT: "仮配置",
  ARRANGED: "配置済",
  CONFIRMED: "確認済",
  ARRIVED: "上番済",
  LEAVED: "下番済",
  CANCELED: "現着中止",
});

export const SITE_OPERATION_SCHEDULE_DETAIL_STATUS_ARRAY = Object.entries(
  SITE_OPERATION_SCHEDULE_DETAIL_STATUS
).map(([key, value]) => {
  return { value: key, title: value };
});
