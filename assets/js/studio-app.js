import { PortfolioDataService } from './portfolio-data-service.js';
import { ContentService } from './content-service.js';
import { AssetStore } from './asset-store.js';

const service = new PortfolioDataService('.');
const contentService = new ContentService();
const assetStore = new AssetStore();
window.AssetStore = assetStore;

const state = {
  portfolio: null,
  originalPortfolio: null,
  activeStep: 0,
  editingMap: {},
  dragIndex: null,
  sectionDragId: null,
  validation: null,
  splitRatio: 0.58,
  assetManager: {
    target: 'profile'
  },
  demoProfiles: [],
  history: [],
  future: []
};

const stepNames = [
  'Personal Information',
  'Hero Section',
  'Experience',
  'Projects',
  'Testimonials',
  'Awards',
  'Skills',
  'Contact',
  'Theme',
  'Layout Builder'
];

const editorConfig = {
  experience: {
    title: 'Experience',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'start', label: 'Start', type: 'text' },
      { key: 'end', label: 'End', type: 'text' },
      { key: 'blurb', label: 'Blurb', type: 'textarea' },
      { key: 'bullets', label: 'Bullets', type: 'text' }
    ]
  },
  projects: {
    title: 'Projects',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'link', label: 'Link', type: 'url' },
      { key: 'image', label: 'Image', type: 'text' }
    ]
  },
  testimonials: {
    title: 'Testimonials',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'org', label: 'Organization', type: 'text' },
      { key: 'quote', label: 'Quote', type: 'textarea' }
    ]
  },
  awards: {
    title: 'Awards',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'issuer', label: 'Issuer', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'note', label: 'Note', type: 'textarea' }
    ]
  },
  skills: {
    title: 'Skills',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' }
    ]
  }
};

const componentRegistry = {
  hero: {
    label: 'Hero layout',
    variants: [{ id: 'classic', label: 'Classic' }, { id: 'split', label: 'Split' }]
  },
  experience: {
    label: 'Experience layout',
    variants: [{ id: 'timeline', label: 'Timeline' }, { id: 'cards', label: 'Cards' }]
  },
  projects: {
    label: 'Projects layout',
    variants: [{ id: 'cards', label: 'Cards' }, { id: 'stacked', label: 'Stacked' }]
  },
  testimonials: {
    label: 'Testimonials layout',
    variants: [{ id: 'cards', label: 'Cards' }, { id: 'quote-strip', label: 'Quote Strip' }]
  },
  awards: {
    label: 'Awards layout',
    variants: [{ id: 'grid', label: 'Grid' }, { id: 'timeline', label: 'Timeline' }]
  },
  skills: {
    label: 'Skills layout',
    variants: [{ id: 'pill-grid', label: 'Pill Grid' }, { id: 'list', label: 'List' }]
  },
  footer: {
    label: 'Footer layout',
    variants: [{ id: 'simple', label: 'Simple' }, { id: 'contact-rail', label: 'Contact Rail' }]
  }
};

const SECTION_LAYOUT_DEFAULT = ['hero', 'leadership', 'success-stories', 'ai-leadership', 'expertise', 'experience', 'recognition', 'testimonials', 'contact', 'footer'];
const SECTION_LAYOUT_LABELS = {
  hero: 'Hero',
  leadership: 'Leadership',
  'success-stories': 'Success Stories',
  'ai-leadership': 'AI Leadership',
  expertise: 'Expertise',
  experience: 'Experience',
  recognition: 'Recognition',
  testimonials: 'Testimonials',
  contact: 'Contact',
  footer: 'Footer'
};

/**
 * Initialize the Studio experience.
 */
async function init() {
  // initialize the in-browser asset store before other actions
  try {
    await assetStore.open();
  } catch (e) {
    console.warn('AssetStore unavailable:', e);
  }
  bindGlobalEvents();
  attachDivider();
  await loadDemoProfiles();
  loadPortfolio();
}

/**
 * Load the canonical portfolio and restore the latest autosaved session when available.
 */
async function loadPortfolio() {
  try {
    const { portfolio, validation } = await service.loadPortfolio();
    state.originalPortfolio = service.normalizePortfolio(clonePortfolio(portfolio));
    const saved = readSessionState();
    state.portfolio = service.normalizePortfolio(saved?.portfolio || portfolio);
    ensureLayoutModel();
    state.validation = saved?.portfolio ? service.validatePortfolio(state.portfolio) : validation;
    state.splitRatio = saved?.splitRatio || 0.58;
    state.activeStep = saved?.activeStep || 0;
    hydrateForm();
    render();
    setStatus(saved?.portfolio ? 'Restored the latest saved Studio session.' : 'Loaded the portfolio data.');
  } catch (error) {
    console.error(error);
    state.portfolio = service.normalizePortfolio();
    ensureLayoutModel();
    state.originalPortfolio = service.normalizePortfolio();
    state.validation = { valid: false, errors: [error.message], warnings: [] };
    hydrateForm();
    render();
  }

  function ensureLayoutModel() {
    state.portfolio.meta = state.portfolio.meta || {};
    state.portfolio.meta.layout = state.portfolio.meta.layout || {};
    var order = Array.isArray(state.portfolio.meta.layout.order) ? state.portfolio.meta.layout.order.slice() : [];
    var enabled = state.portfolio.meta.layout.enabled && typeof state.portfolio.meta.layout.enabled === 'object' ? Object.assign({}, state.portfolio.meta.layout.enabled) : {};
    const seen = new Set();
    const normalizedOrder = [];
    order.forEach((id) => {
      if (SECTION_LAYOUT_DEFAULT.includes(id) && !seen.has(id)) {
        seen.add(id);
        normalizedOrder.push(id);
      }
    });
    SECTION_LAYOUT_DEFAULT.forEach((id) => {
      if (!seen.has(id)) { normalizedOrder.push(id); }
      if (typeof enabled[id] !== 'boolean') { enabled[id] = true; }
    });
    state.portfolio.meta.layout.order = normalizedOrder;
    state.portfolio.meta.layout.enabled = enabled;
  }

  async function loadDemoProfiles() {
    const select = document.getElementById('demoPackSelect');
    if (!select) {
      return;
    }
    try {
      const response = await fetch('assets/demo-data/demo-profiles.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('Could not load demo profile packs.');
      }
      const payload = await response.json();
      // Wrapped as { _comment, items } — see assets/demo-data/README.md.
      state.demoProfiles = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
      select.innerHTML = '<option value="">Demo profile pack</option>' + state.demoProfiles.map((item, index) => (
        `<option value="${index}">${escapeHtml(item.name || `Pack ${index + 1}`)}</option>`
      )).join('');
    } catch (error) {
      state.demoProfiles = [];
      setStatus('Demo packs unavailable in this build.', true);
    }
  }
}

/**
 * Bind global Studio interactions.
 */
