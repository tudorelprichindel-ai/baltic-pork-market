// One-time interactive connection. The owner creates and installs the App in GitHub.
// Credentials stay on this computer; neither browser page nor stdout receives them.
import http from "node:http";
import fs from "node:fs/promises";
import {createPrivateKey,createSign,randomBytes} from "node:crypto";
const repository=process.argv[2]||"tudorelprichindel-ai/baltic-pork-market";
if(!/^[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+$/.test(repository))throw new Error("Invalid repository name");
const nonce=randomBytes(24).toString("hex");const origin="http://127.0.0.1:4176";
const folder="outputs/admin-secrets";await fs.mkdir(folder,{recursive:true});
const html=(s)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const page=(title,body)=>`<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font:17px/1.6 Arial;max-width:760px;margin:70px auto;padding:24px"><h1>${title}</h1>${body}</body></html>`;
const manifest={name:`Galas grozs admin ${repository.split("/")[0]}`.slice(0,100),url:"https://www.galasgrozs.lv",redirect_url:`${origin}/callback`,public:false,hook_attributes:{url:"https://www.galasgrozs.lv/",active:false},default_permissions:{contents:"write"},default_events:[]};
let app=null,installation=null,timer=null,started=Date.now();
async function github(path,token,options={}){const response=await fetch(`https://api.github.com${path}`,{...options,headers:{Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"Galas-grozs-setup","Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`GitHub returned ${response.status}`);return response.json();}
function jwt(){const now=Math.floor(Date.now()/1000);const raw=[{alg:"RS256",typ:"JWT"},{iat:now-60,exp:now+540,iss:String(app.id)}].map(v=>Buffer.from(JSON.stringify(v)).toString("base64url")).join(".");return raw+"."+createSign("RSA-SHA256").update(raw).sign(app.pem,"base64url");}
async function checkInstallation(){
  if(!app||installation)return;
  if(Date.now()-started>30*60000){clearInterval(timer);console.log("Installation wait expired; credentials remain in outputs/admin-secrets.");return;}
  try{const list=await github("/app/installations",jwt());const found=list.find(v=>v.account.login.toLowerCase()===repository.split("/")[0].toLowerCase());if(!found)return;
    installation=found.id;await fs.writeFile(`${folder}/github-app.json`,JSON.stringify({appId:String(app.id),installationId:String(installation),repository,slug:app.slug},null,2));clearInterval(timer);console.log("GitHub connection ready. App identifiers and PKCS#8 key saved in outputs/admin-secrets (excluded from Git). No credentials printed.");
  }catch{console.log("Waiting for GitHub App installation; retrying.");}
}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,origin);res.setHeader("Content-Type","text/html; charset=utf-8");res.setHeader("Cache-Control","no-store");res.setHeader("X-Frame-Options","DENY");res.setHeader("Referrer-Policy","no-referrer");
  try{
    if(url.pathname==="/"&&url.searchParams.get("state")===nonce){res.end(page("Conectează panoul la GitHub",`<p>Repository: <b>${html(repository)}</b>.</p><p>Aplicația va putea citi și modifica fișierele site-ului, pentru a publica produsele, fotografiile și textele. Nu primește acces la e-mail sau la alte conturi.</p><p>În pasul de instalare alege <b>Only select repositories</b> și selectează numai <b>${html(repository.split("/")[1])}</b>.</p><form method="post" action="https://github.com/settings/apps/new?state=${nonce}"><input type="hidden" name="manifest" value="${html(JSON.stringify(manifest))}"><button style="font:inherit;padding:14px 22px">Continuă în GitHub și verifică permisiunile</button></form>`));return;}
    if(url.pathname==="/callback"&&url.searchParams.get("state")===nonce&&!app){const code=url.searchParams.get("code");if(!code||code.length>200)throw new Error("Missing callback code");const result=await github(`/app-manifests/${encodeURIComponent(code)}/conversions`,null,{method:"POST"});app={id:result.id,slug:result.slug,pem:result.pem};await fs.writeFile(`${folder}/github-app-pkcs8.pem`,createPrivateKey(result.pem).export({type:"pkcs8",format:"pem"}));await fs.writeFile(`${folder}/github-app.json`,JSON.stringify({appId:String(app.id),slug:app.slug,repository},null,2));console.log(`App created. Install only on ${repository}: https://github.com/apps/${app.slug}/installations/new`);timer=setInterval(checkInstallation,10000);res.end(page("Aplicația a fost creată",`<p>Acum trebuie instalată numai pe repository-ul site-ului.</p><p><a href="https://github.com/apps/${html(app.slug)}/installations/new">Deschide instalarea GitHub App</a></p><p>Alege <b>Only select repositories</b>, selectează <b>${html(repository.split("/")[1])}</b> și confirmă instalarea în GitHub.</p><p>Cheia de acces a fost salvată local, fără a fi afișată în browser.</p>`));return;}
    res.statusCode=404;res.end(page("Pagina nu este disponibilă","<p>Folosește adresa exactă afișată în terminalul de configurare.</p>"));
  }catch(error){res.statusCode=502;res.end(page("Conectarea nu a fost finalizată","<p>Revino la persoana care configurează site-ul. Nu trimite parole sau chei de acces.</p>"));console.error(error.message);}
});
server.listen(4176,"127.0.0.1",()=>console.log(`Open to review and connect GitHub: ${origin}/?state=${nonce}`));
process.on("SIGINT",()=>{clearInterval(timer);server.close();process.exit(0);});
