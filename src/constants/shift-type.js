// prettier-ignore
export const SHIFT_TYPE_DEFAULT = "DAY";
export const SHIFT_TYPE_DAY = "DAY";
export const SHIFT_TYPE_NIGHT = "NIGHT";

export const SHIFT_TYPE = Object.freeze({
  DAY: { title: "日勤", color: "deep-orange" },
  NIGHT: { title: "夜勤", color: "indigo" },
});

export const SHIFT_TYPE_ARRAY = Object.entries(SHIFT_TYPE).map(
  ([key, value]) => {
    return { value: key, title: value.title, color: value.color };
  }
);

export const SHIFT_TYPE_VALIDATOR = (value) => {
  const arr = Object.keys(SHIFT_TYPE);
  return arr.includes(value);
};
