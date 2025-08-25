const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

const products = [
  { id: 'p1', title: 'Wireless Headphones', price: 79.99, emoji: '🎧', desc: 'Bluetooth 5.3, ANC, 35h battery' },
  { id: 'p2', title: 'Smart Watch', price: 129.00, emoji: '⌚', desc: 'Heart-rate, GPS, 7-day battery' },
  { id: 'p3', title: 'Mechanical Keyboard', price: 99.50, emoji: '⌨️', desc: 'Hot-swappable, RGB, TKL' },
  { id: 'p4', title: '4K Action Cam', price: 189.99, emoji: '📷', desc: 'Waterproof, EIS, 60fps' },
  { id: 'p5', title: 'Drone Mini', price: 239.00, emoji: '🛸', desc: '4K camera, 31min flight' },
  { id: 'p6', title: 'Portable Speaker', price: 59.00, emoji: '🔊', desc: 'IPX7, 24h playtime' },
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
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
};

function loadCart() {
  try {
    const raw = localStorage.getItem('cart.v1');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveCart(cart) {
  localStorage.setItem('cart.v1', JSON.stringify(cart));
}

let cart = loadCart();

function renderProducts() {
  els.productGrid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image"><span>${p.emoji}</span></div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-meta">
          <span class="price">${currency.format(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Add to cart</button>
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
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const count = items.reduce((c, it) => c + it.qty, 0);
  return { subtotal, tax, total, count };
}

function renderCart() {
  const items = cartEntries();
  if (!items.length) {
    els.cartItems.innerHTML = `
      <div class="empty">
        <div class="item-thumb">🛒</div>
        <p style="color:#9ca3af;margin:8px 0 0;">Your cart is empty</p>
      </div>
    `;
  } else {
    els.cartItems.innerHTML = items.map(it => `
      <div class="cart-item" data-id="${it.id}">
        <div class="item-thumb">${it.emoji}</div>
        <div class="item-info">
          <div class="item-title">${it.title}</div>
          <div class="item-price">${currency.format(it.price)} • <span class="line">${currency.format(it.price * it.qty)}</span></div>
        </div>
        <div class="item-actions">
          <div class="qty-controls">
            <button class="qty-btn dec" aria-label="Decrease quantity">−</button>
            <span class="qty">${it.qty}</span>
            <button class="qty-btn inc" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-btn">Remove</button>
        </div>
      </div>
    `).join('');
  }

  const t = totals();
  els.cartCount.textContent = String(t.count);
  els.cartSubtotal.textContent = currency.format(t.subtotal);
  els.cartTax.textContent = currency.format(t.tax);
  els.cartTotal.textContent = currency.format(t.total);
  els.checkoutBtn.disabled = t.count === 0;
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

els.checkoutBtn.addEventListener('click', () => {
  const t = totals();
  alert(`Thanks! Your total is ${currency.format(t.total)}.`);
  cart = {};
  saveCart(cart);
  renderCart();
  closeCart();
});
