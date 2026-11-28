/* ============================================================
   APP LOGIC — drives all screens and the full flow.
   Flow:
   profile -> PSS-10 (before) -> yoga -> PSS-10 (after) -> results
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
      <p>You'll answer 10 short questions about the last month, then follow
      a short yoga routine, and finally answer the same questions to see
      if you feel better.</p>
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
   Separate from PSS-10. Never affects the score, level or yoga choice.
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
      <p>Let's do a short yoga routine designed for your stress level.</p>
      <button class="btn btn-accent" id="yogaBtn">Start Yoga Routine</button>
    </div>
  `);
  document.getElementById("yogaBtn").onclick = () => showYoga(level);
}

/* ---------- 4. Yoga routine ---------- */

function showYoga(level) {
  const routine = YOGA_ROUTINES[level];
  let step = 0;

  function draw() {
    const s = routine.steps[step];
    const pct = Math.round((step / routine.steps.length) * 100);
    render(`
      <div class="card">
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
        <h2>${routine.title}</h2>
        <p class="muted">Step ${step + 1} of ${routine.steps.length}</p>

        <img class="yoga-img" src="${s.image}" alt="pose"
             onerror="this.outerHTML='<div class=&quot;yoga-img&quot; style=&quot;padding:3rem;text-align:center;color:#7a8a90&quot;>[ Dummy pose image placeholder ]</div>'" />

        <p><strong>${s.caption}</strong></p>

        <video class="yoga-media" controls src="${routine.video}"
               onerror="this.outerHTML='<div class=&quot;yoga-media&quot; style=&quot;padding:1rem;text-align:center;color:#fff&quot;>[ Dummy video instruction placeholder ]</div>'">
        </video>

        <div class="row">
          ${step > 0 ? `<button class="btn btn-ghost" id="prevBtn">Previous</button>` : ""}
          <button class="btn" id="nextBtn">
            ${step === routine.steps.length - 1 ? "Done — Re-check Stress" : "Next Pose"}
          </button>
        </div>
      </div>
    `);

    const prev = document.getElementById("prevBtn");
    if (prev) prev.onclick = () => { step--; draw(); };

    document.getElementById("nextBtn").onclick = () => {
      if (step === routine.steps.length - 1) {
        runAssessment("Stress Check (After)", onPostDone);
      } else {
        step++;
        draw();
      }
    };
  }

  draw();
}

/* ---------- 5. Re-test result + comparison ---------- */

function onPostDone(score, answers, nowStress) {
  session.postNow = nowStress;
  session.postScore = score;
  session.postAnswers = answers;
  session.postLevel = getStressLevel(score);

  const before = session.baselineScore;
  const after = score;
  const diff = before - after;

  let verdict, verdictClass;
  if (diff > 0) {
    verdict = `Your stress went down by ${diff} point(s). Nice work! 🎉`;
    verdictClass = "low";
  } else if (diff === 0) {
    verdict = "Your stress stayed the same. Try the routine again later.";
    verdictClass = "moderate";
  } else {
    verdict = `Your stress went up by ${Math.abs(diff)} point(s). Consider resting or trying again.`;
    verdictClass = "high";
  }

  saveHistory({ ...session, date: new Date().toISOString(), referred: false });

  render(`
    <div class="card">
      <h2>Before vs After</h2>
      <div class="compare">
        <div class="box">
          <div class="num">${before}<span class="muted" style="font-size:1rem">/${PSS_MAX_SCORE}</span></div>
          <div class="muted">Before (${session.baselineLevel.level})</div>
        </div>
        <div class="box">
          <div class="num">${after}<span class="muted" style="font-size:1rem">/${PSS_MAX_SCORE}</span></div>
          <div class="muted">After (${session.postLevel.level})</div>
        </div>
      </div>
      <p class="center"><span class="badge ${verdictClass}">${verdict}</span></p>
      <p class="center muted">Stress you reported right now (0–10, not part of the score):<br/>
        Before: <strong>${session.baselineNow}</strong> &nbsp;→&nbsp; After: <strong>${nowStress}</strong></p>
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
