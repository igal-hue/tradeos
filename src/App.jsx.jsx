const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { useState, useEffect, useRef } from "react";
import AlertsPanel from "./AlertsPanel";
import CandlestickGuide from "./CandlestickGuide";
import TVChart from "./TVChart";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Heebo:wght@300;400;500;600;700&display=swap');`;
const CSS = `
${FONTS}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#060608;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes glow{0%,100%{box-shadow:0 0 8px #00ff8740}50%{box-shadow:0 0 22px #00ff8780}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
@keyframes revengePulse{0%,100%{box-shadow:0 0 0 0 #ff6b6b00}50%{box-shadow:0 0 40px 8px #ff6b6b55}}
@keyframes revengeFlash{0%,100%{border-color:#ff6b6b40}50%{border-color:#ff6b6bcc}}
.row:active{background:#111120!important;}
.btn:active{transform:scale(.96);opacity:.85;}
`;

// ── DATA ──────────────────────────────────────────────────────────────
const STOCKS_LIST = [
  {symbol:"SPY",name:"S&P 500 ETF",sector:"ETF"},
  {symbol:"QQQ",name:"Nasdaq 100",sector:"ETF"},
  {symbol:"PLTR",name:"Palantir",sector:"טכנולוגיה"},
  {symbol:"TSLA",name:"Tesla",sector:"רכב"},
  {symbol:"OKLO",name:"Oklo Inc",sector:"אנרגיה"},
  {symbol:"NVDA",name:"Nvidia",sector:"סמיקונדקטור"},
  {symbol:"AAPL",name:"Apple",sector:"טכנולוגיה"},
  {symbol:"META",name:"Meta",sector:"טכנולוגיה"},
  {symbol:"AMZN",name:"Amazon",sector:"ענן"},
  {symbol:"MSFT",name:"Microsoft",sector:"טכנולוגיה"},
  {symbol:"AMD",name:"AMD",sector:"סמיקונדקטור"},
  {symbol:"MSTR",name:"MicroStrategy",sector:"ביטקוין"},
  {symbol:"COIN",name:"Coinbase",sector:"קריפטו"},
  {symbol:"IONQ",name:"IonQ",sector:"קוונטום"},
  {symbol:"RKLB",name:"Rocket Lab",sector:"חלל"},
  {symbol:"SHOP",name:"Shopify",sector:"מסחר"},
  {symbol:"CRWD",name:"CrowdStrike",sector:"סייבר"},
  {symbol:"PANW",name:"Palo Alto",sector:"סייבר"},
  {symbol:"SNOW",name:"Snowflake",sector:"ענן"},
  {symbol:"DDOG",name:"Datadog",sector:"ענן"},
  {symbol:"SMCI",name:"Super Micro",sector:"שרתים"},
  {symbol:"SQ",name:"Block Inc",sector:"פינטק"},
  {symbol:"SOFI",name:"SoFi",sector:"פינטק"},
  {symbol:"HOOD",name:"Robinhood",sector:"פינטק"},
  {symbol:"GOOGL",name:"Alphabet",sector:"טכנולוגיה"},
];

function sr(seed,o=0){const x=Math.sin(seed*9301+o*49297+233)*10000;return x-Math.floor(x);}
function buildStock(s,idx){
  const seed=s.symbol.split("").reduce((a,c)=>a+c.charCodeAt(0),0)+idx;
  const r=(mn,mx,o)=>mn+sr(seed,o)*(mx-mn);
  const price=parseFloat(r(15,720,1).toFixed(2));
  const change=parseFloat((r(-7,9,2)-1).toFixed(2));
  const rsi=parseFloat(r(24,77,3).toFixed(1));
  const vol=parseFloat(r(0.4,4.6,4).toFixed(1));
  const macd=parseFloat((r(-1.5,1.8,5)-.3).toFixed(2));
  const ema20=price*(1+(r(0,1,6)-.5)*.06);
  const ema50=price*(1+(r(0,1,7)-.5)*.1);
  const fund=parseFloat(r(38,92,9).toFixed(0));
  const sent=parseFloat(r(28,88,10).toFixed(0));
  let tech=50;
  if(rsi<32)tech+=18;else if(rsi>70)tech-=18;
  if(macd>0)tech+=14;else tech-=10;
  if(price>ema20)tech+=10;else tech-=5;
  if(ema20>ema50)tech+=8;else tech-=4;
  if(vol>2.8)tech+=8;
  tech=Math.max(10,Math.min(95,tech));
  const total=Math.round(tech*.5+fund*.3+sent*.2);
  let sig,sc,sb;
  if(total>=73){sig="סיגנל חיובי חזק";sc="#000";sb="#00ff87";}
  else if(total>=58){sig="סיגנל חיובי";sc="#000";sb="#7bff6e";}
  else if(total>=42){sig="המתנה";sc="#000";sb="#ffd93d";}
  else if(total>=27){sig="סיגנל שלילי";sc="#fff";sb="#ff6b6b";}
  else{sig="סיגנל שלילי חזק";sc="#fff";sb="#cc2222";}
  const support=parseFloat((price*(1-r(.03,.07,12))).toFixed(2));
  const resist=parseFloat((price*(1+r(.04,.10,13))).toFixed(2));
  const stop=parseFloat((support*.985).toFixed(2));
  const target=parseFloat((resist*1.01).toFixed(2));
  const rr=parseFloat(((target-price)/(price-stop)).toFixed(1));
  const spark=Array.from({length:16},(_,i)=>parseFloat((price*(1+(sr(seed,20+i)-.5)*.14)).toFixed(2)));
  spark[spark.length-1]=price;
  return{...s,price,change,rsi,vol,macd,ema20:parseFloat(ema20.toFixed(2)),ema50:parseFloat(ema50.toFixed(2)),fund,sent,tech,total,sig,sc,sb,support,resist,stop,target,rr,spark,volAlert:vol>3,rsiAlert:rsi<30||rsi>72};
}
const ALL_STOCKS = STOCKS_LIST.map((s,i)=>buildStock(s,i));

// Sample journal entries
const SAMPLE_TRADES = [
  {id:1,symbol:"TSLA",entry:245,exit:278,stop:232,qty:10,date:"2026-04-10",day:"חמישי",hour:"10:30",setup:"RSI Bounce",result:"win",pnl:330,emotion:"focused",followedPlan:true,notes:"עקבתי לתוכנית, יצאתי ביעד"},
  {id:2,symbol:"NVDA",entry:890,exit:856,stop:875,qty:5,date:"2026-04-09",day:"רביעי",hour:"14:00",setup:"EMA Break",result:"loss",pnl:-170,emotion:"stress",followedPlan:false,notes:"יצאתי מוקדם מדי מפחד"},
  {id:3,symbol:"PLTR",entry:88,exit:103,stop:82,qty:20,date:"2026-04-08",day:"שלישי",hour:"09:45",setup:"RSI Bounce",result:"win",pnl:300,emotion:"focused",followedPlan:true,notes:""},
  {id:4,symbol:"AAPL",entry:172,exit:165,stop:168,qty:15,date:"2026-04-07",day:"שני",hour:"10:00",setup:"Volume Break",result:"loss",pnl:-105,emotion:"greed",followedPlan:false,notes:"נכנסתי בלי תוכנית"},
  {id:5,symbol:"COIN",entry:215,exit:248,stop:205,qty:8,date:"2026-04-04",day:"שישי",hour:"11:15",setup:"EMA Break",result:"win",pnl:264,emotion:"focused",followedPlan:true,notes:""},
  {id:6,symbol:"AMD",entry:168,exit:182,stop:160,qty:12,date:"2026-04-03",day:"חמישי",hour:"13:30",setup:"RSI Bounce",result:"win",pnl:168,emotion:"neutral",followedPlan:true,notes:""},
  {id:7,symbol:"META",entry:520,exit:495,stop:510,qty:4,date:"2026-04-02",day:"רביעי",hour:"09:30",setup:"Volume Break",result:"loss",pnl:-100,emotion:"fear",followedPlan:false,notes:"Revenge trade אחרי הפסד"},
  {id:8,symbol:"SHOP",entry:78,exit:91,stop:74,qty:25,date:"2026-04-01",day:"שלישי",hour:"10:45",setup:"RSI Bounce",result:"win",pnl:325,emotion:"focused",followedPlan:true,notes:""},
];

// ── EARNINGS DATA ─────────────────────────────────────────────────────
const EARNINGS_DATA = [
  {symbol:"NVDA",  name:"Nvidia",       date:"2026-04-17", time:"after"},
  {symbol:"TSLA",  name:"Tesla",        date:"2026-04-17", time:"after"},
  {symbol:"AAPL",  name:"Apple",        date:"2026-04-18", time:"after"},
  {symbol:"AMZN",  name:"Amazon",       date:"2026-04-18", time:"after"},
  {symbol:"MSFT",  name:"Microsoft",    date:"2026-04-22", time:"after"},
  {symbol:"GOOGL", name:"Alphabet",     date:"2026-04-22", time:"before"},
  {symbol:"META",  name:"Meta",         date:"2026-04-23", time:"after"},
  {symbol:"AMD",   name:"AMD",          date:"2026-04-24", time:"after"},
  {symbol:"SHOP",  name:"Shopify",      date:"2026-04-25", time:"after"},
  {symbol:"COIN",  name:"Coinbase",     date:"2026-04-29", time:"after"},
  {symbol:"PLTR",  name:"Palantir",     date:"2026-04-30", time:"after"},
  {symbol:"CRWD",  name:"CrowdStrike",  date:"2026-05-01", time:"after"},
  {symbol:"SNOW",  name:"Snowflake",    date:"2026-05-07", time:"after"},
  {symbol:"DDOG",  name:"Datadog",      date:"2026-05-08", time:"after"},
  {symbol:"PANW",  name:"Palo Alto",    date:"2026-05-13", time:"after"},
  {symbol:"SMCI",  name:"Super Micro",  date:"2026-05-14", time:"after"},
];

// ── ECONOMIC CALENDAR DATA ────────────────────────────────────────────
// impact: "high" | "medium" | "low"
const ECON_EVENTS = [
  {id:1,  name:"תביעות אבטלה שבועיות",        date:"2026-04-17",time:"15:30",impact:"low",    cat:"employment", prev:"223K",  fore:"220K"},
  {id:2,  name:"מדד פילדלפיה פד",              date:"2026-04-17",time:"15:30",impact:"medium", cat:"manufacturing",prev:"-4.3",fore:"3.0"},
  {id:3,  name:"מכירות בתים קיימים",           date:"2026-04-22",time:"17:00",impact:"low",    cat:"housing",    prev:"4.26M", fore:"4.15M"},
  {id:4,  name:"PMI ייצור פלאש",               date:"2026-04-23",time:"16:45",impact:"medium", cat:"manufacturing",prev:"50.2",fore:"49.8"},
  {id:5,  name:"PMI שירותים פלאש",             date:"2026-04-23",time:"16:45",impact:"medium", cat:"manufacturing",prev:"54.4",fore:"53.0"},
  {id:6,  name:"תמ\"ג רבעון 1 — אומדן ראשון", date:"2026-04-24",time:"15:30",impact:"high",   cat:"growth",     prev:"2.3%",  fore:"0.4%"},
  {id:7,  name:"הזמנות מוצרים בני קיימא",      date:"2026-04-24",time:"15:30",impact:"medium", cat:"manufacturing",prev:"1.0%",fore:"-1.1%"},
  {id:8,  name:"מדד PCE — אינפלציה בסיסית",    date:"2026-04-25",time:"15:30",impact:"high",   cat:"inflation",  prev:"2.8%",  fore:"2.6%"},
  {id:9,  name:"סנטימנט צרכנים — מישיגן",      date:"2026-04-25",time:"17:00",impact:"low",    cat:"sentiment",  prev:"57.0",  fore:"53.5"},
  {id:10, name:"אמון צרכנים CB",               date:"2026-04-29",time:"17:00",impact:"medium", cat:"sentiment",  prev:"92.9",  fore:"88.0"},
  {id:11, name:"דוח תעסוקה ADP",               date:"2026-04-30",time:"15:15",impact:"medium", cat:"employment", prev:"155K",  fore:"120K"},
  {id:12, name:"תמ\"ג רבעון 1 — אומדן שני",    date:"2026-04-30",time:"15:30",impact:"high",   cat:"growth",     prev:"2.3%",  fore:"0.4%"},
  {id:13, name:"ISM ייצור",                    date:"2026-05-01",time:"17:00",impact:"medium", cat:"manufacturing",prev:"49.0",fore:"48.5"},
  {id:14, name:"שכר לא-חקלאי NFP",             date:"2026-05-02",time:"15:30",impact:"high",   cat:"employment", prev:"228K",  fore:"135K"},
  {id:15, name:"שיעור אבטלה",                  date:"2026-05-02",time:"15:30",impact:"high",   cat:"employment", prev:"4.2%",  fore:"4.3%"},
  {id:16, name:"החלטת ריבית פד — FOMC",        date:"2026-05-07",time:"21:00",impact:"high",   cat:"fed",        prev:"4.25%", fore:"4.25%"},
  {id:17, name:"מסיבת עיתונאים פאואל",         date:"2026-05-07",time:"21:30",impact:"high",   cat:"fed",        prev:"—",     fore:"—"},
  {id:18, name:"מדד המחירים לצרכן CPI",        date:"2026-05-13",time:"15:30",impact:"high",   cat:"inflation",  prev:"2.4%",  fore:"2.3%"},
  {id:19, name:"מדד המחירים ליצרן PPI",        date:"2026-05-15",time:"15:30",impact:"medium", cat:"inflation",  prev:"2.7%",  fore:"2.5%"},
  {id:20, name:"מכירות קמעונאיות",             date:"2026-05-15",time:"15:30",impact:"medium", cat:"growth",     prev:"1.4%",  fore:"0.1%"},
];

const ECON_IMPACT={
  high:  {label:"גבוהה",  color:"#ff6b6b", bg:"#ff6b6b18", border:"#ff6b6b45"},
  medium:{label:"בינונית",color:"#ffd93d", bg:"#ffd93d12", border:"#ffd93d35"},
  low:   {label:"נמוכה",  color:"#555",    bg:"#1a1a2e",   border:"#2a2a3e"},
};
const ECON_CAT_ICON={
  fed:"🏦", inflation:"📊", employment:"👷", growth:"📈",
  manufacturing:"🏭", housing:"🏠", sentiment:"💭",
};

function daysUntil(dateStr){
  const t=new Date();t.setHours(0,0,0,0);
  const d=new Date(dateStr);d.setHours(0,0,0,0);
  return Math.round((d-t)/(864e5));
}

// ── NEWS DATABASE ─────────────────────────────────────────────────────
// sent: "positive"|"negative"|"neutral"
const NEWS_DB = [
  {id:1,  symbol:"NVDA", sent:"positive", pct:"+4.2%", headline:"Nvidia מכריזה על Blackwell Ultra — ביצועים גבוהים ב-40% מהדור הקודם", summary:"Nvidia הציגה את שבב ה-Blackwell Ultra בכנס GTC עם ביצועים שוברי שיא. הביקוש ממרכזי נתונים צפוי לזנק ברבעון הבא.", source:"Reuters", mins:45},
  {id:2,  symbol:"NVDA", sent:"positive", pct:"+2.1%", headline:"Microsoft ו-Oracle הגדילו הזמנות H200 ב-60% לרבעון הקרוב", summary:"שני ענקי הענן הגדילו הזמנות שמחזקות את תחזיות ההכנסה של Nvidia לשנת 2026.", source:"Bloomberg", mins:120},
  {id:3,  symbol:"TSLA", sent:"negative", pct:"-3.1%", headline:"מכירות Tesla בגרמניה ירדו 13% — תחרות אירופאית גוברת", summary:"נתוני רישום רכבים חשמליים מראים ירידה חדה במכירות Tesla על רקע התחרות המקומית.", source:"Der Spiegel", mins:90},
  {id:4,  symbol:"TSLA", sent:"positive", pct:"+5.5%", headline:"Musk: Robotaxi יוצא לשוק בקיץ 2026 ב-10 ערים בארה\"ב", summary:"אילון מאסק אישר כי שירות ה-Robotaxi יושק לציבור הרחב עם ציי מונית אוטונומיים מלאים.", source:"Tesla IR", mins:30},
  {id:5,  symbol:"AAPL", sent:"positive", pct:"+1.8%", headline:"Apple Intelligence כובשת 400 מיליון משתמשים — שיא אימוץ", summary:"תכונות ה-AI החדשות של Apple זוכות לאימוץ מהיר יותר מכל תכונה קודמת, מה שתומך בשדרוגי iPhone.", source:"9to5Mac", mins:200},
  {id:6,  symbol:"AAPL", sent:"neutral",  pct:"0%",    headline:"EU מחייבת Apple לפתוח App Store לתחרות — ערעור בדרך", summary:"הנציבות האירופית קבעה שאפל הפרה את חוק השווקים הדיגיטליים. אפל הכריזה על ערעור.", source:"FT", mins:310},
  {id:7,  symbol:"META", sent:"positive", pct:"+3.4%", headline:"Meta מדווחת על צמיחה של 27% בהכנסות פרסום — Reels עוקף TikTok", summary:"הכנסות הפרסום חצו תחזיות האנליסטים, עם Reels שמוביל בזמן צפייה בקרב גיל 18–34.", source:"Meta IR", mins:60},
  {id:8,  symbol:"META", sent:"positive", pct:"+2.2%", headline:"משקפי Ray-Ban Meta מוכרים 2 מיליון יחידות — AI קולי כובש", summary:"מכירות משקפי ה-AR עולות בחדות, עם תכונות ה-AI הקוליות כגורם מבדל מרכזי.", source:"WSJ", mins:400},
  {id:9,  symbol:"AMZN", sent:"positive", pct:"+2.8%", headline:"AWS צומח 37% — מנהיגות AI בענן מתחזקת", summary:"Amazon Web Services מציגה האצה בצמיחה, מונעת על-ידי ביקוש לשירותי Bedrock ו-SageMaker.", source:"Amazon IR", mins:180},
  {id:10, symbol:"AMZN", sent:"neutral",  pct:"-0.5%", headline:"Amazon מוסיפה 100,000 עובדים למחסנים — עלויות לוגיסטיקה עולות", summary:"הגדלת כוח האדם לקראת עונת החגים עלולה ללחוץ על שולי הרווח של מגזם ה-Retail.", source:"Bloomberg", mins:240},
  {id:11, symbol:"MSFT", sent:"positive", pct:"+2.5%", headline:"Copilot Pro עולה ל-50 מיליון מנויים — Microsoft מובילה AI לארגונים", summary:"מנוי ה-AI הפרימיום מציג קצב גידול חסר תקדים, עם אימוץ חזק בקרב Fortune 500.", source:"Microsoft IR", mins:95},
  {id:12, symbol:"MSFT", sent:"neutral",  pct:"+0.3%", headline:"DOJ בוחן עסקאות ה-AI של Microsoft — OpenAI בלב הדיון", summary:"משרד המשפטים הודיע על בחינה אנטי-טראסט של השקעות Microsoft ב-OpenAI.", source:"Reuters", mins:560},
  {id:13, symbol:"PLTR", sent:"positive", pct:"+6.2%", headline:"Palantir זוכה בחוזה ביטחוני של 480 מיליון $ עם הפנטגון", summary:"חוזה AIP לניתוח שדה קרב בזמן אמת — הגדול בתולדות החברה. הכנסות ממשלתיות צפויות לגדול ב-35%.", source:"Defense News", mins:75},
  {id:14, symbol:"PLTR", sent:"positive", pct:"+3.1%", headline:"Morgan Stanley מעלה יעד מחיר ל-PLTR ל-$145", summary:"הדוח מציין את מעמד Palantir כמנהיג AI Enterprise עם pipeline מסחרי חסר תקדים.", source:"Morgan Stanley", mins:420},
  {id:15, symbol:"AMD",  sent:"negative", pct:"-2.8%", headline:"AMD מאכזבת בתחזית — עיכובי ייצור GPU ב-TSMC", summary:"החברה הורידה תחזיות ה-GPU לרבעון הבא על רקע קשיים בייצור שבבי MI350.", source:"Bloomberg", mins:85},
  {id:16, symbol:"AMD",  sent:"positive", pct:"+1.5%", headline:"AMD חותמת על עסקת AI עם Meta בשווי 1.5 מיליארד $", summary:"Meta תרכוש מאות אלפי מעבדי MI300X במסגרת הסכם רב-שנתי.", source:"FT", mins:320},
  {id:17, symbol:"COIN", sent:"positive", pct:"+4.7%", headline:"Bitcoin שובר $94,000 — Coinbase נהנית מזינוק בנפח המסחר", summary:"נפח המסחר היומי עלה ל-18 מיליארד דולר, הרמה הגבוהה ביותר מאז ינואר 2025.", source:"CoinDesk", mins:50},
  {id:18, symbol:"COIN", sent:"neutral",  pct:"-0.8%", headline:"SEC ממשיכה בחקירת מוצרי ה-Staking של Coinbase", summary:"הסוכנות לא הגיעה לתוצאה, אך ממשיכה לבחון מוצרי ה-staking. עורכי דין הגישו טענות נגד.", source:"Reuters", mins:680},
  {id:19, symbol:"MSTR", sent:"positive", pct:"+5.5%", headline:"MicroStrategy רכשה 15,000 Bitcoin נוספים ב-1.4 מיליארד $", summary:"סה\"כ החזקות Bitcoin של החברה מגיעות ל-530,000 BTC. מניית MSTR מגיבה חיובית.", source:"MSTR IR", mins:110},
  {id:20, symbol:"MSTR", sent:"neutral",  pct:"+0.3%", headline:"S&P 500 בוחן הוספת MicroStrategy למדד — ועדה מתכנסת", summary:"הצטרפות תאפשר לקרנות מדד לרכוש MSTR, מה שיגדיל ביקושים משמעותית.", source:"WSJ", mins:580},
  {id:21, symbol:"SHOP", sent:"positive", pct:"+3.2%", headline:"Shopify AI מעלה המרות ב-28% — מחלקת Enterprise צומחת", summary:"כלי ה-AI להמלצות מוצרים ואופטימיזציית תמחור מציגים שיפור ניכר בשיעורי המרה.", source:"Shopify IR", mins:380},
  {id:22, symbol:"CRWD", sent:"positive", pct:"+2.9%", headline:"CrowdStrike מרחיבה ל-SIEM — Falcon Next-Gen מאיים על Splunk", summary:"המוצר החדש זוכה לאימוץ מ-200 לקוחות Enterprise עם שיפור של 40% בזיהוי איומים.", source:"Security Week", mins:290},
  {id:23, symbol:"CRWD", sent:"negative", pct:"-1.2%", headline:"חקירת הקונגרס על תקרית IT יולי 2024 מתעוררת מחדש", summary:"ועדת הסנאט פתחה מחדש חקירה על כשל עדכון Falcon שגרם לקריסת מיליוני מחשבים.", source:"Politico", mins:510},
  {id:24, symbol:"PANW", sent:"positive", pct:"+2.4%", headline:"Palo Alto Networks מרחיבה Prisma Cloud בשיתוף AWS", summary:"פרטנרשיפ אסטרטגי עם Amazon Web Services מרחיב את הפצת מוצרי האבטחה בענן.", source:"PANW IR", mins:450},
  {id:25, symbol:"SNOW", sent:"neutral",  pct:"-0.4%", headline:"Snowflake מאטה צמיחה — CEO חדש מציג תוכנית AI ל-2026", summary:"הנהגה חדשה מציגה אסטרטגיה ממוקדת AI, אך המשקיעים מחכים לביצועים בפועל.", source:"Bloomberg", mins:620},
  {id:26, symbol:"DDOG", sent:"positive", pct:"+3.6%", headline:"Datadog LLM Observability: 1,000 לקוחות תוך 3 חודשים", summary:"מוצר ניטור ה-AI החדש כובש נתח שוק במהירות שיא, עם ARR של 180 מיליון דולר.", source:"Datadog IR", mins:240},
  {id:27, symbol:"IONQ", sent:"positive", pct:"+8.1%", headline:"IonQ שוברת רקורד — 35 Qubit עם שגיאת שער מתחת ל-0.1%", summary:"הישג חדש בחישוב קוונטי מעמיד את IonQ שנים לפני המתחרים. Google ו-IBM מגיבים.", source:"Nature", mins:160},
  {id:28, symbol:"RKLB", sent:"positive", pct:"+5.3%", headline:"Rocket Lab זוכה בחוזה NASA לשיגור 8 לוויינים ב-2026-2027", summary:"חוזה Electron בשווי 110 מיליון דולר — הגדול ביותר בתולדות החברה.", source:"NASA", mins:220},
  {id:29, symbol:"OKLO", sent:"positive", pct:"+6.7%", headline:"NRC מאשר היתר עקרוני ל-Oklo — תחנת כוח גרעינית מיניאטורית", summary:"הגרעין הרגולטורי העניק אישור לאתר הראשון של Oklo. עלויות אנרגיה נמוכות צפויות.", source:"NRC", mins:85},
  {id:30, symbol:"SMCI", sent:"negative", pct:"-3.8%", headline:"SMCI מעכבת שוב הגשת דוחות כספיים — רגולטורים על הכוננות", summary:"Supermicro בוחנת שינויים בנהלי הנה\"ח לאחר ביקורת ה-SEC. הנהלה מבטיחה שקיפות.", source:"SEC Filing", mins:340},
  {id:31, symbol:"SQ",   sent:"neutral",  pct:"+0.7%", headline:"Block מאחדת Square ו-Cash App תחת מותג אחד — שינוי אסטרטגי", summary:"המהלך נועד ליצור סינרגיה בין מגזרי הפיננסים ולהפחית עלויות שיווק.", source:"Block IR", mins:480},
  {id:32, symbol:"SOFI", sent:"positive", pct:"+2.6%", headline:"SoFi Bank מגיעה ל-10 מיליון חשבונות — צמיחה 34% שנה-על-שנה", summary:"הבנק הדיגיטלי ממשיך להרחיב נתח שוק על חשבון בנקים מסורתיים, עם שיפור ברווחיות.", source:"SoFi IR", mins:195},
  {id:33, symbol:"HOOD", sent:"positive", pct:"+3.9%", headline:"Robinhood Gold מגיעה ל-2.5 מיליון מנויים — הכנסות מנויים +65%", summary:"שיפור ניכר בהכנסות מחוץ לעמלות, עם תכנית Gold שמציגה דביקות גבוהה במיוחד.", source:"Robinhood IR", mins:270},
  {id:34, symbol:"GOOGL",sent:"positive", pct:"+2.3%", headline:"Gemini Ultra מכה GPT-4o בבנצ'מרקים מרכזיים", summary:"מודל ה-AI החדש של Google מציג ביצועים מובילים בקוד, מתמטיקה ומדע.", source:"Google DeepMind", mins:130},
  {id:35, symbol:"GOOGL",sent:"neutral",  pct:"-0.6%", headline:"DOJ ממשיכה להציע פירוק Chrome ו-Android — Google מתנגדת", summary:"הממשלה עדיין בוחנת אמצעי תרופה אנטי-טראסט. הליך משפטי צפוי להמשיך שנים.", source:"Reuters", mins:670},
  {id:36, symbol:"SPY",  sent:"negative", pct:"-1.4%", headline:"חששות ממיתון גוברים — תשואות אג\"ח 2-שנה חוצות 5.1%", summary:"ההיפוך בעקום התשואות מעמיק, עם מדד ISM מתחת ל-48 בחודש השלישי ברציפות.", source:"Bloomberg", mins:45},
  {id:37, symbol:"QQQ",  sent:"positive", pct:"+1.2%", headline:"Nasdaq מוביל עליות — עונת דיווחים חזקה, AI stocks בחזית", summary:"37 מתוך 50 חברות שדיווחו הכו תחזיות. מגזר ה-AI וחצי-מוליכים מוביל.", source:"CNBC", mins:90},
];

