import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class SiteOperationSchedule extends FireModel {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    siteId: defField("oneLine", {
      label: "現場",
      hidden: true,
      required: true,
    }),
    shiftType: defField("shiftType", { required: true }),
    startAt: defField("dateTime", {
      label: "開始日時",
      required: true,
      component: {
        attrs: {
          // 値が更新されたら endDate にも同一値をセット
          "onUpdate:modelValue": (item, updateProperties) => {
            return (event) => {
              updateProperties({ endAt: event });
            };
          },
        },
      },
    }),
    endAt: defField("dateTime", { label: "終了日", required: true }),
    requiredPersonnel: defField("number", {
      label: "必要人数",
      required: true,
    }),
    qualificationRequired: defField("check", { label: "要資格者" }),
    workDescription: defField("oneLine", { label: "作業内容" }),
    remarks: defField("multipleLine", { label: "備考" }),
  };

  afterInitialize() {
    Object.defineProperties(this, {
      /**
       * `startAt` と `endAt` を比較検証した結果を返します。
       * - `startAt` <= `endAt` であれば false を返します。
       * - `startAt` または `endAt` が有効な日付オブジェクトでない場合も false を返します。
       *   - `startAt` と `endAt` が有効な日付オブジェクトでない場合、算出元プロパティの `required` 属性によって
       *     必須入力となるため、データの妥当性は保たれます。
       * - `startAt` > `endAt` である場合、このプロパティはエラーメッセージを返します。
       * - セッターは機能しません。
       */
      hasError: {
        enumerable: true,
        get() {
          if (!this.startAt || !this.endAt) return false;

          if (this.startAt > this.endAt) {
            return "終了時刻は開始時刻より後に設定してください。";
          }

          return false;
        },
        set(v) {},
      },
    });
  }

  /**
   * ドキュメント作成前または更新前のデータ検証処理です。
   * - hasError プロパティが truthy である場合、その値をメッセージとしてエラーをスローします。
   * - プロミスを返します。
   * @return {Promise<void>}
   */
  beforeEdit() {
    return new Promise((resolve, reject) => {
      if (this.hasError) {
        reject(new Error(this.hasError));
      } else {
        resolve();
      }
    });
  }
}
