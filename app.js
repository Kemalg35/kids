document.addEventListener("DOMContentLoaded", () => {
  const COLORS = [
    { name: "kırmızı", hex: "#ef4444" },
    { name: "mavi", hex: "#3b82f6" },
    { name: "yeşil", hex: "#22c55e" },
    { name: "sarı", hex: "#facc15" },
    { name: "siyah", hex: "#111" },
  ];
  const OBJECTS = ["balon", "araba", "elma", "kurbağa", "yıldız", "uçurtma", "çiçek"];

  const img = document.getElementById("aiImage");
  const loading = document.querySelector(".loading");
  const opts = document.getElementById("options");
  const q = document.getElementById("question");
  const tap = document.getElementById("tapSound");
  const success = document.getElementById("successSound");
  const fail = document.getElementById("failSound");
  const confettiCanvas = document.getElementById("confettiCanvas");
  const ctx = confettiCanvas.getContext("2d");

  let confetti = [];
  let confettiActive = false;
  let femaleVoice = null;

  /* Kadın sesi seçimi */
  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    femaleVoice =
      voices.find((v) => v.lang.startsWith("tr") && /female|kadın/i.test(v.name.toLowerCase())) ||
      voices.find((v) => v.lang.startsWith("tr")) ||
      voices[0];
  }
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;

  function speak(text) {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    if (femaleVoice) utter.voice = femaleVoice;
    utter.rate = 0.88; // daha yavaş, doğal
    utter.pitch = 1.35; // daha ince ton
    utter.volume = 1;
    utter.text = text + " ";
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  /* Konfeti */
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
        c: `hsl(${Math.random() * 360},100%,60%)`,
        s: Math.random() * 3 + 2,
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
    confetti.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.c;
      ctx.fill();
    });
  }

  function updateConfetti() {
    confetti.forEach((p) => {
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

  /* Görsel oluşturucu (AI simülasyonu) */
  async function fakeAIImage(color, object) {
    loading.style.display = "block";
    img.style.display = "none";

    // 1,2 saniyelik yapay gecikme
    await new Promise((r) => setTimeout(r, 1200));

    const query = `${object},${color},cartoon`;
    const url = `https://picsum.photos/seed/${encodeURIComponent(query)}/300/300`;

    // Resmi önceden yükle
    const newImg = new Image();
    newImg.src = url;
    await new Promise((resolve) => {
      newImg.onload = resolve;
      newImg.onerror = resolve;
    });

    img.src = url;
    img.alt = `${color} ${object}`;
    img.dataset.answer = color;
    loading.style.display = "none";
    img.style.display = "block";
  }

  /* Yeni tur */
  function newRound() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    const correctColor = color.name;

    q.textContent = `Bu ${object} hangi renkte olabilir sence?`;
    speak(`Hmm, bir bakalım... Bu ${object} hangi renkte olabilir sence?`);
    fakeAIImage(correctColor, object);

    const options = COLORS.sort(() => Math.random() - 0.5);
    opts.innerHTML = "";
    options.forEach((c) => {
      const b = document.createElement("button");
      b.className = "option";
      b.style.background = c.hex;
      b.onclick = () => checkAnswer(c.name, correctColor);
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
      speak("Yanlış oldu, hadi bir daha dene!");
      img.classList.add("shake");
      setTimeout(() => img.classList.remove("shake"), 400);
    }
  }

  newRound();
});
