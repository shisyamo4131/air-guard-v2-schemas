/*****************************************************************************
 * @file ./src/constants/arrangement-notification-status.js
 * @description 配置通知状態定義
 *
 * @property {string} value - 状態の識別子
 * @property {string} title - 状態の表示名
 * @property {number} order - 状態の順序（数値が小さいほど優先度が高い）
 * @property {string} color - 状態に対応するカラーコード（例: "#F57C00"）
 * @property {function} disabled - 現在の状態を引数に取り、次の状態への遷移が可能かどうかを判定する関数
 * @property {object|null} next - 次の状態への遷移情報（status: 遷移先の状態識別子、text: 遷移ボタンに表示するテキスト）。遷移がない場合はnull。
 * @property {object|null} prev - 前の状態への遷移情報（status: 遷移先の状態識別子、text: 遷移ボタンに表示するテキスト）。遷移がない場合はnull。
 *
 * ### 状態
 * - 配置済（ARRANGED）: 管制により配置が行われた状態で、配置通知の初期状態。作業員はまだ確認していない。
 * - 確認済（CONFIRMED）: 作業員が配置通知を確認し、了承した状態。
 * - 上番済（ARRIVED）: 作業員が現場に到着し、作業を開始できる状態。
 * - 下番済（LEAVED）: 作業員が作業を完了し、現場から離脱した状態。
 *
 * ### 状態遷移ルール
 * - 配置済 (ARRANGED) : 確認済 (CONFIRMED) へ遷移可能。その他の状態への遷移は不可。
 * - 確認済 (CONFIRMED) : 上番済 (ARRIVED) へ遷移可能。
 *                       運用上は配置から外す処理によって配置通知ドキュメントそのものが削除されるため、配置済 (ARRANGED) への遷移は発生しない想定。
 * - 上番済 (ARRIVED) : 確認済 (CONFIRMED) または下番済 (LEAVED) へ遷移可能。（誤って上番してしまった時）
 *                      誤って上番してしまった場合に「確認済」へ戻すことも可能とする。
 * - 下番済 (LEAVED) : 上番済 (ARRIVED) または下番済 (LEAVED) へ遷移可能。（誤って下番してしまった時）
 *****************************************************************************/
export const VALUES = Object.freeze({
  ARRANGED: {
    value: "ARRANGED",
    title: "配置済",
    order: 1,
    color: "#F57C00", // 🟠 配置通知済み（待機中）
    /**
     * 現在の状態に関わらず、常に使用不可。配置通知の初期状態であり、ユーザーが手動で「配置済」に設定することはないため。
     * @param {*} currentStatus
     * @returns {boolean}
     */
    disabled: (currentStatus) => {
      return true;
    },
    text: "未確認配置です。",
    icon: "mdi-alert-circle-outline",
    next: { status: "CONFIRMED", text: "配置了解", transition: "toConfirmed" },
    prev: null,
  },

  CONFIRMED: {
    value: "CONFIRMED",
    title: "確認済",
    order: 2,
    color: "#2196F3", // 🔵 作業員が了承済み（準備中）
    /**
     * 現在の状態が「配置済」または「上番済」でなければ使用不可。
     * - 「配置済」-> 「確認済」への遷移は可能。
     * - 「上番済」-> 「確認済」への遷移は不可。
     * @param {*} currentStatus
     * @returns {boolean}
     */
    disabled: (currentStatus) => {
      return !(currentStatus === "ARRANGED" || currentStatus === "ARRIVED");
    },
    text: "確認済みの配置です。",
    icon: "mdi-check-circle-outline",
    next: { status: "ARRIVED", text: "上番する", transition: "toArrived" },
    prev: {
      status: "ARRANGED",
      text: "配置を差し戻す",
      transition: "toArranged",
    },
  },

  ARRIVED: {
    value: "ARRIVED",
    title: "上番済",
    order: 3,
    color: "#4CAF50", // 🟢 現場到着、作業開始可能
    /**
     * 現在の状態が「確認済」または「下番済」でなければ使用不可。
     * - 「下番済」から「上番済」への遷移は可能（誤って下番してしまった場合に再度上番に戻すことを許容）。
     * @param {*} currentStatus
     * @returns {boolean}
     */
    disabled: (currentStatus) => {
      return !(currentStatus === "CONFIRMED" || currentStatus === "LEAVED");
    },
    text: "上番済みの配置です。",
    icon: "mdi-account-check-outline",
    next: { status: "LEAVED", text: "下番する", transition: "toLeaved" },
    prev: {
      status: "CONFIRMED",
      text: "上番を取り消す",
      transition: "toConfirmed",
    },
  },

  LEAVED: {
    value: "LEAVED",
    title: "下番済",
    order: 4,
    color: "#607D8B", // ⚫ 作業完了、離脱済み
    /**
     * 現在の状態が「上番済」または「下番済」でなければ使用不可。
     * - 「上番済」-> 「下番済」への遷移は可能。
     * - 「下番済」-> 「下番済」への遷移は可能（誤って下番してしまった場合に再度下番することを許容）。
     * @param {*} currentStatus
     * @returns {boolean}
     */
    disabled: (currentStatus) => {
      return !(currentStatus === "ARRIVED" || currentStatus === "LEAVED");
    },
    text: "下番済みの配置です。",
    icon: "mdi-account-off-outline",
    next: null,
    prev: {
      status: "ARRIVED",
      text: "下番を取り消す",
      transition: "toArrived",
    },
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
