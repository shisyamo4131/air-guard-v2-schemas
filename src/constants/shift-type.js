/*****************************************************************************
 * 勤務区分定数定義
 *****************************************************************************/
// prettier-ignore
export const VALUES = Object.freeze({
  DAY: { value: "DAY", title: "日勤", color: "deep-orange", order: 0 },
  NIGHT: { value: "NIGHT", title: "夜勤", color: "indigo", order: 1 },
});

export const OPTIONS = [
  { title: VALUES.DAY.title, value: VALUES.DAY.value },
  { title: VALUES.NIGHT.title, value: VALUES.NIGHT.value },
];

export const VALIDATOR = (value) => {
  return Object.keys(VALUES).includes(value);
};
