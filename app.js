/* ================= DATA ================= */
const THEMES = [
  {id:1, level:'A0', ar:'التعارف والاسم', nl:'Kennismaking & naam', icon:'👋'},
  {id:2, level:'A0', ar:'التحية والمجاملات', nl:'Begroetingen', icon:'🤝'},
  {id:3, level:'A0', ar:'الأرقام', nl:'Cijfers', icon:'🔢'},
  {id:4, level:'A0', ar:'الألوان', nl:'Kleuren', icon:'🎨'},
  {id:5, level:'A0', ar:'الأيام والأشهر', nl:'Dagen en maanden', icon:'📅'},
  {id:6, level:'A1', ar:'العائلة', nl:'Familie', icon:'👨‍👩‍👧'},
  {id:7, level:'A1', ar:'الطعام والشراب', nl:'Eten en drinken', icon:'🍽️'},
  {id:8, level:'A1', ar:'المنزل والغرف', nl:'Huis en kamers', icon:'🏠'},
  {id:9, level:'A1', ar:'الملابس', nl:'Kleding', icon:'👕'},
  {id:10, level:'A1', ar:'الطقس', nl:'Het weer', icon:'🌦️'},
  {id:11, level:'A1', ar:'الوقت والساعة', nl:'Tijd en klok', icon:'🕐'},
  {id:12, level:'A2', ar:'التسوق', nl:'Winkelen', icon:'🛒'},
  {id:13, level:'A2', ar:'المواصلات', nl:'Vervoer', icon:'🚋'},
  {id:14, level:'A2', ar:'وصف الاتجاهات', nl:'De weg beschrijven', icon:'🧭'},
  {id:15, level:'A2', ar:'الجسم والصحة', nl:'Lichaam en gezondheid', icon:'🩺'},
  {id:16, level:'A2', ar:'عند الطبيب', nl:'Bij de dokter', icon:'👨‍⚕️'},
  {id:17, level:'A2', ar:'العمل والمهنة', nl:'Werk en beroep', icon:'💼'},
  {id:18, level:'A2', ar:'المدرسة والتعليم', nl:'School en onderwijs', icon:'🏫'},
  {id:19, level:'B1', ar:'الهوايات', nl:"Hobby's", icon:'🎯'},
  {id:20, level:'B1', ar:'المشاعر والآراء', nl:'Gevoelens en meningen', icon:'💬'},
  {id:21, level:'B1', ar:'المواعيد والدعوات', nl:'Afspraken maken', icon:'🗓️'},
  {id:22, level:'B1', ar:'البلدية والجهات الرسمية', nl:'Bij de gemeente', icon:'🏛️'},
  {id:23, level:'B1', ar:'البنك والمال', nl:'Bank en geld', icon:'💶'},
  {id:24, level:'B1', ar:'الأخبار والإعلام', nl:'Media en nieuws', icon:'📰'},
  {id:25, level:'B1', ar:'المقابلة والاندماج', nl:'Sollicitatie & inburgering', icon:'🎓'},
];
const LEVELS = ['A0','A1','A2','B1'];
const LEVEL_LABEL = {A0:'مبتدئ تماماً', A1:'مبتدئ', A2:'متوسط أساسي', B1:'متوسط'};

const PLACEMENT_Q = [
  {nl:'Hallo, hoe ___ je?', ar:'كيف تكمل التحية؟', opts:['heet','heten','heb'], correct:0, w:'A0'},
  {nl:'Ik ___ Bilal.', ar:'أنا اسمي بلال', opts:['ben','is','zijn'], correct:0, w:'A0'},
  {nl:'Wat is dit? Dit is een ___ appel.', ar:'اختر أداة التنكير الصحيحة', opts:['de','het','een'], correct:2, w:'A1'},
  {nl:'Ik woon ___ Eindhoven.', ar:'أي حرف جر يُستخدم مع المدينة؟', opts:['in','op','aan'], correct:0, w:'A1'},
  {nl:'Gisteren ___ ik naar de markt gegaan.', ar:'الماضي مع "gaan"', opts:['heb','ben','was'], correct:1, w:'A2'},
  {nl:'Ik ga naar de dokter ___ ik ziek ben.', ar:'أداة الربط السببية', opts:['omdat','maar','dus'], correct:0, w:'A2'},
  {nl:'Als het regent, ___ ik thuis.', ar:'جملة شرطية بسيطة', opts:['blijf','blijven','bleef'], correct:0, w:'A2'},
  {nl:'Ik denk dat het examen niet zo moeilijk ___ zal zijn.', ar:'ترتيب الجملة الفرعية (inversie)', opts:['zal','zullen','—'], correct:2, w:'B1'},
  {nl:'Hoewel het druk was, ___ we op tijd klaar.', ar:'أداة تنازل + قلب الفعل', opts:['waren','was','zijn'], correct:0, w:'B1'},
  {nl:'De brief moet ___ vrijdag verstuurd worden.', ar:'حرف جر زمني رسمي', opts:['voor','naar','bij'], correct:0, w:'B1'},
];

