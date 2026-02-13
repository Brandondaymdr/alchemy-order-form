import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DEFAULT_ITEMS, VENDOR_COLORS } from './data';
import { store } from './store';

/* ── helpers ─────────────────────────────────────────── */
const weekLabel = (d = new Date()) => {
  const s = new Date(d); s.setDate(d.getDate() - d.getDay());
  const e = new Date(s); e.setDate(s.getDate() + 6);
  const f = t => `${t.getMonth() + 1}/${t.getDate()}`;
  return `${f(s)} – ${f(e)}`;
};
const weekKey = (d = new Date()) => {
  const s = new Date(d); s.setDate(d.getDate() - d.getDay());
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
};
const pn = v => { if (v === '' || v == null) return ''; const n = parseFloat(v); return isNaN(n) ? '' : n; };

/* ── theme definitions ───────────────────────────────── */
const themes = {
  dark: {
    bg: '#0f1114', bgCard: '#1a1b1e', bgHover: '#25262b', bgInput: '#1a1b1e',
    border: '#2c2e33', borderLight: '#25262b', borderInput: '#2c2e33',
    text: '#e9ecef', textMuted: '#868e96', textDim: '#5c5f66', textDimmer: '#373a40',
    accent: '#ffd43b', accentBg: '#ffd43b', accentText: '#0f1114',
    ok: '#51cf66', low: '#fcc419', out: '#ff6b6b',
    rowOut: 'rgba(255,107,107,.04)', rowLow: 'rgba(252,196,25,.03)',
    pillBg: '#25262b', modalBg: 'rgba(0,0,0,.7)',
  },
  light: {
    bg: '#f8f9fa', bgCard: '#ffffff', bgHover: '#f1f3f5', bgInput: '#ffffff',
    border: '#dee2e6', borderLight: '#e9ecef', borderInput: '#ced4da',
    text: '#212529', textMuted: '#6c757d', textDim: '#adb5bd', textDimmer: '#dee2e6',
    accent: '#c2410c', accentBg: '#c2410c', accentText: '#ffffff',
    ok: '#2b8a3e', low: '#e67700', out: '#c92a2a',
    rowOut: 'rgba(201,42,42,.04)', rowLow: 'rgba(230,119,0,.03)',
    pillBg: '#e9ecef', modalBg: 'rgba(0,0,0,.4)',
  },
};

/* ── components ──────────────────────────────────────── */
const Dot = ({ status, t }) => (
  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
    background: { ok: t.ok, low: t.low, out: t.out }[status] || t.textDim, marginRight: 6, flexShrink: 0 }} />
);

/* ══════════════════════════════════════════════════════
   SETUP SCREEN
   ══════════════════════════════════════════════════════ */
