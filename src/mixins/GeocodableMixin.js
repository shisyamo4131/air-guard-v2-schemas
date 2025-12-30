/**
 * @file src/mixins/GeocodableMixin.js
 * @description Geocoding 機能を提供する Mixin
 */

/**
 * Geocoding 機能を提供する Mixin
 * @param {Class} BaseClass - 継承元のクラス
 * @returns {Class} Geocoding 機能を持つクラス
 */
export function GeocodableMixin(BaseClass) {
  return class extends BaseClass {
    /**
     * Firestore 用のコンバーターを提供します。
     * - location から geopoint を自動生成して Firestore に保存します。
     * - toObject() は純粋なプレーンオブジェクトを返すため、コンポーネント側で安全に使用できます。
     * @override
     */
    static converter() {
      const superConverter = super.converter();
      return {
        toFirestore: (instance) => {
          const obj = superConverter.toFirestore(instance);

          // location から geopoint を生成
          if (obj.location?.lat && obj.location?.lng) {
            try {
              const adapter = this.getAdapter();
              const GeoPoint = adapter.GeoPoint;

              if (GeoPoint) {
                obj.geopoint = new GeoPoint(obj.location.lat, obj.location.lng);
              }
            } catch (error) {
              console.warn(
                `[${this.className}.converter] GeoPoint generation failed:`,
                error
              );
              obj.geopoint = null;
            }
          } else {
            obj.geopoint = null;
          }

          return obj;
        },
        fromFirestore: superConverter.fromFirestore,
      };
    }

    /**
     * 新しいドキュメントが作成される前に `location` を取得してセットします。
     * @param {Object} args - Creation options.
     * @param {boolean} [args.skipGeocoding=false] - Skip geocoding process.
     * @returns {Promise<void>}
     */
    async beforeCreate(args = {}) {
      await super.beforeCreate(args);

      if (!args.skipGeocoding) {
        await this._geocodeAndSetLocation("beforeCreate");
      }
    }

    /**
     * ドキュメントが更新される前に `location` を取得してセットします。
     * 住所に変更がない場合はジオコーディングをスキップします。
     * @param {Object} args - Update options.
     * @param {boolean} [args.skipGeocoding=false] - Skip geocoding process.
     * @returns {Promise<void>}
     */
    async beforeUpdate(args = {}) {
      await super.beforeUpdate(args);

      const currentFullAddress = this.fullAddress;
      const previousFullAddress = this._beforeData?.fullAddress;

      // 住所に変更がない場合、またはskipGeocodingがtrueの場合はスキップ
      if (
        args.skipGeocoding ||
        (this._beforeData && currentFullAddress === previousFullAddress)
      ) {
        return;
      }

      await this._geocodeAndSetLocation("beforeUpdate");
    }

    /**
     * ジオコーディング処理
     * fullAddress から緯度・経度・正規化された住所を取得し、location に設定
     * @private
     * @param {string} context - 呼び出し元のコンテキスト（'beforeCreate' | 'beforeUpdate'）
     */
    async _geocodeAndSetLocation(context) {
      const address = this.fullAddress;

      if (!address || address.trim() === "") {
        this.location = null;
        return;
      }

      if (!GeocodableMixin._geocodingFunction) {
        console.warn(
          `[${this.constructor.className}.${context}] Geocoding function not set. Skipping geocoding.`
        );
        this.location = null;
        return;
      }

      try {
        const coordinates = await GeocodableMixin._geocodingFunction(address);

        if (coordinates && coordinates.lat && coordinates.lng) {
          this.location = {
            formattedAddress: coordinates.formattedAddress || address,
            lat: coordinates.lat,
            lng: coordinates.lng,
          };
        } else {
          this.location = null;
        }
      } catch (error) {
        console.warn(
          `[${this.constructor.className}.${context}] Geocoding failed:`,
          error
        );
        this.location = null;
      }
    }
  };
}

/**
 * Geocoding 処理を行う関数（外部から注入）
 * @type {Function|null}
 * @static
 */
GeocodableMixin._geocodingFunction = null;

/**
 * Geocoding 関数を設定します。
 * すべての GeocodableMixin を継承したクラスで共有されます。
 * @param {Function} fn - 住所文字列を受け取り、{ lat, lng, formattedAddress } を返す非同期関数
 * @static
 */
GeocodableMixin.setGeocodingFunction = function (fn) {
  GeocodableMixin._geocodingFunction = fn;
};
