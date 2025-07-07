export function fetchDocsApi(constructor) {
  const instance = new constructor();
  return async (search) => await instance.fetchDocs({ constraints: search });
}

export function fetchItemByKeyApi(constructor) {
  const instance = new constructor();
  return async (docId) => await instance.fetchDoc({ docId });
}
