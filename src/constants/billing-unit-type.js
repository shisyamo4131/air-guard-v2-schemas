// prettier-ignore
export const BILLING_UNIT_TYPE = Object.freeze({
  day: '日',
  time: '時間',
});

export const BILLING_UNIT_TYPE_ARRAY = Object.entries(BILLING_UNIT_TYPE).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
