import FireModel from "air-firebase-v2";
import { PREFECTURES_ARRAY } from "./constants/prefectures";

export default class Company extends FireModel {
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    name: {
      type: String,
      label: "会社名",
      default: "",
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
    nameKana: {
      type: String,
      label: "会社名（カナ)",
      default: "",
      required: true,
      component: {
        attrs: {
          counter: true,
          inputType: "katakana",
          rules: [
            (v) => !v || v.length <= 40 || "40文字以内で入力してください。",
          ],
        },
      },
    },
    zipcode: {
      type: String,
      label: "郵便番号",
      default: "",
      required: false,
      component: {
        attrs: {
          inputType: "zipcode",
        },
      },
    },
    prefecture: {
      type: Object,
      label: "都道府県",
      default: null,
      required: false,
      component: {
        name: "air-select",
        attrs: {
          items: PREFECTURES_ARRAY,
          returnObject: true,
        },
      },
    },
    city: {
      type: String,
      label: "市区町村",
      default: "",
      required: false,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 10 || "10文字以内で入力してください。",
          ],
        },
      },
    },
    address: {
      type: String,
      label: "町域名・番地",
      default: "",
      required: false,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 15 || "15文字以内で入力してください。",
          ],
        },
      },
    },
    building: {
      type: String,
      label: "建物名・階数",
      default: "",
      required: false,
      component: {
        attrs: {
          counter: true,
          rules: [
            (v) => !v || v.length <= 30 || "30文字以内で入力してください。",
          ],
        },
      },
    },
    location: {
      type: Object,
      default: null,
      required: false,
      hidden: true,
    },
    tel: {
      type: String,
      label: "電話番号",
      default: "",
      required: false,
      component: {
        attrs: {
          inputType: "tel",
        },
      },
    },
    fax: {
      type: String,
      label: "FAX番号",
      default: "",
      required: false,
      component: {
        attrs: {
          inputType: "tel",
        },
      },
    },
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: {
        configurable: true,
        enumerable: true,
        get() {
          return `${this.prefecture?.title || ""}${this.city}${this.address}`;
        },
        set(v) {
          // read-only
        },
      },
    });
  }
}
