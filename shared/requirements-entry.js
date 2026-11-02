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
  link.href = '#mode=docs';
  link.style.cssText = 'margin-left:auto;color:#7a89a4;font-size:12px;white-space:nowrap;flex-shrink:0';
  account.style.marginLeft = '0';
  account.before(link);
  window.requirementsEntry = link;
  // Pages with a full requirements renderer attach their own route handling.
  if (document.body.dataset.requirementsRenderer === 'full') return;
  const main = document.querySelector('main');
  const original = [...main.children].filter(el => !el.classList.contains('breadcrumb') && !el.classList.contains('footer'));
  const docs = document.createElement('section');
  docs.className = 'card';
  docs.setAttribute('aria-label', '需求文档');
  const title = document.title.split(' · ')[0];
  const heading = document.createElement('h1');
  heading.textContent = title;
  const description = document.createElement('p');
  description.textContent = '该页面的需求描述待补充。';
  description.style.cssText = 'color:#737e90;line-height:1.8;margin-top:20px';
  docs.append(heading, description);
  main.querySelector('.footer').before(docs);
  function render() {
    const isDocs = new URLSearchParams(location.hash.slice(1)).get('mode') === 'docs';
    original.forEach(el => { el.hidden = isDocs; });
    docs.hidden = !isDocs;
    link.textContent = isDocs ? '查看对应原型 ↗' : '查看对应需求 ↗';
    link.href = isDocs ? '#mode=prototype' : '#mode=docs';
  }
  window.addEventListener('hashchange', render);
  render();
})();
