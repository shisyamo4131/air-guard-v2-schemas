import { BaseClass } from "air-firebase-v2";
import { defField, MINUTES_PER_HOUR } from "./parts/fieldDefinitions.js";

class OperationResultDetail extends BaseClass {
  static className = "稼働実績明細";
  static classProps = {
    /** 開始時刻（HH:MM形式） */
    startTime: defField("time", { label: "開始時刻", required: true }),
    /** 翌日開始フラグ */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 終了時刻（HH:MM形式） */
    endTime: defField("time", { label: "終了時刻", required: true }),
    /*************************************************************************
     * NOTE: `regulationWorkMinutes` は 当該オブジェクトを管理する親クラスが保有するものを使用する。
     *************************************************************************/
    /** 休憩時間（分） */
    breakMinutes: defField("breakMinutes", { required: true }),
    /** 残業時間（分） */
    overTimeWorkMinutes: defField("overTimeWorkMinutes", { required: true }),
    /** 資格者フラグ */
    isQualificated: defField("check", { label: "資格者" }),
    /** OJTフラグ */
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
  static classProps = {
    /** 外注先ID */
    outsourcerId: defField("oneLine", { required: true }),
    ...OperationResultDetail.classProps,
  };
}
