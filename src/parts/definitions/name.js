export const name = {
  type: String,
  default: "",
  label: "名前",
  length: 20,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const displayName = {
  type: String,
  default: "",
  label: "表示名",
  length: 6,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const foreignName = {
  type: String,
  default: "",
  label: "本名",
  length: 50,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const nameKana = {
  type: String,
  default: "",
  label: "名前（カナ）",
  length: 40,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      inputType: "katakana",
    },
  },
};

export const lastName = {
  type: String,
  default: "",
  label: "姓",
  length: 20,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const lastNameKana = {
  type: String,
  default: "",
  label: "セイ",
  length: 40,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      inputType: "katakana",
    },
  },
};

export const firstName = {
  type: String,
  default: "",
  label: "名",
  length: 20,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const firstNameKana = {
  type: String,
  default: "",
  label: "メイ",
  length: 40,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      inputType: "katakana",
    },
  },
};

export const companyName = {
  type: String,
  default: "",
  label: "会社名",
  length: 20,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {},
  },
};

export const companyNameKana = {
  type: String,
  default: "",
  label: "会社名（カナ）",
  length: 20,
  required: undefined,
  component: {
    name: "air-text-field",
    attrs: {
      inputType: "katakana",
    },
  },
};
