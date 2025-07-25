import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt } from "./utils/index.js";
import { getDayType } from "./constants/index.js";

import OperationResultDetail from "./OperationResultDetail.js";

export default class SiteOperationSchedule extends FireModel {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    /** ステータス（初期値: DRAFT） */
    status: defField("siteOperationScheduleStatus", { required: true }),
    /** 現場ドキュメントID */
    siteId: defField("siteId", { required: true, hidden: true }),
    /** 日付（Date オブジェクト） */
    dateAt: defField("dateAt", { label: "日付", required: true }),
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
      default: "08:00",
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 終了時刻（HH:MM 形式） */
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      default: "17:00",
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 規定実働時間（分）
     * - この時間を超えたら残業扱いとする。
     */
    regulationWorkMinutes: defField("regulationWorkMinutes", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 休憩時間（分）
     * - `startTime` と `endTime` の間に取得される休憩時間（分）。
     * - `totalWorkMinutes` の計算に使用される。
     */
    breakMinutes: defField("breakMinutes", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 必要人数 */
    requiredPersonnel: defField("number", {
      label: "必要人数",
      required: true,
    }),
    /** 要資格者フラグ */
    qualificationRequired: defField("check", { label: "要資格者" }),
    /** 作業内容 */
    workDescription: defField("oneLine", { label: "作業内容" }),
    /** 備考 */
    remarks: defField("multipleLine", { label: "備考" }),

    /**
     * 配置従業員
     * - この稼働予定に配置される従業員のリスト。
     * - `OperationResultDetail` クラスを使用して定義される。
     * - `OperationResult` クラスの `employees` フィールドに転用される。
     */
    employees: defField("array", { customClass: OperationResultDetail }),

    /**
     * 配置外注先
     * - この稼働予定に配置される外注先のリスト。
     * - `OperationResultDetail` クラスを使用して定義される。
     * - `OperationResult` クラスの `outsourcers` フィールドに転用される。
     */
    outsourcers: defField("array", { customClass: OperationResultDetail }),

    /** 稼働実績ドキュメントID */
    // 当該現場稼働ドキュメントから作成された稼働実績のドキュメントID。
    operationResultId: defField("oneLine", { hidden: true }),
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
        get: () => getDateAt(this.dateAt, this.startTime),
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => getDateAt(this.dateAt, this.endTime),
        set: (v) => {},
      },
      /**
       * 翌日フラグ
       * - `startTime` が `endTime` よりも遅い場合、翌日扱いとする。
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      /**
       * 総実働時間（分）
       * - `startAt` と `endAt` の差から休憩時間を引いた値。
       * - `startAt` と `endAt` の差が負の場合は 0を返す。
       */
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
      /**
       * 残業時間（分）
       * - `totalWorkMinutes` から `regulationWorkMinutes` を引いた値。
       * - 残業時間は負にならないように 0 を下限とする。
       */
      overTimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const diff = this.totalWorkMinutes - this.regulationWorkMinutes;
          return Math.max(0, diff);
        },
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
          const totalAssigned = this.employees.length + this.outsourcers.length;
          return totalAssigned < totalRequired;
        },
        set: (v) => {},
      },
    });
  }

  addWorker(workerId, isEmployee = true, amount = 1, index = 0) {
    if (isEmployee) {
      this._addEmployee(workerId, index);
    } else {
      this._addOutsourcer(workerId, amount, index);
    }
  }

  changeWorker(oldIndex, newIndex, isEmployee = true) {
    if (isEmployee) {
      this._changeEmployee(oldIndex, newIndex);
    } else {
      this._changeOutsourcer(oldIndex, newIndex);
    }
  }
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
    const newEmployee = new OperationResultDetail({
      workerId: employeeId,
      amount: 1,
      isEmployee: true,
      startTime: this.startTime,
      endTime: this.endTime,
      breakMinutes: this.breakMinutes,
      overTimeWorkMinutes: this.overTimeWorkMinutes,
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
      const newOutsourcer = new OperationResultDetail({
        workerId: outsourcerId,
        amount,
        isEmployee: false,
        startTime: this.startTime,
        endTime: this.endTime,
        breakMinutes: this.breakMinutes,
        overTimeWorkMinutes: this.overTimeWorkMinutes,
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
   * 当該現場稼働予定の日付を指定された日付で更新します。
   * - `dateAt` を更新し、`dayType` を再計算します。
   * - 更新処理であるため、`docId` が存在する必要があります。
   * @param {Date} dateAt
   * @return {Promise<void>} - 更新が成功した場合は解決される。
   * @throws {Error} - 更新に失敗した場合はエラーをスローします。
   * @throws {TypeError} - `dateAt` が Date オブジェクトでない場合はエラーをスローします。
   */
  async reschedule(dateAt) {
    try {
      if (!(dateAt instanceof Date)) {
        throw new TypeError("dateAt must be a Date object");
      }
      if (!this.docId) {
        throw new Error("Cannot reschedule without a document ID");
      }
      this.dateAt = dateAt;
      this.dayType = getDayType(dateAt);
      await this.update();
    } catch (err) {
      throw new Error(`Failed to reschedule: ${err.message}`);
    }
  }
}
