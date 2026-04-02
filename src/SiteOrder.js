/**
 * @file ./src/SiteOrder.js
 * @description 現場配置順序を表すクラス
 * - 現場と勤務区分の組み合わせの順序を管理するためのクラスです。
 * @author shisyamo4131
 *
 * @class
 * @extends BaseClass
 *
 * @property {string} siteId - The unique identifier for the site. Required.
 * @property {string} shiftType - The type of shift associated with the site. Required.
 *
 * @getter {string} key - `siteId` と `shiftType` をアンダースコアで結合した文字列を返します。
 * @setter key - `siteId` と `shiftType` をアンダースコアで結合した文字列を受け取り、両方の値を分割して `siteId` と `shiftType` に設定します。
 * - 受け取る値は文字列である必要があり、フォーマットは "siteId-shiftType" でなければなりません。
 * - フォーマットが正しくない場合や、値が文字列でない場合は、プロパティの値は変更されません。
 */
import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

/*****************************************************************************
 * SiteOrder
 *****************************************************************************/
export default class SiteOrder extends BaseClass {
  static className = "現場配置順序";
  static classProps = {
    siteId: defField("oneLine", { required: true }),
    shiftType: defField("shiftType", { required: true }),
  };

  /**
   * `siteId` と `shiftType` を結合したキーを返すゲッター
   * @returns {string} The key in the format "siteId_shiftType".
   */
  get key() {
    return `${this.siteId}_${this.shiftType}`;
  }

  /**
   * `siteId` と `shiftType` を結合したキーを受け取り、両方の値を分割して `siteId` と `shiftType` に設定するセッター
   * @param {string} value - The key string in the format "siteId_shiftType".
   */
  set key(value) {
    if (typeof value !== "string") return;
    const [siteId, shiftType] = value.split("_");
    if (siteId && shiftType) {
      this.siteId = siteId;
      this.shiftType = shiftType;
    }
  }
}
