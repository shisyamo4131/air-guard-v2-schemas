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

export const fullName = () => {
  return {
    configurable: true,
    enumerable: true,
    configurable: true,
    enumerable: true,
    get() {
      if (!this.lastName || !this.firstName) return "";
      return `${this.lastName} ${this.firstName}`;
    },
    set(v) {
      // read-only
    },
  };
};
