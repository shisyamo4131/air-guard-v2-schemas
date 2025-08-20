// prettier-ignore
/**
 * @file SiteOperationScheduleDetailStatus.js
 * SiteOperationSchedule クラスで使用される、作業員の配置状態を表すステータス定数を定義します。
 * SiteOperationSchedule インスタンスの operationResultId プロパティが null でない場合、ステータスは変更できないものとします。
 */
export const ARRANGEMENT_NOTIFICATION_STATUS_DEFAULT = "ARRANGED";

export const ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED = "ARRANGED";
export const ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED = "CONFIRMED";
export const ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED = "ARRIVED";
export const ARRANGEMENT_NOTIFICATION_STATUS_LEAVED = "LEAVED";
export const ARRANGEMENT_NOTIFICATION_STATUS_CANCELED = "CANCELED";

export const ARRANGEMENT_NOTIFICATION_STATUS = Object.freeze({
  ARRANGED: "配置済",
  CONFIRMED: "確認済",
  ARRIVED: "上番済",
  LEAVED: "下番済",
  CANCELED: "現着中止",
});

export const ARRANGEMENT_NOTIFICATION_STATUS_ARRAY = Object.entries(
  ARRANGEMENT_NOTIFICATION_STATUS
).map(([key, value]) => {
  return { value: key, title: value };
});
