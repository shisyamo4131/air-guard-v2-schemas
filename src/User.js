/*****************************************************************************
 * @file src/User.js
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { TAG_SIZE_VALUES, TAG_SIZE_OPTIONS } from "./constants/index.js";

/*****************************************************************************
 * @class User
 * @extends FireModel
 *
 * @property {string} email - メールアドレス
 * @property {string} displayName - 表示名
 * @property {string} [employeeId] - 従業員ID（非従業員を許容するために必須とはしない）
 * @property {Array<string>} roles - アプリケーション利用権限
 * @property {boolean} disabled - 有効/無効
 * @property {string} companyId - 会社ID
 * @property {boolean} isAdmin - 管理者であるかどうか
 * @property {boolean} isTemporary - 仮登録状態であるかどうか
 * @property {string} tagSize - 配置管理機能におけるタグコンポーネントの表示サイズ
 *****************************************************************************/
export default class User extends FireModel {
  static className = "ユーザー";
  static collectionPath = "Users";
  static classProps = {
    email: defField("email", { required: true }),
    displayName: defField("displayName", { required: true }),
    employeeId: defField("oneLine", { label: "従業員ID", hidden: true }),
    roles: defField("roles"),
    disabled: defField("disabled", { hidden: true }),
    companyId: defField("companyId", { hidden: true, required: true }),
    isAdmin: defField("isAdmin", { hidden: true }),
    isTemporary: defField("isTemporary", { hidden: true, default: true }),
    tagSize: defField("tagSize", { required: true }),
  };

  /**
   * Deletes the user document.
   * - Prevents deletion if the user is an administrator.
   * @param {Object} updateOptions - Parameters for deletion.
   * @param {Object|null} [updateOptions.transaction=null] - Firestore transaction object (optional).
   * @param {function|null} [updateOptions.callback=null] - Callback executed after deletion (optional).
   * @param {string|null} [updateOptions.prefix=null] - Optional Firestore path prefix (for server side adapter).
   * @returns {Promise<void>} Resolves when deletion is complete.
   * @throws {Error} If deletion is attempted on an administrator account.
   * @throws {Error} If `docId` is missing, `updateOptions.callback` is not a function, or document is undeletable.
   */
  async delete(updateOptions = {}) {
    // Prevent deletion of administrator accounts
    if (this.isAdmin) {
      throw new Error("Administrator accounts cannot be deleted.");
    }
    await super.delete(updateOptions);
  }

  /**
   * Update document properties based on provided data.
   * @param {Object} updateData - Key-value pairs of properties to update.
   * @param {Object} updateOptions - Parameters for update operation.
   * @param {Object|null} [updateOptions.transaction=null] - Firestore transaction object.
   * @param {function|null} [updateOptions.callback=null] - Callback executed after update.
   * @param {string|null} [updateOptions.prefix=null] - Optional Firestore path prefix.
   * @returns {Promise<DocumentReference>} Reference to the updated document.
   * @throws {Error} If `updateData` is not a valid object.
   * @throws {Error} If `docId` is not set, or if `updateOptions.callback` is not a function.
   *
   * Note: このメソッドは複数のプロパティを一括更新するためのヘルパーメソッド。BaseClass に移設しても良いかもしれない。
   * なお、`useAuthStore` で使用中のようだ。
   */
  async updateProperties(updateData = null, updateOptions = {}) {
    if (!updateData || typeof updateData !== "object") {
      throw new Error("updateData must be a valid object.");
    }
    Object.entries(updateData).forEach(([key, value]) => {
      if (this[key] !== undefined) this[key] = value;
    });
    await this.update(updateOptions);
  }
}
