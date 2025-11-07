// Questionnaire data and scoring thresholds
// Reversed scoring: Yes = 0 (higher risk), Sometimes = 1, No = 2 (lower risk)
// Lower total score = Higher risk

export const RESPONSE_POINTS = {
  Yes: 0,
  Sometimes: 1,
  No: 2,
};

export const AGE_GROUPS = {
  '3-5': {
    label: 'Early Years (3–5)',
    questions: [
      'Is it hard for your child to say some sounds clearly for their age? (e.g., says “tat” instead of “cat”)',
      'Do they confuse words that sound alike? (e.g., “cup” and “cap”)',
      'Do they forget the names of everyday things? (e.g., toys, animals)',
      'Do they find it hard to follow 2-step instructions? (e.g., “Pick up the ball and put it on the chair”)',
      'Do they enjoy rhyming games or notice rhymes in songs?',
      'Can they clap the parts of a word? (e.g., “el-e-phant” = 3 claps)',
      'Can they tell you the first sound in their own name or a familiar word?',
      'Do they have trouble remembering 3 simple things you just said? (e.g., “red, ball, chair”)',
      'Do they forget nursery rhymes or songs quickly?',
      'Do they forget the order of events in a story they just heard?',
      'Can they recognize their name when it’s written?',
      'Do they know a few letters?',
      'Do they pretend to read by telling a story from the pictures?',
      'Do they struggle to hold crayons or use their fingers for small tasks?',
      'Can they copy simple shapes like circles or lines?',
      'Does anyone in the family have trouble with reading, spelling, or language?',
      'Did they start talking late? (After 18 months)',
      'Have they had many ear infections or hearing issues?',
    ],
    scoring: [
      { min: 25, level: 'Low risk' },      // High score (25-36) = Low risk
      { min: 13, max: 24, level: 'Medium risk' },  // Medium score (13-24) = Medium risk
      { max: 12, level: 'High risk' },     // Low score (0-12) = High risk
    ],
    maxPoints: 18 * 2, // 36
  },
  '6-8': {
    label: 'Pre-School (6–8)',
    questions: [
      'Does your child recognize most letters of the alphabet?',
      'Does your child mix up letters that look similar (e.g., b/d, p/q)?',
      'Can your child match letters with their sounds?',
      'Can your child write their name correctly without help?',
      'Can your child spell simple words like “cat” or “sun” correctly?',
      'Does your child remember instructions with 2–3 steps?',
      'Does your child recall names of familiar objects and people easily?',
      'Does your child avoid reading or get frustrated while reading?',
      'Does your child need to re-read sentences to understand them?',
      'Does your child confuse the order of letters in words?',
      'Does your child find rhyming words difficult to identify?',
      'Does your child have trouble remembering the days of the week in order?',
      'Does your child hold books upside down or in an unusual way?',
      'Does your child guess words instead of reading them?',
      'Does your child have difficulty clapping out syllables in words?',
      'Does your child reverse numbers (e.g., writing 21 instead of 12)?',
      'Does your child show difficulty learning simple sight words like “the” or “and”?',
      'Does your child forget words they have already learned?',
      'Does your child have difficulty remembering songs or nursery rhymes?',
      'Does your child seem to understand better when things are explained verbally rather than in writing?',
    ],
    scoring: [
      { min: 28, level: 'Low risk' },      // High score (28-40) = Low risk
      { min: 16, max: 27, level: 'Medium risk' },  // Medium score (16-27) = Medium risk
      { max: 15, level: 'High risk' },     // Low score (0-15) = High risk
    ],
    maxPoints: 20 * 2, // 40
  },
  '9-12': {
    label: 'Middle School (9–12)',
    questions: [
      'Does your child read grade-level books fluently aloud?',
      'Does your child skip, repeat, or add words while reading?',
      'Does your child understand and explain what they have read?',
      'Does your child struggle to learn and remember new words?',
      'Is your child’s handwriting often messy or hard to read?',
      'Does your child spell words phonetically but incorrectly (e.g., “frend” for “friend”)?',
      'Does your child remember instructions with 3–4 steps?',
      'Does your child struggle to remember sequences like days of the week or months?',
      'Does your child have trouble organizing schoolwork and assignments?',
      'Does your child get frustrated or anxious about reading and writing tasks?',
      'Does your child avoid reading for pleasure?',
      'Does your child have difficulty copying from the board or another text?',
      'Does your child confuse similar-looking words while reading?',
      'Does your child take longer than expected to complete reading assignments?',
      'Does your child struggle with reading comprehension tests?',
      'Does your child mix up the order of letters when writing?',
      'Does your child have trouble summarizing what they have read?',
      'Does your child avoid writing tasks or write very little?',
      'Does your child often forget how to spell words they have learned before?',
      'Does your child show better understanding when information is given verbally instead of in written form?',
    ],
    scoring: [
      { min: 28, level: 'Low risk' },      // High score (28-40) = Low risk
      { min: 16, max: 27, level: 'Medium risk' },  // Medium score (16-27) = Medium risk
      { max: 15, level: 'High risk' },     // Low score (0-15) = High risk
    ],
    maxPoints: 20 * 2, // 40
  },
};

export function ageToGroup(age) {
  const a = Number(age);
  if (Number.isNaN(a)) return null;
  if (a >= 3 && a <= 5) return '3-5';
  if (a >= 6 && a <= 8) return '6-8';
  if (a >= 9 && a <= 12) return '9-12';
  return null;
}

export function categorizeRisk(groupKey, score) {
  const group = AGE_GROUPS[groupKey];
  if (!group) return { level: 'Unknown', details: '' };
  const rule = group.scoring.find((r) => {
    const minOk = r.min === undefined || score >= r.min;
    const maxOk = r.max === undefined || score <= r.max;
    return minOk && maxOk;
  });
  return { level: rule ? rule.level : 'Unknown', details: '' };
}


