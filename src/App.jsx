import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue } from "firebase/database";
import { createClient } from "@supabase/supabase-js";

// ── Services ──────────────────────────────────────────────────
const supabase = createClient(
  "https://hlvjyikeyjigaxucpkbu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmp5aWtleWppZ2F4dWNwa2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDU4NzIsImV4cCI6MjA4ODI4MTg3Mn0.HsAhp0b9_hmAeEpXaP6krHMUL-9rU0dDCnu-KSzplSA"
);
const db = getDatabase(initializeApp({
  apiKey: "AIzaSyBl86SocbdtuN4t1tQ1j2pECdW8U_BsPXA",
  authDomain: "mamad-proj.firebaseapp.com",
  databaseURL: "https://mamad-proj-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mamad-proj",
  storageBucket: "mamad-proj.firebasestorage.app",
  messagingSenderId: "951625552802",
  appId: "1:951625552802:web:5b4151e77283e7105898fb"
}));

// ── Design System ─────────────────────────────────────────────
// Direction: "Late-night game show" — deep indigo base, electric violet + neon lime accents,
// glassmorphism cards, chunky rounded corners, bold Clash Display font.
const D = {
  // Backgrounds
  bg:        "linear-gradient(145deg,#0E0A1F 0%,#1A1035 50%,#0E0A1F 100%)",
  bgFixed:   "#0E0A1F",
  card:      "rgba(255,255,255,.06)",
  cardHover: "rgba(255,255,255,.10)",
  cardSolid: "#1C1535",
  // Accents
  violet:    "#A855F7",
  violetGlow:"rgba(168,85,247,.3)",
  lime:      "#A3E635",
  limeGlow:  "rgba(163,230,53,.25)",
  gold:      "#FBBF24",
  goldGlow:  "rgba(251,191,36,.25)",
  pink:      "#F472B6",
  cyan:      "#22D3EE",
  // Neutrals
  white:     "#FFFFFF",
  offWhite:  "rgba(255,255,255,.88)",
  muted:     "rgba(255,255,255,.45)",
  subtle:    "rgba(255,255,255,.12)",
  border:    "rgba(255,255,255,.10)",
  // Status
  green:     "#4ADE80",
  greenBg:   "rgba(74,222,128,.12)",
  red:       "#F87171",
  redBg:     "rgba(248,113,113,.12)",
  amber:     "#FCD34D",
  // Radii
  r:   "16px",
  rLg: "24px",
  rXl: "32px",
  // Shadows
  shadow:    "0 4px 24px rgba(0,0,0,.4)",
  shadowGlow:"0 0 40px rgba(168,85,247,.2)",
  glow: (col) => `0 0 24px ${col}`,
};

// ── Global CSS ────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{min-height:100%;background:#0E0A1F;direction:rtl;overscroll-behavior:none;}
  button,input{font-family:'Plus Jakarta Sans',sans-serif;}
  button{cursor:pointer;-webkit-tap-highlight-color:transparent;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px;}

  @keyframes fadeUp   {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn  {from{opacity:0;transform:scale(.82)}to{opacity:1;transform:scale(1)}}
  @keyframes glow     {0%,100%{opacity:.6}50%{opacity:1}}
  @keyframes spin     {to{transform:rotate(360deg)}}
  @keyframes countdown{0%{transform:scale(1.6);opacity:0}100%{transform:scale(1);opacity:1}}
  @keyframes correctPop{0%{transform:scale(1)}40%{transform:scale(1.08)}100%{transform:scale(1)}}
  @keyframes wrongShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

  .fu{animation:fadeUp .4s cubic-bezier(.22,.68,0,1.15) both}
  .si{animation:scaleIn .35s cubic-bezier(.22,.68,0,1.2) both}
  .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}.d4{animation-delay:.24s}
