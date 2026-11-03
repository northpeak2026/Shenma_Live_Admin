(() => {
  const roots = window.requirements;
  const entries = roots.flatMap(m => m.children.flatMap(f => f.children));
  let mode = 'prototype', selected = entries[0].id;
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const remember = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
  mode = read('sm-view-mode') === 'docs' ? 'docs' : 'prototype';
  if (entries.some(r => r.id === read('sm-doc-entry'))) selected = read('sm-doc-entry');
  const docs = document.createElement('section');
  docs.id = 'requirements-view';
  docs.setAttribute('aria-label','需求文档');
  document.querySelector('main .footer').before(docs);
  const switcher = document.createElement('button');
  switcher.className = 'mode-switch';
  switcher.type = 'button';
  document.body.append(switcher);
  const link = window.requirementsEntry;
  const shortRoute = (view, entry = selected, target = tab) =>
    view === 'docs' ? '#' + encodeURIComponent(entry) : target === 'apk' ? '#apk' : '#app';
  const encodeRoute = () => {
    history.replaceState(null, '', shortRoute(mode));
  };
  function route() {
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(hash);
    let target;
    if (hash.includes('=')) {
      // Compatibility with previously shared parameter-based links.
      if (['docs','prototype'].includes(params.get('mode'))) mode = params.get('mode');
      const entry = entries.find(r => r.id === params.get('req'));
      if (entry) selected = entry.id;
      target = entry && mode === 'docs' ? entry.tab : params.get('tab');
    } else {
      const entry = entries.find(r => encodeURIComponent(r.id) === hash);
      if (entry) { mode = 'docs'; selected = entry.id; target = entry.tab; }
      else if (hash === 'docs') { mode = 'docs'; target = entries.find(r => r.id === selected).tab; }
      else if (hash === 'apk' || hash === 'app') { mode = 'prototype'; target = hash; }
    }
    if (['app','apk'].includes(target) && target !== tab) originalSetTab(target);
  }
  function renderArticle() {
    const r = entries.find(e => e.id === selected);
    const section = (title,body) => body ? `<section><h2>${title}</h2>${body}</section>` : '';
    const list = (items,ordered=false) => items?.length ? `<${ordered?'ol':'ul'}>${items.map(s=>`<li>${esc(s)}</li>`).join('')}</${ordered?'ol':'ul'}>` : '';
    docs.querySelector('.doc-article').innerHTML = `<p class="doc-intro">系统管理 / App版本管理 / ${r.tab==='apk'?'APK管理':'App版本'}</p><h1 tabindex="-1">${esc(r.title)}</h1><div class="doc-meta">${esc(r.number)} · 整理更新：${esc(r.updated || roots[0].updated)}</div>${section('需求说明',`<p>${esc(r.description || '该页面的需求描述待补充。')}</p>`)}${section('操作流程',list(r.flow,true))}${section('字段说明',r.fields?`<div class="tablewrap"><table><thead><tr><th>字段</th><th>说明</th></tr></thead><tbody>${r.fields.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>`:'')}${section('校验规则',list(r.rules))}<div class="doc-actions">${r.id==='apk-upload'?'<button data-upload-test>验证上传边界状态</button>':''}<button class="primary" data-preview>查看对应原型 · ${r.tab==='apk'?'APK管理':'App版本'}</button></div>`;
    if (docs.querySelector('[data-upload-test]')) docs.querySelector('[data-upload-test]').onclick = () => { openForm(); document.querySelectorAll('[data-document-only]').forEach(el=>el.hidden=false); };
    docs.querySelector('[data-preview]').onclick = () => { if(tab !== r.tab) setTab(r.tab); apply('prototype'); };
    docs.querySelectorAll('[data-entry]').forEach(a => {
      if(a.dataset.entry===selected) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
    });
  }
  docs.innerHTML = `<div class="docs-layout"><nav class="docs-toc" aria-label="需求目录"><h2>需求目录</h2>${roots.map(m=>`<details open><summary>${esc(m.title)}</summary>${m.children.map(f=>`<details open><summary>${esc(f.title)}</summary>${f.children.map(r=>`<a href="${shortRoute('docs',r.id,r.tab)}" data-entry="${r.id}">${esc(r.number)} · ${esc(r.title)}</a>`).join('')}</details>`).join('')}</details>`).join('')}</nav><article class="doc-article" aria-label="需求正文"></article></div>`;
  docs.querySelectorAll('[data-entry]').forEach(a => a.onclick = event => {
    event.preventDefault(); selected = a.dataset.entry;
    const r = entries.find(e=>e.id===selected);
    if(tab!==r.tab) setTab(r.tab);
    apply('docs');
    docs.querySelector('h1').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'auto'});
  });
  function apply(next) {
    if (next !== mode) closeModal();
    mode = next;
    document.body.classList.toggle('mode-docs',mode==='docs');
    document.querySelector('main .card').hidden = mode==='docs';
    docs.hidden = mode!=='docs';
    document.querySelectorAll('[data-document-only]').forEach(el=>el.hidden=mode!=='docs');
    const action = mode==='docs'?'切换至原型模式':'切换至文档模式';
    switcher.innerHTML = `<span aria-hidden="true">${mode==='docs'?'▤':'◫'}</span><span class="current-mode">${mode==='docs'?'文档模式':'原型模式'}</span><span class="intent">${action}</span>`;
    switcher.setAttribute('aria-label',action); switcher.title=action;
    link.textContent = mode==='docs'?'查看对应原型 ↗':'查看对应需求 ↗';
    link.href=mode==='docs' ? shortRoute('prototype') : '#docs';
    if(mode==='docs') renderArticle();
    remember('sm-view-mode',mode); remember('sm-doc-entry',selected); encodeRoute();
  }
  function matchingEntry() {
    if(entries.find(e=>e.id===selected)?.tab!==tab) selected=entries.find(e=>e.tab===tab).id;
  }
  switcher.onclick = () => { matchingEntry(); apply(mode==='docs'?'prototype':'docs'); };
  link.onclick = event => { event.preventDefault(); apply(mode==='docs'?'prototype':'docs'); };
  const originalSetTab = window.setTab;
  window.setTab = function(t) { originalSetTab(t); matchingEntry(); encodeRoute(); };
  window.addEventListener('hashchange',()=>{route();apply(mode);});
  route(); apply(mode);
})();
