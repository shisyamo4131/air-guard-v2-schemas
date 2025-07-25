// prettier-ignore
/**
 * @file SiteOperationScheduleStatus.js
 * SiteOperationSchedule クラスで使用される、現場の稼働予定状態を表すステータス定数を定義します。
 *
 * [DRAFT: 下書き]
 * - 現場の稼働予定がまだ確定していない状態。
 * - 予定の内容はすべて変更可能。
 *
 * [SCHEDULED: 予定確定]
 * - 現場の稼働予定が確定した状態。登録されている必要人数が確定したことを表す。
 * - 作業員の状態を `DRAFT` から `ARRANGED` に変更することが可能になる状態。
 * - `reschedule` メソッドによって `DRAFT` 状態に戻る。
 *
 * [ARRANGED: 配置確定]
 * - 従業員や外注業者の配置が確定した状態。
 * - 全作業員のステータスが `ARRANGED` にならなければこの状態には遷移できない。
 *   -> またはこの状態に遷移したら全作業員のステータスを `ARRANGED` にする？
 *   -> この状態の際に、作業員の追加や変更はできないようにしなければならない？
 *
 * [CONFIRMED: 実績確定]
 * - 全作業員が下番済みであることを条件に、稼働実績ドキュメントが作成された状態。
 * - 現場稼働予定のみならず、作業員の配置情報なども一切変更不可になる。
 *
 * [CANCELED: キャンセル]
 * - 現場の稼働予定がキャンセルされた状態。
 * - 配置されていた作業員はすべて初期化されなければならない。
 * - 当然、この状態である現場稼働予定に対して作業員の追加もできない。
 */
export const SITE_OPERATION_SCHEDULE_DEFAULT = "DRAFT";

export const SITE_OPERATION_SCHEDULE_DRAFT = "DRAFT";
export const SITE_OPERATION_SCHEDULE_SCHEDULED = "SCHEDULED";
export const SITE_OPERATION_SCHEDULE_ARRANGED = "ARRANGED";
export const SITE_OPERATION_SCHEDULE_CONFIRMED = "CONFIRMED";
export const SITE_OPERATION_SCHEDULE_CANCELED = "CANCELED";

export const SITE_OPERATION_SCHEDULE = Object.freeze({
  DRAFT: "下書き",
  SCHEDULED: "予定確定",
  ARRANGED: "配置確定",
  CONFIRMED: "実績確定",
  CANCELED: "キャンセル",
});

export const SITE_OPERATION_SCHEDULE_ARRAY = Object.entries(
  SITE_OPERATION_SCHEDULE
).map(([key, value]) => {
  return { value: key, title: value };
});
