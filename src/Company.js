import FireModel from "air-firebase-v2";

export default class Company extends FireModel {
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    name: { type: String, label: "会社名", default: "", required: true },
    nameKana: {
      type: String,
      label: "会社名（カナ)",
      default: "",
      required: true,
    },
    zipcode: { type: String, label: "郵便番号", default: "", required: false },
    prefecture: {
      type: String,
      label: "都道府県",
      default: "",
      required: false,
    },
    city: { type: String, label: "市区町村", default: "", required: false },
    address: {
      type: String,
      label: "町域名・番地",
      default: "",
      required: false,
    },
    building: {
      type: String,
      label: "建物名・階数",
      default: "",
      required: false,
    },
    location: {
      type: Object,
      default: () => ({}),
      required: false,
      hidden: true,
    },
    tel: { type: String, label: "電話番号", default: "", required: false },
    fax: { type: String, label: "FAX番号", default: "", required: false },
  };
}