function bindGlobalEvents() {
  document.querySelectorAll('[data-bind]').forEach((element) => {
    const { bind, type = 'text' } = element.dataset;
    const updateValue = () => {
      const value = type === 'checkbox' ? element.checked : type === 'number' ? Number(element.value) : element.value;
      rememberCurrentState();
      setByPath(state.portfolio, bind, value);
      refreshAfterMutation();
    };
    element.addEventListener('input', updateValue);
    element.addEventListener('change', updateValue);
  });

  const marketplaceToggle = document.getElementById('marketplaceToggle');
  if (marketplaceToggle) {
    marketplaceToggle.addEventListener('change', (event) => {
      rememberCurrentState();
      state.portfolio.meta = state.portfolio.meta || {};
      state.portfolio.meta.marketplaceMode = Boolean(event.currentTarget.checked);
      refreshAfterMutation({ rerenderEditors: true });
    });
  }

  document.getElementById('importPortfolio').addEventListener('click', () => document.getElementById('importInput').click());
  document.getElementById('importInput').addEventListener('change', async (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }
    try {
      const { portfolio, validation } = await service.importPortfolio(file);
      state.portfolio = service.normalizePortfolio(portfolio);
      ensureLayoutModel();
      state.originalPortfolio = service.normalizePortfolio(clonePortfolio(portfolio));
      state.validation = validation;
      hydrateForm();
      render();
      setStatus(`Imported ${file.name}`);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      event.target.value = '';
    }
  });

  document.getElementById('exportJson').addEventListener('click', () => {
    if (!state.portfolio) {
      return;
    }
    service.exportPortfolio(service.versionPortfolio(state.portfolio), `portfolio-${Date.now()}.json`);
    setStatus('Portfolio JSON exported.');
  });

  document.getElementById('exportZip').addEventListener('click', async () => {
    try {
      await service.exportWebsiteZip(state.portfolio, 'portfolio-site.zip', { marketplaceMode: Boolean(state.portfolio.meta?.marketplaceMode) });
      setStatus('Website ZIP exported.');
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  const importDemoPack = document.getElementById('importDemoPack');
  if (importDemoPack) {
    importDemoPack.addEventListener('click', () => {
      const select = document.getElementById('demoPackSelect');
      if (!select || !select.value) {
        setStatus('Choose a demo profile pack first.', true);
        return;
      }
      const index = Number(select.value);
      const pack = state.demoProfiles[index];
      if (!pack || !pack.portfolio) {
        setStatus('Invalid demo pack.', true);
        return;
      }
      rememberCurrentState();
      state.portfolio = service.normalizePortfolio(clonePortfolio(pack.portfolio));
      ensureLayoutModel();
      hydrateForm();
      render();
      setStatus(`Imported demo profile: ${pack.name}`);
    });
  }

  const exportLayoutConfig = document.getElementById('exportLayoutConfig');
  if (exportLayoutConfig) {
    exportLayoutConfig.addEventListener('click', () => {
      ensureLayoutModel();
      const payload = {
        order: state.portfolio.meta.layout.order,
        enabled: state.portfolio.meta.layout.enabled,
        components: state.portfolio.components || {}
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio-layout-config.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('Layout configuration exported.');
    });
  }

  const importLayoutConfig = document.getElementById('importLayoutConfig');
  const layoutImportInput = document.getElementById('layoutImportInput');
  if (importLayoutConfig && layoutImportInput) {
    importLayoutConfig.addEventListener('click', () => layoutImportInput.click());
    layoutImportInput.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || '{}'));
          rememberCurrentState();
          state.portfolio.meta = state.portfolio.meta || {};
          state.portfolio.meta.layout = state.portfolio.meta.layout || {};
          state.portfolio.meta.layout.order = Array.isArray(parsed.order) ? parsed.order : state.portfolio.meta.layout.order;
          state.portfolio.meta.layout.enabled = parsed.enabled && typeof parsed.enabled === 'object' ? parsed.enabled : state.portfolio.meta.layout.enabled;
          if (parsed.components && typeof parsed.components === 'object') {
            state.portfolio.components = parsed.components;
          }
          ensureLayoutModel();
          render();
          setStatus('Layout configuration imported.');
        } catch (error) {
          setStatus('Invalid layout configuration file.', true);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    });
  }

  document.getElementById('downloadValidationReport').addEventListener('click', () => {
    const report = state.validation?.report || service.buildValidationReport(state.portfolio);
    service.downloadValidationReport(report, 'portfolio-validation-report.json');
    setStatus('Validation report downloaded.');
  });

  document.getElementById('undoAction').addEventListener('click', undo);
  document.getElementById('redoAction').addEventListener('click', redo);
  document.getElementById('restoreSession').addEventListener('click', restoreSession);
  document.getElementById('resetOriginal').addEventListener('click', resetToOriginal);

  document.getElementById('assetUploadInput').addEventListener('change', (event) => handleAssetFileSelection(event, state.assetManager.target || 'profile'));
  document.getElementById('assetReplaceInput').addEventListener('change', (event) => handleAssetFileSelection(event, state.assetManager.target || 'profile'));

  document.querySelectorAll('[data-step]').forEach((element) => {
    element.addEventListener('click', () => {
      state.activeStep = Number(element.dataset.step);
      renderSteps();
    });
  });

  document.getElementById('nextStep').addEventListener('click', () => {
    state.activeStep = Math.min(stepNames.length - 1, state.activeStep + 1);
    renderSteps();
  });

  document.getElementById('prevStep').addEventListener('click', () => {
    state.activeStep = Math.max(0, state.activeStep - 1);
    renderSteps();
  });
}

/**
 * Hydrate form elements from the normalized portfolio state.
 */
function hydrateForm() {
  document.querySelectorAll('[data-bind]').forEach((element) => {
    const { bind } = element.dataset;
    const value = getByPath(state.portfolio, bind);
    if (element.type === 'checkbox') {
      element.checked = Boolean(value);
    } else if (element.tagName === 'SELECT' || element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = value ?? '';
    }
  });

  const marketplaceToggle = document.getElementById('marketplaceToggle');
  if (marketplaceToggle) {
    marketplaceToggle.checked = Boolean(state.portfolio.meta?.marketplaceMode);
  }
}

/**
 * Render the complete Studio view.
 */
async function render() {
  if (!state.portfolio) {
    return;
  }
  state.validation = service.validatePortfolio(state.portfolio);
  const preview = document.getElementById('previewContent');
  if (preview) {
    preview.classList.add('loading');
  }
  renderSteps();
  renderEditors();
  renderHealthDashboard();
  await renderAssetManager();
  renderPreview();
  renderValidation();
  applySplitRatio();
  saveSessionState();
  if (preview) {
    requestAnimationFrame(() => preview.classList.remove('loading'));
  }
}

/**
 * Toggle the wizard step visibility.
 */