// ── GLOSSARY DATA ─────────────────────────────────────────────────────
const GLOSSARY = [
  {
    term:"RSI",
    full:"Relative Strength Index",
    cat:"אינדיקטור",
    color:"#ffd93d",
    short:"מד תנופה 0–100 שמזהה קנייה-יתר או מכירת-יתר",
    body:"RSI מחשב את יחס עליות לירידות ב-14 מחזורים אחרונים. מעל 70 — המניה נחשבת קנויה-יתר (נתון שלילי). מתחת ל-30 — מכורה-יתר (נתון חיובי). הסוחר משתמש בו כדי לתזמן כניסות ויציאות.",
    examples:["RSI מעל 70 → שקול מכירה","RSI מתחת ל-30 → הזדמנות קנייה","RSI 50 → ניטרלי, ממתין לכיוון"],
  },
  {
    term:"MACD",
    full:"Moving Average Convergence Divergence",
    cat:"אינדיקטור",
    color:"#ffd93d",
    short:"מד תנופה שמזהה שינוי מגמה באמצעות שני ממוצעים נעים",
    body:"MACD = EMA12 פחות EMA26. כשה-MACD חוצה את קו ה-Signal כלפי מעלה — סיגנל קנייה. חיתוך כלפי מטה — סיגנל מכירה. ההיסטוגרמה מציגה את עוצמת המגמה.",
    examples:["MACD חוצה Signal למעלה → קנייה","היסטוגרמה גדלה → מגמה מתחזקת","MACD שלילי + Signal שלילי → מגמת ירידה"],
  },
  {
    term:"EMA",
    full:"Exponential Moving Average",
    cat:"ממוצע נע",
    color:"#38bdf8",
    short:"ממוצע נע שנותן משקל גבוה יותר למחירים האחרונים",
    body:"בניגוד ל-SMA (ממוצע פשוט), ה-EMA מגיב מהר יותר לשינויי מחיר. EMA20 משמש לסחר קצר-טווח, EMA50 למגמה בינונית, EMA200 למגמה ארוכה. מחיר מעל EMA — מגמה עולה.",
    examples:["מחיר מעל EMA20 → מגמה עולה קצרת-טווח","EMA20 חוצה EMA50 למעלה → 'Golden Cross'","מחיר נוגע ב-EMA ומקפץ → רמת תמיכה"],
  },
  {
    term:"Stop Loss",
    full:"Stop Loss Order",
    cat:"ניהול סיכון",
    color:"#ff6b6b",
    short:"הוראת מכירה אוטומטית שמגבילה את ההפסד המקסימלי",
    body:"Stop Loss הוא מחיר שנקבע מראש שבו העסקה נסגרת אוטומטית להגנה על ההון. כלל אצבע: Stop Loss ב-1–3% מתחת למחיר הכניסה. לעולם לא להזיז אותו נגד המגמה.",
    examples:["קנייה ב-$100 → Stop Loss ב-$97 (3%)","Stop Loss צמוד לתמיכה טכנית","Stop Trailing — Stop שזז עם הרווח"],
  },
  {
    term:"Position Sizing",
    full:"Position Sizing",
    cat:"ניהול סיכון",
    color:"#ff6b6b",
    short:"חישוב מספר המניות לקנות לפי גודל הסיכון המותר",
    body:"הנוסחה: כמות = (תיק × % סיכון) ÷ (מחיר כניסה − Stop Loss). לדוגמה: תיק $50,000, סיכון 1%, Stop Loss $5 → קנה 100 מניות. Position Sizing מגן מפני הפסד קטסטרופלי.",
    examples:["תיק $50K, סיכון 1% = $500 מקסימום הפסד","מרחק Stop גדול → כמות קטנה יותר","לעולם לא להכפיל פוזיציה מפסידה"],
  },
  {
    term:"R:R",
    full:"Risk to Reward Ratio",
    cat:"ניהול סיכון",
    color:"#ff6b6b",
    short:"יחס בין הסיכון לרווח הפוטנציאלי בעסקה",
    body:"R:R = (יעד − כניסה) ÷ (כניסה − Stop). R:R של 2:1 אומר שעל כל $1 סיכון — $2 תשואה. סוחרים מקצועיים לא פותחים עסקה עם R:R מתחת ל-2:1. R:R 3:1 נחשב מצוין.",
    examples:["כניסה $100, Stop $97, יעד $106 → R:R 2:1","R:R מתחת ל-2:1 → דלג על העסקה","R:R גבוה מפצה על אחוז הצלחה נמוך"],
  },
  {
    term:"Support",
    full:"Support Level",
    cat:"ניתוח טכני",
    color:"#00ff87",
    short:"רמת מחיר שבה הביקוש חזק מספיק לעצור ירידה",
    body:"רמת תמיכה היא 'תקרה של הרצפה' — מחיר שבו בעבר נרשמו הרבה קניות. כשהמחיר מגיע לתמיכה ומקפץ — סיגנל קנייה. אם פורץ מתחת — התמיכה הפכה להתנגדות.",
    examples:["מחיר ניגש לתמיכה 3 פעמים → חזקה","פריצה מתחת תמיכה → אות מכירה","תמיכה = Stop Loss טבעי"],
  },
  {
    term:"Resistance",
    full:"Resistance Level",
    cat:"ניתוח טכני",
    color:"#00ff87",
    short:"רמת מחיר שבה ההיצע חזק מספיק לעצור עלייה",
    body:"התנגדות היא 'תקרה' שבה בעבר נרשמו הרבה מכירות. כשהמחיר פורץ מעל התנגדות בנפח גבוה — סיגנל קנייה חזק. יעד הרווח נקבע לרוב ליד רמת התנגדות הבאה.",
    examples:["פריצת התנגדות בנפח גבוה → סיגנל חיובי חזק","התנגדות = יעד הרווח הטבעי","התנגדות שנפרצת הופכת לתמיכה"],
  },
  {
    term:"Volume",
    full:"Trading Volume",
    cat:"ניתוח טכני",
    color:"#38bdf8",
    short:"מספר המניות שנסחרו בפרק זמן — מאשר את עוצמת המגמה",
    body:"נפח גבוה מאשר תנועת מחיר. עלייה בנפח גבוה = קנייה מוסדית. פריצת התנגדות בנפח נמוך = לא אמינה. נפח נמוך = חוסר אמון בתנועה.",
    examples:["פריצה + נפח גבוה פי 2 → אישור חזק","עלייה בנפח נמוך → חלש, לא לסמוך","Volume Spike → כניסה מוסדית/יציאה"],
  },
  {
    term:"FOMO",
    full:"Fear Of Missing Out",
    cat:"פסיכולוגיה",
    color:"#a78bfa",
    short:"פחד להחמיץ עלייה שדוחף לקנייה אימפולסיבית בלי תכנון",
    body:"FOMO הוא אחד ממחריבי ההון הגדולים בשוק. הסוחר נכנס לעסקה כי 'כולם מרוויחים' — לרוב בנקודה הגרועה ביותר. הסימן: אין סטאפ, אין Stop Loss, הלב רץ. הפתרון: תוכנית עסקה מראש.",
    examples:["מניה עלתה 15% ← FOMO → כניסה בטופ","'כולם מדברים על X' → סימן אזהרה","תוכנית עסקה מראש = תרופה ל-FOMO"],
  },
  {
    term:"Revenge Trading",
    full:"Revenge Trading",
    cat:"פסיכולוגיה",
    color:"#a78bfa",
    short:"כניסה אימפולסיבית לעסקה אחרי הפסד כדי 'להחזיר' את הכסף",
    body:"Revenge Trading הוא ניסיון רגשי לפצות על הפסד בעסקה מיידית. לרוב מסתיים בהפסד כפול. הסימנים: עסקה תוך 10 דקות מהפסד, גודל פוזיציה גדול מהרגיל, אין תכנון.",
    examples:["הפסד → עסקה מיידית → הפסד כפול","Stop לאחר הפסד: 20 דקות הפסקה","Circuit Breaker מגן מפני Revenge Trading"],
  },
  {
    term:"Circuit Breaker",
    full:"Circuit Breaker",
    cat:"ניהול סיכון",
    color:"#ff6b6b",
    short:"מנגנון שנועל את המסחר כשמגיעים להפסד יומי מקסימלי",
    body:"Circuit Breaker הוא כלל ברזל: כשההפסד היומי מגיע ל-X% מהתיק — מפסיקים למסחר לאותו יום. מטרתו למנוע ספירלת הפסדים. ברוקרים מקצועיים מגדירים Circuit Breaker של 2–3% יומי.",
    examples:["Circuit Breaker ב-2% → עצור היום","לאחר Circuit Breaker: בדוק מה קרה","Circuit Breaker = הגנה על ההון שלך"],
  },
  {
    term:"Earnings",
    full:"Earnings Report",
    cat:"פונדמנטלי",
    color:"#fb923c",
    short:"דוח רבעוני שמפרסמת חברה עם הכנסות ורווחים",
    body:"חברות מפרסמות דוח כספי כל רבעון (3 חודשים). הדוח כולל: הכנסות, רווח נקי, תחזית לרבעון הבא. 'Beat' = עקף תחזיות → עלייה. 'Miss' = פספס → ירידה. לעיתים ההפך — 'Buy the rumor, sell the news'.",
    examples:["EPS Beat → מניה עולה 5–10%","Revenue Miss → ירידה חדה","'Sell the news' לאחר עלייה לפני דיווח"],
  },
  {
    term:"Short Squeeze",
    full:"Short Squeeze",
    cat:"תופעות שוק",
    color:"#e879f9",
    short:"עלייה מהירה וחדה שנגרמת ממוכרים בחסר שנאלצים לקנות",
    body:"Short Squeeze קורה כש: (1) הרבה סוחרים מכרו בחסר מניה (שרטו), (2) המחיר עולה — הם מפסידים, (3) הם חייבים לקנות בחזרה כדי לסגור הפסד → זה גורם לעלייה נוספת. GameStop 2021 הוא הדוגמה הקלאסית.",
    examples:["Short Interest מעל 20% → Short Squeeze אפשרי","GME 2021: עלייה של 2,000% ב-2 שבועות","Short Squeeze = הזדמנות, לא להיתפס בצד השני"],
  },
];

const CAT_COLOR={
  "אינדיקטור":"#ffd93d","ממוצע נע":"#38bdf8","ניהול סיכון":"#ff6b6b",
  "ניתוח טכני":"#00ff87","פסיכולוגיה":"#a78bfa","פונדמנטלי":"#fb923c","תופעות שוק":"#e879f9",
};

const SENT_META={
  positive:{label:"חיובי",  color:"#00ff87", bg:"#00ff8718", border:"#00ff8745", icon:"📈"},
  negative:{label:"שלילי",  color:"#ff6b6b", bg:"#ff6b6b18", border:"#ff6b6b45", icon:"📉"},
  neutral: {label:"ניטרלי", color:"#888",    bg:"#1e1e2e",   border:"#2a2a3e",   icon:"➡️"},
};

