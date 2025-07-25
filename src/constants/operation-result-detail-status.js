// prettier-ignore
/**
 * @file OperationResultDetailStatus.js
 * SiteOperationSchedule クラスで使用される、作業員の配置状態を表すステータス定数を定義します。
 * SiteOperationSchedule インスタンスの operationResultId プロパティが null でない場合、ステータスは変更できないものとします。
 *
 * [DRAFT: 仮配置]
 * - 仮配置である状態。配置されている従業員からは見えない。
 *
 * [ARRANGED: 配置済]
 * - 配置が決定した状態。`SiteOperationSchedule` のステータスが `SCHEDULED` でなければこの状態には遷移できない。
 * - 従業員は自身の配置を確認することができ、アプリから自身の配置について確認した旨のアクションを行うことができる。
 * - 管理者によって別の場所に配置された場合、状態は `仮配置` に戻る。
 *
 * [CONFIRMED: 確認済]
 * - 従業員が自身の配置を確認した状態。
 * - 従業員は自身でこの状態に遷移させることができるが、`配置済` の状態に戻すことはできない。
 * - 管理者はこの状態から配置を変更することが可能。その場合、状態は `仮配置` に戻る。
 *
 * [ARRIVED: 上番済]
 * - 従業員が現場に到着した状態。`確認済` の状態からのみ遷移可能。
 * - 従業員がアプリから上番報告を行うことでこの状態に遷移する。
 * - 従業員はこの状態から `確認済` の状態に戻すことはできない。管理者は可能。
 * - 管理者はこの状態から配置を変更することが可能。その場合、状態は `仮配置` に戻る。
 *
 * [LEAVED: 下番済]
 * - 従業員が現場から離れた状態。`上番済` の状態からのみ遷移可能。
 * - 従業員がアプリから下番報告を行うことでこの状態に遷移する。その際は上番・下番・残業・休憩時間の報告を行う。
 * - 従業員はこの状態から `上番済` の状態に戻すことはできない。管理者は可能。状態を `上番済` に戻す際は上下番時刻等を定時に戻す必要あり。
 * - 管理者はこの状態から配置を変更することが可能。その場合、状態は `仮配置` に戻る。
 *
 * [CANCELED: 現着中止] -> SiteOperationScheduleStatus で管理すべき項目か？
 * - 従業員が現場に到着した後、何らかの理由で現場が中止になった状態。
 * - 従業員がこの状態に遷移させることはできない。必ず管理者が従業員からの報告を受けてこの状態に遷移させる。
 * - 管理者はこの状態から配置を変更することが可能。その場合、状態は `仮配置` に戻る。
 * - 管理者はこの状態から `確認済` の状態に遷移させることが可能。
 *
 * [備考]
 * 現着前の中止やキャンセルが発生した場合の対処は、`SiteOperationSchedule` の `isCanceled` プロパティを使用する。
 * `isCanceled` が true に更新された場合、employees と outsourcers はすべて初期化（空）されるようにすること。
 * -> 受けていた現場の稼働予定がキャンセルされたことを記録として残す必要がある場合の運用方法であり、
 * -> 記録を残す必要がなければ `SiteOperationSchedule` ドキュメントそのものを削除して構わない。
 * -> 但し、`operationResultId` が null でない場合は当然、`isCanceled` プロパティを true にすることはできない。
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
