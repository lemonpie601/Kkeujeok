/*! 끄적 친구 (Typing Buddy) 3.5.2
 * 채팅 입력창 커서를 따라다니는 작은 친구.
 * 떠 있는 버튼(또는 Alt+Shift+K)을 누르면 꾸미기 창이 열려요.
 * 등장 · 쓸 때 · 지울 때 · 줄바꿈 · 보낼 때 · 붙여넣기 · 쉴 때마다 움직임, 그림, 효과를 따로 고를 수 있어요.
 * 그림함에 그림을 여러 장 담아 두고, 지금 모습을 프리셋으로 저장하거나 파일로 주고받을 수 있어요.
 * 그림함·프리셋·설정은 Marinara 서버에 저장돼서 어느 기기·주소에서 열어도 같아요. */
(() => {
  window.__kkjBuddy?.cleanup();

  const KEY = "kkj-buddy:v3";
  const KEY_G = "kkj-buddy:gallery";
  const KEY_P = "kkj-buddy:presets";
  const OLD_KEY = "kkj-buddy:v2";
  const SEL = 'textarea[data-chat-composer="true"]';
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const MAX_GALLERY = 30;
  const MAX_PRESETS = 40;

  /* ═════════ 움직임 목록 ═════════ */
  // 한 번 움직이기: [이름, 길이(ms), 키프레임, 회전 중심(c=가운데, t=위)]
  const ACTS = {
    none: ["가만히", 0, ""],
    scribble: ["끄적끄적", 420, "25%{transform:translate(1px,-1px) rotate(-7deg)}50%{transform:translate(-.5px,0) rotate(4deg)}75%{transform:translate(.5px,-.5px) rotate(-4deg)}"],
    hop: ["콩콩", 400, "0%{transform:scale(1.08,.9)}40%{transform:translateY(-6px) scale(.96,1.05)}75%{transform:translateY(0) scale(1.05,.94)}"],
    jump: ["폴짝", 560, "0%{transform:scale(1.12,.86)}35%{transform:translateY(-15px) scale(.94,1.08)}70%{transform:translateY(0) scale(1.1,.9)}85%{transform:scale(.97,1.03)}"],
    bounce: ["통통", 380, "30%{transform:translateY(-4px)}60%{transform:translateY(0)}80%{transform:translateY(-2px)}"],
    wiggle: ["흔들흔들", 450, "20%{transform:rotate(-10deg)}45%{transform:rotate(8deg)}70%{transform:rotate(-5deg)}90%{transform:rotate(2deg)}"],
    pulse: ["두근", 380, "40%{transform:scale(1.18)}"],
    heartbeat: ["콩닥콩닥", 620, "15%{transform:scale(1.15)}30%{transform:scale(1)}45%{transform:scale(1.22)}70%{transform:scale(1)}"],
    jelly: ["말랑", 560, "30%{transform:scale(1.22,.82)}45%{transform:scale(.86,1.14)}60%{transform:scale(1.07,.94)}75%{transform:scale(.98,1.02)}"],
    shake: ["부르르", 400, "15%,55%{transform:translateX(-3px)}35%,75%{transform:translateX(3px)}90%{transform:translateX(-1px)}"],
    tremble: ["덜덜", 320, "20%,60%{transform:translate(-1px,.5px)}40%,80%{transform:translate(1px,-.5px)}"],
    headshake: ["도리도리", 520, "20%{transform:translateX(-4px) rotate(-6deg)}45%{transform:translateX(4px) rotate(6deg)}70%{transform:translateX(-2px) rotate(-3deg)}"],
    nod: ["꾸벅", 520, "40%{transform:translateY(2px) rotate(16deg)}70%{transform:rotate(-3deg)}"],
    tilt: ["갸웃", 560, "35%,65%{transform:rotate(-16deg)}"],
    spin: ["빙글", 620, "to{transform:rotate(360deg)}", "c"],
    flip: ["뒤집기", 560, "to{transform:rotateY(360deg)}", "c"],
    roll: ["데굴", 680, "60%{transform:translateX(9px) rotate(360deg)}100%{transform:translateX(0) rotate(360deg)}", "c"],
    pop: ["팡", 380, "0%{transform:scale(.6)}60%{transform:scale(1.25)}"],
    popin: ["뿅 등장", 440, "0%{transform:scale(0);opacity:0}70%{transform:scale(1.15);opacity:1}"],
    stomp: ["쿵", 440, "0%{transform:translateY(-12px)}50%{transform:translateY(0) scale(1.18,.82)}75%{transform:scale(.96,1.04)}"],
    surprise: ["깜짝", 480, "20%,60%{transform:translateY(-6px) scale(1.15)}"],
    wobble: ["휘청", 680, "15%{transform:translateX(-4px) rotate(-12deg)}30%{transform:translateX(3px) rotate(9deg)}50%{transform:translateX(-2px) rotate(-6deg)}70%{transform:translateX(1px) rotate(3deg)}"],
    squirm: ["꼬물꼬물", 520, "25%{transform:skewX(12deg)}50%{transform:skewX(-10deg)}75%{transform:skewX(5deg)}"],
    flash: ["반짝", 420, "40%{filter:brightness(1.6) drop-shadow(0 0 6px #ffd27a)}"],
    zoom: ["슝 날아가기", 760, "45%{transform:translate(16px,-20px) rotate(20deg) scale(.5);opacity:0}55%{transform:translate(-6px,6px) scale(.5);opacity:0}100%{opacity:1}"],
    sink: ["쏙 숨기", 640, "40%,60%{transform:translateY(8px) scale(.3);opacity:0}"],
    swing: ["대롱대롱", 720, "20%{transform:rotate(16deg)}45%{transform:rotate(-11deg)}70%{transform:rotate(6deg)}88%{transform:rotate(-2deg)}", "t"],
    grow: ["쑥", 460, "50%{transform:scale(1.45)}"],
    shrink: ["움찔", 360, "40%{transform:scale(.72)}"],
    dance: ["룰루랄라", 760, "15%{transform:translateY(-4px) rotate(-10deg)}30%{transform:rotate(0)}45%{transform:translateY(-4px) rotate(10deg)}60%{transform:rotate(0)}75%{transform:translateY(-3px) rotate(-6deg)}"],
    peek: ["빼꼼", 640, "30%,60%{transform:translateX(-5px) rotate(-14deg)}"],
    sneeze: ["에취", 560, "35%{transform:scale(1.1,.9) rotate(-6deg)}50%{transform:translateX(5px) rotate(10deg) scale(.94)}"],
  };
  // 계속 움직이기 (쉴 때)
  const LOOPS = {
    none: ["가만히", 0, ""],
    lift: ["살짝 들기", 0, ""],
    float: ["둥실둥실", 2400, "50%{transform:translateY(-3px)}"],
    breathe: ["숨쉬기", 2600, "50%{transform:scale(1.06)}"],
    sway: ["살랑살랑", 2200, "25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}"],
    bob: ["까딱까딱", 900, "50%{transform:rotate(-6deg) translateY(-1px)}"],
    doze: ["꾸벅꾸벅", 3200, "40%,55%{transform:rotate(12deg) translateY(1px)}70%{transform:rotate(-2deg)}"],
    glow: ["은은한 빛", 2400, "50%{filter:drop-shadow(0 0 5px #ffd9a0)}"],
    slowspin: ["빙글빙글", 6000, "to{transform:rotate(360deg)}", "c"],
    bounce: ["통통", 900, "40%{transform:translateY(-4px) scale(.97,1.03)}60%{transform:translateY(0) scale(1.03,.97)}"],
    look: ["두리번", 4000, "0%,40%{transform:scaleX(1)}45%,85%{transform:scaleX(-1)}90%,100%{transform:scaleX(1)}", "c"],
    wag: ["팔랑팔랑", 600, "50%{transform:rotate(-10deg)}"],
    blink: ["깜빡깜빡", 2000, "45%{opacity:1}50%{opacity:.25}55%{opacity:1}"],
    drift: ["둥둥", 3400, "25%{transform:translate(2px,-2px)}50%{transform:translate(0,-4px)}75%{transform:translate(-2px,-2px)}"],
    jelly: ["말랑말랑", 1600, "50%{transform:scale(1.06,.95)}"],
    heartbeat: ["콩닥콩닥", 1300, "10%{transform:scale(1.12)}20%{transform:scale(1)}30%{transform:scale(1.15)}45%{transform:scale(1)}"],
    tremble: ["오들오들", 260, "25%{transform:translateX(-.6px)}75%{transform:translateX(.6px)}"],
  };

  /* ═════════ 효과 목록 ═════════ */
  const FX = {
    none: ["없음", null],
    heart: ["💗 하트", ["💗", "💕", "💖"]],
    tintHeart: ["♥ 테마색 하트", ["♥"], true],
    sparkle: ["✨ 반짝이", ["✨", "✦"]],
    tintStar: ["✦ 테마색 별", ["✦", "✧"], true],
    star: ["⭐ 별", ["⭐", "🌟"]],
    flower: ["🌸 꽃", ["🌸", "🌼", "🌷"]],
    tintFlower: ["✿ 테마색 꽃", ["✿", "❀"], true],
    note: ["🎵 음표", ["🎵", "🎶"]],
    letter: ["💌 편지", ["💌", "✉️"]],
    ribbon: ["🎀 리본", ["🎀"]],
    clover: ["🍀 클로버", ["🍀", "☘️"]],
    snow: ["❄️ 눈", ["❄️", "❅"]],
    paw: ["🐾 발자국", ["🐾"]],
    cloud: ["☁️ 구름", ["☁️"]],
    fruit: ["🍓 과일", ["🍓", "🍒", "🍑"]],
    ink: ["잉크 방울", "ink"],
    bubble: ["비눗방울", "bubble"],
    mytext: ["내 이모지", "mytext"],
    myimg: ["내 효과 그림", "myimg"],
  };
  const MOTIONS = {
    pop: "뿅뿅 (위로 톡)",
    rise: "둥실 (천천히 위로)",
    burst: "펑 (사방으로)",
    confetti: "팡파레 (크게 터지기)",
    fall: "팔랑 (아래로)",
    drip: "뚝뚝 (맺혔다 떨어지기)",
    splash: "톡 (튀었다 떨어지기)",
    twinkle: "반짝 (그 자리에서)",
    arc: "퐁퐁 (포물선)",
    spiral: "회오리",
    float: "동동 (옆으로 떠가기)",
  };

  const EVENTS = [
    ["focus", "입력창 누를 때"],
    ["type", "쓸 때"],
    ["delete", "지울 때"],
    ["newline", "줄바꿈 (Shift+Enter)"],
    ["send", "보낼 때"],
    ["paste", "붙여넣을 때"],
  ];

  /* ═════════ 기본 프리셋 (움직임·효과만 바꾸고 그림은 그대로) ═════════ */
  const E = (anim, fx = "none", motion = "pop", count = 2) => ({ anim, fx, motion, count });
  const BUILTIN_PRESETS = [
    ["calm", "차분한 편지", "처음 설정 그대로", { idle: "lift", ev: { focus: E("popin"), type: E("scribble"), delete: E("headshake"), newline: E("nod"), send: E("zoom"), paste: E("pop") } }],
    ["ink", "잉크 뚝뚝", "쓸 때마다 잉크가 떨어져요", { idle: "lift", ev: { focus: E("popin"), type: E("scribble", "ink", "drip", 1), delete: E("shake", "ink", "splash", 2), newline: E("nod", "ink", "drip", 2), send: E("zoom", "ink", "splash", 6), paste: E("pop", "ink", "burst", 4) } }],
    ["heart", "하트 뿅뿅", "하트가 퐁퐁 솟아요", { idle: "heartbeat", ev: { focus: E("popin", "heart", "pop", 3), type: E("hop", "heart", "pop", 2), delete: E("shrink", "tintHeart", "splash", 2), newline: E("bounce", "heart", "rise", 3), send: E("heartbeat", "heart", "confetti", 8), paste: E("jelly", "heart", "burst", 4) } }],
    ["sparkle", "반짝 축제", "반짝이와 별이 터져요", { idle: "glow", ev: { focus: E("flash", "sparkle", "twinkle", 4), type: E("bounce", "sparkle", "twinkle", 2), delete: E("tremble", "tintStar", "twinkle", 2), newline: E("jump", "star", "arc", 3), send: E("spin", "star", "confetti", 10), paste: E("pop", "sparkle", "burst", 5) } }],
    ["quiet", "조용히", "효과 없이 살짝만 움직여요", { idle: "none", ev: { focus: E("none"), type: E("scribble"), delete: E("none"), newline: E("none"), send: E("none"), paste: E("none") } }],
  ];

  /* ═════════ 설정 ═════════ */
  const ev = (anim, fx = "none", motion = "pop", count = 2) => ({ anim, img: null, fx, motion, count });
  const DEFAULTS = {
    on: true,
    img: "pen",            // pen | quill | pencil | g:<그림함 id>
    size: 26,
    anchor: "tip",
    dx: 0,
    dy: 0,
    flip: false,
    hideCaret: false,
    fabHidden: false,
    fabX: -1,
    fabY: -1,
    idleAfter: 1.4,
    appear: "fade",       // 나타나기·사라지기: fade 서서히 | instant 바로
    fadeMs: 200,          // 페이드 시간 (120 짧게 · 200 보통 · 400 길게)
    idle: { anim: "lift", img: null },
    ev: {
      focus: ev("popin"),
      type: ev("scribble"),
      delete: ev("headshake"),
      newline: ev("nod"),
      send: ev("zoom", "none", "burst", 5),
      paste: ev("pop"),
    },
    fxSize: 16,
    myText: "💗✨",
    myImgs: [],            // 그림함 id 목록 (g:...)
  };
  // 프리셋에 담지 않는 것 (이 기기에서만 쓰는 자리 정보)
  const LOCAL_ONLY = ["on", "fabHidden", "fabX", "fabY"];
  const BUILTIN_KEYS = ["pen", "quill", "pencil"];
  const ANCHORS = ["tip", "sit", "float"];
  const isData = (v) => typeof v === "string" && v.startsWith("data:image/");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => (typeof v === "number" && isFinite(v) ? clamp(v, a, b) : d);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ── 그림함 ── */
  let G = [];
  const gmap = new Map();
  const blobUrls = new Map();
  let galleryErr = "";
  const reindex = () => { gmap.clear(); for (const g of G) gmap.set(g.id, g); };
  const loadGallery = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(KEY_G) || "[]");
      G = Array.isArray(arr) ? arr.filter((g) => g && typeof g.id === "string" && isData(g.src)).slice(0, MAX_GALLERY) : [];
    } catch { G = []; }
    reindex();
  };
  // 서버 동기화는 아래에서 이어 붙여요 (불러오는 도중에는 아직 없어요).
  let onLocalSave = () => {};
  const saveGallery = (sync = true) => {
    if (sync) onLocalSave();
    try { localStorage.setItem(KEY_G, JSON.stringify(G)); galleryErr = ""; return true; }
    catch { galleryErr = "그림함이 가득 차서 저장하지 못했어요. 안 쓰는 그림을 몇 장 지워 주세요."; return false; }
  };
  // 그림은 창 안에서 data URL 대신 가벼운 blob 주소로 보여줘요.
  const toBlobUrl = (src) => {
    const i = src.indexOf(",");
    const mime = src.slice(5, src.indexOf(";"));
    const bin = atob(src.slice(i + 1));
    const bytes = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  };
  const gUrl = (id) => {
    const g = gmap.get(id);
    if (!g) return null;
    let u = blobUrls.get(id);
    if (!u) {
      try { u = toBlobUrl(g.src); } catch { u = g.src; }
      blobUrls.set(id, u);
    }
    return u;
  };
  const refId = (ref) => (typeof ref === "string" && ref.startsWith("g:") ? ref.slice(2) : null);
  const refOk = (ref, builtins = true) => (builtins && BUILTIN_KEYS.includes(ref)) || (refId(ref) && gmap.has(refId(ref)));
  const addToGallery = (src) => {
    const same = G.find((g) => g.src === src);
    if (same) return "g:" + same.id;
    if (G.length >= MAX_GALLERY) throw new Error(`그림함에는 ${MAX_GALLERY}장까지 담을 수 있어요.`);
    const g = { id: uid(), src };
    G.push(g);
    gmap.set(g.id, g);
    return "g:" + g.id;
  };

  /* ── 설정 읽기 · 고치기 ── */
  // 어떤 값이 와도 안전한 설정으로 맞춰요 (프리셋 불러오기에도 써요).
  const sanitize = (o, base = DEFAULTS) => {
    const d = clone(base);
    if (!o || typeof o !== "object") return d;
    const bool = (k) => { if (typeof o[k] === "boolean") d[k] = o[k]; };
    ["on", "flip", "hideCaret", "fabHidden"].forEach(bool);
    d.img = refOk(o.img) ? o.img : refOk(d.img) ? d.img : "pen";
    if (ANCHORS.includes(o.anchor)) d.anchor = o.anchor;
    d.size = num(o.size, d.size, 12, 96);
    d.dx = num(o.dx, d.dx, -40, 40);
    d.dy = num(o.dy, d.dy, -40, 40);
    d.fabX = num(o.fabX, d.fabX, -1, 10000);
    d.fabY = num(o.fabY, d.fabY, -1, 10000);
    d.idleAfter = num(o.idleAfter, d.idleAfter, 0.3, 6);
    if (["fade", "instant"].includes(o.appear)) d.appear = o.appear;
    if ([120, 200, 400].includes(o.fadeMs)) d.fadeMs = o.fadeMs;
    if (o.idle && typeof o.idle === "object") {
      if (o.idle.anim in LOOPS) d.idle.anim = o.idle.anim;
      d.idle.img = refOk(o.idle.img) ? o.idle.img : null;
    }
    for (const [k] of EVENTS) {
      const s = o.ev?.[k];
      if (!s || typeof s !== "object") continue;
      if (s.anim in ACTS) d.ev[k].anim = s.anim;
      d.ev[k].img = refOk(s.img) ? s.img : null;
      if (s.fx in FX) d.ev[k].fx = s.fx;
      if (s.motion in MOTIONS) d.ev[k].motion = s.motion;
      d.ev[k].count = num(s.count, d.ev[k].count, 1, 10);
    }
    d.fxSize = num(o.fxSize, d.fxSize, 8, 48);
    if (typeof o.myText === "string") d.myText = o.myText.slice(0, 40);
    if (Array.isArray(o.myImgs)) d.myImgs = [...new Set(o.myImgs.filter((r) => refOk(r, false)))].slice(0, 12);
    return d;
  };

  // 2.x에서 쓰던 설정을 옮겨와요 (그림은 그림함으로).
  const migrate = () => {
    let o;
    try { o = JSON.parse(localStorage.getItem(OLD_KEY) || "null"); } catch { o = null; }
    if (!o || typeof o !== "object") return null;
    const put = (src) => { try { return isData(src) ? addToGallery(src) : null; } catch { return null; } };
    const n = clone(o);
    const custom = put(o.custom);
    n.img = o.img === "custom" ? custom || "pen" : o.img;
    if (n.idle) n.idle.img = put(o.idle?.img);
    for (const [k] of EVENTS) if (n.ev?.[k]) n.ev[k].img = put(o.ev?.[k]?.img);
    n.myImgs = (Array.isArray(o.myImgs) ? o.myImgs : []).map(put).filter(Boolean);
    return n;
  };

  loadGallery();
  let S;
  {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
    if (!o) {
      o = migrate();
      if (o && saveGallery()) {
        S = sanitize(o);
        try { localStorage.setItem(KEY, JSON.stringify(S)); localStorage.removeItem(OLD_KEY); } catch {}
      }
    }
    if (!S) S = sanitize(o);
  }

  /* ── 프리셋 ── */
  let P = [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY_P) || "[]");
    P = Array.isArray(arr) ? arr.filter((p) => p && typeof p.id === "string" && typeof p.name === "string" && p.data && typeof p.data === "object").slice(0, MAX_PRESETS) : [];
  } catch { P = []; }
  let presetErr = "";
  const savePresets = (sync = true) => {
    if (sync) onLocalSave();
    try { localStorage.setItem(KEY_P, JSON.stringify(P)); presetErr = ""; }
    catch { presetErr = "프리셋을 저장하지 못했어요."; }
  };
  const lookOf = (s) => {
    const o = clone(s);
    for (const k of LOCAL_ONLY) delete o[k];
    return o;
  };
  // 처음 설정과 다른 것만 남겨서 서버 공간을 아껴요. 불러올 때는 sanitize가 빈 곳을 처음 설정으로 채워요.
  const BASE_LOOK = lookOf(DEFAULTS);
  const compact = (o, base) => {
    const out = {};
    for (const [k, v] of Object.entries(o)) {
      const b = base ? base[k] : undefined;
      if (v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object" && !Array.isArray(b)) {
        const c = compact(v, b);
        if (Object.keys(c).length) out[k] = c;
      } else if (JSON.stringify(v) !== JSON.stringify(b)) {
        out[k] = v;
      }
    }
    return out;
  };
  const packLook = (st) => compact(lookOf(st), BASE_LOOK);
  // 예전에 통째로 저장한 프리셋도 작게 줄여 둬요.
  P = P.map((p) => ({ ...p, data: packLook(sanitize(p.data)) }));

  let saveErr = "";
  let saveT = 0;
  const saveNow = (sync = true) => {
    clearTimeout(saveT);
    saveT = 0;
    if (sync) onLocalSave();
    try { localStorage.setItem(KEY, JSON.stringify(S)); saveErr = ""; }
    catch { saveErr = "설정을 저장하지 못했어요."; }
  };
  // 슬라이더를 끄는 동안은 모아 두었다가 한 번에 저장해요.
  const save = () => { clearTimeout(saveT); saveT = setTimeout(saveNow, 400); };

  /* ═════════ 기본 그림 (촉 끝이 왼쪽 아래) ═════════ */
  const PEN = `<svg viewBox="0 0 26 26"><g transform="translate(2 24) rotate(-45)">
<g class="kb-edge"><path d="M0 0L9 -3.1L11 -3.1L11 3.1L9 3.1Z"/><rect x="11" y="-3.5" width="5" height="7" rx="1"/><rect x="16" y="-3.9" width="15.7" height="7.8" rx="3.6"/></g>
<path class="kb-gold" d="M0 0L9 -3.1L11 -3.1L11 3.1L9 3.1Z"/><path class="kb-line" d="M1.2 0H7.6"/>
<rect class="kb-dark" x="11" y="-3.5" width="5" height="7" rx="1"/><rect class="kb-accent" x="16" y="-3.9" width="1.7" height="7.8"/>
<rect class="kb-body" x="17.7" y="-3.9" width="14" height="7.8" rx="3.6"/></g></svg>`;
  const QUILL = `<svg viewBox="0 0 26 26">
<path class="kb-edge" d="M2.5 23.5L6 19M5 20.5C8 12 14 5 24.5 1.5C22.5 9 17 16 7.5 19.5Z"/>
<path class="kb-paper" d="M5 20.5C8 12 14 5 24.5 1.5C22.5 9 17 16 7.5 19.5Z"/>
<path class="kb-line" d="M3 23L22 4M9.5 14.5L13 13.6M12 11.4L16 10.6M15 8.4L19 7.6M8 17.2L11 16.6"/>
<path class="kb-dark" d="M2 24L3.6 19.8L6 22.1Z"/></svg>`;
  const PENCIL = `<svg viewBox="0 0 26 26"><g transform="translate(2 24) rotate(-45)">
<g class="kb-edge"><path d="M0 0L8 -3.4L8 3.4Z"/><rect x="8" y="-3.4" width="21.7" height="6.8" rx="1.4"/></g>
<path class="kb-wood" d="M0 0L8 -3.4L8 3.4Z"/><path class="kb-dark" d="M0 0L2.8 -1.2L2.8 1.2Z"/>
<rect class="kb-yellow" x="8" y="-3.4" width="16" height="6.8"/><path class="kb-line" d="M8 0H24"/>
<rect class="kb-metal" x="24" y="-3.4" width="2.2" height="6.8"/><rect class="kb-accent" x="26.2" y="-3.4" width="3.5" height="6.8" rx="1.4"/></g></svg>`;
  const BUILTIN = { pen: PEN, quill: QUILL, pencil: PENCIL };
  const BUILTIN_NAMES = { pen: "만년필", quill: "깃펜", pencil: "연필" };
  const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l3.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20z"/><path d="M13 7l3 3"/><path d="M19 15.5v3M17.5 17h3"/></svg>`;

  /* ═════════ 스타일 ═════════ */
  const kf = (prefix, map) => Object.entries(map).filter(([, v]) => v[2]).map(([k, v]) => `@keyframes kb-${prefix}-${k}{${v[2]}}`).join("\n");
  const style = document.createElement("style");
  style.id = "kkj-buddy-style";
  style.textContent = `
#kb{position:fixed;left:0;top:0;z-index:2147482000;pointer-events:none;opacity:0;visibility:hidden;will-change:transform;
  transition:opacity var(--kb-fade,.2s) ease,visibility 0s linear var(--kb-fade,.2s);contain:layout style}
#kb.kb-on{opacity:1;visibility:visible;transition:opacity var(--kb-fade,.2s) ease}
#kb:not(.kb-on) :is(.kb-idle,.kb-act){animation-play-state:paused}
.kb-pos{position:absolute;left:0;top:0}
.kb-idle,.kb-act{transform-origin:var(--kb-origin,0 100%)}
.kb-idle{transition:transform .35s cubic-bezier(.3,1.4,.5,1)}
.kb-art{display:block;line-height:0}
.kb-art.kb-flip{transform:scaleX(-1)}
.kb-art svg,.kb-art img{display:block;width:var(--kb-size,26px);height:auto;max-width:none;overflow:visible}
.kb-art img{max-height:calc(var(--kb-size,26px) * 2.5);object-fit:contain}
${kf("x", ACTS)}
${kf("y", ACTS)}
${kf("l", LOOPS)}
@media (prefers-reduced-motion: reduce){.kb-act,.kb-idle{animation:none!important}}

.kb-art .kb-edge,.kb-art .kb-edge *{fill:none;stroke:var(--kb-edge,rgba(255,250,242,.9));stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round}
.kb-art .kb-body{fill:var(--kb-body,#4a3a36)}
.kb-art .kb-dark{fill:var(--kb-dark,#2f2523)}
.kb-art .kb-accent{fill:var(--lt-seal,var(--primary,#c78c85))}
.kb-art .kb-gold{fill:#caa45f}
.kb-art .kb-paper{fill:var(--kb-paper,#f6efe4)}
.kb-art .kb-wood{fill:#e8cfa6}
.kb-art .kb-yellow{fill:#e9c46a}
.kb-art .kb-metal{fill:#b9b2a6}
.kb-art .kb-line{fill:none;stroke:var(--kb-dark,#2f2523);stroke-width:.7;stroke-linecap:round;opacity:.75}
:root[data-theme="dark"]{--kb-body:#eadccb;--kb-dark:#7d6c5f;--kb-paper:#efe6d8;--kb-edge:rgba(20,16,15,.85)}

.kb-fx{position:fixed;inset:0;z-index:2147482001;pointer-events:none;overflow:hidden;contain:strict}
.kb-p{position:absolute;left:0;top:0;line-height:1;white-space:nowrap}
.kb-p.kb-tint{color:var(--lt-seal,var(--primary,#c78c85))}
.kb-p img{display:block;width:1em;height:1em;max-width:none;object-fit:contain}
.kb-p.kb-ink{width:.32em;height:.32em;border-radius:50%;background:var(--kb-body,#4a3a36);opacity:.75}
.kb-p.kb-bubble{width:.7em;height:.7em;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--primary,#9ec5e8) 70%,#fff);
  background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.9) 0 18%,transparent 22%),color-mix(in srgb,var(--primary,#9ec5e8) 12%,transparent)}
:root.kb-hidecaret ${SEL}:focus{caret-color:transparent!important}
.kb-mirror{position:fixed;left:-9999px;top:0;visibility:hidden;white-space:pre-wrap;overflow-wrap:break-word;overflow:hidden;contain:layout paint style}

/* 떠 있는 버튼 */
.kb-fab{position:fixed;z-index:2147482002;width:38px;height:38px;border-radius:50%;padding:0;touch-action:none;
  border:1px solid var(--border,#e6d6c4);background:var(--card,#fffaf2);color:var(--lt-seal,var(--primary,#b8726b));
  display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px -2px rgba(60,35,25,.25);
  transition:transform .15s ease, box-shadow .15s ease;cursor:grab}
.kb-fab:hover{transform:scale(1.07)}
.kb-fab.kb-drag{cursor:grabbing;transform:scale(1.12);box-shadow:0 8px 20px -4px rgba(60,35,25,.35)}
.kb-fab[aria-pressed="true"]{background:var(--lt-seal,var(--primary,#b8726b));color:#fff}
.kb-fab svg{width:19px;height:19px}
.kb-fab[hidden]{display:none}

/* 꾸미기 창 */
.kb-panel{position:fixed;top:12px;z-index:2147482003;width:min(360px,calc(100vw - 24px));
  max-height:calc(100vh - 24px);display:flex;flex-direction:column;border-radius:16px;
  background:var(--popover,#fffaf2);color:var(--popover-foreground,#3a2c27);
  border:1px solid var(--border,#e6d6c4);box-shadow:0 14px 36px -10px rgba(60,35,25,.35);
  font-size:13px;line-height:1.4}
.kb-panel[hidden]{display:none}
.kb-top{padding:12px 14px 0;flex:none}
.kb-body-scroll{overflow-y:auto;overflow-x:hidden;padding:0 14px 14px;flex:1;min-height:0}
.kb-panel h3{margin:0;font-size:14px;font-weight:700}
.kb-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.kb-x{width:26px;height:26px;border-radius:8px;border:0;background:transparent;color:inherit;font-size:16px;line-height:1}
.kb-x:hover{background:var(--secondary,#f3e9dd)}
.kb-preview{position:relative;height:70px;border-radius:10px;overflow:hidden;
  background:var(--card,#fffdf8);border:1px dashed var(--border,#e6d6c4);
  background-image:linear-gradient(to bottom,transparent calc(100% - 1px),var(--lt-rule,rgba(176,128,100,.2)) 0);
  background-size:100% 22px;background-position:0 14px}
.kb-preview-text{position:absolute;left:14px;top:34px;font-size:14px;line-height:22px;white-space:nowrap}
.kb-preview-text i{display:inline-block;width:1.5px;height:16px;margin-left:1px;vertical-align:-3px;
  background:var(--lt-seal,var(--primary,#c78c85))}
.kb-preview-tag{position:absolute;right:8px;top:6px;font-size:10.5px;opacity:.6}
.kb-preview .kb-buddy{position:absolute;left:0;top:0;transition:opacity var(--kb-fade,.2s) ease}
.kb-preview .kb-buddy.kb-gone{opacity:0}
.kb-tabs{display:flex;gap:0;margin:10px 0 0;border-bottom:1px solid var(--border,#e6d6c4)}
.kb-tab{flex:1;border:0;background:transparent;color:inherit;padding:7px 0 8px;font-size:12px;font-weight:600;
  opacity:.6;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.kb-tab[aria-selected="true"]{opacity:1;border-bottom-color:var(--lt-seal,var(--primary,#c78c85))}
.kb-row{margin:12px 0 0}
.kb-label{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:12px;margin-bottom:5px;opacity:.85}
.kb-chips{display:flex;flex-wrap:wrap;gap:5px}
.kb-chip{border:1px solid var(--border,#e6d6c4);background:transparent;color:inherit;border-radius:999px;
  padding:3px 10px;font-size:12px;line-height:1.5;display:inline-flex;align-items:center;gap:4px}
.kb-chip:hover{background:var(--secondary,#f3e9dd)}
.kb-chip[aria-pressed="true"]{background:var(--lt-seal,var(--primary,#c78c85));border-color:transparent;color:#fff}
.kb-chip.kb-strong{background:var(--lt-seal,var(--primary,#c78c85));border-color:transparent;color:#fff}
.kb-mini{padding:2px 8px;font-size:11px}
.kb-panel input[type=range]{width:100%;accent-color:var(--lt-seal,var(--primary,#c78c85))}
.kb-check{display:flex;align-items:center;gap:7px;margin-top:9px;font-size:12.5px}
.kb-check input{accent-color:var(--lt-seal,var(--primary,#c78c85))}
.kb-select{flex:1;min-width:0;padding:4px 6px;border-radius:8px;border:1px solid var(--border,#e6d6c4);
  background:var(--card,#fff);color:inherit;font-size:12px}
.kb-text{width:100%;padding:5px 8px;border-radius:8px;border:1px solid var(--border,#e6d6c4);
  background:var(--card,#fff);color:inherit;font-size:13px;box-sizing:border-box}
.kb-card{margin-top:10px;padding:9px 10px;border-radius:11px;background:color-mix(in srgb,var(--secondary,#f3e9dd) 55%,transparent)}
.kb-card-head{display:flex;align-items:center;justify-content:space-between;gap:6px;font-weight:700;font-size:12.5px;margin-bottom:6px}
.kb-card-head small{font-weight:400;opacity:.65;font-size:11px}
.kb-line2{display:flex;gap:6px;align-items:center;margin-top:5px}
.kb-line2 > span{font-size:11.5px;opacity:.7;flex:none;width:3.6em}
.kb-play{border:0;background:var(--lt-seal,var(--primary,#c78c85));color:#fff;border-radius:999px;
  width:24px;height:24px;font-size:10px;flex:none;line-height:1}
.kb-panel .kb-count{flex:1;width:auto;min-width:0}
.kb-note{font-size:11.5px;opacity:.7;margin-top:6px}
.kb-err{font-size:11.5px;color:var(--destructive,#b04a3c);margin-top:6px}
.kb-ok{font-size:11.5px;margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.kb-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:16px;font-size:11px;opacity:.9}
.kb-sync-err{color:var(--destructive,#b04a3c)}

/* 그림 고르기 */
.kb-pick{display:flex;flex-wrap:wrap;gap:5px}
.kb-pick.kb-strip{flex-wrap:nowrap;overflow-x:auto;padding-bottom:3px;flex:1;min-width:0}
.kb-th{position:relative;flex:none;width:36px;height:36px;padding:3px;border-radius:9px;line-height:0;
  border:1px solid var(--border,#e6d6c4);background:var(--card,#fff);color:inherit;
  display:inline-flex;align-items:center;justify-content:center;font-size:11px}
.kb-strip .kb-th{width:30px;height:30px;padding:2px}
.kb-th img{width:100%;height:100%;max-width:none;object-fit:contain}
.kb-th .kb-art{--kb-size:22px}
.kb-th[aria-pressed="true"]{outline:2px solid var(--lt-seal,var(--primary,#c78c85));outline-offset:1px}
.kb-th.kb-txt{width:auto;padding:0 8px;line-height:1.2}
.kb-th.kb-add{font-size:16px;line-height:1;opacity:.75}
.kb-th .kb-del{position:absolute;right:-6px;top:-6px;width:17px;height:17px;border-radius:50%;border:0;padding:0;
  background:var(--destructive,#b04a3c);color:#fff;font-size:11px;line-height:17px;display:none}
.kb-gal .kb-th:hover .kb-del,.kb-gal .kb-th:focus-within .kb-del{display:block}
.kb-gal.kb-editing .kb-del{display:block}

/* 프리셋 */
.kb-preset{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:10px;margin-top:6px;
  background:color-mix(in srgb,var(--secondary,#f3e9dd) 55%,transparent)}
.kb-preset b{font-size:12.5px}
.kb-preset .kb-desc{flex:1;min-width:0;font-size:11px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kb-preset .kb-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;
  document.head.appendChild(style);
  document.getElementById("kkj-buddy-cursor")?.remove();
  root.classList.remove("kb-cur");

  /* ═════════ 친구 (본체와 미리보기 공용) ═════════ */
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const cancel = (t) => { clearTimeout(t); timers.delete(t); };

  class Buddy {
    constructor(id) {
      this.el = document.createElement("div");
      this.el.className = "kb-buddy";
      if (id) this.el.id = id;
      this.el.setAttribute("aria-hidden", "true");
      this.el.innerHTML = `<div class="kb-pos"><div class="kb-idle"><div class="kb-act"><div class="kb-art"></div></div></div></div>`;
      this.pos = this.el.querySelector(".kb-pos");
      this.idleEl = this.el.querySelector(".kb-idle");
      this.act = this.el.querySelector(".kb-act");
      this.art = this.el.querySelector(".kb-art");
      this.face = "idle";
      this.lastInput = 0;
      this.restT = 0;
      this.backT = 0;
      this.resting = false;
      this.alt = false;
      this.idleName = "";
      this.artKey = "";
    }
    refFor(face) {
      const r = face === "idle" ? S.idle.img : S.ev[face]?.img;
      if (r && refOk(r)) return r;
      if (face !== "idle" && face !== "type" && S.ev.type.img && refOk(S.ev.type.img) && performance.now() - this.lastInput < S.idleAfter * 1000) return S.ev.type.img;
      return refOk(S.img) ? S.img : "pen";
    }
    setFace(face) {
      this.face = face;
      const ref = this.refFor(face);
      const id = refId(ref);
      const key = id ? ref + ":" + (gmap.get(id)?.src.length || 0) : ref;
      if (this.artKey === key) return;
      this.artKey = key;
      if (id) {
        const img = new Image();
        img.alt = "";
        img.decoding = "async";
        img.src = gUrl(id);
        this.art.replaceChildren(img);
      } else {
        this.art.innerHTML = BUILTIN[ref] || PEN;
      }
    }
    paint() {
      this.setFace(this.face);
      this.art.classList.toggle("kb-flip", S.flip);
      this.el.style.setProperty("--kb-size", S.size + "px");
      const ax = S.anchor === "float" ? "-50%" : "0px";
      this.pos.style.transform = `translate(calc(${ax} + ${S.dx}px), calc(-100% + ${S.dy}px))`;
      this.el.style.setProperty("--kb-origin", S.anchor === "tip" ? "0 100%" : "50% 100%");
      this.el.style.setProperty("--kb-fade", S.appear === "fade" ? S.fadeMs + "ms" : "0ms");
      if (this.resting) { this.idleName = ""; this.rest(); }
    }
    origin(o) {
      if (o === "c") return "50% 50%";
      if (o === "t") return S.anchor === "tip" ? "0 0" : "50% 0";
      return "";
    }
    // 같은 움직임을 다시 틀 때 이름을 x/y로 번갈아 바꿔서, 화면을 다시 계산하지 않고 처음부터 재생해요.
    runAct(name) {
      const a = ACTS[name];
      if (!a || !a[1] || reduce.matches) {
        this.act.style.animation = "";
        return 0;
      }
      this.alt = !this.alt;
      this.act.style.transformOrigin = this.origin(a[3]);
      this.act.style.animation = `kb-${this.alt ? "x" : "y"}-${name} ${a[1]}ms ease-in-out`;
      return a[1];
    }
    stopIdle() {
      if (!this.resting) return;
      this.resting = false;
      this.idleName = "";
      this.idleEl.style.animation = "";
      this.idleEl.style.transform = "";
    }
    rest() {
      this.resting = true;
      this.setFace("idle");
      const name = S.idle.anim;
      if (this.idleName === name) return;
      this.idleName = name;
      const l = LOOPS[name];
      this.idleEl.style.transformOrigin = this.origin(l?.[3]);
      this.idleEl.style.transform = name === "lift" ? (S.anchor === "tip" ? "translate(2px,-5px) rotate(10deg)" : "translateY(-4px)") : "";
      this.idleEl.style.animation = l && l[1] && !reduce.matches ? `kb-l-${name} ${l[1]}ms ease-in-out infinite` : "";
    }
    play(evName) {
      const cfg = S.ev[evName];
      if (!cfg) return;
      if (evName === "type" || evName === "delete" || evName === "paste") this.lastInput = performance.now();
      this.stopIdle();
      this.setFace(evName);
      // '바로'는 투명→보임으로 커지는 등장 움직임 없이 그 자리에 툭 나타나요.
      const quiet = evName === "focus" && S.appear === "instant";
      if (quiet) this.act.style.animation = "";
      const dur = quiet ? 0 : this.runAct(cfg.anim);
      cancel(this.backT);
      cancel(this.restT);
      const idleMs = S.idleAfter * 1000;
      if (evName !== "type") {
        this.backT = later(() => {
          if (performance.now() - this.lastInput < idleMs) this.setFace("type");
        }, Math.max(dur, 500) + 150);
      }
      const typing = evName === "type" || evName === "delete" || evName === "paste";
      this.restT = later(() => this.rest(), Math.max(dur + 200, typing ? idleMs : 900));
    }
  }

  /* ═════════ 효과 ═════════ */
  const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("ko", { granularity: "grapheme" }) : null;
  const graphemes = (s) => (seg ? [...seg.segment(s)].map((x) => x.segment) : [...s]).filter((g) => g.trim());
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // 효과는 화면 전체를 덮는 한 겹 위에서만 움직여서 채팅 화면 배치를 다시 계산하지 않게 해요.
  const MAX_LIVE = 40;
  let live = 0;
  const lastFx = {};
  const fxLayer = document.createElement("div");
  fxLayer.className = "kb-fx";
  fxLayer.setAttribute("aria-hidden", "true");

  const makeParticle = (fxKey) => {
    const def = FX[fxKey];
    if (!def || !def[1]) return null;
    const p = document.createElement("span");
    p.className = "kb-p";
    p.style.fontSize = S.fxSize + "px";
    const src = def[1];
    if (src === "ink") p.classList.add("kb-ink");
    else if (src === "bubble") p.classList.add("kb-bubble");
    else if (src === "mytext") {
      const g = graphemes(S.myText || "");
      if (!g.length) return null;
      p.textContent = pick(g);
    } else if (src === "myimg") {
      const ids = S.myImgs.map(refId).filter((id) => gmap.has(id));
      if (!ids.length) return null;
      const img = new Image();
      img.alt = "";
      img.src = gUrl(pick(ids));
      p.appendChild(img);
    } else {
      p.textContent = pick(src);
      if (def[2]) p.classList.add("kb-tint");
    }
    return p;
  };

  // [키프레임, 길이(ms), 속도 곡선, 여러 개일 때 간격(ms)]
  const path = (motion, x, y) => {
    const T = (dx, dy, s = 1, r = 0) => `translate(${(x + dx).toFixed(1)}px, ${(y + dy).toFixed(1)}px) translate(-50%,-50%) scale(${Array.isArray(s) ? s.join(",") : s}) rotate(${r}deg)`;
    const side = rnd(-1, 1);
    switch (motion) {
      case "drip": { // 펜촉에 맺혔다가 뚝 떨어져서 톡 퍼져요
        const ox = rnd(-1.5, 1.5);
        const h = rnd(30, 48);
        const fall = "cubic-bezier(.55,0,1,.6)";
        return [[
          { transform: T(ox, 6, [0.3, 0.3]), opacity: 0 },
          { transform: T(ox, 7, [1, 0.9]), opacity: 1, offset: 0.18 },
          { transform: T(ox, 9, [0.85, 1.3]), opacity: 1, offset: 0.4, easing: fall },
          { transform: T(ox, 6 + h, [0.75, 1.45]), opacity: 1, offset: 0.82 },
          { transform: T(ox, 8 + h, [1.7, 0.45]), opacity: 0.8, offset: 0.9 },
          { transform: T(ox, 8 + h, [2, 0.3]), opacity: 0 },
        ], rnd(900, 1150), "linear", 260];
      }
      case "splash": { // 톡 튀었다가 떨어져요
        const dx = rnd(8, 22) * (side < 0 ? -1 : 1);
        const up = rnd(8, 16);
        const down = rnd(26, 40);
        return [[
          { transform: T(0, 4, 0.5), opacity: 0 },
          { transform: T(dx * 0.35, 4 - up, 1), opacity: 1, offset: 0.3, easing: "cubic-bezier(.4,0,1,1)" },
          { transform: T(dx, 4 + down, [0.8, 1.2]), opacity: 1, offset: 0.88 },
          { transform: T(dx, 6 + down, [1.5, 0.4]), opacity: 0 },
        ], rnd(800, 1000), "cubic-bezier(.2,.6,.4,1)", 70];
      }
      case "rise": {
        const h = rnd(40, 70);
        const w = rnd(4, 9) * (side < 0 ? -1 : 1);
        return [[
          { transform: T(0, -6, 0.4), opacity: 0 },
          { transform: T(w, -h * 0.3, 1), opacity: 1, offset: 0.2 },
          { transform: T(-w, -h * 0.65, 1), opacity: 0.9 },
          { transform: T(w * 0.5, -h, 0.8), opacity: 0 },
        ], rnd(1300, 1700)];
      }
      case "burst": {
        const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05);
        const d = rnd(18, 36);
        return [[
          { transform: T(0, -4, 0.3), opacity: 1 },
          { transform: T(Math.cos(a) * d, Math.sin(a) * d - 4, 1, rnd(-30, 30)), opacity: 1, offset: 0.55 },
          { transform: T(Math.cos(a) * d * 1.25, Math.sin(a) * d * 1.25, 0.7), opacity: 0 },
        ], rnd(600, 800)];
      }
      case "confetti": {
        const a = rnd(-Math.PI, 0);
        const d = rnd(30, 62);
        const ex = Math.cos(a) * d;
        const ey = Math.sin(a) * d - 8;
        return [[
          { transform: T(0, -4, 0.4, 0), opacity: 1 },
          { transform: T(ex, ey, 1.1, rnd(-200, 200)), opacity: 1, offset: 0.45 },
          { transform: T(ex * 1.15, ey + 28, 0.9, rnd(-400, 400)), opacity: 0 },
        ], rnd(1000, 1300)];
      }
      case "fall": {
        const w = rnd(6, 12) * (side < 0 ? -1 : 1);
        return [[
          { transform: T(0, -10, 0.6, 0), opacity: 0 },
          { transform: T(w, 4, 1, 20), opacity: 1, offset: 0.25 },
          { transform: T(-w, 22, 1, -15), opacity: 0.9 },
          { transform: T(w * 0.6, 42, 0.8, 25), opacity: 0 },
        ], rnd(1200, 1600)];
      }
      case "twinkle": {
        const ox = rnd(-14, 14);
        const oy = rnd(-18, 4);
        return [[
          { transform: T(ox, oy, 0, 0), opacity: 0 },
          { transform: T(ox, oy, 1.25, 45), opacity: 1, offset: 0.45 },
          { transform: T(ox, oy, 0, 90), opacity: 0 },
        ], rnd(550, 750)];
      }
      case "arc": {
        const dx = rnd(18, 40) * (side < 0 ? -1 : 1);
        return [[
          { transform: T(0, -4, 0.5), opacity: 1 },
          { transform: T(dx * 0.5, -rnd(22, 32), 1, dx * 2), opacity: 1, offset: 0.45 },
          { transform: T(dx, 8, 0.8, dx * 4), opacity: 0 },
        ], rnd(750, 950)];
      }
      case "spiral": {
        const dir = side < 0 ? -1 : 1;
        const fr = [];
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const ang = t * Math.PI * 2.4 * dir;
          const r = 4 + t * 14;
          fr.push({ transform: T(Math.cos(ang) * r, -t * 46 + Math.sin(ang) * r * 0.4, 0.5 + t * 0.6, t * 180 * dir), opacity: i === 0 || i === 6 ? 0 : 1 });
        }
        return [fr, rnd(1100, 1400)];
      }
      case "float": {
        const dir = side < 0 ? -1 : 1;
        const d = rnd(40, 70) * dir;
        return [[
          { transform: T(0, -6, 0.5), opacity: 0 },
          { transform: T(d * 0.3, -14, 1), opacity: 1, offset: 0.25 },
          { transform: T(d * 0.65, -8, 1), opacity: 1 },
          { transform: T(d, -16, 0.8), opacity: 0 },
        ], rnd(1300, 1700)];
      }
      default: { // pop
        const dx = rnd(-10, 10);
        return [[
          { transform: T(0, -2, 0.4), opacity: 0 },
          { transform: T(dx, -16, 1.05), opacity: 1, offset: 0.3 },
          { transform: T(dx * 1.4, -32, 0.8), opacity: 0 },
        ], rnd(700, 900)];
      }
    }
  };

  const emit = (evName, x, y) => {
    const cfg = S.ev[evName];
    if (!cfg || cfg.fx === "none" || reduce.matches) return;
    const now = performance.now();
    if (evName === "type" || evName === "delete") {
      if (now - (lastFx[evName] || 0) < 110) return;
    }
    lastFx[evName] = now;
    if (document.hidden) return;
    if (!fxLayer.isConnected) document.body.appendChild(fxLayer);
    const n = Math.min(cfg.count, MAX_LIVE - live);
    for (let i = 0; i < n; i++) {
      const p = makeParticle(cfg.fx);
      if (!p) return;
      const [frames, dur, easing, gap] = path(cfg.motion, x, y);
      p.style.transform = frames[0].transform;
      p.style.opacity = "0";
      fxLayer.appendChild(p);
      live++;
      const anim = p.animate(frames, { duration: dur, delay: i * (gap || 45), easing: easing || "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
      const done = () => { p.remove(); live--; };
      anim.onfinish = done;
      anim.oncancel = done;
    }
  };

  /* ═════════ 입력창 커서 위치 ═════════ */
  const mirror = document.createElement("div");
  mirror.className = "kb-mirror";
  document.body.appendChild(mirror);
  const marker = document.createElement("span");
  const COPY = ["boxSizing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderStyle",
    "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontStretch", "fontVariantLigatures",
    "letterSpacing", "lineHeight", "textTransform", "wordSpacing", "textIndent", "tabSize", "wordBreak"];
  // 글자 모양은 입력창이 바뀌거나 크기가 바뀔 때만 다시 베껴요.
  let mirrorFor = null;
  let fs = 16;
  let lh = 22;
  let caretKey = "";
  let caretOff = null;
  let mirrorW = -1;
  let borderX = 0;
  const syncMirror = (t) => {
    const cs = getComputedStyle(t);
    for (const k of COPY) mirror.style[k] = cs[k];
    fs = parseFloat(cs.fontSize) || 16;
    lh = parseFloat(cs.lineHeight) || fs * 1.4;
    borderX = (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
    mirrorFor = t;
    mirrorW = -1;
  };
  const caretPoint = (t) => {
    if (mirrorFor !== t) syncMirror(t);
    // 줄이 늘어 스크롤바가 생기면 글이 들어갈 폭이 줄어들어요. 그 폭에 거울을 맞춰요.
    const w = t.clientWidth;
    if (w !== mirrorW) {
      mirrorW = w;
      mirror.style.width = w + borderX + "px";
      caretKey = "";
    }
    const pos = t.selectionEnd;
    const v = t.value;
    // 같은 글, 같은 자리면 거울을 다시 그리지 않아요.
    const key = pos + "|" + v.length + "|" + v.slice(Math.max(0, pos - 24), pos + 8);
    if (key !== caretKey) {
      caretKey = key;
      mirror.textContent = v.slice(0, pos);
      // 커서 뒤 글은 줄바꿈 계산에 필요한 한 단어만
      marker.textContent = (v.slice(pos).match(/^[^\s]*/) || [""])[0] || ".";
      mirror.appendChild(marker);
      caretOff = { l: marker.offsetLeft, t: marker.offsetTop };
    }
    const r = t.getBoundingClientRect();
    const x = r.left + caretOff.l - t.scrollLeft;
    const top = r.top + caretOff.t - t.scrollTop;
    const base = top + (lh + fs) / 2 - fs * 0.12;
    return { x, base, top, lh, r };
  };
  const anchorPoint = (x, base, top) => {
    if (S.anchor === "sit") return [x + 4, base + 2];
    if (S.anchor === "float") return [x, top - 2];
    return [x + 1, base];
  };

  const main = new Buddy("kb");
  document.body.appendChild(main.el);
  main.paint();
  main.rest();

  let ta = null;
  let raf = 0;
  let last = null;
  let shown = false;
  let lastPos = "";
  let pendingFx = [];
  let composing = false;
  const hide = () => {
    pendingFx = [];
    if (!shown) return;
    shown = false;
    main.el.classList.remove("kb-on");
  };
  const place = () => {
    raf = 0;
    if (!S.on || !ta || document.activeElement !== ta || !ta.isConnected) return hide();
    // 한글을 조합하는 동안에는 조합 중인 글자가 선택된 것처럼 보일 수 있어서, 그땐 숨기지 않아요.
    if (ta.selectionStart !== ta.selectionEnd && !composing) return hide();
    const p = caretPoint(ta);
    if (p.r.height < 1) return hide();
    // 줄바꿈 직후 입력창 높이가 아직 안 늘어났을 때도 사라지지 않게, 입력창 안쪽으로 붙잡아 둬요.
    const minTop = p.r.top;
    const maxTop = Math.max(minTop, p.r.bottom - p.lh);
    if (p.top < minTop || p.top > maxTop) {
      const d = Math.min(maxTop, Math.max(minTop, p.top)) - p.top;
      p.top += d;
      p.base += d;
    }
    const [x, y] = anchorPoint(p.x, p.base, p.top);
    last = { x: p.x, y: p.base - p.lh * 0.35 };
    const tf = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    if (tf !== lastPos) { lastPos = tf; main.el.style.transform = tf; }
    if (!shown) { shown = true; main.el.classList.add("kb-on"); }
    if (pendingFx.length) {
      const list = pendingFx;
      pendingFx = [];
      for (const n of list) emit(n, last.x, last.y);
    }
  };
  // 입력창에 있을 때만 위치를 다시 계산해요.
  const active = () => ta && document.activeElement === ta;
  const schedule = () => { if (!raf && active()) raf = requestAnimationFrame(place); };
  const fire = (evName, now = false) => {
    if (!S.on) return;
    main.play(evName);
    if (now) {
      // 보낼 때는 글이 지워지기 전 자리에서 바로 터뜨려요.
      cancelAnimationFrame(raf);
      place();
      if (last) emit(evName, last.x, last.y);
      return;
    }
    if (!pendingFx.includes(evName)) pendingFx.push(evName);
    schedule();
  };

  const onFocusIn = (e) => {
    if (!(e.target instanceof HTMLTextAreaElement) || !e.target.matches(SEL)) return;
    if (ta !== e.target) {
      ta = e.target;
      mirrorFor = null;
      ro.disconnect();
      ro.observe(ta);
    }
    fire("focus");
  };
  const onFocusOut = (e) => { if (e.target === ta) { composing = false; hide(); } };
  const onCompose = (e) => {
    if (e.target !== ta) return;
    composing = e.type !== "compositionend";
    schedule();
  };
  const onInput = (e) => {
    if (e.target !== ta) return;
    const t = e.inputType || "";
    // 줄바꿈은 키가 아니라 실제로 줄이 들어갔을 때 알아채요 (한글 조합 중 Shift+Enter도 잡혀요).
    if (t === "insertLineBreak" || t === "insertParagraph") fire("newline");
    else if (t.startsWith("delete")) fire("delete");
    else if (t === "insertFromPaste" || t === "insertFromDrop") fire("paste");
    else fire("type");
  };
  const onKeyDown = (e) => {
    if (e.altKey && e.shiftKey && e.code === "KeyK") { e.preventDefault(); togglePanel(); return; }
    if (e.key === "Escape" && !panel.hidden) { togglePanel(false); return; }
    if (e.target !== ta || e.key !== "Enter" || e.shiftKey || e.isComposing || e.keyCode === 229) return;
    if (!e.ctrlKey && !e.metaKey && !e.altKey && ta.value.trim()) fire("send", true);
  };
  const onClickSend = (e) => {
    if (!ta) return;
    const b = e.target.closest?.('button[aria-label="전송"], button[aria-label="Send"]');
    if (b && b.closest(".marinara-chat-input-shell")?.contains(ta) && ta.value.trim()) fire("send", true);
  };

  /* ═════════ 그림 올리기 ═════════ */
  // WebP로 담을 수 있으면 WebP(훨씬 가벼워요), 아니면 PNG로 담아요.
  const encode = (c) => {
    const w = c.toDataURL("image/webp", 0.85);
    return w.startsWith("data:image/webp") ? w : c.toDataURL("image/png");
  };
  const GIF_MAX = 150 * 1024;
  const readImage = (file, maxSide = 160) => new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("그림 파일만 올릴 수 있어요."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("그림을 읽지 못했어요."));
    reader.onload = () => {
      const url = String(reader.result);
      // 움직이는 GIF는 줄이면 멈추니까 작은 파일은 그대로 써요.
      if (file.type === "image/gif" && file.size <= GIF_MAX) return resolve(url);
      const img = new Image();
      img.onerror = () => reject(new Error(/heic|heif/i.test(file.type + file.name)
        ? "아이폰 사진(HEIC)은 이 브라우저에서 열 수 없어요. PNG나 JPG로 바꿔서 올려 주세요."
        : "그림을 열지 못했어요. PNG·JPG·WebP·GIF로 올려 주세요."));
      img.onload = () => {
        const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * k));
        c.height = Math.max(1, Math.round(img.naturalHeight * k));
        const g = c.getContext("2d");
        g.imageSmoothingQuality = "high";
        g.drawImage(img, 0, 0, c.width, c.height);
        resolve(encode(c));
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
  const pickFiles = (accept, multiple) => new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = !!multiple;
    input.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    document.body.appendChild(input);
    const done = (files) => { input.remove(); resolve(files); };
    input.onchange = () => done([...(input.files || [])]);
    input.addEventListener("cancel", () => done([]));
    setTimeout(() => input.isConnected && input.remove(), 120000);
    input.click();
  });
  // 여러 장을 한 번에 그림함에 넣어요. 넣은 그림 id 목록을 돌려줘요.
  const addFiles = async (files) => {
    const refs = [];
    const errs = [];
    for (const f of files) {
      try { refs.push(addToGallery(await readImage(f))); }
      catch (err) { errs.push(err.message || String(err)); break; }
    }
    if (refs.length && !saveGallery()) {
      // 저장이 안 되면 방금 넣은 걸 되돌려요.
      const ids = new Set(refs.map(refId));
      G = G.filter((g) => !ids.has(g.id));
      reindex();
      return { refs: [], err: galleryErr };
    }
    return { refs, err: errs[0] || "" };
  };
  const removeFromGallery = (id) => {
    G = G.filter((g) => g.id !== id);
    reindex();
    const u = blobUrls.get(id);
    if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    blobUrls.delete(id);
    saveGallery();
    // 지금 설정에서 이 그림을 쓰던 곳을 비워요 (프리셋은 불러올 때 알아서 빠져요).
    S = sanitize(S, S);
  };

  /* ═════════ 서버에 저장 (어느 기기·주소에서 열어도 같게) ═════════ */
  // Marinara가 확장마다 주는 서버 저장소예요. 확장 하나당 1MB까지 담을 수 있어요.
  const STORE = typeof marinara !== "undefined" && marinara && marinara.storage ? marinara.storage : null;
  const SERVER_LIMIT = 1000000;
  let serverSnap = {};
  let serverReady = false;
  let serverUsed = 0;
  let syncErr = "";
  let syncing = false;
  let pushT = 0;
  let dirtyGen = 0; // 이 기기에서 바꿀 때마다 1씩 올라가요
  const bytes = (v) => new Blob([typeof v === "string" ? v : JSON.stringify(v)]).size;
  const asText = (x) => (typeof x === "string" ? x : JSON.stringify(x));
  const snapOf = (v) => Object.fromEntries(Object.entries(v || {}).map(([k, x]) => [k, asText(x)]));
  const validPreset = (p) => p && typeof p.id === "string" && typeof p.name === "string" && p.data && typeof p.data === "object";
  const desired = () => {
    const o = { v: 3, settings: packLook(S), presets: P, order: G.map((g) => g.id) };
    for (const g of G) o["i:" + g.id] = g.src;
    return o;
  };
  const syncText = () => {
    if (!STORE) return "설정은 이 브라우저에 저장돼요";
    if (syncErr) return syncErr;
    if (!serverReady) return "서버에서 불러오는 중…";
    return `서버에 저장돼요 · ${Math.round(serverUsed / 1000)}KB / 1000KB`;
  };
  const refreshStatus = () => {
    const el = panel.querySelector(".kb-sync");
    if (el) { el.textContent = syncText(); el.classList.toggle("kb-sync-err", !!syncErr); }
  };
  const flush = async () => {
    clearTimeout(pushT);
    pushT = 0;
    if (!STORE || !serverReady) return;
    if (syncing) { queueSync(); return; }
    const want = desired();
    const diff = {};
    for (const [k, v] of Object.entries(want)) if (serverSnap[k] !== asText(v)) diff[k] = v;
    for (const k of Object.keys(serverSnap)) if (!(k in want) && serverSnap[k] !== "null") diff[k] = null;
    if (!Object.keys(diff).length) return;
    const total = bytes(want);
    if (total > SERVER_LIMIT - 4000) {
      syncErr = `서버 공간(1MB)이 모자라요. 그림을 몇 장 지워 주세요. (지금 ${Math.round(total / 1000)}KB)`;
      refreshStatus();
      return;
    }
    syncing = true;
    try {
      let v = await STORE.patch(diff);
      // 지운 그림 자리(null)가 많이 쌓이면 한 번 비우고 깨끗하게 다시 올려요.
      if (Object.values(v).filter((x) => x === null).length > 20) {
        await STORE.clear();
        v = await STORE.patch(want);
      }
      serverSnap = snapOf(v);
      serverUsed = bytes(v);
      syncErr = "";
    } catch (err) {
      syncErr = /\(400\)/.test(String(err && err.message))
        ? "서버 공간(1MB)이 모자라서 저장하지 못했어요. 그림을 몇 장 지워 주세요."
        : "서버에 저장하지 못했어요. 이 브라우저에는 저장돼 있어요.";
    }
    syncing = false;
    refreshStatus();
  };
  const queueSync = () => {
    if (!STORE) return;
    dirtyGen++;
    clearTimeout(pushT);
    pushT = setTimeout(flush, 800);
  };
  // 예전에 크게 담아 둔 그림은 서버에 올리기 전에 작게 다시 담아요.
  const shrinkGallery = async () => {
    let changed = false;
    for (const g of G) {
      if (/^data:image\/(webp|gif)/.test(g.src) || g.src.length < 24000) continue;
      const small = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 160 / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(img.naturalWidth * k));
          c.height = Math.max(1, Math.round(img.naturalHeight * k));
          const cx = c.getContext("2d");
          cx.imageSmoothingQuality = "high";
          cx.drawImage(img, 0, 0, c.width, c.height);
          resolve(encode(c));
        };
        img.onerror = () => resolve(null);
        img.src = g.src;
      });
      if (small && small.length < g.src.length) {
        g.src = small;
        const u = blobUrls.get(g.id);
        if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
        blobUrls.delete(g.id);
        changed = true;
      }
    }
    if (changed) { reindex(); saveGallery(false); }
  };
  // 서버 내용을 받아서 이 브라우저에 맞춰요. 서버가 비어 있으면 이 브라우저 것을 올려요.
  const pull = async () => {
    if (!STORE) return;
    const gen = dirtyGen;
    let v;
    try { v = await STORE.get(); }
    catch { syncErr = "서버에서 불러오지 못했어요. 이 브라우저에 저장된 걸로 보여줘요."; refreshStatus(); return; }
    serverUsed = bytes(v || {});
    serverSnap = snapOf(v);
    // 받아오는 사이에 이 기기에서 바꾼 게 있으면 그게 더 새 거예요. 덮지 않고 올려요.
    if (gen !== dirtyGen || pushT) {
      serverReady = true;
      refreshStatus();
      await flush();
      return;
    }
    if (v && v.v === 3) {
      const order = Array.isArray(v.order) ? v.order : [];
      const next = order.map((id) => ({ id, src: v["i:" + id] })).filter((g) => typeof g.id === "string" && isData(g.src)).slice(0, MAX_GALLERY);
      for (const [id, u] of [...blobUrls]) {
        if (!next.some((g) => g.id === id && g.src === gmap.get(id)?.src)) {
          if (u.startsWith("blob:")) URL.revokeObjectURL(u);
          blobUrls.delete(id);
        }
      }
      G = next;
      reindex();
      saveGallery(false);
      if (Array.isArray(v.presets)) { P = v.presets.filter(validPreset).slice(0, MAX_PRESETS).map((p) => ({ ...p, data: packLook(sanitize(p.data)) })); savePresets(false); }
      if (v.settings && typeof v.settings === "object") {
        const keep = {};
        for (const k of LOCAL_ONLY) keep[k] = S[k];
        S = sanitize({ ...v.settings, ...keep });
        saveNow(false);
      }
      main.artKey = "";
      pv.artKey = "";
      main.paint();
      root.classList.toggle("kb-hidecaret", S.hideCaret && S.on);
      if (!panel.hidden) render();
    } else {
      await shrinkGallery();
    }
    serverReady = true;
    syncErr = "";
    refreshStatus();
    await flush();
  };
  onLocalSave = queueSync;

  /* ═════════ 꾸미기 창 ═════════ */
  const panel = document.createElement("div");
  panel.className = "kb-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "끄적 친구 꾸미기");
  document.body.appendChild(panel);

  const pv = new Buddy();
  let tab = "buddy";
  let notice = "";
  let undoLook = null;
  let undoName = "";
  let galEdit = false;

  // 미리보기: 혼자 글을 쓰고, 지우고, 줄을 바꾸고, 보내요.
  const SCRIPT = "오늘도 편지를 써요";
  let pvText = "";
  let pvTimer = 0;
  let pvStep = 0;
  const pvCaret = () => {
    const box = panel.querySelector(".kb-preview");
    const caret = box?.querySelector("i");
    if (!box || !caret) return null;
    return { b: box.getBoundingClientRect(), c: caret.getBoundingClientRect() };
  };
  const pvPlace = () => {
    const k = pvCaret();
    if (!k) return;
    const { b, c } = k;
    const [x, y] = anchorPoint(c.right - b.left, c.bottom - b.top - 2, c.top - b.top);
    pv.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };
  const pvFire = (evName) => {
    const tag = panel.querySelector(".kb-preview-tag");
    if (tag) tag.textContent = EVENTS.find((e) => e[0] === evName)?.[1] || "";
    pv.play(evName);
    const k = pvCaret();
    if (k) emit(evName, k.c.right, k.c.top + k.c.height * 0.4);
  };
  const pvSetText = (t) => {
    pvText = t;
    const span = panel.querySelector(".kb-preview-text");
    if (span) span.firstChild.nodeValue = t;
    pvPlace();
  };
  const STEPS = (() => {
    const len = SCRIPT.length;
    const s = [["focus"]];
    for (let i = 1; i <= len; i++) s.push(["type", SCRIPT.slice(0, i)]);
    for (let i = 1; i <= 3; i++) s.push(["delete", SCRIPT.slice(0, len - i)]);
    for (let i = len - 2; i <= len; i++) s.push(["type", SCRIPT.slice(0, i)]);
    s.push(["newline"]);
    for (let i = 0; i < 7; i++) s.push(["wait"]);
    s.push(["send", ""]);
    for (let i = 0; i < 4; i++) s.push(["wait"]);
    s.push(["hide"]);
    for (let i = 0; i < 6; i++) s.push(["wait"]);
    return s;
  })();
  let pvHold = false;
  const pvTick = () => {
    if (panel.hidden || pvHold) return;
    const [kind, text] = STEPS[pvStep % STEPS.length];
    pvStep++;
    if (kind === "wait") {
      const tag = panel.querySelector(".kb-preview-tag");
      if (tag && pv.resting && !pv.el.classList.contains("kb-gone")) tag.textContent = "쉬는 중";
      return;
    }
    if (kind === "hide") {
      const tag = panel.querySelector(".kb-preview-tag");
      if (tag) tag.textContent = "입력창에서 나갈 때";
      pv.el.classList.add("kb-gone");
      return;
    }
    if (kind === "focus") pv.el.classList.remove("kb-gone");
    if (kind === "send") {
      pvFire("send");
      later(() => pvSetText(""), 260);
      return;
    }
    if (text !== undefined) pvSetText(text);
    pvFire(kind);
  };
  // 사라졌다가 지금 고른 방식으로 다시 나타나요.
  const pvAppear = () => {
    const wait = S.appear === "fade" ? S.fadeMs : 0;
    const tag = panel.querySelector(".kb-preview-tag");
    if (tag) tag.textContent = "입력창에서 나갈 때";
    pv.el.classList.add("kb-gone");
    pvStep = 1; // 다시 나타난 뒤에는 쓰기부터 이어가요
    pvHold = true; // 사라져 있는 동안은 혼자 쓰기를 멈춰요
    pvSetText("");
    later(() => { pv.el.classList.remove("kb-gone"); pvFire("focus"); later(() => { pvHold = false; }, 300); }, wait + 350);
  };
  const pvStart = () => {
    clearInterval(pvTimer);
    pvStep = 0;
    pvTimer = setInterval(pvTick, 190);
  };
  // 설정이 통째로 바뀌면 미리보기를 깨끗하게 처음부터 다시 틀어요.
  const clearFx = () => {
    // 취소 알림이 나중에 와서 개수를 또 빼지 않게, 알림을 먼저 떼고 취소해요.
    for (const a of fxLayer.getAnimations({ subtree: true })) { a.onfinish = a.oncancel = null; a.cancel(); }
    fxLayer.replaceChildren();
    live = 0;
    for (const k in lastFx) delete lastFx[k];
  };
  const pvRestart = () => {
    pvHold = false;
    clearFx();
    pv.act.style.animation = "";
    pv.idleName = "";
    pv.el.classList.remove("kb-gone");
    pvSetText("");
    pv.rest();
    main.act.style.animation = "";
    pvStart();
  };

  const opt = (map, cur) => Object.entries(map).map(([k, v]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${Array.isArray(v) ? v[0] : v}</option>`).join("");
  const chip = (path, v, label, cur) => `<button type="button" class="kb-chip" data-set="${path}" data-v="${v}" aria-pressed="${cur === v}">${label}</button>`;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  // 그림 고르기 줄: 기본/없음 + (기본 그림) + 그림함 그림 + 올리기
  const picker = (path, cur, { none = null, builtins = true, strip = false } = {}) => {
    const items = [];
    if (none !== null) items.push(`<button type="button" class="kb-th kb-txt" data-pick="${path}" data-v="" aria-pressed="${!cur}">${none}</button>`);
    if (builtins) for (const k of BUILTIN_KEYS) items.push(`<button type="button" class="kb-th" data-pick="${path}" data-v="${k}" aria-pressed="${cur === k}" title="${BUILTIN_NAMES[k]}"><span class="kb-art">${BUILTIN[k]}</span></button>`);
    for (const g of G) items.push(`<button type="button" class="kb-th" data-pick="${path}" data-v="g:${g.id}" aria-pressed="${cur === "g:" + g.id}"><img src="${gUrl(g.id)}" alt=""></button>`);
    items.push(`<button type="button" class="kb-th kb-add" data-upick="${path}" title="그림 올려서 바로 쓰기">＋</button>`);
    return `<div class="kb-pick${strip ? " kb-strip" : ""}">${items.join("")}</div>`;
  };

  const tabBuddy = () => `
<label class="kb-check"><input type="checkbox" data-bool="on" ${S.on ? "checked" : ""}> 입력창에 친구 띄우기</label>
<div class="kb-row"><div class="kb-label">친구 그림</div>${picker("img", S.img)}</div>
<div class="kb-card"><div class="kb-card-head"><span>내 그림함 <small>${G.length}/${MAX_GALLERY}</small></span>
  <span class="kb-chips">${G.length ? `<button type="button" class="kb-chip kb-mini" data-act="gal-edit" aria-pressed="${galEdit}">${galEdit ? "다 했어요" : "정리하기"}</button>` : ""}
  <button type="button" class="kb-chip kb-mini kb-strong" data-act="gal-add">＋ 여러 장 올리기</button></span></div>
${G.length ? `<div class="kb-pick kb-gal${galEdit ? " kb-editing" : ""}">${G.map((g) => `<span class="kb-th"><img src="${gUrl(g.id)}" alt=""><button type="button" class="kb-del" data-del="${g.id}" aria-label="그림 지우기">×</button></span>`).join("")}</div>`
  : `<div class="kb-note" style="margin-top:0">여기 올린 그림은 친구 그림, 상황별 표정, 효과 어디서든 골라 쓸 수 있어요. 배경이 투명한 PNG나 움직이는 GIF(150KB 이하)도 돼요. ${STORE ? "Marinara 서버에 저장돼서 다른 기기·주소에서 열어도 같이 보여요." : ""}</div>`}
${galleryErr ? `<div class="kb-err">${esc(galleryErr)}</div>` : ""}</div>
<div class="kb-row"><div class="kb-label">자리</div><div class="kb-chips">
  ${chip("anchor", "tip", "펜촉처럼", S.anchor)}${chip("anchor", "sit", "옆에 앉기", S.anchor)}${chip("anchor", "float", "위에 둥실", S.anchor)}
</div></div>
<div class="kb-row"><div class="kb-label"><span>크기</span><span>${S.size}px</span></div><input type="range" min="12" max="96" data-num="size" value="${S.size}"></div>
<div class="kb-row"><div class="kb-label"><span>좌우 조정</span><span>${S.dx}</span></div><input type="range" min="-40" max="40" data-num="dx" value="${S.dx}"></div>
<div class="kb-row"><div class="kb-label"><span>위아래 조정</span><span>${S.dy}</span></div><input type="range" min="-40" max="40" data-num="dy" value="${S.dy}"></div>
<label class="kb-check"><input type="checkbox" data-bool="flip" ${S.flip ? "checked" : ""}> 좌우 뒤집기</label>
<label class="kb-check"><input type="checkbox" data-bool="hideCaret" ${S.hideCaret ? "checked" : ""}> 원래 깜빡이는 커서 숨기기</label>
<label class="kb-check"><input type="checkbox" data-bool="fabHidden" ${S.fabHidden ? "checked" : ""}> 떠 있는 버튼 숨기기 (Alt+Shift+K로 다시 열기)</label>`;

  const tabMove = () => `
<div class="kb-card"><div class="kb-card-head"><span>나타나기 · 사라지기</span><button type="button" class="kb-play" data-appearplay aria-label="나타나기 미리 보기">▶</button></div>
<div class="kb-chips">${chip("appear", "fade", "페이드 (서서히)", S.appear)}${chip("appear", "instant", "바로 (툭)", S.appear)}</div>
${S.appear === "fade"
  ? `<div class="kb-line2" style="margin-top:7px"><span>시간</span><div class="kb-chips">${chip("fadeMs", "120", "짧게", String(S.fadeMs))}${chip("fadeMs", "200", "보통", String(S.fadeMs))}${chip("fadeMs", "400", "길게", String(S.fadeMs))}</div></div>`
  : `<div class="kb-note">페이드 없이 그 자리에 툭 나타나고 툭 사라져요. 이때 '입력창 누를 때' 움직임은 쉬어요 (효과는 나와요).</div>`}</div>
<div class="kb-note" style="margin-top:10px">상황마다 움직임을 고르고, 원하면 그때만 다른 그림(표정)으로 바꿀 수 있어요. ▶를 누르면 위에서 바로 보여줘요.</div>
${EVENTS.map(([k, label]) => `
<div class="kb-card"><div class="kb-card-head"><span>${label}${k === "focus" && S.appear === "instant" ? " <small>바로(툭)라서 쉬어요</small>" : ""}</span><button type="button" class="kb-play" data-play="${k}" aria-label="${label} 미리 보기">▶</button></div>
<div class="kb-line2"><span>움직임</span><select class="kb-select" data-sel="ev.${k}.anim">${opt(ACTS, S.ev[k].anim)}</select></div>
<div class="kb-line2"><span>그림</span>${picker(`ev.${k}.img`, S.ev[k].img, { none: "그대로", strip: true })}</div></div>`).join("")}
<div class="kb-card"><div class="kb-card-head"><span>쉴 때</span></div>
<div class="kb-line2"><span>움직임</span><select class="kb-select" data-sel="idle.anim">${opt(LOOPS, S.idle.anim)}</select></div>
<div class="kb-line2"><span>그림</span>${picker("idle.img", S.idle.img, { none: "그대로", strip: true })}</div>
<div class="kb-row" style="margin-top:8px"><div class="kb-label"><span>쉬기 시작까지</span><span>${S.idleAfter.toFixed(1)}초</span></div><input type="range" min="0.3" max="6" step="0.1" data-num="idleAfter" value="${S.idleAfter}"></div></div>`;

  const tabFx = () => `
<div class="kb-note" style="margin-top:10px">상황마다 튀어나오는 효과를 고를 수 있어요. 하트를 쓸 때마다 뿅뿅!</div>
${EVENTS.map(([k, label]) => `
<div class="kb-card"><div class="kb-card-head"><span>${label}</span><button type="button" class="kb-play" data-play="${k}" aria-label="${label} 미리 보기">▶</button></div>
<div class="kb-line2"><span>효과</span><select class="kb-select" data-sel="ev.${k}.fx">${opt(FX, S.ev[k].fx)}</select></div>
${S.ev[k].fx === "none" ? "" : `<div class="kb-line2"><span>모양</span><select class="kb-select" data-sel="ev.${k}.motion">${opt(MOTIONS, S.ev[k].motion)}</select></div>
<div class="kb-line2"><span>개수</span><input class="kb-count" type="range" min="1" max="10" data-num="ev.${k}.count" value="${S.ev[k].count}"><b style="font-size:11.5px">${S.ev[k].count}</b></div>`}</div>`).join("")}
<div class="kb-row"><div class="kb-label"><span>효과 크기</span><span>${S.fxSize}px</span></div><input type="range" min="8" max="48" data-num="fxSize" value="${S.fxSize}"></div>
<div class="kb-row"><div class="kb-label">내 이모지 (효과에서 '내 이모지'를 고르면 섞여서 나와요)</div>
<input class="kb-text" data-str="myText" maxlength="40" value="${esc(S.myText)}" placeholder="💗✨🌙"></div>
<div class="kb-row"><div class="kb-label"><span>내 효과 그림 (여러 개 고르면 섞여서 나와요)</span><span>${S.myImgs.length}개</span></div>
<div class="kb-pick">${G.map((g) => `<button type="button" class="kb-th" data-multi="myImgs" data-v="g:${g.id}" aria-pressed="${S.myImgs.includes("g:" + g.id)}"><img src="${gUrl(g.id)}" alt=""></button>`).join("")}
<button type="button" class="kb-th kb-add" data-upick="myImgs" title="그림 올려서 바로 쓰기">＋</button></div>
<div class="kb-note">효과에서 '내 효과 그림'을 골라야 나와요.</div></div>`;

  const tabPreset = () => `
<div class="kb-card"><div class="kb-card-head"><span>내 프리셋 <small>${P.length}/${MAX_PRESETS}</small></span></div>
<div class="kb-line2"><input class="kb-text" data-presetname maxlength="24" placeholder="이름 (예: 고양이 편지)"><button type="button" class="kb-chip kb-strong" data-act="preset-save" style="flex:none">지금 모습 저장</button></div>
${P.length ? P.map((p) => `<div class="kb-preset"><span class="kb-name"><b>${esc(p.name)}</b></span>
  <button type="button" class="kb-chip kb-mini kb-strong" data-papply="${p.id}">적용</button>
  <button type="button" class="kb-chip kb-mini" data-pover="${p.id}" title="지금 모습으로 덮어써요">덮어쓰기</button>
  <button type="button" class="kb-chip kb-mini" data-pdel="${p.id}" aria-label="${esc(p.name)} 지우기">×</button></div>`).join("")
  : `<div class="kb-note">친구 그림, 표정, 움직임, 효과까지 지금 모습을 통째로 저장해요.</div>`}
<div class="kb-chips" style="margin-top:9px">
  <button type="button" class="kb-chip kb-mini" data-act="preset-export" ${P.length ? "" : "disabled"}>파일로 내보내기</button>
  <button type="button" class="kb-chip kb-mini" data-act="preset-import">파일 가져오기</button>
</div>
<div class="kb-note">내보내면 그림까지 파일 하나에 같이 담겨요. 친구에게 주면 그대로 가져올 수 있어요.</div>
${presetErr ? `<div class="kb-err">${esc(presetErr)}</div>` : ""}</div>
<div class="kb-card"><div class="kb-card-head"><span>기본 프리셋 <small>움직임·효과만 바꾸고 그림은 그대로</small></span></div>
${BUILTIN_PRESETS.map(([id, name, desc]) => `<div class="kb-preset"><b>${name}</b><span class="kb-desc">${desc}</span>
  <button type="button" class="kb-chip kb-mini kb-strong" data-bapply="${id}">적용</button></div>`).join("")}</div>`;

  const TABS = [["buddy", "친구"], ["move", "움직임"], ["fx", "효과"], ["preset", "프리셋"]];
  const render = () => {
    const scroll = panel.querySelector(".kb-body-scroll")?.scrollTop || 0;
    const body = tab === "move" ? tabMove() : tab === "fx" ? tabFx() : tab === "preset" ? tabPreset() : tabBuddy();
    panel.innerHTML = `
<div class="kb-top">
<div class="kb-head"><h3>끄적 친구 꾸미기</h3><button type="button" class="kb-x" data-act="close" aria-label="닫기">×</button></div>
<div class="kb-preview"><span class="kb-preview-text">${esc(pvText)}<i></i></span><span class="kb-preview-tag"></span></div>
<div class="kb-tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" class="kb-tab" data-tab="${k}" aria-selected="${tab === k}">${l}</button>`).join("")}</div>
${undoLook ? `<div class="kb-ok">${undoName === "처음 설정"
    ? "움직임·효과·그림 설정을 처음으로 돌렸어요. 그림함과 프리셋은 그대로예요."
    : `'${esc(undoName)}' 적용했어요.`}<button type="button" class="kb-chip kb-mini" data-act="undo">되돌리기</button></div>` : ""}
