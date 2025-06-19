import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";

export default class Customer extends FireModel {
  static collectionPath = "Customers";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    /** 取引先コード */
    code: defField("code", { label: "取引先コード" }),
    /** 取引先名 */
    name: defField("name", { label: "取引先名", required: true }),
    /** 取引先名（カナ） */
    nameKana: defField("nameKana", {
      label: "取引先名（カナ）",
      required: true,
    }),
    /** 郵便番号 */
    zipcode: defField("zipcode", { required: true }),
    /** 都道府県（CODE） */
    prefCode: defField("prefCode", { required: true }),
    /** 市区町村 */
    city: defField("city", { required: true }),
    /** 町域名・番地 */
    address: defField("address", { required: true }),
    /** 建物名・階数 */
    building: defField("building"),
    /** location */
    location: defField("location", { hidden: true }),
    /** 電話番号 */
    tel: defField("tel"),
    /** FAX番号 */
    fax: defField("fax"),
    /** 契約状態 */
    contractStatus: defField("contractStatus", { required: true }),
    /** 備考 */
    remarks: defField("multipleLine", { label: "備考" }),
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
