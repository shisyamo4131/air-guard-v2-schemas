/**
 * バリデーションエラー定義
 * - validator がオブジェクト形式でエラーを返す際に使用します。
 * - 各エラーは関数として定義され、動的なパラメータを受け取ります。
 *
 * 返却値の形式:
 * {
 *   code: 'ERROR_CODE',           // エラーコード
 *   message: 'English message',    // 英語メッセージ（デフォルト言語）
 *   messages: {                    // その他の言語のメッセージ
 *     ja: '日本語メッセージ'
 *   }
 * }
 *
 * 使用例:
 * ```javascript
 * import { VALIDATION_ERRORS } from './errorDefinitions.js';
 *
 * validator: (v) => {
 *   const minValue = 0;
 *   if (v < minValue) {
 *     return VALIDATION_ERRORS.MIN_VALUE_ERROR(minValue);
 *   }
 *   return true;
 * }
 * ```
 */

export const VALIDATION_ERRORS = {
  /**
   * 最小値エラー
   * @param {number} minValue - 最小値
   * @returns {Object} エラーオブジェクト
   */
  MIN_VALUE_ERROR: (minValue) => ({
    code: "MIN_VALUE_ERROR",
    message: `Please enter a value of ${minValue} or more.`,
    messages: {
      ja: `${minValue}以上の値を入力してください。`,
    },
  }),

  /**
   * 最大値エラー
   * @param {number} maxValue - 最大値
   * @returns {Object} エラーオブジェクト
   */
  MAX_VALUE_ERROR: (maxValue) => ({
    code: "MAX_VALUE_ERROR",
    message: `Please enter a value of ${maxValue} or less.`,
    messages: {
      ja: `${maxValue}以下の値を入力してください。`,
    },
  }),

  /**
   * 範囲エラー
   * @param {number} minValue - 最小値
   * @param {number} maxValue - 最大値
   * @returns {Object} エラーオブジェクト
   */
  RANGE_ERROR: (minValue, maxValue) => ({
    code: "RANGE_ERROR",
    message: `Please enter a value between ${minValue} and ${maxValue}.`,
    messages: {
      ja: `${minValue}以上${maxValue}以下の値を入力してください。`,
    },
  }),

  /**
   * 最小文字数エラー
   * @param {number} minLength - 最小文字数
   * @returns {Object} エラーオブジェクト
   */
  MIN_LENGTH_ERROR: (minLength) => ({
    code: "MIN_LENGTH_ERROR",
    message: `Please enter at least ${minLength} characters.`,
    messages: {
      ja: `${minLength}文字以上で入力してください。`,
    },
  }),

  /**
   * 最大文字数エラー
   * @param {number} maxLength - 最大文字数
   * @returns {Object} エラーオブジェクト
   */
  MAX_LENGTH_ERROR: (maxLength) => ({
    code: "MAX_LENGTH_ERROR",
    message: `Please enter ${maxLength} characters or less.`,
    messages: {
      ja: `${maxLength}文字以内で入力してください。`,
    },
  }),

  /**
   * パターン不一致エラー
   * @param {string} pattern - パターン名（例: 'email', 'phone'）
   * @returns {Object} エラーオブジェクト
   */
  PATTERN_ERROR: (pattern) => ({
    code: "PATTERN_ERROR",
    message: `Please enter a valid ${pattern} format.`,
    messages: {
      ja: `正しい${pattern}の形式で入力してください。`,
    },
  }),

  /**
   * 必須エラー（カスタムメッセージ用）
   * @param {string} fieldName - フィールド名
   * @returns {Object} エラーオブジェクト
   */
  REQUIRED_FIELD_ERROR: (fieldName) => ({
    code: "REQUIRED_FIELD_ERROR",
    message: `${fieldName} is required.`,
    messages: {
      ja: `${fieldName}は必須です。`,
    },
  }),

  /**
   * 日付範囲エラー
   * @param {string} startDate - 開始日
   * @param {string} endDate - 終了日
   * @returns {Object} エラーオブジェクト
   */
  DATE_RANGE_ERROR: (startDate, endDate) => ({
    code: "DATE_RANGE_ERROR",
    message: `Please select a date between ${startDate} and ${endDate}.`,
    messages: {
      ja: `${startDate}から${endDate}の間の日付を選択してください。`,
    },
  }),

  /**
   * 日付順序エラー
   * @returns {Object} エラーオブジェクト
   */
  DATE_ORDER_ERROR: () => ({
    code: "DATE_ORDER_ERROR",
    message: "Start date must be before end date.",
    messages: {
      ja: "開始日は終了日より前である必要があります。",
    },
  }),

  /**
   * 重複エラー
   * @param {string} fieldName - フィールド名
   * @returns {Object} エラーオブジェクト
   */
  DUPLICATE_ERROR: (fieldName) => ({
    code: "DUPLICATE_ERROR",
    message: `${fieldName} is already registered.`,
    messages: {
      ja: `${fieldName}は既に登録されています。`,
    },
  }),

  /**
   * カスタムエラー（汎用）
   * @param {string} code - エラーコード
   * @param {string} message - 英語メッセージ
   * @param {string} messageJa - 日本語メッセージ
   * @returns {Object} エラーオブジェクト
   */
  CUSTOM_ERROR: (code, message, messageJa) => ({
    code,
    message,
    messages: {
      ja: messageJa,
    },
  }),
};
