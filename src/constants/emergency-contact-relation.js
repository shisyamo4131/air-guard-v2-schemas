// prettier-ignore
export const VALUES = Object.freeze({
  PARENT: { title: "親", value: "PARENT" },
  SPOUSE: { title: "配偶者", value: "SPOUSE" },
  CHILD: { title: "子", value: "CHILD" },
  SIBLING: { title: "兄弟姉妹", value: "SIBLING" },
  OTHER: { title: "その他", value: "OTHER" },
});

export const OPTIONS = [
  { title: VALUES.PARENT.title, value: VALUES.PARENT.value },
  { title: VALUES.SPOUSE.title, value: VALUES.SPOUSE.value },
  { title: VALUES.CHILD.title, value: VALUES.CHILD.value },
  { title: VALUES.SIBLING.title, value: VALUES.SIBLING.value },
  { title: VALUES.OTHER.title, value: VALUES.OTHER.value },
];
