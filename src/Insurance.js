/*****************************************************************************
 * @file ./src/Insurance.js
 * @description 保険（健康保険、厚生年金保険、雇用保険）ベースクラス
 *****************************************************************************/
import { BaseClass } from "@shisyamo4131/air-firebase-v2";
import { VALUES as INSURANCE_STATUS } from "./constants/insurance-status.js";
import { defField } from "./parts/fieldDefinitions.js";

export const ERROR_MESSAGES = Object.freeze({
  INVALID_TRANSITION: (allowedStates) =>
    `不正な処理です。${allowedStates} の状態でなければ処理は行えません。`,
  PROCESSING_ONLY: (operation) =>
    `不正な処理です。'加入手続き中' の状態でなければ${operation}は行えません。`,
  ENROLLED_ONLY: (operation) =>
    `不正な処理です。'${INSURANCE_STATUS.ENROLLED.title}' の状態でなければ${operation}はできません。`,
  REQUIRED_FIELD: (field) => `${field}の指定が必要です。`,
  REQUIRED_DATE: (field) => `日付オブジェクトでの${field}の指定が必要です。`,
  NO_HISTORY: "復元する履歴がありません。",
  CANCEL_FIRST:
    "手続き中は復元処理を行えません。加入手続き取下げ処理を行ってください。",
});

/*****************************************************************************
 * @class Insurance
 * @method exempt - 現在の状態を `EXEMPT (適用除外)` に更新します。
 * @method enroll - 現在の状態を `ENROLLED (加入)` に更新します。
 * @method enrolled - 加入手続き中の状態を加入完了の状態に更新します。
 * @method cancelEnroll - 加入手続き中の状態を加入前の状態に更新します。
 * @method loss - 現在加入中の保険の喪失処理を行います。
 * @method rollback - 履歴から最新の状態を復元します。
 *****************************************************************************/
export class Insurance extends BaseClass {
  static className = "Insurance";
  static classProps = {
    status: defField("insuranceStatus", { required: true }),
    previousStatus: defField("insuranceStatus", { default: "" }),
    enrollmentDateAt: defField("enrollmentDateAt"),
    number: defField("insuranceNumber"),
    isProcessing: defField("check", { default: false }),
    history: defField("array", { default: [] }), // 状態遷移の履歴を記録するための配列
  };

  /**
   * 状態遷移のルールを定義します。
   * - `NOT_ENROLLED (未加入)` からは `ENROLLED (加入)` または `EXEMPT (適用除外)` に遷移可能です。
   * - `ENROLLED (加入)` からは `NOT_ENROLLED (未加入)` または `EXEMPT (適用除外)` に遷移可能です。
   * - `EXEMPT (適用除外)` からは `ENROLLED (加入)` に遷移可能です。
   * - その他の遷移は不正とします。
   */
  static VALID_TRANSITIONS = {
    // `NOT_ENROLLED` -> `ENROLLED` または `EXEMPT`
    [INSURANCE_STATUS.NOT_ENROLLED.value]: [
      INSURANCE_STATUS.ENROLLED.value,
      INSURANCE_STATUS.EXEMPT.value,
    ],

    // `ENROLLED` -> `NOT_ENROLLED` または `EXEMPT`
    [INSURANCE_STATUS.ENROLLED.value]: [
      INSURANCE_STATUS.NOT_ENROLLED.value,
      INSURANCE_STATUS.EXEMPT.value,
    ],

    // `EXEMPT` -> `ENROLLED`
    [INSURANCE_STATUS.EXEMPT.value]: [INSURANCE_STATUS.ENROLLED.value],
  };

  /**
   * 状態チェック用ヘルパーメソッド
   */
  isNotEnrolled() {
    return this.status === INSURANCE_STATUS.NOT_ENROLLED.value;
  }

  isEnrolled() {
    return this.status === INSURANCE_STATUS.ENROLLED.value;
  }

  isExempt() {
    return this.status === INSURANCE_STATUS.EXEMPT.value;
  }