/* ================= STATE ================= */
function defaultState(){
  return {
    screen:'loading',
    startLevel:'A0',
    completedThemes:[],
    placementDone:false,
    currentThemeId:null,
    qIndex:0,
    qSelected:null,
    qScore:0,
    chatMessages:[],
    chatBusy:false,
    testData:null,
    testAnswers:{},
    testResult:null,
  };
}
let state = defaultState();

/* ================= LOCAL STORAGE ================= */
function storageGet(key){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch(e){ return null; }
}
function storageSet(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }
  catch(e){ console.error('storage set failed', e); }
}
function storageDelete(key){
  try{ localStorage.removeItem(key); }catch(e){}
}
function storageKeysWithPrefix(prefix){
  try{ return Object.keys(localStorage).filter(k=>k.startsWith(prefix)); }
  catch(e){ return []; }
}

function loadProgress(){
  const p = storageGet('progress');
  if(p){
    state.startLevel = p.startLevel || 'A0';
    state.completedThemes = p.completedThemes || [];
    state.placementDone = !!p.placementDone;
  }
  state.screen = state.placementDone ? 'map' : 'welcome';
  render();
}
function saveProgress(){
  storageSet('progress', {
    startLevel: state.startLevel,
    completedThemes: state.completedThemes,
    placementDone: state.placementDone,
  });
}
function loadChat(themeId){
  return storageGet('chat_'+themeId) || [];
}
function saveChat(themeId, messages){
  storageSet('chat_'+themeId, messages.slice(-24));
}
function resetProgress(){
  if(!confirm('هل تريد إعادة ضبط كل التقدّم؟ لا يمكن التراجع عن هذا.')) return;
  storageKeysWithPrefix('chat_').forEach(k=>storageDelete(k));
  storageDelete('progress');
  state = defaultState();
  state.screen = 'welcome';
  render();
}

/* ================= CLAUDE API (via server proxy) ================= */
async function callClaude(system, messages){
  const response = await fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ system, messages })
  });
  const data = await response.json();
  if(!response.ok){ throw new Error((data && data.error) || 'request failed'); }
  return data.text || '';
}

function themeSystemPrompt(theme){
  return `أنت "Mr.B"، معلّم لغة هولندية ودود يساعد متحدثي العربية (الشامية تحديداً) على التدرّج من A0 إلى B1 استعداداً لامتحانات الاندماج (inburgering) في هولندا.
موضوع الدرس الحالي: "${theme.nl}" (${theme.ar}) — مستوى الطالب الحالي: ${theme.level}.
قواعد صارمة:
- أنت من يبدأ المحادثة دائماً عندما تكون فارغة: رحّب بالطالب بجملة هولندية قصيرة تخص موضوع الدرس تحديداً، ثم اطرح سؤالاً بسيطاً واحداً.
- تحدّث بالهولندية بشكل أساسي، بجمل قصيرة تناسب مستوى ${theme.level} فقط.
- بعد كل جملة أو جملتين هولنديتين، أضف تصحيحاً أو توضيحاً قصيراً جداً بالعربية بين قوسين إذا أخطأ الطالب أو طلب توضيحاً، وإلا فلا داعي للترجمة الكاملة في كل رسالة.
- صحّح أخطاء الطالب بلطف: اذكر الصواب بالهولندية ثم فسّر بجملة عربية واحدة قصيرة فقط عند الحاجة.
- التزم حصراً بموضوع الدرس وكل ما يتعلق به من تفاصيل عامة؛ إذا حاول الطالب الانتقال لموضوع آخر تماماً، أعده بلطف لموضوع الدرس.
- لا تستخدم الإنجليزية إطلاقاً.
- اجعل ردودك قصيرة (2-4 أسطر كحد أقصى).`;
}

