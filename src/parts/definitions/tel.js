export const tel = {
  type: String,
  default: "",
  label: "電話番号",
  length: undefined,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      counter: true,
      inputType: "tel",
    },
  },
};

export const fax = {
  type: String,
  default: "",
  label: "FAX番号",
  length: undefined,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      counter: true,
      inputType: "tel",
    },
  },
};
