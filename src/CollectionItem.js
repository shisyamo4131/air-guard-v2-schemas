/**
 * @file ./src/CollectionItem.js
 * @description 回収品目クラス
 */

import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class CollectionItem extends FireModel {
  static collectionPath = "CollectionItems";
  static useAutonumber = false;
  static logicalDelete = false;

  static classProps = {
    /**
     * 回収品目コード
     * 回収品目をユーザーが識別するための4桁のコード。
     * アプリの規定動作上必要となる回収品目については管理者ユーザー登録処理の際に自動で登録されるものとし、
     * 当然、アプリ規定の回収品目となるため、ユーザーによる編集・削除は不可能。（isSystemItem プロパティを参照）
     *
     * アプリ上ではこのコードを使って何かしらの処理を行うことはなく、各桁の数字に意味を持たせることで、
     * データを容易に登録できるようにするためのもの。
     *
     * 1桁目: { 1: 一般廃棄物, 2: 産業廃棄物 }
     * 2-3桁目: 廃棄物の種類番号
     * 4桁目: 同種類の通し番号（`1` はシステム規定で用意する）
     *
     * 例）
     * 1011: 一般廃棄物の可燃物（システム規定）
     * 1021: 一般廃棄物の生ごみ（システム規定）
     * 2061: 産業廃棄物の廃プラスチック類（システム規定）
     * 2062: 産業廃棄物の廃プラスチック類（ユーザー登録分）
     * 2081: 産業廃棄物の金属くず（システム規定）
     * 2082: 産業廃棄物の金属くず（ユーザー登録分）
     * ※ユーザー登録分は自由な名前を付けられるものとする。
     *
     * 回収品目コードは重複することを許容する。
     * ※システム規定の回収品目はドキュメント ID を固定させる。
     *
     * [検討事項]
     * - 医療系一般廃棄物や医療系産業廃棄物、車両費、作業費などの特殊な品目はどうするか。
     * - 他のシステム規定品目（月極など）
     */
    code: defField("code", {
      label: "回収品目コード",
      length: 4,
      required: true,
    }),
    /** 回収品目名 */
    name: defField("name", { label: "回収品目名", required: true }),
    /** 回収品目名カナ */
    nameKana: defField("nameKana", {
      label: "回収品目名（カナ）",
      required: true,
    }),
    /** 回収品目種別 */
    type: defField("collectionItemType", { required: true }),
    /** システム規定 */
    isSystemItem: defField("bool", {
      label: "システム規定",
      default: false,
      hidden: true,
      required: true,
    }),
  };
}
