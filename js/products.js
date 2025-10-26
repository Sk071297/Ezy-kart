// products.js
const PRODUCTS_KEY = 'ezk_products_v1';
function loadProducts(){ try{ return JSON.parse(localStorage.getItem(PRODUCTS_KEY)||'[]'); }catch(e){return []} }
function fmt(n){ return '₹ ' + Number(n).toLocaleString('en-IN'); }
function getQueryParam(name){ const url = new URL(window.location.href); return url.searchParams.get(name); }

function renderCategorySections(){
  const list = loadProducts();
  const container = document.getElementById('catalog');
  container.innerHTML = '';
  if(!list || list.length===0){ container.innerHTML = '<div class="empty">No products yet. Add from admin.</div>'; return; }
  // group by category preserving order
  const groups = {};
  list.forEach(p=>{ if(!groups[p.category]) groups[p.category]=[]; groups[p.category].push(p); });
  const filter = getQueryParam('cat');
  Object.keys(groups).forEach(cat=>{
    if(filter && filter!==cat) return;
    const sec = document.createElement('section'); sec.className='section';
    sec.innerHTML = `<h2>${cat}</h2><div class="grid" id="grid-${cat}"></div>`;
    container.appendChild(sec);
    const grid = sec.querySelector('.grid');
    groups[cat].forEach(p=>{
      const d = document.createElement('div'); d.className='card';
      d.innerHTML = `<div class="img"><img src="${p.image||'assets/placeholder.png'}" alt="${p.name}"/></div><div class="pname">${p.name}</div><div class="pcat">${p.category}</div><div class="pprice">${fmt(p.price)}</div><div class="actions"><div style="font-weight:700">${p.stock>0? 'In stock • '+p.stock : 'Out of stock'}</div><div><button class="btn btn-ghost" onclick="viewProduct('${p.id}')">View</button> <button class="btn btn-primary" onclick="addToCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''}>Add</button></div></div>`;
      grid.appendChild(d);
    });
  });
  updateCartCount();
}

function viewProduct(id){
  const list = loadProducts(); const p = list.find(x=>x.id===id); if(!p) return alert('Not found');
  const w = window.open('', '_blank', 'width=700,height=700');
  w.document.write(`<html><head><title>${p.name}</title><link rel="stylesheet" href="css/style.css"></head><body><div class="container"><nav class="navbar"><div class="brand"><div class="logo">EK</div><div style="margin-left:10px"><div style="font-weight:800">EzyKart</div></div></div></nav><div style="display:flex;gap:18px;margin-top:18px"><div style="flex:1"><img src="${p.image||'assets/placeholder.png'}" style="width:100%;border-radius:12px"/></div><div style="flex:1"><h1>${p.name}</h1><div style="color:var(--muted);margin-bottom:8px">SKU: ${p.id}</div><div style="font-size:22px;font-weight:800;margin-bottom:12px">${fmt(p.price)}</div><div>${p.description||''}</div><div style="margin-top:14px"><button class="btn btn-primary" onclick="window.close()">Close</button></div></div></div></div></body></html>`);
}

// *** MODIFIED THIS FUNCTION ***
function addToCart(id){
  const cartKey = 'ezk_cart_v1';
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
  const list = loadProducts(); 
  const p = list.find(x=>x.id===id);
  
  if(!p) return alert('Product not found');
  if(p.stock <= 0) return alert('Sorry, this item is out of stock.');

  // Check if item is already in cart
  const cartItem = cart.find(item => item.id === id);
  const currentQty = cartItem ? cartItem.qty : 0;
  
  // Check against stock
  if (currentQty >= p.stock) {
    alert('You already have all available stock in your cart.');
    return;
  }

  if (cartItem) {
    // If in cart, just increase quantity
    cartItem.qty++;
  } else {
    // If not in cart, add it with quantity 1
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image || 'assets/placeholder.png',
      qty: 1 // Start with quantity 1
    });
  }
  
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
  alert('Added to cart: ' + p.name);
}

// *** MODIFIED THIS FUNCTION ***
function updateCartCount(){ 
  const c = JSON.parse(localStorage.getItem('ezk_cart_v1')||'[]'); 
  // Calculate total quantity of all items
  const totalQty = c.reduce((acc, item) => acc + item.qty, 0);
  const el = document.getElementById('cartLink'); 
  if(el) el.textContent = 'Cart (' + totalQty + ')'; 
}

document.addEventListener('DOMContentLoaded', ()=>{ renderCategorySections(); });