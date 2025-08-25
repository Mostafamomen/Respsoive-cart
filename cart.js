const CURRENCY = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const STORAGE_KEY = 'cart.v2';
const TAX_RATE = 0.08;
const SHIPPING_FLAT_CENTS = 500;
const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

const products = [
  { id: 'p1', title: 'Wireless Headphones', priceCents: 7999, emoji: '🎧', desc: 'Bluetooth 5.3, ANC, 35h battery' },
  { id: 'p2', title: 'Smart Watch', priceCents: 12900, emoji: '⌚', desc: 'Heart-rate, GPS, 7-day battery' },
  { id: 'p3', title: 'Mechanical Keyboard', priceCents: 9950, emoji: '⌨️', desc: 'Hot-swappable, RGB, TKL' },
  { id: 'p4', title: '4K Action Cam', priceCents: 18999, emoji: '📷', desc: 'Waterproof, EIS, 60fps' },
  { id: 'p5', title: 'Drone Mini', priceCents: 23900, emoji: '🛸', desc: '4K camera, 31min flight' },
  { id: 'p6', title: 'Portable Speaker', priceCents: 5900, emoji: '🔊', desc: 'IPX7, 24h playtime' },
];

const els = {
  productGrid: document.getElementById('productGrid'),
  cartToggle: document.getElementById('cartToggle'),
  cartClose: document.getElementById('cartClose'),
  cartDrawer: document.getElementById('cartDrawer'),
  backdrop: document.getElementById('backdrop'),
  cartItems: document.getElementById('cartItems'),
  cartCount: document.getElementById('cartCount'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartTax: document.getElementById('cartTax'),
  cartShipping: document.getElementById('cartShipping'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  clearCartBtn: document.getElementById('clearCartBtn'),
  taxRateLabel: document.getElementById('taxRateLabel'),
};

function formatCents(cents) {
  return CURRENCY.format(Math.round(cents) / 100);
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch { return {}; }
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

let cart = loadCart();

function renderProducts() {
  els.productGrid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image" aria-hidden="true"><span>${p.emoji}</span></div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-meta">
          <span class="price">${formatCents(p.priceCents)}</span>
          <button class="add-btn" data-id="${p.id}" aria-label="Add ${p.title} to cart">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('');
}
renderProducts();

function cartEntries() {
  return Object.entries(cart).map(([id, qty]) => {
    const prod = products.find(p => p.id === id);
    return prod ? { ...prod, qty } : null;
  }).filter(Boolean);
}

function totals() {
  const items = cartEntries();
  const subtotalCents = items.reduce((s, it) => s + it.priceCents * it.qty, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const shippingCents = subtotalCents === 0 ? 0 : (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS);
  const totalCents = subtotalCents + taxCents + shippingCents;
  const count = items.reduce((c, it) => c + it.qty, 0);
  return { subtotalCents, taxCents, shippingCents, totalCents, count };
}

function renderCart() {
  const items = cartEntries();

  if (!items.length) {
    els.cartItems.innerHTML = `
      <div class="empty" role="status" aria-live="polite">
        <div class="item-thumb">🛒</div>
        <p style="color:#9ca3af;margin:8px 0 0;">Your cart is empty</p>
      </div>
    `;
  } else {
    els.cartItems.innerHTML = items.map(it => `
      <div class="cart-item" data-id="${it.id}">
        <div class="item-thumb" aria-hidden="true">${it.emoji}</div>
        <div class="item-info">
          <div class="item-title">${it.title}</div>
          <div class="item-price">${formatCents(it.priceCents)} • <span class="line" aria-label="Line total">${formatCents(it.priceCents * it.qty)}</span></div>
        </div>
        <div class="item-actions">
          <div class="qty-controls" role="group" aria-label="Quantity for ${it.title}">
            <button class="qty-btn dec" aria-label="Decrease quantity">−</button>
            <input class="qty-input" type="number" inputmode="numeric" pattern="[0-9]*" min="1" value="${it.qty}" aria-label="Quantity input"/>
            <button class="qty-btn inc" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-btn" aria-label="Remove ${it.title}">Remove</button>
        </div>
      </div>
    `).join('');
  }

  const t = totals();
  els.cartCount.textContent = String(t.count);
  els.cartSubtotal.textContent = formatCents(t.subtotalCents);
  els.cartTax.textContent = formatCents(t.taxCents);
  els.cartShipping.textContent = formatCents(t.shippingCents);
  els.cartTotal.textContent = formatCents(t.totalCents);
  els.checkoutBtn.disabled = t.count === 0;
  els.clearCartBtn.disabled = t.count === 0;
  if (els.taxRateLabel) els.taxRateLabel.textContent = `${Math.round(TAX_RATE * 100)}%`;
}
renderCart();

function openCart() {
  els.cartDrawer.classList.add('open');
  els.backdrop.classList.add('visible');
  els.cartDrawer.setAttribute('aria-hidden', 'false');
  els.cartToggle.setAttribute('aria-expanded', 'true');
}
function closeCart() {
  els.cartDrawer.classList.remove('open');
  els.backdrop.classList.remove('visible');
  els.cartDrawer.setAttribute('aria-hidden', 'true');
  els.cartToggle.setAttribute('aria-expanded', 'false');
}

els.cartToggle.addEventListener('click', openCart);
els.cartClose.addEventListener('click', closeCart);
els.backdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

els.productGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  renderCart();
  openCart();
});

els.cartItems.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.cart-item');
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  if (e.target.closest('.inc')) {
    cart[id] = (cart[id] || 1) + 1;
  } else if (e.target.closest('.dec')) {
    cart[id] = Math.max(1, (cart[id] || 1) - 1);
  } else if (e.target.closest('.remove-btn')) {
    delete cart[id];
  } else {
    return;
  }
  saveCart(cart);
  renderCart();
});

els.cartItems.addEventListener('change', (e) => {
  const input = e.target.closest('.qty-input');
  if (!input) return;
  const itemEl = e.target.closest('.cart-item');
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  let val = parseInt(input.value, 10);
  if (!Number.isFinite(val) || val < 1) val = 1;
  cart[id] = val;
  saveCart(cart);
  renderCart();
});

els.cartItems.addEventListener('keydown', (e) => {
  const input = e.target.closest('.qty-input');
  if (!input) return;
  if (e.key === 'Enter') {
    input.blur();
  }
});

els.clearCartBtn.addEventListener('click', () => {
  cart = {};
  saveCart(cart);
  renderCart();
});

els.checkoutBtn.addEventListener('click', () => {
  const t = totals();
  alert(`Thanks! Your total is ${formatCents(t.totalCents)}.`);
  cart = {};
  saveCart(cart);
  renderCart();
  closeCart();
});
