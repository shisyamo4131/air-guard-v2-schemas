import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Agreement from "./Agreement.js";
import SiteOrder from "./SiteOrder.js";

export default class Company extends FireModel {
  static className = "会社";
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    companyName: defField("name", { label: "会社名", required: true }),
    companyNameKana: defField("nameKana", {
      label: "会社名（カナ）",
      required: true,
    }),
    /** 以下、管理者アカウント作成時に未入力状態で作成されるため required は未定義とする */
    zipcode: defField("zipcode"),
    prefCode: defField("prefCode"),
    city: defField("city"),
    address: defField("address"),
    building: defField("building"),
    location: defField("location", { hidden: true }),
    tel: defField("tel"),
    fax: defField("fax"),
    agreements: defField("array", {
      label: "既定の取極め",
      customClass: Agreement,
    }),
    /**
     * Field to manage the display order of site-shift type pairs for placement management.
     * Format: { siteId, shiftType }
     */
    siteOrder: defField("array", {
      customClass: SiteOrder,
      hidden: true,
    }),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });
  }

  /**
   * Inserts a new SiteOrder into the siteOrder array.
   * Note: Company instance does not be updated by this method.
   * @param {Object} params - The parameters for the SiteOrder.
   * @param {string} params.siteId - The ID of the site.
   * @param {string} params.shiftType - The shift type associated with the site.
   * @param {number} [index=-1] - The position to insert the new SiteOrder. Defaults to the end.
   */
  addSiteOrder({ siteId, shiftType }, index = -1) {
    const newOrder = new SiteOrder({ siteId, shiftType });
    if (this.siteOrder.some((order) => order.key === newOrder.key)) {
      throw new Error(`SiteOrder with key ${newOrder.key} already exists.`);
    }
    if (index === -1) {
      this.siteOrder.push(newOrder);
    } else {
      this.siteOrder.splice(index, 0, newOrder);
    }
  }

  /**
   * Changes the order of a SiteOrder in the siteOrder array.
   * Note: Company instance does not be updated by this method.
   * @param {number} oldIndex - The current index of the SiteOrder.
   * @param {number} newIndex - The new index to move the SiteOrder to.
   */
  changeSiteOrder(oldIndex, newIndex) {
    const length = this.siteOrder.length;
    if (oldIndex < 0 || oldIndex >= length) {
      throw new Error("Invalid oldIndex for site order change.");
    }
    if (newIndex < 0 || newIndex >= length) {
      throw new Error("Invalid newIndex for site order change.");
    }
    const [movedOrder] = this.siteOrder.splice(oldIndex, 1);
    this.siteOrder.splice(newIndex, 0, movedOrder);
  }

  /**
   * Removes a SiteOrder from the siteOrder array.
   * Note: Company instance does not be updated by this method.
   * @param {string|Object} arg - The key or {siteId, shiftType} of the SiteOrder to remove.
   */
  removeSiteOrder(arg) {
    // Determine the key based on the argument type.
    // If it's a string, use it directly. If it's an object, construct the key.
    // Throw an error if the argument is invalid.
    let key = "";
    if (typeof arg === "string") {
      key = arg;
    } else if (typeof arg === "object" && arg.siteId && arg.shiftType) {
      key = `${arg.siteId}-${arg.shiftType}`;
    } else {
      throw new Error(
        "Invalid argument for removeSiteOrder. Must be a string key or an object with siteId and shiftType."
      );
    }

    // Find the index of the SiteOrder with the specified key.
    // Throw an error if it does not exist.
    const index = this.siteOrder.findIndex((order) => order.key === key);
    if (index === -1) {
      throw new Error(`SiteOrder with key ${key} does not exist.`);
    }

    // Remove the SiteOrder from the array.
    this.siteOrder.splice(index, 1);
  }
}
