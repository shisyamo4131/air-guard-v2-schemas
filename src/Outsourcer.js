/**
 * @file src/Outsourcer.js
 * @author shisyamo4131
 * @version 1.0.0
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { VALUES } from "./constants/contract-status.js";

const classProps = {
  code: defField("code", { label: "外注先コード" }),
  name: defField("name", { required: true }),
  nameKana: defField("nameKana", { required: true }),
  displayName: defField("displayName", { label: "略称", required: true }),
  contractStatus: defField("contractStatus", { required: true }),
  remarks: defField("multipleLine", { label: "備考" }),
};

/**
 * @extends FireModel
 *
 * @props {string} code - Outsourcer code.
 * @props {string} name - Outsourcer name.
 * @props {string} nameKana - Outsourcer name in Kana.
 * @props {string} displayName - Abbreviated name.
 * @props {string} contractStatus - Contract status.
 * @props {string} remarks - Additional remarks.
 */
export default class Outsourcer extends FireModel {
  static className = "外注先";
  static collectionPath = "Outsourcers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = classProps;

  static tokenFields = ["name", "nameKana", "displayName"];

  static headers = [
    { title: "外注先コード", key: "code" },
    { title: "外注先名", key: "name" },
    { title: "略称", key: "displayName" },
  ];

  static STATUS_ACTIVE = VALUES.ACTIVE.value;
  static STATUS_TERMINATED = VALUES.TERMINATED.value;
}
