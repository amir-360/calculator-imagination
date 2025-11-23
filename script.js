// Handles suggestion modal, draft + publish flow, and localStorage
(function(){
  const S_KEY = 'site_suggestions_v1';

  const $ = id => document.getElementById(id);

  const suggestBtn = $('suggest-btn');
  const viewBtn = $('view-suggestions');
  const modal = $('suggestion-modal');
  const listModal = $('list-modal');
  const closeBtn = $('modal-close');
  const listClose = $('list-close');
  const textEl = $('suggestion-text');
  const saveDraft = $('save-draft');
  const publishBtn = $('publish-btn');
  const draftPreview = $('draft-preview');
  const suggestionsList = $('suggestions-list');

  function openModal(m){ m.style.display='flex'; m.setAttribute('aria-hidden','false'); }
  function closeModal(m){ m.style.display='none'; m.setAttribute('aria-hidden','true'); }

  function loadSuggestions(){
    try{
      const raw = localStorage.getItem(S_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveSuggestions(arr){ localStorage.setItem(S_KEY, JSON.stringify(arr)); }

  function renderSuggestions(){
    const items = loadSuggestions();
    suggestionsList.innerHTML = '';
    if(items.length===0){ suggestionsList.innerHTML = '<p class="muted">لا توجد اقتراحات بعد.</p>'; return; }
    items.slice().reverse().forEach((it, idx)=>{
      const row = document.createElement('div'); row.className='suggestion-item';
      const time = new Date(it.createdAt).toLocaleString();
      row.innerHTML = `<div class="s-text">${escapeHtml(it.text)}</div><div class="s-meta">${time}</div><button class="s-delete" data-i="${items.length-1-idx}">حذف</button>`;
      suggestionsList.appendChild(row);
    });
  }

  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  // open suggestion modal
  suggestBtn.addEventListener('click', ()=>{
    textEl.value = '';
    draftPreview.style.display = 'none';
    publishBtn.style.display = 'none';
    publishBtn.disabled = false;
    openModal(modal);
    textEl.focus();
  });

  // close handlers
  closeBtn.addEventListener('click', ()=> closeModal(modal));
  listClose.addEventListener('click', ()=> closeModal(listModal));

  // save draft (shows preview and publish button)
  saveDraft.addEventListener('click', ()=>{
    const v = textEl.value.trim();
    if(!v){ alert('اكتب اقتراحك أولاً'); textEl.focus(); return; }
    draftPreview.innerHTML = `<h3>معاينة</h3><p>${escapeHtml(v)}</p>`;
    draftPreview.style.display = 'block';
    publishBtn.style.display = 'inline-block';
  });

  // publish - save to localStorage
  publishBtn.addEventListener('click', ()=>{
    const v = textEl.value.trim();
    if(!v){ alert('لا يوجد نص للنشر'); return; }
    const items = loadSuggestions();
    items.push({ text: v, createdAt: (new Date()).toISOString() });
    saveSuggestions(items);
    draftPreview.style.display='none';
    publishBtn.style.display='none';
    closeModal(modal);
    // optional feedback
    alert('تم نشر اقتراحك.');
  });

  // view suggestions
  viewBtn.addEventListener('click', ()=>{
    renderSuggestions();
    openModal(listModal);
  });

  // delegate delete in suggestions list
  suggestionsList.addEventListener('click', (e)=>{
    if(e.target.classList.contains('s-delete')){
      const idx = Number(e.target.getAttribute('data-i'));
      const items = loadSuggestions();
      if(isNaN(idx) || idx<0 || idx>=items.length) return;
      if(!confirm('هل تريد حذف هذا الاقتراح؟')) return;
      items.splice(idx,1);
      saveSuggestions(items);
      renderSuggestions();
    }
  });

  // close modals when clicking outside content
  [modal, listModal].forEach(m=>{
    m.addEventListener('click', (e)=>{ if(e.target===m) closeModal(m); });
  });

  // initialize hidden modals
  [modal, listModal].forEach(m=>{ m.style.display='none'; m.style.position='fixed'; m.style.zIndex=1000; m.style.left=0; m.style.top=0; m.style.right=0; m.style.bottom=0; m.style.alignItems='center'; m.style.justifyContent='center'; m.style.background='rgba(0,0,0,0.4)'; });

  // expose for debugging
  window.__siteSuggestions = { load: loadSuggestions, save: saveSuggestions, render: renderSuggestions };
})();