`;

// ── Data ──────────────────────────────────────────────────────
const QUESTIONS = [
  {id:"q01",label:"מה המאכל האהוב עליך?",           giphy:"delicious food yum",       e:"🍕",  d:["פיצה","סושי","המבורגר","פסטה","שווארמה","גלידה","סטייק","חומוס","לזניה","ראמן"]},
  {id:"q02",label:"מה האוכל שאתה הכי שונא?",         giphy:"disgusted food gross",     e:"🤢",  d:["כרוב ניצנים","סרדינים","כבד","חציל","סלק","כוסמת","כרובית","דג מלוח","לשון","טחינה"]},
  {id:"q03",label:"לאן הכי רצית לטוס לחופשה?",       giphy:"vacation travel beach",    e:"✈️", d:["יפן","ניו יורק","פריז","תאילנד","ברצלונה","איטליה","יוון","מלדיביים","ברזיל","קנדה","אוסטרליה","מרוקו","פורטוגל","איסלנד"]},
  {id:"q04",label:"באיזו ארץ היית רוצה לגור?",       giphy:"world travel adventure",   e:"🌍", d:["קנדה","ניו זילנד","שוודיה","אוסטרליה","הולנד","שוויץ","נורווגיה","פורטוגל","גרמניה","ספרד","דנמרק","יפן","אירלנד","סקוטלנד"]},
  {id:"q05",label:"מה העיר הכי יפה שביקרת בה?",      giphy:"beautiful city travel",    e:"🏙️",d:["פריז","רומא","ניו יורק","ברצלונה","טוקיו","אמסטרדם","פראג","דובאי","סידני","לונדון","ויאנה","ליסבון","בנגקוק"]},
  {id:"q06",label:"מה הסרט שצפית בו הכי הרבה?",     giphy:"movie popcorn cinema",     e:"🎬", d:["האריה המלך","פורסט גאמפ","הארי פוטר","טיטאניק","אינטרסטלר","שר הטבעות","הסנדק","מטריקס","פייט קלאב","טרמינייטור"]},
  {id:"q07",label:"מה הסדרה האהובה עליך?",           giphy:"binge watch tv series",    e:"📺", d:["שובר שורות","חברים","משחקי הכס","ביג בנג","ווקינג דד","שרלוק","ביצים","מנדלוריאן","סופרנוס","אוזארק"]},
  {id:"q08",label:"מה המשחק הכי ממכר שמשחקת?",      giphy:"video game addicted",      e:"🎮", d:["מיינקראפט","פורטנייט","FIFA","GTA","Valorant","Roblox","Zelda","Mario Kart","Among Us","Candy Crush","Elden Ring"]},
  {id:"q09",label:"מה סגנון המוזיקה האהוב עליך?",    giphy:"music genre vibes",        e:"🎸", d:["פופ","רוק","היפ הופ","אלקטרוניקה","קלאסי","מזרחי","מטאל","ריגטון","אינדי","בלוז","פאנק","דאנס"]},
  {id:"q10",label:"מה השיר שאתה הכי אוהב?",         giphy:"music dancing happy",      e:"🎵", d:["Bohemian Rhapsody","Billie Jean","Imagine","Hotel California","Hey Jude","Thriller","Smells Like Teen Spirit","Shape of You"]},
  {id:"q11",label:"מה הרכב שחלמת עליו?",             giphy:"dream car luxury",         e:"🚗", d:["פורשה","פרארי","טסלה","מרצדס G","למבורגיני","BMW M3","מאזדה MX5","פורד מוסטנג","אאודי R8","ריינג רובר"]},
  {id:"q12",label:"מה הספורט האהוב עליך?",           giphy:"sports action game",       e:"⚽", d:["כדורגל","כדורסל","טניס","שחייה","אופניים","ריצה","גלישה","סקי","בוקס","כדורעף","טריאתלון","פדל"]},
  {id:"q13",label:"מה הספורטאי שאתה הכי מעריץ?",    giphy:"sports hero champion",     e:"🏅", d:["מסי","רונאלדו","לברון","פדרר","מייקל ג'ורדן","בולט","סרנה וויליאמס","נאדאל","טייגר וודס","שאקיל אונייל"]},
  {id:"q14",label:"מה הספר האהוב עליך?",             giphy:"reading books library",    e:"📚", d:["הארי פוטר","שר הטבעות","הנסיך הקטן","קוד דה וינצ'י","סאפיינס","המבצר","מאה שנות בדידות","הסיפור של השפחה"]},
  {id:"q15",label:"מה המקצוע שחלמת עליו בילדות?",   giphy:"dream job career",         e:"👔", d:["רופא","פיילוט","שחקן","כדורגלן","אסטרונאוט","מבשל","עורך דין","מורה","צלם","מדען","שוטר","כבאי"]},
  {id:"q16",label:"מה החלום הכי גדול שלך?",         giphy:"dream big success",        e:"🌟", d:["לטייל בכל העולם","לפתוח עסק","לכתוב ספר","לבנות בית","להיות עצמאי כלכלית","לעשות שינוי בעולם","לגדל משפחה"]},
  {id:"q17",label:"מה התחביב העיקרי שלך?",           giphy:"hobby creative fun",       e:"🎨", d:["ציור","ריצה","בישול","גיימינג","גינון","צילום","קריאה","נגינה","יוגה","אפייה","טיולים","עבודת יד"]},
  {id:"q18",label:"איזה כישרון נסתר יש לך?",         giphy:"talent surprise wow",      e:"✨", d:["שירה","ריקוד","קסמים","חיקוי","ציור","גיטרה","אמנות","כתיבה","בישול","שרטוט"]},
  {id:"q19",label:"איזה חיה היית רוצה להיות?",       giphy:"cute animals funny",       e:"🦁", d:["דולפין","נשר","אריה","כלב","חתול","ינשוף","פנתר","זאב","פיל","קוף","נמר","עורב"]},
  {id:"q20",label:"איזה סופרפאואר היית רוצה?",       giphy:"superhero power flying",   e:"🦸", d:["טלפתיה","עצירת זמן","בלתי נראה","טיסה","ריפוי מיידי","כוח פיזי","שכפול עצמי","ניבוי עתיד","שינוי צורה"]},
  {id:"q21",label:"מה היית קונה ראשון בלוטו?",       giphy:"lottery winner money",     e:"💰", d:["בית על הים","מכונית פרארי","טיול עולמי","השקעות","מתנות למשפחה","עסק משלי","קרן צדקה","אי פרטי","פנטהאוז"]},
  {id:"q22",label:"מה הרגל הכי טוב שלך?",            giphy:"good habits healthy",      e:"💪", d:["ספורט יומי","שינה מוקדמת","קריאה","מדיטציה","שתיית מים","אכילה בריאה","תכנון יומי","הכרת תודה"]},
  {id:"q23",label:"מה הדבר שאתה אף פעם לא שוכח?",   giphy:"daily habit routine",      e:"🎒", d:["טלפון","מפתחות","ארנק","אוזניות","בקבוק מים","מטעין","תרופות","ספר","מחברת","מטריה"]},
  {id:"q24",label:"מה עונת השנה האהובה עליך?",       giphy:"seasons nature beautiful", e:"🍂", d:["קיץ","חורף","אביב","סתיו"]},
  {id:"q25",label:"ים או הרים?",                     giphy:"sea mountains nature",     e:"🌊", d:["ים","הרים","מדבר","עיר","יער","כפר","ג'ונגל","ערבה"]},
  {id:"q26",label:"מה הגאדג'ט שאתה הכי אוהב?",      giphy:"technology gadget cool",   e:"📱", d:["אייפון","אייפד","אוזניות אלחוטיות","שעון חכם","מחשב נייד","מצלמה","רמקול חכם","מסך גדול","מקלדת מכנית"]},
  {id:"q27",label:"מה הדבר הכי מוזר שעשית?",         giphy:"weird funny strange",      e:"🤪", d:["קפצתי ממקום גבוה","אכלתי משהו מוזר","דיברתי עם עצמי בקול","ישנתי 18 שעות","הלכתי בפיג'מה לרחוב"]},
  {id:"q28",label:"מה הדבר שהכי מעצבן אותך?",       giphy:"annoyed frustrated",       e:"😤", d:["אנשים שמאחרים","רעש בלילה","תור ארוך","ספויילרים","אנשים שלא מקשיבים","פקקים","חיבור אינטרנט איטי"]},
  {id:"q29",label:"מה המאכל שאתה הכי טוב בהכנתו?",  giphy:"cooking chef kitchen",     e:"👨‍🍳",d:["פסטה","שקשוקה","סטייק","עוגה","סלט","ריזוטו","לחם","עוגיות","אורז מוקפץ","מרק עוף"]},
  {id:"q30",label:"מה הדבר שאתה הכי גאה בו?",       giphy:"proud achievement",        e:"😤", d:["ההישג שלי בעבודה","המשפחה שלי","הכושר שלי","הידע שלי","החברים שלי","הסבלנות שלי","הכישרון שלי"]},
]

// ── Story Mode Data ───────────────────────────────────────────
const STORIES = [
  {
    id:"s01", title:"הלילה הזה",
    paragraphs:[
      {text:"היה לי לילה פנוי. שלחתי הודעה ל",   blank:{id:"b01",label:"למי שלחתי",    opts:["חבר הכי טוב","כל הקבוצה","אחד·אחת שאני בסוד איתו","לאף אחד — נשארתי לבד"]}},
      {text:", הלכנו ל",                            blank:{id:"b02",label:"איפה בילינו",  opts:["לשבת על הגג","לסדרה עם נשנושים","לצאת ולא לתכנן","לבר שכולם מכירים"]}},
      {text:". בשלב מסוים דיברנו על ",            blank:{id:"b03",label:"שיחת הלילה",   opts:["זוגיות ומה אנחנו רוצים","חלומות שאנחנו דוחים","בן אדם שאנחנו מתגעגעים","שטויות וצחקנו"]}},
      {text:". הרגשתי ",                           blank:{id:"b04",label:"הרגשה",        opts:["חי·ה לרגע","קצת עצוב·ה בלי סיבה","בדיוק במקום הנכון","שאני רוצה שזה לא ייגמר"]}},
      {text:". חזרתי הביתה עם ",                  blank:{id:"b05",label:"מה לקחתי",     opts:["חיוך שלא הסברתי","סיפור חדש","תחושה שמשהו ישתנה","שאריות אוכל"]}},
      {text:".", blank:null}
    ]
  },
  {
    id:"s02", title:"אם הייתי נעלם יום אחד",
    paragraphs:[
      {text:"קמתי בבוקר והחלטתי — היום אני ",     blank:{id:"b06",label:"מה החלטת",     opts:["עוזב·ת את הטלפון בבית","נוסע·ת בלי יעד","שוכח·ת מכולם","עושה רק מה שבא לי"]}},
      {text:". ירדתי ל",                           blank:{id:"b07",label:"לאן ירדת",     opts:["ים בשמונה בבוקר","כפר ששכחו ממנו","מסעדה שאף פעם לא ניסיתי","ספריה שקטה"]}},
      {text:", הזמנתי ",                           blank:{id:"b08",label:"הזמנת",        opts:["קפה ומשהו מתוק","ארוחה שלמה לבד","כלום — רק ישבתי","מה שהמלצר המליץ"]}},
      {text:" ונשארתי שם עד ש",                   blank:{id:"b09",label:"עד מתי",       opts:["השמש שקעה","הפסקתי לחשוב","התגעגעתי למישהו","נזכרתי שיש לי חיים"]}},
      {text:". חזרתי אחר·ת לגמרי.", blank:null}
    ]
  },
  {
    id:"s03", title:"רגע אמת",
    paragraphs:[
      {text:"יש רגע שבו את·ה מבין·ה מי את·ה באמת. אצלי זה קרה ב",  blank:{id:"b10",label:"איפה זה קרה",    opts:["אמצע ריב שהצדקתי","שיחה בשלוש בלילה","שעה שהכל השתבש","רגע של שקט מוחלט"]}},
      {text:". הבנתי שאני ",                       blank:{id:"b11",label:"מה הבנת",      opts:["מפחד·ת יותר ממה שנראה","בוחר·ת אנשים על תחושה","מחפש·ת עומק בכל דבר","מסתיר·ה חלק ממני"]}},
      {text:". הדבר שהכי קשה לי להודות בו הוא ש", blank:{id:"b12",label:"הודאה",        opts:["אני צריך·ה אישור","אני מפחד·ת לאכזב","לפעמים אני לא יודע·ת מה אני רוצה","אני רגיש·ה יותר מכפי שאני מראה"]}},
      {text:". אבל מה שאני גאה בו הכי הוא ה",    blank:{id:"b13",label:"גאווה",         opts:["נאמנות שלי לאנשים שאני אוהב","אומץ שלי כשמשנה","יכולת שלי להקשיב","דרך שלי להחזיק את כולם"]}},
      {text:".", blank:null}
    ]
  },
  {
    id:"s04", title:"72 שעות בלי תירוצים",
    paragraphs:[
      {text:"שלושה ימים. אין עבודה, אין חובות. הדבר הראשון שעולה לי הוא ", blank:{id:"b14",label:"דבר ראשון",   opts:["לישון כמה שאני רוצה","לנסוע לאיפשהו","לסיים משהו שדחיתי","לא לדבר עם אף אחד"]}},
      {text:". ביום השני הייתי ",                  blank:{id:"b15",label:"מצב ביום שני", opts:["שלם·ה לגמרי","שועמם·ת וצריך·ה אנשים","מגלה משהו על עצמי","מתגעגע·ת לשגרה"]}},
      {text:". האוכל שהייתי מכין·ה לעצמי: ",      blank:{id:"b16",label:"מה בישלת",     opts:["פסטה גדולה עם כל מה שיש","אין בישול — הזמנות","ביצים בכל צורה אפשרית","משהו שאף פעם לא ניסיתי"]}},
      {text:". בסוף השלושה ימים הייתי ",           blank:{id:"b17",label:"בסוף הרגשת",   opts:["טעון·ה מחדש","משתוקק·ת לאנשים","גאה שהצלחתי להיות לבד","מוכן·ה לחזור לכאוס"]}},
      {text:".", blank:null}
    ]
  },
  {
    id:"s05", title:"משהו עליי שלא ידעתם",
    paragraphs:[
      {text:"יש דבר שאנשים לא יודעים עליי: אני ",  blank:{id:"b18",label:"סוד קטן",      opts:["זוכר·ת כל שיחה חשובה מילה במילה","מדבר·ת עם עצמי בקול","בוכה בסרטים מהר מהר","שר·ה לבד בלי בושה"]}},
      {text:". הדבר שמרגיז אותי יותר מכל הוא ",   blank:{id:"b19",label:"מה מרגיז",     opts:["חוסר ישירות","אנשים שמאחרים","כשמבטיחים ולא עומדים","רעש כשאני צריך·ה שקט"]}},
      {text:". אם הייתי יכול·ה לדעת דבר אחד על העתיד הייתי בוחר·ת לדעת ", blank:{id:"b20",label:"מה לדעת",   opts:["אם כל מה שאני בונה שווה את זה","עם מי אסיים את הדרך","אם אני בכיוון הנכון","לא — עדיף שלא לדעת"]}},
      {text:". ומה שכולם מפספסים בי זה ה",         blank:{id:"b21",label:"מה מפספסים",   opts:["עומק שמתחת לחיצוניות","הומור שיוצא רק עם אנשים קרובים","רגישות שאני מסתיר·ה","נחישות שיש לי כשחשוב לי"]}},
      {text:".", blank:null}
    ]
  }
];


// ── Slider Mode Data ─────────────────────────────────────────
const SLIDER_QS = [
  {id:"sl01", left:"בוקר", right:"לילה", label:"מתי את·ה הכי חי·ה?"},
  {id:"sl02", left:"ים", right:"הרים", label:"חופשה מושלמת?"},
  {id:"sl03", left:"לבד", right:"עם אנשים", label:"תעדיף·י לבלות?"},
  {id:"sl04", left:"ספונטני", right:"מתוכנן", label:"סגנון חיים?"},
  {id:"sl05", left:"קפה", right:"תה", label:"משקה בוקר?"},
  {id:"sl06", left:"פנים", right:"חוץ", label:"איפה את·ה מרגיש·ה טוב יותר?"},
  {id:"sl07", left:"מוזיקה", right:"שקט", label:"בזמן עבודה?"},
  {id:"sl08", left:"ספר", right:"סרט", label:"ערב חופשי?"},
  {id:"sl09", left:"מתוק", right:"מלוח", label:"חטיף מועדף?"},
  {id:"sl10", left:"לדבר", right:"להקשיב", label:"בשיחה את·ה יותר?"},
  {id:"sl11", left:"עיר", right:"טבע", label:"איפה הייית גר·ה?"},
  {id:"sl12", left:"לוגי", right:"רגשי", label:"מקבל·ת החלטות?"},
  {id:"sl13", left:"מהיר", right:"איטי", label:"קצב אכילה?"},
  {id:"sl14", left:"חם", right:"קר", label:"מזג אוויר מועדף?"},
  {id:"sl15", left:"לשמור", right:"לזרוק", label:"כשמסדרים בית?"},
  {id:"sl16", left:"פרפקציוניסט", right:"בסדר גמור", label:"גישה לעבודה?"},
  {id:"sl17", left:"כלב", right:"חתול", label:"חיית מחמד?"},
  {id:"sl18", left:"לטוס", right:"לנסוע", label:"דרך הגעה לטיול?"},
  {id:"sl19", left:"ריצה", right:"יוגה", label:"ספורט מועדף?"},
  {id:"sl20", left:"נטפליקס", right:"לצאת", label:"שישי בערב?"},
];

function pickSliderQs(n){
  const shuffled = [...SLIDER_QS].sort(()=>Math.random()-0.5);
  return shuffled.slice(0, Math.min(n, SLIDER_QS.length));
}

const SIL = {id:"sil1",label:"נחש מי הדמות בצללית!",giphy:"mystery shadow",e:"🕵️"};
const SS_CODE="sid_code", SS_NAME="sid_name";
const APP_VERSION = "v2.3";
const G2 = "repeat(2,1fr)";
const G3 = "repeat(3,1fr)";

// ── Helpers ───────────────────────────────────────────────────
function getPlayerQs(player, lobbyQs, story, sliderQs) {
  if(story) {
    return story.paragraphs.filter(p=>p.blank).map(p=>({
      id: p.blank.id, label: p.blank.label,
      giphy: "fun game party", e: "📖",
      d: p.blank.opts,
    }));
  }
  if(sliderQs && sliderQs.length) {
    return sliderQs.map(q=>({
      id: q.id, label: q.label,
      giphy: "sliding scale", e: "🎚️",
      left: q.left, right: q.right,
      d: [q.left, "יותר "+q.left, "יותר "+q.right, q.right],
    }));
  }
  return player.myQuestions
    ? (Array.isArray(player.myQuestions) ? player.myQuestions : Object.values(player.myQuestions))
    : lobbyQs;
}

function buildSequence(players, lobbyQs, story=null, sliderQs=null) {
  const n = players.length;
  const seq = [];

  if(n === 2) {
    // DUEL MODE: each round both players answer simultaneously — A about B, B about A
    // No silhouette round (the answer is obvious with only 2 players)
    const [p0, p1] = players;
    const qs0 = getPlayerQs(p0, lobbyQs, story, sliderQs); // questions answered by p0 (p1 will guess about p0)
    const qs1 = getPlayerQs(p1, lobbyQs, story, sliderQs); // questions answered by p1 (p0 will guess about p1)
    const rounds = Math.max(qs0.length, qs1.length);
    for(let i=0; i<rounds; i++){
      const q0 = qs0[i % qs0.length];
      const q1 = qs1[i % qs1.length];
      if(!q0||!q1) continue;
      seq.push({
        qType:"duel_round",
        // p0 is subject (p1 guesses): 
        subjectName: p0.name, qId: q0.id, qLabel: q0.label, qGiphy: q0.giphy||"", qEmoji: q0.e||"",
        // p1 is also subject (p0 guesses):
        subject2Name: p1.name, qId2: q1.id, qLabel2: q1.label, qGiphy2: q1.giphy||"", qEmoji2: q1.e||"",
      });
    }
  } else {
    // MULTIPLAYER: one subject per round, include silhouette at end
    const rpp = lobbyQs.length;
    for(let i=0; i<rpp; i++){
      const player = players[i%n];
      const playerQs = getPlayerQs(player, lobbyQs, story, sliderQs);
      const q = playerQs[i] || lobbyQs[i] || lobbyQs[0];
      if(!q) continue;
      seq.push({qId:q.id,qType:"text",qLabel:q.label,qGiphy:q.giphy||"",qEmoji:q.e||"",subjectName:player.name});
    }
    seq.push({qId:SIL.id,qType:"sil",qLabel:SIL.label,qGiphy:SIL.giphy,qEmoji:SIL.e,subjectName:players[Math.floor(Math.random()*n)].name});
  }
  return seq;
}
function pickLobbyQs(n){return[...QUESTIONS].sort(()=>Math.random()-.5).slice(0,n);}

// Duel mode: generate 3 AI decoy answers via Claude API, return 4 shuffled options


// Image utils
function makeSil(file){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const W=400,H=Math.round(img.height/img.width*W);
      const c=document.createElement("canvas");c.width=W;c.height=H;
      const ctx=c.getContext("2d");ctx.drawImage(img,0,0,W,H);
      const d=ctx.getImageData(0,0,W,H);const px=d.data;
      for(let i=0;i<px.length;i+=4){
        const b=px[i]*.299+px[i+1]*.587+px[i+2]*.114;
        if(b<180){px[i]=0;px[i+1]=0;px[i+2]=0;px[i+3]=255;}else px[i+3]=0;
      }
      ctx.putImageData(d,0,0);
      const f=document.createElement("canvas");f.width=W;f.height=H;
      const fc=f.getContext("2d");fc.fillStyle="#1C1535";fc.fillRect(0,0,W,H);fc.drawImage(c,0,0);
      f.toBlob(res,"image/jpeg",.85);
    };
    img.src=URL.createObjectURL(file);
  });
}
function compress(file){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const s=Math.min(1,800/Math.max(img.width,img.height));
      const W=Math.round(img.width*s),H=Math.round(img.height*s);
      const c=document.createElement("canvas");c.width=W;c.height=H;
      c.getContext("2d").drawImage(img,0,0,W,H);
      c.toBlob(res,"image/jpeg",.8);
    };
    img.src=URL.createObjectURL(file);
  });
}
async function upload(blob,type){
  const path=`${type}${Date.now()}.jpg`;
  const{error}=await supabase.storage.from("photos").upload(path,blob,{upsert:true});
  if(error)throw error;
  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}
async function fetchGif(q){
  try{
    const r=await fetch(`https://api.giphy.com/v1/gifs/search?api_key=sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh&q=${encodeURIComponent(q)}&limit=8&rating=g`);
    const d=await r.json();const a=d?.data;if(!a?.length)return null;
    const p=a[Math.floor(Math.random()*Math.min(5,a.length))];
    return p?.images?.downsized_medium?.url||p?.images?.fixed_height?.url||null;
  }catch{return null;}
}

