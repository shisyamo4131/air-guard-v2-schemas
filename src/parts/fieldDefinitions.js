import { PREFECTURES_ARRAY } from "../constants/index.js";

export const fieldDefinitions = {
  address: {
    type: String,
    default: null,
    label: "町域名・番地",
    length: 15,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  bool: {
    type: Boolean,
    default: false,
    label: "汎用ブール値",
    required: undefined,
    component: {
      name: "air-checkbox",
      attrs: {},
    },
  },
  building: {
    type: String,
    default: null,
    label: "建物名・階数",
    length: 30,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  check: {
    type: Boolean,
    default: false,
    label: undefined,
    required: undefined,
    component: {
      name: "air-checkbox",
      attrs: {},
    },
  },
  city: {
    type: String,
    default: null,
    label: "市区町村",
    length: 10,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  code: {
    type: String,
    default: null,
    label: undefined,
    length: 10,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  collectionItemType: {
    type: String,
    default: "municipal",
    label: "種別",
    required: null,
    component: {
      name: "air-select",
      attrs: {
        items: [
          { title: "一般廃棄物", value: "municipal" },
          { title: "産業廃棄物", value: "industrial" },
        ],
      },
    },
  },
  contractStatus: {
    type: String,
    default: "active",
    label: "契約状態",
    required: undefined,
    component: {
      name: "air-select",
      attrs: {
        items: [
          { title: "契約中", value: "active" },
          { title: "契約終了", value: "terminated" },
        ],
      },
    },
  },
  customer: {
    type: Object,
    default: null,
    label: "取引先",
    required: undefined,
    component: {
      name: "air-autocomplete-api",
      attrs: {
        cacheItems: true,
        clearable: true,
        itemTitle: "name",
        itemValue: "docId",
        returnObject: true,
      },
    },
  },
  date: {
    type: Object,
    default: null,
    label: "日付",
    required: undefined,
    component: {
      name: "air-date-input",
      attrs: {},
    },
  },
  /** 生年月日 */
  dateOfBirth: {
    type: Object,
    default: null,
    label: "生年月日",
    required: undefined,
    component: {
      name: "air-date-input",
      attrs: {},
    },
  },
  /** 入社日 */
  dateOfHire: {
    type: Object,
    default: null,
    label: "入社日",
    required: undefined,
    component: {
      name: "air-date-input",
      attrs: {},
    },
  },
  /** 退職日 */
  dateOfTermination: {
    type: Object,
    default: null,
    label: "退職日",
    required: undefined,
    component: {
      name: "air-date-input",
      attrs: {},
    },
  },
  default: {
    type: String,
    default: null,
    label: undefined,
    length: undefined,
    required: undefined,
    hidden: undefined,
    component: {
      name: undefined,
      attrs: {},
    },
  },
  description: {
    type: String,
    default: null,
    label: "説明",
    length: 200,
    required: undefined,
    hidden: undefined,
    component: {
      name: "air-textarea",
      attrs: {
        counter: true,
        maxlength: 200,
      },
    },
  },
  displayName: {
    type: String,
    default: null,
    label: "表示名",
    length: 6,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  docId: {
    type: String,
    default: null,
    label: undefined,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  /**
   * 雇用状態
   * 従業員の雇用契約の状態です。
   * { active: 在職中, terminated: 退職済 }
   */
  employmentStatus: {
    type: String,
    default: "active",
    label: "雇用状態",
    required: undefined,
    component: {
      name: "air-select",
      attrs: {
        items: [
          { title: "在職中", value: "active" },
          { title: "退職済", value: "terminated" },
        ],
      },
    },
  },
  endDate: {
    type: Object,
    default: null,
    label: "終了日",
    required: undefined,
    component: {
      name: "air-date-input",
      attrs: {},
    },
  },
  fax: {
    type: String,
    default: null,
    label: "FAX番号",
    length: undefined,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {
        counter: true,
        inputType: "tel",
      },
    },
  },
  firstName: {
    type: String,
    default: null,
    label: "名",
    length: 20,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  firstNameKana: {
    type: String,
    default: null,
    label: "メイ",
    length: 40,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {
        inputType: "katakana",
      },
    },
  },
  foreignName: {
    type: String,
    default: null,
    label: "本名",
    length: 50,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  /** 性別 */
  gender: {
    type: String,
    default: "male",
    label: "性別",
    required: undefined,
    component: {
      name: "air-select",
      attrs: {
        items: [
          { title: "男性", value: "male" },
          { title: "女性", value: "female" },
        ],
      },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    label: "有効",
    required: undefined,
    component: {
      name: "air-checkbox",
      attrs: {},
    },
  },
  isForeigner: {
    type: Boolean,
    default: false,
    label: "外国籍",
    required: undefined,
    component: {
      name: "air-checkbox",
      attrs: {},
    },
  },
  lastName: {
    type: String,
    default: null,
    label: "姓",
    length: 20,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  lastNameKana: {
    type: String,
    default: null,
    label: "セイ",
    length: 40,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {
        inputType: "katakana",
      },
    },
  },
  location: {
    type: Object,
    default: null,
    label: undefined,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  name: {
    type: String,
    default: null,
    label: "名前",
    length: 20,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  nameKana: {
    type: String,
    default: null,
    label: "名前（カナ）",
    length: 40,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {
        inputType: "katakana",
      },
    },
  },
  nationality: {
    type: String,
    default: null,
    label: "国籍",
    length: 50,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },
  prefCode: {
    type: String,
    default: null,
    label: "都道府県",
    length: 2,
    required: undefined,
    component: {
      name: "air-select",
      attrs: {
        items: PREFECTURES_ARRAY,
      },
    },
  },

  /** 備考 */
  remarks: {
    type: String,
    default: null,
    label: "備考",
    length: 200,
    required: undefined,
    component: {
      name: "air-textarea",
      attrs: {
        counter: true,
        maxlength: 200,
      },
    },
  },

  /** 必要人数 */
  requiredPersonnel: {
    type: Number,
    default: null,
    label: "必要人数",
    required: undefined,
    component: {
      name: "air-number-input",
      attrs: {
        controlVariant: "split",
      },
    },
  },

  /**
   * 勤務区分
   * { day: 日勤, night: 夜勤 }
   */
  shiftType: {
    type: String,
    default: "day",
    label: "勤務区分",
    required: undefined,
    component: {
      name: "air-select",
      attrs: {
        items: [
          { title: "日勤", value: "day" },
          { title: "夜勤", value: "night" },
        ],
      },
    },
  },

  startDate: {
    type: Object,
    default: null,
    label: "開始日",
    required: undefined,
    component: {
      name: "air-date-input",
      attrs: {},
    },
  },

  stops: {
    type: Array,
    default: () => [],
    label: "排出場所リスト",
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },

  tel: {
    type: String,
    default: null,
    label: "電話番号",
    length: undefined,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {
        counter: true,
        inputType: "tel",
      },
    },
  },

  time: {
    type: String,
    default: null,
    label: "時刻",
    length: undefined,
    required: undefined,
    component: {
      name: "air-text-field",
      attrs: {},
    },
  },

  /** 郵便番号 */
  zipcode: {
    type: String,
    default: null,
    label: "郵便番号",
    required: undefined,
    component: {
      name: "air-postal-code",
      attrs: {
        counter: true,
        inputType: "zipcode",
        "onUpdate:address": (item, updater) => {
          return (result) => {
            updater({
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

/**
 * FireModel を継承したカスタムクラスの classProps で使用するプロパティ定義です。
 * - 定義されている各種プロパティは一部を除き、Vuetify(AirVuetify) の入力コンポーネントに引き渡される属性として使用されます。
 * - `default`, `label`, `required` は `undefined` を許容します。
 *   - `undefined` の場合、当該属性が入力コンポーネントに引き渡されないことを意味します。
 * - `component` プロパティは、`default`, `label`, `required` 以外に入力コンポーネントに引き渡す属性の定義です。
 *   - `name` プロパティは使用するコンポーネントの名前です。AirVuetify コンポーネントのみ指定可能です。
 *   - `attrs` プロパティにネストされた各プロパティがそのまま入力コンポーネントに引き渡されます。
 */

export const defField = (key, options = {}) => {
  let baseConfigSource = fieldDefinitions[key];
  let isFallback = false;
  const effectiveDefaultDefinition = fieldDefinitions.default;

  if (!baseConfigSource) {
    console.warn(
      `[parts/fieldDefinitions.js defField] Definition for key "${key}" not found. Using fieldDefinitions.default as base.`
    );
    baseConfigSource = effectiveDefaultDefinition;
    isFallback = true;
  }

  // ステップ1: defaultDefinition と baseConfigSource をマージして newConfig の基礎を作成
  // これにより、baseConfigSource にないプロパティは defaultDefinition の値が使われる
  const newConfig = { ...effectiveDefaultDefinition, ...baseConfigSource };

  // ステップ2: component オブジェクトのディープコピー
  // newConfig.component は baseConfigSource.component または defaultDefinition.component のいずれか (またはそのマージ結果)
  // これを新しいオブジェクトとして確定させる
  // まず、newConfig.component が存在するか確認し、なければ defaultDefinition.component を使う
  const componentSourceForCopy =
    newConfig.component || effectiveDefaultDefinition.component;
  newConfig.component = { ...componentSourceForCopy }; // 新しい component オブジェクトを作成

  // ステップ3: component.attrs オブジェクトのディープコピー
  // newConfig.component.attrs も同様に新しいオブジェクトにする
  const attrsSourceForCopy =
    newConfig.component.attrs ||
    (effectiveDefaultDefinition.component &&
      effectiveDefaultDefinition.component.attrs);
  newConfig.component.attrs = { ...attrsSourceForCopy }; // 新しい attrs オブジェクトを作成

  // ステップ4: component.attrs.rules 配列のディープコピー
  // rules が存在し、かつ配列であれば新しい配列としてコピーし、そうでなければ空配列で初期化
  if (
    newConfig.component.attrs.rules &&
    Array.isArray(newConfig.component.attrs.rules)
  ) {
    newConfig.component.attrs.rules = [...newConfig.component.attrs.rules];
  } else {
    // rules が存在しないか、配列でない場合は、defaultDefinition の rules を参照 (なければ空配列)
    newConfig.component.attrs.rules =
      effectiveDefaultDefinition.component &&
      effectiveDefaultDefinition.component.attrs &&
      Array.isArray(effectiveDefaultDefinition.component.attrs.rules)
        ? [...effectiveDefaultDefinition.component.attrs.rules] // defaultDefinition に rules があればコピー
        : []; // それ以外は空配列
  }

  // フォールバック時（keyが見つからなかった場合）で、かつoptionsでlabelが指定されていない場合、
  // label に key の値を設定 (defaultDefinition.label は undefined のため)
  if (isFallback && !options.hasOwnProperty("label")) {
    newConfig.label = key;
  }

  // options のプロパティで newConfig を上書き
  if (options.hasOwnProperty("type")) {
    newConfig.type = options.type;
  }
  if (options.hasOwnProperty("label")) {
    newConfig.label = options.label;
  }
  if (options.hasOwnProperty("default")) {
    newConfig.default = options.default;
  }
  // `required` は options にあればその値、なければ newConfig の値 (baseConfig または defaultDefinition 由来) を維持
  // defaultDefinition.required は undefined なので、指定がなければ undefined のままになる
  if (options.hasOwnProperty("required")) {
    newConfig.required = options.required;
  }
  // `hidden` は options にあればその値、なければ newConfig の値 (baseConfig または defaultDefinition 由来) を維持
  // defaultDefinition.hidden は undefined なので、指定がなければ undefined のままになる
  if (options.hasOwnProperty("hidden")) {
    newConfig.hidden = options.hidden;
  }
  // customClass の処理: options に customClass があれば newConfig に設定
  if (options.hasOwnProperty("customClass")) {
    newConfig.customClass = options.customClass;
  }

  // options.component オブジェクトの処理
  if (typeof options.component === "object" && options.component !== null) {
    // options.component.name があれば newConfig.component.name を上書き
    if (options.component.hasOwnProperty("name")) {
      newConfig.component.name = options.component.name;
    }

    // options.component.attrs がオブジェクトであれば、newConfig.component.attrs にマージ
    if (
      typeof options.component.attrs === "object" &&
      options.component.attrs !== null
    ) {
      newConfig.component.attrs = {
        ...newConfig.component.attrs,
        ...options.component.attrs,
      };

      // options.component.attrs が 'rules' を明示的に配列として提供する場合、
      // それを newConfig.component.attrs.rules として設定（ディープコピー）
      if (
        options.component.attrs.hasOwnProperty("rules") &&
        Array.isArray(options.component.attrs.rules)
      ) {
        newConfig.component.attrs.rules = [...options.component.attrs.rules];
      }
      // 注意: options.component.attrs に rules がない、または配列でない場合、
      // この時点での newConfig.component.attrs.rules (ベース定義由来またはステップ4で初期化されたもの) が維持され、
      // 後続の options.length による上書きの対象となります。
    }
  }

  // component.attrs のプロパティの上書き
  if (options.hasOwnProperty("counter")) {
    newConfig.component.attrs.counter = options.counter;
  }

  // length の処理: options.length を優先し、なければ newConfig.length (baseConfigSource由来) を使用
  let lengthToUseForRules;

  if (options.hasOwnProperty("length")) {
    // options.length が明示的に指定されていれば最優先
    lengthToUseForRules = options.length;
  } else if (
    newConfig.hasOwnProperty("length") &&
    newConfig.length !== undefined
  ) {
    // options.length がなく、newConfig (baseConfigSource由来) に length があればそれを使用
    lengthToUseForRules = newConfig.length;
  }
  // lengthToUseForRules が undefined のままなら、length に基づくルールは適用しない

  if (lengthToUseForRules !== undefined) {
    if (typeof lengthToUseForRules === "number" && lengthToUseForRules > 0) {
      const lengthValidationRule = (v) =>
        !v ||
        v.length <= lengthToUseForRules ||
        `${lengthToUseForRules}文字以内で入力してください。`;

      if (Array.isArray(newConfig.component.attrs.rules)) {
        // 既存のルール配列に新しい長さバリデーションルールを追加
        newConfig.component.attrs.rules.push(lengthValidationRule);
      } else {
        // rules が配列でない（または存在しない）場合は、新しいルール配列を作成
        newConfig.component.attrs.rules = [lengthValidationRule];
      }
    } else if (lengthToUseForRules === null || lengthToUseForRules === 0) {
      // options.length が null または 0 の場合、ルールを意図的に空にする
      newConfig.component.attrs.rules = [];
    }
    // それ以外の場合 (lengthValue が undefined や不正な値) は、既存のルール (コピーされたもの) を維持
  }
  return newConfig;
};
