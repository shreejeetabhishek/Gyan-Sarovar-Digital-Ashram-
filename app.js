(function () {
  const STORAGE_KEY = "gyan_sarovar_sanctuary_v15";
  const DEFAULT_BABA_IMG = "./baba-portrait.png";

  function isoDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function buildSeededAtmas() {
    const topSeeds = [
      { name: "BK Suryamani Bahan", zone: "Mount Abu", ashram: "Shantivan Tapasya Dham", pts: 3850, streak: 95, yogHrs: 142.5, tier: "Tapasvi Ratna" },
      { name: "BK Devendra Bhai", zone: "New Delhi", ashram: "Pandav Bhawan Circle", pts: 3835, streak: 94, yogHrs: 139.0, tier: "Tapasvi Ratna" },
      { name: "BK Padma Bahan", zone: "Mumbai", ashram: "Om Shanti Retreat", pts: 3791, streak: 91, yogHrs: 136.4, tier: "Tapasvi Ratna" }
    ];
    const names = [
      "Aarav", "Meera", "Kiran", "Raghav", "Nandini", "Siddharth", "Kavita", "Ananya",
      "Prakash", "Sunita", "Vikram", "Pooja", "Manoj", "Deepika", "Ramesh", "Shruti",
      "Arjun", "Bhavna", "Harish", "Sneha", "Dinesh", "Pallavi", "Gopal", "Swati"
    ];
    const zones = ["Mount Abu", "New Delhi", "Mumbai", "Odisha", "Bengaluru"];
    const ashrams = [
      "Shantivan Tapasya Dham", "Pandav Bhawan Circle", "Om Shanti Retreat",
      "Gyan Sarovar Sangh", "Madhuban Smriti Group"
    ];
    const list = topSeeds.map((s, idx) => Object.assign({ id: `seed-${idx + 1}`, isUser: false }, s));
    for (let i = 3; i < 107; i++) {
      const nm = names[i % names.length];
      const hon = i % 2 === 0 ? "Bahan" : "Bhai";
      const pts = Math.max(120, 3740 - i * 33 + ((i * 19) % 41));
      list.push({
        id: `seed-${i + 1}`,
        name: `BK ${nm} ${hon}`,
        zone: zones[i % zones.length],
        ashram: ashrams[i % ashrams.length],
        pts,
        streak: Math.max(3, 90 - (i % 78)),
        yogHrs: Number((132 - i * 1.05).toFixed(1)),
        tier: pts >= 2500 ? "Tapasvi Ratna" : pts >= 1200 ? "Yogini / Yogi" : "Purusharthi",
        isUser: false
      });
    }
    return list;
  }

  function defaultState() {
    return {
      activeTab: "home",
      activeAtmaId: "atma-1",
      babaCustomImg: null,
      babaFit: "contain",
      kamraLighting: "amritvela",
      offerCount: 0,
      thoughtIdx: 0,
      vardaanIdx: 0,
      courseDayIdx: 0,
      rankingMode: "top100",
      zoneFilter: "ALL",
      chimeEnabled: true,
      droneEnabled: false,
      profiles: [
        { id: "atma-1", name: "BK Shreejeet Bhai", zone: "Mount Abu", ashram: "Shantivan Tapasya Dham" },
        { id: "atma-2", name: "BK Meera Bahan", zone: "Odisha", ashram: "Shantivan Tapasya Dham" }
      ],
      ashramInfo: {
        name: "Shantivan Tapasya Dham",
        motto: "One Father, One World Family — Pure Vibrations for Global Peace",
        wishes: [
          { by: "BK Shreejeet Bhai", text: "May peace, purity, and sweet remembrance fill every home today." }
        ]
      },
      syncedPeers: [],
      chartsByDate: {
        [isoDate(0)]: {
          checks: {},
          virtues: {},
          victories: "",
          surrender: "",
          surrendered: false
        }
      },
      surrenderLog: [],
      tcCompletedToday: 0,
      letters: [
        {
          id: "let-1",
          date: isoDate(0),
          text: "My Sweetest BapDada, Om Shanti! Thank You for giving me this new Brahmin birth and holding my hand in every step of life."
        }
      ],
      murliNotes: [
        {
          id: "m-1",
          date: isoDate(0),
          title: "Become a Lighthouse & Mighthouse",
          notes: "Stay stable in soul-consciousness and radiate pure vibrations of peace across the globe."
        }
      ],
      seededAtmas: buildSeededAtmas()
    };
  }

  let state = loadState();
  let selectedChartDate = isoDate(0);

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getActiveAtma() {
    return state.profiles.find((p) => p.id === state.activeAtmaId) || state.profiles[0];
  }

  function getChartForDate(dateStr) {
    if (!state.chartsByDate[dateStr]) {
      state.chartsByDate[dateStr] = { checks: {}, virtues: {}, victories: "", surrender: "", surrendered: false };
    }
    return state.chartsByDate[dateStr];
  }

  function computeUserScore() {
    let pts = 20;
    Object.values(state.chartsByDate).forEach((day) => {
      getLocalizedData().purusharthItems.forEach((item) => {
        if (day.checks && day.checks[item.id]) pts += item.pts;
      });
      if (day.virtues) {
        Object.values(day.virtues).forEach((stars) => {
          pts += Number(stars || 0) * 3;
        });
      }
      if (day.surrendered) pts += 35;
    });
    pts += (state.tcCompletedToday || 0) * 15;
    return pts;
  }

  function getFullLeaderboard() {
    const me = getActiveAtma();
    const myPts = computeUserScore();
    const userEntry = {
      id: me.id,
      name: me.name,
      zone: me.zone,
      ashram: state.ashramInfo.name || me.ashram,
      pts: myPts,
      streak: Math.max(1, Object.keys(state.chartsByDate).filter((d) => {
        const c = state.chartsByDate[d];
        return c && c.checks && Object.values(c.checks).some(Boolean);
      }).length),
      yogHrs: Number((2.5 + myPts / 30).toFixed(1)),
      tier: myPts >= 2500 ? "Tapasvi Ratna" : myPts >= 800 ? "Purusharthi" : "New Atma",
      isUser: true
    };
    const combined = [userEntry, ...state.syncedPeers, ...state.seededAtmas];
    combined.sort((a, b) => b.pts - a.pts);
    return combined.map((row, idx) => Object.assign({}, row, { rank: idx + 1 }));
  }

  // AUDIO CHIME & OM SHANTI DRONE
  let audioCtx = null;
  let droneOsc1 = null;
  let droneOsc2 = null;
  let droneGain = null;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function playChime() {
    if (!state.chimeEnabled) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [528, 792].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.75);
    });
  }

  function toggleOmDrone() {
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
    } else {
      try {
        if (droneOsc1) droneOsc1.stop();
        if (droneOsc2) droneOsc2.stop();
      } catch (e) {}
      droneOsc1 = null;
      droneOsc2 = null;
      state.droneEnabled = false;
    }
    updateDroneButtons();
  }

  function updateDroneButtons() {
    const hBtn = document.getElementById("home-drone-btn");
    const kBtn = document.getElementById("kamra-drone-btn");
    const lang = state.lang || "en";
    if (hBtn) {
      hBtn.textContent = lang === "hi"
        ? `🎶 ओम शान्ति ड्रोन: ${state.droneEnabled ? "चालू" : "बंद"}`
        : lang === "or"
        ? `🎶 ଓଁ ଶାନ୍ତି ଡ୍ରୋନ୍: ${state.droneEnabled ? "ଚାଲୁ" : "ବନ୍ଦ"}`
        : `🎶 Om Shanti Drone: ${state.droneEnabled ? "On" : "Off"}`;
    }
    if (kBtn) {
      kBtn.textContent = lang === "hi"
        ? `🎶 ड्रोन: ${state.droneEnabled ? "चालू" : "बंद"}`
        : lang === "or"
        ? `🎶 ଡ୍ରୋନ୍: ${state.droneEnabled ? "ଚାଲୁ" : "ବନ୍ଦ"}`
        : `🎶 Drone: ${state.droneEnabled ? "ON" : "OFF"}`;
    }
  }

  // NAVIGATION
  function switchTab(tabId) {
    state.activeTab = tabId;
    saveState();
    document.querySelectorAll(".tab-view").forEach((el) => el.classList.toggle("active", el.id === `view-${tabId}`));
    document.querySelectorAll(".dnav-btn, .bnav-btn, .drawer-link").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    closeDrawer();
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderAll();
  }

  function openDrawer() {
    document.getElementById("ashram-drawer").classList.add("open");
    document.getElementById("drawer-backdrop").classList.remove("hidden");
  }

  function closeDrawer() {
    document.getElementById("ashram-drawer").classList.remove("open");
    document.getElementById("drawer-backdrop").classList.add("hidden");
  }

  // CLOCK & TRAFFIC COUNTDOWN
  function updateClockAndTraffic() {
    const now = new Date();
    const clk = document.getElementById("live-clock");
    if (clk) clk.textContent = now.toLocaleTimeString([], { hour12: true });

    const h = now.getHours() + now.getMinutes() / 60;
    let phase = "Karma Yoga & Traffic Control";
    if (h >= 3.75 && h < 4.75) phase = "Amritvela · 04:00–04:45";
    else if (h >= 6.5 && h < 8.5) phase = "Daily Murli & Churning";
    else if (h >= 18.5 && h < 19.5) phase = "Numasham Yog · 18:30";
    else if (h >= 21.5 || h < 3.75) phase = "Night Pothamel & Silence";

    const mb = document.getElementById("maryada-badge");
    const rp = document.getElementById("rhythm-phase-pill");
    if (mb) mb.textContent = phase;
    if (rp) rp.textContent = phase;

    const curMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const slots = window.BK_SANCTUARY_DATA.trafficSlots;
    let nextSlot = slots[0].time;
    let diff = 24 * 60;
    for (const s of slots) {
      const [hh, mm] = s.time.split(":").map(Number);
      const sm = hh * 60 + mm;
      if (sm > curMins) {
        diff = sm - curMins;
        nextSlot = s.time;
        break;
      }
    }
    if (diff === 24 * 60) {
      const [hh, mm] = slots[0].time.split(":").map(Number);
      diff = (24 * 60 - curMins) + (hh * 60 + mm);
    }
    const secTotal = Math.max(0, Math.floor(diff * 60));
    const mmStr = String(Math.floor(secTotal / 60)).padStart(2, "0");
    const ssStr = String(secTotal % 60).padStart(2, "0");
    const cdEl = document.getElementById("tc-next-countdown");
    const infoEl = document.getElementById("tc-next-slot-info");
    if (cdEl) cdEl.textContent = `${mmStr} : ${ssStr}`;
    if (infoEl) infoEl.textContent = `Next bell at ${nextSlot}`;
  }

  // MEDITATION TIMER
  let yogPreset = 180;
  let yogRem = 180;
  let yogTimer = null;

  function fmtMMSS(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function renderHome() {
    const me = getActiveAtma();
    const pts = computeUserScore();
    const board = getFullLeaderboard();
    const myRow = board.find((r) => r.isUser);
    const todayChart = getChartForDate(isoDate(0));
    const items = getLocalizedData().purusharthItems;
    const done = items.filter((it) => todayChart.checks[it.id]).length;
    const pct = Math.round((done / items.length) * 100);

    document.getElementById("drawer-atma-name").textContent = me.name;
    document.getElementById("drawer-atma-meta").textContent = `${me.zone} · ${pts} pts · Rank #${myRow ? myRow.rank : "—"}`;

    const sel = document.getElementById("drawer-profile-select");
    sel.innerHTML = state.profiles.map((p) =>
      `<option value="${p.id}" ${p.id === me.id ? "selected" : ""}>${esc(p.name)}</option>`
    ).join("");

    document.getElementById("home-total-pts").textContent = `${pts} pts`;
    document.getElementById("home-rank-chip").textContent = `#${myRow ? myRow.rank : "—"}`;
    document.getElementById("home-pct-badge").textContent = `${pct}%`;
    document.getElementById("home-tc-count").textContent = `${state.tcCompletedToday || 0}/8`;
    document.getElementById("home-pothamel-status").textContent = todayChart.surrendered ? "Surrendered ✓" : "Pending Surrender";

    const thoughts = getLocalizedData().thoughts;
    document.getElementById("studio-thought-text").textContent = `“${thoughts[state.thoughtIdx % thoughts.length]}”`;
    updateDroneButtons();
  }

  // BABA KA KAMRA
  let kamraSec = 300;
  let kamraTimer = null;

  function renderKamra() {
    const stage = document.getElementById("kamra-stage");
    stage.className = `kamra-sanctuary-stage light-${state.kamraLighting}`;
    document.querySelectorAll("#kamra-lighting-pills .pill-choice").forEach((b) => {
      b.classList.toggle("active", b.dataset.light === state.kamraLighting);
    });

    const img = document.getElementById("baba-portrait-img");
    img.src = state.babaCustomImg || DEFAULT_BABA_IMG;
    img.className = state.babaFit === "cover" ? "fit-cover" : "fit-contain";
    document.getElementById("baba-fit-btn").textContent = `Frame: ${state.babaFit === "cover" ? "Cover" : "Contain"}`;

    document.getElementById("offer-count-label").textContent = `${state.offerCount || 0} offered today`;
    const vards = getLocalizedData().vardaans;
    document.getElementById("kamra-vardaan-text").textContent = `“${vards[state.vardaanIdx % vards.length]}”`;

    document.getElementById("letters-list-container").innerHTML = state.letters.map((l) => `
      <div class="saved-entry-card">
        <div class="row-between" style="margin-bottom:4px;">
          <strong style="color:var(--ruby-deep);">💌 Offered to BapDada</strong>
          <span class="eyebrow-muted">${esc(l.date)}</span>
        </div>
        <div style="font-style:italic;">“${esc(l.text)}”</div>
      </div>
    `).join("");
  }

  function spawnPetals() {
    const box = document.getElementById("kamra-petals");
    const icons = ["🌹", "🪷", "🌸"];
    for (let i = 0; i < 14; i++) {
      const el = document.createElement("span");
      el.className = "falling-petal";
      el.textContent = icons[i % icons.length];
      el.style.left = `${6 + Math.random() * 86}%`;
      el.style.animationDelay = `${Math.random() * 0.45}s`;
      box.appendChild(el);
      setTimeout(() => el.remove(), 2900);
    }
  }

  // PURUSHARTH CHART & 5-STAR VIRTUES & CALENDAR
  function renderChart() {
    document.getElementById("chart-date-picker").value = selectedChartDate;
    const day = getChartForDate(selectedChartDate);

    document.getElementById("purusharth-checklist").innerHTML = getLocalizedData().purusharthItems.map((it) => {
      const checked = Boolean(day.checks[it.id]);
      return `
        <div class="p-check-card ${checked ? "done" : ""}" data-pitem="${it.id}">
          <div>
            <div class="p-check-title">${esc(it.title)}</div>
            <div class="p-check-sub">${esc(it.desc)} (+${it.pts} pts)</div>
          </div>
          <div class="p-circle-toggle">${checked ? "✓" : ""}</div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".p-check-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.pitem;
        const cur = getChartForDate(selectedChartDate);
        cur.checks[id] = !cur.checks[id];
        saveState();
        renderChart();
        renderHome();
      });
    });

    document.getElementById("virtues-rating-list").innerHTML = getLocalizedData().virtues.map((v) => {
      const stars = Number((day.virtues && day.virtues[v]) || 0);
      let starBtns = "";
      for (let s = 1; s <= 5; s++) {
        starBtns += `<button type="button" class="star-btn ${s <= stars ? "lit" : ""}" data-vname="${esc(v)}" data-star="${s}" aria-label="${s} stars">★</button>`;
      }
      return `
        <div class="virtue-row">
          <span>${esc(v)}</span>
          <div class="stars-box">${starBtns}</div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".star-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const vn = btn.dataset.vname;
        const st = Number(btn.dataset.star);
        const cur = getChartForDate(selectedChartDate);
        if (!cur.virtues) cur.virtues = {};
        cur.virtues[vn] = cur.virtues[vn] === st ? 0 : st;
        saveState();
        renderChart();
        renderHome();
      });
    });

    document.getElementById("pothamel-victories-input").value = day.victories || "";
    document.getElementById("pothamel-surrender-input").value = day.surrender || "";
    document.getElementById("surrender-count-label").textContent = `${state.surrenderLog.length} entries`;
    document.getElementById("surrender-log-list").innerHTML = state.surrenderLog.length
      ? state.surrenderLog.slice(0, 5).map((e) => `
          <div style="padding:6px 0;border-top:1px solid rgba(255,255,255,0.1);">
            <strong>${esc(e.date)}:</strong> ${esc(e.victories || e.surrender)}
          </div>
        `).join("")
      : `<div style="color:#d4bfa0;margin-top:6px;">No night reports surrendered yet.</div>`;

    renderCalendarGrid();
  }

  function renderCalendarGrid() {
    const dt = new Date(selectedChartDate + "T00:00:00");
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const monthName = dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    document.getElementById("calendar-month-label").textContent = monthName;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let b = 0; b < firstDay; b++) {
      cells.push(`<div></div>`);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const entry = state.chartsByDate[ds];
      const cnt = entry && entry.checks ? Object.values(entry.checks).filter(Boolean).length : 0;
      const isSel = ds === selectedChartDate;
      cells.push(`
        <button type="button" class="cal-day-cell ${isSel ? "active-day" : ""} ${cnt > 0 ? "has-progress" : ""}" data-caldate="${ds}">
          ${d}
          <small>${cnt > 0 ? `${cnt}/7` : "—"}</small>
        </button>
      `);
    }
    document.getElementById("calendar-days-grid").innerHTML = cells.join("");
    document.querySelectorAll(".cal-day-cell").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedChartDate = btn.dataset.caldate;
        renderChart();
      });
    });
  }

  // RANKINGS
  function renderRankings() {
    document.querySelectorAll("#ranking-subtabs .pill-choice").forEach((b) => {
      b.classList.toggle("active", b.dataset.rmode === state.rankingMode);
    });

    const board = getFullLeaderboard();
    const me = board.find((r) => r.isUser);
    if (me) {
      document.getElementById("standing-tier-badge").textContent = me.tier;
      document.getElementById("standing-rank-num").textContent = `Rank #${me.rank}`;
      document.getElementById("standing-pts-num").textContent = `${me.pts.toLocaleString()} pts`;
      document.getElementById("standing-atma-label").textContent = `${me.name} (${me.zone})`;
      document.getElementById("standing-ashram-rank").textContent = `Ashram #${Math.min(21, Math.ceil(me.rank / 5))}`;
    }

    const q = (document.getElementById("ranking-search-input").value || "").trim().toLowerCase();
    const zone = state.zoneFilter;

    // Top 3 podium
    const medals = ["🥇", "🥈", "🥉"];
    document.getElementById("top3-podium-list").innerHTML = board.slice(0, 3).map((r, i) => `
      <div class="podium-card">
        <div>
          <strong>${medals[i]} ${esc(r.name)}</strong>
          <div class="p-check-sub">${esc(r.zone)} • ${esc(r.ashram)} · <span style="color:var(--ruby-deep);font-weight:700;">${esc(r.tier)}</span></div>
        </div>
        <div style="text-align:right;">
          <strong style="color:var(--ruby-deep);font-size:1.05rem;">${r.pts.toLocaleString()}</strong>
          <div class="p-check-sub">${r.streak}d streak</div>
        </div>
      </div>
    `).join("");

    const thead = document.getElementById("rank-table-head");
    const tbody = document.getElementById("rank-table-body");

    if (state.rankingMode === "groupwise") {
      const grp = new Map();
      board.forEach((r) => {
        const key = r.ashram || "Independent Atmas";
        const cur = grp.get(key) || { ashram: key, count: 0, pts: 0, yogHrs: 0 };
        cur.count += 1;
        cur.pts += r.pts;
        cur.yogHrs = Number((cur.yogHrs + r.yogHrs).toFixed(1));
        grp.set(key, cur);
      });
      const rows = Array.from(grp.values())
        .sort((a, b) => b.pts - a.pts)
        .filter((g) => !q || g.ashram.toLowerCase().includes(q));

      thead.innerHTML = "<tr><th>Rank</th><th>Digital Ashram</th><th>Atmas</th><th>Yog Hrs</th><th>Total Pts</th></tr>";
      tbody.innerHTML = rows.map((g, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td><strong>${esc(g.ashram)}</strong></td>
          <td>${g.count}</td>
          <td>${g.yogHrs}h</td>
          <td><strong>${g.pts.toLocaleString()}</strong></td>
        </tr>
      `).join("");
      return;
    }

    const filtered = board
      .filter((r) => (zone === "ALL" || r.zone === zone))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.ashram.toLowerCase().includes(q) || r.zone.toLowerCase().includes(q))
      .slice(0, 100);

    if (state.rankingMode === "atmawise") {
      thead.innerHTML = "<tr><th>Rank</th><th>Purusharthi Atma</th><th>Streak</th><th>Yog Hrs</th><th>Points</th></tr>";
      tbody.innerHTML = filtered.map((r) => `
        <tr class="${r.isUser ? "is-me" : ""}">
          <td>#${r.rank}</td>
          <td><strong>${esc(r.name)}</strong><br><small>${esc(r.zone)}</small></td>
          <td>${r.streak}d</td>
          <td>${r.yogHrs}h</td>
          <td><strong>${r.pts.toLocaleString()}</strong></td>
        </tr>
      `).join("");
    } else {
      thead.innerHTML = "<tr><th>Rank</th><th>Purusharthi Atma</th><th>Digital Ashram</th><th>Points</th></tr>";
      tbody.innerHTML = filtered.map((r) => `
        <tr class="${r.isUser ? "is-me" : ""}">
          <td>#${r.rank}</td>
          <td><strong>${esc(r.name)}</strong><br><small>${esc(r.zone)}</small></td>
          <td>${esc(r.ashram)}</td>
          <td><strong>${r.pts.toLocaleString()}</strong></td>
        </tr>
      `).join("");
    }
  }

  // ASHRAM, TRAFFIC, COURSE, MURLI, MORE
  function renderAshram() {
    document.getElementById("ashram-display-name").textContent = state.ashramInfo.name;
    document.getElementById("ashram-display-motto").textContent = `“${state.ashramInfo.motto}”`;
    document.getElementById("ashram-name-field").value = state.ashramInfo.name;
    document.getElementById("ashram-motto-field").value = state.ashramInfo.motto;

    const board = getFullLeaderboard();
    const members = board.filter((r) => r.ashram === state.ashramInfo.name || r.isUser).slice(0, 10);
    const total = members.reduce((acc, m) => acc + m.pts, 0);
    document.getElementById("ashram-collective-pts").textContent = `${total.toLocaleString()} pts`;

    document.getElementById("ashram-members-stack").innerHTML = members.map((m) => `
      <div class="saved-entry-card row-between">
        <div><strong>${esc(m.name)}</strong> · <span class="eyebrow-muted">${esc(m.zone)}</span></div>
        <strong style="color:var(--ruby-deep);">${m.pts.toLocaleString()} pts</strong>
      </div>
    `).join("");

    document.getElementById("ashram-wishes-stack").innerHTML = (state.ashramInfo.wishes || []).map((w) => `
      <div class="saved-entry-card"><strong>${esc(w.by)}:</strong> ${esc(w.text)}</div>
    `).join("");
  }

  function renderTraffic() {
    document.getElementById("tc-chime-toggle").textContent = `🔔 Chime: ${state.chimeEnabled ? "ON" : "OFF"}`;
    document.getElementById("tc-schedule-list").innerHTML = window.BK_SANCTUARY_DATA.trafficSlots.map((s) => `
      <div class="tt-row">
        <span class="tt-time">${s.time}</span>
        <div>
          <strong>${esc(s.title)}</strong>
          <p>${esc(s.note)}</p>
        </div>
      </div>
    `).join("");
  }

  function renderCourse() {
    const lessons = getLocalizedData().lessons;
    const idx = state.courseDayIdx % lessons.length;
    document.getElementById("course-day-pills").innerHTML = lessons.map((l, i) => `
      <button type="button" class="pill-choice ${i === idx ? "active" : ""}" data-cday="${i}">${l.day}</button>
    `).join("");

    document.querySelectorAll("button[data-cday]").forEach((b) => {
      b.addEventListener("click", () => {
        state.courseDayIdx = Number(b.dataset.cday);
        saveState();
        renderCourse();
      });
    });

    const cur = lessons[idx];
    document.getElementById("course-content-box").innerHTML = `
      <div class="eyebrow-gold">${cur.day} · RAJYOGA FOUNDATION</div>
      <h3 style="font-size:1.45rem;margin:4px 0 8px;">${esc(cur.title)}</h3>
      <p style="font-family:'Plus Jakarta Sans',sans-serif;font-size:0.9rem;line-height:1.6;">${esc(cur.body)}</p>
    `;
  }

  function renderMurliAndMore() {
    document.getElementById("murli-date-field").value = isoDate(0);
    const sws = getLocalizedData().thoughts;
    document.getElementById("murli-swaman-quote").textContent = `“${sws[state.thoughtIdx % sws.length]}”`;

    const mq = (document.getElementById("murli-search-field").value || "").trim().toLowerCase();
    document.getElementById("murli-notes-stack").innerHTML = state.murliNotes
      .filter((n) => !mq || n.title.toLowerCase().includes(mq) || n.notes.toLowerCase().includes(mq))
      .map((n) => `
        <div class="saved-entry-card">
          <div class="row-between"><strong>${esc(n.title)}</strong><span class="eyebrow-muted">${esc(n.date)}</span></div>
          <p style="margin:4px 0 0;">${esc(n.notes)}</p>
        </div>
      `).join("");

    document.getElementById("ashta-shakti-cards").innerHTML = getLocalizedData().ashtaShakti.map((s) => `
      <div class="saved-entry-card">
        <strong style="color:var(--ruby-deep);display:block;">${esc(s.name)}</strong>
        <span style="font-size:0.8rem;color:var(--ink-muted);">${esc(s.desc)}</span>
      </div>
    `).join("");

    document.getElementById("portals-cards").innerHTML = window.BK_SANCTUARY_DATA.portals.map((p) => `
      <div class="saved-entry-card">
        <strong style="color:var(--ruby-deep);display:block;">${esc(p.name)}</strong>
        <p style="font-size:0.8rem;color:var(--ink-muted);margin:4px 0 6px;">${esc(p.desc)}</p>
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" style="font-weight:700;font-size:0.8rem;color:var(--ruby-deep);">Visit Portal ↗</a>
      </div>
    `).join("");

    const wq = (document.getElementById("wings-filter-input").value || "").trim().toLowerCase();
    document.getElementById("wings-cards").innerHTML = window.BK_SANCTUARY_DATA.wings
      .filter((w) => !wq || w.toLowerCase().includes(wq))
      .map((w) => `<div class="saved-entry-card"><strong>${esc(w)}</strong></div>`)
      .join("");

    const gq = (document.getElementById("glossary-filter-input").value || "").trim().toLowerCase();
    document.getElementById("glossary-stack").innerHTML = getLocalizedData().glossary
      .filter((g) => !gq || g.term.toLowerCase().includes(gq) || g.def.toLowerCase().includes(gq))
      .map((g) => `<div class="saved-entry-card"><strong style="color:var(--ruby-deep);">${esc(g.term)}:</strong> ${esc(g.def)}</div>`)
      .join("");
  }

  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }


  if (!state.lang) state.lang = "en";
  if (typeof state.murliCardIdx !== "number") state.murliCardIdx = 0;



  function getLocalizedData() {
    const lang = state.lang || "en";
    const base = window.BK_SANCTUARY_DATA;
    const loc = (window.BK_DATA_LOCALE && window.BK_DATA_LOCALE[lang]) || {};
    return {
      thoughts: loc.thoughts || base.thoughts,
      vardaans: loc.vardaans || base.vardaans,
      purusharthItems: loc.purusharthItems || base.purusharthItems,
      virtues: loc.virtues || base.virtues,
      trafficSlots: base.trafficSlots,
      lessons: loc.lessons || base.lessons,
      ashtaShakti: loc.ashtaShakti || base.ashtaShakti,
      portals: base.portals,
      wings: base.wings,
      glossary: loc.glossary || base.glossary
    };
  }


  function localizeDynamicLabels() {
    const lang = state.lang || "en";
    if (lang === "en") return;
    const offerEl = document.getElementById("offer-count-label");
    if (offerEl) {
      const cnt = state.offerCount || 0;
      offerEl.textContent = lang === "hi" ? `आज ${cnt} अर्पित` : `ଆଜି ${cnt} ଅର୍ପିତ`;
    }
    const fitBtn = document.getElementById("baba-fit-btn");
    if (fitBtn) {
      const mode = state.babaFit === "cover" ? "Cover" : "Contain";
      fitBtn.textContent = lang === "hi"
        ? `फ़्रेम: ${mode === "Cover" ? "पूर्ण" : "फिट"} (${mode})`
        : `ଫ୍ରେମ୍: ${mode === "Cover" ? "ପୂର୍ଣ୍ଣ" : "ଫିଟ୍"} (${mode})`;
    }
    const metaRow = document.querySelector(".tapasya-meta-row");
    if (metaRow) {
      const todaySpan = metaRow.querySelector("span:first-child");
      if (todaySpan) {
        const numMatch = todaySpan.textContent.match(/\d+/);
        const dNum = numMatch ? numMatch[0] : "0";
        todaySpan.innerHTML = lang === "hi" ? `आज <strong>${dNum} दिन</strong> 🔥` : `ଆଜି <strong>${dNum} ଦିନ</strong> 🔥`;
      }
      const pSpan = metaRow.querySelector("span:last-child");
      if (pSpan) {
        const done = getChartForDate(isoDate(0)).surrendered;
        pSpan.innerHTML = lang === "hi"
          ? `रात्रि पोथामेल: <strong>${done ? "समर्पित ✓" : "समर्पण शेष"}</strong>`
          : `ରାତ୍ରି ପୋଥାମେଲ୍: <strong>${done ? "ସମର୍ପିତ ✓" : "ସମର୍ପଣ ବାକି ଅଛି"}</strong>`;
      }
    }
  }

  function translateWholeDomToCurrentLang() {
    const lang = state.lang || "en";
    document.documentElement.lang = lang;
    const dict = (window.BK_FULL_TRANSLATIONS && window.BK_FULL_TRANSLATIONS[lang]) || null;
    const rev = window.BK_REVERSE_TO_EN || {};

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE" || parent.tagName === "TEXTAREA") continue;
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      if (!trimmed) continue;

      // Resolve canonical English string even if node was freshly rendered or already in Hindi/Odia
      let canonicalEn = node.__origEn ? node.__origEn.trim() : null;
      if (!canonicalEn || (!dict && trimmed !== canonicalEn && !rev[trimmed])) {
        canonicalEn = rev[trimmed] || trimmed;
        node.__origEn = raw.replace(trimmed, canonicalEn);
      } else if (rev[trimmed]) {
        canonicalEn = rev[trimmed];
        node.__origEn = raw.replace(trimmed, canonicalEn);
      }

      const leading = raw.match(/^\s*/)[0];
      const trailing = raw.match(/\s*$/)[0];

      if (lang === "en") {
        if (trimmed !== canonicalEn) {
          node.nodeValue = leading + canonicalEn + trailing;
        }
      } else if (dict && dict[canonicalEn]) {
        const target = dict[canonicalEn];
        if (trimmed !== target) {
          node.nodeValue = leading + target + trailing;
        }
      }
    }
  }

  window.__setBKLang = function (langCode) {
    const nextLang = langCode || "en";
    if (state.lang === nextLang) return;
    state.lang = nextLang;
    const fsModal = document.getElementById("murli-fullscreen-modal");
    state.reopenFullMurli = Boolean(fsModal && !fsModal.classList.contains("hidden"));
    saveState();
    window.location.reload();
  };


  let murliFontScale = 1.0;

  function renderFullMurliModal() {
    const lang = state.lang || "en";
    document.querySelectorAll("#mfs-lang-switcher .lang-pill").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });

    const list = window.BK_FULL_MURLI_DISCOURSES || [];
    if (!list.length) return;
    const item = list[state.murliCardIdx % list.length];
    const doc = item[lang] || item.en;

    const todayLabel = new Date().toLocaleDateString(
      lang === "hi" ? "hi-IN" : lang === "or" ? "or-IN" : "en-IN",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );

    const setT = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.textContent = v; };
    setT("mfs-header-title", doc.headerTitle);
    setT("mfs-date-subtitle", `Om Shanti · ${todayLabel}`);
    setT("mfs-live-badge", doc.liveBadge);
    setT("mfs-title", doc.title);
    setT("mfs-lbl-essence", doc.lblEssence);
    setT("mfs-essence", doc.essence);
    setT("mfs-lbl-qa", doc.lblQa);
    setT("mfs-question", doc.question);
    setT("mfs-answer", doc.answer);
    setT("mfs-lbl-song", doc.lblSong);
    setT("mfs-song", doc.song);
    setT("mfs-lbl-mahavakya", doc.lblMahavakya);
    setT("mfs-lbl-dharna", doc.lblDharna);
    setT("mfs-lbl-vardaan", doc.lblVardaan);
    setT("mfs-vardaan", doc.vardaan);
    setT("mfs-lbl-slogan", doc.lblSlogan);
    setT("mfs-slogan", doc.slogan);
    setT("mfs-mark-read-btn", doc.markBtn);

    const pBox = document.getElementById("mfs-full-paragraphs");
    if (pBox) {
      pBox.innerHTML = (doc.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join("");
    }
    const dBox = document.getElementById("mfs-dharna-list");
    if (dBox) {
      dBox.innerHTML = (doc.dharna || []).map((li) => `<li>${esc(li)}</li>`).join("");
    }
    const paper = document.getElementById("mfs-paper");
    if (paper) {
      paper.style.fontSize = `${murliFontScale}rem`;
    }
  }

  function openFullMurliModal() {
    renderFullMurliModal();
    document.getElementById("murli-fullscreen-modal").classList.remove("hidden");
  }

  function closeFullMurliModal() {
    if ("speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    document.getElementById("murli-fullscreen-modal").classList.add("hidden");
  }

  function applyLanguage() {
    const lang = state.lang || "en";
    const t = (window.BK_I18N && window.BK_I18N[lang]) || window.BK_I18N.en;
    document.querySelectorAll("#lang-switcher .lang-pill").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    setTxt("hm-eyebrow", t.hmEyebrow);
    setTxt("hm-title", t.hmTitle);
    setTxt("hm-open-journal", t.hmNotebook);
    setTxt("hero-greeting-pill", t.greeting);
    setTxt("hero-title-top", t.heroTitleTop);
    setTxt("hero-title-accent", t.heroTitleAccent);
    setTxt("hero-desc-p", t.heroDesc);
    setTxt("cta-kamra-btn", t.btnKamra);
    setTxt("cta-chart-btn", t.btnChart);
    setTxt("cta-top100-btn", t.btnTop100);
    setTxt("lbl-total-tapasya", t.totalTapasya);
    setTxt("lbl-share-title", t.shareTitle);
    setTxt("lbl-share-sub", t.shareSub);
    setTxt("home-share-btn", t.shareBtn);


    const navLabels = {
      en: { home: "Home", kamra: "Kamra", chart: "Chart", rankings: "Top 100", ashram: "Ashram", share: "Share", pause: "✨ 1m Pause" },
      hi: { home: "होम", kamra: "कमरा", chart: "चार्ट", rankings: "टॉप 100", ashram: "आश्रम", share: "शेयर", pause: "✨ 1m विराम" },
      or: { home: "ହୋମ୍", kamra: "କୋଠରୀ", chart: "ଚାର୍ଟ", rankings: "ଟପ୍ ୧୦୦", ashram: "ଆଶ୍ରମ", share: "ସେୟାର୍", pause: "✨ 1m ବିରାମ" }
    }[lang] || { home: "Home", kamra: "Kamra", chart: "Chart", rankings: "Top 100", ashram: "Ashram", share: "Share", pause: "✨ 1m Pause" };

    document.querySelectorAll(".bnav-btn").forEach((b) => {
      const sp = b.querySelector("span:last-child");
      if (sp && navLabels[b.dataset.tab]) sp.textContent = navLabels[b.dataset.tab];
    });
    const hsBtn = document.getElementById("header-share-btn");
    if (hsBtn) hsBtn.textContent = "🔗 " + navLabels.share;
    const hpBtn = document.getElementById("header-pause-btn");
    if (hpBtn) hpBtn.textContent = navLabels.pause;

    const studioEyebrow = document.querySelector(".studio-dark-card .eyebrow-gold");
    const studioTitle = document.querySelector(".studio-dark-card .studio-title");
    const yogStart = document.getElementById("yog-start-btn");
    const yogReset = document.getElementById("yog-reset-btn");
    const nextThought = document.getElementById("next-thought-btn");
    if (studioEyebrow) studioEyebrow.textContent = t.studioEyebrow;
    if (studioTitle) studioTitle.textContent = t.studioTitle;
    if (yogStart && !yogTimer) yogStart.textContent = t.beginSilence;
    if (yogReset) yogReset.textContent = t.resetBtn;
    if (nextThought) nextThought.textContent = t.nextThought;

    const kamraH1 = document.querySelector("#view-kamra .page-serif-title");
    const kamraSub = document.querySelector("#view-kamra .body-muted");
    const chartH1 = document.querySelector("#view-chart .page-serif-title");
    const rankH1 = document.querySelector("#view-rankings .page-serif-title");
    const ashramH1 = document.querySelector("#view-ashram .page-serif-title");
    const murliH1 = document.querySelector("#view-murli .page-serif-title");
    if (kamraH1) kamraH1.textContent = t.kamraTitle;
    if (kamraSub) kamraSub.textContent = t.kamraSub;
    if (chartH1) chartH1.textContent = t.chartTitle;
    if (rankH1) rankH1.textContent = t.rankingsTitle;
    if (ashramH1) ashramH1.textContent = t.ashramTitle;
    if (murliH1) murliH1.textContent = t.murliPageTitle;

    renderFullMurliModal();
    const cards = window.BK_MURLI_TRILINGUAL || [];
    if (cards.length) {
      const m = cards[state.murliCardIdx % cards.length][lang] || cards[0].en;
      setTxt("hm-murli-quote", m.mahavakya);
      setTxt("hm-murli-body", m.body);
      setTxt("hm-murli-dharna", m.dharna);
    }
  }

  function renderAll() {
    applyLanguage();
    renderHome();
    renderKamra();
    renderChart();
    renderRankings();
    renderAshram();
    renderTraffic();
    renderCourse();
    renderMurliAndMore();
    translateWholeDomToCurrentLang();
    localizeDynamicLabels();
  }


  // SHAREABLE LINK BUILDER & HASH RECEIVER (#bkshare=...)
  let currentShareType = "atma";

  function encodeSharePayload(obj) {
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const baseUrl = window.location.origin && window.location.origin !== "null"
      ? `${window.location.origin}${window.location.pathname}`
      : window.location.href.split("#")[0];
    return `${baseUrl}#bkshare=${b64}`;
  }

  function buildShareUrl(kind) {
    const me = getActiveAtma();
    const pts = computeUserScore();
    if (kind === "ashram") {
      return encodeSharePayload({
        type: "ashram",
        name: me.name,
        zone: me.zone,
        ashram: state.ashramInfo.name,
        motto: state.ashramInfo.motto,
        pts,
        streak: 7,
        yogHrs: Number((2.5 + pts / 30).toFixed(1)),
        tier: pts >= 2500 ? "Tapasvi Ratna" : "Purusharthi"
      });
    }
    if (kind === "vardaan") {
      const vards = getLocalizedData().vardaans;
      const sws = getLocalizedData().thoughts;
      return encodeSharePayload({
        type: "vardaan",
        by: me.name,
        vardaan: vards[state.vardaanIdx % vards.length],
        swaman: sws[state.thoughtIdx % sws.length]
      });
    }
    return encodeSharePayload({
      type: "atma",
      name: me.name,
      zone: me.zone,
      ashram: state.ashramInfo.name,
      pts,
      streak: 7,
      yogHrs: Number((2.5 + pts / 30).toFixed(1)),
      tier: pts >= 2500 ? "Tapasvi Ratna" : "Purusharthi"
    });
  }

  function openShareModal(kind = "atma") {
    currentShareType = kind;
    document.querySelectorAll("#share-type-pills .pill-choice").forEach((b) => {
      b.classList.toggle("active", b.dataset.stype === kind);
    });
    document.getElementById("share-link-output").value = buildShareUrl(kind);
    document.getElementById("share-modal-feedback").textContent = "";
    document.getElementById("share-modal").classList.remove("hidden");
  }

  function consumeIncomingShareHash() {
    const h = window.location.hash || "";
    if (!h.startsWith("#bkshare=")) return;
    try {
      let b64 = h.replace("#bkshare=", "").replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      const data = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (!data || !data.type) return;

      if (data.type === "atma" || data.type === "ashram") {
        const exists = state.syncedPeers.some((p) => p.name === data.name && Number(p.pts) === Number(data.pts));
        if (!exists && data.name) {
          state.syncedPeers.unshift({
            id: `shared-${Date.now()}`,
            name: data.name,
            zone: data.zone || "Mount Abu",
            ashram: data.ashram || state.ashramInfo.name,
            pts: Number(data.pts) || 350,
            streak: Number(data.streak) || 3,
            yogHrs: Number(data.yogHrs) || 6.0,
            tier: data.tier || "Purusharthi",
            isUser: false
          });
        }
        if (data.type === "ashram" && data.ashram) {
          state.ashramInfo.name = data.ashram;
          if (data.motto) state.ashramInfo.motto = data.motto;
        }
        saveState();
        switchTab(data.type === "ashram" ? "ashram" : "rankings");
      } else if (data.type === "vardaan") {
        if (data.vardaan) {
          getLocalizedData().vardaans.unshift(data.vardaan);
          state.vardaanIdx = 0;
        }
        saveState();
        switchTab("kamra");
      }
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (e) {}
  }

  function bindEvents() {
    document.querySelectorAll(".dnav-btn, .bnav-btn, .drawer-link").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
    document.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.jump));
    });
    document.getElementById("brand-home-trigger").addEventListener("click", () => switchTab("home"));
    document.getElementById("drawer-open-btn").addEventListener("click", openDrawer);
    document.getElementById("drawer-close-btn").addEventListener("click", closeDrawer);
    document.getElementById("drawer-backdrop").addEventListener("click", closeDrawer);

    // Yog presets & timer
    document.querySelectorAll("#yog-presets .dark-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#yog-presets .dark-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        yogPreset = Number(pill.dataset.sec);
        if (yogTimer) { clearInterval(yogTimer); yogTimer = null; }
        yogRem = yogPreset;
        document.getElementById("yog-timer-display").textContent = fmtMMSS(yogRem);
        document.getElementById("yog-start-btn").textContent = "▶ Begin Silence";
      });
    });

    document.getElementById("yog-start-btn").addEventListener("click", () => {
      if (yogTimer) {
        clearInterval(yogTimer);
        yogTimer = null;
        document.getElementById("yog-start-btn").textContent = "▶ Resume";
        return;
      }
      playChime();
      document.getElementById("yog-start-btn").textContent = "⏸ Pause";
      yogTimer = setInterval(() => {
        if (yogRem > 0) {
          yogRem -= 1;
          document.getElementById("yog-timer-display").textContent = fmtMMSS(yogRem);
        } else {
          clearInterval(yogTimer);
          yogTimer = null;
          document.getElementById("yog-start-btn").textContent = "✓ Completed";
          playChime();
        }
      }, 1000);
    });

    document.getElementById("yog-reset-btn").addEventListener("click", () => {
      if (yogTimer) { clearInterval(yogTimer); yogTimer = null; }
      yogRem = yogPreset;
      document.getElementById("yog-timer-display").textContent = fmtMMSS(yogRem);
      document.getElementById("yog-start-btn").textContent = "▶ Begin Silence";
    });

    document.getElementById("next-thought-btn").addEventListener("click", () => {
      state.thoughtIdx += 1;
      saveState();
      renderHome();
      renderMurliAndMore();
    });

    document.getElementById("home-drone-btn").addEventListener("click", toggleOmDrone);
    document.getElementById("kamra-drone-btn").addEventListener("click", toggleOmDrone);

    // Baba Ka Kamra
    document.querySelectorAll("#kamra-lighting-pills .pill-choice").forEach((b) => {
      b.addEventListener("click", () => {
        state.kamraLighting = b.dataset.light;
        saveState();
        renderKamra();
      });
    });

    document.getElementById("baba-upload-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        state.babaCustomImg = r.result;
        saveState();
        renderKamra();
      };
      r.readAsDataURL(file);
    });

    document.getElementById("baba-fit-btn").addEventListener("click", () => {
      state.babaFit = state.babaFit === "contain" ? "cover" : "contain";
      saveState();
      renderKamra();
    });

    document.getElementById("baba-reset-btn").addEventListener("click", () => {
      state.babaCustomImg = null;
      saveState();
      renderKamra();
    });

    document.getElementById("kamra-sit-btn").addEventListener("click", () => {
      playChime();
      if (kamraTimer) {
        clearInterval(kamraTimer);
        kamraTimer = null;
        document.getElementById("kamra-sit-btn").textContent = "▶ Sit in Silence";
        return;
      }
      document.getElementById("kamra-sit-btn").textContent = "⏸ Pause Silence";
      kamraTimer = setInterval(() => {
        if (kamraSec > 0) {
          kamraSec -= 1;
          const mm = String(Math.floor(kamraSec / 60)).padStart(2, "0");
          const ss = String(kamraSec % 60).padStart(2, "0");
          document.getElementById("kamra-silence-timer").textContent = `${mm} : ${ss}`;
        } else {
          clearInterval(kamraTimer);
          kamraTimer = null;
          kamraSec = 300;
          document.getElementById("kamra-sit-btn").textContent = "▶ Sit in Silence";
          playChime();
        }
      }, 1000);
    });

    document.getElementById("offer-flower-btn").addEventListener("click", () => {
      state.offerCount = (state.offerCount || 0) + 1;
      saveState();
      spawnPetals();
      playChime();
      renderKamra();
    });

    document.getElementById("draw-vardaan-btn").addEventListener("click", () => {
      state.vardaanIdx += 1;
      saveState();
      renderKamra();
    });

    document.getElementById("offer-letter-btn").addEventListener("click", () => {
      const ta = document.getElementById("baba-letter-textarea");
      const txt = ta.value.trim();
      if (!txt) return;
      state.letters.unshift({ id: `let-${Date.now()}`, date: isoDate(0), text: txt });
      ta.value = "";
      saveState();
      playChime();
      renderKamra();
    });

    // Chart date navigation & Night Surrender
    document.getElementById("chart-prev-date").addEventListener("click", () => {
      const d = new Date(selectedChartDate + "T00:00:00");
      d.setDate(d.getDate() - 1);
      selectedChartDate = d.toISOString().slice(0, 10);
      renderChart();
    });
    document.getElementById("chart-next-date").addEventListener("click", () => {
      const d = new Date(selectedChartDate + "T00:00:00");
      d.setDate(d.getDate() + 1);
      selectedChartDate = d.toISOString().slice(0, 10);
      renderChart();
    });
    document.getElementById("chart-today-btn").addEventListener("click", () => {
      selectedChartDate = isoDate(0);
      renderChart();
    });
    document.getElementById("chart-date-picker").addEventListener("change", (e) => {
      if (e.target.value) {
        selectedChartDate = e.target.value;
        renderChart();
      }
    });

    document.getElementById("surrender-chart-btn").addEventListener("click", () => {
      const day = getChartForDate(selectedChartDate);
      day.victories = document.getElementById("pothamel-victories-input").value.trim();
      day.surrender = document.getElementById("pothamel-surrender-input").value.trim();
      day.surrendered = true;
      state.surrenderLog.unshift({
        date: selectedChartDate,
        victories: day.victories,
        surrender: day.surrender || "Surrendered daily chart at BapDada's lotus feet."
      });
      saveState();
      playChime();
      renderChart();
      renderHome();
      renderRankings();
    });

    // Traffic Control 1m Pause Modal
    let tcModalInt = null;
    function openTcModal() {
      playChime();
      let rem = 60;
      const prompts = getLocalizedData().thoughts;
      document.getElementById("tc-modal").classList.remove("hidden");
      document.getElementById("tc-modal-timer").textContent = "01 : 00";
      document.getElementById("tc-modal-prompt").textContent = `“${prompts[0]}”`;
      if (tcModalInt) clearInterval(tcModalInt);
      tcModalInt = setInterval(() => {
        rem -= 1;
        document.getElementById("tc-modal-timer").textContent = `00 : ${String(Math.max(0, rem)).padStart(2, "0")}`;
        document.getElementById("tc-modal-prompt").textContent = `“${prompts[Math.floor((60 - rem) / 15) % prompts.length]}”`;
        if (rem <= 0) {
          clearInterval(tcModalInt);
          tcModalInt = null;
          playChime();
        }
      }, 1000);
    }

    document.getElementById("header-pause-btn").addEventListener("click", openTcModal);
    document.getElementById("tc-start-now-btn").addEventListener("click", openTcModal);
    document.getElementById("tc-modal-done-btn").addEventListener("click", () => {
      if (tcModalInt) clearInterval(tcModalInt);
      document.getElementById("tc-modal").classList.add("hidden");
      state.tcCompletedToday = (state.tcCompletedToday || 0) + 1;
      getChartForDate(isoDate(0)).checks.traffic = true;
      saveState();
      renderAll();
    });

    document.getElementById("tc-chime-toggle").addEventListener("click", () => {
      state.chimeEnabled = !state.chimeEnabled;
      saveState();
      renderTraffic();
    });

    // Rankings filters
    document.querySelectorAll("#ranking-subtabs .pill-choice").forEach((b) => {
      b.addEventListener("click", () => {
        state.rankingMode = b.dataset.rmode;
        saveState();
        renderRankings();
      });
    });
    document.getElementById("zone-filter-select").addEventListener("change", (e) => {
      state.zoneFilter = e.target.value;
      renderRankings();
    });
    document.getElementById("ranking-search-input").addEventListener("input", renderRankings);

    // Atma profile modal
    document.getElementById("open-atma-modal-btn").addEventListener("click", () => {
      closeDrawer();
      document.getElementById("atma-modal").classList.remove("hidden");
    });
    document.getElementById("modal-cancel-atma-btn").addEventListener("click", () => {
      document.getElementById("atma-modal").classList.add("hidden");
    });
    document.getElementById("modal-save-atma-btn").addEventListener("click", () => {
      const raw = document.getElementById("modal-atma-name").value.trim() || "Shreejeet";
      const hon = document.getElementById("modal-atma-hon").value;
      const zone = document.getElementById("modal-atma-city").value.trim() || "Mount Abu";
      const clean = raw.replace(/^BK\s+/i, "").replace(/\s+(Bhai|Bahan)$/i, "").trim() || "Atma";
      const prof = { id: `atma-${Date.now()}`, name: `BK ${clean} ${hon}`, zone, ashram: state.ashramInfo.name };
      state.profiles.push(prof);
      state.activeAtmaId = prof.id;
      document.getElementById("modal-atma-name").value = "";
      document.getElementById("atma-modal").classList.add("hidden");
      saveState();
      renderAll();
    });
    document.getElementById("drawer-profile-select").addEventListener("change", (e) => {
      state.activeAtmaId = e.target.value;
      saveState();
      renderAll();
    });

    // Ashram & Peer Sync
    document.getElementById("save-ashram-btn").addEventListener("click", () => {
      state.ashramInfo.name = document.getElementById("ashram-name-field").value.trim() || "Shantivan Tapasya Dham";
      state.ashramInfo.motto = document.getElementById("ashram-motto-field").value.trim();
      saveState();
      document.getElementById("ashram-feedback").textContent = "Digital Ashram saved locally.";
      renderAshram();
      renderRankings();
    });
    document.getElementById("gen-sync-code-btn").addEventListener("click", () => {
      const me = getActiveAtma();
      const payload = {
        name: me.name,
        zone: me.zone,
        ashram: state.ashramInfo.name,
        pts: computeUserScore(),
        streak: 7,
        yogHrs: 14.5,
        tier: "Purusharthi",
        isUser: false
      };
      document.getElementById("peer-sync-input").value =
        "GYAN-SYNC-" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      document.getElementById("ashram-feedback").textContent = "Sync code generated! Share with fellow Atmas.";
    });
    document.getElementById("merge-peer-btn").addEventListener("click", () => {
      const val = document.getElementById("peer-sync-input").value.trim();
      if (!val.startsWith("GYAN-SYNC-")) {
        document.getElementById("ashram-feedback").textContent = "Paste a valid GYAN-SYNC-... code.";
        return;
      }
      try {
        const peer = JSON.parse(decodeURIComponent(escape(atob(val.replace("GYAN-SYNC-", "")))));
        state.syncedPeers.unshift({
          id: `peer-${Date.now()}`,
          name: peer.name,
          zone: peer.zone || "Mount Abu",
          ashram: state.ashramInfo.name,
          pts: Number(peer.pts) || 500,
          streak: Number(peer.streak) || 5,
          yogHrs: Number(peer.yogHrs) || 10,
          tier: peer.tier || "Purusharthi",
          isUser: false
        });
        saveState();
        document.getElementById("ashram-feedback").textContent = `Merged ${peer.name} into your Digital Ashram!`;
        renderAshram();
        renderRankings();
      } catch (e) {
        document.getElementById("ashram-feedback").textContent = "Could not read sync code.";
      }
    });
    document.getElementById("post-ashram-wish-btn").addEventListener("click", () => {
      const inp = document.getElementById("ashram-wish-input");
      const txt = inp.value.trim();
      if (!txt) return;
      state.ashramInfo.wishes.unshift({ by: getActiveAtma().name, text: txt });
      inp.value = "";
      saveState();
      renderAshram();
    });

    // Murli & Vault
    document.getElementById("murli-next-swaman-btn").addEventListener("click", () => {
      state.thoughtIdx += 1;
      saveState();
      renderHome();
      renderMurliAndMore();
    });
    document.getElementById("save-murli-note-btn").addEventListener("click", () => {
      const title = document.getElementById("murli-title-field").value.trim();
      const notes = document.getElementById("murli-notes-field").value.trim();
      const date = document.getElementById("murli-date-field").value || isoDate(0);
      if (!title && !notes) return;
      state.murliNotes.unshift({ id: `m-${Date.now()}`, date, title: title || "Murli Saar", notes });
      document.getElementById("murli-title-field").value = "";
      document.getElementById("murli-notes-field").value = "";
      saveState();
      renderMurliAndMore();
    });
    document.getElementById("murli-search-field").addEventListener("input", renderMurliAndMore);
    document.getElementById("wings-filter-input").addEventListener("input", renderMurliAndMore);
    document.getElementById("glossary-filter-input").addEventListener("input", renderMurliAndMore);

    document.getElementById("vault-export-btn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gyan-sarovar-backup-${isoDate(0)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      document.getElementById("vault-feedback").textContent = "JSON backup downloaded.";
    });
    document.getElementById("vault-import-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          state = Object.assign(defaultState(), JSON.parse(r.result));
          saveState();
          renderAll();
          document.getElementById("vault-feedback").textContent = "Local sanctuary restored from JSON.";
        } catch (err) {
          document.getElementById("vault-feedback").textContent = "Invalid JSON file.";
        }
      };
      r.readAsText(file);
    });
    document.getElementById("vault-reset-btn").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      renderAll();
      document.getElementById("vault-feedback").textContent = "Local data reset to fresh defaults.";
    });
  }


    // Share modal bindings
    document.getElementById("header-share-btn").addEventListener("click", () => openShareModal("atma"));
    document.getElementById("home-share-btn").addEventListener("click", () => openShareModal("atma"));
    document.getElementById("open-ashram-share-btn").addEventListener("click", () => openShareModal("ashram"));
    document.getElementById("close-share-modal-btn").addEventListener("click", () => {
      document.getElementById("share-modal").classList.add("hidden");
    });
    document.querySelectorAll("#share-type-pills .pill-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        openShareModal(btn.dataset.stype);
      });
    });
    document.getElementById("copy-share-link-btn").addEventListener("click", async () => {
      const inp = document.getElementById("share-link-output");
      inp.select();
      try {
        await navigator.clipboard.writeText(inp.value);
      } catch (e) {
        document.execCommand("copy");
      }
      document.getElementById("share-modal-feedback").textContent = "✓ Link copied! Paste it to any BK Bhai/Bahan.";
    });
    document.getElementById("native-share-link-btn").addEventListener("click", async () => {
      const url = document.getElementById("share-link-output").value;
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Gyan Sarovar — BK Digital Ashram",
            text: "Om Shanti! Join my Gyan Sarovar Purusharth & Ashram link:",
            url
          });
        } catch (e) {}
      } else {
        document.getElementById("share-modal-feedback").textContent = "Use Copy Link to share via WhatsApp, Telegram, or SMS.";
      }
    });

  consumeIncomingShareHash();

    document.querySelectorAll("#lang-switcher .lang-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.__setBKLang(btn.dataset.lang);
      });
    });
    const prevM = document.getElementById("hm-prev-murli");
    const nextM = document.getElementById("hm-next-murli");
    const openJ = document.getElementById("hm-open-journal");
    if (prevM) prevM.addEventListener("click", () => {
      const len = (window.BK_MURLI_TRILINGUAL || []).length || 1;
      state.murliCardIdx = (state.murliCardIdx - 1 + len) % len;
      saveState();
      applyLanguage();
    });
    if (nextM) nextM.addEventListener("click", () => {
      const len = (window.BK_MURLI_TRILINGUAL || []).length || 1;
      state.murliCardIdx = (state.murliCardIdx + 1) % len;
      saveState();
      applyLanguage();
    });
    if (openJ) openJ.addEventListener("click", () => switchTab("murli"));


    const hmFsBtn = document.getElementById("hm-fullscreen-murli-btn");
    const tabFsBtn = document.getElementById("murli-tab-fullscreen-btn");
    const mfsCloseBtn = document.getElementById("mfs-close-btn");
    const mfsPrevBtn = document.getElementById("mfs-prev-btn");
    const mfsNextBtn = document.getElementById("mfs-next-btn");
    const mfsFontInc = document.getElementById("mfs-font-inc");
    const mfsFontDec = document.getElementById("mfs-font-dec");
    const mfsSpeakBtn = document.getElementById("mfs-speak-btn");
    const mfsMarkBtn = document.getElementById("mfs-mark-read-btn");

    if (hmFsBtn) hmFsBtn.addEventListener("click", openFullMurliModal);
    if (tabFsBtn) tabFsBtn.addEventListener("click", openFullMurliModal);
    if (mfsCloseBtn) mfsCloseBtn.addEventListener("click", closeFullMurliModal);

    if (mfsPrevBtn) mfsPrevBtn.addEventListener("click", () => {
      const len = (window.BK_FULL_MURLI_DISCOURSES || []).length || 1;
      state.murliCardIdx = (state.murliCardIdx - 1 + len) % len;
      saveState();
      renderAll();
    });
    if (mfsNextBtn) mfsNextBtn.addEventListener("click", () => {
      const len = (window.BK_FULL_MURLI_DISCOURSES || []).length || 1;
      state.murliCardIdx = (state.murliCardIdx + 1) % len;
      saveState();
      renderAll();
    });
    if (mfsFontInc) mfsFontInc.addEventListener("click", () => {
      murliFontScale = Math.min(1.45, Number((murliFontScale + 0.08).toFixed(2)));
      renderFullMurliModal();
    });
    if (mfsFontDec) mfsFontDec.addEventListener("click", () => {
      murliFontScale = Math.max(0.85, Number((murliFontScale - 0.08).toFixed(2)));
      renderFullMurliModal();
    });
    if (mfsSpeakBtn) mfsSpeakBtn.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) return;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        mfsSpeakBtn.textContent = "🔊 Listen";
        return;
      }
      const lang = state.lang || "en";
      const list = window.BK_FULL_MURLI_DISCOURSES || [];
      const doc = (list[state.murliCardIdx % list.length] || {})[lang] || list[0].en;
      const text = [doc.title, doc.essence, ...(doc.paragraphs || []), doc.vardaan].join(". ");
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "hi" ? "hi-IN" : lang === "or" ? "or-IN" : "en-IN";
      utter.onend = () => { mfsSpeakBtn.textContent = "🔊 Listen"; };
      mfsSpeakBtn.textContent = "⏹ Stop";
      window.speechSynthesis.speak(utter);
    });
    if (mfsMarkBtn) mfsMarkBtn.addEventListener("click", () => {
      getChartForDate(isoDate(0)).checks.murli = true;
      saveState();
      playChime();
      renderAll();
      closeFullMurliModal();
    });

  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  bindEvents();
  renderAll();
  updateClockAndTraffic();
  setInterval(updateClockAndTraffic, 1000);
})();
