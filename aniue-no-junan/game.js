/* ============================================================
   兄上の受難 〜真田信之 胃痛サバイバル〜
   苦労人の長男を操作し、降りかかる無茶振りから胃を守るゲーム
   ============================================================ */
(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const stage = document.getElementById("stage");

  const $ = (id) => document.getElementById(id);
  const hud = $("hud");
  const scoreEl = $("score");
  const dayEl = $("day");
  const gaugeFill = $("gauge-fill");
  const gaugeFace = $("gauge-face");
  const bubble = $("bubble");
  const bubbleText = $("bubble-text");
  const titleScreen = $("title-screen");
  const overScreen = $("over-screen");

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---------------- ぼやきセリフ集 ---------------- */
  const LINES = {
    hitFather: [
      "父上ぇぇぇ!?",
      "父上はいつもそうだ!",
      "聞いておらんぞ、私は!",
      "また策ですか…策なんですね…",
      "なぜ先に相談してくれないんです!",
      "その策、私の胃に悪いやつでは?",
    ],
    hitBrother: [
      "源次郎ぉぉ! 落ち着け!",
      "源次郎、お前はずるいぞ!",
      "兄は心配なのだ!",
      "弟よ…兄の身にもなってくれ…",
      "格好いいのはお前だけだ!",
      "待て待て待て待て!",
    ],
    hitDamare: [
      "黙れ小童って言われた…",
      "小童じゃないです、もう当主です…",
      "今日も言われたなぁ…",
      "…はい、黙ります…",
    ],
    heal: [
      "はぁ〜…沁みる…",
      "生き返る〜…",
      "これだよこれ…",
      "少し落ち着こう、うん。",
    ],
    healWife: [
      "稲! ありがたい…!",
      "妻だけが味方だ…",
      "家族っていいなぁ(一部を除く)",
    ],
    coin: [
      "六文銭、回収っと。",
      "蓄えは大事。長男だから。",
      "地味にコツコツ、それが私。",
    ],
    danger: [
      "胃が…胃がぁ…",
      "薬師(くすし)ーー!!",
      "もう帰っていいかな…",
    ],
    levelUp: [
      "嫌な予感しかしない…",
      "まだ続くの!?",
      "兄は辛いのだよ…",
      "うちの家族、元気すぎる…",
    ],
    rush: [
      "うわっ、評定が荒れてる!!",
      "一斉に来るなぁぁ!?",
    ],
  };

  /* 石高の節目で飛び出す名言(雰囲気重視の意訳含む) */
  const MILESTONES = [
    { at: 800,   text: "私は、徳川につく!" },
    { at: 2000,  text: "源三郎ではない、伊豆守信幸である!" },
    { at: 4000,  text: "父上と袂を分かつ…これも家のため!" },
    { at: 7000,  text: "真田の家は、この私が守る!" },
    { at: 11000, text: "真田は決して滅びぬ!" },
    { at: 15000, text: "九十三まで生きてやるぞ!" },
  ];
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  /* ---------------- 落下物の定義 ---------------- */
  const KIND = {
    FATHER: { emoji: "📜", label: "父の策", bad: true,  dmg: 20, lines: "hitFather", w: 1.1 },
    FIRE:   { emoji: "🔥", label: "弟の暴走", bad: true,  dmg: 24, lines: "hitBrother", w: 0.9 },
    DAMARE: { emoji: "💢", label: "黙れ小童", bad: true,  dmg: 30, lines: "hitDamare", w: 0.8 },
    TEA:    { emoji: "🍵", label: "茶", bad: false, heal: 14, score: 100, lines: "heal", w: 0.5 },
    RICE:   { emoji: "🍙", label: "兵糧", bad: false, heal: 9,  score: 70,  lines: "heal", w: 0.55 },
    LETTER: { emoji: "💌", label: "稲の文", bad: false, heal: 28, score: 200, lines: "healWife", w: 0.18 },
    COIN:   { emoji: "🪙", label: "六文銭", bad: false, heal: 0,  score: 150, lines: "coin", w: 0.45 },
  };
  const KIND_KEYS = Object.keys(KIND);

  /* ---------------- ゲーム状態 ---------------- */
  const G = {
    running: false,
    t: 0,              // 経過秒
    score: 0,
    gut: 100,          // 胃ゲージ
    px: 0,             // プレイヤーx
    targetX: 0,
    vx: 0,
    items: [],
    pops: [],          // 浮き上がるスコア文字
    spawnTimer: 0,
    level: 1,
    combo: 0,
    face: "normal",    // normal | ouch | happy
    faceTimer: 0,
    rushTimer: 0,      // 評定ラッシュ(イベント)
    nextRush: 25,
    milestone: 0,      // 次に出す名言のindex
    best: +(localStorage.getItem("aniue_best") || 0),
    plays: +(localStorage.getItem("aniue_plays") || 0),
  };

  const PLAYER = { w: 64, h: 78, y: () => H - 108 };

  /* ---------------- 入力 ---------------- */
  const keys = {};
  addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if ((e.key === " " || e.key === "Enter") && !G.running) {
      if (!titleScreen.classList.contains("hidden")) startGame();
      else if (!overScreen.classList.contains("hidden")) startGame();
    }
  });
  addEventListener("keyup", (e) => (keys[e.key] = false));

  const onTouch = (e) => {
    const t = e.touches ? e.touches[0] : e;
    const rect = stage.getBoundingClientRect();
    G.targetX = t.clientX - rect.left;
  };
  stage.addEventListener("touchstart", onTouch, { passive: true });
  stage.addEventListener("touchmove", onTouch, { passive: true });
  stage.addEventListener("mousedown", onTouch);
  stage.addEventListener("mousemove", (e) => { if (e.buttons) onTouch(e); });

  /* ---------------- 吹き出し ---------------- */
  let bubbleTimer = null;
  function say(text, angry = false, ms = 1500) {
    bubbleText.textContent = text;
    bubble.classList.remove("hidden", "angry");
    if (angry) bubble.classList.add("angry");
    bubble.style.bottom = H - PLAYER.y() + 30 + "px";
    positionBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.add("hidden"), ms);
  }

  /* 吹き出しを信之に追従させる(画面端でははみ出さず、しっぽだけ頭上を指す) */
  function positionBubble() {
    if (bubble.classList.contains("hidden")) return;
    const w = bubble.offsetWidth;
    const margin = 8;
    const cx = Math.max(w / 2 + margin, Math.min(W - w / 2 - margin, G.px));
    bubble.style.left = cx + "px";
    const tail = Math.max(16, Math.min(w - 16, G.px - (cx - w / 2)));
    bubble.style.setProperty("--tail-x", tail + "px");
  }

  /* ---------------- 開始/終了 ---------------- */
  function startGame() {
    Object.assign(G, {
      running: true, t: 0, score: 0, gut: 100,
      items: [], pops: [], spawnTimer: 0, level: 1, combo: 0,
      face: "normal", faceTimer: 0, rushTimer: 0, nextRush: 25, milestone: 0,
      px: W / 2, targetX: W / 2, vx: 0,
    });
    G.plays++;
    localStorage.setItem("aniue_plays", G.plays);
    titleScreen.classList.add("hidden");
    overScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    say("…行くしかないのか。", false, 1300);
    last = performance.now();
    requestAnimationFrame(loop);
  }

  /* 評定ランク: 石高(スコア)に応じて変動 — 繰り返し遊んで上を目指す */
  const RANKS = [
    { min: 0,     rank: "犬伏で離脱",       quote: "胃が限界です。先に帰って薬湯を煎じます…" },
    { min: 1200,  rank: "沼田城 留守居",     quote: "城は守った。義父上は通さなかった。褒めて。" },
    { min: 3000,  rank: "沼田二万七千石",    quote: "地道にやってきた結果です。地道に、ね。" },
    { min: 6000,  rank: "上田九万五千石",    quote: "父上の城を継ぐ気持ち、複雑ですけどね…" },
    { min: 10000, rank: "松代十万石",       quote: "真田の家は、私が残す。それが兄の役目だ。" },
    { min: 16000, rank: "日の本一の苦労人",   quote: "弟が『日の本一の兵』なら、私は『日の本一の苦労人』。九十三まで生きてやる。" },
  ];

  function gameOver() {
    G.running = false;
    hud.classList.add("hidden");
    bubble.classList.add("hidden");

    const isBest = G.score > G.best;
    if (isBest) {
      G.best = G.score;
      localStorage.setItem("aniue_best", G.best);
    }
    const r = [...RANKS].reverse().find((r) => G.score >= r.min);
    $("over-rank").textContent = r.rank;
    $("over-score").innerHTML =
      `${G.score.toLocaleString()} 石` +
      (isBest ? ' <span style="color:var(--kin)">★新記録!</span>'
              : `<br><small style="font-size:14px;color:var(--ai)">最高 ${G.best.toLocaleString()} 石 / 通算 ${G.plays} 回目の受難</small>`);
    $("over-quote").textContent = r.quote;
    overScreen.classList.remove("hidden");
  }

  $("start-btn").addEventListener("click", startGame);
  $("about-btn").addEventListener("click", () => $("about-modal").classList.remove("hidden"));
  $("about-close").addEventListener("click", () => $("about-modal").classList.add("hidden"));
  $("about-modal").addEventListener("click", (e) => {
    if (e.target.id === "about-modal") $("about-modal").classList.add("hidden");
  });
  $("retry-btn").addEventListener("click", startGame);
  $("back-btn").addEventListener("click", () => {
    overScreen.classList.add("hidden");
    titleScreen.classList.remove("hidden");
  });

  /* ---------------- スポーン ---------------- */
  function spawnItem(forceBad = false) {
    let pool = KIND_KEYS;
    if (forceBad) pool = pool.filter((k) => KIND[k].bad);
    // 重み付き抽選
    const total = pool.reduce((s, k) => s + KIND[k].w, 0);
    let r = Math.random() * total, key = pool[0];
    for (const k of pool) { r -= KIND[k].w; if (r <= 0) { key = k; break; } }
    const def = KIND[key];
    const speed = (200 + G.level * 40 + Math.random() * 100) * (def.bad ? 1 : 0.9);
    G.items.push({
      key, def,
      x: 30 + Math.random() * (W - 60),
      y: -40,
      vy: speed,
      sway: Math.random() * Math.PI * 2,
      swayAmp: def.bad ? 18 + Math.random() * 22 : 8,
      r: 24,
    });
  }

  function addPop(x, y, text, color) {
    G.pops.push({ x, y, text, color, life: 1 });
  }

  /* ---------------- 更新 ---------------- */
  function update(dt) {
    G.t += dt;

    // レベル(=受難の日数)は12秒ごとに進む
    const newLevel = 1 + Math.floor(G.t / 12);
    if (newLevel !== G.level) {
      G.level = newLevel;
      dayEl.textContent = `受難 ${toKanji(G.level)}日目`;
      say(pick(LINES.levelUp), false, 1400);
    }

    // 評定ラッシュ: 一定間隔で悪い物が大量に降るイベント
    G.nextRush -= dt;
    if (G.nextRush <= 0) {
      G.rushTimer = 3.6;
      G.nextRush = 13 + Math.random() * 8;
      say(pick(LINES.rush), true, 1600);
    }
    if (G.rushTimer > 0) G.rushTimer -= dt;

    // 移動
    const speed = 460;
    if (keys.ArrowLeft || keys.a) { G.targetX = G.px - speed * dt * 1.6; }
    if (keys.ArrowRight || keys.d) { G.targetX = G.px + speed * dt * 1.6; }
    const dx = G.targetX - G.px;
    G.px += Math.max(-speed * dt, Math.min(speed * dt, dx));
    G.px = Math.max(PLAYER.w / 2, Math.min(W - PLAYER.w / 2, G.px));
    G.vx = dx; // 傾き表現用

    // スポーン
    G.spawnTimer -= dt;
    if (G.spawnTimer <= 0) {
      const interval = G.rushTimer > 0
        ? 0.18
        : Math.max(0.2, 0.78 - G.level * 0.06);
      G.spawnTimer = interval;
      spawnItem(G.rushTimer > 0 && Math.random() < 0.8);
    }

    // 落下物
    const py = PLAYER.y();
    for (let i = G.items.length - 1; i >= 0; i--) {
      const it = G.items[i];
      it.y += it.vy * dt;
      it.sway += dt * 3;
      it.x += Math.sin(it.sway) * it.swayAmp * dt;

      // 当たり判定
      const hitX = Math.abs(it.x - G.px) < (PLAYER.w / 2 + it.r * 0.7);
      const hitY = Math.abs(it.y - (py + PLAYER.h * 0.45)) < (PLAYER.h / 2 + it.r * 0.6);
      if (hitX && hitY) {
        G.items.splice(i, 1);
        const d = it.def;
        if (d.bad) {
          G.gut -= d.dmg;
          G.combo = 0;
          G.face = "ouch"; G.faceTimer = 0.7;
          say(pick(LINES[d.lines]), true);
          stage.classList.remove("shake");
          void stage.offsetWidth;
          stage.classList.add("shake");
          addPop(it.x, it.y, d.label + "!", "#a8252c");
          if (G.gut < 30 && G.gut > 0 && Math.random() < 0.5) {
            setTimeout(() => G.running && say(pick(LINES.danger), true), 900);
          }
        } else {
          G.combo++;
          const mult = 1 + Math.min(G.combo, 10) * 0.1;
          const gained = Math.round(d.score * mult);
          G.score += gained;
          G.gut = Math.min(100, G.gut + d.heal);
          G.face = "happy"; G.faceTimer = 0.6;
          if (Math.random() < 0.4) say(pick(LINES[d.lines]));
          addPop(it.x, it.y, `+${gained}石` + (G.combo >= 3 ? ` ${G.combo}連` : ""), "#8c6b1f");
        }
        continue;
      }
      // 画面外
      if (it.y > H + 50) {
        if (!it.def.bad) G.combo = 0; // 取り逃しでコンボ切れ
        G.items.splice(i, 1);
      }
    }

    // ポップ文字
    for (let i = G.pops.length - 1; i >= 0; i--) {
      const p = G.pops[i];
      p.life -= dt * 1.4;
      p.y -= dt * 50;
      if (p.life <= 0) G.pops.splice(i, 1);
    }

    // 石高の節目で名言が飛び出す
    if (G.milestone < MILESTONES.length && G.score >= MILESTONES[G.milestone].at) {
      const m = MILESTONES[G.milestone++];
      say(m.text, false, 2000);
      addPop(G.px, PLAYER.y() - 30, "名言!", "#c2912e");
      G.score += 200; // 名言ボーナス
    }

    // 表情タイマー
    if (G.faceTimer > 0) { G.faceTimer -= dt; if (G.faceTimer <= 0) G.face = "normal"; }

    // HUD反映
    scoreEl.textContent = G.score.toLocaleString();
    const g = Math.max(0, G.gut);
    gaugeFill.style.width = g + "%";
    gaugeFill.classList.toggle("danger", g < 30);
    gaugeFace.textContent = g > 65 ? "😌" : g > 30 ? "😣" : "🥴";

    positionBubble();

    if (G.gut <= 0) gameOver();
  }

  /* ---------------- 描画 ---------------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    for (const it of G.items) drawItem(it);
    drawPlayer();
    for (const p of G.pops) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.font = "bold 16px 'Yusei Magic', sans-serif";
      ctx.fillStyle = p.color;
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  function drawBackground() {
    // 遠景の山と城(シルエット)
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#2e3f55";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    ctx.quadraticCurveTo(W * 0.25, H * 0.6, W * 0.5, H * 0.74);
    ctx.quadraticCurveTo(W * 0.75, H * 0.62, W, H * 0.76);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.fill();
    // 城
    const cx = W * 0.8, cy = H * 0.72;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(cx - 22, cy - 26, 44, 26);
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 26); ctx.lineTo(cx, cy - 48); ctx.lineTo(cx + 30, cy - 26);
    ctx.fill();
    ctx.restore();

    // 地面
    ctx.fillStyle = "rgba(140,47,36,.08)";
    ctx.fillRect(0, H - 46, W, 46);
    ctx.strokeStyle = "rgba(43,37,32,.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 46); ctx.lineTo(W, H - 46);
    ctx.stroke();
  }

  function drawItem(it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(Math.sin(it.sway) * 0.2);
    ctx.globalAlpha = 1;

    // 札(バッジ): 良い物は生成り色、悪い物は赤
    ctx.fillStyle = it.def.bad ? "#a8252c" : "#fffdf6";
    ctx.strokeStyle = it.def.bad ? "#6e1a14" : "#2b2520";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, it.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = "28px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(it.def.emoji, 0, 1);

    // ラベル
    ctx.font = "bold 11px 'Yusei Magic', sans-serif";
    ctx.fillStyle = it.def.bad ? "#a8252c" : "#5c4a1e";
    ctx.fillText(it.def.label, 0, it.r + 12);
    ctx.restore();
  }

  /* 信之(ちょんまげ侍・苦労人顔)をベクター描画 */
  function drawPlayer() {
    const x = G.px, y = PLAYER.y();
    const tilt = Math.max(-0.18, Math.min(0.18, G.vx / 400));
    const bob = G.running ? Math.sin(G.t * 6) * 2 : 0;

    ctx.save();
    ctx.translate(x, y + PLAYER.h / 2 + bob);
    ctx.rotate(tilt);
    ctx.translate(0, -PLAYER.h / 2);

    // 影
    ctx.save();
    ctx.translate(0, PLAYER.h + 4 - bob);
    ctx.scale(1, 0.25);
    ctx.fillStyle = "rgba(43,37,32,.2)";
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 裃(かみしも) — 藍色
    ctx.fillStyle = "#2e3f55";
    ctx.beginPath();
    ctx.moveTo(-30, 78);
    ctx.lineTo(-24, 34);
    ctx.lineTo(-36, 28);   // 肩(左に張る)
    ctx.lineTo(-12, 20);
    ctx.lineTo(12, 20);
    ctx.lineTo(36, 28);    // 肩(右に張る)
    ctx.lineTo(24, 34);
    ctx.lineTo(30, 78);
    ctx.closePath();
    ctx.fill();

    // 襟
    ctx.strokeStyle = "#f3ead8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, 22); ctx.lineTo(0, 38); ctx.lineTo(8, 22);
    ctx.stroke();

    // 六文銭の家紋(胸)
    ctx.fillStyle = "#c2912e";
    for (let i = 0; i < 6; i++) {
      const gx = ((i % 3) - 1) * 7;
      const gy = 48 + Math.floor(i / 3) * 8;
      ctx.beginPath(); ctx.arc(gx, gy, 2.6, 0, Math.PI * 2); ctx.fill();
    }

    // 顔
    ctx.fillStyle = "#f0d9b8";
    ctx.beginPath();
    ctx.ellipse(0, 2, 19, 21, 0, 0, Math.PI * 2);
    ctx.fill();

    // 月代(さかやき)+ちょんまげ
    ctx.fillStyle = "#2b2520";
    ctx.beginPath();
    ctx.ellipse(0, -8, 19, 11, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#f0d9b8";
    ctx.beginPath();
    ctx.ellipse(0, -10, 12, 7, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#2b2520";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(2, -24, -4, -24);
    ctx.stroke();

    // 表情
    ctx.strokeStyle = "#2b2520";
    ctx.fillStyle = "#2b2520";
    ctx.lineWidth = 2;
    if (G.face === "ouch") {
      // ><顔
      ctx.beginPath();
      ctx.moveTo(-11, -2); ctx.lineTo(-5, 1); ctx.lineTo(-11, 4);
      ctx.moveTo(11, -2); ctx.lineTo(5, 1); ctx.lineTo(11, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 11, 4, 5, 0, 0, Math.PI * 2); // 叫ぶ口
      ctx.fill();
      // 汗
      ctx.fillStyle = "#5da7c7";
      ctx.beginPath(); ctx.arc(16, -6, 3, 0, Math.PI * 2); ctx.fill();
    } else if (G.face === "happy") {
      ctx.beginPath();
      ctx.arc(-8, 1, 4, Math.PI, 0);
      ctx.arc(8, 1, 4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 9, 5, 0, Math.PI);
      ctx.stroke();
    } else {
      // 通常: 困り眉+ジト目(苦労人)
      ctx.beginPath();
      ctx.moveTo(-12, -5); ctx.lineTo(-4, -3);
      ctx.moveTo(12, -5); ctx.lineTo(4, -3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 1); ctx.lineTo(-4, 1);
      ctx.moveTo(10, 1); ctx.lineTo(4, 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, 11);
      ctx.quadraticCurveTo(0, 9, 4, 11); // への字口
      ctx.stroke();
    }

    ctx.restore();
  }

  function toKanji(n) {
    const k = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    if (n <= 10) return k[n];
    if (n < 20) return "十" + k[n - 10];
    return Math.floor(n / 10) === 0 ? k[n] : k[Math.floor(n / 10)] + "十" + k[n % 10];
  }

  /* ---------------- メインループ ---------------- */
  let last = 0;
  function loop(now) {
    if (!G.running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  G.px = W / 2;
  dayEl.textContent = "受難 一日目";

  /* ---------------- Service Worker ---------------- */
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
  }
})();
