// prettier-ignore
export const CONTRACT_STATUS = Object.freeze({
  active: '契約中',
  terminated: '契約終了',
});

export const CONTRACT_STATUS_ARRAY = Object.entries(CONTRACT_STATUS).map(
  ([key, value]) => {
    return { value: key, title: value };
  }
);
