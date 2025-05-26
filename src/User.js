import FireModel from "air-firebase-v2";

export default class User extends FireModel {
  static collectionPath = "Users";
  static classProps = {
    /** email */
    email: {
      type: String,
      default: "",
      label: "email",
      required: true,
      component: {
        attrs: {
          inputType: "email",
        },
      },
    },

    /** display name */
    displayName: {
      type: String,
      default: "",
      label: "表示名",
      required: false,
      component: {
        attrs: {
          counter: true,
          maxlength: 6,
          rules: [
            (v) => !v || v.length <= 6 || "30文字以内で入力してください。",
          ],
        },
      },
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
      hidden: true, // 従業員管理ができるまでは非表示にしておく（2025-05-21）
      required: false,
    },

    /**
     * アプリの仕様権限
     */
    roles: {
      type: Array,
      default: () => [],
      label: "権限",
      required: false,
      hidden: true,
    },

    disabled: {
      type: Boolean,
      default: false,
      label: "状態",
      required: false,
      hidden: true,
    },
  };
}
