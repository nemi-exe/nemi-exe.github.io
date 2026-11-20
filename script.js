const LEAF='<svg class="leaf logo" viewBox="0 0 64 64"><path d="M30 56C10 50 6 30 12 12c20 0 30 14 18 44z" fill="currentColor" opacity=".6"/><path d="M34 56C32 34 40 12 56 6c6 22-4 42-22 50z" fill="currentColor"/></svg>';
const ICON={home:'<path d="M3 11l9-8 9 8v10H3z"/>',academics:'<path d="M4 5h7v14H4zM13 5h7v14h-7z"/>',wellness:'<path d="M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z"/>',money:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 10h6"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};

/* ---------- Supabase (database + login) ---------- */
const sb=supabase.createClient(HAYATI.SUPABASE_URL,HAYATI.SUPABASE_ANON_KEY);
let RECOVERY=false,READY=false;
sb.auth.onAuthStateChange((ev)=>{if(ev==='PASSWORD_RECOVERY'){RECOVERY=true;if(READY)setTimeout(newPassword,0)}});
function newPassword(){RECOVERY=false;
  modal('Set a new password','Type the new password you want to use.',
    [{k:'p1',label:'New password',type:'password',ph:'at least 6 characters'},{k:'p2',label:'Confirm new password',type:'password',ph:'type it again'}],
    async v=>{
      if(v.p1.length<6)return 'Use a password with at least 6 characters.';
      if(v.p1!==v.p2)return 'Passwords don’t match.';
      const{error}=await sb.auth.updateUser({password:v.p1});
      if(error)return error.message;
      history.replaceState(null,'',location.pathname);
      setTimeout(()=>alertBox('Password updated','You can use your new password the next time you log in.'),0);
    },'Update password')}
const COLS={tasks:['name','code','desc','due','done'],classes:['code','day','start','end','room','inst'],water:['ml','date','time'],sleep:['bed','wake'],routines:['name','when','doneOn'],tx:['type','cat','amt','date']};
const pick=(s,o)=>Object.fromEntries(COLS[s].filter(c=>c in o).map(c=>[c,o[c]]));
const ok=({data,error})=>{if(error)throw new Error(error.message);return data};
const DB={
  all:async s=>ok(await sb.from(s).select('*').order('id')),
  get:async(s,id)=>ok(await sb.from(s).select('*').eq('id',id).single()),
  put:async(s,o)=>o.id?ok(await sb.from(s).update(pick(s,o)).eq('id',o.id).select().single()):ok(await sb.from(s).insert(pick(s,o)).select().single()),
  del:async(s,id)=>ok(await sb.from(s).delete().eq('id',id))
};
const userOf=u=>({email:u.email,name:(u.user_metadata&&u.user_metadata.name)||''});

/* ---------- Helpers ---------- */
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0'),iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,today=()=>iso(new Date());
const fmt=s=>new Date(s+'T00:00').toLocaleDateString('en',{month:'short',day:'numeric'});
const peso=n=>'₱'+Number(n).toLocaleString();
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const mine=s=>DB.all(s);
const S={user:null,view:'login',tab:'home',sub:{academics:'tasks',wellness:'water',money:'bal'},slide:0,showDone:false};

/* ---------- Modal ---------- */
function modal(title,desc,fields,save,okLabel='Save'){
  const o=document.createElement('div');o.className='ov';
  const inp=f=>f.opts?`<select class="in" id="m_${f.k}">${f.opts.map(v=>`<option>${esc(v)}</option>`).join('')}</select>`
    :`<input class="in" id="m_${f.k}" type="${f.type||'text'}" placeholder="${esc(f.ph||'')}" value="${esc(f.val||'')}">`;
  o.innerHTML=`<div class="md" role="dialog" aria-label="${esc(title)}"><h3>${esc(title)}</h3><p class="mut">${esc(desc)}</p>
  ${fields.map(f=>`<div class="f">${esc(f.label)}</div>${inp(f)}`).join('')}<div class="err"></div>
  <div class="acts">${save?'<button class="btn o s" data-x>Cancel</button>':''}<button class="btn s" data-ok>${okLabel}</button></div></div>`;
  o.onclick=async e=>{
    if(e.target===o||e.target.hasAttribute('data-x'))return o.remove();
    if(!e.target.hasAttribute('data-ok'))return;
    if(!save)return o.remove();
    const v={};for(const f of fields){const el=$('#m_'+f.k);v[f.k]=f.type==='password'?el.value:el.value.trim()}
    if(fields.some(f=>!v[f.k]))return o.querySelector('.err').textContent='Fill in every field.';
    const msg=await save(v);
    if(msg)o.querySelector('.err').textContent=msg;else{o.remove();render()}
  };
  app.append(o);const f=o.querySelector('input,select');f&&f.focus();
}
const alertBox=(t,m)=>modal(t,m,[],null,'Okay');
const add=(store_,extra)=>async v=>{await DB.put(store_,{...v,...(extra||{})})};

/* ---------- Views ---------- */
const pw=(id,label,ph)=>`<div class="f">${label} *</div><div class="pw"><input class="in" id="${id}" type="password" placeholder="${ph}" autocomplete="off"><button type="button" data-a="eye" data-t="${id}" aria-label="Show password">👁</button></div>`;
const authView=()=>S.view==='login'?`<div class="auth c" style="text-align:left">${LEAF}<h1 class="c">Project Hayati</h1>
<p class="c mut" style="margin:6px 0 24px">Welcome back!<br>Log in to continue.</p>
<div class="f">Email *</div><input class="in" id="em" type="email" placeholder="name@example.com">${pw('pw','Password','Enter your password')}
<div class="err" id="er"></div><button class="btn" data-a="login" style="margin-top:8px">Log in</button>
<p class="c" style="margin:14px"><a href="#" data-a="forgot" style="color:inherit">Forgot password?</a></p>
<p class="c mut">OR</p><button class="btn o" data-a="view" data-t="signup" style="margin-top:12px">Create an account</button></div>`
:`<div class="auth"><h1 class="c">Create Account</h1>
<div class="f">Name *</div><input class="in" id="nm" placeholder="Enter your name">
<div class="f">Gmail *</div><input class="in" id="em" type="email" placeholder="name@example.com">
${pw('pw','Password','At least 6 characters')}${pw('pw2','Confirm password','Re-enter your password')}
<div class="err" id="er"></div><button class="btn" data-a="signup">Sign up</button>
<p class="c" style="margin-top:16px">Already have an account? <a href="#" data-a="view" data-t="login" style="color:inherit;font-weight:700">Log in</a></p></div>`;

const SL=[['Study, Save, Stay Well','One place for your classes, your money and your health.'],['Stay on top of school','Add tasks and a weekly class schedule, then see what’s due.'],['Look after yourself','Track water, sleep and daily routines, and watch your budget.']];
const onbView=()=>`<div class="sl">${LEAF}<h1>${SL[S.slide][0]}</h1><p class="mut">${SL[S.slide][1]}</p></div>
<div class="dots">${SL.map((_,i)=>`<i class="${i===S.slide?'on':''}"></i>`).join('')}</div><div style="padding:0 28px 28px"><button class="btn" data-a="next">${S.slide<2?'Next':'Get started'}</button></div>`;

async function home(){
  const [tk,cl,wt,sl,rt,tx]=await Promise.all(['tasks','classes','water','sleep','routines','tx'].map(mine));
  const done=tk.filter(t=>t.done).length,p=tk.length?Math.round(done/tk.length*100):0;
  const td=DAYS[new Date().getDay()],cls=cl.filter(c=>c.day===td).sort((a,b)=>a.start.localeCompare(b.start));
  const up=tk.filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);
  const ml=wt.filter(w=>w.date===today()).reduce((a,w)=>a+w.ml,0),rd=rt.filter(r=>r.doneOn===today()).length;
  const ls=sl.sort((a,b)=>b.wake.localeCompare(a.wake))[0];
  return`<div class="scroll home"><div style="padding:18px 0 4px"><span class="pill">${new Date().toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'})}</span><h1 class="hello">Welcome, <i>${esc(S.user.name.split(' ')[0])}</i>!</h1><p class="mut">Here’s your overview today.</p></div>
<div class="grid"><div class="card"><b style="font-size:20px">Tasks</b><p style="font-size:12px;margin-top:6px">Completed ${p}%</p><div class="bar"><i style="width:${p}%"></i></div><p style="font-size:12px">Pending ${tk.length?100-p:0}%</p><div class="bar"><i style="width:${tk.length?100-p:0}%"></i></div></div>
<div class="card"><b style="font-size:20px">Balance</b><p style="font-size:26px;font-weight:800;margin-top:8px">${peso(bal(tx))}</p></div></div>
<div class="card" style="margin-bottom:12px"><b style="font-size:20px">Today’s Class</b>${cls.map(c=>`<p style="font-size:13px;margin-top:6px">${c.start} - ${c.end} &nbsp; ${esc(c.code)}</p>`).join('')||'<p style="font-size:13px;margin-top:6px">No classes today.</p>'}</div>
<div class="card" style="margin-bottom:12px"><b style="font-size:20px">Upcoming Deadlines</b>${up.map(t=>`<p style="font-size:13px;margin-top:6px">${esc(t.code)}: ${esc(t.name)} · ${fmt(t.due)}</p>`).join('')||'<p style="font-size:13px;margin-top:6px">Nothing due. Add a task in Academics.</p>'}</div>
<div class="card"><b style="font-size:20px">Wellness Today</b><p style="font-size:13px;margin-top:6px">Water: ${ml.toLocaleString()}mL/2,000mL</p><p style="font-size:13px">Routine: ${rd}/${rt.length}</p><p style="font-size:13px">Last sleep: ${ls?dur(ls):'not logged'}</p></div></div>`;
}
const bal=tx=>{const m=today().slice(0,7);return tx.filter(t=>t.date.startsWith(m)).reduce((a,t)=>a+(t.type==='inc'?t.amt:-t.amt),0)};
const dur=s=>{const m=Math.round((new Date(s.wake)-new Date(s.bed))/6e4);return`${Math.floor(m/60)}h ${pad(m%60)}m`};
const subTabs=(key,items,plus)=>`<div class="tabs">${items.map(([k,l])=>`<button class="${S.sub[key]===k?'on':''}" data-a="sub" data-k="${key}" data-t="${k}">${l}</button>`).join('')}${plus?`<button class="plus" data-a="${plus}" aria-label="Add">⊕</button>`:''}</div>`;

