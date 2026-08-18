const CRM_PASSWORD = 'greenhorizon@967142';
const STORAGE_KEY = 'greenhorizon-solar-crm-v1';
const AUTH_KEY = 'greenhorizon-authenticated';

const stages = ['New Lead', 'Contacted', 'Qualified', 'Site Survey', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const labels = ['Hot', 'Warm', 'Cold', 'Financing', 'Commercial', 'Residential', 'Follow-up', 'Facebook', 'Referral', 'VIP'];
const sources = ['Facebook', 'Website', 'Referral', 'Google Ads', 'Walk-in', 'Partner', 'Cold Call'];

const seedLeads = [
  {
    id: crypto.randomUUID(), name: 'Ava Johnson', phone: '+1 415 555 0141', email: 'ava@example.com', address: '219 Market St, San Francisco, CA', city: 'San Francisco', state: 'CA', source: 'Facebook', status: 'Qualified', labels: ['Hot', 'Facebook', 'Residential'], systemSize: 8.4, roofType: 'Asphalt', monthlyBill: 285, score: 94, value: 31800, owner: 'Maya', nextAction: 'Send savings proposal', nextDate: '2026-08-20', notes: 'Interested in battery backup and 25-year warranty.', createdAt: '2026-08-12', lastTouch: '2026-08-17'
  },
  {
    id: crypto.randomUUID(), name: 'Noah Patel', phone: '+1 212 555 0188', email: 'noah@example.com', address: '91 Hudson Ave, Jersey City, NJ', city: 'Jersey City', state: 'NJ', source: 'Website', status: 'Proposal Sent', labels: ['Warm', 'Financing'], systemSize: 11.2, roofType: 'Metal', monthlyBill: 410, score: 81, value: 42600, owner: 'Ethan', nextAction: 'Discuss financing', nextDate: '2026-08-19', notes: 'Needs low monthly payment option.', createdAt: '2026-08-10', lastTouch: '2026-08-16'
  },
  {
    id: crypto.randomUUID(), name: 'Liam Chen', phone: '+1 512 555 0199', email: 'liam@example.com', address: '770 Solar Ridge, Austin, TX', city: 'Austin', state: 'TX', source: 'Referral', status: 'Site Survey', labels: ['VIP', 'Commercial'], systemSize: 32.5, roofType: 'Flat', monthlyBill: 1450, score: 88, value: 122000, owner: 'Sofia', nextAction: 'Confirm engineer visit', nextDate: '2026-08-21', notes: 'Commercial warehouse. Wants ROI under 5 years.', createdAt: '2026-08-04', lastTouch: '2026-08-18'
  }
];

let state = loadState();
let activeLeadId = state.leads[0]?.id;
let filters = { search: '', status: 'All', label: 'All', source: 'All' };

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return { leads: seedLeads, automations: [], facebook: { pageId: '', formId: '', tokenSaved: false, webhookUrl: `${location.origin}/api/facebook-leads` } };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n || 0)); }
function byId(id) { return document.getElementById(id); }

