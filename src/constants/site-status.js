// prettier-ignore
export const SITE_STATUS_DEFAULT = "ACTIVE";
export const SITE_STATUS_ACTIVE = "ACTIVE";
export const SITE_STATUS_TERMINATED = "TERMINATED";

export const SITE_STATUS = Object.freeze({
  ACTIVE: "稼働中",
  TERMINATED: "終了",
});

export const SITE_STATUS_ARRAY = Object.entries(SITE_STATUS).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
