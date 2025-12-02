/**
 * System.js
 * @version 1.0.0
 * @description System model
 * @author shisyamo4131
 */
import FireModel from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

const classProps = {
  isMaintenance: defField("check", { default: false, hidden: true }),
  updatedAt: defField("dateAt", { default: null, hidden: true }),
  lastMaintenanceBy: defField("oneLine", {
    default: "admin-sdk",
    hidden: true,
  }),
};

/**
 * @prop {boolean} isMaintenance - maintenance mode flag
 * @prop {Date} updatedAt - last updated timestamp
 * @prop {string} lastMaintenanceBy - identifier of the last maintainer
 */
export default class System extends FireModel {
  static className = "System";
  static collectionPath = "System";
  static usePrefix = false;
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  async create() {
    return Promise.reject(new Error("[System.js] Not implemented."));
  }

  async update() {
    return Promise.reject(new Error("[System.js] Not implemented."));
  }

  async delete() {
    return Promise.reject(new Error("[System.js] Not implemented."));
  }
}