// ── Primitive Components ──────────────────────────────────────
const ff = "'Plus Jakarta Sans',sans-serif";
const ffd = "'Nunito',sans-serif";

function GlassCard({children,style={},glow}){
  return(
    <div style={{
      background:D.card,
      backdropFilter:"blur(20px)",
      WebkitBackdropFilter:"blur(20px)",
      border:`1px solid ${D.border}`,
      borderRadius:D.rLg,
      boxShadow:glow?`${D.shadow},${D.glow(glow)}`:D.shadow,
      padding:"20px 18px",
      ...style
    }}>{children}</div>
  );
}

function Btn({children,onClick,disabled,variant="primary",style={}}){
  const styles = {
    primary:{background:disabled?"rgba(255,255,255,.08)":D.violet,color:disabled?D.muted:"#fff",boxShadow:disabled?"none":`0 4px 20px ${D.violetGlow}`},
    lime:   {background:D.lime,color:"#0E0A1F",boxShadow:`0 4px 20px ${D.limeGlow}`},
    ghost:  {background:"transparent",color:D.violet,border:`1.5px solid ${D.violet}`},
    gold:   {background:D.gold,color:"#0E0A1F",boxShadow:`0 4px 20px ${D.goldGlow}`},
  };
  return(
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%",padding:"15px",borderRadius:D.r,border:"none",
      fontFamily:ff,fontWeight:700,fontSize:16,cursor:disabled?"not-allowed":"pointer",
      transition:"all .2s",letterSpacing:"-.01em",
      ...styles[variant],...style
    }}>{children}</button>
  );
}

function Input({value,onChange,placeholder,type="text",style={}}){
  return(
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
      style={{
        width:"100%",padding:"14px 16px",borderRadius:D.r,
        background:"rgba(255,255,255,.07)",color:D.white,
        border:`1.5px solid ${D.border}`,fontFamily:ff,fontSize:15,outline:"none",
        transition:"border-color .2s",...style
      }}
      onFocus={e=>{e.target.style.borderColor=D.violet;e.target.style.background="rgba(168,85,247,.08)";}}
      onBlur={e=>{e.target.style.borderColor=D.border;e.target.style.background="rgba(255,255,255,.07)";}}
    />
  );
}

function Avatar({url,name,size=40}){
  return url
    ?<img src={url} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${D.violet}50`,flexShrink:0}}/>
    :<div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
        background:`linear-gradient(135deg,${D.violet},${D.pink})`,
        display:"flex",alignItems:"center",justifyContent:"center",
        color:"#fff",fontWeight:800,fontSize:size*.38,fontFamily:ffd,boxShadow:`0 0 16px ${D.violetGlow}`}}>
       {name?.[0]?.toUpperCase()||"?"}
     </div>;
}

function Spinner({size=32}){
  return<div style={{width:size,height:size,borderRadius:"50%",border:`3px solid rgba(255,255,255,.1)`,
    borderTop:`3px solid ${D.violet}`,animation:"spin .7s linear infinite",margin:"0 auto"}}/>;
}

function TimerRing({t,total}){
  const p=t/total,r=28,c=2*Math.PI*r;
  const col=t>total*.5?D.lime:t>total*.25?D.gold:D.red;
  return(
    <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
      <svg width="64" height="64" style={{transform:"rotate(-90deg)"}}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5"/>
        <circle cx="32" cy="32" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={c*(1-p)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset .95s linear,stroke .3s"}}/>
      </svg>
      <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:ffd,fontSize:20,fontWeight:900,color:col}}>{t}</span>
    </div>
  );
}

function ExitBtn(){
  return(
    <button onClick={()=>{if(window.confirm("לצאת למסך הראשי?")){{sessionStorage.clear();window.location.reload();}}}}
      style={{position:"fixed",bottom:20,left:16,zIndex:999,
        background:"rgba(255,255,255,.08)",backdropFilter:"blur(12px)",border:`1px solid ${D.border}`,
        color:D.muted,borderRadius:99,padding:"8px 16px",fontSize:13,fontFamily:ff}}>
      ← יציאה
    </button>
  );
}

function Dots({current,total}){
  return(
    <div style={{display:"flex",gap:5,alignItems:"center"}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{width:i===current-1?22:7,height:7,borderRadius:99,
          background:i<current?D.violet:"rgba(255,255,255,.15)",transition:"all .3s"}}/>
      ))}
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────
function Page({children,center=false,style={}}){
  return(
    <div style={{minHeight:"100dvh",background:D.bg,padding:"20px 18px 100px",
      direction:"rtl",fontFamily:ff,color:D.white,
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:center?"center":"flex-start",...style}}>
      <style>{G}
</style>
      {children}
    </div>
  );
}
function Wrap({children,style={}}){
  return<div style={{width:"100%",maxWidth:440,display:"flex",flexDirection:"column",gap:14,...style}}>{children}</div>;
}

// ── HOME ──────────────────────────────────────────────────────
function Home({onJoin}){
  const[name,setName]=useState("");
  const[code,setCode]=useState("");
  const[tab,setTab]=useState("create");
  const[setup,setSetup]=useState(false);
  const[numP,setNumP]=useState(4);
  const[rnd,setRnd]=useState(null);
  const[time,setTime]=useState(null);
  const[busy,setBusy]=useState(false);

  // For 2 players: rounds must be even so each gets equal turns
  const evenUp = n => numP===2 ? (n%2===0?n:n+1) : n;
  const [gameMode, setGameMode] = useState("free"); // "free" | "story"
  const rOpts=[
    {l:"קצר",  v:evenUp(Math.max(4,numP)),   s:`${evenUp(Math.max(4,numP))} שאלות`},
    {l:"רגיל", v:evenUp(Math.max(6,numP*2)),  s:`${evenUp(Math.max(6,numP*2))} שאלות`},
    {l:"מרתוני",v:evenUp(Math.max(10,numP*3)),s:`${evenUp(Math.max(10,numP*3))} שאלות`},
  ];
  const tOpts=[{l:"⚡ מהיר",v:15},{l:"⏱ רגיל",v:25},{l:"🧘 נינוח",v:40}];

  const create=async()=>{
    if(!name.trim()||!rnd||!time)return;
    setBusy(true);
    const c=Math.floor(1000+Math.random()*9000).toString();
    const qs=pickLobbyQs(rnd);
    await set(ref(db,`rooms/${c}`),{host:name.trim(),phase:"lobby",round:0,roundsPerPlayer:rnd,roundTime:time,lobbyQuestions:qs,gameMode:gameMode,storyId:gameMode==="story"?(STORIES[Math.floor(Math.random()*STORIES.length)].id):null,
      sliderQuestions:gameMode==="slider"?pickSliderQs(rnd):null,players:{[name.trim()]:{name:name.trim(),score:0,ready:false}}});
    sessionStorage.setItem(SS_CODE,c);sessionStorage.setItem(SS_NAME,name.trim());
    onJoin(c,name.trim());setBusy(false);
  };
  const join=async()=>{
    if(!name.trim()||code.length!==4)return;
    setBusy(true);
    const snap=await get(ref(db,`rooms/${code}`));
    if(!snap.exists()){alert("חדר לא נמצא!");setBusy(false);return;}
    await update(ref(db,`rooms/${code}/players/${name.trim()}`),{name:name.trim(),score:0,ready:false});
    sessionStorage.setItem(SS_CODE,code);sessionStorage.setItem(SS_NAME,name.trim());
    onJoin(code,name.trim());setBusy(false);
  };

  if(setup) return(
    <Page>
      <Wrap>
        <button onClick={()=>setSetup(false)} style={{background:"none",border:"none",color:D.violet,fontFamily:ff,fontSize:14,textAlign:"right",padding:"4px 0",marginBottom:4}}>← חזור</button>
        <div className="fu" style={{textAlign:"center",marginBottom:4}}>
          <h2 style={{fontFamily:ffd,fontSize:26,fontWeight:900,color:D.white}}>⚙️ הגדרות</h2>
        </div>

        <GlassCard className="fu d1">
          <p style={{color:D.muted,fontSize:13,marginBottom:12}}>כמה שחקנים?</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[2,3,4,5,6,7,8].map(n=>(
              <button key={n} onClick={()=>{setNumP(n);setRnd(null);}} style={{
                flex:"1 1 36px",padding:"10px 0",borderRadius:12,fontFamily:ffd,fontWeight:800,fontSize:15,
                background:numP===n?D.violet:"rgba(255,255,255,.06)",
                color:numP===n?"#fff":D.muted,border:`1px solid ${numP===n?D.violet:D.border}`,
                boxShadow:numP===n?`0 0 16px ${D.violetGlow}`:"none",transition:"all .18s"}}>
                {n}
              </button>
            ))}
          </div>
          {numP===2&&<p style={{color:D.lime,fontSize:12,marginTop:10,textAlign:"center",fontWeight:600}}>⚡ מצב דואל — מבחן אמריקאי פעיל!</p>}
        </GlassCard>

        <GlassCard className="fu d2">
          <p style={{color:D.white,fontWeight:700,fontSize:14,marginBottom:10}}>מצב משחק:</p>
          <div style={{display:"grid",gridTemplateColumns:G3,gap:8,marginBottom:16}}>
            {[{v:"free",icon:"❓",label:"שאלות חופשיות",desc:"ממלאים טקסט"},{v:"story",icon:"📖",label:"מצב סיפור",desc:"בחירה מתוך סיפור"},{v:"slider",icon:"🎚️",label:"מצב סליידר",desc:"ימין או שמאל"}].map(m=>(
              <button key={m.v} onClick={()=>setGameMode(m.v)} style={{
                padding:"12px 8px",borderRadius:14,cursor:"pointer",fontFamily:ff,
                background:gameMode===m.v?"rgba(168,85,247,.25)":"rgba(255,255,255,.04)",
                border:`2px solid ${gameMode===m.v?D.violet:D.border}`,transition:"all .2s",textAlign:"center"}}>
                <div style={{fontSize:22,marginBottom:4}}>{m.icon}</div>
                <p style={{color:gameMode===m.v?D.white:D.offWhite,fontWeight:700,fontSize:12,marginBottom:2}}>{m.label}</p>
                <p style={{color:D.muted,fontSize:10}}>{m.desc}</p>
              </button>
            ))}
          </div>
          <p style={{color:D.muted,fontSize:13,marginBottom:12}}>כמות שאלות:</p>
          <div style={{display:"flex",gap:8}}>
            {rOpts.map(o=>(
              <button key={o.v} onClick={()=>setRnd(o.v)} style={{
                flex:1,padding:"14px 8px",borderRadius:14,fontFamily:ffd,cursor:"pointer",fontWeight:800,
                background:rnd===o.v?D.violet:"rgba(255,255,255,.06)",
                color:rnd===o.v?"#fff":D.muted,border:`1px solid ${rnd===o.v?D.violet:D.border}`,
                boxShadow:rnd===o.v?`0 0 16px ${D.violetGlow}`:"none",transition:"all .18s"}}>
                <div style={{fontSize:14,marginBottom:2}}>{o.l}</div>
                <div style={{fontSize:11,opacity:.7}}>{o.s}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="fu d3">
          <p style={{color:D.muted,fontSize:13,marginBottom:12}}>זמן לשאלה:</p>
          <div style={{display:"flex",gap:8}}>
            {tOpts.map(o=>(
              <button key={o.v} onClick={()=>setTime(o.v)} style={{
                flex:1,padding:"14px 8px",borderRadius:14,fontFamily:ffd,cursor:"pointer",fontWeight:800,fontSize:14,
                background:time===o.v?D.lime:"rgba(255,255,255,.06)",
                color:time===o.v?"#0E0A1F":D.muted,border:`1px solid ${time===o.v?D.lime:D.border}`,
                boxShadow:time===o.v?`0 0 16px ${D.limeGlow}`:"none",transition:"all .18s"}}>
                {o.l}<div style={{fontSize:11,marginTop:2,opacity:.7}}>{o.v} שנ'</div>
              </button>
            ))}
          </div>
        </GlassCard>

        <Btn onClick={create} disabled={!rnd||!time||busy} variant="lime">{busy?"...":"צור חדר! 🚀"}</Btn>
      </Wrap>
    </Page>
  );

  return(
    <Page center>
      {/* Hero */}
      <div className="fu" style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:64,marginBottom:4,animation:"float 3s ease-in-out infinite"}}>🎭</div>
        <h1 style={{fontFamily:ffd,fontSize:52,fontWeight:900,lineHeight:1,
          background:`linear-gradient(135deg,${D.white},${D.violet})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          SocialID
        </h1>
        <p style={{color:D.muted,fontSize:16}}>המשחק שמגלה מי באמת מכיר את מי</p>
        <p style={{color:D.border,fontSize:11,marginTop:6,letterSpacing:1}}>{APP_VERSION}</p>
      </div>

      <Wrap style={{maxWidth:390}}>
        {/* Tab */}
        <GlassCard className="fu d1" style={{padding:"6px"}}>
          <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.04)",borderRadius:14,padding:4}}>
            {[{k:"create",l:"צור חדר 🎮"},{k:"join",l:"הצטרף 🔑"}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{
                flex:1,padding:"11px",borderRadius:10,fontFamily:ff,fontWeight:700,fontSize:14,
                background:tab===t.k?"rgba(168,85,247,.25)":"transparent",
                color:tab===t.k?D.violet:D.muted,
                border:`1px solid ${tab===t.k?D.violet+"50":"transparent"}`,
                transition:"all .2s",cursor:"pointer"}}>
                {t.l}
              </button>
            ))}
          </div>
          <div style={{padding:"12px 8px 8px",display:"flex",flexDirection:"column",gap:10}}>
            <Input value={name} onChange={setName} placeholder="השם שלך ✍️"/>
            {tab==="join"&&(
              <Input value={code} onChange={v=>setCode(v.replace(/\D/g,"").slice(0,4))} placeholder="קוד חדר"
                style={{textAlign:"center",fontSize:32,fontWeight:900,letterSpacing:10}}/>
            )}
            {tab==="create"
              ?<Btn onClick={()=>{if(!name.trim())return alert("הכנס שם!");setSetup(true);}}>המשך ←</Btn>
              :<Btn onClick={join} disabled={!name.trim()||code.length!==4||busy} variant="primary">{busy?"...":"הצטרף!"}</Btn>
            }
          </div>
        </GlassCard>

        <p className="fu d2" style={{color:D.muted,fontSize:12,textAlign:"center"}}>
          נבנה עם ❤️ לרגעים שיחד
        </p>
        <p style={{color:"rgba(255,255,255,.2)",fontSize:11,marginTop:16,fontFamily:"monospace",letterSpacing:1}}>
          v2.4.0
        </p>
      </Wrap>
    </Page>
  );
}

