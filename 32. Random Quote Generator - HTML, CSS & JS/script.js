const quotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Whether you think you can or you think you can’t, you’re right.', author: 'Henry Ford' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'What you do speaks so loudly that I cannot hear what you say.', author: 'Ralph Waldo Emerson' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Creativity is intelligence having fun.', author: 'Albert Einstein' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'The journey of a thousand miles begins with one step.', author: 'Lao Tzu' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'If you want to lift yourself up, lift up someone else.', author: 'Booker T. Washington' },
  { text: 'Everything you can imagine is real.', author: 'Pablo Picasso' }
];

const card = document.getElementById('quoteCard');
const textEl = document.getElementById('quoteText');
const authorEl = document.getElementById('quoteAuthor');
const newBtn = document.getElementById('newQuoteBtn');
const copyBtn = document.getElementById('copyBtn');
const tweetBtn = document.getElementById('tweetBtn');
const feedback = document.getElementById('feedback');

let currentIndex = 0;
let feedbackTimer = null;

const pickIndex = () => {
  if (quotes.length === 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * quotes.length);
  }
  return next;
};

const render = (quote) => {
  textEl.textContent = quote.text;
  authorEl.textContent = quote.author;
  const shareText = `"${quote.text}" — ${quote.author}`;
  tweetBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
};

const showFeedback = (message) => {
  feedback.textContent = message;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedback.textContent = '';
  }, 2200);
};

const showNewQuote = () => {
  currentIndex = pickIndex();
  card.classList.add('is-fading');
  setTimeout(() => {
    render(quotes[currentIndex]);
    card.classList.remove('is-fading');
  }, 280);
};

newBtn.addEventListener('click', showNewQuote);

copyBtn.addEventListener('click', async () => {
  const quote = quotes[currentIndex];
  const shareText = `"${quote.text}" — ${quote.author}`;
  try {
    await navigator.clipboard.writeText(shareText);
    showFeedback('Copied to clipboard.');
  } catch {
    const temp = document.createElement('textarea');
    temp.value = shareText;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showFeedback('Copied to clipboard.');
  }
});

render(quotes[currentIndex]);
