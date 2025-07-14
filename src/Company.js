import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Agreement from "./Agreement.js";

export default class Company extends FireModel {
  static className = "会社";
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    companyName: defField("name", { label: "会社名", required: true }),
    companyNameKana: defField("nameKana", {
      label: "会社名（カナ）",
      required: true,
    }),
    /** 以下、管理者アカウント作成時に未入力状態で作成されるため required は未定義とする */
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode"),
    city: defField("city"),
    address: defField("address"),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
    agreements: defField("array", {
      label: "既定の取極め",
      customClass: Agreement,
    }),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}
