import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { prefecture, fullAddress } from "./parts/definitions/address.js";

export default class Company extends FireModel {
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    companyName: defField("companyName", { required: true }),
    companyNameKana: defField("companyNameKana", { required: true }),
    /** 以下、管理者アカウント作成時に未入力状態で作成されるため required は未定義とする */
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode"),
    city: defField("city"),
    address: defField("address"),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: fullAddress(),
      prefecture: prefecture(),
    });
  }
}