// ── LOBBY ─────────────────────────────────────────────────────

// ── Story Form Component ──────────────────────────────────────
function getBlankStyle(isFilled, isActive){
  var bg = isFilled ? "rgba(163,230,53,.2)" : isActive ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.08)";
  var bd = "1.5px solid " + (isFilled ? D.lime : isActive ? D.violet : D.border);
  var cl = isFilled ? D.lime : isActive ? D.white : D.muted;
  return {display:"inline-block",minWidth:80,padding:"2px 10px",borderRadius:8,
    margin:"0 4px",cursor:"pointer",fontWeight:800,fontSize:14,transition:"all .2s",
    background:bg, border:bd, color:cl};
}

function StoryForm({story, ans, setAns, code, myName}){
  const [cur, setCur] = useState(0);
  const blanks = story.paragraphs.filter(function(p){return p.blank;}).map(function(p){return p.blank;});
  const filled = blanks.filter(function(b){return ans[b.id];}).length;
  const total_b = blanks.length || 1;
  const pct = Math.round(filled * 100 / total_b);
  const activeBId = blanks[cur] ? blanks[cur].id : "";

  function saveAns(id, val){
    var newAns = Object.assign({}, ans, {[id]: val});
    setAns(newAns);
    update(ref(db,"rooms/"+code+"/players/"+myName+"/personalAnswers"), {[id]: val});
  }

  function handleOptClick(bId, opt){
    saveAns(bId, opt);
    var nextIdx = -1;
    for(var k=cur+1; k<blanks.length; k++){
      if(!ans[blanks[k].id]){ nextIdx=k; break; }
    }
    if(nextIdx !== -1){ setCur(nextIdx); return; }
    for(var k=0; k<blanks.length; k++){
      if(!ans[blanks[k].id] && blanks[k].id !== bId){ setCur(k); return; }
    }
  }

  var curBlank = blanks[cur];

  return(
    <GlassCard className="fu d2" style={{padding:0,overflow:"hidden"}}>
      <div style={{height:4,background:"rgba(255,255,255,.08)"}}>
        <div style={{height:"100%",width:pct+"%",
          background:"linear-gradient(90deg,"+D.violet+","+D.lime+")",transition:"width .4s"}}/>
      </div>
      <div style={{padding:"16px 16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <p style={{color:D.muted,fontSize:12}}>{filled} מתוך {blanks.length} הושלמו</p>
          <p style={{fontFamily:ffd,fontSize:15,fontWeight:800,color:D.violet}}>{story.title}</p>
        </div>

        <div style={{fontSize:15,lineHeight:1.9,color:D.offWhite,textAlign:"right",direction:"rtl"}}>
          {story.paragraphs.map(function(para,pi){
            var bFilled = para.blank ? ans[para.blank.id] : null;
            var bActive = para.blank ? activeBId===para.blank.id : false;
            var blankIdx = para.blank ? blanks.findIndex(function(b){return b.id===para.blank.id;}) : -1;
            return(
              <span key={pi}>
                {para.text}
                {para.blank &&
                  <span onClick={function(){setCur(blankIdx);}}
                    style={getBlankStyle(bFilled, bActive)}>
                    {bFilled || "___"}
                  </span>
                }
              </span>
            );
          })}
        </div>

        {curBlank &&
          <div style={{marginTop:20}}>
            <p style={{color:D.muted,fontSize:12,marginBottom:10,textAlign:"right"}}>
              בחר עבור: <span style={{color:D.violet,fontWeight:700}}>{curBlank.label}</span>
            </p>
            <div style={{display:"grid",gridTemplateColumns:G2,gap:8}}>
              {curBlank.opts.map(function(opt,oi){
                var sel = ans[curBlank.id]===opt;
                return(
                  <button key={oi}
                    onClick={function(){handleOptClick(curBlank.id, opt);}}
                    style={{padding:"10px 8px",borderRadius:12,cursor:"pointer",fontFamily:ff,
                      background:sel?"rgba(163,230,53,.2)":"rgba(255,255,255,.05)",
                      border:"1.5px solid "+(sel?D.lime:D.border),
                      color:sel?D.lime:D.offWhite,
                      fontSize:13,fontWeight:sel?700:400,
                      transition:"all .18s",textAlign:"center"}}>
                    {sel && <span style={{marginLeft:4}}>"v "</span>}
                    {opt}
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
              <button onClick={function(){setCur(Math.max(0,cur-1));}}
                disabled={cur===0}
                style={{background:"none",border:"1px solid "+D.border,borderRadius:8,
                  padding:"6px 12px",color:cur===0?D.muted:D.offWhite,cursor:"pointer",fontFamily:ff,fontSize:12}}>
                "הקודם"
              </button>
              <span style={{color:D.muted,fontSize:12,alignSelf:"center"}}>{cur+1} מתוך {blanks.length}</span>
              <button onClick={function(){setCur(Math.min(blanks.length-1,cur+1));}}
                disabled={cur===blanks.length-1}
                style={{background:"none",border:"1px solid "+D.border,borderRadius:8,
                  padding:"6px 12px",color:cur===blanks.length-1?D.muted:D.offWhite,cursor:"pointer",fontFamily:ff,fontSize:12}}>
                "הבא"
              </button>
            </div>
          </div>
        }
      </div>
    </GlassCard>
  );
}


// ── Slider Form Component ────────────────────────────────────
function SliderForm({questions, ans, setAns, code, myName}){
  const [cur, setCur] = useState(0);
  const [anim, setAnim] = useState(null); // "left" | "right" | null
  const filled = questions.filter(function(q){return ans[q.id]!==undefined;}).length;
  const q = questions[cur];

  useEffect(function(){
    var el = document.getElementById("slider-thumb-style");
    if(!el){
      el = document.createElement("style");
      el.id = "slider-thumb-style";
      el.textContent = "input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:white;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.3);}input[type=range]::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:white;cursor:pointer;border:none;}";
      document.head.appendChild(el);
    }
  }, []);

  function choose(side){
    // side: "left" | "right"
    var val = side==="left" ? 0 : 100;
    var newAns = Object.assign({}, ans, {[q.id]: val});
    setAns(newAns);
    update(ref(db,"rooms/"+code+"/players/"+myName+"/personalAnswers"), {[q.id]: val});
    setAnim(side);
    setTimeout(function(){
      setAnim(null);
      if(cur < questions.length-1) setCur(cur+1);
    }, 320);
  }

  function handleSwipe(e){
    // Touch swipe support
    var start = e.touches[0].clientX;
    function onEnd(ev){
      var dx = ev.changedTouches[0].clientX - start;
      if(Math.abs(dx) > 60) choose(dx < 0 ? "right" : "left");
      document.removeEventListener("touchend", onEnd);
    }
    document.addEventListener("touchend", onEnd);
  }

  if(!q) return(
    <GlassCard className="fu d2" style={{textAlign:"center",padding:32}}>
      <p style={{fontSize:32,marginBottom:8}}>{"✅"}</p>
      <p style={{color:D.lime,fontWeight:700,fontSize:16}}>כל השאלות הושלמו!</p>
    </GlassCard>
  );

  var chosen = ans[q.id]!==undefined ? (ans[q.id]===0 ? "left" : "right") : null;
  var _tot = questions.length || 1; var pct = Math.round(filled * 100 / _tot);

  return(
    <div>
      <div style={{height:4,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:16}}>
        <div style={{height:"100%",width:pct+"%",
          background:"linear-gradient(90deg,"+D.violet+","+D.lime+")",
          borderRadius:2,transition:"width .4s"}}/>
      </div>

      <div style={{textAlign:"center",marginBottom:12}}>
        <span style={{color:D.muted,fontSize:12}}>{filled} מתוך {questions.length} הושלמו</span>
      </div>

      {/* Card */}
      <div onTouchStart={handleSwipe}
        style={{
          position:"relative",
          background:"rgba(255,255,255,.06)",
          border:"1.5px solid "+D.border,
          borderRadius:24,
          padding:"28px 20px 24px",
          backdropFilter:"blur(20px)",
          transform: anim==="left"?"translateX(-60px) rotate(-8deg) scale(.95)":
                     anim==="right"?"translateX(60px) rotate(8deg) scale(.95)":"translateX(0)",
          opacity: anim ? 0 : 1,
          transition:"transform .28s ease,opacity .28s ease",
          overflow:"hidden"}}>

        {/* Tint overlay when chosen */}
        {chosen==="left" &&
          <div style={{position:"absolute",inset:0,borderRadius:24,
            background:"rgba(168,85,247,.12)",pointerEvents:"none"}}/>}
        {chosen==="right" &&
          <div style={{position:"absolute",inset:0,borderRadius:24,
            background:"rgba(163,230,53,.12)",pointerEvents:"none"}}/>}

        <p style={{color:D.white,fontWeight:800,fontSize:17,textAlign:"center",
          marginBottom:28,fontFamily:ffd,lineHeight:1.3}}>{q.label}</p>

        <div style={{display:"flex",gap:12,alignItems:"stretch"}}>
          {/* LEFT button */}
          <button onClick={function(){choose("left");}}
            style={{
              flex:1,padding:"20px 12px",borderRadius:18,cursor:"pointer",
              fontFamily:ffd,fontWeight:800,fontSize:16,
              background:chosen==="left"?"rgba(168,85,247,.35)":"rgba(168,85,247,.1)",
              border:"2px solid "+(chosen==="left"?D.violet:"rgba(168,85,247,.3)"),
              color:chosen==="left"?D.white:D.offWhite,
              transition:"all .18s",textAlign:"center",
              boxShadow:chosen==="left"?"0 0 20px rgba(168,85,247,.4)":"none"}}>
            <div style={{fontSize:28,marginBottom:6}}>{"👈"}</div>
            {q.left}
            {chosen==="left" && <div style={{fontSize:11,color:D.violet,marginTop:4,fontWeight:400}}>הבחירה שלי</div>}
          </button>

          {/* RIGHT button */}
          <button onClick={function(){choose("right");}}
            style={{
              flex:1,padding:"20px 12px",borderRadius:18,cursor:"pointer",
              fontFamily:ffd,fontWeight:800,fontSize:16,
              background:chosen==="right"?"rgba(163,230,53,.35)":"rgba(163,230,53,.1)",
              border:"2px solid "+(chosen==="right"?D.lime:"rgba(163,230,53,.3)"),
              color:chosen==="right"?D.white:D.offWhite,
              transition:"all .18s",textAlign:"center",
              boxShadow:chosen==="right"?"0 0 20px rgba(163,230,53,.4)":"none"}}>
            <div style={{fontSize:28,marginBottom:6}}>{"👉"}</div>
            {q.right}
            {chosen==="right" && <div style={{fontSize:11,color:D.lime,marginTop:4,fontWeight:400}}>הבחירה שלי</div>}
          </button>
        </div>

        {/* Dots nav */}
        <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:20}}>
          {questions.map(function(qq,i){
            return(
              <div key={i} onClick={function(){setCur(i);}}
                style={{width:i===cur?18:6,height:6,borderRadius:99,cursor:"pointer",
                  transition:"all .2s",
                  background:ans[qq.id]!==undefined?D.lime:i===cur?D.violet:"rgba(255,255,255,.15)"}}/>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:12,gap:8}}>
        <button onClick={function(){setCur(Math.max(0,cur-1));}} disabled={cur===0}
          style={{flex:1,padding:"10px",borderRadius:12,cursor:"pointer",fontFamily:ff,
            background:"rgba(255,255,255,.04)",border:"1px solid "+D.border,
            color:cur===0?D.muted:D.offWhite,fontSize:13}}>
          הקודם
        </button>
        <button onClick={function(){setCur(Math.min(questions.length-1,cur+1));}}
          disabled={cur===questions.length-1}
          style={{flex:2,padding:"10px",borderRadius:12,cursor:"pointer",fontFamily:ff,
            background:chosen?"rgba(168,85,247,.2)":"rgba(255,255,255,.04)",
            border:"1px solid "+(chosen?D.violet:D.border),
            color:chosen?D.white:D.muted,fontSize:13,fontWeight:chosen?700:400}}>
          הבא
        </button>
      </div>
    </div>
  );
}

function Lobby({room,code,myName,isHost}){
  const me=room.players?.[myName];
  // Each player has their own question set (falls back to room's shared questions)
  const myQs = room.players?.[myName]?.myQuestions;
  const qs = myQs
    ? (Array.isArray(myQs) ? myQs : Object.values(myQs))
    : (Array.isArray(room.lobbyQuestions) ? room.lobbyQuestions : Object.values(room.lobbyQuestions||{}));

  // On first load: if player has no personal questions yet, copy from lobbyQuestions
  useEffect(()=>{
    if(!myQs && room.lobbyQuestions && room.gameMode==="free") {
      const shared = Array.isArray(room.lobbyQuestions)
        ? room.lobbyQuestions
        : Object.values(room.lobbyQuestions);
      const personal = [...shared].sort(()=>Math.random()-.5);
      update(ref(db,`rooms/${code}/players/${myName}`),{myQuestions: personal});
    }
  // eslint-disable-next-line
  },[]);
  const KA=`ans_${code}_${myName}`;
  const[ans,setAns]=useState(()=>{try{return JSON.parse(sessionStorage.getItem(KA)||"{}")}catch{return{}}});
  
  const[upping,setUp]=useState(false);
  const[upT,setUpT]=useState("");

  useEffect(()=>{sessionStorage.setItem(KA,JSON.stringify(ans))},[ans]);
  

  const up=async(file,type)=>{
    setUp(true);setUpT(type);
    try{const body=type==="sil"?await makeSil(file):await compress(file);const url=await upload(body,type);
      await update(ref(db,`rooms/${code}/players/${myName}`),type==="sil"?{silhouetteURL:url}:{photoURL:url});}
    catch(e){alert(e.message);}
    setUp(false);setUpT("");
  };
  const onFile=(e,t)=>{const f=e.target.files?.[0];if(f)up(f,t);e.target.value="";};

  const ready=()=>{
    const isDuelMode = Object.keys(room.players||{}).length===2;
    const noPhotoMode = isDuelMode || room.gameMode==="story" || room.gameMode==="slider";
    if(!noPhotoMode&&!me?.photoURL)return alert("חובה להעלות סלפי!");
    if(room.gameMode==="story"){
      const story=STORIES.find(s=>s.id===room.storyId)||STORIES[0];
      const blanks=story.paragraphs.filter(p=>p.blank).map(p=>p.blank);
      if(blanks.some(b=>!ans[b.id]))return alert("בחר תשובה לכל המשפטים בסיפור");
    } else if(room.gameMode==="slider"){
      const sqs=room.sliderQuestions||[];
      if(sqs.some(q=>ans[q.id]===undefined))return alert("הזז את הסליידר לכל השאלות");
    } else {
      if(qs.some(q=>!ans[q.id]?.trim()))return alert("ענה על כל השאלות");
    }
    update(ref(db,`rooms/${code}/players/${myName}`),{personalAnswers:ans,ready:true});
  };
  const start=()=>{
    const pl=Object.values(room.players||{});
    const story=room.gameMode==="story"?STORIES.find(s=>s.id===room.storyId)||STORIES[0]:null;
  const sliderQs=room.gameMode==="slider"?(room.sliderQuestions||[]):null;
  const seq=buildSequence(pl,room.lobbyQuestions||[],story,sliderQs);
    // Build decoy map instantly from static bank
    const decoyMap={};
    if(pl.length===2){
      const buildOpts=(qId,subjectName)=>{
        const subj=pl.find(p=>p.name===subjectName);
        const rawAns=subj?.personalAnswers?.[qId];
        if(rawAns===undefined||rawAns===null) return null;
        // Slider mode: answer is 0 or 100 — convert to label
        const sliderQ=sliderQs&&sliderQs.find(q=>q.id===qId);
        if(sliderQ){
          const correct=rawAns===0?sliderQ.left:sliderQ.right;
          const wrong=rawAns===0?sliderQ.right:sliderQ.left;
          return [wrong,correct].sort(()=>Math.random()-.5);
        }
        // Story mode: answer is a string option
        const correct=String(rawAns).trim();
        if(!correct) return null;
        const qDef=QUESTIONS.find(q=>q.id===qId);
        const storyQ=story&&story.paragraphs.find(p=>p.blank&&p.blank.id===qId);
        const pool=storyQ?storyQ.blank.opts.filter(d=>d!==correct):(qDef?.d||[]).filter(d=>d.trim().toLowerCase()!==correct.toLowerCase());
        const shuffled=[...pool].sort(()=>Math.random()-.5);
        const decoys=shuffled.slice(0,3);
        while(decoys.length<3) decoys.push(shuffled[decoys.length%Math.max(1,shuffled.length)]||"אחר");
        return [...decoys,correct].sort(()=>Math.random()-.5);
      };
      seq.forEach(item=>{
        if(item.qType!=="duel_round") return;
        const o1=buildOpts(item.qId, item.subjectName);
        if(o1) decoyMap[item.qId+"_"+item.subjectName]=o1;
        const o2=buildOpts(item.qId2, item.subject2Name);
        if(o2) decoyMap[item.qId2+"_"+item.subject2Name]=o2;
      });
    } else {
      // Multiplayer (3+): build decoys for each round
      seq.forEach(item=>{
        if(item.qType==="sil") return; // sil round has no decoys
        const subj=pl.find(p=>p.name===item.subjectName);
        if(!subj) return;
        const rawAns=subj.personalAnswers?.[item.qId];
        if(rawAns===undefined||rawAns===null) return;
        const sliderQ=sliderQs&&sliderQs.find(q=>q.id===item.qId);
        if(sliderQ){
          const correct=rawAns===0?sliderQ.left:sliderQ.right;
          const wrong=rawAns===0?sliderQ.right:sliderQ.left;
          decoyMap[item.qId+"_"+item.subjectName]=[wrong,correct].sort(()=>Math.random()-.5);
          return;
        }
        // Story/free: string answer with decoys from question bank
        const correct=String(rawAns).trim();
        if(!correct) return;
        const storyQ=story&&story.paragraphs.find(p=>p.blank&&p.blank.id===item.qId);
        const qDef=QUESTIONS.find(q=>q.id===item.qId);
        const pool=storyQ
          ?storyQ.blank.opts.filter(d=>d!==correct)
          :(qDef?.d||[]).filter(d=>d.toLowerCase()!==correct.toLowerCase());
        const shuffled=[...pool].sort(()=>Math.random()-.5);
        const decoys=shuffled.slice(0,3);
        while(decoys.length<3) decoys.push(shuffled[decoys.length%Math.max(1,shuffled.length)]||"אחר");
        decoyMap[item.qId+"_"+item.subjectName]=[...decoys,correct].sort(()=>Math.random()-.5);
      });
    }
    update(ref(db,`rooms/${code}`),{phase:"question",round:1,roundSequence:seq,guesses:null,decoyMap});
  };

  // ── WAITING ROOM ──────────────────────────────────────────────
  if(me?.ready){
    const pl=Object.values(room.players||{});
    const rc=pl.filter(p=>p.ready).length,all=pl.length>1&&pl.every(p=>p.ready);
    return(
      <Page>
        <ExitBtn/>
        <Wrap>
          <div className="fu" style={{textAlign:"center",padding:"12px 0 4px"}}>
            <div style={{fontSize:48,marginBottom:6}}>✅</div>
            <h2 style={{fontFamily:ffd,fontSize:26,fontWeight:900,color:D.white}}>נרשמת!</h2>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,marginTop:12,
              background:D.violetGlow,border:`1px solid ${D.violet}50`,borderRadius:16,
              padding:"10px 24px"}}>
              <span style={{color:D.muted,fontSize:13}}>קוד:</span>
              <span style={{fontFamily:ffd,fontSize:28,fontWeight:900,color:D.violet,letterSpacing:6}}>{code}</span>
            </div>
          </div>

          <GlassCard className="fu d1">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{color:D.muted,fontSize:13}}>שחקנים</span>
              <span style={{color:D.violet,fontWeight:700,fontSize:13}}>{rc} מתוך {pl.length} מוכנים</span>
            </div>
            {pl.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 12px",borderRadius:14,marginBottom:6,
                background:p.ready?"rgba(163,230,53,.08)":"rgba(255,255,255,.04)",
                border:`1px solid ${p.ready?D.lime+"30":D.border}`}}>
                <span style={{color:p.ready?D.lime:D.muted,fontWeight:700,fontSize:13}}>
                  {p.ready?"✓ מוכן":"⏳ ממלא..."}
                </span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:D.white,fontWeight:600}}>{p.name}</span>
                  <Avatar url={p.photoURL} name={p.name} size={32}/>
                </div>
              </div>
            ))}
          </GlassCard>

          {isHost&&<Btn onClick={start} disabled={!all} variant={all?"lime":"ghost"}>
            {all?"התחל! 🎲":`מחכים... (${rc}/${pl.length})`}
          </Btn>}
        </Wrap>
      </Page>
    );
  }

  // ── FILL FORM ─────────────────────────────────────────────────
  const filled = room.gameMode==="slider"
    ? (room.sliderQuestions||[]).filter(q=>ans[q.id]!==undefined).length
    : room.gameMode==="story"
      ? (()=>{const st=STORIES.find(s=>s.id===room.storyId)||STORIES[0]; return st.paragraphs.filter(p=>p.blank&&ans[p.blank.id]).length;})()
      : qs.filter(q=>ans[q.id]?.trim()).length;
  const filledTotal = room.gameMode==="slider"
    ? (room.sliderQuestions||[]).length
    : room.gameMode==="story"
      ? (()=>{const st=STORIES.find(s=>s.id===room.storyId)||STORIES[0]; return st.paragraphs.filter(p=>p.blank).length;})()
      : qs.length;
  return(
    <Page style={{paddingBottom:100}}>
      <ExitBtn/>
      <Wrap>
        <div className="fu" style={{textAlign:"center",marginBottom:4}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(168,85,247,.15)",border:`1px solid ${D.violet}40`,borderRadius:12,
            padding:"8px 20px",marginBottom:6}}>
            <span style={{color:D.muted,fontSize:13}}>קוד:</span>
            <span style={{fontFamily:ffd,fontSize:22,fontWeight:900,color:D.violet,letterSpacing:5}}>{code}</span>
          </div>
        </div>

        {/* Photos — hidden in duel mode (no silhouette round) */}
        {Object.keys(room.players||{}).length!==2&&room.gameMode!=='story'&&room.gameMode!=='slider'&&<GlassCard className="fu d1">
          <p style={{color:D.white,fontWeight:700,fontSize:15,marginBottom:14}}>📸 תמונות</p>
          {[{t:"sil",lbl:"צללית (לחידה):",has:me?.silhouetteURL,cap:undefined,icons:["📷 בחר","🔄 החלף"]},
            {t:"pro",lbl:"סלפי:",has:me?.photoURL,cap:"user",icons:["🤳 צלם","🔄 שוב"]}
          ].map(({t,lbl,has,cap,icons})=>(
            <div key={t} style={{marginBottom:14}}>
              <p style={{color:D.muted,fontSize:12,marginBottom:8}}>{lbl}</p>
              {has&&t==="sil"&&<img src={has} style={{width:"100%",maxHeight:90,objectFit:"cover",borderRadius:12,marginBottom:8,border:`1px solid ${D.violet}30`}}/>}
              {has&&t==="pro"&&<div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
                <img src={has} style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",border:`2px solid ${D.violet}`}}/>
              </div>}
              <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                background:"rgba(168,85,247,.1)",border:`1.5px dashed ${D.violet}60`,
                borderRadius:12,padding:"12px",cursor:"pointer",color:D.violet,fontWeight:600,fontSize:14}}>
                <input type="file" accept="image/*" capture={cap} onChange={e=>onFile(e,t)} style={{display:"none"}}/>
                {upping&&upT===t?"⏳ מעבד...":has?icons[1]:icons[0]}
              </label>
            </div>
          ))}
        </GlassCard>}}

        {/* Questions — Free mode or Story mode */}
        {room.gameMode === "story" ? (
          <StoryForm story={STORIES.find(s=>s.id===room.storyId)||STORIES[0]}
            ans={ans} setAns={setAns} code={code} myName={myName}/>
        ) : room.gameMode === "slider" ? (
          <SliderForm questions={room.sliderQuestions||[]} ans={ans} setAns={setAns} code={code} myName={myName}/>
        ) : (
        <GlassCard className="fu d2">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{color:D.white,fontWeight:700,fontSize:15}}>❓ שאלות</p>
            <span style={{background:filled===filledTotal?D.greenBg:"rgba(255,255,255,.08)",
              color:filled===filledTotal?D.green:D.muted,borderRadius:99,padding:"3px 12px",fontSize:12,fontWeight:700}}>
              {filled} מתוך {filledTotal}
            </span>
          </div>
          <p style={{color:D.muted,fontSize:12,marginBottom:14}}>נשמר אוטומטית — בטוח מרענון דפדפן</p>
          {qs.map((q,i)=>{
            if(!q||!q.id) return null;
            const replaceQ=()=>{
              const usedIds=qs.filter(Boolean).map(x=>x.id);
              const avail=QUESTIONS.filter(x=>!usedIds.includes(x.id));
              if(!avail.length) return;
              const pick=avail[Math.floor(Math.random()*avail.length)];
              // Save ONLY to this player's personal questions
              const newQs=[...qs]; newQs[i]=pick;
              update(ref(db,`rooms/${code}/players/${myName}`),{myQuestions: newQs});
              setAns(p=>{const n={...p};delete n[q.id];return n;});
            };
            return(
            <div key={q.id} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                <label style={{fontSize:13,color:D.offWhite,fontWeight:600,lineHeight:1.4,flex:1,textAlign:"right"}}>
                  {q.e||"•"} {q.label}
                </label>
              </div>
              <Input value={ans[q.id]||""} onChange={v=>setAns(p=>({...p,[q.id]:v}))}
                placeholder="התשובה שלך..."
                style={{borderColor:ans[q.id]?.trim()?D.lime+"80":D.border,marginBottom:6}}/>
              <button onClick={replaceQ} style={{
                width:"100%",padding:"8px",borderRadius:10,
                background:"rgba(168,85,247,.15)",
                border:`1px solid ${D.violet}50`,
                color:D.violet,fontSize:13,fontWeight:700,
                cursor:"pointer",fontFamily:ff}}>
                🔄 לא מתאים לי — החלף שאלה
              </button>
            </div>
            );
          })}
        </GlassCard>
        )}

        <Btn onClick={ready} style={{position:"sticky",bottom:16}}>
          {upping?"מעלה...":"אני מוכן! ✓"}
        </Btn>
      </Wrap>
    </Page>
  );
}

