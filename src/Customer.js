import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";

export default class Customer extends FireModel {
  static collectionPath = "Customers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "取引先コード" }),
    name: defField("customerName", { required: true }),
    nameKana: defField("customerNameKana", { required: true }),
    zipcode: defField("zipcode", { required: true }),
    prefCode: defField("prefCode", { required: true }),
    city: defField("city", { required: true }),
    address: defField("address", { required: true }),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
    contractStatus: defField("contractStatus", { required: true }),
  };
  static tokenFields = ["name", "nameKana"];
  static hasMany = [
    {
      collectionPath: "Sites",
      field: "customerId",
      condition: "==",
      type: "collection",
    },
  ];
  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}