async function academics(){
  const t=S.sub.academics;let body='';
  if(t==='tasks'){
    const tk=await mine('tasks'),open=tk.filter(x=>!x.done).sort((a,b)=>a.due.localeCompare(b.due)),td=today();
    const item=x=>`<div class="row"><input class="ck" type="checkbox" data-a="chk" data-id="${x.id}" ${x.done?'checked':''}><b>${esc(x.code)}: ${esc(x.name)}<br><span class="mut">${esc(x.desc)} · ${fmt(x.due)}${x.due<td&&!x.done?' (overdue)':''}</span></b><button class="x" data-a="del" data-s="tasks" data-id="${x.id}" aria-label="Delete">×</button></div>`;
    const a=open.filter(x=>x.due<=td),b=open.filter(x=>x.due>td),dn=tk.filter(x=>x.done);
    body=`<h2>Today (${a.length})</h2>${a.map(item).join('')||'<p class="mut">Nothing due today.</p>'}<h2>Future (${b.length})</h2>${b.map(item).join('')||'<p class="mut">No upcoming tasks.</p>'}
    <p class="c" style="margin-top:20px"><a href="#" data-a="done" style="color:inherit;font-size:13px">${S.showDone?'Hide':'View all'} completed tasks (${dn.length})</a></p>${S.showDone?dn.map(item).join(''):''}`;
  }else{
    const cl=await mine('classes');
    body=DAYS.map(d=>[d,cl.filter(c=>c.day===d).sort((a,b)=>a.start.localeCompare(b.start))]).filter(x=>x[1].length).map(([d,l])=>`<h2>${d}</h2>${l.map(c=>`<div class="card" style="margin-bottom:8px;font-size:13px;position:relative"><button class="x" style="position:absolute;right:12px;top:8px;color:#aaa" data-a="del" data-s="classes" data-id="${c.id}" aria-label="Delete">×</button>${c.start} - ${c.end}<br><b>Subject:</b> ${esc(c.code)}<br><b>Room:</b> ${esc(c.room)}<br><b>Instructor:</b> ${esc(c.inst)}</div>`).join('')}`).join('')||'<p class="mut c" style="margin-top:30px">No classes yet. Tap ⊕ to add one.</p>';
  }
  return`<div class="hd">Academics</div><div class="scroll">${subTabs('academics',[['tasks','Tasks'],['sched','Class Schedule']],t==='tasks'?'addTask':'addClass')}${body}</div>`;
}

