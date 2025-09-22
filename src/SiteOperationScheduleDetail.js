import FireModel from "air-firebase-v2";
import { getDateAt } from "./utils/index.js";
import { defField } from "./parts/fieldDefinitions.js";

/**
 * SiteOperationScheduleDetail（現場稼働予定明細クラス）
 * - SiteOperationSchedule クラスの employees および outsourcers 配列の要素として使用
 * - 同時に、ArrangementNotification クラスのベースクラスになるため、FireModel を継承。
 * - 従業員または外注先のドキュメント ID は id プロパティに格納。
 * - 従業員は重複不可だが、外注先は index で区別して重複登録可能とするため、index プロパティを持ち、
 *   外注先の場合は id と index を ':' で連結した文字列を workerId プロパティとして提供する。
 *   -> 従業員の場合、workerId は id と同じ値
 * - amount プロパティは常に 1 に固定（将来の拡張用に残す）
 * - startTime と endTime は HH:MM 形式の文字列で管理
 * - isEmployee プロパティで従業員か外注先かを区別
 * - employeeId および outsourcerId プロパティでそれぞれの ID を取得可能（該当しない場合は null）
 */
export default class SiteOperationScheduleDetail extends FireModel {
  static className = "現場稼働予定明細";
  static collectionPath = "SiteOperationScheduleDetails";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** 現場稼働予定ID */
    siteOperationScheduleId: defField("oneLine", { required: true }),
    /** 従業員または外注先のドキュメントID */
    id: defField("oneLine", { default: "" }),
    /** 外注先の場合の識別用インデックス（従業員の場合は常に0） */
    index: defField("number", { default: 0 }),
    /** 従業員フラグ（true: 従業員, false: 外注先） */
    isEmployee: defField("check", { default: true, required: true }),
    /** 配置数（常に1に固定） */
    amount: defField("number", { default: 1, required: true, hidden: true }),
    /** 配置日 */
    dateAt: defField("dateAt", { label: "配置日", required: true }),
    /** 現場ID */
    siteId: defField("oneLine", { required: true }),
    /** 勤務区分 */
    shiftType: defField("shiftType", { required: true }),
    /** 開始時刻（HH:MM 形式） */
    startTime: defField("time", { label: "開始時刻", required: true }),
    /**
     * 翌日開始フラグ
     * - 配置日である `dateAt` の翌日に実際の勤務が開始される場合に true
     */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 終了時刻（HH:MM 形式） */
    endTime: defField("time", { label: "終了時刻", required: true }),
    /** 休憩時間（分） */
    breakMinutes: defField("breakMinutes", {
      default: 60,
      required: true,
    }),
    /** 資格者フラグ */
    isQualificated: defField("check", { label: "資格者" }),
    /** OJT フラグ */
    isOjt: defField("check", { label: "OJT" }),
    /** 通知フラグ */
    hasNotification: defField("check"),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      /** dateAt をもとに YYYY-MM-DD 形式の日付文字列を返す。 */
      date: {
        configurable: true,
        enumerable: true,
        get: () => {
          if (!this.dateAt) return "";
          const year = this.dateAt.getFullYear();
          const month = String(this.dateAt.getMonth() + 1).padStart(2, "0"); // 月は0始まり
          const day = String(this.dateAt.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        },
        set: (v) => {},
      },
      /**
       * 開始日時（Date オブジェクト）
       * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.startTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       * - `isSpansNextDay` が true の場合は1日加算。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset =
            (this.isSpansNextDay ? 1 : 0) + (this.isStartNextDay ? 1 : 0);
          return getDateAt(this.dateAt, this.endTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 開始日から終了日にかけて日付をまたぐかどうかのフラグ
       * - `startTime` が `endTime` よりも遅い場合 true
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      totalWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const start = this.startAt;
          const end = this.endAt;
          const breakMinutes = this.breakMinutes || 0;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - breakMinutes);
        },
        set: (v) => {},
      },
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
      notificationKey: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.siteOperationScheduleId}-${this.workerId}`;
        },
        set() {
          // do nothing
        },
      },
    });
  }
}
