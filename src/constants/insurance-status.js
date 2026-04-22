/*****************************************************************************
 * @file ./src/constants/insurance-status.js
 * @description 保険状態定義
 *****************************************************************************/
export const VALUES = Object.freeze({
  NOT_ENROLLED: { value: "NOT_ENROLLED", title: "未加入" },
  ENROLLED: { value: "ENROLLED", title: "加入" },
  EXEMPT: { value: "EXEMPT", title: "適用除外" },
});

export const OPTIONS = [
  { title: VALUES.NOT_ENROLLED.title, value: VALUES.NOT_ENROLLED.value },
  { title: VALUES.ENROLLED.title, value: VALUES.ENROLLED.value },
  { title: VALUES.EXEMPT.title, value: VALUES.EXEMPT.value },
];
