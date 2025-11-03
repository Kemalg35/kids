/* ===================== Yardımcı Fonksiyonlar ====================== */
function qs(s, el=document){ return el.querySelector(s); }
function $$s(s, el=document){ return [...el.querySelectorAll(s)]; }
const $$ = $$s;
function shuffle(a){ return a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function celebrate(msg){ toast(msg,"ok"); }
function warn(msg){ toast(msg,"warn"); }
function toast(msg,type="ok"){
  const t=document.createElement("div");
  t.textContent=msg;
  t.style.position="fixed";
  t.style.left="50%";
  t.style.top="12px";
  t.style.transform="translateX(-50%)";
  t.style.padding="8px 12px";
  t.style.borderRadius="10px";
  t.style.background= type==="ok" ? "#dcfce7" : "#fef9c3";
  t.style.border="1px solid #00000020";
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1200);
}
function getAgeBand(){ return localStorage.getItem("ageBand") || "5-7"; }

/* ===================== Sabit Veriler ====================== */
const COLORS = [
  {name:"kırmızı",hex:"#ef4444"},
  {name:"mavi",hex:"#3b82f6"},
  {name:"yeşil",hex:"#22c55e"},
  {name:"sarı",hex:"#f59e0b"}
];

const NUMBERS_TASKS = [
  {asset:"🍎",count:3},
  {asset:"⭐",count:5},
  {asset:"🐟",count:2},
  {asset:"🍓",count:4},
  {asset:"🐦",count:6}
];

const WEEK_CHALLENGE = [
  "3 masal oku/oluştur",
  "5 renk görevi tamamla",
  "2 sayı görevi bitir",
  "1 ritim oyunu oyna"
];

/* ===================== Router / Navigation ====================== */
const menu = qs("#menu");

$$(".tile").forEach(b => b.addEventListener("click", () => goScreen(b.dataset.go)));
$$(".back").forEach(b => b.addEventListener("click", () => showMenu()));

function showMenu(){
  hideAll();
  qs("#menu").classList.remove("hidden");
}

function goScreen(name){
  hideAll();
  qs(`#screen-${name}`).classList.remove("hidden");
  if(name==="colors") renderColors();
  if(name==="numbers") renderNumbers();
  if(name==="challenges") renderChallenges();
}

function hideAll(){
  $$(".screen").forEach(s => s.classList.add("hidden"));
  qs("#menu").classList.add("hidden");
}

/* ===================== RENKLER ====================== */
function renderColors(){
  const wrap = qs("#colors-wrap");
  wrap.innerHTML = "";
  const target = COLORS[Math.floor(Math.random()*COLORS.length)];
  const options = shuffle([...COLORS]).slice(0,3);
  if(!options.find(o=>o.name===target.name)) options[0]=target;

  const ask = document.createElement("div");
  ask.className="card";
  ask.innerHTML = `<strong>Hangi renk?</strong> <span class="muted">(Ara: ${target.name})</span>`;
  wrap.appendChild(ask);

  const row = document.createElement("div");
  row.style.display="grid";
  row.style.gridTemplateColumns="repeat(3,1fr)";
  row.style.gap="8px";
  row.style.marginTop="8px";

  options.forEach(o=>{
    const btn=document.createElement("button");
    btn.className="btn";
    btn.style.background=o.hex;
    btn.style.color="#fff";
    btn.textContent=o.name.toUpperCase();
    btn.onclick=()=>{
      if(o.name===target.name){
        celebrate("Doğru!");
        renderColors();
      } else warn("Tekrar dene!");
    };
    row.appendChild(btn);
  });
  wrap.appendChild(row);
}

/* ===================== SAYILAR ====================== */
function renderNumbers(){
  const wrap = qs("#numbers-wrap");
  wrap.innerHTML="";
  const t = NUMBERS_TASKS[Math.floor(Math.random()*NUMBERS_TASKS.length)];
  const area = document.createElement("div");
  area.className="card";
  const icons = Array.from({length:t.count}).map(()=>t.asset).join(" ");
  area.innerHTML = `<div style="font-size:28px">${icons}</div>
    <label>Kaç tane?
      <input id="numAnswer" type="number" inputmode="numeric" placeholder="Sayı gir">
    </label>
    <button class="btn" id="checkNum">Kontrol</button>`;
  wrap.appendChild(area);
  qs("#checkNum").onclick=()=>{
    const v = Number(qs("#numAnswer").value);
    if(v===t.count){ celebrate("Süper!"); renderNumbers(); }
    else warn("Yanlış, tekrar sayalım.");
  };
}

