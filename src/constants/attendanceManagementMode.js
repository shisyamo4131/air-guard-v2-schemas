/*****************************************************************************
 * 勤怠管理方式
 *****************************************************************************/

export const VALUES = Object.freeze({
  /**
   * 実際に勤務を開始した暦日を基準に勤怠を管理します。
   * DailyAttendanceを使用する既存の勤怠管理方式です。
   */
  ACTUAL_DATE: {
    title: "暦日基準",
    value: "ACTUAL_DATE",
  },

  /**
   * 稼働実績のdateAtを基準に勤怠を管理します。
   * DailyOperationByEmployeeを使用する勤怠管理方式です。
   */
  OPERATION_DATE: {
    title: "稼働日基準",
    value: "OPERATION_DATE",
  },
});

export const OPTIONS = Object.values(VALUES).map(({ title, value }) => ({
  title,
  value,
}));
