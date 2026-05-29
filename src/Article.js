/*****************************************************************************
 * @file src/Article.js
 *****************************************************************************/
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { VALIDATION_ERRORS } from "./errorDefinitions.js";

/*****************************************************************************
 * @class Article
 * @extends FireModel
 *
 * @description
 * 稼働外で計上すべき売上（請求）の品目マスタクラスです。
 * 無線機利用料、指名料など、作業員の稼働実績とは無関係に発生する請求項目を管理します。
 *
 * @property {string} code - 品目コード
 * @property {string} name - 品目名
 * @property {string} description - 品目説明
 * @property {number} price - 単価
 * @property {string} remarks - 備考
 *****************************************************************************/
export default class Article extends FireModel {
  static className = "品目";
  static collectionPath = "Articles";
  static useAutonumber = false;
  static logicalDelete = true;

  static classProps = {
    code: defField("code", { label: "品目コード" }),
    name: defField("name", {
      label: "品目名",
      required: true,
      length: 50,
    }),
    description: defField("description", {
      label: "品目説明",
    }),
    price: defField("price", {
      label: "単価",
      required: true,
      default: 0,
      validator: (value) => {
        if (value === null || value === undefined) {
          return VALIDATION_ERRORS.REQUIRED_ERROR();
        }
        if (typeof value !== "number" || isNaN(value)) {
          return VALIDATION_ERRORS.CUSTOM_ERROR(
            "PRICE_INVALID",
            "price must be a valid number.",
            { ja: "単価は有効な数値である必要があります。" },
          );
        }
        if (value < 0) {
          return VALIDATION_ERRORS.MIN_VALUE_ERROR(0);
        }
        return true;
      },
      component: {
        attrs: {
          min: 0,
        },
      },
    }),
    remarks: defField("remarks"),
  };

  static tokenFields = ["code", "name"];

  static headers = [
    { title: "コード", key: "code" },
    { title: "品目名", key: "name" },
    { title: "単価", key: "price" },
  ];
}
