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
    startDate: defField("date", {
      label: "開始日",
      required: true,
      component: {
        attrs: {
          // 値が更新されたら endDate にも同一値をセット
          "onUpdate:modelValue": (item, updateProperties) => {
            return (event) => {
              updateProperties({ endDate: event });
            };
          },
        },
      },
    }),
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      component: {
        attrs: {
          /**
           * 開始時刻の入力に応じて終了時刻を自動入力する機能を実装しようとしたが一旦保留。
           * - 何時間後をセットするのかはユーザーによって変わるのでは？
           * - 開始時刻のみを編集する更新処理で終了時刻が勝手に変更されるのはリスク。
           */
          // // 値が更新されたら endTime に 8時間 追加した時刻をセット
          // "onUpdate:modelValue": (item, updateProperties) => {
          //   return (event) => {
          //     // `event` はユーザーが入力した文字列
          //     // 1文字ずつ増減するため、結果として時刻文字列（hh:mm）と判断できなければ何もせずに終了
          //     // また、item.startAt が日付オブジェクトでない場合も何もせずに終了
          //     if (!event) return;
          //     if (
          //       !/^\d{2}:\d{2}$/.test(event) ||
          //       !(item.startAt instanceof Date)
          //     )
          //       return;
          //     const [hours, minutes] = event.split(":").map(Number);
          //     const startDateTime = new Date(item.startAt);
          //     startDateTime.setHours(hours, minutes, 0, 0);
          //     // 8時間後の時刻を計算
          //     const endDateTime = new Date(startDateTime);
          //     endDateTime.setHours(endDateTime.getHours() + 8);
          //     // 終了日と終了時刻を更新
          //     const endDate = new Date(endDateTime);
          //     endDate.setHours(0, 0, 0, 0); // 日付のみをセット
          //     const endTime = `${String(endDateTime.getHours()).padStart(
          //       2,
          //       "0"
          //     )}:${String(endDateTime.getMinutes()).padStart(2, "0")}`;
          //     updateProperties({ endDate: endDate, endTime: endTime });
          //   };
          // },
        },
      },
    }),
    endDate: defField("date", { label: "終了日", required: true }),
    endTime: defField("time", { label: "終了時刻", required: true }),
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
       * 当該スケジュールの実際の開始時刻を Date オブジェクトで返します。
       * - `startDate` プロパティに設定されている Date オブジェクトは `年月日` のみを表しています。
       * - 開始時刻は `startTime` プロパティに文字列として保存されています。
       * - `startDate` と `startTime` を参照して、実際の開始時刻を Date オブジェクトとして返します。
       * - 読み取り専用のプロパティで、セッターは機能しません。
       */
      startAt: {
        enumerable: true,
        get() {
          if (!this.startDate || !this.startTime) return null;

          try {
            // startDate は Date オブジェクトで、通常は日時の部分が 00:00:00 になっている
            // startTime は "HH:mm" 形式の文字列
            const [hours, minutes] = this.startTime.split(":").map(Number);

            // startDate のコピーを作成し、時刻情報を設定
            const startDateTime = new Date(this.startDate);
            startDateTime.setHours(hours, minutes, 0, 0);

            return startDateTime;
          } catch (error) {
            console.error(
              "[SiteOperationSchedule.js startAt getter] Error parsing date or time:",
              error
            );
            return null;
          }
        },
        set(v) {},
      },

      /**
       * 当該スケジュールの実際の終了時刻を Date オブジェクトで返します。
       * - `endDate` プロパティに設定されている Date オブジェクトは `年月日` のみを表しています。
       * - 終了時刻は `endTime` プロパティに文字列として保存されています。
       * - `endDate` と `endTime` を参照して、実際の終了時刻を Date オブジェクトとして返します。
       * - 読み取り専用のプロパティで、セッターは機能しません。
       */
      endAt: {
        enumerable: true,
        get() {
          if (!this.endDate || !this.endTime) return null;

          try {
            // endDate は Date オブジェクトで、通常は日時の部分が 00:00:00 になっている
            // endTime は "HH:mm" 形式の文字列
            const [hours, minutes] = this.endTime.split(":").map(Number);

            // endDate のコピーを作成し、時刻情報を設定
            const endDateTime = new Date(this.endDate);
            endDateTime.setHours(hours, minutes, 0, 0);

            return endDateTime;
          } catch (error) {
            console.error(
              "[SiteOperationSchedule.js endAt getter] Error parsing date or time:",
              error
            );
            return null;
          }
        },
        set(v) {},
      },

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
