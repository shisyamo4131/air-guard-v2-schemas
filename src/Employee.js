import FireModel from "air-firebase-v2";

export default class Employee extends FireModel {
  static collectionPath = "Employees";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: {
      type: String,
      default: "",
      label: "従業員コード",
      required: false,
      component: {
        attrs: {
          counter: true,
          inputType: "alphanumeric",
          rules: [
            (v) => !v || v.length <= 10 || "10文字以内で入力してください。",
          ],
        },
      },
    },
    lastName: {
      type: String,
      default: "",
      label: "姓",
      required: true,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 20 || "20文字以内で入力してください。",
          ],
        },
      },
    },
    firstName: {
      type: String,
      default: "",
      label: "名",
      required: true,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 20 || "20文字以内で入力してください。",
          ],
        },
      },
    },
    isForeigner: {
      type: Boolean,
      default: false,
      label: "外国籍",
      required: false,
      component: {
        name: "air-checkbox",
      },
    },
    foreignName: {
      type: String,
      default: "",
      label: "本名",
      required: false,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 50 || "50文字以内で入力してください。",
          ],
        },
      },
    },
    nationality: {
      type: String,
      default: "",
      label: "国籍",
      required: false,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 20 || "20文字以内で入力してください。",
          ],
        },
      },
    },
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullName: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.lastName || !this.firstName) return "";
          return `${this.lastName} ${this.firstName}`;
        },
        set(v) {
          // read-only
        },
      },
    });
  }
}
