/* ============================================================
   APP LOGIC — drives all screens and the full flow.
   Flow:
   profile -> PSS-10 -> score -> safety screening -> result
   ============================================================ */

const app = document.getElementById("app");

// In-memory state for the current session.
const session = {
  profile: null,
  baselineScore: 0,
  baselineLevel: null,
  postScore: 0,
  postLevel: null,
};

/* ---------- helpers ---------- */

function render(html) {
  app.innerHTML = html;
}

function sumScore(questions, answers) {
  return answers.reduce((total, optIndex, qIndex) => {
    if (optIndex == null) return total;
    return total + questions[qIndex].options[optIndex].score;
  }, 0);
}

function saveHistory(entry) {
  const key = "stressease_history";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(entry);
  localStorage.setItem(key, JSON.stringify(list));
}

/* ---------- 1. Profile screen ---------- */

function showProfile() {
  const saved = JSON.parse(localStorage.getItem("stressease_profile") || "null");

  render(`
    <div class="card">
      <h2>Welcome 👋</h2>
      <p class="muted">Let's start with a few basic details.</p>
      <label for="name">Name</label>
      <input id="name" type="text" placeholder="Your name" value="${saved?.name || ""}" />
      <label for="age">Age</label>
      <input id="age" type="number" min="1" max="120" placeholder="Your age" value="${saved?.age || ""}" />
      <label for="gender">Gender</label>
      <select id="gender">
        <option value="">Select...</option>
        <option ${saved?.gender === "Male" ? "selected" : ""}>Male</option>
        <option ${saved?.gender === "Female" ? "selected" : ""}>Female</option>
        <option ${saved?.gender === "Other" ? "selected" : ""}>Other</option>
        <option ${saved?.gender === "Prefer not to say" ? "selected" : ""}>Prefer not to say</option>
      </select>
      <button class="btn" id="profileNext">Continue</button>
    </div>
  `);

  document.getElementById("profileNext").onclick = () => {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    if (!name || !age || !gender) {
      alert("Please fill in all fields.");
      return;
    }
    session.profile = { name, age, gender };
    localStorage.setItem("stressease_profile", JSON.stringify(session.profile));
    showIntro();
  };
}

/* ---------- Intro before the assessment ---------- */

function showIntro() {
  render(`
    <div class="card">
      <h2>Hi ${session.profile.name} 🌿</h2>
      <p>You'll answer 10 short questions about the last month, then a short
      safety questionnaire.</p>
      <p class="muted">There are no right or wrong answers. Be honest with yourself.</p>
      <button class="btn" id="startBtn">Start Assessment</button>
    </div>
  `);
  document.getElementById("startBtn").onclick = () =>
    runAssessment("Stress Check (Before)", onBaselineDone);
}

/* ---------- Generic quiz engine ---------- */

function runQuiz(questions, title, onComplete) {
  const answers = new Array(questions.length).fill(null);
  let current = 0;

  function draw() {
    const q = questions[current];
    const pct = Math.round((current / questions.length) * 100);
    render(`
      <div class="card">
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
        <p class="muted">${title} — Question ${current + 1} of ${questions.length}</p>
        <h3>${q.text}</h3>
        <div id="options">
          ${q.options
            .map(
              (o, i) =>
                `<button class="option ${answers[current] === i ? "selected" : ""}" data-i="${i}">${o.text}</button>`
            )
            .join("")}
        </div>
        <div class="row">
          ${current > 0 ? `<button class="btn btn-ghost" id="backBtn">Back</button>` : ""}
          <button class="btn" id="nextBtn" ${answers[current] == null ? "disabled" : ""}>
            ${current === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    `);

    document.querySelectorAll(".option").forEach((btn) => {
      btn.onclick = () => {
        answers[current] = parseInt(btn.dataset.i, 10);
        draw();
      };
    });

    const backBtn = document.getElementById("backBtn");
    if (backBtn) backBtn.onclick = () => { current--; draw(); };

    document.getElementById("nextBtn").onclick = () => {
      if (answers[current] == null) return;
      if (current === questions.length - 1) {
        onComplete(sumScore(questions, answers), answers);
      } else {
        current++;
        draw();
      }
    };
  }

  draw();
}

/* ---------- Extra question: "stress right now" (0-10) ----------
   Separate from PSS-10. Never affects the PSS-10 score or level.
   Asked after the 10 PSS-10 questions, then results are shown. */

