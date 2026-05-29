/*****************************************************************************
 * @file ./src/ArticleDetail.js
 * @author shisyamo4131
 * @description
 * OperationResult.articles 配列の各アイテムを表すクラスです。
 * Firestore には保存せず、OperationResult ドキュメントのサブオブジェクトとして使用します。
 *
 * 商品名・コードなどのマスタデータは Article ドキュメントから参照します。
 * price は商品選択時に Article の単価を初期値としてセットしますが、稼働実績ごとに上書き可能です。
 *
 * @class
 * @extends BaseClass
 *
 * @property {string} articleId - 商品ID（Article ドキュメントの docId）
 * @property {number} price - 単価（Article の price を初期値としてセット、上書き可能）
 * @property {number} quantity - 数量（1以上の正の整数）
 *****************************************************************************/
import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";

export default class ArticleDetail extends BaseClass {
  static className = "商品明細";

  static classProps = {
    articleId: defField("oneLine", {
      label: "商品ID",
      required: true,
      hidden: true,
    }),
    price: defField("number", { label: "単価", default: 0 }),
    quantity: defField("number", {
      label: "数量",
      required: true,
      default: 1,
      validator: (value) => {
        if (value === null || value === undefined) {
          return VALIDATION_ERRORS.REQUIRED_ERROR();
        }
        if (typeof value !== "number" || isNaN(value)) {
          return VALIDATION_ERRORS.CUSTOM_ERROR(
            "INVALID_VALUE",
            "quantity must be a number",
            { ja: "数量は数値である必要があります。" },
          );
        }
        if (value <= 0) {
          return VALIDATION_ERRORS.CUSTOM_ERROR(
            "INVALID_VALUE",
            "quantity must be positive",
            { ja: "数量は1以上である必要があります。" },
          );
        }
        return true;
      },
    }),
  };
}
