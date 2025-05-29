import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { prefecture, fullAddress } from "./parts/definitions/address.js";

export default class Site extends FireModel {
  static collectionPath = "Sites";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "現場コード" }),
    siteName: defField("companyName", {
      label: "現場名",
      required: true,
    }),
    siteNameKana: defField("companyNameKana", {
      label: "現場名（カナ）",
      required: true,
    }),
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode", { required: true }),
    city: defField("city", { required: true }),
    address: defField("address", { required: true }),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    startDate: defField("startDate", { required: true }),
    // --- 終了日は未入力状態を許容 -> 無期限を意味する
    endDate: defField("endDate"),
  };
  static tokenFields = ["siteName", "siteNameKana"];
  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: fullAddress(),
      prefecture: prefecture(),
    });
  }
}
