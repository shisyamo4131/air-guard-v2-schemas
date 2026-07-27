/*****************************************************************************
 * @class SecurityReportIndex
 * @extends FireModel
 * @description Storage に保存されている警備日報の検索用インデックス
 * - ドキュメントIDには、対応する SiteOperationSchedule または
 *   OperationResult のドキュメントIDを使用します。
 * - reportCount が 0 の場合、ドキュメントは作成せず、既存ドキュメントは
 *   削除する運用を前提とします。
 *
 * @property {Date} dateAt - 稼働日
 * @property {number} reportCount - Storage に保存されている警備日報本体の件数
 *
 * @getter {boolean} hasSecurityReports - 警備日報が存在するかどうか
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";

export default class SecurityReportIndex extends FireModel {
  static className = "警備日報インデックス";
  static collectionPath = "SecurityReportIndexes";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    dateAt: defField("dateAt", {
      required: true,
      hidden: true,
    }),
    reportCount: defField("number", {
      required: true,
      default: 0,
      hidden: true,
      validator: (value) => {
        if (value < 1) {
          return VALIDATION_ERRORS.MIN_VALUE_ERROR(1);
        }
        return true;
      },
    }),
  };

  /**
   * Storage に警備日報本体が存在するかどうかを返します。
   * Firestore には保存されません。
   *
   * @returns {boolean}
   */
  get hasSecurityReports() {
    return this.reportCount > 0;
  }
}