function renderSteps() {
  document.querySelectorAll('.studio-step').forEach((element) => {
    element.classList.toggle('active', Number(element.dataset.step) === state.activeStep);
  });

  document.querySelectorAll('.studio-section').forEach((section) => {
    section.classList.toggle('hidden', Number(section.dataset.step) !== state.activeStep);
  });

  const stepLabel = document.getElementById('stepLabel');
  const stepCounter = document.getElementById('stepCounter');
  if (stepLabel) {
    stepLabel.textContent = `${state.activeStep + 1}. ${stepNames[state.activeStep]}`;
  }
  if (stepCounter) {
    stepCounter.textContent = `${state.activeStep + 1}/${stepNames.length}`;
  }
  const prevStep = document.getElementById('prevStep');
  const nextStep = document.getElementById('nextStep');
  if (prevStep) {
    prevStep.disabled = state.activeStep === 0;
  }
  if (nextStep) {
    nextStep.disabled = state.activeStep === stepNames.length - 1;
  }
}

/**
 * Render the reusable list editors for the portfolio content modules.
 */
function renderEditors() {
  ensureLayoutModel();
  renderListEditor('experience', 'Experience');
  renderListEditor('projects', 'Projects');
  renderListEditor('testimonials', 'Testimonials');
  renderListEditor('awards', 'Awards');
  renderListEditor('skills', 'Skills');
  renderLayoutSelectors();
  renderSectionLayoutEditor();
}

function renderListEditor(key, title) {
  const container = document.getElementById(`${key}Editor`);
  if (!container) {
    return;
  }
  const items = state.portfolio[key] || [];
  const activeItem = state.editingMap[key] ?? items[0];

  const listMarkup = items.map((item, index) => {
    const displayText = item.title || item.name || item.company || item.quote || item.category || `Item ${index + 1}`;
    const isSelected = activeItem === item;
    return `
      <div class="studio-item" draggable="true" data-key="${key}" data-index="${index}">
        <div class="studio-item-header">
          <span class="studio-item-title">${escapeHtml(displayText)}</span>
          <div class="studio-item-actions">
            <button type="button" class="studio-btn" data-action="move-up" data-key="${key}" data-index="${index}">↑</button>
            <button type="button" class="studio-btn" data-action="move-down" data-key="${key}" data-index="${index}">↓</button>
            <button type="button" class="studio-btn" data-action="edit" data-key="${key}" data-index="${index}">Edit</button>
            <button type="button" class="studio-btn" data-action="delete" data-key="${key}" data-index="${index}">Delete</button>
          </div>
        </div>
        ${isSelected ? renderInlineEditor(key, item, index) : ''}
      </div>`;
  }).join('');

  const markup = `
    <div class="studio-item-header">
      <strong>${title}</strong>
      <button type="button" class="studio-btn" data-action="add" data-key="${key}">Add</button>
    </div>
    <div class="studio-list">${listMarkup}</div>`;
  container.innerHTML = markup;

  container.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const { action, key: listKey, index } = event.currentTarget.dataset;
      handleListAction(listKey, action, Number(index));
    });
  });

  container.querySelectorAll('.studio-item').forEach((item) => {
    item.addEventListener('dragstart', (event) => {
      state.dragIndex = Number(event.currentTarget.dataset.index);
      event.currentTarget.classList.add('dragging');
    });
    item.addEventListener('dragend', (event) => {
      try { event.currentTarget.classList.remove('dragging'); } catch (e) {}
      state.dragIndex = null;
    });
    item.addEventListener('dragleave', (event) => {
      try { event.currentTarget.classList.remove('dragging'); } catch (e) {}
    });
    item.addEventListener('dragover', (event) => event.preventDefault());
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      const index = Number(item.dataset.index);
      if (state.dragIndex === null || Number.isNaN(index)) {
        return;
      }
      reorderList(key, state.dragIndex, index);
      state.dragIndex = null;
      // defensive cleanup
      container.querySelectorAll('.studio-item.dragging').forEach((el) => el.classList.remove('dragging'));
      render();
    });
  });

  container.querySelectorAll('input,textarea').forEach((input) => {
    input.addEventListener('input', (event) => {
      const { key: listKey, index: indexValue } = event.currentTarget.dataset;
      const index = Number(indexValue);
      const field = event.currentTarget.dataset.field;
      const currentItem = state.portfolio[listKey][index];
      if (!currentItem) {
        return;
      }
      if (field === 'bullets') {
        currentItem.bullets = event.currentTarget.value.split(',').map((part) => part.trim()).filter(Boolean);
      } else if (field === 'skills') {
        currentItem.skills = event.currentTarget.value.split(',').map((part) => part.trim()).filter(Boolean);
      } else {
        currentItem[field] = event.currentTarget.value;
      }
      renderPreview();
      saveSessionState();
    });
  });
}

/**
 * Build the inline editor UI for a given list item.
 */
function renderInlineEditor(key, item, index) {
  const config = editorConfig[key] || {};
  const fields = config.fields || [];
  return `
    <div class="studio-inline-editor">
      ${fields.map((field) => {
        const fieldValue = item[field.key] || '';
        const tag = field.type === 'textarea' ? 'textarea' : 'input';
        if (tag === 'textarea') {
          return `
            <div class="studio-field full">
              <label>${field.label}</label>
              <textarea data-field="${field.key}" data-key="${key}" data-index="${index}">${escapeHtml(fieldValue)}</textarea>
            </div>`;
        }
        return `
          <div class="studio-field">
            <label>${field.label}</label>
            <input type="${field.type}" data-field="${field.key}" data-key="${key}" data-index="${index}" value="${escapeHtml(fieldValue)}" />
          </div>`;
      }).join('')}
    </div>`;
}

/**
 * Render the component layout selectors.
 */
function renderLayoutSelectors() {
  const layoutHost = document.getElementById('layoutSelectors');
  if (!layoutHost) {
    return;
  }
  const entries = Object.entries(componentRegistry).map(([key, config]) => {
    const selected = state.portfolio.components[key]?.layout || config.variants[0].id;
    const options = config.variants.map((variant) => `<option value="${variant.id}" ${selected === variant.id ? 'selected' : ''}>${variant.label}</option>`).join('');
    return `
      <div class="studio-field">
        <label>${config.label}</label>
        <select data-component="${key}">
          ${options}
        </select>
      </div>`;
  }).join('');

  layoutHost.innerHTML = entries;
  layoutHost.querySelectorAll('select').forEach((select) => {
    select.addEventListener('change', (event) => {
      const componentKey = event.currentTarget.dataset.component;
      state.portfolio.components = state.portfolio.components || {};
      state.portfolio.components[componentKey] = state.portfolio.components[componentKey] || {};
      state.portfolio.components[componentKey].layout = event.currentTarget.value;
      renderPreview();
      saveSessionState();
    });
  });
}

