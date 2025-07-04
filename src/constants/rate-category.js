// prettier-ignore
export const RATE_CATEGORY = Object.freeze({
  base: '基本',
  qualified: '資格',
});

export const RATE_CATEGORY_ARRAY = Object.entries(RATE_CATEGORY).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