  // 手続き状態チェック
  isProcessingEnrollment() {
    return this.isEnrolled() && this.isProcessing;
  }

  isEnrollmentComplete() {
    return this.isEnrolled() && !this.isProcessing;
  }

  /**
   * 状態遷移が可能かどうかを判定します。
   * @param {string} newStatus 遷移先の状態
   * @returns {boolean|string} 遷移可能な場合は true、遷移不可能な場合は許可されている状態のタイトル文字列（例: "'未加入' または '加入'"）
   */
  _canTransitionTo(newStatus) {
    const isValid =
      Insurance.VALID_TRANSITIONS[this.status]?.includes(newStatus) || false;

    if (!isValid) {
      // 遷移先の状態に遷移可能な元の状態のタイトルを返す
      const allowedStatuses = Object.values(INSURANCE_STATUS).filter((s) =>
        Insurance.VALID_TRANSITIONS[s.value]?.includes(newStatus),
      );

      const allowedTitles = allowedStatuses
        .map((s) => `'${s.title}'`)
        .join(" または ");

      return allowedTitles || "不正な状態";
    }

    return true;
  }

  /**
   * 履歴エントリを作成します。
   * @param {Object} options
   * @param {Date|null} options.lossDateAt 喪失日
   * @param {String|null} options.reason 喪失理由
   * @returns {Object} 履歴エントリ
   */
  _createHistoryEntry({ lossDateAt = null, reason = null } = {}) {
    return {
      status: this.status,
      previousStatus: this.previousStatus,
      enrollmentDateAt: this.enrollmentDateAt,
      lossDateAt,
      reason,
      number: this.number,
    };
  }

  /**
   * 状態を `EXEMPT (適用除外)` に更新します。
   * - `NOT_ENROLLED (未加入)` または `ENROLLED (加入)` の状態でなければ加入手続きは行えません。
   * - 現在加入中の場合、加入の履歴を記録します。ただし、加入手続き中 (isProcessing が true) である場合は、加入の実態がなかったこととし、履歴に記録しません。
   *   - 手続き中である場合、状態が `ENROLLED` から `EXEMPT` に更新される実務上の取り扱いは「加入申請の取り下げ（訂正）」に該当するものとし、加入の実態がなかったこととします。
   * - 現在加入中の場合、`lossDateAt (喪失日)` と `reason (喪失理由)` の指定が必要です。
   * - `EXEMPT` 状態への更新に伴い、加入日を null に更新します。
   * - `EXEMPT` 状態への更新に伴い、加入手続き中である場合があるため `isProcessing` を false に更新します。
   * - `EXEMPT` 状態への更新に伴い、被保険者番号（整理記号）を null に更新します。
   * @param {Object} options
   * @param {Date|null} options.lossDateAt 喪失日（現在加入中の場合に必要）
   * @param {String|null} options.reason 喪失理由（現在加入中の場合に必要）
   * @returns {void}
   * @throws {Error} `status` が `NOT_ENROLLED (未加入)` または `ENROLLED (加入)` でない場合にエラーをスローします。
   * @throws {Error} 現在加入中の場合に `lossDateAt` が日付オブジェクトでない場合にエラーをスローします。
   * @throws {Error} 現在加入中の場合に `reason` が指定されていない場合にエラーをスローします。
   */
  exempt({ lossDateAt, reason } = {}) {
    // validation
    const transitionCheck = this._canTransitionTo(
      INSURANCE_STATUS.EXEMPT.value,
    );
    if (transitionCheck !== true) {
      throw new Error(
        `不正な処理です。${transitionCheck} の状態でなければ適用除外処理は行えません。`,
      );
    }

    // 履歴に記録するための状態を作成
    const currentStatus = this._createHistoryEntry({ lossDateAt, reason });

    // 加入完了している場合の検証（手続き中の場合は不要）
    if (this.isEnrollmentComplete()) {
      // validation
      if (!lossDateAt || !(lossDateAt instanceof Date)) {
        throw new Error(ERROR_MESSAGES.REQUIRED_DATE("喪失日"));
      }
      if (!reason) {
        throw new Error(ERROR_MESSAGES.REQUIRED_FIELD("喪失理由"));
      }
    }

    // 現在加入中の場合、履歴に反映（ただし、手続き中である場合を除く）
    // 手続き中である場合、状態が `ENROLLED` から `EXEMPT` に更新される実務上の取り扱いは
    // 「加入申請の取り下げ（訂正）」に該当するものとし、加入の実態がなかったこととする。
    if (this.isEnrollmentComplete()) {
      this.history.push(currentStatus);
    }

    this.previousStatus = this.status;
    this.status = INSURANCE_STATUS.EXEMPT.value;
    this.enrollmentDateAt = null;
    this.isProcessing = false; // 加入手続き中である場合があるため false に更新しておく
    this.number = null;
  }

