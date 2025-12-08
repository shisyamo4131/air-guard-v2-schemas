// 2025-12-08
// アプリ側で `useFetchXxxx` コンポーザブルを使用した API 連携を行う為
// このファイルは不要。
// 各種関数に依存しているファイルの存在がないことを確認の上、削除予定。
export function fetchDocsApi(constructor) {
  const instance = new constructor();
  return async (search) => await instance.fetchDocs({ constraints: search });
}

export function fetchItemByKeyApi(constructor) {
  const instance = new constructor();
  return async (docId) => await instance.fetchDoc({ docId });
}
