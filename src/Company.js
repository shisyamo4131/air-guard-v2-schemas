import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";

export default class Company extends FireModel {
  static className = "会社";
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    companyName: defField("name", { label: "会社名", required: true }),
    companyNameKana: defField("nameKana", {
      label: "会社名（カナ）",
      required: true,
    }),
    /** 以下、管理者アカウント作成時に未入力状態で作成されるため required は未定義とする */
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode"),
    city: defField("city"),
    address: defField("address"),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
    defaultStartTimeDayShift: defField("time", { label: "日勤既定開始時刻" }),
    defaultEndTimeDayShift: defField("time", { label: "日勤既定終了時刻" }),
    defaultStartTimeNightShift: defField("time", { label: "夜勤既定開始時刻" }),
    defaultEndTimeNightShift: defField("time", { label: "夜勤既定終了時刻" }),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }

  /**
   * Returns the default time map for day and night shifts.
   * @returns {Object} An object containing start and end times for day and night shifts.
   * @property {Object} day - Contains start and end times for the day shift.
   * @property {Object} night - Contains start and end times for the night shift.
   * @property {string} day.start - Default start time for the day shift.
   * @property {string} day.end - Default end time for the day shift.
   * @property {string} night.start - Default start time for the night shift.
   * @property {string} night.end - Default end time for the night shift.
   */
  get defaultTimeMap() {
    return {
      day: {
        start: this.defaultStartTimeDayShift || "08:00",
        end: this.defaultEndTimeDayShift || "17:00",
      },
      night: {
        start: this.defaultStartTimeNightShift || "20:00",
        end: this.defaultEndTimeNightShift || "05:00",
      },
    };
  }
}
