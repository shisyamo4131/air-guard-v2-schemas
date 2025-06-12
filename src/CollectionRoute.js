/**
 * @file ./src/CollectionRoute.js
 * @description ルート情報クラス
 */
import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class CollectionRoute extends FireModel {
  static collectionPath = "CollectionRoutes";
  static useAutonumber = false;
  static logicalDelete = true;

  static classProps = {
    /** ルートコード */
    code: defField("code", { label: "ルートコード" }),

    /** ルート名 */
    name: defField("name", { label: "ルート名", required: true, length: 50 }),

    /** ルートの説明 (任意) */
    description: defField("description"),

    /**
     * 収集場所のリストと順序。
     * 各要素はオブジェクトで、以下のキーを持つことを想定:
     * - siteId: string (必須, SiteドキュメントのID)
     * - order: number (必須, 収集順。0から始まる連番)
     * - notes: string (任意, その収集場所での特記事項)
     */
    stops: defField("stops", {
      label: "収集場所リスト",
      type: Array, // Firestoreでは配列として保存
      default: () => [],
      // 注意: FireModelが配列内のオブジェクトのスキーマ検証や
      // UIコンポーネント生成を直接サポートしていない場合、
      // アプリケーション側での処理や専用UIコンポーネントが必要になります。
    }),

    /** 有効フラグ (このルートが現在アクティブかどうか) */
    isActive: defField("isActive"),

    /** 備考 (任意) */
    remarks: defField("remarks"),
  };

  static tokenFields = ["name", "code"]; // nameやcodeで部分一致検索を可能にする場合
}
