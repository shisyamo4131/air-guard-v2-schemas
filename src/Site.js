import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Customer from "./Customer.js";

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
    customer: defField("customer", {
      required: true,
      customClass: Customer,
      component: {
        attrs: {
          api: async (search) =>
            await new Customer().fetchDocs({ constraints: search }),
        },
      },
    }),
  };
  static tokenFields = ["siteName", "siteNameKana"];

  afterInitialize() {
    Object.defineProperties(this, {
      customerId: defAccessor("customerId"),
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }
}
