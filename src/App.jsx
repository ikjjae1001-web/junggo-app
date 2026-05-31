import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// 1. 상수
// ═══════════════════════════════════════════════════════
const MAX_PHOTOS = 5;
const VALID_IMG_TYPES = ["image/jpeg","image/jpg","image/png","image/webp","image/heic","image/heif"];
const GRADE_LIST = [
  { min:0,   max:9,   icon:"🥉", label:{ko:"새내기 감정사", en:"Novice"},      free:5,  photos:1, noAd:false },
  { min:10,  max:29,  icon:"🥈", label:{ko:"중수 감정사",   en:"Intermediate"},free:10, photos:3, noAd:false },
  { min:30,  max:99,  icon:"🥇", label:{ko:"고수 감정사",   en:"Expert"},       free:15, photos:5, noAd:false },
  { min:100, max:1e9, icon:"💎", label:{ko:"전설의 감정사", en:"Legendary"},    free:20, photos:5, noAd:true  },
];
const getGrade = (n) => GRADE_LIST.find(g => n >= g.min && n <= g.max) ?? GRADE_LIST[0];

// ═══════════════════════════════════════════════════════
// 2. 다국어
// ═══════════════════════════════════════════════════════
const I18N = {
  ko:{
    appName:"중고 감정사",tagline:"중고거래 상품의 시세·사기위험·\n적정가를 AI가 한 번에 분석해드려요",
    loginModalTitle:"간편 로그인",loginModalSub:"로그인하면 분석 횟수와 기록이 저장돼요",
    loginBtn:"카카오로 로그인",loginGuest:"나중에 할게요",loginGuestNote:"로그인 없이는 기록이 저장되지 않아요",
    menuScreenshot:"📸 스크린샷으로 분석",menuScreenshotDesc:"상품 화면을 캡처해서 올리세요",
    menuManual:"✏️ 직접 입력으로 분석",menuManualDesc:"상품 정보를 직접 입력해서 분석",
    menuAuth:"🔐 정품 가능성 분석",menuAuthDesc:"사진으로 정품 가능성을 분석해요",
    menuSeller:"🕵️ 판매자 신원 조회",menuSellerDesc:"아이디·전화번호로 패턴 분석",
    menuChat:"💬 거래 대화 분석",menuChatDesc:"판매자 심리·네고 가능성 분석",
    tabHome:"홈",tabArchive:"기록",tabSettings:"설정",
    back:"← 처음으로",backNew:"← 새로 감정하기",
    inputTitle:"상품 정보 입력",inputSub:"스크린샷을 올리거나 직접 입력하세요",
    tabSS:"📸 스크린샷",tabManual:"✏️ 직접 입력",
    uploadModeTitle:"업로드 방식 선택",
    modeAngle:"같은 상품, 여러 각도",modeAngleDesc:"다양한 각도로 상태를 정확히 분석 (최대 5장)",
    modeCompare:"다른 플랫폼 비교",modeCompareDesc:"같은 상품의 여러 플랫폼 가격 비교 (2~5장)",
    changeMode:"← 방식 변경",
    uploadTitle:"스크린샷 업로드",uploadDesc:"당근·번개장터·중고나라·크림·이베이 등 모두 가능",
    maxPhotos:"최대 5장 · 1장도 가능",photoCount:"사진 {n}장",addPhoto:"+ 추가",
    singlePhotoTip:"📸 여러 각도 사진을 올리면 상태를 더 정확하게 분석할 수 있어요",
    compareHint:"💡 같은 상품의 서로 다른 플랫폼 스크린샷을 올리면 가격을 비교해드려요",
    fName:"상품명",fNameP:"예: 아이폰 16 Pro 256GB 블랙",
    fPrice:"판매 가격 (원)",fPriceP:"예: 850000",
    fCond:"상품 상태",fCondP:"예: 사용감 있음, 기스 약간",
    manualHint:"💡 플랫폼 정보 없어도 괜찮아요. AI가 종합 분석해드려요.",
    analyzing:"🔍 분석 중...",analyzeStart:"🔍 AI 감정 시작",
    adTitle:"분석 완료! 결과 확인까지 잠시만요",adSub:"무료 플랜은 광고 시청 후 결과를 확인해요",
    adSkipReady:"결과 보기 →",adWait:"{n}초 후 확인 가능",adDisclaimer:"구독 시 광고 없음",
    listedPrice:"판매가",retailPrice:"출시가",
    priceAnalysis:"💰 가격 분석",fraudTitle:"🚨 사기 위험도",
    riskLabel:"위험",warnSignals:"⚠️ 주의 신호",safePointsLabel:"✅ 안전 포인트",
    tipsTitle:"💡 협상 & 주의 팁",marketMin:"최저",marketAvg:"평균",marketMax:"최고",
    cheaperBy:"{n}% 저렴",pricierBy:"{n}% 비쌈",
    crossPlatform:"🔄 타 플랫폼에서 더 저렴하게 거래되는 경향이 있어요",
    compareTitle:"🔄 플랫폼 가격 비교",newAnalysis:"🔍 다른 상품 감정하기",
    authTitle:"정품 가능성 분석",authSub:"상품 사진을 올리면 AI가 정품 가능성을 분석해요",
    authUploadTitle:"상품 사진 업로드",authUploadDesc:"명품·전자기기·스니커즈 등 가능 (최대 3장)",
    authCatLabel:"카테고리 선택",
    authCats:["명품/패션","전자기기","스니커즈","시계","가방/지갑","기타"],
    authBtn:"🔐 정품 가능성 분석",authAnalyzing:"🔐 분석 중...",
    authDisclaimer:"⚠️ AI 패턴 기반 분석이며 공식 감정 결과가 아니에요. 고가 상품은 반드시 공인 감정사에게 확인하세요.",
    authChecklist:"구매 전 확인 체크리스트",authRisk:"⚠️ 주의 포인트",authSafe:"✅ 긍정 신호",
    sellerTitle:"판매자 신원 조회",sellerSub:"아이디·전화번호·계좌번호로 사기 패턴을 분석해요",
    typeId:"아이디",typePhone:"전화번호",typeAcct:"계좌번호",
    sellerLabel:"입력",sellerNote:"⚠️ 입력 정보는 분석 후 저장되지 않으며 AI 패턴 분석 기반이에요.",
    sellerRisk:"🕵️ 판매자 위험도",sellerAnalysis:"🔎 분석 포인트",
    sellerChecking:"🕵️ 조회 중...",sellerBtn:"🕵️ 판매자 조회하기",
    sellerDisclaimer:"본 분석은 AI 패턴 기반이며 법적 효력이 없어요.\n사기 피해 시 경찰청 사이버수사대에 신고하세요.",
    chatTitle:"거래 대화 분석",chatSub:"판매자와의 대화로 심리·네고 가능성을 분석해요",
    chatUpload:"대화 스크린샷 업로드",chatUploadDesc:"카톡·채팅 화면을 캡처해서 올리세요",
    chatPasteLabel:"또는 대화 내용 직접 붙여넣기",
    chatPastePlaceholder:"판매자: 안녕하세요\n나: 네고 가능할까요?\n판매자: ...",
    chatBtn:"💬 대화 분석하기",chatAnalyzing:"💬 분석 중...",
    chatMood:"😊 판매자 심리 상태",chatNego:"🤝 네고 가능성",chatStrategy:"📋 추천 협상 전략",
    archiveTitle:"감정 기록",archiveSub:"지금까지 분석한 상품을 모아봤어요",
    archiveEmpty:"아직 감정 기록이 없어요",searchP:"상품명으로 검색...",
    statsTitle:"📊 나의 거래 통계",statTotal:"총 분석",statMonth:"이번 달",
    statFraud:"사기 예방",statSaved:"절약 추정",
    gradeTitle:"나의 등급",gradeBenefits:"등급 혜택",freeCntLabel:"무료",photoMaxLabel:"사진",noAdLabel:"광고없음",
    inviteTitle:"친구 초대",inviteSub:"친구 초대 시 양쪽 모두 +3회!",inviteBtn:"초대 링크 복사",inviteCopied:"복사됨!",
    freeLeft:"무료 {n}회 남음",freeExhausted:"무료 횟수 소진",
    chargeLeft:"충전 잔여 {n}회",usePlan:"충전하기",
    planTitle:"요금제",planFreeLabel:"FREE",planFreeDesc:"월 {n}회 무료",
    chargeLabel:"건당 충전",chargeDesc:"990원 = 10회 (유효기간 없음)",
    subLabel:"월구독",subDesc:"3,900원/월 · 무제한",
    subFeatures:["무제한 분석","광고 없음","사진 5장","전체 기능"],
    chargeBtn:"10회 충전 · 990원",subBtn:"구독 시작 · 3,900원/월",
    deductTitle:"📊 1회 차감 기준",
    deductItems:["📸 스크린샷 분석","✏️ 직접 입력 분석","🔐 정품 가능성 분석","🕵️ 판매자 신원 조회","💬 거래 대화 분석"],
    settingsTitle:"설정",themeLabel:"테마",themeDark:"🌙 다크",themeLight:"☀️ 라이트",
    langLabel:"언어 / Language",aboutLabel:"앱 정보",logoutBtn:"로그아웃",
    aboutText:"중고 감정사는 AI가 중고거래 상품의 시세, 사기 위험도, 정품 가능성을 분석해주는 앱이에요.\n\n본 앱의 모든 분석은 AI 추정 기반이며 법적 효력이 없습니다.",
    errRateLimit:"요청이 너무 많아요. 잠시 후 다시 시도해주세요",
    errNetwork:"네트워크 연결을 확인해주세요",
    errParse:"분석 결과를 읽지 못했어요. 다시 시도해주세요",
    errGeneric:"분석 중 오류가 발생했어요. 다시 시도해주세요",
    errNoInput:"이미지 또는 내용을 입력해주세요",
    errInvalidFile:"JPG·PNG·WEBP 이미지만 업로드할 수 있어요",
    toastTitle:"안내", wonUnit:"원",
  },
  en:{
    appName:"Resale Appraiser",tagline:"AI analyzes market price,\nfraud risk & fair value at once",
    loginModalTitle:"Quick Sign In",loginModalSub:"Sign in to save your history and usage",
    loginBtn:"Continue with Kakao",loginGuest:"Maybe later",loginGuestNote:"History won't be saved without login",
    menuScreenshot:"📸 Analyze by Screenshot",menuScreenshotDesc:"Capture and upload the listing",
    menuManual:"✏️ Analyze by Manual Input",menuManualDesc:"Enter product details directly",
    menuAuth:"🔐 Authenticity Analysis",menuAuthDesc:"Check authenticity from photos",
    menuSeller:"🕵️ Seller Verification",menuSellerDesc:"Analyze by ID or phone",
    menuChat:"💬 Chat Analysis",menuChatDesc:"Seller psychology & negotiation",
    tabHome:"Home",tabArchive:"Archive",tabSettings:"Settings",
    back:"← Back",backNew:"← New Analysis",
    inputTitle:"Product Info",inputSub:"Upload screenshot or enter details",
    tabSS:"📸 Screenshot",tabManual:"✏️ Manual",
    uploadModeTitle:"Upload Mode",
    modeAngle:"Same item, multiple angles",modeAngleDesc:"Analyze condition more accurately (up to 5)",
    modeCompare:"Compare platforms",modeCompareDesc:"Compare prices across platforms (2–5 photos)",
    changeMode:"← Change mode",
    uploadTitle:"Upload Screenshot",uploadDesc:"Works with any resale platform",
    maxPhotos:"Up to 5 · 1 is fine",photoCount:"{n} photo(s)",addPhoto:"+ Add",
    singlePhotoTip:"📸 Multiple angles improve accuracy",
    compareHint:"💡 Upload screenshots from different platforms to compare prices",
    fName:"Product Name",fNameP:"e.g. iPhone 16 Pro 256GB Black",
    fPrice:"Price (KRW)",fPriceP:"e.g. 850000",
    fCond:"Condition",fCondP:"e.g. used, minor scratches",
    manualHint:"💡 Platform info optional. AI analyzes from name and price.",
    analyzing:"🔍 Analyzing...",analyzeStart:"🔍 Start Analysis",
    adTitle:"Analysis done! Almost there...",adSub:"Free plan shows a short ad before results",
    adSkipReady:"View Results →",adWait:"Available in {n}s",adDisclaimer:"Subscribe to remove ads",
    listedPrice:"Price",retailPrice:"Retail",
    priceAnalysis:"💰 Price Analysis",fraudTitle:"🚨 Fraud Risk",
    riskLabel:"risk",warnSignals:"⚠️ Warning Signs",safePointsLabel:"✅ Safe Points",
    tipsTitle:"💡 Tips & Cautions",marketMin:"Min",marketAvg:"Avg",marketMax:"Max",
    cheaperBy:"{n}% cheaper",pricierBy:"{n}% pricier",
    crossPlatform:"🔄 Often traded cheaper on other platforms",
    compareTitle:"🔄 Platform Comparison",newAnalysis:"🔍 Analyze Another",
    authTitle:"Authenticity Analysis",authSub:"AI analyzes authenticity from product photos",
    authUploadTitle:"Upload Product Photo",authUploadDesc:"Luxury, electronics, sneakers, etc. (up to 3)",
    authCatLabel:"Select Category",
    authCats:["Luxury/Fashion","Electronics","Sneakers","Watches","Bags/Wallets","Other"],
    authBtn:"🔐 Analyze Authenticity",authAnalyzing:"🔐 Analyzing...",
    authDisclaimer:"⚠️ AI pattern-based only. Not an official appraisal. Verify high-value items with a certified appraiser.",
    authChecklist:"Pre-purchase Checklist",authRisk:"⚠️ Risk Points",authSafe:"✅ Positive Signs",
    sellerTitle:"Seller Verification",sellerSub:"Analyze fraud patterns by ID, phone, or account",
    typeId:"ID",typePhone:"Phone",typeAcct:"Account",
    sellerLabel:"Enter",sellerNote:"⚠️ Input not stored. AI pattern analysis only.",
    sellerRisk:"🕵️ Seller Risk",sellerAnalysis:"🔎 Analysis Points",
    sellerChecking:"🕵️ Checking...",sellerBtn:"🕵️ Check Seller",
    sellerDisclaimer:"AI pattern-based only, no legal effect.\nReport fraud to cyber police.",
    chatTitle:"Chat Analysis",chatSub:"Analyze seller psychology & negotiation chances",
    chatUpload:"Upload Chat Screenshot",chatUploadDesc:"Capture and upload your chat",
    chatPasteLabel:"Or paste chat text directly",
    chatPastePlaceholder:"Seller: Hello\nMe: Can we negotiate?\nSeller: ...",
    chatBtn:"💬 Analyze Chat",chatAnalyzing:"💬 Analyzing...",
    chatMood:"😊 Seller Mood",chatNego:"🤝 Negotiation Chance",chatStrategy:"📋 Recommended Strategy",
    archiveTitle:"Archive",archiveSub:"All your analyzed products",
    archiveEmpty:"No records yet",searchP:"Search by name...",
    statsTitle:"📊 My Stats",statTotal:"Total",statMonth:"This Month",
    statFraud:"Fraud Prevented",statSaved:"Est. Savings",
    gradeTitle:"My Grade",gradeBenefits:"Grade Benefits",freeCntLabel:"Free",photoMaxLabel:"Photos",noAdLabel:"No Ads",
    inviteTitle:"Invite Friends",inviteSub:"Both get +3 when a friend joins!",inviteBtn:"Copy Invite Link",inviteCopied:"Copied!",
    freeLeft:"{n} free left",freeExhausted:"Free uses exhausted",
    chargeLeft:"{n} charges left",usePlan:"Get more",
    planTitle:"Plans",planFreeLabel:"FREE",planFreeDesc:"{n} free/month",
    chargeLabel:"Pay per use",chargeDesc:"990 KRW = 10 uses (no expiry)",
    subLabel:"Subscribe",subDesc:"3,900 KRW/mo · Unlimited",
    subFeatures:["Unlimited analyses","No ads","5 photos","All features"],
    chargeBtn:"10 uses · 990 KRW",subBtn:"Subscribe · 3,900 KRW/mo",
    deductTitle:"📊 What counts as 1 use",
    deductItems:["📸 Screenshot analysis","✏️ Manual input analysis","🔐 Authenticity analysis","🕵️ Seller verification","💬 Chat analysis"],
    settingsTitle:"Settings",themeLabel:"Theme",themeDark:"🌙 Dark",themeLight:"☀️ Light",
    langLabel:"언어 / Language",aboutLabel:"About",logoutBtn:"Log out",
    aboutText:"Resale Appraiser uses AI to analyze market price, fraud risk, and authenticity.\n\nAll analyses are AI-based estimates with no legal effect.",
    errRateLimit:"Too many requests. Please wait and try again.",
    errNetwork:"Please check your network connection.",
    errParse:"Could not read result. Please try again.",
    errGeneric:"An error occurred. Please try again.",
    errNoInput:"Please upload an image or enter text",
    errInvalidFile:"Only JPG, PNG, or WEBP images supported.",
    toastTitle:"Notice", wonUnit:" KRW",
  }
};

