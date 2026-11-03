// Global public routes. Add new business pages here instead of exposing directory names.
(() => {
  const root = new URL('../', document.currentScript.src);
  const pages = { auth: 'auth-app-prototype/' };
  const current = Object.entries(pages).find(([,path]) => location.pathname === new URL(path,root).pathname);
  const hash = location.hash.slice(1);
  const legacyDocs = new URLSearchParams(hash).get('mode') === 'docs';
  if (current) {
    const [key,path] = current;
    if (hash === 'docs' || legacyDocs) {
      location.replace(new URL('index.html#docs', root));
      return;
    }
    // Keep relative assets stable after replacing the visible URL with the root route.
    const base = document.createElement('base');
    base.href = new URL(path, root).href;
    document.head.prepend(base);
    history.replaceState(null, '', new URL('#'+key,root));
    window.addEventListener('hashchange', () => {
      if (location.hash !== '#'+key) location.replace(new URL('index.html'+location.hash,root));
    });
  } else {
    const navigate = () => {
      const target = pages[location.hash.slice(1)];
      if (target) location.replace(new URL(target,root));
    };
    if (location.pathname === new URL('index.html',root).pathname) {
      history.replaceState(null,'',new URL(location.search+location.hash,root));
    }
    window.addEventListener('hashchange', navigate);
    navigate();
  }
})();
