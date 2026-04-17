import { useState, useEffect, useRef } from "react";

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
  if(total>=73){sig="קנייה חזקה";sc="#000";sb="#00ff87";}
  else if(total>=58){sig="קנייה";sc="#000";sb="#7bff6e";}
  else if(total>=42){sig="המתנה";sc="#000";sb="#ffd93d";}
  else if(total>=27){sig="מכירה";sc="#fff";sb="#ff6b6b";}
  else{sig="מכירה חזקה";sc="#fff";sb="#cc2222";}
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
  return <div style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:16,padding:"16px",marginBottom:12,...style}}>{title&&<div style={{color:"#555",fontSize:11,marginBottom:12,letterSpacing:1}}>{title}</div>}{children}</div>;
}
function StatBox({label,value,color="#fff",sub}){
  return <div style={{background:"#060608",borderRadius:12,padding:"12px",textAlign:"center"}}>
    <div style={{color,fontSize:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
    <div style={{color:"#444",fontSize:10,marginTop:3}}>{label}</div>
    {sub&&<div style={{color:"#333",fontSize:9,marginTop:2}}>{sub}</div>}
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
        <div style={{display:"flex",justifyContent:"space-between",color:"#333",fontSize:10,marginTop:4}}><span>0.5% (שמרן)</span><span>5% (אגרסיבי)</span></div>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{color:"#666",fontSize:13}}>הפסד יומי מקסימלי</span>
          <span style={{color:"#ff6b6b",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.maxDailyLoss}%</span>
        </div>
        <input type="range" min={1} max={10} step={0.5} value={p.maxDailyLoss} onChange={e=>u("maxDailyLoss",parseFloat(e.target.value))} style={{width:"100%",accentColor:"#ff6b6b"}}/>
        <div style={{display:"flex",justifyContent:"space-between",color:"#333",fontSize:10,marginTop:4}}><span>1% (קפדן)</span><span>10% (גבוה)</span></div>
      </div>
    </Section>
    <Section title="סגנון מסחר">
      {[{v:"swing",l:"Swing Trading",d:"ימים–שבועות"},{v:"daytrading",l:"Day Trading",d:"תוך יומי"},{v:"position",l:"Position Trading",d:"שבועות–חודשים"}].map(({v,l,d})=>(
        <div key={v} className="btn" onClick={()=>u("style",v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:p.style===v?"#a78bfa15":"#060608",border:`1px solid ${p.style===v?"#a78bfa50":"#1a1a2e"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
          <div><div style={{color:p.style===v?"#a78bfa":"#ccc",fontWeight:600,fontSize:14}}>{l}</div><div style={{color:"#444",fontSize:11,marginTop:2}}>{d}</div></div>
          {p.style===v&&<span style={{color:"#a78bfa",fontSize:18}}>✓</span>}
        </div>
      ))}
    </Section>
    <Section title="ניסיון">
      {[{v:"beginner",l:"מתחיל",d:"פחות משנה"},{v:"intermediate",l:"מתקדם",d:"1–3 שנים"},{v:"advanced",l:"מקצועי",d:"3+ שנים"}].map(({v,l,d})=>(
        <div key={v} className="btn" onClick={()=>u("experience",v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:p.experience===v?"#a78bfa15":"#060608",border:`1px solid ${p.experience===v?"#a78bfa50":"#1a1a2e"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
          <div><div style={{color:p.experience===v?"#a78bfa":"#ccc",fontWeight:600,fontSize:14}}>{l}</div><div style={{color:"#444",fontSize:11,marginTop:2}}>{d}</div></div>
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
            <div style={{color:"#555",fontSize:11,marginBottom:5}}>{l}</div>
            <input type="number" value={val} onChange={e=>set(parseFloat(e.target.value)||0)} style={{width:"100%",background:"#060608",border:"1px solid #2a2a3e",borderRadius:10,color:"#fff",fontSize:16,padding:"10px 12px",fontFamily:"'IBM Plex Mono',monospace",outline:"none",textAlign:"center"}}/>
          </div>
        ))}
        <div>
          <div style={{color:"#555",fontSize:11,marginBottom:5}}>סימבול</div>
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
      {parseFloat(pctOfPort)>20&&<div style={{background:"#ff6b6b15",border:"1px solid #ff6b6b30",borderRadius:10,padding:"10px 14px",marginBottom:10,color:"#ff6b6b",fontSize:13}}>⚠️ פוזיציה גדולה מדי — {pctOfPort}% מהתיק. מומלץ מתחת ל-20%.</div>}
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
          <div><div style={{color:"#ccc",fontSize:13,fontWeight:600}}>{at}</div><div style={{color:"#555",fontSize:11,marginTop:2}}>{action}</div></div>
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
        <button className="btn" onClick={onUnlock} style={{background:"#1a1a2e",border:"1px solid #333",borderRadius:12,color:"#888",padding:"12px 24px",fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>ביטול ידני (לא מומלץ)</button>
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
          <div style={{color:"#444",fontSize:11}}>{lossPercent.toFixed(0)}% מהמגבלה היומית ({profile?.maxDailyLoss||3}% מהתיק)</div>
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
                <div style={{color:"#444",fontSize:11,marginTop:2}}>{desc}</div>
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
  const [trades]=useState(SAMPLE_TRADES);
  const [newTrade,setNewTrade]=useState({symbol:"",entry:"",exit:"",stop:"",qty:"",setup:"RSI Bounce",emotion:"focused",followedPlan:true,notes:""});

  const wins=trades.filter(t=>t.result==="win");
  const losses=trades.filter(t=>t.result==="loss");
  const winRate=Math.round((wins.length/trades.length)*100);
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
              <div style={{color:"#555",fontSize:11,marginTop:4}}>כשעקבתי לתוכנית</div>
            </div>
            <div style={{background:"#ff6b6b12",border:"1px solid #ff6b6b30",borderRadius:12,padding:"14px",textAlign:"center"}}>
              <div style={{color:"#ff6b6b",fontSize:28,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{noplanWinRate}%</div>
              <div style={{color:"#555",fontSize:11,marginTop:4}}>כשסטיתי מהתוכנית</div>
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
                  <span style={{background:t.result==="win"?"#00ff8720":"#ff6b6b20",color:t.result==="win"?"#00ff87":"#ff6b6b",fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{t.result==="win"?"רווח":"הפסד"}</span>
                  {!t.followedPlan&&<span style={{background:"#ffd93d20",color:"#ffd93d",fontSize:10,padding:"2px 7px",borderRadius:20}}>סטה מתוכנית</span>}
                </div>
                <div style={{color:"#444",fontSize:11,marginTop:3}}>{t.date} · {t.day} · {t.hour}</div>
              </div>
              <div style={{color:t.pnl>=0?"#00ff87":"#ff6b6b",fontSize:17,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{t.pnl>=0?"+":""}${t.pnl}</div>
            </div>
            <div style={{display:"flex",gap:16,color:"#555",fontSize:11}}>
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
          <PrimaryBtn label="שמור עסקה ✓" onClick={()=>setView("trades")} color="linear-gradient(135deg,#ffd93d,#ffaa00)" textColor="#000"/>
        </Section>
      </div>
    )}
  </Screen>;
}

// ══════════════════════════════════════════════════════════════════════
// 5. OPEN POSITIONS
// ══════════════════════════════════════════════════════════════════════
function OpenPositions({profile,onClose}){
  const [positions,setPositions]=useState([
    {id:1,symbol:"TSLA",name:"Tesla",entry:245,current:267,stop:232,target:285,qty:10,date:"2026-04-14"},
    {id:2,symbol:"PLTR",name:"Palantir",entry:88,current:91,stop:80,target:110,qty:20,date:"2026-04-15"},
    {id:3,symbol:"NVDA",name:"Nvidia",entry:890,current:856,stop:875,target:960,qty:5,date:"2026-04-16"},
  ]);
  const [adding,setAdding]=useState(false);
  const [np,setNp]=useState({symbol:"",entry:"",stop:"",target:"",qty:""});

  const addPosition=()=>{
    if(!np.symbol||!np.entry)return;
    const stock=ALL_STOCKS.find(s=>s.symbol===np.symbol.toUpperCase());
    setPositions(p=>[...p,{id:Date.now(),symbol:np.symbol.toUpperCase(),name:stock?.name||np.symbol,entry:parseFloat(np.entry),current:parseFloat(np.entry)*(1+(Math.random()-.4)*.05),stop:parseFloat(np.stop),target:parseFloat(np.target),qty:parseInt(np.qty),date:new Date().toISOString().split("T")[0]}]);
    setNp({symbol:"",entry:"",stop:"",target:"",qty:""});setAdding(false);
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
              <div style={{color:"#555",fontSize:11,marginBottom:5}}>{l}</div>
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
                {atRisk&&<span style={{background:"#ff6b6b20",color:"#ff6b6b",fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"pulse 1.5s infinite"}}>⚠️ קרוב לסטופ</span>}
                {nearTarget&&<span style={{background:"#00ff8720",color:"#00ff87",fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"pulse 1.5s infinite"}}>🎯 קרוב ליעד</span>}
              </div>
              <div style={{color:"#444",fontSize:11,marginTop:2}}>{pos.qty} מניות · כניסה ${pos.entry} · {pos.date}</div>
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{color:pnl>=0?"#00ff87":"#ff6b6b",fontSize:18,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{pnl>=0?"+":""}${pnl.toFixed(0)}</div>
              <div style={{color:pnl>=0?"#00ff87":"#ff6b6b",fontSize:12,textAlign:"right"}}>{pnlPct>=0?"+":""}{pnlPct.toFixed(2)}%</div>
            </div>
          </div>

          {/* Progress bars */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#444",marginBottom:5}}>
              <span>סטופ ${pos.stop}</span><span>כניסה ${pos.entry}</span><span>יעד ${pos.target}</span>
            </div>
            <div style={{height:6,background:"#1a1a2e",borderRadius:3,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,borderRadius:3,width:`${Math.max(0,Math.min(100,((pos.current-pos.stop)/(pos.target-pos.stop))*100))}%`,background:`linear-gradient(90deg,#ff6b6b,#ffd93d,#00ff87)`,transition:"width .8s ease"}}/>
              <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:`${Math.max(0,Math.min(97,((pos.current-pos.stop)/(pos.target-pos.stop))*100))}%`,width:10,height:10,borderRadius:"50%",background:"#fff",border:"2px solid #000"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#333",marginTop:4}}>
              <span>כניסה ל-יעד: {Math.max(0,100-toTarget).toFixed(0)}%</span>
              <span>מחיר: ${pos.current}</span>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"לסטופ",v:`${toStop.toFixed(0)}%`,c:"#ff6b6b"},{l:"ליעד",v:`${Math.max(0,100-toTarget).toFixed(0)}%`,c:"#00ff87"},{l:"R:R נוכחי",v:`${Math.max(0,((pos.target-pos.current)/(pos.current-pos.stop))).toFixed(1)}:1`,c:"#ffd93d"}].map(({l,v,c})=>(
              <div key={l} style={{background:"#060608",borderRadius:10,padding:"8px",textAlign:"center"}}>
                <div style={{color:c,fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
                <div style={{color:"#333",fontSize:10,marginTop:2}}>{l}</div>
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
function Scanner(){
  const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState("הכל");
  const [sort,setSort]=useState("score");
  const filtered=ALL_STOCKS.filter(s=>filter==="הכל"||s.sig===filter).sort((a,b)=>sort==="score"?b.total-a.total:sort==="change"?b.change-a.change:a.rsi-b.rsi);
  return(
    <>
      <div style={{padding:"10px 20px 0",overflowX:"auto",display:"flex",gap:8,paddingBottom:4,flexShrink:0}}>
        {["הכל","קנייה חזקה","קנייה","המתנה","מכירה"].map(f=>(
          <button key={f} className="btn" onClick={()=>setFilter(f)} style={{background:filter===f?"#00ff8720":"#0d0d18",border:`1px solid ${filter===f?"#00ff8760":"#1a1a2e"}`,borderRadius:20,color:filter===f?"#00ff87":"#555",padding:"6px 14px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif"}}>{f}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 52px 58px 62px 52px",gap:6,padding:"10px 20px 6px",color:"#333",fontSize:10,letterSpacing:.5,flexShrink:0}}>
        <div>מניה</div><div style={{textAlign:"center"}}>RSI</div><div style={{textAlign:"right"}}>שינוי</div><div style={{textAlign:"center"}}>גרף</div><div style={{textAlign:"center"}}>ציון</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 12px 20px"}}>
        {filtered.map((s,i)=>(
          <div key={s.symbol} className="row" onClick={()=>setSel(s===sel?null:s)} style={{display:"grid",gridTemplateColumns:"1fr 52px 58px 62px 52px",gap:6,padding:"10px 8px",borderRadius:12,background:sel?.symbol===s.symbol?"#111120":"transparent",marginBottom:2,alignItems:"center",animation:`fadeUp .3s ease ${i*.02}s both`,cursor:"pointer"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
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
            <div style={{display:"flex",justifyContent:"center"}}><Spark data={s.spark} color={s.change>=0?"#00ff87":"#ff6b6b"}/></div>
            <div style={{display:"flex",justifyContent:"center"}}><ScoreDot score={s.total}/></div>
          </div>
        ))}
      </div>
      {sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",zIndex:200,display:"flex",flexDirection:"column",direction:"rtl",fontFamily:"'Heebo',sans-serif",animation:"slideIn .3s ease"}}>
          <div style={{background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
            <button className="btn" onClick={()=>setSel(null)} style={{background:"#1a1a2e",border:"none",color:"#888",width:34,height:34,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
            <div style={{color:"#fff",fontSize:18,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{sel.symbol}</div>
            <Badge sig={sel.sig} sb={sel.sb} sc={sel.sc}/>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
            <Section><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:"#fff",fontSize:32,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>${sel.price}</div><div style={{color:sel.change>=0?"#00ff87":"#ff6b6b",fontSize:16,fontWeight:600}}>{sel.change>=0?"+":""}{sel.change}%</div></div><Spark data={sel.spark} color={sel.change>=0?"#00ff87":"#ff6b6b"} w={100} h={44}/></div></Section>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{l:"יעד",v:`$${sel.target}`,c:"#00ff87"},{l:"סטופ",v:`$${sel.stop}`,c:"#ff6b6b"},{l:"R:R",v:`${sel.rr}:1`,c:sel.rr>=2?"#00ff87":"#ffd93d"},{l:"RSI",v:sel.rsi,c:sel.rsi<30?"#00ff87":sel.rsi>70?"#ff6b6b":"#ffd93d"}].map(({l,v,c})=>(
                <div key={l} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,padding:"12px"}}><div style={{color:"#444",fontSize:11,marginBottom:4}}>{l}</div><div style={{color:c,fontSize:18,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[{l:"טכני",v:sel.tech},{l:"פונדמנטלי",v:sel.fund},{l:"סנטימנט",v:sel.sent}].map(({l,v})=>{const c=v>=65?"#00ff87":v>=45?"#ffd93d":"#ff6b6b";return(<div key={l} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,padding:"12px"}}><div style={{color:"#444",fontSize:11,marginBottom:6}}>{l}</div><div style={{color:c,fontSize:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",marginBottom:6}}>{v}</div><div style={{height:3,background:"#1a1a2e",borderRadius:2}}><div style={{width:`${v}%`,height:"100%",background:c,borderRadius:2}}/></div></div>);})}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
// AI COACH
// ══════════════════════════════════════════════════════════════════════
function AICoach({profile,onClose}){
  const [msgs,setMsgs]=useState([{r:"ai",t:`שלום ${profile?.name||"סוחר"}! אני ה-AI Coach שלך. שאל אותי כל שאלה על מסחר, ניתוח, או מנטליות.`}]);
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
  return <Screen title="🤖 AI Coach" onBack={onClose} accent="#a78bfa">
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
          <button key={q} className="btn" onClick={()=>setInp(q)} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:20,color:"#666",fontSize:11,padding:"5px 12px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Heebo',sans-serif"}}>{q}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="שאל את ה-Coach..." style={{flex:1,background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,color:"#fff",fontSize:14,padding:"12px 14px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"}}/>
        <button className="btn" onClick={send} style={{width:46,height:46,background:"linear-gradient(135deg,#a78bfa,#7c3aed)",border:"none",borderRadius:12,color:"#fff",fontSize:20,cursor:"pointer",flexShrink:0}}>↑</button>
      </div>
    </div>
  </Screen>;
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
          <div style={{color:"#888",fontSize:11,fontWeight:600}}>מצב רוח השוק — {total} חדשות</div>
          <div style={{color:moodPct>=55?"#00ff87":moodPct>=40?"#ffd93d":"#ff6b6b",fontWeight:700,fontSize:13,fontFamily:"'IBM Plex Mono',monospace"}}>{moodPct}% חיובי</div>
        </div>
        <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden",marginBottom:8}}>
          <div style={{width:`${moodPct}%`,height:"100%",borderRadius:3,background:"linear-gradient(90deg,#ff6b6b,#ffd93d 40%,#00ff87)",transition:"width .8s ease"}}/>
        </div>
        <div style={{display:"flex",gap:16,fontSize:11}}>
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
            <button key={f.id} className="btn" onClick={()=>setSentFilter(f.id)} style={{flex:1,background:active?(m?.bg||"#e879f918"):"#0d0d18",border:`1px solid ${active?(m?.border||"#e879f945"):"#1a1a2e"}`,borderRadius:10,color:active?(m?.color||"#e879f9"):"#555",padding:"7px 2px",fontSize:11,cursor:"pointer",fontFamily:"'Heebo',sans-serif",fontWeight:active?700:400}}>
              {f.l}
            </button>
          );
        })}
      </div>

      {/* symbol filter horizontal scroll */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
        {symbols.map(s=>(
          <button key={s} className="btn" onClick={()=>setSymFilter(s)} style={{background:symFilter===s?"#e879f918":"#0d0d18",border:`1px solid ${symFilter===s?"#e879f945":"#1a1a2e"}`,borderRadius:20,color:symFilter===s?"#e879f9":"#555",padding:"4px 12px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'IBM Plex Mono',monospace",fontWeight:symFilter===s?700:400}}>
            {s}
          </button>
        ))}
      </div>

      {/* search */}
      <div style={{position:"relative",marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש חדשות..." style={{width:"100%",background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:12,color:"#fff",fontSize:13,padding:"10px 14px 10px 36px",fontFamily:"'Heebo',sans-serif",outline:"none",direction:"rtl"}}/>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#444",fontSize:14}}>🔍</span>
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:"#444",fontSize:14}}>לא נמצאו חדשות</div>
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
                  <span style={{background:sm.bg,color:sm.color,fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",border:`1px solid ${sm.border}`,flexShrink:0}}>{n.symbol}</span>
                  <span style={{background:sm.bg,color:sm.color,fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,border:`1px solid ${sm.border}`,flexShrink:0}}>{sm.icon} {sm.label}</span>
                  <span style={{color:"#444",fontSize:10,flexShrink:0}}>{n.source} · {timeAgo(n.mins)}</span>
                </div>
                <div style={{color:"#ddd",fontSize:13,fontWeight:600,lineHeight:1.4}}>{n.headline}</div>
              </div>
              {/* impact pct */}
              <div style={{textAlign:"center",flexShrink:0,minWidth:44}}>
                <div style={{color:pctColor,fontSize:14,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>{n.pct}</div>
                <div style={{color:"#333",fontSize:9,marginTop:1}}>השפעה</div>
              </div>
            </div>

            {/* expandable summary */}
            {open&&(
              <div style={{borderTop:"1px solid #1a1a2e",paddingTop:10,marginTop:6,animation:"fadeUp .2s ease"}}>
                <div style={{color:"#aaa",fontSize:12,lineHeight:1.7,marginBottom:10}}>{n.summary}</div>
                {stock&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#444",fontSize:10}}>מחיר:</span>
                      <span style={{color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>${stock.price}</span>
                    </div>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#444",fontSize:10}}>שינוי:</span>
                      <span style={{color:stock.change>=0?"#00ff87":"#ff6b6b",fontSize:11,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{stock.change>=0?"+":""}{stock.change}%</span>
                    </div>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#444",fontSize:10}}>סיגנל:</span>
                      <span style={{background:stock.sb,color:stock.sc,fontSize:10,padding:"1px 7px",borderRadius:10,fontWeight:700}}>{stock.sig}</span>
                    </div>
                    <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{color:"#444",fontSize:10}}>RSI:</span>
                      <span style={{color:stock.rsi<30?"#00ff87":stock.rsi>70?"#ff6b6b":"#ffd93d",fontSize:11,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{stock.rsi}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* expand hint */}
            <div style={{color:"#333",fontSize:10,marginTop:6,textAlign:"center"}}>{open?"▲ סגור":"▼ קרא עוד"}</div>
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
                <span style={{background:"#ff6b6b25",color:"#ff6b6b",fontSize:11,padding:"2px 10px",borderRadius:20,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",animation:"pulse 2s infinite",flexShrink:0}}>
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
        <div style={{textAlign:"center",padding:"48px 0",color:"#444",fontSize:14}}>אין אירועים בסינון זה</div>
      )}

      {/* grouped list */}
      {grouped.map((item,i)=>{
        if(item.type==="header"){
          return(
            <div key={"h"+item.date} style={{display:"flex",alignItems:"center",gap:10,marginTop:i>0?16:0,marginBottom:8}}>
              <div style={{color:"#38bdf8",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{dateHeb(item.date)}</div>
              <div style={{flex:1,height:1,background:"#1a1a2e"}}/>
              {item.days===0&&<span style={{color:"#38bdf8",fontSize:10,background:"#38bdf820",padding:"1px 8px",borderRadius:20}}>היום</span>}
              {item.days===1&&<span style={{color:"#ffd93d",fontSize:10,background:"#ffd93d15",padding:"1px 8px",borderRadius:20}}>מחר</span>}
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
                <div style={{display:"flex",gap:10,fontSize:10,color:"#555",flexWrap:"wrap"}}>
                  <span>🕐 {e.time} (שעון ישראל)</span>
                  {e.fore!=="—"&&<span>תחזית: <span style={{color:"#aaa"}}>{e.fore}</span></span>}
                  {e.prev!=="—"&&<span>קודם: <span style={{color:"#666"}}>{e.prev}</span></span>}
                </div>
              </div>

              {/* left side: impact + countdown */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <span style={{background:imp.bg,color:imp.color,fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,border:`1px solid ${imp.border}`}}>
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
        <div style={{textAlign:"center",padding:"48px 0",color:"#444",fontSize:14}}>אין דיווחים קרובים השבוע</div>
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
                  <span style={{color:"#444",fontSize:12}}>{e.name}</span>
                  {isUrgent&&(
                    <span style={{background:"#ff6b6b20",color:"#ff6b6b",fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,animation:"pulse 1.5s infinite"}}>⚠️ דחוף</span>
                  )}
                </div>
                <div style={{display:"flex",gap:10,fontSize:11,color:"#555",flexWrap:"wrap"}}>
                  <span>📅 {dateHeb(e.date)}</span>
                  <span>{e.time==="after"?"⏰ אחרי סגירה":"🌅 לפני פתיחה"}</span>
                  {s&&<span style={{color:s.change>=0?"#00ff87":"#ff6b6b",fontFamily:"'IBM Plex Mono',monospace"}}>{s.change>=0?"+":""}{s.change}%</span>}
                </div>
              </div>

              {/* countdown */}
              <div style={{textAlign:"center",minWidth:56,flexShrink:0}}>
                <div style={{color:accent,fontSize:isUrgent?22:17,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{dayLabel(e.days)}</div>
                {e.days>2&&<div style={{color:"#333",fontSize:9,marginTop:2}}>נותרו</div>}
              </div>
            </div>

            {/* stock indicators */}
            {s&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#444",fontSize:10}}>ציון:</span>
                  <span style={{color:s.total>=68?"#00ff87":s.total>=48?"#ffd93d":"#ff6b6b",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.total}</span>
                </div>
                <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#444",fontSize:10}}>RSI:</span>
                  <span style={{color:s.rsi<30?"#00ff87":s.rsi>70?"#ff6b6b":"#ffd93d",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{s.rsi}</span>
                </div>
                <div style={{background:"#060608",borderRadius:8,padding:"5px 10px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{color:"#444",fontSize:10}}>סיגנל:</span>
                  <span style={{background:s.sb,color:s.sc,fontSize:10,padding:"1px 7px",borderRadius:10,fontWeight:700}}>{s.sig}</span>
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
          <div style={{color:"#888",fontSize:11,fontWeight:600,letterSpacing:0.5}}>מדד פחד וחמדנות</div>
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
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#333",marginTop:2}}>
        {zones.map(z=><span key={z.label} style={{color:z.color,opacity:.7}}>{z.label}</span>)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════
export default function App(){
  const [tab,setTab]=useState("scanner");
  const [modal,setModal]=useState(null); // profile|sizer|circuit|journal|positions|coach|mental|earnings|econ|news
  const [profile,setProfile]=useState({name:"סוחר",portfolio:50000,riskPerTrade:1,maxDailyLoss:3,style:"swing",experience:"intermediate"});
  const [circuitLocked,setCircuitLocked]=useState(false);
  const todayPnl=-320; const tradeCount=3; const lastTradeTime=Date.now()-8*60000;
  const TOP=ALL_STOCKS.reduce((a,b)=>a.total>b.total?a:b);

  const openModal=(m)=>setModal(m);
  const closeModal=()=>setModal(null);

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#060608",direction:"rtl",fontFamily:"'Heebo',sans-serif",overflow:"hidden"}}>
      <style>{CSS}</style>

      {/* Top Bar */}
      <div style={{background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#00ff87,#00cc6a)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#000",fontFamily:"'Syne',sans-serif"}}>TO</div>
          <div>
            <span style={{color:"#fff",fontSize:16,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:1}}>TRADEOS</span>
            {profile?.name&&<span style={{color:"#333",fontSize:11,marginRight:8}}>{profile.name}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn" onClick={()=>openModal("circuit")} style={{background:circuitLocked?"#ff6b6b20":"#0d0d18",border:`1px solid ${circuitLocked?"#ff6b6b40":"#1a1a2e"}`,borderRadius:10,color:circuitLocked?"#ff6b6b":"#555",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>🛡️</button>
          <button className="btn" onClick={()=>openModal("mental")} style={{background:"#ffd93d15",border:"1px solid #ffd93d30",borderRadius:10,color:"#ffd93d",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>🧠</button>
          <button className="btn" onClick={()=>openModal("coach")} style={{background:"#a78bfa15",border:"1px solid #a78bfa30",borderRadius:10,color:"#a78bfa",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>🤖</button>
          <button className="btn" onClick={()=>openModal("profile")} style={{background:"#0d0d18",border:"1px solid #1a1a2e",borderRadius:10,color:"#666",padding:"7px 10px",fontSize:14,cursor:"pointer"}}>👤</button>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div style={{background:"#080810",borderBottom:"1px solid #111",padding:"10px 20px",display:"flex",gap:8,overflowX:"auto",flexShrink:0}}>
        {[
          {icon:"📈",label:"פוזיציות",modal:"positions",color:"#00ff87"},
          {icon:"📰",label:"חדשות",modal:"news",color:"#e879f9",alert:NEWS_DB.filter(n=>n.sent==="negative"&&n.mins<60).length>0},
          {icon:"📐",label:"Position Size",modal:"sizer",color:"#ffd93d"},
          {icon:"📅",label:"דיווחים",modal:"earnings",color:"#fb923c",alert:EARNINGS_DATA.map(e=>({...e,days:daysUntil(e.date)})).filter(e=>e.days>=0&&e.days<3).length>0},
          {icon:"🌐",label:"כלכלה",modal:"econ",color:"#38bdf8",alert:ECON_EVENTS.map(e=>({...e,days:daysUntil(e.date)})).filter(e=>e.days>=0&&e.days<2&&e.impact==="high").length>0},
          {icon:"📋",label:"יומן",modal:"journal",color:"#ffd93d"},
          {icon:"🛡️",label:"הגנות",modal:"circuit",color:"#ff6b6b"},
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

      {/* Scanner */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",marginTop:8}}>
        <Scanner/>
      </div>

      {/* Modals */}
      {modal==="profile"&&<TraderProfile profile={profile} onSave={(p)=>{setProfile(p);closeModal();}} onClose={closeModal}/>}
      {modal==="sizer"&&<PositionSizer profile={profile} onClose={closeModal}/>}
      {modal==="circuit"&&<CircuitBreaker profile={profile} todayPnl={todayPnl} tradeCount={tradeCount} lastTradeTime={lastTradeTime} locked={circuitLocked} onUnlock={()=>setCircuitLocked(false)} onClose={closeModal}/>}
      {modal==="journal"&&<JournalAnalytics onClose={closeModal}/>}
      {modal==="positions"&&<OpenPositions profile={profile} onClose={closeModal}/>}
      {modal==="coach"&&<AICoach profile={profile} onClose={closeModal}/>}
      {modal==="earnings"&&<EarningsCalendar onClose={closeModal}/>}
      {modal==="econ"&&<EconCalendar onClose={closeModal}/>}
      {modal==="news"&&<NewsScanner onClose={closeModal}/>}
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
