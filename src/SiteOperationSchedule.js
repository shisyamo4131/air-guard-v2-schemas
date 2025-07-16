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
    /**
     * 開始時刻（HH:MM形式）
     */
    startTime: defField("time", {
      label: "開始時刻",
      required: true,
      default: "08:00",
    }),
    /**
     * 終了時刻（HH:MM形式）
     */
    endTime: defField("time", {
      label: "終了時刻",
      required: true,
      default: "17:00",
    }),
    /**
     * 規定実働時間（分）
     * - `unitPrice`(または `unitPriceQualified`) で定められた単価に対する最大実働時間。
     * - この時間を超えると、残業扱いとなる。
     */
    regulationWorkMinutes: defField("regulationWorkMinutes", {
      required: true,
    }),
    /**
     * 休憩時間（分）
     * - `startTime` と `endTime` の間に取得される休憩時間（分）。
     * - `totalWorkMinutes` の計算に使用される。
     */
    breakMinutes: defField("breakMinutes", { required: true }),
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
       * 開始日時（Date オブジェクト）
       * - `dateAt` を基に、`startTime` を設定した Date オブジェクトを返す。
       */
      startAt: {
        configurable: true,
        enumerable: true,
        get: () => this._getStartAt(this.dateAt),
        set: (v) => {},
      },
      /**
       * 終了日時（Date オブジェクト）
       * - `dateAt` を基に、`endTime` を設定した Date オブジェクトを返す。
       */
      endAt: {
        configurable: true,
        enumerable: true,
        get: () => this._getEndAt(this.dateAt),
        set: (v) => {},
      },
      /**
       * 翌日フラグ
       * - `startTime` が `endTime` よりも遅い場合、翌日扱いとする。
       */
      isSpansNextDay: {
        configurable: true,
        enumerable: true,
        get: () => this.startTime > this.endTime,
        set: (v) => {},
      },
      /**
       * 総実働時間（分）
       * - `startAt` と `endAt` の差から休憩時間を引いた値。
       * - `startAt` と `endAt` の差が負の場合は 0を返す。
       */
      totalWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          const start = this.startAt;
          const end = this.endAt;
          const breakMinutes = this.breakMinutes || 0;
          const diff = (end - start) / (1000 * 60); // ミリ秒を分に変換
          return Math.max(0, diff - breakMinutes);
        },
        set: (v) => {},
      },
      /**
       * 残業時間（分）
       * - `totalWorkMinutes` から `regulationWorkMinutes` を引いた値。
       * - 残業時間は負にならないように 0 を下限とする。
       */
      overTimeWorkMinutes: {
        configurable: true,
        enumerable: true,
        get: () => {
          return Math.max(
            0,
            this.totalWorkMinutes - this.regulationWorkMinutes
          );
        },
        set: (v) => {},
      },
    });
  }

  /**
   * 開始時刻の時間部分を取得します。
   * - `startTime` が設定されていない場合は 0 を返します。
   */
  get startHour() {
    return this.startTime ? Number(this.startTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get startMinute() {
    return this.startTime ? Number(this.startTime.split(":")[1]) : 0;
  }

  /**
   * 終了時刻の時間部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endHour() {
    return this.endTime ? Number(this.endTime.split(":")[0]) : 0;
  }

  /**
   * 終了時刻の分部分を取得します。
   * - `endTime` が設定されていない場合は 0 を返します。
   */
  get endMinute() {
    return this.endTime ? Number(this.endTime.split(":")[1]) : 0;
  }

  /**
   * 引数で受け取った日付を Date オブジェクトに変換して返します。
   * - 引数が文字列の場合、日付文字列として解釈します。
   * - 引数がオブジェクトの場合、Date オブジェクトとして解釈します。
   * - 引数が未指定または null の場合、現在の日付を返します。
   * - `startTime` がセットされている場合はその時刻を反映します。
   * @param {string|Object} date 日付文字列または Date オブジェクト
   * @returns {Date} 変換後の Date オブジェクト
   */
  _getStartAt(date) {
    // date が null/undefined 以外で、かつ string／Date でないならエラー
    if (date != null && !(typeof date === "string" || date instanceof Date)) {
      throw new Error("Invalid date type");
    }

    // 空文字・undefined・null → Date.now()、それ以外 → date をそのまま使う
    const result = new Date(date || Date.now());

    // 開始時刻を設定（秒・ミリ秒は 0）
    result.setHours(this.startHour, this.startMinute, 0, 0);
    return result;
  }

  /**
   * 引数で受け取った日付を Date オブジェクトに変換して返します。
   * - 引数が文字列の場合、日付文字列として解釈します。
   * - 引数がオブジェクトの場合、Date オブジェクトとして解釈します。
   * - 引数が未指定または null の場合、現在の日付を返します。
   * - `endTime` がセットされている場合はその時刻を反映します。
   * @param {string|Object} date 日付文字列または Date オブジェクト
   * @returns {Date} 変換後の Date オブジェクト
   */
  _getEndAt(date) {
    // date が null/undefined 以外で、かつ string／Date でないならエラー
    if (date != null && !(typeof date === "string" || date instanceof Date)) {
      throw new Error("Invalid date type");
    }

    // 空文字・undefined・null → Date.now()、それ以外 → date をそのまま使う
    const result = new Date(date || Date.now());

    if (this.isSpansNextDay) {
      // 次の日にまたがる場合は、翌日の開始時刻を設定
      result.setDate(result.getDate() + 1);
    }

    // 開始時刻を設定（秒・ミリ秒は 0）
    result.setHours(this.endHour, this.endMinute, 0, 0);
    return result;
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
