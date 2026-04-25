import { generalDefinitions } from "./defaultDefinition.js";

/**
 * ONE LINE型のフィールド定義
 * {
 *   type: String,
 *   default: null,
 *   label: undefined,
 *   length: undefined,
 *   required: undefined,
 *   hidden: undefined,
 *   validator: undefined,
 *   component: { name: "air-text-field", attrs: {} },
 * }
 */
export const oneLineFields = {
  oneLine: generalDefinitions.oneLine,

  /** 略称 */
  abbreviation: {
    ...generalDefinitions.oneLine,
    label: "略称",
    length: 20,
  },

  /** 町域名・番地 */
  address: {
    ...generalDefinitions.oneLine,
    label: "町域名・番地",
    length: 30,
  },

  /** 支店名など */
  branchName: {
    ...generalDefinitions.oneLine,
    label: "支店名など",
    length: 20,
  },

  /** 建物名・階数 */
  building: {
    ...generalDefinitions.oneLine,
    label: "建物名・階数",
    length: 30,
  },

  /** 市区町村 */
  city: {
    ...generalDefinitions.oneLine,
    label: "市区町村",
    length: 20,
  },

  /** 会社ID */
  companyId: {
    ...generalDefinitions.oneLine,
    label: "会社ID",
  },

  /** 会社名 */
  companyName: {
    ...generalDefinitions.oneLine,
    label: "会社名",
    length: 20,
  },

  /** 会社名（カナ） */
  companyNameKana: {
    ...generalDefinitions.oneLine,
    label: "会社名（カナ）",
    length: 40,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        inputType: "katakana",
      },
    },
  },

  /**
   * 取引先
   * - アプリ側で `useFetchXxxx` コンポーザブルを使用するため
   *   使用するクラス側で api 関連の設定は不要。
   */
  customerId: {
    ...generalDefinitions.oneLine,
    label: "取引先",
    // アプリ側で `useFetchXxxx` コンポーザブルを使用するため
    // 使用するクラス側で api 関連の設定は不要。
    component: {
      name: "air-autocomplete-api",
      attrs: {
        itemValue: "docId",
        itemTitle: "name",
        noFilter: true,
      },
    },
  },

  /**
   * 取引先名
   * - 2文字以上最大20文字
   */
  customerName: {
    ...generalDefinitions.oneLine,
    label: "取引先名",
    length: 20,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: { minLength: 2 },
    },
  },

  /** 表示名 */
  displayName: {
    ...generalDefinitions.oneLine,
    label: "表示名",
    length: 6,
  },

  /** 本籍地 */
  domicile: {
    ...generalDefinitions.oneLine,
    label: "本籍地",
    length: 50,
  },

  /** email */
  email: {
    ...generalDefinitions.oneLine,
    label: "email",
    length: 50,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        inputType: "email",
        inputmode: "email",
      },
    },
  },

  /** 緊急連絡先住所 */
  emergencyContactAddress: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先住所",
    length: 50,
  },

  /** 緊急連絡先氏名 */
  emergencyContactName: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先氏名",
    length: 20,
  },

  /** 緊急連絡先続柄詳細 */
  emergencyContactRelationDetail: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先続柄詳細",
    length: 20,
  },

  /** 緊急連絡先電話番号 */
  emergencyContactPhone: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先電話番号",
    length: 13,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        counter: true,
        inputType: "tel",
        inputmode: "tel",
      },
    },
  },

  /** FAX番号 */
  fax: {
    ...generalDefinitions.oneLine,
    label: "FAX番号",
    length: 13,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        counter: true,
        inputType: "tel",
        inputmode: "tel",
      },
    },
  },

  /** 名 */
  firstName: {
    ...generalDefinitions.oneLine,
    label: "名",
    length: 20,
  },

  /** メイ */
  firstNameKana: {
    ...generalDefinitions.oneLine,
    label: "メイ",
    length: 40,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        inputType: "katakana",
      },
    },
  },

  /** 本名 */
  foreignName: {
    ...generalDefinitions.oneLine,
    label: "本名",
    length: 50,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        hint: "パスポート等の表記をご入力ください。",
        persistentHint: true,
      },
    },
  },

  /** 被保険者番号（整理記号） */
  insuranceNumber: {
    ...generalDefinitions.oneLine,
    label: "被保険者番号（整理記号）",
    length: 20,
  },

  /** 発行元 */
  issuedBy: {
    ...generalDefinitions.oneLine,
    label: "発行元",
    length: 20,
  },

  /** 姓 */
  lastName: {
    ...generalDefinitions.oneLine,
    label: "姓",
    length: 20,
  },

  /** セイ */
  lastNameKana: {
    ...generalDefinitions.oneLine,
    label: "セイ",
    length: 40,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        inputType: "katakana",
      },
    },
  },

  /** 喪失理由 */
  lossReason: {
    ...generalDefinitions.oneLine,
    label: "喪失理由",
    length: 40,
  },

  /** 携帯電話 */
  mobile: {
    ...generalDefinitions.oneLine,
    label: "携帯電話",
    length: 13,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        counter: true,
        inputType: "tel",
        inputmode: "tel",
      },
    },
  },

  /** 名前 */
  name: {
    ...generalDefinitions.oneLine,
    label: "名前",
    length: 20,
  },

  /** 名前（カナ） */
  nameKana: {
    ...generalDefinitions.oneLine,
    label: "名前（カナ）",
    length: 40,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        inputType: "katakana",
      },
    },
  },

  /** 国籍 */
  nationality: {
    ...generalDefinitions.oneLine,
    label: "国籍",
    length: 50,
  },

  /** 在留資格 */
  residenceStatus: {
    ...generalDefinitions.oneLine,
    label: "在留資格",
    length: 10,
  },

  /** 退職理由 */
  reasonOfTermination: {
    ...generalDefinitions.oneLine,
    label: "退職理由",
    length: 20,
  },

  /** 証明書番号 */
  serialNumber: {
    ...generalDefinitions.oneLine,
    label: "証明書番号",
    length: 20,
  },

  /** 現場ID */
  siteId: {
    ...generalDefinitions.oneLine,
    label: "現場",
    component: {
      name: "air-autocomplete-api",
      attrs: {
        itemValue: "docId",
        itemTitle: "name",
        noFilter: true,
      },
    },
  },

  /** 電話番号 */
  tel: {
    ...generalDefinitions.oneLine,
    label: "電話番号",
    length: 13,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        counter: true,
        inputType: "tel",
        inputmode: "tel",
      },
    },
  },

  /** 肩書 */
  title: {
    ...generalDefinitions.oneLine,
    label: "肩書",
    length: 20,
  },

  /** 作業内容 */
  workDescription: {
    ...generalDefinitions.oneLine,
    label: "作業内容",
    length: 20,
  },

  /** 郵便番号 */
  zipcode: {
    ...generalDefinitions.oneLine,
    default: null,
    label: "郵便番号",
    component: {
      name: "air-postal-code",
      attrs: {
        counter: true,
        inputType: "zipcode",
        "onUpdate:address": ({ item, updateProperties }) => {
          return (result) => {
            updateProperties({
              prefCode: result.prefcode,
              prefecture: result.address1,
              city: result.address2,
              address: result.address3,
            });
          };
        },
      },
    },
  },
};
