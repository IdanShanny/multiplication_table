import { Gender } from './types';

// Helper to get gendered suffix
const getSuffix = (gender: Gender): string => gender === 'male' ? '' : 'ה';
const getYou = (gender: Gender): string => gender === 'male' ? 'אתה' : 'את';
const getGreat = (gender: Gender): string => gender === 'male' ? 'מעולה' : 'מעולה';
const getContinue = (gender: Gender): string => gender === 'male' ? 'תמשיך' : 'תמשיכי';
const getKnow = (gender: Gender): string => gender === 'male' ? 'יודע' : 'יודעת';
const getImprove = (gender: Gender): string => gender === 'male' ? 'משתפר' : 'משתפרת';
const getChampion = (gender: Gender): string => gender === 'male' ? 'אלוף' : 'אלופה';
const getAdvancing = (gender: Gender): string => gender === 'male' ? 'מתקדם' : 'מתקדמת';
const getLearning = (gender: Gender): string => gender === 'male' ? 'לומד' : 'לומדת';

export const getCorrectMessages = (name: string, gender: Gender): string[] => {
  const suffix = getSuffix(gender);
  const you = getYou(gender);
  const great = getGreat(gender);
  const cont = getContinue(gender);
  const know = getKnow(gender);
  const improve = getImprove(gender);
  const champion = getChampion(gender);
  const advancing = getAdvancing(gender);
  const learning = getLearning(gender);

  return [
    // Short messages
    'נכון!',
    'יפה!',
    'מצוין!',
    `כל הכבוד, ${name}!`,
    `${great}!`,
    'בדיוק!',
    'נהדר!',
    
    // Medium messages
    `יפה מאוד, ${name}!`,
    `${name}, ${you} ${champion}!`,
    `תשובה נכונה, ${name}!`,
    `${cont} ככה, ${name}!`,
    `${you} ${know} את זה!`,
    
    // Longer encouraging messages
    `כל הכבוד, ${name}! ${you} ${improve} כל הזמן!`,
    `יפה מאוד, ${name}! לאט ובטוח ${you} ${learning} את לוח הכפל!`,
    `${great}, ${name}! התרגול משתלם!`,
    `${name}, ${you} עושה עבודה נהדרת! ${cont} ככה!`,
    `בול! ${name}, ${you} ממש ${advancing}!`,
    `${name}, איזה כיף! ${you} ${know} את התשובה!`,
    `תשובה מושלמת, ${name}! ${you} בדרך הנכונה!`,
    `${name}, רואים שהתרגול עוזר! ${cont} ככה!`,
  ];
};

export const getWrongMessages = (name: string, gender: Gender, a: number, b: number, correctAnswer: number): string[] => {
  const you = getYou(gender);
  const tryAgain = gender === 'male' ? 'תנסה' : 'תנסי';
  const remember = gender === 'male' ? 'תזכור' : 'תזכרי';
  const dontWorry = gender === 'male' ? 'אל תדאג' : 'אל תדאגי';
  const cont = getContinue(gender);

  // Answer format: a×b=correctAnswer (e.g., 10×6=60)
  const answer = `${a}×${b}=${correctAnswer}`;

  return [
    // Short messages
    `לא נכון.`,
    `טעות.`,
    `לא בדיוק.`,
    
    // Medium messages
    `לא נכון, ${name}. ${tryAgain} שוב!`,
    `טעות קטנה, ${name}.`,
    `${name}, ${tryAgain} לזכור!`,
    
    // Longer encouraging messages
    `לא נורא, ${name}! טעויות עוזרות לנו ללמוד!`,
    `${dontWorry}, ${name}! בפעם הבאה יהיה יותר קל!`,
    `${name}, ${cont} להתאמן ויהיה לך קל יותר!`,
    `טעות זה בסדר, ${name}! ${remember} את זה לפעם הבאה!`,
    `${name}, כל טעות מקרבת אותך להצלחה!`,
    `לא נכון, אבל ${you} בכיוון הנכון, ${name}!`,
  ];
};

// Get the correct answer string separately for prominent display
export const getCorrectAnswerString = (a: number, b: number, correctAnswer: number): string => {
  return `${a}×${b}=${correctAnswer}`;
};

export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

