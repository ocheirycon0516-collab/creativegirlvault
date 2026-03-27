const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const OUT_DIR = '_site';
const PRODUCTS_DIR = '.';

// Read site settings
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

// Gather product markdown files (exclude node_modules, admin, _site, .netlify)
const skipDirs = new Set(['node_modules', 'admin', '_site', '.netlify', '.git', '_data']);
const mdFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.md'));

const products = mdFiles.map(file => {
  const raw = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf8');
  const { data } = matter(raw);
  return { ...data, slug: path.basename(file, '.md') };
}).filter(p => p.title);

// Sort: items with badges first, then alphabetical
products.sort((a, b) => {
  if (a.badge && !b.badge) return -1;
  if (!a.badge && b.badge) return 1;
  return a.title.localeCompare(b.title);
});

// Category labels
const categoryLabels = {
  crochet: 'Crochet',
  tshirt: 'T-Shirts',
  journal: 'Journals',
  mug: 'Mugs'
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function productCard(p) {
  const badge = p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : '';
  const category = categoryLabels[p.category] || p.category || '';
  const availability = p.available !== false
    ? '<span class="available">Available</span>'
    : '<span class="sold-out">Sold Out</span>';
  return `
    <div class="product-card">
      ${badge}
      <div class="product-info">
        <span class="category-tag">${escapeHtml(category)}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p class="description">${escapeHtml(p.description)}</p>
        <div class="product-footer">
          <span class="price">$${escapeHtml(p.price)}</span>
          ${availability}
        </div>
      </div>
    </div>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(settings.shop_name)}</title>
  <meta name="description" content="${escapeHtml(settings.tagline)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      color: #2d2d2d;
      background: #faf8f5;
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }

    /* Header */
    header {
      text-align: center;
      padding: 3rem 1.5rem 2rem;
      background: linear-gradient(135deg, #f8e8d4 0%, #f5ddc8 50%, #edd5c0 100%);
    }
    header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #3a2a1a;
      margin-bottom: 0.5rem;
    }
    header p.tagline {
      font-size: 1rem;
      color: #6b5744;
      max-width: 500px;
      margin: 0 auto 1rem;
    }
    header p.hero-sub {
      font-size: 0.95rem;
      color: #7a6654;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Contact bar */
    .contact-bar {
      text-align: center;
      padding: 0.75rem 1rem;
      background: #3a2a1a;
      color: #f5ddc8;
      font-size: 0.85rem;
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .contact-bar a { color: #f5ddc8; }
    .contact-bar a:hover { text-decoration: underline; }

    /* Products grid */
    main {
      max-width: 1100px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    main h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      text-align: center;
      margin-bottom: 1.5rem;
      color: #3a2a1a;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .product-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      position: relative;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }
    .product-info {
      padding: 1.25rem 1.5rem 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .category-tag {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9b7d62;
      margin-bottom: 0.4rem;
    }
    .product-info h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #3a2a1a;
    }
    .description {
      font-size: 0.9rem;
      color: #666;
      flex: 1;
      margin-bottom: 1rem;
    }
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #3a2a1a;
    }
    .available {
      font-size: 0.8rem;
      color: #5a8a5a;
      font-weight: 500;
    }
    .sold-out {
      font-size: 0.8rem;
      color: #b55;
      font-weight: 500;
    }
    .badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #c97c4b;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      z-index: 1;
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 2rem 1rem;
      font-size: 0.85rem;
      color: #999;
      border-top: 1px solid #eee;
      margin-top: 3rem;
    }

    @media (max-width: 640px) {
      header h1 { font-size: 1.8rem; }
      .products-grid { grid-template-columns: 1fr; }
    }
  </style>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <header>
    <h1>${escapeHtml(settings.shop_name)}</h1>
    <p class="tagline">${escapeHtml(settings.tagline)}</p>
    <p class="hero-sub">${escapeHtml(settings.hero_sub)}</p>
  </header>
  <div class="contact-bar">
    <span>&#9993; <a href="mailto:${escapeHtml(settings.email)}">${escapeHtml(settings.email)}</a></span>
    <span>&#9733; <a href="https://instagram.com/${escapeHtml(settings.instagram)}" target="_blank" rel="noopener">@${escapeHtml(settings.instagram)}</a></span>
  </div>
  <main>
    <h2>Our Products</h2>
    <div class="products-grid">
      ${products.map(productCard).join('\n')}
    </div>
  </main>
  <footer>
    &copy; ${new Date().getFullYear()} ${escapeHtml(settings.shop_name)}. All rights reserved.
  </footer>
  <script>
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", function(user) {
        if (!user) {
          window.netlifyIdentity.on("login", function() {
            document.location.href = "/admin/";
          });
        }
      });
    }
  </script>
</body>
</html>`;

// Write output
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);

// Copy admin folder
const adminSrc = path.join('.', 'admin');
if (fs.existsSync(adminSrc)) {
  const adminDest = path.join(OUT_DIR, 'admin');
  fs.mkdirSync(adminDest, { recursive: true });
  for (const f of fs.readdirSync(adminSrc)) {
    fs.copyFileSync(path.join(adminSrc, f), path.join(adminDest, f));
  }
}

console.log(`Built ${products.length} products into ${OUT_DIR}/`);
