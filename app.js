document.addEventListener("DOMContentLoaded",()=>{
const qs=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const tap=qs("#tapSound"),okS=qs("#successSound"),failS=qs("#failSound");
function play(a){if(!a)return;a.currentTime=0;a.play();}

/* Sayfa geçişleri */
$$(".tile").forEach(btn=>btn.onclick=()=>openScreen(btn.dataset.go));
$$(".back").forEach(b=>b.onclick=()=>openScreen("menu"));
function openScreen(id){
  play(tap);
  $$(".screen").forEach(s=>s.classList.remove("active"));
  const target=id==="menu"?qs("#menu"):qs("#screen-"+id);
  target.classList.add("active");
  if(id==="colors") newColorRound();
  if(id==="numbers") newNumbersRound();
  if(id==="music") setupMusic();
}

/* Konuşma */
let female=null;
function pickVoice(){const v=speechSynthesis.getVoices();
  female=v.find(x=>x.lang.startsWith("tr")&&/female|kadın|yelda|filiz/i.test(x.name))||v.find(x=>x.lang.startsWith("tr"))||null;}
pickVoice();speechSynthesis.onvoiceschanged=pickVoice;
function speak(t){const u=new SpeechSynthesisUtterance(t);u.lang="tr-TR";u.voice=female;u.rate=0.9;u.pitch=1.3;speechSynthesis.cancel();speechSynthesis.speak(u);}

/* Konfeti */
const canvas=qs("#confettiCanvas"),ctx=canvas.getContext("2d");
function fit(){canvas.width=innerWidth;canvas.height=innerHeight;}fit();addEventListener("resize",fit);
function confetti(){let p=Array.from({length:150},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,c:`hsl(${Math.random()*360},100%,60%)`,r:Math.random()*5+2,s:Math.random()*3+2}));
let run=true;(function loop(){ctx.clearRect(0,0,canvas.width,canvas.height);
p.forEach(a=>{a.y+=a.s;if(a.y>canvas.height)a.y=0;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,6.28);ctx.fillStyle=a.c;ctx.fill();});
if(run)requestAnimationFrame(loop);})();setTimeout(()=>run=false,2000);}

/* ---------- Renk Oyunu ---------- */
const COLORS=[{name:"kırmızı",hex:"#ef4444"},{name:"mavi",hex:"#3b82f6"},{name:"yeşil",hex:"#22c55e"},{name:"sarı",hex:"#facc15"},{name:"siyah",hex:"#111"}];
const OBJECTS=["balon","araba","elma","kurbağa","yıldız","çiçek"];
const colorV=qs("#color-visual"),colorQ=qs("#color-question"),colorOpts=qs("#color-options");
function svgObj(o,f){if(o==="balon")return `<svg viewBox="0 0 100 140"><ellipse cx="50" cy="50" rx="35" ry="42" fill="${f}"/><polygon points="45,88 55,88 50,102" fill="${f}"/></svg>`;
if(o==="araba")return `<svg viewBox="0 0 160 90"><rect x="20" y="35" width="120" height="30" rx="8" fill="${f}"/><circle cx="45" cy="70" r="10"/><circle cx="115" cy="70" r="10"/></svg>`;
if(o==="elma")return `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="38" fill="${f}"/></svg>`;
if(o==="kurbağa")return `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="70" rx="40" ry="25" fill="${f}"/></svg>`;
return `<svg viewBox="0 0 120 120"><polygon points="60,10 73,45 110,45 79,65 90,100 60,80 30,100 41,65 10,45 47,45" fill="${f}"/></svg>`;}
function newColorRound(){const col=COLORS[Math.floor(Math.random()*COLORS.length)],obj=OBJECTS[Math.floor(Math.random()*OBJECTS.length)];
colorV.innerHTML=svgObj(obj,col.hex);colorV.dataset.ans=col.name;colorQ.textContent=`Bu ${obj} hangi renkte?`;speak(`Bu ${obj} hangi renkte sence?`);
colorOpts.innerHTML="";let mix=[...COLORS].sort(()=>Math.random()-0.5).slice(0,4);if(!mix.find(x=>x.name===col.name))mix[0]=col;
mix.sort(()=>Math.random()-0.5).forEach(c=>{let b=document.createElement("button");b.className="option";b.style.background=c.hex;b.onclick=()=>checkColor(c.name);colorOpts.appendChild(b);});}
function checkColor(sel){play(tap);if(sel===colorV.dataset.ans){play(okS);speak("Harika bildin!");confetti();setTimeout(newColorRound,2000);}
else{play(failS);speak("Yanlış, tekrar dene.");colorV.classList.add("shake");setTimeout(()=>colorV.classList.remove("shake"),400);}}

/* ---------- Sayılar ---------- */
const numV=qs("#numbers-visual"),numO=qs("#numbers-options");const ICONS=["⭐","🍓","🐟","🧩"];
function newNumbersRound(){const ic=ICONS[Math.floor(Math.random()*ICONS.length)],n=2+Math.floor(Math.random()*7);
numV.textContent=ic.repeat(n);numO.innerHTML="";let set=new Set([n]);while(set.size<4)set.add(2+Math.floor(Math.random()*9));
[...set].sort(()=>Math.random()-0.5).forEach(x=>{let b=document.createElement("button");b.className="option";b.textContent=x;b.onclick=()=>checkNum(x,n);numO.appendChild(b);});
speak(`Ekranda kaç tane ${ic} var?`);}
function checkNum(a,n){play(tap);if(a===n){play(okS);speak("Süper saydın!");confetti();setTimeout(newNumbersRound,2000);}
else{play(failS);speak("Bir daha sayalım.");numV.classList.add("shake");setTimeout(()=>numV.classList.remove("shake"),400);}}

/* ---------- Masal ---------- */
qs("#storyForm").onsubmit=e=>{
  e.preventDefault();play(tap);
  const d=Object.fromEntries(new FormData(e.target).entries());
  const t=`Bir zamanlar ${d.place}da yaşayan ${d.name} adında bir çocuk varmış. Bir gün ${d.event} ve yeni bir şey öğrenmiş.`;
  qs("#storyOut").textContent=t;qs("#story-visual").innerHTML=`<svg viewBox="0 0 150 120"><rect width="150" height="70" y="50" fill="#8b5cf6"/><circle cx="40" cy="60" r="22" fill="#f59e0b"/></svg>`;
  speak("Masal hazır!");};
qs("#storyVoice").onclick=()=>{const t=qs("#storyOut").textContent;if(t)speak(t);}
qs("#storyDraw").onclick=()=>speak("Görsel çizim özelliği yakında eklenecek.");

/* ---------- Müzik ---------- */
function setupMusic(){const ctx=new (window.AudioContext||window.webkitAudioContext)();
$$(".keys button").forEach(b=>b.onclick=()=>{play(tap);const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
o.frequency.value=b.dataset.f;o.type="sine";g.gain.value=0.2;o.start();o.stop(ctx.currentTime+0.3);});}
});
