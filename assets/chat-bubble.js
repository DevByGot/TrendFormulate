(function () {
  'use strict';

  // Skip on the dedicated sales page — it already has the full chat UI
  if (window.location.pathname.includes('/04_sales/')) return;

  // ─── Path detection ────────────────────────────────────────────
  // Component pages live two levels deep: components/XX_name/index.html
  const inComponents = window.location.pathname.includes('/components/');
  const BASE = inComponents ? '../../' : '';

  // ─── API config ────────────────────────────────────────────────
  const ON_SERVER =
    window.location.protocol !== 'file:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const GROQ_ENDPOINT = ON_SERVER
    ? '/api/groq'
    : 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_MODEL = 'llama-3.3-70b-versatile';

  // ─── Styles ────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ── TrendFormulate chat bubble widget ── */
    .tf-chat-btn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c4788a 0%, #d49678 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 20px rgba(196,120,138,0.45);
      z-index: 9999;
      transition: transform 0.2s, box-shadow 0.2s;
      padding: 0;
    }
    .tf-chat-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(196,120,138,0.55);
    }
    .tf-chat-btn svg { width: 24px; height: 24px; pointer-events: none; }
    .tf-unread-dot {
      position: absolute;
      top: 2px; right: 2px;
      width: 12px; height: 12px;
      background: #e05a5a;
      border-radius: 50%;
      border: 2px solid #fff;
      display: none;
    }
    .tf-has-unread .tf-unread-dot { display: block; }

    .tf-chat-panel {
      position: fixed;
      bottom: 92px;
      left: 24px;
      width: 360px;
      height: 520px;
      background: var(--surface, #fff);
      border: 1px solid var(--border, #e8ddd9);
      border-radius: 16px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.16), 0 2px 12px rgba(196,120,138,0.12);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom left;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0;
      transform: scale(0.88) translateY(12px);
      pointer-events: none;
    }
    .tf-chat-panel.tf-open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: all;
    }
    @media (max-width: 420px) {
      .tf-chat-panel { left: 8px; right: 8px; width: auto; bottom: 88px; }
    }

    /* Header */
    .tf-head {
      padding: 13px 16px;
      background: linear-gradient(135deg, #c4788a 0%, #d49678 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .tf-head-left { display: flex; align-items: center; gap: 10px; }
    .tf-av {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: flex; align-items: center; justify-content: center;
      color: #fff; flex-shrink: 0;
    }
    .tf-av svg { width: 16px; height: 16px; }
    .tf-agent-name { font-size: 0.9375rem; font-weight: 600; color: #fff; line-height: 1.2; }
    .tf-agent-status {
      font-size: 0.69rem; color: rgba(255,255,255,0.82);
      display: flex; align-items: center; gap: 4px; margin-top: 1px;
    }
    .tf-online-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #7fff7f;
      box-shadow: 0 0 5px rgba(127,255,127,0.7);
      animation: tfPulse 2s ease-in-out infinite;
    }
    .tf-x-btn {
      background: rgba(255,255,255,0.2); border: none; color: #fff;
      border-radius: 50%; width: 28px; height: 28px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    .tf-x-btn:hover { background: rgba(255,255,255,0.35); }
    .tf-x-btn svg { width: 14px; height: 14px; }

    /* Messages */
    .tf-msgs {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    .tf-msg-row {
      display: flex; gap: 7px; align-items: flex-end;
      animation: tfSlideIn 0.22s ease forwards;
    }
    .tf-msg-row.tf-user { flex-direction: row-reverse; }
    .tf-msg-av {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--surface-2, #f5f0ee);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #c4788a;
    }
    .tf-msg-av svg { width: 12px; height: 12px; }
    .tf-msg-av.tf-uav { background: rgba(196,120,138,0.15); }
    .tf-bub {
      max-width: 75%; padding: 8px 12px; border-radius: 14px;
      font-size: 0.8375rem; line-height: 1.5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-bub.tf-a {
      background: var(--surface-2, #f5f0ee);
      border: 1px solid var(--border, #e8ddd9);
      border-bottom-left-radius: 4px;
      color: var(--text, #2d2026);
    }
    .tf-bub.tf-u { background: #c4788a; color: #fff; border-bottom-right-radius: 4px; }

    /* Typing */
    .tf-typing-row { display: flex; gap: 7px; align-items: flex-end; }
    .tf-typing-bub {
      background: var(--surface-2, #f5f0ee);
      border: 1px solid var(--border, #e8ddd9);
      border-radius: 14px; border-bottom-left-radius: 4px;
      padding: 10px 14px; display: flex; gap: 4px; align-items: center;
    }
    .tf-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #a08a8a;
      animation: tfBounce 1.2s ease-in-out infinite;
    }
    .tf-dot:nth-child(2) { animation-delay: 0.2s; }
    .tf-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Quick replies */
    .tf-qr { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; }
    .tf-qr-chip {
      font-size: 0.775rem; color: #c4788a;
      border: 1px solid rgba(196,120,138,0.35);
      background: rgba(196,120,138,0.07);
      border-radius: 999px; padding: 4px 10px;
      cursor: pointer; transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-qr-chip:hover { background: rgba(196,120,138,0.18); border-color: rgba(196,120,138,0.6); }

    /* Lead form */
    .tf-lead-bar {
      margin: 0 14px 10px;
      background: linear-gradient(90deg, rgba(196,120,138,0.08) 0%, rgba(196,120,138,0.04) 100%);
      border: 1px solid rgba(196,120,138,0.25);
      border-radius: 10px; padding: 10px 12px;
      animation: tfSlideIn 0.3s ease forwards;
    }
    .tf-lead-bar p {
      font-size: 0.775rem; color: var(--text-muted, #7a6a6a);
      margin: 0 0 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-lead-bar strong { color: var(--text, #2d2026); }
    .tf-lead-row { display: flex; gap: 6px; }
    .tf-lead-row input {
      flex: 1; background: var(--surface-2, #f5f0ee);
      border: 1px solid var(--border, #e8ddd9);
      border-radius: 8px; color: var(--text, #2d2026);
      font-size: 0.775rem; padding: 6px 10px; outline: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-lead-row input:focus { border-color: #c4788a; }
    .tf-lead-sub {
      font-size: 0.775rem; font-weight: 500;
      background: #c4788a; color: #fff; border: none;
      border-radius: 8px; padding: 6px 12px; cursor: pointer;
      white-space: nowrap; transition: background 0.15s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-lead-sub:hover { background: #b06275; }
    .tf-lead-ok {
      margin: 0 14px 10px;
      display: flex; align-items: center; gap: 6px;
      font-size: 0.775rem; color: #4e9e38;
      padding: 6px 10px;
      background: rgba(78,158,56,0.08);
      border: 1px solid rgba(78,158,56,0.2);
      border-radius: 8px;
      animation: tfSlideIn 0.3s ease forwards;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-lead-ok svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* Input bar */
    .tf-input-bar {
      border-top: 1px solid var(--border, #e8ddd9);
      padding: 10px 14px; display: flex; gap: 8px; align-items: center; flex-shrink: 0;
    }
    .tf-input-bar input {
      flex: 1; background: var(--surface-2, #f5f0ee);
      border: 1px solid var(--border, #e8ddd9);
      border-radius: 999px; color: var(--text, #2d2026);
      font-size: 0.8375rem; padding: 7px 14px; outline: none;
      transition: border-color 0.15s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tf-input-bar input:focus { border-color: #c4788a; }
    .tf-input-bar input::placeholder { color: var(--text-muted, #7a6a6a); }
    .tf-send {
      width: 34px; height: 34px; border-radius: 50%;
      background: #c4788a; border: none; color: #fff;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s; padding: 0;
    }
    .tf-send:hover { background: #b06275; }
    .tf-send svg { width: 14px; height: 14px; }

    /* Footer */
    .tf-foot {
      text-align: center; font-size: 0.63rem;
      color: var(--text-faint, #b8a8a8);
      padding: 5px 14px 8px;
      border-top: 1px solid var(--border, #e8ddd9);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    @keyframes tfPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.6; transform: scale(0.85); }
    }
    @keyframes tfBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30%            { transform: translateY(-5px); opacity: 1; }
    }
    @keyframes tfSlideIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // ─── Inline SVG icons ──────────────────────────────────────────
  const IC = {
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
    user:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    send:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    x:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 13 4 16"/><polyline points="2 12 9 19 22 5"/></svg>`,
    chat:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  };

  // ─── Inject DOM ────────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button class="tf-chat-btn tf-has-unread" id="tf-btn" title="Chat with Forma, our AI sales agent" aria-label="Open chat">
      ${IC.chat}
      <span class="tf-unread-dot"></span>
    </button>

    <div class="tf-chat-panel" id="tf-panel" role="dialog" aria-label="Chat with Forma">
      <div class="tf-head">
        <div class="tf-head-left">
          <div class="tf-av">${IC.sparkles}</div>
          <div>
            <div class="tf-agent-name">Forma</div>
            <div class="tf-agent-status">
              <span class="tf-online-dot"></span>
              AI Sales Agent · Online
            </div>
          </div>
        </div>
        <button class="tf-x-btn" id="tf-close" aria-label="Close chat">${IC.x}</button>
      </div>

      <div class="tf-msgs" id="tf-msgs"></div>

      <div id="tf-typing" style="display:none;padding:0 14px 6px;">
        <div class="tf-typing-row">
          <div class="tf-msg-av">${IC.sparkles}</div>
          <div class="tf-typing-bub">
            <div class="tf-dot"></div>
            <div class="tf-dot"></div>
            <div class="tf-dot"></div>
          </div>
        </div>
      </div>

      <div class="tf-qr" id="tf-qr"></div>
      <div id="tf-lead"></div>

      <div class="tf-input-bar">
        <input type="text" id="tf-inp" placeholder="Ask Forma anything…" autocomplete="off" />
        <button class="tf-send" id="tf-send" title="Send">${IC.send}</button>
      </div>

      <div class="tf-foot">Powered by <strong>TrendFormulate</strong> · Forma AI</div>
    </div>
  `;
  document.body.appendChild(wrap);

  // ─── DOM refs ──────────────────────────────────────────────────
  const btn        = document.getElementById('tf-btn');
  const panel      = document.getElementById('tf-panel');
  const closeBtn   = document.getElementById('tf-close');
  const msgs       = document.getElementById('tf-msgs');
  const typingEl   = document.getElementById('tf-typing');
  const qrEl       = document.getElementById('tf-qr');
  const leadEl     = document.getElementById('tf-lead');
  const inp        = document.getElementById('tf-inp');
  const sendBtnEl  = document.getElementById('tf-send');

  // ─── State ────────────────────────────────────────────────────
  let isOpen    = false;
  let isBusy    = false;
  let exchanges = 0;
  let leadScore = 0;
  let capturedEmail   = null;
  let leadFormShown   = false;
  let history         = [];
  let sysPrompt       = null;
  const scoredKws     = new Set();

  // ─── Open / close ─────────────────────────────────────────────
  function openPanel() {
    isOpen = true;
    panel.classList.add('tf-open');
    btn.classList.remove('tf-has-unread');
    setTimeout(() => inp.focus(), 200);
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove('tf-open');
  }
  btn.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);

  // ─── Utilities ────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function scrollDown() {
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  // ─── Rendering ────────────────────────────────────────────────
  function addMsg(html, isUser) {
    const row = document.createElement('div');
    row.className = 'tf-msg-row' + (isUser ? ' tf-user' : '');
    const av   = isUser
      ? `<div class="tf-msg-av tf-uav">${IC.user}</div>`
      : `<div class="tf-msg-av">${IC.sparkles}</div>`;
    const bub  = `<div class="tf-bub ${isUser ? 'tf-u' : 'tf-a'}">${html}</div>`;
    row.innerHTML = isUser ? bub + av : av + bub;
    msgs.appendChild(row);
    scrollDown();
  }

  function showTyping() { typingEl.style.display = 'block'; scrollDown(); }
  function hideTyping() { typingEl.style.display = 'none'; }

  function showQR(items) {
    qrEl.innerHTML = '';
    items.forEach(t => {
      const c = document.createElement('button');
      c.className  = 'tf-qr-chip';
      c.textContent = t;
      c.addEventListener('click', () => send(t));
      qrEl.appendChild(c);
    });
  }
  function clearQR() { qrEl.innerHTML = ''; }

  // ─── Lead form ────────────────────────────────────────────────
  function showLeadForm() {
    if (leadFormShown) return;
    leadFormShown = true;
    leadEl.innerHTML = `
      <div class="tf-lead-bar">
        <p><strong>Want a personalised demo?</strong> Leave your email and we'll send a calendar link.</p>
        <div class="tf-lead-row">
          <input type="email" id="tf-email" placeholder="founder@yourbrand.com" />
          <button class="tf-lead-sub" id="tf-lead-sub">Get Demo →</button>
        </div>
      </div>
    `;
    const sub = document.getElementById('tf-lead-sub');
    const em  = document.getElementById('tf-email');
    sub.addEventListener('click', submitEmail);
    em.addEventListener('keydown', e => { if (e.key === 'Enter') submitEmail(); });
  }

  function submitEmail() {
    const em  = document.getElementById('tf-email');
    const val = em ? em.value.trim() : '';
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      if (em) em.style.borderColor = '#e05a5a';
      return;
    }
    capturedEmail = val;
    leadEl.innerHTML = `
      <div class="tf-lead-ok">
        ${IC.check}
        Demo request — <strong style="color:#4e9e38;">${esc(val)}</strong>
      </div>
    `;
    const confirm = `Perfect — I've sent a calendar link to <strong>${esc(val)}</strong>. A TrendFormulate specialist will walk you through the full pipeline. Is there anything else you'd like to know before the demo?`;
    setTimeout(() => {
      addMsg(confirm, false);
      history.push({ role: 'assistant', content: `Perfect — I've sent a calendar link to ${val}. A TrendFormulate specialist will walk you through the full pipeline. Is there anything else you'd like to know before the demo?` });
    }, 400);
  }

  // ─── Groq API ─────────────────────────────────────────────────
  async function callGroq(messages, retrying = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (!ON_SERVER && typeof GROQ_API_KEY !== 'undefined') {
      headers['Authorization'] = `Bearer ${GROQ_API_KEY}`;
    }
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST', headers,
      body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.6, max_tokens: 280, messages }),
    });
    if (res.status === 429 && !retrying) {
      await new Promise(r => setTimeout(r, 2500));
      return callGroq(messages, true);
    }
    if (!res.ok) throw new Error(`Groq ${res.status}`);
    return (await res.json()).choices[0].message.content.trim();
  }

  // ─── Keyword fallback ──────────────────────────────────────────
  const INTENTS = [
    { kws: ['hi','hello','hey','start','help'],
      res: "Hi! I'm Forma, TrendFormulate's AI sales agent 👋 I'm here to help you get your first product to market faster. What's the biggest bottleneck in your current product development process?" },
    { kws: ['eu','regulation','compliance','legal','fda','annex'],
      res: "Our Formulation Agent automatically cross-references every formula against EU Annex V regulations and FDA rules in real time — no compliance consultant needed. What's your target launch market: EU, US, or both?" },
    { kws: ['price','cost','pricing','how much','fee','subscription'],
      res: "TrendFormulate runs on a usage-based model — you pay per formula, not per seat. Founders on the waitlist now lock in our Founder Rate before we move to standard pricing. What's your estimated monthly formula volume?" },
    { kws: ['factory','manufacture','production','moq','supplier','contract'],
      res: "Our Factory Matching module scores manufacturers against your speed, MOQ, and certifications — from SpeedForm EU (14-day lead time) to GreenLab Korea ($1/unit, Ecocert). Which matters more right now: speed or cost?" },
    { kws: ['timeline','launch','how long','speed','fast','48 hours'],
      res: "From trend detection to a production-ready formula sheet, TrendFormulate compresses 3–6 months of traditional R&D into under 48 hours. What's your target shelf date?" },
    { kws: ['demo','trial','show me','walkthrough','how does it work'],
      res: "Absolutely! Our demo covers the full pipeline in about 15 minutes. Drop your email below and I'll send you a calendar link right away." },
    { kws: ['ingredient','formula','formulation','serum','cream','bakuchiol','retinol','niacinamide'],
      res: "TrendFormulate's formulation engine builds complete ingredient lists optimised for your target trend, skin type, and regulatory zone — from Bakuchiol to Zinc Oxide for SPF. Every formula is automatically safety-checked. Want to see an example output?" },
  ];
  const FALLBACK_MSG = "That's worth exploring! Can you tell me more about your current team size and R&D setup? That'll help me show you the most relevant part of the platform.";

  function getFallback(text) {
    const lower = text.toLowerCase();
    for (const i of INTENTS) if (i.kws.some(k => lower.includes(k))) return i.res;
    return FALLBACK_MSG;
  }

  const LEAD_KWS = ['eu','launch','price','factory','timeline','formula','moq','demo',
                    'compliance','ingredient','niacinamide','bakuchiol','serum','budget','team'];

  // ─── Data loading ──────────────────────────────────────────────
  let ingredients = [];
  let factories   = [];

  async function loadData() {
    try {
      const [iR, fR] = await Promise.all([
        fetch(BASE + 'data/ingredients_db.json'),
        fetch(BASE + 'data/factories.json'),
      ]);
      if (iR.ok) ingredients = await iR.json();
      if (fR.ok) factories   = await fR.json();
    } catch (_) {}
  }

  function buildPrompt() {
    const ingNames = ingredients.length
      ? ingredients.map(i => i.name).join(', ')
      : 'Bakuchiol, Hyaluronic Acid, Niacinamide, Centella Asiatica, Squalane, Zinc Oxide';

    const facCtx = factories.length
      ? factories.map(f => `${f.name} (${f.region}, MOQ ${f.moq}, ${f.delivery_days}-day lead time, $${f.cost_per_unit}/unit)`).join('; ')
      : 'GreenLab Korea (Asia, MOQ 500, 60-day); SpeedForm EU (Europe, MOQ 1000, 14-day); NaturaCo USA (North America, MOQ 300, 21-day)';

    let trendCtx = 'Trending topics currently include glass skin serums, bakuchiol retinol alternatives, and SPF-infused moisturisers.';
    try {
      const raw = localStorage.getItem('tf_c1_results');
      if (raw) {
        const seen = new Set();
        const trends = JSON.parse(raw)
          .filter(r => r.trend && r.trend !== 'Unclassified')
          .filter(r => { if (seen.has(r.trend)) return false; seen.add(r.trend); return true; })
          .slice(0, 6).map(r => r.trend);
        if (trends.length) trendCtx = `Currently trending from live data: ${trends.join(', ')}.`;
      }
    } catch (_) {}

    return `You are Forma, TrendFormulate's AI sales agent. TrendFormulate OS is an AI-powered cosmetic R&D platform that helps indie beauty founders go from trend detection to a production-ready, regulatory-compliant formula and matched manufacturer in under 48 hours.

PLATFORM: Trend Detection → Formulation (ingredients: ${ingNames}) → Compliance Check (EU/US) → Factory Matching (${facCtx}) → Finance Simulator. ${trendCtx}

YOUR ROLE: Warm, consultative B2B sales agent. Goals: understand the prospect's situation, show how TrendFormulate solves their pain, steer toward a demo after 2–3 qualifying signals.

RULES: Be concise (2–4 sentences max). Plain conversational prose — no bullet lists, no markdown headers. End every reply with one focused follow-up question. If asked for a demo, enthusiastically agree and ask for their email.`;
  }

  // ─── Send message ─────────────────────────────────────────────
  async function send(text) {
    text = text.trim();
    if (!text || isBusy) return;

    clearQR();
    addMsg(esc(text), true);
    inp.value   = '';
    isBusy      = true;
    inp.disabled     = true;
    sendBtnEl.disabled = true;

    const lower = text.toLowerCase();
    for (const kw of LEAD_KWS) {
      if (lower.includes(kw) && !scoredKws.has(kw)) {
        scoredKws.add(kw);
        leadScore = Math.min(leadScore + 12, 100);
      }
    }
    exchanges++;

    showTyping();

    const hasApi = ON_SERVER ||
      (typeof GROQ_API_KEY !== 'undefined' &&
       GROQ_API_KEY && GROQ_API_KEY !== 'gsk_YOUR_KEY_HERE');

    let reply;
    if (hasApi) {
      try {
        history.push({ role: 'user', content: text });
        reply = await callGroq([{ role: 'system', content: sysPrompt }, ...history]);
        history.push({ role: 'assistant', content: reply });
      } catch (_) {
        reply = getFallback(text);
        history.pop();
      }
    } else {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 700));
      reply = getFallback(text);
    }

    hideTyping();
    addMsg(esc(reply).replace(/\n{2,}/g, '<br><br>').replace(/\n/g, ' '), false);
    isBusy             = false;
    inp.disabled       = false;
    sendBtnEl.disabled = false;
    inp.focus();

    if (exchanges >= 3 && !leadFormShown) showLeadForm();

    if (exchanges <= 1) {
      showQR(['How does pricing work?', 'Tell me about EU compliance', 'How fast can I launch?']);
    } else if (exchanges === 2) {
      showQR(['Show me the factory options', 'Can I see a demo?']);
    }
  }

  // ─── Events ───────────────────────────────────────────────────
  sendBtnEl.addEventListener('click', () => send(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inp.value); }
  });

  // ─── Boot ─────────────────────────────────────────────────────
  async function boot() {
    await loadData();
    sysPrompt = buildPrompt();
    const WELCOME = "Hi! I'm Forma, TrendFormulate's AI sales agent 👋 I'm here to help you understand how our platform can get your first product to market faster. What's the biggest bottleneck in your current product development process?";
    addMsg(WELCOME, false);
    history.push({ role: 'assistant', content: WELCOME });
    showQR(['Tell me about compliance', 'How does pricing work?', 'How fast can I launch?', 'Show me factory options']);
  }

  boot();
})();
