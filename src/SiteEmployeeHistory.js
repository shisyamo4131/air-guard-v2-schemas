/*****************************************************************************
 * @class SiteEmployeeHistory
 * @extends FireModel
 * @description 従業員の現場入場履歴
 * - ドキュメントIDは `${siteId}_${employeeId}` で固定されます。
 *
 * @property {string} employeeId - 従業員ID
 * @property {string} siteId - 現場ID
 * @property {Date} firstDateAt - 初回入場日時
 * @property {string} firstDate - 初回入場日 (YYYY-MM-DD 形式の文字列 / 読み取り専用)
 * @property {string} firstOperationResultId - 初回入場稼働実績ID
 * @property {Date} lastDateAt - 最終入場日時
 * @property {string} lastDate - 最終入場日 (YYYY-MM-DD 形式の文字列 / 読み取り専用)
 * @property {string} lastOperationResultId - 最終入場稼働実績ID
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { getDateAt, formatJstDate } from "./utils/index.js";

export default class SiteEmployeeHistory extends FireModel {
  static className = "現場入場履歴";
  static collectionPath = "SiteEmployeeHistories";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    employeeId: defField("employeeId", { required: true }),
    siteId: defField("siteId", { required: true }),
    firstDateAt: defField("dateAt", { required: true }),
    firstOperationResultId: defField("oneLine", { required: true }),
    lastDateAt: defField("dateAt", { required: true }),
    lastOperationResultId: defField("oneLine", { required: true }),
  };

  /*****************************************************************************
   * AFTER INITIALIZE (OVERRIDE)
   * - `firstDate`, `lastDate` を定義
   *****************************************************************************/
  afterInitialize(item = {}) {
    super.afterInitialize(item);

    Object.defineProperties(this, {
      firstDate: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.firstDateAt);
        },
        set(v) {},
      },
      lastDate: {
        configurable: true,
        enumerable: true,
        get() {
          return formatJstDate(this.lastDateAt);
        },
        set(v) {},
      },
    });
  }

  /*****************************************************************************
   * CREATE (OVERRIDE)
   * - ドキュメントIDを `${siteId}_${employeeId}` で固定
   *****************************************************************************/
  async create(options = {}) {
    const docId = `${this.siteId}_${this.employeeId}`;
    return await super.create({ ...options, docId });
  }
}
