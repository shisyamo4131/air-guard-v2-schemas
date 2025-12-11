// prettier-ignore

export const VALUES = Object.freeze({
  0: { value: 0, title: "当月" },
  1: { value: 1, title: "翌月" },
  2: { value: 2, title: "翌々月" },
  3: { value: 3, title: "3ヶ月後" },
  4: { value: 4, title: "4ヶ月後" },
  5: { value: 5, title: "5ヶ月後" },
  6: { value: 6, title: "6ヶ月後" },
});

export const OPTIONS = [
  { title: VALUES[0].title, value: VALUES[0].value },
  { title: VALUES[1].title, value: VALUES[1].value },
  { title: VALUES[2].title, value: VALUES[2].value },
  { title: VALUES[3].title, value: VALUES[3].value },
  { title: VALUES[4].title, value: VALUES[4].value },
  { title: VALUES[5].title, value: VALUES[5].value },
  { title: VALUES[6].title, value: VALUES[6].value },
];
