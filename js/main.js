// Stackly – interactions & animation (page content lives in the HTML files)
const D=document,$=s=>D.querySelector(s),$$=s=>[...D.querySelectorAll(s)];
D.body.classList.add('pre');
const LOGO='https://wsrv.nl/?url=https://snabsolutions.in/wp-content/uploads/2026/02/stackly-snab-solutions.png&w=280&output=webp&q=85&fit=cover';
const el=(t,a={},h='')=>{const e=D.createElement(t);for(const k in a)/^aria[A-Z]/.test(k)?e.setAttribute(k.replace(/^aria/,'aria-').toLowerCase(),a[k]):e[k]=a[k];e.innerHTML=h;return e};
// injected UI: preloader, progress bar, back-to-top, mobile order bar, hero extras
const pl=el('div',{id:'pl'},`<img alt="Stackly" src="${LOGO}">`),pg=el('div',{id:'pg'}),up=el('button',{id:'up',ariaLabel:'Back to top'},'↑');
D.body.append(pl,pg,up,el('a',{className:'btn mcta',href:'menu.html'},'🛵 Order Now'));
const hero=$('.hero');
if(hero){hero.append(el('div',{className:'bdg'},'<b>4.9 ★</b>2M+ happy orders'),el('div',{className:'scr'}))}
// hero headline: word-by-word reveal
let wi=0;const wrap=n=>[...n.childNodes].forEach(c=>{if(c.nodeType==3){const f=D.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(!t.trim())return f.append(' ');const o=el('span',{className:'wd'}),i=el('span');i.textContent=t;i.style.setProperty('--i',wi++);o.append(i);f.append(o)});c.replaceWith(f)}else if(c.nodeType==1)wrap(c)});
const h1=$('.hero h1');h1&&wrap(h1);
const ready=()=>{pl.classList.add('x');D.body.classList.remove('pre')};
addEventListener('load',()=>setTimeout(ready,500));setTimeout(ready,3500);
// nav
const nav=$('#n'),hd=$('#h'),bg=$('#bg');
const navSet=o=>{nav.classList.toggle('o',o);bg.classList.toggle('o',o);D.body.classList.toggle('navlock',o);bg.setAttribute('aria-expanded',o)};
bg.onclick=e=>{e.stopPropagation();navSet(!nav.classList.contains('o'))};
$$('#n a').forEach(a=>a.onclick=()=>navSet(false));
D.addEventListener('click',e=>{if(nav.classList.contains('o')&&!nav.contains(e.target))navSet(false)});
addEventListener('keydown',e=>e.key=='Escape'&&navSet(false));
addEventListener('resize',()=>{if(innerWidth>820)navSet(false)});
// scroll: progress, header hide/show, parallax, back-to-top
const him=$('.hero>img');let ly=0,tk=false;
const onS=()=>{const y=scrollY,m=D.documentElement.scrollHeight-innerHeight;
pg.style.transform=`scaleX(${m>0?y/m:0})`;hd.classList.toggle('s',y>40);
ly=y;
up.classList.toggle('v',y>700);if(him&&y<innerHeight*1.2)him.style.translate=`0 ${y*.22}px`;tk=false};
addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(onS)}},{passive:true});onS();
up.onclick=()=>scrollTo({top:0,behavior:'smooth'});
// reveal, stagger, counters
$$('.rv .g').forEach(g=>[...g.children].forEach((c,i)=>c.style.setProperty('--i',i%6)));
$$('.st').forEach((c,i)=>c.style.setProperty('--i',i));
const count=c=>{const t=+c.dataset.c,f=t%1?1:0;let s=null;const st=ts=>{s=s||ts;const p=Math.min((ts-s)/1800,1),e=1-Math.pow(1-p,3);c.textContent=(t*e).toFixed(f);p<1&&requestAnimationFrame(st)};requestAnimationFrame(st)};
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');x.target.querySelectorAll('[data-c]').forEach(count);io.unobserve(x.target)}}),{threshold:.12});
$$('.rv').forEach(e=>io.observe(e));
// cards: 3D tilt + cursor glow (mouse only)
$$('.card').forEach(c=>{c.addEventListener('pointermove',e=>{if(e.pointerType!='mouse')return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');
c.style.transform=`perspective(900px) rotateX(${(.5-y)*6}deg) rotateY(${(x-.5)*8}deg) translateY(-8px)`});
c.addEventListener('pointerleave',()=>c.style.removeProperty('transform'))});
// magnetic buttons
$$('.hero .btn,.cta .btn').forEach(b=>{b.addEventListener('pointermove',e=>{if(e.pointerType!='mouse')return;const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.3}px)`});b.addEventListener('pointerleave',()=>b.style.removeProperty('transform'))});
// hide broken images gracefully
$$('img').forEach(i=>i.addEventListener('error',()=>{i.style.visibility='hidden'}));

// ===== CART (persists in localStorage) =====
(()=>{
const K='stackly_cart',TH=u=>(u||'').replace(/&w=\d+/,'&w=160').replace(/&q=\d+/,'&q=60'),R=n=>'₹'+Math.round(n).toLocaleString('en-IN'),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cart={},cp=false,view='cart',last=null;
try{cart=JSON.parse(localStorage.getItem(K))||{}}catch(e){}
cart=Object.fromEntries(Object.entries(cart&&typeof cart=='object'&&!Array.isArray(cart)?cart:{}).filter(([k,i])=>i&&typeof i=='object'&&+i.p>0&&+i.q>0));
const save=()=>{try{localStorage.setItem(K,JSON.stringify(cart))}catch(e){}};
const btn=el('button',{className:'cartbtn',ariaLabel:'Open cart'},'🛒<span>0</span>'),co=el('div',{id:'co'}),cd=el('aside',{id:'cd',ariaLabel:'Your cart'}),ts=el('div',{id:'tst'});
$('.nav').insertBefore(btn,$('#bg'));D.body.append(co,cd,ts);
const tot=()=>{const sub=Object.values(cart).reduce((a,i)=>a+i.p*i.q,0),d=cp?Math.min(sub*.4,150):0,fee=sub&&sub-d<499?40:0,g=(sub-d)*.05;return{sub,d,fee,g,t:sub-d+fee+g,n:Object.values(cart).reduce((a,i)=>a+i.q,0)}};
const toast=m=>{ts.textContent=m;ts.classList.add('v');clearTimeout(toast.t);toast.t=setTimeout(()=>ts.classList.remove('v'),1800)};
const open=v=>{if(v)view=v;draw();co.classList.add('o');cd.classList.add('o');D.body.classList.add('lock')};
const close=()=>{co.classList.remove('o');cd.classList.remove('o');D.body.classList.remove('lock')};
const badge=b=>{const t=tot();btn.querySelector('span').textContent=t.n;btn.classList.toggle('has',t.n>0);if(b){btn.classList.remove('bump');void btn.offsetWidth;btn.classList.add('bump')}};
function draw(){const t=tot(),it=Object.entries(cart);let h='';
if(view=='done'){cd.innerHTML=`<div class="cd-h"><h3>Order Placed</h3><button class="cd-x" data-a="close">×</button></div><div class="cd-b"><div class="ok"><b>✓</b><h3>Thank you, ${esc(last.name)}!</h3><p>Order <strong style="color:var(--gold)">${last.id}</strong> is being prepared.</p><p>Total paid: <strong>${R(last.t)}</strong> · Arrives in 25–35 min</p><p>Delivering to: ${esc(last.addr)}</p></div></div><div class="cd-f"><button class="btn" data-a="close">Continue Browsing</button></div>`;return}
if(!it.length){cd.innerHTML=`<div class="cd-h"><h3>Your Cart</h3><button class="cd-x" data-a="close">×</button></div><div class="cd-b"><div class="emp"><b>🛒</b><p>Your cart is empty.<br>Add something delicious!</p></div></div><div class="cd-f"><a class="btn" href="menu.html">Browse Menu</a></div>`;return}
const sum=`<div class="ln"><span>Subtotal</span><span>${R(t.sub)}</span></div>${t.d?`<div class="ln" style="color:var(--gold)"><span>Coupon STACKLY40</span><span>−${R(t.d)}</span></div>`:''}<div class="ln"><span>Delivery</span><span>${t.fee?R(t.fee):'Free'}</span></div><div class="ln"><span>GST (5%)</span><span>${R(t.g)}</span></div><div class="ln t"><span>Total</span><b>${R(t.t)}</b></div>`;
if(view=='checkout'){cd.innerHTML=`<div class="cd-h"><h3>Checkout</h3><button class="cd-x" data-a="close">×</button></div><div class="cd-b"><form id="cf"><input name="name" required placeholder="Full name" autocomplete="name"><input name="phone" required pattern="[6-9][0-9]{9}" maxlength="10" title="Enter a 10-digit mobile number starting with 6-9" placeholder="Phone number" inputmode="tel" autocomplete="tel"><textarea name="addr" required placeholder="Delivery address" autocomplete="street-address"></textarea><select name="pay" style="padding:14px 20px;border-radius:14px;border:1px solid #3a342d;background:var(--card);color:var(--tx);font:inherit"><option>UPI</option><option>Card</option><option>Cash on delivery</option></select></form></div><div class="cd-f">${sum}<button class="btn" form="cf" type="submit">Place Order · ${R(t.t)}</button><p class="ln" style="justify-content:center;margin:12px 0 0"><a href="#" data-a="back" style="color:var(--gold)">← Back to cart</a></p></div>`;return}
cd.innerHTML=`<div class="cd-h"><h3>Your Cart (${t.n})</h3><button class="cd-x" data-a="close">×</button></div><div class="cd-b">${it.map(([k,i])=>`<div class="ci"><img alt="${esc(k)}" width="70" height="70" src="${esc(TH(i.img))}"><div><h4>${esc(k)}</h4><small>${R(i.p)} each</small><div class="qty"><button data-a="m" data-k="${esc(k)}">−</button><b>${i.q}</b><button data-a="p" data-k="${esc(k)}">+</button></div></div><div class="rt"><button class="rm" data-a="r" data-k="${esc(k)}" aria-label="Remove">🗑</button><strong>${R(i.p*i.q)}</strong></div></div>`).join('')}</div><div class="cd-f"><div class="cpn"><input id="cc" placeholder="Coupon code" value="${cp?'STACKLY40':''}"><button class="btn o" data-a="c">${cp?'Applied':'Apply'}</button></div>${t.sub-t.d<499?`<p class="ln" style="color:var(--gold)">Add ${R(499-t.sub+t.d)} more for free delivery</p>`:''}${sum}<button class="btn" data-a="go">Proceed to Checkout</button></div>`}
cd.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.preventDefault();const a=b.dataset.a,k=b.dataset.k;
if(a=='close')close();else if(a=='p')cart[k].q++;else if(a=='m'){if(--cart[k].q<1)delete cart[k]}else if(a=='r')delete cart[k];
else if(a=='go')view='checkout';else if(a=='back')view='cart';
else if(a=='c'){const v=$('#cc').value.trim().toUpperCase();if(v=='STACKLY40'){cp=true;toast('Coupon applied – 40% off (max ₹150)')}else toast('Invalid coupon code')}
save();badge();draw()});
cd.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),t=tot();last={id:'STK'+Math.floor(1e5+Math.random()*9e5),name:f.get('name').split(' ')[0],addr:f.get('addr'),t:t.t};cart={};cp=false;save();badge();view='done';draw()});
co.onclick=close;btn.onclick=()=>open('cart');addEventListener('keydown',e=>e.key=='Escape'&&close());
D.addEventListener('click',e=>{const b=e.target.closest('.add');if(!b)return;const c=b.closest('.card'),h=c&&c.querySelector('h3'),pe=c&&c.querySelector('.pr span');if(!h||!pe)return;
const n=h.textContent.trim(),p=parseInt(pe.textContent.replace(/\D/g,''),10),im=c.querySelector('img');if(!n||!p)return;
cart[n]?cart[n].q++:cart[n]={p,q:1,img:im?im.src:''};save();badge(true);toast('✓ '+n+' added to cart');
b.textContent='Added ✓';setTimeout(()=>b.textContent='Add',1200)});
badge();
})();
// Login: header button and drawer item are plain links to login.html (no popup).