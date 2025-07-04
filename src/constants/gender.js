// prettier-ignore
export const GENDER = Object.freeze({
  male: '男性',
  female: '女性',
});

export const GENDER_ARRAY = Object.entries(GENDER).map(([key, value]) => {
  return { value: key, title: value };
});
