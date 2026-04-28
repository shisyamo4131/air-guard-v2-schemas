/*****************************************************************************
 * @file src/Notification.js
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

/*****************************************************************************
 * @class Notification
 * @extends FireModel
 *
 * @description
 * 通知ドキュメントのスキーマ定義。
 * Companies/{companyId}/Notifications/{notificationId} に格納される。
 * 通知の送信履歴と結果を管理するための親ドキュメント。
 *
 * @property {string} title - 通知タイトル
 * @property {string} body - 通知本文
 * @property {string} imageUrl - 画像URL（任意）
 * @property {Object} data - カスタムデータ（任意）
 * @property {Array<string>} recipientUserIds - 送信先ユーザーIDの配列
 * @property {number} totalCount - 送信対象数
 * @property {number} successCount - 送信成功数
 * @property {number} failureCount - 送信失敗数
 * @property {string} status - 送信ステータス（pending, processing, sent, failed, completed）
 * @property {string} sourceType - 送信元タイプ（manual, arrangement, billing など）
 * @property {string} sourceId - 送信元ドキュメントID
 * @property {string} createdBy - 作成者UID
 *
 * @note
 * - status の値:
 *   - pending: 送信待ち
 *   - processing: 送信中
 *   - sent: 送信成功
 *   - failed: 送信失敗
 *   - completed: 全送信完了
 * - sourceType の例:
 *   - manual: 手動送信（UI から）
 *   - arrangement: 配置通知
 *   - billing: 請求通知
 *
 * @author shisyamo4131
 *****************************************************************************/
export default class Notification extends FireModel {
  static className = "通知";
  static collectionPath = "Notifications";
  static classProps = {
    title: defField("oneLine", { label: "通知タイトル", required: true }),
    body: defField("multipleLine", { label: "通知本文", required: true }),
    imageUrl: defField("oneLine", { label: "画像URL", required: false }),
    data: defField("object", { label: "カスタムデータ", required: false }),
    recipientUserIds: defField("recipientUserIds", { required: false }),
    totalCount: defField("number", {
      label: "送信対象数",
      default: 0,
      required: false,
      hidden: true,
    }),
    successCount: defField("number", {
      label: "送信成功数",
      default: 0,
      required: false,
      hidden: true,
    }),
    failureCount: defField("number", {
      label: "送信失敗数",
      default: 0,
      required: false,
      hidden: true,
    }),
    status: defField("oneLine", {
      label: "送信ステータス",
      default: "pending",
      required: false,
      hidden: true,
    }),
    sourceType: defField("oneLine", {
      label: "送信元タイプ",
      default: "",
      required: false,
      hidden: true,
    }),
    sourceId: defField("oneLine", {
      label: "送信元ID",
      default: "",
      required: false,
      hidden: true,
    }),
    createdBy: defField("oneLine", {
      label: "作成者",
      default: "",
      required: false,
      hidden: true,
    }),
  };
}
