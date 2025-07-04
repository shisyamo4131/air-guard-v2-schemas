// prettier-ignore
export const EMPLOYMENT_STATUS = Object.freeze({
  active: '在職中',
  terminated: '退職済み',
});

export const EMPLOYMENT_STATUS_ARRAY = Object.entries(EMPLOYMENT_STATUS).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
