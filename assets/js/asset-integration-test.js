// Simple browser-run test harness for asset store, editor asset flows, and export ZIP.
// Usage: Open studio.html, then in the browser console run:
//   fetch('assets/js/asset-integration-test.js').then(r=>r.text()).then(eval)
// Then call runAssetIntegrationTests() from the console.

async function runAssetIntegrationTests() {
  if (!window.AssetStore) {
    console.warn('AssetStore not present on window. Ensure studio-app.js initialized.');
    return;
  }
  console.log('Starting Asset integration tests');
  // create a small test image (1x1 px) as data URL
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  try {
    const id = await window.AssetStore.saveDataUrl(dataUrl, { name: 'test-1x1.png' });
    console.log('Saved asset id', id);
    const has = await window.AssetStore.has(id);
    console.assert(has === true, 'Asset should exist');
    const dataUrl2 = await window.AssetStore.getDataUrl(id);
    console.assert(dataUrl2 && dataUrl2.startsWith('data:'), 'getDataUrl should return data: URL');

    // increment and decrement refs
    await window.AssetStore.incrementRef(id);
    const entry = await window.AssetStore.getEntry(id);
    console.assert(entry.refCount >= 1, 'Ref count should be incremented');
    await window.AssetStore.decrementRef(id);
    const entry2 = await window.AssetStore.getEntry(id);
    console.assert(entry2.refCount === 0, 'Ref count should be back to 0');

    // test garbage collect deletes unreferenced
    const deleted = await window.AssetStore.garbageCollect();
    console.log('garbageCollect deleted', deleted);
    const has2 = await window.AssetStore.has(id);
    console.assert(has2 === false, 'Asset should be deleted by garbageCollect');

    console.log('Asset integration tests passed (manual assertions).');
  } catch (e) {
    console.error('Asset integration test failed', e);
  }
}
