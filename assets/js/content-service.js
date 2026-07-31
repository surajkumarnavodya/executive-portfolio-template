export class ContentService {
  constructor() {
    this.rewriters = new Map();
  }

  /**
   * Register a future AI rewriter for a given content section.
   * @param {string} sectionKey
   * @param {(value: string, context: object) => Promise<string>|string} rewriter
   */
  registerRewriter(sectionKey, rewriter) {
    this.rewriters.set(sectionKey, rewriter);
  }

  /**
   * Return a normalized content map that can power the Studio preview and future AI workflows.
   * @param {object} portfolio
   * @returns {object}
   */
  getContentMap(portfolio = {}) {
    return {
      identity: {
        name: portfolio.identity?.name || 'Your Name',
        tagline: portfolio.identity?.tagline || 'Portfolio Builder',
        summary: portfolio.identity?.summary || 'A premium portfolio experience crafted with the Studio.'
      },
      hero: {
        eyebrow: portfolio.hero?.eyebrow || 'Building with clarity',
        headline: portfolio.hero?.headline || 'I build product experiences that move the needle.',
        description: portfolio.hero?.description || 'Thoughtful product delivery, leadership, and design systems.'
      },
      contact: {
        email: portfolio.contact?.email || 'hello@example.com',
        phone: portfolio.contact?.phone || '',
        location: portfolio.contact?.location || '',
        website: portfolio.contact?.website || '',
        linkedin: portfolio.contact?.linkedin || '',
        resume: portfolio.contact?.resume || ''
      },
      seo: {
        title: portfolio.meta?.title || 'Portfolio Builder',
        description: portfolio.meta?.description || 'A premium portfolio experience built with Portfolio Studio.'
      },
      footer: {
        cta: 'Let’s build something durable.'
      }
    };
  }

  /**
   * Return preview-ready copy for the Studio preview pane.
   * @param {object} portfolio
   * @returns {object}
   */
  getPreviewContent(portfolio = {}) {
    const contentMap = this.getContentMap(portfolio);
    return {
      title: contentMap.identity.name,
      tagline: contentMap.identity.tagline,
      summary: contentMap.identity.summary,
      heroEyebrow: contentMap.hero.eyebrow,
      heroHeadline: contentMap.hero.headline,
      heroDescription: contentMap.hero.description,
      contactEmail: contentMap.contact.email,
      contactWebsite: contentMap.contact.website,
      footerCta: contentMap.footer.cta,
      seoTitle: contentMap.seo.title,
      seoDescription: contentMap.seo.description
    };
  }

  /**
   * Placeholder for future AI-assisted text rewriting.
   * @param {string} sectionKey
   * @param {string} value
   * @param {object} context
   * @returns {Promise<string>}
   */
  async rewrite(sectionKey, value, context = {}) {
    const rewriter = this.rewriters.get(sectionKey);
    if (typeof rewriter === 'function') {
      return rewriter(value, context);
    }
    return value;
  }
}
