import React, { useState, useEffect } from 'react';

export default function CameraGrailHome() {
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const featured = [
    { name: 'Leica M3', years: '1954–1966', low: 1400, high: 3200, trend: '+8%', up: true, type: '35mm Rangefinder', rarity: 'Uncommon' },
    { name: 'Hasselblad 500C/M', years: '1970–1994', low: 950, high: 2400, trend: '+12%', up: true, type: 'Medium Format', rarity: 'Sought-after' },
    { name: 'Yashica Electro 35', years: '1966–1977', low: 45, high: 160, trend: '-3%', up: false, type: '35mm Rangefinder', rarity: 'Common' },
    { name: 'Rolleiflex 2.8F', years: '1960–1981', low: 1100, high: 2900, trend: '+5%', up: true, type: 'TLR', rarity: 'Sought-after' },
    { name: 'Canon AE-1', years: '1976–1984', low: 70, high: 220, trend: '+2%', up: true, type: '35mm SLR', rarity: 'Common' },
    { name: 'Mamiya RB67', years: '1970–1990', low: 280, high: 720, trend: '+6%', up: true, type: 'Medium Format', rarity: 'Uncommon' },
  ];

  // palette
  const navy = '#0E1A2B';      // deep ink navy
  const navy2 = '#16263D';     // raised navy
  const blue = '#2D6CDF';      // accent blue
  const blueSoft = '#5B8DEF';
  const paper = '#F7F9FC';     // near-white cool
  const ink = '#0E1A2B';
  const slate = '#5A6B82';
  const line = '#E4EAF2';

  return (
    <div style={{ background: paper, color: ink, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Spline+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .head { font-family: 'Spline Sans', 'Inter', sans-serif; }
        .body { font-family: 'Inter', sans-serif; }
        @keyframes rise { from {opacity:0; transform:translateY(22px);} to {opacity:1; transform:translateY(0);} }
        .rise { animation: rise .85s cubic-bezier(0.16,1,0.3,1) both; }
        .d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}.d4{animation-delay:.28s}
        .cardh { transition: all .3s cubic-bezier(0.16,1,0.3,1); }
        .cardh:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(14,26,43,0.4); border-color: #CBD8EA; }
        .lu { position:relative; }
        .lu::after { content:''; position:absolute; left:0; bottom:-3px; height:2px; width:0; background:${blue}; transition:width .28s; }
        .lu:hover::after { width:100%; }
        .btnp:hover { background:${navy2} !important; }
        .btnb:hover { background:${blueSoft} !important; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        background: scrolled ? 'rgba(247,249,252,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? `1px solid ${line}` : '1px solid transparent',
        transition:'all .3s', padding: scrolled ? '13px 0' : '20px 0'
      }}>
        <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:navy, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ width:15, height:15, borderRadius:'50%', border:`2px solid ${blueSoft}` }}></div>
              <div style={{ position:'absolute', top:6, right:7, width:4, height:4, borderRadius:'50%', background:blue }}></div>
            </div>
            <span className="head" style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color:navy }}>CameraGrail</span>
          </div>
          <div className="body" style={{ display:'flex', alignItems:'center', gap:30, fontSize:14.5 }}>
            <a className="lu" style={{ color:slate, cursor:'pointer' }}>Browse</a>
            <a className="lu" style={{ color:slate, cursor:'pointer' }}>Brands</a>
            <a className="lu" style={{ color:slate, cursor:'pointer' }}>Price Index</a>
            <a className="lu" style={{ color:slate, cursor:'pointer' }}>Submit a Camera</a>
            <button className="btnp" style={{ background:navy, color:'#fff', border:'none', padding:'10px 18px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              Value my camera
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:'relative', padding:'168px 28px 72px', overflow:'hidden' }}>
        {/* soft gradient glow */}
        <div style={{ position:'absolute', top:-40, right:-60, width:520, height:520, borderRadius:'50%', background:`radial-gradient(circle, rgba(45,108,223,0.12), transparent 65%)`, zIndex:0 }}></div>
        <div style={{ maxWidth:1240, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div className="body rise" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', background:'rgba(45,108,223,0.1)', color:blue, borderRadius:100, fontSize:13, fontWeight:600, marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:blue }}></span>
            41,800 cameras catalogued · prices updated daily
          </div>

          <h1 className="head rise d1" style={{ fontSize:'clamp(46px,6.4vw,84px)', lineHeight:1.03, fontWeight:700, letterSpacing:'-0.035em', maxWidth:900, marginBottom:24, color:navy }}>
            What is your old camera <span style={{ color:blue }}>actually</span> worth?
          </h1>

          <p className="body rise d2" style={{ fontSize:20, lineHeight:1.55, color:slate, maxWidth:600, marginBottom:36 }}>
            The complete price guide and archive for film and digital cameras. Real sale data, full specifications, and production history for every model ever made, from a £30 point-and-shoot to a £30,000 Leica.
          </p>

          <div className="rise d3" style={{ maxWidth:640, marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', background:'#fff', border:`1.5px solid ${line}`, borderRadius:13, padding:'6px 6px 6px 18px', boxShadow:'0 6px 26px -14px rgba(14,26,43,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA9BE" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="Try 'Canon AE-1', 'Leica M3', 'Pentax K1000'..." className="body"
                style={{ flex:1, border:'none', outline:'none', fontSize:16, padding:'12px 14px', background:'transparent', color:ink }} />
              <button className="btnb" style={{ background:blue, color:'#fff', border:'none', padding:'12px 24px', borderRadius:9, fontSize:15, fontWeight:600, cursor:'pointer' }}>Search</button>
            </div>
          </div>
          <div className="body rise d4" style={{ fontSize:13.5, color:'#9AA9BE', display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
            <span>Popular:</span>
            {['Canon AE-1','Nikon F3','Olympus OM-1','Mamiya RB67','Contax T2'].map(t=>(
              <a key={t} className="lu" style={{ color:slate, cursor:'pointer' }}>{t}</a>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop:`1px solid ${line}`, borderBottom:`1px solid ${line}`, background:'#fff' }}>
        <div style={{ maxWidth:1240, margin:'0 auto', padding:'28px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {[{n:'41,800',l:'Cameras catalogued'},{n:'2.4M',l:'Real sale records'},{n:'1,100+',l:'Brands & makers'},{n:'Daily',l:'Price updates'}].map((s,i)=>(
            <div key={i}>
              <div className="head" style={{ fontSize:33, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1, color:navy }}>{s.n}</div>
              <div className="body" style={{ fontSize:12.5, color:slate, marginTop:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ padding:'78px 28px' }}>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:34, flexWrap:'wrap', gap:14 }}>
            <div>
              <div className="body" style={{ fontSize:12.5, fontWeight:700, letterSpacing:'0.12em', color:blue, marginBottom:10, textTransform:'uppercase' }}>Trending this week</div>
              <h2 className="head" style={{ fontSize:'clamp(28px,3.8vw,44px)', fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.05, color:navy }}>Cameras collectors are watching</h2>
            </div>
            <a className="body lu" style={{ fontSize:15, color:navy, fontWeight:600, cursor:'pointer' }}>View full price index →</a>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px,1fr))', gap:18 }}>
            {featured.map((c,i)=>(
              <div key={i} className="cardh" style={{ background:'#fff', border:`1px solid ${line}`, borderRadius:16, padding:24, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
                  <div>
                    <div className="head" style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.015em', lineHeight:1.1, color:navy }}>{c.name}</div>
                    <div className="body" style={{ fontSize:13.5, color:'#9AA9BE', marginTop:4 }}>{c.years} · {c.type}</div>
                  </div>
                  <div style={{ width:48, height:36, borderRadius:7, background:paper, border:`1px solid ${line}`, position:'relative', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:17, height:17, borderRadius:'50%', border:`2px solid #B3C0D4` }}></div>
                    <div style={{ position:'absolute', top:5, right:7, width:5, height:3, borderRadius:1, background:blue }}></div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', paddingTop:16, borderTop:`1px solid ${paper}` }}>
                  <div>
                    <div className="body" style={{ fontSize:11.5, color:'#9AA9BE', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Market value</div>
                    <div className="head" style={{ fontSize:23, fontWeight:700, letterSpacing:'-0.02em', color:navy }}>£{c.low.toLocaleString()}–£{c.high.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="body" style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:13, fontWeight:700, color: c.up?'#1F8A55':'#C24536', background: c.up?'rgba(31,138,85,0.1)':'rgba(194,69,54,0.1)', padding:'4px 10px', borderRadius:100 }}>
                      {c.up?'▲':'▼'} {c.trend}
                    </div>
                    <div className="body" style={{ fontSize:11.5, color:'#9AA9BE', marginTop:5 }}>{c.rarity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE TOOL (dark navy) */}
      <section style={{ padding:'72px 28px', background:navy, color:paper, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-120, left:-80, width:440, height:440, borderRadius:'50%', background:`radial-gradient(circle, rgba(45,108,223,0.25), transparent 70%)` }}></div>
        <div style={{ maxWidth:1240, margin:'0 auto', position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:58, alignItems:'center' }}>
          <div>
            <div className="body" style={{ fontSize:12.5, fontWeight:700, letterSpacing:'0.12em', color:blueSoft, marginBottom:14, textTransform:'uppercase' }}>The valuation tool</div>
            <h2 className="head" style={{ fontSize:'clamp(28px,3.8vw,46px)', fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.08, marginBottom:18, color:'#fff' }}>
              Know what it's worth in <span style={{ color:blueSoft }}>seconds</span>, not guesses.
            </h2>
            <p className="body" style={{ fontSize:17.5, lineHeight:1.6, color:'#A9B7CC', marginBottom:28 }}>
              Every camera page shows the real range from recent sales, not wishful asking prices. See condition-adjusted values, production history, full specs, and a live link to current listings.
            </p>
            {[
              {n:'01',t:'Search any model',d:'41,800 cameras and lenses, fully catalogued.'},
              {n:'02',t:'See the real range',d:'Condition-adjusted values from millions of actual sales.'},
              {n:'03',t:'Buy, sell, or hold',d:'Live links to current listings, plus price-trend history.'},
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex', gap:15, alignItems:'flex-start', marginBottom:i<2?16:0 }}>
                <div className="head" style={{ fontSize:17, color:blueSoft, fontWeight:700, minWidth:26 }}>{s.n}</div>
                <div>
                  <div className="body" style={{ fontSize:16, fontWeight:600, marginBottom:3, color:'#fff' }}>{s.t}</div>
                  <div className="body" style={{ fontSize:15, color:'#92A1B8' }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:paper, color:ink, borderRadius:18, padding:30, boxShadow:'0 30px 60px -20px rgba(0,0,0,0.55)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <div className="head" style={{ fontSize:27, fontWeight:700, letterSpacing:'-0.02em', color:navy }}>Olympus OM-1</div>
                <div className="body" style={{ fontSize:13.5, color:'#9AA9BE', marginTop:4 }}>1972–1979 · 35mm SLR · Japan</div>
              </div>
              <div className="body" style={{ fontSize:12, fontWeight:700, color:'#1F8A55', background:'rgba(31,138,85,0.1)', padding:'5px 11px', borderRadius:100 }}>▲ +9%</div>
            </div>
            <div style={{ background:'#fff', border:`1px solid ${line}`, borderRadius:13, padding:20, marginBottom:18 }}>
              <div className="body" style={{ fontSize:11.5, color:'#9AA9BE', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Market value by condition</div>
              {[
                {c:'Mint / boxed', v:'£190–£260', w:'100%'},
                {c:'Excellent', v:'£130–£180', w:'72%'},
                {c:'Good / working', v:'£80–£120', w:'48%'},
                {c:'For parts', v:'£25–£50', w:'20%'},
              ].map((r,i)=>(
                <div key={i} style={{ marginBottom:i<3?12:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span className="body" style={{ fontSize:13.5, color:'#3A332C' }}>{r.c}</span>
                    <span className="body" style={{ fontSize:13.5, fontWeight:700, color:navy }}>{r.v}</span>
                  </div>
                  <div style={{ height:6, background:line, borderRadius:100, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:r.w, background:blue, borderRadius:100 }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btnp body" style={{ width:'100%', background:navy, color:'#fff', border:'none', padding:14, borderRadius:11, fontSize:15, fontWeight:600, cursor:'pointer' }}>
              See 47 current listings →
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding:'78px 28px' }}>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <div className="body" style={{ fontSize:12.5, fontWeight:700, letterSpacing:'0.12em', color:blue, marginBottom:10, textTransform:'uppercase' }}>Browse the archive</div>
          <h2 className="head" style={{ fontSize:'clamp(28px,3.8vw,44px)', fontWeight:700, letterSpacing:'-0.025em', marginBottom:34, color:navy }}>Every format, every maker</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:14 }}>
            {[
              {t:'35mm SLR',n:'8,400 models'},{t:'Rangefinder',n:'3,100 models'},{t:'Medium Format',n:'2,700 models'},{t:'TLR',n:'1,200 models'},
              {t:'Point & Shoot',n:'6,900 models'},{t:'Instant / Polaroid',n:'840 models'},{t:'Vintage Digital',n:'4,500 models'},{t:'Lenses',n:'9,800 models'},
            ].map((c,i)=>(
              <div key={i} className="cardh" style={{ background:'#fff', border:`1px solid ${line}`, borderRadius:13, padding:'21px 20px', cursor:'pointer' }}>
                <div className="head" style={{ fontSize:18.5, fontWeight:700, letterSpacing:'-0.015em', marginBottom:5, color:navy }}>{c.t}</div>
                <div className="body" style={{ fontSize:13, color:'#9AA9BE' }}>{c.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBMIT */}
      <section style={{ padding:'72px 28px', background:'#fff', borderTop:`1px solid ${line}` }}>
        <div style={{ maxWidth:1020, margin:'0 auto', textAlign:'center' }}>
          <div className="body" style={{ fontSize:12.5, fontWeight:700, letterSpacing:'0.12em', color:blue, marginBottom:14, textTransform:'uppercase' }}>Help build the archive</div>
          <h2 className="head" style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.08, marginBottom:18, color:navy }}>
            Found a camera that history forgot?
          </h2>
          <p className="body" style={{ fontSize:18.5, lineHeight:1.6, color:slate, maxWidth:680, margin:'0 auto 30px' }}>
            Some of the rarest cameras ever made aren't in any database. If you own an obscure model, an unmarked maker, or a regional variant nobody has documented, add it to the archive. Every submission is credited and helps the next collector.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btnp body" style={{ background:navy, color:'#fff', border:'none', padding:'15px 28px', borderRadius:100, fontSize:15.5, fontWeight:600, cursor:'pointer' }}>Submit a camera</button>
            <button className="body" style={{ background:'transparent', color:navy, border:`1.5px solid #C2D0E4`, padding:'15px 28px', borderRadius:100, fontSize:15.5, fontWeight:600, cursor:'pointer' }}>Log a recent sale</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:navy, color:'#8DA0BC', padding:'54px 28px 28px' }}>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:38 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:navy2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width:13, height:13, borderRadius:'50%', border:`2px solid ${blueSoft}` }}></div>
                </div>
                <span className="head" style={{ fontSize:19, fontWeight:700, color:'#fff' }}>CameraGrail</span>
              </div>
              <p className="body" style={{ fontSize:14.5, lineHeight:1.6, maxWidth:300 }}>The price guide and archive for every camera ever made. Built by collectors, for collectors.</p>
            </div>
            {[
              {h:'Browse',l:['By brand','By format','Price index','Most valuable','Recently added']},
              {h:'Tools',l:['Value my camera','Collection tracker','Price alerts','Submit a camera']},
              {h:'About',l:['How values work','Our data','Contribute','Contact']},
            ].map((col,i)=>(
              <div key={i}>
                <div className="body" style={{ fontSize:12.5, fontWeight:700, color:'#fff', letterSpacing:'0.06em', marginBottom:14, textTransform:'uppercase' }}>{col.h}</div>
                <ul className="body" style={{ listStyle:'none', padding:0, margin:0, fontSize:14.5, lineHeight:2.1 }}>
                  {col.l.map(x=><li key={x} style={{ cursor:'pointer' }}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="body" style={{ paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:12.5 }}>
            <span>© 2026 CameraGrail. Values are estimates based on real sale data and are not formal appraisals.</span>
            <span>We may earn a commission from listings linked on this site.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
