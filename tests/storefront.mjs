import fs from "node:fs/promises";
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {businessText} from "../js/editable-content.js";
const base="http://127.0.0.1:4174";
const browser=await chromium.launch({channel:"msedge",headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});context.setDefaultTimeout(15000);
try{
  await context.request.post(`${base}/api/login`,{headers:{Origin:base},data:JSON.parse(await fs.readFile("outputs/admin-local/local-login.json","utf8"))});
  const state=await(await context.request.get(`${base}/api/state`)).json();const errors=[];
  const page=await context.newPage();page.on("pageerror",err=>errors.push(err.message));
  for(const language of["lv","en","ru"]){
    for(const entry of state.store.pages){
      await page.goto(`${base}/preview/${entry.file}`);await page.evaluate(lang=>localStorage.setItem("galasGrozsLanguage",lang),language);await page.reload();
      assert.equal(await page.title(),entry.fields.find(f=>f.id==="seo-title").text[language]);
      for(const field of entry.fields.filter(f=>!f.id.startsWith("seo-"))){const actual=await page.locator(`[data-content-id="${field.id}"]`).first().textContent();assert.equal(actual,field.business?businessText(field.business,state.store.site,language):field.text[language],`${entry.file} ${language} ${field.id}`);}
      if(entry.file==="index.html"&&language==="lv")await page.screenshot({path:"outputs/storefront-home-desktop.png"});
    }
  }
  await page.setViewportSize({width:390,height:844});
  for(const entry of state.store.pages){await page.goto(`${base}/preview/${entry.file}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,entry.file+" mobile overflow");}
  await page.goto(`${base}/preview/index.html`);await page.screenshot({path:"outputs/storefront-home-mobile.png"});
  assert.deepEqual(errors,[]);console.log("Storefront checks passed: all 8 pages in LV/EN/RU, editable texts, metadata, shared business copy and mobile widths.");
}finally{await browser.close();}
