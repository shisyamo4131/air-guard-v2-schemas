import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import Site from "./Site.js";

export default class OperationResult extends FireModel {
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    siteId: defField("oneLine", {
      label: "現場",
      required: true,
      component: {
        name: "air-autocomplete-api",
        attrs: {
          api: () => {
            return async (search) =>
              await new Site().fetchDocs({ constraints: search });
          },
          fetchItemByKeyApi: () => {
            return async (docId) => {
              return await new Site().fetchDoc({ docId });
            };
          },
          itemValue: "docId",
          itemTitle: "name",
          noFilter: true,
        },
      },
    }),
    date: defField("date", { label: "日付", required: true }),
    dayType: {
      type: String,
      default: "weekday",
      label: "曜日区分",
      required: true,
      component: {
        name: "air-select",
        attrs: {
          items: [
            { title: "平日", value: "weekday" },
            { title: "土曜", value: "saturday" },
            { title: "日曜", value: "sunday" },
            { title: "祝日", value: "holiday" },
          ],
        },
      },
    },
    shiftType: defField("shiftType", { required: true }),
    /**
     * workers
     * { isEmployee, employeeId | outsourcerId, startAt, endAt, isQualificated, isOjt }
     */
    workers: {
      type: Array,
      default: () => [],
      label: "稼働明細",
      required: false,
    },
  };
}
