const QUESTIONS = [
  {
    q: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    answer: 1,
  },
  {
    q: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3,
  },
  {
    q: 'Who wrote the play "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    answer: 1,
  },
  {
    q: 'What is the chemical symbol for gold?',
    options: ['Gd', 'Go', 'Au', 'Ag'],
    answer: 2,
  },
  {
    q: 'How many continents are there on Earth?',
    options: ['5', '6', '7', '8'],
    answer: 2,
  },
  {
    q: 'Which language runs natively in web browsers?',
    options: ['Python', 'JavaScript', 'C++', 'Ruby'],
    answer: 1,
  },
  {
    q: 'What year did the first human land on the Moon?',
    options: ['1965', '1969', '1972', '1958'],
    answer: 1,
  },
  {
    q: 'Which country is home to the kangaroo?',
    options: ['Brazil', 'South Africa', 'Australia', 'India'],
    answer: 2,
  },
  {
    q: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    answer: 2,
  },
  {
    q: 'Which gas do plants primarily absorb for photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    answer: 2,
  },
];

const LETTERS = ['A', 'B', 'C', 'D'];

const el = {
  progressText: document.getElementById('progressText'),
  progressBar: document.getElementById('progressBar'),
  progress: document.querySelector('.progress'),
  questionText: document.getElementById('questionText'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  scoreText: document.getElementById('scoreText'),
  nextBtn: document.getElementById('nextBtn'),
  quiz: document.querySelector('.quiz'),
  result: document.getElementById('result'),
  finalScore: document.getElementById('finalScore'),
  resultMessage: document.getElementById('resultMessage'),
  restartBtn: document.getElementById('restartBtn'),
};

let index = 0;
let score = 0;
let answered = false;

function loadQuestion() {
  answered = false;
  const item = QUESTIONS[index];
  el.progressText.textContent = `Question ${index + 1} of ${QUESTIONS.length}`;
  const pct = Math.round((index / QUESTIONS.length) * 100);
  el.progressBar.style.width = `${pct}%`;
  el.progress.setAttribute('aria-valuenow', String(pct));
  el.questionText.textContent = item.q;
  el.feedback.textContent = '';
  el.feedback.className = 'quiz__feedback';
  el.scoreText.textContent = `Score: ${score}`;
  el.nextBtn.disabled = true;
  el.nextBtn.textContent = index === QUESTIONS.length - 1 ? 'Finish' : 'Next';

  el.options.innerHTML = '';
  item.options.forEach((text, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.dataset.index = String(i);
    btn.innerHTML = `<span class="option__key">${LETTERS[i]}</span><span>${text}</span>`;
    btn.addEventListener('click', () => selectOption(i));
    li.appendChild(btn);
    el.options.appendChild(li);
  });
}

function selectOption(choice) {
  if (answered) return;
  answered = true;
  const item = QUESTIONS[index];
  const buttons = [...el.options.querySelectorAll('.option')];

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.answer) btn.classList.add('is-correct');
    if (i === choice && choice !== item.answer) btn.classList.add('is-wrong');
  });

  if (choice === item.answer) {
    score++;
    el.feedback.textContent = 'Correct!';
    el.feedback.classList.add('is-correct');
  } else {
    el.feedback.textContent = `Not quite — the answer is ${LETTERS[item.answer]}. ${item.options[item.answer]}.`;
    el.feedback.classList.add('is-wrong');
  }

  el.scoreText.textContent = `Score: ${score}`;
  el.nextBtn.disabled = false;
  el.nextBtn.focus();
}

function next() {
  if (!answered) return;
  if (index < QUESTIONS.length - 1) {
    index++;
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  el.quiz.hidden = true;
  el.result.hidden = false;
  el.finalScore.textContent = `${score} / ${QUESTIONS.length}`;
  const ratio = score / QUESTIONS.length;
  let message;
  if (ratio === 1) message = 'Perfect score — outstanding work!';
  else if (ratio >= 0.7) message = 'Great job, you really know your stuff.';
  else if (ratio >= 0.4) message = 'Not bad — a little more practice and you have got this.';
  else message = 'Keep going — every attempt makes you sharper.';
  el.resultMessage.textContent = message;
  el.restartBtn.focus();
}

function restart() {
  index = 0;
  score = 0;
  el.result.hidden = true;
  el.quiz.hidden = false;
  loadQuestion();
}

el.nextBtn.addEventListener('click', next);
el.restartBtn.addEventListener('click', restart);

loadQuestion();
