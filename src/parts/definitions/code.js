export const code = {
  type: String,
  default: "",
  label: "コード",
  length: 10,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      counter: true,
      inputType: "alphanumeric",
    },
  },
};
