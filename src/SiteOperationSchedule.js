/*****************************************************************************
 * @file ./src/SiteOperationSchedule.js
 * @author shisyamo4131
 * @description 現場稼働予定クラス
 *
 * @class
 * @extends Operation
 *
 * @property {Date} dateAt - 日付 (変更されると `dayType` が自動的に更新されます)
 * @property {string} shiftType - 勤務区分 (変更されると `employees` と `outsourcers` の `shiftType` が自動的に更新されます)
 * @property {string} startTime - 開始時刻 (HH:MM 形式)
 * @property {string} endTime - 終了時刻 (HH:MM 形式)
 * @property {boolean} isStartNextDay - 翌日開始フラグ
 * - `true` の場合、実際の勤務は `dateAt` の翌日であることを意味します。
 * @property {number} breakMinutes - 休憩時間 (分)
 * @property {string} date - `dateAt` に基づく YYYY-MM-DD 形式の日付文字列 (読み取り専用)
 * - `dateAt` に基づいて YYYY-MM-DD 形式の文字列を返します。
 * @property {Date} startAt - 開始日時 (Date オブジェクト) (読み取り専用)
 * - `dateAt` に基づいて `startTime` を設定した Date オブジェクトを返します。
 * - `isStartNextDay` が true の場合、1日加算します。
 * @property {Date} endAt - 終了日時 (Date オブジェクト) (読み取り専用)
 * - `startAt` を起点に、最初に現れる `endTime` の Date オブジェクトを返します。
 * @property {boolean} isSpansNextDay - 翌日跨ぎフラグ (読み取り専用)
 * - `true` の場合、`startAt` と `endAt` の日付が異なることを意味します。
 * @property {number} regulationWorkMinutes - 規定労働時間 (分) (変更されると `employees` と `outsourcers` の `regulationWorkMinutes` が自動的に更新されます)
 * - `startAt` から `endAt` までの時間から `breakMinutes` を差し引いた時間のうち、
 *   規定内として扱う労働時間（分）です。
 * - 実際の労働時間から残業時間を算出するための基準となる値です。
 * - この値があることで、取極めに柔軟な設定を行うことが可能になる他、労働基準法の 1 日の所定労働時間上限が変更された際に
 *   影響を最小限に抑えることができます。
 * 例) 8:00 から 17:00 までの勤務で休憩が 60 分の場合
 * - 規定労働時間を 8 時間 (480 分) とし、実際の勤務が 8 時間 (480 分) を超えた分が残業時間として扱われます。
 * 例) 8:00 から 16:00 までの勤務で休憩が 60 分の場合
 * - 規定労働時間を 7 時間 (420 分) とすると、実際の勤務が 7 時間 (420 分) を超えた分が残業時間として扱われます。
 * - 規定労働時間を 8 時間 (480 分) とすると、実際の勤務が 8 時間 (480 分) を超えた分が残業時間として扱われます。
 * 例) 7:00 から 翌日 7:00 までの勤務で休憩が 60 分の場合
 * - 規定労働時間を 8 時間 (480 分) とすると、実際の勤務が 8 時間 (480 分) を超えた分が残業時間として扱われます。
 *   この場合、最初の 8 時間までは基本単価が適用され、残りの 8 時間は残業単価が適用されるといった設定が可能になります。
 * - 規定労働時間を 24 時間 (1440 分) とすると、実際の勤務が 24 時間 (1440 分) を超えた分が残業時間として扱われます。
 *   この場合、全ての勤務時間が基本単価で扱われるといった設定が可能になります。
 * @property {string} dayType - 曜日区分
 * @property {number} totalWorkMinutes - 総労働時間 (休憩時間を除く) (分) (読み取り専用)
 * @property {number} regularTimeWorkMinutes - 所定労働時間 (分) (読み取り専用)
 * @property {number} overtimeWorkMinutes - 残業時間 (分) (読み取り専用)
 * @property {string} siteId - 現場ID (変更されると `employees` と `outsourcers` の `siteId` が自動的に更新されます)
 * @property {number} requiredPersonnel - 必要人数
 * @property {boolean} qualificationRequired - 資格要件フラグ
 * @property {string} workDescription - 作業内容
 * @property {string} remarks - 備考
 * @property {Array<OperationDetail>} employees - 従業員の OperationDetail インスタンスの配列
 * @property {Array<OperationDetail>} outsourcers - 外注の OperationDetail インスタンスの配列
 * @property {Array<string>} employeeIds - 従業員の ID の配列 (読み取り専用)
 * @property {Array<string>} outsourcerIds - 外注の ID の配列 (読み取り専用)
 * @property {number} employeesCount - `employees` の要素数 (読み取り専用)
 * @property {number} outsourcersCount - `outsourcers` の要素数 (読み取り専用)
 * @property {boolean} isPersonnelShortage - 人員不足フラグ (読み取り専用)
 * @property {Array<OperationDetail>} workers - 従業員と外注を合わせた配列
 * - `employees` と `outsourcers` を結合した配列を返します。
 * - Getter: `employees` と `outsourcers` を結合した配列を返します。
 * - Setter: 配列を `isEmployee` プロパティに基づいて `employees` と `outsourcers` に分割します。
 * @property {string} groupKey - `siteId`, `shiftType`, `date` を組み合わせたキー。（読み取り専用）
 * @property {string} agreementKey - `date`, `shiftType` を組み合わせたキー。（読み取り専用）
 * @property {string} orderKey - `siteId`, `shiftType` を組み合わせたキー。（読み取り専用）
 *
 * @property {string|null} operationResultId - 関連する OperationResult ドキュメントの ID
 * - このスケジュールを元に OperationResult が作成されている場合、このプロパティにはその OperationResult ドキュメントの ID が入ります。
 * - このプロパティが設定されている場合、スケジュールの更新や削除はできません。逆に、関連する OperationResult が削除された場合、このプロパティを null に設定することができます。
 * @property {number} displayOrder - 同一日付・同一勤務区分のスケジュールの表示順を制御するためのプロパティ
 *
 * @method setDateAtCallback - `dateAt` が設定されたときに呼び出されるコールバック関数
 * @method getInvalidReasons - クラス特有のエラーの有無を返すメソッド
 * @method addWorker - `Workers` に新しい従業員または外注先を追加します。
 * @method moveWorker - 従業員または外注先の位置を移動します。
 * @method changeWorker - 従業員または外注先の詳細を変更します。
 * @method removeWorker - 従業員または外注先を `workers` から削除します。
 * @method setSiteIdCallback - `siteId` が変更された時に呼び出されるコールバック関数
 * @method setShiftTypeCallback - `shiftType` が変更された時に呼び出されるコールバック関数
 * @method setRegulationWorkMinutesCallback - `regulationWorkMinutes` が変更された時に呼び出されるコールバック関数
 *
 * @method duplicate - 指定された日付で SiteOperationSchedule を複製します。
 * - 指定された日付ごとに新しい SiteOperationSchedule ドキュメントを作成します。
 *   元の日付は除外し、重複を避けます。
 * @method notify - 従業員に配置通知を作成します。
 * - `hasNotification` が `false` の従業員に対して ArrangementNotification ドキュメントを作成します。
 * - 全ての従業員と外注先の `hasNotification` フラグを `true` に更新します。
 * - 既に通知が存在する場合は、新たに通知を作成しません。
 * @method syncToOperationResult - 現在の SiteOperationSchedule を元に OperationResult ドキュメントを作成します。
 * - OperationResult ドキュメントの ID は SiteOperationSchedule ドキュメントの ID と同じになります。
 * - SiteOperationSchedule の `operationResultId` プロパティに作成された OperationResult ドキュメントの ID を設定します。
 * - 既に OperationResult が存在する場合は、上書きされます。
 * @method toEvent - SiteOperationSchedule インスタンスを VCalendar のイベントオブジェクトに変換します。
 * - Vuetify の VCalendar コンポーネントでイベントを表示するために必要なプロパティを持つオブジェクトを返します。
 * - `name`, `start`, `end`, `color`、および元の `SiteOperationSchedule` インスタンスへの参照を含みます。
 *
 * @getter {boolean} isInvalid - クラス特有のエラーが存在するかどうかを返すプロパティ
 * @getter {Array<string>} invalidReasons - クラス特有のエラーコードの配列を返すプロパティ
 * @getter {boolean} isGroupKeyChanged - `groupKey` プロパティが変更されたかどうかを返すプロパティ
 * @getter {boolean} isAgreementKeyChanged - `agreementKey` プロパティが変更されたかどうかを返すプロパティ
 * @getter {boolean} isEmployeesChanged - 従業員が変更されたかどうかを示すフラグ (読み取り専用)
 * @getter {boolean} isOutsourcersChanged - 外注が変更されたかどうかを示すフラグ (読み取り専用)
 * @getter {Array<OperationDetail>} addedWorkers - 追加された従業員の配列 (読み取り専用)
 * @getter {Array<OperationDetail>} removedWorkers - 削除された従業員の配列 (読み取り専用)
 * @getter {Array<OperationDetail>} updatedWorkers - 更新された従業員の配列 (読み取り専用)
 *
 * @getter {boolean} isEditable - スケジュールが編集可能かどうかを返すプロパティ
 * - `operationResultId` が設定されている場合は `false` を返し、そうでない場合は `true` を返します。
 * - これにより、関連する OperationResult が存在する場合にスケジュールの編集を制限することができます。
 * @getter {boolean} isNotifiedAllWorkers - 全ての従業員に配置通知が行われているかどうかを返すプロパティ
 *
 * @override
 * @method create - Creates a new SiteOperationSchedule with automatic display order assignment
 * @method update - Updates the SiteOperationSchedule and manages related notifications
 * - Clears all notifications if related data have been changed during updates.
 * - Updates and deletes notifications for removed or updated employees if employee assignments have changed.
 * @method delete - Deletes the SiteOperationSchedule and all related notifications
 * - Deletes all notifications associated with the schedule before deleting the schedule itself.
 *****************************************************************************/
