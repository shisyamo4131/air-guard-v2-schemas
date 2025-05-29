import { PREFECTURES_ARRAY } from "../../constants/index.js";

export const zipcode = {
  type: String,
  default: "",
  label: "郵便番号",
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      counter: true,
      inputType: "zipcode",
    },
  },
};

export const prefCode = {
  type: String,
  default: "",
  label: "都道府県",
  length: 2,
  required: undefined,
  component: {
    name: "air-select",
    attrs: {
      items: PREFECTURES_ARRAY,
    },
  },
};

export const city = {
  type: String,
  default: "",
  label: "市区町村",
  length: 10,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const address = {
  type: String,
  default: "",
  label: "町域名・番地",
  length: 15,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const building = {
  type: String,
  default: "",
  label: "建物名・階数",
  length: 30,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const location = {
  type: Object,
  default: null,
  label: undefined,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const prefecture = () => {
  return {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.prefCode) return "";
      const result = PREFECTURES_ARRAY.find(
        ({ value }) => value === this.prefCode
      );
      return result?.title || "";
    },
    set(v) {
      // read-only
    },
  };
};

export const fullAddress = () => {
  return {
    configurable: true,
    enumerable: true,
    get() {
      return `${this.prefecture}${this.city}${this.address}`;
    },
    set(v) {
      // read-only
    },
  };
};
