/*****************************************************************************
 * @file ./src/Operation.js
 * @author shisyamo4131
 * @description 稼働情報クラス
 * - 稼働情報を表す抽象クラスです。インスタンス化はできません。
 *
 * @class
 * @extends WorkingResult
 * @abstract
 * @see OperationResult
 * @see SiteOperationSchedule
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
 * @deprecated
 * @property {string} key - 使用不可
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
 * @deprecated
 * @getter {boolean} isKeyChanged - 使用不可
 *
 * @static SHIFT_TYPE - 勤務区分を定義する定数オブジェクト
 * @static INVALID_REASON - クラス特有のエラーコードを定義する定数オブジェクト
 * - `BREAK_MINUTES_NEGATIVE`: `breakMinutes` が負の値である場合のエラーコード
 * - `REGULATION_WORK_MINUTES_NEGATIVE`: `regulationWorkMinutes` が負の値である場合のエラーコード
 * @static DAY_TYPE - 曜日区分を定義する定数オブジェクト
 *
 * @static
 * @method groupKeyDivider - `groupKey` を構成する要素を分割して返す静的メソッド
 *****************************************************************************/
import WorkingResult from "./WorkingResult.js";
import OperationDetail from "./OperationDetail.js";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  siteId: defField("siteId", { required: true }),
  ...WorkingResult.classProps, // Inherited from WorkingResult.js
  requiredPersonnel: defField("number", {
    label: "必要人数",
    required: true,
  }),
  qualificationRequired: defField("check", { label: "要資格者" }),
  workDescription: defField("workDescription"),
  remarks: defField("multipleLine", { label: "備考" }),
  employees: defField("array", { customClass: OperationDetail }),
  outsourcers: defField("array", {
    customClass: OperationDetail,
  }),
};

export default class Operation extends WorkingResult {
  static className = "稼働ベース";
  static collectionPath = "Operations";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  /**
   * Constructor
   * - 抽象クラスのため、直接のインスタンス化を防止します。
   * @param {Object} item - 初期化オブジェクト
   */
  constructor(item = {}) {
    if (new.target == Operation) {
      throw new Error(
        `Operation is an abstract class and cannot be instantiated directly.`,
      );
    }
    super(item);
  }

  /**
   * setDateAtCallback
   * - Callback method called when `dateAt` is set.
   * - Override this method in subclasses to add custom behavior when `dateAt` changes.
   * @param {*} v
   */
  setDateAtCallback(v) {
    super.setDateAtCallback(v);
    this.employees.forEach((emp) => (emp.dateAt = v));
    this.outsourcers.forEach((out) => (out.dateAt = v));
  }

  /**
   * setSiteIdCallback
   * - Callback method called when `siteId` is set.
   * - Override this method in subclasses to add custom behavior when `siteId` changes.
   * @param {*} v
   */
  setSiteIdCallback(v) {
    this.employees.forEach((emp) => (emp.siteId = v));
    this.outsourcers.forEach((out) => (out.siteId = v));
  }

  /**
   * setShiftTypeCallback
   * - Callback method called when `shiftType` is set.
   * - Override this method in subclasses to add custom behavior when `shiftType` changes.
   * @param {*} v
   */
  setShiftTypeCallback(v) {
    this.employees.forEach((emp) => (emp.shiftType = v));
    this.outsourcers.forEach((out) => (out.shiftType = v));
  }

  /**
   * setRegulationWorkMinutesCallback
   * - Callback method called when `regulationWorkMinutes` is set.
   * - Override this method in subclasses to add custom behavior when `regulationWorkMinutes` changes.
   * @param {*} v
   */
  setRegulationWorkMinutesCallback(v) {
    this.employees.forEach((emp) => (emp.regulationWorkMinutes = v));
    this.outsourcers.forEach((out) => (out.regulationWorkMinutes = v));
  }

