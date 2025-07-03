import { default as FireModel, BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { CustomerMinimal } from "./Customer.js";

export class Agreement extends BaseClass {
  static className = "取極め";
  static classProps = {
    dayType: defField("dayType", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    category: defField("rateCategory", { required: true }),
    unitPrice: defField("number", {
      label: "単価",
      required: true,
      component: {
        attrs: {
          rules: [
            (v) => (v > 0 ? true : "単価は0より大きい値を入力してください"),
          ],
        },
      },
    }),
    overTimeUnitPrice: defField("number", {
      label: "時間外単価",
      required: true,
    }),
    billingUnit: defField("billingUnit", { required: true }),
  };
}

export default class Site extends FireModel {
  static collectionPath = "Sites";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "現場コード" }),
    name: defField("name", {
      label: "現場名",
      length: 40,
      required: true,
    }),
    nameKana: defField("nameKana", {
      label: "現場名（カナ）",
      length: 60,
      required: true,
    }),
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode", { required: true }),
    city: defField("city", { required: true }),
    address: defField("address", { required: true }),
    building: defField("building"),
    location: defField("location"),
    customer: defField("customer", {
      required: true,
      customClass: CustomerMinimal,
      component: {
        attrs: {
          api: () => {
            return async (search) =>
              await new CustomerMinimal().fetchDocs({ constraints: search });
          },
          noFilter: true,
        },
      },
    }),
    remarks: defField("multipleLine", { label: "備考" }),
    agreements: defField("array", { label: "取極め", customClass: Agreement }),
  };
  static tokenFields = ["name", "nameKana"];
  static hasMany = [
    {
      collectionPath: "SiteOperationSchedules",
      field: "siteId",
      condition: "==",
      type: "collection",
    },
  ];

  afterInitialize() {
    Object.defineProperties(this, {
      customerId: defAccessor("customerId"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}
