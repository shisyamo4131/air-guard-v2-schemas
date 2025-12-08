/**
 * Certification Model
 * @version 1.0.0
 * @author shisyamo4131
 * @description 警備業務資格モデル
 */
import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  name: defField("name", { label: "資格名", required: true }),
  type: defField("certificationType", { required: true }),
  issuedBy: defField("name", { label: "発行元" }),
  issueDateAt: defField("dateAt", { label: "取得日" }),
  expirationDateAt: defField("dateAt", { label: "有効期限" }),
  serialNumber: defField("oneLine", { label: "証明書番号" }),
};

/**
 * @prop {string} name - 資格名
 * @prop {string} type - 資格種別 (CERTIFICATION_TYPE_VALUES)
 * @prop {string} issuedBy - 発行元
 * @prop {Date} issueDateAt - 取得日
 * @prop {Date} expirationDateAt - 有効期限
 * @prop {string} serialNumber - 証明書番号
 */
export default class Certification extends BaseClass {
  static className = "資格";
  static classProps = classProps;
}