function renderSectionLayoutEditor() {
  const host = document.getElementById('sectionLayoutEditor');
  if (!host || !state.portfolio) {
    return;
  }
  ensureLayoutModel();
  const order = state.portfolio.meta.layout.order || SECTION_LAYOUT_DEFAULT;
  const enabledMap = state.portfolio.meta.layout.enabled || {};

  host.innerHTML = `
    <div class="studio-list">
      ${order.map((id) => `
        <div class="studio-item studio-layout-item" draggable="true" data-layout-id="${id}">
          <div class="studio-item-header">
            <span class="studio-item-title">\u22EE\u22EE ${escapeHtml(SECTION_LAYOUT_LABELS[id] || id)}</span>
            <label class="studio-toggle">
              <input type="checkbox" data-layout-toggle="${id}" ${enabledMap[id] !== false ? 'checked' : ''}>
              <span>Visible</span>
            </label>
          </div>
        </div>
      `).join('')}
    </div>`;

  host.querySelectorAll('.studio-layout-item').forEach((item) => {
    item.addEventListener('dragstart', () => {
      state.sectionDragId = item.dataset.layoutId;
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      state.sectionDragId = null;
      item.classList.remove('dragging');
    });
    item.addEventListener('dragover', (event) => event.preventDefault());
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      const targetId = item.dataset.layoutId;
      const from = order.indexOf(state.sectionDragId);
      const to = order.indexOf(targetId);
      if (from < 0 || to < 0 || from === to) {
        return;
      }
      rememberCurrentState();
      const [moved] = order.splice(from, 1);
      order.splice(to, 0, moved);
      state.portfolio.meta.layout.order = order;
      render();
      setStatus('Section order updated.');
    });
  });

  host.querySelectorAll('[data-layout-toggle]').forEach((toggle) => {
    toggle.addEventListener('change', (event) => {
      const id = event.currentTarget.dataset.layoutToggle;
      rememberCurrentState();
      state.portfolio.meta.layout.enabled[id] = Boolean(event.currentTarget.checked);
      renderPreview();
      renderSectionLayoutEditor();
      saveSessionState();
    });
  });
}

/**
 * Render the Studio preview pane.
 */
function getThemeFontFamily(theme) {
  const rawValue = String(theme?.fontFamily || 'Inter').trim();
  return rawValue && !rawValue.includes(' ') ? rawValue : rawValue ? `"${rawValue}"` : 'Inter';
}

function getThemeFontStack(theme, fallback) {
  const family = getThemeFontFamily(theme);
  return `${family}, ${fallback}`;
}

function getThemeFontSize(theme) {
  const size = theme?.fontSize ?? theme?.typographyScale ?? '16px';
  if (typeof size === 'number' && Number.isFinite(size)) {
   return `${size}rem`;
  }
  if (typeof size === 'string') {
   const trimmed = size.trim();
   if (!trimmed) {
     return '16px';
   }
   if (/^\d+(\.\d+)?$/.test(trimmed)) {
     return `${trimmed}rem`;
   }
   if (/px|rem|em|%/.test(trimmed)) {
     return trimmed;
   }
   return `${trimmed}px`;
  }
  return '16px';
}

function renderPreview() {
  const preview = document.getElementById('previewContent');
  if (!preview) {
    return;
  }
  ensureLayoutModel();
  const portfolio = state.portfolio;
  const experienceLayout = portfolio.components?.experience?.layout || 'timeline';
  const projectLayout = portfolio.components?.projects?.layout || 'cards';
  const testimonialLayout = portfolio.components?.testimonials?.layout || 'cards';
  const awardsLayout = portfolio.components?.awards?.layout || 'grid';
  const skillsLayout = portfolio.components?.skills?.layout || 'pill-grid';
  const footerLayout = portfolio.components?.footer?.layout || 'simple';
  const content = contentService.getPreviewContent(portfolio);

  function renderCards(items, mapItem) {
    return `<div class="preview-list">${(items || []).map(mapItem).join('')}</div>`;
  }

  const experienceMarkup = renderCards(portfolio.experience, (item) => (
    `<div class="preview-card"><strong>${escapeHtml(item.title || 'Experience title')}</strong><p>${escapeHtml(item.company || 'Company')}</p><div class="preview-hint">${escapeHtml(item.start || 'Start')} → ${escapeHtml(item.end || 'Present')}</div></div>`
  ));

  const projectMarkup = renderCards(portfolio.projects, (item) => (
    `<div class="preview-card"><strong>${escapeHtml(item.title || 'Project')}</strong><p>${escapeHtml(item.summary || item.subtitle || '')}</p>${projectLayout === 'stacked' ? `<div class="preview-hint">${escapeHtml(item.link || 'Example link')}</div>` : ''}</div>`
  ));

  const testimonialMarkup = renderCards(portfolio.testimonials, (item) => (
    `<div class="preview-card"><strong>${escapeHtml(item.name || 'Reviewer')}</strong><p>${escapeHtml(item.quote || 'Quote')}</p></div>`
  ));

  const awardsMarkup = renderCards(portfolio.awards, (item) => (
    `<div class="preview-card"><strong>${escapeHtml(item.title || 'Award')}</strong><p>${escapeHtml(item.issuer || '')}</p>${awardsLayout === 'timeline' ? `<div class="preview-hint">${escapeHtml(item.year || 'Year')}</div>` : ''}</div>`
  ));

  const skillsMarkup = skillsLayout === 'list'
    ? renderCards(portfolio.skills, (skill) => `<div class="preview-card"><strong>${escapeHtml(skill.name || 'Skill')}</strong><p>${escapeHtml(skill.category || '')}</p></div>`)
    : `<div>${(portfolio.skills || []).map((skill) => `<span class="preview-pill">${escapeHtml(skill.name || skill.category || 'Skill')}</span>`).join('')}</div>`;

  const sectionMap = {
    hero: `
      <div class="preview-section">
        <div class="preview-hint">${escapeHtml(content.heroEyebrow)}</div>
        <h3>${escapeHtml(content.title)}</h3>
        <p>${escapeHtml(content.tagline)}</p>
        <div class="preview-card"><strong>${escapeHtml(content.heroHeadline)}</strong><p>${escapeHtml(content.heroDescription)}</p></div>
      </div>`,
    leadership: `<div class="preview-section"><h4>Leadership</h4><div class="preview-card">Leadership principles and positioning.</div></div>`,
    'success-stories': `<div class="preview-section"><h4>Projects</h4>${projectMarkup}</div>`,
    'ai-leadership': `<div class="preview-section"><h4>AI Leadership</h4><div class="preview-card">AI capability, learning path, and transformation readiness.</div></div>`,
    expertise: `<div class="preview-section"><h4>Skills</h4>${skillsMarkup}</div>`,
    experience: `<div class="preview-section"><h4>Experience (${escapeHtml(experienceLayout)})</h4>${experienceMarkup}</div>`,
    recognition: `<div class="preview-section"><h4>Awards (${escapeHtml(awardsLayout)})</h4>${awardsMarkup}</div>`,
    testimonials: `<div class="preview-section"><h4>Testimonials (${escapeHtml(testimonialLayout)})</h4>${testimonialMarkup}</div>`,
    contact: `<div class="preview-section"><h4>Contact</h4><div class="preview-card"><p>${escapeHtml(content.contactEmail)}</p><p>${escapeHtml(content.contactWebsite || content.contactEmail)}</p></div></div>`,
    footer: `<div class="preview-section"><h4>Footer</h4><div class="preview-card"><p>${escapeHtml(footerLayout === 'contact-rail' ? content.contactEmail : content.footerCta)}</p><p>${escapeHtml(content.contactWebsite || content.contactEmail)}</p></div></div>`
  };

  const order = portfolio.meta?.layout?.order || SECTION_LAYOUT_DEFAULT;
  const enabled = portfolio.meta?.layout?.enabled || {};
  const previewSections = order.filter((id) => enabled[id] !== false).map((id) => sectionMap[id] || '').join('');
  preview.innerHTML = previewSections;

  document.documentElement.style.setProperty('--accent', portfolio.theme?.accent || '#4f8cff');
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(portfolio.theme?.accent || '#4f8cff'));
  document.documentElement.style.setProperty('--bg', portfolio.theme?.background || '#0a1220');
  document.documentElement.style.setProperty('--radius', portfolio.theme?.borderRadius || '14px');
  document.documentElement.style.setProperty('--shadow', portfolio.theme?.shadow || '0 18px 44px rgba(2,8,20,.5)');
  document.documentElement.style.setProperty('--font-body', getThemeFontStack(portfolio.theme, 'system-ui, sans-serif'));
  document.documentElement.style.setProperty('--font-display', getThemeFontStack(portfolio.theme, 'Georgia, serif'));
  document.documentElement.style.fontSize = getThemeFontSize(portfolio.theme);
}