function askStressNow(title, onDone) {
  let value = null;

  function draw() {
    render(`
      <div class="card">
        <div class="progress"><div class="progress-bar" style="width:100%"></div></div>
        <p class="muted">${title} — One last question</p>
        <h3>How much stress do you feel right now?</h3>
        <p class="muted">0 = no stress at all, 10 = the most stress possible</p>
        <div class="scale">
          ${Array.from({ length: 11 }, (_, i) =>
            `<button class="scale-btn ${value === i ? "selected" : ""}" data-i="${i}">${i}</button>`
          ).join("")}
        </div>
        <div class="scale-labels"><span>No stress</span><span>Extreme stress</span></div>
        <button class="btn" id="nowNext" ${value == null ? "disabled" : ""}>Finish</button>
      </div>
    `);

    document.querySelectorAll(".scale-btn").forEach((btn) => {
      btn.onclick = () => {
        value = parseInt(btn.dataset.i, 10);
        draw();
      };
    });
    document.getElementById("nowNext").onclick = () => {
      if (value != null) onDone(value);
    };
  }

  draw();
}

// Runs PSS-10, then the separate 0-10 question, then calls onComplete.
function runAssessment(title, onComplete) {
  runQuiz(STRESS_QUESTIONS, title, (score, answers) =>
    askStressNow(title, (nowStress) => onComplete(score, answers, nowStress))
  );
}

/* ---------- 3. Baseline stress result ---------- */

function onBaselineDone(score, answers, nowStress) {
  session.baselineNow = nowStress;
  session.baselineScore = score;
  session.baselineLevel = getStressLevel(score);
  session.baselineAnswers = answers;
  const { level, className } = session.baselineLevel;

  render(`
    <div class="card">
      <h2>Your Stress Level</h2>
      <p class="result-score">${score}<span class="muted" style="font-size:1rem">/${PSS_MAX_SCORE}</span></p>
      <p class="center"><span class="badge ${className}">${level} Stress</span></p>
      <p>Before we start a breathing practice, we need to ask a few safety questions.</p>
      <button class="btn btn-accent" id="safetyBtn">Continue</button>
    </div>
  `);
  document.getElementById("safetyBtn").onclick = () => runSafetyScreening(level);
}

/* ---------- Safety screening (PRANA CARE) ---------- */

function runSafetyScreening(level) {
  let current = 0;
  // Which technique sections are still possible (B, C, D).
  const allowed = { B: true, C: true, D: true };
  const sectionOf = (i) => SAFETY_QUESTIONS[i].section.charAt(0);

  // Move to the next question to ask, or finish.
  function advance(failedSection) {
    let next = current + 1;
    if (failedSection) {
      // Skip the remaining questions of the section that was ruled out.
      while (next < SAFETY_QUESTIONS.length && sectionOf(next) === failedSection) next++;
    }
    if (next >= SAFETY_QUESTIONS.length) {
      finish();
    } else {
      current = next;
      draw();
    }
  }

  function finish() {
    const possible = Object.keys(allowed)
      .filter((k) => allowed[k])
      .map((k) => SAFETY_TECHNIQUES[k]); // objects: { name, video }
    if (possible.length === 0) {
      showNotRecommended();
    } else {
      onSafetyPassed(possible);
    }
  }

  function draw() {
    const q = SAFETY_QUESTIONS[current];
    const pct = Math.round((current / SAFETY_QUESTIONS.length) * 100);
    render(`
      <div class="card">
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
        <p class="muted">Safety Screening — Question ${current + 1} of ${SAFETY_QUESTIONS.length}</p>
        <p class="muted"><em>${q.section}</em></p>
        <h3>${q.text}</h3>
        <div>
          ${SAFETY_ANSWERS.map((a) => `<button class="option" data-a="${a}">${a}</button>`).join("")}
        </div>
      </div>
    `);

    document.querySelectorAll(".option").forEach((btn) => {
      btn.onclick = () => {
        const section = sectionOf(current);
        if (btn.dataset.a === SAFETY_SAFE_ANSWER) {
          advance(null);
        } else if (section === "A") {
          // General safety: Yes or Not sure stops everything.
          showNotRecommended();
        } else {
          // Technique section: rule out this technique, skip to next section.
          allowed[section] = false;
          advance(section);
        }
      };
    });
  }

  draw();
}

/* ---------- Background music (only on the "not recommended" page) ---------- */

let bgMusic = null;

function startBgMusic() {
  stopBgMusic();
  bgMusic = new Audio("relax-music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.3;
  // Browsers may block autoplay. If so, the user can press the music button.
  bgMusic.play().catch(() => {
    const btn = document.getElementById("musicBtn");
    if (btn) btn.textContent = "🔇 Play calming music";
  });
}

function stopBgMusic() {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }
}

