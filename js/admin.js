
// admin.js - protected admin
const PRODUCTS_KEY = 'ezk_products_v1';
const COUNTER = 'ezk_product_counter_v1';
function isLoggedIn() { return localStorage.getItem('ezk_admin_loggedin') === '1'; }
if (!isLoggedIn()) { window.location.href = 'login.html'; }

function nextId() { let n = parseInt(localStorage.getItem(COUNTER) || '1000', 10); n++; localStorage.setItem(COUNTER, String(n)); return 'EZK-' + n; }
function loadProducts() { try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]'); } catch (e) { return [] } }
function saveProducts(a) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(a)); }
function fmt(n) { return '₹ ' + Number(n).toLocaleString('en-IN'); }

document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.removeItem('ezk_admin_loggedin'); window.location.href = 'login.html'; });

function populateId() { document.getElementById('pId').value = nextId(); }
function resetForm() { document.getElementById('pName').value = 'EzyKart'; document.getElementById('pCategory').value = 'General'; document.getElementById('pPrice').value = ''; document.getElementById('pStock').value = 10; document.getElementById('pDesc').value = ''; document.getElementById('preview').style.display = 'none'; document.getElementById('preview').src = ''; document.getElementById('pImage').value = ''; populateId(); }

function renderList() { const tbody = document.getElementById('listBody'); tbody.innerHTML = ''; const list = loadProducts(); list.forEach(p => { const tr = document.createElement('tr'); tr.innerHTML = `<td style="width:240px"><div style="display:flex;gap:10px;align-items:center"><img src="${p.image || 'assets/placeholder.png'}" style="width:56px;height:40px;object-fit:cover;border-radius:6px"/><div><div style="font-weight:700">${p.name}</div><div style="color:var(--muted);font-size:13px">${p.id}</div></div></div></td><td>${p.category}</td><td>${fmt(p.price)}</td><td>${p.stock}</td><td><button class="btn btn-ghost" onclick="editProduct('${p.id}')">Edit</button> <button class="btn btn-ghost" onclick="deleteProduct('${p.id}')">Delete</button></td>`; tbody.appendChild(tr); }); }

function readImage(file, cb) { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(file); }
document.getElementById('dropZone').addEventListener('click', () => document.getElementById('pImage').click());
document.getElementById('dropZone').addEventListener('dragover', e => { e.preventDefault(); document.getElementById('dropZone').style.borderColor = 'rgba(11,99,255,0.28)'; });
document.getElementById('dropZone').addEventListener('dragleave', e => { document.getElementById('dropZone').style.borderColor = 'rgba(11,99,255,0.12)'; });
document.getElementById('dropZone').addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readImage(f, data => { document.getElementById('preview').src = data; document.getElementById('preview').style.display = 'block'; }); });
document.getElementById('pImage').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; readImage(f, data => { document.getElementById('preview').src = data; document.getElementById('preview').style.display = 'block'; }); });

document.getElementById('saveBtn').addEventListener('click', () => {
  const p = { id: document.getElementById('pId').value || nextId(), name: document.getElementById('pName').value || 'EzyKart', category: document.getElementById('pCategory').value || 'General', price: Number(document.getElementById('pPrice').value) || 0, stock: Number(document.getElementById('pStock').value) || 0, description: document.getElementById('pDesc').value || '', image: document.getElementById('preview').src || '' };
  const list = loadProducts(); list.unshift(p); saveProducts(list); renderList(); resetForm(); alert('Product added: ' + p.id);
});

document.getElementById('resetBtn').addEventListener('click', resetForm);

function deleteProduct(id) { if (!confirm('Delete ' + id + ' ?')) return; const list = loadProducts().filter(x => x.id !== id); saveProducts(list); renderList(); alert('Deleted ' + id); }
function editProduct(id) { const list = loadProducts(); const p = list.find(x => x.id === id); if (!p) return alert('Not found'); const newName = prompt('Name', p.name); if (newName === null) return; p.name = newName; const newPrice = prompt('Price', p.price); if (newPrice === null) return; p.price = Number(newPrice); const newStock = prompt('Stock', p.stock); if (newStock === null) return; p.stock = Number(newStock); saveProducts(list); renderList(); alert('Updated'); }

(function init() { const list = loadProducts(); if (list.length === 0) { list.push({ id: nextId(), name: 'EzyKart Demo Lamp', category: 'Home', price: 899, stock: 12, description: 'Classy bedside lamp — demo product.', image: '' }); saveProducts(list); } populateId(); renderList(); })();

