/**
 * フィールド定義のデフォルト値
 * - `air-firebase` が提供する `FireModel (BaseClass)` において、クラスが保有するフィールドの定義および値の検証に使用されます。
 * - `component` プロパティは `air-vuetify` の入力コンポーネント生成の為の属性として使用されます。
 *   但し、required, label, hidden, length は入力コンポーネントの属性としても使用されます。
 * - `validator` の返り値は原則オブジェクトです。文字列を返すこともでき、その文字列がエラーメッセージとして扱われますが多言語対応のためには
 *   オブジェクトを返すことを推奨します。
 *   返り値が true/false の場合は、従来通りのバリデーション結果として扱われます。
 * @key {String|Number|Boolean|Object|Array|Date} type - データの型
 * @key {any} default - 既定値
 * @key {String} label - フィールドのラベル
 * @key {Number} length - 入力可能な最大文字数（文字列型の場合）
 * @key {Boolean} required - 入力必須かどうか
 * @key {Boolean} hidden - フィールドをUI上で非表示にするかどうか
 * @key {Function} validator - フィールドの値を検証する関数。引数に値を取り、エラーメッセージを返すか、true/falseで検証結果を返す。
 * @key {Object} component - フィールドに対応するUIコンポーネントの定義
 * @key {String} component.name - 使用するコンポーネントの名前（AirVuetifyコンポーネントのみ指定可能）
 * @key {Object} component.attrs - コンポーネントに渡す属性の定義
 */
export const defaultDefinition = {
  type: String,
  default: null,
  label: undefined,
  length: undefined,
  required: undefined,
  hidden: undefined,
  validator: undefined,
  component: {
    name: undefined,
    attrs: {},
  },
};

/** 汎用パーツ */
export const generalDefinitions = {
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
    default: () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    },
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