/**
 * Render the validation summary and health dashboard.
 */
function renderValidation() {
  const summary = document.getElementById('validationSummary');
  if (!summary) {
    return;
  }
  const validation = state.validation || { valid: true, errors: [], warnings: [] };
  const issues = [...validation.errors, ...validation.warnings];
  summary.innerHTML = `
    <h4>${validation.valid ? 'All checks passed' : 'Needs attention'}</h4>
    <ul>
      ${issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join('')}
    </ul>`;
  summary.className = `validation-summary ${validation.valid ? 'valid' : 'invalid'}`;
}

function renderHealthDashboard() {
  const host = document.getElementById('healthDashboard');
  if (!host) {
    return;
  }
  const health = service.analyzePortfolio(state.portfolio);
  const suggestionsMarkup = health.suggestions.slice(0, 6).map((suggestion) => `
    <div class="studio-suggestion ${String(suggestion.severity).toLowerCase()}">
      <strong>${escapeHtml(suggestion.severity)}</strong>
      <div>${escapeHtml(suggestion.message)}</div>
    </div>`).join('');

  host.innerHTML = `
    <div class="studio-dashboard-row">
      <div>
        <strong>Portfolio health</strong>
        <p class="studio-hint">${escapeHtml(health.summary)}</p>
      </div>
      <div class="studio-score">${health.score}</div>
    </div>
    <div class="studio-suggestion-list">${suggestionsMarkup}</div>`;
}

/**
 * Render the asset manager card.
 */
async function renderAssetManager() {
  const host = document.getElementById('assetManager');
  if (!host) {
    return;
  }
  const target = state.assetManager?.target || 'profile';
  const currentAsset = target === 'profile' ? state.portfolio.identity?.photo : state.portfolio.hero?.image;
  const missingAssets = (state.validation?.report?.issues || []).filter((issue) => issue.section === 'assets').map((issue) => issue.message);

  // fetch current stored assets to populate the manager list
  let stored = [];
  try {
    stored = (window.AssetStore && typeof window.AssetStore.listAssets === 'function') ? await window.AssetStore.listAssets() : [];
  } catch (error) {
    console.warn('Could not load asset store entries.', error);
  }

  host.innerHTML = `
    <div class="studio-dashboard-row">
      <strong>Asset manager</strong>
      <span class="studio-hint">Upload, replace, preview, crop and compress assets.</span>
    </div>
    <div class="studio-form-row">
      <div class="studio-field">
        <label>Target asset</label>
        <select id="assetTargetSelect">
          <option value="profile" ${target === 'profile' ? 'selected' : ''}>Profile</option>
          <option value="hero" ${target === 'hero' ? 'selected' : ''}>Hero</option>
        </select>
      </div>
      <div class="studio-field">
        <label>Crop width</label>
        <input id="assetWidthInput" type="number" value="1200">
      </div>
      <div class="studio-field">
        <label>Crop height</label>
        <input id="assetHeightInput" type="number" value="630">
      </div>
      <div class="studio-field">
        <label>Compression</label>
        <input id="assetQualityInput" type="number" min="0.3" max="1" step="0.05" value="0.82">
      </div>
    </div>
    <div class="studio-actions">
      <button class="studio-btn" type="button" data-action="upload">Upload</button>
      <button class="studio-btn" type="button" data-action="replace">Replace</button>
      <button class="studio-btn" type="button" data-action="crop">Crop</button>
      <button class="studio-btn" type="button" data-action="compress">Compress</button>
      <button class="studio-btn" type="button" id="pruneAssets">Prune unreferenced</button>
    </div>
    <div class="studio-asset-preview" data-asset-preview></div>
    <div class="studio-hint">${missingAssets.length ? `Missing assets: ${missingAssets.join(' · ')}` : 'Asset manifest looks healthy.'}</div>

    <div class="studio-asset-list">
      <h4>Stored assets</h4>
      <div id="assetListHost">
        ${stored.map((a) => `<div class="studio-asset-entry" data-asset-id="${a.id}">
          <div><strong>${escapeHtml(a.name || a.id)}</strong> <small>(${a.refCount || 0} refs)</small></div>
          <div class="studio-asset-entry-actions">
            <button class="studio-btn" data-asset-action="preview" data-asset-id="${a.id}">Preview</button>
            <button class="studio-btn" data-asset-action="delete" data-asset-id="${a.id}">Delete</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;

  const previewHost = host.querySelector('[data-asset-preview]');
  if (previewHost) {
    if (currentAsset) {
      const img = document.createElement('img');
      img.alt = `${target} asset preview`;
      if (typeof currentAsset === 'string' && currentAsset.startsWith('asset://') && window.AssetStore && typeof window.AssetStore.getDataUrl === 'function') {
        const assetId = currentAsset.replace(/^asset:\/\//, '');
        window.AssetStore.getDataUrl(assetId).then((resolvedUrl) => {
          if (resolvedUrl) img.src = resolvedUrl;
        }).catch(() => {
          img.remove();
          const fallback = document.createElement('div');
          fallback.className = 'studio-hint';
          fallback.textContent = 'The selected asset could not be resolved.';
          previewHost.appendChild(fallback);
        });
      } else {
        img.src = currentAsset;
      }
      previewHost.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'studio-hint';
      placeholder.textContent = 'Upload an image to preview it here.';
      previewHost.appendChild(placeholder);
    }
  }

  host.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      handleAssetManagerAction(button.dataset.action);
    });
  });
  const select = host.querySelector('#assetTargetSelect');
  if (select) {
    select.addEventListener('change', (event) => {
      state.assetManager.target = event.currentTarget.value;
      renderAssetManager();
    });
  }

  const pruneBtn = host.querySelector('#pruneAssets');
  if (pruneBtn) {
    pruneBtn.addEventListener('click', async () => {
      if (!window.AssetStore || typeof window.AssetStore.garbageCollect !== 'function') {
        setStatus('Asset store not available for pruning.', true);
        return;
      }
      const deleted = await window.AssetStore.garbageCollect();
      setStatus(`Pruned ${deleted} unreferenced asset(s).`);
      await renderAssetManager();
    });
  }

  host.querySelectorAll('[data-asset-action]').forEach((button) => {
    button.addEventListener('click', async (ev) => {
      const id = ev.currentTarget.dataset.assetId;
      const action = ev.currentTarget.dataset.assetAction;
      if (action === 'preview') {
        const dataUrl = await window.AssetStore.getDataUrl(id);
        if (dataUrl) {
          const img = host.querySelector('.studio-asset-preview img');
          if (img) img.src = dataUrl;
        }
      }
      if (action === 'delete') {
        const entry = await window.AssetStore.getEntry(id);
        if (entry && entry.refCount > 0) {
          setStatus('Asset is still referenced and cannot be deleted.', true);
          return;
        }
        await window.AssetStore.delete(id);
        setStatus('Deleted asset.');
        await renderAssetManager();
      }
    });
  });

  // if asset is an indexeddb reference, resolve it and update preview image src
  if (typeof currentAsset === 'string' && currentAsset.startsWith('asset://') && window.AssetStore && typeof window.AssetStore.getDataUrl === 'function') {
    const id = currentAsset.replace(/^asset:\/\//, '');
    try {
      const dataUrl = await window.AssetStore.getDataUrl(id);
      const img = host.querySelector('.studio-asset-preview img');
      if (img && dataUrl) img.src = dataUrl;
    } catch (error) {
      console.warn('Could not resolve asset preview', error);
    }
  }
}
function handleListAction(listKey, action, index) {
  const items = state.portfolio[listKey] || [];
  if (action === 'add') {
    rememberCurrentState();
    const defaultItem = createListItem(listKey);
    items.push(defaultItem);
    state.editingMap[listKey] = defaultItem;
    render();
    return;
  }
  if (action === 'edit') {
    rememberCurrentState();
    state.editingMap[listKey] = items[index];
    render();
    return;
  }
  if (action === 'delete') {
    rememberCurrentState();
    const toRemove = items[index];
    // decrement asset refs found in the item to be removed (fire-and-forget)
    try {
      const refs = findAssetIdsInValue(toRemove);
      refs.forEach((id) => { if (window.AssetStore && typeof window.AssetStore.decrementRef === 'function') window.AssetStore.decrementRef(id).catch(()=>{}); });
    } catch (e) {}
    items.splice(index, 1);
    delete state.editingMap[listKey];
    render();
    return;
  }
  if (action === 'move-up' && index > 0) {
    rememberCurrentState();
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    render();
  }
  if (action === 'move-down' && index < items.length - 1) {
    rememberCurrentState();
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    render();
  }
}