function SetupScreen({ onComplete, t }) {
  const [step, setStep] = useState(1); // 1=welcome, 2=inventory+pars
  const [items, setItems] = useState(() => DEFAULT_ITEMS.map(d => ({ ...d })));
  const [pars, setPars] = useState({});
  const [setupSearch, setSetupSearch] = useState('');
  const [setupVendor, setSetupVendor] = useState('all');
  const [collapsed, setCollapsed] = useState({});

  const vendors = useMemo(() => [...new Set(items.map(i => i.v))].sort(), [items]);
  const filtered = useMemo(() => {
    let f = items;
    if (setupVendor !== 'all') f = f.filter(i => i.v === setupVendor);
    if (setupSearch) { const s = setupSearch.toLowerCase(); f = f.filter(i => i.n.toLowerCase().includes(s) || i.c.toLowerCase().includes(s)); }
    return f;
  }, [items, setupVendor, setupSearch]);
  const grouped = useMemo(() => { const g = {}; filtered.forEach(i => { (g[i.v] = g[i.v] || []).push(i); }); return g; }, [filtered]);

  const updateBeg = (id, val) => { const v = pn(val); if (val !== '' && v === '') return; setItems(p => p.map(i => i.id === id ? { ...i, b: v === '' ? 0 : v } : i)); };
  const updatePar = (id, val) => { const v = pn(val); if (val !== '' && v === '') return; setPars(p => ({ ...p, [id]: v })); };
  const tog = v => setCollapsed(p => ({ ...p, [v]: !p[v] }));

  const finish = () => {
    const fullItems = items.map(i => ({ id: i.id, vendor: i.v, category: i.c, name: i.n, beginningInventory: i.b || 0 }));
    onComplete({ items: fullItems, pars, startWeek: weekKey(), startLabel: weekLabel() });
  };

  const filledCount = items.filter(i => i.b > 0).length;
  const parCount = Object.values(pars).filter(v => v > 0).length;

  const inp = { background: t.bgInput, border: `1px solid ${t.borderInput}`, borderRadius: 6, color: t.text,
    padding: '6px 8px', fontSize: 13, width: 60, textAlign: 'center', outline: 'none', fontFamily: '"JetBrains Mono",monospace' };

  if (step === 1) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans",system-ui,sans-serif' }}>
      <div style={{ maxWidth: 480, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚗️</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: t.accent, marginBottom: 8 }}>ALCHEMY</div>
        <div style={{ fontSize: 14, color: t.textMuted, letterSpacing: 1, marginBottom: 32 }}>ORDER FORM SETUP</div>
        <div style={{ fontSize: 15, color: t.text, lineHeight: 1.7, marginBottom: 12, textAlign: 'left' }}>
          Welcome! Let's get your inventory system set up. On the next screen you'll:
        </div>
        <div style={{ textAlign: 'left', fontSize: 14, color: t.textMuted, lineHeight: 1.8, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{ marginBottom: 6 }}><span style={{ color: t.accent, fontWeight: 700, marginRight: 8 }}>1.</span>Enter your current <strong style={{ color: t.text }}>Beginning Inventory</strong> for each item</div>
          <div style={{ marginBottom: 6 }}><span style={{ color: t.accent, fontWeight: 700, marginRight: 8 }}>2.</span>Set <strong style={{ color: t.text }}>Par Levels</strong> (minimum stock) for items you want reorder alerts on</div>
          <div><span style={{ color: t.accent, fontWeight: 700, marginRight: 8 }}>3.</span>Start tracking next week with your counts locked in</div>
        </div>
        <div style={{ fontSize: 13, color: t.textDim, marginBottom: 32 }}>
          Your 162 items from the spreadsheet are pre-loaded. You can add or remove items later.
        </div>
        <button onClick={() => setStep(2)} style={{
          background: t.accentBg, color: t.accentText, border: 'none', borderRadius: 8,
          padding: '14px 40px', fontSize: 16, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5,
        }}>Let's Go</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: '"DM Sans",system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: t.bgCard, borderBottom: `1px solid ${t.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: t.accent }}>SETUP</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>Enter Beginning Inventory & Par Levels</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: t.textMuted }}>{filledCount} inventoried · {parCount} pars set</div>
            <button onClick={finish} style={{
              background: t.accentBg, color: t.accentText, border: 'none', borderRadius: 6,
              padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
            }}>Finish Setup</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Search..." value={setupSearch} onChange={e => setSetupSearch(e.target.value)}
            style={{ ...inp, width: 160, textAlign: 'left', padding: '8px 12px', fontFamily: '"DM Sans",sans-serif' }} />
          <select value={setupVendor} onChange={e => setSetupVendor(e.target.value)}
            style={{ ...inp, width: 140, textAlign: 'left', cursor: 'pointer', padding: '8px', fontFamily: '"DM Sans",sans-serif' }}>
            <option value="all">All Vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Items */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
        {Object.keys(grouped).sort().map(vendor => (
          <div key={vendor} style={{ marginBottom: 2 }}>
            <button onClick={() => tog(vendor)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: t.bgCard,
              border: 'none', borderBottom: `1px solid ${t.border}`, padding: '10px 16px', cursor: 'pointer',
            }}>
              <span style={{ width: 4, height: 22, borderRadius: 2, background: VENDOR_COLORS[vendor] || '#868e96' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{vendor}</span>
              <span style={{ fontSize: 12, color: t.textMuted }}>({grouped[vendor].length})</span>
              <span style={{ marginLeft: 'auto', color: t.textDim, fontSize: 11 }}>{collapsed[vendor] ? '▶' : '▼'}</span>
            </button>
            {!collapsed[vendor] && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 0, padding: '5px 16px',
                  borderBottom: `1px solid ${t.borderLight}`, fontSize: 10, color: t.textDim, fontWeight: 600, letterSpacing: 0.8 }}>
                  <div>ITEM</div><div style={{ textAlign: 'center' }}>BEGIN INV</div><div style={{ textAlign: 'center' }}>PAR</div>
                </div>
                {grouped[vendor].map(item => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 0,
                    padding: '7px 16px', borderBottom: `1px solid ${t.bg}`, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, color: t.text }}>{item.n}</div>
                      <div style={{ fontSize: 10, color: t.textDim }}>{item.c}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <input type="number" min="0" step="0.1" value={item.b || ''} onChange={e => updateBeg(item.id, e.target.value)}
                        placeholder="0" onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.borderInput}
                        style={inp} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <input type="number" min="0" step="0.5" value={pars[item.id] ?? ''} onChange={e => updatePar(item.id, e.target.value)}
                        placeholder="—" onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.borderInput}
                        style={inp} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating finish button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: t.bgCard, borderTop: `1px solid ${t.border}`,
        padding: '12px 20px', zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: t.textMuted }}>{filledCount}/{items.length} inventoried · {parCount} pars</div>
          <button onClick={finish} style={{
            background: t.accentBg, color: t.accentText, border: 'none', borderRadius: 6,
            padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Finish Setup & Start Tracking</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState(() => store.get('theme') || 'dark');
  const [setup, setSetup] = useState(() => store.get('setup'));
  const [items, setItems] = useState([]);
  const [pars, setPars] = useState({});
  const [wd, setWd] = useState({});
  const [hist, setHist] = useState([]);
  const [view, setView] = useState('count');
  const [vf, setVf] = useState('all');
  const [search, setSearch] = useState('');
  const [sf, setSf] = useState('all');
  const [col, setCol] = useState({});
  const [modal, setModal] = useState(false);
  const [ni, setNi] = useState({ vendor: '', category: '', name: '' });
  const [toast, setToast] = useState(null);
  const [editBeg, setEditBeg] = useState({});
  const saveTimer = useRef(null);

  const t = themes[theme];
  const ck = weekKey();
  const cl = weekLabel();

  const flash = m => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const toggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); store.set('theme', next); };

  // Load
  useEffect(() => {
    if (!setup) return;
    setItems(store.get('items') || []);
    setPars(store.get('pars') || {});
    setWd(store.get(`wk_${ck}`) || {});
    setHist(store.get('history') || []);
  }, [setup]);

  // Save debounced
  const save = useCallback((w, p, i) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (w) store.set(`wk_${ck}`, w);
      if (p) store.set('pars', p);
      if (i) store.set('items', i);
    }, 300);
  }, [ck]);

  // Setup complete handler
  const handleSetupComplete = ({ items: setupItems, pars: setupPars, startWeek, startLabel }) => {
    const config = { done: true, startWeek, startLabel, completedAt: new Date().toISOString() };
    store.set('setup', config);
    store.set('items', setupItems);
    store.set('pars', setupPars);
    setSetup(config);
    setItems(setupItems);
    setPars(setupPars);
  };

  // Field updaters
  const uf = (id, field, val) => { const v = pn(val); if (val !== '' && v === '') return; const n = { ...wd, [id]: { ...(wd[id] || {}), [field]: v } }; setWd(n); save(n, null, null); };
  const up = (id, val) => { const v = pn(val); if (val !== '' && v === '') return; const n = { ...pars, [id]: v }; setPars(n); save(null, n, null); };
  const ub = (id, val) => { const v = pn(val); if (val !== '' && v === '') return; const n = items.map(i => i.id === id ? { ...i, beginningInventory: v === '' ? 0 : v } : i); setItems(n); save(null, null, n); };

  // Calculations
  const beg = i => i.beginningInventory ?? 0;
  const end = i => wd[i.id]?.endingInventory;
  const ord = i => wd[i.id]?.actualOrder;
  const usage = i => { const e = end(i); if (e === undefined || e === '') return null; return beg(i) - e; };
  const sugg = i => { const e = end(i); const p = pars[i.id]; if (!p || p === '' || e === undefined || e === '') return null; const n = p - e; return n > 0 ? Math.ceil(n) : 0; };
  const status = i => {
    const e = end(i); const inv = (e !== undefined && e !== '') ? e : beg(i); const p = pars[i.id];
    if (inv <= 0) return 'out'; if (!p || p === 0) return 'ok'; if (inv <= p * 0.5) return 'out'; if (inv <= p) return 'low'; return 'ok';
  };

  const addItem = () => {
    if (!ni.vendor || !ni.name) return;
    const item = { id: `i${Date.now()}`, vendor: ni.vendor, category: ni.category || 'Other', name: ni.name, beginningInventory: 0 };
    const n = [...items, item]; setItems(n); save(null, null, n);
    setNi({ vendor: '', category: '', name: '' }); setModal(false); flash(`Added ${item.name}`);
  };

  const closeWeek = () => {
    if (!window.confirm('Close this week?\n\nThis archives current data and sets next week\'s Beginning Inventory = Ending Inventory + Actual Order.')) return;
    const entry = { week: ck, label: cl, data: {} };
    const ui = items.map(i => {
      const ev = (end(i) !== undefined && end(i) !== '') ? end(i) : beg(i);
      const ov = (ord(i) !== undefined && ord(i) !== '') ? ord(i) : 0;
      entry.data[i.id] = { beginning: beg(i), ending: ev, usage: usage(i), actualOrder: ov, suggested: sugg(i) };
      return { ...i, beginningInventory: ev + ov };
    });
    const nh = [entry, ...hist].slice(0, 52);
    setHist(nh); setItems(ui); setWd({});
    store.set('history', nh); store.set('items', ui); store.set(`wk_${ck}`, {});
    flash('Week closed — beginning inventory updated');
  };

  const resetApp = () => {
    if (!window.confirm('Reset the entire app? This deletes ALL data including history. This cannot be undone.')) return;
    localStorage.clear();
    setSetup(null); setItems([]); setPars({}); setWd({}); setHist([]);
    flash('App reset');
  };

  // Derived
  const vendors = useMemo(() => [...new Set(items.map(i => i.vendor))].sort(), [items]);
  const filtered = useMemo(() => {
    let f = items;
    if (vf !== 'all') f = f.filter(i => i.vendor === vf);
    if (search) { const s = search.toLowerCase(); f = f.filter(i => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s) || i.vendor.toLowerCase().includes(s)); }
    if (sf !== 'all') f = f.filter(i => status(i) === sf);
    return f;
  }, [items, vf, search, sf, wd, pars]);
  const grouped = useMemo(() => { const g = {}; filtered.forEach(i => { (g[i.vendor] = g[i.vendor] || []).push(i); }); return g; }, [filtered]);
  const orderSum = useMemo(() => { const s = {}; items.forEach(i => { const o = ord(i); if (o && o > 0) (s[i.vendor] = s[i.vendor] || []).push({ ...i, qty: o }); }); return s; }, [items, wd]);
  const attn = useMemo(() => items.filter(i => status(i) !== 'ok').length, [items, wd, pars]);
  const totOrd = useMemo(() => Object.values(orderSum).reduce((a, b) => a + b.length, 0), [orderSum]);

  const tog = v => setCol(p => ({ ...p, [v]: !p[v] }));

  // Show setup if not done
  if (!setup?.done) return <SetupScreen onComplete={handleSetupComplete} t={t} />;

  const inp = { background: t.bgInput, border: `1px solid ${t.borderInput}`, borderRadius: 6, color: t.text,
    padding: '6px 8px', fontSize: 13, width: 58, textAlign: 'center', outline: 'none', fontFamily: '"JetBrains Mono",monospace' };
  const hdr = { fontSize: 10, color: t.textDim, fontWeight: 600, letterSpacing: 0.8, textAlign: 'center' };
  const grid = 'minmax(140px,1fr) 58px 64px 58px 64px 58px 38px';

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: '"DM Sans",system-ui,sans-serif', transition: 'background .2s, color .2s' }}>

      {/* ── Header ── */}
      <div style={{ background: t.bgCard, borderBottom: `1px solid ${t.border}`, padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: t.accent, lineHeight: 1 }}>ALCHEMY</div>
              <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: 1, marginTop: 1 }}>ORDER FORM</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: t.accent, fontWeight: 600 }}>{cl}</div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                {items.length} items
                {attn > 0 && <> · <span style={{ color: t.out }}>{attn} low</span></>}
                {totOrd > 0 && <> · <span style={{ color: t.ok }}>{totOrd} to order</span></>}
              </div>
            </div>
            <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{ background: t.bgHover, border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px',
                fontSize: 16, cursor: 'pointer', color: t.text, lineHeight: 1 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: t.bgCard, borderBottom: `1px solid ${t.border}`, padding: '0 20px', position: 'sticky', top: 58, zIndex: 99 }}>
        <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', overflowX: 'auto' }}>
          {[{ k: 'count', l: 'Weekly Count' }, { k: 'orders', l: `Orders${totOrd ? ` (${totOrd})` : ''}` }, { k: 'pars', l: 'Par Levels' }, { k: 'history', l: 'History' }, { k: 'settings', l: '⚙' }].map(tab => (
            <button key={tab.k} onClick={() => setView(tab.k)} style={{
              padding: '11px 16px', fontSize: 13, fontWeight: view === tab.k ? 600 : 400, whiteSpace: 'nowrap',
              color: view === tab.k ? t.accent : t.textMuted, background: 'none', border: 'none',
              borderBottom: view === tab.k ? `2px solid ${t.accent}` : '2px solid transparent', cursor: 'pointer',
            }}>{tab.l}</button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      {view !== 'settings' && (
        <div style={{ padding: '10px 20px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, width: 150, textAlign: 'left', padding: '8px 12px', fontFamily: '"DM Sans",sans-serif' }} />
            <select value={vf} onChange={e => setVf(e.target.value)}
              style={{ ...inp, width: 130, textAlign: 'left', cursor: 'pointer', padding: '8px', fontFamily: '"DM Sans",sans-serif' }}>
              <option value="all">All Vendors</option>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {(view === 'count' || view === 'pars') && (
              <select value={sf} onChange={e => setSf(e.target.value)}
                style={{ ...inp, width: 110, textAlign: 'left', cursor: 'pointer', padding: '8px', fontFamily: '"DM Sans",sans-serif' }}>
                <option value="all">All Status</option>
                <option value="out">Out/Critical</option>
                <option value="low">Low</option>
                <option value="ok">OK</option>
              </select>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={() => setModal(true)} style={{
              background: t.bgHover, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text,
              padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500,
            }}>+ Add Item</button>
            {view === 'count' && (
              <button onClick={closeWeek} style={{
                background: t.accentBg, color: t.accentText, border: 'none', borderRadius: 6,
                padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
              }}>Close Week</button>
            )}
          </div>
        </div>
      )}

      {/* ── Flow reminder ── */}
      {view === 'count' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 8px' }}>
          <div style={{ fontSize: 11, color: t.textDim, display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: t.pillBg, padding: '2px 7px', borderRadius: 4 }}>Begin</span><span>→</span>
            <span style={{ background: t.pillBg, padding: '2px 7px', borderRadius: 4, color: t.accent }}>End ✎</span><span>→</span>
            <span style={{ background: t.pillBg, padding: '2px 7px', borderRadius: 4 }}>Usage</span><span>→</span>
            <span style={{ background: t.pillBg, padding: '2px 7px', borderRadius: 4 }}>Suggest</span><span>→</span>
            <span style={{ background: t.pillBg, padding: '2px 7px', borderRadius: 4, color: t.accent }}>Order ✎</span><span>→</span>
            <span style={{ background: t.pillBg, padding: '2px 7px', borderRadius: 4, color: t.ok }}>Next→</span>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: t.bgCard, border: `1px solid ${t.accent}`, color: t.accent, padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>{toast}</div>}

      {/* ── Add Item Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: t.modalBg, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModal(false)}>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, width: 320 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 16 }}>Add New Item</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={ni.vendor} onChange={e => setNi({ ...ni, vendor: e.target.value })}
                style={{ ...inp, width: '100%', textAlign: 'left', padding: '10px 12px', fontFamily: '"DM Sans",sans-serif', fontSize: 14 }}>
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v}>{v}</option>)}
              </select>
              <input placeholder="Category" value={ni.category} onChange={e => setNi({ ...ni, category: e.target.value })}
                style={{ ...inp, width: '100%', textAlign: 'left', padding: '10px 12px', fontFamily: '"DM Sans",sans-serif', fontSize: 14 }} />
              <input placeholder="Item Name *" value={ni.name} onChange={e => setNi({ ...ni, name: e.target.value })}
                style={{ ...inp, width: '100%', textAlign: 'left', padding: '10px 12px', fontFamily: '"DM Sans",sans-serif', fontSize: 14 }} autoFocus />
              <button onClick={addItem} disabled={!ni.vendor || !ni.name} style={{
                background: ni.vendor && ni.name ? t.accentBg : t.bgHover, border: 'none', borderRadius: 6,
                color: ni.vendor && ni.name ? t.accentText : t.textDim, padding: '10px', fontSize: 14,
                fontWeight: 600, cursor: ni.vendor && ni.name ? 'pointer' : 'not-allowed', marginTop: 4,
              }}>Add Item</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ CONTENT ═══════════════════ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ── WEEKLY COUNT ── */}
        {view === 'count' && Object.keys(grouped).sort().map(vendor => (
          <div key={vendor} style={{ marginBottom: 2 }}>
            <button onClick={() => tog(vendor)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: t.bgCard,
              border: 'none', borderBottom: `1px solid ${t.border}`, padding: '10px 16px', cursor: 'pointer',
              position: 'sticky', top: 102, zIndex: 10,
            }}>
              <span style={{ width: 4, height: 22, borderRadius: 2, background: VENDOR_COLORS[vendor] || '#868e96' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{vendor}</span>
              <span style={{ fontSize: 12, color: t.textMuted }}>({grouped[vendor].length})</span>
              <span style={{ marginLeft: 'auto', color: t.textDim, fontSize: 11 }}>{col[vendor] ? '▶' : '▼'}</span>
            </button>
            {!col[vendor] && <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 620 }}>
              <div style={{ display: 'grid', gridTemplateColumns: grid, gap: 0, padding: '5px 16px', borderBottom: `1px solid ${t.borderLight}` }}>
                <div style={{ ...hdr, textAlign: 'left' }}>ITEM</div>
                <div style={hdr}>BEGIN</div>
                <div style={{ ...hdr, color: t.accent }}>END ✎</div>
                <div style={hdr}>USAGE</div>
                <div style={hdr}>SUGG</div>
                <div style={{ ...hdr, color: t.accent }}>ORDER ✎</div>
                <div style={{ ...hdr, fontSize: 9 }}>NEXT</div>
              </div>
              {grouped[vendor].map(item => {
                const u = usage(item); const sg = sugg(item); const st = status(item); const b = beg(item);
                const vFlag = u !== null && u < 0;
                const endVal = end(item); const ordVal = ord(item);
                const nextBeg = (endVal !== undefined && endVal !== '') ? ((endVal || 0) + (ordVal || 0)) : null;
                return (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: grid, gap: 0, padding: '6px 16px',
                    borderBottom: `1px solid ${t.bg}`, alignItems: 'center',
                    background: st === 'out' ? t.rowOut : st === 'low' ? t.rowLow : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                      <Dot status={st} t={t} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: 10, color: t.textDim }}>{item.category}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {editBeg[item.id] ? (
                        <input type="number" min="0" step="0.1" autoFocus defaultValue={b}
                          onBlur={e => { ub(item.id, e.target.value); setEditBeg(p => ({ ...p, [item.id]: false })); }}
                          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                          style={{ ...inp, width: 46, fontSize: 12, borderColor: t.accent }} />
                      ) : (
                        <span onClick={() => setEditBeg(p => ({ ...p, [item.id]: true }))}
                          style={{ fontSize: 13, color: t.textMuted, fontFamily: '"JetBrains Mono",monospace', cursor: 'pointer', borderBottom: `1px dashed ${t.borderLight}` }}
                          title="Click to adjust">{b}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <input type="number" min="0" step="0.1" value={wd[item.id]?.endingInventory ?? ''} onChange={e => uf(item.id, 'endingInventory', e.target.value)} placeholder="—"
                        onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.borderInput} style={{ ...inp, width: 50 }} />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 13, fontFamily: '"JetBrains Mono",monospace', color: u === null ? t.textDimmer : vFlag ? t.out : t.text }}>
                      {u === null ? '—' : <>{u.toFixed(1)}{vFlag && <span title="Negative — recheck count" style={{ marginLeft: 2, fontSize: 10 }}>⚠</span>}</>}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 13, fontFamily: '"JetBrains Mono",monospace', color: sg === null ? t.textDimmer : sg > 0 ? t.low : t.ok }}>
                      {sg === null ? (pars[item.id] ? '—' : <span style={{ fontSize: 9, color: t.textDimmer }}>no par</span>) : sg > 0 ? (
                        <button onClick={() => uf(item.id, 'actualOrder', sg)} style={{ background: 'none', border: `1px solid ${t.low}33`, borderRadius: 4, color: t.low, fontSize: 12, padding: '1px 6px', cursor: 'pointer', fontFamily: '"JetBrains Mono",monospace' }}>+{sg}</button>
                      ) : <span style={{ fontSize: 11 }}>✓</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <input type="number" min="0" step="1" value={wd[item.id]?.actualOrder ?? ''} onChange={e => uf(item.id, 'actualOrder', e.target.value)} placeholder="—"
                        onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.borderInput} style={{ ...inp, width: 50 }} />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, fontFamily: '"JetBrains Mono",monospace', color: t.textDim }}>
                      {nextBeg !== null ? nextBeg.toFixed(1) : ''}
                    </div>
                  </div>
                );
              })}
            </div></div>}
          </div>
        ))}

        {/* ── ORDER SUMMARY ── */}
        {view === 'orders' && (<div>
          {Object.keys(orderSum).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: t.textDim }}><div style={{ fontSize: 44, marginBottom: 12 }}>✓</div><div style={{ fontSize: 16, fontWeight: 500 }}>No orders yet</div><div style={{ fontSize: 13, marginTop: 4 }}>Enter Actual Order in Weekly Count</div></div>
          ) : Object.keys(orderSum).sort().map(vendor => (
            <div key={vendor} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0 8px', borderBottom: `2px solid ${VENDOR_COLORS[vendor] || t.border}` }}>
                <span style={{ width: 4, height: 22, borderRadius: 2, background: VENDOR_COLORS[vendor] || '#868e96' }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: t.text }}>{vendor}</span>
                <span style={{ fontSize: 12, color: t.textMuted }}>{orderSum[vendor].length} item{orderSum[vendor].length !== 1 ? 's' : ''}</span>
              </div>
              {orderSum[vendor].map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${t.bg}` }}>
                  <div><div style={{ fontSize: 14, color: t.text }}>{item.name}</div><div style={{ fontSize: 11, color: t.textDim }}>{item.category}</div></div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: t.accent, fontFamily: '"JetBrains Mono",monospace', minWidth: 50, textAlign: 'right' }}>{item.qty}</div>
                </div>
              ))}
            </div>
          ))}
        </div>)}

        {/* ── PAR LEVELS ── */}
        {view === 'pars' && (<div>
          <div style={{ padding: '10px 0 14px', fontSize: 13, color: t.textMuted }}>Set minimum stock levels. Items below par get a Suggested Order in Weekly Count.</div>
          {Object.keys(grouped).sort().map(vendor => (
            <div key={vendor} style={{ marginBottom: 2 }}>
              <button onClick={() => tog(vendor)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: t.bgCard, border: 'none', borderBottom: `1px solid ${t.border}`, padding: '10px 16px', cursor: 'pointer' }}>
                <span style={{ width: 4, height: 22, borderRadius: 2, background: VENDOR_COLORS[vendor] || '#868e96' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{vendor}</span>
                <span style={{ marginLeft: 'auto', color: t.textDim, fontSize: 11 }}>{col[vendor] ? '▶' : '▼'}</span>
              </button>
              {!col[vendor] && grouped[vendor].map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: `1px solid ${t.bg}` }}>
                  <div><div style={{ fontSize: 13, color: t.text }}>{item.name}</div><div style={{ fontSize: 10, color: t.textDim }}>{item.category}</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: t.textDim }}>PAR</span>
                    <input type="number" min="0" step="0.5" value={pars[item.id] ?? ''} onChange={e => up(item.id, e.target.value)} placeholder="—"
                      onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.borderInput} style={{ ...inp, width: 56 }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>)}

        {/* ── HISTORY ── */}
        {view === 'history' && (<div>
          {hist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: t.textDim }}><div style={{ fontSize: 44, marginBottom: 12 }}>📋</div><div style={{ fontSize: 16, fontWeight: 500 }}>No history yet</div><div style={{ fontSize: 13, marginTop: 4 }}>Close a week to start building history</div></div>
          ) : hist.map((entry, idx) => (
            <details key={idx} style={{ marginBottom: 4 }}>
              <summary style={{ padding: '12px 16px', background: t.bgCard, borderBottom: `1px solid ${t.border}`, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: t.text, listStyle: 'none' }}>
                <span style={{ color: t.accent, marginRight: 8 }}>▸</span>Week of {entry.label}
                <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 12 }}>{Object.values(entry.data).filter(d => d.actualOrder > 0).length} ordered</span>
              </summary>
              <div style={{ background: t.bgHover, overflowX: 'auto' }}><div style={{ minWidth: 540 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 55px 55px 55px 55px', gap: 0, padding: '5px 16px', fontSize: 10, color: t.textDim, fontWeight: 600, letterSpacing: .5 }}>
                  <div>ITEM</div><div style={{ textAlign: 'center' }}>BEGIN</div><div style={{ textAlign: 'center' }}>END</div><div style={{ textAlign: 'center' }}>USAGE</div><div style={{ textAlign: 'center' }}>ORDER</div>
                </div>
                {items.filter(i => entry.data[i.id]).map(item => { const d = entry.data[item.id]; return (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 55px 55px 55px 55px', gap: 0, padding: '5px 16px', borderBottom: `1px solid ${t.bg}`, fontSize: 12 }}>
                    <div style={{ color: t.text }}>{item.name}</div>
                    <div style={{ textAlign: 'center', fontFamily: '"JetBrains Mono",monospace', color: t.textDim }}>{d.beginning}</div>
                    <div style={{ textAlign: 'center', fontFamily: '"JetBrains Mono",monospace', color: t.textMuted }}>{d.ending}</div>
                    <div style={{ textAlign: 'center', fontFamily: '"JetBrains Mono",monospace', color: d.usage === null ? t.textDimmer : d.usage < 0 ? t.out : t.textMuted }}>{d.usage === null ? '—' : d.usage.toFixed(1)}</div>
                    <div style={{ textAlign: 'center', fontFamily: '"JetBrains Mono",monospace', color: d.actualOrder > 0 ? t.accent : t.textDimmer }}>{d.actualOrder || '—'}</div>
                  </div>
                ); })}
              </div></div>
            </details>
          ))}
        </div>)}

        {/* ── SETTINGS ── */}
        {view === 'settings' && (
          <div style={{ maxWidth: 500, margin: '20px auto' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 20 }}>Settings</div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 8 }}>Appearance</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: t.textMuted }}>Theme</span>
                <button onClick={toggleTheme} style={{ background: t.bgHover, border: `1px solid ${t.border}`, borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: t.text }}>
                  {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 }}>Setup Info</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>Started: {setup?.startLabel || 'N/A'}</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>Items: {items.length} · History: {hist.length} weeks</div>
            </div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.out, marginBottom: 8 }}>Danger Zone</div>
              <button onClick={resetApp} style={{ background: 'transparent', border: `1px solid ${t.out}`, borderRadius: 6, color: t.out, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                Reset Entire App
              </button>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 6 }}>Deletes all data, history, and settings. Cannot be undone.</div>
            </div>
          </div>
        )}

        {filtered.length === 0 && (view === 'count' || view === 'pars') && <div style={{ textAlign: 'center', padding: 60, color: t.textDim }}><div style={{ fontSize: 16 }}>No items match filters</div></div>}
      </div>
    </div>
  );
}
