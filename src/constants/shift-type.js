// prettier-ignore
export const SHIFT_TYPE_DEFAULT = "DAY";

export const SHIFT_TYPE = Object.freeze({
  DAY: "日勤",
  NIGHT: "夜勤",
});

export const SHIFT_TYPE_ARRAY = Object.entries(SHIFT_TYPE).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
