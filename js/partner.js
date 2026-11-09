// Stackly – Restaurant Partner dashboard
(()=>{
const u0=SA.guard('partner');if(!u0)return;
const {esc,R,toast}=SA;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const TABS={overview:'Overview',orders:'Orders',menu:'Menu Items',profile:'Restaurant'};
const CATS=['Pizza','Burgers','Healthy','Desserts','Asian','Indian','Breakfast','Drinks','Grill','Other'];
const NEXT={Placed:[['Preparing','Accept','btn'],['Cancelled','Reject','btn dng']],Preparing:[['Out for delivery','Out for delivery','btn']],'Out for delivery':[['Delivered','Mark delivered','btn']]};
const DEFAULTS=[['Truffle Margherita','Pizza',299],['Smoked Wagyu Burger','Burgers',339],['Garden Harvest Bowl','Healthy',379],['Charcoal Grill Platter','Grill',419],['Golden Pancake Stack','Breakfast',499],['Velvet Chocolate Cake','Desserts',539]];
let tab='overview',filter='all',q='';

const me=()=>SA.users()[SA.session().email]||u0;
const badge=s=>`<span class="bdg s-${s.replace(/\s/g,'').toLowerCase()}">${s}</span>`;
const allOrders=()=>SA.orders().slice().sort((a,b)=>b.ts-a.ts);
const menuAll=()=>SA.J('stackly_menu',[]);
const myMenu=()=>menuAll().filter(m=>m.pid===me().id);
// first visit: give the restaurant a starter menu
(()=>{const ms=menuAll();if(!ms.some(m=>m.pid===u0.id)){DEFAULTS.forEach(([name,cat,price],i)=>ms.push({id:'M'+Date.now()+i,pid:u0.id,name,cat,price,desc:'Freshly prepared to order.',on:true}));SA.S('stackly_menu',ms)}})();

const stat=(i,l,v)=>`<div class="stat"><i>${i}</i><b>${v}</b><small>${l}</small></div>`;
const startOfDay=()=>{const d=new Date();d.setHours(0,0,0,0);return +d};
const oc=o=>`<div class="ocard"><div class="oh"><div><b class="oid">${esc(o.id)}</b><small>${SA.fmt(o.ts)} · ${esc(o.pay||'—')}</small></div>${badge(o.status)}</div>
  <p class="who2" style="margin-top:8px"><b>${esc(o.customerName||'Guest')}</b>${o.phone?' · '+esc(o.phone):''}<br>📍 ${esc(o.addr||'—')}</p>
  <div class="items">${o.items.map(i=>`<span>${i.q}× ${esc(i.n)}</span>`).join('')}</div>
  <div class="of"><strong>${R(o.total)}</strong><div class="acts">${(NEXT[o.status]||[]).map(([s,l,c])=>`<button class="${c} sm" data-act="status" data-id="${esc(o.id)}" data-s="${s}" type="button">${l}</button>`).join('')}</div></div></div>`;
const emptyOrders=`<div class="empty"><b>📭</b><p>No orders here yet.</p><button class="btn" data-act="sample" type="button">Generate sample orders</button></div>`;

/* ---------- views ---------- */
function vOverview(){
  const u=me(),os=allOrders(),today=os.filter(o=>o.ts>=startOfDay()),pending=os.filter(o=>o.status==='Placed'||o.status==='Preparing');
  const rev=os.filter(o=>o.status==='Delivered').reduce((a,o)=>a+o.total,0);
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));return d});
  const vals=days.map(d=>os.filter(o=>o.status==='Delivered'&&o.ts>=+d&&o.ts<+d+864e5).reduce((a,o)=>a+o.total,0));
  const max=Math.max(...vals,0);
  return `<div class="hello"><h2>${esc(u.restaurant||'My Restaurant')}</h2><p>Partner ID <b>${u.id}</b> · ${esc(u.email)}</p></div>
  <div class="panel"><div class="ph"><h3>Accepting orders</h3><button class="tg ${u.open!==false?'on':''}" data-act="open" type="button"><i></i><span>${u.open!==false?'Open':'Closed'}</span></button></div></div>
  <div class="stats">${stat('🧾',"Today's orders",today.length)}${stat('💰','Revenue (delivered)',R(rev))}${stat('⏳','Pending orders',pending.length)}${stat('🍽️','Menu items',myMenu().length)}</div>
  <div class="panel"><div class="ph"><h3>Last 7 days revenue</h3></div><div class="chart">${vals.map((v,i)=>`<div class="cbar"><em>${v?R(v):''}</em><i style="height:${max?Math.max(3,v/max*100):3}%"></i><small>${days[i].toLocaleDateString('en-IN',{weekday:'short'})}</small></div>`).join('')}</div></div>
  <div class="panel"><div class="ph"><h3>Needs attention</h3><button class="lnk" data-act="go" data-id="orders" type="button">All orders →</button></div>
  ${pending.length?pending.slice(0,3).map(oc).join(''):'<div class="empty"><b>✅</b><p>All caught up!</p></div>'}</div>`;
}
const orderList=()=>{
  let os=allOrders();
  if(filter!=='all')os=os.filter(o=>o.status===filter);
  if(q)os=os.filter(o=>(o.id+' '+(o.customerName||'')+' '+(o.phone||'')).toLowerCase().includes(q));
  return os.length?os.map(oc).join(''):emptyOrders;
};
function vOrders(){
  const f=['all','Placed','Preparing','Out for delivery','Delivered','Cancelled'];
  return `<div class="panel"><div class="bar2"><div class="chips">${f.map(k=>`<button type="button" data-act="filter" data-id="${k}" class="${filter===k?'on':''}">${k==='all'?'All':k}</button>`).join('')}</div>
  <input class="srch" id="osearch" placeholder="Search order ID, name or phone" value="${esc(q)}" /></div><div id="olist">${orderList()}</div></div>`;
}
function vMenu(){
  const ms=myMenu();
  return `<div class="panel"><div class="ph"><h3>Menu items (${ms.length})</h3><button class="btn sm" data-act="add" type="button">+ Add item</button></div>
  ${ms.length?`<div class="mgrid">${ms.map(m=>`<div class="mitem ${m.on?'':'off'}"><span class="cat">${esc(m.cat)}</span><h4>${esc(m.name)}</h4><p>${esc(m.desc||'')}</p><div class="pr">${R(m.price)}</div>
    <div class="acts" style="margin-top:8px"><button class="btn o sm" data-act="avail" data-id="${m.id}" type="button">${m.on?'Mark unavailable':'Mark available'}</button>
    <button class="btn o sm" data-act="edit" data-id="${m.id}" type="button">Edit</button><button class="btn dng sm" data-act="del" data-id="${m.id}" type="button">Delete</button></div></div>`).join('')}</div>`
  :'<div class="empty"><b>🍽️</b><p>No menu items yet.</p><button class="btn" data-act="add" type="button">Add your first item</button></div>'}</div>`;
}
function vProfile(){
  const u=me();
  return `<div class="panel"><div class="ph"><h3>Restaurant details</h3></div>
  <form id="pf" novalidate><div class="fgrid">
    <div class="fld"><label>Partner ID</label><input value="${u.id}" readonly /></div>
    <div class="fld"><label>Login email</label><input value="${esc(u.email)}" readonly /></div>
    <div class="fld"><label for="rn">Restaurant name</label><input id="rn" value="${esc(u.restaurant||'')}" /></div>
    <div class="fld"><label for="on">Owner name</label><input id="on" value="${esc(u.name)}" /></div>
    <div class="fld"><label for="pp">Mobile number</label><input id="pp" inputmode="numeric" maxlength="10" value="${esc(u.phone||'')}" /></div>
    <div class="fld"><label for="pc">City</label><input id="pc" value="${esc(u.city||'')}" /></div>
    <div class="fld full"><label for="pa">Address</label><textarea id="pa">${esc(u.addr||'')}</textarea></div>
    <div class="fld full"><label for="ph">Opening hours</label><input id="ph" value="${esc(u.hours||'')}" placeholder="e.g. 10:00 AM – 11:00 PM" /></div>
  </div><div class="msg" id="pm"></div><div class="fa"><button class="btn" type="submit">Save changes</button></div></form></div>
  <div class="panel"><div class="ph"><h3>Change password</h3></div>
  <form id="wf" novalidate><div class="fgrid">
    <div class="fld full"><label for="w0">Current password</label><input id="w0" type="password" autocomplete="current-password" /></div>
    <div class="fld"><label for="w1">New password</label><input id="w1" type="password" autocomplete="new-password" /></div>
    <div class="fld"><label for="w2">Confirm new password</label><input id="w2" type="password" autocomplete="new-password" /></div>
  </div><div class="msg" id="wm"></div><div class="fa"><button class="btn" type="submit">Update password</button></div></form></div>`;
}

