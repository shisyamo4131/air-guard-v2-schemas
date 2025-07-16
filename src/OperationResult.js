import { default as FireModel, BaseClass } from "air-firebase-v2";
import { defField, MINUTES_PER_HOUR } from "./parts/fieldDefinitions.js";
import Site from "./Site.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";

/**
 * OperationResult クラスの employees, outsourcers プロパティに適用するカスタムクラスのベースクラス
 */
class OperationResultDetail extends BaseClass {
  static className = "稼働実績明細";
  static classProps = {
    /**
     * 開始時刻（HH:MM形式）
     */
    startTime: defField("time", { label: "開始時刻", required: true }),
    /**
     * 終了時刻（HH:MM形式）
     */
    endTime: defField("time", { label: "終了時刻", required: true }),
    /**
     * 休憩時間（分）
     */
    breakMinutes: defField("breakMinutes", { required: true }),
    /**
     * 残業時間（分）
     */
    overTimeWorkMinutes: defField("overTimeWorkMinutes", { required: true }),
    /**
     * 資格者フラグ
     */
    isQualificated: defField("check", { label: "資格者" }),
    /**
     * OJTフラグ
     */
    isOjt: defField("check", { label: "OJT" }),
  };

  get breakHours() {
    return this.breakMinutes / MINUTES_PER_HOUR;
  }
  set breakHours(v) {
    if (typeof v !== "number") {
      console.warn(
        `[OperationResultDetail.js breakHours] Expected a number, got: ${v}`
      );
      return;
    }
    this.breakMinutes = Math.round(v * MINUTES_PER_HOUR);
  }

  get overTimeHours() {
    return this.overTimeWorkMinutes / MINUTES_PER_HOUR;
  }
  set overTimeHours(v) {
    if (typeof v !== "number") {
      console.warn(
        `[OperationResultDetail.js overTimeHours] Expected a number, got: ${v}`
      );
      return;
    }
    this.overTimeWorkMinutes = Math.round(v * MINUTES_PER_HOUR);
  }
}

/**
 * OperationResult クラスの employees プロパティに適用するカスタムクラス
 */
export class OperationResultEmployee extends OperationResultDetail {
  static className = "稼働実績明細（従業員）";
  static classProps = {
    /** 従業員ID */
    employeeId: defField("oneLine", { required: true }),
    ...OperationResultDetail.classProps,
  };
}

/**
 * OperationResult クラスの outsourcers プロパティに適用するカスタムクラス
 */
export class OperationResultOutsourcer extends OperationResultDetail {
  static className = "稼働実績明細（外注）";
  constructor(data = {}) {
    super(data);
    this.outsourcerId = data.outsourcerId || null;
  }
}

export default class OperationResult extends FireModel {
  static className = "稼働実績";
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    status: {
      type: String,
      default: "scheduled",
      label: "ステータス",
      required: true,
      component: {
        name: "air-select",
        attrs: {
          items: [
            { title: "予定", value: "scheduled" },
            { title: "承認", value: "approved" },
          ],
        },
      },
    },
    siteId: defField("siteId", {
      required: true,
      component: {
        attrs: {
          api: () => fetchDocsApi(Site),
          clearable: true,
          fetchItemByKeyApi: () => fetchItemByKeyApi(Site),
        },
      },
    }),