// ── QUESTION SCREEN ───────────────────────────────────────────
function Question({room,code,myName,isHost}){
  const RT=room.roundTime||25;
  const isDuel=Object.keys(room.players||{}).length===2;
  const[cd,setCd]=useState(3);
  const[tl,setTl]=useState(RT);
  const[localPick,setLocalPick]=useState(null); // UI feedback before Firebase

  const players=Object.values(room.players||{});
  const seq=room.roundSequence||[];
  const si=(room.round-1)%seq.length;
  const cur=seq[si]||{};
  const subj=room.players?.[cur.subjectName]||players[0];
  const isSil=cur.qType==="sil";
  const amSubj=myName===cur.subjectName;
  const guesses=room.guesses||{};

  // Duel specifics: guesser = the OTHER player
  const duelGuesser=isDuel?players.find(p=>p.name!==cur.subjectName):null;
  const amDuelGuesser=isDuel&&myName===duelGuesser?.name;

  // Build MC options for duel
  const lobbyQs=room.lobbyQuestions||[];
  const matchQ=lobbyQs.find(q=>q.id===cur.qId);
  const correctText=cur.qType==="duel_round"?"":( ()=>{
    const _raw=subj?.personalAnswers?.[cur.qId];
    if(_raw===undefined||_raw===null) return "";
    const _sq=room.sliderQuestions&&room.sliderQuestions.find(q=>q.id===cur.qId);
    if(_sq) return _raw===0?_sq.left:_sq.right;
    return String(_raw);
  })();
  // allAns removed — AI generates contextual decoys now
  // Read pre-generated decoys from Firebase (generated by host at game start)
  // In duel_round, each player guesses about different subject
  const amP0duel = isDuel && myName === cur.subjectName;
  const duelTargetName = isDuel ? (amP0duel ? cur.subject2Name : cur.subjectName) : null;
  const duelTargetQId  = isDuel ? (amP0duel ? cur.qId2        : cur.qId)         : null;
  const decoyKey = isDuel
    ? (duelTargetQId+"_"+duelTargetName)
    : `${cur.qId}_${cur.subjectName}`;
  const rawOpts = (room.decoyMap||{})[decoyKey];
  // Firebase arrays come back as objects with numeric keys — convert back
  const opts = Array.isArray(rawOpts) ? rawOpts
    : rawOpts ? Object.values(rawOpts) : [];
  const optsLoading = isDuel && !isSil && correctText && opts.length === 0;

  useEffect(()=>{setCd(3);setTl(RT);setLocalPick(null);},[room.round]);
  useEffect(()=>{if(cd<=0)return;const t=setTimeout(()=>setCd(p=>p-1),1000);return()=>clearTimeout(t);},[cd]);
  useEffect(()=>{
    if(cd>0)return;
    if(tl<=0){if(isHost)reveal();return;}
    const t=setTimeout(()=>setTl(p=>p-1),1000);return()=>clearTimeout(t);
  },[cd,tl]);

  const guess=name=>{update(ref(db,`rooms/${code}/guesses`),{[myName]:name});};

  const reveal=()=>{
    if(!isHost)return;
    const upd={};
    if(cur.qType==="duel_round"){
      // Score each player based on their own guess about the other
      const [p0,p1]=[cur.subjectName,cur.subject2Name];
      // p1 guessed about p0 (correct = p0's answer to qId)
      const p0ans=(()=>{const _r=room.players?.[p0]?.personalAnswers?.[cur.qId]; const _sq=room.sliderQuestions&&room.sliderQuestions.find(q=>q.id===cur.qId); return _sq&&_r!==undefined?(_r===0?_sq.left:_sq.right):String(_r||"");})().toLowerCase();
      // p0 guessed about p1 (correct = p1's answer to qId2)
      const p1ans=(()=>{const _r=room.players?.[p1]?.personalAnswers?.[cur.qId2]; const _sq=room.sliderQuestions&&room.sliderQuestions.find(q=>q.id===cur.qId2); return _sq&&_r!==undefined?(_r===0?_sq.left:_sq.right):String(_r||"");})().toLowerCase();
      const g1=guesses[p1]?.trim().toLowerCase(); // p1's guess about p0
      const g0=guesses[p0]?.trim().toLowerCase(); // p0's guess about p1
      if(g1===p0ans&&room.players[p1]) upd[`rooms/${code}/players/${p1}/score`]=(room.players[p1].score||0)+10;
      if(g0===p1ans&&room.players[p0]) upd[`rooms/${code}/players/${p0}/score`]=(room.players[p0].score||0)+10;
      if(Object.keys(upd).length)update(ref(db),upd);
      update(ref(db,`rooms/${code}`),{
        phase:"results",
        duelResult:{
          p0,p1,
          p0ans: (()=>{const _r=room.players?.[p0]?.personalAnswers?.[cur.qId]; const _sq=room.sliderQuestions&&room.sliderQuestions.find(q=>q.id===cur.qId); return _sq&&_r!==undefined?(_r===0?_sq.left:_sq.right):String(_r||'');})(),
          p1ans: (()=>{const _r=room.players?.[p1]?.personalAnswers?.[cur.qId2]; const _sq=room.sliderQuestions&&room.sliderQuestions.find(q=>q.id===cur.qId2); return _sq&&_r!==undefined?(_r===0?_sq.left:_sq.right):String(_r||'');})(),
          p0qLabel:cur.qLabel, p1qLabel:cur.qLabel2,
          p0guessed:guesses[p0]||"", p1guessed:guesses[p1]||"",
          p0correct:g0===p1ans, p1correct:g1===p0ans,
        },
        correctAnswer:"__duel__",
        currentGiphyQuery:"celebration party",
        guesses,
      });
    } else {
      const isSilRound = cur.qType==="sil";
      // For sil round: correct=subjectName. For regular: correct=subject's actual answer
      const subj=players.find(p=>p.name===cur.subjectName);
      const rawCorrect=subj?.personalAnswers?.[cur.qId];
      const sliderQDef=room.sliderQuestions&&room.sliderQuestions.find(q=>q.id===cur.qId);
      const correctLabel=isSilRound
        ? cur.subjectName
        : sliderQDef&&rawCorrect!==undefined
          ? (rawCorrect===0?sliderQDef.left:sliderQDef.right)
          : String(rawCorrect||"");
      Object.entries(guesses).forEach(([g,v])=>{
        const gv=String(v).trim().toLowerCase();
        const cv=correctLabel.trim().toLowerCase();
        if(gv===cv&&room.players[g])
          upd[`rooms/${code}/players/${g}/score`]=(room.players[g].score||0)+10;
      });
      if(Object.keys(upd).length)update(ref(db),upd);
      update(ref(db,`rooms/${code}`),{
        phase:"results",correctAnswer:correctLabel,
        subjectTextAnswer:correctLabel,
        correctSubject:cur.subjectName,currentQLabel:cur.qLabel,currentGiphyQuery:cur.qGiphy||"celebration",
      });
    }
  };

  // In duel_round: ALL players are guessers (both guess simultaneously)
  const nonSubj = cur.qType==="duel_round" ? players : players.filter(p=>p.name!==cur.subjectName);
  const answered = nonSubj.filter(p=>guesses[p.name]).length;
  const allDone = nonSubj.length>0&&answered===nonSubj.length;

  // Countdown screen
  if(cd>0) return(
    <div style={{height:"100dvh",background:D.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",direction:"rtl",fontFamily:ff,color:D.white}}>
      <style>{G}</style>
      <ExitBtn/>
      <p style={{color:D.muted,marginBottom:16,fontSize:14}}>סיבוב {room.round} מתוך {seq.length}</p>
      <div key={cd} style={{fontFamily:ffd,fontSize:130,fontWeight:900,lineHeight:1,
        background:`linear-gradient(135deg,${D.violet},${D.pink})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        animation:"countdown .4s cubic-bezier(.22,.68,0,1.2) both"}}>{cd}</div>
    </div>
  );

  // ── DUEL MODE UI ──────────────────────────────────────────────
  if(isDuel) {
    // Both players guess simultaneously each round
    // mySubject = the player I'm guessing about
    // myQuestion = the question THEY answered that I need to guess
    const [p0, p1] = players;
    const isP0 = myName === p0?.name;
    // I guess about the OTHER player
    const mySubject   = isP0 ? p1 : p0;
    const myQId       = isP0 ? cur.qId2   : cur.qId;
    const myQLabel    = isP0 ? cur.qLabel2 : cur.qLabel;
    const myQEmoji    = isP0 ? cur.qEmoji2 : cur.qEmoji;
    const myCorrectTxt= mySubject?.personalAnswers?.[myQId]||"";

    // Decoy options keyed per player
    const myDecoyKey  = isP0 ? (cur.qId2+"_"+cur.subject2Name) : (cur.qId+"_"+cur.subjectName);
    const rawMyOpts   = (room.decoyMap||{})[myDecoyKey];
    const myOpts      = Array.isArray(rawMyOpts) ? rawMyOpts
                        : rawMyOpts ? Object.values(rawMyOpts) : [];
    const myOptsLoading = myOpts.length === 0 && !!myCorrectTxt;

    const myGuess = guesses[myName];

    return(
    <Page>
      <ExitBtn/>
      <Wrap>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <Dots current={room.round} total={seq.length}/>
            <p style={{color:D.muted,fontSize:12,marginTop:4}}>{room.round} מתוך {seq.length}</p>
          </div>
          <TimerRing t={tl} total={RT}/>
        </div>

        {/* My question card */}
        <GlassCard className="fu" glow={D.violet}
          style={{background:`linear-gradient(135deg,rgba(168,85,247,.15),rgba(244,114,182,.08))`,textAlign:"center",padding:"20px 16px"}}>
          <p style={{color:D.muted,fontSize:12,marginBottom:6}}>השאלה:</p>
          <p style={{fontFamily:ffd,fontSize:22,fontWeight:900,color:D.white,lineHeight:1.25,marginBottom:16}}>
            {myQEmoji} {myQLabel}
          </p>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,
            background:"rgba(255,255,255,.07)",border:`1px solid ${D.border}`,
            borderRadius:99,padding:"6px 14px 6px 8px"}}>
            <Avatar url={mySubject?.photoURL} name={mySubject?.name} size={28}/>
            <span style={{color:D.offWhite,fontSize:13,fontWeight:600}}>על: {mySubject?.name}</span>
          </div>
        </GlassCard>

        {/* MC Options */}
        <GlassCard className="fu d1">
          <p style={{color:D.white,fontWeight:700,fontSize:15,marginBottom:14}}>
            מה {mySubject?.name} ענה? 🤔
          </p>
          {myOptsLoading&&<div style={{textAlign:"center",padding:"16px 0"}}><Spinner size={24}/></div>}
          {myOpts.map((opt,i)=>{
            const letters=["א","ב","ג","ד"];
            const picked=localPick===opt;
            const done=!!myGuess;
            return(
              <button key={i} onClick={()=>{if(!done){setLocalPick(opt);guess(mySubject?.name||"");} }}
                style={{width:"100%",display:"flex",alignItems:"center",gap:12,
                  padding:"14px 16px",borderRadius:14,marginBottom:8,cursor:done?"default":"pointer",
                  background:picked?"rgba(168,85,247,.2)":"rgba(255,255,255,.05)",
                  border:`1.5px solid ${picked?D.violet:D.border}`,
                  transition:"all .18s",fontFamily:ff,textAlign:"right"}}>
                <span style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",
                  justifyContent:"center",flexShrink:0,
                  background:picked?D.violet:"rgba(255,255,255,.08)",
                  color:picked?"#fff":D.muted,fontFamily:ffd,fontWeight:800,fontSize:13}}>
                  {letters[i]}
                </span>
                <span style={{color:picked?D.white:D.offWhite,fontSize:15}}>{opt}</span>
              </button>
            );
          })}
          {myGuess&&<p style={{color:D.muted,fontSize:13,textAlign:"center",marginTop:4}}>✓ ניחוש נשלח</p>}
        </GlassCard>

        {/* Host reveal */}
        {isHost&&<Btn onClick={reveal} variant={allDone?"lime":"primary"}>
          {allDone?"כולם ענו! חשוף ⚡":"חשוף עכשיו ▶"}
        </Btn>}
      </Wrap>
    </Page>
    );
  }

// ── MULTIPLAYER UI ─────────────────────────────────────────────
  return(
    <Page>
      <ExitBtn/>
      <Wrap>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <Dots current={room.round} total={seq.length}/>
            <p style={{color:D.muted,fontSize:12,marginTop:4}}>{room.round} מתוך {seq.length}</p>
          </div>
          <TimerRing t={tl} total={RT}/>
        </div>

        {/* Subject banner — question big + center, avatar small + framed */}
        <GlassCard className="fu" glow={D.violet}
          style={{background:`linear-gradient(135deg,rgba(168,85,247,.14),rgba(34,211,238,.07))`,textAlign:"center",padding:"20px 16px"}}>
          {/* Big question */}
          <p style={{color:D.muted,fontSize:12,marginBottom:6}}>
            {isSil?"מי הדמות בצללית?":"השאלה:"}
          </p>
          <p style={{fontFamily:ffd,fontSize:22,fontWeight:900,color:D.white,lineHeight:1.25,marginBottom:16}}>
            {cur.qEmoji} {cur.qLabel}
          </p>
          {/* Small framed avatar + name */}
          <div style={{display:"inline-flex",alignItems:"center",gap:10,
            background:"rgba(255,255,255,.07)",border:`1px solid ${D.border}`,
            borderRadius:99,padding:"6px 14px 6px 8px"}}>
            <Avatar url={subj?.photoURL} name={subj?.name} size={28}/>
            <span style={{color:D.offWhite,fontSize:13,fontWeight:600}}>{cur.subjectName}</span>
          </div>
        </GlassCard>

        {/* Answer or silhouette */}
        <GlassCard className="fu d1" style={{textAlign:"center"}}>
          {isSil?(
            subj?.silhouetteURL
              ?<img src={subj.silhouetteURL} style={{width:"100%",maxHeight:200,objectFit:"contain",borderRadius:12}}/>
              :<p style={{color:D.muted,textAlign:"center",padding:20}}>ממתין...</p>
          ):(
            <>
              <p style={{color:D.muted,fontSize:12,marginBottom:8}}>התשובה שלו היתה:</p>
              <p style={{fontFamily:ffd,fontSize:28,fontWeight:900,color:D.lime,lineHeight:1.2}}>
                "{subj?.personalAnswers?.[cur.qId]||"..."}"
              </p>
            </>
          )}
        </GlassCard>

        {/* My turn or guess */}
        {amSubj?(
          <GlassCard className="fu d2" style={{textAlign:"center",background:"rgba(168,85,247,.1)"}}>
            <div style={{fontSize:34,marginBottom:6}}>👤</div>
            <p style={{color:D.violet,fontWeight:700}}>השאלה הזו עליך!</p>
            <p style={{color:D.muted,fontSize:13,marginTop:4}}>האחרים מנחשים...</p>
          </GlassCard>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:G2,gap:8}}>
              {players.map((p,i)=>{
                const picked=guesses[myName]===p.name;
                return(
                  <button key={i} onClick={()=>!guesses[myName]&&guess(p.name)}
                    style={{padding:"12px 10px",borderRadius:14,cursor:guesses[myName]?"default":"pointer",
                      display:"flex",alignItems:"center",gap:8,fontFamily:ff,
                      background:picked?"rgba(168,85,247,.18)":"rgba(255,255,255,.05)",
                      border:`1.5px solid ${picked?D.violet:D.border}`,
                      boxShadow:picked?`0 0 14px ${D.violetGlow}`:"none",
                      transition:"all .15s"}}>
                    <Avatar url={p.photoURL} name={p.name} size={30}/>
                    <span style={{color:picked?D.white:D.offWhite,fontWeight:picked?700:500,fontSize:14}}>{p.name}</span>
                  </button>
                );
              })}
            </div>
            {guesses[myName]&&!isHost&&<p style={{color:D.muted,fontSize:13,textAlign:"center"}}>✓ ניחוש נשלח</p>}
          </>
        )}

        {/* Host panel */}
        {isHost&&(
          <GlassCard className="fu d3" style={{background:"rgba(251,191,36,.06)",border:`1px solid ${D.gold}20`}}>
            <p style={{color:D.muted,fontSize:13,marginBottom:10,fontWeight:600}}>📊 {answered} מתוך {nonSubj.length} ענו</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
              {nonSubj.map((p,i)=>{
                const done=!!guesses[p.name];
                return<span key={i} style={{padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:700,
                  background:done?D.greenBg:"rgba(255,255,255,.06)",
                  color:done?D.green:D.muted,border:`1px solid ${done?D.green+"30":D.border}`}}>
                  {done?"✓":"⏳"} {p.name}
                </span>;
              })}
            </div>
            <Btn onClick={reveal} variant={allDone?"lime":"primary"}>
              {allDone?"כולם ענו! חשוף ⚡":"חשוף עכשיו ▶"}
            </Btn>
          </GlassCard>
        )}
      </Wrap>
    </Page>
  );
}

// ── RESULTS ───────────────────────────────────────────────────
function Results({room,code,isHost,myName}){
  const[gif,setGif]=useState(null);
  const[gifLoading,setGL]=useState(true);
  const ca=room.correctAnswer||"";
  const ta=room.subjectTextAnswer||ca;
  const cs=room.correctSubject||"";
  const ql=room.currentQLabel||"";
  const players=Object.values(room.players||{});
  const guesses=room.guesses||{};
  const sd=room.players?.[cs];
  const ok=g=>g?.trim().toLowerCase()===ca.trim().toLowerCase();
  const myGuess=guesses[myName];
  const myCorrect=myGuess!==undefined&&ok(myGuess);
  const seq=room.roundSequence||[];
  const isSil=seq[(room.round-1)%seq.length]?.qType==="sil";
  const scorers=Object.entries(guesses).filter(([,g])=>ok(g)).length;
  const dr=room.duelResult||null; // duel round result object

  useEffect(()=>{
    setGif(null);setGL(true);
    fetchGif(room.currentGiphyQuery||"celebration").then(u=>{setGif(u);setGL(false);});
  },[room.currentGiphyQuery]);

  const next=()=>{
    const nr=room.round+1;
    update(ref(db,`rooms/${code}`),{
      phase:nr>seq.length?"leaderboard":"question",
      round:nr,guesses:null,correctAnswer:null,subjectTextAnswer:null,
      correctSubject:null,currentQLabel:null,currentGiphyQuery:null,
    });
  };

  return(
    <Page>
      <ExitBtn/>
      <Wrap>
        {/* Big reveal */}
        {dr ? (
          // DUEL RESULT: show both players' Q&A + correct/wrong
          <GlassCard className="si" glow={D.lime} style={{textAlign:"center"}}>
            <p style={{color:D.muted,fontSize:12,marginBottom:12}}>תוצאות הסיבוב</p>
            {[{name:dr.p0,ans:dr.p0ans,qLabel:dr.p0qLabel,guessed:dr.p1guessed,correct:dr.p1correct,guesserName:dr.p1},
              {name:dr.p1,ans:dr.p1ans,qLabel:dr.p1qLabel,guessed:dr.p0guessed,correct:dr.p0correct,guesserName:dr.p0}
            ].map((row,i)=>(
              <div key={i} style={{marginBottom:14,padding:"12px",borderRadius:14,
                background:row.correct?"rgba(74,222,128,.1)":"rgba(248,113,113,.08)",
                border:`1px solid ${row.correct?D.green+"40":D.red+"30"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,justifyContent:"center"}}>
                  <Avatar url={room.players?.[row.name]?.photoURL} name={row.name} size={32}/>
                  <div style={{textAlign:"right"}}>
                    <p style={{color:D.muted,fontSize:11}}>{row.qLabel}</p>
                    <p style={{fontFamily:ffd,fontSize:16,fontWeight:900,color:D.lime}}>"{row.ans}"</p>
                  </div>
                </div>
                <p style={{fontSize:13,color:row.correct?D.green:D.red}}>
                  {row.guesserName}: {row.correct?"✅ ניחש נכון! +10":"❌ ניחש: "+`"${row.guessed}"`}
                </p>
              </div>
            ))}
          </GlassCard>
        ) : (
        <GlassCard className="si" glow={D.lime}
          style={{background:`linear-gradient(135deg,rgba(163,230,53,.1),rgba(74,222,128,.08))`,textAlign:"center"}}>
          <p style={{color:D.muted,fontSize:12,marginBottom:6}}>{ql}</p>
          {ta&&!isSil&&(
            <p style={{fontFamily:ffd,fontSize:26,fontWeight:900,color:D.white,marginBottom:10,lineHeight:1.2}}>
              "{ta}"
            </p>
          )}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:4}}>
            <Avatar url={sd?.photoURL} name={cs} size={56}/>
            <div style={{textAlign:"right"}}>
              <p style={{color:D.muted,fontSize:11,marginBottom:2}}>זה היה...</p>
              <p style={{fontFamily:ffd,fontSize:24,fontWeight:900,color:D.lime}}>{cs}</p>
            </div>
          </div>
        </GlassCard>
        )}

        {/* GIF */}
        <GlassCard style={{padding:0,overflow:"hidden",minHeight:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {gifLoading?<Spinner/>:gif?<img src={gif} style={{width:"100%",maxHeight:200,objectFit:"cover",display:"block"}}/>:<div style={{fontSize:56,padding:20,textAlign:"center"}}>🎉</div>}
        </GlassCard>

        {/* Scores */}
                {/* Personal result feedback */}
        {myGuess!==undefined&&!dr&&(
          <GlassCard className="si" style={{
            textAlign:"center",
            background:myCorrect?`linear-gradient(135deg,rgba(74,222,128,.18),rgba(74,222,128,.06))`:`linear-gradient(135deg,rgba(248,113,113,.18),rgba(248,113,113,.06))`,
            border:`1.5px solid ${myCorrect?D.green+"50":D.red+"50"}`,
          }}>
            <div style={{fontSize:44,marginBottom:6}}>{myCorrect?"🎯":"😅"}</div>
            <p style={{fontFamily:ffd,fontSize:22,fontWeight:900,color:myCorrect?D.green:D.red,marginBottom:4}}>
              {myCorrect?"ניחשת נכון!":"לא הצלחת הפעם"}
            </p>
            {myCorrect?<div style={{display:"inline-flex",alignItems:"center",gap:6,
              background:"rgba(163,230,53,.15)",borderRadius:99,padding:"6px 18px",marginTop:4}}>
              <span style={{fontFamily:ffd,fontSize:24,fontWeight:900,color:D.lime}}>+10</span>
              <span style={{color:D.muted,fontSize:13}}>נקודות!</span>
            </div>:<p style={{color:D.muted,fontSize:13,marginTop:4}}>
              ניחשת: <span style={{color:D.red}}>"{myGuess}"</span>
            </p>}
          </GlassCard>
        )}
        <GlassCard className="fu d1">
          <p style={{color:D.muted,fontSize:13,marginBottom:10,fontWeight:600}}>כל הניחושים:</p>
          {players.map((p,i)=>{
            const g=guesses[p.name];if(!g)return null;
            const good=ok(g);
            return(
              <div key={i} className="fu" style={{animationDelay:`${i*.06}s`,
                display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"11px 14px",borderRadius:12,marginBottom:6,
                background:good?D.greenBg:D.redBg,
                border:`1px solid ${good?D.green+"30":D.red+"30"}`}}>
                <span style={{fontFamily:ffd,fontWeight:900,fontSize:15,color:good?D.green:D.red}}>
                  {good?"+10":"✗"}
                </span>
                <div style={{display:"flex",alignItems:"center",gap:8,textAlign:"right"}}>
                  <div>
                    <p style={{color:D.white,fontWeight:600,fontSize:14}}>{p.name}</p>
                    <p style={{color:D.muted,fontSize:12}}>"{g}"</p>
                  </div>
                  <Avatar url={p.photoURL} name={p.name} size={32}/>
                </div>
              </div>
            );
          })}
          {scorers>1&&<p style={{color:D.lime,fontSize:12,textAlign:"center",marginTop:8,fontWeight:700}}>
            🎯 {scorers} שחקנים ניחשו נכון!
          </p>}
        </GlassCard>

        {isHost?<Btn onClick={next} variant="lime">המשך ▶</Btn>
          :<GlassCard style={{textAlign:"center"}}><p style={{color:D.muted}}>מחכים למארח...</p></GlassCard>}
      </Wrap>
    </Page>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────
function Board({room,code,isHost}){
  const list=Object.values(room.players||{}).sort((a,b)=>b.score-a.score);
  const medals=["🥇","🥈","🥉"];
  const restart=async()=>{
    const pl=Object.values(room.players||{});
    const qs=pickLobbyQs(room.roundsPerPlayer||4);
    const r={};
    pl.forEach(p=>{r[`rooms/${code}/players/${p.name}/score`]=0;r[`rooms/${code}/players/${p.name}/ready`]=false;r[`rooms/${code}/players/${p.name}/personalAnswers`]=null;});
    await update(ref(db),r);
    await update(ref(db,`rooms/${code}`),{phase:"lobby",round:0,lobbyQuestions:qs,guesses:null,roundSequence:null});
    sessionStorage.clear();
  };

  return(
    <Page>
      <ExitBtn/>
      <Wrap>
        <div className="si" style={{textAlign:"center",padding:"16px 0 8px"}}>
          <div style={{fontSize:60,marginBottom:8,animation:"float 2.5s ease-in-out infinite"}}>🏆</div>
          <h2 style={{fontFamily:ffd,fontSize:32,fontWeight:900,
            background:`linear-gradient(135deg,${D.gold},${D.amber})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            תוצאות סופיות
          </h2>
        </div>

        <GlassCard>
          {list.map((p,i)=>(
            <div key={i} className="fu" style={{animationDelay:`${i*.08}s`,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"14px 16px",borderRadius:16,marginBottom:8,
              background:i===0?"rgba(251,191,36,.1)":"rgba(255,255,255,.04)",
              border:`1.5px solid ${i===0?D.gold+"40":D.border}`,
              boxShadow:i===0?`0 0 20px ${D.goldGlow}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:28}}>{medals[i]||`${i+1}`}</span>
                <div>
                  <span style={{fontFamily:ffd,fontSize:24,fontWeight:900,
                    color:i===0?D.gold:D.white}}>{p.score}</span>
                  <span style={{color:D.muted,fontSize:12,marginRight:4}}>נק'</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:D.white,fontWeight:600}}>{p.name}</span>
                <Avatar url={p.photoURL} name={p.name} size={40}/>
              </div>
            </div>
          ))}
        </GlassCard>

        {isHost&&<Btn onClick={restart} variant="gold">משחק חדש 🔄</Btn>}
      </Wrap>
    </Page>
  );
}