function reorderList(key, fromIndex, toIndex) {
  const items = state.portfolio[key] || [];
  if (!items[fromIndex] || !items[toIndex]) {
    return;
  }
  rememberCurrentState();
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
}

function createListItem(key) {
  switch (key) {
    case 'experience':
      return { title: 'New experience', company: 'Company', start: 'Start', end: 'Present', blurb: 'Describe your role and impact.', bullets: [] };
    case 'projects':
      return { title: 'New project', subtitle: 'A new launch', summary: 'Describe the challenge and outcome.', link: 'https://example.com' };
    case 'testimonials':
      return { name: 'New reviewer', role: 'Role', org: 'Company', quote: 'A short testimonial.' };
    case 'awards':
      return { title: 'New award', issuer: 'Issuer', year: new Date().getFullYear(), note: 'Describe the recognition.' };
    case 'skills':
      return { name: 'New skill', category: 'Layer' };
    default:
      return {};
  }
}

function rememberCurrentState() {
  if (!state.portfolio) {
    return;
  }
  const snapshot = clonePortfolio(state.portfolio);
  // Avoid storing large inline data URLs (base64) in undo history; replace with placeholders
  try {
    if (snapshot.identity && typeof snapshot.identity.photo === 'string' && snapshot.identity.photo.startsWith('data:')) {
      snapshot.identity.photo = '[data-url]';
    }
    if (snapshot.hero && typeof snapshot.hero.image === 'string' && snapshot.hero.image.startsWith('data:')) {
      snapshot.hero.image = '[data-url]';
    }
    if (Array.isArray(snapshot.assets)) {
      snapshot.assets = snapshot.assets.map((a) => {
        const copy = Object.assign({}, a);
        if (typeof copy.src === 'string' && copy.src.startsWith('data:')) {
          copy.src = '[data-url]';
        }
        return copy;
      });
    }
  } catch (e) {
    // If sanitization fails, fall back to the full snapshot to avoid losing state
  }

  // Store the sanitized snapshot as the pending 'before' state. The actual diff
  // will be computed after the mutation completes and commitChange() is invoked.
  state._pendingSnapshot = snapshot;
}

function computeDiff(oldObj, newObj, base = '') {
  const patch = {};
  function isObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }
  function deepEqual(a, b) {
    if (a === b) return true;
    if (isObject(a) && isObject(b)) {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((k) => deepEqual(a[k], b[k]));
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    return false;
  }

  function walk(o, n, prefix) {
    if (deepEqual(o, n)) return;
    if ((isObject(o) && isObject(n))) {
      const keys = new Set([...Object.keys(o || {}), ...Object.keys(n || {})]);
      keys.forEach((k) => walk(o?.[k], n?.[k], prefix ? `${prefix}.${k}` : k));
      return;
    }
    if (Array.isArray(o) && Array.isArray(n)) {
      // Replace whole array if any difference to keep it simple
      if (!deepEqual(o, n)) patch[prefix] = n;
      return;
    }
    // primitive or differing types -> set whole value
    patch[prefix] = n;
  }

  walk(oldObj, newObj, base || '');
  // Remove empty key if base was ''
  const cleaned = {};
  Object.keys(patch).forEach((key) => {
    const k = key.startsWith('.') ? key.slice(1) : key;
    cleaned[k] = patch[key];
  });
  return cleaned;
}

function deleteByPath(target, path) {
  const segments = path.split('.');
  let node = target;
  for (let i = 0; i < segments.length - 1; i++) {
    if (!node) return;
    node = node[segments[i]];
  }
  if (!node) return;
  delete node[segments[segments.length - 1]];
}

function applyPatch(target, patch) {
  Object.entries(patch).forEach(([path, value]) => {
    if (typeof value === 'undefined') {
      deleteByPath(target, path);
    } else {
      setByPath(target, path, value);
    }
  });
}

