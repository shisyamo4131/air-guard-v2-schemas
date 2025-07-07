import { default as FireModel, BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import Site from "./Site.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_QUARTER_HOUR = 15;

/**
 * OperationResult クラスの employees, outsourcers プロパティに適用するカスタムクラスのベースクラス
 */
class OperationResultDetail extends BaseClass {
  /**
   * FirestoreのTimestampをJSのDateオブジェクトに変換します。
   * valueがfalsyな場合や、toDateメソッドを持たない場合は、そのまま返します。
   * @param {firebase.firestore.Timestamp | Date | any} value - 変換する値
   * @returns {Date | any}
   */
  _convertTimestampToDate(value) {
    return value?.toDate ? value.toDate() : value;
  }

  /**
   * OperationResultDetail クラスの startAt, endAt プロパティに適用するカスタムセッター
   * @param {string} part - プロパティ名 ('startAt' または 'endAt')
   * @param {Date} value - セットする値
   * @returns {void}
   * @throws {Error} - 無効なプロパティ名や値が Date オブジェクトでない場合にエラーを投げる
   * @description
   * この関数は、OperationResultDetail クラスの startAt および endAt プロパティに対して、
   * Date オブジェクトのみを許可するカスタムセッターです。
   * 無効なプロパティ名が指定された場合や、値が Date オブジェクトでない場合は、
   * エラーメッセージをコンソールに出力し、エラーを投げます。
   * @example
   * _dateTimeSetter('startAt', new Date()); // 正常
   * _dateTimeSetter('endAt', '2023-10-01'); // エラー
   * _dateTimeSetter('invalidProp', new Date()); // エラー
   */
  _dateTimeSetter(part, value) {
    if (!part || !["startAt", "endAt"].includes(part)) {
      const message = `[OperationResultDetail] Invalid property name: ${part}. Use 'startAt' or 'endAt'.`;
      console.error(message);
      throw new Error(message);
    }
    if (value instanceof Date) {
      this[part] = value;
    } else {
      const message = `[OperationResultDetail] Values other than Date objects cannot be set. value: ${value}`;
      console.error(message);
      throw new Error(message);
    }
  }

  /**
   * OperationResultDetail クラスの startAt, endAt プロパティから日付を取得するカスタムゲッター
   * @param {string} part - プロパティ名 ('startAt' または 'endAt')
   * @returns {Date|null} - Date オブジェクト、または null
   * @throws {Error} - 無効なプロパティ名が指定された場合にエラーを投げる
   * @description
   * この関数は、OperationResultDetail クラスの startAt および endAt プロパティから
   * 日付を取得するカスタムゲッターです。
   * 無効なプロパティ名が指定された場合は、エラーメッセージをコンソールに出力し、null を返します。
   * プロパティが Date オブジェクトでない場合も null を返します。
   * @example
   * dateGetter('startAt'); // Date オブジェクト
   * dateGetter('endAt'); // Date オブジェクト
   * dateGetter('invalidProp'); // エラーメッセージを出力し、null を返す
   */
  _getDate(part) {
    if (!part || !["startAt", "endAt"].includes(part)) {
      const message = `[OperationResultDetail] Invalid property name: ${part}. Use 'startAt' or 'endAt'.`;
      console.error(message);
      return null;
    }
    if (this[part] instanceof Date) {
      return this[part];
    } else {
      console.warn(
        `[OperationResultDetail] ${part} is not a Date object.`,
        this[part]
      );
      return null;
    }
  }

  /**
   * OperationResultDetail クラスの startAt, endAt プロパティに日付を設定するカスタムセッター
   * @param {string} part - プロパティ名 ('startAt' または 'endAt')
   * @param {Date} value - セットする値
   * @returns {void}
   * @throws {Error} - 無効なプロパティ名や値が Date オブジェクトでない場合にエラーを投げる
   * @description
   * この関数は、OperationResultDetail クラスの startAt および endAt プロパティに
   * 日付を設定するカスタムセッターです。
   * 無効なプロパティ名が指定された場合や、値が Date オブジェクトでない場合は、
   * エラーメッセージをコンソールに出力し、エラーを投げます。
   * @example
   * _setDate('startAt', new Date()); // 正常
   * _setDate('endAt', '2023-10-01'); // エラー
   * _setDate('invalidProp', new Date()); // エラー
   */
  _setDate(part, value) {
    if (!part || !["startAt", "endAt"].includes(part)) {
      const message = `[OperationResultDetail] Invalid property name: ${part}. Use 'startAt' or 'endAt'.`;
      console.error(message);
      throw new Error(message);
    }
    if (value instanceof Date) {
      this[part] = value;
    } else {
      const message = `[OperationResultDetail] Values other than Date objects cannot be set. value: ${value}`;
      console.error(message);
      throw new Error(message);
    }
  }

  /**
   * OperationResultDetail クラスの startAt, endAt プロパティから時刻を取得するカスタムゲッター
   * @param {string} part - プロパティ名 ('startAt' または 'endAt')
   * @returns {string|null} - `HH:mm` 形式の時刻文字列、または null
   * @throws {Error} - 無効なプロパティ名が指定された場合にエラーを投げる
   * @description
   * この関数は、OperationResultDetail クラスの startAt および endAt プロパティから
   * 時刻を取得するカスタムゲッターです。
   * 無効なプロパティ名が指定された場合は、エラーメッセージをコンソールに出力し、null を返します。
   * プロパティが Date オブジェクトでない場合も null を返します。
   * @example
   * timeGetter('startAt'); // 'HH:mm' 形式の時刻文字列
   * timeGetter('endAt'); // 'HH:mm' 形式の時刻文字列
   * timeGetter('invalidProp'); // エラーメッセージを出力し、null を返す
   */
  _getTime(part) {
    if (!part || !["startAt", "endAt"].includes(part)) {
      const message = `[OperationResultDetail] Invalid property name: ${part}. Use 'startAt' or 'endAt'.`;
      console.error(message);
      return null;
    }
    if (this[part] instanceof Date) {
      const hours = String(this[part].getHours()).padStart(2, "0");
      const minutes = String(this[part].getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  }

  /**
   * OperationResultDetail クラスの startAt, endAt プロパティに時刻を設定するカスタムセッター
   * @param {string} part - プロパティ名 ('startAt' または 'endAt')
   * @param {string} value - `HH:mm` 形式の時刻文字列
   * @returns {void}
   * @throws {Error} - 無効なプロパティ名や値が `HH:mm` 形式でない場合にエラーを投げる
   * @description
   * この関数は、OperationResultDetail クラスの startAt および endAt プロパティに
   * 時刻を設定するカスタムセッターです。
   * 無効なプロパティ名が指定された場合や、値が `HH:mm` 形式でない場合は、
   * エラーメッセージをコンソールに出力します。
   * プロパティが Date オブジェクトでない場合もエラーメッセージを出力します。
   * @example
   * _setTime('startAt', '08:30'); // 正常
   * _setTime('endAt', '17:00'); // 正常
   * _setTime('invalidProp', '08:30'); // エラーメッセージを出力
   * _setTime('startAt', 'invalidTime'); // エラーメッセージを出力
   */
  _setTime(part, value) {
    if (!value) {
      console.warn(
        `[OperationResultDetail.js _setTime] No time string provided for ${part}.`
      );
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(value)) {
      console.warn(
        `[OperationResultDetail.js _setTime] Invalid time string format for ${part}.`,
        value
      );
      return;
    }

    if (!(this[part] instanceof Date)) {
      console.warn(
        `[OperationResultDetail.js _setTime] ${part} is not a Date object.`,
        this[part]
      );
      return;
    }

    const [hours, minutes] = value.split(":").map(Number);
    this[part].setHours(hours, minutes, 0, 0);
  }

  initialize(data = {}) {
    super.initialize(data);
    /** 開始日時、終了日時の定義 */
    Object.defineProperties(this, {
      _startAt: {
        value: this._convertTimestampToDate(data.startAt) || new Date(),
        writable: true,
        enumerable: false,
      },
      startAt: {
        enumerable: true,
        get: () => this._startAt,
        set: (v) => this._dateTimeSetter("_startAt", v),
      },
      _endAt: {
        value: this._convertTimestampToDate(data.endAt) || new Date(),
        writable: true,
        enumerable: false,
      },
      endAt: {
        enumerable: true,
        get: () => this._endAt,
        set: (v) => this._dateTimeSetter("_endAt", v),
      },
      _breakMinutes: {
        enumerable: false,
        writable: true,
        value: data.breakMinutes || 0,
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

  get startDate() {
    return this._getDate("startAt");
  }
  set startDate(v) {
    this._setDate("startAt", v);
  }

  get endDate() {
    return this._getDate("endAt");
  }
  set endDate(v) {
    this._setDate("endAt", v);
  }

  get startTime() {
    return this._getTime("startAt");
  }
  set startTime(v) {
    this._setTime("startAt", v);
  }

  get endTime() {
    return this._getTime("endAt");
  }
  set endTime(v) {
    this._setTime("endAt", v);
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
  constructor(data = {}) {
    super(data);
    this.employeeId = data.employeeId || null;
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
