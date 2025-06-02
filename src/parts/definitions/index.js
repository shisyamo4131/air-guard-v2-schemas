// 個別の定義をインポート（availableDefinitions で使用するため）
import {
  zipcode,
  prefCode,
  city,
  address,
  building,
  location,
} from "./address.js";
import { check, isForeigner } from "./check.js";
import { code } from "./code.js";
import { date, startDate, endDate } from "./date.js";
import {
  name,
  displayName,
  nameKana,
  lastName,
  lastNameKana,
  firstName,
  firstNameKana,
  companyName,
  companyNameKana,
  foreignName,
} from "./name.js";
import { oneLine, nationality } from "./oneLine.js";
import { tel, fax } from "./tel.js";
import { docId, customerId } from "./docId.js";

// 利用可能な定義のマッピングオブジェクト
export const availableDefinitions = {
  address,
  building,
  check,
  city,
  code,
  companyName,
  companyNameKana,
  customerId,
  date,
  displayName,
  docId,
  endDate,
  fax,
  firstName,
  firstNameKana,
  foreignName,
  isForeigner,
  lastName,
  lastNameKana,
  location,
  name,
  nameKana,
  nationality,
  oneLine,
  prefCode,
  startDate,
  tel,
  zipcode,
};

// デフォルトの定義オブジェクト
export const defaultDefinition = {
  type: String,
  default: "",
  label: undefined,
  length: undefined,
  required: undefined,
  hidden: undefined,
  component: {
    name: undefined,
    attrs: {},
  },
};
