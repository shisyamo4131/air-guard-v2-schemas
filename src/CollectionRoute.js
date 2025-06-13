/**
 * @file ./src/CollectionRoute.js
 * @description ルート情報クラス
 */
import FireModel from "air-firebase-v2";
import { defField } from "./parts/fieldDefinitions.js";

export default class CollectionRoute extends FireModel {
  static collectionPath = "CollectionRoutes";
  static useAutonumber = false;
  static logicalDelete = true;

  static classProps = {
    /** ルートコード */
    code: defField("code", { label: "ルートコード" }),

    /** ルート名 */
    name: defField("name", { label: "ルート名", required: true, length: 50 }),

    /** ルートの説明 (任意) */
    description: defField("description"),

    /**
     * 排出場所リスト
     * - 排出場所の回収順序を管理するためのプロパティ
     * - dayOfWeek: 曜日を表す数値 (例: 0=日, 1=月, ..., 6=土)
     * - { dayOfWeek: number, siteId: string, remarks: string }
     */
    stops: defField("stops", { hidden: true }),

    /** 有効フラグ (このルートが現在アクティブかどうか) */
    isActive: defField("isActive", {
      hidden: (editMode) => editMode === "CREATE",
    }),

    /** 備考 (任意) */
    remarks: defField("remarks"),
  };

  static tokenFields = ["name", "code"]; // nameやcodeで部分一致検索を可能にする場合

  afterInitialize() {
    super.afterInitialize();

    Object.defineProperties(this, {
      /**
       * stops プロパティが変更されたかどうかを表すフラグ
       * - 比較には _beforeData.stops を使用
       * - stops には dayOfWeek を含むため、曜日別で比較
       * - stops は配列に格納されているオブジェクトの順序がそのまま回収順序を表すため
       *   比較の際に siteId でのソートは行わず、曜日ごとの比較のみに留める
       * - 回収順序が異なる場合も変更されたこととする
       * - setter は何もしない。
       */
      isStopsChanged: {
        configurable: true,
        enumerable: false,
        get() {
          if (!this._beforeData || !this._beforeData.stops) {
            return !!this.stops && this.stops.length > 0;
          }
          if (!this.stops) {
            return (
              !!this._beforeData.stops && this._beforeData.stops.length > 0
            );
          }

          if (this.stops.length !== this._beforeData.stops.length) {
            return true;
          }

          // 曜日ごとに比較
          for (let day = 0; day < 7; day++) {
            const currentDayStops = this.stops.filter(
              (stop) => stop.dayOfWeek === day
            );
            const beforeDayStops = this._beforeData.stops.filter(
              (stop) => stop.dayOfWeek === day
            );

            if (currentDayStops.length !== beforeDayStops.length) {
              return true;
            }

            // 回収順序も比較
            for (let i = 0; i < currentDayStops.length; i++) {
              if (
                !beforeDayStops[i] ||
                currentDayStops[i].siteId !== beforeDayStops[i].siteId ||
                currentDayStops[i].remarks !== beforeDayStops[i].remarks
              ) {
                return true;
              }
            }
          }

          return false;
        },
        set(value) {
          // setter は何もしない
        },
      },

      /**
       * stops 配列に保存されているオブジェクトの siteId プロパティの値を重複無しでリストしたプロパティです。
       */
      siteIds: {
        configurable: true,
        enumerable: true,
        get() {
          if (!this.stops || !Array.isArray(this.stops)) {
            return [];
          }
          const siteIds = this.stops.map((stop) => stop.siteId);
          return [...new Set(siteIds)];
        },
        set(value) {
          // setter は何もしない
        },
      },
    });
  }

  /**
   * 引数で指定されたオブジェクトを stops プロパティに追加します。
   * - dayOfWeek, siteId の組み合わせは一意にならなければならず、重複する場合はエラーをスローします。
   * @param {object} stopObject - 追加するオブジェクト。
   * @param {number} stopObject.dayOfWeek - 曜日を表す数値 (0-6)。
   * @param {string} stopObject.siteId - 排出場所のID。
   * @param {string} [stopObject.remarks] - 備考 (任意)。
   */
  addStop({ dayOfWeek, siteId, remarks }) {
    if (!this.stops) this.stops = [];

    // 重複チェック
    const existingStop = this.stops.find(
      (stop) => stop.dayOfWeek === dayOfWeek && stop.siteId === siteId
    );
    if (existingStop) {
      throw new Error(
        // `Stop with dayOfWeek ${dayOfWeek} and siteId ${siteId} already exists.`
        `既に登録されています。`
      );
    }

    this.stops.push({ dayOfWeek, siteId, remarks: remarks || "" });
  }

  /**
   * stop プロパティの任意のオブジェクトを指定されたオブジェクトで置き換えます。
   * @param {*} param0
   */
  changeStop({ dayOfWeek, sourceSiteId, targetSiteId, remarks }) {
    if (!this.stops) return;

    const index = this.stops.findIndex(
      (stop) => stop.dayOfWeek === dayOfWeek && stop.siteId === sourceSiteId
    );

    if (index === -1) {
      throw new Error(
        `Stop with dayOfWeek ${dayOfWeek} and siteId ${sourceSiteId} not found.`
      );
    }

    // 重複チェック (置き換え後の siteId が既存の他のストップと重複しないか)
    const existingStop = this.stops.find(
      (stop, i) =>
        i !== index &&
        stop.dayOfWeek === dayOfWeek &&
        stop.siteId === targetSiteId
    );
    if (existingStop) {
      throw new Error(
        `Stop with dayOfWeek ${dayOfWeek} and siteId ${targetSiteId} already exists.`
      );
    }

    this.stops[index] = {
      dayOfWeek,
      siteId: targetSiteId,
      remarks: remarks || "",
    };
  }

  /**
   * 指定された dayOfWeek と siteId を持つストップを stops プロパティから削除します。
   * @param {object} stopObject - 追加するオブジェクトを一意に識別するための情報。
   * @param {number} dayOfWeek - 曜日を表す数値 (0-6)。
   * @param {string} siteId - 排出場所のID。
   */
  removeStop({ dayOfWeek, siteId }) {
    if (!this.stops) return;

    this.stops = this.stops.filter(
      (stop) => !(stop.dayOfWeek === dayOfWeek && stop.siteId === siteId)
    );
  }
}
