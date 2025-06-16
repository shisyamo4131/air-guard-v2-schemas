/**
 * @file ./src/CollectionResult.js
 * @description 回収実績クラス
 */

import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class CollectionResult extends FireModel {
  static collectionPath = "CollectionResults";
  static useAutonumber = false;
  static logicalDelete = false;

  static classProps = {
    date: defField("date", { required: true }),
    siteId: defField("docId", { label: "排出場所", required: true }),
  };
}