// ── ROOT ──────────────────────────────────────────────────────
export default function App(){
  const[rc,setRc]=useState(()=>sessionStorage.getItem(SS_CODE)||"");
  const[mn,setMn]=useState(()=>sessionStorage.getItem(SS_NAME)||"");
  const[room,setRoom]=useState(null);

  useEffect(()=>{if(rc)sessionStorage.setItem(SS_CODE,rc);},[rc]);
  useEffect(()=>{if(mn)sessionStorage.setItem(SS_NAME,mn);},[mn]);
  useEffect(()=>{
    if(!rc)return;
    return onValue(ref(db,`rooms/${rc}`),s=>{
      if(s.exists())setRoom(s.val());
      else{sessionStorage.clear();setRc("");setMn("");}
    });
  },[rc]);

  const join=(c,n)=>{setRc(c);setMn(n);};

  if(rc&&room){
    const ih=room.host===mn;
    if(room.phase==="lobby")       return<Lobby    room={room} code={rc} myName={mn} isHost={ih}/>;
    if(room.phase==="question")    return<Question room={room} code={rc} myName={mn} isHost={ih}/>;
    if(room.phase==="results")     return<Results  room={room} code={rc} isHost={ih} myName={mn}/>
    if(room.phase==="leaderboard") return<Board    room={room} code={rc} isHost={ih}/>;
  }
  if(rc&&!room)return(
    <div style={{height:"100dvh",background:D.bgFixed,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:12,fontFamily:ff,color:D.white}}>
      <style>{G}</style><Spinner/><p style={{color:D.muted}}>מתחבר...</p>
    </div>
  );
  return<Home onJoin={join}/>;
}