// ═══════════════════════════════════════════════════════
// 3. AI 프롬프트
// ═══════════════════════════════════════════════════════
function buildAnalyzePrompt(lang, mode, imgCount) {
  const L = lang === "ko" ? "Korean" : "English";
  const base = `You are a used goods trading AI. Return ONLY raw JSON. No markdown, no explanation. ALL text in ${L}, max 35 chars per string value, no double-quotes inside strings, no newlines inside strings.`;
  if (mode === "compare") {
    return base + `
${imgCount} images show the SAME product listed on DIFFERENT platforms. Extract price and platform from each image.
{"productName":"","condition":"","retail":0,"platforms":[{"platform":"Daangn","price":0,"fraud":{"level":"LOW","score":0}},{"platform":"Bunjang","price":0,"fraud":{"level":"LOW","score":0}}],"cheapest":"Daangn","market":{"min":0,"max":0,"avg":0},"rec":{"verdict":"BUY","summary":"","tips":["","","",""]},"fraud":{"red":[""],"safe":[""]}}
RULES: platform one of [Daangn,Bunjang,Joonggonara,Kream,eBay,Unknown]; rec.verdict one of [BUY,NEGOTIATE,AVOID]; fraud.level one of [LOW,MEDIUM,HIGH]; score 0-100 int; tips 3-4 items; prices integers; NO trailing commas`;
  }
  const photoHint = imgCount > 1 ? `${imgCount} photos of SAME item from different angles.` : "Single photo.";
  return base + `
${photoHint}
{"product":{"name":"","platform":"Unknown","price":0,"retail":0,"condition":""},"market":{"min":0,"max":0,"avg":0,"basis":""},"price":{"verdict":"CHEAP","rate":0,"note":""},"fraud":{"level":"LOW","score":0,"red":[""],"safe":[""]},"rec":{"verdict":"BUY","summary":"","tips":["","","",""]},"crossPlatform":false}
RULES: platform one of [Daangn,Bunjang,Joonggonara,Kream,eBay,Unknown]; price.verdict one of [CHEAP,FAIR,EXPENSIVE]; price.rate positive=cheaper% negative=pricier%; fraud.level one of [LOW,MEDIUM,HIGH]; score 0-100 int; rec.verdict one of [BUY,NEGOTIATE,AVOID]; tips EXACTLY 3-4 items; retail=new retail price integer; crossPlatform bool; prices integers; NO trailing commas`;
}

function buildAuthPrompt(lang, category) {
  const L = lang === "ko" ? "Korean" : "English";
  const cat = String(category || "").replace(/["`]/g, "").trim() || "General";
  return `You are an expert authenticity analysis AI for ${cat} products. Analyze the uploaded photo(s) and return ONLY raw JSON. No markdown. ALL text in ${L}, max 40 chars per string, no double-quotes inside string values, no newlines inside string values.
{"category":"","authenticityScore":50,"verdict":"","checkList":["","",""],"riskPoints":[],"safePoints":[],"disclaimer":""}
RULES: category = the product category analyzed; authenticityScore 0-100 int (higher = more likely genuine based on visual); verdict = 1-2 sentence probabilistic conclusion without claiming definitive authentic or fake; checkList = 3-5 things buyer should physically verify; riskPoints = suspicious visual signs array (empty array [] if none found); safePoints = positive signs array (empty array [] if none found); disclaimer = brief AI limitation note; NO trailing commas`;
}

function buildSellerPrompt(lang) {
  const L = lang === "ko" ? "Korean" : "English";
  return `You are a fraud detection AI. Return ONLY raw JSON. ALL text in ${L}, max 35 chars per string, no double-quotes inside strings.
{"level":"LOW","score":0,"warn":[],"safe":[],"analysis":[],"advice":""}
RULES: level one of [LOW,MEDIUM,HIGH]; score 0-100 int; warn/safe/analysis arrays of strings; NO trailing commas`;
}

function buildChatPrompt(lang) {
  const L = lang === "ko" ? "Korean" : "English";
  return `You are a negotiation psychology AI for used goods trading. Return ONLY raw JSON. ALL text in ${L}, max 40 chars per string, no double-quotes inside strings.
{"mood":"","moodEmoji":"😊","negoChance":0,"negoComment":"","strategy":["",""]}
RULES: negoChance 0-100 int; strategy 2-3 items; single emoji only for moodEmoji; NO trailing commas`;
}

const PLATFORM_MAP = { Daangn:"당근", Bunjang:"번개장터", Joonggonara:"중고나라", Kream:"크림", eBay:"이베이", Unknown:"—" };
const VERDICT_MAP = {
  ko:{ CHEAP:"저렴해요", FAIR:"적당해요", EXPENSIVE:"비싸요", BUY:"구매 추천", NEGOTIATE:"협상 후 구매", AVOID:"구매 비추천", LOW:"낮음", MEDIUM:"보통", HIGH:"높음" },
  en:{ CHEAP:"Cheap", FAIR:"Fair", EXPENSIVE:"Pricey", BUY:"Recommended", NEGOTIATE:"Negotiate First", AVOID:"Not Recommended", LOW:"Low", MEDIUM:"Medium", HIGH:"High" }
};

// ═══════════════════════════════════════════════════════
// 4. 유틸리티
// ═══════════════════════════════════════════════════════
function safeParseJSON(raw) {
  const clean = raw
    .replace(/```json/gi, "").replace(/```/g, "")
    .replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/,(\s*[}\]])/g, "$1")
    .trim();
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no JSON");
  return JSON.parse(clean.slice(s, e + 1));
}

function classifyError(err, t) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("exceeded_limit") || m.includes("rate_limit") || m.includes("too_many")) return t.errRateLimit;
  if (m.includes("network") || m.includes("failed to fetch")) return t.errNetwork;
  if (m.includes("json") || m.includes("parse") || m.includes("no json")) return t.errParse;
  return t.errGeneric;
}

