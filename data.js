/* ============================================================
   DATA FILE — PSS-10 questions, scores and stress levels.
   - Stress set: PSS-10 (Perceived Stress Scale, Cohen et al., 1983).
   ============================================================ */

/* -------- PSS-10 (used for baseline AND re-test) --------
   Response scale: 0 Never, 1 Almost never, 2 Sometimes,
                   3 Fairly often, 4 Very often.
   Items 4, 5, 7, 8 are positively worded and REVERSE-scored
   (0=4, 1=3, 2=2, 3=1, 4=0). Total range: 0 to 40.
*/
const PSS_MAX_SCORE = 40;
const PSS_RESPONSES = ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"];

// Each item: question text + whether it is reverse-scored.
const PSS_ITEMS = [
  { text: "In the last month, how often have you been upset because of something that happened unexpectedly?", reverse: false },
  { text: "In the last month, how often have you felt that you were unable to control the important things in your life?", reverse: false },
  { text: "In the last month, how often have you felt nervous and “stressed”?", reverse: false },
  { text: "In the last month, how often have you felt confident about your ability to handle your personal problems?", reverse: true },
  { text: "In the last month, how often have you felt that things were going your way?", reverse: true },
  { text: "In the last month, how often have you found that you could not cope with all the things that you had to do?", reverse: false },
  { text: "In the last month, how often have you been able to control irritations in your life?", reverse: true },
  { text: "In the last month, how often have you felt that you were on top of things?", reverse: true },
  { text: "In the last month, how often have you been angered because of things that were outside of your control?", reverse: false },
  { text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", reverse: false },
];

// Build the question objects the quiz engine uses.
// The reverse scoring is applied here, so each option's "score" is final.
const STRESS_QUESTIONS = PSS_ITEMS.map((item) => ({
  text: item.text,
  options: PSS_RESPONSES.map((label, value) => ({
    text: label,
    score: item.reverse ? 4 - value : value,
  })),
}));

// Subscales (item numbers are 1-based).
const PSS_HELPLESSNESS_ITEMS = [1, 2, 3, 6, 9, 10];
const PSS_SELF_EFFICACY_ITEMS = [4, 5, 7, 8];

// Sum the scores of selected items. `answers` = chosen option index per question.
function subscaleScore(answers, itemNumbers) {
  return itemNumbers.reduce((total, n) => {
    const optIndex = answers[n - 1];
    if (optIndex == null) return total;
    return total + STRESS_QUESTIONS[n - 1].options[optIndex].score;
  }, 0);
}

// Stress level bands (unofficial PSS-10 interpretation), score out of 40.
function getStressLevel(score) {
  if (score <= 13) return { level: "Low", className: "low" };
  if (score <= 26) return { level: "Moderate", className: "moderate" };
  return { level: "High", className: "high" };
}