async function wellness(){
  const t=S.sub.wellness;let body='';
  if(t==='water'){
    const w=(await mine('water')).filter(x=>x.date===today()),ml=w.reduce((a,x)=>a+x.ml,0),p=Math.min(100,Math.round(ml/20));
    body=`<h2 class="c">Today’s Intake</h2><p class="c mut">${ml.toLocaleString()}mL of 2,000mL</p><div class="ring" style="background:conic-gradient(var(--fg) ${p}%,var(--line) 0)"><span>${p}%</span></div>
    <div class="chips">${[150,250,500].map(n=>`<button class="btn s" data-a="water" data-n="${n}">+${n}mL</button>`).join('')}</div>
    <h2>Today’s Intake</h2>${w.map(x=>`<div class="row"><b>${x.ml}mL</b><span class="mut">${x.time}</span><button class="x" data-a="del" data-s="water" data-id="${x.id}" aria-label="Delete">×</button></div>`).join('')||'<p class="mut">No water logged yet.</p>'}`;
  }else if(t==='sleep'){
    const sl=(await mine('sleep')).sort((a,b)=>b.wake.localeCompare(a.wake)),l=sl[0];
    body=`<h2 class="c">Last Sleep Record</h2>${l?`<div class="big" style="font-size:26px;border-radius:14px">${dur(l)}<div style="font-size:12px;font-weight:500">${l.bed.slice(11)} – ${l.wake.slice(11)}</div></div>`:'<p class="c mut">No sleep logged yet.</p>'}
    <p class="c"><button class="btn s" data-a="addSleep">Log Sleep</button></p><h2>Sleep History</h2>${sl.map(s=>`<div class="row"><b>${fmt(s.wake.slice(0,10))}<br><span class="mut">${s.bed.slice(11)} – ${s.wake.slice(11)}</span></b><span>${dur(s)}</span><button class="x" data-a="del" data-s="sleep" data-id="${s.id}" aria-label="Delete">×</button></div>`).join('')}`;
  }else{
    const r=await mine('routines'),n=r.filter(x=>x.doneOn===today()).length,p=r.length?Math.round(n/r.length*100):0;
    body=`<h2 class="c">Today’s Progress</h2><p class="c mut"><b>${n}</b> out of <b>${r.length}</b> completed</p><div class="bar" style="background:var(--line);height:20px;border-radius:10px;margin:10px 20px"><i style="width:${p}%;background:var(--fg);color:var(--bg);font-size:11px;padding-left:8px">${p}%</i></div>
    ${['Morning','Afternoon','Evening'].map(d=>`<h2>${d}</h2>${r.filter(x=>x.when===d).map(x=>`<div class="row"><input class="ck" type="checkbox" data-a="rchk" data-id="${x.id}" ${x.doneOn===today()?'checked':''}><b>${esc(x.name)}</b><button class="x" data-a="del" data-s="routines" data-id="${x.id}" aria-label="Delete">×</button></div>`).join('')||'<p class="mut">Nothing yet.</p>'}`).join('')}
    <p class="c" style="margin-top:16px"><button class="btn s" data-a="addRoutine">Add Routine</button></p>`;
  }
  return`<div class="hd">Wellness</div><div class="scroll">${subTabs('wellness',[['water','Water Intake'],['sleep','Sleep Tracker'],['routine','Routines']])}${body}</div>`;
}