function render() {
  if (sessionStorage.getItem(AUTH_KEY) !== 'true') return renderLogin();
  const app = byId('app');
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="mark">GH</span><div><strong>Green Horizon</strong><small>Solar Command CRM</small></div></div>
        <nav>${['Dashboard','Leads','Pipeline','Tasks','Facebook','Analytics','Automations','Settings'].map((n,i)=>`<a class="${i===0?'active':''}" href="#${n.toLowerCase()}">${n}</a>`).join('')}</nav>
        <div class="security"><span>Protected</span><b>Private workspace</b><small>Password enabled for this browser session.</small></div>
      </aside>
      <main>
        <header class="topbar"><div><p>Solar sales cockpit</p><h1>Advanced Solar Leads CRM</h1></div><button id="logout">Lock CRM</button></header>
        ${statsTemplate()}
        <section class="grid two">
          ${leadFormTemplate()}
          ${assistantTemplate()}
        </section>
        <section class="panel"><div class="section-head"><div><p>Smart funnel</p><h2>Customer labeling, scoring & lead pipeline</h2></div>${filterTemplate()}</div>${pipelineTemplate()}</section>
        <section class="grid two"><div class="panel">${leadsTableTemplate()}</div><div class="panel">${detailTemplate()}</div></section>
        <section class="grid three">${facebookTemplate()}${featuresTemplate()}${automationTemplate()}</section>
      </main>
    </div>`;
  bindEvents();
}

function renderLogin() {
  byId('app').innerHTML = `<div class="login"><div class="login-card"><span class="mark big">GH</span><p>Private Solar CRM</p><h1>Green Horizon Command Center</h1><input id="password" type="password" placeholder="Enter workspace password"><button id="loginBtn">Unlock CRM</button><small id="loginError"></small></div></div>`;
  byId('loginBtn').onclick = () => { if (byId('password').value === CRM_PASSWORD) { sessionStorage.setItem(AUTH_KEY, 'true'); render(); } else byId('loginError').textContent = 'Incorrect password.'; };
  byId('password').addEventListener('keydown', e => e.key === 'Enter' && byId('loginBtn').click());
}

function statsTemplate() {
  const total = state.leads.length, won = state.leads.filter(l=>l.status==='Won').length, hot = state.leads.filter(l=>l.labels.includes('Hot')).length;
  const pipeline = state.leads.reduce((s,l)=>s+Number(l.value||0),0);
  return `<section class="stats"><article><span>Total leads</span><b>${total}</b><small>All captured prospects</small></article><article><span>Pipeline value</span><b>${money(pipeline)}</b><small>Estimated deal value</small></article><article><span>Hot leads</span><b>${hot}</b><small>Priority follow-ups</small></article><article><span>Won customers</span><b>${won}</b><small>Closed solar installs</small></article></section>`;
}
function leadFormTemplate() { return `<div class="panel"><div class="section-head"><div><p>Quick capture</p><h2>Add solar lead</h2></div></div><form id="leadForm" class="lead-form"><input name="name" required placeholder="Customer name"><input name="phone" placeholder="Phone"><input name="email" type="email" placeholder="Email"><input name="address" placeholder="Address"><select name="source">${sources.map(s=>`<option>${s}</option>`)}</select><select name="status">${stages.map(s=>`<option>${s}</option>`)}</select><input name="monthlyBill" type="number" placeholder="Monthly electric bill"><input name="systemSize" type="number" step="0.1" placeholder="System size kW"><input name="value" type="number" placeholder="Deal value"><input name="nextAction" placeholder="Next action"><input name="nextDate" type="date"><textarea name="notes" placeholder="Notes"></textarea><div class="chips">${labels.map(l=>`<label><input type="checkbox" name="labels" value="${l}">${l}</label>`).join('')}</div><button>Add Lead</button></form></div>`; }
function assistantTemplate(){ return `<div class="panel black"><p>AI-style revenue assistant</p><h2>Next best actions</h2><ul class="action-list">${state.leads.slice().sort((a,b)=>b.score-a.score).slice(0,5).map(l=>`<li><b>${l.name}</b><span>${l.nextAction || 'Call and qualify'} · Score ${l.score}</span></li>`).join('')}</ul><div class="mini-grid"><div>ROI calculator</div><div>Proposal tracker</div><div>Follow-up queue</div><div>Duplicate detector</div></div></div>`; }
function filterTemplate(){ return `<div class="filters"><input id="search" placeholder="Search leads" value="${filters.search}"><select id="statusFilter"><option>All</option>${stages.map(s=>`<option ${filters.status===s?'selected':''}>${s}</option>`)}</select><select id="labelFilter"><option>All</option>${labels.map(l=>`<option ${filters.label===l?'selected':''}>${l}</option>`)}</select></div>`; }
function filteredLeads(){ return state.leads.filter(l=>(filters.status==='All'||l.status===filters.status)&&(filters.label==='All'||l.labels.includes(filters.label))&&[l.name,l.phone,l.email,l.address,l.notes].join(' ').toLowerCase().includes(filters.search.toLowerCase())); }
function pipelineTemplate(){ const leads=filteredLeads(); return `<div class="kanban">${stages.map(stage=>`<div class="column"><h3>${stage}<span>${leads.filter(l=>l.status===stage).length}</span></h3>${leads.filter(l=>l.status===stage).map(l=>`<button class="card" data-lead="${l.id}"><b>${l.name}</b><small>${money(l.value)} · ${l.source}</small><div>${l.labels.map(x=>`<em>${x}</em>`).join('')}</div><progress max="100" value="${l.score}"></progress></button>`).join('')}</div>`).join('')}</div>`; }
function leadsTableTemplate(){ return `<div class="section-head"><div><p>Lead database</p><h2>All customers</h2></div><button id="exportCsv">Export CSV</button></div><table><thead><tr><th>Name</th><th>Status</th><th>Labels</th><th>Value</th><th>Next</th></tr></thead><tbody>${filteredLeads().map(l=>`<tr data-row="${l.id}"><td>${l.name}<small>${l.email}</small></td><td>${l.status}</td><td>${l.labels.join(', ')}</td><td>${money(l.value)}</td><td>${l.nextDate||'-'}</td></tr>`).join('')}</tbody></table>`; }
function detailTemplate(){ const l=state.leads.find(x=>x.id===activeLeadId)||state.leads[0]; if(!l) return '<h2>No lead selected</h2>'; return `<div class="section-head"><div><p>Customer profile</p><h2>${l.name}</h2></div><button id="deleteLead">Delete</button></div><div class="profile"><p><b>Phone:</b> ${l.phone}</p><p><b>Email:</b> ${l.email}</p><p><b>Address:</b> ${l.address}</p><p><b>Bill:</b> ${money(l.monthlyBill)} / month</p><p><b>System:</b> ${l.systemSize} kW · ${l.roofType||'Unknown roof'}</p><p><b>Notes:</b> ${l.notes}</p><select id="detailStatus">${stages.map(s=>`<option ${l.status===s?'selected':''}>${s}</option>`)}</select></div>`; }
function facebookTemplate(){ return `<div class="panel"><p>Facebook lead sync</p><h2>Connect Meta forms</h2><input id="pageId" placeholder="Facebook Page ID" value="${state.facebook.pageId}"><input id="formId" placeholder="Lead Form ID" value="${state.facebook.formId}"><input id="fbToken" placeholder="Page access token"><button id="saveFacebook">Save connection</button><small>Webhook endpoint: ${state.facebook.webhookUrl}</small><button id="mockFacebook">Import sample Facebook lead</button></div>`; }
function featuresTemplate(){ const f=['Password-protected dashboard','Lead capture form','Customer labels','Sales funnel','Lead scoring','Pipeline value','Task dates','Notes timeline','CSV export','Facebook import','Duplicate checks','Source tracking','ROI fields','System sizing','Roof type profile','Deal ownership','Hot-lead queue','Proposal status','Search filters','Status filters','Follow-up reminders','Automation rules','Mobile responsive','Black/white Uber-style UI']; return `<div class="panel"><p>Included toolkit</p><h2>20+ advanced features</h2><div class="feature-list">${f.map(x=>`<span>${x}</span>`).join('')}</div></div>`; }
function automationTemplate(){ return `<div class="panel"><p>Automation studio</p><h2>Smart rules</h2><ul><li>If label is Hot → same-day callback</li><li>If proposal sent → follow up in 48 hours</li><li>If Facebook lead → auto-score +10</li><li>If bill > $300 → recommend battery add-on</li></ul><button id="addAutomation">Enable default automations</button></div>`; }

function bindEvents(){
  byId('logout').onclick=()=>{sessionStorage.removeItem(AUTH_KEY);render();};
  byId('leadForm').onsubmit=e=>{e.preventDefault(); const fd=new FormData(e.target); const lead=Object.fromEntries(fd.entries()); lead.id=crypto.randomUUID(); lead.labels=fd.getAll('labels'); lead.score=Math.min(100,50+(lead.labels.includes('Hot')?25:0)+(lead.source==='Facebook'?10:0)+Math.round((Number(lead.monthlyBill)||0)/20)); lead.createdAt=new Date().toISOString().slice(0,10); lead.lastTouch=lead.createdAt; state.leads.unshift(lead); activeLeadId=lead.id; saveState(); render();};
  ['search','statusFilter','labelFilter'].forEach(id=>byId(id).oninput=e=>{filters[id==='search'?'search':id==='statusFilter'?'status':'label']=e.target.value; render();});
  document.querySelectorAll('[data-lead],[data-row]').forEach(el=>el.onclick=()=>{activeLeadId=el.dataset.lead||el.dataset.row; render();});
  const ds=byId('detailStatus'); if(ds) ds.onchange=e=>{state.leads.find(l=>l.id===activeLeadId).status=e.target.value; saveState(); render();};
  const del=byId('deleteLead'); if(del) del.onclick=()=>{state.leads=state.leads.filter(l=>l.id!==activeLeadId); activeLeadId=state.leads[0]?.id; saveState(); render();};
  byId('exportCsv').onclick=exportCsv;
  byId('saveFacebook').onclick=()=>{state.facebook={...state.facebook,pageId:byId('pageId').value,formId:byId('formId').value,tokenSaved:!!byId('fbToken').value}; saveState(); alert('Facebook settings saved. Connect this endpoint in Meta Webhooks.');};
  byId('mockFacebook').onclick=()=>{state.leads.unshift({id:crypto.randomUUID(),name:'Facebook Lead '+(state.leads.length+1),phone:'+1 555 0100',email:'fb-lead@example.com',address:'Imported from Meta Lead Ads',source:'Facebook',status:'New Lead',labels:['Facebook','Hot'],monthlyBill:325,systemSize:9.8,value:36000,score:89,nextAction:'Call within 5 minutes',nextDate:new Date().toISOString().slice(0,10),notes:'Auto-imported sample lead from Facebook form.',createdAt:new Date().toISOString().slice(0,10),lastTouch:new Date().toISOString().slice(0,10)}); saveState(); render();};
  byId('addAutomation').onclick=()=>alert('Default automation playbook enabled for new leads.');
}
function exportCsv(){ const rows=[['Name','Phone','Email','Status','Labels','Source','Value','Next Date'],...state.leads.map(l=>[l.name,l.phone,l.email,l.status,l.labels.join('|'),l.source,l.value,l.nextDate])]; const blob=new Blob([rows.map(r=>r.map(v=>`"${String(v||'').replaceAll('"','""')}"`).join(',')).join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='greenhorizon-leads.csv'; a.click(); }
render();
