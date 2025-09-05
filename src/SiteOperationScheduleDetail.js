import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

/**
 * SiteOperationScheduleDetail（現場稼働予定明細クラス）
 * - SiteOperationSchedule クラスの employees および outsourcers 配列の要素として使用
 * - 従業員または外注先のドキュメント ID は id プロパティに格納。
 * - 従業員は重複不可だが、外注先は index で区別して重複登録可能とするため、index プロパティを持ち、
 *   外注先の場合は id と index を ':' で連結した文字列を workerId プロパティとして提供する。
 *   -> 従業員の場合、workerId は id と同じ値
 * - amount プロパティは常に 1 に固定（将来の拡張用に残す）
 * - startTime と endTime は HH:MM 形式の文字列で管理
 * - isEmployee プロパティで従業員か外注先かを区別
 * - employeeId および outsourcerId プロパティでそれぞれの ID を取得可能（該当しない場合は null）
 */
export default class SiteOperationScheduleDetail extends BaseClass {
  static className = "現場稼働予定明細";
  static classProps = {
    id: defField("oneLine", { default: "" }),
    index: defField("number", { default: 0 }),
    isEmployee: defField("check", { default: true, required: true }),
    amount: defField("number", { default: 1, required: true, hidden: true }),
    startTime: defField("time", { label: "開始時刻", required: true }),
    isStartNextDay: defField("check", { label: "翌日開始" }),
    endTime: defField("time", { label: "終了時刻", required: true }),
    isQualificated: defField("check", { label: "資格者" }),
    isOjt: defField("check", { label: "OJT" }),
    hasNotification: defField("check"),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      workerId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.isEmployee ? this.id : `${this.id}:${this.index}`;
        },
        set() {
          // do nothing
        },
      },
      employeeId: {
        configurable: true,
        enumerable: true,
        get() {
          return this.isEmployee ? this.id : null;
        },
        set() {
          // do nothing
        },
      },
      outsourcerId: {
        configurable: true,
        enumerable: true,
        get() {
          return !this.isEmployee ? this.id : null;
        },
        set() {
          // do nothing
        },
      },
    });
  }
}
