import FireModel from "air-firebase-v2";
import { getDateAt } from "./utils/index.js";
import { defField } from "./parts/fieldDefinitions.js";
import {
  ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED,
  ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED,
  ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED,
  ARRANGEMENT_NOTIFICATION_STATUS_LEAVED,
} from "./constants/arrangement-notification-status.js";

/**
 * @file ArrangementNotification.js
 * @description ArrangementNotification class
 * - Notifies employees about their work arrangements.
 * - The `docId` is the unique identifier for each notification document.
 *  - The document must be overwritten if it already exists.
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
    /** 現場ID */
    siteId: defField("oneLine", { required: true }),
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
      status: {
        configurable: true,
        enumerable: true,
        get: () => {
          if (!this.confirmedAt)
            return ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED;
          if (!this.arrivedAt) return ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED;
          if (!this.leavedAt) return ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED;
          return ARRANGEMENT_NOTIFICATION_STATUS_LEAVED;
        },
        set: (v) => {},
      },
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
       * 実際の開始日時（Date オブジェクト）
       * - `dateAt` を基に、`actualStartTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       */
      actualStartAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset = this.isStartNextDay ? 1 : 0;
          return getDateAt(this.dateAt, this.actualStartTime, dateOffset);
        },
        set: (v) => {},
      },
      /**
       * 実際の終了日時（Date オブジェクト）
       * - `dateAt` を基に、`actualEndTime` を設定した Date オブジェクトを返す。
       * - `isStartNextDay` が true の場合は1日加算。
       * - `isSpansNextDay` が true の場合は1日加算。
       */
      actualEndAt: {
        configurable: true,
        enumerable: true,
        get: () => {
          const dateOffset =
            (this.isSpansNextDay ? 1 : 0) + (this.isStartNextDay ? 1 : 0);
          return getDateAt(this.dateAt, this.actualEndTime, dateOffset);
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
    });
  }

  get isConfirmed() {
    return !!this.confirmedAt;
  }

  get isArrived() {
    return !!this.arrivedAt;
  }

  get isLeaved() {
    return !!this.leavedAt;
  }

  /**
   * Override `create`.
   * - Ensures `docId` is fixed to allow recreation of ArrangementNotification documents.
   */
  async create({
    useAutonumber = true,
    transaction = null,
    callBack = null,
    prefix = null,
  } = {}) {
    try {
      if (!this.siteOperationScheduleId || !this.employeeId) {
        throw new Error("siteOperationScheduleId and employeeId are required");
      }
      const docId = `${this.siteOperationScheduleId}-${this.employeeId}`;
      await super.create({
        docId,
        useAutonumber,
        transaction,
        callBack,
        prefix,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Change status to `ARRANGED`.
   */
  async toArranged() {
    try {
      this.actualStartTime = this.startTime;
      this.actualEndTime = this.endTime;
      this.actualBreakMinutes = 60;
      this.confirmedAt = null;
      this.arrivedAt = null;
      this.leavedAt = null;
      await this.update();
    } catch (error) {
      throw new Error("Failed to set status to ARRANGED", error);
    }
  }

  /**
   * Change status to `CONFIRMED`.
   */
  async toConfirmed() {
    try {
      this.confirmedAt = new Date();
      await this.update();
    } catch (error) {
      throw new Error("Failed to set status to CONFIRMED", error);
    }
  }

  /**
   * Change status to `ARRIVED`.
   */
  async toArrived() {
    try {
      this.arrivedAt = new Date();
      await this.update();
    } catch (error) {
      throw new Error("Failed to set status to ARRIVED", error);
    }
  }

  /**
   * Change status to `LEAVED`.
   */
  async toLeaved() {
    try {
      this.leavedAt = new Date();
      await this.update();
    } catch (error) {
      throw new Error("Failed to set status to LEAVED", error);
    }
  }
}
