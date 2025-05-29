import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { prefecture, fullAddress } from "./parts/definitions/address.js";

export default class Customer extends FireModel {
  static collectionPath = "Customers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "取引先コード" }),
    customerName: defField("companyName", {
      label: "取引先名",
      required: true,
    }),
    customerNameKana: defField("companyNameKana", {
      label: "取引先名（カナ）",
      required: true,
    }),
    zipcode: defField("zipcode", { required: true }),
    prefCode: defField("prefCode", { required: true }),
    city: defField("city", { required: true }),
    address: defField("address", { required: true }),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
  };
  static tokenFields = ["customerName", "customerNameKana"];
  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: fullAddress(),
      prefecture: prefecture(),
    });
  }
}
