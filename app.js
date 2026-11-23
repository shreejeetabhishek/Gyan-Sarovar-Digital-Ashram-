(function () {
  const STORAGE_KEY = "gyan_sarovar_bk_v2";
  const DEFAULT_BABA_SRC = "./baba-portrait.png";
  const honorifics = ["Bhai", "Bahan"];
  const firstNames = [
    "Aarav", "Meera", "Kiran", "Raghav", "Nandini", "Siddharth", "Kavita", "Devendra",
    "Ananya", "Prakash", "Sunita", "Vikram", "Pooja", "Manoj", "Deepika", "Ramesh",
    "Shruti", "Arjun", "Bhavna", "Harish", "Sneha", "Dinesh", "Pallavi", "Gopal"
  ];
  const cities = ["Mount Abu", "Angul", "Bhubaneswar", "Cuttack", "Delhi", "Pune", "Indore", "Jaipur"];
  const ashrams = [
    "Pandav Bhawan Circle", "Gyan Sarovar Sangh", "Shanti Van Seva Mandal",
    "Om Shanti Yog Kendra", "Madhuban Smriti Group"
  ];

  function todayStr(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function createSeededAtmas() {
    const list = [];
    for (let i = 0; i < 105; i++) {
      const name = firstNames[i % firstNames.length];
      const hon = honorifics[i % honorifics.length];
      const fullName = `BK ${name} ${hon}`;
      const amritvelaDays = 28 - (i % 18);
      const murliDays = 29 - (i % 15);
      const yogHours = Number((65 - (i % 42) * 1.1).toFixed(1));
      const pts = Math.max(420, 2650 - i * 19 + ((i * 17) % 45));
      list.push({
        id: `seed-${i + 1}`,
        name: fullName,
        city: cities[i % cities.length],
        ashram: ashrams[i % ashrams.length],
        pts,
        amritvelaDays,
        murliDays,
        yogHours,
        isUser: false
      });
    }
    return list;
  }

  function defaultState() {
    return {
      activeTab: "home",
      activeAtmaId: "atma-local-1",
      babaCustomImg: null,
      babaImgFit: "contain",
      kamraLighting: "amritvela",
      chimeEnabled: true,
      droneEnabled: false,
      swamanIdx: 0,
      vardaanIdx: 0,
      selectedLessonIdx: 0,
      rankingMode: "top100",
      profiles: [
        { id: "atma-local-1", name: "BK Aarav Bhai", city: "Angul", ashram: "Shanti Sarovar Seva Mandal" },
        { id: "atma-local-2", name: "BK Meera Bahan", city: "Mount Abu", ashram: "Shanti Sarovar Seva Mandal" }
      ],
      ashramInfo: {
        name: "Shanti Sarovar Seva Mandal",
        motto: "Every thought pure, every karma a yagya",
        code: "ASHRAM-SHANTI-108",
        wishes: [
          { by: "BK Aarav Bhai", text: "May peace and sweetness radiate in every home today." },
          { by: "BK Meera Bahan", text: "Steady Amritvela and loving remembrance with Shiv Baba." }
        ]
      },
      syncedPeers: [],
      chartsByDate: {
        [todayStr(0)]: {
          checks: { amritvela: true, murli: true, traffic: false, karmaYog: true, bhojan: true, pothamel: false },
          virtues: ["Peace", "Purity", "Love"],
          remembranceNote: "Sweet morning Amritvela & Murli churning",
          pothamelNote: ""
        }
      },
      murliNotes: [
        {
          id: "m-1",
          date: todayStr(0),
          title: "Become a Lighthouse & Mighthouse",
          notes: "Stay in soul-consciousness and radiate pure vibrations of peace without getting pulled into body-consciousness."
        }
      ],
      babaLetters: [
        {
          id: "l-1",
          date: todayStr(0),
          text: "Pyare Shiv Baba & Brahma Baba, thank you for guiding every step with clarity and peace."
        }
      ],
      seededAtmas: createSeededAtmas()
    };
  }

  let state = loadState();
  let currentChartDate = todayStr(0);

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getActiveProfile() {
    return state.profiles.find((p) => p.id === state.activeAtmaId) || state.profiles[0];
  }

  function getDayChart(dateStr) {
    if (!state.chartsByDate[dateStr]) {
      state.chartsByDate[dateStr] = {
        checks: { amritvela: false, murli: false, traffic: false, karmaYog: false, bhojan: false, pothamel: false },
        virtues: [],
        remembranceNote: "",
        pothamelNote: ""
      };
    }
    return state.chartsByDate[dateStr];
  }

  function computeUserPoints() {
    let total = 350;
    Object.values(state.chartsByDate).forEach((day) => {
      window.BK_DATA.purusharthItems.forEach((item) => {
        if (day.checks && day.checks[item.id]) total += item.pts;
      });
      total += (day.virtues ? day.virtues.length : 0) * 5;
      if (day.pothamelNote && day.pothamelNote.trim().length > 0) total += 15;
    });
    total += state.murliNotes.length * 20;
    total += state.babaLetters.length * 15;
    return total;
  }

  function getCombinedLeaderboard() {
    const active = getActiveProfile();
    const userPts = computeUserPoints();
    const userAmritvela = Object.values(state.chartsByDate).filter((d) => d.checks && d.checks.amritvela).length + 4;
    const userMurli = Object.values(state.chartsByDate).filter((d) => d.checks && d.checks.murli).length + 5;
    const userRow = {
      id: active.id,
      name: active.name,
      city: active.city,
      ashram: state.ashramInfo.name || active.ashram,
      pts: userPts,
      amritvelaDays: userAmritvela,
      murliDays: userMurli,
      yogHours: Number((18 + userPts / 65).toFixed(1)),
      isUser: true
    };
    const merged = [userRow, ...state.syncedPeers, ...state.seededAtmas];
    merged.sort((a, b) => b.pts - a.pts);
    return merged.map((row, idx) => Object.assign({}, row, { rank: idx + 1 }));
  }

  let audioCtx = null;
  let droneOsc1 = null;
  let droneOsc2 = null;
  let droneGain = null;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTempleChime() {
    if (!state.chimeEnabled) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [528, 792].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.85);
    });
  }

  function toggleOmDrone() {
    const btn = document.getElementById("toggle-drone-btn");
    if (!state.droneEnabled) {
      const ctx = ensureAudio();
      if (ctx) {
        droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.045, ctx.currentTime);
        droneOsc1 = ctx.createOscillator();
        droneOsc2 = ctx.createOscillator();
        droneOsc1.type = "sine";
        droneOsc2.type = "triangle";
        droneOsc1.frequency.setValueAtTime(136.1, ctx.currentTime);
        droneOsc2.frequency.setValueAtTime(272.2, ctx.currentTime);
        droneOsc1.connect(droneGain);
        droneOsc2.connect(droneGain);
        droneGain.connect(ctx.destination);
        droneOsc1.start();
        droneOsc2.start();
      }
      state.droneEnabled = true;
      btn.textContent = "🎶 Om Shanti Drone: On";
    } else {
      try {
        if (droneOsc1) droneOsc1.stop();
        if (droneOsc2) droneOsc2.stop();
      } catch (e) {}
      droneOsc1 = null;
      droneOsc2 = null;
      state.droneEnabled = false;
      btn.textContent = "🎶 Om Shanti Drone: Off";
    }
  }

  const tabMeta = {
    home: ["Ashram & Rajyoga Sanctuary", "Soul-consciousness, remembrance, and daily self-checking in warm silence"],
    kamra: ["Baba Ka Kamra", "Sacred room with Prajapita Brahma Baba's portrait, Akhand Jyoti, Vardaan & Samachar"],
    chart: ["Purusharth Daily Chart", "Track Amritvela, Murli, Traffic Control, Soul Virtues, and Night Pothamel"],
    traffic: ["Traffic Control", "Scheduled 1-minute inner pauses to steady thoughts in peace"],
    ashram: ["Digital Ashram & Groups", "Offline-first spiritual sangathan, peer sync codes, and collective Tapasya"],
    rankings: ["Top 100 Rankings", "Website Top 100, Atma-Wise Metrics, and Digital Ashram / Group leaderboards"],
    course: ["7-Day Rajyoga Course", "Core spiritual foundations of soul, Shiv Baba, three worlds, and karma"],
    murli: ["Murli & Swaman Notebook", "Daily Manan Chintan journal, self-respect Swamans, and Ashta Shakti"],
    resources: ["BK Wings & Public Portals", "Official public portals and the 20 RERF service wings"],
    glossary: ["A–Z Glossary & Data Vault", "Brahma Kumaris terms and offline JSON backup / restore"]
  };

  function switchTab(tabId) {
    state.activeTab = tabId;
    saveState();
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${tabId}`));
    const meta = tabMeta[tabId] || tabMeta.home;
    document.getElementById("page-title").textContent = meta[0];
    document.getElementById("page-subtitle").textContent = meta[1];
    document.getElementById("sidebar").classList.remove("open");
    renderAll();
  }

  function updateClock() {
    const now = new Date();
    document.getElementById("live-clock").textContent = now.toLocaleTimeString([], { hour12: true });
    const h = now.getHours() + now.getMinutes() / 60;
    let phase = "Day Karma Yog · Soul Consciousness";
    if (h >= 3.75 && h < 4.75) phase = "Amritvela · 04:00–04:45 AM";
    else if (h >= 6.5 && h < 8.5) phase = "Daily Murli & Churning Time";
    else if (h >= 18.5 && h < 19.5) phase = "Numasham Yog · 06:30–07:30 PM";
    else if (h >= 21.5 || h < 3.75) phase = "Night Pothamel & Silent Rest";
    document.getElementById("maryada-phase").textContent = phase;
    updateTrafficCountdown(now);
  }

  function updateTrafficCountdown(now) {
    const curMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    let nextLabel = window.BK_DATA.trafficSlots[0];
    let diffMins = 24 * 60;
    for (const slot of window.BK_DATA.trafficSlots) {
      const [hh, mm] = slot.split(":").map(Number);
      const slotMins = hh * 60 + mm;
      if (slotMins > curMins) {
        diffMins = slotMins - curMins;
        nextLabel = slot;
        break;
      }
    }
    if (diffMins === 24 * 60) {
      const [hh, mm] = window.BK_DATA.trafficSlots[0].split(":").map(Number);
      diffMins = (24 * 60 - curMins) + (hh * 60 + mm);
    }
    const totalSec = Math.max(0, Math.floor(diffMins * 60));
    const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    document.getElementById("traffic-countdown").textContent = `${m}:${s}`;
    document.getElementById("next-slot-label").textContent = `Next scheduled pause at ${nextLabel}`;
  }

  let yogSeconds = 180;
  let yogSelectedPreset = 180;
  let yogInterval = null;
  let canvasPulse = 0;

  function formatSec(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function drawYogCanvas() {
    const canvas = document.getElementById("yog-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    canvasPulse += 0.04;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, 130 + Math.sin(canvasPulse) * 14);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.18, "#ffe082");
    grad.addColorStop(0.5, "rgba(255, 165, 45, 0.24)");
    grad.addColorStop(1, "rgba(18, 11, 24, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 9 + Math.sin(canvasPulse * 1.5) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fffef7";
    ctx.fill();
    requestAnimationFrame(drawYogCanvas);
  }

  function startYogTimer() {
    if (yogInterval) return;
    document.getElementById("yog-status-tag").textContent = "In Yog";
    playTempleChime();
    yogInterval = setInterval(() => {
      if (yogSeconds > 0) {
        yogSeconds -= 1;
        document.getElementById("yog-timer-display").textContent = formatSec(yogSeconds);
      } else {
        clearInterval(yogInterval);
        yogInterval = null;
        document.getElementById("yog-status-tag").textContent = "Completed";
        playTempleChime();
      }
    }, 1000);
  }

  function resetYogTimer() {
    if (yogInterval) {
      clearInterval(yogInterval);
      yogInterval = null;
    }
    yogSeconds = yogSelectedPreset;
    document.getElementById("yog-timer-display").textContent = formatSec(yogSeconds);
    document.getElementById("yog-status-tag").textContent = "Ready";
  }

  let silenceSeconds = 300;
  let silenceInterval = null;

  function renderKamra() {
    const scene = document.getElementById("kamra-scene");
    scene.className = `kamra-scene light-${state.kamraLighting}`;
    document.querySelectorAll("#kamra-lighting-btns .chip-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.light === state.kamraLighting);
    });

    const img = document.getElementById("baba-photo-img");
    img.src = state.babaCustomImg || DEFAULT_BABA_SRC;
    img.className = state.babaImgFit === "cover" ? "fit-cover" : "fit-contain";
    document.getElementById("toggle-fit-btn").textContent =
      `Fit: ${state.babaImgFit === "cover" ? "Cover" : "Contain"}`;

    document.getElementById("baba-img-status").textContent = state.babaCustomImg
      ? "Showing custom uploaded Baba PNG saved locally in browser."
      : "Bundled with your Baba PNG at ./baba-portrait.png.";

    document.getElementById("vardaan-text").textContent =
      `“${window.BK_DATA.vardaans[state.vardaanIdx % window.BK_DATA.vardaans.length]}”`;

    const letterList = document.getElementById("baba-letter-list");
    letterList.innerHTML = state.babaLetters.map((item) => `
      <div class="note-item">
        <div><strong>${item.date}</strong></div>
        <div>${escapeHtml(item.text)}</div>
      </div>
    `).join("");
  }

  function dropPetals(symbol) {
    const layer = document.getElementById("kamra-petal-layer");
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = symbol;
      p.style.left = `${8 + Math.random() * 82}%`;
      p.style.animationDelay = `${Math.random() * 0.45}s`;
      layer.appendChild(p);
      setTimeout(() => p.remove(), 2900);
    }
    playTempleChime();
  }

  function renderProfilesAndHome() {
    const active = getActiveProfile();
    const pts = computeUserPoints();
    const board = getCombinedLeaderboard();
    const myRankEntry = board.find((r) => r.isUser);

    document.getElementById("sidebar-atma-name").textContent = active.name;
    document.getElementById("sidebar-atma-meta").textContent = `${active.city} · ${pts} pts`;

    const sel = document.getElementById("atma-profile-select");
    sel.innerHTML = state.profiles.map((p) =>
      `<option value="${p.id}" ${p.id === active.id ? "selected" : ""}>${escapeHtml(p.name)}</option>`
    ).join("");

    const dayChart = getDayChart(todayStr(0));
    const items = window.BK_DATA.purusharthItems;
    const doneCount = items.filter((it) => dayChart.checks[it.id]).length;
    const pct = Math.round((doneCount / items.length) * 100);

    document.getElementById("home-score-pill").textContent = `${pts} pts`;
    document.getElementById("home-progress-fill").style.width = `${pct}%`;
    document.getElementById("home-completion-pct").textContent = `${pct}%`;
    document.getElementById("home-streak-days").textContent = `${Math.max(1, Object.keys(state.chartsByDate).length)} day`;
    document.getElementById("home-rank-badge").textContent = myRankEntry ? `#${myRankEntry.rank}` : "#—";

    document.getElementById("home-quick-checks").innerHTML = items.map((it) => `
      <div class="check-row">
        <label>
          <input type="checkbox" data-cid="${it.id}" ${dayChart.checks[it.id] ? "checked" : ""} />
          <span>${escapeHtml(it.label)}</span>
        </label>
        <span class="pts-tag">+${it.pts}</span>
      </div>
    `).join("");

    document.querySelectorAll("#home-quick-checks input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", () => {
        getDayChart(todayStr(0)).checks[cb.dataset.cid] = cb.checked;
        saveState();
        renderAll();
      });
    });
  }

  function renderChartTab() {
    document.getElementById("chart-date-input").value = currentChartDate;
    const day = getDayChart(currentChartDate);
    document.getElementById("purusharth-items").innerHTML = window.BK_DATA.purusharthItems.map((it) => `
      <div class="check-row">
        <label>
          <input type="checkbox" data-chart-cid="${it.id}" ${day.checks[it.id] ? "checked" : ""} />
          <span>${escapeHtml(it.label)}</span>
        </label>
        <span class="pts-tag">+${it.pts} pts</span>
      </div>
    `).join("");

    document.querySelectorAll("input[data-chart-cid]").forEach((cb) => {
      cb.addEventListener("change", () => {
        getDayChart(currentChartDate).checks[cb.dataset.chartCid] = cb.checked;
        saveState();
        renderProfilesAndHome();
        renderHeatmap();
      });
    });

    document.getElementById("virtue-chips").innerHTML = window.BK_DATA.virtues.map((v) => {
      const active = (day.virtues || []).includes(v);
      return `<button type="button" class="chip-btn ${active ? "active" : ""}" data-virtue="${v}">${v}</button>`;
    }).join("");

    document.querySelectorAll("button[data-virtue]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.dataset.virtue;
        const arr = getDayChart(currentChartDate).virtues || [];
        if (arr.includes(v)) {
          getDayChart(currentChartDate).virtues = arr.filter((x) => x !== v);
        } else {
          arr.push(v);
          getDayChart(currentChartDate).virtues = arr;
        }
        saveState();
        renderChartTab();
        renderProfilesAndHome();
      });
    });

    document.getElementById("pothamel-remembrance").value = day.remembranceNote || "";
    document.getElementById("pothamel-reflection").value = day.pothamelNote || "";
    renderHeatmap();
  }

  function renderHeatmap() {
    const grid = document.getElementById("monthly-heatmap");
    const cells = [];
    for (let i = 29; i >= 0; i--) {
      const ds = todayStr(-i);
      const d = state.chartsByDate[ds];
      let count = 0;
      if (d && d.checks) {
        count = Object.values(d.checks).filter(Boolean).length;
      }
      const lvl = count >= 5 ? "lvl-3" : count >= 3 ? "lvl-2" : count >= 1 ? "lvl-1" : "";
      cells.push(`<div class="heat-cell ${lvl}" title="${ds}: ${count}/6 items">${30 - i}</div>`);
    }
    grid.innerHTML = cells.join("");
  }

  function renderTrafficTab() {
    document.getElementById("toggle-chime-btn").textContent = `🔔 Chime: ${state.chimeEnabled ? "On" : "Off"}`;
    document.getElementById("traffic-slots-list").innerHTML = window.BK_DATA.trafficSlots.map((slot, idx) => `
      <div class="slot-item">
        <strong>Pause #${idx + 1} · ${slot}</strong>
        <span>1-Min Peace &amp; Soul Awareness</span>
      </div>
    `).join("");
  }

  function renderAshramTab() {
    document.getElementById("ashram-name-input").value = state.ashramInfo.name;
    document.getElementById("ashram-motto-input").value = state.ashramInfo.motto;
    document.getElementById("ashram-code-badge").textContent = state.ashramInfo.code;

    const board = getCombinedLeaderboard();
    const ashramMembers = board.filter((r) => r.ashram === state.ashramInfo.name || r.isUser).slice(0, 8);
    const totalPts = ashramMembers.reduce((sum, m) => sum + m.pts, 0);
    document.getElementById("ashram-total-pts").textContent = `${totalPts.toLocaleString()} pts`;

    document.getElementById("ashram-members-list").innerHTML = ashramMembers.map((m) => `
      <div class="note-item">
        <strong>${escapeHtml(m.name)}</strong> · <span class="muted-text">${escapeHtml(m.city)}</span> — <strong>${m.pts} pts</strong>
      </div>
    `).join("");

    document.getElementById("ashram-wish-list").innerHTML = (state.ashramInfo.wishes || []).map((w) => `
      <div class="note-item">
        <strong>${escapeHtml(w.by)}:</strong> ${escapeHtml(w.text)}
      </div>
    `).join("");
  }

  function renderRankingsTab() {
    document.querySelectorAll("#ranking-mode-pills .chip-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.rmode === state.rankingMode);
    });

    const q = (document.getElementById("ranking-search-input").value || "").trim().toLowerCase();
    const board = getCombinedLeaderboard();
    const me = board.find((r) => r.isUser);
    document.getElementById("your-rank-summary").textContent = me
      ? `Your Rank: #${me.rank} (${me.name} · ${me.pts} pts)`
      : "";

    const thead = document.getElementById("rankings-thead");
    const tbody = document.getElementById("rankings-tbody");

    if (state.rankingMode === "groupwise") {
      const map = new Map();
      board.forEach((row) => {
        const key = row.ashram || "Independent Atmas";
        const cur = map.get(key) || { ashram: key, members: 0, pts: 0, yogHours: 0 };
        cur.members += 1;
        cur.pts += row.pts;
        cur.yogHours = Number((cur.yogHours + row.yogHours).toFixed(1));
        map.set(key, cur);
      });
      const groups = Array.from(map.values())
        .sort((a, b) => b.pts - a.pts)
        .filter((g) => !q || g.ashram.toLowerCase().includes(q));

      thead.innerHTML = "<tr><th>#</th><th>Digital Ashram / Group</th><th>Atmas</th><th>Yog Hours</th><th>Collective Pts</th></tr>";
      tbody.innerHTML = groups.map((g, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td><strong>${escapeHtml(g.ashram)}</strong></td>
          <td>${g.members}</td>
          <td>${g.yogHours}h</td>
          <td><strong>${g.pts.toLocaleString()}</strong></td>
        </tr>
      `).join("");
      return;
    }

    const filtered = board
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.ashram.toLowerCase().includes(q) || r.city.toLowerCase().includes(q))
      .slice(0, 100);

    if (state.rankingMode === "atmawise") {
      thead.innerHTML = "<tr><th>#</th><th>Atma</th><th>Amritvela Days</th><th>Murli Days</th><th>Yog Hours</th><th>Pts</th></tr>";
      tbody.innerHTML = filtered.map((r) => `
        <tr class="${r.isUser ? "me-row" : ""}">
          <td>#${r.rank}</td>
          <td>${escapeHtml(r.name)}</td>
          <td>${r.amritvelaDays}d</td>
          <td>${r.murliDays}d</td>
          <td>${r.yogHours}h</td>
          <td>${r.pts.toLocaleString()}</td>
        </tr>
      `).join("");
    } else {
      thead.innerHTML = "<tr><th>#</th><th>Atma</th><th>Digital Ashram</th><th>City</th><th>Purusharth Pts</th></tr>";
      tbody.innerHTML = filtered.map((r) => `
        <tr class="${r.isUser ? "me-row" : ""}">
          <td>#${r.rank}</td>
          <td><strong>${escapeHtml(r.name)}</strong></td>
          <td>${escapeHtml(r.ashram)}</td>
          <td>${escapeHtml(r.city)}</td>
          <td><strong>${r.pts.toLocaleString()}</strong></td>
        </tr>
      `).join("");
    }
  }

  function renderCourseTab() {
    const lessons = window.BK_DATA.lessons;
    const idx = state.selectedLessonIdx % lessons.length;
    document.getElementById("course-lesson-list").innerHTML = lessons.map((l, i) => `
      <button type="button" class="lesson-btn ${i === idx ? "active" : ""}" data-lidx="${i}">
        ${l.day} · ${escapeHtml(l.title)}
      </button>
    `).join("");

    document.querySelectorAll("button[data-lidx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedLessonIdx = Number(btn.dataset.lidx);
        saveState();
        renderCourseTab();
      });
    });

    const cur = lessons[idx];
    document.getElementById("course-lesson-detail").innerHTML = `
      <span class="eyebrow">${cur.day} FOUNDATION</span>
      <h2>${escapeHtml(cur.title)}</h2>
      <p style="margin-top:12px;line-height:1.65;">${escapeHtml(cur.body)}</p>
    `;
  }

  function renderMurliAndSwaman() {
    document.getElementById("murli-date-input").value = todayStr(0);
    document.getElementById("swaman-spotlight-card").textContent =
      `“${window.BK_DATA.swamans[state.swamanIdx % window.BK_DATA.swamans.length]}”`;
    document.getElementById("active-swaman-text").textContent =
      `“${window.BK_DATA.swamans[state.swamanIdx % window.BK_DATA.swamans.length]}”`;

    document.getElementById("ashta-shakti-grid").innerHTML = window.BK_DATA.ashtaShakti.map((s) => `
      <div class="mini-card"><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(s.desc)}</span></div>
    `).join("");

    const mq = (document.getElementById("murli-search-input").value || "").trim().toLowerCase();
    const notes = state.murliNotes.filter((n) =>
      !mq || n.title.toLowerCase().includes(mq) || n.notes.toLowerCase().includes(mq)
    );
    document.getElementById("murli-entries-list").innerHTML = notes.map((n) => `
      <div class="note-item">
        <strong>${escapeHtml(n.date)} · ${escapeHtml(n.title)}</strong>
        <div>${escapeHtml(n.notes)}</div>
      </div>
    `).join("");
  }

  function renderResourcesAndGlossary() {
    const wq = (document.getElementById("wing-search-input").value || "").trim().toLowerCase();
    document.getElementById("public-portals-grid").innerHTML = window.BK_DATA.portals
      .filter((p) => !wq || p.name.toLowerCase().includes(wq) || p.desc.toLowerCase().includes(wq))
      .map((p) => `
        <div class="mini-card">
          <strong>${escapeHtml(p.name)}</strong>
          <p class="muted-text" style="margin:4px 0 8px;">${escapeHtml(p.desc)}</p>
          <a href="${p.url}" target="_blank" rel="noopener noreferrer">Open Portal ↗</a>
        </div>
      `).join("");

    document.getElementById("rerf-wings-grid").innerHTML = window.BK_DATA.wings
      .filter((w) => !wq || w.toLowerCase().includes(wq))
      .map((w) => `<div class="mini-card"><strong>${escapeHtml(w)}</strong><span>RERF Seva Wing</span></div>`)
      .join("");

    const gq = (document.getElementById("glossary-search-input").value || "").trim().toLowerCase();
    document.getElementById("glossary-list").innerHTML = window.BK_DATA.glossary
      .filter((g) => !gq || g.term.toLowerCase().includes(gq) || g.def.toLowerCase().includes(gq))
      .map((g) => `<div class="note-item"><strong>${escapeHtml(g.term)}:</strong> ${escapeHtml(g.def)}</div>`)
      .join("");
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  function renderAll() {
    renderProfilesAndHome();
    renderKamra();
    renderChartTab();
    renderTrafficTab();
    renderAshramTab();
    renderRankingsTab();
    renderCourseTab();
    renderMurliAndSwaman();
    renderResourcesAndGlossary();
  }

  function bindEvents() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.getElementById("menu-toggle-btn").addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });

    document.getElementById("quick-kamra-btn").addEventListener("click", () => switchTab("kamra"));

    document.querySelectorAll("#tab-home .chip-btn[data-sec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#tab-home .chip-btn[data-sec]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        yogSelectedPreset = Number(btn.dataset.sec);
        resetYogTimer();
      });
    });
    document.getElementById("yog-start-btn").addEventListener("click", startYogTimer);
    document.getElementById("yog-reset-btn").addEventListener("click", resetYogTimer);
    document.getElementById("toggle-drone-btn").addEventListener("click", toggleOmDrone);
    document.getElementById("next-swaman-btn").addEventListener("click", () => {
      state.swamanIdx += 1;
      saveState();
      renderMurliAndSwaman();
    });
    document.getElementById("shuffle-swaman-btn").addEventListener("click", () => {
      state.swamanIdx += 1;
      saveState();
      renderMurliAndSwaman();
    });

    document.querySelectorAll("#kamra-lighting-btns .chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.kamraLighting = btn.dataset.light;
        saveState();
        renderKamra();
      });
    });

    document.getElementById("baba-png-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.babaCustomImg = reader.result;
        saveState();
        renderKamra();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("toggle-fit-btn").addEventListener("click", () => {
      state.babaImgFit = state.babaImgFit === "contain" ? "cover" : "contain";
      saveState();
      renderKamra();
    });

    document.getElementById("reset-baba-img-btn").addEventListener("click", () => {
      state.babaCustomImg = null;
      saveState();
      renderKamra();
    });

    document.getElementById("offer-rose-btn").addEventListener("click", () => dropPetals("🌹"));
    document.getElementById("offer-lotus-btn").addEventListener("click", () => dropPetals("🪷"));

    document.getElementById("kamra-silence-btn").addEventListener("click", () => {
      playTempleChime();
      if (silenceInterval) {
        clearInterval(silenceInterval);
        silenceInterval = null;
        silenceSeconds = 300;
        document.getElementById("kamra-timer-display").textContent = "Silence Timer: 05:00";
        return;
      }
      silenceInterval = setInterval(() => {
        if (silenceSeconds > 0) {
          silenceSeconds -= 1;
          document.getElementById("kamra-timer-display").textContent = `Silence Timer: ${formatSec(silenceSeconds)}`;
        } else {
          clearInterval(silenceInterval);
          silenceInterval = null;
          silenceSeconds = 300;
          playTempleChime();
          document.getElementById("kamra-timer-display").textContent = "Silence Completed · Om Shanti";
        }
      }, 1000);
    });

    document.getElementById("new-vardaan-btn").addEventListener("click", () => {
      state.vardaanIdx += 1;
      saveState();
      renderKamra();
    });

    document.getElementById("save-letter-btn").addEventListener("click", () => {
      const ta = document.getElementById("baba-letter-input");
      const txt = ta.value.trim();
      if (!txt) return;
      state.babaLetters.unshift({ id: `l-${Date.now()}`, date: todayStr(0), text: txt });
      ta.value = "";
      saveState();
      renderKamra();
      renderProfilesAndHome();
    });

    document.getElementById("prev-day-btn").addEventListener("click", () => {
      const d = new Date(currentChartDate + "T00:00:00");
      d.setDate(d.getDate() - 1);
      currentChartDate = d.toISOString().slice(0, 10);
      renderChartTab();
    });
    document.getElementById("next-day-btn").addEventListener("click", () => {
      const d = new Date(currentChartDate + "T00:00:00");
      d.setDate(d.getDate() + 1);
      currentChartDate = d.toISOString().slice(0, 10);
      renderChartTab();
    });
    document.getElementById("chart-date-input").addEventListener("change", (e) => {
      if (e.target.value) {
        currentChartDate = e.target.value;
        renderChartTab();
      }
    });

    document.getElementById("save-pothamel-btn").addEventListener("click", () => {
      const day = getDayChart(currentChartDate);
      day.remembranceNote = document.getElementById("pothamel-remembrance").value.trim();
      day.pothamelNote = document.getElementById("pothamel-reflection").value.trim();
      if (day.pothamelNote) day.checks.pothamel = true;
      saveState();
      document.getElementById("pothamel-status").textContent = "Night Pothamel offered to Baba & saved locally.";
      renderChartTab();
      renderProfilesAndHome();
    });

    let overlayTimer = null;
    function openTrafficOverlay() {
      playTempleChime();
      let rem = 60;
      const prompts = [
        "I am a peaceful soul — a point of light shining in the forehead.",
        "I rise above body-consciousness to Paramdham with Shiv Baba.",
        "Pure rays of peace and love flow from my soul to the world.",
        "Steady, light, and unshakeable — Om Shanti."
      ];
      document.getElementById("traffic-overlay").classList.remove("hidden");
      document.getElementById("overlay-countdown").textContent = "01:00";
      document.getElementById("overlay-prompt").textContent = prompts[0];
      if (overlayTimer) clearInterval(overlayTimer);
      overlayTimer = setInterval(() => {
        rem -= 1;
        document.getElementById("overlay-countdown").textContent = formatSec(Math.max(0, rem));
        document.getElementById("overlay-prompt").textContent = prompts[Math.floor((60 - rem) / 15) % prompts.length];
        if (rem <= 0) {
          clearInterval(overlayTimer);
          overlayTimer = null;
          playTempleChime();
        }
      }, 1000);
    }

    document.getElementById("quick-pause-btn").addEventListener("click", openTrafficOverlay);
    document.getElementById("trigger-traffic-now-btn").addEventListener("click", openTrafficOverlay);
    document.getElementById("close-traffic-overlay-btn").addEventListener("click", () => {
      if (overlayTimer) clearInterval(overlayTimer);
      document.getElementById("traffic-overlay").classList.add("hidden");
    });
    document.getElementById("toggle-chime-btn").addEventListener("click", () => {
      state.chimeEnabled = !state.chimeEnabled;
      saveState();
      renderTrafficTab();
    });

    document.getElementById("open-profile-modal-btn").addEventListener("click", () => {
      document.getElementById("profile-modal").classList.remove("hidden");
    });
    document.getElementById("close-profile-modal-btn").addEventListener("click", () => {
      document.getElementById("profile-modal").classList.add("hidden");
    });
    document.getElementById("create-atma-btn").addEventListener("click", () => {
      const rawName = document.getElementById("new-atma-name").value.trim() || "Atma";
      const hon = document.getElementById("new-atma-honorific").value;
      const city = document.getElementById("new-atma-city").value.trim() || "Mount Abu";
      const clean = rawName.replace(/^BK\s+/i, "").replace(/\s+(Bhai|Bahan)$/i, "").trim() || "Atma";
      const fullName = `BK ${clean} ${hon}`;
      const newProf = {
        id: `atma-local-${Date.now()}`,
        name: fullName,
        city,
        ashram: state.ashramInfo.name
      };
      state.profiles.push(newProf);
      state.activeAtmaId = newProf.id;
      document.getElementById("new-atma-name").value = "";
      document.getElementById("profile-modal").classList.add("hidden");
      saveState();
      renderAll();
    });
    document.getElementById("atma-profile-select").addEventListener("change", (e) => {
      state.activeAtmaId = e.target.value;
      saveState();
      renderAll();
    });

    document.getElementById("save-ashram-btn").addEventListener("click", () => {
      state.ashramInfo.name = document.getElementById("ashram-name-input").value.trim() || "Shanti Sarovar Seva Mandal";
      state.ashramInfo.motto = document.getElementById("ashram-motto-input").value.trim();
      saveState();
      document.getElementById("ashram-status").textContent = "Ashram details saved locally.";
      renderAshramTab();
      renderRankingsTab();
    });

    document.getElementById("export-sync-btn").addEventListener("click", () => {
      const active = getActiveProfile();
      const payload = {
        name: active.name,
        city: active.city,
        ashram: state.ashramInfo.name,
        pts: computeUserPoints(),
        amritvelaDays: 14,
        murliDays: 16,
        yogHours: 32.5,
        isUser: false
      };
      const code = "GYAN-SYNC-" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      document.getElementById("sync-code-box").value = code;
      document.getElementById("ashram-status").textContent = "Sync code generated. Share with peer Atmas.";
    });

    document.getElementById("import-sync-btn").addEventListener("click", () => {
      const raw = document.getElementById("sync-code-box").value.trim();
      if (!raw.startsWith("GYAN-SYNC-")) {
        document.getElementById("ashram-status").textContent = "Enter a valid GYAN-SYNC-... code.";
        return;
      }
      try {
        const jsonStr = decodeURIComponent(escape(atob(raw.replace("GYAN-SYNC-", ""))));
        const peer = JSON.parse(jsonStr);
        if (peer && peer.name) {
          state.syncedPeers.unshift({
            id: `peer-${Date.now()}`,
            name: peer.name,
            city: peer.city || "India",
            ashram: state.ashramInfo.name,
            pts: Number(peer.pts) || 800,
            amritvelaDays: Number(peer.amritvelaDays) || 10,
            murliDays: Number(peer.murliDays) || 12,
            yogHours: Number(peer.yogHours) || 20,
            isUser: false
          });
          saveState();
          document.getElementById("ashram-status").textContent = `Merged ${peer.name} into Ashram & Rankings.`;
          renderAshramTab();
          renderRankingsTab();
        }
      } catch (e) {
        document.getElementById("ashram-status").textContent = "Could not decode sync code.";
      }
    });

    document.getElementById("post-wish-btn").addEventListener("click", () => {
      const inp = document.getElementById("ashram-wish-input");
      const txt = inp.value.trim();
      if (!txt) return;
      state.ashramInfo.wishes.unshift({ by: getActiveProfile().name, text: txt });
      inp.value = "";
      saveState();
      renderAshramTab();
    });

    document.querySelectorAll("#ranking-mode-pills .chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.rankingMode = btn.dataset.rmode;
        saveState();
        renderRankingsTab();
      });
    });
    document.getElementById("ranking-search-input").addEventListener("input", renderRankingsTab);

    document.getElementById("save-murli-btn").addEventListener("click", () => {
      const title = document.getElementById("murli-title-input").value.trim();
      const notes = document.getElementById("murli-notes-input").value.trim();
      const date = document.getElementById("murli-date-input").value || todayStr(0);
      if (!title && !notes) return;
      state.murliNotes.unshift({
        id: `m-${Date.now()}`,
        date,
        title: title || "Murli Point",
        notes
      });
      document.getElementById("murli-title-input").value = "";
      document.getElementById("murli-notes-input").value = "";
      saveState();
      renderMurliAndSwaman();
      renderProfilesAndHome();
    });
    document.getElementById("murli-search-input").addEventListener("input", renderMurliAndSwaman);
    document.getElementById("wing-search-input").addEventListener("input", renderResourcesAndGlossary);
    document.getElementById("glossary-search-input").addEventListener("input", renderResourcesAndGlossary);

    document.getElementById("export-json-btn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gyan-sarovar-backup-${todayStr(0)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      document.getElementById("vault-status").textContent = "JSON backup downloaded.";
    });

    document.getElementById("import-json-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          state = Object.assign(defaultState(), parsed);
          saveState();
          renderAll();
          document.getElementById("vault-status").textContent = "Local data restored from JSON.";
        } catch (err) {
          document.getElementById("vault-status").textContent = "Invalid JSON backup file.";
        }
      };
      reader.readAsText(file);
    });

    document.getElementById("reset-demo-btn").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      renderAll();
      document.getElementById("vault-status").textContent = "Local storage reset to clean defaults.";
    });
  }

  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  bindEvents();
  renderAll();
  updateClock();
  setInterval(updateClock, 1000);
  requestAnimationFrame(drawYogCanvas);
})();
