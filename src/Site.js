import { default as FireModel, BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { CustomerMinimal } from "./Customer.js";
import { DAY_TYPE } from "./constants/day-type.js";
import { SHIFT_TYPE } from "./constants/shift-type.js";

export class Agreement extends BaseClass {
  static className = "取極め";
  static classProps = {
    from: defField("date", {
      label: "適用開始日",
      required: true,
      // 既定値は当日日付（時刻は0時）とする
      default: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
      },
    }),
    dayType: defField("dayType", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    category: defField("rateCategory", { required: true }),
    unitPrice: defField("price", { label: "単価", required: true }),
    overTimeUnitPrice: defField("price", {
      label: "時間外単価",
      required: true,
    }),
    billingUnit: defField("billingUnit", { required: true }),
  };
  static headers = [
    {
      title: "適用開始日",
      key: "from",
      value: (item) => item.from.toLocaleDateString(),
    },
    {
      title: "区分",
      key: "type",
      value: (item) => `${DAY_TYPE[item.dayType]}${SHIFT_TYPE[item.shiftType]}`,
    },
    {
      title: "単価",
      key: "unitPrice",
      value: (item) => item.unitPrice.toLocaleString(),
      align: "end",
    },
    {
      title: "時間外単価",
      key: "overTimeUnitPrice",
      value: (item) => item.overTimeUnitPrice.toLocaleString(),
      align: "end",
    },
    {
      title: "請求単位",
      key: "billingUnit",
      value: (item) => item.billingUnit,
      align: "center",
    },
  ];
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
