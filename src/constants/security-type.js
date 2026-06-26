/*****************************************************************************
 * @file ./src/constants/security-type.js
 * @description 警備種別定数定義
 *
 * - title: 表示に使用される文字列
 * - value: 内部値
 * - aggregation: 集計対象かどうかのフラグ群
 *   - sales: 売上集計対象かどうかのフラグ
 *   - operationQuantity: 作業量集計対象かどうかのフラグ
 *
 * [更新履歴]
 * - 2026-06-26 `aggregation` を追加。
 *****************************************************************************/
export const VALUES = Object.freeze({
  UNSET: {
    title: "未設定",
    value: "UNSET",
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },
  FACILITY: {
    title: "施設警備",
    value: "FACILITY",
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },
  CROWD: {
    title: "雑踏警備",
    value: "CROWD",
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },
  TRAFFIC: {
    title: "交通誘導",
    value: "TRAFFIC",
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },
  TRAINING: {
    title: "研修",
    value: "TRAINING",
    aggregation: {
      sales: false,
      operationQuantity: false,
    },
  },
  OTHER: {
    title: "その他",
    value: "OTHER",
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },
});

export const OPTIONS = Object.values(VALUES).map(({ title, value }) => ({
  title,
  value,
}));
