/* ============================================================
   DATA FILE — all questions, scores, thresholds, yoga routines.
   Everything here is DUMMY content. Edit freely later.
   Each answer has a "score". Higher score = more stress.
   ============================================================ */

/* -------- SET 1: Screening questions (5 MCQs) --------
   Purpose: decide if the user should see a psychiatrist.
   Max possible score = 5 questions x 4 = 20.
*/
const SCREENING_QUESTIONS = [
  {
    text: "MCQ Question 1",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 1 },
      { text: "Answer 3", score: 2 },
      { text: "Answer 4", score: 3 },
    ],
  },
  {
    text: "MCQ Question 2",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 1 },
      { text: "Answer 3", score: 3 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "MCQ Question 3",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 2 },
      { text: "Answer 3", score: 3 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "MCQ Question 4",
    options: [
      { text: "Answer 1", score: 1 },
      { text: "Answer 2", score: 2 },
      { text: "Answer 3", score: 3 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "MCQ Question 5",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 1 },
      { text: "Answer 3", score: 2 },
      { text: "Answer 4", score: 4 },
    ],
  },
];

// If screening score is AT OR ABOVE this, recommend a psychiatrist.
const SCREENING_DANGER_THRESHOLD = 14; // out of 20

/* -------- SET 2: Stress questions (used for baseline AND re-test) --------
   Max possible score = 5 questions x 4 = 20.
*/
const STRESS_QUESTIONS = [
  {
    text: "Stress MCQ Question 1",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 1 },
      { text: "Answer 3", score: 2 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "Stress MCQ Question 2",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 1 },
      { text: "Answer 3", score: 3 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "Stress MCQ Question 3",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 2 },
      { text: "Answer 3", score: 3 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "Stress MCQ Question 4",
    options: [
      { text: "Answer 1", score: 1 },
      { text: "Answer 2", score: 2 },
      { text: "Answer 3", score: 3 },
      { text: "Answer 4", score: 4 },
    ],
  },
  {
    text: "Stress MCQ Question 5",
    options: [
      { text: "Answer 1", score: 0 },
      { text: "Answer 2", score: 1 },
      { text: "Answer 3", score: 2 },
      { text: "Answer 4", score: 3 },
    ],
  },
];

// Stress level bands based on stress score (out of 20).
function getStressLevel(score) {
  if (score <= 6) return { level: "Low", className: "low" };
  if (score <= 13) return { level: "Moderate", className: "moderate" };
  return { level: "High", className: "high" };
}

// Screening rating text based on score (out of 20).
function getScreeningRating(score) {
  if (score <= 6) return { rating: "Good", className: "low" };
  if (score < SCREENING_DANGER_THRESHOLD) return { rating: "Needs attention", className: "moderate" };
  return { rating: "Concerning", className: "high" };
}

/* -------- Yoga routines, one per stress level --------
   DUMMY media. Replace the src paths with your real files.
   Put your files in a /media folder next to index.html, e.g.
   media/pose1.jpg, media/routine-low.mp4, media/audio-low.mp3
   The app falls back to a placeholder box if a file is missing.
*/
const YOGA_ROUTINES = {
  Low: {
    title: "Gentle Relaxation Routine",
    video: "1.mp4",
    steps: [
      { image: "p1.jpeg", caption: "Dummy Pose 1 — Deep breathing. Hold 30s." },
      { image: "p2.jpg", caption: "Dummy Pose 2 — Neck rolls. Hold 30s." },
      { image: "p3.jpg", caption: "Dummy Pose 3 — Shoulder stretch. Hold 30s." },
    ],
  },
  Moderate: {
    title: "Calming Stretch Routine",
    video: "1.mp4",
    steps: [
      { image: "p1.jpeg", caption: "Dummy Pose 1 — Child's pose. Hold 45s." },
      { image: "p2.jpg", caption: "Dummy Pose 2 — Seated forward bend. Hold 45s." },
      { image: "p3.jpg", caption: "Dummy Pose 3 — Cat-cow stretch. 10 reps." },
    ],
  },
  High: {
    title: "Deep Unwind Routine",
    video: "2.mp4",
    steps: [
      { image: "p1.jpeg", caption: "Dummy Pose 1 — Guided breathing. 2 min." },
      { image: "p2.jpg", caption: "Dummy Pose 2 — Reclining twist. Hold 60s each side." },
      { image: "p3.jpg", caption: "Dummy Pose 3 — Corpse pose (Savasana). 3 min." },
    ],
  },
};
