/*****************************************************************************
 * Customer Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * @props {string} code - Customer code.
 * @props {string} name - Customer name.
 * @props {string} nameKana - Customer name in Kana.
 * @props {string} zipcode - Postal code.
 * @props {string} prefCode - Prefecture code.
 * @props {string} city - City name.
 * @props {string} address - Address details.
 * @props {string} building - Building name.
 * @props {object} location - Geographical location.
 * @props {string} tel - Telephone number.
 * @props {string} fax - Fax number.
 * @props {string} contractStatus - Contract status.
 * @props {string} remarks - Additional remarks.
 * ---------------------------------------------------------------------------
 * @computed {string} fullAddress - Full address combining prefecture, city, and address (read-only)
 * @computed {string} prefecture - Prefecture name derived from `prefCode` (read-only)
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

  static STATUS_ACTIVE = VALUES.ACTIVE;
  static STATUS_TERMINATED = VALUES.TERMINATED;

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}

/*****************************************************************************
 * Customer Minimal Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
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
