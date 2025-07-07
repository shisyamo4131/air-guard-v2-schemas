import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class User extends FireModel {
  static className = "ユーザー";
  static collectionPath = "Users";
  static classProps = {
    email: defField("email", { required: true }),
    displayName: defField("displayName", { required: true }),
    /**
     * employee-id
     * - 従業員には該当しないユーザーが存在する可能性もあるため、必須にはしない。
     */
    employeeId: defField("oneLine", { label: "従業員ID", hidden: true }),
    roles: {
      type: Array,
      default: () => [],
      label: "権限",
      required: false,
      hidden: true,
    },
    disabled: defField("check", {
      label: "状態",
      default: false,
      required: false,
    }),
  };

  static headers = [
    { title: "email", key: "email" },
    { title: "表示名", key: "displayName" },
    { title: "管理者", key: "roles" },
  ];
}