  /**
   * 状態を `ENROLLED (加入)` に更新します。
   * - `NOT_ENROLLED (未加入)` または `EXEMPT (適用除外)` の状態でなければ加入手続きは行えません。
   * - `immediate` が true の場合、被保険者番号（整理記号）の指定が必要です。
   * @param {Object} options
   * @param {Date} options.enrollmentDateAt 加入日
   * @param {String} options.number 被保険者番号（整理記号）
   * @param {Boolean} immediate 即時加入フラグ
   * @returns {void}
   * @throws {Error} `status` が `NOT_ENROLLED (未加入)` または `EXEMPT (適用除外)` でない場合にエラーをスローします。
   * @throws {Error} `enrollmentDateAt` が日付オブジェクトでない場合にエラーをスローします。
   * @throws {Error} `immediate` が true で `number` が指定されていない場合にエラーをスローします。
   */
  enroll({ enrollmentDateAt, number } = {}, immediate = false) {
    // validation
    const transitionCheck = this._canTransitionTo(
      INSURANCE_STATUS.ENROLLED.value,
    );
    if (transitionCheck !== true) {
      throw new Error(
        `不正な処理です。${transitionCheck} の状態でなければ加入手続きは行えません。`,
      );
    }

    if (!enrollmentDateAt || !(enrollmentDateAt instanceof Date)) {
      throw new Error(ERROR_MESSAGES.REQUIRED_DATE("加入日"));
    }

    if (immediate && !number) {
      throw new Error(
        ERROR_MESSAGES.REQUIRED_FIELD("被保険者番号（整理記号）"),
      );
    }

    // 状態を更新
    this.previousStatus = this.status;
    this.status = INSURANCE_STATUS.ENROLLED.value;
    this.enrollmentDateAt = enrollmentDateAt;
    this.number = immediate ? number : null;
    this.isProcessing = immediate ? false : true;
  }

  /**
   * 加入手続き中の状態を加入完了の状態に更新します。
   * - 被保険者番号（整理記号）が決定したタイミングで行われる処理です。
   * - `ENROLLED (加入)` かつ `isProcessing = true` の状態でなければ加入手続き完了処理は行えません。
   * - 被保険者番号（整理記号）の指定が必要です。
   * @param {Object} options
   * @param {String} options.number 被保険者番号（整理記号）
   * @returns {void}
   * @throws {Error} `status` が `ENROLLED (加入)` で `isProcessing` が true でない場合にエラーをスローします。
   * @throws {Error} 被保険者番号（整理記号）が指定されていない場合にエラーをスローします。
   */
  enrolled({ number } = {}) {
    // validation
    if (!this.isProcessingEnrollment()) {
      throw new Error(ERROR_MESSAGES.PROCESSING_ONLY("加入手続き完了処理"));
    }

    if (!number) {
      throw new Error(
        ERROR_MESSAGES.REQUIRED_FIELD("被保険者番号（整理記号）"),
      );
    }

    // 状態を更新
    this.number = number;
    this.isProcessing = false;
  }

