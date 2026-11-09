// Stackly – login & signup pages
(()=>{
SA.seed();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const page=document.body.dataset.page;
const params=new URLSearchParams(location.search);
// already signed in -> straight to dashboard
const cur=SA.session();
if(cur&&SA.users()[cur.email]){location.replace(SA.home(cur.role));return}

const why=params.get('why');
let role=params.get('role')==='partner'?'partner':'customer';
const NAME={customer:'Customer',partner:'Restaurant Partner'};
const err=$('.err'),form=$('#af'),submit=form.querySelector('button[type=submit]');
const setErr=m=>{err.textContent=m||''};
const setRole=r=>{
  role=r;
  $$('.role').forEach(b=>{const on=b.dataset.role===r;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  setErr('');
  if(page==='login'){submit.textContent='Login as '+NAME[r];const d=$('#demo');if(d)d.textContent='Use demo '+NAME[r].toLowerCase()+' account'}
  else{$$('.ponly').forEach(x=>{x.hidden=r!=='partner';x.querySelectorAll('input').forEach(i=>i.required=r==='partner')});submit.textContent='Create '+NAME[r]+' account'}
};
$$('.role').forEach(b=>b.onclick=()=>setRole(b.dataset.role));
$$('.eye').forEach(b=>b.onclick=()=>{const i=b.parentElement.querySelector('input');const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Hide':'Show'});
setRole(role);

if(page==='login'){
  const note=$('#note');
  if(why){note.hidden=false;note.style.cssText='background:rgba(232,128,108,.12);border-color:rgba(232,128,108,.5);color:#f0a090';note.textContent=why==='nosession'?'Please log in first. If you just logged in and were sent back here, your browser is not keeping the login: allow site data/cookies (not private mode) and open the site over http:// instead of a file.':'Saved account not found. Please log in again.'}
  if(params.get('registered')){note.hidden=false;note.textContent='🎉 Account created successfully! Please log in to continue.';
    const em=params.get('email');if(em)form.email.value=em}
  $('#demo').onclick=()=>{form.email.value=role==='partner'?'partner@stackly.in':'demo@stackly.in';form.pw.value=role==='partner'?'partner123':'demo123';setErr('')};
  form.onsubmit=e=>{
   try{
    e.preventDefault();setErr('');
    const em=form.email.value.trim().toLowerCase(),pw=form.pw.value;
    if(!SA.validEmail(em)){setErr('Enter a valid email address.');return}
    if(!pw){setErr('Enter your password.');return}
    // demo mode: any email + password signs in to the selected dashboard
    const us=SA.users();let u=us[em];
    const pre=role==='partner'?'PTR-':'CUS-';
    if(!u){
      const nm=em.split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())||'User';
      u={id:SA.genId(role,us),role,name:nm,email:em,phone:'',pw,created:Date.now(),addr:''};
      if(role==='partner'){u.restaurant=nm+"'s Kitchen";u.city='';u.hours='10:00 AM – 11:00 PM';u.open=true}
    }else{
      if((u.role||'customer')!==role){u.role=role;if(!String(u.id||'').startsWith(pre))u.id=SA.genId(role,us)}
      if(role==='partner'&&!u.restaurant){u.restaurant=u.name+"'s Kitchen";u.city=u.city||'';u.hours=u.hours||'10:00 AM – 11:00 PM';u.open=u.open!==false}
      u.pw=pw;
    }
    us[em]=u;
    const r=role;
    if(!SA.saveUsers(us)||!SA.login(u)){setErr('Your browser is blocking storage (private mode / blocked cookies). Allow site data and try again.');return}
    submit.disabled=true;submit.textContent='Signing in…';
    location.href=SA.home(r);
   }catch(ex){setErr('Login error: '+ex.message);console.error(ex)}
  };
}else{
  form.onsubmit=e=>{
    e.preventDefault();setErr('');
    const f=form,name=f.elements.fullname.value.trim(),em=f.email.value.trim().toLowerCase(),ph=f.phone.value.trim(),pw=f.pw.value,pw2=f.pw2.value;
    const rest=f.restaurant.value.trim(),city=f.city.value.trim();
    if(name.length<2){setErr('Please enter your full name.');return}
    if(!SA.validEmail(em)){setErr('Enter a valid email address.');return}
    if(!SA.validPhone(ph)){setErr('Enter a valid 10-digit mobile number (starts with 6–9).');return}
    if(role==='partner'&&(!rest||!city)){setErr('Restaurant name and city are required.');return}
    if(pw.length<6){setErr('Password must be at least 6 characters.');return}
    if(pw!==pw2){setErr('Passwords do not match.');return}
    const us=SA.users();
    if(us[em]){setErr('An account with this email already exists. Please log in.');return}
    const u={id:SA.genId(role,us),role,name,email:em,phone:ph,pw,created:Date.now(),addr:''};
    if(role==='partner'){u.restaurant=rest;u.city=city;u.hours='10:00 AM – 11:00 PM';u.open=true}
    us[em]=u;
    if(!SA.saveUsers(us)){setErr('Could not save your account (browser storage is blocked).');return}
    form.querySelectorAll('input,button').forEach(x=>x.disabled=true);
    const ok=$('#ok');ok.hidden=false;ok.innerHTML='✓ Account created! Your ID is <b>'+u.id+'</b>. Redirecting to login…';
    setTimeout(()=>location.href='login.html?registered=1&role='+role+'&email='+encodeURIComponent(em),1500);
  };
}
window.__authReady=true;
})();