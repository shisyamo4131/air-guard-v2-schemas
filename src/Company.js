/*****************************************************************************
 * Company Model ver 1.0.0
 * @author shisyamo4131
 *****************************************************************************/
import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { defAccessor } from "./parts/accessorDefinitions.js";
import Agreement from "./Agreement.js";
import SiteOrder from "./SiteOrder.js";

const classProps = {
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

export default class Company extends FireModel {
  static className = "会社";
  static collectionPath = "Companies";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = classProps;

  // Override `afterInitialize` to define computed properties.
  afterInitialize() {
    Object.defineProperties(this, {
      fullAddress: defAccessor("fullAddress"),
      prefecture: defAccessor("prefecture"),
    });

    /*************************************************************************
     * CUSTOM METHODS FOR siteOrder ARRAY
     * Note: These methods modify the siteOrder array directly.
     * The Company instance itself is not updated by these methods.
     * Use the provided public methods to interact with siteOrder.
     *************************************************************************/
    Object.defineProperties(this.siteOrder, {
      /**
       * Inserts a new SiteOrder into the `siteOrder` array.
       * @param {Object} params - The parameters for the SiteOrder.
       * @param {string} params.siteId - The ID of the site.
       * @param {string} params.shiftType - The shift type associated with the site.
       * @param {number} [index=-1] - The position to insert the new SiteOrder. Defaults to the end.
       * @returns {SiteOrder} The newly created SiteOrder instance.
       * @throws {Error} If a SiteOrder with the same key already exists.
       */
      add: {
        value: function ({ siteId, shiftType }, index = -1) {
          const newOrder = new SiteOrder({ siteId, shiftType });
          if (this.some((order) => order.key === newOrder.key)) {
            throw new Error(
              `SiteOrder with key ${newOrder.key} already exists.`
            );
          }
          index === -1 ? this.push(newOrder) : this.splice(index, 0, newOrder);
          return newOrder;
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Changes the order of a SiteOrder in the siteOrder array.
       * Note: Company instance does not be updated by this method.
       * @param {number} oldIndex - The current index of the SiteOrder.
       * @param {number} newIndex - The new index to move the SiteOrder to.
       * @returns {void}
       * @throws {Error} If oldIndex or newIndex are out of bounds.
       */
      change: {
        value: function (oldIndex, newIndex) {
          const length = this.length;
          if (oldIndex < 0 || oldIndex >= length) {
            throw new Error("Invalid oldIndex for site order change.");
          }
          if (newIndex < 0 || newIndex >= length) {
            throw new Error("Invalid newIndex for site order change.");
          }
          const [movedOrder] = this.splice(oldIndex, 1);
          this.splice(newIndex, 0, movedOrder);
        },
        writable: false,
        enumerable: false,
      },
      /**
       * Removes a SiteOrder from the siteOrder array.
       * Note: Company instance does not be updated by this method.
       * @param {string|Object} arg - The key or {siteId, shiftType} of the SiteOrder to remove.
       * @returns {void}
       * @throws {Error} If the SiteOrder does not exist or if the argument is invalid.
       */
      remove: {
        value: function (arg) {
          let key = "";
          if (typeof arg === "string") {
            key = arg;
          } else if (typeof arg === "object" && arg.siteId && arg.shiftType) {
            key = `${arg.siteId}-${arg.shiftType}`;
          } else {
            throw new Error(
              "Invalid argument for remove. Must be a string key or an object with siteId and shiftType."
            );
          }

          const index = this.findIndex((order) => order.key === key);
          if (index === -1) {
            throw new Error(`SiteOrder with key ${key} does not exist.`);
          }

          this.splice(index, 1);
        },
        writable: false,
        enumerable: false,
      },
    });
  }

  /***************************************************************************
   * PUBLIC METHODS
   ***************************************************************************/
}