function validateImage(file) {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return VALID_IMG_TYPES.some(v => type.includes(v.split("/")[1])) || /\.(jpg|jpeg|png|webp|heic|heif)$/.test(name);
}

async function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function callClaude(system, messages) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system, messages }),
  });
  const data = await res.json();
  if (data.error) {
    const t = data.error.type || "";
    throw new Error(t.includes("rate") || t.includes("limit") ? "exceeded_limit" : data.error.message || "api_error");
  }
  const text = (data.content || []).map(i => i.text || "").join("").trim();
  return safeParseJSON(text);
}

// localStorage 헬퍼
const LS = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ═══════════════════════════════════════════════════════
// 5. UI 컴포넌트
// ═══════════════════════════════════════════════════════

// Toast
function Toast({ msg, title, dark, onClose }) {
  useEffect(() => { const id = setTimeout(onClose, 5000); return () => clearTimeout(id); }, [onClose]);
  return (
    <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999, maxWidth:360, width:"calc(100% - 32px)" }}>
      <div style={{ background: dark ? "#1e1f3a" : "#fff", border: "1.5px solid #6366f1", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: dark ? "white" : "#111", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{title}</div>
          <div style={{ color: dark ? "#a5b4fc" : "#4f46e5", fontSize: 12, lineHeight: 1.5 }}>{msg}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 15, padding: 0 }}>✕</button>
      </div>
    </div>
  );
}

