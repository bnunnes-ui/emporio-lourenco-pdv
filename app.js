const seedProducts=[
 {id:1,name:'Alho roxo nacional',category:'Alhos',unit:'kg',price:32.9,stock:18.4,emoji:'🧄'},
 {id:2,name:'Alho descascado',category:'Alhos',unit:'kg',price:44.9,stock:7.8,emoji:'🧄'},
 {id:3,name:'Páprica defumada',category:'Temperos',unit:'kg',price:69.9,stock:4.2,emoji:'🌶️'},
 {id:4,name:'Cúrcuma em pó',category:'Temperos',unit:'kg',price:38.5,stock:6.7,emoji:'🟡'},
 {id:5,name:'Orégano selecionado',category:'Ervas',unit:'kg',price:54.9,stock:3.1,emoji:'🌿'},
 {id:6,name:'Pimenta-do-reino',category:'Pimentas',unit:'kg',price:78.9,stock:5.5,emoji:'⚫'},
 {id:7,name:'Chimichurri',category:'Temperos',unit:'kg',price:42.9,stock:8.3,emoji:'🌱'},
 {id:8,name:'Canela em pau',category:'Condimentos',unit:'kg',price:49.9,stock:2.2,emoji:'🪵'},
 {id:9,name:'Sal rosa do Himalaia',category:'Condimentos',unit:'kg',price:24.9,stock:12.6,emoji:'🧂'},
 {id:10,name:'Molho de pimenta',category:'Pimentas',unit:'un',price:18.9,stock:14,emoji:'🌶️'},
 {id:11,name:'Alecrim desidratado',category:'Ervas',unit:'kg',price:46.9,stock:1.4,emoji:'🌿'},
 {id:12,name:'Noz-moscada inteira',category:'Condimentos',unit:'un',price:4.5,stock:38,emoji:'🟤'}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
let products=JSON.parse(localStorage.getItem('emporio_products')||'null')||seedProducts;
let sales=JSON.parse(localStorage.getItem('emporio_sales')||'[]');
let cart=[], category='Todos', discount=0, selectedProduct=null;
const save=()=>{localStorage.setItem('emporio_products',JSON.stringify(products));localStorage.setItem('emporio_sales',JSON.stringify(sales))};
const today=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(new Date());
$('#dateLabel').textContent=today.charAt(0).toUpperCase()+today.slice(1);
$('#saleNumber').textContent=`Venda #${String(sales.length+1).padStart(4,'0')}`;

function renderCategories(){const cats=['Todos',...new Set(products.map(p=>p.category))];$('#categories').innerHTML=cats.map(c=>`<button class="category-btn ${c===category?'active':''}" data-category="${c}">${c}</button>`).join('');$$('.category-btn').forEach(b=>b.onclick=()=>{category=b.dataset.category;renderCategories();renderProducts()})}
function renderProducts(){const q=$('#searchInput').value.toLowerCase();const list=products.filter(p=>(category==='Todos'||p.category===category)&&p.name.toLowerCase().includes(q));$('#productCount').textContent=`${list.length} itens disponíveis`;$('#productGrid').innerHTML=list.map(p=>`<button class="product-card" data-id="${p.id}"><div class="product-image"><span>${p.emoji||'🌿'}</span><span class="stock-badge ${p.stock<2?'low':''}">${p.stock.toLocaleString('pt-BR')} ${p.unit}</span></div><h3>${p.name}</h3><p>${p.category} · por ${p.unit}</p><strong>${money(p.price)} <small>/ ${p.unit}</small></strong></button>`).join('')||'<p>Nenhum produto encontrado.</p>';$$('.product-card').forEach(b=>b.onclick=()=>selectProduct(+b.dataset.id))}
function selectProduct(id){const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return toast('Produto sem estoque.');if(p.unit==='kg'){selectedProduct=p;$('#weightTitle').textContent=p.name;$('#weightPrice').textContent=`${money(p.price)} por kg`;$('#weightInput').value='0.10';updateWeightTotal();openModal('weightModal')}else addToCart(p,1)}
function addToCart(p,qty){const existing=cart.find(i=>i.id===p.id);if(existing)existing.qty=Math.min(existing.qty+qty,p.stock);else cart.push({...p,qty:Math.min(qty,p.stock)});renderCart();toast(`${p.name} adicionado.`)}
function totals(){const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);return{subtotal,total:Math.max(0,subtotal-discount)}}
function renderCart(){const {subtotal,total}=totals();$('#emptyCart').style.display=cart.length?'none':'flex';$('#cartItems').innerHTML=cart.map(i=>`<div class="cart-item"><div class="cart-thumb">${i.emoji}</div><div class="cart-info"><strong>${i.name}</strong><small>${money(i.price)} / ${i.unit}</small><div class="qty-controls"><button data-act="minus" data-id="${i.id}">−</button><span>${i.qty.toLocaleString('pt-BR',{maximumFractionDigits:3})} ${i.unit}</span><button data-act="plus" data-id="${i.id}">＋</button></div></div><div class="cart-price"><strong>${money(i.price*i.qty)}</strong><button class="remove-btn" data-act="remove" data-id="${i.id}">×</button></div></div>`).join('');$('#subtotal').textContent=money(subtotal);$('#total').textContent=$('#checkoutTotal').textContent=money(total);$('#discountValue').textContent=discount?`− ${money(discount)}`:'—';$('#checkoutBtn').disabled=!cart.length;$$('[data-act]').forEach(b=>b.onclick=()=>changeItem(+b.dataset.id,b.dataset.act))}
function changeItem(id,act){const i=cart.find(x=>x.id===id);if(act==='remove'){cart=cart.filter(x=>x.id!==id)}else{const step=i.unit==='kg'?.1:1;i.qty=act==='plus'?Math.min(i.qty+step,i.stock):i.qty-step;if(i.qty<=0)cart=cart.filter(x=>x.id!==id)}renderCart()}
function openModal(id){$('#'+id).classList.add('open')}
function closeModals(){$$('.modal-backdrop').forEach(m=>m.classList.remove('open'))}
function updateWeightTotal(){$('#weightTotal').textContent=money((+$ ('#weightInput').value||0)*selectedProduct.price)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}