</div>
<div class="kb-body-scroll">${body}
${notice ? `<div class="kb-err">${esc(notice)}</div>` : ""}${saveErr ? `<div class="kb-err">${saveErr}</div>` : ""}
<div class="kb-foot"><span class="kb-sync${syncErr ? " kb-sync-err" : ""}">${esc(syncText())}</span><button type="button" class="kb-chip" data-act="reset">처음 설정으로</button></div>
</div>`;
    const span = panel.querySelector(".kb-preview-text");
    if (!span.firstChild || span.firstChild.nodeType !== 3) span.insertBefore(document.createTextNode(pvText), span.firstChild);
    panel.querySelector(".kb-preview").appendChild(pv.el);
    pv.paint();
    if (!pv.resting && pv.face === "idle") pv.rest();
    panel.querySelector(".kb-body-scroll").scrollTop = scroll;
    requestAnimationFrame(pvPlace);
  };

  const getPath = (p) => p.split(".").reduce((o, k) => o?.[k], S);
  const setPath = (p, v) => {
    const ks = p.split(".");
    const lastK = ks.pop();
    const o = ks.reduce((a, k) => a[k], S);
    o[lastK] = v;
  };
  const commit = (rerender = true) => {
    if (rerender) saveNow();
    else save();
    main.paint();
    root.classList.toggle("kb-hidecaret", S.hideCaret && S.on);
    fab.hidden = S.fabHidden;
    if (rerender) render();
    else { pv.paint(); pvPlace(); }
    schedule();
  };

  /* ── 프리셋 동작 ── */
  const rememberUndo = (name) => { undoLook = lookOf(S); undoName = name; };
  const applyLook = (look) => {
    const keep = {};
    for (const k of LOCAL_ONLY) keep[k] = S[k];
    S = sanitize({ ...look, ...keep });
  };
  const applyBuiltin = (id) => {
    const b = BUILTIN_PRESETS.find((x) => x[0] === id);
    if (!b) return;
    rememberUndo(b[1]);
    const patch = b[3];
    S.idle.anim = patch.idle;
    for (const [k] of EVENTS) Object.assign(S.ev[k], patch.ev[k]);
  };
  const fileName = (s) => s.replace(/[\\/:*?"<>|]+/g, "_");
  const exportPresets = () => {
    const ids = new Set();
    const walk = (o) => {
      if (typeof o === "string") { const id = refId(o); if (id && gmap.has(id)) ids.add(id); }
      else if (o && typeof o === "object") Object.values(o).forEach(walk);
    };
    P.forEach((p) => walk(p.data));
    const out = {
      kind: "kkj-buddy-presets",
      version: 1,
      presets: P.map((p) => ({ name: p.name, data: p.data })),
      images: Object.fromEntries([...ids].map((id) => [id, gmap.get(id).src])),
    };
    const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName(`끄적친구-프리셋-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const importPresets = async (file) => {
    const text = await file.text();
    let o;
    try { o = JSON.parse(text); } catch { throw new Error("프리셋 파일이 아니에요."); }
    if (!o || o.kind !== "kkj-buddy-presets" || !Array.isArray(o.presets)) throw new Error("끄적 친구 프리셋 파일이 아니에요.");
    // 그림은 그림함에 넣고, 프리셋 안의 이름표를 새 이름표로 바꿔요.
    const map = new Map();
    for (const [oldId, src] of Object.entries(o.images || {})) {
      if (!isData(src)) continue;
      try { map.set(oldId, refId(addToGallery(src))); } catch { break; }
    }
    if (map.size && !saveGallery()) throw new Error(galleryErr);
    const fix = (v) => {
      if (typeof v === "string") { const id = refId(v); return id ? (map.has(id) ? "g:" + map.get(id) : gmap.has(id) ? v : null) : v; }
      if (Array.isArray(v)) return v.map(fix).filter((x) => x !== null);
      if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x)]));
      return v;
    };
    let added = 0;
    for (const p of o.presets) {
      if (P.length >= MAX_PRESETS) break;
      if (!p || typeof p.name !== "string" || !p.data || typeof p.data !== "object") continue;
      let name = p.name.slice(0, 24) || "가져온 프리셋";
      while (P.some((x) => x.name === name)) name = name.slice(0, 20) + " (2)";
      P.push({ id: uid(), name, data: packLook(sanitize(fix(p.data))) });
      added++;
    }
    savePresets();
    return added;
  };

  panel.addEventListener("click", async (e) => {
    const t = e.target;
    const tb = t.closest("[data-tab]");
    if (tb) { tab = tb.dataset.tab; render(); return; }
    const setter = t.closest("[data-set]");
    if (setter) {
      const p = setter.dataset.set;
      const v = setter.dataset.v;
      setPath(p, typeof getPath(p) === "number" ? Number(v) : v);
      commit();
      if (p === "appear" || p === "fadeMs") pvAppear();
      return;
    }
    const pk = t.closest("[data-pick]");
    if (pk) {
      const p = pk.dataset.pick;
      const v = pk.dataset.v || null;
      setPath(p, v);
      commit();
      const m = p.match(/^ev\.(\w+)\./);
      if (m) pvFire(m[1]);
      return;
    }
    const mul = t.closest("[data-multi]");
    if (mul) {
      const v = mul.dataset.v;
      S.myImgs = S.myImgs.includes(v) ? S.myImgs.filter((x) => x !== v) : [...S.myImgs, v].slice(-12);
      return commit();
    }
    if (t.closest("[data-appearplay]")) { pvAppear(); return; }
    const play = t.closest("[data-play]");
    if (play) { pvFire(play.dataset.play); return; }
    const del = t.closest("[data-del]");
    if (del) { removeFromGallery(del.dataset.del); return commit(); }
    const pa = t.closest("[data-papply]");
    if (pa) {
      const p = P.find((x) => x.id === pa.dataset.papply);
      if (p) { rememberUndo(p.name); applyLook(p.data); }
      commit();
      pvRestart();
      return;
    }
    const po = t.closest("[data-pover]");
    if (po) {
      const p = P.find((x) => x.id === po.dataset.pover);
      if (p) { p.data = packLook(S); savePresets(); notice = ""; }
      return commit();
    }
    const pd = t.closest("[data-pdel]");
    if (pd) { P = P.filter((x) => x.id !== pd.dataset.pdel); savePresets(); return commit(); }
    const ba = t.closest("[data-bapply]");
    if (ba) { applyBuiltin(ba.dataset.bapply); commit(); pvRestart(); return; }

    notice = "";
    try {
      const up = t.closest("[data-upick]");
      if (up) {
        const p = up.dataset.upick;
        const files = await pickFiles("image/*", p === "myImgs");
        if (!files.length) return;
        const { refs, err } = await addFiles(files);
        if (err) notice = err;
        if (refs.length) {
          if (p === "myImgs") S.myImgs = [...new Set([...S.myImgs, ...refs])].slice(-12);
          else setPath(p, refs[0]);
        }
        return commit();
      }
      const act = t.closest("[data-act]")?.dataset.act;
      if (!act) return;
      if (act === "close") return togglePanel(false);
      if (act === "gal-edit") { galEdit = !galEdit; return render(); }
      if (act === "gal-add") {
        const files = await pickFiles("image/*", true);
        if (!files.length) return;
        const { err } = await addFiles(files);
        if (err) notice = err;
        return commit();
      }
      if (act === "undo") {
        if (undoLook) applyLook(undoLook);
        undoLook = null;
        commit();
        pvRestart();
        return;
      }
      if (act === "preset-save") {
        const input = panel.querySelector("[data-presetname]");
        const name = (input?.value || "").trim().slice(0, 24) || `내 프리셋 ${P.length + 1}`;
        if (P.length >= MAX_PRESETS) throw new Error(`프리셋은 ${MAX_PRESETS}개까지 저장할 수 있어요.`);
        const same = P.find((x) => x.name === name);
        if (same) same.data = packLook(S);
        else P.push({ id: uid(), name, data: packLook(S) });
        savePresets();
        return commit();
      }
      if (act === "preset-export") { exportPresets(); return; }
      if (act === "preset-import") {
        const [f] = await pickFiles(".json,application/json", false);
        if (!f) return;
        const n = await importPresets(f);
        notice = n ? "" : "가져올 프리셋이 없었어요.";
        return commit();
      }
      if (act === "reset") {
        rememberUndo("처음 설정");
        applyLook(DEFAULTS);
        commit();
        pvRestart();
        return;
      }
    } catch (err) {
      notice = err.message || String(err);
      render();
    }
  });
  panel.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.num) {
      setPath(t.dataset.num, Number(t.value));
      commit(false);
      const lab = t.previousElementSibling?.lastElementChild || t.nextElementSibling;
      if (lab) {
        const v = getPath(t.dataset.num);
        lab.textContent = t.dataset.num === "idleAfter" ? v.toFixed(1) + "초" : /size|Size/.test(t.dataset.num) ? v + "px" : String(v);
      }
    } else if (t.dataset.str) {
      setPath(t.dataset.str, t.value);
      commit(false);
    }
  });
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("[data-presetname]")) panel.querySelector('[data-act="preset-save"]')?.click();
  });
  panel.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.bool) { S[t.dataset.bool] = t.checked; commit(); }
    else if (t.dataset.sel) {
      setPath(t.dataset.sel, t.value);
      commit();
      const m = t.dataset.sel.match(/^ev\.(\w+)\./);
      if (m) pvFire(m[1]);
    }
  });

  /* ═════════ 떠 있는 버튼 ═════════ */
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "kb-fab";
  fab.title = "끄적 친구 꾸미기 (끌어서 옮길 수 있어요)";
  fab.setAttribute("aria-label", "끄적 친구 꾸미기");
  fab.setAttribute("aria-pressed", "false");
  fab.innerHTML = ICON;
  fab.hidden = S.fabHidden;
  document.body.appendChild(fab);

  const placeFab = () => {
    const w = 38;
    let x = S.fabX;
    let y = S.fabY;
    if (x < 0 || y < 0) { x = 14; y = innerHeight - 150; }
    x = clamp(x, 6, innerWidth - w - 6);
    y = clamp(y, 6, innerHeight - w - 6);
    fab.style.left = x + "px";
    fab.style.top = y + "px";
    return [x, y];
  };
  // 버튼을 가리지 않게 버튼 옆에 열어요 (자리가 없으면 화면 가장자리).
  const placePanel = () => {
    const r = fab.getBoundingClientRect();
    const w = Math.min(360, innerWidth - 24);
    const onLeft = r.left + r.width / 2 < innerWidth / 2;
    let x = onLeft ? r.right + 10 : r.left - 10 - w;
    if (x < 12 || x + w > innerWidth - 12) x = onLeft ? innerWidth - 12 - w : 12;
    panel.style.left = Math.max(12, x) + "px";
    panel.style.right = "auto";
  };
  placeFab();

  let drag = null;
  fab.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const r = fab.getBoundingClientRect();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    fab.setPointerCapture(e.pointerId);
  });
  fab.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    fab.classList.add("kb-drag");
    S.fabX = drag.ox + dx;
    S.fabY = drag.oy + dy;
    placeFab();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    fab.classList.remove("kb-drag");
    if (moved) {
      [S.fabX, S.fabY] = placeFab();
      saveNow();
      placePanel();
    } else if (e.type === "pointerup") {
      togglePanel();
    }
  };
  fab.addEventListener("pointerup", endDrag);
  fab.addEventListener("pointercancel", endDrag);
  fab.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePanel(); } });

  const togglePanel = (open = panel.hidden) => {
    panel.hidden = !open;
    fab.setAttribute("aria-pressed", String(open));
    if (open) {
      placePanel();
      render();
      pvStart();
      if (STORE && serverReady) flush().then(pull);
    } else {
      clearInterval(pvTimer);
      undoLook = null;
      notice = "";
    }
  };
  const onDocDown = (e) => {
    if (panel.hidden) return;
    if (panel.contains(e.target) || fab.contains(e.target)) return;
    togglePanel(false);
  };
  const onResize = () => { placeFab(); mirrorFor = null; schedule(); };
  const onHide = () => { if (saveT) saveNow(); if (pushT) flush(); };

  /* ═════════ 시작 ═════════ */
  // 입력창 크기가 바뀔 때만 글자 거울을 다시 맞춰요. (채팅 전체를 지켜보지 않아요)
  const ro = new ResizeObserver(() => {
    if (ta && !ta.isConnected) { hide(); ta = null; ro.disconnect(); return; }
    mirrorFor = null;
    schedule();
  });
  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);
  document.addEventListener("input", onInput, true);
  document.addEventListener("compositionstart", onCompose, true);
  document.addEventListener("compositionupdate", onCompose, true);
  document.addEventListener("compositionend", onCompose, true);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("click", onClickSend, true);
  document.addEventListener("keyup", schedule, true);
  document.addEventListener("pointerup", schedule, true);
  document.addEventListener("selectionchange", schedule);
  document.addEventListener("scroll", schedule, { capture: true, passive: true });
  document.addEventListener("pointerdown", onDocDown, true);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("pagehide", onHide);

  root.classList.toggle("kb-hidecaret", S.hideCaret && S.on);
  if (document.activeElement?.matches?.(SEL)) onFocusIn({ target: document.activeElement });
  pull();

  const cleanup = () => {
    document.removeEventListener("focusin", onFocusIn, true);
    document.removeEventListener("focusout", onFocusOut, true);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("compositionstart", onCompose, true);
    document.removeEventListener("compositionupdate", onCompose, true);
    document.removeEventListener("compositionend", onCompose, true);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("click", onClickSend, true);
    document.removeEventListener("keyup", schedule, true);
    document.removeEventListener("pointerup", schedule, true);
    document.removeEventListener("selectionchange", schedule);
    document.removeEventListener("scroll", schedule, { capture: true });
    document.removeEventListener("pointerdown", onDocDown, true);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pagehide", onHide);
    onHide();
    ro.disconnect();
    cancelAnimationFrame(raf);
    clearInterval(pvTimer);
    timers.forEach(clearTimeout);
    timers.clear();
    [main.el, mirror, panel, fab, fxLayer, style].forEach((e) => e.remove());
    for (const u of blobUrls.values()) if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    blobUrls.clear();
    root.classList.remove("kb-hidecaret");
    delete window.__kkjBuddy;
  };

  window.__kkjBuddy = { cleanup, open: () => togglePanel(true) };
  if (typeof marinara !== "undefined" && typeof marinara.onCleanup === "function") marinara.onCleanup(cleanup);
})();
