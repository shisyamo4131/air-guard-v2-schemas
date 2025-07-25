import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class Outsourcer extends FireModel {
  static className = "外注先";
  static collectionPath = "Outsourcers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "外注先コード" }),
    name: defField("name", { required: true }),
    nameKana: defField("nameKana", { required: true }),
    displayName: defField("displayName", { label: "略称", required: true }),
    /** 契約状態 */
    contractStatus: defField("contractStatus", { required: true }),
    remarks: defField("multipleLine", { label: "備考" }),
  };
  static tokenFields = ["name", "nameKana", "displayName"];
  static headers = [
    { title: "外注先コード", key: "code" },
    { title: "外注先名", key: "name" },
    { title: "略称", key: "displayName" },
  ];
}
