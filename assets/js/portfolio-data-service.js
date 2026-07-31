export class PortfolioDataService {
  constructor(baseUrl = '.') {
    this.baseUrl = baseUrl;
    this.schemaVersion = 1;
    this.knownAssets = ['assets/images/profile.jpg', 'assets/downloads/README.txt'];
  }

  /**
   * Load the canonical portfolio JSON from disk.
   * @param {string} url
   * @returns {Promise<{portfolio: object, validation: object}>}
   */
  async loadPortfolio(url = `${this.baseUrl}/portfolio.json`) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Unable to load portfolio: ${response.status}`);
    }
    const data = await response.json();
    const normalized = this.normalizePortfolio(data);
    const validation = this.validatePortfolio(normalized);
    return { portfolio: normalized, validation };
  }

  /**
   * Import a user-provided portfolio JSON file.
   * @param {File} file
   * @returns {Promise<{portfolio: object, validation: object}>}
   */
  async importPortfolio(file) {
    if (!file) {
      throw new Error('No file selected');
    }
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error('Imported portfolio is not valid JSON');
    }
    const normalized = this.normalizePortfolio(parsed);
    const validation = this.validatePortfolio(normalized);
    return { portfolio: normalized, validation };
  }

  /**
   * Export the current portfolio JSON for download.
   * @param {object} portfolio
   * @param {string} filename
   */
  exportPortfolio(portfolio, filename = 'portfolio.json') {
    const payload = JSON.stringify(this.versionPortfolio(portfolio), null, 2);
    this.downloadBlob(payload, filename, 'application/json');
  }

  /**
   * Export the current site bundle as a ZIP archive.
   * @param {object} portfolio
   * @param {string} filename
   * @param {{marketplaceMode?: boolean}} options
   */
  async exportWebsiteZip(portfolio, filename = 'portfolio-website.zip', options = {}) {
    if (!window.JSZip) {
      throw new Error('JSZip is not available. Please reload the page and try again.');
    }

    const zip = new window.JSZip();
    const files = this.buildExportManifest(portfolio, options);
    const queue = files.map(async (filePath) => {
      try {
        if (String(filePath).startsWith('asset://')) {
          // pull asset from the in-browser AssetStore when available
          const id = String(filePath).replace(/^asset:\/\//, '');
          if (window.AssetStore && typeof window.AssetStore.getBlob === 'function') {
            const blob = await window.AssetStore.getBlob(id);
            const entry = await (window.AssetStore.getEntry ? window.AssetStore.getEntry(id) : null);
            if (!blob) return;
            // derive filename from metadata or mime
            let name = entry?.name || id;
            if (!name.includes('.')) {
              const mime = entry?.mime || blob.type || 'application/octet-stream';
              const ext = mime.split('/').pop();
              name = `${name}.${ext}`;
            }
            zip.file(name, blob);
            return;
          }
          // if no AssetStore available, skip
          return;
        }

        const response = await fetch(filePath, { cache: 'no-cache' });
        if (!response.ok) {
          return;
        }
        const blob = await response.blob();
        zip.file(filePath.replace(/^\.\//, ''), blob);
      } catch (e) {
        // ignore individual file errors to allow best-effort packaging
      }
    });

    await Promise.all(queue);
    const archive = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(archive, filename, 'application/zip');
  }

  /**
   * Normalize a portfolio object into the canonical Studio structure.
   * @param {object} data
   * @returns {object}
   */
  normalizePortfolio(data = {}) {
    const portfolio = JSON.parse(JSON.stringify(data));
    portfolio.schemaVersion = portfolio.schemaVersion || this.schemaVersion;
    portfolio.meta = portfolio.meta || {};
    portfolio.meta.title = portfolio.meta.title || portfolio.identity?.name || 'Portfolio Builder';
    portfolio.meta.description = portfolio.meta.description || 'A premium portfolio experience built with the Portfolio Studio.';
    portfolio.meta.marketplaceMode = Boolean(portfolio.meta.marketplaceMode);
    portfolio.identity = portfolio.identity || {};
    portfolio.identity.name = portfolio.identity.name || 'Your Name';
    portfolio.identity.tagline = portfolio.identity.tagline || 'Portfolio Builder';
    portfolio.identity.summary = portfolio.identity.summary || 'Thoughtful product delivery, leadership, and design systems.';
    portfolio.contact = portfolio.contact || {};
    portfolio.hero = portfolio.hero || {};
    portfolio.hero.headline = portfolio.hero.headline || 'I build product experiences that move the needle.';
    portfolio.hero.description = portfolio.hero.description || 'Thoughtful product delivery, leadership, and design systems.';
    portfolio.experience = Array.isArray(portfolio.experience) ? portfolio.experience : [];
    portfolio.projects = Array.isArray(portfolio.projects) ? portfolio.projects : [];
    portfolio.testimonials = Array.isArray(portfolio.testimonials) ? portfolio.testimonials : [];
    portfolio.awards = Array.isArray(portfolio.awards) ? portfolio.awards : [];
    portfolio.skills = Array.isArray(portfolio.skills) ? portfolio.skills : [];
    portfolio.components = portfolio.components || {};
    portfolio.theme = portfolio.theme || {};
    portfolio.theme.accent = portfolio.theme.accent || '#4f8cff';
    portfolio.theme.background = portfolio.theme.background || '#0a1220';
    portfolio.theme.borderRadius = portfolio.theme.borderRadius || '14px';
    portfolio.theme.shadow = portfolio.theme.shadow || '0 18px 44px rgba(2,8,20,.5)';
    portfolio.theme.typographyScale = portfolio.theme.typographyScale ?? 1;
    portfolio.theme.fontFamily = portfolio.theme.fontFamily || 'Inter';
    portfolio.theme.fontSize = portfolio.theme.fontSize || '16px';
    portfolio.theme.defaultMode = portfolio.theme.defaultMode || 'dark';
    portfolio.assets = Array.isArray(portfolio.assets) ? portfolio.assets : [];
    portfolio.navigation = Array.isArray(portfolio.navigation) ? portfolio.navigation : [
      { id: 'leadership', label: 'Leadership' },
      { id: 'experience', label: 'Experience' },
      { id: 'contact', label: 'Contact' }
    ];
    return portfolio;
  }

  /**
   * Validate portfolio completeness and surface actionable issues.
   * @param {object} portfolio
   * @returns {{valid: boolean, errors: string[], warnings: string[], report: object, score: number}}
   */
  validatePortfolio(portfolio) {
    const normalized = this.normalizePortfolio(portfolio);
    const report = this.buildValidationReport(normalized);
    const errors = report.issues.filter((issue) => issue.severity === 'Critical').map((issue) => issue.message);
    const warnings = report.issues.filter((issue) => issue.severity !== 'Critical').map((issue) => issue.message);
    return { valid: errors.length === 0, errors, warnings, report, score: report.score };
  }

  /**
   * Assess the portfolio health and generate suggestions.
   * @param {object} portfolio
   * @returns {{score: number, summary: string, categories: object[], suggestions: object[]}}
   */
  analyzePortfolio(portfolio) {
    const normalized = this.normalizePortfolio(portfolio);
    const categories = [
      { key: 'hero', label: 'Hero completeness', weight: 10, complete: Boolean(normalized.hero?.headline && normalized.hero?.description) },
      { key: 'experience', label: 'Experience completeness', weight: 10, complete: Array.isArray(normalized.experience) && normalized.experience.length > 0 },
      { key: 'projects', label: 'Projects', weight: 10, complete: Array.isArray(normalized.projects) && normalized.projects.length > 0 },
      { key: 'skills', label: 'Skills', weight: 10, complete: Array.isArray(normalized.skills) && normalized.skills.length > 0 },
      { key: 'testimonials', label: 'Testimonials', weight: 8, complete: Array.isArray(normalized.testimonials) && normalized.testimonials.length > 0 },
      { key: 'awards', label: 'Awards', weight: 8, complete: Array.isArray(normalized.awards) && normalized.awards.length > 0 },
      { key: 'resume', label: 'Resume', weight: 8, complete: Boolean(normalized.contact?.resume) },
      { key: 'social', label: 'Social links', weight: 8, complete: Boolean(normalized.contact?.website || normalized.contact?.linkedin) },
      { key: 'contact', label: 'Contact details', weight: 10, complete: Boolean(normalized.contact?.email && normalized.contact?.location) },
      { key: 'images', label: 'Image quality', weight: 8, complete: Boolean(normalized.identity?.photo || normalized.hero?.image) },
      { key: 'seo', label: 'SEO metadata', weight: 10, complete: Boolean(normalized.meta?.title && normalized.meta?.description) }
    ];

    const score = Math.round(categories.reduce((total, category) => total + (category.complete ? category.weight : 0), 0));
    const suggestions = this.buildValidationReport(normalized).issues.map((issue) => ({
      severity: issue.severity,
      message: issue.message,
      section: issue.section
    }));

    return {
      score,
      summary: score >= 90 ? 'Portfolio is ready for distribution.' : score >= 75 ? 'Portfolio is strong with a few refinements remaining.' : 'Portfolio needs more content and polish before distribution.',
      categories,
      suggestions
    };
  }

  /**
   * Build a structured validation report.
   * @param {object} portfolio
   * @returns {{generatedAt: string, score: number, issues: object[], severityCounts: object}}
   */
  buildValidationReport(portfolio) {
    const normalized = this.normalizePortfolio(portfolio);
    const issues = [];

    const addIssue = (severity, message, section) => {
      issues.push({ severity, message, section });
    };

    if (!normalized.identity?.name) {
      addIssue('Critical', 'Personal name is required.', 'identity');
    }
    if (!normalized.identity?.tagline) {
      addIssue('Critical', 'Personal tagline is required.', 'identity');
    }
    if (!normalized.hero?.headline) {
      addIssue('Critical', 'Hero headline is required.', 'hero');
    }
    if (!normalized.hero?.description) {
      addIssue('Critical', 'Hero description is required.', 'hero');
    }
    if (!normalized.contact?.email || !this.isEmailValid(normalized.contact.email)) {
      addIssue('Critical', 'A valid email address is required.', 'contact');
    }
    if (normalized.contact?.website && !this.isUrlValid(normalized.contact.website)) {
      addIssue('Critical', 'Website must be a valid URL.', 'contact');
    }
    if (normalized.contact?.linkedin && !this.isUrlValid(normalized.contact.linkedin)) {
      addIssue('Critical', 'LinkedIn URL must be a valid URL.', 'contact');
    }
    if (!normalized.contact?.resume) {
      addIssue('Recommended', 'Add a resume link so recruiters can review your credentials.', 'contact');
    }
    if (!normalized.meta?.title) {
      addIssue('Recommended', 'Add SEO title metadata for the portfolio page.', 'seo');
    }
    if (!normalized.meta?.description) {
      addIssue('Recommended', 'Add SEO description metadata for better sharing and discoverability.', 'seo');
    }
    if (!Array.isArray(normalized.experience) || normalized.experience.length === 0) {
      addIssue('Recommended', 'Add experience entries to tell a stronger professional story.', 'experience');
    }
    if (!Array.isArray(normalized.projects) || normalized.projects.length === 0) {
      addIssue('Recommended', 'Add at least one project to showcase delivery impact.', 'projects');
    }
    if (!Array.isArray(normalized.skills) || normalized.skills.length === 0) {
      addIssue('Optional', 'Add a skills section to reinforce domain expertise.', 'skills');
    }
    if (!Array.isArray(normalized.testimonials) || normalized.testimonials.length === 0) {
      addIssue('Optional', 'Add testimonials to increase trust and credibility.', 'testimonials');
    }
    if (!Array.isArray(normalized.awards) || normalized.awards.length === 0) {
      addIssue('Optional', 'Add recognition and awards to strengthen the professional narrative.', 'awards');
    }

    const duplicateTitles = this.findDuplicateEntries(normalized); 
    if (duplicateTitles.length) {
      addIssue('Recommended', `Duplicate entries detected: ${duplicateTitles.join(', ')}`, 'content');
    }

    const assetRefs = [normalized.identity?.photo, normalized.hero?.image, ...normalized.projects.map((item) => item.image), ...normalized.awards.map((item) => item.image)].filter(Boolean);
    assetRefs.forEach((assetRef) => {
      if (this.isRemoteAsset(assetRef)) {
        return;
      }
      if (!this.assetExists(assetRef, normalized.assets)) {
        addIssue('Recommended', `Asset reference ${assetRef} is not registered in the asset manifest.`, 'assets');
      }
    });

    if (!normalized.identity?.photo && !normalized.hero?.image) {
      addIssue('Optional', 'Add one or more portfolio images for a richer preview experience.', 'assets');
    }

    normalized.experience.forEach((item, index) => {
      if (!item.title && !item.company) {
        addIssue('Recommended', `Experience entry ${index + 1} is missing core details.`, 'experience');
      }
    });

    normalized.projects.forEach((item, index) => {
      if (!item.title && !item.summary && !item.subtitle) {
        addIssue('Recommended', `Project entry ${index + 1} is empty.`, 'projects');
      }
    });

    const severityCounts = { Critical: 0, Recommended: 0, Optional: 0 };
    issues.forEach((issue) => {
      severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
    });

    const score = Math.max(0, Math.min(100, 100 - (severityCounts.Critical * 15) - (severityCounts.Recommended * 6) - (severityCounts.Optional * 3)));
    return { generatedAt: new Date().toISOString(), score, issues, severityCounts };
  }

  /**
   * Download a JSON validation report.
   * @param {object} report
   * @param {string} filename
   */
  downloadValidationReport(report, filename = 'validation-report.json') {
    this.downloadBlob(JSON.stringify(report, null, 2), filename, 'application/json');
  }

  /**
   * Validate image dimensions from a local File object.
   * @param {File} file
   * @param {{minWidth?: number, minHeight?: number}} options
   * @returns {Promise<{valid: boolean, width: number, height: number, errors: string[]}>}
   */
  async validateImageFile(file, { minWidth = 300, minHeight = 300 } = {}) {
    if (!file) {
      return { valid: false, errors: ['No image was provided.'] };
    }
    if (!file.type.startsWith('image/')) {
      return { valid: false, errors: ['Only image files are supported.'] };
    }
    return new Promise((resolve) => {
      const image = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        image.onload = () => {
          const valid = image.width >= minWidth && image.height >= minHeight;
          resolve({
            valid,
            width: image.width,
            height: image.height,
            errors: valid ? [] : [`Image dimensions must be at least ${minWidth}x${minHeight}px.`]
          });
        };
        image.onerror = () => resolve({ valid: false, errors: ['The selected image could not be read.'] });
        image.src = event.target.result;
      };
      reader.onerror = () => resolve({ valid: false, errors: ['The selected image could not be read.'] });
      reader.readAsDataURL(file);
    });
  }

  /**
   * Version the portfolio before export.
   * @param {object} portfolio
   * @returns {object}
   */
  versionPortfolio(portfolio) {
    const normalized = JSON.parse(JSON.stringify(portfolio));
    normalized.schemaVersion = this.schemaVersion;
    normalized.meta = normalized.meta || {};
    normalized.meta.updatedAt = new Date().toISOString();
    normalized.meta.versionLabel = `v${this.schemaVersion}`;
    return normalized;
  }

  /**
   * Build the file manifest for ZIP exports.
   * @param {object} portfolio
   * @param {{marketplaceMode?: boolean}} options
   * @returns {string[]}
   */
  buildExportManifest(portfolio, options = {}) {
    const isMarketplace = Boolean(options.marketplaceMode || portfolio.meta?.marketplaceMode);
    const files = [
      'index.html',
      'portfolio.json',
      'assets/css/style.css',
      'assets/css/variables.css',
      'assets/css/responsive.css',
      'assets/css/studio.css',
      'assets/js/config.js',
      'assets/js/theme.js',
      'assets/js/navigation.js',
      'assets/js/counters.js',
      'assets/js/ui.js',
      'assets/js/palette.js',
      'assets/js/main.js',
      'assets/js/renderer.js',
      'assets/js/portfolio-data-service.js',
      'assets/js/content-service.js',
      'assets/js/studio-app.js',
      'assets/data/experience.json',
      'assets/data/testimonials.json',
      'assets/data/recognition.json',
      'assets/data/success-stories.json',
      'assets/images/profile.jpg',
      'assets/downloads/README.txt',
      'README.md',
      'robots.txt',
      'site.webmanifest',
      'sitemap.xml'
    ];

    if (isMarketplace) {
      return files.filter((filePath) => !filePath.startsWith('studio.html') && !filePath.includes('studio-app') && !filePath.includes('portfolio-data-service'));
    }

    files.unshift('studio.html');
    const assetRefs = (portfolio.assets || []).map((asset) => asset.src).filter(Boolean);
    assetRefs.forEach((assetRef) => {
      if (!this.isRemoteAsset(assetRef) && !files.includes(assetRef)) {
        files.push(assetRef);
      }
    });

    return files.filter((filePath) => !filePath.startsWith('assets/dev/') && !filePath.startsWith('screenshots/'));
  }

  /**
   * Download a Blob as a file.
   * @param {Blob|string} blob
   * @param {string} filename
   * @param {string} mimeType
   */
  downloadBlob(blob, filename, mimeType) {
    const downloadUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }

  isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  }

  isUrlValid(url) {
    if (!url) {
      return true;
    }
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  isRemoteAsset(value) {
    return /^(https?:|data:|mailto:|#)/i.test(value || '');
  }

  assetExists(assetRef, assets = []) {
    if (!assetRef) {
      return false;
    }
    const normalized = assetRef.replace(/^\.\//, '');
    const knownMatch = this.knownAssets.includes(normalized);
    if (knownMatch) {
      return true;
    }
    return assets.some((asset) => {
      const src = (asset.src || '').replace(/^\.\//, '');
      return src === normalized || asset.id === assetRef;
    });
  }

  /**
   * Find duplicate experience/project/testimonial titles.
   * @param {object} portfolio
   * @returns {string[]}
   */
  findDuplicateEntries(portfolio) {
    const labels = [];
    const addFrom = (items, key) => {
      const values = items.map((item) => (item[key] || '').trim()).filter(Boolean);
      values.forEach((value) => {
        if (labels.includes(value)) {
          return;
        }
        if (values.filter((candidate) => candidate === value).length > 1) {
          labels.push(value);
        }
      });
    };

    addFrom(portfolio.experience || [], 'title');
    addFrom(portfolio.projects || [], 'title');
    addFrom(portfolio.awards || [], 'title');
    addFrom(portfolio.testimonials || [], 'name');
    return labels;
  }
}