  /**
   * 加入手続き中の状態を加入前の状態に更新します。
   * - `ENROLLED (加入)` かつ `isProcessing = true` の状態でなければ加入手続き取下げ処理は行えません。
   * - 加入手続き取下げ処理は、加入の実態がなかったこととするため、履歴には記録しません。
   * @returns {void}
   * @throws {Error} `status` が `ENROLLED (加入)` で `isProcessing` が true でない場合にエラーをスローします。
   */
  cancelEnroll() {
    // validation
    if (!this.isProcessingEnrollment()) {
      throw new Error(ERROR_MESSAGES.PROCESSING_ONLY("加入手続き取下げ処理"));
    }

    // 状態を更新
    this.status = this.previousStatus;
    this.previousStatus = null;
    this.enrollmentDateAt = null;
    this.number = null;
    this.isProcessing = false;
  }

  /**
   * 加入している保険の喪失処理を行います。
   * - `ENROLLED (加入)` の状態でなければ喪失処理は行えません。
   * - `lossDateAt`（喪失日）、`reason`（喪失理由）の指定が必要です。
   * - `isRetire` が true の場合、状態を `EXEMPT (適用除外)` ではなく `NOT_ENROLLED (未加入)` に更新します。
   * - `isRetire` が false の場合、状態を `EXEMPT (適用除外)` に更新します。
   * - `history` プロパティに、更新前の状態を記録します。
   * @param {*} options
   * @param {*} options.lossDateAt 喪失日
   * @param {*} options.reason 喪失理由
   * @param {*} options.isRetire 退職フラグ（true の場合、状態を `EXEMPT (適用除外)` ではなく `NOT_ENROLLED (未加入)` に更新します）
   * @returns {void}
   * @throws {Error} `status` が `ENROLLED (加入)` でない場合にエラーをスローします。
   * @throws {Error} 喪失日が日付オブジェクトでない場合にエラーをスローします。
   * @throws {Error} 喪失理由が指定されていない場合にエラーをスローします。
   */
  loss({ lossDateAt, reason } = {}, isRetire = false) {
    // validation
    if (!this.isEnrolled()) {
      throw new Error(ERROR_MESSAGES.ENROLLED_ONLY("喪失手続き"));
    }
    if (!lossDateAt || !(lossDateAt instanceof Date)) {
      throw new Error(ERROR_MESSAGES.REQUIRED_DATE("喪失日"));
    }
    if (!reason) {
      throw new Error(ERROR_MESSAGES.REQUIRED_FIELD("喪失理由"));
    }

    // 履歴に記録するための状態を作成
    const currentStatus = this._createHistoryEntry({ lossDateAt, reason });

    this.history.push(currentStatus);

    this.previousStatus = this.status;
    this.status = isRetire
      ? INSURANCE_STATUS.NOT_ENROLLED.value
      : INSURANCE_STATUS.EXEMPT.value;
    this.enrollmentDateAt = null;
    this.number = null;
  }

  /**
   * 履歴から最新の状態を復元します。
   * - `history` プロパティに復元できる状態が存在しない場合、エラーをスローします。
   * - 復元処理は、加入手続き中である場合は行えません。加入手続き中である場合は、加入手続き取下げ処理を行ってください。
   * - 復元処理は、`history` プロパティから最新の状態を取得し、`status`、`previousStatus`、`enrollmentDateAt`、`number` プロパティを復元します。
   * - 復元処理は、`isProcessing` プロパティを false に更新します。
   * @returns {void}
   * @throws {Error} `history` プロパティに復元できる状態が存在しない場合にエラーをスローします。
   * @throws {Error} 加入手続き中である場合にエラーをスローします。
   */
  rollback() {
    // validation
    if (this.history.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_HISTORY);
    }
    if (this.isProcessing) {
      throw new Error(ERROR_MESSAGES.CANCEL_FIRST);
    }
    const latestStatus = this.history.pop();
    this.status = latestStatus.status;
    this.previousStatus = latestStatus.previousStatus;
    this.enrollmentDateAt = latestStatus.enrollmentDateAt;
    this.number = latestStatus.number;
    this.isProcessing = false; // 念のため false に戻しておく
  }
}
