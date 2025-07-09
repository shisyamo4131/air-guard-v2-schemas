import { default as FireModel, BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import Site from "./Site.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";

const DEFAULT_BREAK_MINUTES = 60;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_QUARTER_HOUR = 15;

/**
 * OperationResult クラスの employees, outsourcers プロパティに適用するカスタムクラスのベースクラス
 */
class OperationResultDetail extends BaseClass {
  static className = "稼働実績明細";
  static classProps = {
    startAt: defField("dateTime", { label: "開始日時", required: true }),
    endAt: defField("dateTime", { label: "終了日時", required: true }),
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
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    siteId: defField("siteId", {
      required: true,
      component: {
        attrs: {
          api: () => fetchDocsApi(Site),
          fetchItemByKeyApi: () => fetchItemByKeyApi(Site),
        },
      },
    }),
    date: defField("date", { label: "日付", required: true }),
    dayType: defField("dayType", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    employees: {
      type: Array,
      default: () => [],
      customClass: OperationResultEmployee,
      label: "稼働明細",
      required: false,
    },
    outsourcers: {
      type: Array,
      default: () => [],
      customClass: OperationResultOutsourcer,
      label: "稼働明細",
      required: false,
    },
  };

  addEmployee({
    employeeId,
    startAt,
    endAt,
    breakMinutes = 60,
    overTimeMinutes = 0,
    isQualificated = false,
    isOjt = false,
  } = {}) {
    this.employees.push(
      new OperationResultEmployee({
        employeeId,
        startAt,
        endAt,
        breakMinutes,
        overTimeMinutes,
        isQualificated,
        isOjt,
      })
    );
  }
}