/* ---------- render / routing ---------- */
function render(){
  if(!TABS[tab])tab='overview';
  $('#ttl').textContent=TABS[tab];
  $$('#navmenu a').forEach(a=>a.classList.toggle('on',a.dataset.t===tab));
  $('#view').innerHTML=({overview:vOverview,orders:vOrders,menu:vMenu,profile:vProfile})[tab]();
  const u=me();$('#uid').textContent='ID: '+u.id;$('#av').textContent=(u.restaurant||u.name||'?').trim()[0].toUpperCase();
}
const route=()=>{tab=(location.hash||'#overview').slice(1);closeSide();render();scrollTo(0,0)};
const side=$('#side'),scrim=$('#scrim');
function closeSide(){side.classList.remove('o');scrim.classList.remove('o')}
$('#burger').onclick=()=>{side.classList.add('o');scrim.classList.add('o')};
scrim.onclick=closeSide;
addEventListener('hashchange',route);
addEventListener('resize',()=>{if(innerWidth>900)closeSide()});

/* ---------- menu item modal ---------- */
function itemModal(m){
  SA.modal(`<h3>${m?'Edit item':'Add menu item'}</h3><form id="mf" data-id="${m?m.id:''}" novalidate><div class="fgrid">
    <div class="fld full"><label for="mn">Item name</label><input id="mn" value="${m?esc(m.name):''}" /></div>
    <div class="fld"><label for="mc">Category</label><select id="mc">${CATS.map(c=>`<option ${m&&m.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="fld"><label for="mp">Price (₹)</label><input id="mp" type="number" min="1" step="1" inputmode="numeric" value="${m?m.price:''}" /></div>
    <div class="fld full"><label for="md">Description</label><textarea id="md">${m?esc(m.desc||''):''}</textarea></div>
  </div><div class="msg" id="mm"></div><div class="fa"><button class="btn" type="submit">${m?'Save item':'Add item'}</button><button class="btn o" type="button" data-act="closem">Cancel</button></div></form>`);
}

/* ---------- sample orders ---------- */
function sample(){
  const names=['Aarav Mehta','Diya Nair','Kabir Rao','Isha Verma','Rohan Das'],sts=['Placed','Placed','Preparing','Out for delivery','Delivered','Delivered','Delivered'];
  const pool=myMenu().filter(m=>m.on);const base=pool.length?pool:DEFAULTS.map(d=>({name:d[0],price:d[2]}));
  const os=SA.orders();
  for(let i=0;i<7;i++){
    const items=[0,1].map(()=>base[Math.floor(Math.random()*base.length)]).map(m=>({n:m.name,p:m.price,q:1+Math.floor(Math.random()*2)}));
    const sub=items.reduce((a,x)=>a+x.p*x.q,0),nm=names[i%names.length];
    os.push({id:'STK'+Math.floor(1e5+Math.random()*9e5),userId:'DEMO',customerName:nm,phone:'98'+Math.floor(1e7+Math.random()*9e7),addr:'Sample address, Bengaluru',pay:['UPI','Card','Cash on delivery'][i%3],items,sub,total:Math.round(sub*1.05),status:sts[i],ts:Date.now()-i*864e5/1.5-Math.random()*36e5});
  }
  SA.saveOrders(os);toast('Sample orders added');render();
}

/* ---------- actions ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act,id=b.dataset.id;
  if(a==='logout'){SA.logout();return}
  if(a==='go'){location.hash=id;return}
  if(a==='filter'){filter=id;render();return}
  if(a==='sample'){sample();return}
  if(a==='closem'){SA.closeModal();return}
  if(a==='open'){const us=SA.users(),u=us[me().email];u.open=u.open===false;SA.saveUsers(us);toast(u.open?'Restaurant is now open':'Restaurant is now closed');render();return}
  if(a==='status'){
    const os=SA.orders(),o=os.find(x=>x.id===id);if(!o)return;
    if(b.dataset.s==='Cancelled'&&!confirm('Reject order '+id+'?'))return;
    o.status=b.dataset.s;SA.saveOrders(os);toast('Order '+id+' → '+o.status);render();return;
  }
  if(a==='add'){itemModal(null);return}
  if(a==='edit'){itemModal(menuAll().find(m=>m.id===id));return}
  if(a==='avail'){const ms=menuAll(),m=ms.find(x=>x.id===id);m.on=!m.on;SA.S('stackly_menu',ms);toast(m.name+(m.on?' is available':' is unavailable'));render();return}
  if(a==='del'){const m=menuAll().find(x=>x.id===id);if(m&&confirm('Delete "'+m.name+'"?')){SA.S('stackly_menu',menuAll().filter(x=>x.id!==id));toast('Item deleted');render()}return}
});
document.addEventListener('input',e=>{if(e.target.id==='osearch'){q=e.target.value.trim().toLowerCase();$('#olist').innerHTML=orderList()}});
document.addEventListener('submit',e=>{
  e.preventDefault();const id=e.target.id;
  const msg=(sel,t,ok)=>{const m=$(sel);m.textContent=t;m.className='msg'+(ok?' ok':'')};
  if(id==='mf'){
    const name=$('#mn').value.trim(),price=Math.round(+$('#mp').value),cat=$('#mc').value,desc=$('#md').value.trim(),eid=e.target.dataset.id;
    if(name.length<2)return msg('#mm','Enter the item name.');
    if(!(price>0))return msg('#mm','Enter a valid price.');
    const ms=menuAll();
    if(eid){const m=ms.find(x=>x.id===eid);Object.assign(m,{name,cat,price,desc})}
    else ms.push({id:'M'+Date.now(),pid:me().id,name,cat,price,desc,on:true});
    SA.S('stackly_menu',ms);SA.closeModal();toast(eid?'Item updated':'Item added');render();
  }else if(id==='pf'){
    const rest=$('#rn').value.trim(),name=$('#on').value.trim(),phone=$('#pp').value.trim();
    if(!rest)return msg('#pm','Restaurant name is required.');
    if(name.length<2)return msg('#pm','Enter the owner name.');
    if(!SA.validPhone(phone))return msg('#pm','Enter a valid 10-digit mobile number.');
    const us=SA.users(),u=us[me().email];Object.assign(u,{restaurant:rest,name,phone,city:$('#pc').value.trim(),addr:$('#pa').value.trim(),hours:$('#ph').value.trim()});SA.saveUsers(us);
    const s=SA.session();s.name=name;SA.S('stackly_user',s);msg('#pm','Details saved ✓',true);toast('Restaurant updated');
    $('#av').textContent=rest[0].toUpperCase();
  }else if(id==='wf'){
    const c=$('#w0').value,n=$('#w1').value,n2=$('#w2').value;
    if(c!==me().pw)return msg('#wm','Current password is incorrect.');
    if(n.length<6)return msg('#wm','New password must be at least 6 characters.');
    if(n!==n2)return msg('#wm','Passwords do not match.');
    const us=SA.users();us[me().email].pw=n;SA.saveUsers(us);
    ['#w0','#w1','#w2'].forEach(s=>$(s).value='');msg('#wm','Password updated ✓',true);toast('Password changed');
  }
});

route();
})();