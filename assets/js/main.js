// JavaScript Document
async function loadCollection(path) {
  const response = await fetch(path);
  const files = await response.json();
  return files;
}

function renderCards(items, containerId) {
  const container = document.getElementById(containerId);

  container.innerHTML = items.map(item => `
    <div class="col-md-4">
      <div class="card-apple">
        <h4>${item.title}</h4>
        <p>${item.body}</p>
        <small>${item.date}</small>
      </div>
    </div>
  `).join('');
}

async function init() {
  const news = await loadCollection('/content/news/index.json');
  const sale = await loadCollection('/content/sale/index.json');

  if (document.getElementById('news-container')) {
    renderCards(news, 'news-container');
  }

  if (document.getElementById('sale-container')) {
    renderCards(sale, 'sale-container');
  }
}

init();
