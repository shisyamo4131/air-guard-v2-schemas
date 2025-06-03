import { PREFECTURES_ARRAY } from "../constants/index.js";

/**
 * @typedef {object} AccessorImplementation - アクセサの実装を定義するオブジェクト。
 * @property {function} get - getter関数。
 * @property {function} [set] - setter関数（オプショナル）。
 */

/**
 * 各アクセサキーに対応する実装を格納するオブジェクト。
 * @type {Object.<string, AccessorImplementation>}
 */
const accessorImplementations = {
  customerId: {
    get() {
      return this?.customer?.docId;
    },
  },
  prefecture: {
    /**
     * `this.prefCode` に基づいて都道府県名を取得します。
     * @this {object & {prefCode?: string}} - アクセサが定義されるインスタンス。
     * @returns {string} 都道府県名。見つからない場合やエラー時は空文字列。
     */
    get() {
      if (!this.hasOwnProperty("prefCode")) {
        console.warn(
          "[アクセサ: prefecture] このオブジェクトに prefCode が定義されていません。"
        );
        return "";
      }

      if (!this.prefCode) return ""; // No warning if prefCode is falsy but present

      const result = PREFECTURES_ARRAY.find(
        ({ value }) => value === this.prefCode
      );

      if (!result) {
        console.warn(
          `[アクセサ: prefecture] prefCode '${this.prefCode}' は PREFECTURES_ARRAY に見つかりません。`
        );
        return "";
      }

      if (!result.hasOwnProperty("title")) {
        console.warn(
          `[アクセサ: prefecture] PREFECTURES_ARRAY の prefCode '${this.prefCode}' に title が定義されていません。`
        );
        return "";
      }

      return result.title;
    },
  },
  fullAddress: {
    /**
     * prefecture、city、address を連結して完全な住所を取得します。
     * @this {object & {prefecture?: string, city?: string, address?: string}} - インスタンス。
     * @returns {string} 完全な住所文字列。
     */
    get() {
      // 同じオブジェクトに 'prefecture' アクセサが定義されていることを前提とします
      const prefecture = this.prefecture || "";
      const city = this.city || "";
      const address = this.address || "";
      return `${prefecture}${city}${address}`;
    },
  },
  fullName: {
    /**
     * Gets the full name by concatenating lastName and firstName.
     * @this {object & {lastName?: string, firstName?: string}} - インスタンス。
     * @returns {string} 氏名文字列。
     */
    get() {
      if (!this.lastName || !this.firstName) return "";
      return `${this.lastName} ${this.firstName}`;
    },
  },
};

/**
 * `Object.defineProperty` 用のアクセサディスクリプタを生成します。
 *
 * @param {string} key - `accessorImplementations` で検索するためのキー。
 * @param {object} [options={}] - プロパティディスクリプタのオプション。
 * @param {boolean} [options.configurable=true] - `configurable` 属性。
 * @param {boolean} [options.enumerable=true] - `enumerable` 属性。
 * @returns {PropertyDescriptor} `Object.defineProperty` で使用するためのプロパティディスクリプタ。
 * @throws {Error} アクセサキーが見つからない場合。
 */
export const defAccessor = (
  key,
  { configurable = true, enumerable = true } = {}
) => {
  const implementation = accessorImplementations[key];
  if (!implementation) {
    throw new Error(
      `[accessorDefinitions.js defAccessor] キー "${key}" のアクセサ実装が見つかりません。`
    );
  }

  return {
    configurable,
    enumerable,
    get: implementation.get,
    set:
      implementation.set ||
      function (v) {
        // read-only / 警告の出力も必要なし
      },
  };
};
