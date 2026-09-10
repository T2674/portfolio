/* 一卷胶片 · 一镜到底作品集 */
'use strict';
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- 作品数据：在这里替换/增删你的作品 ---------- */
  const WORKS = [
    { src:'assets/refs/character-line.png',  title:'角色设定 · 黑白线稿',  tag:'角色设计', desc:'从干净的线条开始定义角色：圆框眼镜、利落发型，气质先落在纸上。' },
    { src:'assets/refs/character-face.jpg',  title:'角色 · 正面形象参考',  tag:'角色设计', desc:'面向镜头的标准形象：黑框圆眼镜 + 黑色圆领衫，松弛但认真的少年感。' },
    { src:'assets/refs/character-half.jpg',  title:'角色 · 半身形象',      tag:'角色 / 头像', desc:'常用半身形象，作为头像与开场角色出现在作品集各处。' },
    { src:'assets/refs/character-green.jpg', title:'角色 · 深绿变装 · 片头主视觉', tag:'角色 / 场景', desc:'深绿色调变装版本，在“一卷胶片”开场里担任出镜的演员。' },
    { src:'assets/refs/ref-02.jpg',          title:'氛围 / 光影参考',      tag:'光影',       desc:'低光氛围参考：暗部里的轮廓与高光，是讲故事时最在意的部分。' },
    { src:'assets/refs/ref-01.jpg',          title:'草图 / 动态参考 01',   tag:'草图',       desc:'动态草图参考之一，捕捉运动瞬间的张力。' },
    { src:'assets/refs/ref-03.jpg',          title:'草图 / 动态参考 02',   tag:'草图',       desc:'动态草图参考之二，练习形体与节奏。' }
  ];

  const SECTIONS = [
    { id:'about',   label:'关于我' },
    { id:'skills',  label:'能力' },
    { id:'works',   label:'作品' },
    { id:'contact', label:'联系' }
  ];

  /* ---------- 渲染作品网格 ---------- */
  const grid = $('#workGrid');
  WORKS.forEach((w, i) => {
    const card = document.createElement('article');
    card.className = 'work-card reveal';
    card.dataset.index = i;
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', w.title);
    card.innerHTML =
      '<div class="work-media"><img loading="lazy" src="' + w.src + '" alt="' + w.title + '" /></div>' +
      '<div class="work-info"><span class="work-tag">' + w.tag + '</span><h3 class="work-title">' + w.title + '</h3></div>';
    grid.appendChild(card);
  });
  const more = document.createElement('article');
  more.className = 'work-card work-card--more reveal';
  more.innerHTML = '<div class="more-body"><span class="more-plus">＋</span><h3>更多作品位</h3><p>把作品封面放进 assets/works 后，在 main.js 的 WORKS 里加一行即可。</p></div>';
  grid.appendChild(more);

  /* ---------- 预加载（放映前） ---------- */
  const btnOpen = $('#btnOpen');
  const btnText = $('.btn-open-text', btnOpen);
  const assets = ['assets/refs/character-green.jpg', 'assets/refs/character-half.jpg']
    .concat(WORKS.map(w => w.src));
  let loaded = 0;
  const total = assets.length;
  const t0 = performance.now();
  function tickLoad(){
    loaded++;
    const pct = Math.round(loaded / total * 100);
    btnText.textContent = '正在装载胶片… ' + pct + '%';
    if (loaded >= total) finishLoad();
  }
  function finishLoad(){
    const wait = Math.max(0, 650 - (performance.now() - t0));
    setTimeout(() => {
      document.body.classList.add('ready');
      btnOpen.disabled = false;
      btnText.textContent = '🎞 开始放映';
      // 自动放映：等标题入场后再开演；若观众已经往下滚，则不打扰
      setTimeout(() => {
        if (!playing && !finished && window.scrollY < window.innerHeight * 0.5) playReel(true);
      }, 1000);
    }, wait);
  }
  assets.forEach(src => {
    const im = new Image();
    im.onload = tickLoad;
    im.onerror = tickLoad;
    im.src = src;
  });

  /* ---------- 一卷胶片 · 开场（逐格推进） ---------- */
  const stage = $('#reelStage');
  const strip = $('#filmStrip');
  const viewport = $('.reel-viewport', stage);
  const caption = $('#reelCaption');
  const flash = $('#flash');

  // 胶片内容：片头片（倒数 3·2·1）+ 作品格
  const spacer = document.createElement('div');
  spacer.className = 'frame-spacer';
  strip.appendChild(spacer);
  [3, 2, 1].forEach(n => {
    const d = document.createElement('div');
    d.className = 'frame frame-leader';
    d.innerHTML = '<span class="leader-num">' + n + '</span>';
    strip.appendChild(d);
  });
  WORKS.forEach((w, i) => {
    const d = document.createElement('div');
    d.className = 'frame';
    d.dataset.index = i;
    d.innerHTML = '<img loading="lazy" src="' + w.src + '" alt="' + w.title + '" />' +
                  '<span class="frame-no">' + String(i + 1).padStart(2, '0') + '</span>';
    strip.appendChild(d);
  });

  function sizeSpacer(){
    if (viewport && spacer) spacer.style.width = Math.round(viewport.clientWidth * 0.5) + 'px';
  }
  sizeSpacer();
  window.addEventListener('resize', sizeSpacer);

  const frames = () => $$('.frame', strip);
  let playing = false, finished = false, timer = null;

  function resetReel(){
    if (timer) clearTimeout(timer);
    timer = null; playing = false; finished = false;
    strip.dataset.x = '0';
    strip.style.transition = '';
    strip.style.transform = 'translateY(-50%)';
    strip.style.opacity = '';
    frames().forEach(f => f.classList.remove('lit'));
    stage.classList.remove('is-playing', 'is-end', 'is-end-soft');
    caption.textContent = '胶片已装填 · 即将自动放映';
  }

  function playReel(auto){
    if (playing || finished) return;
    if (!document.body.classList.contains('ready')) return;
    playing = true;
    btnOpen.disabled = true;
    btnText.textContent = '胶片放映中…';
    stage.classList.add('is-playing');

    const all = frames();
    const focusX = viewport.clientWidth * 0.62;
    const MOVE = reduceMotion ? 1 : 340;
    const HOLD = reduceMotion ? 20 : 430;
    let i = 0;

    function moveTo(idx, done){
      const f = all[idx];
      const target = -(f.offsetLeft + f.offsetWidth / 2 - focusX);
      const from = parseFloat(strip.dataset.x || '0');
      const t0 = performance.now();
      function tween(now){
        const p = Math.min(1, (now - t0) / MOVE);
        const e = 1 - Math.pow(1 - p, 3);
        const x = from + (target - from) * e;
        strip.dataset.x = String(x);
        strip.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
        if (p < 1) requestAnimationFrame(tween); else done();
      }
      requestAnimationFrame(tween);
    }

    function stepFrame(){
      if (i >= all.length){ finishReel(auto); return; }
      const f = all[i];
      if (f.classList.contains('frame-leader')){
        const n = $('.leader-num', f);
        const num = n ? Number(n.textContent) : 0;
        caption.textContent = '倒数 ' + num + ' · 准备放映';
      } else {
        const idx = Number(f.dataset.index);
        caption.textContent = 'FRAME ' + String(i - 2).padStart(2, '0') + ' / ' + WORKS.length +
                              ' · ' + (WORKS[idx] ? WORKS[idx].title : '');
      }
      moveTo(i, () => {
        f.classList.add('lit');
        i++;
        timer = setTimeout(stepFrame, HOLD);
      });
    }
    stepFrame();
  }

  function finishReel(auto){
    if (timer) clearTimeout(timer);
    playing = false; finished = true;
    btnOpen.disabled = false;
    flash.classList.add('on');
    setTimeout(() => flash.classList.remove('on'), 1000);

    if (auto){
      // 自动播放：留在开场，把主导权交还给观众
      stage.classList.add('is-end-soft');
      frames().forEach(f => f.classList.add('lit'));
      caption.textContent = '放映完毕 · 向下滚动，走进我的世界 ↓';
      btnText.textContent = '↺ 重新放映';
    } else {
      // 手动点击：卷片收尾，并顺畅滚入「关于我」
      stage.classList.add('is-end');
      strip.style.transition = 'transform 1s var(--ease), opacity .8s ease .15s';
      strip.style.transform = 'translateY(-50%) scale(.42) rotate(-14deg)';
      strip.style.opacity = '0';
      btnText.textContent = '放映结束 · 进入我的世界 ↓';
      setTimeout(() => {
        const about = $('#about');
        if (about) about.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }, 800);
    }
  }

  function playManually(){
    if (finished) resetReel();
    playReel(false);
  }
  btnOpen.addEventListener('click', playManually);
  viewport.addEventListener('click', playManually);
  $('#btnReplay').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => {
      resetReel();
      btnText.textContent = '🎞 开始放映';
      setTimeout(() => { if (!playing && !finished) playReel(true); }, 500);
    }, 650);
  });

  /* ---------- 滚动进度 + 左侧角色 rail ---------- */
  const rail = $('#rail');
  const railFill = $('#railFill');
  const railMarker = $('#railMarker');
  const railLabel = $('#railLabel');
  const stopsBox = $('#railStops');
  const progressBar = $('#progressBar');
  const hint = $('.hint');

  const lineH = 200;
  const step = lineH / (SECTIONS.length - 1);
  const dots = [];
  SECTIONS.forEach((s, i) => {
    const d = document.createElement('span');
    d.className = 'rail-dot' + (i === 0 ? ' on' : '');
    d.style.top = (i * step) + 'px';
    d.title = s.label;
    stopsBox.appendChild(d);
    dots.push(d);
  });
  function updateRail(){
    const vh = window.innerHeight;
    let active = 0;
    SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= vh * 0.55) active = i;
    });
    const y = active * step;
    dots.forEach((d, i) => d.classList.toggle('on', i === active));
    railFill.style.height = (y + 6) + 'px';
    railMarker.style.top = y + 'px';
    if (window.innerWidth >= 1320) railMarker.classList.add('show');
    else railMarker.classList.remove('show');
    railLabel.textContent = SECTIONS[active].label;
  }
  function updateProgress(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progressBar.style.width = (p * 100) + '%';
    if (window.scrollY > 24) hint.style.opacity = '0';
    else hint.style.opacity = '';
  }
  let ticking = false;
  function onScroll(){
    if (!ticking){
      ticking = true;
      requestAnimationFrame(() => {
        updateRail();
        updateProgress();
        ticking = false;
      });
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', () => { updateRail(); updateProgress(); });

  /* ---------- 出场动画 ---------- */
  function observeReveals(){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }
  observeReveals();

  /* ---------- 灯箱 ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbTag = $('#lbTag');
  const lbTitle = $('#lbTitle');
  const lbDesc = $('#lbDesc');
  let lbIndex = 0;
  function showLb(i){
    lbIndex = (i + WORKS.length) % WORKS.length;
    const w = WORKS[lbIndex];
    lbImg.src = w.src;
    lbImg.alt = w.title;
    lbTag.textContent = w.tag;
    lbTitle.textContent = w.title;
    lbDesc.textContent = w.desc;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.work-card');
    if (!card || card.classList.contains('work-card--more')) return;
    showLb(Number(card.dataset.index));
  });
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      const card = e.target.closest('.work-card');
      if (card && !card.classList.contains('work-card--more')){
        e.preventDefault();
        showLb(Number(card.dataset.index));
      }
    }
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => showLb(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showLb(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });

  /* ---------- 星空背景 ---------- */
  const canvas = $('#stars');
  const ctx = canvas.getContext('2d');
  let stars = [];
  function sizeCanvas(){
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(180, Math.floor(innerWidth / 11));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.3 + 0.3,
      base: Math.random() * 0.5 + 0.25,
      amp: Math.random() * 0.35 + 0.1,
      speed: Math.random() * 1.4 + 0.4,
      phase: Math.random() * Math.PI * 2,
      vy: Math.random() * 0.12 + 0.02
    }));
  }
  let t = 0;
  function drawStars(){
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of stars){
      s.y += s.vy;
      if (s.y > innerHeight + 4){ s.y = -4; s.x = Math.random() * innerWidth; }
      const a = Math.max(0, Math.min(1, s.base + Math.sin(t * s.speed + s.phase) * s.amp));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#d8fff0';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    t += 0.016;
    if (!reduceMotion) requestAnimationFrame(drawStars);
  }
  sizeCanvas();
  drawStars();
  window.addEventListener('resize', () => { sizeCanvas(); });

  // 初始化
  updateRail();
  updateProgress();
})();