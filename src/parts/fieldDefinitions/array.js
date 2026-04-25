import { generalDefinitions } from "./defaultDefinition.js";

/**
 * ARRAY型のフィールド定義
 * {
 *   type: Array,
 *   default: () => [],
 *   label: undefined,
 *   length: undefined,
 *   required: undefined,
 *   hidden: undefined,
 *   validator: undefined,
 *   component: { name: "air-select", attrs: { multiple: true } },
 * }
 */
export const arrayFields = {
  array: generalDefinitions.array,

  /**
   * FCM トークン
   * Firebase Cloud Messaging (FCM) のトークンを格納するフィールド定義
   */
  fcmTokens: {
    ...generalDefinitions.array,
    label: "FCMトークン",
    required: false,
    hidden: true,
  },

  /**
   * アプリケーション利用権限用配列フィールド定義
   */
  roles: {
    ...generalDefinitions.array,
    label: "権限",
    required: false,
    hidden: false,
  },
};
