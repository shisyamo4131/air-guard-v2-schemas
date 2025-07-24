// prettier-ignore
export const EMPLOYMENT_STATUS_DEFAULT = "ACTIVE";
export const EMPLOYMENT_STATUS_ACTIVE = "ACTIVE";
export const EMPLOYMENT_STATUS_TERMINATED = "TERMINATED";

export const EMPLOYMENT_STATUS = Object.freeze({
  ACTIVE: "在職中",
  TERMINATED: "退職済み",
});

export const EMPLOYMENT_STATUS_ARRAY = Object.entries(EMPLOYMENT_STATUS).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
