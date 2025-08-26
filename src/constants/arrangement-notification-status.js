/**
 * @file arrangement-notification-status.js
 */

const DEFINITIONS = Object.freeze({
  TEMPORARY: { key: "TEMPORARY", label: "仮配置", order: 0, color: undefined },
  ARRANGED: {
    key: "ARRANGED",
    label: "配置済",
    order: 1,
    color: "#F57C00", // 🟠 配置通知済み（待機中）
  },

  CONFIRMED: {
    key: "CONFIRMED",
    label: "確認済",
    order: 2,
    color: "#2196F3", // 🔵 作業員が了承済み（準備中）
  },

  ARRIVED: {
    key: "ARRIVED",
    label: "上番済",
    order: 3,
    color: "#4CAF50", // 🟢 現場到着、作業開始可能
  },

  LEAVED: {
    key: "LEAVED",
    label: "下番済",
    order: 4,
    color: "#607D8B", // ⚫ 作業完了、離脱済み
  },

  /**
   * 現着中止は作業員ごとのステータスではなく、現場稼働予定や稼働実績のステータスであるため
   * ここからは削除。
   */
  // CANCELED: {
  //   key: "CANCELED",
  //   label: "現着中止",
  //   order: 5,
  //   color: "#F44336", // 🔴 異常状態、作業中止
  // },
});

export const ARRANGEMENT_NOTIFICATION_STATUS_DEFAULT = DEFINITIONS.ARRANGED.key;

export const ARRANGEMENT_NOTIFICATION_STATUS_TEMPORARY =
  DEFINITIONS.TEMPORARY.key;
export const ARRANGEMENT_NOTIFICATION_STATUS_ARRANGED =
  DEFINITIONS.ARRANGED.key;
export const ARRANGEMENT_NOTIFICATION_STATUS_CONFIRMED =
  DEFINITIONS.CONFIRMED.key;
export const ARRANGEMENT_NOTIFICATION_STATUS_ARRIVED = DEFINITIONS.ARRIVED.key;
export const ARRANGEMENT_NOTIFICATION_STATUS_LEAVED = DEFINITIONS.LEAVED.key;
// export const ARRANGEMENT_NOTIFICATION_STATUS_CANCELED =
//   DEFINITIONS.CANCELED.key;

/** key-label map */
export const ARRANGEMENT_NOTIFICATION_STATUS = Object.freeze(
  Object.fromEntries(
    Object.values(DEFINITIONS).map((def) => [
      def.key,
      { ...def, title: def.label },
    ])
  )
);

export const ARRANGEMENT_NOTIFICATION_STATUS_ARRAY = Object.values(DEFINITIONS)
  .sort((a, b) => a.order - b.order)
  .map((def) => ({ ...def, value: def.key, title: def.label }));

export const ARRANGEMENT_NOTIFICATION_STATUS_FOR_SELECT =
  ARRANGEMENT_NOTIFICATION_STATUS_ARRAY.filter(
    (item) => item.value !== ARRANGEMENT_NOTIFICATION_STATUS_TEMPORARY
  );
