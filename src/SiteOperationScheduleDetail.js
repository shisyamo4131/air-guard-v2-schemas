import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class SiteOperationScheduleDetail extends BaseClass {
  static className = "現場稼働予定明細";
  static classProps = {
    /** 従業員ID または 外注先ID（isEmployee フラグにより判断） */
    workerId: defField("oneLine", { required: true }),
    /** 従業員かどうかのフラグ（true に固定） */
    isEmployee: defField("check", { default: true, required: true }),
    /** 人数（既定値は 1 に固定） */
    amount: defField("number", { default: 1, required: true, hidden: true }),
    /** 開始時刻（HH:MM形式） */
    startTime: defField("time", { label: "開始時刻", required: true }),
    /** 翌日開始フラグ */
    isStartNextDay: defField("check", { label: "翌日開始" }),
    /** 終了時刻（HH:MM形式） */
    endTime: defField("time", { label: "終了時刻", required: true }),
    /** 資格者フラグ */
    isQualificated: defField("check", { label: "資格者" }),
    /** OJTフラグ */
    isOjt: defField("check", { label: "OJT" }),
    /** 配置通知フラグ */
    hasNotification: defField("check"),
  };
}
