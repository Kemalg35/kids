document.addEventListener("DOMContentLoaded", () => {
  /* ================= Utilities ================= */
  const qs = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>[...el.querySelectorAll(s)];
  const tap = qs("#tapSound"), okS = qs("#successSound"), failS = qs("#failSound");
  function play(a){ if(!a) return; a.currentTime=0; a.play(); }

  // Speech (kadın sesi varsa otomatik)
  const speakCfg = { voice:null };
  function pickTurkishFemale(){
    const vv = speechSynthesis.getVoices();
    speakCfg.voice =
      vv.find(v=>v.lang.startsWith("tr") && /female|kadın|filiz|yelda/i.test(v.name)) ||
      vv.find(v=>v.lang.startsWith("tr")) || null;
  }
  pickTurkishFemale();
  if ('onvoiceschanged' in speechSynthesis) speechSynthesis.onvoiceschanged = pickTurkishFemale;

  function speak(text){
    if(!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    if (speakCfg.voice) u.voice = speakCfg.voice;
    u.rate = 0.9;   // akıcı tempo
    u.pitch = 1.25; // yumuşak, zarif tını
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  /* ================= Confetti ================= */
  const c = qs("#confettiCanvas"), ctx = c.getContext("2d");
  function fit(){ c.width = innerWidth; c.height = innerHeight; }
  addEventListener("resize", fit); fit();
  let confetti=[], confettiOn=false;
  function boom(){
    confetti = Array.from({length:160}, ()=>({
      x: Math.random()*c.width,
      y: -Math.random()*c.height,
      r: 2+Math.random()*5,
      s: 2+Math.random()*3,
      col: `hsl(${Math.random()*360},100%,60%)`
    }));
    confettiOn = true; requestAnimationFrame(runConfetti);
    setTimeout(()=>{confettiOn=false; ctx.clearRect(0,0,c.width,c.height);}, 2000);
  }
  function runConfetti(){
    if(!confettiOn) return;
    ctx.clearRect(0,0,c.width,c.height);
    confetti.forEach(p=>{
      p.y += p.s; if(p.y>c.height) p.y = 0;
      ctx.beginPath(); ctx.fillStyle=p.col; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(runConfetti);
  }

  /* ================= Router ================= */
  $$(".tile").forEach(b=>b.addEventListener("click", ()=>{
    play(tap); hideAll(); qs(`#screen-${b.dataset.go}`).classList.remove("hidden");
    if(b.dataset.go==="colors") newColorRound();
    if(b.dataset.go==="numbers") newNumbersRound();
    if(b.dataset.go==="music") setupMusic();
  }));
  $$(".back").forEach(b=>b.addEventListener("click", ()=>{ play(tap); hideAll(); qs("#menu").classList.remove("hidden"); }));
  function hideAll(){ $$(".screen").forEach(s=>s.classList.add("hidden")); qs("#menu").classList.add("hidden"); }

  /* ================= Ebeveyn & Rozetler ================= */
  const parentModal = qs("#parentModal");
  qs("#parentBtn").addEventListener("click", ()=>parentModal.showModal());
  qs("#saveLimit").addEventListener("click", (e)=>{
    e.preventDefault();
    localStorage.setItem("dailyLimit", String(qs("#limitInput").value||20));
    localStorage.setItem("ageBand", qs("#ageBand").value);
    qs("#limitInfo").textContent = `Günlük limit: ${localStorage.getItem("dailyLimit")} dk | Yaş: ${localStorage.getItem("ageBand")}`;
  });

  const badgesModal = qs("#badgesModal");
  qs("#badgesBtn").addEventListener("click", ()=>{ renderChallenges(); badgesModal.showModal(); });
  qs("#resetSticker").addEventListener("click", ()=>{ localStorage.removeItem("stickers"); updateStickerInfo(); });
  qs("#claimSticker").addEventListener("click", ()=>{ 
    const n = (Number(localStorage.getItem("stickers")||0))+1; 
    localStorage.setItem("stickers", String(n)); updateStickerInfo(); play(okS); 
  });
  function updateStickerInfo(){ qs("#stickerInfo").textContent = `Toplam rozet: ${Number(localStorage.getItem("stickers")||0)}`; }
  function renderChallenges(){
    const WEEK = ["3 masal oluştur","5 renk görevi tamamla","3 sayı görevi bitir","2 ritim çalış"];
    const ul = qs("#challengeList"); ul.innerHTML=""; WEEK.forEach(c=>{ const li=document.createElement("li"); li.textContent=c; ul.appendChild(li); });
    updateStickerInfo();
  }

  /* ================= Colors ================= */
  const COLORS = [
    { name:"kırmızı", hex:"#ef4444" },
    { name:"mavi",   hex:"#3b82f6" },
    { name:"yeşil",  hex:"#22c55e" },
    { name:"sarı",   hex:"#facc15" },
    { name:"siyah",  hex:"#111111" }
  ];
  const OBJECTS = ["balon","araba","elma","kurbağa","yıldız","uçurtma","çiçek"];

  const colorVisual = qs("#color-visual");
  const colorOpts = qs("#color-options");
  const colorQ = qs("#color-question");

  function svgFor(object, fill){
    if(object==="balon"){
      return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="35" ry="42" fill="${fill}"/>
        <polygon points="45,88 55,88 50,102" fill="${fill}"/>
        <path d="M50 102 C 52 110, 40 118, 50 130" stroke="${fill}" stroke-width="3" fill="none"/>
      </svg>`;
    }
    if(object==="araba"){
      return `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="35" width="120" height="30" rx="8" fill="${fill}"/>
        <rect x="45" y="20" width="60" height="25" rx="8" fill="${fill}"/>
        <circle cx="45" cy="70" r="10" fill="#333"/>
        <circle cx="115" cy="70" r="10" fill="#333"/>
      </svg>`;
    }
    if(object==="elma"){
      return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="38" fill="${fill}"/>
        <rect x="58" y="18" width="5" height="15" fill="#6b4f1d"/>
        <path d="M63 20 C 85 10, 95 30, 80 32" fill="#2ecc71"/>
      </svg>`;
    }
    if(object==="kurbağa"){
      return `<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="70" rx="38" ry="28" fill="${fill}"/>
        <circle cx="50" cy="50" r="10" fill="#fff"/><circle cx="90" cy="50" r="10" fill="#fff"/>
        <circle cx="50" cy="50" r="5" fill="#222"/><circle cx="90" cy="50" r="5" fill="#222"/>
        <path d="M52 80 Q70 90 88 80" stroke="#222" stroke-width="4" fill="none"/>
      </svg>`;
    }
    // yıldız / uçurtma / çiçek
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,10 73,45 110,45 79,65 90,100 60,80 30,100 41,65 10,45 47,45"
        fill="${fill}" />
    </svg>`;
  }

  function newColorRound(){
    const targetColor = COLORS[Math.floor(Math.random()*COLORS.length)];
    const object = OBJECTS[Math.floor(Math.random()*OBJECTS.length)];
    colorQ.textContent = `Bu ${object} hangi renkte?`;
    speak(`Bu ${object} hangi renkte sence?`);
    colorVisual.innerHTML = svgFor(object, targetColor.hex);
    colorVisual.dataset.answer = targetColor.name;

    // seçenekler: doğru + 3 rastgele
    const shuffled = [...COLORS].sort(()=>Math.random()-0.5).slice(0,4);
    if(!shuffled.find(c=>c.name===targetColor.name)) shuffled[0]=targetColor;
    colorOpts.innerHTML = "";
    shuffled.sort(()=>Math.random()-0.5).forEach(c=>{
      const b = document.createElement("button");
      b.className = "option";
      b.style.background = c.hex;
      b.title = c.name;
      b.onclick = ()=>checkColor(c.name);
      colorOpts.appendChild(b);
    });
  }

  function checkColor(chosen){
    play(tap);
    const correct = colorVisual.dataset.answer;
    if(chosen===correct){
      play(okS); speak("Aferin! Harika bildin!");
      boom(); setTimeout(newColorRound, 2000);
    } else {
      play(failS); speak("Yanlış oldu, bir daha dene.");
      colorVisual.classList.add("shake");
      setTimeout(()=>colorVisual.classList.remove("shake"), 350);
    }
  }

  /* ================= Numbers ================= */
  const NUM_ICONS = ["⭐","🍓","🐟","🧩","🦋","⚽"];
  const numsVisual = qs("#numbers-visual");
  const numsOpts = qs("#numbers-options");
  function newNumbersRound(){
    const icon = NUM_ICONS[Math.floor(Math.random()*NUM_ICONS.length)];
    const count = 2 + Math.floor(Math.random()*7); // 2..8
    numsVisual.textContent = icon.repeat(count);
    numsOpts.innerHTML = "";
    const pool = new Set([count]);
    while(pool.size<4){ pool.add(2+Math.floor(Math.random()*9)); }
    [...pool].sort(()=>Math.random()-0.5).forEach(n=>{
      const b = document.createElement("button");
      b.className="btn"; b.textContent=n;
      b.onclick=()=>checkNum(n, count);
      numsOpts.appendChild(b);
    });
    speak(`Ekranda kaç tane ${icon} var?`);
  }
  function checkNum(chosen, correct){
    play(tap);
    if(chosen===correct){ play(okS); speak("Süper! Doğru saydın!"); boom(); setTimeout(newNumbersRound,2000); }
    else { play(failS); speak("Tam olmadı, bir kez daha sayalım."); numsVisual.classList.add("shake"); setTimeout(()=>numsVisual.classList.remove("shake"),350); }
  }

  /* ================= Music / Rhythm ================= */
  let audioCtx; const pattern=[261.63,293.66,329.63,349.23];
  function ctx(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
  function tone(freq, dur=0.35){
    const ac = ctx(); const o = ac.createOscillator(); const g = ac.createGain();
    o.type="sine"; o.frequency.value=freq; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.001,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3,ac.currentTime+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur);
    o.start(); o.stop(ac.currentTime+dur);
  }
  function setupMusic(){
    $$(".key").forEach(k=>k.onclick=()=>tone(Number(k.dataset.f)));
    qs("#playRythm").onclick=async ()=>{
      qs("#rythmStatus").textContent="Dinle ve tekrarla";
      for(const f of pattern){ tone(f); await new Promise(r=>setTimeout(r,450)); }
      qs("#rythmStatus").textContent="Bitti";
    }
  }

  /* ================= Story (AI hook) ================= */
  const storyOut = qs("#storyOut");
  const storyVis = qs("#story-visual");

  qs("#storyForm").addEventListener("submit",(e)=>{
    e.preventDefault(); play(tap);
    const data = Object.fromEntries(new FormData(e.target).entries());
    const t1 = `Bir zamanlar ${data.place}da yaşayan ${data.name} adında meraklı bir çocuk varmış.`;
    const t2 = `Bir gün ${data.event} için cesaretle yola çıkmış ve yol üzerinde yardımsever minik bir dostla tanışmış.`;
    const t3 = `Birlikte düşündükçe sorunlar küçülmüş, ${data.name} sabır ve nezaketle hedefine ulaşmış.`;
    storyOut.textContent = `${t1} ${t2} ${t3}`;
    // Şimdilik yerel SVG; AI bağlıysa aşağıdaki hook devreye girer:
    storyVis.innerHTML = `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="70" width="160" height="50" fill="#8b5cf6"/>
      <circle cx="40" cy="60" r="22" fill="#f59e0b"/>
      <rect x="74" y="52" width="55" height="18" rx="4" fill="#fff"/>
      <rect x="84" y="40" width="35" height="16" rx="4" fill="#fff"/>
    </svg>`;
    speak("Masal hazır! İstersen şimdi seslendireyim.");
  });

  qs("#ttsBtn").addEventListener("click", ()=>{ const t = storyOut.textContent.trim(); if(t) speak(t); });

  // Gerçek AI çizim & hikaye üretimi için kanca:
  // Cloudflare Worker / kendi sunucun:
  // POST /api/ai-image { prompt }  -> { image_url }
  // POST /api/ai-story { prompt }  -> { text }
  qs("#storyDraw").addEventListener("click", async ()=>{
    play(tap);
    speak("Bir sonraki sürümde masal görselini yapay zekâ ile çizeceğim.");
    // Örnek (bağlayınca):
    // const prompt = `Çocuk kitabı tarzında ${qs('[name="place"]').value} temasında, ${qs('[name="event"]').value} ile ilgili sevimli illüstrasyon.`;
    // const r = await fetch('/api/ai-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    // const {image_url} = await r.json();
    // storyVis.innerHTML = `<img src="${image_url}" alt="AI çizim" style="max-width:100%;border-radius:12px"/>`;
  });

  // Masalı JSON olarak sakla (indirme)
  qs("#saveStoryBtn").addEventListener("click", ()=>{
    const text = storyOut.textContent.trim() || "";
    const blob = new Blob([JSON.stringify({story:text, ts:Date.now()}, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="masal.json"; a.click();
    URL.revokeObjectURL(a.href);
  });
});