// ── SHARED COMPONENTS ────────────────────────────────────────────────
function Spark({data,color,w=60,h=22}){
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  return <svg width={w} height={h} style={{display:"block",flexShrink:0}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}
function Badge({sig,sb,sc,sm}){
  return <span style={{background:sb,color:sc,padding:sm?"2px 7px":"4px 10px",borderRadius:20,fontSize:sm?10:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif"}}>{sig}</span>;
}
function ScoreDot({score,size=34}){
  const c=score>=68?"#00ff87":score>=48?"#ffd93d":"#ff6b6b";
  return <div style={{width:size,height:size,borderRadius:"50%",border:`2.5px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:c,fontSize:size<34?10:11,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{score}</span></div>;
}
function Section({title,children,style={}}){
  return <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:16,padding:"16px",marginBottom:12,...style}}>{title&&<div style={{color:"#555",fontSize:13,marginBottom:12,letterSpacing:1}}>{title}</div>}{children}</div>;
}
function StatBox({label,value,color="#fff",sub}){
  return <div style={{background:"#060608",borderRadius:12,padding:"12px",textAlign:"center"}}>
    <div style={{color,fontSize:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
    <div style={{color:"#999",fontSize:13,marginTop:3}}>{label}</div>
    {sub&&<div style={{color:"#888",fontSize:9,marginTop:2}}>{sub}</div>}
  </div>;
}

// ── SCREEN WRAPPER ───────────────────────────────────────────────────
function Screen({title,onBack,accent="#00ff87",children,footer}){
  return <div style={{position:"fixed",inset:0,background:"#060608",zIndex:200,display:"flex",flexDirection:"column",direction:"rtl",fontFamily:"'Heebo',sans-serif"}}>
    <div style={{background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"14px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
      {onBack&&<button className="btn" onClick={onBack} style={{background:"#1a1a2e",border:"none",color:"#888",width:34,height:34,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>}
      <div style={{color:accent,fontSize:18,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{title}</div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"16px 20px",paddingBottom:footer?80:20}}>{children}</div>
    {footer&&<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 20px 24px",background:"linear-gradient(0deg,#060608 60%,transparent)",zIndex:10}}>{footer}</div>}
  </div>;
}
function PrimaryBtn({label,onClick,disabled,color="linear-gradient(135deg,#00ff87,#00cc6a)",textColor="#000"}){
  return <button className="btn" onClick={onClick} disabled={disabled} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:disabled?"#1a1a2e":color,color:disabled?"#444":textColor,fontSize:16,fontWeight:800,fontFamily:"'Heebo',sans-serif",cursor:disabled?"not-allowed":"pointer"}}>{label}</button>;
}

// ══════════════════════════════════════════════════════════════════════
// 1. TRADER PROFILE
// ══════════════════════════════════════════════════════════════════════
function TraderProfile({profile,onSave,onClose}){
  const [p,setP]=useState(profile||{name:"",portfolio:50000,riskPerTrade:1,maxDailyLoss:3,style:"swing",experience:"intermediate",bestHour:"morning"});
  const u=(k,v)=>setP(prev=>({...prev,[k]:v}));
  return <Screen title="👤 פרופיל סוחר" onBack={onClose} accent="#a78bfa" footer={<PrimaryBtn label="שמור פרופיל" onClick={()=>onSave(p)} color="linear-gradient(135deg,#a78bfa,#7c3aed)" textColor="#fff"/>}>
    <Section title="פרטים אישיים">
      <div style={{marginBottom:12}}>
        <div style={{color:"#666",fontSize:12,marginBottom:6}}>שם / כינוי</div>
        <input value={p.name} onChange={e=>u("name",e.target.value)} placeholder="הסוחר שלי..." style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:15,padding:"10px 14px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"}}/>
      </div>
    </Section>
    <Section title="גודל תיק ➜ בסיס לחישוב Position Sizing">
      <div style={{color:"#666",fontSize:12,marginBottom:8}}>גודל תיק ($)</div>
      {[10000,25000,50000,100000,250000].map(v=>(
        <button key={v} className="btn" onClick={()=>u("portfolio",v)} style={{marginLeft:8,marginBottom:8,background:p.portfolio===v?"#a78bfa20":"#060608",border:`1px solid ${p.portfolio===v?"#a78bfa60":"#2a2a3e"}`,borderRadius:10,color:p.portfolio===v?"#a78bfa":"#666",padding:"8px 14px",fontSize:13,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace"}}>
          ${v.toLocaleString()}
        </button>
      ))}
    </Section>
    <Section title="ניהול סיכון">
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{color:"#666",fontSize:13}}>סיכון לעסקה</span>
          <span style={{color:"#a78bfa",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.riskPerTrade}%</span>
        </div>
        <input type="range" min={0.5} max={5} step={0.5} value={p.riskPerTrade} onChange={e=>u("riskPerTrade",parseFloat(e.target.value))} style={{width:"100%",accentColor:"#a78bfa"}}/>
        <div style={{display:"flex",justifyContent:"space-between",color:"#888",fontSize:13,marginTop:4}}><span>0.5% (שמרן)</span><span>5% (אגרסיבי)</span></div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{color:"#666",fontSize:13}}>הפסד יומי מקסימלי</span>
          <span style={{color:"#ff6b6b",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.maxDailyLoss}%</span>
        </div>
        <input type="range" min={1} max={10} step={0.5} value={p.maxDailyLoss} onChange={e=>u("maxDailyLoss",parseFloat(e.target.value))} style={{width:"100%",accentColor:"#ff6b6b"}}/>
        <div style={{display:"flex",justifyContent:"space-between",color:"#888",fontSize:13,marginTop:4}}><span>1% (קפדן)</span><span>10% (גבוה)</span></div>
      </div>
    </Section>
    <Section title="סגנון מסחר">
      {[{v:"swing",l:"Swing Trading",d:"ימים–שבועות"},{v:"daytrading",l:"Day Trading",d:"תוך יומי"},{v:"position",l:"Position Trading",d:"שבועות–חודשים"}].map(({v,l,d})=>(
        <div key={v} className="btn" onClick={()=>u("style",v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:p.style===v?"#a78bfa15":"#060608",border:`1px solid ${p.style===v?"#a78bfa50":"#1a1a2e"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
          <div><div style={{color:p.style===v?"#a78bfa":"#ccc",fontWeight:600,fontSize:14}}>{l}</div><div style={{color:"#999",fontSize:13,marginTop:2}}>{d}</div></div>
          {p.style===v&&<span style={{color:"#a78bfa",fontSize:18}}>✓</span>}
        </div>
      ))}
    </Section>
    <Section title="ניסיון">
      {[{v:"beginner",l:"מתחיל",d:"פחות משנה"},{v:"intermediate",l:"מתקדם",d:"1–3 שנים"},{v:"advanced",l:"מקצועי",d:"3+ שנים"}].map(({v,l,d})=>(
        <div key={v} className="btn" onClick={()=>u("experience",v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:p.experience===v?"#a78bfa15":"#060608",border:`1px solid ${p.experience===v?"#a78bfa50":"#1a1a2e"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
          <div><div style={{color:p.experience===v?"#a78bfa":"#ccc",fontWeight:600,fontSize:14}}>{l}</div><div style={{color:"#999",fontSize:13,marginTop:2}}>{d}</div></div>
          {p.experience===v&&<span style={{color:"#a78bfa",fontSize:18}}>✓</span>}
        </div>
      ))}
    </Section>
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// 2. POSITION SIZING
// ══════════════════════════════════════════════════════════════════════
function PositionSizer({profile,stock,onClose}){
  const [entry,setEntry]=useState(stock?.price||100);
  const [stop,setStop]=useState(stock?.stop||95);
  const [target,setTarget]=useState(stock?.target||115);
  const [sym,setSym]=useState(stock?.symbol||"");
  const port=profile?.portfolio||50000;
  const risk=profile?.riskPerTrade||1;
  const riskAmt=(port*risk/100);
  const stopDist=Math.max(entry-stop,0.01);
  const qty=Math.floor(riskAmt/stopDist);
  const totalCost=qty*entry;
  const potentialLoss=qty*stopDist;
  const potentialGain=qty*(target-entry);
  const rr=((target-entry)/stopDist).toFixed(1);
  const pctOfPort=((totalCost/port)*100).toFixed(1);
  const rrOk=parseFloat(rr)>=2;

  return <Screen title="📐 Position Sizing חכם" onBack={onClose} accent="#ffd93d" footer={<div style={{color:"#555",fontSize:12,textAlign:"center"}}>מבוסס על תיק ${port.toLocaleString()} וסיכון {risk}% לעסקה</div>}>
    <Section title="פרטי עסקה">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        {[{l:"מחיר כניסה ($)",k:"entry",val:entry,set:setEntry},{l:"סטופ לוס ($)",k:"stop",val:stop,set:setStop},{l:"יעד ($)",k:"target",val:target,set:setTarget}].map(({l,val,set})=>(
          <div key={l}>
            <div style={{color:"#555",fontSize:13,marginBottom:5}}>{l}</div>
            <input type="number" value={val} onChange={e=>set(parseFloat(e.target.value)||0)} style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:16,padding:"10px 12px",fontFamily:"'IBM Plex Mono',monospace",outline:"none",textAlign:"center"}}/>
          </div>
        ))}
        <div>
          <div style={{color:"#555",fontSize:13,marginBottom:5}}>סימבול</div>
          <input value={sym} onChange={e=>setSym(e.target.value.toUpperCase())} placeholder="TSLA" style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:16,padding:"10px 12px",fontFamily:"'IBM Plex Mono',monospace",outline:"none",textAlign:"center",direction:"ltr"}}/>
        </div>
      </div>
    </Section>

    {/* Result */}
    <div style={{background:rrOk?"#00ff8712":"#ff6b6b12",border:`2px solid ${rrOk?"#00ff8740":"#ff6b6b40"}`,borderRadius:16,padding:"20px",marginBottom:12,textAlign:"center",animation:"glow 3s infinite"}}>
      <div style={{color:"#555",fontSize:12,marginBottom:6}}>קנה בדיוק</div>
      <div style={{color:"#fff",fontSize:52,fontWeight:800,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{qty}</div>
      <div style={{color:"#666",fontSize:13,marginTop:4}}>מניות {sym||""}</div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      <StatBox label="השקעה כוללת" value={`$${totalCost.toLocaleString()}`} color="#fff" sub={`${pctOfPort}% מהתיק`}/>
      <StatBox label="R:R יחס" value={`${rr}:1`} color={rrOk?"#00ff87":"#ffd93d"} sub={rrOk?"✅ כשיר":"⚠️ נמוך"}/>
      <StatBox label="רווח פוטנציאלי" value={`+$${potentialGain.toFixed(0)}`} color="#00ff87"/>
      <StatBox label="סיכון מקסימלי" value={`-$${potentialLoss.toFixed(0)}`} color="#ff6b6b" sub={`${risk}% מהתיק`}/>
    </div>

    {/* Risk meter */}
    <Section title="מד סיכון">
      {parseFloat(pctOfPort)>20&&<div style={{background:"#ff6b6b15",border:"1px solid #ff6b6b30",borderRadius:10,padding:"10px 14px",marginBottom:10,color:"#ff6b6b",fontSize:13}}>⚠️ פוזיציה גדולה מדי — {pctOfPort}% מהתיק. הנתונים מציגים סיכון מעל 20%.</div>}
      {!rrOk&&<div style={{background:"#ffd93d15",border:"1px solid #ffd93d30",borderRadius:10,padding:"10px 14px",color:"#ffd93d",fontSize:13}}>⚠️ R:R מתחת ל-2:1 — סיכון גבוה ביחס לתשואה.</div>}
      {rrOk&&parseFloat(pctOfPort)<=20&&<div style={{background:"#00ff8715",border:"1px solid #00ff8730",borderRadius:10,padding:"10px 14px",color:"#00ff87",fontSize:13}}>✅ עסקה כשירה — גודל סביר, R:R טוב.</div>}
    </Section>

    {/* Partial exit strategy */}
    <Section title="אסטרטגיית יציאה מומלצת">
      {[
        {pct:"50%",at:`$${((entry+target)/2).toFixed(2)}`,action:"מכור חצי — נעל רווח"},
        {pct:"30%",at:`$${(target*.98).toFixed(2)}`,action:"מכור עוד — העבר סטופ לכניסה"},
        {pct:"20%",at:`$${target}`,action:"מכור הכל — יעד הושג 🎯"},
      ].map(({pct,at,action},i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",color:"#00ff87",fontSize:12,fontWeight:700,flexShrink:0}}>{pct}</div>
          <div><div style={{color:"#ccc",fontSize:13,fontWeight:600}}>{at}</div><div style={{color:"#555",fontSize:13,marginTop:2}}>{action}</div></div>
        </div>
      ))}
    </Section>
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// 3. CIRCUIT BREAKER
// ══════════════════════════════════════════════════════════════════════
function CircuitBreaker({profile,todayPnl,tradeCount,lastTradeTime,locked,onUnlock,onClose}){
  const maxLoss=profile?.portfolio?profile.portfolio*(profile.maxDailyLoss||3)/100:1500;
  const lossAmt=Math.abs(Math.min(0,todayPnl));
  const lossPercent=Math.min(100,(lossAmt/maxLoss)*100);
  const tradeLimit=5;
  const tradePercent=Math.min(100,(tradeCount/tradeLimit)*100);
  const minutesSinceLast=lastTradeTime?Math.floor((Date.now()-lastTradeTime)/60000):999;
  const revengeRisk=minutesSinceLast<10&&todayPnl<0;

  return <Screen title="🛡️ Circuit Breaker" onBack={onClose} accent="#ff6b6b">
    {locked?(
      <div style={{textAlign:"center",padding:"40px 0",animation:"fadeUp .5s ease"}}>
        <div style={{fontSize:64,marginBottom:16,animation:"pulse 2s infinite"}}>🔴</div>
        <div style={{color:"#ff6b6b",fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:8}}>מסחר נעול</div>
        <div style={{color:"#666",fontSize:14,lineHeight:1.7,marginBottom:24}}>הגעת למגבלת ההפסד היומית.<br/>המסחר נעול להגנה על ההון שלך.</div>
        <div style={{background:"#ff6b6b15",border:"1px solid #ff6b6b30",borderRadius:16,padding:"20px",marginBottom:24}}>
          <div style={{color:"#ff6b6b",fontSize:32,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>-${lossAmt.toFixed(0)}</div>
          <div style={{color:"#555",fontSize:12,marginTop:4}}>הפסד היום</div>
        </div>
        <div style={{color:"#555",fontSize:13,marginBottom:20}}>💡 קח הפסקה, בדוק מה קרה, חזור מחר רענן.</div>
        <button className="btn" onClick={onUnlock} style={{background:"#1a1a2e",border:"1px solid #333",borderRadius:12,color:"#888",padding:"12px 24px",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>ביטול ידני (לא מציג נתונים חיוביים)</button>
      </div>
    ):(
      <>
        {revengeRisk&&(
          <div style={{background:"#ff6b6b15",border:"1px solid #ff6b6b40",borderRadius:14,padding:"14px 16px",marginBottom:12,animation:"shake .5s ease"}}>
            <div style={{color:"#ff6b6b",fontWeight:700,fontSize:14,marginBottom:4}}>⚠️ זיהינו Revenge Trading</div>
            <div style={{color:"#888",fontSize:13}}>עסקה אחרונה לפני {minutesSinceLast} דקות + הפסד היום. האם אתה בטוח?</div>
          </div>
        )}

        <Section title="מד הפסד יומי">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{color:"#666",fontSize:13}}>הפסד היום</span>
            <span style={{color:lossPercent>70?"#ff6b6b":lossPercent>40?"#ffd93d":"#00ff87",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>${lossAmt.toFixed(0)} / ${maxLoss.toFixed(0)}</span>
          </div>
          <div style={{height:10,background:"#1a1a2e",borderRadius:5,overflow:"hidden",marginBottom:8}}>
            <div style={{width:`${lossPercent}%`,height:"100%",borderRadius:5,transition:"width .8s ease",background:lossPercent>70?"#ff6b6b":lossPercent>40?"#ffd93d":"#00ff87"}}/>
          </div>
          <div style={{color:"#999",fontSize:13}}>{lossPercent.toFixed(0)}% מהמגבלה היומית ({profile?.maxDailyLoss||3}% מהתיק)</div>
        </Section>

        <Section title="מד עסקאות יום">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{color:"#666",fontSize:13}}>עסקאות היום</span>
            <span style={{color:tradePercent>80?"#ff6b6b":tradePercent>60?"#ffd93d":"#00ff87",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{tradeCount} / {tradeLimit}</span>
          </div>
          <div style={{height:10,background:"#1a1a2e",borderRadius:5,overflow:"hidden",marginBottom:8}}>
            <div style={{width:`${tradePercent}%`,height:"100%",borderRadius:5,transition:"width .8s ease",background:tradePercent>80?"#ff6b6b":tradePercent>60?"#ffd93d":"#00ff87"}}/>
          </div>
          {tradePercent>80&&<div style={{color:"#ff6b6b",fontSize:12}}>⚠️ קרוב למגבלת Overtrading</div>}
        </Section>

        <Section title="הגדרות הגנה">
          {[
            {icon:"🛑",title:"Circuit Breaker",desc:`עסקאות נעולות כשהפסד > ${profile?.maxDailyLoss||3}% ביום`,active:true},
            {icon:"🔄",title:"Revenge Trade Guard",desc:"התראה אחרי הפסד + עסקה תוך 10 דקות",active:true},
            {icon:"📊",title:"Overtrading Alert",desc:`התראה אחרי ${tradeLimit} עסקאות ביום`,active:true},
            {icon:"😤",title:"Emotion Lock",desc:"נעילה כשהמצב המנטלי מדווח כ'מתוח/מפחד'",active:true},
          ].map(({icon,title,desc,active})=>(
            <div key={title} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,padding:"10px 12px",background:"#060608",borderRadius:10}}>
              <span style={{fontSize:20}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{color:"#ccc",fontSize:13,fontWeight:600}}>{title}</div>
                <div style={{color:"#999",fontSize:13,marginTop:2}}>{desc}</div>
              </div>
              <div style={{width:24,height:14,borderRadius:7,background:active?"#00ff87":"#333",position:"relative",flexShrink:0}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:"#fff",position:"absolute",top:2,right:active?2:12,transition:"right .2s"}}/>
              </div>
            </div>
          ))}
        </Section>
      </>
    )}
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// 4. JOURNAL + ANALYTICS
// ══════════════════════════════════════════════════════════════════════
function JournalAnalytics({onClose}){
  const [view,setView]=useState("stats"); // stats | trades | add
  const [trades,setTrades]=useState([]);
  const [tradesLoading,setTradesLoading]=useState(true);
  const [newTrade,setNewTrade]=useState({symbol:"",entry:"",exit:"",stop:"",qty:"",setup:"RSI Bounce",emotion:"focused",followedPlan:true,notes:""});
  useEffect(()=>{apiCall('/api/trades').then(r=>r.json()).then(d=>{setTrades((Array.isArray(d)?d:[]).map(normalizeTrade));setTradesLoading(false);}).catch(()=>setTradesLoading(false));},[]);

  const wins=trades.filter(t=>t.result==="win");
  const losses=trades.filter(t=>t.result==="loss");
  const winRate=Math.round((wins.length/Math.max(trades.length,1))*100);
  const totalPnl=trades.reduce((a,t)=>a+t.pnl,0);
  const avgWin=wins.length?Math.round(wins.reduce((a,t)=>a+t.pnl,0)/wins.length):0;
  const avgLoss=losses.length?Math.round(losses.reduce((a,t)=>a+Math.abs(t.pnl),0)/losses.length):0;
  const planFollowed=trades.filter(t=>t.followedPlan);
  const planWinRate=Math.round((planFollowed.filter(t=>t.result==="win").length/Math.max(planFollowed.length,1))*100);
  const noplanTrades=trades.filter(t=>!t.followedPlan);
  const noplanWinRate=Math.round((noplanTrades.filter(t=>t.result==="win").length/Math.max(noplanTrades.length,1))*100);

  // Best setup
  const setups={};
  trades.forEach(t=>{if(!setups[t.setup])setups[t.setup]={wins:0,total:0};setups[t.setup].total++;if(t.result==="win")setups[t.setup].wins++;});
  const bestSetup=Object.entries(setups).sort((a,b)=>(b[1].wins/b[1].total)-(a[1].wins/a[1].total))[0];

  // Day performance
  const days={};
  trades.forEach(t=>{if(!days[t.day])days[t.day]={wins:0,total:0};days[t.day].total++;if(t.result==="win")days[t.day].wins++;});

  return <Screen title="📋 יומן ואנליטיקס" onBack={onClose} accent="#ffd93d">
    {/* Tab switcher */}
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[{id:"stats",l:"📊 סטטיסטיקות"},{id:"trades",l:"📝 עסקאות"},{id:"add",l:"➕ הוסף"}].map(t=>(
        <button key={t.id} className="btn" onClick={()=>setView(t.id)} style={{flex:1,background:view===t.id?"#ffd93d20":"#0d0d18",border:`1px solid ${view===t.id?"#ffd93d50":"#1a1a2e"}`,borderRadius:10,color:view===t.id?"#ffd93d":"#555",padding:"8px 4px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:view===t.id?700:400}}>
          {t.l}
        </button>
      ))}
    </div>

    {view==="stats"&&(
      <>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <StatBox label="אחוז הצלחה" value={`${winRate}%`} color={winRate>=55?"#00ff87":"#ffd93d"}/>
          <StatBox label="רווח/הפסד כולל" value={`${totalPnl>=0?"+":""}$${totalPnl}`} color={totalPnl>=0?"#00ff87":"#ff6b6b"}/>
          <StatBox label="ממוצע רווח" value={`+$${avgWin}`} color="#00ff87"/>
          <StatBox label="ממוצע הפסד" value={`-$${avgLoss}`} color="#ff6b6b"/>
        </div>

        {/* Plan vs No Plan — the KEY insight */}
        <Section title="🔑 תובנה קריטית — עמידה בתוכנית">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"#00ff8712",border:"1px solid #00ff8730",borderRadius:12,padding:"14px",textAlign:"center"}}>
              <div style={{color:"#00ff87",fontSize:28,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{planWinRate}%</div>
              <div style={{color:"#555",fontSize:13,marginTop:4}}>כשעקבתי לתוכנית</div>
            </div>
            <div style={{background:"#ff6b6b12",border:"1px solid #ff6b6b30",borderRadius:12,padding:"14px",textAlign:"center"}}>
              <div style={{color:"#ff6b6b",fontSize:28,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{noplanWinRate}%</div>
              <div style={{color:"#555",fontSize:13,marginTop:4}}>כשסטיתי מהתוכנית</div>
            </div>
          </div>
          <div style={{color:"#555",fontSize:12,marginTop:10,textAlign:"center",lineHeight:1.6}}>
            עקיבה לתוכנית משפרת את הצלחתך ב-{planWinRate-noplanWinRate}%
          </div>
        </Section>

        {/* Best setup */}
        {bestSetup&&(
          <Section title="🏆 הסטאפ הכי רווחי שלך">
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:50,height:50,borderRadius:14,background:"#00ff8720",border:"1px solid #00ff8740",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🎯</div>
              <div>
                <div style={{color:"#00ff87",fontSize:18,fontWeight:700}}>{bestSetup[0]}</div>
                <div style={{color:"#666",fontSize:12,marginTop:2}}>{Math.round((bestSetup[1].wins/bestSetup[1].total)*100)}% הצלחה · {bestSetup[1].total} עסקאות</div>
              </div>
            </div>
          </Section>
        )}

        {/* Day performance */}
        <Section title="📅 ביצועים לפי יום">
          {Object.entries(days).map(([day,d])=>{
            const wr=Math.round((d.wins/d.total)*100);
            return(
              <div key={day} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:48,color:"#888",fontSize:12,flexShrink:0}}>{day}</div>
                <div style={{flex:1,height:6,background:"#1a1a2e",borderRadius:3}}>
                  <div style={{width:`${wr}%`,height:"100%",borderRadius:3,background:wr>=60?"#00ff87":wr>=40?"#ffd93d":"#ff6b6b",transition:"width .8s ease"}}/>
                </div>
                <div style={{color:wr>=60?"#00ff87":wr>=40?"#ffd93d":"#ff6b6b",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",width:36,textAlign:"right"}}>{wr}%</div>
              </div>
            );
          })}
        </Section>
      </>
    )}

    {view==="trades"&&(
      <div>
        {trades.map((t,i)=>(
          <div key={t.id} style={{background:"#0d0d18",border:`1px solid ${t.result==="win"?"#00ff8725":"#ff6b6b25"}`,borderRadius:14,padding:"14px",marginBottom:10,borderRight:`3px solid ${t.result==="win"?"#00ff87":"#ff6b6b"}`,animation:`fadeUp .3s ease ${i*.05}s both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:16,fontFamily:"'IBM Plex Mono',monospace"}}>{t.symbol}</span>
                  <span style={{background:t.result==="win"?"#00ff8720":"#ff6b6b20",color:t.result==="win"?"#00ff87":"#ff6b6b",fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{t.result==="win"?"רווח":"הפסד"}</span>
                  {!t.followedPlan&&<span style={{background:"#ffd93d20",color:"#ffd93d",fontSize:13,padding:"2px 7px",borderRadius:20}}>סטה מתוכנית</span>}
                </div>
                <div style={{color:"#999",fontSize:13,marginTop:3}}>{t.date} · {t.day} · {t.hour}</div>
              </div>
              <div style={{color:t.pnl>=0?"#00ff87":"#ff6b6b",fontSize:17,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{t.pnl>=0?"+":""}${t.pnl}</div>
            </div>
            <div style={{display:"flex",gap:16,color:"#555",fontSize:13}}>
              <span>כניסה ${t.entry}</span><span>יציאה ${t.exit}</span><span>כמות {t.qty}</span><span>{t.setup}</span>
            </div>
            {t.notes&&<div style={{color:"#666",fontSize:12,marginTop:8,fontStyle:"italic"}}>"{t.notes}"</div>}
          </div>
        ))}
      </div>
    )}

    {view==="add"&&(
      <div>
        <Section title="עסקה חדשה">
          {[{l:"סימבול",k:"symbol",pl:"TSLA"},{l:"מחיר כניסה",k:"entry",pl:"245"},{l:"מחיר יציאה",k:"exit",pl:"278"},{l:"סטופ",k:"stop",pl:"232"},{l:"כמות",k:"qty",pl:"10"}].map(({l,k,pl})=>(
            <div key={k} style={{marginBottom:12}}>
              <div style={{color:"#666",fontSize:12,marginBottom:5}}>{l}</div>
              <input value={newTrade[k]} onChange={e=>setNewTrade(p=>({...p,[k]:e.target.value}))} placeholder={pl} style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:15,padding:"10px 14px",fontFamily:"'IBM Plex Mono',monospace",outline:"none",textAlign:"right",direction:"ltr"}}/>
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <div style={{color:"#666",fontSize:12,marginBottom:8}}>סטאפ</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["RSI Bounce","EMA Break","Volume Break","Breakout"].map(s=>(
                <button key={s} className="btn" onClick={()=>setNewTrade(p=>({...p,setup:s}))} style={{background:newTrade.setup===s?"#ffd93d20":"#060608",border:`1px solid ${newTrade.setup===s?"#ffd93d50":"#1a1a2e"}`,borderRadius:10,color:newTrade.setup===s?"#ffd93d":"#666",padding:"7px 12px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{color:"#666",fontSize:12,marginBottom:8}}>מצב רגשי</div>
            <div style={{display:"flex",gap:8}}>
              {[{v:"focused",e:"🔥"},{v:"neutral",e:"😐"},{v:"stress",e:"😤"},{v:"fear",e:"😨"},{v:"greed",e:"🤑"}].map(({v,e})=>(
                <button key={v} className="btn" onClick={()=>setNewTrade(p=>({...p,emotion:v}))} style={{flex:1,background:newTrade.emotion===v?"#ffd93d20":"#060608",border:`1px solid ${newTrade.emotion===v?"#ffd93d50":"#1a1a2e"}`,borderRadius:10,padding:"8px 4px",fontSize:18,cursor:"pointer"}}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10,background:"#060608",border:"1px solid #1a1a2e",borderRadius:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>setNewTrade(p=>({...p,followedPlan:!p.followedPlan}))}>
              <div style={{width:22,height:22,borderRadius:7,background:newTrade.followedPlan?"#00ff87":"#1a1a2e",border:`2px solid ${newTrade.followedPlan?"#00ff87":"#333"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {newTrade.followedPlan&&<span style={{fontSize:13,color:"#000",fontWeight:900}}>✓</span>}
              </div>
              <span style={{color:"#ccc",fontSize:14}}>עקבתי לתוכנית העסקה</span>
            </div>
          </div>
          <textarea value={newTrade.notes} onChange={e=>setNewTrade(p=>({...p,notes:e.target.value}))} placeholder="הערות על העסקה..." style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:13,padding:"12px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl",resize:"none",minHeight:70,marginBottom:16}}/>
          <PrimaryBtn label="שמור עסקה ✓" onClick={async()=>{
            if(!newTrade.symbol||!newTrade.entry)return;
            const pnl=((parseFloat(newTrade.exit)||0)-(parseFloat(newTrade.entry)||0))*(parseFloat(newTrade.qty)||0);
            const body={symbol:newTrade.symbol.toUpperCase(),entry:parseFloat(newTrade.entry),exit:parseFloat(newTrade.exit)||null,stop:parseFloat(newTrade.stop)||null,qty:parseFloat(newTrade.qty)||1,date:new Date().toISOString().split('T')[0],setup:newTrade.setup,emotion:newTrade.emotion,followed_plan:newTrade.followedPlan,notes:newTrade.notes,pnl:parseFloat(pnl.toFixed(2)),result:pnl>=0?'win':'loss'};
            try{const r=await apiCall('/api/trades',{method:'POST',body:JSON.stringify(body)});const d=await r.json();if(d.id){setTrades(p=>[normalizeTrade(d),...p]);setNewTrade({symbol:'',entry:'',exit:'',stop:'',qty:'',setup:'RSI Bounce',emotion:'focused',followedPlan:true,notes:''});setView('trades');}}catch{}
          }} color="linear-gradient(135deg,#ffd93d,#ffaa00)" textColor="#000"/>
        </Section>
      </div>
    )}
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// 5. OPEN POSITIONS
// ══════════════════════════════════════════════════════════════════════
function OpenPositions({profile,onClose}){
  const [positions,setPositions]=useState([]);
  const [posLoading,setPosLoading]=useState(true);
  const [adding,setAdding]=useState(false);
  const [np,setNp]=useState({symbol:"",entry:"",stop:"",target:"",qty:""});

  useEffect(()=>{
    apiCall('/api/positions').then(r=>r.json()).then(d=>{
      setPositions(Array.isArray(d)?d.map(p=>({...p,entry:parseFloat(p.entry)||0,current:parseFloat(p.current||p.entry)||0,stop:parseFloat(p.stop)||0,target:parseFloat(p.target)||0,qty:parseFloat(p.qty)||0})):[]);
      setPosLoading(false);
    }).catch(()=>setPosLoading(false));
  },[]);

  const addPosition=async()=>{
    if(!np.symbol||!np.entry)return;
    const body={symbol:np.symbol.toUpperCase(),entry:parseFloat(np.entry),stop:parseFloat(np.stop)||null,target:parseFloat(np.target)||null,qty:parseFloat(np.qty)||1,current:parseFloat(np.entry)};
    try{const r=await apiCall('/api/positions',{method:'POST',body:JSON.stringify(body)});const d=await r.json();if(d.id){setPositions(p=>[...p,{...d,entry:parseFloat(d.entry)||0,current:parseFloat(d.current||d.entry)||0,stop:parseFloat(d.stop)||0,target:parseFloat(d.target)||0,qty:parseFloat(d.qty)||0}]);setNp({symbol:'',entry:'',stop:'',target:'',qty:''});setAdding(false);}}catch{}
  };

  const deletePosition=async(id)=>{
    try{await apiCall(`/api/positions/${id}`,{method:'DELETE'});setPositions(p=>p.filter(x=>x.id!==id));}catch{}
  };

  const totalPnl=positions.reduce((a,p)=>{const pnl=(p.current-p.entry)*p.qty;return a+pnl;},0);

  return <Screen title="📈 פוזיציות פתוחות" onBack={onClose} accent="#00ff87"
    footer={<button className="btn" onClick={()=>setAdding(!adding)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid #00ff8740",background:"#00ff8712",color:"#00ff87",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>{adding?"ביטול":"+ הוסף פוזיציה"}</button>}>

    {/* Summary */}
    <Section>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <StatBox label="פוזיציות" value={positions.length} color="#fff"/>
        <StatBox label="P&L כולל" value={`${totalPnl>=0?"+":""}$${totalPnl.toFixed(0)}`} color={totalPnl>=0?"#00ff87":"#ff6b6b"}/>
        <StatBox label="תיק בסיכון" value={`${((positions.reduce((a,p)=>a+(p.entry-p.stop)*p.qty,0)/(profile?.portfolio||50000))*100).toFixed(1)}%`} color="#ffd93d"/>
      </div>
    </Section>

    {adding&&(
      <Section title="פוזיציה חדשה">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          {[{l:"סימבול",k:"symbol",pl:"TSLA"},{l:"כניסה $",k:"entry",pl:"245"},{l:"סטופ $",k:"stop",pl:"232"},{l:"יעד $",k:"target",pl:"285"},{l:"כמות",k:"qty",pl:"10"}].map(({l,k,pl})=>(
            <div key={k}>
              <div style={{color:"#555",fontSize:13,marginBottom:5}}>{l}</div>
              <input value={np[k]} onChange={e=>setNp(p=>({...p,[k]:e.target.value}))} placeholder={pl} style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:15,padding:"9px 12px",fontFamily:"'IBM Plex Mono',monospace",outline:"none",textAlign:"center"}}/>
            </div>
          ))}
        </div>
        <PrimaryBtn label="שמור פוזיציה" onClick={addPosition}/>
      </Section>
    )}

    {positions.map((pos,i)=>{
      const pnl=(pos.current-pos.entry)*pos.qty;
      const pnlPct=((pos.current-pos.entry)/pos.entry*100);
      const toTarget=((pos.target-pos.current)/(pos.target-pos.entry)*100);
      const toStop=((pos.current-pos.stop)/(pos.entry-pos.stop)*100);
      const atRisk=pos.current<=pos.stop*1.02;
      const nearTarget=pos.current>=pos.target*.92;
      return(
        <div key={pos.id} style={{background:"#0d0d18",border:`1px solid ${atRisk?"#ff6b6b40":nearTarget?"#00ff8740":"#1a1a2e"}`,borderRadius:16,padding:"16px",marginBottom:10,animation:`fadeUp .3s ease ${i*.08}s both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#fff",fontSize:18,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{pos.symbol}</span>
                {atRisk&&<span style={{background:"#ff6b6b20",color:"#ff6b6b",fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"pulse 1.5s infinite"}}>⚠️ קרוב לסטופ</span>}
                {nearTarget&&<span style={{background:"#00ff8720",color:"#00ff87",fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"pulse 1.5s infinite"}}>🎯 קרוב ליעד</span>}
              </div>
              <div style={{color:"#999",fontSize:13,marginTop:2}}>{pos.qty} מניות · כניסה ${pos.entry} · {pos.date}</div>
            </div>
            <div style={{textAlign:"left",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <div style={{color:pnl>=0?"#00ff87":"#ff6b6b",fontSize:18,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{pnl>=0?"+":""}${pnl.toFixed(0)}</div>
              <div style={{color:pnl>=0?"#00ff87":"#ff6b6b",fontSize:12}}>{pnlPct>=0?"+":""}{pnlPct.toFixed(2)}%</div>
              <button onClick={()=>deletePosition(pos.id)} style={{background:"#ff6b6b15",border:"1px solid #ff6b6b30",borderRadius:6,color:"#ff6b6b",fontSize:11,padding:"3px 8px",cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>מחק</button>
            </div>
          </div>

          {/* Progress bars */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#999",marginBottom:5}}>
              <span>סטופ ${pos.stop}</span><span>כניסה ${pos.entry}</span><span>יעד ${pos.target}</span>
            </div>
            <div style={{height:6,background:"#1a1a2e",borderRadius:3,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,borderRadius:3,width:`${Math.max(0,Math.min(100,((pos.current-pos.stop)/(pos.target-pos.stop))*100))}%`,background:`linear-gradient(90deg,#ff6b6b,#ffd93d,#00ff87)`,transition:"width .8s ease"}}/>
              <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:`${Math.max(0,Math.min(97,((pos.current-pos.stop)/(pos.target-pos.stop))*100))}%`,width:10,height:10,borderRadius:"50%",background:"#fff",border:"2px solid #000"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888",marginTop:4}}>
              <span>כניסה ל-יעד: {Math.max(0,100-toTarget).toFixed(0)}%</span>
              <span>מחיר: ${pos.current}</span>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"לסטופ",v:`${toStop.toFixed(0)}%`,c:"#ff6b6b"},{l:"ליעד",v:`${Math.max(0,100-toTarget).toFixed(0)}%`,c:"#00ff87"},{l:"R:R נוכחי",v:`${Math.max(0,((pos.target-pos.current)/(pos.current-pos.stop))).toFixed(1)}:1`,c:"#ffd93d"}].map(({l,v,c})=>(
              <div key={l} style={{background:"#060608",borderRadius:10,padding:"8px",textAlign:"center"}}>
                <div style={{color:c,fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
                <div style={{color:"#888",fontSize:13,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// SCANNER (compact)
// ══════════════════════════════════════════════════════════════════════
// Beginner tooltips for key terms
const BEGINNER_TIPS={
  RSI:"RSI מעל 70 = קנוי יתר (נתון שלילי). מתחת ל-30 = מכור יתר (נתון חיובי).",
  שינוי:"שינוי האחוז של המניה ביום המסחר הנוכחי.",
  ציון:"ציון כולל מ-0 עד 100 — מחשב טכני + פונדמנטלי + סנטימנט.",
  "R:R":"יחס תגמול/סיכון. R:R של 2 = על כל $1 סיכון יש פוטנציאל של $2 רווח.",
  טכני:"ניתוח גרפים ואינדיקטורים (RSI, EMA, MACD).",
  פונדמנטלי:"ניתוח נתוני החברה: הכנסות, רווחים, צמיחה.",
  סנטימנט:"מה השוק 'מרגיש' — חדשות, ציוצים, סנטימנט ציבורי.",
};

function BeginnerTip({text}){
  return(
    <div style={{background:"#ffd93d10",border:"1px solid #ffd93d25",borderRadius:8,padding:"6px 10px",fontSize:13,color:"#ffd93d",marginBottom:8,display:"flex",gap:6,alignItems:"flex-start"}}>
      <span style={{flexShrink:0}}>💡</span><span>{text}</span>
    </div>
  );
}

function Scanner({experience="intermediate",searchQuery="",onAnalyze}){
  const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState("הכל");
  const [sort,setSort]=useState("score");
  const [watchlist,setWatchlist]=useState(new Set());
  useEffect(()=>{apiCall('/api/watchlist').then(r=>r.json()).then(d=>{if(Array.isArray(d))setWatchlist(new Set(d.map(w=>w.symbol)));}).catch(()=>{});},[]);
  const toggleWatch=async(sym,e)=>{e.stopPropagation();if(watchlist.has(sym)){await apiCall(`/api/watchlist/${sym}`,{method:'DELETE'}).catch(()=>{});setWatchlist(p=>{const n=new Set(p);n.delete(sym);return n;});}else{await apiCall('/api/watchlist',{method:'POST',body:JSON.stringify({symbol:sym})}).catch(()=>{});setWatchlist(p=>new Set([...p,sym]));}};
  const isBegin=experience==="beginner";
  const isPro=experience==="professional";
  const q=searchQuery.trim().toUpperCase();
  const filtered=ALL_STOCKS
    .filter(s=>q?(s.symbol.includes(q)||s.name.toUpperCase().includes(q)):(filter==="הכל"||s.sig===filter))
    .sort((a,b)=>sort==="score"?b.total-a.total:sort==="change"?b.change-a.change:a.rsi-b.rsi);
  return(
    <>
      {isBegin&&<div style={{padding:"8px 20px 0"}}><BeginnerTip text="לחץ על מניה לפרטים. ה'ציון' מסכם את כל הניתוחים — מעל 70 זו נתונים חיוביים פוטנציאליים."/></div>}
      <div style={{padding:"10px 20px 0",overflowX:"auto",display:"flex",gap:8,paddingBottom:4,flexShrink:0}}>
        {["הכל","סיגנל חיובי חזק","סיגנל חיובי","המתנה","סיגנל שלילי"].map(f=>(
          <button key={f} className="btn" onClick={()=>setFilter(f)} style={{background:filter===f?"#00ff8720":"#0d0d18",border:`1px solid ${filter===f?"#00ff8760":"#1a1a2e"}`,borderRadius:20,color:filter===f?"#00ff87":"#555",padding:"6px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif"}}>{f}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 52px 58px 130px 52px",gap:6,padding:"10px 20px 6px",color:"#888",fontSize:13,letterSpacing:.5,flexShrink:0}}>
        <div>מניה</div><div style={{textAlign:"center"}}>RSI</div><div style={{textAlign:"right"}}>שינוי</div><div style={{textAlign:"center"}}>גרף</div><div style={{textAlign:"center"}}>ציון</div>
      </div>
      {q&&filtered.length===1&&onAnalyze&&(
        <div style={{margin:"6px 12px 0",display:"flex",justifyContent:"flex-end"}}>
          <button onClick={()=>onAnalyze(filtered[0].symbol)} style={{background:"#a78bfa20",border:"1px solid #a78bfa40",borderRadius:10,color:"#a78bfa",fontSize:13,padding:"7px 14px",cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700}}>ניתוח מלא 🔍</button>
        </div>
      )}
      <div style={{padding:"0 12px 20px"}}>
        {filtered.map((s,i)=>(
          <div key={s.symbol}>
            <div className="row" onClick={()=>setSel(s===sel?null:s)} style={{display:"grid",gridTemplateColumns:"1fr 52px 58px 130px 52px",gap:6,padding:"10px 8px",borderRadius:12,background:sel?.symbol===s.symbol?"#111120":"transparent",marginBottom:2,alignItems:"center",animation:`fadeUp .3s ease ${i*.02}s both`,cursor:"pointer"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <button onClick={e=>toggleWatch(s.symbol,e)} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",padding:"0 1px",color:watchlist.has(s.symbol)?"#ffd93d":"#2a2a3e",lineHeight:1,flexShrink:0}}>{watchlist.has(s.symbol)?"⭐":"☆"}</button>
                  <span style={{color:"#fff",fontWeight:700,fontSize:14,fontFamily:"'IBM Plex Mono',monospace"}}>{s.symbol}</span>
                  <Badge sig={s.sig} sb={s.sb} sc={s.sc} sm/>
                </div>
                <div style={{color:"#fff",fontSize:13,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>${s.price}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:s.rsi<30?"#00ff87":s.rsi>70?"#ff6b6b":"#ffd93d",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.rsi}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <span style={{color:s.change>=0?"#00ff87":"#ff6b6b",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.change>=0?"+":""}{s.change}%</span>
              </div>
              <div style={{overflow:"hidden",borderRadius:6,height:100}}>
                <TVChart symbol={s.symbol}/>
              </div>
              <div style={{display:"flex",justifyContent:"center"}}><ScoreDot score={s.total}/></div>
            </div>
            {sel?.symbol===s.symbol&&(
              <div style={{marginBottom:8,borderRadius:12,overflow:"hidden",border:"1px solid #1a1a2e",background:"#0a0a12",animation:"fadeUp .2s ease"}}>
                <TVChart symbol={s.symbol}/>
                <div style={{padding:"10px 14px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,borderTop:"1px solid #1a1a2e"}}>
                  {[{l:"מחיר",v:`$${s.price}`,c:"#fff"},{l:"RSI",v:s.rsi,c:s.rsi<30?"#00ff87":s.rsi>70?"#ff6b6b":"#ffd93d"},{l:"יעד",v:`$${s.target}`,c:"#00ff87"},{l:"סטופ",v:`$${s.stop}`,c:"#ff6b6b"}].map(({l,v,c})=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{color:"#555",fontSize:11,marginBottom:3,fontFamily:"'Heebo',sans-serif"}}>{l}</div>
                      <div style={{color:c,fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
                    </div>
                  ))}
                </div>
                {onAnalyze&&(
                  <div style={{padding:"0 14px 10px",display:"flex",justifyContent:"flex-end"}}>
                    <button onClick={()=>onAnalyze(s.symbol)} style={{background:"#a78bfa20",border:"1px solid #a78bfa40",borderRadius:8,color:"#a78bfa",fontSize:13,padding:"6px 14px",cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700}}>ניתוח מלא 🔍</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
// AI COACH
// ══════════════════════════════════════════════════════════════════════
function AICoach({profile,onClose}){
  const [msgs,setMsgs]=useState([{r:"ai",t:`שלום ${profile?.name||"סוחר"}! אני ה-סיכום נתונים AI שלך. שאל אותי כל שאלה על מסחר, ניתוח, או מנטליות.`}]);
  const [inp,setInp]=useState("");const [load,setLoad]=useState(false);const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=async()=>{
    if(!inp.trim()||load)return;
    const q=inp.trim();setInp("");setLoad(true);
    setMsgs(p=>[...p,{r:"user",t:q}]);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`אתה EdgeMind AI — מאמן מסחר מקצועי בעברית פשוטה ומקצועית. סגנון: סווינג טריידינג. תיק: $${profile?.portfolio||50000}. סיכון לעסקה: ${profile?.riskPerTrade||1}%. כשיש FOMO/Revenge — התמקד במנטל קודם. תשובות קצרות ומדויקות עד 100 מילים. אל תיתן המלצות השקעה.`,messages:[...msgs.filter((_,i)=>i>0).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t})),{role:"user",content:q}]})});
      const d=await res.json();
      setMsgs(p=>[...p,{r:"ai",t:d.content?.[0]?.text||"סליחה, נסה שנית."}]);
    }catch{setMsgs(p=>[...p,{r:"ai",t:"שגיאת חיבור."}]);}
    setLoad(false);
  };
  return <Screen title="🤖 סיכום נתונים AI" onBack={onClose} accent="#a78bfa">
    <div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:80}}>
      {msgs.map((m,i)=>(
        <div key={i} style={{display:"flex",justifyContent:m.r==="user"?"flex-start":"flex-end",animation:"fadeUp .3s ease"}}>
          <div style={{maxWidth:"82%",padding:"12px 14px",borderRadius:14,background:m.r==="user"?"#0d0d18":"#1a1040",border:`1px solid ${m.r==="user"?"#1a1a2e":"#a78bfa30"}`,color:"#ddd",fontSize:14,lineHeight:1.6}}>{m.t}</div>
        </div>
      ))}
      {load&&<div style={{display:"flex",justifyContent:"flex-end"}}><div style={{background:"#1a1040",border:"1px solid #a78bfa30",borderRadius:14,padding:"12px 14px",color:"#a78bfa",fontSize:14,animation:"pulse 1s infinite"}}>חושב...</div></div>}
      <div ref={ref}/>
    </div>
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#060608",borderTop:"1px solid #1a1a2e",padding:"10px 20px 24px"}}>
      <div style={{display:"flex",gap:8,marginBottom:8,overflowX:"auto"}}>
        {["מה RSI אומר?","איך מגדיר סטופ?","יש לי FOMO","Position Sizing"].map(q=>(
          <button key={q} className="btn" onClick={()=>setInp(q)} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:20,color:"#666",fontSize:13,padding:"5px 12px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif"}}>{q}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="שאל את סיכום נתונים AI..." style={{flex:1,background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,color:"#fff",fontSize:14,padding:"12px 14px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"}}/>
        <button className="btn" onClick={send} style={{width:46,height:46,background:"linear-gradient(135deg,#a78bfa,#7c3aed)",border:"none",borderRadius:12,color:"#fff",fontSize:20,cursor:"pointer",flexShrink:0}}>↑</button>
      </div>
    </div>
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// GLOSSARY
// ══════════════════════════════════════════════════════════════════════
function GlossaryScreen({onClose}){
  const [search,setSearch]=useState("");
  const [open,setOpen]=useState(null);
  const [catFilter,setCatFilter]=useState("הכל");

  const cats=["הכל",...Array.from(new Set(GLOSSARY.map(g=>g.cat)))];
  const filtered=GLOSSARY
    .filter(g=>catFilter==="הכל"||g.cat===catFilter)
    .filter(g=>!search||g.term.toLowerCase().includes(search.toLowerCase())||g.short.includes(search)||g.full.toLowerCase().includes(search.toLowerCase()));

  return(
    <Screen title="📖 מילון מושגים" onBack={onClose} accent="#a78bfa">

      {/* search */}
      <div style={{position:"relative",marginBottom:12}}>
        <input
          value={search} onChange={e=>{setSearch(e.target.value);setOpen(null);}}
          placeholder="חפש מושג..."
          style={{width:"100%",background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,color:"#fff",fontSize:14,padding:"11px 14px 11px 38px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"}}
        />
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#999",fontSize:15,pointerEvents:"none"}}>🔍</span>
      </div>

      {/* category pills */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
        {cats.map(c=>{
          const cc=CAT_COLOR[c]||"#a78bfa";
          const active=catFilter===c;
          return(
            <button key={c} className="btn" onClick={()=>{setCatFilter(c);setOpen(null);}} style={{background:active?cc+"22":"#0d0d18",border:`1px solid ${active?cc+"55":"#1a1a2e"}`,borderRadius:20,color:active?cc:"#555",padding:"4px 13px",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif",fontWeight:active?700:400}}>
              {c}
            </button>
          );
        })}
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:"#999",fontSize:14}}>לא נמצא מושג</div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map((g,i)=>{
          const cc=CAT_COLOR[g.cat]||"#a78bfa";
          const isOpen=open===g.term;
          return(
            <div key={g.term} onClick={()=>setOpen(isOpen?null:g.term)}
              style={{background:"#0d0d18",border:`1px solid ${isOpen?cc+"50":"#1a1a2e"}`,borderRight:`3px solid ${cc}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",animation:`fadeUp .22s ease ${i*.03}s both`,transition:"border-color .15s"}}>

              {/* header row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isOpen?10:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:"#fff",fontWeight:800,fontSize:17,fontFamily:"'IBM Plex Mono',monospace"}}>{g.term}</span>
                  <span style={{background:cc+"22",color:cc,fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,border:`1px solid ${cc+"44"}`,flexShrink:0}}>{g.cat}</span>
                </div>
                <span style={{color:"#888",fontSize:13,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
              </div>

              {/* short description always visible */}
              <div style={{color:"#888",fontSize:12,marginTop:isOpen?0:6,lineHeight:1.5}}>{g.short}</div>

              {/* expanded */}
              {isOpen&&(
                <div style={{animation:"fadeUp .2s ease"}}>
                  {g.full&&g.full!==g.term&&(
                    <div style={{color:"#999",fontSize:13,marginBottom:10,fontFamily:"'IBM Plex Mono',monospace"}}>{g.full}</div>
                  )}
                  <div style={{color:"#ccc",fontSize:13,lineHeight:1.8,marginBottom:12,borderTop:"1px solid #1a1a2e",paddingTop:10}}>{g.body}</div>
                  {g.examples&&(
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {g.examples.map((ex,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"flex-start",gap:8,background:"#060608",borderRadius:10,padding:"8px 12px"}}>
                          <span style={{color:cc,fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                          <span style={{color:"#aaa",fontSize:12,lineHeight:1.5}}>{ex}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════════════════
// NEWS SCANNER
// ══════════════════════════════════════════════════════════════════════
function NewsScanner({onClose}){
  const [sentFilter,setSentFilter]=useState("הכל");
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState(null);
  const [symFilter,setSymFilter]=useState("הכל");

  const timeAgo=(m)=>{
    if(m<60)return`לפני ${m} דקות`;
    if(m<1440)return`לפני ${Math.round(m/60)} שעות`;
    return`לפני ${Math.round(m/1440)} ימים`;
  };

  const symbols=["הכל",...Array.from(new Set(NEWS_DB.map(n=>n.symbol)))];

  const filtered=NEWS_DB
    .filter(n=>sentFilter==="הכל"||(sentFilter==="חיובי"&&n.sent==="positive")||(sentFilter==="שלילי"&&n.sent==="negative")||(sentFilter==="ניטרלי"&&n.sent==="neutral"))
    .filter(n=>symFilter==="הכל"||n.symbol===symFilter)
    .filter(n=>!search||n.symbol.includes(search.toUpperCase())||n.headline.includes(search))
    .sort((a,b)=>a.mins-b.mins);

  const pos=NEWS_DB.filter(n=>n.sent==="positive").length;
  const neg=NEWS_DB.filter(n=>n.sent==="negative").length;
  const neu=NEWS_DB.filter(n=>n.sent==="neutral").length;
  const total=NEWS_DB.length;
  const moodPct=Math.round((pos/total)*100);

  return(
    <Screen title="📰 סקנר חדשות" onBack={onClose} accent="#e879f9">

      {/* market mood bar */}
      <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:14,padding:"12px 16px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{color:"#888",fontSize:13,fontWeight:600}}>מצב רוח השוק — {total} חדשות</div>
          <div style={{color:moodPct>=55?"#00ff87":moodPct>=40?"#ffd93d":"#ff6b6b",fontWeight:700,fontSize:13,fontFamily:"'IBM Plex Mono',monospace"}}>{moodPct}% חיובי</div>
        </div>
        <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden",marginBottom:8}}>
          <div style={{width:`${moodPct}%`,height:"100%",borderRadius:3,background:"linear-gradient(90deg,#ff6b6b,#ffd93d 40%,#00ff87)",transition:"width .8s ease"}}/>
        </div>
        <div style={{display:"flex",gap:16,fontSize:13}}>
          <span style={{color:"#00ff87"}}>📈 {pos} חיובי</span>
          <span style={{color:"#ff6b6b"}}>📉 {neg} שלילי</span>
          <span style={{color:"#888"}}>➡️ {neu} ניטרלי</span>
        </div>
      </div>

      {/* sentiment filter */}
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[{id:"הכל",l:"הכל"},{id:"חיובי",l:"📈 חיובי"},{id:"שלילי",l:"📉 שלילי"},{id:"ניטרלי",l:"➡️ ניטרלי"}].map(f=>{
          const m=Object.values(SENT_META).find(s=>s.label===f.id);
          const active=sentFilter===f.id;
          return(
            <button key={f.id} className="btn" onClick={()=>setSentFilter(f.id)} style={{flex:1,background:active?(m?.bg||"#e879f918"):"#0d0d18",border:`1px solid ${active?(m?.border||"#e879f945"):"#1a1a2e"}`,borderRadius:10,color:active?(m?.color||"#e879f9"):"#555",padding:"7px 2px",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:active?700:400}}>
              {f.l}
            </button>
          );
        })}
      </div>

      {/* symbol filter horizontal scroll */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
        {symbols.map(s=>(
          <button key={s} className="btn" onClick={()=>setSymFilter(s)} style={{background:symFilter===s?"#e879f918":"#0d0d18",border:`1px solid ${symFilter===s?"#e879f945":"#1a1a2e"}`,borderRadius:20,color:symFilter===s?"#e879f9":"#555",padding:"4px 12px",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'IBM Plex Mono',monospace",fontWeight:symFilter===s?700:400}}>
            {s}
          </button>
        ))}
      </div>

      {/* search */}
      <div style={{position:"relative",marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש חדשות..." style={{width:"100%",background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,color:"#fff",fontSize:13,padding:"10px 14px 10px 36px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"}}/>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#999",fontSize:14}}>🔍</span>
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:"#999",fontSize:14}}>לא נמצאו חדשות</div>
      )}

      {/* news cards */}
      {filtered.map((n,i)=>{
        const sm=SENT_META[n.sent];
        const stock=ALL_STOCKS.find(s=>s.symbol===n.symbol);
        const open=expanded===n.id;
        const isPositivePct=n.pct.startsWith("+")&&n.pct!=="0%";
        const isNegativePct=n.pct.startsWith("-");
        const pctColor=isPositivePct?"#00ff87":isNegativePct?"#ff6b6b":"#888";
        return(
          <div key={n.id} onClick={()=>setExpanded(open?null:n.id)} style={{background:"#0d0d18",border:`1px solid ${sm.border}`,borderRight:`3px solid ${sm.color}`,borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer",animation:`fadeUp .25s ease ${(i%10)*.025}s both`,transition:"background .15s"}}>

            {/* top row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{background:sm.bg,color:sm.color,fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",border:`1px solid ${sm.border}`,flexShrink:0}}>{n.symbol}</span>
                  <span style={{background:sm.bg,color:sm.color,fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,border:`1px solid ${sm.border}`,flexShrink:0}}>{sm.icon} {sm.label}</span>
                  <span style={{color:"#999",fontSize:13,flexShrink:0}}>{n.source} · {timeAgo(n.mins)}</span>
                </div>
                <div style={{color:"#ddd",fontSize:13,fontWeight:600,lineHeight:1.4}}>{n.headline}</div>
              </div>
              {/* impact pct */}
              <div style={{textAlign:"center",flexShrink:0,minWidth:44}}>
                <div style={{color:pctColor,fontSize:14,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{n.pct}</div>
                <div style={{color:"#888",fontSize:9,marginTop:1}}>השפעה</div>
              </div>
            </div>

            {/* expandable summary */}
            {open&&(
              <div style={{borderTop:"1px solid #1a1a2e",paddingTop:10,marginTop:6,animation:"fadeUp .2s ease"}}>
                <div style={{color:"#aaa",fontSize:12,lineHeight:1.7,marginBottom:10}}>{n.summary}</div>
                {stock&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#999",fontSize:13}}>מחיר:</span>
                      <span style={{color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>${stock.price}</span>
                    </div>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#999",fontSize:13}}>שינוי:</span>
                      <span style={{color:stock.change>=0?"#00ff87":"#ff6b6b",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{stock.change>=0?"+":""}{stock.change}%</span>
                    </div>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#999",fontSize:13}}>סיגנל:</span>
                      <span style={{background:stock.sb,color:stock.sc,fontSize:13,padding:"1px 7px",borderRadius:10,fontWeight:700}}>{stock.sig}</span>
                    </div>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#999",fontSize:13}}>RSI:</span>
                      <span style={{color:stock.rsi<30?"#00ff87":stock.rsi>70?"#ff6b6b":"#ffd93d",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{stock.rsi}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* expand hint */}
            <div style={{color:"#888",fontSize:13,marginTop:6,textAlign:"center"}}>{open?"▲ סגור":"▼ קרא עוד"}</div>
          </div>
        );
      })}
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ECONOMIC CALENDAR
// ══════════════════════════════════════════════════════════════════════
function EconCalendar({onClose}){
  const [filter,setFilter]=useState("הכל"); // הכל | גבוהה | בינונית | נמוכה
  const [view,setView]=useState("week");     // week | all

  const enriched=ECON_EVENTS
    .map(e=>({...e,days:daysUntil(e.date)}))
    .filter(e=>e.days>=0)
    .sort((a,b)=>a.days-b.days||(a.time<b.time?-1:1));

  const thisWeek=enriched.filter(e=>e.days<=7);
  const base=view==="week"?thisWeek:enriched;
  const displayed=filter==="הכל"?base:base.filter(e=>ECON_IMPACT[e.impact].label===filter);

  // urgent = high impact < 2 days
  const urgent=enriched.filter(e=>e.impact==="high"&&e.days<2);

  const dayLabel=(d)=>{
    if(d===0)return"היום";
    if(d===1)return"מחר";
    if(d===2)return"מחרתיים";
    return`${d} ימים`;
  };

  const dateHeb=(str)=>{
    const d=new Date(str);
    const names=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
    return`${names[d.getDay()]} ${d.getDate()}.${d.getMonth()+1}`;
  };

  // group by date for section headers
  const grouped=[];
  let lastDate=null;
  displayed.forEach(e=>{
    if(e.date!==lastDate){grouped.push({type:"header",date:e.date,days:e.days});lastDate=e.date;}
    grouped.push({type:"event",...e});
  });

  return(
    <Screen title="🌐 לוח אירועים כלכלי" onBack={onClose} accent="#38bdf8">

      {/* urgent banner */}
      {urgent.length>0&&(
        <div style={{background:"#ff6b6b10",border:"1px solid #ff6b6b50",borderRadius:14,padding:"12px 16px",marginBottom:14}}>
          <div style={{color:"#ff6b6b",fontWeight:700,fontSize:13,marginBottom:8}}>🚨 אירועים בעלי השפעה גבוהה — פחות מ-2 ימים!</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {urgent.map(e=>(
              <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>{ECON_CAT_ICON[e.cat]}</span>
                  <span style={{color:"#ffaaaa",fontSize:13,fontWeight:600}}>{e.name}</span>
                </div>
                <span style={{background:"#ff6b6b25",color:"#ff6b6b",fontSize:13,padding:"2px 10px",borderRadius:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",animation:"pulse 2s infinite",flexShrink:0}}>
                  {dayLabel(e.days)} · {e.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* view tabs */}
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {[{id:"week",l:`השבוע (${thisWeek.length})`},{id:"all",l:`כל האירועים (${enriched.length})`}].map(t=>(
          <button key={t.id} className="btn" onClick={()=>setView(t.id)} style={{flex:1,background:view===t.id?"#38bdf820":"#0d0d18",border:`1px solid ${view===t.id?"#38bdf860":"#1a1a2e"}`,borderRadius:10,color:view===t.id?"#38bdf8":"#555",padding:"8px 4px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:view===t.id?700:400}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* impact filter */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
        {["הכל","גבוהה","בינונית","נמוכה"].map(f=>{
          const imp=Object.values(ECON_IMPACT).find(i=>i.label===f);
          const active=filter===f;
          return(
            <button key={f} className="btn" onClick={()=>setFilter(f)} style={{background:active?(imp?.bg||"#38bdf820"):"#0d0d18",border:`1px solid ${active?(imp?.border||"#38bdf860"):"#1a1a2e"}`,borderRadius:20,color:active?(imp?.color||"#38bdf8"):"#555",padding:"5px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif",fontWeight:active?700:400}}>
              {f==="גבוהה"?"🔴 גבוהה":f==="בינונית"?"🟡 בינונית":f==="נמוכה"?"⚪ נמוכה":"הכל"}
            </button>
          );
        })}
      </div>

      {displayed.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:"#999",fontSize:14}}>אין אירועים בסינון זה</div>
      )}

      {/* grouped list */}
      {grouped.map((item,i)=>{
        if(item.type==="header"){
          return(
            <div key={"h"+item.date} style={{display:"flex",alignItems:"center",gap:10,marginTop:i>0?16:0,marginBottom:8}}>
              <div style={{color:"#38bdf8",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>{dateHeb(item.date)}</div>
              <div style={{flex:1,height:1,background:"#1a1a2e"}}/>
              {item.days===0&&<span style={{color:"#38bdf8",fontSize:13,background:"#38bdf820",padding:"1px 8px",borderRadius:20}}>היום</span>}
              {item.days===1&&<span style={{color:"#ffd93d",fontSize:13,background:"#ffd93d15",padding:"1px 8px",borderRadius:20}}>מחר</span>}
            </div>
          );
        }

        const e=item;
        const imp=ECON_IMPACT[e.impact];
        const isUrgent=e.impact==="high"&&e.days<2;

        return(
          <div key={e.id} style={{background:isUrgent?"#ff6b6b08":"#0d0d18",border:`1px solid ${isUrgent?"#ff6b6b35":imp.border}`,borderRight:`3px solid ${imp.color}`,borderRadius:12,padding:"12px 14px",marginBottom:8,animation:`fadeUp .25s ease ${(i%8)*.03}s both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>

              {/* right side: icon + name + time */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <span style={{fontSize:14,flexShrink:0}}>{ECON_CAT_ICON[e.cat]}</span>
                  <span style={{color:"#fff",fontWeight:600,fontSize:13,lineHeight:1.3}}>{e.name}</span>
                  {isUrgent&&<span style={{background:"#ff6b6b20",color:"#ff6b6b",fontSize:9,padding:"1px 6px",borderRadius:10,fontWeight:700,flexShrink:0,animation:"pulse 1.5s infinite"}}>⚠️</span>}
                </div>
                <div style={{display:"flex",gap:10,fontSize:13,color:"#555",flexWrap:"wrap"}}>
                  <span>🕐 {e.time} (שעון ישראל)</span>
                  {e.fore!=="—"&&<span>תחזית: <span style={{color:"#aaa"}}>{e.fore}</span></span>}
                  {e.prev!=="—"&&<span>קודם: <span style={{color:"#666"}}>{e.prev}</span></span>}
                </div>
              </div>

              {/* left side: impact + countdown */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <span style={{background:imp.bg,color:imp.color,fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,border:`1px solid ${imp.border}`}}>
                  {imp.label}
                </span>
                <span style={{color:e.days<2&&e.impact==="high"?"#ff6b6b":e.days<7?"#ffd93d":"#555",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>
                  {dayLabel(e.days)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════════════════
// EARNINGS CALENDAR
// ══════════════════════════════════════════════════════════════════════
function EarningsCalendar({onClose}){
  const [view,setView]=useState("week");

  const enriched=EARNINGS_DATA
    .map(e=>({...e,days:daysUntil(e.date),stock:ALL_STOCKS.find(s=>s.symbol===e.symbol)}))
    .filter(e=>e.days>=0)
    .sort((a,b)=>a.days-b.days);

  const thisWeek=enriched.filter(e=>e.days<=7);
  const displayed=view==="week"?thisWeek:enriched;
  const urgent=enriched.filter(e=>e.days<3);

  const dayLabel=(d)=>{
    if(d===0)return"היום";
    if(d===1)return"מחר";
    if(d===2)return"מחרתיים";
    return`${d} ימים`;
  };

  const dateHeb=(str)=>{
    const d=new Date(str);
    const names=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
    return`${names[d.getDay()]} ${d.getDate()}.${d.getMonth()+1}`;
  };

  return(
    <Screen title="📅 יומן דיווחים" onBack={onClose} accent="#fb923c">

      {/* urgent banner */}
      {urgent.length>0&&(
        <div style={{background:"#ff6b6b10",border:"1px solid #ff6b6b50",borderRadius:14,padding:"12px 16px",marginBottom:14,direction:"rtl"}}>
          <div style={{color:"#ff6b6b",fontWeight:700,fontSize:13,marginBottom:8}}>🔴 דיווחים בפחות מ-3 ימים — שים לב!</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {urgent.map(e=>(
              <span key={e.symbol} style={{background:"#ff6b6b20",color:"#ff6b6b",fontSize:12,padding:"3px 10px",borderRadius:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",animation:"pulse 2s infinite"}}>
                {e.symbol} · {dayLabel(e.days)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* tabs */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[
          {id:"week",l:`השבוע (${thisWeek.length})`},
          {id:"all", l:`כל הדיווחים (${enriched.length})`},
        ].map(t=>(
          <button key={t.id} className="btn" onClick={()=>setView(t.id)} style={{flex:1,background:view===t.id?"#fb923c20":"#0d0d18",border:`1px solid ${view===t.id?"#fb923c60":"#1a1a2e"}`,borderRadius:10,color:view===t.id?"#fb923c":"#555",padding:"9px 4px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:view===t.id?700:400}}>
            {t.l}
          </button>
        ))}
      </div>

      {displayed.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:"#999",fontSize:14}}>אין דיווחים קרובים השבוע</div>
      )}

      {displayed.map((e,i)=>{
        const isUrgent=e.days<3;
        const isSoon=e.days<7;
        const accent=isUrgent?"#ff6b6b":isSoon?"#ffd93d":"#555";
        const bg=isUrgent?"#ff6b6b08":isSoon?"#ffd93d06":"transparent";
        const s=e.stock;
        return(
          <div key={e.symbol} style={{background:bg||"#0d0d18",border:`1px solid ${isUrgent?"#ff6b6b35":isSoon?"#ffd93d25":"#1a1a2e"}`,borderRight:`3px solid ${accent}`,borderRadius:14,padding:"14px 16px",marginBottom:10,animation:`fadeUp .3s ease ${i*.04}s both`}}>

            {/* top row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:16,fontFamily:"'IBM Plex Mono',monospace"}}>{e.symbol}</span>
                  <span style={{color:"#999",fontSize:12}}>{e.name}</span>
                  {isUrgent&&(
                    <span style={{background:"#ff6b6b20",color:"#ff6b6b",fontSize:13,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"pulse 1.5s infinite"}}>⚠️ דחוף</span>
                  )}
                </div>
                <div style={{display:"flex",gap:10,fontSize:13,color:"#555",flexWrap:"wrap"}}>
                  <span>📅 {dateHeb(e.date)}</span>
                  <span>{e.time==="after"?"⏰ אחרי סגירה":"🌅 לפני פתיחה"}</span>
                  {s&&<span style={{color:s.change>=0?"#00ff87":"#ff6b6b",fontFamily:"'IBM Plex Mono',monospace"}}>{s.change>=0?"+":""}{s.change}%</span>}
                </div>
              </div>

              {/* countdown */}
              <div style={{textAlign:"center",minWidth:56,flexShrink:0}}>
                <div style={{color:accent,fontSize:isUrgent?22:17,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{dayLabel(e.days)}</div>
                {e.days>2&&<div style={{color:"#888",fontSize:9,marginTop:2}}>נותרו</div>}
              </div>
            </div>

            {/* stock indicators */}
            {s&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#999",fontSize:13}}>ציון:</span>
                  <span style={{color:s.total>=68?"#00ff87":s.total>=48?"#ffd93d":"#ff6b6b",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.total}</span>
                </div>
                <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#999",fontSize:13}}>RSI:</span>
                  <span style={{color:s.rsi<30?"#00ff87":s.rsi>70?"#ff6b6b":"#ffd93d",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.rsi}</span>
                </div>
                <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#999",fontSize:13}}>סיגנל:</span>
                  <span style={{background:s.sb,color:s.sc,fontSize:13,padding:"1px 7px",borderRadius:10,fontWeight:700}}>{s.sig}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════════════════
// FEAR & GREED METER
// ══════════════════════════════════════════════════════════════════════
const FEAR_GREED_VALUE = Math.round(ALL_STOCKS.reduce((a,s)=>a+s.sent,0)/ALL_STOCKS.length);

function getFearGreedInfo(val){
  if(val<=25) return{label:"פחד קיצוני",color:"#8b0000",bg:"#8b000022",border:"#8b000055"};
  if(val<=50) return{label:"פחד",color:"#ff4444",bg:"#ff444422",border:"#ff444455"};
  if(val<=75) return{label:"חמדנות",color:"#00cc55",bg:"#00cc5522",border:"#00cc5555"};
  return{label:"חמדנות קיצונית",color:"#00ff87",bg:"#00ff8722",border:"#00ff8755"};
}

function FearGreedMeter(){
  const val=FEAR_GREED_VALUE;
  const {label,color,bg,border}=getFearGreedInfo(val);
  const pct=val;

  const zones=[
    {from:0,to:25,color:"#8b0000",label:"פחד קיצוני"},
    {from:25,to:50,color:"#ff4444",label:"פחד"},
    {from:50,to:75,color:"#00cc55",label:"חמדנות"},
    {from:75,to:100,color:"#00ff87",label:"חמדנות קיצונית"},
  ];

  return(
    <div style={{margin:"10px 20px 0",background:bg,border:`1px solid ${border}`,borderRadius:14,padding:"14px 16px",flexShrink:0,direction:"rtl"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>😱</span>
          <div style={{color:"#888",fontSize:13,fontWeight:600,letterSpacing:0.5}}>מדד פחד וחמדנות</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:color,fontSize:13,fontWeight:700,fontFamily:"'Heebo',sans-serif"}}>{label}</span>
          <span style={{color:color,fontSize:22,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{val}</span>
        </div>
      </div>

      {/* gradient bar */}
      <div style={{position:"relative",height:8,borderRadius:4,overflow:"hidden",background:"#1a1a2e",marginBottom:6}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#8b0000 0%,#ff4444 25%,#ffd93d 50%,#00cc55 75%,#00ff87 100%)",borderRadius:4}}/>
        <div style={{position:"absolute",top:"50%",transform:"translate(-50%,-50%)",left:`${pct}%`,width:13,height:13,borderRadius:"50%",background:"#fff",border:`2.5px solid ${color}`,boxShadow:`0 0 6px ${color}`,zIndex:2}}/>
      </div>

      {/* labels */}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#888",marginTop:2}}>
        {zones.map(z=><span key={z.label} style={{color:z.color,opacity:.7}}>{z.label}</span>)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════
// ── SECTOR HEATMAP ────────────────────────────────────────────────────
function SectorHeatmap({onClose}){
  const sectorMap={};
  ALL_STOCKS.forEach(s=>{
    if(!sectorMap[s.sector])sectorMap[s.sector]={total:0,count:0,change:0,stocks:[]};
    sectorMap[s.sector].total+=s.total;
    sectorMap[s.sector].change+=s.change;
    sectorMap[s.sector].count++;
    sectorMap[s.sector].stocks.push(s.symbol);
  });
  const sectors=Object.entries(sectorMap).map(([name,d])=>({
    name,
    avgScore:Math.round(d.total/d.count),
    avgChange:parseFloat((d.change/d.count).toFixed(2)),
    count:d.count,
    stocks:d.stocks,
  })).sort((a,b)=>b.avgChange-a.avgChange);

  function cellColor(chg){
    if(chg>=3)return{bg:"#00ff8718",border:"#00ff8760",text:"#00ff87"};
    if(chg>=1)return{bg:"#7bff6e14",border:"#7bff6e50",text:"#7bff6e"};
    if(chg>=-1)return{bg:"#ffd93d14",border:"#ffd93d40",text:"#ffd93d"};
    if(chg>=-3)return{bg:"#ff6b6b14",border:"#ff6b6b50",text:"#ff6b6b"};
    return{bg:"#cc222218",border:"#cc222260",text:"#ff4444"};
  }

  const SECTOR_ICONS={
    "טכנולוגיה":"💻","סמיקונדקטור":"⚡","ענן":"☁️","סייבר":"🛡️",
    "פינטק":"💳","קריפטו":"🔗","ביטקוין":"₿","ETF":"📊",
    "רכב":"🚗","אנרגיה":"⚡","חלל":"🚀","קוונטום":"⚛️",
    "מסחר":"🛒","שרתים":"🖥️",
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"85vh",display:"flex",flexDirection:"column",overflowY:"auto",direction:"rtl",fontFamily:"'Heebo',sans-serif"}}>
        <div style={{padding:"18px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #111",position:"sticky",top:0,background:"#0a0a12",zIndex:1}}>
          <div>
            <div style={{color:"#fff",fontSize:16,fontWeight:700}}>🗺️ מפת סקטורים</div>
            <div style={{color:"#555",fontSize:13,marginTop:2}}>{sectors.length} סקטורים · לפי שינוי ממוצע</div>
          </div>
          <button className="btn" onClick={onClose} style={{background:"#1a1a2e",border:"none",borderRadius:10,color:"#666",padding:"6px 12px",cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        <div style={{padding:"16px 20px 24px",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {sectors.map(s=>{
            const c=cellColor(s.avgChange);
            return(
              <div key={s.name} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:14,padding:"14px 16px",display:"flex",flexDirection:"column",gap:6}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:16}}>{SECTOR_ICONS[s.name]||"📈"}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:c.text}}>{s.avgChange>=0?"+":""}{s.avgChange}%</span>
                </div>
                <div style={{color:"#ddd",fontSize:13,fontWeight:700}}>{s.name}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#555",fontSize:13}}>{s.count} מניות</span>
                  <span style={{color:"#999",fontSize:13,fontFamily:"'IBM Plex Mono',monospace"}}>ציון {s.avgScore}</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:2}}>
                  {s.stocks.slice(0,4).map(sym=>(
                    <span key={sym} style={{background:"#ffffff0a",border:"1px solid #ffffff12",borderRadius:5,padding:"1px 5px",color:"#666",fontSize:13,fontFamily:"'IBM Plex Mono',monospace"}}>{sym}</span>
                  ))}
                  {s.stocks.length>4&&<span style={{color:"#999",fontSize:13,padding:"1px 4px"}}>+{s.stocks.length-4}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"0 20px 16px",display:"flex",gap:8,justifyContent:"center"}}>
          {[{chg:2,label:"עלייה חזקה"},{chg:0,label:"ניטרלי"},{chg:-2,label:"ירידה"}].map(({chg,label})=>{
            const c=cellColor(chg);
            return <div key={label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:c.bg,border:`1px solid ${c.border}`}}/><span style={{color:"#555",fontSize:13}}>{label}</span></div>;
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// TRADE DECISION ENGINE
// ══════════════════════════════════════════════════════════════════════
function calcTradeScore(s){
  let score=s.total;
  const fg=FEAR_GREED_VALUE;
  // RSI
  if(s.rsi>72)score-=22;
  else if(s.rsi>65)score-=10;
  else if(s.rsi<28)score+=15;
  else if(s.rsi<35)score+=8;
  // Fear & Greed
  if(fg<=20)score-=18;
  else if(fg<=35)score-=8;
  else if(fg>=80)score-=14;
  else if(fg>=65)score-=5;
  // Earnings proximity
  const e=EARNINGS_DATA.find(e=>e.symbol===s.symbol);
  if(e){
    const d=daysUntil(e.date);
    if(d>=0&&d<=1)score-=28;
    else if(d<=3)score-=18;
    else if(d<=7)score-=10;
  }
  return Math.max(0,Math.min(100,Math.round(score)));
}
function getTradeDecision(score){
  if(score>=65)return{icon:"✅",label:"תנאים טכניים חיובים",eng:"DATA POSITIVE",color:"#00ff87",bg:"#00ff8712",border:"#00ff8745"};
  if(score>=40)return{icon:"⚠️",label:"תנאים מעורבים",eng:"MIXED DATA",color:"#ffd93d",bg:"#ffd93d10",border:"#ffd93d40"};
  return{icon:"❌",label:"תנאים טכניים שליליים",eng:"DATA NEGATIVE",color:"#ff6b6b",bg:"#ff6b6b10",border:"#ff6b6b40"};
}
function TradeDecisionEngine({onClose}){
  const [filter,setFilter]=useState("הכל");
  const [sortBy,setSortBy]=useState("score");

  const enriched=ALL_STOCKS.map(s=>{
    const tradeScore=calcTradeScore(s);
    const dec=getTradeDecision(tradeScore);
    const earning=EARNINGS_DATA.find(e=>e.symbol===s.symbol);
    const earningDays=earning?daysUntil(earning.date):null;
    const hasEarningsSoon=earningDays!==null&&earningDays>=0&&earningDays<=7;
    return{...s,tradeScore,dec,earningDays,hasEarningsSoon};
  });

  const filtered=enriched
    .filter(s=>{
      if(filter==="תנאים טכניים חיובים")return s.tradeScore>=65;
      if(filter==="תנאים מעורבים")return s.tradeScore>=40&&s.tradeScore<65;
      if(filter==="תנאים טכניים שליליים")return s.tradeScore<40;
      return true;
    })
    .sort((a,b)=>sortBy==="score"?b.tradeScore-a.tradeScore:sortBy==="rsi"?a.rsi-b.rsi:b.total-a.total);

  const good=enriched.filter(s=>s.tradeScore>=65).length;
  const risky=enriched.filter(s=>s.tradeScore>=40&&s.tradeScore<65).length;
  const bad=enriched.filter(s=>s.tradeScore<40).length;
  const fg=FEAR_GREED_VALUE;
  const fgInfo=getFearGreedInfo(fg);

  return(
    <Screen title="🎯 מנוע החלטת עסקה" onBack={onClose} accent="#00ff87">

      {/* Summary bar */}
      <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:14,padding:"14px 16px",marginBottom:12,direction:"rtl"}}>
        <div style={{color:"#555",fontSize:13,fontWeight:600,marginBottom:10,letterSpacing:0.5}}>סיכום · {enriched.length} מניות בסקנר</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          <div style={{background:"#00ff8710",border:"1px solid #00ff8730",borderRadius:12,padding:"10px",textAlign:"center"}}>
            <div style={{color:"#00ff87",fontSize:22,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{good}</div>
            <div style={{color:"#00ff87",fontSize:13,marginTop:2}}>✅ תנאים חיובים</div>
          </div>
          <div style={{background:"#ffd93d10",border:"1px solid #ffd93d30",borderRadius:12,padding:"10px",textAlign:"center"}}>
            <div style={{color:"#ffd93d",fontSize:22,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{risky}</div>
            <div style={{color:"#ffd93d",fontSize:13,marginTop:2}}>⚠️ מעורב</div>
          </div>
          <div style={{background:"#ff6b6b10",border:"1px solid #ff6b6b30",borderRadius:12,padding:"10px",textAlign:"center"}}>
            <div style={{color:"#ff6b6b",fontSize:22,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{bad}</div>
            <div style={{color:"#ff6b6b",fontSize:13,marginTop:2}}>❌ שלילי</div>
          </div>
        </div>
        {/* Factors legend */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#060608",borderRadius:8,padding:"5px 10px"}}>
            <span style={{fontSize:13}}>😱</span>
            <span style={{color:"#888",fontSize:13}}>F&G:</span>
            <span style={{color:fgInfo.color,fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{fg} {fgInfo.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#060608",borderRadius:8,padding:"5px 10px"}}>
            <span style={{fontSize:13}}>📊</span>
            <span style={{color:"#888",fontSize:13}}>RSI + ציון + Earnings</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[{id:"הכל",label:"הכל"},{id:"מומלץ",label:"✅ חיובי"},{id:"תנאים מעורבים",label:"⚠️ מעורב"},{id:"תנאים טכניים שליליים",label:"❌ שלילי"}].map(f=>{
          const active=filter===f.id;
          const c=f.id==="תנאים טכניים חיובים"?"#00ff87":f.id==="תנאים מעורבים"?"#ffd93d":f.id==="תנאים טכניים שליליים"?"#ff6b6b":"#555";
          return(
            <button key={f.id} className="btn" onClick={()=>setFilter(f.id)} style={{flex:1,background:active?c+"18":"#0d0d18",border:`1px solid ${active?c+"60":"#1a1a2e"}`,borderRadius:10,color:active?c:"#555",padding:"7px 4px",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:active?700:400,whiteSpace:"nowrap"}}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[{id:"score",l:"לפי ציון עסקה"},{id:"total",l:"לפי ציון מניה"},{id:"rsi",l:"לפי RSI"}].map(s=>(
          <button key={s.id} className="btn" onClick={()=>setSortBy(s.id)} style={{flex:1,background:sortBy===s.id?"#00ff8715":"#0d0d18",border:`1px solid ${sortBy===s.id?"#00ff8740":"#1a1a2e"}`,borderRadius:8,color:sortBy===s.id?"#00ff87":"#444",padding:"6px 4px",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
            {s.l}
          </button>
        ))}
      </div>

      {/* Stock list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map((s,i)=>{
          const pct=s.tradeScore;
          return(
            <div key={s.symbol} style={{background:s.dec.bg,border:`1px solid ${s.dec.border}`,borderRight:`3px solid ${s.dec.color}`,borderRadius:14,padding:"14px 16px",animation:`fadeUp .25s ease ${i*.03}s both`}}>

              {/* Top row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"#fff",fontWeight:800,fontSize:16,fontFamily:"'IBM Plex Mono',monospace"}}>{s.symbol}</span>
                  <span style={{color:"#555",fontSize:12}}>{s.name}</span>
                  {s.hasEarningsSoon&&(
                    <span style={{background:"#fb923c20",color:"#fb923c",fontSize:13,padding:"2px 7px",borderRadius:20,fontWeight:700,animation:s.earningDays<=1?"pulse 1.5s infinite":"none"}}>
                      📅 {s.earningDays===0?"היום":s.earningDays===1?"מחר":`${s.earningDays}י`}
                    </span>
                  )}
                </div>
                {/* Verdict badge */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
                  <span style={{fontSize:18}}>{s.dec.icon}</span>
                  <span style={{color:s.dec.color,fontSize:9,fontWeight:700,letterSpacing:0.3,whiteSpace:"nowrap"}}>{s.dec.eng}</span>
                </div>
              </div>

              {/* Score bar */}
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <span style={{color:"#555",fontSize:13}}>ציון עסקה</span>
                  <span style={{color:s.dec.color,fontSize:18,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{pct}</span>
                </div>
                <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",borderRadius:3,background:pct>=65?"linear-gradient(90deg,#00cc6a,#00ff87)":pct>=40?"linear-gradient(90deg,#ffaa00,#ffd93d)":"linear-gradient(90deg,#cc2222,#ff6b6b)",transition:"width .6s ease"}}/>
                </div>
              </div>

              {/* Factor pills */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <div style={{background:"#060608",borderRadius:8,padding:"4px 9px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#999",fontSize:13}}>RSI</span>
                  <span style={{color:s.rsi<30?"#00ff87":s.rsi>70?"#ff6b6b":"#ffd93d",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.rsi}</span>
                </div>
                <div style={{background:"#060608",borderRadius:8,padding:"4px 9px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#999",fontSize:13}}>ציון</span>
                  <span style={{color:s.total>=68?"#00ff87":s.total>=48?"#ffd93d":"#ff6b6b",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.total}</span>
                </div>
                <div style={{background:"#060608",borderRadius:8,padding:"4px 9px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#999",fontSize:13}}>F&G</span>
                  <span style={{color:fgInfo.color,fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{fg}</span>
                </div>
                <Badge sig={s.sig} sb={s.sb} sc={s.sc} sm/>
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

// ── EMOTIONAL SCORE ───────────────────────────────────────────────────
const EMOTIONAL_CFG={
  calm:   {label:"Calm",   he:"רגוע",  color:"#00ff87",bg:"#00ff8712",border:"#00ff8735",icon:"🟢",tip:"מצב מסחר תקין — המשך לפי התוכנית"},
  tilt:   {label:"Tilt",   he:"מתוח",  color:"#ffd93d",bg:"#ffd93d12",border:"#ffd93d40",icon:"🟡",tip:"היזהר — הרגשות מתחילים לשלוט. עצור ובדוק"},
  revenge:{label:"Revenge",he:"נקמה",  color:"#ff6b6b",bg:"#ff6b6b15",border:"#ff6b6b55",icon:"🔴",tip:"⛔ עצור! אל תיכנס לעסקה כרגע. הפסקה חובה"},
};

function calcEmotionalScore(tradeCount,trades){
  const sorted=[...trades].sort((a,b)=>new Date(b.date)-new Date(a.date));
  let consecutive=0;
  for(const t of sorted){if(t.result==="loss")consecutive++;else break;}
  if(consecutive>=3||tradeCount>=6)return{state:"revenge",consecutive};
  if(consecutive>=2||tradeCount>=4)return{state:"tilt",consecutive};
  return{state:"calm",consecutive};
}

function EmotionalBadge({state}){
  const c=EMOTIONAL_CFG[state];
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,background:c.bg,border:`1px solid ${c.border}`,borderRadius:10,padding:"3px 10px",animation:state==="revenge"?"revengeFlash 1.4s infinite":"none"}}>
      <span style={{fontSize:13}}>{c.icon}</span>
      <span style={{color:c.color,fontSize:13,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{c.label}</span>
      <span style={{color:c.color,fontSize:13,opacity:.75,fontFamily:"'Heebo',sans-serif"}}>· {c.he}</span>
    </div>
  );
}

// ── TRADE LOCK ────────────────────────────────────────────────────────
function TradeLockBanner({reason,onUnlockRequest}){
  return(
    <div style={{margin:"8px 20px 0",background:"#ff6b6b18",border:"2px solid #ff6b6b55",borderRadius:14,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,animation:"revengePulse 2s infinite",direction:"rtl"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>🔒</span>
        <div>
          <div style={{color:"#ff6b6b",fontSize:13,fontWeight:800,letterSpacing:.5}}>מסחר נעול</div>
          <div style={{color:"#ff6b6b",fontSize:13,marginTop:2,opacity:.85,maxWidth:200}}>{reason}</div>
        </div>
      </div>
      <button className="btn" onClick={onUnlockRequest} style={{background:"#ff6b6b20",border:"1px solid #ff6b6b50",borderRadius:10,color:"#ff6b6b",padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700,flexShrink:0}}>
        פתח נעילה
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PERFORMANCE INSIGHTS — Smart analysis from journal data
// ══════════════════════════════════════════════════════════════════════
function PerformanceInsights({onClose}){
  const [trades,setTrades]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{apiCall('/api/trades').then(r=>r.json()).then(d=>{setTrades((Array.isArray(d)?d:[]).map(normalizeTrade));setLoading(false);}).catch(()=>setLoading(false));},[]);
  if(loading)return <Screen title="💡 תובנות ביצועים" onBack={onClose} accent="#a78bfa"><div style={{textAlign:'center',padding:40,color:'#555'}}>טוען...</div></Screen>;
  if(!trades.length)return <Screen title="💡 תובנות ביצועים" onBack={onClose} accent="#a78bfa"><div style={{textAlign:'center',padding:40,color:'#555'}}>אין עסקאות עדיין. הוסף עסקאות ביומן.</div></Screen>;

  // Day analysis
  const dayMap={};
  trades.forEach(t=>{
    if(!dayMap[t.day])dayMap[t.day]={wins:0,losses:0,pnl:0,total:0};
    dayMap[t.day].total++;dayMap[t.day].pnl+=t.pnl;
    if(t.result==="win")dayMap[t.day].wins++;else dayMap[t.day].losses++;
  });
  const dayEntries=Object.entries(dayMap).map(([day,d])=>({day,...d,winRate:Math.round((d.wins/d.total)*100)}));
  const worstDay=[...dayEntries].sort((a,b)=>a.winRate-b.winRate)[0];
  const bestDay=[...dayEntries].sort((a,b)=>b.winRate-a.winRate)[0];

  // Plan adherence
  const noplanTrades=trades.filter(t=>!t.followedPlan);
  const planTrades=trades.filter(t=>t.followedPlan);
  const noplanRate=Math.round((noplanTrades.filter(t=>t.result==="win").length/Math.max(noplanTrades.length,1))*100);
  const planRate=Math.round((planTrades.filter(t=>t.result==="win").length/Math.max(planTrades.length,1))*100);
  const deviatesPct=Math.round((noplanTrades.length/trades.length)*100);

  // Time analysis
  const hourMap={};
  trades.forEach(t=>{
    const h=parseInt(t.hour.split(":")[0]);
    const period=h<11?"בוקר":h<14?"צהריים":"אחה\"צ";
    if(!hourMap[period])hourMap[period]={wins:0,total:0,pnl:0};
    hourMap[period].total++;hourMap[period].pnl+=t.pnl;
    if(t.result==="win")hourMap[period].wins++;
  });
  const timeEntries=Object.entries(hourMap).map(([period,d])=>({period,...d,winRate:Math.round((d.wins/d.total)*100)}));
  const bestTime=[...timeEntries].sort((a,b)=>b.winRate-a.winRate)[0];

  // Emotion analysis
  const emotionMap={};
  trades.forEach(t=>{
    if(!emotionMap[t.emotion])emotionMap[t.emotion]={wins:0,total:0};
    emotionMap[t.emotion].total++;
    if(t.result==="win")emotionMap[t.emotion].wins++;
  });
  const emotionEntries=Object.entries(emotionMap).map(([e,d])=>({e,...d,winRate:Math.round((d.wins/d.total)*100)}));
  const worstEmotion=[...emotionEntries].sort((a,b)=>a.winRate-b.winRate)[0];
  const bestEmotion=[...emotionEntries].sort((a,b)=>b.winRate-a.winRate)[0];

  // Consistency
  const pnls=trades.map(t=>t.pnl);
  const avgPnl=pnls.reduce((a,b)=>a+b,0)/pnls.length;
  const stdDev=Math.sqrt(pnls.reduce((a,b)=>a+Math.pow(b-avgPnl,2),0)/pnls.length);
  const isInconsistent=stdDev>Math.abs(avgPnl)*1.5;

  // Setup analysis
  const setupMap={};
  trades.forEach(t=>{
    if(!setupMap[t.setup])setupMap[t.setup]={wins:0,total:0};
    setupMap[t.setup].total++;if(t.result==="win")setupMap[t.setup].wins++;
  });
  const setupEntries=Object.entries(setupMap).map(([s,d])=>({s,...d,winRate:Math.round((d.wins/d.total)*100)}));
  const bestSetup=[...setupEntries].sort((a,b)=>b.winRate-a.winRate)[0];

  const EMOJIS={focused:"🔥",neutral:"😐",stress:"😤",fear:"😨",greed:"🤑"};
  const ELABEL={focused:"ממוקד",neutral:"ניטרלי",stress:"לחץ",fear:"פחד",greed:"חמדנות"};

  const insights=[
    {
      severity:worstDay.winRate<40?"danger":"warning",icon:"📅",
      title:worstDay.winRate<40?`אתה מפסיד בימי ${worstDay.day}`:`ביצועים חלשים בימי ${worstDay.day}`,
      sub:`${worstDay.winRate}% הצלחה · P&L: ${worstDay.pnl>=0?"+":""}$${worstDay.pnl}`,
      advice:`שקול להימנע ממסחר בימי ${worstDay.day} או לצמצם פוזיציות`,
      bar:{value:worstDay.winRate},
    },
    {
      severity:deviatesPct>30?"danger":"warning",icon:"📋",
      title:deviatesPct>30?"אתה חורג מהשיטה שלך":"יש חריגות מהתוכנית",
      sub:`${deviatesPct}% מהעסקאות בלי תוכנית · עם תוכנית: ${planRate}% · בלי: ${noplanRate}%`,
      advice:`עקיבה לתוכנית משפרת ביצועים ב-${planRate-noplanRate}% — זה ההבדל בין רווח להפסד`,
      bar:{value:planRate,compare:noplanRate},
    },
    {
      severity:isInconsistent?"danger":"ok",icon:"📊",
      title:isInconsistent?"הטריידים שלך לא עקביים":"עקביות סבירה",
      sub:`סטיית תקן: $${stdDev.toFixed(0)} · ממוצע לעסקה: ${avgPnl>=0?"+":""}$${avgPnl.toFixed(0)}`,
      advice:isInconsistent?"גדלי הפוזיציות שלך משתנים מאוד — עבוד עם גדלים אחידים לפי שיטה":"המשך לשמור על גדלים עקביים",
      bar:null,
    },
    {
      severity:"ok",icon:"⏰",
      title:`הזמן הטוב ביותר שלך הוא ${bestTime.period}`,
      sub:`${bestTime.winRate}% הצלחה · ${bestTime.total} עסקאות בפרק זה`,
      advice:`רכז את רוב הפעילות ב${bestTime.period} לתוצאות מיטביות`,
      bar:{value:bestTime.winRate},
    },
    {
      severity:worstEmotion&&worstEmotion.winRate<30?"danger":"warning",
      icon:EMOJIS[worstEmotion?.e]||"🧬",
      title:`${ELABEL[worstEmotion?.e]||worstEmotion?.e} = הפסדים`,
      sub:`כש${ELABEL[worstEmotion?.e]} אתה מצליח רק ${worstEmotion?.winRate}% מהעסקאות`,
      advice:`כש${ELABEL[bestEmotion?.e]} ${EMOJIS[bestEmotion?.e]} אתה מצליח ${bestEmotion?.winRate}% — זה המצב שלך`,
      bar:null,
    },
    {
      severity:"ok",icon:"🎯",
      title:`הסטאפ החזק שלך: ${bestSetup?.s}`,
      sub:`${bestSetup?.winRate}% הצלחה · ${bestSetup?.total} עסקאות`,
      advice:`התמקד ב-${bestSetup?.s} — שם הכסף שלך`,
      bar:{value:bestSetup?.winRate},
    },
  ];

  const SEV={
    danger:{bg:"#ff6b6b12",border:"#ff6b6b40",color:"#ff6b6b",dot:"#ff6b6b"},
    warning:{bg:"#ffd93d10",border:"#ffd93d35",color:"#ffd93d",dot:"#ffd93d"},
    ok:{bg:"#00ff8710",border:"#00ff8732",color:"#00ff87",dot:"#00ff87"},
  };

  return(
    <Screen title="💡 תובנות ביצועים" onBack={onClose} accent="#a78bfa">
      <div style={{color:"#999",fontSize:12,marginBottom:16,textAlign:"center",lineHeight:1.6}}>
        ניתוח חכם מבוסס על {trades.length} העסקאות האחרונות שלך
      </div>

      {insights.map((ins,i)=>{
        const S=SEV[ins.severity];
        return(
          <div key={i} style={{background:S.bg,border:`1px solid ${S.border}`,borderRadius:16,padding:"16px",marginBottom:12,borderRight:`3px solid ${S.dot}`,animation:`fadeUp .3s ease ${i*.08}s both`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{fontSize:24,flexShrink:0,marginTop:2}}>{ins.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:S.color,fontSize:15,fontWeight:700,marginBottom:4}}>{ins.title}</div>
                <div style={{color:"#666",fontSize:12,marginBottom:ins.bar?8:6}}>{ins.sub}</div>
                {ins.bar&&(
                  <div style={{marginBottom:8}}>
                    <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden",marginBottom:ins.bar.compare!==undefined?5:0}}>
                      <div style={{width:`${ins.bar.value}%`,height:"100%",borderRadius:3,background:S.color,transition:"width 1s ease"}}/>
                    </div>
                    {ins.bar.compare!==undefined&&(
                      <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${ins.bar.compare}%`,height:"100%",borderRadius:3,background:"#ff6b6b70",transition:"width 1s ease"}}/>
                      </div>
                    )}
                  </div>
                )}
                <div style={{color:"#666",fontSize:13,fontStyle:"italic"}}>{ins.advice}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Day breakdown visual */}
      <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:16,padding:"16px",marginTop:4}}>
        <div style={{color:"#555",fontSize:13,marginBottom:14,letterSpacing:1}}>ביצועים לפי יום</div>
        {[...dayEntries].sort((a,b)=>b.winRate-a.winRate).map(({day,winRate,pnl,total})=>(
          <div key={day} style={{display:"flex",alignItems:"center",gap:10,marginBottom:11}}>
            <div style={{width:54,color:"#888",fontSize:12,flexShrink:0,textAlign:"right"}}>{day}</div>
            <div style={{flex:1,height:7,background:"#1a1a2e",borderRadius:4}}>
              <div style={{width:`${winRate}%`,height:"100%",borderRadius:4,background:winRate>=60?"#00ff87":winRate>=40?"#ffd93d":"#ff6b6b",transition:"width 1s ease",boxShadow:winRate>=60?"0 0 8px #00ff8740":"none"}}/>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
              <span style={{color:winRate>=60?"#00ff87":winRate>=40?"#ffd93d":"#ff6b6b",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",width:34,textAlign:"right"}}>{winRate}%</span>
              <span style={{color:pnl>=0?"#00ff87":"#ff6b6b",fontSize:13,fontFamily:"'IBM Plex Mono',monospace",width:54,textAlign:"right"}}>{pnl>=0?"+":""}${pnl}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hour heatmap */}
      <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:16,padding:"16px",marginTop:12,marginBottom:4}}>
        <div style={{color:"#555",fontSize:13,marginBottom:14,letterSpacing:1}}>ביצועים לפי שעה ביום</div>
        <div style={{display:"flex",gap:10}}>
          {[...timeEntries].sort((a,b)=>a.period.localeCompare(b.period)).map(({period,winRate,total,pnl})=>(
            <div key={period} style={{flex:1,background:winRate>=60?"#00ff8715":winRate>=40?"#ffd93d10":"#ff6b6b15",border:`1px solid ${winRate>=60?"#00ff8735":winRate>=40?"#ffd93d30":"#ff6b6b30"}`,borderRadius:12,padding:"12px",textAlign:"center"}}>
              <div style={{color:winRate>=60?"#00ff87":winRate>=40?"#ffd93d":"#ff6b6b",fontSize:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{winRate}%</div>
              <div style={{color:"#888",fontSize:12,marginTop:4,fontWeight:600}}>{period}</div>
              <div style={{color:"#999",fontSize:13,marginTop:3}}>{total} עסקאות</div>
              <div style={{color:pnl>=0?"#00ff8790":"#ff6b6b90",fontSize:13,fontFamily:"'IBM Plex Mono',monospace",marginTop:2}}>{pnl>=0?"+":""}${pnl}</div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════════════════
// CANDLESTICK CHART
// ══════════════════════════════════════════════════════════════════════
function CandleChart({bars}){
  if(!bars||bars.length===0)return null;
  const W=340,H=170,PT=10,PB=28,PL=6,PR=6;
  const chartW=W-PL-PR,chartH=H-PT-PB;
  const maxP=Math.max(...bars.map(b=>b.h));
  const minP=Math.min(...bars.map(b=>b.l));
  const range=maxP-minP||1;
  const n=bars.length;
  const slotW=chartW/n;
  const candleW=Math.max(2,slotW-2);
  const yS=v=>PT+chartH*(1-(v-minP)/range);
  const xC=i=>PL+(i+0.5)*slotW;
  const fmt=v=>v>=1000?v.toFixed(0):v.toFixed(2);
  const dates=bars.map(b=>{const d=new Date(b.t);return`${d.getMonth()+1}/${d.getDate()}`;});
  const step=Math.max(1,Math.floor(n/5));
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      {bars.map((b,i)=>{
        const bull=b.c>=b.o;
        const col=bull?"#00ff87":"#ff6b6b";
        const cx=xC(i);
        const bTop=yS(Math.max(b.o,b.c));
        const bBot=yS(Math.min(b.o,b.c));
        const bH=Math.max(1,bBot-bTop);
        return(
          <g key={i}>
            <line x1={cx} y1={yS(b.h)} x2={cx} y2={yS(b.l)} stroke={col} strokeWidth={1}/>
            <rect x={cx-candleW/2} y={bTop} width={candleW} height={bH} fill={col} rx={0.5}/>
          </g>
        );
      })}
      <text x={PR} y={PT+8} fill="#555" fontSize={8} textAnchor="start">{fmt(maxP)}</text>
      <text x={PR} y={H-PB+4} fill="#555" fontSize={8} textAnchor="start">{fmt(minP)}</text>
      {dates.map((d,i)=>i%step===0&&(
        <text key={i} x={xC(i)} y={H-4} fill="#444" fontSize={8} textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STOCK ANALYSIS SCREEN
// ══════════════════════════════════════════════════════════════════════
function StockAnalysisScreen({symbol,onClose,onOpenSizer,onOpenJournal}){
  const sym=symbol.toUpperCase().trim();
  const stock=ALL_STOCKS.find(s=>s.symbol===sym);
  const news=NEWS_DB.filter(n=>n.symbol===sym);
  const earning=EARNINGS_DATA.find(e=>e.symbol===sym);
  const earningDays=earning?daysUntil(earning.date):null;
  const [aiSummary,setAiSummary]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [livePrice,setLivePrice]=useState(null);
  const mono="'IBM Plex Mono',monospace";
  const heebo="'Heebo',sans-serif";

  useEffect(()=>{
    setLivePrice(null);
    apiCall(`/api/market/bars/${sym}`)
      .then(r=>r.json())
      .then(d=>{const arr=Array.isArray(d?.results)?d.results:[];if(arr.length>0)setLivePrice(arr[arr.length-1].c);})
      .catch(()=>{});
  },[sym]);

  function buildFallback(){
    if(!stock)return`אין נתונים מקומיים עבור ${sym}.`;
    const rsiNote=stock.rsi<30?"RSI נמוך מ-30 — מצב מכור-יתר":stock.rsi>70?"RSI גבוה מ-70 — מצב קנוי-יתר":`RSI ${stock.rsi} — בטווח נורמלי`;
    const macdNote=`MACD ${stock.macd>0?"חיובי":"שלילי"} (${stock.macd})`;
    const emaNote=`המחיר ${stock.price>stock.ema20?"מעל":"מתחת"} EMA20`;
    const earnNote=earningDays!==null&&earningDays>=0&&earningDays<=7?` | דיווח רבעוני בעוד ${earningDays} ימים`:"";
    return`${rsiNote}. ${macdNote}. ${emaNote}. ציון כולל: ${stock.total}/100.${earnNote}`;
  }

  async function generateAI(){
    setAiLoading(true);setAiSummary(null);
    try{
      let ctx=stock
        ?`מניה: ${sym}. מחיר: ${stock.price}. שינוי: ${stock.change}%. RSI: ${stock.rsi}. MACD: ${stock.macd}. מחיר ${stock.price>stock.ema20?"מעל":"מתחת"} EMA20. EMA20 ${stock.ema20>stock.ema50?"מעל":"מתחת"} EMA50. ציון טכני: ${stock.tech}/100. ציון פונד': ${stock.fund}/100. ציון סנטימנט: ${stock.sent}/100. תמיכה: ${stock.support}. התנגדות: ${stock.resist}.`
        :`מניה: ${sym}. אין נתונים מקומיים.`;
      if(earningDays!==null&&earningDays>=0&&earningDays<=7)ctx+=` דיווח רבעוני בעוד ${earningDays} ימים.`;
      if(news.length>0)ctx+=` חדשות: ${news.slice(0,2).map(n=>n.headline).join('. ')}.`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,system:"אתה מנתח נתוני מסחר. סכם בעברית קצרה את הנתונים הטכניים הבאים בלי להמליץ קנה/מכור. הצג רק עובדות ומה הנתונים מראים. 3 משפטים קצרים.",messages:[{role:"user",content:ctx}]})});
      const d=await res.json();
      const txt=d.content?.[0]?.text;
      setAiSummary(txt||buildFallback());
    }catch{setAiSummary(buildFallback());}
    setAiLoading(false);
  }
  useEffect(()=>{generateAI();},[sym]);

  const sc=(s)=>s>=65?"#00ff87":s>=40?"#ffd93d":"#ff6b6b";
  const rsiColor=stock?(stock.rsi<30?"#00ff87":stock.rsi>70?"#ff6b6b":"#ffd93d"):"#aaa";

  const Row=({label,value,valueColor="#fff",valueFont=mono})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"#060608",borderRadius:10,marginBottom:8,direction:"rtl"}}>
      <span style={{color:"#888",fontSize:13,flexShrink:0,fontFamily:heebo}}>{label}</span>
      <span style={{color:valueColor,fontSize:13,fontWeight:700,fontFamily:valueFont,textAlign:"left"}}>{value}</span>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"#060608",zIndex:300,display:"flex",flexDirection:"column",direction:"rtl",fontFamily:heebo}}>
      <style>{CSS}</style>
      {/* Sticky header */}
      <div style={{background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
        <button onClick={onClose} style={{background:"#1a1a2e",border:"none",color:"#888",width:34,height:34,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0,flexWrap:"wrap"}}>
          <span style={{color:"#fff",fontSize:18,fontWeight:700,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>{sym}</span>
          {stock&&<Badge sig={stock.sig} sb={stock.sb} sc={stock.sc}/>}
          {stock&&<span style={{color:stock.change>=0?"#00ff87":"#ff6b6b",fontSize:14,fontWeight:700,fontFamily:mono,whiteSpace:"nowrap"}}>{stock.change>=0?"+":""}{stock.change}%</span>}
        </div>
        <span style={{color:"#fff",fontSize:20,fontWeight:700,fontFamily:mono,flexShrink:0}}>
          {livePrice!=null?`$${livePrice.toFixed(2)}`:stock?`$${stock.price}`:""}
        </span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 24px"}}>

        {/* Block 0: TradingView Chart */}
        <TVChart symbol={sym} />

        {/* Block 1: Technical */}
        {stock&&(
          <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:14,padding:"14px",marginBottom:12}}>
            <div style={{color:"#555",fontSize:13,marginBottom:10,letterSpacing:.5}}>📊 ניתוח טכני</div>
            <Row label="RSI" value={`${stock.rsi} — ${stock.rsi<30?"מכור-יתר":stock.rsi>70?"קנוי-יתר":"נורמלי"}`} valueColor={rsiColor}/>
            <Row label="MACD" value={stock.macd} valueColor={stock.macd>=0?"#00ff87":"#ff6b6b"}/>
            <Row label="מחיר vs EMA20" value={stock.price>stock.ema20?"מעל EMA20":"מתחת EMA20"} valueColor={stock.price>stock.ema20?"#00ff87":"#ff6b6b"}/>
            <Row label="EMA20 vs EMA50" value={stock.ema20>stock.ema50?"EMA20 מעל EMA50":"EMA20 מתחת EMA50"} valueColor={stock.ema20>stock.ema50?"#00ff87":"#ff6b6b"}/>
            <Row label="נפח מסחר (x)" value={stock.vol} valueColor={stock.vol>2.8?"#00ff87":"#aaa"}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
              {[{l:"טכני",v:stock.tech},{l:"פונדמנטלי",v:stock.fund},{l:"סנטימנט",v:stock.sent}].map(({l,v})=>(
                <div key={l} style={{background:"#060608",borderRadius:10,padding:"10px",textAlign:"center"}}>
                  <div style={{color:sc(v),fontSize:18,fontWeight:700,fontFamily:mono}}>{v}</div>
                  <div style={{color:"#888",fontSize:11,marginTop:3,fontFamily:heebo}}>{l}</div>
                  <div style={{height:3,background:"#1a1a2e",borderRadius:2,marginTop:6}}><div style={{width:`${v}%`,height:"100%",background:sc(v),borderRadius:2}}/></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block 2: Support/Resistance */}
        {stock&&(
          <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:14,padding:"14px",marginBottom:12}}>
            <div style={{color:"#555",fontSize:13,marginBottom:10,letterSpacing:.5}}>🎯 תמיכה והתנגדות</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{l:"תמיכה",v:`$${stock.support}`,c:"#00ff87"},{l:"התנגדות",v:`$${stock.resist}`,c:"#ff6b6b"},{l:"סטופ מחושב",v:`$${stock.stop}`,c:"#ff6b6b"},{l:"יעד",v:`$${stock.target}`,c:"#00ff87"}].map(({l,v,c})=>(
                <div key={l} style={{background:"#060608",borderRadius:10,padding:"12px"}}>
                  <div style={{color:"#888",fontSize:11,marginBottom:6,fontFamily:heebo}}>{l}</div>
                  <div style={{color:c,fontSize:18,fontWeight:700,fontFamily:mono}}>{v}</div>
                </div>
              ))}
            </div>
            <Row label="R:R יחס" value={`${stock.rr}:1`} valueColor={stock.rr>=2?"#00ff87":"#ffd93d"}/>
            {stock.rr<2&&<div style={{background:"#ffd93d12",border:"1px solid #ffd93d35",borderRadius:10,padding:"9px 12px",fontSize:13,color:"#ffd93d"}}>⚠️ R:R נמוך מ-2:1 — שקול לדלג על העסקה</div>}
          </div>
        )}

        {/* Block 3: News */}
        {news.length>0&&(
          <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:14,padding:"14px",marginBottom:12}}>
            <div style={{color:"#555",fontSize:13,marginBottom:10,letterSpacing:.5}}>📰 חדשות אחרונות</div>
            {news.slice(0,3).map(n=>{
              const sm=SENT_META[n.sent];
              return(
                <div key={n.id} style={{background:sm.bg,border:`1px solid ${sm.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{color:sm.color,fontSize:12,fontWeight:700}}>{sm.icon} {n.pct}</span>
                    <span style={{color:"#555",fontSize:12}}>{n.source}</span>
                  </div>
                  <div style={{color:"#ccc",fontSize:12,lineHeight:1.5}}>{n.headline}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Block 4: Earnings */}
        {earningDays!==null&&earningDays>=0&&earningDays<=14&&(
          <div style={{background:"#fb923c18",border:"1px solid #fb923c40",borderRadius:14,padding:"14px",marginBottom:12}}>
            <div style={{color:"#555",fontSize:13,marginBottom:8,letterSpacing:.5}}>📅 דיווח רבעוני</div>
            <div style={{color:"#fb923c",fontSize:14,fontWeight:700}}>
              {earningDays===0?"דיווח היום!":earningDays===1?"דיווח מחר":`דיווח בעוד ${earningDays} ימים`}
            </div>
            <div style={{color:"#888",fontSize:13,marginTop:4}}>{earning.date} · {earning.time==="after"?"אחרי סגירה":"לפני פתיחה"}</div>
          </div>
        )}

        {/* Block 5: AI Summary */}
        <div style={{background:"#0a0a12",border:"1px solid #a78bfa30",borderRadius:14,padding:"14px",marginBottom:12}}>
          <div style={{color:"#555",fontSize:13,marginBottom:10,letterSpacing:.5}}>🤖 סיכום נתונים AI</div>
          {aiLoading?(
            <div style={{color:"#a78bfa",fontSize:13,animation:"pulse 1.5s infinite"}}>מנתח נתונים...</div>
          ):(
            <div style={{color:"#ccc",fontSize:13,lineHeight:1.8}}>{aiSummary}</div>
          )}
          <button onClick={generateAI} disabled={aiLoading} style={{marginTop:10,background:"#a78bfa20",border:"1px solid #a78bfa40",borderRadius:8,color:"#a78bfa",fontSize:13,padding:"7px 14px",cursor:"pointer",fontFamily:heebo}}>
            {aiLoading?"טוען...":"רענן ניתוח"}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <button onClick={()=>onOpenSizer&&onOpenSizer(sym)} style={{background:"#ffd93d20",border:"1px solid #ffd93d40",borderRadius:12,color:"#ffd93d",fontSize:13,padding:"12px 6px",cursor:"pointer",fontFamily:heebo,fontWeight:700}}>📐 Position Size</button>
          <button onClick={()=>onOpenJournal&&onOpenJournal(sym)} style={{background:"#00ff8720",border:"1px solid #00ff8740",borderRadius:12,color:"#00ff87",fontSize:13,padding:"12px 6px",cursor:"pointer",fontFamily:heebo,fontWeight:700}}>📋 יומן</button>
          <button onClick={onClose} style={{background:"#1a1a2e",border:"1px solid #2a2a3e",borderRadius:12,color:"#888",fontSize:13,padding:"12px 6px",cursor:"pointer",fontFamily:heebo,fontWeight:700}}>✕ סגור</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PRE-TRADE AI COACH — real-time feedback before every trade
// ══════════════════════════════════════════════════════════════════════
function PreTradeAdvisor({emotional, tradeCount, todayPnl, profile}){
  const port    = profile?.portfolio    || 50000;
  const risk    = profile?.riskPerTrade || 1;
  const riskAmt = port * risk / 100;

  const maxLoss     = port * (profile?.maxDailyLoss || 3) / 100;
  const lossAmt     = Math.abs(Math.min(0, todayPnl));
  const lossPercent = (lossAmt / maxLoss) * 100;

  const isRevenge = emotional.state === "revenge";
  const isTilt    = emotional.state === "tilt";

  // Earnings today or tomorrow
  const urgentEarnings = EARNINGS_DATA
    .map(e => ({...e, days: daysUntil(e.date)}))
    .filter(e => e.days >= 0 && e.days <= 1);

  // Stocks with RSI > 70
  const overbought = ALL_STOCKS.filter(s => s.rsi > 70);
  const fg         = FEAR_GREED_VALUE;
  const fgExtreme  = fg <= 20 || fg >= 85;

  // ── Build verdict ──────────────────────────────────────────────────
  let verdict, color, bg, border, icon;

  if (isRevenge) {
    icon    = "🔴";
    color   = "#ff6b6b";
    bg      = "#ff6b6b12";
    border  = "#ff6b6b55";
    verdict = "עצור! מצב Revenge זוהה — אל תיכנס לעסקה כרגע";
  } else if (isTilt && urgentEarnings.length > 0) {
    icon    = "🔴";
    color   = "#ff6b6b";
    bg      = "#ff6b6b12";
    border  = "#ff6b6b55";
    verdict = `Tilt + דיווח ${urgentEarnings[0].symbol} היום — המתן`;
  } else if (isRevenge || (isTilt && lossPercent > 50)) {
    icon    = "🔴";
    color   = "#ff6b6b";
    bg      = "#ff6b6b12";
    border  = "#ff6b6b55";
    verdict = `Tilt + ${lossPercent.toFixed(0)}% מהמגבלה היומית — עצור`;
  } else if (isTilt) {
    icon    = "🟡";
    color   = "#ffd93d";
    bg      = "#ffd93d10";
    border  = "#ffd93d45";
    verdict = "מצב Tilt — הקטן פוזיציות ב-50% ופעל לפי תוכנית בלבד";
  } else if (urgentEarnings.length > 0) {
    icon    = "🟡";
    color   = "#ffd93d";
    bg      = "#ffd93d10";
    border  = "#ffd93d45";
    verdict = `דיווח ${urgentEarnings.map(e=>e.symbol).join(', ')} היום — הימנע מפוזיציות גדולות`;
  } else if (overbought.length >= 14) {
    icon    = "🟡";
    color   = "#ffd93d";
    bg      = "#ffd93d10";
    border  = "#ffd93d45";
    verdict = `RSI גבוה ב-${overbought.length} מניות — שוק מתוח, נתונים מעורבים`;
  } else if (fgExtreme && fg <= 20) {
    icon    = "🟡";
    color   = "#ffd93d";
    bg      = "#ffd93d10";
    border  = "#ffd93d45";
    verdict = `פחד קיצוני (F&G ${fg}) — אל תמכור בפאניקה, בדוק תוכנית`;
  } else {
    icon    = "🟢";
    color   = "#00ff87";
    bg      = "#00ff8712";
    border  = "#00ff8740";
    const os = ALL_STOCKS.filter(s => s.rsi < 30).length;
    verdict = os > 2
      ? `מצב תקין · ${os} מניות RSI נמוך — נתונים חיוביים · פעל לפי התוכנית`
      : "מצב רגשי תקין · שוק ניתן למסחר · פעל לפי התוכנית שלך";
  }

  // ── Position size recommendation ───────────────────────────────────
  let posMsg;
  if (isRevenge)                         posMsg = "אסור לפתוח עסקה";
  else if (isTilt || lossPercent > 50)   posMsg = `$${(riskAmt * 0.5).toFixed(0)} (50% מהרגיל)`;
  else                                   posMsg = `$${riskAmt.toFixed(0)} · סיכון ${risk}%`;

  // ── Warning pills ──────────────────────────────────────────────────
  const pills = [];
  if (isRevenge)  pills.push({label:"⛔ Revenge", c:"#ff6b6b"});
  else if (isTilt) pills.push({label:"⚠️ Tilt",   c:"#ffd93d"});
  urgentEarnings.forEach(e => pills.push({label:`📅 ${e.symbol} ${e.days===0?"היום":"מחר"}`, c:"#fb923c"}));
  overbought.filter(s=>s.total>=60).slice(0,2).forEach(s => pills.push({label:`RSI ${s.rsi} ${s.symbol}`, c:"#ffd93d"}));
  if (fgExtreme) pills.push({label:`F&G ${fg}`, c:fg<=20?"#ff6b6b":"#00cc55"});

  return (
    <div style={{margin:"6px 20px 0", background:bg, border:`1px solid ${border}`, borderRadius:12, padding:"10px 14px", flexShrink:0, direction:"rtl"}}>
      <div style={{display:"flex", alignItems:"flex-start", gap:10}}>
        <span style={{fontSize:16, flexShrink:0, marginTop:2}}>{icon}</span>
        <div style={{flex:1, minWidth:0}}>
          <div style={{color:"#555", fontSize:13, marginBottom:3, letterSpacing:.5}}>🤖 AI COACH · המלצה לפני עסקה</div>
          <div style={{color, fontSize:13, fontWeight:700, lineHeight:1.5}}>{verdict}</div>
        </div>
        <div style={{flexShrink:0, textAlign:"left", minWidth:90}}>
          <div style={{color:"#999", fontSize:9, marginBottom:2}}>גודל מומלץ</div>
          <div style={{color, fontSize:13, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace"}}>{posMsg}</div>
        </div>
      </div>
      {pills.length > 0 && (
        <div style={{display:"flex", gap:6, marginTop:8, flexWrap:"wrap"}}>
          {pills.map((p,i) => (
            <span key={i} style={{background:p.c+"20", color:p.c, fontSize:13, padding:"2px 8px", borderRadius:20, fontWeight:700, border:`1px solid ${p.c}40`}}>{p.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── REGISTRATION SCREEN ───────────────────────────────────────────────
const AUTH_API='https://tradeos-backend-production-e5fd.up.railway.app';
const TOKEN_KEY='tradeos_token';

const DAYS_HE=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
function apiCall(path,opts={}){
  const token=localStorage.getItem(TOKEN_KEY);
  return fetch(AUTH_API+path,{...opts,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...(opts.headers||{})}});
}
function normalizeTrade(t){
  const d=t.date?new Date(t.date):null;
  const ca=t.created_at?new Date(t.created_at):null;
  const hNum=ca?ca.getHours():null;
  return{...t,
    followedPlan:t.followed_plan??t.followedPlan??true,
    pnl:parseFloat(t.pnl)||0,
    entry:parseFloat(t.entry)||0,
    exit:parseFloat(t.exit)||0,
    qty:parseFloat(t.qty)||0,
    day:d?DAYS_HE[d.getUTCDay()]:'',
    hour:t.hour||(hNum!=null?`${String(hNum).padStart(2,'0')}:00`:''),
  };
}

const ONBOARDING_KEY = "tradeos_user_v1";

const TRADING_STYLES=[
  {value:"swing", label:"סווינג",    desc:"החזקה ימים–שבועות"},
  {value:"daily", label:"יומי",      desc:"פתיחה וסגירה ביום"},
  {value:"both",  label:"שניהם",    desc:"גמישות מלאה"},
  {value:"position",label:"פוזיציה",desc:"החזקה שבועות–חודשים"},
];

const PORTFOLIO_SIZES=[
  {value:"small",  label:"עד $10K"},
  {value:"medium", label:"$10K–$50K"},
  {value:"large",  label:"$50K–$200K"},
  {value:"xlarge", label:"מעל $200K"},
];

const LEGAL_TEXT=`TradeOS היא כלי עזר לסוחרים בלבד. המערכת אינה מורשית לייעוץ השקעות, אינה בנק ואינה ברוקר. כל המידע המוצג הוא לצרכי מחקר בלבד. החלטות מסחר והשקעה הן באחריות המשתמש בלבד. ביצועי עבר אינם מעידים על תשואות עתידיות.`;

function LoginScreen({onLogin,onGoRegister}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function submit(e){
    e.preventDefault();
    setLoading(true);setError('');
    try{
      const res=await fetch(`${AUTH_API}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'שגיאה בהתחברות');
      onLogin(data.token,data.user);
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  const inp={width:'100%',background:'#0d0d18',border:'1px solid #1e1e2e',borderRadius:10,padding:'12px 14px',color:'#fff',fontSize:14,fontFamily:"'Heebo',sans-serif",outline:'none'};
  const lbl={color:'#888',fontSize:12,marginBottom:5,display:'block'};

  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#060608',direction:'rtl',fontFamily:"'Heebo',sans-serif",padding:24}}>
      <style>{CSS}</style>
      <div style={{marginBottom:32,textAlign:'center'}}>
        <div style={{width:52,height:52,background:'linear-gradient(135deg,#00ff87,#00cc6a)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#000',fontFamily:"'Syne',sans-serif",margin:'0 auto 12px'}}>TO</div>
        <div style={{color:'#fff',fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:2}}>TRADEOS</div>
        <div style={{color:'#555',fontSize:13,marginTop:6}}>פלטפורמת המסחר החכמה</div>
      </div>
      <div style={{background:'#0a0a12',border:'1px solid #1a1a2e',borderRadius:20,padding:'32px 28px',maxWidth:400,width:'100%'}}>
        <div style={{color:'#fff',fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:6}}>התחברות</div>
        <div style={{color:'#444',fontSize:12,marginBottom:24}}>ברוך הבא חזרה</div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={lbl}>אימייל</label>
            <input type="email" style={{...inp,direction:'ltr'}} placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
          </div>
          <div>
            <label style={lbl}>סיסמא</label>
            <input type="password" style={{...inp,direction:'ltr'}} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/>
          </div>
          {error&&<div style={{background:'#ff6b6b12',border:'1px solid #ff6b6b30',borderRadius:8,padding:'10px 12px',color:'#ff6b6b',fontSize:13}}>{error}</div>}
          <button type="submit" className="btn" disabled={loading} style={{background:'linear-gradient(135deg,#00ff87,#00cc6a)',border:'none',borderRadius:12,color:'#000',fontSize:15,fontWeight:800,padding:'14px',cursor:'pointer',fontFamily:"'Heebo',sans-serif",opacity:loading?0.7:1,marginTop:4}}>
            {loading?'מתחבר...':'התחבר'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:20,color:'#555',fontSize:13}}>
          אין לך חשבון?{' '}
          <button onClick={onGoRegister} style={{background:'none',border:'none',color:'#00ff87',cursor:'pointer',fontSize:13,fontFamily:"'Heebo',sans-serif",fontWeight:700}}>הרשם עכשיו</button>
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({onRegister,onGoLogin}){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({fullName:'',email:'',password:'',confirmPassword:'',country:''});
  const [pref,setPref]=useState({experienceYears:'',portfolioSize:'',tradingStyle:''});
  const [checks,setChecks]=useState({terms:false,age:false,noAdvice:false});
  const [signature,setSignature]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [fieldErrors,setFieldErrors]=useState({});

  const inp={width:'100%',background:'#0d0d18',border:'1px solid #1e1e2e',borderRadius:10,padding:'12px 14px',color:'#fff',fontSize:14,fontFamily:"'Heebo',sans-serif",outline:'none'};
  const lbl={color:'#888',fontSize:12,marginBottom:5,display:'block'};

  function validateStep0(){
    const errs={};
    if(form.fullName.trim().length<2)errs.fullName='שם מלא נדרש';
    if(!/\S+@\S+\.\S+/.test(form.email))errs.email='אימייל לא תקין';
    if(form.password.length<6)errs.password='סיסמא — לפחות 6 תווים';
    if(form.password!==form.confirmPassword)errs.confirmPassword='הסיסמאות אינן תואמות';
    setFieldErrors(errs);
    return Object.keys(errs).length===0;
  }

  const allChecked=checks.terms&&checks.age&&checks.noAdvice;
  const signatureValid=signature.trim().toLowerCase()===form.fullName.trim().toLowerCase()&&signature.trim().length>=2;
  const canSubmit=allChecked&&signatureValid;

  async function submit(){
    if(!canSubmit)return;
    setLoading(true);setError('');
    try{
      const body={full_name:form.fullName.trim(),email:form.email.trim(),password:form.password,country:form.country.trim()||null,experience:pref.experienceYears||null,portfolio_size:pref.portfolioSize||null,trading_style:pref.tradingStyle||null,disclaimer_signed:true,disclaimer_signed_at:new Date().toISOString(),signature:signature.trim()};
      const res=await fetch(`${AUTH_API}/api/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'שגיאה בהרשמה');
      const answers={fullName:form.fullName.trim(),country:form.country.trim(),experienceYears:pref.experienceYears,portfolioSize:pref.portfolioSize,tradingStyle:pref.tradingStyle,signature:signature.trim(),agreedAt:new Date().toISOString()};
      onRegister(data.token,data.user,answers);
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  const stepLabels=['פרטי חשבון','פרופיל מסחר','הצהרה משפטית'];

  return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#060608',direction:'rtl',fontFamily:"'Heebo',sans-serif",padding:24,overflowY:'auto'}}>
      <style>{CSS}</style>
      <div style={{marginBottom:22,textAlign:'center'}}>
        <div style={{width:48,height:48,background:'linear-gradient(135deg,#00ff87,#00cc6a)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#000',fontFamily:"'Syne',sans-serif",margin:'0 auto 10px'}}>TO</div>
        <div style={{color:'#fff',fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:2}}>TRADEOS</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:18}}>
        {stepLabels.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,
              background:step===i?'linear-gradient(135deg,#00ff87,#00cc6a)':step>i?'#00cc6a30':'#0d0d18',
              color:step===i?'#000':step>i?'#00cc6a':'#333',
              border:`1px solid ${step===i?'transparent':step>i?'#00cc6a40':'#1a1a2e'}`}}>
              {step>i?'✓':i+1}
            </div>
            {i<stepLabels.length-1&&<div style={{width:24,height:1,background:'#1a1a2e'}}/>}
          </div>
        ))}
      </div>
      <div style={{background:'#0a0a12',border:'1px solid #1a1a2e',borderRadius:20,padding:'28px 24px',maxWidth:460,width:'100%'}}>

        {step===0&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{color:'#fff',fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>פרטי חשבון</div>
            <div style={{color:'#444',fontSize:12,marginBottom:4}}>שלב 1 מתוך 3</div>
            {[
              {key:'fullName',label:'שם מלא',type:'text',ph:'ישראל ישראלי',rtl:true,req:true},
              {key:'email',label:'אימייל',type:'email',ph:'you@example.com',req:true},
              {key:'password',label:'סיסמא',type:'password',ph:'לפחות 6 תווים',req:true},
              {key:'confirmPassword',label:'אישור סיסמא',type:'password',ph:'הזן שוב',req:true},
              {key:'country',label:'מדינה (רשות)',type:'text',ph:'ישראל',rtl:true},
            ].map(f=>(
              <div key={f.key}>
                <label style={{...lbl,color:fieldErrors[f.key]?'#ff6b6b':'#888'}}>{f.label}{f.req&&<span style={{color:'#ff6b6b'}}> *</span>}</label>
                <input type={f.type} style={{...inp,borderColor:fieldErrors[f.key]?'#ff6b6b40':'#1e1e2e',direction:f.rtl?'rtl':'ltr'}}
                  placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(v=>({...v,[f.key]:e.target.value}))}/>
                {fieldErrors[f.key]&&<div style={{color:'#ff6b6b',fontSize:11,marginTop:3}}>{fieldErrors[f.key]}</div>}
              </div>
            ))}
            <button className="btn" onClick={()=>{if(validateStep0())setStep(1);}}
              style={{background:'linear-gradient(135deg,#00ff87,#00cc6a)',border:'none',borderRadius:12,color:'#000',fontSize:15,fontWeight:800,padding:'13px',cursor:'pointer',fontFamily:"'Heebo',sans-serif",marginTop:4}}>
              המשך
            </button>
            <div style={{textAlign:'center',color:'#555',fontSize:13}}>
              יש לך חשבון?{' '}
              <button onClick={onGoLogin} style={{background:'none',border:'none',color:'#00ff87',cursor:'pointer',fontSize:13,fontFamily:"'Heebo',sans-serif",fontWeight:700}}>התחבר</button>
            </div>
          </div>
        )}

        {step===1&&(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{color:'#fff',fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>פרופיל מסחר</div>
            <div style={{color:'#444',fontSize:12,marginBottom:4}}>שלב 2 מתוך 3</div>
            <div>
              <label style={lbl}>שנות ניסיון במסחר</label>
              <select style={{...inp,cursor:'pointer',direction:'rtl'}} value={pref.experienceYears} onChange={e=>setPref(v=>({...v,experienceYears:e.target.value}))}>
                <option value="">בחר...</option>
                <option value="0">פחות משנה</option>
                <option value="1">1–2 שנים</option>
                <option value="3">3–5 שנים</option>
                <option value="6">6–10 שנים</option>
                <option value="11">מעל 10 שנים</option>
              </select>
            </div>
            <div>
              <label style={lbl}>גודל תיק משוער</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {PORTFOLIO_SIZES.map(p=>(
                  <button key={p.value} className="btn" onClick={()=>setPref(v=>({...v,portfolioSize:p.value}))}
                    style={{padding:'10px',borderRadius:10,border:`1px solid ${pref.portfolioSize===p.value?'#00ff87':'#1e1e2e'}`,
                      background:pref.portfolioSize===p.value?'#00ff8715':'#0d0d18',
                      color:pref.portfolioSize===p.value?'#00ff87':'#666',fontSize:13,cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>סגנון מסחר מועדף</label>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {TRADING_STYLES.map(t=>(
                  <button key={t.value} className="btn" onClick={()=>setPref(v=>({...v,tradingStyle:t.value}))}
                    style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${pref.tradingStyle===t.value?'#00ff87':'#1e1e2e'}`,
                      background:pref.tradingStyle===t.value?'#00ff8715':'#0d0d18',
                      display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                    <span style={{color:pref.tradingStyle===t.value?'#00ff87':'#ccc',fontSize:14,fontFamily:"'Heebo',sans-serif",fontWeight:600}}>{t.label}</span>
                    <span style={{color:'#555',fontSize:12,fontFamily:"'Heebo',sans-serif"}}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button className="btn" onClick={()=>setStep(0)} style={{flex:1,padding:'13px',borderRadius:12,border:'1px solid #1a1a2e',background:'#0d0d18',color:'#666',fontSize:14,cursor:'pointer',fontFamily:"'Heebo',sans-serif",fontWeight:700}}>חזרה</button>
              <button className="btn" onClick={()=>setStep(2)} style={{flex:2,background:'linear-gradient(135deg,#00ff87,#00cc6a)',border:'none',borderRadius:12,color:'#000',fontSize:15,fontWeight:800,padding:'13px',cursor:'pointer',fontFamily:"'Heebo',sans-serif"}}>המשך</button>
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{color:'#fff',fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>הצהרה משפטית</div>
            <div style={{color:'#444',fontSize:12,marginBottom:4}}>שלב 3 מתוך 3</div>
            <div style={{background:'#060608',border:'1px solid #1a1a2e',borderRadius:12,padding:'14px',maxHeight:110,overflowY:'auto'}}>
              <p style={{color:'#888',fontSize:12,lineHeight:1.7}}>{LEGAL_TEXT}</p>
            </div>
            {[
              {key:'terms',label:'קראתי והבנתי את תנאי השימוש'},
              {key:'age',label:'אני מאשר/ת שאני מעל גיל 18'},
              {key:'noAdvice',label:'אני מבין/ה שאין כאן ייעוץ השקעות'},
            ].map(c=>(
              <div key={c.key} className="btn" onClick={()=>setChecks(v=>({...v,[c.key]:!v[c.key]}))}
                style={{display:'flex',alignItems:'center',gap:12,background:'#0d0d18',border:`1px solid ${checks[c.key]?'#00ff8740':'#1a1a2e'}`,borderRadius:10,padding:'12px 14px',cursor:'pointer'}}>
                <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checks[c.key]?'#00ff87':'#333'}`,background:checks[c.key]?'#00ff87':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:12,color:'#000',fontWeight:800}}>
                  {checks[c.key]?'✓':''}
                </div>
                <span style={{color:checks[c.key]?'#ccc':'#555',fontSize:13,fontFamily:"'Heebo',sans-serif"}}>{c.label}</span>
              </div>
            ))}
            <div>
              <label style={{...lbl,color:signature&&!signatureValid?'#ff6b6b':'#888'}}>חתימה דיגיטלית — הקלד/י שם מלא <span style={{color:'#ff6b6b'}}>*</span></label>
              <input style={{...inp,borderColor:signature&&!signatureValid?'#ff6b6b40':'#1e1e2e',fontStyle:'italic',direction:'rtl'}}
                placeholder={form.fullName||'שם מלא'} value={signature} onChange={e=>setSignature(e.target.value)}/>
              {signature&&!signatureValid&&<div style={{color:'#ff6b6b',fontSize:11,marginTop:3}}>החתימה חייבת להתאים לשם המלא</div>}
            </div>
            {error&&<div style={{background:'#ff6b6b12',border:'1px solid #ff6b6b30',borderRadius:8,padding:'10px 12px',color:'#ff6b6b',fontSize:13}}>{error}</div>}
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button className="btn" onClick={()=>setStep(1)} style={{flex:1,padding:'13px',borderRadius:12,border:'1px solid #1a1a2e',background:'#0d0d18',color:'#666',fontSize:14,cursor:'pointer',fontFamily:"'Heebo',sans-serif",fontWeight:700}}>חזרה</button>
              <button className="btn" onClick={submit} disabled={!canSubmit||loading}
                style={{flex:2,background:canSubmit?'linear-gradient(135deg,#00ff87,#00cc6a)':'#1a1a2e',border:'none',borderRadius:12,color:canSubmit?'#000':'#333',fontSize:15,fontWeight:800,padding:'13px',cursor:canSubmit?'pointer':'default',fontFamily:"'Heebo',sans-serif",opacity:loading?0.7:1}}>
                {loading?'נרשם...':'הרשמה'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function OnboardingScreen({onComplete}){
  const [step,setStep]=useState(0);
  const [details,setDetails]=useState({fullName:"",country:"",experienceYears:"",portfolioSize:"",tradingStyle:""});
  const [nameError,setNameError]=useState(false);
  const [checks,setChecks]=useState({terms:false,age:false,noAdvice:false});
  const [signature,setSignature]=useState("");

  const detailsValid=details.fullName.trim().length>=2;
  const allChecked=checks.terms&&checks.age&&checks.noAdvice;
  const signatureValid=signature.trim().toLowerCase()===details.fullName.trim().toLowerCase()&&signature.trim().length>=2;
  const canSubmit=allChecked&&signatureValid;

  function goToStep2(){
    if(!detailsValid){setNameError(true);return;}
    setNameError(false);
    setStep(1);
  }

  function submit(){
    if(!canSubmit) return;
    const data={...details,fullName:details.fullName.trim(),signature:signature.trim(),agreedAt:new Date().toISOString()};
    onComplete(data);
  }

  const inputStyle={width:"100%",background:"#0d0d18",border:"1px solid #1e1e2e",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"};
  const labelStyle={color:"#888",fontSize:12,marginBottom:5,display:"block"};

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#060608",direction:"rtl",fontFamily:"'Heebo',sans-serif",padding:24,overflowY:"auto"}}>
      <style>{CSS}</style>

      {/* Logo */}
      <div style={{marginBottom:32,textAlign:"center"}}>
        <div style={{width:52,height:52,background:"linear-gradient(135deg,#00ff87,#00cc6a)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#000",fontFamily:"'Syne',sans-serif",margin:"0 auto 12px"}}>TO</div>
        <div style={{color:"#fff",fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:2}}>TRADEOS</div>
        <div style={{color:"#555",fontSize:12,marginTop:4}}>הרשמה לפלטפורמה</div>
      </div>

      {/* Step indicators */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28}}>
        {[0,1].map(i=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,
              background:step===i?"linear-gradient(135deg,#00ff87,#00cc6a)":step>i?"#00cc6a30":"#0d0d18",
              color:step===i?"#000":step>i?"#00cc6a":"#333",
              border:`1px solid ${step===i?"transparent":step>i?"#00cc6a40":"#1a1a2e"}`}}>
              {step>i?"✓":i+1}
            </div>
            <span style={{fontSize:12,color:step===i?"#fff":step>i?"#00cc6a":"#333"}}>
              {i===0?"פרטים אישיים":"הצהרה משפטית"}
            </span>
            {i<1&&<div style={{width:24,height:1,background:"#1a1a2e"}}/>}
          </div>
        ))}
      </div>

      {step===0&&(
        <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:20,padding:"28px 24px",maxWidth:460,width:"100%"}}>
          <div style={{color:"#fff",fontSize:18,fontWeight:700,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>פרטים אישיים</div>
          <div style={{color:"#444",fontSize:12,marginBottom:24}}>שלב 1 מתוך 2</div>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label style={{...labelStyle,color:nameError?"#ff6b6b":"#888"}}>שם מלא <span style={{color:"#ff6b6b"}}>*</span></label>
              <input style={{...inputStyle,borderColor:nameError?"#ff6b6b40":"#1e1e2e"}}
                placeholder="ישראל ישראלי"
                value={details.fullName}
                onChange={e=>{setDetails(d=>({...d,fullName:e.target.value}));if(nameError)setNameError(false);}}
              />
              {nameError&&<div style={{color:"#ff6b6b",fontSize:11,marginTop:4}}>שם מלא הוא שדה חובה</div>}
            </div>

            <div>
              <label style={labelStyle}>מדינה</label>
              <input style={inputStyle} placeholder="ישראל" value={details.country}
                onChange={e=>setDetails(d=>({...d,country:e.target.value}))}/>
            </div>

            <div>
              <label style={labelStyle}>שנות ניסיון במסחר</label>
              <select style={{...inputStyle,cursor:"pointer"}}
                value={details.experienceYears}
                onChange={e=>setDetails(d=>({...d,experienceYears:e.target.value}))}>
                <option value="">בחר...</option>
                <option value="0">פחות משנה</option>
                <option value="1">1–2 שנים</option>
                <option value="3">3–5 שנים</option>
                <option value="6">6–10 שנים</option>
                <option value="11">מעל 10 שנים</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>גודל תיק משוער</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {PORTFOLIO_SIZES.map(p=>(
                  <button key={p.value} className="btn" onClick={()=>setDetails(d=>({...d,portfolioSize:p.value}))}
                    style={{padding:"10px",borderRadius:10,border:`1px solid ${details.portfolioSize===p.value?"#00ff87":"#1e1e2e"}`,
                      background:details.portfolioSize===p.value?"#00ff8715":"#0d0d18",
                      color:details.portfolioSize===p.value?"#00ff87":"#666",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>סגנון מסחר</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {TRADING_STYLES.map(ts=>(
                  <button key={ts.value} className="btn" onClick={()=>setDetails(d=>({...d,tradingStyle:ts.value}))}
                    style={{padding:"10px 8px",borderRadius:10,border:`1px solid ${details.tradingStyle===ts.value?"#00ff87":"#1e1e2e"}`,
                      background:details.tradingStyle===ts.value?"#00ff8715":"#0d0d18",
                      color:details.tradingStyle===ts.value?"#00ff87":"#666",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif",textAlign:"center"}}>
                    <div style={{fontWeight:600}}>{ts.label}</div>
                    <div style={{fontSize:10,opacity:.7,marginTop:2}}>{ts.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="btn" onClick={goToStep2}
            style={{marginTop:24,width:"100%",padding:"13px",borderRadius:12,border:"none",
              background:detailsValid?"linear-gradient(135deg,#00ff87,#00cc6a)":"#0d0d18",
              color:detailsValid?"#000":"#333",fontSize:15,fontWeight:800,cursor:detailsValid?"pointer":"default",
              fontFamily:"'Heebo',sans-serif",transition:"all .2s"}}>
            המשך לשלב 2 ›
          </button>
        </div>
      )}

      {step===1&&(
        <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:20,padding:"28px 24px",maxWidth:460,width:"100%"}}>
          <div style={{color:"#fff",fontSize:18,fontWeight:700,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>הצהרה משפטית</div>
          <div style={{color:"#444",fontSize:12,marginBottom:20}}>שלב 2 מתוך 2 — קרא בעיון</div>

          {/* Legal text box */}
          <div style={{background:"#070710",border:"1px solid #ff6b6b25",borderRadius:12,padding:"16px",marginBottom:20,color:"#aaa",fontSize:13,lineHeight:1.9,direction:"rtl"}}>
            {LEGAL_TEXT}
          </div>

          {/* Checkboxes */}
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            {[
              {key:"terms",  label:"קראתי והבנתי את תנאי השימוש"},
              {key:"age",    label:"אני מאשר שאני מעל גיל 18"},
              {key:"noAdvice",label:"אני מבין שהמערכת אינה מספקת ייעוץ פיננסי"},
            ].map(cb=>(
              <label key={cb.key} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",userSelect:"none"}}>
                <div onClick={()=>setChecks(c=>({...c,[cb.key]:!c[cb.key]}))}
                  style={{width:20,height:20,borderRadius:6,border:`1px solid ${checks[cb.key]?"#00ff87":"#2a2a3e"}`,
                    background:checks[cb.key]?"#00ff87":"transparent",display:"flex",alignItems:"center",justifyContent:"center",
                    flexShrink:0,transition:"all .15s",cursor:"pointer"}}>
                  {checks[cb.key]&&<span style={{color:"#000",fontSize:12,fontWeight:900}}>✓</span>}
                </div>
                <span style={{color:checks[cb.key]?"#ccc":"#666",fontSize:13}}>{cb.label}</span>
              </label>
            ))}
          </div>

          {/* Signature field */}
          <div style={{marginBottom:20}}>
            <label style={{...labelStyle,color:"#888"}}>
              חתימה דיגיטלית — הקלד את שמך המלא לאישור
            </label>
            <input style={{...inputStyle,borderColor:signature&&signatureValid?"#00ff8760":signature&&!signatureValid?"#ff6b6b40":"#1e1e2e"}}
              placeholder={details.fullName||"שמך המלא"}
              value={signature}
              onChange={e=>setSignature(e.target.value)}
            />
            {signature&&!signatureValid&&(
              <div style={{color:"#ff6b6b",fontSize:11,marginTop:4}}>החתימה חייבת להתאים לשם המלא שהזנת</div>
            )}
            {signature&&signatureValid&&(
              <div style={{color:"#00ff87",fontSize:11,marginTop:4}}>החתימה אומתה</div>
            )}
          </div>

          <div style={{display:"flex",gap:10}}>
            <button className="btn" onClick={()=>setStep(0)}
              style={{padding:"13px 16px",borderRadius:12,border:"1px solid #1a1a2e",background:"#0d0d18",
                color:"#555",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
              ‹ חזור
            </button>
            <button className="btn" onClick={submit}
              style={{flex:1,padding:"13px",borderRadius:12,border:"none",
                background:canSubmit?"linear-gradient(135deg,#00ff87,#00cc6a)":"#0d0d18",
                color:canSubmit?"#000":"#333",fontSize:14,fontWeight:800,
                cursor:canSubmit?"pointer":"default",fontFamily:"'Heebo',sans-serif",transition:"all .2s"}}>
              אני מסכים — כניסה למערכת
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// CANDLESTICK GUIDE
// ══════════════════════════════════════════════════════════════════════
const CANDLES = [
  {
    he:"דוג'י",en:"Doji",
    meaning:"אי-החלטיות בשוק — קונים ומוכרים מאוזנים. לרוב מסמן היפוך אפשרי.",
    signal:"המתנה",signalColor:"#ffd93d",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <line x1="20" y1="5" x2="20" y2="75" stroke="#aaa" strokeWidth="1.5"/>
        <rect x="8" y="37" width="24" height="6" rx="1" fill="none" stroke="#ffd93d" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    he:"פטיש",en:"Hammer",
    meaning:"לאחר ירידה — המוכרים ניסו לדחוף מחיר מטה אך הקונים החזירו. סימן היפוך שורי.",
    signal:"קנייה",signalColor:"#00ff87",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <line x1="20" y1="5" x2="20" y2="22" stroke="#aaa" strokeWidth="1.5"/>
        <rect x="8" y="22" width="24" height="18" rx="2" fill="#00ff8733" stroke="#00ff87" strokeWidth="2"/>
        <line x1="20" y1="40" x2="20" y2="75" stroke="#00ff87" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    he:"כוכב ערב",en:"Evening Star",
    meaning:"תבנית שלושה נרות — עצירת עלייה והיפוך דובי. מהימן ביותר לשורטים.",
    signal:"מכירה",signalColor:"#ff6b6b",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <rect x="10" y="50" width="20" height="22" rx="2" fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="2"/>
        <rect x="14" y="32" width="12" height="14" rx="2" fill="#ffd93d33" stroke="#ffd93d" strokeWidth="1.5"/>
        <rect x="10" y="8" width="20" height="20" rx="2" fill="#00ff8733" stroke="#00ff87" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="8" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="20" y1="72" x2="20" y2="75" stroke="#aaa" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    he:"כוכב בוקר",en:"Morning Star",
    meaning:"תבנית שלושה נרות — עצירת ירידה והיפוך שורי. אחד הסיגנלים האמינים ביותר.",
    signal:"קנייה",signalColor:"#00ff87",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <rect x="10" y="8" width="20" height="22" rx="2" fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="2"/>
        <rect x="14" y="34" width="12" height="14" rx="2" fill="#ffd93d33" stroke="#ffd93d" strokeWidth="1.5"/>
        <rect x="10" y="52" width="20" height="20" rx="2" fill="#00ff8733" stroke="#00ff87" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="8" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="20" y1="72" x2="20" y2="75" stroke="#aaa" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    he:"מעטפה שורית",en:"Bullish Engulfing",
    meaning:"נר ירוק גדול בולע לחלוטין נר אדום קודם — מומנטום קנייה חזק.",
    signal:"קנייה",signalColor:"#00ff87",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <rect x="13" y="28" width="14" height="20" rx="2" fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="1.5"/>
        <rect x="8" y="18" width="24" height="40" rx="2" fill="#00ff8733" stroke="#00ff87" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="18" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="20" y1="58" x2="20" y2="74" stroke="#aaa" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    he:"מעטפה דובית",en:"Bearish Engulfing",
    meaning:"נר אדום גדול בולע נר ירוק קודם — מומנטום מכירה חזק.",
    signal:"מכירה",signalColor:"#ff6b6b",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <rect x="13" y="30" width="14" height="20" rx="2" fill="#00ff8733" stroke="#00ff87" strokeWidth="1.5"/>
        <rect x="8" y="18" width="24" height="42" rx="2" fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="18" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="20" y1="60" x2="20" y2="74" stroke="#aaa" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    he:"הראשון חודר",en:"Piercing Line",
    meaning:"נר ירוק נפתח מתחת לשפל אך סוגר מעל אמצע הנר האדום — היפוך שורי.",
    signal:"קנייה",signalColor:"#00ff87",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <rect x="10" y="8" width="18" height="28" rx="2" fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="2"/>
        <rect x="12" y="30" width="18" height="30" rx="2" fill="#00ff8733" stroke="#00ff87" strokeWidth="2"/>
        <line x1="19" y1="5" x2="19" y2="8" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="21" y1="60" x2="21" y2="74" stroke="#aaa" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    he:"עיפרון",en:"Shooting Star",
    meaning:"גוף קטן עם צל עליון ארוך מאוד — הקונים נכשלו, סיגנל היפוך דובי.",
    signal:"מכירה",signalColor:"#ff6b6b",
    svg:(
      <svg viewBox="0 0 40 80" width={40} height={80}>
        <line x1="20" y1="6" x2="20" y2="52" stroke="#ff6b6b" strokeWidth="2"/>
        <rect x="8" y="52" width="24" height="16" rx="2" fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="2"/>
        <line x1="20" y1="68" x2="20" y2="74" stroke="#aaa" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function App(){
  const [tab,setTab]=useState("scanner");
  const [modal,setModal]=useState(null); // profile|sizer|circuit|journal|positions|coach|mental|earnings|econ|news|glossary|decision|insights|candles
  const [searchQuery,setSearchQuery]=useState("");
  const [analysisStock,setAnalysisStock]=useState(null);
  const [appTrades,setAppTrades]=useState([]);
  const [authUser,setAuthUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [authScreen,setAuthScreen]=useState('login');

  // Load saved onboarding answers
  const savedOnboarding=()=>{try{const v=localStorage.getItem(ONBOARDING_KEY);return v?JSON.parse(v):null;}catch{return null;}};
  const [onboarding,setOnboarding]=useState(()=>savedOnboarding());

  function buildProfileFromOnboarding(answers){
    const portfolioMap={small:8000,medium:30000,large:100000,xlarge:250000};
    const styleMap={swing:"swing",daily:"day",both:"swing",position:"swing"};
    const yrs=parseInt(answers.experienceYears)||0;
    const expLevel=yrs>=6?"professional":yrs>=3?"advanced":"beginner";
    return {
      name:answers.fullName||"סוחר",
      portfolio:portfolioMap[answers.portfolioSize]||50000,
      riskPerTrade:expLevel==="beginner"?1:expLevel==="professional"?2:1.5,
      maxDailyLoss:expLevel==="beginner"?2:3,
      style:styleMap[answers.tradingStyle]||"swing",
      experience:expLevel,
      portfolioSize:answers.portfolioSize||"medium",
      tradingStyle:answers.tradingStyle||"both",
    };
  }

  const [profile,setProfile]=useState(()=>{
    const saved=savedOnboarding();
    if(saved) return buildProfileFromOnboarding(saved);
    return {name:"סוחר",portfolio:50000,riskPerTrade:1,maxDailyLoss:3,style:"swing",experience:"intermediate",portfolioSize:"medium",tradingStyle:"both"};
  });
  const [circuitLocked,setCircuitLocked]=useState(false);
  const [revWarnDismissed,setRevWarnDismissed]=useState(false);
  const [tradeLocked,setTradeLocked]=useState(false);
  const [lockReason,setLockReason]=useState(null);
  const [showUnlockConfirm,setShowUnlockConfirm]=useState(false);
  const todayStr=new Date().toISOString().split('T')[0];
  const todayTrades=appTrades.filter(t=>t.date===todayStr||t.date?.startsWith(todayStr));
  const todayPnl=todayTrades.reduce((a,t)=>a+(parseFloat(t.pnl)||0),0);
  const tradeCount=todayTrades.length;
  const lastTradeTime=todayTrades.length>0?new Date(todayTrades[0].created_at||Date.now()).getTime():Date.now()-8*60000;
  const TOP=ALL_STOCKS.reduce((a,b)=>a.total>b.total?a:b);
  const emotional=calcEmotionalScore(tradeCount,appTrades);
  const showRevWarning=emotional.state==="revenge"&&!revWarnDismissed;

  useEffect(()=>{
    if(tradeLocked) return;
    const sorted=[...appTrades].sort((a,b)=>new Date(b.date)-new Date(a.date));
    let consecutive=0;
    for(const t of sorted){if(t.result==="loss")consecutive++;else break;}
    if(consecutive>=3){
      const names=sorted.slice(0,consecutive).map(t=>t.symbol).join(', ');
      setTradeLocked(true);
      setLockReason(`3 הפסדים רצופים — ${names}`);
      return;
    }
    const maxLoss=profile.portfolio*(profile.maxDailyLoss||3)/100;
    if(Math.abs(Math.min(0,todayPnl))>=maxLoss){
      setTradeLocked(true);
      setLockReason(`חריגה מהפסד יומי — $${Math.abs(todayPnl)} מתוך $${maxLoss.toFixed(0)}`);
    }
  },[profile,tradeLocked,appTrades]);

  const lockManually=()=>{
    setTradeLocked(true);
    setLockReason("נעילה ידנית על ידי הסוחר");
  };

  useEffect(()=>{
    const token=localStorage.getItem(TOKEN_KEY);
    if(!token){setAuthChecked(true);return;}
    fetch(`${AUTH_API}/api/auth/me`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json())
      .then(d=>{
        if(d.user){
          setAuthUser(d.user);
          if(!localStorage.getItem(ONBOARDING_KEY)&&(d.user.experience||d.user.portfolio_size)){
            const ans={fullName:d.user.full_name,country:d.user.country||'',experienceYears:d.user.experience||'0',portfolioSize:d.user.portfolio_size||'medium',tradingStyle:d.user.trading_style||'both',signature:'',agreedAt:d.user.created_at||new Date().toISOString()};
            try{localStorage.setItem(ONBOARDING_KEY,JSON.stringify(ans));}catch{}
            setOnboarding(ans);
            setProfile(buildProfileFromOnboarding(ans));
          }
        }else{localStorage.removeItem(TOKEN_KEY);}
      })
      .catch(()=>localStorage.removeItem(TOKEN_KEY))
      .finally(()=>setAuthChecked(true));
  },[]);

  useEffect(()=>{
    if(!authUser)return;
    apiCall('/api/trades').then(r=>r.json()).then(d=>{if(Array.isArray(d))setAppTrades(d.map(normalizeTrade));}).catch(()=>{});
    apiCall('/api/settings').then(r=>r.json()).then(s=>{
      if(s&&s.user_id){
        setProfile(prev=>({...prev,
          portfolio:parseFloat(s.portfolio)||prev.portfolio,
          riskPerTrade:parseFloat(s.risk_per_trade)||prev.riskPerTrade,
          maxDailyLoss:parseFloat(s.max_daily_loss)||prev.maxDailyLoss,
          style:s.style||prev.style,
          experience:s.experience||prev.experience,
        }));
      }
    }).catch(()=>{});
  },[authUser]);

  function handleLoginSuccess(token,user){
    localStorage.setItem(TOKEN_KEY,token);
    setAuthUser(user);
    if(!localStorage.getItem(ONBOARDING_KEY)&&(user.experience||user.portfolio_size)){
      const ans={fullName:user.full_name,country:user.country||'',experienceYears:user.experience||'0',portfolioSize:user.portfolio_size||'medium',tradingStyle:user.trading_style||'both',signature:'',agreedAt:user.created_at||new Date().toISOString()};
      try{localStorage.setItem(ONBOARDING_KEY,JSON.stringify(ans));}catch{}
      setOnboarding(ans);
      setProfile(buildProfileFromOnboarding(ans));
    }
  }

  function handleRegister(token,user,answers){
    localStorage.setItem(TOKEN_KEY,token);
    try{localStorage.setItem(ONBOARDING_KEY,JSON.stringify(answers));}catch{}
    setAuthUser(user);
    setOnboarding(answers);
    setProfile(buildProfileFromOnboarding(answers));
  }

  function handleLogout(){
    localStorage.removeItem(TOKEN_KEY);
    setAuthUser(null);
  }

  const openModal=(m)=>setModal(m);
  const closeModal=()=>setModal(null);

  function completeOnboarding(answers){
    try{localStorage.setItem(ONBOARDING_KEY,JSON.stringify(answers));}catch{}
    setOnboarding(answers);
    setProfile(buildProfileFromOnboarding(answers));
  }

  if(!authChecked) return <div style={{minHeight:'100vh',background:'#060608',display:'flex',alignItems:'center',justifyContent:'center'}}><style>{CSS}</style><div style={{color:'#00ff87',fontSize:14,fontFamily:"'Heebo',sans-serif",letterSpacing:1}}>טוען...</div></div>;
  if(!authUser) return authScreen==='register'?<RegisterScreen onRegister={handleRegister} onGoLogin={()=>setAuthScreen('login')}/>:<LoginScreen onLogin={handleLoginSuccess} onGoRegister={()=>setAuthScreen('register')}/>;
  if(!onboarding) return <OnboardingScreen onComplete={completeOnboarding}/>;

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#060608",direction:"rtl",fontFamily:"'Heebo',sans-serif",overflowY:"auto"}}>
      <style>{CSS}</style>

      {/* Top Bar */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#00ff87,#00cc6a)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#000",fontFamily:"'Syne',sans-serif"}}>TO</div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:"#fff",fontSize:16,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:1}}>TRADEOS</span>
              {profile?.experience&&(()=>{
                const lv={beginner:{label:"מתחיל",c:"#ffd93d",bg:"#ffd93d18"},advanced:{label:"מתקדם",c:"#00ff87",bg:"#00ff8718"},professional:{label:"מקצועי",c:"#a78bfa",bg:"#a78bfa18"}};
                const l=lv[profile.experience]||lv.advanced;
                return <span style={{background:l.bg,border:`1px solid ${l.c}40`,borderRadius:6,color:l.c,fontSize:13,padding:"2px 7px",fontWeight:600,fontFamily:"'Heebo',sans-serif"}}>{l.label}</span>;
              })()}
            </div>
            {profile?.name&&<div style={{color:"#888",fontSize:13,marginTop:1}}>{profile.name}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn" onClick={tradeLocked?()=>setShowUnlockConfirm(true):lockManually} style={{background:tradeLocked?"#ff6b6b22":"#0d0d18",border:`1px solid ${tradeLocked?"#ff6b6b55":"#1a1a2e"}`,borderRadius:10,color:tradeLocked?"#ff6b6b":"#555",padding:"7px 10px",fontSize:14,cursor:"pointer",animation:tradeLocked?"pulse 1.5s infinite":"none"}}>{tradeLocked?"🔒":"🔓"}</button>
          <button className="btn" onClick={()=>openModal("circuit")} style={{background:circuitLocked?"#ff6b6b20":"#0d0d18",border:`1px solid ${circuitLocked?"#ff6b6b40":"#1a1a2e"}`,borderRadius:10,color:circuitLocked?"#ff6b6b":"#555",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>🛡️</button>
          <button className="btn" onClick={()=>openModal("mental")} style={{background:"#ffd93d15",border:"1px solid #ffd93d30",borderRadius:10,color:"#ffd93d",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>🧠</button>
          <button className="btn" onClick={()=>openModal("coach")} style={{background:"#a78bfa15",border:"1px solid #a78bfa30",borderRadius:10,color:"#a78bfa",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>🤖</button>
          <button className="btn" title="שנה פרופיל" onClick={()=>{try{localStorage.removeItem(ONBOARDING_KEY);}catch{}setOnboarding(null);}} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:10,color:"#999",padding:"7px 10px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>⚙</button>
          <button className="btn" onClick={()=>openModal("profile")} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:10,color:"#666",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>👤</button>
          <button className="btn" onClick={handleLogout} title="התנתק" style={{background:"#ff6b6b15",border:"1px solid #ff6b6b30",borderRadius:10,color:"#ff6b6b",padding:"7px 10px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700}}>יציאה</button>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div style={{position:"sticky",top:56,zIndex:100,background:"#080810",borderBottom:"1px solid #111",padding:"10px 20px",display:"flex",gap:8,overflowX:"auto",flexShrink:0}}>
        {[
          {icon:"🎯",label:"החלטה",modal:"decision",color:"#00ff87"},
          {icon:"📈",label:"פוזיציות",modal:"positions",color:"#00ff87"},
          {icon:"📰",label:"חדשות",modal:"news",color:"#e879f9",alert:NEWS_DB.filter(n=>n.sent==="negative"&&n.mins<60).length>0},
          {icon:"📐",label:"גודל פוזיציה",modal:"sizer",color:"#ffd93d"},
          {icon:"📅",label:"דיווחים",modal:"earnings",color:"#fb923c",alert:EARNINGS_DATA.map(e=>({...e,days:daysUntil(e.date)})).filter(e=>e.days>=0&&e.days<3).length>0},
          {icon:"🌐",label:"כלכלה",modal:"econ",color:"#38bdf8",alert:ECON_EVENTS.map(e=>({...e,days:daysUntil(e.date)})).filter(e=>e.days>=0&&e.days<2&&e.impact==="high").length>0},
          {icon:"📋",label:"יומן",modal:"journal",color:"#ffd93d"},
          {icon:"💡",label:"תובנות",modal:"insights",color:"#a78bfa"},
          {icon:"🗺️",label:"סקטורים",modal:"heatmap",color:"#38bdf8"},
          {icon:"📖",label:"מילון",modal:"glossary",color:"#a78bfa"},
          {icon:"🛡️",label:"הגנות",modal:"circuit",color:"#ff6b6b"},
          {icon:"🕯️",label:"נרות",modal:"candles",color:"#fb923c"},
        ].map(({icon,label,modal:m,color,alert})=>(
          <button key={m} className="btn" onClick={()=>openModal(m)} style={{display:"flex",alignItems:"center",gap:6,background:"#0d0d18",border:`1px solid ${alert?"#ff6b6b40":"#1a1a2e"}`,borderRadius:12,color,padding:"8px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif",fontWeight:600,position:"relative"}}>
            <span>{icon}</span><span>{label}</span>
            {alert&&<span style={{position:"absolute",top:4,left:4,width:7,height:7,borderRadius:"50%",background:"#ff6b6b",boxShadow:"0 0 6px #ff6b6b",animation:"pulse 1.5s infinite"}}/>}
          </button>
        ))}
      </div>

      {/* Fear & Greed */}
      <FearGreedMeter/>

      {/* Morning pill */}
      <div style={{margin:"8px 20px 0",background:"linear-gradient(135deg,#0a1a0a,#060608)",border:"1px solid #00ff8725",borderRadius:12,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>☀️</span>
          <div>
            <div style={{color:"#00ff87",fontSize:12,fontWeight:600}}>הזדמנות הבוקר</div>
            <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{TOP.symbol} · ציון {TOP.total} · <span style={{color:"#00ff87"}}>{TOP.sig}</span></div>
          </div>
        </div>
        <div style={{color:todayPnl>=0?"#00ff87":"#ff6b6b",fontSize:14,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{todayPnl>=0?"+":""}${todayPnl}</div>
      </div>

      {/* Emotional Score */}
      <div style={{margin:"6px 20px 0",background:EMOTIONAL_CFG[emotional.state].bg,border:`1px solid ${EMOTIONAL_CFG[emotional.state].border}`,borderRadius:12,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,animation:emotional.state==="revenge"?"revengePulse 2s infinite":"none",direction:"rtl"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>🧬</span>
          <div>
            <div style={{color:"#555",fontSize:13,marginBottom:2,letterSpacing:.5}}>EMOTIONAL SCORE · ציון רגשי</div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <EmotionalBadge state={emotional.state}/>
              <span style={{color:"#999",fontSize:13,fontFamily:"'Heebo',sans-serif"}}>{emotional.consecutive} הפסד{emotional.consecutive!==1?"ות":""} ברצף · {tradeCount} עסקאות היום</span>
            </div>
          </div>
        </div>
        <div style={{color:EMOTIONAL_CFG[emotional.state].color,fontSize:13,fontFamily:"'Heebo',sans-serif",textAlign:"left",maxWidth:90,lineHeight:1.4,opacity:.85}}>{EMOTIONAL_CFG[emotional.state].tip}</div>
      </div>

      {/* AI Pre-Trade Coach */}
      <PreTradeAdvisor emotional={emotional} tradeCount={tradeCount} todayPnl={todayPnl} profile={profile}/>

      {/* Alerts Panel */}
      <AlertsPanel stocks={ALL_STOCKS} earningsData={EARNINGS_DATA} todayPnl={todayPnl} profile={profile}/>

      {/* Search Bar */}
      {(()=>{
        const sq=searchQuery.trim().toUpperCase();
        const knownMatch=sq&&ALL_STOCKS.find(s=>s.symbol===sq||s.name.toUpperCase().includes(sq));
        const isUnknown=sq&&!knownMatch;
        return(
          <div style={{margin:"8px 14px 0",direction:"rtl"}}>
            <div style={{position:"relative",display:"flex",alignItems:"center"}}>
              <input
                value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value.toUpperCase())}
                placeholder="🔍 חפש מניה... TSLA / NVDA / AMD"
                style={{width:"100%",background:"#0d0d18",border:"2px solid #00ff8740",borderRadius:14,padding:"12px 44px 12px 16px",fontSize:14,color:"#fff",fontFamily:"'IBM Plex Mono',monospace",outline:"none",direction:"ltr",letterSpacing:1}}
              />
              {sq&&(
                <button onClick={()=>setSearchQuery("")} style={{position:"absolute",left:12,background:"none",border:"none",color:"#888",fontSize:16,cursor:"pointer",padding:4}}>✕</button>
              )}
            </div>
            {isUnknown&&(
              <div style={{marginTop:8,background:"#1a1a2e",border:"1px solid #2a2a3e",borderRadius:12,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"#888",fontSize:13}}>"{sq}" אינה ברשימת המניות</span>
                <button onClick={()=>setAnalysisStock(sq)} style={{background:"#a78bfa20",border:"1px solid #a78bfa40",borderRadius:8,color:"#a78bfa",fontSize:13,padding:"6px 12px",cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700}}>נתח עם AI 🤖</button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Scanner */}
      <div style={{display:"flex",flexDirection:"column",marginTop:4}}>
        <Scanner experience={profile.experience} searchQuery={searchQuery} onAnalyze={(sym)=>setAnalysisStock(sym)}/>
      </div>

      {/* Disclaimer footer */}
      <div style={{background:"#0a0a0a",borderTop:"1px solid #1a1a2e",padding:"8px 20px",textAlign:"center",flexShrink:0}}>
        <span style={{color:"#444",fontSize:11,fontFamily:"'Heebo',sans-serif"}}>⚠️ המידע המוצג לצרכי מחקר בלבד ואינו מהווה ייעוץ פיננסי. כל החלטת השקעה באחריות המשתמש בלבד.</span>
      </div>

      {/* Modals */}
      {analysisStock&&<StockAnalysisScreen symbol={analysisStock} onClose={()=>setAnalysisStock(null)} onOpenSizer={(sym)=>{setAnalysisStock(null);openModal("sizer");}} onOpenJournal={(sym)=>{setAnalysisStock(null);openModal("journal");}}/>}
      {modal==="profile"&&<TraderProfile profile={profile} onSave={async(p)=>{setProfile(p);closeModal();try{await apiCall('/api/settings',{method:'PUT',body:JSON.stringify({portfolio:p.portfolio,risk_per_trade:p.riskPerTrade,max_daily_loss:p.maxDailyLoss,style:p.style,experience:p.experience})});}catch{}}} onClose={closeModal}/>}
      {modal==="sizer"&&<PositionSizer profile={profile} onClose={closeModal}/>}
      {modal==="circuit"&&<CircuitBreaker profile={profile} todayPnl={todayPnl} tradeCount={tradeCount} lastTradeTime={lastTradeTime} locked={circuitLocked} onUnlock={()=>setCircuitLocked(false)} onClose={closeModal}/>}
      {modal==="journal"&&<JournalAnalytics onClose={closeModal}/>}
      {modal==="positions"&&<OpenPositions profile={profile} onClose={closeModal}/>}
      {modal==="coach"&&<AICoach profile={profile} onClose={closeModal}/>}
      {modal==="earnings"&&<EarningsCalendar onClose={closeModal}/>}
      {modal==="econ"&&<EconCalendar onClose={closeModal}/>}
      {modal==="news"&&<NewsScanner onClose={closeModal}/>}
      {modal==="heatmap"&&<SectorHeatmap onClose={closeModal}/>}
      {modal==="glossary"&&<GlossaryScreen onClose={closeModal}/>}
      {modal==="decision"&&<TradeDecisionEngine onClose={closeModal}/>}
      {modal==="insights"&&<PerformanceInsights onClose={closeModal}/>}
      {modal==="candles"&&<CandlestickGuide onClose={closeModal}/>}
      {/* Revenge Trading Warning Overlay */}
      {showRevWarning&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,direction:"rtl",fontFamily:"'Heebo',sans-serif"}}>
          <div style={{background:"#0d0509",border:"2px solid #ff6b6b",borderRadius:20,padding:"28px 24px",maxWidth:340,width:"100%",animation:"shake .5s ease",boxShadow:"0 0 60px #ff6b6b40"}}>
            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{fontSize:52,marginBottom:8}}>🚨</div>
              <div style={{color:"#ff6b6b",fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:1}}>REVENGE TRADING</div>
              <div style={{color:"#ff6b6b",fontSize:13,opacity:.8,marginTop:4}}>מצב נקמה זוהה</div>
            </div>
            <div style={{background:"#ff6b6b12",border:"1px solid #ff6b6b30",borderRadius:12,padding:"14px",marginBottom:18}}>
              <div style={{color:"#ff6b6b",fontSize:13,fontWeight:700,marginBottom:6}}>⚠️ אל תיכנס לעסקה כרגע</div>
              <div style={{color:"#888",fontSize:12,lineHeight:1.7}}>
                זוהו <span style={{color:"#ff6b6b",fontWeight:700}}>{emotional.consecutive} הפסדים ברצף</span> ו-<span style={{color:"#ff6b6b",fontWeight:700}}>{tradeCount} עסקאות היום</span>.
                במצב זה ההחלטות רגשיות ולא רציונליות — סכנה להפסדים כפולים.
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{background:"#1a0a0a",borderRadius:10,padding:"10px 14px",color:"#666",fontSize:12}}>✅ קח הפסקה של 20 דקות</div>
              <div style={{background:"#1a0a0a",borderRadius:10,padding:"10px 14px",color:"#666",fontSize:12}}>✅ בדוק את יומן העסקאות</div>
              <div style={{background:"#1a0a0a",borderRadius:10,padding:"10px 14px",color:"#666",fontSize:12}}>✅ עסקה הבאה רק לפי תוכנית מלאה</div>
            </div>
            <button className="btn" onClick={()=>setRevWarnDismissed(true)} style={{marginTop:18,width:"100%",padding:"14px",borderRadius:14,border:"1px solid #ff6b6b40",background:"#ff6b6b15",color:"#ff6b6b",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
              הבנתי — אני לוקח הפסקה
            </button>
          </div>
        </div>
      )}

      {/* Trade Lock Unlock Confirmation */}
      {showUnlockConfirm&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20,direction:"rtl",fontFamily:"'Heebo',sans-serif"}}>
          <div style={{background:"#0d0d18",border:"2px solid #ff6b6b60",borderRadius:20,padding:"28px 24px",maxWidth:320,width:"100%",animation:"fadeUp .3s ease"}}>
            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{fontSize:44,marginBottom:10}}>⚠️</div>
              <div style={{color:"#fff",fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>פתיחת נעילת מסחר</div>
              <div style={{color:"#888",fontSize:13,marginTop:8,lineHeight:1.6}}>הנעילה הופעלה להגנה על ההון שלך.<br/>האם אתה בטוח שברצונך לפתוח?</div>
            </div>
            <div style={{background:"#ff6b6b12",border:"1px solid #ff6b6b35",borderRadius:12,padding:"12px 14px",marginBottom:20}}>
              <div style={{color:"#ff6b6b",fontSize:13,fontWeight:700,marginBottom:4}}>סיבת הנעילה:</div>
              <div style={{color:"#ff6b6b",fontSize:12,opacity:.9,lineHeight:1.5}}>{lockReason}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn" onClick={()=>setShowUnlockConfirm(false)} style={{flex:1,padding:"13px",borderRadius:12,border:"1px solid #2a2a3e",background:"#1a1a2e",color:"#888",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700}}>ביטול</button>
              <button className="btn" onClick={()=>{setTradeLocked(false);setLockReason(null);setShowUnlockConfirm(false);}} style={{flex:1,padding:"13px",borderRadius:12,border:"1px solid #ff6b6b40",background:"#ff6b6b20",color:"#ff6b6b",fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:700}}>פתח נעילה</button>
            </div>
          </div>
        </div>
      )}

      {modal==="mental"&&(
        <Screen title="🧠 מוכנות מנטלית" onBack={closeModal} accent="#ffd93d">
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{e:"🔥",l:"ממוקד",v:"focused",ok:true},{e:"😐",l:"רגיל",v:"neutral",ok:true},{e:"😤",l:"מתוח",v:"stress",ok:false},{e:"😨",l:"מפחד",v:"fear",ok:false},{e:"🤑",l:"חמדן",v:"greed",ok:false}].map(m=>(
              <div key={m.v} className="btn" onClick={closeModal} style={{display:"flex",alignItems:"center",gap:14,background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:14,padding:"14px 16px",cursor:"pointer"}}>
                <span style={{fontSize:28}}>{m.e}</span>
                <div><div style={{color:"#ccc",fontSize:15,fontWeight:600}}>{m.l}</div><div style={{color:m.ok?"#00ff87":"#ff6b6b",fontSize:12,marginTop:2}}>{m.ok?"✅ מצב טוב למסחר":"⚠️ שקול להמתין"}</div></div>
              </div>
            ))}
          </div>
        </Screen>
      )}
    </div>
  );
}
