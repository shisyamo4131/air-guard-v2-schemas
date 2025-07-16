// prettier-ignore
export const GENDER_DEFAULT = "MALE";

export const GENDER = Object.freeze({
  MALE: "男性",
  FEMALE: "女性",
});

export const GENDER_ARRAY = Object.entries(GENDER).map(([key, value]) => {
  return { value: key, title: value };
});
