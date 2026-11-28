/* ============================================================
   PRANA CARE — Safety Screening for Guided Pranayama Practice
   15 questions. Answers: Yes / No / Not sure.
   Only "No" is safe. "Yes" or "Not sure" on ANY question stops the flow.
   This is screening only and does not diagnose medical conditions.
   ============================================================ */

const SAFETY_ANSWERS = ["Yes", "No", "Not sure"];
const SAFETY_SAFE_ANSWER = "No";

// Section A (General) must be all "No", or the flow stops.
// Sections B, C, D each decide one technique. A "Yes" or "Not sure"
// only rules out that technique and skips the rest of that section.
// Each technique has a display name and its instruction video file.
const SAFETY_TECHNIQUES = {
  B: { name: "Nāḍī Śodhana Prāṇāyāma", video: "Nadi Shodhana Pranayama.mp4" },
  C: { name: "Bhrāmarī Prāṇāyāma", video: "Bhramari Pranayama.mp4" },
  D: { name: "Dīrgha Prāṇāyāma", video: "DIRGHA PRANAYAMA.mp4" },
};

const SAFETY_QUESTIONS = [
  { section: "A. General Safety Screening", text: "Are you currently experiencing severe difficulty in breathing, chest pain, or chest tightness?" },
  { section: "A. General Safety Screening", text: "Are you currently experiencing severe dizziness, fainting, or near-fainting?" },
  { section: "A. General Safety Screening", text: "Do you have an uncontrolled respiratory condition, such as asthma?" },
  { section: "A. General Safety Screening", text: "Do you have a significant heart condition or uncontrolled high blood pressure?" },
  { section: "A. General Safety Screening", text: "Are you currently experiencing fever or an acute respiratory illness?" },
  { section: "A. General Safety Screening", text: "Are you pregnant, or have you recently undergone major surgery without being medically cleared for breathing exercises?" },
  { section: "A. General Safety Screening", text: "Has a healthcare professional advised you to avoid yoga, physical activity, or breathing exercises?" },
  { section: "A. General Safety Screening", text: "Have you previously experienced significant dizziness, breathlessness, or discomfort during pranayama or breathing exercises?" },
  { section: "B. Nāḍī Śodhana-Specific Screening", text: "Do you currently have severe nasal obstruction that makes breathing through either nostril difficult?" },
  { section: "B. Nāḍī Śodhana-Specific Screening", text: "Do you have active nasal conditions, recent nasal injury, or recent nasal surgery that makes alternate-nostril breathing uncomfortable or medically restricted?" },
  { section: "C. Bhrāmarī-Specific Screening", text: "Do you currently have significant ear pain, an active ear infection, or a condition for which humming has been medically restricted?" },
  { section: "C. Bhrāmarī-Specific Screening", text: "Do you have meals (within last 2 hours)?" },
  { section: "D. Dīrgha Prāṇāyāma-Specific Screening", text: "Do you experience chest or abdominal discomfort when taking a comfortable, slightly deeper breath?" },
  { section: "D. Dīrgha Prāṇāyāma-Specific Screening", text: "Do you experience dizziness or significant breathlessness when attempting slow, deep breathing?" },
  { section: "D. Dīrgha Prāṇāyāma-Specific Screening", text: "Do you have a recent chest or abdominal injury or condition that makes this breathing practice uncomfortable?" },
];