function commitChange() {
  if (!state._pendingSnapshot) return;
  try {
    const before = state._pendingSnapshot;
    const after = state.portfolio;
    const patch = computeDiff(before, after);
    if (Object.keys(patch).length === 0) {
      state._pendingSnapshot = null;
      return;
    }
    const inverse = computeDiff(after, before);
    state.history.push({ patch, inverse });
    // cap history
    if (state.history.length > 50) state.history.shift();
    // clear redo stack
    state.future = [];
  } catch (e) {
    // fallback: if diff fails, clear pending snapshot to avoid blocking
  } finally {
    state._pendingSnapshot = null;
  }
}

async function refreshAfterMutation({ rerenderEditors = false } = {}) {
  // If a pending snapshot exists, compute and store the diff
  commitChange();
  state.validation = service.validatePortfolio(state.portfolio);
  renderPreview();
  renderValidation();
  renderHealthDashboard();
  await renderAssetManager();
  saveSessionState();
  if (rerenderEditors) {
    renderEditors();
  }
}

function setByPath(target, path, value) {
  const segments = path.split('.');
  let node = target || {};
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (!node[segment] || typeof node[segment] !== 'object') {
      node[segment] = {};
    }
    node = node[segment];
  }
  node[segments[segments.length - 1]] = value;
}

function getByPath(target, path) {
  return path.split('.').reduce((value, segment) => value?.[segment], target);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

function setStatus(message, isError = false) {
  const status = document.getElementById('statusMessage');
  if (!status) {
    return;
  }
  status.textContent = message;
  status.style.color = isError ? 'var(--amber, #e0a63c)' : 'var(--accent-2, #22c07a)';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;
  if (value.length !== 6) {
    return '79,140,255';
  }
  const bigint = parseInt(value, 16);
  return `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`;
}

function clonePortfolio(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractAssetId(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.match(/^asset:\/\/([A-Za-z0-9._:-]+)/);
  return match ? match[1] : null;
}

/**
 * Find asset ids referenced inside an object/value by scanning strings for "asset://<id>" occurrences.
 * Returns an array of ids (may be empty). Non-recursive for primitives, recursive for objects/arrays.
 */
function findAssetIdsInValue(value) {
  const ids = [];
  function walk(v) {
    if (v === null || typeof v === 'undefined') {
      return;
    }
    if (typeof v === 'string') {
      const regex = /asset:\/\/([A-Za-z0-9._:-]+)/g;
      let match = regex.exec(v);
      while (match) {
        ids.push(match[1]);
        match = regex.exec(v);
      }
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (typeof v === 'object') {
      Object.values(v).forEach(walk);
    }
  }
  walk(value);
  return Array.from(new Set(ids));
}

function sanitizePortfolioForStorage(value) {
  if (typeof value === 'string') {
    return value.startsWith('data:') ? '[data-url-removed]' : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePortfolioForStorage(item));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      accumulator[key] = sanitizePortfolioForStorage(nestedValue);
      return accumulator;
    }, {});
  }
  return value;
}

function saveSessionState() {
  if (!state.portfolio) {
    return false;
  }
  const payload = {
    portfolio: sanitizePortfolioForStorage(state.portfolio),
    splitRatio: state.splitRatio,
    activeStep: state.activeStep,
    updatedAt: new Date().toISOString()
  };
  const serialized = JSON.stringify(payload);

  try {
    localStorage.setItem('portfolio-studio-session', serialized);
    return true;
  } catch (error) {
    try {
      localStorage.removeItem('portfolio-studio-session');
      localStorage.setItem('portfolio-studio-session', serialized);
      return true;
    } catch (fallbackError) {
      console.warn('Unable to persist Studio session state.', fallbackError);
      return false;
    }
  }
}

