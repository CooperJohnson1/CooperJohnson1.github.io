// quiz.js

document.addEventListener("DOMContentLoaded", function () {
  const fromYear = parseInt(localStorage.getItem("fromYear"), 10);
  const toYear = 2025;

  const cpiData = {
    1975: 53.8,
    1985: 107.6,
    1995: 152.4,
    2005: 195.3,
    2015: 237.0,
    2025: 280.0
  };

  const avg2025Prices = {
    bread: 1.00,
    gas: 3.50,
    movie: 12.00,
    combo: 9.00
  };

  //
  function estimateCPI(year) {
    const years = Object.keys(cpiData).map(Number).sort((a, b) => a - b);
    if (cpiData[year]) return cpiData[year];
    for (let i = 0; i < years.length - 1; i++) {
      const y1 = years[i], y2 = years[i + 1];
      if (year > y1 && year < y2) {
        const c1 = cpiData[y1], c2 = cpiData[y2];
        const ratio = (year - y1) / (y2 - y1);
        return c1 + ratio * (c2 - c1);
      }
    }
    return null;
  }

  function inflationHint(from, to, itemKey) {
    const c1 = estimateCPI(from);
    const c2 = estimateCPI(to);
    if (!c1 || !c2) return "Data missing.";

    // Value of $1 in 'to' year vs 'from' year
    const oneValue = (c1 / c2) * 1;
    // Average price in 'to' year
    const avgPrice = avg2025Prices[itemKey];
    // Percentage ratio
    const percent = (oneValue / 1) * 100;

    return `In ${toYear}, $1 is worth $${oneValue.toFixed(2)} in ${from}.
    A ${itemKey} costs $${avgPrice.toFixed(2)} in ${toYear} and was about ${percent.toFixed(0)}% of the 2025 value in ${from}.`;
  }
// made with AI ^
  if (fromYear) {
    document.getElementById("year1").textContent = fromYear;
    document.getElementById("hint1").textContent = inflationHint(fromYear, toYear, "bread");

    document.getElementById("year2").textContent = fromYear;
    document.getElementById("hint2").textContent = inflationHint(fromYear, toYear, "gas");

    document.getElementById("year3").textContent = fromYear;
    document.getElementById("hint3").textContent = inflationHint(fromYear, toYear, "movie");

    document.getElementById("year4").textContent = fromYear;
    document.getElementById("hint4").textContent = inflationHint(fromYear, toYear, "combo");
  }

  const questions = [
    { id: 'bread', input: 'answer1', result: 'result1', next: 'q2' },
    { id: 'gas', input: 'answer2', result: 'result2', next: 'q3' },
    { id: 'movie', input: 'answer3', result: 'result3', next: 'q4' },
    { id: 'combo', input: 'answer4', result: 'result4', next: null }
  ];
// used google to look up some of it
  function checkAnswer(btn, questionId) {
    const q = questions.find(x => x.id === questionId);
    const input = document.getElementById(q.input);
    const val = parseFloat(input.value);
    const res = document.getElementById(q.result);
    const section = document.getElementById(`q${questions.indexOf(q) + 1}`);

    if (!btn.dataset.answered) {
      if (isNaN(val)) {
        res.textContent = "Please enter a number.";
        return;
      }
//
      const avg = avg2025Prices[questionId];
      const correct = (estimateCPI(fromYear) / estimateCPI(toYear)) * avg;
      const tol = correct * 0.05;
      const closeTol = correct * 0.15;

      if (Math.abs(val - correct) <= tol) {
        res.textContent = `✅ Correct! The value was about $${correct.toFixed(2)}.`;
      } else if (Math.abs(val - correct) <= closeTol) {
        res.textContent = `⚠️ Close! The value was about $${correct.toFixed(2)}.`;
      } else {
        res.textContent = `❌ Not quite. The value was about $${correct.toFixed(2)}.`;
      }
// used ai ^
      input.disabled = true;
      btn.textContent = q.next ? "Next" : "Finish";
      btn.dataset.answered = "true";
    } else {
      if (q.next) {
        section.classList.remove("active");
        document.getElementById(q.next).classList.add("active");
      } else {
        res.textContent += " 🎉 Quiz complete!";
      }
    }
  }

  window.checkAnswer = checkAnswer;

  document.querySelectorAll(".quiz-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      checkAnswer(this, this.dataset.id);
    });
  });
});