async function generateThemeTest(theme){
  const system = `أنت مصمم اختبارات لغة هولندية. أنشئ اختباراً قصيراً لموضوع "${theme.nl}" (${theme.ar}) بمستوى ${theme.level} فقط.
أعد الناتج بصيغة JSON فقط بدون أي نص إضافي ولا علامات markdown، بالشكل التالي بالضبط:
[{"question_ar":"نص السؤال بالعربية أو جملة هولندية ناقصة تحتاج تكملة","options":["خيار1","خيار2","خيار3"],"correct":0}]
أنشئ بالضبط 5 أسئلة متنوعة (مفردات وقواعد) مناسبة تماماً لمستوى ${theme.level} وموضوع الدرس، مع كون قيمة correct هي فهرس الخيار الصحيح (0 أو 1 أو 2).`;
  const raw = await callClaude(system, [{role:'user', content:'أنشئ الاختبار الآن.'}]);
  const cleaned = raw.replace(/```json|```/g,'').trim();
  return JSON.parse(cleaned);
}

/* ================= HELPERS ================= */
function el(html){ const d=document.createElement('div'); d.innerHTML=html; return d.firstElementChild; }
function themeById(id){ return THEMES.find(t=>t.id===id); }
function levelIndex(lvl){ return LEVELS.indexOf(lvl); }
function isThemeDone(id){ return state.completedThemes.includes(id); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function visibleThemes(){
  return THEMES.filter(t=>levelIndex(t.level) >= levelIndex(state.startLevel));
}
function isThemeUnlocked(theme){
  if(isThemeDone(theme.id)) return true;
  const vt = visibleThemes();
  const idx = vt.findIndex(t=>t.id===theme.id);
  if(idx<=0) return true;
  return isThemeDone(vt[idx-1].id);
}
function currentDisplayLevel(){
  const vt = visibleThemes();
  const firstIncomplete = vt.find(t=>!isThemeDone(t.id));
  return firstIncomplete ? firstIncomplete.level : vt[vt.length-1].level;
}
function levelProgress(lvl){
  const ts = THEMES.filter(t=>t.level===lvl);
  const done = ts.filter(t=>isThemeDone(t.id)).length;
  return {done, total: ts.length};
}

function gateSVG(){
  return `<svg class="gate-icon" width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L11 8 L20 2" stroke="#2C5F6F" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M2 24 L11 18 L20 24" stroke="#2C5F6F" stroke-width="2" stroke-linecap="round" fill="none"/>
    <line x1="11" y1="8" x2="11" y2="18" stroke="#E7A83D" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

/* ================= RENDER ================= */
function render(){
  const app = document.getElementById('app');
  app.innerHTML = '';
  if(state.screen !== 'loading') app.appendChild(topbar());
  let content;
  if(state.screen==='loading') content = el('<div class="loading-line">جاري التحميل<span class="spinner"></span></div>');
  else if(state.screen==='welcome') content = renderWelcome();
  else if(state.screen==='placement') content = renderPlacement();
  else if(state.screen==='placement-result') content = renderPlacementResult();
  else if(state.screen==='map') content = renderMap();
  else if(state.screen==='chat') content = renderChatScreen();
  else if(state.screen==='test') content = renderTestScreen();
  else if(state.screen==='test-result') content = renderTestResult();
  app.appendChild(content);
  if(state.screen==='chat'){
    const box = document.getElementById('chatBox');
    if(box) box.scrollTop = box.scrollHeight;
    const input = document.getElementById('chatInput');
    if(input && !input.disabled) input.focus();
  }
}

function topbar(){
  const bar = el(`<div class="topbar">
    <div class="brand">
      <div class="brand-mark">${gateSVG()}</div>
      <div>
        <div class="brand-name">تعلم مع Mr.B</div>
        <div class="brand-sub">بمنهج سلالم لتعلّم الهولندية</div>
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:10px;">
      ${state.placementDone ? `<span class="level-badge mono">${currentDisplayLevel()}</span>` : ''}
      ${state.placementDone ? `<button class="reset-link" id="resetBtn">إعادة ضبط التقدّم</button>` : ''}
    </div>
  </div>`);
  const resetBtn = bar.querySelector('#resetBtn');
  if(resetBtn) resetBtn.onclick = resetProgress;
  return bar;
}

function renderWelcome(){
  const wrap = el(`<div class="hero">
    <div class="sluis-hero">${welcomeSluisSVG()}</div>
    <h1>ارتقِ من <span class="nl">A0</span> إلى <span class="nl">B1</span> مثل ارتفاع الماء في سلالم القناة</h1>
    <p>25 موضوعاً تبدأ من "شو اسمك؟" وتنتهي عند لغة كافية لمقابلات العمل والاندماج. كل موضوع = محادثة حقيقية مع Mr.B، ثم اختبار قصير يفتح لك الموضوع التالي — ومستواك يرتفع كلما اجتزت جميع مواضيع مرحلة.</p>
    <div class="hero-actions">
      <button class="btn btn-primary" id="startPlacement">ابدأ اختبار تحديد المستوى</button>
    </div>
    <div class="quick-pick">
      أعرف مستواي مسبقاً وأريد البدء مباشرة:
      <div class="levels">
        ${LEVELS.map(l=>`<button class="chip" data-lvl="${l}">${l} · ${LEVEL_LABEL[l]}</button>`).join('')}
      </div>
    </div>
  </div>`);
  wrap.querySelector('#startPlacement').onclick = ()=>{ state.screen='placement'; state.qIndex=0; state.qScore=0; state.qSelected=null; render(); };
  wrap.querySelectorAll('.chip').forEach(c=>{
    c.onclick = ()=>{
      state.startLevel = c.dataset.lvl;
      state.placementDone = true;
      saveProgress();
      state.screen='map';
      render();
    };
  });
  return wrap;
}

function welcomeSluisSVG(){
  return `<svg viewBox="0 0 520 150" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="520" height="150" rx="18" fill="#EAE3D2"/>
    <path d="M0 110 Q 65 95 130 110 T 260 110 T 390 110 T 520 110 V150 H0 Z" fill="#6FA6B0" opacity="0.55"/>
    <path d="M0 122 Q 65 108 130 122 T 260 122 T 390 122 T 520 122 V150 H0 Z" fill="#2C5F6F"/>
    ${[70,180,290,400].map((x,i)=>`
      <line x1="${x}" y1="30" x2="${x}" y2="128" stroke="#16323F" stroke-width="4"/>
      <circle cx="${x}" cy="30" r="15" fill="${i===0?'#E7A83D':'#F6F1E6'}" stroke="#16323F" stroke-width="3"/>
      <text x="${x}" y="35" text-anchor="middle" font-family="IBM Plex Mono" font-size="12" font-weight="600" fill="#16323F">${LEVELS[i]}</text>
    `).join('')}
  </svg>`;
}

function renderPlacement(){
  const q = PLACEMENT_Q[state.qIndex];
  const pct = Math.round((state.qIndex/PLACEMENT_Q.length)*100);
  const wrap = el(`<div class="card">
    <div class="q-progress">سؤال ${state.qIndex+1} من ${PLACEMENT_Q.length}</div>
    <div class="q-bar"><div class="q-bar-fill" style="width:${pct}%"></div></div>
    <div class="q-text"><span class="nl">${q.nl}</span></div>
    <div class="q-hint">${q.ar}</div>
    <div id="optsWrap"></div>
    <div class="nav-row">
      <span></span>
      <button class="btn btn-primary" id="nextQ" disabled>${state.qIndex===PLACEMENT_Q.length-1?'إنهاء الاختبار':'التالي'}</button>
    </div>
  </div>`);
  const optsWrap = wrap.querySelector('#optsWrap');
  q.opts.forEach((opt,i)=>{
    const b = el(`<button class="opt"><span class="nl">${opt}</span></button>`);
    b.onclick = ()=>{
      state.qSelected = i;
      optsWrap.querySelectorAll('.opt').forEach(o=>o.classList.remove('selected'));
      b.classList.add('selected');
      wrap.querySelector('#nextQ').disabled = false;
    };
    optsWrap.appendChild(b);
  });
  wrap.querySelector('#nextQ').onclick = ()=>{
    if(state.qSelected===q.correct) state.qScore++;
    state.qIndex++;
    state.qSelected=null;
    if(state.qIndex>=PLACEMENT_Q.length){
      state.startLevel = scoreToLevel(state.qScore);
      state.placementDone = true;
      saveProgress();
      state.screen='placement-result';
    }
    render();
  };
  return wrap;
}
function scoreToLevel(score){
  if(score<=2) return 'A0';
  if(score<=4) return 'A1';
  if(score<=7) return 'A2';
  return 'B1';
}

function renderPlacementResult(){
  const wrap = el(`<div class="card" style="text-align:center;">
    <div style="font-size:13px; color:var(--ink-soft); margin-bottom:6px;">نتيجتك: ${state.qScore} من ${PLACEMENT_Q.length}</div>
    <div class="level-badge mono" style="font-size:20px; padding:10px 24px;">${state.startLevel}</div>
    <h1 style="font-size:20px; margin:16px 0 8px;">مستواك الحالي: ${LEVEL_LABEL[state.startLevel]}</h1>
    <p style="color:var(--ink-soft); line-height:1.9;">ستظهر لك مواضيع مستوى ${state.startLevel} وما فوقه فقط، لأن ما دونه معروف لديك مسبقاً. المواضيع تُفتح بالترتيب: يجب إنهاء كل موضوع واجتياز اختباره قبل الانتقال للموضوع التالي.</p>
    <button class="btn btn-primary" id="goMap" style="margin-top:10px;">اذهب إلى خريطة المواضيع</button>
  </div>`);
  wrap.querySelector('#goMap').onclick = ()=>{ state.screen='map'; render(); };
  return wrap;
}

function renderMap(){
  const wrap = el(`<div></div>`);
  const overallVisible = visibleThemes();
  const overallDone = overallVisible.filter(t=>isThemeDone(t.id)).length;
  const head = el(`<div class="card" style="margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
    <div>
      <div style="font-weight:800; font-size:16px;">تقدّمك الإجمالي</div>
      <div style="color:var(--ink-soft); font-size:13px; margin-top:2px;">${overallDone} من ${overallVisible.length} موضوعاً مكتمل</div>
    </div>
    <div class="q-bar" style="width:180px; margin:0;"><div class="q-bar-fill" style="width:${Math.round(overallDone/overallVisible.length*100)}%"></div></div>
  </div>`);
  wrap.appendChild(head);

  LEVELS.filter(l=>levelIndex(l) >= levelIndex(state.startLevel)).forEach(lvl=>{
    const {done,total} = levelProgress(lvl);
    const chamber = el(`<div class="chamber">
      <div class="chamber-head">
        ${gateSVG()}
        <div class="chamber-title">${lvl} <small>${LEVEL_LABEL[lvl]} · ${done}/${total}</small></div>
      </div>
      <div class="chamber-water" style="background:linear-gradient(180deg, rgba(111,166,176,0.28), rgba(44,95,111,0.14));">
        <div class="theme-grid"></div>
      </div>
    </div>`);
    const grid = chamber.querySelector('.theme-grid');
    THEMES.filter(t=>t.level===lvl).forEach(t=>{
      const locked = !isThemeUnlocked(t);
      const done_ = isThemeDone(t.id);
      const tile = el(`<div class="theme-tile ${locked?'locked':''} ${done_?'done':''}">
        <div class="theme-num mono">${String(t.id).padStart(2,'0')}</div>
        <div class="theme-icon">${t.icon}</div>
        <div class="theme-name-ar">${t.ar}</div>
        <div class="theme-name-nl nl">${t.nl}</div>
        <div class="theme-status ${done_?'done':''}">${locked?'🔒 أكمل الموضوع السابق':(done_?'✓ مكتمل — اضغط للمراجعة':'ابدأ ←')}</div>
      </div>`);
      if(!locked){
        tile.onclick = ()=> openTheme(t.id);
      }
      grid.appendChild(tile);
    });
    wrap.appendChild(chamber);
  });
  return wrap;
}

async function openTheme(id){
  state.currentThemeId = id;
  state.chatMessages = loadChat(id);
  state.screen = 'chat';
  render();
  if(state.chatMessages.length===0){
    await kickoffChat(themeById(id));
  }
}

async function kickoffChat(theme){
  state.chatBusy = true;
  render();
  const hiddenStarter = {
    role:'user',
    content:'[تعليمات داخلية: ابدأ أنت المحادثة الآن. رحّب بالطالب بجملة هولندية قصيرة تتعلق تحديداً بموضوع الدرس، ثم اطرح سؤالاً هولندياً بسيطاً واحداً لبدء الحوار. لا تكتب أي مقدمات، فقط الترحيب والسؤال مباشرة.]',
    hidden:true
  };
  state.chatMessages.push(hiddenStarter);
  try{
    const apiMessages = state.chatMessages.map(m=>({role:m.role, content:m.content}));
    const reply = await callClaude(themeSystemPrompt(theme), apiMessages);
    state.chatMessages.push({role:'assistant', content: reply || '...'});
    saveChat(theme.id, state.chatMessages);
  }catch(e){
    state.chatMessages.push({role:'assistant', content:'(تعذر بدء المحادثة، جرّب إرسال رسالة)'});
  }
  state.chatBusy = false;
  render();
}

function renderChatScreen(){
  const theme = themeById(state.currentThemeId);
  const wrap = el(`<div>
    <div class="chat-head">
      <div class="chat-title">${theme.icon} ${theme.ar} <span class="nl">${theme.nl}</span></div>
      <button class="btn btn-ghost btn-small" id="backMap">→ خريطة المواضيع</button>
    </div>
    <div class="chat-box" id="chatBox"></div>
    <div class="chat-input-row">
      <textarea class="chat-input" id="chatInput" rows="1" placeholder="اكتب ردّك بالهولندية... (أو بالعربية إذا احتجت مساعدة)" ${state.chatBusy?'disabled':''} autofocus></textarea>
      <button class="btn btn-primary" id="sendBtn" ${state.chatBusy?'disabled':''}>إرسال</button>
    </div>
    <div class="chat-footer-row">
      <span style="font-size:12px; color:var(--ink-soft);">جرّب المحادثة قليلاً ثم اختبر نفسك</span>
      <button class="btn btn-ghost btn-small" id="takeTest">📝 اختبار الموضوع</button>
    </div>
  </div>`);
  const box = wrap.querySelector('#chatBox');
  state.chatMessages.filter(m=>!m.hidden).forEach(m=>{
    box.appendChild(el(`<div class="msg ${m.role==='user'?'user':'bot'}"><span class="nl">${escapeHtml(m.content)}</span></div>`));
  });
  if(state.chatBusy){
    box.appendChild(el('<div class="typing">Mr.B يكتب<span class="spinner" style="width:11px;height:11px;"></span></div>'));
  }

  wrap.querySelector('#backMap').onclick = ()=>{ state.screen='map'; render(); };
  wrap.querySelector('#takeTest').onclick = ()=> startTest(theme);

  const input = wrap.querySelector('#chatInput');
  const send = wrap.querySelector('#sendBtn');
  const doSend = ()=> sendChat(theme, input.value);
  send.onclick = doSend;
  input.onkeydown = (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); doSend(); } };
  return wrap;
}

async function sendChat(theme, text){
  text = (text||'').trim();
  if(!text || state.chatBusy) return;
  state.chatBusy = true;
  state.chatMessages.push({role:'user', content:text});
  render();
  try{
    const apiMessages = state.chatMessages.map(m=>({role:m.role, content:m.content}));
    const reply = await callClaude(themeSystemPrompt(theme), apiMessages);
    state.chatMessages.push({role:'assistant', content: reply || '...'});
    saveChat(theme.id, state.chatMessages);
  }catch(e){
    state.chatMessages.push({role:'assistant', content:'(حدث خطأ في الاتصال، حاول مرة أخرى)'});
  }
  state.chatBusy = false;
  render();
}

async function startTest(theme){
  state.screen='test';
  state.testData=null;
  state.testAnswers={};
  render();
  try{
    state.testData = await generateThemeTest(theme);
  }catch(e){
    state.testData = 'error';
  }
  render();
}

function renderTestScreen(){
  const theme = themeById(state.currentThemeId);
  if(state.testData===null){
    return el(`<div class="card loading-line">جاري تحضير اختبار "${theme.ar}"<span class="spinner"></span></div>`);
  }
  if(state.testData==='error'){
    const w = el(`<div class="card" style="text-align:center;">
      <p>تعذّر تحضير الاختبار الآن. حاول مرة أخرى.</p>
      <button class="btn btn-primary" id="retry">إعادة المحاولة</button>
    </div>`);
    w.querySelector('#retry').onclick = ()=> startTest(theme);
    return w;
  }
  const wrap = el(`<div class="card test-card">
    <div style="font-weight:800; font-size:16px; margin-bottom:16px;">📝 اختبار: ${theme.ar}</div>
    <div id="qList"></div>
    <div class="nav-row"><span></span><button class="btn btn-primary" id="submitTest" disabled>تسليم الاختبار</button></div>
  </div>`);
  const qList = wrap.querySelector('#qList');
  state.testData.forEach((q,qi)=>{
    const qEl = el(`<div style="margin-bottom:22px;">
      <div class="q-text" style="font-size:15.5px;">${qi+1}. <span class="nl">${escapeHtml(q.question_ar)}</span></div>
      <div class="optsRow"></div>
    </div>`);
    const optsRow = qEl.querySelector('.optsRow');
    q.options.forEach((opt,oi)=>{
      const b = el(`<button class="opt"><span class="nl">${escapeHtml(opt)}</span></button>`);
      b.onclick = ()=>{
        state.testAnswers[qi]=oi;
        optsRow.querySelectorAll('.opt').forEach(o=>o.classList.remove('selected'));
        b.classList.add('selected');
        wrap.querySelector('#submitTest').disabled = Object.keys(state.testAnswers).length < state.testData.length;
      };
      optsRow.appendChild(b);
    });
    qList.appendChild(qEl);
  });
  wrap.querySelector('#submitTest').onclick = ()=> gradeTest(theme);
  return wrap;
}

function gradeTest(theme){
  let correct=0;
  const review = state.testData.map((q,qi)=>{
    const sel = state.testAnswers[qi];
    const isCorrect = sel===q.correct;
    if(isCorrect) correct++;
    return {
      question: q.question_ar,
      yourAnswer: sel!==undefined ? q.options[sel] : '—',
      correctAnswer: q.options[q.correct],
      isCorrect
    };
  });
  const passed = correct >= Math.ceil(state.testData.length*0.7);
  state.testResult = {correct, total:state.testData.length, passed, review};
  if(passed && !isThemeDone(theme.id)){
    state.completedThemes.push(theme.id);
    saveProgress();
  }
  state.screen='test-result';
  render();
}

function renderTestResult(){
  const theme = themeById(state.currentThemeId);
  const r = state.testResult;
  const wrap = el(`<div class="card">
    <div style="text-align:center;">
      <div class="test-result-badge ${r.passed?'pass':'fail'}">${r.passed?'✓ اجتزت الاختبار':'✗ لم تجتز بعد'} — ${r.correct}/${r.total}</div>
      <p style="color:var(--ink-soft); line-height:1.9;">
        ${r.passed ? `أحسنت! تم فتح الموضوع التالي. استمر بنفس الوتيرة.` : `تحتاج ٧٠٪ على الأقل للنجاح. راجع الأخطاء أدناه، تحدّث أكثر مع Mr.B في هذا الموضوع ثم أعد المحاولة.`}
      </p>
    </div>
    <div id="reviewList" style="margin-top:10px;"></div>
    <div style="display:flex; gap:10px; justify-content:center; margin-top:14px; flex-wrap:wrap;">
      ${!r.passed ? `<button class="btn btn-ghost" id="retryTest">إعادة المحاولة</button>` : ''}
      <button class="btn btn-ghost" id="backChat">عودة للمحادثة</button>
      <button class="btn btn-primary" id="toMap">خريطة المواضيع</button>
    </div>
  </div>`);
  const list = wrap.querySelector('#reviewList');
  r.review.forEach((item,i)=>{
    const row = el(`<div class="review-item ${item.isCorrect?'right':'wrong'}">
      <div class="review-q">${i+1}. <span class="nl">${escapeHtml(item.question)}</span></div>
      <div class="review-line your-answer ${item.isCorrect?'right-text':'wrong-text'}">إجابتك: <span class="nl">${escapeHtml(item.yourAnswer)}</span></div>
      ${!item.isCorrect ? `<div class="review-line correct-answer">الإجابة الصحيحة: <span class="nl">${escapeHtml(item.correctAnswer)}</span></div>` : ''}
    </div>`);
    list.appendChild(row);
  });
  const retry = wrap.querySelector('#retryTest');
  if(retry) retry.onclick = ()=> startTest(theme);
  wrap.querySelector('#backChat').onclick = ()=>{ state.screen='chat'; render(); };
  wrap.querySelector('#toMap').onclick = ()=>{ state.screen='map'; render(); };
  return wrap;
}

loadProgress();
