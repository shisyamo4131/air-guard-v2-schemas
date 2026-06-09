import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import OperationResult from "./OperationResultDetail.js";
import { formatJstDate } from "./utils/index.js";

/*****************************************************************************
 * @class DailyAttendance
 *
 * @property {Date} dateAt - 勤怠の日付 (Dateオブジェクト)
 * @property {string} date - 勤怠の日付 (YYYY-MM-DD 形式の文字列) (読み取り専用)
 * @property {string} employeeId - 従業員ID
 * @property {string|null} startTime - 勤怠の開始時間 (HH:MM 形式) (読み取り専用)
 * @property {string|null} endTime - 勤怠の終了時間 (HH:MM 形式) (読み取り専用)
 * @property {number} breakMinutes - 勤怠の休憩時間 (分) (読み取り専用)
 * @property {boolean} isAttended - 勤怠が存在するかどうか (読み取り専用)
 * @property {Array<OperationResult>} operationResults - 稼働実績の配列
 *
 * @getter details - 当該クラスで管理する従業員の稼働実績明細の配列 (読み取り専用)
 *****************************************************************************/
export default class DailyAttendance extends FireModel {
  static className = "勤怠";
  static collectionPath = "DailyAttendances";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    dateAt: defField("dateAt", { required: true }),
    employeeId: defField("employeeId", { required: true }),
    operationResults: defField("array", {
      customClass: OperationResult,
    }),
  };

  /*****************************************************************************
   * AFTER INITIALIZE [OVERRIDE]
   *****************************************************************************/
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    Object.defineProperties(this, {
      /**
       * 当該クラスで管理する従業員の稼働実績明細の配列を返します。
       * - `operationResults` 配列内の OperationResult から、
       *   `employeeId` と一致する `id` を持つ明細をすべて返します。（読み取り専用）
       */
      details: {
        configurable: true,
        enumerable: true,
        get() {
          return (this.operationResults ?? [])
            .flatMap((operationResult) => operationResult.workers ?? [])
            .filter((worker) => worker.id === this.employeeId);
        },
        set(v) {},
      },

      /**
       * date - `dateAt` に基づく YYYY-MM-DD 形式の日付文字列 (読み取り専用)
       */
      date: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.dateAt);
        },
        set(v) {},
      },

      /**
       * 勤怠の開始時間は、関連する稼働実績明細の中で最も早い開始時間を返す。
       */
      startTime: {
        configurable: true,
        enumerable: true,
        get() {
          const times = this.details.map((detail) => detail.startTime);
          const earliestTime = times.length
            ? times.reduce((min, time) => (time < min ? time : min))
            : null;
          return earliestTime;
        },
        set(v) {},
      },

      /**
       * 勤怠の終了時間は、関連する稼働実績明細の中で最も遅い終了時間を返す。
       */
      endTime: {
        configurable: true,
        enumerable: true,
        get() {
          const times = this.details.map((detail) => detail.endTime);
          const latestTime = times.length
            ? times.reduce((max, time) => (time > max ? time : max))
            : null;
          return latestTime;
        },
        set(v) {},
      },

      /**
       * 勤怠の休憩時間は、関連する稼働実績明細の休憩時間の合計を返す。
       */
      breakMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.details.reduce(
            (total, detail) => total + (detail.breakMinutes || 0),
            0,
          );
        },
        set(v) {},
      },

      /**
       * 稼働実績ID の配列を返します。（読み取り専用）
       */
      operationResultIds: {
        configurable: true,
        enumerable: true,
        get() {
          return (this.operationResults ?? []).map((result) => result.docId);
        },
        set(v) {},
      },

      /**
       * 勤怠が存在するかどうかを返します。`employeeId` が存在しない場合は常に `false` を返します。（読み取り専用）
       */
      isAttended: {
        configurable: true,
        enumerable: true,
        get() {
          return (this.details ?? []).length > 0;
        },
        set(v) {},
      },
    });
  }

  /*****************************************************************************
   * CREATE [OVERRIDE]
   * @param {Object} options - Options for creating the document.
   * @param {boolean} options.useAutonumber - (ignored) Whether to use autonumbering.
   * @param {Object} options.transaction - The Firestore transaction object.
   * @param {function} options.callBack - The callback function.
   * @param {string} options.prefix - The prefix.
   * @returns {Promise<DocumentReference>} The created document reference.
   * @throws {Error} If `dateAt` or `employeeId` is missing.
   *****************************************************************************/
  async create(options = {}) {
    if (!this.date) {
      throw new Error("dateAt is required to create DailyAttendance.");
    }
    if (!this.employeeId) {
      throw new Error("employeeId is required to create DailyAttendance.");
    }
    const docId = `${this.employeeId}_${this.date}`;
    return await super.create({ ...options, docId, useAutonumber: false });
  }

  /*****************************************************************************
   * UPDATE [OVERRIDE]
   * @param {Object} options - Options for updating the document.
   * @param {Object} options.transaction - The Firestore transaction object.
   * @param {function} options.callBack - The callback function.
   * @param {string} options.prefix - The prefix.
   * @returns {Promise<DocumentReference>} The updated document reference.
   * @throws {Error} If `dateAt` or `employeeId` is missing.
   *****************************************************************************/
  async update(options = {}) {
    if (!this.date) {
      throw new Error("dateAt is required to update DailyAttendance.");
    }
    if (!this.employeeId) {
      throw new Error("employeeId is required to update DailyAttendance.");
    }
    return await super.update(options);
  }

  /*****************************************************************************
   * DELETE [OVERRIDE]
   * - 将来、独自処理が追加される可能性があるため、オーバーライドして定義しておきます。
   * @param {Object} options - Options for deleting the document.
   * @param {Object} options.transaction - The Firestore transaction object.
   * @param {function} options.callBack - The callback function.
   * @param {string} options.prefix - The prefix.
   * @returns {Promise<void>} The deleted document reference.
   *****************************************************************************/
  async delete(options = {}) {
    return await super.delete(options);
  }
}
