export class AssetStore {
  constructor(dbName = 'portfolio-studio', storeName = 'assets') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  open() {
    return new Promise((resolve, reject) => {
      if (this.db) return resolve(this.db);
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          // indexes for metadata queries
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('refCount', 'refCount', { unique: false });
        }
      };
      req.onsuccess = (ev) => {
        this.db = ev.target.result;
        resolve(this.db);
      };
      req.onerror = (ev) => reject(ev.target.error || new Error('IndexedDB open failed'));
    });
  }

  _store(mode = 'readonly') {
    if (!this.db) throw new Error('DB not opened');
    return this.db.transaction([this.storeName], mode).objectStore(this.storeName);
  }

  async saveBlob(blob, meta = {}) {
    await this.open();
    const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `asset-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const entry = Object.assign({ id, blob, createdAt: new Date().toISOString(), refCount: 0 }, meta);
      const req = store.add(entry);
      req.onsuccess = () => resolve(id);
      req.onerror = (e) => reject(e.target.error || new Error('Asset save failed'));
    });
  }

  async saveDataUrl(dataUrl, meta = {}) {
    const blob = this.dataUrlToBlob(dataUrl);
    if (!blob) throw new Error('Invalid data URL');
    return this.saveBlob(blob, Object.assign({ mime: blob.type }, meta));
  }

  async getEntry(id) {
    await this.open();
    return new Promise((resolve, reject) => {
      const store = this._store('readonly');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error || new Error('Asset read failed'));
    });
  }

  async getBlob(id) {
    const entry = await this.getEntry(id);
    return entry ? entry.blob : null;
  }

  async getDataUrl(id) {
    const blob = await this.getBlob(id);
    if (!blob) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not convert blob to dataURL'));
      reader.readAsDataURL(blob);
    });
  }

  async has(id) {
    const entry = await this.getEntry(id);
    return Boolean(entry);
  }

  async delete(id) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error || new Error('Asset delete failed'));
    });
  }

  async listAssets() {
    await this.open();
    return new Promise((resolve, reject) => {
      const store = this._store('readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error || new Error('Asset list failed'));
    });
  }

  async incrementRef(id) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        const entry = req.result;
        if (!entry) return resolve(false);
        entry.refCount = (entry.refCount || 0) + 1;
        const upd = store.put(entry);
        upd.onsuccess = () => resolve(true);
        upd.onerror = (e) => reject(e.target.error || new Error('Asset increment failed'));
      };
      req.onerror = (e) => reject(e.target.error || new Error('Asset increment failed'));
    });
  }

  async decrementRef(id) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        const entry = req.result;
        if (!entry) return resolve(false);
        entry.refCount = Math.max(0, (entry.refCount || 0) - 1);
        const upd = store.put(entry);
        upd.onsuccess = () => resolve(true);
        upd.onerror = (e) => reject(e.target.error || new Error('Asset decrement failed'));
      };
      req.onerror = (e) => reject(e.target.error || new Error('Asset decrement failed'));
    });
  }

  async garbageCollect() {
    const assets = await this.listAssets();
    const deletions = [];
    for (const a of assets) {
      if (!a.refCount || a.refCount <= 0) {
        deletions.push(this.delete(a.id).catch(() => false));
      }
    }
    const results = await Promise.all(deletions);
    return results.filter(Boolean).length; // number deleted
  }

  dataUrlToBlob(dataUrl) {
    try {
      const parts = dataUrl.split(',');
      const meta = parts[0].match(/:(.*?);/);
      const mime = meta ? meta[1] : 'application/octet-stream';
      const binary = atob(parts[1]);
      const len = binary.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch (e) {
      return null;
    }
  }
}
