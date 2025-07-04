// prettier-ignore
export const SHIFT_TYPE = Object.freeze({
  day: '日勤',
  night: '夜勤',
});

export const SHIFT_TYPE_ARRAY = Object.entries(SHIFT_TYPE).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
