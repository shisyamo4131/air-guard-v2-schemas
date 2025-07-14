import { default as FireModel } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { CustomerMinimal } from "./Customer.js";
import { fetchDocsApi } from "./apis/index.js";
import Agreement from "./Agreement.js";

export default class Site extends FireModel {
  static className = "現場";
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
          api: () => fetchDocsApi(CustomerMinimal),
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

  static headers = [
    { title: "code", key: "code", value: "code" },
    { title: "現場名", key: "name", value: "name" },
    { title: "取引先名", key: "customer.name", value: "customer.name" },
  ];

  afterInitialize() {
    Object.defineProperties(this, {
      customerId: defAccessor("customerId"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}
