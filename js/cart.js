// cart.js - simple cart page
const CART_KEY = 'ezk_cart_v1';
const PRODUCTS_KEY = 'ezk_products_v1';

function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch(e){return []} }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function loadProducts(){ try{ return JSON.parse(localStorage.getItem(PRODUCTS_KEY)||'[]'); }catch(e){return []} }
function saveProducts(a){ localStorage.setItem(PRODUCTS_KEY, JSON.stringify(a)); }
function fmt(n){ return '₹ ' + Number(n).toLocaleString('en-IN'); }

function increaseQuantity(id) {
  const cart = loadCart();
  const products = loadProducts();
  const cartItem = cart.find(item => item.id === id);
  const product = products.find(p => p.id === id);
  if (!cartItem) return;
  if (cartItem.qty >= product.stock) {
    alert('Max stock reached for ' + product.name);
    return;
  }
  cartItem.qty++;
  saveCart(cart);
  renderCart();
  updateCartBubble();
}

function decreaseQuantity(id) {
  let cart = loadCart();
  const cartItem = cart.find(item => item.id === id);
  if (!cartItem) return;
  cartItem.qty--;
  if (cartItem.qty <= 0) {
    cart = cart.filter(item => item.id !== id);
  }
  saveCart(cart);
  renderCart();
  updateCartBubble();
}

function removeItem(id){ 
  if (!confirm('Remove item from cart?')) return;
  let cart = loadCart();
  cart = cart.filter(item => item.id !== id); 
  saveCart(cart); 
  renderCart(); 
  updateCartBubble(); 
}

function renderCart(){
  const area = document.getElementById('cartArea');
  const cart = loadCart();
  if(!cart || cart.length===0){ area.innerHTML = '<div class="empty">Your cart is empty.</div>'; return; }

  let html = '<table style="width:100%"><thead><tr><th>Item</th><th>Unit Price</th><th>Quantity</th><th>Total Price</th><th>Action</th></tr></thead><tbody>';
  let total=0;
  
  cart.forEach(item => {
    const lineTotal = Number(item.price || 0) * item.qty;
    total += lineTotal;
    
    html += `<tr>
      <td style="width:50%"><div style="display:flex;gap:10px;align-items:center"><img src="${item.image}" style="width:80px;height:60px;object-fit:cover;border-radius:8px"/><div><div style="font-weight:700">${item.name}</div><div style="color:var(--muted)">SKU: ${item.id||''}</div></div></div></td>
      <td>${fmt(item.price)}</td>
      <td>
        <button class="btn btn-ghost" style="padding:4px 8px; min-width: 0;" onclick="decreaseQuantity('${item.id}')">-</button>
        <span style="padding: 0 10px; font-weight: 700;">${item.qty}</span>
        <button class="btn btn-ghost" style="padding:4px 8px; min-width: 0;" onclick="increaseQuantity('${item.id}')">+</button>
      </td>
      <td>${fmt(lineTotal)}</td>
      <td><button class="btn btn-ghost" onclick="removeItem('${item.id}')">Remove</button></td>
    </tr>`;
  });
  
  html += `</tbody></table><div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center"><div style="font-weight:800">Total: ${fmt(total)}</div><div><button class="btn btn-ghost" onclick="clearCart()">Clear Cart</button> <button class="btn btn-primary" onclick="checkout()">Checkout</button></div></div>`;
  area.innerHTML = html;
}

function clearCart(){ if(!confirm('Clear cart?')) return; saveCart([]); renderCart(); updateCartBubble(); }

function updateCartBubble(){ 
  const cart = loadCart();
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const el = parent? parent.document.getElementById('cartLink') : document.getElementById('cartLink'); 
  if(el) el.textContent='Cart (' + totalQty + ')'; 
}


// *** START: MODAL AND NEW CHECKOUT LOGIC ***

// Get modal elements
let paymentOverlay, paymentView, successView, errorDiv;

function showModal() {
  // Reset the modal to the payment view every time
  paymentView.style.display = 'block';
  successView.style.display = 'none';
  errorDiv.style.display = 'none'; // Clear old errors
  errorDiv.textContent = '';
  if (paymentOverlay) paymentOverlay.style.display = 'flex';
}

function hideModal() {
  if (paymentOverlay) paymentOverlay.style.display = 'none';
  // After closing, refresh the cart (it might be empty)
  renderCart();
  updateCartBubble();
}

function showSuccessView() {
    paymentView.style.display = 'none';
    successView.style.display = 'block';
}

function showPaymentError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// *** MODIFIED THIS FUNCTION ***
function checkout(){
  const cart = loadCart();
  if (!cart || cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  // Instead of prompt, just show the modal
  showModal();
}

// *** NEW FUNCTION ***
// This function holds the logic that USED to be in checkout()
function processPayment() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (!paymentMethod) {
    showPaymentError('Please select a payment method.');
    return;
  }

  const cart = loadCart();
  const products = loadProducts();
  
  // 1. Stock Validation Loop
  for (const item of cart) {
    const product = products.find(p => p.id === item.id);
    if (product) {
      if (product.stock < item.qty) {
        // Show error inside modal instead of alert
        showPaymentError(`Error: Not enough stock for ${product.name}. Please reduce quantity in cart.`);
        return; // Stop the payment
      }
    } else {
      showPaymentError(`Error: Product ${item.name} not found. Please remove from cart.`);
      return;
    }
  }
  
  // 2. Stock Deduction Loop (only if validation passed)
  for (const item of cart) {
    const product = products.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.qty;
    }
  }
  
  // 3. Save, Clear Cart, and Show Success
  saveProducts(products);
  saveCart([]);
  
  // Show the "in-page" success message!
  showSuccessView();
  
  // We will call renderCart() and updateCartBubble() when the user clicks "Close" (in hideModal)
}

// *** MODIFIED THIS FUNCTION ***
document.addEventListener('DOMContentLoaded', ()=>{ 
  // Get modal elements
  paymentOverlay = document.getElementById('paymentOverlay');
  paymentView = document.getElementById('payment-view');
  successView = document.getElementById('success-view');
  errorDiv = document.getElementById('payment-error');

  // Wire up new modal buttons
  document.getElementById('cancelBtn').addEventListener('click', hideModal);
  document.getElementById('confirmPaymentBtn').addEventListener('click', processPayment);
  document.getElementById('closeSuccessBtn').addEventListener('click', hideModal);

  // Original functions
  renderCart(); 
  updateCartBubble(); 
});