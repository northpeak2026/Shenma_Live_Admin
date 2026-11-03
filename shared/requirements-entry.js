// Every prototype page mounts the same requirements entry in the global header.
(() => {
  const header = document.querySelector('header');
  const account = header?.querySelector('.account');
  const headerStyle = document.createElement('style');
  headerStyle.textContent = `
    header .hamburger{display:inline;color:#8490a4}
    header .account{margin-left:0;display:flex;gap:12px;align-items:center;color:#8993a4;font-size:12px;white-space:nowrap}
    header .account .avatar{margin:0;border-radius:50%;background:#edf3ff;color:#3d6cf4;padding:9px}
    header .account-chevron{color:inherit}
  `;
  document.head.append(headerStyle);

  if (!header || !account) return;
  const link = document.createElement('a');
  link.className = 'doc-link';
  link.textContent = '查看对应需求 ↗';
  const scriptURL = document.currentScript.src;
  const documentURL = new URL('../#docs', scriptURL);
  link.href = documentURL.href;
  link.style.cssText = 'margin-left:auto;color:#7a89a4;font-size:12px;white-space:nowrap;flex-shrink:0';
  account.style.marginLeft = '0';
  account.before(link);
  window.requirementsEntry = link;
  // Pages with a full requirements renderer attach their own route handling.
  if (document.body.dataset.requirementsRenderer === 'full') return;
  // All modules use the same document renderer and requirements.js at the site root.
  // Preserve old document-mode bookmarks without mounting page-specific documents.
  function redirectLegacyDocument() {
    const legacy = new URLSearchParams(location.hash.slice(1));
    if (location.hash === '#docs' || legacy.get('mode') === 'docs') {
      location.replace(documentURL.href);
    }
  }
  window.addEventListener('hashchange', redirectLegacyDocument);
  redirectLegacyDocument();
})();