import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";
import { ContextualError } from "./utils/index.js";
import ArrangementNotification from "./ArrangementNotification.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import OperationResult from "./OperationResult.js";
import Site from "./Site.js";

const classProps = {
  ...Operation.classProps,
  operationResultId: defField("oneLine", { hidden: true }),
  displayOrder: defField("number", { default: 0, hidden: true }),
  employees: defField("array", { customClass: SiteOperationScheduleDetail }),
  outsourcers: defField("array", {
    customClass: SiteOperationScheduleDetail,
  }),
  dayType: defField("dayType", { hidden: true }),
  regulationWorkMinutes: defField("regulationWorkMinutes", { hidden: true }),
};

/**
 * Wrapper to define computed properties.
 * @param {*} obj
 * @param {*} properties
 */
function defineComputedProperties(obj, properties) {
  const descriptors = {};
  for (const [key, descriptor] of Object.entries(properties)) {
    descriptors[key] = {
      configurable: true,
      enumerable: true,
      ...descriptor,
    };
  }
  Object.defineProperties(obj, descriptors);
}

export default class SiteOperationSchedule extends Operation {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static classProps = classProps;

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
  ];

  /***************************************************************************
   * Override `afterInitialize`
   ***************************************************************************/
  afterInitialize() {
    super.afterInitialize();
    const synchronizeToWorkers = (key, value) => {
      this.employees.forEach((emp) => {
        emp[key] = value;
      });
      this.outsourcers.forEach((out) => {
        out[key] = value;
      });
    };

    /***********************************************************
     * TRIGGERS FOR SYNCRONIZATION TO EMPLOYEES AND OUTSOURCERS
     * ---------------------------------------------------------
     * When `docId`, `startTime`, `endTime`, `breakMinutes`, and
     * `isStartNextDay` are changed on the SiteOperationSchedule
     * instance, the corresponding properties on all employees
     * and outsourcers are automatically updated to keep them in sync.
     * Especially important is that when `docId` changes, the
     * `siteOperationScheduleId` on all employees and outsourcers
     * is updated accordingly.
     * [NOTE]
     * `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes` are
     * synchronized in the parent `Operation` class.
     ***********************************************************/
    let _docId = this.docId;
    let _startTime = this.startTime;
    let _endTime = this.endTime;
    let _breakMinutes = this.breakMinutes;
    let _isStartNextDay = this.isStartNextDay;
    defineComputedProperties(this, {
      docId: {
        get() {
          return _docId;
        },
        set(v) {
          if (_docId === v) return;
          _docId = v;
          synchronizeToWorkers("siteOperationScheduleId", v);
        },
      },
      startTime: {
        get() {
          return _startTime;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`startTime must be a string. startTime: ${v}`);
          }
          if (_startTime === v) return;
          _startTime = v;
          synchronizeToWorkers("startTime", v);
        },
      },
      endTime: {
        get() {
          return _endTime;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`endTime must be a string. endTime: ${v}`);
          }
          if (_endTime === v) return;
          _endTime = v;
          synchronizeToWorkers("endTime", v);
        },
      },
      breakMinutes: {
        get() {
          return _breakMinutes;
        },
        set(v) {
          if (typeof v !== "number" || isNaN(v) || v < 0) {
            throw new Error(
              `breakMinutes must be a non-negative number. breakMinutes: ${v}`,
            );
          }
          if (_breakMinutes === v) return;
          _breakMinutes = v;
          synchronizeToWorkers("breakMinutes", v);
        },
      },
      isStartNextDay: {
        get() {
          return _isStartNextDay;
        },
        set(v) {
          if (typeof v !== "boolean") {
            throw new Error(
              `isStartNextDay must be a boolean. isStartNextDay: ${v}`,
            );
          }
          if (_isStartNextDay === v) return;
          _isStartNextDay = v;
          synchronizeToWorkers("isStartNextDay", v);
        },
      },
    });
  }
  /***************************************************************************
   * STATES
   ***************************************************************************/
  /**
   * Returns whether the schedule is editable.
   * @returns {boolean} - Whether the schedule is editable.
   */
  get isEditable() {
    return !this.operationResultId;
  }

  /**
   * Returns whether all workers have been notified.
   * @returns {boolean} - Whether all workers have been notified.
   */
  get isNotifiedAllWorkers() {
    return this.workers.every((worker) => worker.hasNotification);
  }

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  /**
   * Override `beforeUpdate`.
   * - Prevents updates if an associated OperationResult exists.
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   */
  async beforeUpdate(args = {}) {
    if (this._beforeData.operationResultId) {
      throw new Error(
        `Could not update this document. The OperationResult based on this document already exists. OperationResultId: ${this._beforeData.operationResultId}`,
      );
    }
    await super.beforeUpdate(args);
  }

  /**
   * Override `beforeDelete`.
   * - Prevents deletions if an associated OperationResult exists.
   * @param {Object} args - Creation options.
   * @param {Object} [args.transaction] - Firestore transaction.
   * @param {Function} [args.callBack] - Callback function.
   * @param {string} [args.prefix] - Path prefix.
   */
  async beforeDelete(args = {}) {
    if (this._beforeData.operationResultId) {
      throw new Error(
        `Could not delete this document. The OperationResult based on this document already exists. OperationResultId: ${this._beforeData.operationResultId}`,
      );
    }
    await super.beforeDelete(args);
  }

  /**
   * Override create method.
   * - Automatically assigns a display order based on existing documents.
   * @param {Object} updateOptions - Options for creating the notification.
   * @param {boolean} updateOptions.useAutonumber - Whether to use autonumbering.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callback - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async create(updateOptions = {}) {
    try {
      const existingDocs = await this.fetchDocs({
        constraints: [
          ["where", "siteId", "==", this.siteId],
          ["where", "shiftType", "==", this.shiftType],
          ["where", "date", "==", this.date],
          ["orderBy", "displayOrder", "desc"],
          ["limit", 1],
        ],
      });
      if (existingDocs.length > 0) {
        this.displayOrder = existingDocs[0].displayOrder + 1;
      }
      return await super.create(updateOptions);
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "create",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    }
  }

  /**
   * Override update method.
   * - Updates and clears notifications if related data have been changed.
   * - Updates and deletes notifications for removed or updated employees if employee assignments have changed.
   * - Just updates if no changes detected.
   * @param {Object} updateOptions - Options for updating the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callback - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async update(updateOptions = {}) {
    try {
      // Returns whether the notifications should be cleared.
      // - All notifications should be cleared if any of the following properties have changed:
      //   `siteId`, `date`, `shiftType`, `startTime`, `isStartNextDay`, `endTime`, or `breakMinutes`.
      // - Returns false if there are no changes.
      const shouldClearNotifications = () => {
        const keys1 = ["siteId", "date", "shiftType"];
        const keys2 = ["startTime", "isStartNextDay", "endTime"];
        const keys3 = ["breakMinutes"];
        const changes = {};
        for (const key of [...keys1, ...keys2, ...keys3]) {
          if (this._beforeData?.[key] !== this[key]) {
            changes[key] = {
              before: this._beforeData?.[key],
              after: this[key],
            };
          }
        }
        return Object.keys(changes).length > 0 ? changes : false;
      };

      // Perform the update within a transaction.
      // - All notifications will be deleted if `shouldClearNotifications` returns not false.
      // - Notifications for removed or updated workers will be deleted.
      const performTransaction = async (txn) => {
        // Prepare arguments for bulk deletion of notifications.
        const args = { siteOperationScheduleId: this.docId };

        // Delete all notifications if related data have been changed.
        if (shouldClearNotifications()) {
          this.employees.forEach((emp) => (emp.hasNotification = false));
          this.outsourcers.forEach((out) => (out.hasNotification = false));
          await ArrangementNotification.bulkDelete(args, txn);
        }
        // Delete notifications for removed or updated workers that have been notified
        else {
          const updatedWorkers = this.updatedWorkers;
          const removedWorkers = this.removedWorkers;
          const workerIds = updatedWorkers
            .map((w) => w.workerId)
            .concat(removedWorkers.map((w) => w.workerId));
          args.workerIds = Array.from(new Set(workerIds));
          updatedWorkers.forEach((w) => (w.hasNotification = false));
          if (args.workerIds.length !== 0) {
            await ArrangementNotification.bulkDelete(args, txn);
          }
        }
        await super.update({ ...updateOptions, transaction: txn });
      };

      if (updateOptions.transaction) {
        await performTransaction(updateOptions.transaction);
      } else {
        // const firestore = this.constructor.getAdapter().firestore;
        // await runTransaction(firestore, performTransaction);
        await this.constructor.runTransaction(performTransaction);
      }
    } catch (error) {
      this.undo();
      throw new ContextualError(error.message, {
        method: "update",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    }
  }

  /**
   * Override delete method.
   * - Deletes all notifications associated with the schedule before deleting the schedule itself.
   * @param {Object} updateOptions - Options for deleting the notification.
   * @param {Object} updateOptions.transaction - The Firestore transaction object.
   * @param {function} updateOptions.callback - The callback function.
   * @param {string} updateOptions.prefix - The prefix.
   */
  async delete(updateOptions = {}) {
    try {
      const performTransaction = async (txn) => {
        const siteOperationScheduleId = this.docId;
        await Promise.all([
          ArrangementNotification.bulkDelete({ siteOperationScheduleId }, txn),
          super.delete({ ...updateOptions, transaction: txn }),
        ]);
      };
      if (updateOptions.transaction) {
        await performTransaction(updateOptions.transaction);
      } else {
        // const firestore = this.constructor.getAdapter().firestore;
        // await runTransaction(firestore, performTransaction);
        await this.constructor.runTransaction(performTransaction);
      }
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "delete",
        className: "SiteOperationSchedule",
        arguments: updateOptions,
        state: this.toObject(),
      });
    }
  }

  /** Override addWorker for specify siteOperationScheduleId */
  addWorker(options = {}, index = 0) {
    super.addWorker({ ...options, siteOperationScheduleId: this.docId }, index);
  }

  /**
   * 現場稼働予定ドキュメントを指定された日付分複製します。
   * - 複製された各ドキュメントは新規作成され、元のドキュメントとは別のIDを持ちます。
   * - 複製先の日付が元のドキュメントの日付と同じ場合、その日付分の複製は行われません。
   * @param {Array<Date|string>} dates - 複製先の日付の配列。Dateオブジェクトまたは日付文字列で指定します。
   * @returns {Promise<Array<SiteOperationSchedule>>}
   */
  async duplicate(dates = []) {
    if (!this.docId) {
      throw new Error("不正な処理です。作成前のスケジュールは複製できません。");
    }
    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("複製する日付を配列で指定してください。");
    }
    if (dates.some((d) => !(d instanceof Date) && typeof d !== "string")) {
      throw new TypeError(
        "日付の指定が無効です。Dateオブジェクトか文字列で指定してください。",
      );
    }
    if (dates.length > 20) {
      throw new Error("一度に複製できるスケジュールは最大20件です。");
    }
    try {
      // 日付が Date オブジェクトであれば日付文字列に変換しつつ、元のスケジュールと同じ日付は除外し、
      // 加えて重複も除外する。
      const targetDates = dates
        .map((date) => {
          if (date instanceof Date) {
            const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
            const year = jstDate.getUTCFullYear();
            const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
            const day = String(jstDate.getUTCDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          }
          return date;
        })
        .filter((date) => date !== this.date)
        .reduce((unique, date) => {
          if (!unique.includes(date)) unique.push(date);
          return unique;
        }, []);

      // 複製するための現場稼働予定インスタンスを生成
      const newSchedules = targetDates.map((date) => {
        const instance = this.clone();
        instance.docId = "";
        instance.dateAt = new Date(date);
        instance.operationResultId = null;

        // 2025-12-23 追加
        // 複製元が既に配置通知を出している可能性があるため、`hasNotification` を false に更新
        instance.employees.forEach((emp) => (emp.hasNotification = false));
        instance.outsourcers.forEach((out) => (out.hasNotification = false));

        return instance;
      });

      // トランザクションで一括作成
      await this.constructor.runTransaction(async (transaction) => {
        await Promise.all(
          newSchedules.map((schedule) => schedule.create({ transaction })),
        );
      });

      return newSchedules;
    } catch (error) {
      throw new ContextualError("現場稼働予定の複製処理に失敗しました。", {
        method: "duplicate",
        className: "SiteOperationSchedule",
        arguments: { dates },
        state: this.toObject(),
        error,
      });
    }
  }

  /**
   * 配置通知を作成します。
   * - 現在配置通知がなされてない作業員に対してのみ配置通知ドキュメントを作成します。
   * - 全作業員の配置通知フラグが true に更新されます。
   * @returns {Promise<void>}
   */
  async notify() {
    try {
      // 未通知である作業員を抽出
      const targetWorkers = this.workers.filter((w) => !w.hasNotification);

      // 配置通知ドキュメントを作成するためのインスタンス配列を生成
      const notifications = targetWorkers.map((worker) => {
        return new ArrangementNotification({
          ...worker,
          actualStartTime: worker.startTime,
          actualEndTime: worker.endTime,
          actualBreakMinutes: worker.breakMinutes,
        });
      });

      // 配置通知インスタンスがなければ処理終了
      if (notifications.length === 0) {
        return;
      }

      // 従業員、外注先の通知済みフラグを更新
      this.employees.forEach((emp) => (emp.hasNotification = true));
      this.outsourcers.forEach((out) => (out.hasNotification = true));

      // トランザクションで配置通知ドキュメントを一括作成し、作成済みフラグを更新
      await this.constructor.runTransaction(async (transaction) => {
        await Promise.all([
          ...notifications.map((n) => n.create({ transaction })),
          this.update({ transaction }),
        ]);
      });
    } catch (error) {
      this.undo();
      throw new ContextualError(
        `配置通知作成処理に失敗しました。: ${error.message}`,
        {
          method: "notify",
          className: "SiteOperationSchedule",
          arguments: {},
          state: this.toObject(),
        },
      );
    }
  }

  /*****************************************************************************
   * syncToOperationResult
   * ---------------------------------------------------------
   * @param {Object} notifications - 配置通知オブジェクトのマップ。
   *   - key: 配置通知の一意キー（`notificationKey` プロパティ）
   *   - value: 配置通知ドキュメントオブジェクト
   * @returns {Promise<void>}
   * ---------------------------------------------------------
   * 現在の現場稼働予定 (SiteOperationSchedule) インスタンスをもとに稼働実績 (OperationResult) ドキュメントを作成します。
   * - `OperationResult` の `docId` は `SiteOperationSchedule` の `docId` と同一になります。既に存在する場合は上書きされます。
   * - このインスタンスの `operationResultId` プロパティは作成された`OperationResult` の `docId` が設定されます。
   * - つまり、現場稼働予定ドキュメントと稼働実績ドキュメントは 1 対 1 の関係になり、現場稼働予定ドキュメントの `operationResultId` は
   *   自身の `docId` と同じ値になります。
   * - 稼働実績ドキュメントに適用されるべき取極め (Agreement) の取得は、`OperationResult` クラスに任せられます。
   * - 引数として `notifications` を受け取ります。これは配置通知 (ArrangementNotification) ドキュメントのマップで、
   *   `notificationKey` をキー、配置通知ドキュメントオブジェクトを値とするオブジェクトです。
   *   `notifications` を受け取ると、従業員・外注先の稼働実績詳細データを生成する際に、配置通知ドキュメントの実際の開始時間、終了時間、休憩時間などが
   *   `employees` および `outsourcers` の `startTime`, `endTime`, `breakMinutes` などのプロパティに反映されます。
   *****************************************************************************/
  async syncToOperationResult(notifications = {}) {
    // ドキュメントIDがない（現場稼働予定ドキュメントとして未作成）場合はエラー
    if (!this.docId) {
      throw new Error(
        "不正な処理です。作成前の現場稼働予定から稼働実績を作成することはできません。",
      );
    }

    // 現場データの存在確認と登録状態の確認
    // - 存在しない、または仮登録状態の場合はエラー
    const siteInstance = new Site();
    const siteIsExist = await siteInstance.fetch({ docId: this.siteId });
    if (!siteIsExist) {
      throw new Error(
        `不正な処理です。現場ID: ${this.siteId} の現場データが存在しません。`,
      );
    }
    if (siteInstance.isTemporary) {
      throw new Error(
        `不正な処理です。現場ID: ${this.siteId} の現場データは仮登録状態です。`,
      );
    }

    /**
     * 配置通知データをもとに、従業員・外注先の稼働実績詳細データを変換する関数
     * - 該当する `notification` が存在する場合、`startTime`, `endTime`, `breakMinutes`, `isStartNextDay` が
     *   `notification` の `actualStartTime`, `actualEndTime`, `actualBreakMinutes`, `actualIsStartNextDay` に置き換えられます。
     * @param {string} prop - 変換対象のプロパティ名（"employees" または "outsourcers"）
     * @returns {Array<SiteOperationScheduleDetail>} 変換後の稼働実績詳細データの配列
     */
    const converter = (prop) => {
      return this[prop].map((w) => {
        const notification = notifications[w.notificationKey];
        const result = w.clone();
        result.startTime = notification?.actualStartTime ?? w.startTime;
        result.endTime = notification?.actualEndTime ?? w.endTime;
        result.breakMinutes =
          notification?.actualBreakMinutes ?? w.breakMinutes;
        result.isStartNextDay =
          notification?.actualIsStartNextDay ?? w.isStartNextDay;
        return result;
      });
    };

    // 従業員・外注先の稼働実績詳細データを生成
    const employees = converter("employees");
    const outsourcers = converter("outsourcers");

    try {
      // Create OperationResult instance based on the current SiteOperationSchedule
      const operationResult = new OperationResult({
        ...this.toObject(),
        employees, // 配置通知の実際の勤務時間などを反映した従業員の稼働実績詳細データでマージ
        outsourcers, // 配置通知の実際の勤務時間などを反映した外注先の稼働実績詳細データでマージ
        siteOperationScheduleId: this.docId,
      });
      await this.constructor.runTransaction(async (transaction) => {
        const docRef = await operationResult.create({
          docId: this.docId,
          transaction,
        });
        this.operationResultId = docRef.id;
        await this.update({ transaction });
      });
    } catch (error) {
      throw new ContextualError(error.message, {
        method: "syncToOperationResult()",
        className: "SiteOperationSchedule",
        arguments: { notifications },
        state: this.toObject(),
      });
    }
  }

  /**
   * この現場稼働予定インスタンスを、Vuetify の VCalendar コンポーネントで
   * 表示可能なイベントオブジェクト形式に変換して返します。
   *
   * VCalendar でイベントを表示する際に必要な主要なプロパティ（タイトル、開始日時、
   * 終了日時、色など）を設定します。
   *
   * @returns {object} VCalendar イベントオブジェクト。以下のプロパティを含みます:
   *   @property {string} name - イベントのタイトル。`requiredPersonnel`（必要人数）と `workDescription`（作業内容）から生成されます。
   *   @property {Date} start - イベントの開始日時。インスタンスの `startAt` プロパティ（Dateオブジェクト）がそのまま使用されます。
   *   @property {Date} end - イベントの終了日時。
   *     **注意点:** 本来はインスタンスの `endAt` プロパティを使用すべきですが、
   *     VCalendar の仕様（または過去のバージョンでの挙動）により、日をまたぐイベントを
   *     `endAt` で正確に指定すると、カレンダー上で複数の日にまたがって
   *     同一イベントが複数描画されてしまう問題がありました。
   *     これを回避するため、現状では `startAt` と同じ値を設定し、
   *     イベントが開始日のみに単一のイベントとして表示されるようにしています。
   *     もし将来的に日をまたぐ期間を正確にカレンダー上で表現する必要が生じた場合は、
   *     VCalendar のバージョンアップや設定変更、またはこの `end` プロパティの
   *     扱いについて再検討が必要です。
   *   @property {string} color - イベントの表示色。`shiftType` プロパティの値に応じて、
   *     日勤 (`day`) の場合は 'orange'、夜勤 (`night`) の場合は 'navy' が設定されます。
   *   @property {SiteOperationSchedule} item - この `SiteOperationSchedule` インスタンス自身への参照です。
   *     カレンダー上でイベントがクリックされた際などに、元のスケジュールデータへ
   *     アクセスするために利用できます。
   */
  toEvent() {
    const name = `${this.requiredPersonnel} 名: ${
      this.workDescription || "通常警備"
    }`;
    const color = !this.isEditable
      ? "grey"
      : this.shiftType === "DAY"
        ? "orange"
        : "indigo";
    return {
      name,
      start: this.dateAt,
      end: this.dateAt,
      color,
      item: this,
    };
  }

  /***************************************************************************
   * FOR DEPRECATED PROPERTIES
   ***************************************************************************/
  /**
   * @deprecated
   * Returns whether all workers have been notified.
   * @returns {boolean} - Whether all workers have been notified.
   */
  get isNotificatedAllWorkers() {
    console.warn(
      "`isNotificatedAllWorkers` is deprecated. Use `isNotifiedAllWorkers` instead.",
    );
    return this.workers.every((worker) => worker.hasNotification);
  }
}
