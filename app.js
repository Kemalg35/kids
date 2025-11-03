document.addEventListener("DOMContentLoaded", () => {

  const colorItems = [
    { name: "kırmızı", hex: "#ef4444", image: "https://cdn-icons-png.freepik.com/512/4151/4151071.png" }, // kırmızı balon
    { name: "mavi", hex: "#3b82f6", image: "https://cdn-icons-png.freepik.com/512/869/869869.png" }, // mavi araba
    { name: "yeşil", hex: "#22c55e", image: "https://cdn-icons-png.freepik.com/512/1556/1556327.png" }, // yeşil kurbağa
    { name: "sarı", hex: "#facc15", image: "https://cdn-icons-png.freepik.com/512/477/477406.png" }  // sarı yıldız
  ];

  const img = document.getElementById("colorImage");
  const opts = document.getElementById("colorOptions");
  const question = document.getElementById("question");
  const tap = document.getElementById("tapSound");
  const success = document.getElementById("successSound");
  const fail = document.getElementById("failSound");
  const confettiCanvas = document.getElementById("confettiCanvas");
  const ctx = confettiCanvas.getContext("2d");

  let confetti = [];
  let confettiActive = false;
  let femaleVoice = null;

  /* === Kadın sesi seçimi === */
  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    femaleVoice =
      voices.find(v => v.lang.startsWith("tr") && /female|kadın|zira/i.test(v.name.toLowerCase())) ||
      voices.find(v => v.lang.startsWith("tr")) ||
      voices.find(v => /female|woman/i.test(v.name.toLowerCase())) ||
      voices[0];
  }
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text) {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    if (femaleVoice) utter.voice = femaleVoice;
    utter.rate = 0.92;   // akıcılık
    utter.pitch = 1.25;  // zarif tını
    utter.volume = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  /* === Konfeti ayarları === */
  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function createConfetti() {
    confetti = [];
    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * -confettiCanvas.height,
        r: Math.random() * 6 + 2,
        c: `hsl(${Math.random() * 360}, 100%, 60%)`,
        s: Math.random() * 3 + 2
      });
    }
    confettiActive = true;
    requestAnimationFrame(animateConfetti);
    setTimeout(() => {
      confettiActive = false;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }, 2000);
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confetti.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.c;
      ctx.fill();
    });
  }

  function updateConfetti() {
    confetti.forEach(p => {
      p.y += p.s;
      if (p.y > confettiCanvas.height) p.y = 0;
    });
  }

  function animateConfetti() {
    if (!confettiActive) return;
    drawConfetti();
    updateConfetti();
    requestAnimationFrame(animateConfetti);
  }

  function playSound(aud) {
    aud.currentTime = 0;
    aud.play();
  }

  /* === Yeni tur === */
  function newRound() {
    const target = colorItems[Math.floor(Math.random() * colorItems.length)];
    question.textContent = "Bu nesnenin rengi ne?";
    speak("Bu nesnenin rengi ne?");
    img.src = target.image;
    img.alt = target.name;
    img.dataset.answer = target.name;
    opts.innerHTML = "";

    const shuffled = [...colorItems].sort(() => Math.random() - 0.5);
    shuffled.forEach(c => {
      const b = document.createElement("button");
      b.className = "option";
      b.style.background = c.hex;
      b.onclick = () => checkAnswer(c.name, target.name);
      opts.appendChild(b);
    });
  }

  function checkAnswer(chosen, correct) {
    playSound(tap);
    if (chosen === correct) {
      playSound(success);
      speak("Aferin sana! Harika bildin!");
      createConfetti();
      setTimeout(newRound, 2200);
    } else {
      playSound(fail);
      speak("Yanlış oldu, hadi bir daha dene.");
      img.classList.add("shake");
      setTimeout(() => img.classList.remove("shake"), 400);
    }
  }

  newRound();
});
