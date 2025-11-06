/*****************************************************************************
 * Customer ver 1.0.0
 * @author shisyamo4131
 *
 * @description Customer model.
 * @hasMany Sites - related sites associated with the customer
 *
 * @prop {string} code - customer code
 * @prop {string} name - customer name
 * @prop {string} nameKana - customer name in kana
 * @prop {string} zipcode - postal code
 * @prop {string} prefCode - prefecture code
 * @prop {string} city - city name
 * @prop {string} address - address details
 * @prop {string} building - building name
 * @prop {object} location - geographical location
 * @prop {string} tel - telephone number
 * @prop {string} fax - fax number
 * @prop {string} contractStatus - contract status
 * @prop {string} remarks - additional remarks
 *
 * @readonly
 * @prop {string} fullAddress - full address combining prefecture, city, and address (read-only)
 * @prop {string} prefecture - prefecture name derived from `prefCode` (read-only)
 *
 * @static
 * @prop {string} STATUS_ACTIVE - constant for active contract status
 * @prop {string} STATUS_TERMINATED - constant for terminated contract status
 *****************************************************************************/
import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { VALUES } from "./constants/contract-status.js";

const classProps = {
  code: defField("code", { label: "取引先コード" }),
  name: defField("name", { label: "取引先名", required: true }),
  nameKana: defField("nameKana", { label: "取引先名（カナ）", required: true }),
  zipcode: defField("zipcode", { required: true }),
  prefCode: defField("prefCode", { required: true }),
  city: defField("city", { required: true }),
  address: defField("address", { required: true }),
  building: defField("building"),
  location: defField("location", { hidden: true }),
  tel: defField("tel", { colsDefinition: { cols: 12, sm: 6 } }),
  fax: defField("fax", { colsDefinition: { cols: 12, sm: 6 } }),
  contractStatus: defField("contractStatus", { required: true }),
  remarks: defField("multipleLine", { label: "備考" }),
};

export default class Customer extends FireModel {
  static className = "取引先";
  static collectionPath = "Customers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = classProps;
  static tokenFields = ["name", "nameKana"];
  static hasMany = [
    {
      collectionPath: "Sites",
      field: "customerId",
      condition: "==",
      type: "collection",
    },
  ];

  static headers = [
    { key: "code", title: "取引先コード" },
    { key: "name", title: "取引先名" },
    { key: "fullAddress", title: "所在地" },
  ];

  static STATUS_ACTIVE = VALUES.ACTIVE.value;
  static STATUS_TERMINATED = VALUES.TERMINATED.value;

  afterInitialize(item = {}) {
    super.afterInitialize(item);
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}

/*****************************************************************************
 * A minimal version of the Customer model with non-essential fields removed for
 * lightweight data handling.
 *****************************************************************************/
export class CustomerMinimal extends Customer {
  afterInitialize() {
    super.afterInitialize();
    delete this.remarks;
    delete this.tokenMap;
    delete this.uid;
    delete this.createdAt;
    delete this.updatedAt;
  }
}
