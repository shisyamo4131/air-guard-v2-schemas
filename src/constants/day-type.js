// prettier-ignore
export const DAY_TYPE = Object.freeze({
  weekday: '平日',
  saturday: '土曜',
  sunday: '日曜',
  holiday: '祝日',});

export const DAY_TYPE_ARRAY = Object.entries(DAY_TYPE).map(([key, value]) => {
  return { value: key, title: value };
});
