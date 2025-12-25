/**
 * User Model
 * @version 1.1.0
 * @author shisyamo4131
 * @update 2025-12-25 Added `tagSize` property.
 * @update 2025-11-24 Added `companyId`, `isAdmin`, `isTemporary` property.
 *                    Changed to prevent deletion of admin users.
 *
 * @prop {string} email - User's email address.
 * @prop {string} displayName - User's display name.
 * @prop {string} [employeeId] - Employee ID (not required as some users may not be employees).
 * @prop {Array<string>} roles - User roles/permissions.
 * @prop {boolean} disabled - Indicates if the user is disabled.
 * @prop {string} companyId - ID of the associated company.
 * @prop {boolean} isAdmin - Indicates if the user is an administrator.
 * @prop {boolean} isTemporary - Indicates if the user is temporary.
 * @prop {string} tagSize - Size of the tag associated with the user.
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { TAG_SIZE_VALUES, TAG_SIZE_OPTIONS } from "./constants/index.js";

const classProps = {
  email: defField("email", { required: true }),
  displayName: defField("displayName", { required: true }),
  employeeId: defField("oneLine", { label: "従業員ID", hidden: true }),
  roles: {
    type: Array,
    default: () => [],
    label: "権限",
    required: false,
    hidden: false,
  },
  disabled: defField("check", {
    label: "使用不可",
    default: false,
    required: false,
    hidden: true,
  }),
  companyId: defField("oneLine", { hidden: true, required: true }),
  isAdmin: defField("check", { hidden: true, default: false }),
  isTemporary: defField("check", { hidden: true, default: true }),
  tagSize: defField("select", {
    label: "タグサイズ",
    default: TAG_SIZE_VALUES.MEDIUM.value,
    options: TAG_SIZE_OPTIONS,
  }),
};

export default class User extends FireModel {
  static className = "ユーザー";
  static collectionPath = "Users";
  static classProps = classProps;

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
