import Operation from "./Operation.js";
import { defField } from "./parts/fieldDefinitions.js";

/**
 * @file OperationResult.js
 * @description A class representing the result of an operation.
 * - Inherits from the Operation class.
 */
export default class OperationResult extends Operation {
  static className = "稼働実績";
  static collectionPath = "OperationResults";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    ...Operation.classProps,
    /**
     * 規定実働時間（分）
     * - `unitPrice`(または `unitPriceQualified`) で定められた単価に対する最大実働時間。
     * - この時間を超えると、残業扱いとなる。
     */
    regulationWorkMinutes: defField("regulationWorkMinutes", {
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 基本単価 */
    unitPrice: defField("price", {
      label: "基本単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 時間外単価 */
    overTimeUnitPrice: defField("price", {
      label: "時間外単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 資格者単価 */
    unitPriceQualified: defField("price", {
      label: "資格者単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /** 資格者時間外単価 */
    overTimeUnitPriceQualified: defField("price", {
      label: "資格者時間外単価",
      required: true,
      colsDefinition: { cols: 12, sm: 6 },
    }),
    /**
     * 請求単位
     * - `BILLING_UNIT_TYPE` で定義された請求単位。
     */
    billingUnitType: defField("billingUnitType", { required: true }),
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
      /**
       * 作業員の人数
       * - 資格者・OJT は除外
       */
      amountBase: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.workers.filter(
            ({ isQualificated, isOjt }) => !isQualificated && !isOjt
          ).length,
        set: (v) => {},
      },
      /**
       * 作業員の時間外実働時間（分）
       * - 資格者・OJT は除外
       */
      amountOverTimeMinutesBase: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.workers
            .filter(({ isQualificated, isOjt }) => !isQualificated && !isOjt)
            .reduce(
              (sum, wkr) =>
                sum +
                Math.max(wkr.totalWorkMinutes - this.regulationWorkMinutes, 0),
              0
            ),
        set: (v) => {},
      },
      /**
       * 資格者の人数
       * - OJT は除外
       */
      amountQualificated: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.employees.filter(
            ({ isQualificated, isOjt }) => isQualificated && !isOjt
          ).length,
        set: (v) => {},
      },
      /**
       * 資格者の時間外実働時間（分）
       * - OJT は除外
       */
      amountOverTimeMinutesQualified: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.workers
            .filter(({ isQualificated, isOjt }) => isQualificated && !isOjt)
            .reduce(
              (sum, wkr) =>
                sum +
                Math.max(wkr.totalWorkMinutes - this.regulationWorkMinutes, 0),
              0
            ),
        set: (v) => {},
      },
      /**
       * 基本売上金額
       * - `amountBase` と `unitPrice` の積
       */
      salesBase: {
        configurable: true,
        enumerable: true,
        get: () => this.amountBase * this.unitPrice,
        set: (v) => {},
      },
      /**
       * 基本時間外売上金額
       * - `amountOverTimeMinutesBase` と `overTimeUnitPrice` の積
       */
      salesOvertimeBase: {
        configurable: true,
        enumerable: true,
        get: () => this.amountOverTimeMinutesBase * this.overTimeUnitPrice,
        set: (v) => {},
      },
      /**
       * 資格者売上金額
       * - `amountQualificated` と `unitPriceQualified` の積
       */
      salesQualificated: {
        configurable: true,
        enumerable: true,
        get: () => this.amountQualificated * this.unitPriceQualified,
        set: (v) => {},
      },
      /**
       * 資格者時間外売上金額
       * - `amountOverTimeMinutesQualified` と `overTimeUnitPriceQualified` の積
       */
      salesOvertimeQualified: {
        configurable: true,
        enumerable: true,
        get: () =>
          this.amountOverTimeMinutesQualified * this.overTimeUnitPriceQualified,
        set: (v) => {},
      },
    });
  }
}
