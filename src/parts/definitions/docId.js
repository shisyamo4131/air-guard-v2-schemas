export const docId = {
  type: String,
  default: undefined,
  label: undefined,
  required: undefined,
  component: {
    attrs: {},
  },
};

export const customer = {
  type: Object,
  default: null,
  label: "取引先",
  required: undefined,
  component: {
    name: "air-autocomplete-api",
    attrs: {
      cacheItems: true,
      clearable: true,
      itemTitle: "customerName",
      itemValue: "docId",
      returnObject: true,
    },
  },
};
