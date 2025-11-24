/**
 * User Model
 * @version 1.1.0
 * @author shisyamo4131
 * @update 2025-11-23 Set `usePrefix` to false and added `companyId` property.
 *
 * @prop {string} email - User's email address.
 * @prop {string} displayName - User's display name.
 * @prop {string} [employeeId] - Employee ID (not required as some users may not be employees).
 * @prop {Array<string>} roles - User roles/permissions.
 * @prop {boolean} disabled - Indicates if the user is disabled.
 * @prop {string} companyId - ID of the associated company.
 * @prop {boolean} isTemporary - Indicates if the user is temporary.
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  email: defField("email", { required: true }),
  displayName: defField("displayName", { required: true }),
  employeeId: defField("oneLine", { label: "従業員ID", hidden: true }),
  roles: {
    type: Array,
    default: () => [],
    label: "権限",
    required: false,
    hidden: true,
  },
  disabled: defField("check", {
    label: "使用不可",
    default: false,
    required: false,
    hidden: true,
  }),
  companyId: defField("oneLine", { hidden: true, required: true }),
  isTemporary: defField("check", { hidden: true, default: true }),
};

export default class User extends FireModel {
  static className = "ユーザー";
  static collectionPath = "Users";
  static classProps = classProps;

  static headers = [
    { title: "email", key: "email" },
    { title: "表示名", key: "displayName" },
    { title: "管理者", key: "roles" },
  ];
}
