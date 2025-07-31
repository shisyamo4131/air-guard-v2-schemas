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
   * @param {number} oldIndex - The current index of the SiteOrder.
   * @param {number} newIndex - The new index to move the SiteOrder to.
   */
  changeSiteOrder(oldIndex, newIndex) {
    if (
      oldIndex < 0 ||
      oldIndex >= this.siteOrder.length ||
      newIndex < 0 ||
      newIndex >= this.siteOrder.length
    ) {
      throw new Error("Invalid index for site order change.");
    }
    const [movedOrder] = this.siteOrder.splice(oldIndex, 1);
    this.siteOrder.splice(newIndex, 0, movedOrder);
  }

  /**
   * Removes a SiteOrder from the siteOrder array.
   * @param {string} key - The key of the SiteOrder to remove.
   */
  removeSiteOrder(key) {
    const index = this.siteOrder.findIndex((order) => order.key === key);
    if (index === -1) {
      throw new Error(`SiteOrder with key ${key} does not exist.`);
    }
    this.siteOrder.splice(index, 1);
  }
}
