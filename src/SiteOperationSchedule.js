import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class SiteOperationSchedule extends FireModel {
  static collectionPath = "SiteOperationSchedules";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    siteId: defField("docId", { label: "現場", hidden: true, required: true }),
    date: defField("date", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    requiredPersonnel: defField("requiredPersonnel", { required: true }),
    workDescription: defField("remarks", { label: "作業内容" }),
    remarks: defField("remarks"),
  };
}
