(function () {
  var W = 800, H = 240, G = 196;          // largura, altura e linha do chão
  var GRAVITY = 0.0019, JUMP = -0.62;     // física (px e ms)

  var cv = document.getElementById('c');
  var ctx = cv.getContext('2d');

  var state = 'idle';                     // idle | running | over
  var dino, obs, clouds, bumps;
  var speed, score, hi = 0, gap, last, overAt = 0, legTimer = 0, legFrame = 0, wing = 0;

  try { hi = parseInt(localStorage.getItem('dino-hi'), 10) || 0; } catch (e) {}

  function css(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function reset() {
    dino = { x: 50, y: G - 48, w: 44, h: 48, vy: 0, ground: true, duck: false };
    obs = [];
    clouds = [{ x: 200, y: 50 }, { x: 520, y: 80 }, { x: 740, y: 40 }];
    bumps = [];
    for (var i = 0; i < 30; i++) bumps.push({ x: rand(0, W), y: G + rand(6, 16), w: rand(2, 8) });
    speed = 0.35;
    score = 0;
    gap = 400;
  }

  function start() {
    reset();
    state = 'running';
    last = performance.now();
  }

  function jump() {
    if (state === 'idle') return start();
    if (state === 'over') {
      if (performance.now() - overAt > 400) start();
      return;
    }
    if (dino.ground) {
      dino.vy = JUMP;
      dino.ground = false;
      dino.duck = false;
    }
  }

  function setDuck(on) {
    if (state !== 'running') return;
    dino.duck = on;
    if (!dino.ground && on) dino.fast = true;
    if (!on) dino.fast = false;
  }

  function spawn() {
    var bird = score > 250 && Math.random() < 0.3;
    if (bird) {
      var lift = [12, 40, 75][Math.floor(Math.random() * 3)];
      obs.push({ type: 'bird', x: W + 20, w: 42, h: 28, y: G - lift - 28 });
    } else {
      var n = 1 + Math.floor(Math.random() * 3);
      var h = Math.random() < 0.5 ? 36 : 48;
      obs.push({ type: 'cactus', x: W + 20, w: n * 18 - 2, h: h, y: G - h, n: n });
    }
    gap = rand(300, 520) + speed * 450;
  }

  function hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function update(dt) {
    speed = Math.min(0.85, 0.35 + score * 0.00025);
    score += speed * dt * 0.04;

    // dinossauro
    if (dino.duck && dino.ground) { dino.w = 56; dino.h = 28; }
    else { dino.w = 44; dino.h = 48; }
    if (!dino.ground) {
      dino.vy += GRAVITY * (dino.fast ? 3 : 1) * dt;
      dino.y += dino.vy * dt;
      if (dino.y >= G - dino.h) { dino.y = G - dino.h; dino.vy = 0; dino.ground = true; dino.fast = false; }
    } else {
      dino.y = G - dino.h;
    }

    legTimer += dt;
    if (legTimer > 100) { legTimer = 0; legFrame = 1 - legFrame; wing = 1 - wing; }

    // obstáculos
    gap -= speed * dt;
    if (gap <= 0) spawn();
    obs.forEach(function (o) { o.x -= speed * dt * (o.type === 'bird' ? 1.15 : 1); });
    obs = obs.filter(function (o) { return o.x + o.w > -20; });

    // cenário
    clouds.forEach(function (c) { c.x -= speed * dt * 0.2; if (c.x < -60) { c.x = W + rand(0, 100); c.y = rand(30, 90); } });
    bumps.forEach(function (b) { b.x -= speed * dt; if (b.x < -10) { b.x = W + rand(0, 40); b.y = G + rand(6, 16); } });

    // colisão (caixa um pouco menor que o desenho)
    var box = { x: dino.x + 6, y: dino.y + 4, w: dino.w - 12, h: dino.h - 8 };
    for (var i = 0; i < obs.length; i++) {
      var o = obs[i];
      if (hit(box, { x: o.x + 3, y: o.y + 3, w: o.w - 6, h: o.h - 6 })) return die();
    }
  }

  function die() {
    state = 'over';
    overAt = performance.now();
    var s = Math.floor(score);
    if (s > hi) {
      hi = s;
      try { localStorage.setItem('dino-hi', hi); } catch (e) {}
    }
  }

  function r(x, y, w, h) { ctx.fillRect(Math.round(x), Math.round(y), w, h); }

  function drawDino() {
    var d = dino, x = d.x, y = d.y, ink = css('--ink'), bg = css('--bg');
    ctx.fillStyle = ink;
    var a = d.ground && state === 'running' ? legFrame : 0;
    if (d.duck && d.ground) {
      r(x + 2, y + 8, 40, 14);        // corpo
      r(x, y + 10, 8, 6);             // cauda
      r(x + 34, y, 22, 16);           // cabeça
      r(x + 10, y + 22, 8, a ? 6 : 3);
      r(x + 26, y + 22, 8, a ? 3 : 6);
      ctx.fillStyle = bg;
      r(x + 46, y + 3, 4, 4);         // olho
      r(x + 44, y + 11, 12, 2);       // boca
    } else {
      r(x + 8, y + 16, 26, 22);       // corpo
      r(x, y + 18, 10, 8);            // cauda
      r(x + 22, y, 22, 20);           // cabeça
      r(x + 30, y + 28, 8, 4);        // braço
      r(x + 12, y + 38, 8, a ? 10 : 6);
      r(x + 26, y + 38, 8, a ? 6 : 10);
      ctx.fillStyle = bg;
      r(x + 36, y + 4, 4, 4);         // olho
      r(x + 34, y + 14, 10, 2);       // boca
    }
  }

  function drawObs(o) {
    ctx.fillStyle = css('--ink');
    if (o.type === 'cactus') {
      for (var i = 0; i < o.n; i++) {
        var sx = o.x + i * 18;
        r(sx + 4, o.y, 8, o.h);                 // tronco
        r(sx, o.y + 12, 4, 10); r(sx, o.y + 18, 8, 4);    // braço esquerdo
        r(sx + 12, o.y + 16, 4, 10); r(sx + 8, o.y + 22, 8, 4); // braço direito
      }
    } else {
      r(o.x + 8, o.y + 10, 26, 10);             // corpo
      r(o.x, o.y + 8, 10, 8);                   // cabeça
      r(o.x + 34, o.y + 12, 8, 4);              // cauda
      if (wing) r(o.x + 14, o.y, 10, 12); else r(o.x + 14, o.y + 18, 10, 10); // asa
    }
  }

  function pad(n) { n = String(Math.floor(n)); while (n.length < 5) n = '0' + n; return n; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var ink = css('--ink'), muted = css('--muted');

    // nuvens
    ctx.fillStyle = muted;
    clouds.forEach(function (c) { r(c.x, c.y, 46, 10); r(c.x + 10, c.y - 8, 24, 10); });

    // chão
    ctx.fillStyle = ink;
    r(0, G, W, 2);
    bumps.forEach(function (b) { r(b.x, b.y, b.w, 2); });

    obs.forEach(drawObs);
    drawDino();

    // placar
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = muted;
    ctx.fillText('HI ' + pad(hi), W - 120, 30);
    ctx.fillStyle = ink;
    ctx.fillText(pad(score), W - 20, 30);

    ctx.textAlign = 'center';
    if (state === 'idle') {
      ctx.fillStyle = ink;
      ctx.fillText('Aperte espaço para começar', W / 2, 110);
    } else if (state === 'over') {
      ctx.fillStyle = ink;
      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.fillText('FIM DE JOGO', W / 2, 100);
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillText('Espaço ou toque para jogar de novo', W / 2, 130);
    }
  }

  function frame(t) {
    if (state === 'running') {
      var dt = Math.min(50, t - last);
      last = t;
      update(dt);
    }
    draw();
    requestAnimationFrame(frame);
  }

  // teclado
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (k === ' ' || k === 'arrowup' || k === 'w') { e.preventDefault(); if (!e.repeat) jump(); }
    else if (k === 'arrowdown' || k === 's') { e.preventDefault(); setDuck(true); }
  });
  document.addEventListener('keyup', function (e) {
    var k = e.key.toLowerCase();
    if (k === 'arrowdown' || k === 's') setDuck(false);
  });

  // toque na tela e botões
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
  var bj = document.getElementById('jump'), bd = document.getElementById('duck');
  bj.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
  bd.addEventListener('pointerdown', function (e) { e.preventDefault(); setDuck(true); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
    bd.addEventListener(ev, function () { setDuck(false); });
  });

  reset();
  requestAnimationFrame(frame);
})();
