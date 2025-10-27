import {
  ARRANGEMENT_NOTIFICATION_STATUS_ARRAY,
  ARRANGEMENT_NOTIFICATION_STATUS_DEFAULT,
} from "../constants/arrangement-notification-status.js";
import {
  CONTRACT_STATUS_ARRAY,
  CONTRACT_STATUS_DEFAULT,
} from "../constants/contract-status.js";
import { DAY_TYPE_ARRAY, DAY_TYPE_DEFAULT } from "../constants/day-type.js";
import {
  EMPLOYMENT_STATUS_ARRAY,
  EMPLOYMENT_STATUS_DEFAULT,
} from "../constants/employment-status.js";
import { GENDER_ARRAY, GENDER_DEFAULT } from "../constants/gender.js";
import { PREFECTURES_ARRAY } from "../constants/prefectures.js";
import {
  SHIFT_TYPE_ARRAY,
  SHIFT_TYPE_DEFAULT,
} from "../constants/shift-type.js";
import {
  SITE_STATUS_ARRAY,
  SITE_STATUS_DEFAULT,
} from "../constants/site-status.js";

export const DEFAULT_WORKING_MINUTES = 480;
export const DEFAULT_BREAK_MINUTES = 60;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_QUARTER_HOUR = 15;
export const MAX_SCHEDULED_WORKING_MINUTES = 480; // 8時間 * 60分

const defaultDefinition = {
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
};

/** 汎用パーツ */
const generalDefinitions = {
  array: {
    ...defaultDefinition,
    type: Array,
    default: () => [],
    component: { name: "air-select", attrs: { multiple: true } },
  },
  check: {
    ...defaultDefinition,
    type: Boolean,
    default: false,
    component: { name: "air-checkbox", attrs: {} },
  },
  code: {
    ...defaultDefinition,
    length: 10,
    component: { name: "air-text-field", attrs: { inputType: "alphanumeric" } },
  },
  // 日付（00時固定としたDateオブジェクトとして使用する）
  dateAt: {
    ...defaultDefinition,
    type: Object,
    label: "日付",
    component: {
      name: "air-date-input",
    },
  },
  // 日時（時刻までを含んだDateオブジェクト）
  dateTimeAt: {
    ...defaultDefinition,
    type: Object,
    label: "日時",
    default: null,
    component: { name: "air-date-time-picker-input", attrs: {} },
  },
  multipleLine: {
    ...defaultDefinition,
    length: 200,
    component: {
      name: "air-textarea",
      attrs: { counter: true, maxlength: 200 },
    },
  },
  number: {
    ...defaultDefinition,
    type: Number,
    component: {
      name: "air-number-input",
      attrs: {
        controlVariant: "split",
      },
    },
  },
  object: {
    ...defaultDefinition,
    type: Object,
    component: { name: "air-select" }, // `AirTextField` that is used as default ui component could not handle object type.
  },
  oneLine: {
    ...defaultDefinition,
    component: { name: "air-text-field", attrs: {} },
  },
  radio: {
    ...defaultDefinition,
    component: { name: "air-radio-group", attrs: {} },
  },
  select: {
    ...defaultDefinition,
    component: { name: "air-select", attrs: {} },
  },
  // 時刻文字列
  time: {
    ...defaultDefinition,
    label: "時刻",
    component: {
      name: "air-time-picker-input",
    },
  },
};

