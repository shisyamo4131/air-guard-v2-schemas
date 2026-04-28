import { generalDefinitions } from "./defaultDefinition.js";

/**
 * MULTIPLE LINE型のフィールド定義
 */
export const multipleLineFields = {
  multipleLine: generalDefinitions.multipleLine,
  notificationError: {
    ...generalDefinitions.multipleLine,
    label: "通知送信エラー",
  },
  remarks: {
    ...generalDefinitions.multipleLine,
    label: "備考",
  },
};
