import { generalDefinitions } from "./defaultDefinition.js";
import {
  VALUES as ARRANGEMENT_NOTIFICATION_STATUS_VALUES,
  OPTIONS as ARRANGEMENT_NOTIFICATION_STATUS_OPTIONS,
} from "../../constants/arrangement-notification-status.js";
import {
  VALUES as BILLING_UNIT_TYPE_VALUES,
  OPTIONS as BILLING_UNIT_TYPE_OPTIONS,
} from "../../constants/billing-unit-type.js";
import {
  VALUES as BLOOD_TYPE_VALUES,
  OPTIONS as BLOOD_TYPE_OPTIONS,
} from "../../constants/blood-type.js";
import {
  VALUES as CERTIFICATION_TYPE_VALUES,
  OPTIONS as CERTIFICATION_TYPE_OPTIONS,
} from "../../constants/certification-type.js";
import {
  VALUES as CONTRACT_STATUS_VALUES,
  OPTIONS as CONTRACT_STATUS_OPTIONS,
} from "../../constants/contract-status.js";
import {
  OPTIONS as DAY_TYPE_OPTIONS,
  VALUES as DAY_TYPE_VALUES,
} from "../../constants/day-type.js";
import {
  VALUES as EMERGENCY_CONTACT_RELATION_VALUES,
  OPTIONS as EMERGENCY_CONTACT_RELATION_OPTIONS,
} from "../../constants/emergency-contact-relation.js";
import {
  VALUES as EMPLOYMENT_STATUS_VALUES,
  OPTIONS as EMPLOYMENT_STATUS_OPTIONS,
} from "../../constants/employment-status.js";
import {
  VALUES as GENDER_VALUES,
  OPTIONS as GENDER_OPTIONS,
} from "../../constants/gender.js";
import {
  VALUES as INSURANCE_STATUS_VALUES,
  OPTIONS as INSURANCE_STATUS_OPTIONS,
} from "../../constants/insurance-status.js";
import { OPTIONS as PREFECTURES_OPTIONS } from "../../constants/prefectures.js";
import {
  VALUES as PAYMENT_MONTH_VALUES,
  OPTIONS as PAYMENT_MONTH_OPTIONS,
} from "../../constants/payment-month.js";
import {
  VALUES as SHIFT_TYPE_VALUES,
  OPTIONS as SHIFT_TYPE_OPTIONS,
} from "../../constants/shift-type.js";
import {
  VALUES as SITE_STATUS_VALUES,
  OPTIONS as SITE_STATUS_OPTIONS,
} from "../../constants/site-status.js";
import CutoffDate from "../../utils/CutoffDate.js";

/**
 * SELECT型のフィールド定義
 */
export const selectFields = {
  select: generalDefinitions.select,
  arrangementNotificationStatus: {
    ...generalDefinitions.select,
    default: ARRANGEMENT_NOTIFICATION_STATUS_VALUES.ARRANGED.value,
    label: "状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: ARRANGEMENT_NOTIFICATION_STATUS_OPTIONS,
      },
    },
  },
  /** 請求単位 */
  billingUnitType: {
    ...generalDefinitions.select,
    default: BILLING_UNIT_TYPE_VALUES.PER_DAY.value,
    label: "請求単位",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: BILLING_UNIT_TYPE_OPTIONS,
      },
    },
  },
  bloodType: {
    ...generalDefinitions.select,
    label: "血液型",
    default: BLOOD_TYPE_VALUES.A.value,
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: BLOOD_TYPE_OPTIONS,
      },
    },
  },
  certificationType: {
    ...generalDefinitions.select,
    label: "資格種別",
    default: null,
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: CERTIFICATION_TYPE_OPTIONS,
      },
    },
  },
  // contractStatus -> Used in Customer.js and Outsourcer.js
  contractStatus: {
    ...generalDefinitions.select,
    default: CONTRACT_STATUS_VALUES.ACTIVE.value,
    label: "契約状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: CONTRACT_STATUS_OPTIONS,
      },
    },
  },
  cutoffDate: {
    ...generalDefinitions.select,
    default: CutoffDate.VALUES[0].value,
    label: "締日",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: CutoffDate.OPTIONS,
      },
    },
  },
  dayType: {
    ...generalDefinitions.select,
    default: DAY_TYPE_VALUES.WEEKDAY.value,
    label: "曜日区分",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: DAY_TYPE_OPTIONS,
      },
    },
  },
  emergencyContactRelation: {
    ...generalDefinitions.select,
    default: EMERGENCY_CONTACT_RELATION_VALUES.PARENT.value,
    label: "緊急連絡先続柄",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: EMERGENCY_CONTACT_RELATION_OPTIONS,
      },
    },
  },
  employmentStatus: {
    ...generalDefinitions.select,
    default: EMPLOYMENT_STATUS_VALUES.ACTIVE.value,
    label: "雇用状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: EMPLOYMENT_STATUS_OPTIONS,
      },
    },
  },
  gender: {
    ...generalDefinitions.select,
    default: GENDER_VALUES.MALE.value,
    label: "性別",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: GENDER_OPTIONS,
      },
    },
  },
  insuranceStatus: {
    ...generalDefinitions.select,
    default: INSURANCE_STATUS_VALUES.NOT_ENROLLED.value,
    label: "保険状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: INSURANCE_STATUS_OPTIONS,
      },
    },
  },
  paymentDate: {
    ...generalDefinitions.select,
    default: CutoffDate.VALUES[0].value,
    label: "入金サイト（日）",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: CutoffDate.OPTIONS,
      },
    },
  },
  paymentMonth: {
    ...generalDefinitions.select,
    default: PAYMENT_MONTH_VALUES[1].value,
    label: "入金サイト（月数）",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: PAYMENT_MONTH_OPTIONS,
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
        items: PREFECTURES_OPTIONS,
      },
    },
  },
  shiftType: {
    ...generalDefinitions.select,
    default: SHIFT_TYPE_VALUES.DAY.value,
    label: "勤務区分",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: SHIFT_TYPE_OPTIONS,
      },
    },
  },
  siteStatus: {
    ...generalDefinitions.select,
    default: SITE_STATUS_VALUES.ACTIVE.value,
    label: "状態",
    component: {
      name: generalDefinitions.select.component.name,
      attrs: {
        items: SITE_STATUS_OPTIONS,
      },
    },
  },
};