async function money(){
  const t=S.sub.money,tx=await mine('tx'),m=today().slice(0,7),mon=new Date().toLocaleDateString('en',{month:'long'});let body='';
  const line=x=>`<div class="row"><b>${esc(x.cat)}</b><span>${x.type==='inc'?'+':'-'} ${x.amt.toLocaleString()}</span><button class="x" data-a="del" data-s="tx" data-id="${x.id}" aria-label="Delete">×</button></div>`;
  const cur=tx.filter(x=>x.date.startsWith(m)).sort((a,b)=>b.date.localeCompare(a.date));
  if(t==='bal')body=`<h2 class="c" style="margin-bottom:0">Total Balance this Month</h2><p class="c mut">${mon}</p><div class="big">${peso(bal(tx))}</div><p class="c"><button class="btn s" data-a="addInc">Add</button></p><h2>Income History</h2>${cur.filter(x=>x.type==='inc').map(line).join('')||'<p class="mut">No income yet.</p>'}`;
  else if(t==='exp')body=`<h2 class="c" style="margin-bottom:0">Total Expense this Month</h2><p class="c mut">${mon}</p><div class="big">${peso(cur.filter(x=>x.type==='exp').reduce((a,x)=>a+x.amt,0))}</div><p class="c"><button class="btn s" data-a="addExp">Add</button></p><h2>Recent Expenses</h2>${cur.filter(x=>x.type==='exp').map(line).join('')||'<p class="mut">No expenses yet.</p>'}`;
  else{const days=[...new Set(tx.map(x=>x.date))].sort().reverse();body=`<h2 class="c">Transaction History</h2>${days.map(d=>`<p style="font-weight:800;margin-top:14px">${fmt(d)}</p>${tx.filter(x=>x.date===d).map(line).join('')}`).join('')||'<p class="mut c">No transactions yet.</p>'}`}
  return`<div class="hd">Money</div><div class="scroll">${subTabs('money',[['bal','Balance'],['exp','Expense'],['hist','History']])}${body}</div>`;
}
const more=()=>`<div class="hd">More</div><div class="scroll"><div style="font-size:19px">${['account|Account','about|About Hayati','logout|Log Out'].map(s=>{const[a,l]=s.split('|');return`<div class="row" style="padding:14px 0"><a href="#" data-a="${a}" style="color:inherit;text-decoration:none;flex:1">${l}</a></div>`}).join('')}</div><div style="margin-top:80px">${LEAF}<h1 class="c">Hayati</h1></div></div>`;

