import FireModel from "air-firebase-v2";

export default class User extends FireModel {
  static collectionPath = "Users";
  static classProps = {
    /** Authentication's uid */
    uid: {
      type: String,
      default: "",
      label: "UID",
      hidden: true,
      required: false,
    },

    /** email */
    email: { type: String, default: "", label: "email", required: true },

    /** display name */
    displayName: {
      type: String,
      default: "",
      label: "表示名",
      required: false,
    },

    /**
     * employee-id
     * - Not required, as there may be users that do not fall under the employee category.
     * - 従業員には該当しないユーザーが存在する可能性もあるため、必須にはしない。
     */
    employeeId: {
      type: String,
      default: "",
      label: "従業員ID",
      required: false,
    },

    /**
     * アプリの仕様権限
     */
    roles: { type: Array, default: () => [], label: "権限", required: false },
  };
}
