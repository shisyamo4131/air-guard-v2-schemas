// prettier-ignore
export const CONTRACT_STATUS_DEFAULT = "ACTIVE";
export const CONTRACT_STATUS_ACTIVE = "ACTIVE";
export const CONTRACT_STATUS_TERMINATED = "TERMINATED";

export const CONTRACT_STATUS = Object.freeze({
  ACTIVE: "契約中",
  TERMINATED: "契約終了",
});

export const CONTRACT_STATUS_ARRAY = Object.entries(CONTRACT_STATUS).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
