/**
 * Represents the order of site-shift type pairs for placement management.
 *
 * @class SiteOrder
 * @extends BaseClass
 *
 * @property {string} siteId - The unique identifier for the site. Required.
 * @property {string} shiftType - The type of shift associated with the site. Required.
 *
 * @property {string} key - A computed property that returns a unique key in the format `${siteId}-${shiftType}` for identifying the site-shift pair.
 */
import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

/**
 * Represents the order configuration for a site and shift type.
 *
 * @class SiteOrder
 * @extends BaseClass
 *
 * @property {string} siteId - The unique identifier for the site.
 * @property {string} shiftType - The type of shift associated with the site.
 * @property {string} key - A composite key in the format "siteId-shiftType".
 *
 * @getter
 * Returns the composite key for the site and shift type in the format "siteId-shiftType".
 *
 * @setter
 * Sets the `siteId` and `shiftType` properties from a composite key string in the format "siteId-shiftType".
 */
export default class SiteOrder extends BaseClass {
  static className = "現場配置順序";
  static classProps = {
    siteId: defField("oneLine", { required: true }),
    shiftType: defField("shiftType", { required: true }),
  };

  /**
   * Gets the composite key for this site and shift type.
   * @returns {string} The key in the format "siteId-shiftType".
   */
  get key() {
    return `${this.siteId}-${this.shiftType}`;
  }

  /**
   * Setter for the `key` property.
   * Expects a string in the format "siteId-shiftType".
   * Splits the input string and assigns the values to `siteId` and `shiftType` properties if both are present.
   * Ignores the value if it is not a string.
   *
   * @param {string} value - The key string in the format "siteId-shiftType".
   */
  set key(value) {
    if (typeof value !== "string") return;
    const [siteId, shiftType] = value.split("-");
    if (siteId && shiftType) {
      this.siteId = siteId;
      this.shiftType = shiftType;
    }
  }
}
