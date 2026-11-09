(()=>{
const u0=SA.guard('customer');if(!u0)return;
const {esc,R,toast}=SA;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const TABS={overview:'Overview',orders:'My Orders',profile:'Profile',support:'Support'};
const STEPS=['Placed','Preparing','Out for delivery','Delivered'];
const img=id=>`https://wsrv.nl/?url=images.unsplash.com/photo-${id}&w=600&output=webp&q=55&fit=cover`;
const IMG={'Truffle Margherita':'1504674900247-0877df9cc836','Smoked Wagyu Burger':'1565299624946-b28f40a0ae38','Garden Harvest Bowl':'1546069901-ba9599a7e63c','Charcoal Grill Platter':'1568901346375-23c9450c58cd','Wood-Fired Special':'1513104890138-7c749659a591','Golden Pancake Stack':'1555939594-58d7cb561ad1','Velvet Chocolate Cake':'1567620905732-2d1ec7ab7445','Avocado Toast Deluxe':'1565958011703-44f9829ba187','Signature Chef Plate':'1482049016688-2d3e1b311543'};
let tab='overview',filter='all',q='';const open={};

const me=()=>SA.users()[SA.session().email]||u0;
const myOrders=()=>SA.orders().filter(o=>o.userId===me().id).sort((a,b)=>b.ts-a.ts);
const badge=s=>`<span class="bdg s-${s.replace(/\s/g,'').toLowerCase()}">${s}</span>`;
const isActive=o=>o.status!=='Delivered'&&o.status!=='Cancelled';
const tracker=o=>{
  if(o.status==='Cancelled')return '<div class="trk x">This order was cancelled.</div>';
  const at=STEPS.indexOf(o.status);
  return '<div class="trk">'+STEPS.map((s,i)=>`<div class="stp ${i<=at?'on':''}"><i>${i<at?'✓':i+1}</i><span>${s}</span></div>`).join('')+'</div>';
};
const oc=(o,force)=>{
  const show=force||open[o.id];
  return `<div class="ocard"><div class="oh"><div><b class="oid">${esc(o.id)}</b><small>${SA.fmt(o.ts)} · ${esc(o.pay||'—')}</small></div>${badge(o.status)}</div>
  <div class="items">${o.items.map(i=>`<span>${i.q}× ${esc(i.n)}</span>`).join('')}</div>
  <div class="of"><strong>${R(o.total)}</strong><div class="acts">
    <button class="btn o sm" data-act="toggle" data-id="${esc(o.id)}" type="button">${show&&!force?'Hide':'Track'}</button>
    <button class="btn o sm" data-act="reorder" data-id="${esc(o.id)}" type="button">Reorder</button>
    <button class="btn o sm" data-act="receipt" data-id="${esc(o.id)}" type="button">Receipt</button>
    ${o.status==='Placed'?`<button class="btn dng sm" data-act="cancel" data-id="${esc(o.id)}" type="button">Cancel</button>`:''}
  </div></div>
  ${show?`<div class="det">${tracker(o)}<p>📍 ${esc(o.addr||'—')}</p></div>`:''}</div>`;
};
const stat=(i,l,v,d)=>`<div class="stat"><i>${i}</i><b>${v}</b><small>${l}</small>${d?`<span class="dl">${d}</span>`:''}</div>`;
const TIERS=[['Bronze',0],['Silver',200],['Gold',500],['Platinum',1000]];
const tierOf=p=>{let i=0;TIERS.forEach((t,k)=>{if(p>=t[1])i=k});const c=TIERS[i],n=TIERS[i+1];return{name:c[0],next:n?n[0]:null,need:n?n[1]-p:0,pct:n?Math.round((p-c[1])/(n[1]-c[1])*100):100}};
const completeness=u=>{const f=[u.name,u.phone,u.addr].filter(x=>x&&String(x).trim()).length;return Math.round(f/3*100)};
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const emptyOrders=`<div class="empty"><b>🍽️</b><p>No orders here yet.</p><a class="btn" href="menu.html">Browse Menu</a></div>`;

/* ---------- views ---------- */
function vOverview(){
  const u=me(),os=myOrders(),act=os.filter(isActive),ok=os.filter(o=>o.status!=='Cancelled'),del=os.filter(o=>o.status==='Delivered'),can=os.filter(o=>o.status==='Cancelled');
  const spent=ok.reduce((a,o)=>a+o.total,0),pts=Math.floor(del.reduce((a,o)=>a+o.total,0)/10),t=tierOf(pts);
  const now=new Date(),m0=new Date(now.getFullYear(),now.getMonth(),1).getTime();
  const thisM=ok.filter(o=>o.ts>=m0).length,avg=ok.length?spent/ok.length:0;
  const h=now.getHours(),g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  // last 6 months spend
  const months=[];for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1),e=new Date(d.getFullYear(),d.getMonth()+1,1).getTime();
    months.push({l:MON[d.getMonth()],v:ok.filter(o=>o.ts>=d.getTime()&&o.ts<e).reduce((a,o)=>a+o.total,0)})}
  const mx=Math.max(...months.map(m=>m.v),1);
  const chart=months.map(m=>`<div class="cbar"><em>${m.v?R(m.v):''}</em><i style="height:${m.v?Math.max(m.v/mx*80,4):2}%"></i><small>${m.l}</small></div>`).join('');
  // status donut
  const tot=os.length,dp=tot?del.length/tot*100:0,ap=tot?act.length/tot*100:0;
  const ring=tot?`conic-gradient(var(--green) 0 ${dp}%,var(--gold) ${dp}% ${dp+ap}%,var(--red) ${dp+ap}% 100%)`:'var(--ln2)';
  // favourites
  const tally={};ok.forEach(o=>o.items.forEach(i=>{const x=tally[i.n]||(tally[i.n]={n:i.n,q:0,p:i.p});x.q+=i.q}));
  const favs=Object.values(tally).sort((a,b)=>b.q-a.q).slice(0,3);
  const pc=completeness(u);
  return `<div class="banner"><div><span class="eyebrow">${g}</span><h2>${esc(u.name.split(' ')[0])} 👋</h2><p>Login ID <b>${u.id}</b> · ${esc(u.email)}</p></div>
    <div class="tier"><div class="tr"><b>${t.name} member</b><small>${pts} pts</small></div><div class="bar"><i style="width:${t.pct}%"></i></div><small>${t.next?`${t.need} pts to reach ${t.next}`:'Top tier reached 🎉'}</small></div></div>
  ${pc<100?`<div class="nudge"><span>Your profile is <b>${pc}%</b> complete. Add your phone and address for faster checkout.</span><button class="btn sm" data-act="go" data-id="profile" type="button">Complete profile</button></div>`:''}
  <div class="qa"><a class="qb" href="menu.html"><span>🍽️</span><b>Order food</b><small>Browse the menu</small></a>
    <button class="qb" data-act="go" data-id="orders" type="button"><span>🛵</span><b>Track orders</b><small>${act.length} active</small></button>
    <button class="qb" data-act="go" data-id="support" type="button"><span>🎧</span><b>Get help</b><small>Contact support</small></button>
    <button class="qb" data-act="go" data-id="profile" type="button"><span>👤</span><b>My profile</b><small>Address &amp; password</small></button></div>
  <div class="stats">${stat('🧾','Total orders',os.length,thisM?`+${thisM} this month`:'')}${stat('💰','Total spent',R(spent),ok.length?`avg ${R(avg)}`:'')}${stat('🎁','Reward points',pts,t.name)}${stat('🛵','Active orders',act.length,act.length?'in progress':'')}</div>
  <div class="panel"><div class="ph"><h3>Live order</h3><a class="btn sm" href="menu.html">Order Food</a></div>
    ${act[0]?oc(act[0],true):'<div class="empty"><b>😋</b><p>No active orders. Hungry?</p></div>'}</div>
  <div class="cols c32 mb"><div class="panel"><div class="ph"><h3>Spending · last 6 months</h3></div>${ok.length?`<div class="chart">${chart}</div>`:'<div class="empty"><b>📈</b><p>Your spending chart appears after your first order.</p></div>'}</div>
    <div class="panel"><div class="ph"><h3>Order status</h3></div><div class="donut"><div class="ring" style="background:${ring}"><b>${tot}<small>orders</small></b></div>
      <div class="legend"><span style="--c:var(--green)">Delivered<b>${del.length}</b></span><span style="--c:var(--gold)">Active<b>${act.length}</b></span><span style="--c:var(--red)">Cancelled<b>${can.length}</b></span></div></div></div></div>
  ${favs.length?`<div class="panel"><div class="ph"><h3>Your favourites</h3></div><div class="favs">${favs.map(f=>`<div class="fav"><img alt="" loading="lazy" src="${img(IMG[f.n]||'1504674900247-0877df9cc836')}"><div><b>${esc(f.n)}</b><small>Ordered ${f.q}× · ${R(f.p)}</small></div><button class="btn o sm" data-act="reorderitem" data-id="${esc(f.n)}" data-p="${f.p}" type="button">+ Add</button></div>`).join('')}</div></div>`:''}
  <div class="panel"><div class="ph"><h3>Recent orders</h3><button class="lnk" data-act="go" data-id="orders" type="button">View all →</button></div>
    ${os.length?os.slice(0,3).map(o=>oc(o)).join(''):emptyOrders}</div>`;
}
const orderList=()=>{
  let os=myOrders();
  if(filter==='active')os=os.filter(isActive);else if(filter==='Delivered')os=os.filter(o=>o.status==='Delivered');else if(filter==='Cancelled')os=os.filter(o=>o.status==='Cancelled');
  if(q)os=os.filter(o=>(o.id+' '+o.items.map(i=>i.n).join(' ')).toLowerCase().includes(q));
  return os.length?os.map(o=>oc(o)).join(''):emptyOrders;
};
function vOrders(){
  const all=myOrders(),cn={all:all.length,active:all.filter(isActive).length,Delivered:all.filter(o=>o.status==='Delivered').length,Cancelled:all.filter(o=>o.status==='Cancelled').length};
  const f=[['all','All'],['active','Active'],['Delivered','Delivered'],['Cancelled','Cancelled']];
  return `<div class="panel"><div class="bar2"><div class="chips">${f.map(([k,l])=>`<button type="button" data-act="filter" data-id="${k}" class="${filter===k?'on':''}">${l} (${cn[k]})</button>`).join('')}</div>
  <input class="srch" id="osearch" placeholder="Search order ID or dish" value="${esc(q)}" /></div><div id="olist">${orderList()}</div></div>`;
}
function vProfile(){
  const u=me();
  return `<div class="panel"><div class="ph"><h3>My profile</h3></div>
  <div class="meter"><span>Profile completeness</span><div class="bar"><i style="width:${completeness(u)}%"></i></div><b>${completeness(u)}%</b></div>
  <form id="pf" novalidate><div class="fgrid">
    <div class="fld"><label>Login ID</label><input value="${u.id}" readonly /></div>
    <div class="fld"><label>Email</label><input value="${esc(u.email)}" readonly /></div>
    <div class="fld"><label for="pn">Full name</label><input id="pn" name="name" value="${esc(u.name)}" /></div>
    <div class="fld"><label for="pp">Mobile number</label><input id="pp" name="phone" inputmode="numeric" maxlength="10" value="${esc(u.phone||'')}" /></div>
    <div class="fld full"><label for="pa">Delivery address</label><textarea id="pa" name="addr" placeholder="House no, street, area, city">${esc(u.addr||'')}</textarea></div>
  </div><div class="msg" id="pm"></div><div class="fa"><button class="btn" type="submit">Save changes</button></div></form></div>
  <div class="panel"><div class="ph"><h3>Change password</h3></div>
  <form id="wf" novalidate><div class="fgrid">
    <div class="fld full"><label for="w0">Current password</label><input id="w0" type="password" autocomplete="current-password" /></div>
    <div class="fld"><label for="w1">New password</label><input id="w1" type="password" autocomplete="new-password" /></div>
    <div class="fld"><label for="w2">Confirm new password</label><input id="w2" type="password" autocomplete="new-password" /></div>
  </div><div class="msg" id="wm"></div><div class="fa"><button class="btn" type="submit">Update password</button></div></form></div>
  <div class="panel"><div class="ph"><h3>Danger zone</h3></div><p style="color:var(--mu);margin-bottom:12px">Deleting your account removes your profile permanently.</p>
  <button class="btn dng" data-act="delete" type="button">Delete my account</button></div>`;
}
const myTickets=()=>SA.J('stackly_tickets',[]).filter(t=>t.userId===me().id).sort((a,b)=>b.ts-a.ts);
function vSupport(){
  const ts=myTickets();
  return `<div class="cols"><div class="panel"><div class="ph"><h3>Contact support</h3></div>
  <form id="tf" novalidate><div class="fgrid"><div class="fld full"><label for="ts">Subject</label><input id="ts" placeholder="e.g. Wrong item delivered" /></div>
  <div class="fld full"><label for="tm">Message</label><textarea id="tm" placeholder="Tell us what happened"></textarea></div></div>
  <div class="msg" id="tmsg"></div><div class="fa"><button class="btn" type="submit">Send message</button></div></form></div>
  <div class="panel"><div class="ph"><h3>My tickets</h3></div>${ts.length?ts.map(t=>`<div class="ocard"><div class="oh"><div><b>${esc(t.subject)}</b><small>${t.id} · ${SA.fmt(t.ts)}</small></div><span class="bdg s-placed">${t.status}</span></div><p style="color:var(--mu);font-size:13.5px;margin-top:8px;word-break:break-word">${esc(t.msg)}</p></div>`).join(''):'<div class="empty"><b>🎧</b><p>No tickets yet.</p></div>'}</div></div>
  <div class="panel faq" style="margin-top:22px"><div class="ph"><h3>Quick answers</h3></div>
  <details><summary>How fast is delivery?</summary><p>Most orders arrive in 25–35 minutes.</p></details>
  <details><summary>Can I cancel my order?</summary><p>Yes, while the status is Placed. Use the Cancel button on the order card.</p></details>
  <details><summary>How do reward points work?</summary><p>You earn 1 point for every ₹10 on delivered orders. Reach 200 points for Silver, 500 for Gold and 1000 for Platinum.</p></details>
  <details><summary>Where is my receipt?</summary><p>Open My Orders and tap Receipt on any order to download it.</p></details></div>`;
}

