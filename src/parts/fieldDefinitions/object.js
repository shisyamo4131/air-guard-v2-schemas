import { generalDefinitions } from "./defaultDefinition.js";

/**
 * OBJECT型のフィールド定義
 */
export const objectFields = {
  object: generalDefinitions.object,
  customer: {
    ...generalDefinitions.object,
    label: "取引先",
    component: {
      name: "air-autocomplete-api",
      attrs: {
        cacheItems: true,
        clearable: true,
        itemTitle: "name",
        itemValue: "docId",
        returnObject: true,
      },
    },
  },
  employmentInsurance: {
    ...generalDefinitions.object,
    label: "雇用保険",
  },
  healthInsurance: {
    ...generalDefinitions.object,
    label: "健康保険",
  },
  pensionInsurance: {
    ...generalDefinitions.object,
    label: "厚生年金保険",
  },
  location: {
    ...generalDefinitions.object,
    hidden: true,
  },
};