  /**
   * afterInitialize
   * @param {Object} item - 初期化オブジェクト
   */
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    /***********************************************************
     * KEY PROPERTIES
     ***********************************************************/
    Object.defineProperties(this, {
      /**
       * `date`, `shiftType`, `siteId` を組み合わせたキー。（読み取り専用）
       */
      groupKey: {
        configurable: true,
        enumerable: true,
        get() {
          const date = this.dateAt ? this.date : "null";
          const shiftType = this.shiftType || "null";
          const siteId = this.siteId || "null";
          return `${siteId}_${shiftType}_${date}`;
        },
        set() {},
      },

      /**
       * `date`, `shiftType` を組み合わせたキー。（読み取り専用）
       * - 適用する取極めを特定するためのキーとして使用。
       */
      agreementKey: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.date}_${this.shiftType}`;
        },
        set() {},
      },

      /**
       * `siteId`, `shiftType` を組み合わせたキー。（読み取り専用）
       * - `siteOrder` の `key` プロパティに対応するキー。
       */
      orderKey: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.siteId}_${this.shiftType}`;
        },
        set() {},
      },
    });

    /***********************************************************
     * TRIGGERS FOR SYNCRONIZATION TO EMPLOYEES AND OUTSOURCERS
     * ---------------------------------------------------------
     * When `siteId`, `dateAt`, `shiftType`, and `regulationWorkMinutes`
     * are changed on the Operation instance,
     * the corresponding properties on all employees and outsourcers
     * are automatically updated to keep them in sync.
     * [NOTE]
     * `startTime`, `endTime`, and `breakMinutes` are NOT synchronized here.
     * They should be synchronized at `SiteOperationSchedule` level instead.
     ***********************************************************/
    let _siteId = this.siteId;
    let _shiftType = this.shiftType;
    let _regulationWorkMinutes = this.regulationWorkMinutes;
    Object.defineProperties(this, {
      siteId: {
        configurable: true,
        enumerable: true,
        get() {
          return _siteId;
        },
        set(v) {
          if (!!v && typeof v !== "string") {
            throw new Error(`siteId must be a string. siteId: ${v}`);
          }
          if (_siteId === v) return;
          _siteId = v;
          this.setSiteIdCallback(v);
        },
      },
      shiftType: {
        configurable: true,
        enumerable: true,
        get() {
          return _shiftType;
        },
        set(v) {
          if (typeof v !== "string") {
            throw new Error(`shiftType must be a string. shiftType: ${v}`);
          }
          if (!WorkingResult.SHIFT_TYPE[v]) {
            throw new Error(`Invalid shiftType value. shiftType: ${v}`);
          }
          if (_shiftType === v) return;
          _shiftType = v;
          this.setShiftTypeCallback(v);
        },
      },
      regulationWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return _regulationWorkMinutes;
        },
        set(v) {
          if (typeof v !== "number" || isNaN(v) || v < 0) {
            throw new Error(
              `regulationWorkMinutes must be a non-negative number. regulationWorkMinutes: ${v}`,
            );
          }
          if (_regulationWorkMinutes === v) return;
          _regulationWorkMinutes = v;
          this.setRegulationWorkMinutesCallback(v);
        },
      },
    });

    /***********************************************************
     * OTHER PROPERTIES
     ***********************************************************/
    Object.defineProperties(this, {
      /**
       * `employeeId` の配列を返します。
       */
      employeeIds: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.map((emp) => emp.employeeId);
        },
        set(v) {},
      },

      /**
       * `outsourcerId` の配列を返します。
       */
      outsourcerIds: {
        configurable: true,
        enumerable: true,
        get() {
          return this.outsourcers.map((out) => out.outsourcerId);
        },
        set(v) {},
      },

      /**
       * `employees` に割り当てられた人数を返します。
       */
      employeesCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.length;
        },
        set(v) {},
      },

      /**
       * `outsourcers` に割り当てられた人数を返します。
       */
      outsourcersCount: {
        configurable: true,
        enumerable: true,
        get() {
          return this.outsourcers.reduce((sum, i) => sum + i.amount, 0);
        },
        set(v) {},
      },

      /**
       * 必要人数に対して、割り当てられた従業員と外注先の合計人数が不足しているかどうかを返します。
       */
      isPersonnelShortage: {
        configurable: true,
        enumerable: true,
        get() {
          const totalRequired = this.requiredPersonnel || 0;
          const totalAssigned = this.employeesCount + this.outsourcersCount;
          return totalAssigned < totalRequired;
        },
        set(v) {},
      },

      /**
       * `employees` と `outsourcers` を組み合わせた配列を返します。
       * セッターは、`isEmployee` プロパティに基づいて、従業員と外注先を分割して `employees` と `outsourcers` に設定します。
       */
      workers: {
        configurable: true,
        enumerable: true,
        get() {
          return this.employees.concat(this.outsourcers);
        },
        set(v) {
          const employees = v.filter((emp) => emp.isEmployee);
          const outsourcers = v.filter((out) => !out.isEmployee);
          this.employees = employees;
          this.outsourcers = outsourcers;
        },
      },
    });

    /***********************************************************
     * METHODS FOR MANAGING EMPLOYEES AND OUTSOURCERS
     ***********************************************************/
    const self = this;
    Object.defineProperties(this.employees, {
      /**
       * Adds a new employee to the `employees` property with the specified ID.
       * - The element added is as an instance specified by `employees.customClass`.
       * - Throws an error if the specified employee ID already exists in the `employees` property.
       * - `startAt`, `endAt`, and `breakMinutes` are taken from the current instance.
       * - `employeeId` is required.
       * [Note]
       * Any options other than `id` and `amount` are accepted and used as initial values
       * for the new instance.
       * @param {Object} args - arguments.
       * @param {string} args.id - The employee's ID.
       * @param {number} args.amount - amount.
       * @param {number} [index=0] - Insertion position. If -1, adds to the end.
       * @returns {Object} - The added employee object.
       * @throws {Error} - If the employee ID already exists.
       */
      add: {
        value: function (args = {}, index = 0) {
          const { id } = args;
          if (!id || typeof id !== "string") {
            throw new Error(
              `Employee ID is required and must be a string. id: ${id}`,
            );
          }
          if (this.some((emp) => emp.workerId === id)) {
            throw new Error(`Employee with ID ${id} already exists.`);
          }
          const schema = self.constructor.classProps?.employees?.customClass;
          if (!schema || typeof schema !== "function") {
            throw new Error("employees.customClass is not defined.");
          }
          const newEmployee = new schema({
            ...self.toObject(), // 自身のプロパティを継承（siteId, dateAt, shiftType, startTime, endTime, breakMinutes など）
            ...args,
            isEmployee: true, // Force override to true
          });
          if (index === -1) {
            this.push(newEmployee);
          } else {
            this.splice(index, 0, newEmployee);
          }
          return newEmployee;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Moves the position of an employee in the employees array.
       * @param {number} oldIndex - The original index.
       * @param {number} newIndex - The new index.
       */
      move: {
        value: function (oldIndex, newIndex) {
          if (newIndex > this.length - 1) {
            throw new Error(
              `Employees must be placed before outsourcers. newIndex: ${newIndex}, employees.length: ${this.length}`,
            );
          }
          if (newIndex < 0 || newIndex >= this.length) {
            throw new Error(`Invalid new index: ${newIndex}`);
          }
          const employee = this.splice(oldIndex, 1)[0];
          this.splice(newIndex, 0, employee);
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Changes the details of an existing employee in the employees array.
       * @param {Object} newEmployee - The updated employee object.
       * @throws {Error} - If the employee is not found.
       */
      change: {
        value: function (newEmployee) {
          const index = this.findIndex(
            (e) => e.workerId === newEmployee.workerId,
          );
          if (index < 0) {
            throw new Error("Worker not found in employees.");
          }
          this[index] = newEmployee;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Removes the employee corresponding to `employeeId` from this.employees.
       * @param {string} employeeId - The employee's ID
       * @throws {Error} - If the employee ID is not found.
       */
      remove: {
        value: function (employeeId) {
          const index = this.findIndex((emp) => emp.workerId === employeeId);
          if (index === -1) {
            throw new Error(`Employee with ID "${employeeId}" not found.`);
          }
          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
      },
    });
    Object.defineProperties(this.outsourcers, {
      /**
       * Adds a new outsourcer to the `outsourcers` property with the specified ID.
       * - The element added is as an instance specified by `outsourcers.customClass`.
       * - If the specified outsourcer ID already exists in the `outsourcers` property, increases the amount.
       * - `startTime`, `endTime`, and `isStartNextDay` are taken from the current instance.
       * - `outsourcerId` is required.
       * [Note]
       * Any options other than `id` and `amount` are accepted and used as initial values
       * for the new instance.
       * @param {Object} args - arguments.
       * @param {string} args.id - The outsourcer's ID.
       * @param {number} args.amount - amount.
       * @param {number} [index=0] - Insertion position. If -1, adds to the end.
       * @return {Object} - The added outsourcer object.
       * @throws {Error} - If the outsourcer ID is not provided.
       */
      add: {
        value: function (args = {}, index = 0) {
          const { id } = args;
          if (!id || typeof id !== "string") {
            throw new Error(
              `Outsourcer ID is required and must be a string. id: ${id}`,
            );
          }
          const maxIndex = this.reduce((result, out) => {
            if (out.outsourcerId === id) {
              return Math.max(result, Number(out.index));
            }
            return result;
          }, 0);

          const schema = self.constructor.classProps.outsourcers.customClass;
          if (!schema || typeof schema !== "function") {
            throw new Error("outsourcers.customClass is not defined.");
          }
          const newOutsourcer = new schema({
            ...self.toObject(),
            ...args,
            index: maxIndex + 1, // Always set to the next index
            isEmployee: false, // Force override to false
          });

          if (index === -1) {
            this.push(newOutsourcer);
          } else {
            this.splice(index, 0, newOutsourcer);
          }
          return newOutsourcer;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Moves the position of an outsourcer in the outsourcers array.
       * - `oldIndex` and `newIndex` are offset by the number of employees.
       * @param {number} oldIndex - The original index.
       * @param {number} newIndex - The new index.
       */
      move: {
        value: function (oldIndex, newIndex) {
          if (newIndex <= self.employees.length - 1) {
            throw new Error(
              `Outsourcers must be placed after employees. newIndex: ${newIndex}, employees.length: ${self.employees.length}`,
            );
          }
          const internalOldIndex = Math.max(
            0,
            oldIndex - self.employees.length,
          );
          const internalNewIndex = Math.max(
            0,
            newIndex - self.employees.length,
          );
          if (internalOldIndex < 0 || internalOldIndex >= this.length) {
            throw new Error(`Invalid old index: ${internalOldIndex}`);
          }
          if (internalNewIndex < 0 || internalNewIndex >= this.length) {
            throw new Error(`Invalid new index: ${internalNewIndex}`);
          }
          const outsourcer = this.splice(internalOldIndex, 1)[0];
          this.splice(internalNewIndex, 0, outsourcer);
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Changes the details of an existing outsourcer in the outsourcers array.
       * @param {Object} newOutsourcer - The updated outsourcer object.
       * @throws {Error} - If the outsourcer is not found.
       */
      change: {
        value: function (newOutsourcer) {
          const index = this.findIndex(
            (e) => e.workerId === newOutsourcer.workerId,
          );
          if (index < 0) {
            throw new Error("Worker not found in outsourcers.");
          }
          this[index] = newOutsourcer;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Removes the outsourcer corresponding to `outsourcerId` from this.outsourcers.
       * - Throws an error for invalid values or if not found.
       * @param {string} outsourcerId - The ID of the outsourcer.
       * @throws {Error} - If the outsourcer ID is not found.
       */
      remove: {
        value: function (outsourcerId) {
          const index = this.findIndex((out) => out.workerId === outsourcerId);
          if (index === -1) {
            throw new Error(`Outsourcer with ID "${outsourcerId}" not found.`);
          }
          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
      },
    });
  }

  /***************************************************************************
   * GETTERS
   ***************************************************************************/
  /**
   * `siteId`, `shiftType`, `date` のいずれかが変更されたかどうかを返します。
   * - いずれかが変更された場合は true を返します。
   * - すべてが変更されていない場合は false を返します。
   * @returns {boolean} - `siteId`, `shiftType`, `date` のいずれかが変更されたかどうか。
   */
  get isGroupKeyChanged() {
    const currentKey = this.groupKey;
    const beforeKey = `${this._beforeData?.siteId || ""}_${
      this._beforeData?.shiftType || ""
    }_${this._beforeData?.date || ""}`;
    return currentKey !== beforeKey;
  }

  /**
   * `date`, `shiftType` のいずれかが変更されたかどうかを返します。
   * - いずれかが変更された場合は true を返します。
   * - すべてが変更されていない場合は false を返します。
   * @returns {boolean} - `date`, `shiftType` のいずれかが変更されたかどうか。
   */
  get isAgreementKeyChanged() {
    const currentKey = this.agreementKey;
    const beforeKey = `${this._beforeData?.date || ""}_${
      this._beforeData?.shiftType || ""
    }`;
    return currentKey !== beforeKey;
  }

  /**
   * 従業員が変更されたかどうかを返します。
   * - 従業員IDが変更された場合は true を返します。
   * - 従業員IDが変更されていない場合、または順序が変更されても同じ場合は false を返します。
   * @returns {boolean} - 従業員が変更されたかどうか。
   */
  get isEmployeesChanged() {
    const current = this.employeeIds || [];
    const before = this._beforeData?.employeeIds || [];
    return current.sort().join(",") !== before.sort().join(",");
  }

  /**
   * 外注先が変更されたかどうかを返します。
   * - 外注先IDが変更された場合は true を返します。
   * - 外注先IDが変更されていない場合、または順序が変更されても同じ場合は false を返します。
   * @returns {boolean} - 外注先が変更されたかどうか。
   */
  get isOutsourcersChanged() {
    const current = this.outsourcerIds || [];
    const before = this._beforeData?.outsourcerIds || [];
    return current.sort().join(",") !== before.sort().join(",");
  }

  /**
   * 追加された従業員の配列を返します。
   * @returns {Array<OperationDetail>} - 追加された従業員の配列。
   */
  get addedWorkers() {
    const current = this.workers || [];
    if (current.length === 0) return [];
    const before = this._beforeData?.workers || [];
    const isAdded = (emp) => !before.some((e) => e.workerId === emp.workerId);
    return current.filter(isAdded);
  }

  /**
   * 削除された従業員の配列を返します。
   * @returns {Array<OperationDetail>} - 削除された従業員の配列。
   */
  get removedWorkers() {
    const before = this._beforeData?.workers || [];
    if (before.length === 0) return [];
    const current = this.workers || [];
    const isRemoved = (emp) =>
      !current.some((e) => e.workerId === emp.workerId);
    return before.filter(isRemoved);
  }

  /**
   * 更新された従業員の配列を返します。
   * - `startTime`, `isStartNextDay`, `endTime`, `breakMinutes` プロパティを比較します。
   * @returns {Array<OperationDetail>} - 更新された従業員の配列。
   */
  get updatedWorkers() {
    const before = this._beforeData.workers || [];
    if (before.length === 0) return [];
    const current = this.workers || [];
    const keys = [
      "startTime",
      "isStartNextDay",
      "endTime",
      "breakMinutes",
      "isQualified",
      "isOjt",
    ];
    const isUpdated = (emp) => {
      const worker = before.find((e) => e.workerId === emp.workerId);
      if (!worker) return false;
      return keys.some((key) => emp[key] !== worker[key]);
    };
    return current.filter(isUpdated);
  }

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  /**
   * `Workers` に新しい従業員または外注先を追加します。
   * - `isEmployee` の値に応じて適切なメソッドを呼び出します。
   * @param {Object} options - 従業員または外注先を追加するためのオプション。
   * @param {string} options.id - 従業員IDまたは外注先ID
   * @param {boolean} [options.isEmployee=true] - 従業員かどうか
   * @param {number} [index=0] - 挿入位置。-1 の場合は末尾に追加。
   */
  addWorker(options = {}, index = 0) {
    const { isEmployee = true } = options;
    if (isEmployee) {
      this.employees.add(options, index);
    } else {
      this.outsourcers.add(options, index);
    }
  }

  /**
   * 従業員または外注先の位置を移動します。
   * @param {Object} options - 従業員または外注先の位置を変更するためのオプション。
   * @param {number} options.oldIndex - 元のインデックス。
   * @param {number} options.newIndex - 新しいインデックス。
   * @param {boolean} [options.isEmployee=true] - 従業員の場合は true、外注先の場合は false。
   */
  moveWorker(options) {
    const { oldIndex, newIndex, isEmployee = true } = options;
    if (typeof oldIndex !== "number" || typeof newIndex !== "number") {
      throw new Error(
        "oldIndex and newIndex are required and must be numbers.",
      );
    }
    if (isEmployee) {
      this.employees.move(oldIndex, newIndex);
    } else {
      this.outsourcers.move(oldIndex, newIndex);
    }
  }

  /**
   * 従業員または外注先の詳細を変更します。
   * @param {Object} newWorker - 新しい従業員オブジェクト
   */
  changeWorker(newWorker) {
    if (newWorker.isEmployee) {
      this.employees.change(newWorker);
    } else {
      this.outsourcers.change(newWorker);
    }
  }

  /**
   * 従業員または外注先を `workers` から削除します。
   * @param {Object} options - 従業員または外注先を削除するためのオプション。
   * @param {string} options.workerId - 従業員IDまたは外注先ID。
   * @param {boolean} [options.isEmployee=true] - 従業員の場合は true、外注先の場合は false。
   */
  removeWorker(options) {
    const { workerId, isEmployee = true } = options;
    if (isEmployee) {
      this.employees.remove(workerId);
    } else {
      this.outsourcers.remove(workerId);
    }
  }

  /**
   * キーを siteId、shiftType、date に分割した配列を返します。
   * @param {Object|string} key
   * @returns {Array<string>} - [siteId, shiftType, date]
   * @throws {Error} - キーが無効な場合。
   */
  static groupKeyDivider(key = {}) {
    if (!key) throw new Error("key is required.");

    switch (typeof key) {
      case "object":
        if (!key.siteId || !key.shiftType || !key.date) {
          throw new Error(
            "key must contain siteId, shiftType, and date properties.",
          );
        }
        return [key.siteId, key.shiftType, key.date];
      case "string":
        const [siteId, shiftType, date] = key.split("_");
        if (!siteId || !shiftType || !date) {
          throw new Error("key must be in the format 'siteId_shiftType_date'.");
        }
        return [siteId, shiftType, date];
      default:
        throw new Error("Invalid key type.");
    }
  }

  /***************************************************************************
   * FOR DEPRECATED PROPERTIES
   ***************************************************************************/
  get key() {
    console.warn("Operation.key is deprecated.");
    return null;
  }

  set key(v) {
    console.warn("Operation.key is deprecated.");
  }

  get isKeyChanged() {
    console.warn("Operation.isKeyChanged is deprecated.");
    return false;
  }
}
