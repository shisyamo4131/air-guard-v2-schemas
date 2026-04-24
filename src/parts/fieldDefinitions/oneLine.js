import { generalDefinitions } from "./defaultDefinition.js";

/**
 * ONE LINE型のフィールド定義
 */
export const oneLineFields = {
  oneLine: generalDefinitions.oneLine,
  abbreviation: {
    ...generalDefinitions.oneLine,
    label: "略称",
    length: 20,
  },
  address: {
    ...generalDefinitions.oneLine,
    label: "町域名・番地",
    length: 30,
  },
  branchName: {
    ...generalDefinitions.oneLine,
    label: "支店名など",
    length: 20,
  },
  building: {
    ...generalDefinitions.oneLine,
    label: "建物名・階数",
    length: 30,
  },
  city: {
    ...generalDefinitions.oneLine,
    label: "市区町村",
    length: 20,
  },
  companyName: {
    ...generalDefinitions.oneLine,
    label: "会社名",
    length: 20,
  },
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
  displayName: {
    ...generalDefinitions.oneLine,
    label: "表示名",
    length: 6,
  },
  domicile: {
    ...generalDefinitions.oneLine,
    label: "本籍地",
    length: 50,
  },
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
  emergencyContactAddress: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先住所",
    length: 50,
  },
  emergencyContactName: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先氏名",
    length: 20,
  },
  emergencyContactRelationDetail: {
    ...generalDefinitions.oneLine,
    label: "緊急連絡先続柄詳細",
    length: 20,
  },
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
  firstName: {
    ...generalDefinitions.oneLine,
    label: "名",
    length: 20,
  },
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
  insuranceNumber: {
    ...generalDefinitions.oneLine,
    label: "被保険者番号（整理記号）",
    length: 20,
  },
  // 2025-12-26 Added
  issuedBy: {
    ...generalDefinitions.oneLine,
    label: "発行元",
    length: 20,
  },
  lastName: {
    ...generalDefinitions.oneLine,
    label: "姓",
    length: 20,
  },
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
  lossReason: {
    ...generalDefinitions.oneLine,
    label: "喪失理由",
    length: 40,
  },
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
  name: {
    ...generalDefinitions.oneLine,
    label: "名前",
    length: 20,
  },
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
  nationality: {
    ...generalDefinitions.oneLine,
    label: "国籍",
    length: 50,
  },
  residenceStatus: {
    ...generalDefinitions.oneLine,
    label: "在留資格",
    length: 10,
  },
  reasonOfTermination: {
    ...generalDefinitions.oneLine,
    label: "退職理由",
    length: 20,
  },
  // 2025-12-26 Added
  serialNumber: {
    ...generalDefinitions.oneLine,
    label: "証明書番号",
    length: 20,
  },
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
  title: {
    ...generalDefinitions.oneLine,
    label: "肩書",
    length: 20,
  },
  workDescription: {
    ...generalDefinitions.oneLine,
    label: "作業内容",
    length: 20,
  },
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