// 로그인 모달
function LoginModal({ t, dark, C, onLogin, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9000, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 440 }}>
        <div style={{ width: 40, height: 4, background: C.cardBd, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div style={{ color: C.text, fontSize: 18, fontWeight: 900, marginBottom: 6 }}>{t.loginModalTitle}</div>
          <div style={{ color: C.textMute, fontSize: 13, lineHeight: 1.6 }}>{t.loginModalSub}</div>
        </div>
        <button onClick={onLogin} style={{ width:"100%", padding:"14px", background:"#FEE500", color:"#191919", border:"none", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
          <span style={{ fontSize: 20 }}>💬</span>{t.loginBtn}
        </button>
        <button onClick={onClose} style={{ width:"100%", padding:"12px", background:"none", border:`1px solid ${C.cardBd}`, color:C.textMute, borderRadius:12, fontSize:14, cursor:"pointer" }}>
          {t.loginGuest}
        </button>
        <p style={{ color: C.textFaint, fontSize: 11, textAlign: "center", marginTop: 10 }}>{t.loginGuestNote}</p>
      </div>
    </div>
  );
}

// 광고 오버레이
function AdOverlay({ t, dark, C, onDone }) {
  const [sec, setSec] = useState(5);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (sec <= 0) { setReady(true); return; }
    const id = setTimeout(() => setSec(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [sec]);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:8888, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background: C.card, borderRadius: 20, padding: "32px 24px", maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
        <div style={{ color: C.text, fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{t.adTitle}</div>
        <div style={{ color: C.textMute, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{t.adSub}</div>
        <div style={{ width:"100%", height:6, background: dark?"#1e2035":"#e5e7eb", borderRadius:3, marginBottom:20, overflow:"hidden" }}>
          <div style={{ width:`${((5-sec)/5)*100}%`, height:"100%", background:"linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius:3, transition:"width 1s linear" }} />
        </div>
        {ready ? (
          <button onClick={onDone} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer" }}>
            {t.adSkipReady}
          </button>
        ) : (
          <div style={{ color:"#6366f1", fontSize:16, fontWeight:800 }}>{t.adWait.replace("{n}", sec)}</div>
        )}
        <div style={{ color: C.textFaint, fontSize: 11, marginTop: 12 }}>{t.adDisclaimer}</div>
      </div>
    </div>
  );
}

// 점수 게이지
function ScoreGauge({ score, level, C }) {
  const color = level === "낮음" || level === "Low" ? "#22c55e" : level === "보통" || level === "Medium" ? "#f59e0b" : "#ef4444";
  const bg = color === "#22c55e" ? (C.dark ? "#052e16":"#dcfce7") : color === "#f59e0b" ? (C.dark?"#1c1400":"#fef3c7") : (C.dark?"#1a0505":"#fee2e2");
  const bd = color === "#22c55e" ? "#166534" : color === "#f59e0b" ? "#92400e" : "#7f1d1d";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:50, height:50, borderRadius:"50%", background:bg, border:`3px solid ${color}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:13, fontWeight:900, color, lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:9, color, opacity:0.8 }}>{C.t?.riskLabel ?? "위험"}</span>
      </div>
      <span style={{ padding:"4px 12px", borderRadius:20, background:bg, color, fontSize:12, fontWeight:700, border:`1px solid ${bd}` }}>{level}</span>
    </div>
  );
}

// 정품 원형 게이지
function AuthGauge({ score, dark }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "높음" : score >= 40 ? "보통" : "낮음";
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke={dark?"#1e2035":"#e5e7eb"} strokeWidth={8}/>
        <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition:"stroke-dashoffset 0.8s ease" }}/>
        <text x={50} y={47} textAnchor="middle" fill={color} fontSize={18} fontWeight={900}>{score}%</text>
        <text x={50} y={63} textAnchor="middle" fill={color} fontSize={11}>{label}</text>
      </svg>
    </div>
  );
}

// 가격 바
function PriceBar({ min, max, avg, listed, t, C }) {
  if (!min || !max || min >= max) return null;
  const pct = v => Math.min(Math.max(((v - min) / (max - min)) * 100, 2), 98);
  return (
    <div style={{ padding:"8px 0 4px" }}>
      <div style={{ position:"relative", height:8, background: C.dark?"#1e293b":"#e5e7eb", borderRadius:4, margin:"20px 0 10px" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)", borderRadius:4, opacity: C.dark?0.5:0.7 }}/>
        <div style={{ position:"absolute", left:`${pct(avg)}%`, top:"50%", transform:"translate(-50%,-50%)", width:2, height:18, background:C.textSub, borderRadius:1 }}/>
        <div style={{ position:"absolute", left:`${pct(listed)}%`, top:"50%", transform:"translate(-50%,-50%)", width:14, height:14, background:"#6366f1", borderRadius:"50%", border:"2px solid #c7d2fe", boxShadow:"0 0 10px rgba(99,102,241,0.6)" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.textMute }}>
        <span>{t.marketMin} {min?.toLocaleString()}</span>
        <span>{t.marketAvg} {avg?.toLocaleString()}</span>
        <span>{t.marketMax} {max?.toLocaleString()}</span>
      </div>
    </div>
  );
}

// 이미지 그리드
function UploadGrid({ files, onAdd, onRemove, fileRef, maxFiles, t, C, hint }) {
  return (
    <>
      <input type="file" accept="image/*" multiple ref={fileRef} onChange={onAdd} style={{ display:"none" }}/>
      {files.length === 0 ? (
        <div onClick={() => fileRef.current?.click()} style={{ border:`2px dashed ${C.cardBd}`, borderRadius:16, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:C.card }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📷</div>
          <div style={{ color:C.text, fontWeight:700, fontSize:15, marginBottom:6 }}>{t.uploadTitle}</div>
          <div style={{ color:C.textFaint, fontSize:12, marginBottom:8 }}>{t.uploadDesc}</div>
          <div style={{ color:"#6366f1", fontSize:12, fontWeight:700 }}>{t.maxPhotos}</div>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:C.textSub, fontSize:12, fontWeight:700 }}>{t.photoCount.replace("{n}", files.length)}</span>
            {files.length < maxFiles && (
              <button onClick={() => fileRef.current?.click()} style={{ background:"none", border:`1px solid ${C.cardBd}`, borderRadius:8, color:"#6366f1", fontSize:12, fontWeight:700, padding:"5px 12px", cursor:"pointer" }}>{t.addPhoto}</button>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {files.map((img, i) => (
              <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:12, overflow:"hidden", border:`1px solid ${C.cardBd}` }}>
                <img src={img.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                <button onClick={() => onRemove(i)} style={{ position:"absolute", top:5, right:5, background:"rgba(0,0,0,0.75)", color:"white", border:"none", borderRadius:"50%", width:22, height:22, cursor:"pointer", fontSize:11, lineHeight:1 }}>✕</button>
                <span style={{ position:"absolute", bottom:5, left:5, background:"rgba(0,0,0,0.7)", color:"white", borderRadius:6, fontSize:10, fontWeight:700, padding:"2px 6px" }}>{i+1}</span>
              </div>
            ))}
            {files.length < maxFiles && (
              <div onClick={() => fileRef.current?.click()} style={{ aspectRatio:"1", borderRadius:12, border:`2px dashed ${C.cardBd}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", background:C.card, color:C.textMute, fontSize:28 }}>+</div>
            )}
          </div>
        </div>
      )}
      {hint && (
        <div style={{ background: C.dark?"#0c0f1a":"#eff6ff", border:`1px solid ${C.dark?"#1e3a5c":"#bfdbfe"}`, borderRadius:10, padding:"10px 14px", marginTop:12, color: C.dark?"#93c5fd":"#1d4ed8", fontSize:12, lineHeight:1.6 }}>{hint}</div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// 6. 메인 앱
// ═══════════════════════════════════════════════════════
export default function App() {
  // ── 설정 ──
  const [lang, setLang] = useState(() => LS.get("lang", "ko"));
  const [theme, setTheme] = useState(() => LS.get("theme", "light"));
  const [user, setUser] = useState(() => LS.get("user", null));

  // ── 횟수/구독 ──
  const [freeLeft, setFreeLeft] = useState(() => LS.get("freeLeft", 5));
  const [chargeLeft, setChargeLeft] = useState(() => LS.get("chargeLeft", 0));
  const [isSubscribed, setIsSubscribed] = useState(() => LS.get("isSubscribed", false));

  // ── 통계 ──
  const [totalCount, setTotalCount] = useState(() => LS.get("totalCount", 0));
  const [monthCount, setMonthCount] = useState(() => LS.get("monthCount", 0));
  const [fraudPrevented, setFraudPrevented] = useState(() => LS.get("fraudPrevented", 0));
  const [savedAmount, setSavedAmount] = useState(() => LS.get("savedAmount", 0));
  const [history, setHistory] = useState(() => LS.get("history", []));

  // ── 네비게이션 ──
  const [tab, setTab] = useState("home");
  const [view, setView] = useState(null);

  // ── 입력 ──
  const [inputMode, setInputMode] = useState("screenshot");
  const [uploadMode, setUploadMode] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [manual, setManual] = useState({ name:"", price:"", condition:"" });
  const [authImages, setAuthImages] = useState([]);
  const [authCatIdx, setAuthCatIdx] = useState(0);
  const [seller, setSeller] = useState({ type:"id", value:"" });
  const [chat, setChat] = useState({ text:"", file:null, preview:null });

  // ── 결과 ──
  const [result, setResult] = useState(null);
  const [cmpResult, setCmpResult] = useState(null);
  const [authResult, setAuthResult] = useState(null);
  const [sellerResult, setSellerResult] = useState(null);
  const [chatResult, setChatResult] = useState(null);

  // ── UI ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);

  const fileRef = useRef();
  const authFileRef = useRef();
  const chatFileRef = useRef();

  // ── 파생값 ──
  const t = I18N[lang] || I18N.ko;
  const V = VERDICT_MAP[lang] || VERDICT_MAP.ko;
  const dark = theme === "dark";
  const grade = getGrade(totalCount);
  const maxFree = grade.free;
  const maxPhotos = Math.min(grade.photos, MAX_PHOTOS);
  const noAd = grade.noAd || isSubscribed;
  const canUse = isSubscribed || chargeLeft > 0 || freeLeft > 0;

  // ── 테마 색 ──
  const C = {
    dark,
    t,
    bg:      dark ? "#0c0c14" : "#f5f5f7",
    card:    dark ? "#161622" : "#ffffff",
    cardBd:  dark ? "#1e2035" : "#e5e7eb",
    sub:     dark ? "#0f1117" : "#f9fafb",
    text:    dark ? "#ffffff" : "#111827",
    textSub: dark ? "#94a3b8" : "#4b5563",
    textMute:dark ? "#475569" : "#9ca3af",
    textFaint:dark? "#334155" : "#d1d5db",
  };

  // 색상 헬퍼
  const verdictColor = v => [V.CHEAP, V.BUY].includes(v) ? "#22c55e" : [V.FAIR, V.NEGOTIATE].includes(v) ? "#f59e0b" : "#ef4444";
  const verdictBg = v => {
    const c = verdictColor(v);
    return dark ? (c==="22c55e"?"#052e16": c==="#22c55e"?"#052e16": c==="#f59e0b"?"#1c1400":"#1a0505")
                : (c==="#22c55e"?"#dcfce7": c==="#f59e0b"?"#fef3c7":"#fee2e2");
  };
  const verdictBd = v => [V.CHEAP, V.BUY].includes(v) ? "#166534" : [V.FAIR, V.NEGOTIATE].includes(v) ? "#92400e" : "#7f1d1d";
  const riskColor = lv => lv===V.LOW?"#22c55e": lv===V.MEDIUM?"#f59e0b":"#ef4444";

  // ── 퍼시스턴스 ──
  useEffect(() => { LS.set("lang", lang); }, [lang]);
  useEffect(() => { LS.set("theme", theme); }, [theme]);
  useEffect(() => { LS.set("user", user); }, [user]);
  useEffect(() => { LS.set("freeLeft", freeLeft); }, [freeLeft]);
  useEffect(() => { LS.set("chargeLeft", chargeLeft); }, [chargeLeft]);
  useEffect(() => { LS.set("isSubscribed", isSubscribed); }, [isSubscribed]);
  useEffect(() => { LS.set("totalCount", totalCount); }, [totalCount]);
  useEffect(() => { LS.set("monthCount", monthCount); }, [monthCount]);
  useEffect(() => { LS.set("fraudPrevented", fraudPrevented); }, [fraudPrevented]);
  useEffect(() => { LS.set("savedAmount", savedAmount); }, [savedAmount]);
  useEffect(() => { LS.set("history", history.slice(0, 50)); }, [history]);

  // 월별 무료 리셋
  useEffect(() => {
    const last = LS.get("lastReset", "");
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth()}`;
    if (last !== key) { setFreeLeft(maxFree); setMonthCount(0); LS.set("lastReset", key); }
  }, [maxFree]);

  const showToast = useCallback(msg => setToast(msg), []);

  // ── 로그인 ──
  const doLogin = useCallback(() => {
    const mockUser = { name: "카카오사용자", kakaoName: "카카오사용자", avatar: "🦊" };
    setUser(mockUser);
    setShowLoginModal(false);
    showToast(lang === "ko" ? "로그인되었어요!" : "Logged in!");
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  }, [lang, showToast, pendingAction]);

  const doLoginClose = useCallback(() => {
    setShowLoginModal(false);
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  }, [pendingAction]);

  // 기능 진입 시 로그인 체크 (비로그인도 허용, 모달만 표시)
  const withLoginSuggest = useCallback((action) => {
    if (!user) {
      setPendingAction(() => action);
      setShowLoginModal(true);
    } else {
      action();
    }
  }, [user]);

  // ── 이미지 업로드 ──
  const handleImgAdd = useCallback((e, setter, max) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const bad = files.find(f => !validateImage(f));
    if (bad) { showToast(t.errInvalidFile); return; }
    files.slice(0, max).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setter(prev => prev.length >= max ? prev : [...prev, { file: f, preview: ev.target.result }]);
      r.readAsDataURL(f);
    });
  }, [t, showToast]);

  const handleChatImg = useCallback((e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (!validateImage(f)) { showToast(t.errInvalidFile); return; }
    const r = new FileReader();
    r.onload = ev => setChat(c => ({ ...c, file: f, preview: ev.target.result }));
    r.readAsDataURL(f);
  }, [t, showToast]);

  // ── 차감 (API 성공 후 호출) ──
  const consumeUse = useCallback(() => {
    if (isSubscribed) return true;
    if (chargeLeft > 0) { const n = chargeLeft - 1; setChargeLeft(n); LS.set("chargeLeft", n); return true; }
    if (freeLeft > 0) { const n = freeLeft - 1; setFreeLeft(n); LS.set("freeLeft", n); return true; }
    return false;
  }, [isSubscribed, chargeLeft, freeLeft]);

  // ── 통계 ──
  const addStat = useCallback((fraudHigh, saving) => {
    setTotalCount(c => c + 1);
    setMonthCount(c => c + 1);
    if (fraudHigh) setFraudPrevented(c => c + 1);
    if (saving > 0) setSavedAmount(c => c + saving);
  }, []);

  const addHistory = useCallback((entry) => {
    setHistory(h => [entry, ...h.slice(0, 49)]);
  }, []);

  // ── 광고 후 결과 표시 ──
  const handleAdDone = useCallback(() => {
    setShowAd(false);
    if (!pendingResult) return;
    const { type, data } = pendingResult;
    setPendingResult(null);
    if (type === "result") { setResult(data); setView("result"); }
    else if (type === "compare") { setCmpResult(data); setView("compare"); }
    else if (type === "auth") { setAuthResult(data); setView("authResult"); }
  }, [pendingResult]);

  const showResultOrAd = useCallback((type, data) => {
    if (noAd) {
      if (type === "result") { setResult(data); setView("result"); }
      else if (type === "compare") { setCmpResult(data); setView("compare"); }
      else if (type === "auth") { setAuthResult(data); setView("authResult"); }
    } else {
      setPendingResult({ type, data });
      setShowAd(true);
    }
  }, [noAd]);

  // ── 메인 분석 ──
  const analyze = useCallback(async () => {
    if (loading) return;
    if (!canUse) { setView("plan"); return; }
    setLoading(true); setError(null);
    try {
      const mode = uploadMode || "single";
      let messages;
      if (inputMode === "screenshot" && imageFiles.length > 0) {
        const content = [];
        for (const img of imageFiles) {
          const b64 = await toBase64(img.file);
          content.push({ type:"image", source:{ type:"base64", media_type: img.file.type || "image/jpeg", data: b64 } });
        }
        content.push({ type:"text", text: mode === "compare"
          ? `Compare prices. ${imageFiles.length} different platform screenshots of the same product.`
          : `Analyze this listing. ${imageFiles.length} photo(s).` });
        messages = [{ role:"user", content }];
      } else {
        if (!manual.name.trim()) { setError(t.errNoInput); setLoading(false); return; }
        messages = [{ role:"user", content:`Product: ${manual.name}, Price: ${manual.price}KRW, Condition: ${manual.condition || "unknown"}` }];
      }
      const p = await callClaude(buildAnalyzePrompt(lang, mode, imageFiles.length || 1), messages);
      // ✅ 성공 후 차감
      if (!consumeUse()) { setLoading(false); setView("plan"); return; }

      if (mode === "compare" && p.platforms) {
        const cp = {
          name: p.productName || "—", condition: p.condition || "", retail: p.retail || 0,
          platforms: (p.platforms || []).map(pl => ({
            platform: PLATFORM_MAP[pl.platform] || pl.platform || "—",
            price: pl.price || 0,
            fraudLevel: V[pl.fraud?.level] || V.LOW,
            fraudScore: pl.fraud?.score || 0,
          })).sort((a, b) => a.price - b.price),
          mMin: p.market?.min||0, mMax: p.market?.max||0, mAvg: p.market?.avg||0,
          rVerdict: V[p.rec?.verdict] || p.rec?.verdict,
          summary: p.rec?.summary || "", tips: p.rec?.tips || [],
          red: p.fraud?.red || [], safe: p.fraud?.safe || [],
        };
        addStat(cp.platforms.some(pl => pl.fraudScore >= 70), 0);
        addHistory({ id:Date.now(), name:cp.name, platform: lang==="ko"?"비교":"Compare", verdict:cp.rVerdict, price:0, time:new Date().toLocaleDateString(lang==="ko"?"ko-KR":"en-US"), type:"compare" });
        showResultOrAd("compare", cp);
      } else {
        const r = {
          name: p.product?.name||"—",
          platform: PLATFORM_MAP[p.product?.platform] || p.product?.platform || "—",
          price: p.product?.price||0, retail: p.product?.retail||0, condition: p.product?.condition||"",
          mMin: p.market?.min||0, mMax: p.market?.max||0, mAvg: p.market?.avg||0, mBasis: p.market?.basis||"",
          pVerdict: V[p.price?.verdict] || p.price?.verdict, pRate: p.price?.rate||0, pNote: p.price?.note||"",
          fLevel: V[p.fraud?.level] || V.LOW, fScore: p.fraud?.score||0,
          red: p.fraud?.red||[], safe: p.fraud?.safe||[],
          rVerdict: V[p.rec?.verdict] || p.rec?.verdict, summary: p.rec?.summary||"", tips: p.rec?.tips||[],
          cross: p.crossPlatform || false,
          singlePhoto: inputMode === "screenshot" && imageFiles.length === 1,
        };
        const saving = r.retail > 0 && r.price > 0 ? Math.max(0, r.retail - r.price) : 0;
        addStat(r.fScore >= 70, saving);
        addHistory({ id:Date.now(), name:r.name, platform:r.platform, verdict:r.rVerdict, price:r.price, time:new Date().toLocaleDateString(lang==="ko"?"ko-KR":"en-US"), type:"analyze" });
        showResultOrAd("result", r);
      }
    } catch (e) { setError(classifyError(e, t)); }
    setLoading(false);
  }, [loading, canUse, inputMode, imageFiles, manual, uploadMode, lang, t, V, consumeUse, addStat, addHistory, showResultOrAd]);

  // ── 정품 분석 ──
  const analyzeAuth = useCallback(async () => {
    if (loading) return;
    if (authImages.length === 0) { setError(t.errNoInput); return; }
    if (!canUse) { setView("plan"); return; }
    setLoading(true); setError(null);
    try {
      const content = [];
      for (const img of authImages) {
        const b64 = await toBase64(img.file);
        content.push({ type:"image", source:{ type:"base64", media_type: img.file.type || "image/jpeg", data: b64 } });
      }
      const catLabel = t.authCats[authCatIdx] || "General";
      content.push({ type:"text", text:`Analyze authenticity for ${catLabel}. ${authImages.length} photo(s).` });
      const p = await callClaude(buildAuthPrompt(lang, catLabel), [{ role:"user", content }]);
      // ✅ 성공 후 차감
      if (!consumeUse()) { setLoading(false); setView("plan"); return; }
      const ar = {
        category: p.category || catLabel,
        score: Math.min(100, Math.max(0, typeof p.authenticityScore === "number" ? p.authenticityScore : 50)),
        verdict: p.verdict || "",
        checkList: (p.checkList || []).filter(Boolean),
        riskPoints: (p.riskPoints || []).filter(Boolean),
        safePoints: (p.safePoints || []).filter(Boolean),
        disclaimer: p.disclaimer || t.authDisclaimer,
      };
      addStat(false, 0);
      addHistory({ id:Date.now(), name:ar.category, platform: lang==="ko"?"정품분석":"Auth", verdict:`${ar.score}%`, price:0, time:new Date().toLocaleDateString(lang==="ko"?"ko-KR":"en-US"), type:"auth" });
      showResultOrAd("auth", ar);
    } catch (e) { setError(classifyError(e, t)); }
    setLoading(false);
  }, [loading, authImages, authCatIdx, canUse, lang, t, consumeUse, addStat, addHistory, showResultOrAd]);

  // ── 판매자 조회 ──
  const checkSeller = useCallback(async () => {
    if (loading || !seller.value.trim()) return;
    if (!canUse) { setView("plan"); return; }
    setLoading(true); setError(null);
    try {
      const p = await callClaude(buildSellerPrompt(lang), [{ role:"user", content:`Type: ${seller.type}, Value: ${seller.value}` }]);
      // ✅ 성공 후 차감
      if (!consumeUse()) { setLoading(false); setView("plan"); return; }
      setSellerResult({ level: V[p.level]||V.LOW, score: p.score||0, warn: p.warn||[], safe: p.safe||[], analysis: p.analysis||[], advice: p.advice||"" });
      addStat(p.score >= 70, 0);
    } catch (e) { setError(classifyError(e, t)); }
    setLoading(false);
  }, [loading, seller, canUse, lang, V, t, consumeUse, addStat]);

  // ── 대화 분석 ──
  const analyzeChat = useCallback(async () => {
    if (loading) return;
    if (!chat.text.trim() && !chat.file) { setError(t.errNoInput); return; }
    if (!canUse) { setView("plan"); return; }
    setLoading(true); setError(null);
    try {
      let messages;
      if (chat.file) {
        const b64 = await toBase64(chat.file);
        messages = [{ role:"user", content:[
          { type:"image", source:{ type:"base64", media_type: chat.file.type||"image/jpeg", data:b64 } },
          { type:"text", text:"Analyze this buyer-seller chat conversation." }
        ]}];
      } else {
        messages = [{ role:"user", content:`Chat:\n${chat.text}` }];
      }
      const p = await callClaude(buildChatPrompt(lang), messages);
      // ✅ 성공 후 차감
      if (!consumeUse()) { setLoading(false); setView("plan"); return; }
      setChatResult({ mood: p.mood||"", moodEmoji: p.moodEmoji||"😊", negoChance: p.negoChance||0, negoComment: p.negoComment||"", strategy: p.strategy||[] });
    } catch (e) { setError(classifyError(e, t)); }
    setLoading(false);
  }, [loading, chat, canUse, lang, t, consumeUse]);

  // ── 초대 ──
  const handleInvite = useCallback(() => {
    const link = "https://junggo-appraisal.app/invite/abc123";
    navigator.clipboard?.writeText(link).catch(() => {});
    setInviteCopied(true);
    setFreeLeft(f => f + 3);
    setTimeout(() => setInviteCopied(false), 2500);
  }, []);

  // ── 리셋 ──
  const resetInputState = useCallback(() => {
    setImageFiles([]); setUploadMode(null); setManual({ name:"", price:"", condition:"" }); setError(null);
  }, []);

  const goHome = useCallback(() => {
    setView(null); setTab("home");
    setResult(null); setCmpResult(null); setAuthResult(null); setSellerResult(null); setChatResult(null);
    setError(null); setShowAd(false); setPendingResult(null);
    setImageFiles([]); setAuthImages([]); setUploadMode(null);
    setManual({ name:"", price:"", condition:"" });
    setSeller({ type:"id", value:"" });
    setChat({ text:"", file:null, preview:null });
  }, []);

  // ── 스타일 ──
  const S = {
    page:  { minHeight:"100vh", background:C.bg, fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding:"20px 18px 90px", maxWidth:440, margin:"0 auto" },
    back:  { background:"none", border:"none", color:C.textMute, fontSize:13, cursor:"pointer", padding:"0 0 18px", display:"flex", alignItems:"center", gap:5 },
    h1:    { color:C.text, fontSize:22, fontWeight:900, margin:"0 0 4px", letterSpacing:-0.5 },
    sub:   { color:C.textMute, fontSize:13, margin:"0 0 22px" },
    btn:   (d) => ({ width:"100%", padding:"15px", background: d?"#334155":"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"white", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor: d?"not-allowed":"pointer", opacity: d?0.5:1, boxShadow: d?"none":"0 4px 18px rgba(99,102,241,0.3)" }),
    input: { width:"100%", padding:"12px 14px", background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:10, color:C.text, fontSize:14, outline:"none", boxSizing:"border-box" },
    lbl:   { color:C.textSub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 },
  };
  const Card = ({ children, style }) => <div style={{ background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:16, padding:18, marginBottom:14, ...style }}>{children}</div>;
  const CT = ({ children }) => <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:12 }}>{children}</div>;
  const Err = ({ err }) => err ? <div style={{ background: dark?"#1a0505":"#fee2e2", border:"1px solid #7f1d1d", borderRadius:10, padding:"12px 14px", marginTop:14, color: dark?"#fca5a5":"#991b1b", fontSize:13, lineHeight:1.5 }}>⚠️ {err}</div> : null;

  const FraudBlock = ({ red, safe }) => (
    <>
      {(red||[]).filter(Boolean).length > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ color:"#ef4444", fontSize:11, fontWeight:700, marginBottom:6 }}>{t.warnSignals}</div>
          {red.filter(Boolean).map((f,i) => <div key={i} style={{ background: dark?"#1a0505":"#fee2e2", border:"1px solid #7f1d1d", borderRadius:8, padding:"7px 12px", marginBottom:5, color: dark?"#fca5a5":"#991b1b", fontSize:12 }}>• {f}</div>)}
        </div>
      )}
      {(safe||[]).filter(Boolean).length > 0 && (
        <div>
          <div style={{ color:"#22c55e", fontSize:11, fontWeight:700, marginBottom:6 }}>{t.safePointsLabel}</div>
          {safe.filter(Boolean).map((s,i) => <div key={i} style={{ background: dark?"#052e16":"#dcfce7", border:"1px solid #166534", borderRadius:8, padding:"7px 12px", marginBottom:5, color: dark?"#86efac":"#166534", fontSize:12 }}>• {s}</div>)}
        </div>
      )}
    </>
  );

  const TipsBlock = ({ tips, singlePhoto }) => {
    const all = [...(tips||[])];
    if (singlePhoto) all.push(t.singlePhotoTip);
    const filtered = all.filter(Boolean);
    if (!filtered.length) return null;
    return (
      <Card>
        <CT>{t.tipsTitle}</CT>
        {filtered.map((tp, i) => {
          const isHint = singlePhoto && i === filtered.length - 1;
          return (
            <div key={i} style={{ display:"flex", gap:8, padding:"9px 12px", background: isHint?(dark?"#0f1730":"#eff6ff"):C.sub, borderRadius:10, marginBottom:7, border:`1px solid ${isHint?(dark?"#1e3a8a":"#bfdbfe"):C.cardBd}` }}>
              <span style={{ color:"#6366f1", flexShrink:0 }}>{isHint?"📸":"→"}</span>
              <span style={{ color: isHint?(dark?"#93c5fd":"#1d4ed8"):C.textSub, fontSize:13, lineHeight:1.5 }}>{tp}</span>
            </div>
          );
        })}
      </Card>
    );
  };

  const BottomNav = () => (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:440, margin:"0 auto", background:C.card, borderTop:`1px solid ${C.cardBd}`, display:"flex", padding:"8px 0 12px", zIndex:100 }}>
      {[["home","🏠",t.tabHome],["archive","📋",t.tabArchive],["settings","⚙️",t.tabSettings]].map(([k,icon,label]) => (
        <button key={k} onClick={() => { setView(null); setTab(k); setError(null); }} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color: tab===k&&!view?"#6366f1":C.textMute }}>
          <span style={{ fontSize:20 }}>{icon}</span>
          <span style={{ fontSize:10, fontWeight:700 }}>{label}</span>
        </button>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  // ── 공통 오버레이 ──
  const overlays = (
    <>
      {toast && <Toast msg={toast} title={t.toastTitle} dark={dark} onClose={() => setToast(null)}/>}
      {showAd && <AdOverlay t={t} dark={dark} C={C} onDone={handleAdDone}/>}
      {showLoginModal && <LoginModal t={t} dark={dark} C={C} onLogin={doLogin} onClose={doLoginClose}/>}
    </>
  );

  // ── 요금제 ──
  if (view === "plan") return (
    <div style={S.page}>
      {overlays}
      <button style={S.back} onClick={() => setView(null)}>{t.back}</button>
      <h2 style={S.h1}>{t.planTitle}</h2>
      <div style={{ color:"#ef4444", fontSize:13, marginBottom:16, padding:"10px 14px", background: dark?"#1a0505":"#fee2e2", borderRadius:10, border:"1px solid #7f1d1d" }}>{t.freeExhausted}</div>
      <Card>
        <CT>{t.deductTitle}</CT>
        {(t.deductItems||[]).map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom: i < (t.deductItems.length-1) ? `1px solid ${C.cardBd}` : "none" }}>
            <span style={{ flex:1, color:C.textSub, fontSize:13 }}>{item}</span>
            <span style={{ color:"#6366f1", fontSize:12, fontWeight:700 }}>-1{lang==="ko"?"회":" use"}</span>
          </div>
        ))}
      </Card>
      <Card><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><div style={{ color:C.text, fontWeight:800 }}>{t.planFreeLabel}</div><div style={{ color:C.textMute, fontSize:12 }}>{t.planFreeDesc.replace("{n}",maxFree)}</div><span style={{ color:"#22c55e", fontWeight:800 }}>✓</span></div></Card>
      <Card style={{ border:"1px solid #6366f1" }}>
        <div style={{ color:"#6366f1", fontSize:11, fontWeight:700, marginBottom:6 }}>💳 {t.chargeLabel}</div>
        <div style={{ color:C.text, fontSize:13, marginBottom:12 }}>{t.chargeDesc}</div>
        <button onClick={() => { const n=chargeLeft+10; setChargeLeft(n); LS.set("chargeLeft",n); showToast(lang==="ko"?"10회 충전되었어요!":"10 uses added!"); setView(null); }} style={{ ...S.btn(false), padding:"12px" }}>{t.chargeBtn}</button>
      </Card>
      <Card style={{ border:"1px solid #8b5cf6" }}>
        <div style={{ color:"#8b5cf6", fontSize:11, fontWeight:700, marginBottom:6 }}>⭐ {t.subLabel}</div>
        <div style={{ color:C.text, fontSize:13, marginBottom:8 }}>{t.subDesc}</div>
        {(t.subFeatures||[]).map((f,i) => <div key={i} style={{ color:C.textMute, fontSize:12, marginBottom:4 }}>✓ {f}</div>)}
        <button onClick={() => { setIsSubscribed(true); LS.set("isSubscribed",true); showToast(lang==="ko"?"구독이 시작되었어요!":"Subscribed!"); setView(null); }} style={{ ...S.btn(false), padding:"12px", marginTop:12 }}>{t.subBtn}</button>
      </Card>
      <Card>
        <CT>{t.inviteTitle}</CT>
        <div style={{ color:C.textMute, fontSize:13, marginBottom:12 }}>{t.inviteSub}</div>
        <button onClick={handleInvite} style={{ ...S.btn(false), background: inviteCopied?"#22c55e":"linear-gradient(135deg,#6366f1,#8b5cf6)", padding:"12px" }}>{inviteCopied?t.inviteCopied:t.inviteBtn}</button>
      </Card>
    </div>
  );

  // ── 정품 분석 화면 ──
  if (view === "auth") return (
    <div style={S.page}>
      {overlays}
      <button style={S.back} onClick={goHome}>{t.back}</button>
      <h2 style={S.h1}>{t.authTitle}</h2><p style={S.sub}>{t.authSub}</p>
      <div style={{ marginBottom:16 }}>
        <label style={S.lbl}>{t.authCatLabel}</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {(t.authCats||[]).map((cat, i) => (
            <button key={i} onClick={() => setAuthCatIdx(i)} style={{ padding:"7px 14px", borderRadius:20, border:`1px solid ${authCatIdx===i?"#6366f1":C.cardBd}`, background: authCatIdx===i?(dark?"#1e1f3a":"#eef2ff"):"none", color: authCatIdx===i?"#6366f1":C.textMute, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <input type="file" accept="image/*" multiple ref={authFileRef} onChange={e => handleImgAdd(e, setAuthImages, 3)} style={{ display:"none" }}/>
      <UploadGrid files={authImages} onAdd={e => handleImgAdd(e, setAuthImages, 3)} onRemove={i => setAuthImages(a => a.filter((_,idx)=>idx!==i))} fileRef={authFileRef} maxFiles={3} t={{ ...t, uploadTitle:t.authUploadTitle, uploadDesc:t.authUploadDesc, maxPhotos: lang==="ko"?"최대 3장":"Up to 3 photos" }} C={C}/>
      <div style={{ background: dark?"#1a0505":"#fee2e2", border:"1px solid #7f1d1d", borderRadius:10, padding:"10px 14px", marginTop:12, color: dark?"#fca5a5":"#991b1b", fontSize:12, lineHeight:1.6 }}>{t.authDisclaimer}</div>
      <Err err={error}/>
      <button onClick={() => withLoginSuggest(analyzeAuth)} disabled={loading || authImages.length === 0} style={{ ...S.btn(loading || authImages.length === 0), marginTop:16 }}>
        {loading ? t.authAnalyzing : t.authBtn}
      </button>
    </div>
  );

  // ── 정품 결과 ──
  if (view === "authResult" && authResult) return (
    <div style={S.page}>
      {overlays}
      <button style={S.back} onClick={() => { setView("auth"); setAuthResult(null); }}>{t.backNew}</button>
      <Card>
        <CT>{t.authTitle} — {authResult.category}</CT>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <AuthGauge score={authResult.score} dark={dark}/>
          <div style={{ flex:1 }}>
            <div style={{ color: authResult.score>=70?"#22c55e":authResult.score>=40?"#f59e0b":"#ef4444", fontWeight:800, fontSize:14, marginBottom:6, lineHeight:1.4 }}>{authResult.verdict}</div>
            <div style={{ color:C.textMute, fontSize:11, lineHeight:1.5 }}>{authResult.disclaimer}</div>
          </div>
        </div>
      </Card>
      {authResult.checkList?.length > 0 && (
        <Card>
          <CT>✅ {t.authChecklist}</CT>
          {authResult.checkList.map((item,i) => (
            <div key={i} style={{ display:"flex", gap:8, padding:"9px 12px", background:C.sub, borderRadius:10, marginBottom:7, border:`1px solid ${C.cardBd}` }}>
              <span style={{ color:"#6366f1", flexShrink:0 }}>□</span>
              <span style={{ color:C.textSub, fontSize:13, lineHeight:1.5 }}>{item}</span>
            </div>
          ))}
        </Card>
      )}
      {authResult.riskPoints?.length > 0 && (
        <Card>
          <CT>{t.authRisk}</CT>
          {authResult.riskPoints.map((item,i) => <div key={i} style={{ background: dark?"#1a0505":"#fee2e2", border:"1px solid #7f1d1d", borderRadius:8, padding:"7px 12px", marginBottom:5, color: dark?"#fca5a5":"#991b1b", fontSize:12 }}>• {item}</div>)}
        </Card>
      )}
      {authResult.safePoints?.length > 0 && (
        <Card>
          <CT>{t.authSafe}</CT>
          {authResult.safePoints.map((item,i) => <div key={i} style={{ background: dark?"#052e16":"#dcfce7", border:"1px solid #166534", borderRadius:8, padding:"7px 12px", marginBottom:5, color: dark?"#86efac":"#166534", fontSize:12 }}>• {item}</div>)}
        </Card>
      )}
      <div style={{ background: dark?"#1a0505":"#fee2e2", border:"1px solid #7f1d1d", borderRadius:10, padding:"12px 14px", marginBottom:16, color: dark?"#fca5a5":"#991b1b", fontSize:12, lineHeight:1.6 }}>{t.authDisclaimer}</div>
      <button onClick={() => { setAuthResult(null); setAuthImages([]); setView("auth"); }} style={S.btn(false)}>{lang==="ko"?"🔐 다시 분석하기":"🔐 Analyze Again"}</button>
    </div>
  );

  // ── 비교 결과 ──
  if (view === "compare" && cmpResult) return (
    <div style={S.page}>
      {overlays}
      <button style={S.back} onClick={goHome}>{t.backNew}</button>
      <Card>
        <div style={{ color:"#6366f1", fontSize:11, fontWeight:700, marginBottom:4 }}>{t.compareTitle}</div>
        <div style={{ color:C.text, fontSize:16, fontWeight:800, marginBottom:4 }}>{cmpResult.name}</div>
        <div style={{ color:C.textMute, fontSize:12 }}>{cmpResult.condition}</div>
      </Card>
      <div style={{ background:verdictBg(cmpResult.rVerdict), border:`1.5px solid ${verdictBd(cmpResult.rVerdict)}`, borderRadius:16, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>{cmpResult.rVerdict===V.BUY?"✅":cmpResult.rVerdict===V.NEGOTIATE?"🤝":"⛔"}</span>
        <div>
          <div style={{ color:verdictColor(cmpResult.rVerdict), fontWeight:800, fontSize:15 }}>{cmpResult.rVerdict}</div>
          <div style={{ color: dark?"#9ca3af":"#374151", fontSize:12, lineHeight:1.5, marginTop:2 }}>{cmpResult.summary}</div>
        </div>
      </div>
      <Card>
        <CT>{t.compareTitle}</CT>
        {cmpResult.platforms.map((pl, i) => {
          const fraudColor = riskColor(pl.fraudLevel);
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background: i===0?(dark?"#0a1f0a":"#dcfce7"):C.sub, border:`1px solid ${i===0?"#166534":C.cardBd}`, borderRadius:12, marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {i === 0 && <span style={{ fontSize:16 }}>🏆</span>}
                <div>
                  <div style={{ color: i===0?"#22c55e":C.text, fontWeight:700, fontSize:14 }}>{pl.platform}</div>
                  <span style={{ padding:"2px 8px", borderRadius:12, background: dark?"#1a0505":"#fee2e2", color:fraudColor, fontSize:10, fontWeight:700, border:`1px solid ${fraudColor}33` }}>{lang==="ko"?"사기":"Fraud"} {pl.fraudScore}</span>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color: i===0?"#22c55e":C.text, fontSize:18, fontWeight:900 }}>{pl.price.toLocaleString()}{t.wonUnit}</div>
                {i > 0 && cmpResult.platforms[0].price > 0 && <div style={{ color:"#ef4444", fontSize:11, marginTop:2 }}>+{(((pl.price-cmpResult.platforms[0].price)/cmpResult.platforms[0].price)*100).toFixed(0)}%</div>}
              </div>
            </div>
          );
        })}
        {cmpResult.retail > 0 && <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:C.sub, border:`1px solid ${C.cardBd}`, borderRadius:10, marginTop:4 }}>
          <span style={{ color:C.textMute, fontSize:12 }}>🏷️ {t.retailPrice}</span>
          <span style={{ color:C.textSub, fontSize:14, fontWeight:700 }}>{cmpResult.retail.toLocaleString()}{t.wonUnit}</span>
        </div>}
      </Card>
      <Card><CT>{t.fraudTitle}</CT><FraudBlock red={cmpResult.red} safe={cmpResult.safe}/></Card>
      <TipsBlock tips={cmpResult.tips}/>
      <div style={{ display:"flex", gap:10, marginTop:4 }}>
        <button onClick={() => setView("seller")} style={{ flex:1, padding:"13px", background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:12, color:C.textSub, fontSize:13, fontWeight:700, cursor:"pointer" }}>🕵️</button>
        <button onClick={() => { resetInputState(); setCmpResult(null); setView("input"); }} style={{ flex:3, padding:"13px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:800, cursor:"pointer" }}>{t.newAnalysis}</button>
      </div>
    </div>
  );

  // ── 분석 결과 ──
  if (view === "result" && result) return (
    <div style={S.page}>
      {overlays}
      <button style={S.back} onClick={() => { setView(null); setResult(null); }}>{t.backNew}</button>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ color:"#6366f1", fontSize:11, fontWeight:700, marginBottom:4 }}>{result.platform}</div>
            <div style={{ color:C.text, fontSize:15, fontWeight:800, lineHeight:1.4, marginBottom:4 }}>{result.name}</div>
            <div style={{ color:C.textMute, fontSize:12 }}>{result.condition}</div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ color:C.textFaint, fontSize:10, marginBottom:2 }}>{t.listedPrice}</div>
            <div style={{ color:C.text, fontSize:18, fontWeight:900 }}>{result.price?.toLocaleString()}{t.wonUnit}</div>
          </div>
        </div>
      </Card>
      <div style={{ background:verdictBg(result.rVerdict), border:`1.5px solid ${verdictBd(result.rVerdict)}`, borderRadius:16, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>{result.rVerdict===V.BUY?"✅":result.rVerdict===V.NEGOTIATE?"🤝":"⛔"}</span>
        <div>
          <div style={{ color:verdictColor(result.rVerdict), fontWeight:800, fontSize:15 }}>{result.rVerdict}</div>
          <div style={{ color: dark?"#9ca3af":"#374151", fontSize:12, lineHeight:1.5, marginTop:2 }}>{result.summary}</div>
        </div>
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <CT>{t.priceAnalysis}</CT>
          <span style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, color:verdictColor(result.pVerdict), background:verdictBg(result.pVerdict), border:`1px solid ${verdictBd(result.pVerdict)}` }}>
            {result.pVerdict}{result.pRate>0?` · ${t.cheaperBy.replace("{n}",result.pRate)}`:result.pRate<0?` · ${t.pricierBy.replace("{n}",Math.abs(result.pRate))}`:""}
          </span>
        </div>
        <div style={{ color:C.textMute, fontSize:12, marginBottom:4 }}>{result.pNote}</div>
        {result.retail > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:C.sub, border:`1px solid ${C.cardBd}`, borderRadius:10, marginBottom:8 }}>
            <span style={{ color:C.textMute, fontSize:12 }}>🏷️ {t.retailPrice}</span>
            <div style={{ textAlign:"right" }}>
              <span style={{ color:C.textSub, fontSize:14, fontWeight:700 }}>{result.retail.toLocaleString()}{t.wonUnit}</span>
              {result.price > 0 && result.retail > result.price && <span style={{ color:"#22c55e", fontSize:11, fontWeight:700, marginLeft:8 }}>-{Math.round((1-result.price/result.retail)*100)}%</span>}
            </div>
          </div>
        )}
        <PriceBar min={result.mMin} max={result.mMax} avg={result.mAvg} listed={result.price} t={t} C={C}/>
        <div style={{ color:C.textFaint, fontSize:11, marginTop:6 }}>📌 {result.mBasis}</div>
        {result.cross && <div style={{ marginTop:10, padding:"10px 12px", background: dark?"#0f1730":"#eff6ff", border:`1px solid ${dark?"#1e3a8a":"#bfdbfe"}`, borderRadius:10, color: dark?"#93c5fd":"#1d4ed8", fontSize:12, lineHeight:1.5 }}>{t.crossPlatform}</div>}
      </Card>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <CT>{t.fraudTitle}</CT>
          <ScoreGauge score={result.fScore} level={result.fLevel} C={{ ...C, t }}/>
        </div>
        <FraudBlock red={result.red} safe={result.safe}/>
      </Card>
      <TipsBlock tips={result.tips} singlePhoto={result.singlePhoto}/>
      <div style={{ display:"flex", gap:10, marginTop:4 }}>
        <button onClick={() => setView("chat")} style={{ flex:1, padding:"13px", background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:12, color:C.textSub, fontSize:13, fontWeight:700, cursor:"pointer" }}>💬</button>
        <button onClick={() => setView("seller")} style={{ flex:1, padding:"13px", background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:12, color:C.textSub, fontSize:13, fontWeight:700, cursor:"pointer" }}>🕵️</button>
        <button onClick={() => { resetInputState(); setResult(null); setView("input"); }} style={{ flex:3, padding:"13px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:800, cursor:"pointer" }}>{t.newAnalysis}</button>
      </div>
    </div>
  );

  // ── 입력 화면 ──
  if (view === "input") {
    const canStart = !loading && (
      (inputMode === "screenshot" && imageFiles.length > 0 && uploadMode !== null) ||
      (inputMode === "manual" && manual.name.trim())
    );
    return (
      <div style={S.page}>
        {overlays}
        <button style={S.back} onClick={goHome}>{t.back}</button>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <h2 style={{ ...S.h1, margin:0 }}>{t.inputTitle}</h2>
          <span style={{ color: freeLeft>0?"#22c55e":"#ef4444", fontSize:11, fontWeight:700, padding:"4px 10px", background: freeLeft>0?(dark?"#052e16":"#dcfce7"):(dark?"#1a0505":"#fee2e2"), borderRadius:20, border:`1px solid ${freeLeft>0?"#166534":"#7f1d1d"}`, whiteSpace:"nowrap", flexShrink:0, marginLeft:8 }}>
            {isSubscribed ? "∞" : freeLeft > 0 ? t.freeLeft.replace("{n}",freeLeft) : chargeLeft > 0 ? t.chargeLeft.replace("{n}",chargeLeft) : t.freeExhausted}
          </span>
        </div>
        <p style={S.sub}>{t.inputSub}</p>
        <div style={{ display:"flex", background:C.card, borderRadius:12, padding:4, marginBottom:22, border:`1px solid ${C.cardBd}` }}>
          {[["screenshot",t.tabSS],["manual",t.tabManual]].map(([v,label]) => (
            <button key={v} onClick={() => { setInputMode(v); if(v==="manual") setUploadMode(null); setError(null); }} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background: inputMode===v?"linear-gradient(135deg,#6366f1,#8b5cf6)":"transparent", color: inputMode===v?"white":C.textMute }}>
              {label}
            </button>
          ))}
        </div>
        {inputMode === "screenshot" ? (
          !uploadMode ? (
            <div>
              <div style={{ color:C.textSub, fontSize:12, fontWeight:700, marginBottom:12 }}>{t.uploadModeTitle}</div>
              {[{key:"angle",icon:"🔍",title:t.modeAngle,desc:t.modeAngleDesc},{key:"compare",icon:"🔄",title:t.modeCompare,desc:t.modeCompareDesc}].map(m => (
                <button key={m.key} onClick={() => setUploadMode(m.key)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:14, padding:"16px", marginBottom:10, cursor:"pointer", textAlign:"left" }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{m.icon}</span>
                  <div><div style={{ color:C.text, fontWeight:700, fontSize:14 }}>{m.title}</div><div style={{ color:C.textMute, fontSize:12, marginTop:2 }}>{m.desc}</div></div>
                  <span style={{ marginLeft:"auto", color:C.textFaint, fontSize:18 }}>›</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <button onClick={() => { setUploadMode(null); setImageFiles([]); setError(null); }} style={{ background:"none", border:"none", color:"#6366f1", cursor:"pointer", fontSize:13, fontWeight:700, padding:0 }}>{t.changeMode}</button>
                <span style={{ padding:"3px 10px", borderRadius:20, background: uploadMode==="compare"?(dark?"#0f1730":"#eff6ff"):(dark?"#1e1f3a":"#eef2ff"), color: uploadMode==="compare"?(dark?"#93c5fd":"#1d4ed8"):(dark?"#a5b4fc":"#4f46e5"), fontSize:11, fontWeight:700 }}>
                  {uploadMode==="compare"?`🔄 ${t.modeCompare}`:`🔍 ${t.modeAngle}`}
                </span>
              </div>
              <input type="file" accept="image/*" multiple ref={fileRef} onChange={e => handleImgAdd(e, setImageFiles, maxPhotos)} style={{ display:"none" }}/>
              <UploadGrid files={imageFiles} onAdd={e => handleImgAdd(e, setImageFiles, maxPhotos)} onRemove={i => setImageFiles(f => f.filter((_,idx)=>idx!==i))} fileRef={fileRef} maxFiles={maxPhotos} t={t} C={C} hint={uploadMode==="compare"?t.compareHint:null}/>
            </>
          )
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[["name",t.fName,t.fNameP],["price",t.fPrice,t.fPriceP],["condition",t.fCond,t.fCondP]].map(([k,l,p]) => (
              <div key={k}><label style={S.lbl}>{l}</label><input value={manual[k]} onChange={e => setManual(m => ({ ...m, [k]:e.target.value }))} placeholder={p} style={S.input}/></div>
            ))}
            <div style={{ background:C.sub, border:`1px solid ${C.cardBd}`, borderRadius:10, padding:"10px 14px", color:C.textFaint, fontSize:12, lineHeight:1.6 }}>{t.manualHint}</div>
          </div>
        )}
        <Err err={error}/>
        <button onClick={() => withLoginSuggest(analyze)} disabled={!canStart} style={{ ...S.btn(!canStart), marginTop:22 }}>
          {loading ? t.analyzing : t.analyzeStart}
        </button>
        {!canUse && <button onClick={() => setView("plan")} style={{ ...S.btn(false), marginTop:10, background:"none", border:`1px solid ${C.cardBd}`, color:C.textMute, boxShadow:"none" }}>{t.usePlan}</button>}
      </div>
    );
  }

  // ── 판매자 조회 ──
  if (view === "seller") return (
    <div style={S.page}>
      {overlays}
      <button style={S.back} onClick={goHome}>{t.back}</button>
      <h2 style={S.h1}>{t.sellerTitle}</h2><p style={S.sub}>{t.sellerSub}</p>
      <Card>
        <div style={{ display:"flex", background:C.sub, borderRadius:10, padding:4, marginBottom:16, gap:4 }}>
          {[["id",t.typeId],["phone",t.typePhone],["account",t.typeAcct]].map(([k,l]) => (
            <button key={k} onClick={() => setSeller(v => ({ ...v, type:k }))} style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background: seller.type===k?"linear-gradient(135deg,#6366f1,#8b5cf6)":"transparent", color: seller.type===k?"white":C.textMute }}>{l}</button>
          ))}
        </div>
        <label style={S.lbl}>{t.sellerLabel}</label>
        <input value={seller.value} onChange={e => setSeller(v => ({ ...v, value:e.target.value }))} onKeyDown={e => e.key==="Enter" && !loading && seller.value.trim() && withLoginSuggest(checkSeller)} placeholder={seller.type==="id"?"user_123":seller.type==="phone"?"010-1234-5678":"110-123-456789"} style={S.input}/>
        <div style={{ color:C.textFaint, fontSize:11, marginTop:10, lineHeight:1.6 }}>{t.sellerNote}</div>
      </Card>
      <Err err={error}/>
      {sellerResult && (
        <>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <CT>{t.sellerRisk}</CT>
              <ScoreGauge score={sellerResult.score} level={sellerResult.level} C={{ ...C, t }}/>
            </div>
            <FraudBlock red={sellerResult.warn} safe={sellerResult.safe}/>
            {sellerResult.analysis?.filter(Boolean).length > 0 && (
              <div style={{ marginTop:10 }}>
                <div style={{ color:C.textSub, fontSize:11, fontWeight:700, marginBottom:6 }}>{t.sellerAnalysis}</div>
                {sellerResult.analysis.filter(Boolean).map((a,i) => <div key={i} style={{ background:C.sub, border:`1px solid ${C.cardBd}`, borderRadius:8, padding:"7px 12px", marginBottom:5, color:C.textSub, fontSize:12 }}>• {a}</div>)}
              </div>
            )}
            {sellerResult.advice && <div style={{ background:C.sub, border:`1px solid ${C.cardBd}`, borderRadius:10, padding:"12px 14px", color:C.textSub, fontSize:13, lineHeight:1.6, marginTop:10 }}>💡 {sellerResult.advice}</div>}
          </Card>
          <div style={{ color:C.textFaint, fontSize:11, textAlign:"center", lineHeight:1.6, whiteSpace:"pre-line", marginBottom:14 }}>{t.sellerDisclaimer}</div>
        </>
      )}
      <button onClick={() => withLoginSuggest(checkSeller)} disabled={loading || !seller.value.trim()} style={S.btn(loading || !seller.value.trim())}>
        {loading ? t.sellerChecking : t.sellerBtn}
      </button>
    </div>
  );

  // ── 대화 분석 ──
  if (view === "chat") {
    const chatDisabled = loading || (!chat.text.trim() && !chat.file);
    return (
      <div style={S.page}>
        {overlays}
        <button style={S.back} onClick={goHome}>{t.back}</button>
        <h2 style={S.h1}>{t.chatTitle}</h2><p style={S.sub}>{t.chatSub}</p>
        <input type="file" accept="image/*" ref={chatFileRef} onChange={handleChatImg} style={{ display:"none" }}/>
        {!chat.preview ? (
          <div onClick={() => chatFileRef.current?.click()} style={{ border:`2px dashed ${C.cardBd}`, borderRadius:16, padding:"30px 20px", textAlign:"center", cursor:"pointer", background:C.card, marginBottom:14 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
            <div style={{ color:C.text, fontWeight:700, fontSize:14, marginBottom:4 }}>{t.chatUpload}</div>
            <div style={{ color:C.textFaint, fontSize:12 }}>{t.chatUploadDesc}</div>
          </div>
        ) : (
          <div style={{ position:"relative", marginBottom:14 }}>
            <img src={chat.preview} alt="" style={{ width:"100%", borderRadius:14, maxHeight:240, objectFit:"cover", border:`1px solid ${C.cardBd}` }}/>
            <button onClick={() => setChat(c => ({ ...c, file:null, preview:null }))} style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.75)", color:"white", border:"none", borderRadius:"50%", width:28, height:28, cursor:"pointer" }}>✕</button>
          </div>
        )}
        <label style={S.lbl}>{t.chatPasteLabel}</label>
        <textarea value={chat.text} onChange={e => setChat(c => ({ ...c, text:e.target.value }))} placeholder={t.chatPastePlaceholder} rows={5} style={{ ...S.input, resize:"vertical", fontFamily:"inherit", lineHeight:1.5 }}/>
        <Err err={error}/>
        {chatResult && (
          <div style={{ marginTop:16 }}>
            <Card><CT>{t.chatMood}</CT><div style={{ display:"flex", alignItems:"center", gap:14 }}><span style={{ fontSize:40 }}>{chatResult.moodEmoji}</span><span style={{ color:C.textSub, fontSize:14, lineHeight:1.5 }}>{chatResult.mood}</span></div></Card>
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <CT>{t.chatNego}</CT>
                <span style={{ fontSize:22, fontWeight:900, color: chatResult.negoChance>=60?"#22c55e":chatResult.negoChance>=30?"#f59e0b":"#ef4444" }}>{chatResult.negoChance}%</span>
              </div>
              <div style={{ height:8, background: dark?"#1e293b":"#e5e7eb", borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                <div style={{ width:`${chatResult.negoChance}%`, height:"100%", background: chatResult.negoChance>=60?"#22c55e":chatResult.negoChance>=30?"#f59e0b":"#ef4444", borderRadius:4 }}/>
              </div>
              <div style={{ color:C.textMute, fontSize:12 }}>{chatResult.negoComment}</div>
            </Card>
            {chatResult.strategy?.filter(Boolean).length > 0 && (
              <Card><CT>{t.chatStrategy}</CT>{chatResult.strategy.filter(Boolean).map((s,i) => <div key={i} style={{ display:"flex", gap:8, padding:"9px 12px", background:C.sub, borderRadius:10, marginBottom:7, border:`1px solid ${C.cardBd}` }}><span style={{ color:"#6366f1", flexShrink:0 }}>→</span><span style={{ color:C.textSub, fontSize:13, lineHeight:1.5 }}>{s}</span></div>)}</Card>
            )}
          </div>
        )}
        <button onClick={() => withLoginSuggest(analyzeChat)} disabled={chatDisabled} style={{ ...S.btn(chatDisabled), marginTop:16 }}>
          {loading ? t.chatAnalyzing : t.chatBtn}
        </button>
      </div>
    );
  }

  // ── 홈 ──
  if (tab === "home") return (
    <div style={S.page}>
      {overlays}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ color:"#6366f1", fontSize:12, fontWeight:700 }}>
            {grade.icon} {grade.label[lang]}
            {user && !user.guest && <span style={{ color:C.textMute, fontWeight:400, marginLeft:6 }}>· {user.kakaoName || user.name}</span>}
          </div>
          <h1 style={{ ...S.h1, fontSize:20, margin:"2px 0 0" }}>{t.appName}</h1>
        </div>
        <div style={{ textAlign:"right" }}>
          {!user ? (
            <button onClick={() => setShowLoginModal(true)} style={{ background:"#FEE500", color:"#191919", border:"none", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              💬 {lang==="ko"?"로그인":"Login"}
            </button>
          ) : (
            <div style={{ color: isSubscribed?"#8b5cf6":freeLeft>0?"#22c55e":"#ef4444", fontSize:12, fontWeight:700 }}>
              {isSubscribed ? "∞ 구독중" : freeLeft>0 ? t.freeLeft.replace("{n}",freeLeft) : chargeLeft>0 ? t.chargeLeft.replace("{n}",chargeLeft) : t.freeExhausted}
            </div>
          )}
        </div>
      </div>
      {[
        { icon:"📸", title:t.menuScreenshot, desc:t.menuScreenshotDesc, action:()=>{ setInputMode("screenshot"); setView("input"); } },
        { icon:"✏️", title:t.menuManual,     desc:t.menuManualDesc,     action:()=>{ setInputMode("manual"); setView("input"); } },
        { icon:"🔐", title:t.menuAuth,       desc:t.menuAuthDesc,       action:()=>setView("auth") },
        { icon:"💬", title:t.menuChat,       desc:t.menuChatDesc,       action:()=>setView("chat") },
        { icon:"🕵️", title:t.menuSeller,     desc:t.menuSellerDesc,     action:()=>setView("seller") },
      ].map(c => (
        <button key={c.title} onClick={c.action} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:14, padding:"16px", marginBottom:10, cursor:"pointer", textAlign:"left" }}>
          <span style={{ fontSize:26, flexShrink:0 }}>{c.icon}</span>
          <div><div style={{ color:C.text, fontWeight:700, fontSize:14 }}>{c.title}</div><div style={{ color:C.textMute, fontSize:12, marginTop:2 }}>{c.desc}</div></div>
          <span style={{ marginLeft:"auto", color:C.textFaint, fontSize:18 }}>›</span>
        </button>
      ))}
      {!canUse && <button onClick={() => setView("plan")} style={{ ...S.btn(false), marginTop:4 }}>{t.usePlan}</button>}
      <BottomNav/>
    </div>
  );

  // ── 기록 ──
  if (tab === "archive") {
    const filtered = history.filter(h => (h.name||"").toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={S.page}>
        {overlays}
        <h2 style={S.h1}>{t.archiveTitle}</h2>
        <Card>
          <CT>{t.statsTitle}</CT>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[[t.statTotal,totalCount],[t.statMonth,monthCount],[t.statFraud,fraudPrevented],[t.statSaved,savedAmount>0?`${savedAmount.toLocaleString()}${t.wonUnit}`:"—"]].map(([label,val],i) => (
              <div key={i} style={{ background:C.sub, borderRadius:12, padding:"12px 14px", border:`1px solid ${C.cardBd}` }}>
                <div style={{ color:C.textMute, fontSize:11, marginBottom:4 }}>{label}</div>
                <div style={{ color:C.text, fontSize:18, fontWeight:900 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background: dark?"#1e1f3a":"#eef2ff", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>{grade.icon}</span>
            <div>
              <div style={{ color:"#6366f1", fontWeight:800, fontSize:13 }}>{grade.label[lang]}</div>
              <div style={{ color:C.textMute, fontSize:11 }}>{lang==="ko"?`총 ${totalCount}회 감정`:`${totalCount} total analyses`}</div>
            </div>
          </div>
        </Card>
        <div style={{ position:"relative", marginBottom:14 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchP} style={{ ...S.input, paddingLeft:40 }}/>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", color:C.textMute, fontSize:14 }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:0.5 }}>📭</div>{t.archiveEmpty}
          </div>
        ) : filtered.map(h => (
          <div key={h.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:C.card, border:`1px solid ${C.cardBd}`, borderRadius:12, padding:"14px", marginBottom:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                <span style={{ fontSize:12 }}>{h.type==="auth"?"🔐":h.type==="compare"?"🔄":"📦"}</span>
                <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{h.name}</div>
              </div>
              <div style={{ color:C.textMute, fontSize:11 }}>{h.platform}{h.price>0?` · ${h.price.toLocaleString()}${t.wonUnit}`:""} · {h.time}</div>
            </div>
            <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color: h.type==="auth"?"#8b5cf6":verdictColor(h.verdict), background: h.type==="auth"?(dark?"#1e1f3a":"#eef2ff"):verdictBg(h.verdict), border:`1px solid ${h.type==="auth"?"#6366f1":verdictBd(h.verdict)}`, flexShrink:0, marginLeft:8 }}>{h.verdict}</span>
          </div>
        ))}
        <BottomNav/>
      </div>
    );
  }

  // ── 설정 ──
  if (tab === "settings") return (
    <div style={S.page}>
      {overlays}
      <h2 style={S.h1}>{t.settingsTitle}</h2><div style={{ marginBottom:16 }}/>
      {user && !user.guest && (
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🦊</div>
            <div>
              <div style={{ color:C.text, fontWeight:700, fontSize:15 }}>{user.kakaoName || user.name}</div>
              <div style={{ color:C.textMute, fontSize:12 }}>{grade.icon} {grade.label[lang]}</div>
            </div>
          </div>
          <Card style={{ margin:0, background:C.sub }}>
            <CT>{t.gradeBenefits}</CT>
            <div style={{ display:"flex", gap:8 }}>
              {[[grade.free, t.freeCntLabel],[grade.photos, t.photoMaxLabel]].map(([v,l],i) => (
                <div key={i} style={{ flex:1, textAlign:"center", padding:"10px", background:C.card, borderRadius:10, border:`1px solid ${C.cardBd}` }}>
                  <div style={{ color:"#6366f1", fontSize:18, fontWeight:900 }}>{v}</div>
                  <div style={{ color:C.textMute, fontSize:11 }}>{l}</div>
                </div>
              ))}
              {grade.noAd && (
                <div style={{ flex:1, textAlign:"center", padding:"10px", background:C.card, borderRadius:10, border:"1px solid #166534" }}>
                  <div style={{ color:"#22c55e", fontSize:18, fontWeight:900 }}>✓</div>
                  <div style={{ color:C.textMute, fontSize:11 }}>{t.noAdLabel}</div>
                </div>
              )}
            </div>
          </Card>
        </Card>
      )}
      {!user && (
        <Card>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:C.textMute, fontSize:13, marginBottom:12 }}>{t.loginModalSub}</div>
            <button onClick={() => setShowLoginModal(true)} style={{ ...S.btn(false), background:"#FEE500", color:"#191919", boxShadow:"0 4px 14px rgba(254,229,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>💬</span>{t.loginBtn}
            </button>
          </div>
        </Card>
      )}
      <Card>
        <CT>{t.inviteTitle}</CT>
        <div style={{ color:C.textMute, fontSize:13, marginBottom:12 }}>{t.inviteSub}</div>
        <button onClick={handleInvite} style={{ ...S.btn(false), background: inviteCopied?"#22c55e":"linear-gradient(135deg,#6366f1,#8b5cf6)", padding:"12px" }}>{inviteCopied?t.inviteCopied:t.inviteBtn}</button>
      </Card>
      <Card>
        <CT>{t.themeLabel}</CT>
        <div style={{ display:"flex", gap:10 }}>
          {[["light",t.themeLight],["dark",t.themeDark]].map(([k,l]) => (
            <button key={k} onClick={() => setTheme(k)} style={{ flex:1, padding:"14px", borderRadius:12, border:`1.5px solid ${theme===k?"#6366f1":C.cardBd}`, background: theme===k?(dark?"#1e1f3a":"#eef2ff"):C.sub, color: theme===k?"#6366f1":C.textMute, fontSize:14, fontWeight:700, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </Card>
      <Card>
        <CT>{t.langLabel}</CT>
        <div style={{ display:"flex", gap:10 }}>
          {[["ko","🇰🇷 한국어"],["en","🇺🇸 English"]].map(([k,l]) => (
            <button key={k} onClick={() => setLang(k)} style={{ flex:1, padding:"14px", borderRadius:12, border:`1.5px solid ${lang===k?"#6366f1":C.cardBd}`, background: lang===k?(dark?"#1e1f3a":"#eef2ff"):C.sub, color: lang===k?"#6366f1":C.textMute, fontSize:14, fontWeight:700, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </Card>
      <Card><CT>{t.aboutLabel}</CT><p style={{ color:C.textMute, fontSize:13, lineHeight:1.6, margin:0, whiteSpace:"pre-line" }}>{t.aboutText}</p></Card>
      {user && <button onClick={() => { setUser(null); LS.set("user",null); showToast(lang==="ko"?"로그아웃되었어요":"Logged out"); }} style={{ ...S.btn(false), background:"none", border:`1px solid ${C.cardBd}`, color:"#ef4444", boxShadow:"none" }}>{t.logoutBtn}</button>}
      <BottomNav/>
    </div>
  );

  return null;
}
