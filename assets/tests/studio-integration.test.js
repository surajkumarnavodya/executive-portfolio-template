import '../js/studio-app.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {}, { once: true });
}
window.dispatchEvent(new Event('DOMContentLoaded'));

export async function runStudioIntegrationTests({ output = console.log } = {}) {
  const results = [];
  const assert = (condition, message) => {
    if (!condition) {
      throw new Error(message);
    }
    results.push(message);
    output(`✔ ${message}`);
  };

  const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

  let assetStore = window.AssetStore;
  if (!assetStore) {
    await wait(1000);
    assetStore = window.AssetStore;
  }
  assert(assetStore, 'Studio initialized an AssetStore instance');
  await assetStore.open();

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const context = canvas.getContext('2d');
  context.fillStyle = '#4f8cff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillRect(40, 40, 320, 320);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('Canvas export failed'))), 'image/png');
  });

  const imageFile = new File([blob], 'studio-avatar.png', { type: 'image/png' });

  const assetUploadInput = document.getElementById('assetUploadInput');
  assert(assetUploadInput, 'Asset upload input is present for the Studio asset-manager integration test');

  const assetManager = document.getElementById('assetManager');
  for (let index = 0; index < 20 && !assetManager?.querySelector('[data-action="upload"]'); index += 1) {
    await wait(150);
  }
  assert(assetManager?.querySelector('[data-action="upload"]'), 'Studio asset-manager UI is initialized before upload');

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(imageFile);
  assetUploadInput.files = dataTransfer.files;
  assetUploadInput.dispatchEvent(new Event('change', { bubbles: true }));

  await wait(600);

  const assetEntries = await assetStore.listAssets();
  assert(assetEntries.length > 0, 'The Studio asset-manager flow stores uploaded assets');

  assert(assetManager, 'Asset manager container exists after Studio initialization');
  const previewImage = assetManager.querySelector('img');
  assert(previewImage, 'The asset manager renders a preview image after upload');
  assert(previewImage.src.includes('data:image') || previewImage.src.includes('blob:'), 'The preview image resolves to an image source');

  const portfolio = {
    identity: { name: 'Test Studio', tagline: 'Studio integration' },
    hero: { headline: 'Hero', description: 'Hero description' },
    contact: { email: 'a@example.com', location: 'Remote' },
    meta: { title: 'Studio export', description: 'Studio export description' },
    experience: [],
    projects: [],
    testimonials: [],
    awards: [],
    skills: [],
    assets: [{ id: assetEntries[0].id, src: `asset://${assetEntries[0].id}`, name: assetEntries[0].name, type: 'image' }],
    components: {},
    theme: {}
  };

  const service = new window.PortfolioServiceCtor();
  const captured = {};
  const originalDownloadBlob = service.downloadBlob;
  service.downloadBlob = (blob, filename, mimeType) => {
    captured.blob = blob;
    captured.filename = filename;
    captured.mimeType = mimeType;
  };

  class FakeJSZip {
    constructor() {
      this.files = {};
    }
    file(name, blob) {
      this.files[name] = blob;
    }
    async generateAsync() {
      return new Blob([JSON.stringify(this.files)], { type: 'application/zip' });
    }
  }

  window.JSZip = FakeJSZip;
  await service.exportWebsiteZip(portfolio, 'studio-export.zip');
  assert(captured.filename === 'studio-export.zip', 'ZIP export uses the requested archive name');
  assert(captured.mimeType === 'application/zip', 'ZIP export reports the archive MIME type');
  const archiveText = await captured.blob.text();
  const archiveFiles = JSON.parse(archiveText);
  assert(Object.keys(archiveFiles).length > 0, 'ZIP export contains files');
  assert(Object.keys(archiveFiles).some((name) => name.includes('studio-avatar')), 'ZIP export includes the uploaded asset file');

  service.downloadBlob = originalDownloadBlob;
  delete window.JSZip;

  return { passed: results.length, results };
}