function readSessionState() {
  try {
    const raw = localStorage.getItem('portfolio-studio-session');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function undo() {
  const entry = state.history.pop();
  if (!entry) {
    setStatus('Nothing to undo yet.');
    return;
  }
  // Move the entry to the future stack so it can be redone later
  state.future.push(entry);
  // Reconcile asset references: capture current refs, apply inverse, then compute delta
  try {
    const beforeRefs = findAssetIdsInValue(state.portfolio);
    applyPatch(state.portfolio, entry.inverse);
    const afterRefs = findAssetIdsInValue(state.portfolio);
    const added = afterRefs.filter((id) => !beforeRefs.includes(id));
    const removed = beforeRefs.filter((id) => !afterRefs.includes(id));
    // apply ref changes (fire-and-forget to avoid blocking UI)
    added.forEach((id) => { if (window.AssetStore && typeof window.AssetStore.incrementRef === 'function') window.AssetStore.incrementRef(id).catch(()=>{}); });
    removed.forEach((id) => { if (window.AssetStore && typeof window.AssetStore.decrementRef === 'function') window.AssetStore.decrementRef(id).catch(()=>{}); });

    state.validation = service.validatePortfolio(state.portfolio);
    hydrateForm();
    render();
    setStatus('Undid the last change.');
  } catch (e) {
    setStatus('Undo failed: ' + (e.message || String(e)), true);
  }
}

function redo() {
  const entry = state.future.pop();
  if (!entry) {
    setStatus('Nothing to redo yet.');
    return;
  }
  // Reapply the patch and move it back to history
  try {
    const beforeRefs = findAssetIdsInValue(state.portfolio);
    applyPatch(state.portfolio, entry.patch);
    const afterRefs = findAssetIdsInValue(state.portfolio);
    const added = afterRefs.filter((id) => !beforeRefs.includes(id));
    const removed = beforeRefs.filter((id) => !afterRefs.includes(id));
    added.forEach((id) => { if (window.AssetStore && typeof window.AssetStore.incrementRef === 'function') window.AssetStore.incrementRef(id).catch(()=>{}); });
    removed.forEach((id) => { if (window.AssetStore && typeof window.AssetStore.decrementRef === 'function') window.AssetStore.decrementRef(id).catch(()=>{}); });

    state.history.push(entry);
    state.validation = service.validatePortfolio(state.portfolio);
    hydrateForm();
    render();
    setStatus('Redid the last change.');
  } catch (e) {
    setStatus('Redo failed: ' + (e.message || String(e)), true);
  }
}

function restoreSession() {
  const payload = readSessionState();
  if (!payload?.portfolio) {
    setStatus('No saved session found.', true);
    return;
  }
  state.portfolio = service.normalizePortfolio(payload.portfolio);
  ensureLayoutModel();
  state.activeStep = payload.activeStep || 0;
  state.splitRatio = payload.splitRatio || 0.58;
  state.validation = service.validatePortfolio(state.portfolio);
  hydrateForm();
  render();
  setStatus('Restored the last saved session.');
}

function resetToOriginal() {
  if (!state.originalPortfolio) {
    return;
  }
  state.portfolio = service.normalizePortfolio(clonePortfolio(state.originalPortfolio));
  ensureLayoutModel();
  state.validation = service.validatePortfolio(state.portfolio);
  hydrateForm();
  render();
  setStatus('Reset to the original portfolio.');
}

function applySplitRatio() {
  const layout = document.getElementById('studioLayout');
  if (!layout) {
    return;
  }
  layout.style.setProperty('--studio-split', state.splitRatio || 0.58);
}

function attachDivider() {
  const divider = document.getElementById('studioDivider');
  if (!divider) {
    return;
  }
  divider.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const layout = document.getElementById('studioLayout');
    const onPointerMove = (moveEvent) => {
      const rect = layout.getBoundingClientRect();
      const ratio = clamp((moveEvent.clientX - rect.left) / rect.width, 0.3, 0.75);
      state.splitRatio = ratio;
      applySplitRatio();
      saveSessionState();
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function handleAssetManagerAction(action) {
  const inputId = action === 'replace' ? 'assetReplaceInput' : 'assetUploadInput';
  const input = document.getElementById(inputId);
  if (!input) {
    return;
  }
  if (action === 'crop' || action === 'compress') {
    const target = state.assetManager?.target || 'profile';
    const currentAsset = target === 'profile' ? state.portfolio.identity?.photo : state.portfolio.hero?.image;
    if (!currentAsset) {
      setStatus('Upload an image before cropping or compressing.', true);
      return;
    }
    if (action === 'crop') {
      rememberCurrentState();
      const width = Number(document.getElementById('assetWidthInput').value) || 1200;
      const height = Number(document.getElementById('assetHeightInput').value) || 630;
      const cropped = await cropImageDataUrl(currentAsset, width, height);
      await setPortfolioAsset(target, cropped, { name: `${target}-cropped.png`, width, height });
      setStatus(`Cropped ${target} asset to ${width}x${height}.`);
      await refreshAfterMutation();
      return;
    }
    rememberCurrentState();
    const quality = Number(document.getElementById('assetQualityInput').value) || 0.82;
    const compressed = await compressImageDataUrl(currentAsset, quality);
    await setPortfolioAsset(target, compressed, { name: `${target}-compressed.jpg`, width: null, height: null });
    setStatus(`Compressed ${target} asset.`);
    await refreshAfterMutation();
    return;
  }

  input.click();
}

async function handleAssetFileSelection(event, target) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }
  const minWidth = target === 'profile' ? 300 : 1200;
  const minHeight = target === 'profile' ? 300 : 600;
  const validation = await service.validateImageFile(file, { minWidth, minHeight });
  if (!validation.valid) {
    setStatus(validation.errors.join(' '), true);
    return;
  }
  rememberCurrentState();
  const dataUrl = await readFileAsDataUrl(file);
  await setPortfolioAsset(target, dataUrl, { name: file.name, width: validation.width, height: validation.height });
  setStatus(`${target === 'profile' ? 'Profile' : 'Hero'} asset ready (${validation.width}x${validation.height}).`);
  await refreshAfterMutation();
}

async function setPortfolioAsset(target, dataUrl, metadata = {}) {
  const previousPortfolio = clonePortfolio(state.portfolio);
  const prevSrc = target === 'profile' ? state.portfolio.identity?.photo : state.portfolio.hero?.image;
  const previousAssetId = extractAssetId(prevSrc);
  let id = null;

  try {
    id = await assetStore.saveDataUrl(dataUrl, { name: metadata.name, width: metadata.width, height: metadata.height });
    const src = `asset://${id}`;

    // ensure assets array exists and remove any placeholder ids for profile/hero
    state.portfolio.assets = state.portfolio.assets || [];
    state.portfolio.assets = state.portfolio.assets.filter((asset) => asset.id !== 'profile-photo' && asset.id !== 'hero-image');

    const entry = { id, src, name: metadata.name || (target === 'profile' ? 'profile-image' : 'hero-image'), width: metadata.width, height: metadata.height, type: 'image' };

    // avoid duplicate entries for the same asset id
    state.portfolio.assets = state.portfolio.assets.filter((asset) => asset.id !== id);
    state.portfolio.assets.push(entry);

    if (target === 'profile') {
      state.portfolio.identity = state.portfolio.identity || {};
      state.portfolio.identity.photo = src;
    } else {
      state.portfolio.hero = state.portfolio.hero || {};
      state.portfolio.hero.image = src;
    }

    try {
      if (window.AssetStore && typeof window.AssetStore.incrementRef === 'function') {
        await window.AssetStore.incrementRef(id);
      }
    } catch (refError) {
      console.warn('Could not increment asset ref count after save.', refError);
    }

    if (previousAssetId && previousAssetId !== id) {
      try {
        if (window.AssetStore && typeof window.AssetStore.decrementRef === 'function') {
          await window.AssetStore.decrementRef(previousAssetId);
        }
      } catch (refError) {
        console.warn('Could not decrement previous asset ref count.', refError);
      }
    }

    return id;
  } catch (e) {
    if (id && window.AssetStore && typeof window.AssetStore.delete === 'function') {
      try {
        await window.AssetStore.delete(id);
      } catch (deleteError) {
        console.warn('Could not rollback newly saved asset.', deleteError);
      }
    }

    state.portfolio = previousPortfolio;
    console.error('Failed to persist asset', e);

    // fallback - keep dataUrl inline if AssetStore failed
    if (target === 'profile') {
      state.portfolio.identity = state.portfolio.identity || {};
      state.portfolio.identity.photo = dataUrl;
      state.portfolio.assets = state.portfolio.assets || [];
      state.portfolio.assets.push({ id: 'profile-photo', src: dataUrl, name: metadata.name || 'profile-image', width: metadata.width, height: metadata.height, type: 'image' });
    } else {
      state.portfolio.hero = state.portfolio.hero || {};
      state.portfolio.hero.image = dataUrl;
      state.portfolio.assets = state.portfolio.assets || [];
      state.portfolio.assets.push({ id: 'hero-image', src: dataUrl, name: metadata.name || 'hero-image', width: metadata.width, height: metadata.height, type: 'image' });
    }
    return null;
  }
}

async function loadImageFromDataUrl(dataUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not decode image.'));
      if (typeof dataUrl === 'string' && dataUrl.startsWith('asset://')) {
        const id = dataUrl.replace(/^asset:\/\//, '');
        if (window.AssetStore && typeof window.AssetStore.getDataUrl === 'function') {
          const resolved = await window.AssetStore.getDataUrl(id);
          if (!resolved) return reject(new Error('Could not load asset from store'));
          image.src = resolved;
          return;
        }
        return reject(new Error('AssetStore unavailable'));
      }
      image.src = dataUrl;
    } catch (e) {
      reject(e);
    }
  });
}

async function cropImageDataUrl(dataUrl, width, height) {
  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const sourceWidth = Math.min(image.width, width);
  const sourceHeight = Math.min(image.height, height);
  const sourceX = Math.max(0, Math.floor((image.width - sourceWidth) / 2));
  const sourceY = Math.max(0, Math.floor((image.height - sourceHeight) / 2));
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

async function compressImageDataUrl(dataUrl, quality = 0.82) {
  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return canvas.toDataURL('image/jpeg', quality);
}

window.addEventListener('DOMContentLoaded', init);
