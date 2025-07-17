import { defField } from "./parts/fieldDefinitions.js";
import Site from "./Site.js";
import { fetchDocsApi, fetchItemByKeyApi } from "./apis/index.js";
import SiteOperationSchedule from "./SiteOperationSchedule.js";

export default class OperationResult extends SiteOperationSchedule {
  static className = "稼働実績";
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    ...SiteOperationSchedule.classProps,
    /**
     * 現場ドキュメントID
     * - `SiteOperationSchedule` にそもそも含まれるが、API 経由での取得設定を追加するため上書き
     */
    siteId: defField("siteId", {
      required: true,
      component: {
        attrs: {
          api: () => fetchDocsApi(Site),
          clearable: true,
          fetchItemByKeyApi: () => fetchItemByKeyApi(Site),
        },
      },
    }),
    /** 基本単価 */
    unitPrice: defField("price", { label: "基本単価", required: true }),
    /** 時間外単価 */
    overTimeUnitPrice: defField("price", {
      label: "時間外単価",
      required: true,
    }),
    /** 資格者単価 */
    unitPriceQualified: defField("price", {
      label: "資格者単価",
      required: true,
    }),
    /** 資格者時間外単価 */
    overTimeUnitPriceQualified: defField("price", {
      label: "資格者時間外単価",
      required: true,
    }),

    /**
     * 現場稼働予定のドキュメントID
     * - `SiteOperationSchedule` ドキュメントから生成されたドキュメントであれば
     *   生成元の ドキュメントIDを保持する。
     */
    siteOperationScheduleId: defField("oneLine", { hidden: true }),
  };

  static headers = [
    { title: "日付", key: "dateAt" },
    { title: "現場", key: "siteId", value: "siteId" },
  ];

  afterInitialize() {
    super.afterInitialize();
    Object.defineProperties(this, {
      amountBase: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees.filter(
            ({ isQualificated, isOjt }) => !isQualificated && !isOjt
          ).length,
        set: (v) => {},
      },
      amountOverTimeMinutesBase: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees
            .filter(({ isQualificated, isOjt }) => !isQualificated && !isOjt)
            .reduce((sum, emp) => sum + emp.overTimeMinutes, 0),
        set: (v) => {},
      },
      amountQualificated: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees.filter(
            ({ isQualificated, isOjt }) => !isQualificated && !isOjt
          ).length,
        set: (v) => {},
      },
      salesBase: {
        configurable: true,
        enumerable: true,
        get: () => this.amountBase * this.unitPrice,
        set: (v) => {},
      },
      salesQualificated: {
        configurable: true,
        enumerable: true,
        get: () => this.amountQualificated * this.unitPriceQualified,
        set: (v) => {},
      },
    });
  }
}
