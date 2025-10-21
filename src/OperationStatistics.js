/*****************************************************************************
 * OperationStatistics Model ver 1.0.0
 * @author shisyamo4131
 * ---------------------------------------------------------------------------
 * - Define and provides `statistics` property for classes extending Operation.
 * - Provides `accessors` method for treating `statistics` as computed property.
 * ---------------------------------------------------------------------------
 * @props {object} statistics - Statistics of workers in the operation result.
 *****************************************************************************/
import { BaseClass } from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions";

class InitialValues extends BaseClass {
  static className = "InitialValues";
  static classProps = {
    quantity: defField("number", { default: 0 }),
    regularTimeWorkMinutes: defField("number", { default: 0 }),
    overtimeWorkMinutes: defField("number", { default: 0 }),
    totalWorkMinutes: defField("number", { default: 0 }),
  };
}

class CategoryStructure extends BaseClass {
  static className = "CategoryStructure";
  static classProps = {
    ...InitialValues.classProps,
    ojt: defField("object", {
      default: () => new InitialValues(),
      customClass: InitialValues,
    }),
  };
}

class Statistics extends BaseClass {
  static className = "Statistics";
  static classProps = {
    base: defField("object", {
      default: () => new CategoryStructure(),
      customClass: CategoryStructure,
    }),
    qualificated: defField("object", {
      default: () => new CategoryStructure(),
      customClass: CategoryStructure,
    }),
    total: defField("object", {
      default: () => new CategoryStructure(),
      customClass: CategoryStructure,
    }),
  };
}

export default class OperationStatistics extends BaseClass {
  static className = "OperationStatistics";
  static classProps = {
    statistics: defField("object", {
      default: () => new Statistics(),
      customClass: Statistics,
    }),
  };

  static accessors(self) {
    Object.defineProperties(self, {
      statistics: {
        configurable: true,
        enumerable: true,
        get() {
          const result = new Statistics().toObject();

          // 各カテゴリに値を追加する関数
          const addToCategory = (categoryObj, worker, isOjt) => {
            const target = isOjt ? categoryObj.ojt : categoryObj;
            target.quantity += 1;
            target.regularTimeWorkMinutes += worker.regularTimeWorkMinutes;
            target.overtimeWorkMinutes += worker.overtimeWorkMinutes;
            target.totalWorkMinutes += worker.totalWorkMinutes;
          };

          self.workers.forEach((worker) => {
            const category = worker.isQualificated ? "qualificated" : "base";
            const isOjt = worker.isOjt;

            // 該当カテゴリ（base/qualificated）に追加
            addToCategory(result[category], worker, isOjt);

            // 全体合計に追加
            addToCategory(result.total, worker, isOjt);
          });

          return result;
        },
        set(v) {},
      },
    });
  }
}
