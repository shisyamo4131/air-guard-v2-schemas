import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt } from "./utils/index.js";
import SiteOperationScheduleDetail from "./SiteOperationScheduleDetail.js";
import { runTransaction } from "firebase/firestore";
import { getDayType } from "./constants/day-type.js";
import ArrangementNotification from "./ArrangementNotification.js";

export default class SiteOperationSchedule extends FireModel {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** 現場ドキュメントID */
    siteId: defField("siteId", { required: true, hidden: true }),
    /**
     * 日付
     * NOTE: ユーザーが管理上で使用する日付。date プロパティ（YYYY-MM-DD 形式）に変換され、
     *       取引先への請求基準日として使用される。
     *       実際の勤務時間帯とは異なるケースがある。
     *       （例: 2025-12-31 が請求基準日で、勤務開始時刻が 2026-01-01 01:00 など）
     *       実際の稼働時間帯は `startTime`, `endTime`, `isStartNextDay` プロパティによって計算される。
     */
    dateAt: defField("dateAt", {
      label: "日付",
      required: true,
      component: {
        name: "air-date-input",
        attrs: {
          "onUpdate:modelValue": (item, updater) => {
            return ($event) => {
              updater({ dayType: getDayType($event) });
            };
          },
        },
      },
    }),
    /**
     * 曜日区分
     * - `SiteOperationSchedule` クラスでは不要なプロパティ。
     * - `OperationResult` クラスで使用される。
     */
    dayType: defField("dayType", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 勤務区分 */
    shiftType: defField("shiftType", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 開始時刻（HH:MM 形式） */
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 終了時刻（HH:MM 形式） */
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 翌日開始フラグ
     * - 請求基準日である `dateAt` の翌日に実際の勤務が開始される場合に true
     */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 必要人数 */
    requiredPersonnel: defField("number", {
      label: "必要人数",
      required: true,
    }),
    /** 要資格者フラグ */
    qualificationRequired: defField("check", { label: "要資格者" }),
    /** 作業内容 */
    workDescription: defField("workDescription"),
    /** 備考 */
    remarks: defField("multipleLine", { label: "備考" }),

    /**
     * 配置従業員
     * - この稼働予定に配置される従業員のリスト。
     * - `SiteOperationScheduleDetail` クラスを使用して定義される。
     * - `OperationResult` クラスの `employees` フィールドに転用される。
     */
    employees: defField("array", { customClass: SiteOperationScheduleDetail }),

    /**
     * 配置外注先
     * - この稼働予定に配置される外注先のリスト。
     * - `SiteOperationScheduleDetail` クラスを使用して定義される。
     * - `OperationResult` クラスの `outsourcers` フィールドに転用される。
     */
    outsourcers: defField("array", {
      customClass: SiteOperationScheduleDetail,
    }),

    /** 稼働実績ドキュメントID */
    // 当該現場稼働予定ドキュメントから作成された稼働実績のドキュメントID。
    // このプロパティに値がセットされている場合、当該現場稼働予定ドキュメントから稼働実績ドキュメントを作成することはできないようにする。
    // -> 稼働実績ドキュメントの重複を抑制。
    // 逆に、当該現場稼働予定ドキュメントから、これに対応する稼働実績ドキュメントを削除することは可能で、
    // その場合はこのプロパティを null に設定する。
    operationResultId: defField("oneLine", { hidden: true }),

    /** 表示順序 */
    // 同一勤務区分、同一日における現場稼働予定の表示順序を制御するためのプロパティ。
    displayOrder: defField("number", { default: 0, hidden: true }),
  };

  /***************************************************************************
   * AFTER INITIALIZE
   ***************************************************************************/
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
      /**
       * `employees` プロパティから従業員のIDを取得するためのアクセサ
       */
      employeeIds: {
        configurable: true,
        enumerable: true,
        get: () => this.employees.map((emp) => emp.workerId),
        set: (v) => {},
      },
      /**
       * `outsourcers` プロパティから外注のIDを取得するためのアクセサ
       */
      outsourcerIds: {
        configurable: true,
        enumerable: true,
        get: () => this.outsourcers.map((out) => out.workerId),
        set: (v) => {},
      },
      employeesCount: {
        configurable: true,
        enumerable: true,
        get: () => this.employees.length,
        set: (v) => {},
      },
      outsourcersCount: {
        configurable: true,
        enumerable: true,
        get: () => this.outsourcers.reduce((sum, i) => sum + i.amount, 0),
        set: (v) => {},
      },
      /**
       * 必要人数（requiredPersonnel）に対して、実際に割り当てられた従業員と外注先の合計が不足しているかどうかを示すアクセサ
       * - `employees` と `outsourcers` の合計人数が `requiredPersonnel` より少ない場合に `true` を返す。
       * - `employees` と `outsourcers` の合計人数が `requiredPersonnel` 以上の場合は `false` を返す。
       * - `requiredPersonnel` が未設定の場合は `false` を返す。
       */
      isPersonnelShortage: {
        configurable: true,
        enumerable: true,
        get: () => {
          const totalRequired = this.requiredPersonnel || 0;
          const totalAssigned = this.employeesCount + this.outsourcersCount;
          return totalAssigned < totalRequired;
        },
        set: (v) => {},
      },
    });
  }

  /** Getter to determine the current status */
  get workers() {
    return this.employees.concat(this.outsourcers);
  }

  /**
   * Returns an array of ArrangementNotification instances for each employee.
   */
  get notifications() {
    return this.employees.map((emp) => {
      return new ArrangementNotification({
        siteOperationScheduleId: this.docId,
        employeeId: emp.workerId,
        dateAt: this.dateAt,
        siteId: this.siteId,
        shiftType: this.shiftType,
        startTime: this.startTime,
        endTime: this.endTime,
        isStartNextDay: this.isStartNextDay,
        actualStartTime: this.startTime,
        actualEndTime: this.endTime,
      });
    });
  }

  /**
   * A process before editing the schedule
   * - Working result information for all employees and outsourcers is initialized if the schedule is in draft status.
   * NOTE: Working result information should not be modified if the schedule is not in draft status.
   * @returns {Promise<void>}
   */
  beforeEdit() {
    return new Promise((resolve) => {
      this.employees.forEach((emp) => {
        emp.startTime = this.startTime;
        emp.endTime = this.endTime;
        emp.isStartNextDay = this.isStartNextDay;
      });
      this.outsourcers.forEach((out) => {
        out.startTime = this.startTime;
        out.endTime = this.endTime;
        out.isStartNextDay = this.isStartNextDay;
      });
      // }
      resolve();
    });
  }

  /**
   * 従業員または外注先を追加します。
   * @param {string} workerId - 従業員または外注先のID
   * @param {boolean} [isEmployee=true] - 従業員の場合は true、外注先の場合は false
   * @param {number} [amount=1] - 外注先の場合の人数
   * @param {number} [index=0] - 挿入位置
   */
  addWorker(workerId, isEmployee = true, amount = 1, index = 0) {
    if (isEmployee) {
      this._addEmployee(workerId, index);
    } else {
      this._addOutsourcer(workerId, amount, index);
    }
  }

  /**
   * 従業員または外注先の位置を変更します。
   * @param {number} oldIndex - 変更前のインデックス
   * @param {number} newIndex - 変更後のインデックス
   * @param {boolean} [isEmployee=true] - 従業員の場合は true、外注先の場合は false
   */
  changeWorker(oldIndex, newIndex, isEmployee = true) {
    if (isEmployee) {
      this._changeEmployee(oldIndex, newIndex);
    } else {
      this._changeOutsourcer(oldIndex, newIndex);
    }
  }

  /**
   * 従業員または外注先を削除します。
   * @param {string} workerId - 従業員または外注先のID
   * @param {number} [amount=1] - 外注先の場合の人数
   * @param {boolean} [isEmployee=true] - 従業員の場合は true、外注先の場合は false
   */
  removeWorker(workerId, amount = 1, isEmployee = true) {
    if (isEmployee) {
      this._removeEmployee(workerId);
    } else {
      this._removeOutsourcer(workerId, amount);
    }
  }

  /**
   * 引数で受け取った従業員のIDを持つ新しい OperationResultEmployee を employees に追加します。
   * - `employees` プロパティに既に存在する従業員IDが指定された場合はエラーをスローします。
   * - `startAt`, `endAt`, `breakMinutes` は現在のインスタンスから取得されます。
   * - `employeeId` は必須です。
   * @param {string} employeeId - 従業員のID
   * @param {number} [index=-1] - 挿入位置。-1 の場合は末尾に追加されます。
   * @throws {Error} - 従業員IDが既に存在する場合
   */
  _addEmployee(employeeId, index = -1) {
    if (this.employees.some((emp) => emp.workerId === employeeId)) {
      throw new Error(`Employee with ID ${employeeId} already exists.`);
    }
    const newEmployee = new SiteOperationScheduleDetail({
      workerId: employeeId,
      amount: 1,
      isEmployee: true,
      startTime: this.startTime,
      endTime: this.endTime,
    });
    if (index === -1) {
      this.employees.push(newEmployee);
    } else {
      this.employees.splice(index, 0, newEmployee);
    }
  }

  /**
   * 従業員の位置を変更します。
   * @param {number} oldIndex - 変更前のインデックス
   * @param {number} newIndex - 変更後のインデックス
   */
  _changeEmployee(oldIndex, newIndex) {
    if (newIndex > this.employees.length - 1) {
      throw new Error(
        `従業員は外注先の前に配置する必要があります。newIndex: ${newIndex}, employees.length: ${this.employees.length}`
      );
    }
    if (newIndex < 0 || newIndex >= this.employees.length) {
      throw new Error(`Invalid new index: ${newIndex}`);
    }
    const employee = this.employees.splice(oldIndex, 1)[0];
    this.employees.splice(newIndex, 0, employee);
  }

  /**
   * `employeeId` に対応する従業員を this.employees から削除します。
   * - 不正な値や該当なしの場合はエラーをスローします。
   *
   * @param {string} employeeId - 従業員のID
   */
  _removeEmployee(employeeId) {
    const index = this.employees.findIndex(
      (emp) => emp.workerId === employeeId
    );
    if (index === -1) {
      throw new Error(`Employee with ID "${employeeId}" not found.`);
    }
    this.employees.splice(index, 1);
  }

  /**
   *
   * 指定された外注先のIDを持つ新しい OperationResultOutsourcer を outsourcers に追加します。
   * - `outsourcers` プロパティに既に存在する外注先IDが指定された場合はエラーをスローします。
   * - `startAt`, `endAt`, `breakMinutes` は現在のインスタンスから取得されます。
   * - `outsourcerId` は必須です。
   * @param {string} outsourcerId
   * @param {number} [index=-1] - 挿入位置。-1 の場合は末尾に追加されます。
   * @throws {Error} - 外注先IDが既に存在する場合
   */
  _addOutsourcer(outsourcerId, amount = 1, index = -1) {
    const existOutsourcer = this.outsourcers.find(
      (out) => out.workerId === outsourcerId
    );
    if (existOutsourcer) {
      existOutsourcer.amount += amount;
    } else {
      const newOutsourcer = new SiteOperationScheduleDetail({
        workerId: outsourcerId,
        amount,
        isEmployee: false,
        startTime: this.startTime,
        endTime: this.endTime,
      });
      if (index === -1) {
        this.outsourcers.push(newOutsourcer);
      } else {
        this.outsourcers.splice(index, 0, newOutsourcer);
      }
    }
  }

  /**
   * 外注先の位置を変更します。
   * - `oldIndex` と `newIndex` は `employees` の要素数が差し引かれます。
   * @param {number} oldIndex - 変更前のインデックス
   * @param {number} newIndex - 変更後のインデックス
   */
  _changeOutsourcer(oldIndex, newIndex) {
    if (newIndex <= this.employees.length - 1) {
      throw new Error(
        `外注先は従業員の後に配置する必要があります。newIndex: ${newIndex}, employees.length: ${this.employees.length}`
      );
    }
    const internalOldIndex = Math.max(0, oldIndex - this.employees.length);
    const internalNewIndex = Math.max(0, newIndex - this.employees.length);
    if (internalOldIndex < 0 || internalOldIndex >= this.outsourcers.length) {
      throw new Error(`Invalid old index: ${internalOldIndex}`);
    }
    if (internalNewIndex < 0 || internalNewIndex >= this.outsourcers.length) {
      throw new Error(`Invalid new index: ${internalNewIndex}`);
    }
    const outsourcer = this.outsourcers.splice(internalOldIndex, 1)[0];
    this.outsourcers.splice(internalNewIndex, 0, outsourcer);
  }

  /**
   * `outsourcerId` に対応する外注先を this.outsourcers から削除します。
   * - `outsourcers` に該当する要素が存在した場合は `amount` を減らします。
   * - `amount` が 0 になった場合は要素を削除します。
   * - 不正な値や該当なしの場合はエラーをスローします。
   *
   * @param {string} outsourcerId - 外注先のID
   */
  _removeOutsourcer(outsourcerId, amount = 1) {
    const index = this.outsourcers.findIndex(
      (out) => out.workerId === outsourcerId
    );
    if (index === -1) {
      throw new Error(`Outsourcer with ID "${outsourcerId}" not found.`);
    }

    const outsourcer = this.outsourcers[index];
    if (outsourcer.amount > amount) {
      outsourcer.amount -= amount;
    } else {
      this.outsourcers.splice(index, 1);
    }
  }

  /**
   * 現在のスケジュールを指定された日付で複製します。
   * - 各日付ごとに新しい SiteOperationSchedule インスタンスを作成します。
   * - 当該インスタンスと同一日付のスケジュールは複製されません。
   * @param {Array<Date|string>} dates - 複製する日付の配列
   * @returns {Promise<Array<SiteOperationSchedule>>} - 作成されたスケジュールの配列
   */
  async duplicate(dates) {
    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("複製する日付を配列で指定してください。");
    }
    if (
      dates.some((date) => !(date instanceof Date) && typeof date !== "string")
    ) {
      throw new TypeError("日付の指定が不正です。");
    }
    if (dates.length > 20) {
      throw new Error("一度に複製できるスケジュールは20件までです。");
    }

    const targetDates = dates.filter((date) => date !== this.date);
    const newSchedules = targetDates.map((date) => {
      const newSchedule = new SiteOperationSchedule({
        ...this.toObject(),
        docId: "",
        dateAt: new Date(date),
      });
      return newSchedule;
    });

    const firestore = this.constructor.getAdapter().firestore;
    await runTransaction(firestore, async (transaction) => {
      await Promise.all(
        newSchedules.map((schedule) => schedule.create({ transaction }))
      );
    });

    return newSchedules;
  }

  /**
   * Override create method.
   * - Automatically assigns a display order based on existing documents.
   */
  async create() {
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
      await super.create();
    } catch (error) {
      throw new Error(
        `Failed to create SiteOperationSchedule: ${error.message}`
      );
    }
  }

  async update() {
    const firestore = this.constructor.getAdapter().firestore;
    try {
      await runTransaction(firestore, async (transaction) => {
        await this.clearNotification({ transaction });
        await super.update({ transaction });
      });
    } catch (error) {
      throw new Error(
        `Failed to update SiteOperationSchedule: ${error.message}`
      );
    }
  }

  /**
   * Clears notifications associated with the schedule.
   * @param {*} param0
   * @returns
   */
  async clearNotification({ transaction }) {
    if (!this.docId) return;
    const constraints = [
      ["where", "siteOperationScheduleId", "==", this.docId],
    ];
    const notificationInstance = new ArrangementNotification();
    const existingDocs = await notificationInstance.fetchDocs({
      constraints,
    });
    if (!existingDocs.length) return;

    const deleteNotifications = async (trx) => {
      await Promise.all(
        existingDocs.map((doc) => doc.delete({ transaction: trx }))
      );
    };

    if (transaction) {
      await deleteNotifications(transaction);
    } else {
      const firestore = this.constructor.getAdapter().firestore;
      await runTransaction(firestore, deleteNotifications);
    }
  }

  /**
   * Creates `ArrangementNotification` documents for each employee in the schedule.
   * @returns {Promise<void>}
   */
  async notify() {
    if (!this.docId || this.employees.length === 0) return;
    const firestore = this.constructor.getAdapter().firestore;
    try {
      await runTransaction(firestore, async (transaction) => {
        await Promise.all(
          this.notifications.map((notify) => notify.create({ transaction }))
        );
      });
    } catch (error) {
      throw new Error(
        `Failed to notify SiteOperationSchedule: ${error.message}`
      );
    }
  }
}