    /** 以下、現場稼働予定から複製されるプロパティ */
    // 請求期間として使用する日付（夜勤の場合、実際の開始日時は翌日になるケースがある）
    dateAt: defField("dateAt", { label: "日付", required: true }),
    dayType: defField("dayType", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    /**
     * 開始時刻（HH:MM形式）
     */
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      default: "08:00",
    }),
    /**
     * 終了時刻（HH:MM形式）
     */
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      default: "17:00",
    }),
    /**
     * 規定実働時間（分）
     * - `unitPrice`(または `unitPriceQualified`) で定められた単価に対する最大実働時間。
     * - この時間を超えると、残業扱いとなる。
     */
    regulationWorkMinutes: defField("regulationWorkMinutes", {
      required: true,
    }),
    /**
     * 休憩時間（分）
     * - `startTime` と `endTime` の間に取得される休憩時間（分）。
     * - `totalWorkMinutes` の計算に使用される。
     */
    breakMinutes: defField("breakMinutes", { required: true }),
    requiredPersonnel: defField("number", {
      label: "必要人数",
      required: true,
    }),
    qualificationRequired: defField("check", { label: "要資格者" }),
    workDescription: defField("oneLine", { label: "作業内容" }),
    unitPrice: defField("price", { label: "単価", required: true }),
    overTimeUnitPrice: defField("price", {
      label: "時間外単価",
      required: true,
    }),
    unitPriceQualified: defField("price", {
      label: "資格者単価",
      required: true,
    }),
    overTimeUnitPriceQualified: defField("price", {
      label: "資格者時間外単価",
      required: true,
    }),
    billingUnitType: defField("billingUnitType", { required: true }),
    /** ここまで */

    employees: defField("array", {
      label: "稼働実績明細（従業員）",
      customClass: OperationResultEmployee,
    }),
    outsourcers: defField("array", {
      label: "稼働実績明細（外注）",
      customClass: OperationResultOutsourcer,
    }),

    /** 現場稼働予定から複製される */
    remarks: defField("multipleLine", { label: "備考" }),

    /** 現場稼働予定のドキュメントID */
    siteOperationScheduleId: defField("oneLine", { hidden: true }),
  };
  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
  ];

  afterInitialize() {
    Object.defineProperties(this, {
      /**
       * 開始日時（Date オブジェクト）
       * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => this._getStartAt(this.dateAt),
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => this._getEndAt(this.dateAt),
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
          return Math.max(
            0,
            this.totalWorkMinutes - this.regulationWorkMinutes
          );
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
      amountBase: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees.filter(
            ({ isQualificated, isOjt }) => !isQualificated && !isOjt
          ).length,
        set: (v) => {},
      },
      amountOverTimeMinutesBase: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees
            .filter(({ isQualificated, isOjt }) => !isQualificated && !isOjt)
            .reduce((sum, emp) => sum + emp.overTimeMinutes, 0),
        set: (v) => {},
      },
      amountQualificated: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees.filter(
            ({ isQualificated, isOjt }) => !isQualificated && !isOjt
          ).length,
        set: (v) => {},
      },
      salesBase: {
        configurable: true,
        enumerable: true,
        get: () => this.amountBase * this.unitPrice,
        set: (v) => {},
      },
      salesQualificated: {
        configurable: true,
        enumerable: true,
        get: () => this.amountQualificated * this.unitPriceQualified,
        set: (v) => {},
      },
    });
  }

  /**
   * 開始時刻の時間部分を取得します。
   * - `startTime` が設定されていない場合は 0 を返します。
   */
  get startHour() {
    return this.startTime ? Number(this.startTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get startMinute() {
    return this.startTime ? Number(this.startTime.split(":")[1]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endHour() {
    return this.endTime ? Number(this.endTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の分部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endMinute() {
    return this.endTime ? Number(this.endTime.split(":")[1]) : 0;
  }

  /**
   * 引数で受け取った日付を Date オブジェクトに変換して返します。
   * - 引数が文字列の場合、日付文字列として解釈します。
   * - 引数がオブジェクトの場合、Date オブジェクトとして解釈します。
   * - 引数が未指定または null の場合、現在の日付を返します。
   * - `startTime` がセットされている場合はその時刻を反映します。
   * @param {string|Object} date 日付文字列または Date オブジェクト
   * @returns {Date} 変換後の Date オブジェクト
   */
  _getStartAt(date) {
    // date が null/undefined 以外で、かつ string／Date でないならエラー
    if (date != null && !(typeof date === "string" || date instanceof Date)) {
      throw new Error("Invalid date type");
    }

    // 空文字・undefined・null → Date.now()、それ以外 → date をそのまま使う
    const result = new Date(date || Date.now());

    // 開始時刻を設定（秒・ミリ秒は 0）
    result.setHours(this.startHour, this.startMinute, 0, 0);
    return result;
  }

  /**
   * 引数で受け取った日付を Date オブジェクトに変換して返します。
   * - 引数が文字列の場合、日付文字列として解釈します。
   * - 引数がオブジェクトの場合、Date オブジェクトとして解釈します。
   * - 引数が未指定または null の場合、現在の日付を返します。
   * - `endTime` がセットされている場合はその時刻を反映します。
   * @param {string|Object} date 日付文字列または Date オブジェクト
   * @returns {Date} 変換後の Date オブジェクト
   */
  _getEndAt(date) {
    // date が null/undefined 以外で、かつ string／Date でないならエラー
    if (date != null && !(typeof date === "string" || date instanceof Date)) {
      throw new Error("Invalid date type");
    }

    // 空文字・undefined・null → Date.now()、それ以外 → date をそのまま使う
    const result = new Date(date || Date.now());

    if (this.isSpansNextDay) {
      // 次の日にまたがる場合は、翌日の開始時刻を設定
      result.setDate(result.getDate() + 1);
    }

    // 開始時刻を設定（秒・ミリ秒は 0）
    result.setHours(this.endHour, this.endMinute, 0, 0);
    return result;
  }

  /**
   * 引数で受け取った従業員のIDを持つ新しい OperationResultEmployee を employees に追加します。
   * - `employees` プロパティに既に存在する従業員IDが指定された場合はエラーをスローします。
   * - `startAt`, `endAt`, `breakMinutes` は現在のインスタンスから取得されます。
   * - `employeeId` は必須です。
   * @param {string} employeeId - 従業員のID
   */
  addEmployee(employeeId) {
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
    this.employees.push(newEmployee);
  }

  /**
   * 引数で受け取った従業員のIDを持つ OperationResultEmployee を employees から削除します。
   * - 従業員IDが見つからない場合はエラーをスローします。
   * - `employeeId` は必須です。
   * @param {string} employeeId - 従業員のID
   */
  removeEmployee(employeeId) {
    const index = this.employees.findIndex(
      (emp) => emp.employeeId === employeeId
    );
    if (index === -1) {
      throw new Error(`Employee with ID ${employeeId} not found.`);
    }
    this.employees.splice(index, 1);
  }
}
