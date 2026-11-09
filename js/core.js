// Stackly – shared auth/storage helpers (demo: localStorage only, no backend)
(()=>{
const J=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const users=()=>J('stackly_users',{});
const saveUsers=u=>S('stackly_users',u);
const session=()=>J('stackly_user',null);
const home=r=>r==='partner'?'partner-dashboard.html':'customer-dashboard.html';
const genId=(role,us)=>{let id;do{id=(role==='partner'?'PTR-':'CUS-')+Math.floor(10000+Math.random()*90000)}while(Object.values(us).some(u=>u.id===id));return id};
const fmt=ts=>new Date(ts).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const validPhone=p=>/^[6-9][0-9]{9}$/.test(p);
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

// demo accounts + upgrade of older accounts (created before roles/ids existed)
function seed(){
  const us=users();let ch=false;
  if(!us['demo@stackly.in']){us['demo@stackly.in']={id:'CUS-10001',role:'customer',name:'Demo Customer',email:'demo@stackly.in',phone:'9876543210',pw:'demo123',addr:'12 MG Road, Bengaluru',created:Date.now()};ch=true}
  if(!us['partner@stackly.in']){us['partner@stackly.in']={id:'PTR-20001',role:'partner',name:'Demo Owner',email:'partner@stackly.in',phone:'9123456780',pw:'partner123',restaurant:'The Gilded Fork',city:'Bengaluru',addr:'45 Indiranagar, Bengaluru',hours:'10:00 AM – 11:00 PM',open:true,created:Date.now()};ch=true}
  Object.keys(us).forEach(k=>{const u=us[k];if(!u.role){u.role='customer';ch=true}if(!u.id){u.id=genId(u.role,us);ch=true}if(!u.email){u.email=k;ch=true}});
  if(ch)saveUsers(us);
}

function toast(m){let t=document.getElementById('tst');if(!t){t=document.createElement('div');t.id='tst';document.body.append(t)}
  t.textContent=m;t.classList.add('v');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('v'),2200)}
function modal(h){let m=document.getElementById('mdl');if(!m){m=document.createElement('div');m.id='mdl';m.onclick=e=>{if(e.target===m)closeModal()};document.body.append(m)}
  m.innerHTML='<div class="mbox" role="dialog" aria-modal="true">'+h+'</div>';m.classList.add('o');document.body.classList.add('lock')}
function closeModal(){const m=document.getElementById('mdl');if(m)m.classList.remove('o');document.body.classList.remove('lock')}
addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

window.SA={J,S,esc,R,users,saveUsers,session,home,genId,fmt,validPhone,validEmail,seed,toast,modal,closeModal,
  orders:()=>J('stackly_orders',[]),saveOrders:o=>S('stackly_orders',o),
  login(u){return S('stackly_user',{id:u.id,name:u.name,email:u.email,role:u.role})},
  logout(){localStorage.removeItem('stackly_user');location.href='login.html'},
  guard(role){
    const s=session();
    if(!s||!s.email){location.replace('login.html?why=nosession');return null}
    const us=users();let u=us[s.email];
    if(!u){
      // no stored account needed: rebuild it from the login session
      const r=s.role==='partner'?'partner':'customer';
      const nm=s.name||String(s.email).split('@')[0]||'User';
      u={id:s.id||genId(r,us),role:r,name:nm,email:s.email,phone:'',pw:'',addr:'',created:Date.now()};
      if(r==='partner'){u.restaurant=nm+"'s Kitchen";u.city='';u.hours='10:00 AM – 11:00 PM';u.open=true}
      us[s.email]=u;saveUsers(us);
    }
    if(!u.id){u.id=genId(u.role||'customer',us);us[s.email]=u;saveUsers(us)}
    if((u.role||'customer')!==role){location.replace(home(u.role||'customer'));return null}
    return u;
  }
};
})();