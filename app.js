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
    confetti = Array.from({length:160},
