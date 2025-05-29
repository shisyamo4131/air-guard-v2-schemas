import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { fullName } from "./parts/definitions/name.js";

export default class Employee extends FireModel {
  static collectionPath = "Employees";
  static useAutonumber = false;
  static logicalDelete = true;
  static classProps = {
    code: defField("code", { label: "従業員コード" }),
    lastName: defField("lastName", { required: true }),
    firstName: defField("firstName", { required: true }),
    isForeigner: defField("isForeigner"),
    foreignName: defField("foreignName"),
    nationality: defField("nationality"),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullName: fullName(),
    });
  }
}
