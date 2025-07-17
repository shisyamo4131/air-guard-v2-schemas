import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt } from "./utils";
import {
  OperationResultEmployee,
  OperationResultOutsourcer,
} from "./OperationResultDetail.js";

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
    /** 勤務区分 */
    shiftType: defField("shiftType", { required: true }),
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
     * - `OperationResultEmployee` クラスを使用して定義される。
     * - `OperationResult` クラスの `employees` フィールドに転用される。
     */
    employees: defField("array", { customClass: OperationResultEmployee }),

    /**
     * 配置外注先
     * - この稼働予定に配置される外注先のリスト。
     * - `OperationResultOutsourcer` クラスを使用して定義される。
     * - `OperationResult` クラスの `outsourcers` フィールドに転用される。
     */
    outsourcers: defField("array", { customClass: OperationResultOutsourcer }),
  };

  /***************************************************************************
   * AFTER INITIALIZE
   ***************************************************************************/
  afterInitialize() {
    Object.defineProperties(this, {
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
        get: () => this.employees.map((emp) => emp.employeeId),
        set: (v) => {},
      },
      /**
       * `outsourcers` プロパティから外注のIDを取得するためのアクセサ
       */
      outsourcerIds: {
        configurable: true,
        enumerable: true,
        get: () => this.outsourcers.map((out) => out.outsourcerId),
        set: (v) => {},
      },
    });
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
  addEmployee(employeeId, index = -1) {
    if (this.employees.some((emp) => emp.employeeId === employeeId)) {
      throw new Error(`Employee with ID ${employeeId} already exists.`);
    }
    const newEmployee = new OperationResultEmployee({
      employeeId,
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
  changeEmployee(oldIndex, newIndex) {
    if (oldIndex < 0 || oldIndex >= this.employees.length) {
      throw new Error(`Invalid old index: ${oldIndex}`);
    }
    if (newIndex < 0 || newIndex >= this.employees.length) {
      throw new Error(`Invalid new index: ${newIndex}`);
    }
    const employee = this.employees.splice(oldIndex, 1)[0];
    this.employees.splice(newIndex, 0, employee);
  }

  /**
   * `employeeId` または `index` に対応する従業員を this.employees から削除します。
   * - 数値の場合はインデックスとして削除します。
   * - 文字列の場合は employeeId として一致する要素を探して削除します。
   * - 不正な値や該当なしの場合はエラーをスローします。
   *
   * @param {string|number} target - 従業員のID（文字列）またはインデックス（数値）
   */
  removeEmployee(target) {
    let index = -1;

    if (typeof target === "number") {
      index = target;
      if (index < 0 || index >= this.employees.length) {
        throw new Error(`Invalid index: ${index}`);
      }
    } else if (typeof target === "string") {
      index = this.employees.findIndex((emp) => emp.employeeId === target);
      if (index === -1) {
        throw new Error(`Employee with ID "${target}" not found.`);
      }
    } else {
      throw new Error(`Invalid argument type: ${typeof target}`);
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
  addOutsourcer(outsourcerId, index = -1) {
    if (this.outsourcers.some((out) => out.outsourcerId === outsourcerId)) {
      throw new Error(`Outsourcer with ID ${outsourcerId} already exists.`);
    }
    const newOutsourcer = new OperationResultOutsourcer({
      outsourcerId,
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

  /**
   * 外注先の位置を変更します。
   * @param {number} oldIndex - 変更前のインデックス
   * @param {number} newIndex - 変更後のインデックス
   */
  changeOutsourcer(oldIndex, newIndex) {
    if (oldIndex < 0 || oldIndex >= this.outsourcers.length) {
      throw new Error(`Invalid old index: ${oldIndex}`);
    }
    if (newIndex < 0 || newIndex >= this.outsourcers.length) {
      throw new Error(`Invalid new index: ${newIndex}`);
    }
    const outsourcer = this.outsourcers.splice(oldIndex, 1)[0];
    this.outsourcers.splice(newIndex, 0, outsourcer);
  }

  /**
   * `outsourcerId` または `index` に対応する外注先を this.outsourcers から削除します。
   * - 数値の場合はインデックスとして削除します。
   * - 文字列の場合は outsourcerId として一致する要素を探して削除します。
   * - 不正な値や該当なしの場合はエラーをスローします。
   *
   * @param {string|number} target - 外注先のID（文字列）またはインデックス（数値）
   */
  removeOutsourcer(target) {
    let index = -1;

    if (typeof target === "number") {
      index = target;
      if (index < 0 || index >= this.outsourcers.length) {
        throw new Error(`Invalid index: ${index}`);
      }
    } else if (typeof target === "string") {
      index = this.outsourcers.findIndex((out) => out.outsourcerId === target);
      if (index === -1) {
        throw new Error(`Outsourcer with ID "${target}" not found.`);
      }
    } else {
      throw new Error(`Invalid argument type: ${typeof target}`);
    }

    this.outsourcers.splice(index, 1);
  }
}