/** カスタムパーツ（汎用パーツ含む） */
export const fieldDefinitions = {
  /** array */
  array: generalDefinitions.array,
  /** check */
  check: generalDefinitions.check,
  isForeigner: {
    ...generalDefinitions.check,
    label: "外国籍",
  },
  /** code */
  code: generalDefinitions.code,
  /** dateAt */
  dateAt: generalDefinitions.dateAt,
  /** dateTimeAt */
  dateTimeAt: generalDefinitions.dateTimeAt,
  /** multiple-line */
  multipleLine: generalDefinitions.multipleLine,

  /** number */
  number: generalDefinitions.number,
  breakMinutes: {
    ...generalDefinitions.number,
    label: "休憩時間（分）",
    default: DEFAULT_BREAK_MINUTES,
    validator: (v) => v >= 0,
    component: {
      ...generalDefinitions.number.component,
      attrs: {
        ...generalDefinitions.number.component.attrs,
        min: 0,
      },
    },
  },
  overtimeWorkMinutes: {
    ...generalDefinitions.number,
    label: "残業時間（分）",
    default: 0,
    validator: (v) => v >= 0,
    component: {
      ...generalDefinitions.number.component,
      attrs: {
        ...generalDefinitions.number.component.attrs,
        min: 0,
      },
    },
  },
  regulationWorkMinutes: {
    ...generalDefinitions.number,
    label: "規定実働時間（分）",
    default: DEFAULT_WORKING_MINUTES,
    validator: (v) => v >= 0,
    component: {
      ...generalDefinitions.number.component,
      attrs: {
        ...generalDefinitions.number.component.attrs,
        min: 0,
        persistentHint: true,
        hint: "この時間を超えると残業扱いになります。",
      },
    },
  },
  price: {
    ...generalDefinitions.number,
  },

  /** one-line */
  oneLine: generalDefinitions.oneLine,
  address: {
    ...generalDefinitions.oneLine,
    label: "町域名・番地",
    length: 15,
  },
  building: {
    ...generalDefinitions.oneLine,
    label: "建物名・階数",
    length: 30,
  },
  city: {
    ...generalDefinitions.oneLine,
    label: "市区町村",
    length: 10,
  },
  displayName: {
    ...generalDefinitions.oneLine,
    label: "表示名",
    length: 6,
  },
  email: {
    ...generalDefinitions.oneLine,
    label: "email",
    length: 50,
    component: {
      name: generalDefinitions.oneLine.component.name,
      attrs: {
        inputType: "email",
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
      },
    },
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

  /** object */
  object: generalDefinitions.object,

  customer: {
    ...generalDefinitions.object,
    label: "取引先",
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
  location: {
    ...generalDefinitions.object,
    hidden: true,
  },

  /** radio */
  radio: generalDefinitions.radio,

  /** select */
  select: generalDefinitions.select,
  arrangementNotificationStatus: {
    ...generalDefinitions.select,
    default: ARRANGEMENT_NOTIFICATION_STATUS_DEFAULT,
    label: "状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: ARRANGEMENT_NOTIFICATION_STATUS_ARRAY,
      },
    },
  },
  contractStatus: {
    ...generalDefinitions.select,
    default: CONTRACT_STATUS_DEFAULT,
    label: "契約状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: CONTRACT_STATUS_ARRAY,
      },
    },
  },
  dayType: {
    ...generalDefinitions.select,
    default: DAY_TYPE_DEFAULT,
    label: "曜日区分",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: DAY_TYPE_ARRAY,
      },
    },
  },
  employmentStatus: {
    ...generalDefinitions.select,
    default: EMPLOYMENT_STATUS_DEFAULT,
    label: "雇用状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: EMPLOYMENT_STATUS_ARRAY,
      },
    },
  },
  gender: {
    ...generalDefinitions.select,
    default: GENDER_DEFAULT,
    label: "性別",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: GENDER_ARRAY,
      },
    },
  },
  prefCode: {
    ...generalDefinitions.select,
    label: "都道府県",
    length: 2,
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: PREFECTURES_ARRAY,
      },
    },
  },
  shiftType: {
    ...generalDefinitions.select,
    default: SHIFT_TYPE_DEFAULT,
    label: "勤務区分",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: SHIFT_TYPE_ARRAY,
      },
    },
  },
  siteStatus: {
    ...generalDefinitions.select,
    default: SITE_STATUS_DEFAULT,
    label: "状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: SITE_STATUS_ARRAY,
      },
    },
  },

  /** time */
  time: {
    ...generalDefinitions.time,
  },

  /** else */
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
  const effectiveDefaultDefinition = defaultDefinition;

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
  // options.colsDefinition があれば、それを newConfig.colsDefinition に設定
  if (options.hasOwnProperty("colsDefinition")) {
    newConfig.colsDefinition = options.colsDefinition;
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
