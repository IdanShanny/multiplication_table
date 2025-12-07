import { Gender } from './types';

// Helper to get gendered suffix
const getSuffix = (gender: Gender): string => gender === 'male' ? '' : 'ה';
const getYou = (gender: Gender): string => gender === 'male' ? 'אתה' : 'את';
const getGreat = (gender: Gender): string => gender === 'male' ? 'מעולה' : 'מעולה';
const getContinue = (gender: Gender): string => gender === 'male' ? 'ממשיך' : 'ממשיכה';
const getKnow = (gender: Gender): string => gender === 'male' ? 'יודע' : 'יודעת';
const getImprove = (gender: Gender): string => gender === 'male' ? 'משתפר' : 'משתפרת';

export const getCorrectMessages = (name: string, gender: Gender): string[] => {
  const suffix = getSuffix(gender);
  const you = getYou(gender);
  const great = getGreat(gender);
  const cont = getContinue(gender);
  const know = getKnow(gender);
  const improve = getImprove(gender);

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
    `${name}, ${you} אלוף${suffix}!`,
    `תשובה נכונה, ${name}!`,
    `${cont} ככה, ${name}!`,
    `${you} ${know} את זה!`,
    
    // Longer encouraging messages
    `כל הכבוד, ${name}! ${you} ${improve} כל הזמן!`,
    `יפה מאוד, ${name}! לאט ובטוח ${you} לומד${suffix} את לוח הכפל!`,
    `${great}, ${name}! התרגול משתלם!`,
    `${name}, ${you} עושה עבודה נהדרת! ${cont} ככה!`,
    `בול! ${name}, ${you} ממש מתקדם${suffix}!`,
    `${name}, איזה כיף! ${you} ${know} את התשובה!`,
    `תשובה מושלמת, ${name}! ${you} על הדרך הנכונה!`,
    `${name}, רואים שהתרגול עוזר! ${cont} ככה!`,
  ];
};

export const getWrongMessages = (name: string, gender: Gender, a: number, b: number, correctAnswer: number): string[] => {
  const suffix = getSuffix(gender);
  const you = getYou(gender);
  const tryAgain = gender === 'male' ? 'תנסה' : 'תנסי';
  const remember = gender === 'male' ? 'תזכור' : 'תזכרי';
  const dontWorry = gender === 'male' ? 'אל תדאג' : 'אל תדאגי';
  const cont = getContinue(gender);

  const answer = `${a}×${b}=${correctAnswer}`;

  return [
    // Short messages
    `לא נכון. ${answer}`,
    `טעות. ${answer}`,
    `לא בדיוק. ${answer}`,
    
    // Medium messages
    `לא נכון, ${name}. ${answer} - ${tryAgain} שוב!`,
    `טעות קטנה, ${name}. ${answer}`,
    `${name}, ${answer} - ${tryAgain} לזכור!`,
    
    // Longer encouraging messages
    `לא נורא, ${name}! ${answer}. טעויות עוזרות לנו ללמוד!`,
    `${dontWorry}, ${name}! ${answer}. בפעם הבאה יהיה יותר קל!`,
    `${name}, ${answer}. ${cont} להתאמן ויהיה לך קל יותר!`,
    `טעות זה בסדר, ${name}! ${answer}. ${remember} את זה לפעם הבאה!`,
    `${name}, ${answer}. כל טעות מקרבת אותך להצלחה!`,
    `לא נכון, אבל ${you} בכיוון הנכון, ${name}! ${answer}`,
  ];
};

export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

