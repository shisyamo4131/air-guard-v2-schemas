import { default as FireModel, BaseClass } from "air-firebase-v2";
import {
  defField,
  DEFAULT_BREAK_MINUTES,
  MINUTES_PER_HOUR,
  MINUTES_PER_QUARTER_HOUR,
} from "./parts/fieldDefinitions.js";
import Site from "./Site.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";

/**
 * OperationResult クラスの employees, outsourcers プロパティに適用するカスタムクラスのベースクラス
 */
class OperationResultDetail extends BaseClass {
  static className = "稼働実績明細";
  static classProps = {
    startAt: defField("dateTimeAt", { label: "開始日時", required: true }),
    endAt: defField("dateTimeAt", { label: "終了日時", required: true }),
  };
  initialize(data = {}) {
    super.initialize(data);
    /** 開始日時、終了日時の定義 */
    Object.defineProperties(this, {
      _breakMinutes: {
        enumerable: false,
        writable: true,
        value: data.breakMinutes || DEFAULT_BREAK_MINUTES,
      },
      breakMinutes: {
        enumerable: true,
        get: () => this._breakMinutes,
        set: (v) => {
          if (typeof v !== "number") {
            console.warn(
              `[OperationResultDetail.js breakMinutes] Expected a number, got: ${v}`
            );
            return;
          }
          // 15の倍数以外は設定不可能
          if (v % MINUTES_PER_QUARTER_HOUR !== 0) {
            console.warn(
              `[OperationResultDetail.js breakMinutes] Must be a multiple of ${MINUTES_PER_QUARTER_HOUR}, got: ${v}`
            );
            return;
          }
          this._breakMinutes = Math.round(v);
        },
      },
    });
    this.overTimeMinutes = data.overTimeMinutes || 0;
    this.isQualificated = data.isQualificated || false;
    this.isOjt = data.isOjt || false;
  }

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
}

/**
 * OperationResult クラスの employees プロパティに適用するカスタムクラス
 */
export class OperationResultEmployee extends OperationResultDetail {
  static className = "稼働実績明細（従業員）";

  constructor(data = {}) {
    super(data);
    this.employeeId = data.employeeId || null;
  }
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
    startAt: defField("dateTimeAt", { label: "開始日時", required: true }),
    endAt: defField("dateTimeAt", { label: "終了日時", required: true }),
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
      startAt: this.startAt,
      endAt: this.endAt,
      breakMinutes: this.breakMinutes,
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
