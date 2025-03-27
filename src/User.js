import FireModel from "air-firebase-v2";

export default class User extends FireModel {
  static collectionPath = "Users";
  static classProps = {
    /** document-id */
    docId: { type: String, default: false, required: false },

    /** Authentication's uid */
    uid: { type: String, default: "", required: false },

    /** email */
    email: { type: String, default: "", required: true },

    /** display name */
    displayName: { type: String, default: "", required: false },

    /**
     * employee-id
     * - Not required, as there may be users that do not fall under the employee category.
     * - 従業員には該当しないユーザーが存在する可能性もあるため、必須にはしない。
     */
    employeeId: { type: String, default: "", required: false },

    /**
     * アプリの仕様権限
     */
    roles: { type: Array, default: () => [], required: false },
  };
}
