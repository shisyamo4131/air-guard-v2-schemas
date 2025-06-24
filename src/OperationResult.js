import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import Site from "./Site.js";

/**
 * FirestoreのTimestampをJSのDateオブジェクトに変換します。
 * valueがfalsyな場合や、toDateメソッドを持たない場合は、そのまま返します。
 * @param {firebase.firestore.Timestamp | Date | any} value - 変換する値
 * @returns {Date | any}
 */
const convertTimestampToDate = (value) => {
  return value?.toDate ? value.toDate() : value;
};

/**
 * OperationResult クラスの employees, outsourcers プロパティに適用するカスタムクラスのベースクラス
 */
class OperationResultDetail {
  constructor(data = {}) {
    this.startAt = convertTimestampToDate(data.startAt) || null;
    this.endAt = convertTimestampToDate(data.endAt) || null;
    this.breakMinutes = data.breakMinutes || 0;
    this.overTimeMinutes = data.overTimeMinutes || 0;
    this.isQualificated = data.isQualificated || false;
    this.isOjt = data.isOjt || false;
  }

  toObject() {
    return {
      startAt: this.startAt,
      endAt: this.endAt,
      breakMinutes: this.breakMinutes,
      overTimeMinutes: this.overTimeMinutes,
      isQualificated: this.isQualificated,
      isOjt: this.isOjt,
    };
  }
}

/**
 * OperationResult クラスの employees プロパティに適用するカスタムクラス
 */
export class OperationResultEmployee extends OperationResultDetail {
  constructor(data = {}) {
    super(data);
    this.employeeId = data.employeeId || null;
  }

  toObject() {
    return { ...super.toObject(), employeeId: this.employeeId };
  }
}

/**
 * OperationResult クラスの outsourcers プロパティに適用するカスタムクラス
 */
export class OperationResultOutsourcer extends OperationResultDetail {
  constructor(data = {}) {
    super(data);
    this.outsourcerId = data.outsourcerId || null;
  }

  toObject() {
    return { ...super.toObject(), outsourcerId: this.outsourcerId };
  }
}

export default class OperationResult extends FireModel {
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    siteId: defField("oneLine", {
      label: "現場",
      required: true,
      component: {
        name: "air-autocomplete-api",
        attrs: {
          api: () => {
            return async (search) =>
              await new Site().fetchDocs({ constraints: search });
          },
          fetchItemByKeyApi: () => {
            return async (docId) => {
              return await new Site().fetchDoc({ docId });
            };
          },
          itemValue: "docId",
          itemTitle: "name",
          noFilter: true,
        },
      },
    }),
    date: defField("date", { label: "日付", required: true }),
    dayType: {
      type: String,
      default: "weekday",
      label: "曜日区分",
      required: true,
      component: {
        name: "air-select",
        attrs: {
          items: [
            { title: "平日", value: "weekday" },
            { title: "土曜", value: "saturday" },
            { title: "日曜", value: "sunday" },
            { title: "祝日", value: "holiday" },
          ],
        },
      },
    },
    shiftType: defField("shiftType", { required: true }),
    /**
     * employees
     * { employeeId, startAt, endAt, breakMinutes, overTimeMinutes, isQualificated, isOjt }
     */
    employees: {
      type: Array,
      default: () => [],
      customClass: OperationResultEmployee,
      label: "稼働明細",
      required: false,
    },
    /**
     * outsourcers
     * { outsourcerId, startAt, endAt, breakMinutes, overTimeMinutes, isQualificated, isOjt }
     */
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
