/*****************************************************************************
 * @file src/FcmToken.js
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

/*****************************************************************************
 * @class FcmToken
 * @extends FireModel
 *
 * Firebase Cloud Messaging (FCM) のトークンをグローバル管理するためのコレクション
 *
 * - usePrefix: false でグローバルコレクション（Companies のサブコレクションではない）
 * - ドキュメントID: FCMトークンそのもの
 * - 同じトークンは同じデバイスを指すため、最後にログインしたユーザーの情報で上書きされる
 *
 * @property {string} token - FCMトークン（ドキュメントIDと同じ）
 * @property {string} uid - ユーザーID（Firebase Authentication UID）
 * @property {string} employeeId - 従業員ID
 * @property {string} companyId - 会社ID
 * @property {Date} updatedAt - 最終更新日時
 *****************************************************************************/
export default class FcmToken extends FireModel {
  static className = "FCMトークン";
  static collectionPath = "FcmTokens";
  static usePrefix = false; // グローバルコレクション

  static classProps = {
    token: defField("token", {
      required: true,
      hidden: true,
    }),
    uid: defField("uid", {
      required: true,
      hidden: true,
    }),
    companyId: defField("companyId", {
      required: true,
      hidden: true,
    }),
    updatedAt: defField("dateTimeAt", {
      label: "更新日時",
      default: () => new Date(),
      hidden: true,
    }),
  };

  /**
   * fcmToken ドキュメントはドキュメントIDにトークンそのものが使われることを前提としているため、
   * create メソッドをオーバーライドして、updateOptions に docId が含まれていることを確認する。
   * @param {*} updateOptions
   * @returns {Promise<DocumentReference>}
   */
  async create(updateOptions = {}) {
    const { docId } = updateOptions;
    if (!docId) {
      throw new Error(
        "FCMトークンのドキュメントIDはトークンそのものを指定してください",
      );
    }
    return await super.create(updateOptions);
  }

  /**
   * FCMトークンは更新できないため、常にエラーを投げる
   * @param {*} updateOptions
   */
  async update(updateOptions = {}) {
    throw new Error(
      "FCMトークンは更新できません。新しいトークンでドキュメントを作成してください。",
    );
  }
}
