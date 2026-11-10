'use strict';

const SHOP = Object.freeze({ telegram: 'https://t.me/La_ddeaaa', grabUrl: 'https://applink.grab.com/open?screenType=GRABFOOD&merchantIDs=10-C8KAFGNGRA21J2&sourceID=SMART_LINK&smartLinkID=7e175eba-2562-4ae2-bc51-8dbd29277f63' });
const DRINKS = Object.freeze([
  {id:'matcha-latte',name:'Matcha Latte',price:150,category:'matcha',art:0,tag:'The classic',description:'A smooth swirl of green matcha and creamy milk. Your everyday little moment of calm.'},
  {id:'pure-matcha',name:'Pure Matcha',price:150,category:'matcha',art:1,description:'Matcha in its simplest form. Refreshing, earthy green tea, served over ice.'},
  {id:'cold-whisk-matcha',name:'Cold Whisk Matcha',price:175,category:'matcha',art:2,description:'Cold-whisked matcha with a soft, frothy finish. Bright, green, and wonderfully refreshing.'},
  {id:'strawberry-matcha-latte',name:'Strawberry Matcha Latte',price:175,category:'matcha',art:3,tag:'Berry lovely',pink:true,description:'Sweet strawberry, creamy milk, and a green matcha layer. A little fruity, a little earthy, a lot to love.'},
  {id:'chocolate-matcha-latte',name:'Chocolate Matcha Latte',price:175,category:'matcha',art:4,description:'Earthy matcha meets rich chocolate and creamy milk. A happy meeting of two favorites.'},
  {id:'oreo-matcha-latte',name:'Oreo Matcha Latte',price:175,category:'matcha',art:5,description:'Creamy matcha with a cookies-and-cream twist. A playful little treat for your day.'},
  {id:'matcha-coconut-cloud',name:'Matcha Coconut Cloud',price:200,category:'matcha',art:6,tag:'On cloud nine',description:'Green matcha with a soft coconut cloud. Creamy, mellow, and a little tropical.'},
  {id:'jasmine-matcha-cloud-latte',name:'Jasmine Matcha Cloud Latte',price:250,category:'matcha',art:7,description:'A delicate jasmine note, smooth matcha, and a creamy cloud finish. A floral little escape.'},
  {id:'strawberry-chocolate-latte',name:'Strawberry Chocolate Latte',price:175,category:'refreshers',art:8,description:'Strawberry sweetness meets creamy chocolate. A dessert-inspired sip with a rosy little twist.'},
  {id:'chocolate-latte',name:'Chocolate Latte',price:125,category:'refreshers',art:9,description:'Smooth chocolate and creamy milk over ice. A familiar favorite, one happy sip at a time.'},
  {id:'strawberry-latte',name:'Strawberry Latte',price:125,category:'refreshers',art:10,description:'A pretty pink blend of strawberry and creamy milk. Sweet, fruity, and easy to love.'},
  {id:'chocolate-lava',name:'Chocolate Lava',price:175,category:'refreshers',art:11,description:'A rich, chocolate-filled treat with a decadent finish. For a little extra indulgence.'},
  {id:'honey-lemon-tea',name:'Honey Lemon Tea',price:150,category:'refreshers',art:12,description:'A bright blend of honey, lemon, and tea. Sweet, citrusy sunshine in a glass.'},
  {id:'ice-lemon-red-tea',name:'Ice Lemon Red Tea',price:100,category:'refreshers',art:13,description:'Refreshing red tea with a bright lemon twist. Light, crisp, and made for a cool-down.'},
  {id:'honey-jasmine-lemon-tea',name:'Honey Jasmine Lemon Tea',price:150,category:'refreshers',art:14,description:'Fragrant jasmine tea, honey sweetness, and a little lemon sparkle. A gentle golden refreshment.'}
]);
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const money = cents => '$' + (cents / 100).toFixed(2);
const icon = name => `<svg class="icon small" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const findDrink = id => DRINKS.find(drink => drink.id === id);
const artStyle = n => `--col:${n%5};--row:${Math.floor(n/5)}`;
const STORAGE_KEY = 'pherk-matcha-bag-v1';
const SWEETNESS = ['0%','25%','50%','75%','100%'];
const ICE = ['No ice','Less ice','Regular ice'];
const MAX_LINES = 12;
let cart = [];
let activeFilter = 'all';
let chosenDrink = null;
let quantity = 1;
let method = 'pickup';
let toastTimer;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) cart = saved.filter(item => item && findDrink(item.id) && Number.isInteger(item.quantity) && item.quantity>=1 && item.quantity<=20 && SWEETNESS.includes(item.sweetness) && ICE.includes(item.ice) && typeof item.note==='string').slice(0,MAX_LINES).map(item => ({id:item.id,quantity:item.quantity,sweetness:item.sweetness,ice:item.ice,note:item.note.slice(0,140)}));
} catch { cart = []; }

function toast(text) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = text;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3300);
}
function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* The bag remains usable when browser storage is unavailable. */ }
  renderBagCounts();
}
function subtotal() { return cart.reduce((sum,item) => sum + findDrink(item.id).price*item.quantity,0); }
function itemCount() { return cart.reduce((sum,item) => sum+item.quantity,0); }
function renderBagCounts() {
  const count = itemCount();
  $$('.bag-count').forEach(el => el.textContent = count);
  $('.cart-heading-count').textContent = count;
  $('#mobile-total').innerHTML = money(subtotal())+icon('arrow');
  $('.mobile-bag').hidden = !count;
  document.body.classList.toggle('has-items',count>0);
  $$('[data-cart]').forEach(el => el.setAttribute('aria-label',`Your bag, ${count} ${count===1?'drink':'drinks'}, ${money(subtotal())}`));
}
function renderMenu() {
  const query = $('#search').value.trim().toLowerCase();
  const visible = DRINKS.filter(drink => (activeFilter==='all'||activeFilter===drink.category) && drink.name.toLowerCase().includes(query));
  $('#drink-grid').innerHTML = visible.map((drink,index) => `<button class="drink-card" data-drink="${drink.id}" style="--i:${index}" aria-label="Customize ${drink.name}, ${money(drink.price)}">${drink.tag?`<span class="card-tag ${drink.pink?'pink':''}">${drink.tag}</span>`:''}<span class="card-art-wrap"><span class="drink-art" style="${artStyle(drink.art)}" aria-hidden="true"></span></span><span class="card-category">${drink.category==='matcha'?'The matcha collection':'A little refreshment'}</span><h3>${drink.name}</h3><span class="card-bottom"><span class="card-price">${money(drink.price)}</span><span class="card-add">${icon('plus')}</span></span></button>`).join('');
  $('#empty-search').hidden = visible.length>0;
  $('#result-count').textContent = query ? `${visible.length} ${visible.length===1?'sip':'sips'} found` : `${visible.length} little ${visible.length===1?'reason':'reasons'} to smile`;
  $$('.filter').forEach(button => { const active=button.dataset.filter===activeFilter; button.classList.toggle('active',active); button.setAttribute('aria-pressed',active); });
}
function openDialog(dialog) {
  if(!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
}
function showDrink(id) {
  chosenDrink=findDrink(id);
  if(!chosenDrink)return;
  quantity=1;
  $('#drink-form').reset();
  $('#drink-name').textContent=chosenDrink.name;
  $('#drink-price').textContent=money(chosenDrink.price);
  $('#drink-description').textContent=chosenDrink.description;
  $('#drink-category').textContent=chosenDrink.category==='matcha'?'THE MATCHA COLLECTION':'A LITTLE REFRESHMENT';
  $('#modal-drink-art').setAttribute('style',artStyle(chosenDrink.art));
  updateQuantity();
  openDialog($('#drink-dialog'));
}
function updateQuantity() {
  $('#drink-quantity').textContent=quantity;
  $('#add-total').textContent=money(chosenDrink.price*quantity);
  $('#drink-minus').disabled=quantity<=1;
  $('#drink-plus').disabled=quantity>=20;
}
function orderText() {
  const name=$('#customer-name').value.trim();
  const lines=cart.map(item => `${item.quantity} × ${findDrink(item.id).name} — ${money(findDrink(item.id).price*item.quantity)}\n   Sweetness ${item.sweetness} · ${item.ice}${item.note?'\n   Note: '+item.note:''}`);
  return `Hello Pherk Matcha! I’d like to place a pickup order.\n${name?'Name: '+name+'\n':''}Pickup: ${$('#pickup-time').value}\n\n${lines.join('\n\n')}\n\nTotal: ${money(subtotal())} USD\nPlease confirm availability, pickup time, and payment. Thank you!`;
}
function updateTelegramLink() {
  $('#telegram-order').href=SHOP.telegram+'?text='+encodeURIComponent(orderText());
}
function setMethod(next) {
  method=next;
  const pickup=next==='pickup';
  $('#method-pickup').classList.toggle('selected',pickup);
  $('#method-delivery').classList.toggle('selected',!pickup);
  $('#method-pickup').setAttribute('aria-pressed',pickup);
  $('#method-delivery').setAttribute('aria-pressed',!pickup);
  $('#pickup-form').hidden=!pickup;
  $('#delivery-form').hidden=pickup;
  renderCart();
}
function renderCart() {
  const hasItems=cart.length>0;
  $('#cart-empty').hidden=hasItems||method==='delivery';
  $('#cart-filled').hidden=!hasItems&&method!=='delivery';
  $('#cart-items').innerHTML=cart.map((item,index) => {
    const drink=findDrink(item.id);
    return `<article class="cart-item"><div class="drink-art" style="${artStyle(drink.art)}" aria-hidden="true"></div><div><div class="cart-item-top"><h3>${drink.name}</h3><span class="cart-item-price">${money(drink.price*item.quantity)}</span></div><p class="cart-item-options">${item.sweetness} sweetness · ${item.ice}</p>${item.note?`<p class="cart-item-note">${escapeHtml(item.note)}</p>`:''}<div class="cart-item-bottom"><div class="quantity-control"><button data-decrease="${index}" aria-label="Decrease ${drink.name} quantity">${icon('minus')}</button><output aria-label="Quantity">${item.quantity}</output><button data-increase="${index}" aria-label="Increase ${drink.name} quantity" ${item.quantity>=20?'disabled':''}>${icon('plus')}</button></div><button class="remove-item" data-remove="${index}" aria-label="Remove ${drink.name}">Remove</button></div></div></article>`;
  }).join('');
  $('#cart-total').textContent=money(subtotal());
  renderBagCounts();
  updateTelegramLink();
}
function openCart(next='pickup') { setMethod(next); openDialog($('#cart-dialog')); }

$('#drink-grid').addEventListener('click',event=>{const card=event.target.closest('[data-drink]');if(card)showDrink(card.dataset.drink);});
$$('.filter').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;renderMenu();}));
$('#search').addEventListener('input',renderMenu);
$('#reset-search').addEventListener('click',()=>{activeFilter='all';$('#search').value='';renderMenu();});
$('#drink-minus').addEventListener('click',()=>{quantity=Math.max(1,quantity-1);updateQuantity();});
$('#drink-plus').addEventListener('click',()=>{quantity=Math.min(20,quantity+1);updateQuantity();});
$('#drink-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!chosenDrink)return;
  const data=new FormData(event.currentTarget);
  const entry={id:chosenDrink.id,sweetness:data.get('sweetness'),ice:data.get('ice'),note:$('#drink-note').value.trim().slice(0,140),quantity};
  const existing=cart.find(item=>item.id===entry.id&&item.sweetness===entry.sweetness&&item.ice===entry.ice&&item.note===entry.note);
  if(existing&&existing.quantity+quantity>20){toast('Please keep each drink selection to 20 cups or fewer.');return;}
  if(!existing&&cart.length>=MAX_LINES){toast('Your bag holds 12 different selections. Please send this order first.');return;}
  if(existing)existing.quantity+=quantity;else cart.push(entry);
  saveCart();
  $('#drink-dialog').close();
  toast(`${quantity} × ${chosenDrink.name} added to your bag`);
});
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{if(!$$('dialog[open]').length)document.body.classList.remove('modal-open');});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
});
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$$('[data-cart]').forEach(button=>button.addEventListener('click',()=>openCart()));
$$('[data-pickup]').forEach(button=>button.addEventListener('click',()=>openCart()));
$$('[data-delivery]').forEach(button=>button.addEventListener('click',()=>openCart('delivery')));
$$('[data-how]').forEach(button=>button.addEventListener('click',()=>openDialog($('#info-dialog'))));
$('#method-pickup').addEventListener('click',()=>setMethod('pickup'));
$('#method-delivery').addEventListener('click',()=>setMethod('delivery'));
$('#cart-items').addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const action=button.hasAttribute('data-remove')?'remove':button.hasAttribute('data-increase')?'increase':button.hasAttribute('data-decrease')?'decrease':null;
  if(!action)return;
  const index=Number(button.dataset[action]);
  const item=cart[index];if(!item)return;
  if(action==='remove'||(action==='decrease'&&item.quantity===1))cart.splice(index,1);
  else if(action==='increase')item.quantity=Math.min(20,item.quantity+1);
  else item.quantity--;
  saveCart();renderCart();
  const next=$(`[data-${action}="${Math.min(index,cart.length-1)}"]`,$('#cart-items'));
  if(next)next.focus();else $('#cart-dialog [data-close]').focus();
});
$('#customer-name').addEventListener('input',updateTelegramLink);
$('#pickup-time').addEventListener('change',updateTelegramLink);
$('#telegram-order').addEventListener('click',event=>{
  if(!cart.length){event.preventDefault();return;}
  updateTelegramLink();
  $('#handoff-note').hidden=false;
});
$('#copy-order').addEventListener('click',async()=>{
  if(!cart.length)return;
  try{await navigator.clipboard.writeText(orderText());toast('Order copied. Paste it into our Telegram chat.');}
  catch{const field=$('#copy-fallback');field.value=orderText();field.hidden=false;field.focus();field.select();toast('Select and copy the order text below.');}
});
if(SHOP.grabUrl){
  $$('.delivery-label').forEach(el=>el.textContent='Order on Grab');
  $('.info-delivery').innerHTML=icon('scooter')+' Delivery is available on Grab.';
  $('#grab-order').href=SHOP.grabUrl;
}
$('.hero-drink.right').style.setProperty('--col','1');
renderMenu();
renderBagCounts();
