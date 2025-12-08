/**
 * @file src/constants/certification-type.js
 * @description 警備業務資格の種別定義
 *
 * 警備業法に基づく4号区分：
 * - 1号警備業務：施設警備業務
 * - 2号警備業務：交通誘導警備業務、雑踏警備業務
 * - 3号警備業務：貴重品運搬警備業務、核燃料物質等危険物運搬警備業務
 * - 4号警備業務：身辺警備業務
 *
 * 実務上の考慮事項：
 * - 現場ごとに必要な資格タイプが異なる
 * - 1級保有者は2級の業務も対応可能（包括関係）
 * - ユーザビリティを考慮し、タイプ単位で管理
 */

// prettier-ignore
export const VALUES = Object.freeze({
  FACILITY: { title: "施設警備", value: "FACILITY" },           // 1号
  TRAFFIC: { title: "交通誘導警備", value: "TRAFFIC" },         // 2号
  CROWD: { title: "雑踏警備", value: "CROWD" },                 // 2号
  VALUABLES: { title: "貴重品運搬警備", value: "VALUABLES" },   // 3号
  BODYGUARD: { title: "身辺警備", value: "BODYGUARD" },         // 4号
  OTHER: { title: "その他", value: "OTHER" },
});

export const OPTIONS = [
  { title: VALUES.FACILITY.title, value: VALUES.FACILITY.value },
  { title: VALUES.TRAFFIC.title, value: VALUES.TRAFFIC.value },
  { title: VALUES.CROWD.title, value: VALUES.CROWD.value },
  { title: VALUES.VALUABLES.title, value: VALUES.VALUABLES.value },
  { title: VALUES.BODYGUARD.title, value: VALUES.BODYGUARD.value },
  { title: VALUES.OTHER.title, value: VALUES.OTHER.value },
];