function showNotRecommended() {
  render(`
    <div class="card">
      <h2>Not Recommended</h2>
      <div class="alert">
        <p>Based on your responses to the safety and suitability questionnaire,
        none of the available Prāṇāyāma techniques can currently be recommended
        through this application.</p>
        <p style="margin-bottom:0">Your safety is important. Please consult a qualified
        healthcare professional before starting any breathing practice.</p>
      </div>
      <div class="row">
        <button class="btn btn-ghost" id="restartBtn">Start Over</button>
        <button class="btn btn-ghost" id="musicBtn">🔊 Music on</button>
      </div>
    </div>
  `);
  document.getElementById("restartBtn").onclick = () => {
    stopBgMusic();
    showIntro();
  };
  document.getElementById("musicBtn").onclick = () => {
    const btn = document.getElementById("musicBtn");
    if (!bgMusic || bgMusic.paused) {
      if (!bgMusic) startBgMusic(); else bgMusic.play();
      btn.textContent = "🔊 Music on";
    } else {
      bgMusic.pause();
      btn.textContent = "🔇 Music off";
    }
  };
  startBgMusic();
}

// General safety passed and at least one technique is possible.
function onSafetyPassed(possible) {
  let chosen = null;

  function draw() {
    render(`
      <div class="card">
        <h2>Choose Your Practice</h2>
        <p>Based on your responses, you can only follow the following
        ${possible.length === 1 ? "Prāṇāyāma technique" : "Prāṇāyāma techniques"}.
        Select the one you prefer:</p>
        <div>
          ${possible
            .map(
              (t, i) =>
                `<button class="option ${chosen === i ? "selected" : ""}" data-i="${i}">${t.name}</button>`
            )
            .join("")}
        </div>
        <button class="btn btn-accent" id="startPractice" ${chosen == null ? "disabled" : ""}>Start Practice</button>
      </div>
    `);

    document.querySelectorAll(".option").forEach((btn) => {
      btn.onclick = () => {
        chosen = parseInt(btn.dataset.i, 10);
        draw();
      };
    });
    document.getElementById("startPractice").onclick = () => {
      if (chosen != null) showPractice(possible[chosen]);
    };
  }

  draw();
}

/* ---------- Practice video ---------- */

function showPractice(technique) {
  session.technique = technique.name;

  render(`
    <div class="card">
      <h2>${technique.name}</h2>
      <p class="muted">Watch the video and follow along. You can play it again as many times as you like.
      Click Next when you have finished.</p>
      <video id="practiceVideo" class="practice-video" controls playsinline
             src="${encodeURI(technique.video)}"></video>
      <p class="muted" id="videoHint">Next unlocks when the video has finished.</p>
      <button class="btn" id="practiceNext" disabled>Next</button>
    </div>
  `);

  const video = document.getElementById("practiceVideo");
  const nextBtn = document.getElementById("practiceNext");
  const unlock = () => {
    nextBtn.disabled = false;
    document.getElementById("videoHint").textContent = "You can play the video again, or click Next.";
  };
  video.onended = unlock;
  // If the video file cannot load, do not trap the user on this screen.
  video.onerror = () => {
    document.getElementById("videoHint").textContent = "The video could not be loaded. You can continue.";
    unlock();
  };

  nextBtn.onclick = () => {
    askStressNow("After Practice", onPracticeStressDone);
  };
}

/* ---------- Final result: stress before vs after practice ---------- */

function onPracticeStressDone(afterNow) {
  session.afterNow = afterNow;
  const before = session.baselineNow;
  const diff = before - afterNow;

  let verdict, verdictClass;
  if (diff > 0) {
    verdict = `Your stress rating went down by ${diff} point(s). Nice work! 🎉`;
    verdictClass = "low";
  } else if (diff === 0) {
    verdict = "Your stress rating stayed the same.";
    verdictClass = "moderate";
  } else {
    verdict = `Your stress rating went up by ${Math.abs(diff)} point(s).`;
    verdictClass = "high";
  }

  saveHistory({ ...session, date: new Date().toISOString() });

  render(`
    <div class="card">
      <h2>Before vs After</h2>
      <p class="muted center">${session.technique}</p>
      <div class="compare">
        <div class="box">
          <div class="num">${before}<span class="muted" style="font-size:1rem">/10</span></div>
          <div class="muted">Before practice</div>
        </div>
        <div class="box">
          <div class="num">${afterNow}<span class="muted" style="font-size:1rem">/10</span></div>
          <div class="muted">After practice</div>
        </div>
      </div>
      <p class="center"><span class="badge ${verdictClass}">${verdict}</span></p>
      <button class="btn" id="againBtn">Do Another Assessment</button>
    </div>
  `);
  document.getElementById("againBtn").onclick = showIntro;
}

/* ---------- boot ---------- */

(function init() {
  const saved = JSON.parse(localStorage.getItem("stressease_profile") || "null");
  if (saved) {
    session.profile = saved;
    showIntro();
  } else {
    showProfile();
  }
})();