/* ===================== MÜZİK ====================== */
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
function playTone(freq, dur=0.35){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type="sine";
  o.frequency.value=freq;
  o.connect(g);
  g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime+0.02);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
  o.start();
  o.stop(audioCtx.currentTime+dur);
}
$$(".key").forEach(k=>k.onclick=()=>playTone(Number(k.dataset.f)));
const pattern=[261.63,293.66,329.63,349.23]; // Do-Re-Mi-Fa
qs("#playRythm").onclick=async ()=>{
  qs("#rythmStatus").textContent="Dinle ve tekrarla";
  for(const f of pattern){ playTone(f); await sleep(450); }
  qs("#rythmStatus").textContent="Bitti";
};

/* ===================== MASAL ====================== */
qs("#storyForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const text = makeStory(data);
  qs("#storyOut").textContent = text;
});

qs("#ttsBtn").onclick=()=>{
  const t = qs("#storyOut").textContent.trim();
  if(!t) return warn("Önce masalı oluştur.");
  const u = new SpeechSynthesisUtterance(t);
  u.lang="tr-TR";
  speechSynthesis.speak(u);
};

function makeStory({name,place,event}){
  const ageBand = getAgeBand();
  const line1 = `${name} bugün ${place}da küçük bir maceraya çıktı.`;
  const line2 = `Karşısına yardımsever minik bir dost çıktı ve ${event} için birlikte plan yaptı.`;
  const line3 = `Merakla adım adım ilerlerken ${name}, sakin nefes almayı ve pes etmemeyi öğrendi.`;
  const lesson = ageBand==="2-4" ? "Küçük adımlar da büyük işler başarır." :
                 ageBand==="5-7" ? "Birlikte düşünmek her zaman daha güçlüdür." :
                 "Cesaret, dikkat ve nezaket bir arada olunca her yol açılır.";
  return `${line1} ${line2} ${line3} Ders: ${lesson}`;
}

/* ===================== MİNİ OYUN ====================== */
let simonSeq=[], simonStep=0, simonBusy=false;
qs("#simonStart").onclick=()=>{ simonSeq=[]; nextSimon(); };
$$(".pad").forEach(p=>p.onclick=()=>pressPad(Number(p.dataset.i)));

function nextSimon(){
  simonSeq.push(Math.floor(Math.random()*4));
  simonStep=0;
  playSeq();
}

async function playSeq(){
  simonBusy=true;
  qs("#simonInfo").textContent=`Uzunluk: ${simonSeq.length}`;
  for(const i of simonSeq){
    const pad=$$(`.pad`)[i];
    pad.classList.add("active");
    playTone(220+80*i,0.25);
    await sleep(350);
    pad.classList.remove("active");
    await sleep(120);
  }
  simonBusy=false;
}

function pressPad(i){
  if(simonBusy) return;
  const ok = simonSeq[simonStep]===i;
  if(!ok){ warn("Olmadı, tekrar!"); simonSeq=[]; return; }
  simonStep++;
  playTone(220+80*i,0.18);
  if(simonStep===simonSeq.length){ celebrate("Harika!"); nextSimon(); }
}

/* ===================== GÖREV/STİCKER ====================== */
function renderChallenges(){
  const ul = qs("#challengeList");
  ul.innerHTML="";
  WEEK_CHALLENGE.forEach(c=>{
    const li=document.createElement("li");
    li.textContent=c;
    ul.appendChild(li);
  });
}
qs("#claimSticker").onclick=()=>{
  const n = (Number(localStorage.getItem("stickers")||0))+1;
  localStorage.setItem("stickers", String(n));
  qs("#stickerInfo").textContent=`Toplam sticker: ${n}`;
  celebrate("Sticker kazandın!");
};

/* ===================== EBEVEYN ALANI ====================== */
const parentModal = qs("#parentModal");
qs("#parentBtn").onclick=()=>parentModal.showModal();
parentModal.addEventListener("click", e=>{
  if(e.target.value==="ok"){
    qs("#parentArea").classList.remove("hidden");
  }
});
qs("#saveLimit").onclick=(e)=>{
  e.preventDefault();
  const v = Number(qs("#limitInput").value||15);
  localStorage.setItem("dailyLimit", String(v));
  qs("#limitInfo").textContent=`Günlük limit: ${v} dk`;
  celebrate("Kaydedildi");
};

/* ===================== PWA ====================== */
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  });
}