$('#searchInput').oninput=renderProducts;$('#clearCart').onclick=()=>{cart=[];discount=0;renderCart()};
$('#weightInput').oninput=updateWeightTotal;$$('.quick-weights button').forEach(b=>b.onclick=()=>{$('#weightInput').value=b.dataset.weight;updateWeightTotal()});
$('#addWeightBtn').onclick=()=>{const qty=+$ ('#weightInput').value;if(qty>0){addToCart(selectedProduct,qty);closeModals()}};
$$('.modal-close').forEach(b=>b.onclick=closeModals);$$('.modal-backdrop').forEach(m=>m.onclick=e=>{if(e.target===m)closeModals()});
$('#discountBtn').onclick=()=>{if(!cart.length)return;const value=prompt('Informe o desconto em reais:','0');if(value!==null){discount=Math.max(0,Math.min(parseFloat(value.replace(',','.'))||0,totals().subtotal));renderCart()}};
$('#checkoutBtn').onclick=()=>{$('#paymentTotal').textContent=money(totals().total);openModal('paymentModal')};
$$('[data-payment]').forEach(b=>b.onclick=()=>finishSale(b.dataset.payment));
function finishSale(payment){const {subtotal,total}=totals();const sale={id:sales.length?Math.max(...sales.map(s=>s.id))+1:1,date:new Date().toISOString(),items:cart.map(({id,name,qty,price,unit})=>({id,name,qty,price,unit})),subtotal,discount,total,payment};sales.unshift(sale);cart.forEach(i=>{const p=products.find(x=>x.id===i.id);p.stock=Math.max(0,p.stock-i.qty)});cart=[];discount=0;save();closeModals();renderAll();toast(`Venda #${String(sale.id).padStart(4,'0')} concluída via ${payment}.`)}
function productForm(p=null){$('#productModalTitle').textContent=p?'Editar produto':'Novo produto';$('#editId').value=p?.id||'';$('#pName').value=p?.name||'';$('#pCategory').value=p?.category||'Temperos';$('#pUnit').value=p?.unit||'kg';$('#pPrice').value=p?.price||'';$('#pStock').value=p?.stock??'';openModal('productModal')}
$('#newProductBtn').onclick=()=>productForm();$('#stockNewBtn').onclick=()=>productForm();
$('#productForm').onsubmit=e=>{e.preventDefault();const id=+$ ('#editId').value;const data={name:$('#pName').value.trim(),category:$('#pCategory').value,unit:$('#pUnit').value,price:+$('#pPrice').value,stock:+$('#pStock').value};if(id)Object.assign(products.find(p=>p.id===id),data);else products.push({id:Date.now(),...data,emoji:data.category==='Alhos'?'🧄':data.category==='Pimentas'?'🌶️':data.category==='Ervas'?'🌿':'🫙'});save();closeModals();renderAll();toast('Produto salvo com sucesso.')};
function renderStock(){const total=products.length,low=products.filter(p=>p.stock>0&&p.stock<2).length,out=products.filter(p=>p.stock<=0).length;$('#stockStats').innerHTML=stat('Produtos cadastrados',total,'Catálogo ativo')+stat('Estoque baixo',low,'Abaixo de 2 kg/un')+stat('Sem estoque',out,out?'Requer reposição':'Tudo abastecido');$('#stockTable').innerHTML=products.map(p=>{const st=p.stock<=0?['Sem estoque','out']:p.stock<2?['Estoque baixo','low']:['Disponível',''];return`<tr><td><div class="table-product"><span class="table-emoji">${p.emoji}</span><strong>${p.name}</strong></div></td><td>${p.category}</td><td>${money(p.price)} / ${p.unit}</td><td>${p.stock.toLocaleString('pt-BR',{maximumFractionDigits:3})} ${p.unit}</td><td><span class="status ${st[1]}">${st[0]}</span></td><td><button class="edit-btn" data-edit="${p.id}">Editar</button></td></tr>`}).join('');$$('[data-edit]').forEach(b=>b.onclick=()=>productForm(products.find(p=>p.id===+b.dataset.edit)))}
const stat=(label,value,note)=>`<div class="stat-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
function renderSales(){const revenue=sales.reduce((s,x)=>s+x.total,0),ticket=sales.length?revenue/sales.length:0;$('#salesStats').innerHTML=stat('Vendas realizadas',sales.length,'Total acumulado')+stat('Faturamento',money(revenue),'Neste dispositivo')+stat('Ticket médio',money(ticket),'Por venda');$('#salesTable').innerHTML=sales.length?sales.map(s=>`<tr><td><strong>#${String(s.id).padStart(4,'0')}</strong></td><td>${new Date(s.date).toLocaleString('pt-BR')}</td><td>${s.items.reduce((a,i)=>a+i.qty,0).toLocaleString('pt-BR',{maximumFractionDigits:2})} itens</td><td>${s.payment}</td><td><strong>${money(s.total)}</strong></td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;padding:35px;color:#7c877f">Nenhuma venda registrada ainda.</td></tr>'}
$('#exportBtn').onclick=()=>{if(!sales.length)return toast('Ainda não há vendas para exportar.');const rows=[['Venda','Data','Pagamento','Subtotal','Desconto','Total'],...sales.map(s=>[s.id,new Date(s.date).toLocaleString('pt-BR'),s.payment,s.subtotal,s.discount,s.total])];const csv='\ufeff'+rows.map(r=>r.join(';')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='vendas-emporio.csv';a.click();URL.revokeObjectURL(a.href)};
$$('.nav-item').forEach(b=>b.onclick=()=>{$$('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.view').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.view+'View').classList.add('active');$('#pageTitle').textContent={pdv:'Frente de caixa',estoque:'Estoque',vendas:'Vendas'}[b.dataset.view];if(b.dataset.view==='estoque')renderStock();if(b.dataset.view==='vendas')renderSales()});
document.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();$('#searchInput').focus()}if(e.key==='F10'&&cart.length){e.preventDefault();$('#checkoutBtn').click()}if(e.key==='Escape')closeModals()});
function renderAll(){renderCategories();renderProducts();renderCart();renderStock();renderSales();$('#saleNumber').textContent=`Venda #${String((sales[0]?.id||0)+1).padStart(4,'0')}`}
renderAll();
