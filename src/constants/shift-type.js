// prettier-ignore
export const VALUES = Object.freeze({
  DAY: { value: "DAY", title: "日勤", color: "deep-orange" },
  NIGHT: { value: "NIGHT", title: "夜勤", color: "indigo" },
});

export const OPTIONS = [
  { title: VALUES.DAY.title, value: VALUES.DAY.value },
  { title: VALUES.NIGHT.title, value: VALUES.NIGHT.value },
];

export const VALIDATOR = (value) => {
  return Object.keys(VALUES).includes(value);
};
