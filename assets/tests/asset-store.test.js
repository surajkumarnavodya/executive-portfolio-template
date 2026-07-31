export async function runAssetStoreTests({ AssetStoreClass, output = console.log } = {}) {
  const results = [];
  const store = new AssetStoreClass();
  const assert = (condition, message) => {
    if (!condition) {
      throw new Error(message);
    }
    results.push(message);
    output(`✔ ${message}`);
  };

  await store.open();
  const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const id = await store.saveDataUrl(sampleDataUrl, { name: 'studio-test.png' });
  assert(Boolean(id), 'Asset save returned an id');

  const exists = await store.has(id);
  assert(exists, 'Asset exists after save');

  const dataUrl = await store.getDataUrl(id);
  assert(typeof dataUrl === 'string' && dataUrl.startsWith('data:'), 'Asset data URL is readable');

  const incremented = await store.incrementRef(id);
  assert(incremented, 'Reference count increments');

  const entry = await store.getEntry(id);
  assert(entry && entry.refCount >= 1, 'Stored entry exposes updated ref count');

  const decremented = await store.decrementRef(id);
  assert(decremented, 'Reference count decrements');

  const deletedCount = await store.garbageCollect();
  assert(deletedCount >= 0, 'Garbage collection completes');

  const stillExists = await store.has(id);
  assert(!stillExists, 'Unreferenced asset is removed by garbage collection');

  return {
    passed: results.length,
    results
  };
}
