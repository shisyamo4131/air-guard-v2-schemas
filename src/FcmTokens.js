/*****************************************************************************
 * @file ./src/FcmTokens.js
 * @description FCM トークンを管理するための配列クラス
 * - 配列クラスに add と remove メソッドを追加して、トークンの管理を容易にしています。
 *****************************************************************************/

/*****************************************************************************
 * @class FcmTokens
 *
 * @method add - FCM トークンを新たに追加します。但し重複は無視されます。
 * @method remove - FCM トークンを削除します。
 *****************************************************************************/
export class FcmTokens extends Array {
  /**
   * トークンを追加
   */
  add(token) {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid FCM token");
    }
    if (this.includes(token)) {
      return false; // 既に存在
    }
    this.push(token);
    return true;
  }

  /**
   * トークンを削除
   */
  remove(token) {
    const index = this.indexOf(token);
    if (index === -1) {
      return false; // 存在しない
    }
    this.splice(index, 1);
    return true;
  }
}
