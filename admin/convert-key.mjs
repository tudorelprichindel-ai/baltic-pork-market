import {createPrivateKey} from "node:crypto";
import fs from "node:fs/promises";
const file=process.argv[2];
if(!file){console.error("Usage: node admin/convert-key.mjs path-to-private-key.pem");process.exit(1);}
const key=createPrivateKey(await fs.readFile(file));
await fs.mkdir("outputs/admin-secrets",{recursive:true});
await fs.writeFile("outputs/admin-secrets/github-app-pkcs8.pem",key.export({type:"pkcs8",format:"pem"}));
console.log("PKCS#8 key saved in outputs/admin-secrets/github-app-pkcs8.pem (excluded from Git).");
