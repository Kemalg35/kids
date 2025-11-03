document.addEventListener("DOMContentLoaded", ()=>{

  const tap = document.getElementById("tapSound");
  const playTap = ()=>{ tap.currentTime=0; tap.play(); };

  function qs(s){ return document.querySelector(s); }
  function $$(s){ return [...document.querySelectorAll(s)]; }

  // Menü geçişleri
  $$(".tile").forEach(b=>{
    b.addEventListener("click", ()=>{
      playTap();
      hideAll();
      qs("#screen-"+b.dataset.go).classList.remove("hidden");
    });
  });
  $$(".back").forEach(b=>{
    b.addEventListener("click", ()=>{
      playTap();
      hideAll();
      qs("#menu").classList.remove("hidden");
    });
  });

  function hideAll(){
    $$(".screen").forEach(s=>s.classList.add("hidden"));
    qs("#menu").classList.add("hidden");
  }

  // --- RENKLER ---
  const COLORS = [
    {name:"kırmızı",hex:"#ef4444"},
    {name:"mavi",hex:"#3b82f6"},
    {name:"yeşil",hex:"#22c55e"},
    {name:"sarı",hex:"#f59e0b"}
  ];
  function renderColors(){
    const wrap = qs("#colors-wrap");
    wrap.innerHTML = "";
    const target = COLORS[Math.floor(Math.random()*COLORS.length)];
    wrap.innerHTML = `<div class="card"><b>${target.name}</b> hangisi?</div>`;
    COLORS.forEach(c=>{
      const btn=document.createElement("button");
      btn.className="btn";
      btn.textContent=c.name;
      btn.style.background=c.hex;
      btn.style.color="#fff";
      btn.onclick=()=>{
        playTap();
        if(c.name===target.name){
          btn.style.border="4px solid #16a34a";
          setTimeout(renderColors,600);
        } else {
          btn.style.border="4px solid #dc2626";
        }
      };
      wrap.appendChild(btn);
    });
  }
  renderColors();

  // --- SAYILAR ---
  function renderNumbers(){
    const wrap=qs("#numbers-wrap");
    wrap.innerHTML="";
    const count=Math.floor(Math.random()*5)+2;
    wrap.innerHTML=`<div class="card">${"⭐".repeat(count)}</div>`;
    const input=document.createElement("input");
    input.type="number"; input.placeholder="Kaç tane?";
    const btn=document.createElement("button");
    btn.textContent="Kontrol"; btn.className="btn";
    btn.onclick=()=>{
      playTap();
      if(Number(input.value)===count) alert("Doğru!");
      else alert("Yanlış!");
      renderNumbers();
    };
    wrap.append(input,btn);
  }
  renderNumbers();

  // --- MASAL ---
  qs("#storyForm").addEventListener("submit", e=>{
    e.preventDefault();
    playTap();
    const data=Object.fromEntries(new FormData(e.target).entries());
    const out=`${data.name}, ${data.place}da ${data.event}. Cesaretini hiç kaybetmedi!`;
    qs("#storyOut").textContent=out;
  });
  qs("#storyDraw").addEventListener("click", ()=>{
    playTap();
    alert("Bir sonraki sürümde masal çizimi eklenecek!");
  });

  // --- MİNİ OYUN ---
  let seq=[], step=0;
  qs("#simonStart").onclick=()=>{seq=[];next();};
  function next(){seq.push(Math.floor(Math.random()*4));step=0;show();}
  async function show(){
    for(const i of seq){
      const pad=$$(`.pad`)[i];
      pad.classList.add("active");
      await new Promise(r=>setTimeout(r,400));
      pad.classList.remove("active");
      await new Promise(r=>setTimeout(r,150));
    }
  }
  $$(".pad").forEach((p,i)=>p.onclick=()=>{
    playTap();
    if(i===seq[step]){step++;if(step===seq.length){alert("Bravo!");next();}}
    else{alert("Olmadı!");seq=[];}
  });

});
