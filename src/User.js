import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions";

export default class User extends FireModel {
  static collectionPath = "Users";
  static classProps = {
    email: defField("email", { required: true }),
    displayName: defField("displayName", { required: true }),
    /**
     * employee-id
     * - 従業員には該当しないユーザーが存在する可能性もあるため、必須にはしない。
     */
    employeeId: defField("docId", { label: "従業員ID", hidden: true }),
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
}
