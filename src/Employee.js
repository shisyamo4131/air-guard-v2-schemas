import FireModel from "air-firebase-v2";

export default class Employee extends FireModel {
  static collectionPath = "Employees";
  static classProps = {
    code: {
      type: String,
      default: "",
      label: "従業員コード",
      required: true,
    },
    lastName: {
      type: String,
      default: "",
      label: "姓",
      required: true,
    },
    firstName: {
      type: String,
      default: "",
      label: "名",
      required: true,
    },
  };
}
