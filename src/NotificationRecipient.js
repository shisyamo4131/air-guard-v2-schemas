/*****************************************************************************
 * @file src/NotificationRecipient.js
 *****************************************************************************/
import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

/*****************************************************************************
 * @class NotificationRecipient
 * @extends BaseClass
 *
 * @description
 * 通知の受信者情報を管理するサブコレクションのスキーマ定義。
 * Companies/{companyId}/Notifications/{notificationId}/Recipients/{recipientId} に格納される。
 * 個別ユーザーごとの送信結果を記録する。
 *
 * @property {string} notificationId - 親 Notification ドキュメントのID
 * @property {string} userId - 受信者のユーザーID
 * @property {string} status - 送信ステータス（pending, sent, failed）
 * @property {Date} sentAt - 送信日時
 * @property {string} error - エラーメッセージ
 *
 * @note
 * - NotificationRecipient は BaseClass を継承（FireModel ではない）
 * - Notification ドキュメントのサブコレクションとして格納される
 * - Cloud Functions のみが作成・更新、アプリ側は読み取り専用
 * - status の値:
 *   - pending: 送信待ち
 *   - sent: 送信成功
 *   - failed: 送信失敗
 * - sentAt: 送信が完了した日時（成功・失敗問わず）
 * - error: 送信失敗時のエラーメッセージ
 *
 * @author shisyamo4131
 *****************************************************************************/
export default class NotificationRecipient extends BaseClass {
  static className = "通知受信者";
  static classProps = {
    notificationId: defField("oneLine", {
      label: "通知ID",
      default: "",
      required: true,
      hidden: true,
    }),
    userId: defField("oneLine", {
      label: "ユーザーID",
      default: "",
      required: true,
      hidden: true,
    }),
    status: defField("oneLine", {
      label: "送信ステータス",
      default: "pending",
      required: false,
      hidden: true,
    }),
    sentAt: defField("dateTimeAt", {
      label: "送信日時",
      required: false,
      hidden: true,
    }),
    error: defField("oneLine", {
      label: "エラーメッセージ",
      default: "",
      required: false,
      hidden: true,
    }),
  };
}