/* ---------- Render ---------- */
async function render(){
  if(!S.user){app.innerHTML=authView();return}
  if(S.view==='onb'){app.innerHTML=onbView();return}
  const v=await({home,academics,wellness,money,more}[S.tab])();
  app.innerHTML=(S.tab==='home'?'':'')+v.replace(/^<div class="scroll">/,'<div class="scroll">')+`<nav class="nav">${Object.keys(ICON).map(k=>`<button class="${S.tab===k?'on':''}" data-a="tab" data-t="${k}"><svg viewBox="0 0 24 24">${ICON[k]}</svg>${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</nav>`;
}

/* ---------- Actions ---------- */
const A={
  view:e=>{S.view=e.t;render()},
  eye:e=>{const i=$('#'+e.t);i.type=i.type==='password'?'text':'password'},
  forgot:()=>modal('Forgot password?','Enter your email and we’ll send you a link to set a new password.',
    [{k:'email',label:'Email',type:'email',ph:'name@example.com',val:($('#em')&&$('#em').value.trim())||''}],
    async v=>{
      if(!/^\S+@\S+\.\S+$/.test(v.email))return 'Enter a valid email, like name@example.com.';
      const{error}=await sb.auth.resetPasswordForEmail(v.email.toLowerCase(),{redirectTo:location.origin+location.pathname});
      if(error)return error.message;
      setTimeout(()=>alertBox('Check your email','If that email has an account, a reset link is on its way. Open the link in this browser.'),0);
    },'Send link'),
  async login(){const em=$('#em').value.trim().toLowerCase();
    const{data,error}=await sb.auth.signInWithPassword({email:em,password:$('#pw').value});
    if(error)return alertBox('Login failed',error.message);
    S.user=userOf(data.user);S.tab='home';S.view='app';render()},
  async signup(){const n=$('#nm').value.trim(),em=$('#em').value.trim().toLowerCase(),p=$('#pw').value,er=$('#er');
    if(!n||!em||!p)return er.textContent='Fill in every field.';
    if(!/^\S+@\S+\.\S+$/.test(em))return er.textContent='Enter a valid email, like name@example.com.';
    if(p.length<6)return er.textContent='Use a password with at least 6 characters.';
    if(p!==$('#pw2').value)return er.textContent='Passwords don’t match.';
    const{data,error}=await sb.auth.signUp({email:em,password:p,options:{data:{name:n}}});
    if(error)return er.textContent=error.message;
    if(!data.session)return er.textContent='Check your email to confirm your account, then log in.';
    S.user=userOf(data.user);S.view='onb';S.slide=0;render()},
  next:()=>{if(S.slide<2)S.slide++;else S.view='app';render()},
  tab:e=>{S.tab=e.t;render()},
  sub:e=>{S.sub[e.k]=e.t;render()},
  done:()=>{S.showDone=!S.showDone;render()},
  async chk(e,el){const r=await DB.get('tasks',+e.id);r.done=el.checked;await DB.put('tasks',r);render()},
  async rchk(e,el){const r=await DB.get('routines',+e.id);r.doneOn=el.checked?today():'';await DB.put('routines',r);render()},
  async del(e){await DB.del(e.s,+e.id);render()},
  async water(e){await DB.put('water',{ml:+e.n,date:today(),time:new Date().toTimeString().slice(0,5)});render()},
  addTask:()=>modal('New Task','Add the following information below for your new task.',[{k:'name',label:'Name',ph:'name of the task'},{k:'code',label:'Course Code',ph:'input the course code'},{k:'desc',label:'Description',ph:'what is the task about?'},{k:'due',label:'Deadline',type:'date',val:today()}],add('tasks',{done:false})),
  addClass:()=>modal('New Class Schedule','Add the following information below for your new class schedule.',[{k:'code',label:'Course Code',ph:'code of the course/subject'},{k:'day',label:'Day of the Week',opts:DAYS.slice(1).concat(DAYS[0])},{k:'start',label:'Start Time',type:'time'},{k:'end',label:'End Time',type:'time'},{k:'room',label:'Room Assigned',ph:'building & room number'},{k:'inst',label:'Instructor',ph:'name of the instructor'}],async v=>{if(v.end<=v.start)return'End time must be after start time.';await add('classes')(v)}),
  addSleep:()=>{const y=new Date(Date.now()-864e5);modal('Sleep Log','Input the following information below.',[{k:'bt',label:'Bedtime',type:'time',val:'22:30'},{k:'bd',label:'Bedtime date',type:'date',val:iso(y)},{k:'wt',label:'Wake-Up Time',type:'time',val:'06:00'},{k:'wd',label:'Wake-Up date',type:'date',val:today()}],async v=>{const bed=`${v.bd}T${v.bt}`,wake=`${v.wd}T${v.wt}`;if(wake<=bed)return'Wake-up must be after bedtime.';await add('sleep')({bed,wake})})},
  addRoutine:()=>modal('New Routine','Input the following information below.',[{k:'name',label:'Routine',ph:'name of the new routine'},{k:'when',label:'Time of Day',opts:['Morning','Afternoon','Evening']}],add('routines',{doneOn:''})),
  addInc:()=>modal('Add Income','Add the following information below.',[{k:'cat',label:'Source of Income',opts:['Allowance','Part-Time Job','Gift']},{k:'amt',label:'Amount',type:'number',ph:'enter amount'},{k:'date',label:'Date',type:'date',val:today()}],tx_('inc')),
  addExp:()=>modal('Add Expense','Add the following information below.',[{k:'cat',label:'Expense',opts:['Food','Transportation','Education','Other']},{k:'amt',label:'Amount',type:'number',ph:'enter amount'},{k:'date',label:'Date',type:'date',val:today()}],tx_('exp')),
  account:()=>alertBox('Account',`Name: ${S.user.name}\nEmail: ${S.user.email}`),
  about:()=>alertBox('About Hayati','Hayati helps students manage academics, wellness and money in one app. Your data is saved to your account.'),
  async logout(){try{await sb.auth.signOut()}catch(e){}S.user=null;S.view='login';render()}
};
const tx_=type=>async v=>{const amt=+v.amt;if(!(amt>0))return'Enter an amount greater than 0.';await add('tx',{type})({...v,amt})};
app.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;if(el.tagName==='A')e.preventDefault();
  Promise.resolve(A[el.dataset.a](el.dataset,el)).catch(err=>alertBox('Something went wrong',String(err)))});
(async()=>{try{if(/PASTE/.test(HAYATI.SUPABASE_URL))throw new Error('config');const{data:{session}}=await sb.auth.getSession();if(session){S.user=userOf(session.user);S.view='app'}}catch(e){}render();READY=true;if(RECOVERY)newPassword()})();
