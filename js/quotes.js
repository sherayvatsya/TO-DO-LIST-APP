'use strict';

const TaskFlowQuotes = (() => {
  const quotes = [
    'Small progress is still progress.',
    'Focus on the next useful action.',
    'Done is a decision, not a mood.',
    'Protect your attention like a calendar event.',
    'A clear list makes a lighter mind.',
    'One finished task can change the whole day.'
  ];

  function quoteForToday() {
    const index = new Date().getDate() % quotes.length;
    return quotes[index];
  }

  function render(random = false) {
    const node = document.getElementById('quoteText');
    if (!node) return;
    const quote = random ? quotes[Math.floor(Math.random() * quotes.length)] : quoteForToday();
    node.textContent = quote;
    localStorage.setItem('taskflow_quote_today', JSON.stringify({ quote, date: new Date().toISOString() }));
  }

  function init() {
    render(false);
    document.getElementById('refreshQuoteBtn')?.addEventListener('click', () => render(true));
    window.setInterval(() => render(false), 60 * 60 * 1000);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { quotes, render };
})();

window.TaskFlowQuotes = TaskFlowQuotes;
