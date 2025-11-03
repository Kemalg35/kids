document.addEventListener("DOMContentLoaded", () => {

  const colors = [
    { name: "kırmızı", hex: "#ef4444", image: "https://cdn-icons-png.freepik.com/256/8783/8783256.png" },
    { name: "mavi", hex: "#3b82f6", image: "https://cdn-icons-png.freepik.com/256/8783/8783317.png" },
    { name: "yeşil", hex: "#22c55e", image: "https://cdn-icons-png.freepik.com/256/8783/8783345.png" },
    { name: "sarı", hex: "#facc15", image: "https://cdn-icons-png.freepik.com/256/8783/8783284.png" }
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

  // Canvas boyutu
  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Konfeti oluştur
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
    // 2 saniye sonra temizle
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

  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    speechSynthesis.speak(utter);
  }

  // Yeni tur
  function newRound() {
    const target = colors[Math.floor(Math.random() * colors.length)];
    question.textContent = "Bu nesnenin rengi ne?";
    speak("Bu nesnenin rengi ne?");
    img.src = target.image;
    img.alt = target.name;
    img.dataset.answer = target.name;
    opts.innerHTML = "";

    const shuffled = [...colors].sort(() => Math.random() - 0.5);
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
      speak("Bravo! Doğru bildin!");
      createConfetti();
      setTimeout(newRound, 2200);
    } else {
      playSound(fail);
      speak("Hadi bir daha dene!");
      img.classList.add("shake");
      setTimeout(() => img.classList.remove("shake"), 400);
    }
  }

  newRound();
});
