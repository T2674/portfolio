/* 一卷胶片 · 一镜到底作品集 */
'use strict';
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- 作品数据：在这里替换/增删你的作品 ---------- */
      const WORKS = [
      { group:'毕业动画', type:'video', video:'assets/videos/video-03.mp4', src:'assets/works/video-poster-03.webp', title:'毕业动画《光影传承》', tag:'动画短片 · 视频', orient:'landscape', desc:'毕业设计动画短片，时长 2 分 45 秒，点击播放。' },
      { group:'精品漫剧', type:'video', video:'assets/videos/video-02.mp4', src:'assets/works/video-poster-02.webp', title:'精品漫剧 01',           tag:'AI 漫剧 · 视频', orient:'portrait',  desc:'竖屏 AI 漫剧，时长 1 分 22 秒，点击播放。' },
      { group:'精品漫剧', type:'video', video:'assets/videos/video-01.mp4', src:'assets/works/video-poster-01.webp', title:'精品漫剧 02',           tag:'AI 漫剧 · 视频', orient:'landscape', desc:'AI 漫剧片段，时长 54 秒，点击播放。' },
      { group:'厚涂 · 插画', src:'assets/works/paint-01.webp',  title:'厚涂作品 01',        tag:'厚涂 / 插画', orient:'portrait',  desc:'厚涂方向作品，点击可放大查看细节。' },
      { group:'厚涂 · 插画', src:'assets/works/paint-02.webp',  title:'厚涂作品 02',        tag:'厚涂 / 插画', orient:'portrait',  desc:'厚涂方向作品，点击可放大查看细节。' },
      { group:'厚涂 · 插画', src:'assets/works/paint-03.webp',  title:'厚涂作品 03',        tag:'厚涂 / 插画', orient:'portrait',  desc:'厚涂方向作品，点击可放大查看细节。' },
      { group:'3D 建模', src:'assets/works/model-01.webp',  title:'建模作品 01',        tag:'3D 建模',     orient:'square',    desc:'3D 建模作品，点击可放大查看。' },
      { group:'3D 建模', src:'assets/works/model-02.webp',  title:'建模作品 02',        tag:'3D 建模',     orient:'square',    desc:'3D 建模作品，点击可放大查看。' },
      { group:'AI 漫剧 · 画面', src:'assets/works/manhua-01.webp', title:'AI 漫剧 · 画面 01',  tag:'AI 漫剧',     orient:'portrait',  desc:'AI 漫剧项目画面，点击可放大查看。' },
      { group:'AI 漫剧 · 画面', src:'assets/works/manhua-02.webp', title:'AI 漫剧 · 画面 02',  tag:'AI 漫剧',     orient:'portrait',  desc:'AI 漫剧项目画面，点击可放大查看。' },
      { group:'AI 漫剧 · 画面', src:'assets/works/manhua-03.webp', title:'AI 漫剧 · 场景 03',  tag:'AI 漫剧',     orient:'landscape', desc:'AI 漫剧项目场景，点击可放大查看。' },
      { group:'AI 漫剧 · 画面', src:'assets/works/manhua-04.webp', title:'AI 漫剧 · 场景 04',  tag:'AI 漫剧',     orient:'landscape', desc:'AI 漫剧项目场景，点击可放大查看。' }
    ];


  const SECTIONS = [
    { id:'about',   label:'关于我' },
    { id:'skills',  label:'能力' },
    { id:'works',   label:'作品' },
    { id:'contact', label:'联系' }
  ];

  /* ---------- 渲染作品网格（按分类分组） ---------- */
  const grid = $('#workGrid');
  const groupNames = [];
  WORKS.forEach((w) => {
    const n = w.group || '作品';
    if (groupNames.indexOf(n) === -1) groupNames.push(n);
  });
  groupNames.forEach((name) => {
    const sec = document.createElement('section');
    sec.className = 'work-group';
    const title = document.createElement('h3');
    title.className = 'work-group-title reveal';
    title.textContent = name;
    sec.appendChild(title);
    const g = document.createElement('div');
    g.className = 'work-grid';
    sec.appendChild(g);
    WORKS.forEach((w) => {
      if ((w.group || '作品') !== name) return;
      const index = WORKS.indexOf(w);
      const card = document.createElement('article');
      card.className = 'work-card reveal' + (w.orient ? ' is-' + w.orient : '');
      card.dataset.index = index;
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', w.title);
      const media = (w.type === 'video')
        ? '<video muted loop playsinline preload="none" poster="' + w.src + '" src="' + w.video + '"></video><span class="play-badge">▶</span>'
        : '<img loading="lazy" src="' + w.src + '" alt="' + w.title + '" />';
      card.innerHTML =
        '<div class="work-media">' + media + '</div>' +
        '<div class="work-info"><span class="work-tag">' + w.tag + '</span><h3 class="work-title">' + w.title + '</h3></div>';
      if (w.type === 'video'){
        const vid = card.querySelector('video');
        card.addEventListener('mouseenter', () => { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {}); });
        card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
      }
      g.appendChild(card);
    });
    grid.appendChild(sec);
  });

  /* ---------- 预加载（放映前） ---------- */
  const btnOpen = $('#btnOpen');
  const btnText = $('.btn-open-text', btnOpen);
  const assets = ['assets/refs/character-green.webp', 'assets/refs/character-half.webp']
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
  let loadDone = false;
  function finishLoad(){
    if (loadDone) return;
    loadDone = true;
    const wait = Math.max(0, 450 - (performance.now() - t0));
    setTimeout(() => {
      document.body.classList.add('ready');
      btnOpen.disabled = false;
      btnText.textContent = '⏸ 暂停放映';
      // 无条件自动放映（不再判断滚动位置，任何情况下都自动开始）
      setTimeout(() => {
        if (!reel.playing && !reel.finished && !reel.paused) startReel();
      }, 900);
    }, wait);
  }
  // 兜底：素材再慢也确保 3 秒后自动开演
  setTimeout(finishLoad, 3000);
  assets.forEach(src => {
    const im = new Image();
    im.onload = tickLoad;
    im.onerror = tickLoad;
    im.src = src;
  });

  /* ---------- 一卷胶片 · 开场（逐格推进 · 循环播放） ---------- */
  const stage = $('#reelStage');
  const strip = $('#filmStrip');
  const viewport = $('.reel-viewport', stage);
  const caption = $('#reelCaption');
  const flash = $('#flash');

  // 胶片内容：作品格（无片头倒数）
  const spacer = document.createElement('div');
  spacer.className = 'frame-spacer';
  strip.appendChild(spacer);
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

  const reel = {
    all: [], index: 0, focusX: 0, cycle: 0,
    playing: false, paused: false, finished: false,
    moveRaf: null, holdTimer: null, loopTimer: null
  };
  const MOVE = reduceMotion ? 1 : 340;      // 每格移动时长(ms)
  const HOLD = reduceMotion ? 20 : 430;     // 每格停顿(ms)
  const LOOP_HOLD = 900;                    // 一轮结束后的停留(ms)
  const REWIND = reduceMotion ? 10 : 700;   // 回卷时长(ms)

  function clearTimers(){
    if (reel.moveRaf){ cancelAnimationFrame(reel.moveRaf); reel.moveRaf = null; }
    if (reel.holdTimer){ clearTimeout(reel.holdTimer); reel.holdTimer = null; }
    if (reel.loopTimer){ clearTimeout(reel.loopTimer); reel.loopTimer = null; }
  }

  function setStripX(x){
    strip.dataset.x = String(x);
    strip.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
  }

  function resetReel(){
    clearTimers();
    reel.playing = false; reel.finished = false; reel.index = 0;
    strip.style.transition = '';
    strip.style.opacity = '';
    setStripX(0);
    frames().forEach(f => f.classList.remove('lit'));
    stage.classList.remove('is-playing', 'is-end', 'is-end-soft');
    caption.textContent = '胶片已装填 · 即将自动放映';
  }

  function moveTo(idx, done){
    const f = reel.all[idx];
    if (!f){ done(); return; }
    const target = -(f.offsetLeft + f.offsetWidth / 2 - reel.focusX);
    const from = parseFloat(strip.dataset.x || '0');
    const t0 = performance.now();
    function tween(now){
      if (reel.paused){ done(); return; }
      const p = Math.min(1, (now - t0) / MOVE);
      const e = 1 - Math.pow(1 - p, 3);
      setStripX(from + (target - from) * e);
      if (p < 1){ reel.moveRaf = requestAnimationFrame(tween); }
      else { reel.moveRaf = null; done(); }
    }
    reel.moveRaf = requestAnimationFrame(tween);
  }

  function stepFrame(){
    if (reel.paused) return;
    if (reel.index >= reel.all.length){ finishCycle(); return; }
    const f = reel.all[reel.index];
    const idx = Number(f.dataset.index);
    caption.textContent = 'FRAME ' + String(reel.index + 1).padStart(2, '0') + ' / ' + WORKS.length +
                          ' · ' + (WORKS[idx] ? WORKS[idx].title : '');
    moveTo(reel.index, () => {
      if (reel.paused) return;
      f.classList.add('lit');
      reel.index++;
      reel.holdTimer = setTimeout(stepFrame, HOLD);
    });
  }

  function startReel(){
    if (reel.playing || reel.paused) return;
    reel.all = frames();
    reel.focusX = viewport.clientWidth * 0.62;
    reel.playing = true; reel.finished = false;
    stage.classList.add('is-playing');
    stage.classList.remove('is-end-soft', 'is-end');
    btnOpen.disabled = false;
    btnText.textContent = '⏸ 暂停放映';
    stepFrame();
  }

  function finishCycle(){
    reel.playing = false; reel.finished = true;
    frames().forEach(f => f.classList.add('lit'));
    stage.classList.add('is-end-soft');
    flash.classList.add('on');
    setTimeout(() => flash.classList.remove('on'), 900);

    if (reel.paused) return;

    reel.cycle++;
    caption.textContent = '第 ' + reel.cycle + ' 轮放映结束 · 正在回卷…';
    reel.loopTimer = setTimeout(() => {
      if (reel.paused) return;
      // 胶片回卷：快速退回起点
      strip.style.transition = 'transform ' + REWIND + 'ms cubic-bezier(.5,0,.2,1), opacity .35s';
      strip.style.opacity = '.22';
      setStripX(0);
      reel.loopTimer = setTimeout(() => {
        if (reel.paused) return;
        strip.style.transition = 'opacity .4s';
        strip.style.opacity = '';
        reel.loopTimer = setTimeout(() => {
          if (reel.paused) return;
          resetReel();
          startReel();
        }, 420);
      }, REWIND);
    }, LOOP_HOLD);
  }

  function togglePause(){
    if (reel.paused){
      reel.paused = false;
      stage.classList.remove('is-end-soft', 'is-end');
      btnText.textContent = '⏸ 暂停放映';
      if (reel.finished){ resetReel(); startReel(); }
      else { startReel(); }
    } else {
      reel.paused = true;
      clearTimers();
      reel.playing = false;
      stage.classList.remove('is-playing');
      btnText.textContent = '▶ 继续放映';
      caption.textContent = '已暂停 · 点「继续放映」接着放';
    }
  }

  btnOpen.addEventListener('click', togglePause);
  viewport.addEventListener('click', togglePause);
  $('#btnReplay').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => {
      reel.paused = false;
      resetReel();
      btnText.textContent = '⏸ 暂停放映';
      setTimeout(() => { if (!reel.paused) startReel(); }, 420);
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
  const lbVideo = $('#lbVideo');
  const lbTag = $('#lbTag');
  const lbTitle = $('#lbTitle');
  const lbDesc = $('#lbDesc');
  let lbIndex = 0;
  function showLb(i){
    lbIndex = (i + WORKS.length) % WORKS.length;
    const w = WORKS[lbIndex];
    if (w.type === 'video'){
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.poster = w.src;
      lbVideo.src = w.video;
      const pr = lbVideo.play(); if (pr && pr.catch) pr.catch(() => {});
    } else {
      if (lbVideo){ lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.style.display = 'none'; }
      lbImg.style.display = '';
      lbImg.src = w.src;
      lbImg.alt = w.title;
    }
    lbTag.textContent = w.tag;
    lbTitle.textContent = w.title;
    lbDesc.textContent = w.desc;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb(){
    if (lbVideo) lbVideo.pause();
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.work-card');
    if (!card) return;
    showLb(Number(card.dataset.index));
  });
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      const card = e.target.closest('.work-card');
      if (card){
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