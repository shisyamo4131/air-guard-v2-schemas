export const docId = {
  type: String,
  default: undefined,
  label: undefined,
  required: undefined,
  component: {
    attrs: {},
  },
};

export const customerId = {
  type: String,
  default: undefined,
  label: "取引先",
  required: undefined,
  component: {
    name: "air-autocomplete-api",
    attrs: {
      cacheItems: true,
      clearable: true,
      itemTitle: "customerName",
      itemValue: "docId",
    },
  },
};
