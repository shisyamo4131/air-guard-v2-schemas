import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";
import { runTransaction } from "firebase/firestore";
import OperationResult from "./OperationResult.js";

export default class SiteOperationSchedule extends FireModel {
  static className = "現場稼働予定";
  static collectionPath = "SiteOperationSchedules";
  static useAutonumber = false;
  static logicalDelete = false;
  static classProps = {
    siteId: defField("siteId", { required: true, hidden: true }),
    dateAt: defField("dateAt", { label: "日付", required: true }),
    dayType: defField("dayType", { required: true }),
    shiftType: defField("shiftType", { required: true }),
    startAt: defField("dateTimeAt", { label: "予定開始日時", required: true }),
    endAt: defField("dateTimeAt", { label: "予定終了日時", required: true }),
    workingMinutes: defField("workingMinutes", { required: true }),
    breakMinutes: defField("breakMinutes", { required: true }),
    overTimeWorkingMinutes: defField("overTimeWorkingMinutes", {
      required: true,
    }),
    requiredPersonnel: defField("number", {
      label: "必要人数",
      required: true,
    }),
    qualificationRequired: defField("check", { label: "要資格者" }),
    workDescription: defField("oneLine", { label: "作業内容" }),
    remarks: defField("multipleLine", { label: "備考" }),

    /** 単価情報は hidden とし、required は false とする */
    // これらのフィールドは、取極めから選択した場合にのみ設定されるため
    // 直接入力は想定されていない。
    // 当該クラスから複製された OperationResult クラスではこれらのフィールドを必須とする。
    unitPrice: defField("price", { label: "単価", hidden: true }),
    overTimeUnitPrice: defField("price", { label: "時間外単価", hidden: true }),
    unitPriceQualified: defField("price", {
      label: "資格者単価",
      hidden: true,
    }),
    overTimeUnitPriceQualified: defField("price", {
      label: "資格者時間外単価",
      hidden: true,
    }),
    billingUnitType: defField("billingUnitType", { required: true }),
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

  /**
   * ドキュメントを作成します。
   * - トランザクションを使用して、現場稼働予定と同時に稼働実績を作成します。
   * - 現場稼働予定のドキュメントIDを稼働実績の `siteOperationScheduleId` フィールドに設定します。
   * - 稼働実績の作成に失敗した場合、現場稼働予定の作成もロールバックされます。
   * @return {Promise<DocumentReference>} 作成されたドキュメントの参照を返します。
   */
  async create() {
    const adapter = this.constructor.getAdapter();
    const firestore = adapter.firestore;
    const operationResult = new OperationResult(this.toObject());
    const docRef = await runTransaction(firestore, async (transaction) => {
      const docRef = await super.create({ transaction });
      operationResult.siteOperationScheduleId = docRef.id;
      operationResult.status = "scheduled";
      await operationResult.create({ transaction });
    });

    return docRef;
  }

  /**
   * ドキュメントを更新します。
   * - トランザクションを使用して、現場稼働予定と同時に稼働実績を更新します。
   * - 自身のドキュメントIDを持つ稼働実績を取得し、現場稼働予定のデータで更新します。
   * - 自身のドキュメントIDを持つ稼働実績が存在しない場合、新たに稼働実績を作成します。
   * - 稼働実績の更新に失敗した場合、現場稼働予定の更新もロールバックされます。
   * @return {Promise<void>} 更新が成功した場合、何も返しません
   * @throws {Error} 稼働実績として承認済みの現場稼働予定が存在する場合、更新できない旨のエラーをスローします。
   * @throws {Error} トランザクション内での更新に失敗した場合、エラーをスローします。
   */
  async update() {
    const adapter = this.constructor.getAdapter();
    const firestore = adapter.firestore;
    const operationResults = await new OperationResult().fetchDocs({
      constraints: [["where", "siteOperationScheduleId", "==", this.docId]],
    });

    if (operationResults.some(({ status }) => status === "approved")) {
      throw new Error(
        "稼働実績として承認済みの現場稼働予定です。更新できません。"
      );
    }

    await runTransaction(firestore, async (transaction) => {
      await super.update({ transaction });
      if (operationResults && operationResults.length > 0) {
        for (const result of operationResults) {
          result.initialize({
            ...result.toObject(),
            ...this.toObject(),
            docId: result.docId,
          });
          await result.update({ transaction });
        }
      } else {
        const operationResult = new OperationResult(this.toObject());
        operationResult.siteOperationScheduleId = this.docId;
        await operationResult.create({ transaction });
      }
    });
  }

  /**
   * ドキュメントを削除します。
   * - トランザクションを使用して、現場稼働予定と同時に稼働実績を削除します。
   * - 現場稼働予定のドキュメントIDを持つ稼働実績を取得し、削除します。
   * - 稼働実績の削除に失敗した場合、現場稼働予定の削除もロールバックされます。
   * @return {Promise<void>} 削除が成功した場合、何も返しません
   * @throws {Error} 稼働実績として承認済みの現場稼働予定が存在する場合、削除できない旨のエラーをスローします。
   * @throws {Error} トランザクション内での削除に失敗した場合、エラーをスローします。
   */
  async delete() {
    const adapter = this.constructor.getAdapter();
    const firestore = adapter.firestore;
    const operationResults = await new OperationResult().fetchDocs({
      constraints: [["where", "siteOperationScheduleId", "==", this.docId]],
    });

    if (operationResults.some(({ status }) => status === "approved")) {
      throw new Error(
        "稼働実績として承認済みの現場稼働予定です。削除できません。"
      );
    }

    await runTransaction(firestore, async (transaction) => {
      await super.delete({ transaction });
      if (operationResults && operationResults.length > 0) {
        for (const result of operationResults) {
          await result.delete({ transaction });
        }
      }
    });
  }
}
