/**
 * @file arrangement-notification-status.js
 */

export const VALUES = Object.freeze({
  ARRANGED: {
    value: "ARRANGED",
    title: "配置済",
    order: 1,
    color: "#F57C00", // 🟠 配置通知済み（待機中）
  },

  CONFIRMED: {
    value: "CONFIRMED",
    title: "確認済",
    order: 2,
    color: "#2196F3", // 🔵 作業員が了承済み（準備中）
  },

  ARRIVED: {
    value: "ARRIVED",
    title: "上番済",
    order: 3,
    color: "#4CAF50", // 🟢 現場到着、作業開始可能
  },

  LEAVED: {
    value: "LEAVED",
    title: "下番済",
    order: 4,
    color: "#607D8B", // ⚫ 作業完了、離脱済み
  },

  /**
   * 現着中止は作業員ごとのステータスではなく、現場稼働予定や稼働実績のステータスであるため
   * ここからは削除。
   */
  // CANCELED: {
  //   value: "CANCELED",
  //   title: "現着中止",
  //   order: 5,
  //   color: "#F44336", // 🔴 異常状態、作業中止
  // },
});

export const OPTIONS = [
  {
    title: VALUES.ARRANGED.title,
    value: VALUES.ARRANGED.value,
    color: VALUES.ARRANGED.color,
  },
  {
    title: VALUES.CONFIRMED.title,
    value: VALUES.CONFIRMED.value,
    color: VALUES.CONFIRMED.color,
  },
  {
    title: VALUES.ARRIVED.title,
    value: VALUES.ARRIVED.value,
    color: VALUES.ARRIVED.color,
  },
  {
    title: VALUES.LEAVED.title,
    value: VALUES.LEAVED.value,
    color: VALUES.LEAVED.color,
  },
  // { title: VALUES.CANCELED.title, value: VALUES.CANCELED.value },
];
