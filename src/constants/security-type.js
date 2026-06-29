/*****************************************************************************
 * @file ./src/constants/security-type.js
 * @description 警備種別定数定義
 *****************************************************************************/

export const VALUES = Object.freeze({
  UNSET: {
    title: "未設定",
    value: "UNSET",
    chart: {
      backgroundColor: "rgba(158, 158, 158, 0.2)",
      borderColor: "rgba(158, 158, 158, 1)",
    },
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },

  FACILITY: {
    title: "施設警備",
    value: "FACILITY",
    chart: {
      backgroundColor: "rgba(33, 150, 243, 0.2)",
      borderColor: "rgba(33, 150, 243, 1)",
    },
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },

  CROWD: {
    title: "雑踏警備",
    value: "CROWD",
    chart: {
      backgroundColor: "rgba(255, 152, 0, 0.2)",
      borderColor: "rgba(255, 152, 0, 1)",
    },
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },

  TRAFFIC: {
    title: "交通誘導",
    value: "TRAFFIC",
    chart: {
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      borderColor: "rgba(76, 175, 80, 1)",
    },
    aggregation: {
      sales: true,
      operationQuantity: true,
    },
  },

  TRAINING: {
    title: "研修",
    value: "TRAINING",
    chart: {
      backgroundColor: "rgba(121, 85, 72, 0.2)",
      borderColor: "rgba(121, 85, 72, 1)",
    },
    aggregation: {
      sales: false,
      operationQuantity: false,
    },
  },

  OTHER: {
    title: "その他",
    value: "OTHER",
    chart: {
      backgroundColor: "rgba(156, 39, 176, 0.2)",
      borderColor: "rgba(156, 39, 176, 1)",
    },
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
