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
