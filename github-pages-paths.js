/*
 * Keeps internal links and local assets inside the repository path on GitHub
 * Pages. This works for both https://username.github.io/ and project sites
 * such as https://username.github.io/repository-name/.
 */
(() => {
  const script = document.currentScript;
  const siteRoot = new URL('.', script.src);

  const toSitePath = (value) => {
    if (!value || value.startsWith('//') || value.startsWith('#')) return null;

    if (value.startsWith('/')) {
      return new URL(value.slice(1), siteRoot).href;
    }

    if (value.startsWith('./')) {
      return new URL(value.slice(2), siteRoot).href;
    }

    return null;
  };

  const updatePath = (element, attribute) => {
    const value = element.getAttribute(attribute);
    const updatedValue = toSitePath(value);
    if (updatedValue) element.setAttribute(attribute, updatedValue);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href], link[href]').forEach((element) => updatePath(element, 'href'));
    document.querySelectorAll('[src]').forEach((element) => updatePath(element, 'src'));
  });
})();
