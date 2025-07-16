// prettier-ignore
export const BILLING_UNIT_TYPE_DEFAULT = "PER_DAY";

export const BILLING_UNIT_TYPE = Object.freeze({
  PER_DAY: "日",
  PER_HOUR: "時間",
});

export const BILLING_UNIT_TYPE_ARRAY = Object.entries(BILLING_UNIT_TYPE).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
