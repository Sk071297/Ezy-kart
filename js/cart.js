// cart.js - simple cart page
const CART_KEY = 'ezk_cart_v1';
const PRODUCTS_KEY = 'ezk_products_v1';

function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch(e){return []} }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function loadProducts(){ try{ return JSON.parse(localStorage.getItem(PRODUCTS_KEY)||'[]'); }catch(e){return []} }
function saveProducts(a){ localStorage.setItem(PRODUCTS_KEY, JSON.stringify(a)); }
function fmt(n){ return '₹ ' + Number(n).toLocaleString('en-IN'); }

// *** NEW FUNCTION ***
function increaseQuantity(id) {
  const cart = loadCart();
  const products = loadProducts();
  const cartItem = cart.find(item => item.id === id);
  const product = products.find(p => p.id === id);

  if (!cartItem) return;

  // Check stock
  if (cartItem.qty >= product.stock) {
    alert('Max stock reached for ' + product.name);
    return;
  }
  
  cartItem.qty++;
  saveCart(cart);
  renderCart();
  updateCartBubble();
}

// *** NEW FUNCTION ***
function decreaseQuantity(id) {
  let cart = loadCart();
  const cartItem = cart.find(item => item.id === id);

  if (!cartItem) return;

  cartItem.qty--;

  if (cartItem.qty <= 0) {
    // If quantity is 0, remove the item from cart
    cart = cart.filter(item => item.id !== id);
  }
  
  saveCart(cart);
  renderCart();
  updateCartBubble();
}

// *** MODIFIED THIS FUNCTION (now takes 'id' not 'index') ***
function removeItem(id){ 
  if (!confirm('Remove item from cart?')) return;
  let cart = loadCart();
  cart = cart.filter(item => item.id !== id); 
  saveCart(cart); 
  renderCart(); 
  updateCartBubble(); 
}

// *** MODIFIED THIS FUNCTION ***
function renderCart(){
  const area = document.getElementById('cartArea');
  const cart = loadCart();
  if(!cart || cart.length===0){ area.innerHTML = '<div class="empty">Your cart is empty.</div>'; return; }

  // New table headers
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

// *** MODIFIED THIS FUNCTION ***
function checkout(){
  const paymentMethod = prompt("Choose a payment method:\n1: UPI\n2: Card\n3: Wallet\n(Enter 1, 2, or 3)");
  if (paymentMethod !== '1' && paymentMethod !== '2' && paymentMethod !== '3') {
    alert('Payment cancelled.');
    return;
  }

  const cart = loadCart();
  if (!cart || cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  
  const products = loadProducts();
  
  // Loop through cart items and update product stock
  for (const item of cart) {
    const product = products.find(p => p.id === item.id);
    if (product) {
      if (product.stock >= item.qty) {
        product.stock -= item.qty;
      } else {
        alert(`Error: Not enough stock for ${product.name}. Checkout cancelled.`);
        return; // Stop the whole checkout
      }
    }
  }
  
  saveProducts(products);
  
  alert('Payment successful! Thank you for your order.\nStock has been updated.');
  saveCart([]);
  renderCart();
  updateCartBubble();
}

// *** MODIFIED THIS FUNCTION ***
function updateCartBubble(){ 
  const cart = loadCart();
  // Calculate total quantity of all items
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const el = parent? parent.document.getElementById('cartLink') : document.getElementById('cartLink'); 
  if(el) el.textContent='Cart (' + totalQty + ')'; 
}

document.addEventListener('DOMContentLoaded', ()=>{ renderCart(); updateCartBubble(); });