/* ---------- render / routing ---------- */
function render(){
  if(!TABS[tab])tab='overview';
  $('#ttl').textContent=TABS[tab];
  $$('#navmenu a,#tabbar a').forEach(a=>a.classList.toggle('on',a.dataset.t===tab));
  $('#view').innerHTML=({overview:vOverview,orders:vOrders,profile:vProfile,support:vSupport})[tab]();
  const u=me();$('#uid').textContent='ID: '+u.id;$('#av').textContent=(u.name||'?').trim()[0].toUpperCase();
}
const route=()=>{tab=(location.hash||'#overview').slice(1);closeSide();render();scrollTo(0,0)};
const side=$('#side'),scrim=$('#scrim');
function closeSide(){side.classList.remove('o');scrim.classList.remove('o')}
$('#burger').onclick=()=>{side.classList.add('o');scrim.classList.add('o')};
scrim.onclick=closeSide;
addEventListener('hashchange',route);
addEventListener('resize',()=>{if(innerWidth>900)closeSide()});

/* ---------- actions ---------- */
const setStatus=(id,st)=>{const os=SA.orders(),o=os.find(x=>x.id===id);if(o){o.status=st;SA.saveOrders(os)}};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act,id=b.dataset.id;
  if(a==='logout'){SA.logout();return}
  if(a==='go'){location.hash=id;return}
  if(a==='filter'){filter=id;render();return}
  if(a==='toggle'){open[id]=!open[id];render();return}
  if(a==='cancel'){if(confirm('Cancel order '+id+'?')){setStatus(id,'Cancelled');toast('Order cancelled');render()}return}
  if(a==='reorder'){
    const o=SA.orders().find(x=>x.id===id);if(!o)return;
    const cart=SA.J('stackly_cart',{});
    o.items.forEach(i=>{if(cart[i.n])cart[i.n].q+=i.q;else cart[i.n]={p:i.p,q:i.q,img:img(IMG[i.n]||'1504674900247-0877df9cc836')}});
    SA.S('stackly_cart',cart);toast('Items added to your cart');setTimeout(()=>location.href='menu.html',800);return;
  }
  if(a==='reorderitem'){const cart=SA.J('stackly_cart',{}),p=+b.dataset.p;if(cart[id])cart[id].q++;else cart[id]={p,q:1,img:img(IMG[id]||'1504674900247-0877df9cc836')};SA.S('stackly_cart',cart);toast(id+' added to your cart');return}
  if(a==='receipt'){
    const o=SA.orders().find(x=>x.id===id);if(!o)return;
    const t=['STACKLY – ORDER RECEIPT','Order: '+o.id,'Date: '+new Date(o.ts).toLocaleString('en-IN'),'Customer: '+o.customerName,'Address: '+o.addr,'Payment: '+o.pay,'','Items:']
      .concat(o.items.map(i=>`  ${i.q} x ${i.n}  -  Rs ${i.p*i.q}`)).concat(['','Total paid: Rs '+Math.round(o.total),'Status: '+o.status]).join('\n');
    const url=URL.createObjectURL(new Blob([t],{type:'text/plain'})),a2=document.createElement('a');
    a2.href=url;a2.download='receipt-'+o.id+'.txt';document.body.append(a2);a2.click();a2.remove();setTimeout(()=>URL.revokeObjectURL(url),500);return;
  }
  if(a==='delete'){
    if(!confirm('Delete your account permanently? This cannot be undone.'))return;
    const us=SA.users();delete us[me().email];SA.saveUsers(us);localStorage.removeItem('stackly_user');location.href='signup.html';
  }
});
document.addEventListener('input',e=>{if(e.target.id==='osearch'){q=e.target.value.trim().toLowerCase();$('#olist').innerHTML=orderList()}});
document.addEventListener('submit',e=>{
  e.preventDefault();const id=e.target.id;
  const msg=(sel,t,ok)=>{const m=$(sel);m.textContent=t;m.className='msg'+(ok?' ok':'')};
  if(id==='pf'){
    const name=$('#pn').value.trim(),phone=$('#pp').value.trim(),addr=$('#pa').value.trim();
    if(name.length<2)return msg('#pm','Please enter your name.');
    if(!SA.validPhone(phone))return msg('#pm','Enter a valid 10-digit mobile number.');
    const us=SA.users(),u=us[me().email];u.name=name;u.phone=phone;u.addr=addr;SA.saveUsers(us);
    const s=SA.session();s.name=name;SA.S('stackly_user',s);msg('#pm','Profile saved ✓',true);toast('Profile updated');
    $('#av').textContent=name[0].toUpperCase();
  }else if(id==='wf'){
    const c=$('#w0').value,n=$('#w1').value,n2=$('#w2').value;
    if(c!==me().pw)return msg('#wm','Current password is incorrect.');
    if(n.length<6)return msg('#wm','New password must be at least 6 characters.');
    if(n!==n2)return msg('#wm','Passwords do not match.');
    const us=SA.users();us[me().email].pw=n;SA.saveUsers(us);
    ['#w0','#w1','#w2'].forEach(s=>$(s).value='');msg('#wm','Password updated ✓',true);toast('Password changed');
  }else if(id==='tf'){
    const s=$('#ts').value.trim(),m=$('#tm').value.trim();
    if(s.length<3||m.length<5)return msg('#tmsg','Please add a subject and a short message.');
    const ts=SA.J('stackly_tickets',[]);ts.push({id:'TKT'+Math.floor(1e4+Math.random()*9e4),userId:me().id,subject:s,msg:m,ts:Date.now(),status:'Open'});
    SA.S('stackly_tickets',ts);toast('Message sent to support');render();
  }
});

route();
})();