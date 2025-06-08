import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import { CustomerMinimal } from "./Customer.js";

export default class Site extends FireModel {
  static collectionPath = "Sites";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "現場コード" }),
    siteName: defField("name", {
      label: "現場名",
      length: 40,
      required: true,
    }),
    siteNameKana: defField("nameKana", {
      label: "現場名（カナ）",
      length: 60,
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
      customClass: CustomerMinimal,
      component: {
        attrs: {
          api: () => {
            async (search) =>
              await new CustomerMinimal().fetchDocs({ constraints: search });
          },
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
