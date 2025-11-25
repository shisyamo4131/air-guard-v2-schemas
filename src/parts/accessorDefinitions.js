import { OPTIONS } from "../constants/prefectures.js";
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
    enumerable: true,
    get() {
      return this?.customer?.docId;
    },
    set(value) {
      // No-op setter for read-only access
    },
  },
  fullAddress: {
    enumerable: true,
    get() {
      // 同じオブジェクトに 'prefecture' アクセサが定義されていることを前提とします
      const prefecture = this.prefecture || "";
      const city = this.city || "";
      const address = this.address || "";
      return `${prefecture}${city}${address}`;
    },
    set(value) {
      // No-op setter for read-only access
    },
  },
  fullName: {
    enumerable: true,
    get() {
      if (!this.lastName || !this.firstName) return "";
      return `${this.lastName} ${this.firstName}`;
    },
    set(value) {
      // No-op setter for read-only access
    },
  },
  prefecture: {
    enumerable: true,
    get() {
      // if (!this.hasOwnProperty("prefCode")) {
      //   console.warn(
      //     "[アクセサ: prefecture] このオブジェクトに prefCode が定義されていません。"
      //   );
      //   return "";
      // }

      if (!this.prefCode) return ""; // No warning if prefCode is falsy but present

      const result = OPTIONS.find(({ value }) => value === this.prefCode);

      if (!result) {
        console.warn(
          `[アクセサ: prefecture] prefCode '${this.prefCode}' は OPTIONS に見つかりません。`
        );
        return "";
      }

      if (!result.hasOwnProperty("title")) {
        console.warn(
          `[アクセサ: prefecture] OPTIONS の prefCode '${this.prefCode}' に title が定義されていません。`
        );
        return "";
      }

      return result.title;
    },
    set(value) {
      // No-op setter for read-only access
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
  { configurable = false, enumerable = false } = {}
) => {
  const implementation = accessorImplementations[key];
  if (!implementation) {
    throw new Error(
      `[accessorDefinitions.js defAccessor] キー "${key}" のアクセサ実装が見つかりません。`
    );
  }

  return {
    ...implementation,
    configurable: configurable || implementation.configurable || false,
    enumerable: enumerable || implementation.enumerable || false,
  };
};
