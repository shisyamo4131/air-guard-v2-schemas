// prettier-ignore
export const VALUES = Object.freeze({
  UNSET: { title: "未設定", value: "UNSET" },
  FACILITY: { title: "施設警備", value: "FACILITY" },
  CROWD: { title: "雑踏警備", value: "CROWD" },
  TRAFFIC: { title: "交通誘導", value: "TRAFFIC" },
  OTHER: { title: "その他", value: "OTHER" },
});

export const OPTIONS = [
  { title: VALUES.UNSET.title, value: VALUES.UNSET.value },
  { title: VALUES.FACILITY.title, value: VALUES.FACILITY.value },
  { title: VALUES.CROWD.title, value: VALUES.CROWD.value },
  { title: VALUES.TRAFFIC.title, value: VALUES.TRAFFIC.value },
  { title: VALUES.OTHER.title, value: VALUES.OTHER.value },
];
