import FireModel from "air-firebase-v2";
import { getDateAt } from "./utils";

/**
 * @file ArrangementNotification.js
 * @description ArrangementNotification class
 * - Notifies employees about their work arrangements.
 */
export default class ArrangementNotification extends FireModel {
  static className = "配置通知";
  static collectionPath = "ArrangementNotifications";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** 現場稼働予定ID */
    siteOperationScheduleId: defField("oneLine", { required: true }),
    /** 従業員ID */
    employeeId: defField("oneLine", { required: true }),
    /** 配置日 */
    dateAt: defField("dateAt", { label: "配置日", required: true }),
    /** 勤務区分 */
    shiftType: defField("shiftType", { required: true }),
    /** 開始時刻（HH:MM 形式） */
    startTime: defField("time", { label: "開始時刻", required: true }),
    /** 終了時刻（HH:MM 形式） */
    endTime: defField("time", { label: "終了時刻", required: true }),
    /**
     * 翌日開始フラグ
     * - 配置日である `dateAt` の翌日に実際の勤務が開始される場合に true
     */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 配置確認日時 */
    confirmedAt: defField("dateAt", { label: "配置確認日時" }),
    /** 上番日時 */
    arrivedAt: defField("time", { label: "上番日時" }),
    /** 下番日時 */
    leavedAt: defField("time", { label: "下番日時" }),
    /** 実際の開始時刻 */
    actualStartTime: defField("time", {
      label: "実際の開始時刻",
      required: true,
    }),
    /** 実際の終了時刻 */
    actualEndTime: defField("time", {
      label: "実際の終了時刻",
      required: true,
    }),
    /** 実際の休憩時間（分） */
    actualBreakMinutes: defField("breakMinutes", {
      default: 60,
      required: true,
    }),
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
       * - `isSpansNextDay` が true の場合は翌日の同時刻を返す。
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
      /** 配置確認済みフラグ */
      isConfirmed: {
        configurable: true,
        enumerable: true,
        get: () => !!this.confirmedAt,
        set: (v) => {},
      },
      /** 上番済みフラグ */
      isArrived: {
        configurable: true,
        enumerable: true,
        get: () => !!this.arrivedAt,
        set: (v) => {},
      },
      /** 下番済みフラグ */
      isLeaved: {
        configurable: true,
        enumerable: true,
        get: () => !!this.leavedAt,
        set: (v) => {},
      },
    });
  }
}
