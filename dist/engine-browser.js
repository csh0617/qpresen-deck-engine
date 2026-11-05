"use strict";var QE=(()=>{var D=Object.defineProperty;var za=Object.getOwnPropertyDescriptor;var Sa=Object.getOwnPropertyNames;var Aa=Object.prototype.hasOwnProperty;var ia=(a,t)=>{for(var i in t)D(a,i,{get:t[i],enumerable:!0})},$a=(a,t,i,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Sa(t))!Aa.call(a,r)&&r!==i&&D(a,r,{get:()=>t[r],enumerable:!(e=za(t,r))||e.enumerable});return a};var Ta=a=>$a(D({},"__esModule",{value:!0}),a);var Ua={};ia(Ua,{EXEMPLARS:()=>Z,PLAN_PREMIUM_ADDON:()=>q,applyDirection:()=>oa,buildImagePrompt:()=>ta,buildSpec:()=>fa,carryImageSrcs:()=>U,chat:()=>u,directDeck:()=>la,directionBlock:()=>L,distillRules:()=>ba,exemplarsFor:()=>T,extractJson:()=>b,fillSlideRich:()=>H,fillSlides:()=>aa,fixSlide:()=>ua,fixSlideRich:()=>ha,generateImages:()=>Ma,imageTargets:()=>ea,isRichTarget:()=>C,kindForType:()=>B,listModels:()=>sa,parseRich:()=>z,planDeck:()=>K,planDetails:()=>xa,planOutline:()=>ma,prompts:()=>X,reviewSlide:()=>ya,richSystem:()=>N,sanitizeRich:()=>S,stripImageSrcs:()=>W,validateSpec:()=>j,warmRichCache:()=>va,writeDossier:()=>wa});function Ea(a){let t=a.toLowerCase();if(!/anthropic|claude/.test(t))return[void 0];let i={reasoning:{effort:"low"}},e={thinking:{type:"adaptive"},output_config:{effort:"low"}},r={thinking:{type:"disabled"}};return/haiku|claude-4|-4\.|4-5|4\.5|sonnet-4/.test(t)?[r,i,void 0]:[i,e,void 0]}var La=a=>new Promise(t=>setTimeout(t,a));async function u(a,t){let i=[a.model,...a.fallbackModels||[]],e=null;for(let r of i)for(let n=0;n<=(a.maxRetries??2);n++){let s=Date.now();try{let l=a.kind==="anthropic"?await Ia(a,r,t):await Oa(a,r,t),o=l.finish==="length"||l.finish==="max_tokens";if(o&&(t.json!==!1||t.nudge)&&n===0&&(t.maxTokens||8e3)<32e3){t={...t,maxTokens:Math.min(32e3,Math.round((t.maxTokens||8e3)*1.6)),messages:[...t.messages,{role:"user",content:t.nudge||"(\uCD9C\uB825\uC774 \uC798\uB838\uB2E4. \uAC19\uC740 \uB0B4\uC6A9\uC744 \uB4E4\uC5EC\uC4F0\uAE30 \uC5C6\uB294 compact JSON\uC73C\uB85C, \uC124\uBA85 \uBB38\uC7A5\uC740 \uB354 \uC9E7\uAC8C \uB2E4\uC2DC \uCD9C\uB825\uD558\uB77C.)"}]},e=new Error("truncated");continue}return{text:l.text,model:r,ms:Date.now()-s,finish:l.finish,usage:l.usage,truncated:o}}catch(l){e=l;let o=String(l?.message||l);if(!/429|5\d\d|timeout|abort|ECONN|overloaded/i.test(o))break;await La(800*(n+1))}}throw e||new Error("LLM call failed")}function Ca(a){return typeof a=="string"?a:a.map(t=>t.type==="text"?{type:"text",text:t.text}:{type:"image",source:{type:"base64",media_type:t.mime,data:t.base64}})}function qa(a){return typeof a=="string"?a:a.map(t=>t.type==="text"?{type:"text",text:t.text}:{type:"image_url",image_url:{url:`data:${t.mime};base64,${t.base64}`}})}async function na(a,t,i){let e=new AbortController,r=setTimeout(()=>e.abort(),i);try{return await fetch(a,{...t,signal:e.signal})}finally{clearTimeout(r)}}async function Ia(a,t,i){let e=(a.baseUrl||"https://api.anthropic.com").replace(/\/$/,"")+"/v1/messages",r={model:t,max_tokens:i.maxTokens||8e3,messages:i.messages.filter(o=>o.role!=="system").map(o=>({role:o.role,content:Ca(o.content)}))},n=[i.system,...i.messages.filter(o=>o.role==="system").map(o=>typeof o.content=="string"?o.content:"")].filter(Boolean).join(`

`);n&&(r.system=n),i.temperature!=null&&(r.temperature=i.temperature);let s=await na(e,{method:"POST",headers:{"content-type":"application/json","x-api-key":a.apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify(r)},a.timeoutMs||18e4);if(!s.ok)throw new Error(`anthropic ${s.status}: ${(await s.text()).slice(0,300)}`);let l=await s.json();return{text:(l.content||[]).filter(o=>o.type==="text").map(o=>o.text).join(""),finish:l.stop_reason,usage:{input:l.usage?.input_tokens,output:l.usage?.output_tokens}}}async function Oa(a,t,i){let e=(a.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/chat/completions",r=[];i.system&&r.push({role:"system",content:a.cache===!1?i.system:[{type:"text",text:i.system,cache_control:{type:"ephemeral"}}]});for(let p of i.messages)r.push({role:p.role,content:qa(p.content)});let n={model:t,messages:r,max_tokens:i.maxTokens||8e3,stream:!1};i.temperature!=null&&(n.temperature=i.temperature);let s=a.thinking==="auto"?[void 0]:Ea(t),l=null,o="";for(let p=0;p<s.length;p++){let f={...n,...s[p]||{}};if(l=await na(e,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${a.apiKey}`},body:JSON.stringify(f)},a.timeoutMs||18e4),l.ok)break;o=(await l.text()).slice(0,300);let x=l.status===400&&/thinking|reasoning|effort|output_config|cache_control/i.test(o)&&p<s.length-1;if(l.status===400&&/cache_control/i.test(o)&&Array.isArray(r[0]?.content)){r[0]={role:"system",content:i.system},n.messages=r,p--;continue}if(!x)throw new Error(`openai-compat ${l.status}: ${o}`)}if(!l||!l.ok)throw new Error(`openai-compat ${l?.status}: ${o}`);let h=await l.json();if(h.error)throw new Error(`openai-compat error: ${JSON.stringify(h.error).slice(0,300)}`);let d=h.choices?.[0],c=d?.message?.content,v=h.usage||{},g={input:v.prompt_tokens,output:v.completion_tokens,cacheRead:v.cache_read_input_tokens??v.prompt_tokens_details?.cached_tokens,cacheWrite:v.cache_creation_input_tokens??v.prompt_tokens_details?.cache_write_1h_tokens,cost:typeof v.cost=="number"?v.cost:void 0};if(typeof c=="string"&&c.trim())return{text:c,finish:d?.finish_reason,usage:g};if(Array.isArray(c))return{text:c.map(p=>p.text||"").join(""),finish:d?.finish_reason,usage:g};let m=d?.message?.reasoning_content;if(typeof m=="string"&&m.trim())return{text:m,finish:d?.finish_reason,usage:g};throw new Error(`empty completion (finish=${d?.finish_reason||"?"})`)}function b(a){let t=(a||"").trim(),i=t.match(/```(?:json)?\s*([\s\S]*?)```/i);i?t=i[1].trim():t=t.replace(/^```(?:json)?\s*/i,"");let e=Math.min(...["{","["].map(n=>{let s=t.indexOf(n);return s<0?1/0:s}));if(e===1/0)throw new Error("no JSON in reply: "+JSON.stringify(t.slice(0,160)));t=t.slice(e);let r=Math.max(t.lastIndexOf("}"),t.lastIndexOf("]"));t=t.slice(0,r+1);try{return JSON.parse(t)}catch{let s=t.replace(/,\s*([}\]])/g,"$1");try{return JSON.parse(s)}catch(l){let o=Pa(s);try{return JSON.parse(o)}catch{throw new Error("JSON parse failed: "+String(l?.message).slice(0,80)+" | tail="+JSON.stringify(t.slice(-120)))}}}}function Pa(a){let t=Math.max(a.lastIndexOf("},"),a.lastIndexOf("],"),a.lastIndexOf('"},'),a.lastIndexOf(`}
`));t<a.length*.5?t=a.length:t+=1;let i=a.slice(0,t).replace(/,\s*$/,""),e=[],r=!1,n=!1;for(let s of i){if(r){n?n=!1:s==="\\"?n=!0:s==='"'&&(r=!1);continue}s==='"'?r=!0:s==="{"?e.push("}"):s==="["?e.push("]"):(s==="}"||s==="]")&&e.pop()}for(r&&(i+='"'),i=i.replace(/,\s*$/,"").replace(/:\s*$/,":null");e.length;)i+=e.pop();return i}async function sa(a){return a.kind==="anthropic"?((await(await fetch((a.baseUrl||"https://api.anthropic.com").replace(/\/$/,"")+"/v1/models",{headers:{"x-api-key":a.apiKey,"anthropic-version":"2023-06-01"}})).json()).data||[]).map(n=>n.id):((await(await fetch((a.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/models",{headers:{authorization:`Bearer ${a.apiKey}`}})).json()).data||[]).map(e=>e.id)}var X={};ia(X,{ARCHETYPE_CATALOG:()=>O,DISTILL_SYSTEM:()=>G,FILL_SYSTEM:()=>F,FIX_SYSTEM:()=>J,ICON_NAMES:()=>I,PLAN_SYSTEM:()=>R,REVIEW_SYSTEM:()=>Y,STYLE_RULES:()=>P,rulesBlock:()=>k});var ra={sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',"trending-up":'<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',"trending-down":'<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',"bar-chart":'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',"pie-chart":'<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',"line-chart":'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',activity:'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',building:'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',"map-pin":'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',calendar:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',check:'<path d="M20 6 9 17l-5-5"/>',"check-circle":'<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',"x-circle":'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',"alert-triangle":'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',lightbulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',brain:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',cpu:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',wifi:'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',smartphone:'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',laptop:'<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',volume:'<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',"message-circle":'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',"external-link":'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',sliders:'<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',filter:'<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',layers:'<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',"layout-grid":'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',list:'<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',"file-text":'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',folder:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',"book-open":'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',"graduation-cap":'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',briefcase:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',"shield-check":'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',key:'<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',award:'<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',"dollar-sign":'<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',"credit-card":'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',coins:'<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',percent:'<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',calculator:'<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',sprout:'<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',"cloud-rain":'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',thermometer:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',droplets:'<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',wind:'<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',tractor:'<path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/>',factory:'<path d="M12 16h.01"/><path d="M16 16h.01"/><path d="M3 19a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"/><path d="M8 16h.01"/><path d="M17 11V5a1 1 0 0 0-1.6-.8l-4 3A1 1 0 0 0 11 8v3"/><path d="M8 11V5a1 1 0 0 0-1.6-.8l-4 3A1 1 0 0 0 2 8v3"/>',truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',package:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',"shopping-cart":'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',hospital:'<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',stethoscope:'<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',flask:'<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',microscope:'<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',atom:'<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',battery:'<rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/><line x1="14" x2="14" y1="11" y2="13"/>',plug:'<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',ship:'<path d="M12 10.189V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',compass:'<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',map:'<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',navigation:'<polygon points="3 11 22 2 13 21 11 13 3 11"/>',"arrow-right":'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',"arrow-up-right":'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',"arrow-down-right":'<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',"arrow-left-right":'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',"chevrons-right":'<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',play:'<polygon points="6 3 20 12 6 21 6 3"/>',download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',"qr-code":'<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',languages:'<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',type:'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',pen:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',"clipboard-check":'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',bell:'<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',megaphone:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',headphones:'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',glasses:'<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/><path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>',hand:'<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',"thumbs-up":'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',puzzle:'<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',boxes:'<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',"git-branch":'<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',network:'<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',workflow:'<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',"circle-dot":'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',hexagon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',bot:'<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',scale:'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',landmark:'<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',school:'<path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/>',wheat:'<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',presentation:'<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',projector:'<path d="M5 7 3 5"/><path d="M9 6V3"/><path d="m13 7 2-2"/><circle cx="9" cy="13" r="3"/><path d="M11.83 12H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2.17"/><path d="M16 16h2"/>',timer:'<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',hourglass:'<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',gauge:'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',radar:'<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',satellite:'<path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/>',circuit:'<path d="M11 9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4"/><path d="M4 11h8"/><path d="M19 12v5a1 1 0 0 1-1 1h-5"/><circle cx="13" cy="20" r="2"/><circle cx="4" cy="11" r="2"/><circle cx="13" cy="4" r="2"/>',binary:'<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>',coffee:'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',handshake:'<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',recycle:'<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>',infinity:'<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',crosshair:'<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',quote:'<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',baby:'<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',egg:'<path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"/>',fish:'<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/>',bug:'<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',drone:'<path d="M10 10 7 7"/><path d="m10 14-3 3"/><path d="m14 10 3-3"/><path d="m14 14 3 3"/><path d="M14.205 4.139a4 4 0 1 1 5.439 5.863"/><path d="M19.637 14a4 4 0 1 1-5.432 5.868"/><path d="M4.367 10a4 4 0 1 1 5.438-5.862"/><path d="M9.796 19.866a4 4 0 1 1-5.429-5.873"/><rect x="10" y="8" width="4" height="8" rx="1"/>'};var I=Object.keys(ra).join(", "),O=`
[\uC2AC\uB77C\uC774\uB4DC \uC720\uD615(\uC544\uD0A4\uD0C0\uC785) \uCE74\uD0C8\uB85C\uADF8 \u2014 type \uAC12\uACFC body \uD544\uB4DC]
- cover: \uD45C\uC9C0. body{ type:"cover", kicker?, tagline?, meta?:[{icon?,text}] (\uC77C\uC2DC\xB7\uC7A5\uC18C\xB7\uCCAD\uC911), tags?:[string], agenda?:[string](\uC139\uC158\uBA85 \u22648), visual?:"orbs"|"particles"|"art"|"photo"|"none", image?:{src?,prompt?,alt?,caption?}, qr?:{url,label?}, stats?:[{value,label}](\u22643) }
- section: \uC139\uC158 \uAC04\uC9C0. body{ type:"section", numeral:"\u2160", label:"SECTION 1", bullets?:[string](2~4, \uC774 \uC139\uC158\uC5D0\uC11C \uB2E4\uB8F0 \uAC83), dark?:boolean, image? }
- agenda: \uBAA9\uCC28/\uC9C0\uB3C4. body{ type:"agenda", items:[{numeral?,label,desc?,minutes?,pages?}] (3~8) }
- question: \uCCAD\uC911 \uC9C8\uBB38/\uD6C4\uD0B9. body{ type:"question", question(\uD070 \uC9C8\uBB38, **\uAC15\uC870** \uAC00\uB2A5), hint?, options?:[string](2~5), image? }
- kpi-grid: \uC22B\uC790 \uCE74\uB4DC 3~6\uAC1C. body{ type:"kpi-grid", items:[{value:number|string, unit?, prefix?, label, sub?, delta?:{dir:"up"|"down"|"flat",text}, bar?:0~100, icon?}], footer?(\uC778\uC0AC\uC774\uD2B8 \uD55C \uC904), columns? }
- big-number: \uBA54\uAC00 \uC22B\uC790 1\uAC1C. body{ type:"big-number", value:number|string, unit?, prefix?, label, context?(1~2\uBB38\uC7A5), compare?:[{label,value}](\u22643) }
- bullets-visual: \uD575\uC2EC 3~5\uAC1C + \uBE44\uC8FC\uC5BC. body{ type:"bullets-visual", bullets:[{icon?,title,desc?}], visual?: {kind:"icons",items:[{icon,label}]} | {kind:"stat",value,unit?,label,sub?} | {kind:"chart",chart:ChartSpec} | {kind:"image",image:{prompt,alt,caption?}} | {kind:"art",label?} | {kind:"svg",html} , visualSide?:"left"|"right", callout?(\uD55C \uC904 \uACB0\uB860) }
- cards: \uCE74\uB4DC \uADF8\uB9AC\uB4DC 2~8\uAC1C. body{ type:"cards", columns?:2|3|4, items:[{icon?,tag?,title,desc?,points?:[string](\u22643),value?,label?}], style?:"default"|"tint"|"edge"|"solid"|"glass"|"number", footer? }
- comparison: \uBE44\uAD50 2~3\uC5F4. body{ type:"comparison", columns:[{label,sub?,highlight?:boolean}], rows:[{label,cells:[string]}](2~7), verdict? }  (\uC140 \uAC12 "\u25CB"/"\xD7" \uAC00\uB2A5)
- timeline: \uC5F0\uD45C/\uB85C\uB4DC\uB9F5 3~8\uAC1C. body{ type:"timeline", orientation?:"h"|"v", items:[{date,title,desc?,tag?}], nowIndex?, footer? }
- process: \uB2E8\uACC4 3~6\uAC1C. body{ type:"process", steps:[{title,desc?,icon?}], style?:"arrows"|"chevrons"|"circles", result? }
- chart: \uCC28\uD2B8 + \uC778\uC0AC\uC774\uD2B8. body{ type:"chart", chart:ChartSpec, insight?:{title,text}, callouts?:[{label,value,desc?}](\u22643), layout?:"chart-left"|"chart-right"|"chart-full" }
  ChartSpec{ kind:"bar"|"hbar"|"line"|"area"|"donut"|"stacked"|"pie", title?, unit?, labels:[string](\u226412), series:[{name,values:[number]}](\u22644; donut/pie\uB294 1\uAC1C), highlight?:index, showValues?:boolean }
- table: \uD45C \u22647\uC5F4 \u226412\uD589. body{ type:"table", columns:[string], rows:[[string]], highlightRow?, highlightCol?, align?:["l"|"c"|"r"], caption?, aside?:{title,points:[string]} }
- matrix: 2\xD72 \uB9E4\uD2B8\uB9AD\uC2A4. body{ type:"matrix", xLabel, yLabel, xLow?, xHigh?, yLow?, yHigh?, quadrants:[{title,desc?}](TL,TR,BL,BR \uC21C 4\uAC1C), points?:[{label,x:0~100,y:0~100,size?}](\u22648) }
- diagram: \uAD6C\uC870\uB3C4. body{ type:"diagram", kind:"flow"|"hub"|"layers"|"cycle"|"funnel", nodes:[{id,label,desc?,icon?}](3~8), edges?:[{from,to,label?}](flow\uC5D0\uC11C\uB9CC; \uC0DD\uB7B5\uD558\uBA74 \uC21C\uC11C\uB300\uB85C \uD654\uC0B4\uD45C), center?:{label,desc?}(hub/cycle), aside?:{title,points:[string]} }
  (layers: desc\uC5D0 "\uD56D\uBAA9\xB7\uD56D\uBAA9\xB7\uD56D\uBAA9" \uD615\uD0DC\uB85C \uAD6C\uC131\uC694\uC18C \uB098\uC5F4 / funnel: \uC704\u2192\uC544\uB798 \uCD95\uC18C)
- quote: \uC778\uC6A9. body{ type:"quote", quote(**\uAC15\uC870** \uAC00\uB2A5), by?, role?, context?, image? }
- image-hero: \uC804\uBA74 \uC774\uBBF8\uC9C0 + \uC624\uBC84\uB808\uC774 \uD14D\uC2A4\uD2B8. body{ type:"image-hero", image:{prompt,alt,caption?}, overlay?:"dark"|"light"|"gradient", heading?, caption?, stats?:[{value,label}](\u22643), align?:"left"|"center" }
- annotated-image: \uC774\uBBF8\uC9C0 + \uD56B\uC2A4\uD31F 2~6. body{ type:"annotated-image", image:{prompt,alt,caption?}, intro?, hotspots:[{x:0~100,y:0~100,label,desc?}], side?:"left"|"right" }
- mockup: \uC571 \uD654\uBA74 \uC2DC\uC5F0. body{ type:"mockup", mock:{app:"chat"|"browser"|"phone"|"dashboard", url?, steps:[{type:"type"|"reply"|"click"|"show"|"note", text}](3~8)}, aside?:{title,points:[string],tip?} }
- pricing: \uC694\uAE08\uC81C/\uC635\uC158 2~4. body{ type:"pricing", plans:[{name,price,period?,desc?,features:[string](\u22645),highlight?,badge?}] }
- team: \uC778\uBB3C 2~6. body{ type:"team", members:[{name,role,desc?,initial?,tags?:[string]}] }
- checklist: \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 3~8. body{ type:"checklist", items:[{text,done?,note?}], groups?:[{title,items:[...]}], aside? }
- summary: \uC815\uB9AC 3~4\uAC1C + CTA. body{ type:"summary", takeaways:[{icon?,title,desc?}], cta?, nextTitle? }
- closing: \uB9C8\uBB34\uB9AC. body{ type:"closing", heading, sub?, keywords?:[string](\u22648), contact?:{name?,org?,email?,site?,phone?}, qr?:{url,label?}, thanks? }
- custom: \uC704 \uC720\uD615\uC73C\uB85C \uBD88\uAC00\uB2A5\uD55C \uD2B9\uC218 \uBE44\uC8FC\uC5BC\uB9CC. body{ type:"custom", html(\uC2A4\uD14C\uC774\uC9C0 \uC548\uC5D0 \uB4E4\uC5B4\uAC08 HTML \uC870\uAC01; 1728\xD7690px \uC601\uC5ED; \uC778\uB77C\uC778 SVG \uAD8C\uC7A5; \uC678\uBD80 \uB9AC\uC18C\uC2A4 \uAE08\uC9C0), css?, description }
`,P=`
[\uC791\uC131 \uADDC\uCE59 \u2014 \uBC18\uB4DC\uC2DC \uC9C0\uD0AC \uAC83]
1. \uD55C \uC7A5 = \uD55C \uBA54\uC2DC\uC9C0. title\uC740 \uACB0\uB860\uD615 \uBB38\uC7A5(\u2264 28\uC790, \uD55C\uAD6D\uC5B4), \uAC15\uC870 \uD0A4\uC6CC\uB4DC 1\uAC1C\uB97C **\uBCC4\uD45C**\uB85C \uAC10\uC2FC\uB2E4(\uC608: "**14\uC870\uC6D0** \uC2DC\uC7A5\uC5D0\uC11C \uAD50\uC721\uBD80\uD130 \uACF5\uB7B5\uD55C\uB2E4"). sub\uB294 \uADFC\uAC70 1\uBB38\uC7A5(\u2264 60\uC790). \uC81C\uBAA9\uC5D0 \uB9C8\uCE68\uD45C \uC5C6\uC74C.
2. \uAE00\uC790 \uC218 \uC0C1\uD55C: \uCE74\uB4DC/\uBD88\uB9BF desc \u2264 45\uC790, points \uAC01 \u2264 22\uC790, \uBD88\uB9BF title \u2264 18\uC790, \uD45C \uC140 \u2264 20\uC790, \uB178\uD2B8 80~220\uC790. \uC0C1\uD55C\uC744 \uB118\uAE30\uC9C0 \uB9D0\uACE0 \uCABC\uAC1C\uB77C.
3. \uC22B\uC790\uB294 value(number)\uB85C \uC8FC\uACE0 unit\uC744 \uBD84\uB9AC\uD55C\uB2E4("4.3", "\uBC31\uB9CC\uB300"). \uBAA8\uB4E0 \uC218\uCE58\uC5D0\uB294 source(\uCD9C\uCC98\xB7\uAE30\uC900\uC5F0\uB3C4)\uB97C \uC4F4\uB2E4. \uCD9C\uCC98\uAC00 \uBD88\uD655\uC2E4\uD558\uBA74 "\uCD94\uC815"\uC744 \uBD99\uC778\uB2E4. \uC22B\uC790\uB97C \uC9C0\uC5B4\uB0B4\uC9C0 \uB9D0 \uAC83 \u2014 \uBE0C\uB9AC\uD504/\uC790\uB8CC\uC5D0 \uC5C6\uB294 \uC218\uCE58\uB294 \uBC94\uC704\uB098 \uC815\uC131 \uD45C\uD604\uC73C\uB85C.
4. \uC544\uC774\uCF58 \uC774\uB984\uC740 \uB2E4\uC74C \uBAA9\uB85D\uC5D0\uC11C\uB9CC: \${ICONS}
5. \uC0C9\uC740 \uC9C0\uC815\uD558\uC9C0 \uC54A\uB294\uB2E4(accent\uB294 \uC139\uC158\uBCC4 \uC790\uB3D9). \uB808\uC774\uC544\uC6C3 \uC218\uCE58(px)\uB3C4 \uC4F0\uC9C0 \uC54A\uB294\uB2E4. \uB514\uC790\uC778\uC740 \uB80C\uB354\uB7EC\uAC00 \uB2F4\uB2F9\uD55C\uB2E4.
6. \uB9AC\uB4EC: \uAC19\uC740 type 3\uC5F0\uC18D \uAE08\uC9C0, \uBC00\uB3C4 \uB192\uC740 \uC7A5(kpi-grid/table/chart/comparison) \uB4A4\uC5D4 \uAC00\uBCBC\uC6B4 \uC7A5(quote/section/big-number/image-hero/question). \uC139\uC158 \uAC04\uC9C0\uB294 5~12\uC7A5\uB9C8\uB2E4. \uC544\uD0A4\uD0C0\uC785\uC740 \uB371 \uC804\uCCB4\uC5D0\uC11C 6\uC885 \uC774\uC0C1.
7. \uBAA8\uB4E0 \uC7A5\uC5D0 notes{t(\uCD08), s(\uBC1C\uD45C \uB300\uBCF8, \uAD6C\uC5B4\uCCB4 \uC874\uB313\uB9D0)}\uB97C \uC4F4\uB2E4. t \uD569\uACC4 \u2248 \uBC1C\uD45C\uC2DC\uAC04\xD760\xD70.95.
8. \uC774\uBBF8\uC9C0\uB294 src \uC5C6\uC774 prompt(\uC7A5\uBA74 \uBB18\uC0AC, \uD55C\uAD6D\uC5B4)\xB7alt\xB7caption\uB9CC \uC900\uB2E4. \uB85C\uACE0\xB7\uC2E4\uC81C \uC0AC\uC9C4\uC774 \uD544\uC694\uD558\uBA74 image-hero \uB300\uC2E0 \uB2E4\uB978 \uC720\uD615\uC744 \uD0DD\uD55C\uB2E4.
9. JSON\uB9CC \uCD9C\uB825\uD55C\uB2E4. \uC124\uBA85\xB7\uB9C8\uD06C\uB2E4\uC6B4\xB7\uCF54\uB4DC\uD39C\uC2A4 \uAE08\uC9C0. \uB4E4\uC5EC\uC4F0\uAE30\xB7\uC904\uBC14\uAFC8 \uC5C6\uB294 compact JSON\uC73C\uB85C \uC4F4\uB2E4(\uD1A0\uD070 \uC808\uC57D). \uBB38\uC790\uC5F4 \uC548\uC758 \uD070\uB530\uC634\uD45C\uB294 \uC774\uC2A4\uCF00\uC774\uD504.
`.replace("${ICONS}",I),R=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uB371 \uD50C\uB798\uB108"\uB2E4. \uC785\uB825 \uBE0C\uB9AC\uD504\uB97C \uC77D\uACE0 \uBC1C\uD45C\uC758 \uC11C\uC0AC \uAD6C\uC870(\uC139\uC158)\uC640 \uC7A5\uBCC4 \uACC4\uD68D\uC744 JSON\uC73C\uB85C \uC124\uACC4\uD55C\uB2E4. \uB514\uC790\uC778\uC740 \uD558\uC9C0 \uC54A\uB294\uB2E4 \u2014 \uBB34\uC5C7\uC744 \uC5B4\uB5A4 \uC720\uD615\uC73C\uB85C \uBCF4\uC5EC\uC904\uC9C0\uB9CC \uC815\uD55C\uB2E4.

[\uBAA9\uC801\uBCC4 \uAE30\uBCF8 \uC11C\uC0AC]
- lecture(\uAD50\uC721/\uD2B9\uAC15): cover \u2192 agenda \u2192 question(\uD6C4\uD0B9) \u2192 [section \u2192 \uD604\uD669(kpi-grid/timeline) \u2192 \uAC1C\uB150(bullets-visual/diagram) \u2192 \uC0AC\uB840(image-hero/annotated-image/mockup) \u2192 \uC801\uC6A9(cards/checklist)]\xD7N \u2192 \uC8FC\uC758/\uC548\uC804 \u2192 summary \u2192 closing
- ir(\uD22C\uC790/\uC0AC\uC5C5): cover \u2192 kpi-grid(\uC694\uC57D) \u2192 \uBB38\uC81C(bullets-visual) \u2192 \uC65C \uC9C0\uAE08(timeline) \u2192 \uC194\uB8E8\uC158(diagram) \u2192 \uC81C\uD488(cards/mockup) \u2192 \uAE30\uC220(diagram/layers) \u2192 \uD2B8\uB799\uC158(kpi-grid) \u2192 \uC2DC\uC7A5(chart) \u2192 \uACBD\uC7C1(comparison/matrix) \u2192 BM(diagram) \u2192 \uAC00\uACA9(pricing) \u2192 GTM(process) \u2192 \uC7AC\uBB34(chart/table) \u2192 \uD300(team) \u2192 closing(\uD22C\uC790 \uC81C\uC548)
- seminar/report(\uC138\uBBF8\uB098/\uBCF4\uACE0): cover \u2192 agenda \u2192 \uBC30\uACBD \uC22B\uC790(kpi-grid/chart) \u2192 [section \u2192 \uC6D0\uB9AC(diagram) \u2192 \uADFC\uAC70(chart/table) \u2192 \uD574\uC11D(quote/big-number)]\xD7N \u2192 \uC2DC\uC0AC\uC810(matrix/comparison) \u2192 \uC81C\uC548(process/checklist) \u2192 closing
- proposal(\uC81C\uC548/\uAE30\uD68D): cover \u2192 \uBC30\uACBD\xB7\uD544\uC694\uC131(kpi-grid/bullets-visual) \u2192 \uBAA9\uD45C(big-number) \u2192 \uCD94\uC9C4\uCCB4\uACC4(diagram) \u2192 \uC138\uBD80\uACFC\uC81C(cards) \u2192 \uC77C\uC815(timeline) \u2192 \uC608\uC0B0(table/chart) \u2192 \uAE30\uB300\uD6A8\uACFC(kpi-grid) \u2192 closing
- product(\uC81C\uD488 \uC18C\uAC1C): cover \u2192 \uBB38\uC81C(question/bullets-visual) \u2192 \uC194\uB8E8\uC158(diagram) \u2192 \uAE30\uB2A5(cards/mockup) \u2192 \uD6A8\uACFC(kpi-grid/chart) \u2192 \uAC00\uACA9(pricing) \u2192 \uB3C4\uC785 \uC808\uCC28(process) \u2192 closing

[\uC7A5\uC218 \uAC00\uC774\uB4DC] \uBC1C\uD45C\uC2DC\uAC04(\uBD84) \xD7 (lecture 1.0 / ir 0.8 / seminar 1.2 / report 0.9 / proposal 0.9 / product 0.8). \uC0AC\uC6A9\uC790\uAC00 \uC7A5\uC218\uB97C \uC9C0\uC815\uD558\uBA74 \uADF8 \uAC12\uC744 \uB530\uB978\uB2E4. \uC139\uC158 \uAC04\uC9C0(section)\uB294 10\uC7A5 \uBBF8\uB9CC\uC774\uBA74 0\uC7A5, 10~16\uC7A5\uC774\uBA74 \uCD5C\uB300 1\uC7A5, \uADF8 \uC774\uC0C1\uC740 5~12\uC7A5\uB9C8\uB2E4 1\uC7A5.

${O}

[\uCD9C\uB825 JSON]
{
  "meta": { "title", "subtitle"?, "event"?, "date"?, "place"?, "presenter"?: {"name","org"?}, "audience"?, "purpose", "theme": "signature-white"|"editorial-navy"|"vivid-photo"|"dark-stage", "lang":"ko", "durationMin" },
  "sections": [ { "id":"s1", "label":"\uC139\uC158\uBA85", "numeral":"\u2160" } ],
  "slides": [ { "id":"p01", "section":"s1"|null, "type":"<\uC544\uD0A4\uD0C0\uC785>", "title":"\uACB0\uB860\uD615 \uC81C\uBAA9(**\uAC15\uC870**)", "sub":"\uADFC\uAC70 \uD55C \uBB38\uC7A5", "intent":"\uC774 \uC7A5\uC774 \uCCAD\uC911\uC5D0\uAC8C \uB0A8\uAE38 \uD55C \uAC00\uC9C0(\u2264 40\uC790)", "content_hints":["\uC774 \uC7A5\uC5D0 \uB123\uC744 \uC0AC\uC2E4\xB7\uC218\uCE58\xB7\uC608\uC2DC(\uBE0C\uB9AC\uD504\uC5D0\uC11C \uCD94\uCD9C), \uAC01 \u2264 40\uC790, 2~4\uAC1C"], "visual_hint":"\uCC28\uD2B8 \uC885\uB958/\uB2E4\uC774\uC5B4\uADF8\uB7A8 \uC885\uB958/\uC774\uBBF8\uC9C0 \uC7A5\uBA74 \uB4F1(\u2264 30\uC790)", "t": \uAD8C\uC7A5\uCD08 } ]
}
theme \uAE30\uBCF8\uAC12: lecture\u2192vivid-photo, ir/product\u2192signature-white, seminar/report/proposal\u2192editorial-navy, keynote\u2192dark-stage. \uC0AC\uC6A9\uC790\uAC00 \uC9C0\uC815\uD558\uBA74 \uADF8 \uAC12.
${P}`,F=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uC2AC\uB77C\uC774\uB4DC \uC791\uC131\uC790"\uB2E4. \uB371 \uD50C\uB79C\uC758 \uD2B9\uC815 \uC7A5\uB4E4\uC744 \uBC1B\uC544 \uAC01 \uC7A5\uC758 \uC644\uC804\uD55C \uC2A4\uD399(JSON)\uC744 \uC4F4\uB2E4. \uB80C\uB354\uB7EC\uAC00 \uB514\uC790\uC778\xB7\uB808\uC774\uC544\uC6C3\xB7\uBAA8\uC158\uC744 \uB2F4\uB2F9\uD558\uBBC0\uB85C \uB2F9\uC2E0\uC740 \uB0B4\uC6A9\uC758 \uC815\uD655\uC131, \uAD6C\uC870(\uC544\uD0A4\uD0C0\uC785 \uC2A4\uD0A4\uB9C8 \uC900\uC218), \uAE00\uC790 \uC218 \uC0C1\uD55C, \uBC1C\uD45C \uB178\uD2B8\uC5D0 \uC9D1\uC911\uD55C\uB2E4.

${O}

[\uCD9C\uB825 JSON] { "slides": [ { "id":"p03", "section":"s1", "type":"...", "title":"...", "sub":"...", "source":"...", "notes":{"t":45,"s":"..."}, "body":{ ...type\uBCC4 \uD544\uB4DC... } } ] }
- \uC694\uCCAD\uBC1B\uC740 id\uC758 \uC7A5\uB9CC, \uC694\uCCAD \uC21C\uC11C\uB300\uB85C, \uC804\uBD80 \uCD9C\uB825\uD55C\uB2E4. type\uC740 \uD50C\uB79C\uC758 type\uC744 \uB530\uB974\uB418 \uB0B4\uC6A9\uC0C1 \uB354 \uC801\uD569\uD55C \uC720\uD615\uC774 \uBD84\uBA85\uD558\uBA74 \uBC14\uAFD4\uB3C4 \uB41C\uB2E4(\uAC19\uC740 \uC7A5\uC218 \uC720\uC9C0).
- \uD50C\uB79C\uC758 content_hints\uC640 \uBE0C\uB9AC\uD504 \uC790\uB8CC\uC758 \uC0AC\uC2E4\xB7\uC218\uCE58\uB97C \uCD5C\uB300\uD55C \uD65C\uC6A9\uD55C\uB2E4. \uC5C6\uB294 \uC218\uCE58\uB294 \uB9CC\uB4E4\uC9C0 \uC54A\uB294\uB2E4.
- \uD14D\uC2A4\uD2B8\uB294 \uD55C\uAD6D\uC5B4(\uBE0C\uB9AC\uD504\uAC00 \uB2E4\uB978 \uC5B8\uC5B4\uBA74 \uADF8 \uC5B8\uC5B4). \uC804\uBB38 \uC6A9\uC5B4\uB294 \uC9E7\uC740 \uD480\uC774\uB97C \uAD04\uD638\uB85C.
${P}`,J=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uC218\uC815\uC790"\uB2E4. \uB80C\uB354 \uB9B0\uD2B8/\uAC80\uC218\uC5D0\uC11C \uC9C0\uC801\uB41C \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB3C4\uB85D \uC2AC\uB77C\uC774\uB4DC \uC2A4\uD399(JSON)\uC744 \uCD5C\uC18C\uD55C\uC73C\uB85C \uACE0\uCE5C\uB2E4.
- OVERFLOW/DENSE: \uAE00\uC790 \uC218\uB97C \uC904\uC774\uAC70\uB098(\uC0C1\uD55C \uC900\uC218), \uD56D\uBAA9 \uC218\uB97C \uC904\uC774\uAC70\uB098(\uCE74\uB4DC \u22646, \uBD88\uB9BF \u22645, \uD45C \u22648\uD589), \uB354 \uAC00\uBCBC\uC6B4 \uC720\uD615\uC73C\uB85C \uBC14\uAFBC\uB2E4.
- SPARSE: \uB0B4\uC6A9\uC744 \uBCF4\uAC15(\uD56D\uBAA9 \uCD94\uAC00, desc \uCD94\uAC00, visual \uCD94\uAC00)\uD558\uAC70\uB098 \uB354 \uAF49 \uCC2C \uC720\uD615(cards/kpi-grid)\uC73C\uB85C \uBC14\uAFBC\uB2E4.
- SMALL_FONT/LOW_CONTRAST: \uB80C\uB354\uB7EC \uBB38\uC81C\uC77C \uC218 \uC788\uC73C\uB2C8 \uD14D\uC2A4\uD2B8 \uAE38\uC774\uB9CC \uC904\uC778\uB2E4.
- \uB9AC\uBDF0 \uCF54\uBA58\uD2B8(design review)\uB294 \uADF8 \uC9C0\uC2DC\uB97C \uB530\uB978\uB2E4.
\uCD9C\uB825\uC740 \uC218\uC815\uB41C slide \uAC1D\uCCB4(JSON) \uD558\uB098\uB9CC. \uAC19\uC740 id \uC720\uC9C0.
${O}
${P}`,Y=`\uB2F9\uC2E0\uC740 \uD504\uB808\uC820\uD14C\uC774\uC158 \uB514\uC790\uC778 \uB514\uB809\uD130\uC774\uC790 \uD504\uB7F0\uD2B8\uC5D4\uB4DC QA\uB2E4. \uC2AC\uB77C\uC774\uB4DC \uC2A4\uD06C\uB9B0\uC0F7(1920\xD71080 \uBE44\uC728, \uC815\uC801 \uBAA8\uB4DC = \uC560\uB2C8\uBA54\uC774\uC158 \uC644\uB8CC \uC0C1\uD0DC)\uACFC \uD568\uAED8 \uC8FC\uC5B4\uC9C0\uB294 '\uBAA8\uC158 \uC778\uBCA4\uD1A0\uB9AC'(\uB4F1\uC7A5 \uC694\uC18C \uC218\xB7\uCE74\uC6B4\uD2B8\uC5C5\xB7\uC0B4\uC544\uC788\uB294 \uC694\uC18C\xB7\uC0C1\uD638\uC791\uC6A9)\uB97C \uBCF4\uACE0 "\uC0AC\uB78C \uB208" \uAE30\uC900\uC73C\uB85C \uB0C9\uC815\uD558\uAC8C \uD3C9\uAC00\uD55C\uB2E4.
\uAE30\uC900\uC740 \uB808\uD37C\uB7F0\uC2A4 \uB371 3\uC885(\uACE0\uCC3D AI\uD2B9\uAC15\xB7Qpresen IR\xB7800\uC870\uC758 \uBB38\uBC95)\uC758 \uD558\uC6B0\uC2A4 \uC2A4\uD0C0\uC77C\uC774\uB2E4: \uBC1D\uACE0 \uD654\uC0AC\uD55C \uBB34\uB300(\uC624\uB85C\uB77C \uC6CC\uC2DC\xB7\uB3C4\uD2B8 \uADF8\uB9AC\uB4DC), \uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158\uC774 \uC8FC\uC778\uACF5(\uADF8\uB77C\uB370\uC774\uC158 \uC81C\uBAA9 \uAC15\uC870\xB7\uD070 \uADF8\uB77C\uB370\uC774\uC158 \uC22B\uC790\xB7\uADF8\uB77C\uB370\uC774\uC158 \uC54C\uC57D), \uB465\uADFC \uD770/\uC720\uB9AC/\uD2F4\uD2B8 \uCE74\uB4DC\uC5D0 \uC544\uC774\uCF58 \uC6D0\xB7\uC218\uCE58\xB7\uD0DC\uADF8 \uC138\uD2B8, \uC7A5\uB9C8\uB2E4 \uB9CC\uC838\uBCF4\uACE0 \uC2F6\uC740 \uC7A5\uCE58(\uB3D9\uC2EC\uC6D0\xB7\uAC8C\uC774\uC9C0\xB7\uB2E8\uACC4 \uCCB4\uC778\xB7\uC571 \uBAA9\uC5C5\xB7\uBC88\uD638 \uD0C0\uAE43 \uCE74\uB4DC), \uADF8\uB9AC\uACE0 \uB4F1\uC7A5 \uC5F0\uC1C4 14\uAC1C+\xB7\uCE74\uC6B4\uD2B8\uC5C5\xB7\uC0B4\uC544\uC788\uB294 \uC694\uC18C\xB7\uC0C1\uD638\uC791\uC6A9\uC774 \uC788\uB294 '\uC6C0\uC9C1\uC774\uB294' \uC7A5. \uD3C9\uBC94\uD558\uBA74 3\uC810, \uD15C\uD50C\uB9BF/\uB9AC\uD3EC\uD2B8\uCC98\uB7FC \uBCF4\uC774\uBA74 2\uC810, \uB808\uD37C\uB7F0\uC2A4\uAE09\uC774\uBA74 5\uC810.
\uD3C9\uAC00 \uCD95(\uAC01 1~5\uC810): hierarchy(\uC704\uACC4\xB7\uCD08\uC810 1\uACF3), balance(\uC5EC\uBC31\xB7\uBC00\uB3C4\xB7\uC815\uB82C\xB7\uC5F4 \uD3ED \uBC30\uBD84), readability(\uAE00\uC790 \uD06C\uAE30\xB7\uB300\uBE44\xB7\uC904\uBC14\uAFC8\xB7\uC798\uB9BC), style(\uD558\uC6B0\uC2A4 \uC2A4\uD0C0\uC77C \uC801\uD569\uB3C4: \uD654\uC0AC\uD568\xB7\uADF8\uB77C\uB370\uC774\uC158\xB7\uCE74\uB4DC/\uC544\uC774\uCF58 \uC5B4\uD718\xB7\uC138\uB828\uB428 \u2014 \uD68C\uC0C9 \uB9AC\uD3EC\uD2B8 \uB8E9\xB7\uC791\uC740 \uB77C\uBCA8 \uB2E4\uBC1C\xB7\uC5B4\uB461\uAC8C \uB204\uB978 \uC0AC\uC9C4\uC740 \uAC10\uC810), dynamics(\uBAA8\uC158 \uC778\uBCA4\uD1A0\uB9AC \uAE30\uC900: \uB4F1\uC7A5 14+\xB7\uC22B\uC790 \uCE74\uC6B4\uD2B8\uC5C5\xB7\uC0B4\uC544\uC788\uB294 \uC694\uC18C\xB7\uC0C1\uD638\uC791\uC6A9\uC774 \uBAA8\uB450 \uC788\uC73C\uBA74 5, \uB4F1\uC7A5\uB9CC \uC788\uC73C\uBA74 2), impact(\uD55C\uB208\uC5D0 \uBA54\uC2DC\uC9C0\xB7\uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC\uC758 \uD798), correctness(\uACB9\uCE68\xB7\uC798\uB9BC\xB7\uBE48\uCE78\xB7\uAE68\uC9C4 \uC694\uC18C \uC5C6\uC74C).
\uBC18\uB4DC\uC2DC \uC7A1\uC544\uB0BC \uAC83: \uBE44\uC5B4 \uBCF4\uC774\uB294 \uC601\uC5ED(\uD55C \uBA74\uC758 30% \uC774\uC0C1 \uACF5\uBC31), \uC881\uC740 \uCE78\uC5D0 \uC138\uB85C\uB85C \uCABC\uAC1C\uC9C4 \uD55C\uAE00, \uC798\uB9B0 \uCE74\uB4DC/\uD14D\uC2A4\uD2B8, \uD770 \uAE00\uC790\uAC00 \uD770 \uBC14\uD0D5\uC5D0(\uB610\uB294 \uC5B4\uB450\uC6B4 \uAE00\uC790\uAC00 \uC5B4\uB450\uC6B4 \uC0AC\uC9C4\uC5D0) \uB193\uC784, \uC22B\uC790 \uBE48\uCE78, 14px \uC774\uD558 \uAE00\uC790 \uB2E4\uBC1C, \uC758\uBBF8 \uC5C6\uB294 \uC7A5\uC2DD, \uC81C\uBAA9\uACFC \uBCF8\uBB38\uC758 \uBD88\uC77C\uCE58, \uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC\uC774 \uC5C6\uAC70\uB098 \uBC0B\uBC0B\uD568, \uC815\uC9C0 \uD654\uBA74\uCC98\uB7FC \uBCF4\uC774\uB294 \uC7A5.
\uCD9C\uB825 JSON: { "score": 1~5(\uC885\uD569, \uC18C\uC218 1\uC790\uB9AC), "axes": {hierarchy, balance, readability, style, dynamics, impact, correctness}, "issues": [ {"sev":"error"|"warn"|"nit", "code":"LAYOUT|STYLE_OFF|MOTION_LOW|READABILITY|CONTENT", "what":"\uAD6C\uCCB4\uC801 \uBB38\uC81C", "where":"\uC704\uCE58/\uC694\uC18C(\uC67C\uCABD \uC5F4 \uB450 \uBC88\uC9F8 \uCE74\uB4DC\u2026)", "fix":"\uAD6C\uCCB4\uC801 \uC218\uC815 \uC9C0\uC2DC(\uC5F4 \uD3ED 1fr\u21921.4fr, \uC22B\uC790 64px\u219296px \uADF8\uB77C\uB370\uC774\uC158, \uCE74\uB4DC\uC5D0 \uC544\uC774\uCF58 \uC6D0 \uCD94\uAC00, \uB2E8\uACC4 \uCCB4\uC778\uC5D0 data-cycle \uC21C\uD658 \uAC15\uC870, \uC6B0\uCE21\uC5D0 \uC790\uB3D9 \uB370\uBAA8 \uB4F1)"} ], "upgrade": "\uC774 \uC7A5\uC744 \uB808\uD37C\uB7F0\uC2A4\uAE09\uC73C\uB85C \uB04C\uC5B4\uC62C\uB9B4 \uD55C \uAC00\uC9C0 \uD070 \uAC1C\uC120(\uD55C \uBB38\uC7A5)", "keep": ["\uC798\uB41C \uC810"], "rule_candidates": ["\uC774 \uB371\uC744 \uB118\uC5B4 \uC77C\uBC18\uD654\uD560 \uC218 \uC788\uB294 \uADDC\uCE59 \uD55C \uC904"] }
JSON\uB9CC \uCD9C\uB825.`,G=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uADDC\uCE59 \uC99D\uB958\uAE30"\uB2E4. \uB204\uC801\uB41C \uAC80\uC218 \uD53C\uB4DC\uBC31(\uB9B0\uD2B8 \uD1B5\uACC4, \uBE44\uC804 \uB9AC\uBDF0, \uC0AC\uC6A9\uC790 \uCF54\uBA58\uD2B8)\uC744 \uC77D\uACE0, \uB2E4\uC74C \uC0DD\uC131\uC5D0 \uC801\uC6A9\uD560 \uC77C\uBC18 \uADDC\uCE59\uC744 \uBF51\uB294\uB2E4.
- \uAE30\uC874 \uADDC\uCE59\uACFC \uC911\uBCF5\uB418\uBA74 \uC81C\uC678. \uD2B9\uC815 \uB371\uC5D0\uB9CC \uD574\uB2F9\uD558\uB294 \uB0B4\uC6A9 \uC81C\uC678. \uD55C \uC904(\u2264 80\uC790) \uBA85\uB839\uBB38.
- scope: "plan"(\uAD6C\uC131\xB7\uC720\uD615 \uC120\uD0DD) | "fill"(\uD14D\uC2A4\uD2B8\xB7\uB0B4\uC6A9) | "render"(\uB80C\uB354\uB7EC/CSS \uAC1C\uC120 \uC694\uCCAD \u2014 \uAC1C\uBC1C\uC790\uC6A9).
\uCD9C\uB825 JSON: { "rules": [ {"scope":"plan"|"fill"|"render", "text":"...", "evidence":"\uADFC\uAC70 \uC694\uC57D", "weight":1~3} ] }`;function k(a,t){let i=a.filter(e=>e.scope===t||e.scope==="all");return i.length?`
[\uB204\uC801 \uAC80\uC218\uC5D0\uC11C \uD559\uC2B5\uB41C \uCD94\uAC00 \uADDC\uCE59 \u2014 \uC6B0\uC120 \uC801\uC6A9]
${i.map((e,r)=>`${r+1}. ${e.text}`).join(`
`)}
`:""}var Z={"gochang-01-cover":{id:"gochang-01-cover",title:"\uD45C\uC9C0(\uC2DC\uB124\uB9C8\uD2F1): \uC0AC\uC9C4 \uBC31\uB4DC\uB86D + \uD070 \uC81C\uBAA9 + \uBA54\uD0C0 \uC904 + \uBC1C\uD45C\uC790 \uBC30\uC9C0 + \uBAA9\uCC28",kinds:["cover","section"],text:`<!-- EXEMPLAR: \uD45C\uC9C0 \u2014 \uC2DC\uB124\uB9C8\uD2F1 \uC0AC\uC9C4 \uBC31\uB4DC\uB86D + \uD070 \uC81C\uBAA9 + \uBC1C\uD45C\uC790 \uBC30\uC9C0 -->
<!-- \uBB34\uB300 \uD074\uB798\uC2A4: stage f-brand cine (cine = \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300) -->
<!-- HTML (\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC74C \u2014 <main class="stage"> \uC548 \uC804\uCCB4) -->
<div class="backdrop kb" data-allow-bleed><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="" style="--pos:70% 55%"><div class="credit">\uC0AC\uC9C4: Basile Morin \xB7 CC BY-SA 4.0 (Wikimedia Commons)</div></div>
  <section class="body">
    <div class="speaker" data-reveal="right" data-delay="900"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#C8102E"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff" font-family="Pretendard Variable,Malgun Gothic,Arial,sans-serif">GIST</text></svg><div class="n">\uC815\uC0C1\uD638 \uBC15\uC0AC<small>\uAD11\uC8FC\uACFC\uD559\uAE30\uC220\uC6D0(GIST)</small></div><span class="avatar">\uC815</span></div>
    <div class="hero">
      <div class="eyebrow" data-reveal data-delay="100"><i data-icon="sparkles"></i> \uACE0\uCC3D\uAD70\uB18D\uC5C5\uAE30\uC220\uC13C\uD130 AI \uC5ED\uB7C9\uAC15\uD654 \uAD50\uC721</div>
      <h1 class="hero-title" data-reveal data-delay="250">AI\uC640 \uD568\uAED8 \uC77C\uD558\uB294<br><em>\uACE0\uCC3D \uB18D\uC5C5</em></h1>
      <p class="hero-sub" data-reveal data-delay="450">2026\uB144 \uCD5C\uC2E0 AI \uD2B8\uB80C\uB4DC, \uACF5\uBB34\uC6D0\uC744 \uC704\uD55C \uC2E4\uC804 \uB3C4\uAD6C,<br>\uADF8\uB9AC\uACE0 \uACE0\uCC3D \uB18D\uC5C5 \uD604\uC7A5\uC5D0 \uBC14\uB85C \uC801\uC6A9\uD558\uB294 \uBC29\uBC95</p>
      <div class="meta-line" data-reveal data-delay="650">
        <span><i data-icon="sparkles"></i> <b>2026. 10. 30(\uAE08) 14:00</b></span>
        <span><i data-icon="map-pin"></i> <b>\uBAA9\uD3EC \uD574\uAD001897</b></span>
        <span><i data-icon="users"></i> \uACE0\uCC3D\uAD70\uB18D\uC5C5\uAE30\uC220\uC13C\uD130 \uC9C1\uC6D0 60\uBA85</span>
      </div>
      <div class="tags" data-reveal data-delay="800">
        <span class="chip">#ChatGPT</span><span class="chip">#Claude</span><span class="chip">#NotebookLM</span><span class="chip">#\uC2A4\uB9C8\uD2B8\uB18D\uC5C5</span><span class="chip">#\uBCD1\uD574\uCDA9 AI \uC9C4\uB2E8</span><span class="chip">#\uC548\uC804\uD55C \uD65C\uC6A9</span>
      </div>
    </div>
    <div class="agenda">
      <div class="st" data-reveal data-delay="1000"><b>\u2160</b>\uC65C \uC9C0\uAE08 AI\uC778\uAC00</div>
      <div class="st" data-reveal data-delay="1080"><b>\u2161</b>2026 AI\uC758 \uD604\uC7AC</div>
      <div class="st" data-reveal data-delay="1160"><b>\u2162</b>\uC2E4\uC804 \uB3C4\uAD6C</div>
      <div class="st" data-reveal data-delay="1240"><b>\u2163</b>\uB18D\uC5C5 \uD604\uC7A5\uC758 AI</div>
      <div class="st" data-reveal data-delay="1320"><b>\u2164</b>\uACE0\uCC3D \uC801\uC6A9 \uC2DC\uB098\uB9AC\uC624</div>
      <div class="st" data-reveal data-delay="1400"><b>\u2165</b>\uC548\uC804\uD558\uAC8C \uC4F0\uAE30</div>
      <div class="st" data-reveal data-delay="1480"><b>\u2166</b>\uC815\uB9AC\uC640 \uC9C8\uBB38</div>
    </div>
  </section>

<!-- CSS (per-slide) -->
<style>
.stage.cine .agenda .st{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 1px 0 rgba(255,255,255,.1) inset}
.stage.cine .agenda .st b{background:linear-gradient(135deg,var(--f),var(--f-alt))}
.stage.cine .speaker{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);box-shadow:none}
.stage.cine .speaker .n{color:#fff}.stage.cine .speaker .n small{color:rgba(255,255,255,.7)}
.stage.cine .hero .eyebrow{color:#C9D8FF}
.stage.cine .meta-line{color:rgba(255,255,255,.82)}.stage.cine .meta-line .ic{color:#9DB8FF}
</style>
`},"gochang-05-numbers":{id:"gochang-05-numbers",title:"\uC22B\uC790 \uCE74\uB4DC 2\uD589(\uADF8\uB8F9 \uD5E4\uB354+KPI \uD0C0\uC77C) + \uC624\uB978\uCABD \uCD94\uC138 \uD328\uB110 + \uACB0\uB860 \uCE74\uB4DC",kinds:["numbers","story","list"],text:`<!-- EXEMPLAR: \uC0AC\uB78C\uC740 \uC904\uACE0, \uC77C\uC740 \uB298\uC5B4\uB09C\uB2E4 \u2014 \uC22B\uC790 \uCE74\uB4DC 2\uD589 + \uC624\uB978\uCABD \uACB0\uB860 \uD328\uB110 -->
<!-- HTML (goes inside <section class="body">) -->
<div class="wrap">
      <div class="left">
        <div class="grp">
          <div class="gh" data-reveal="left" data-delay="250"><span class="icon-circle"><i data-icon="users"></i></span><b>\uC0AC\uB78C</b><span class="s">\uC8FC\uBBFC \xB7 \uACE0\uB839\uD654 \xB7 \uB18D\uAC00</span><span class="chip dn"><i data-icon="trending-down"></i> \uC904\uACE0</span></div>
          <div class="tiles">
            <div class="card tile" data-reveal data-delay="400">
              <div class="top"><span class="icon-circle"><i data-icon="user"></i></span><span class="t">\uC8FC\uBBFC\uB4F1\uB85D\uC778\uAD6C</span><span class="tag">2026-09-30</span></div>
              <div class="mid"><div class="vrow"><span class="v" data-count="49996" data-delay="400">49,996</span><span class="u">\uBA85</span></div><div class="d">8-31 <b>50,025\uBA85</b> \u2192 9-30 <b>49,996\uBA85</b></div></div>
              <div class="ft"><span class="chip dn"><i data-icon="arrow-down-right"></i> 5\uB9CC \uBA85 \uC120 \uD558\uD68C</span></div>
            </div>
            <div class="card tile" data-reveal data-delay="520">
              <div class="top"><span class="icon-circle"><i data-icon="percent"></i></span><span class="t">65\uC138 \uC774\uC0C1 \uBE44\uC728</span><span class="tag">2026-09</span></div>
              <div class="mid"><div class="vrow"><span class="v" data-count="42" data-decimals="1" data-delay="520">42.0</span><span class="u">%</span></div><div class="d">\uD3C9\uADE0\uC5F0\uB839 <b>56.2\uC138</b> \xB7 \uD589\uC815\uC548\uC804\uBD80</div></div>
              <div class="ft"><span>65\uC138 \uC774\uC0C1</span><div class="bar" data-bar="42" data-delay="900"><i></i></div><b>42.0%</b></div>
            </div>
            <div class="card tile" data-reveal data-delay="640">
              <div class="top"><span class="icon-circle"><i data-icon="home"></i></span><span class="t">\uB18D\uAC00</span><span class="tag">2024</span></div>
              <div class="mid"><div class="vrow"><span class="v" data-count="7755" data-delay="640">7,755</span><span class="u">\uAC00\uAD6C</span></div><div class="d">KOSIS \xB7 \uC804\uBD81\uB18D\uC5C5\uAE30\uC220\uC6D0</div></div>
              <div class="ft"><span>\uB18D\uAC00\uC778\uAD6C</span><b>15,050\uBA85</b><span>\xB7 2024</span></div>
            </div>
          </div>
        </div>
        <div class="grp">
          <div class="gh" data-reveal="left" data-delay="850"><span class="icon-circle"><i data-icon="tractor"></i></span><b>\uC77C</b><span class="s">\uACBD\uC9C0 \xB7 \uBCBC \xB7 \uC2DC\uC124\uD558\uC6B0\uC2A4</span><span class="chip up"><i data-icon="trending-up"></i> \uB298\uC5B4\uB09C\uB2E4</span></div>
          <div class="tiles">
            <div class="card tile" data-reveal data-delay="1000">
              <div class="top"><span class="icon-circle"><i data-icon="layers"></i></span><span class="t">\uACBD\uC9C0\uBA74\uC801</span><span class="tag">2024</span></div>
              <div class="mid"><div class="vrow"><span class="v" data-count="23447" data-delay="1000">23,447</span><span class="u">ha</span></div><div class="d">\uB17C <b>12,422ha</b> \xB7 \uBC2D <b>11,025ha</b></div></div>
              <div class="ft col" data-reveal="fade" data-delay="1400"><div class="seg"><i class="a"></i><i class="b"></i></div><div class="lg"><span><i></i>\uB17C 12,422ha</span><span><i class="b"></i>\uBC2D 11,025ha</span></div></div>
            </div>
            <div class="card tile" data-reveal data-delay="1120">
              <div class="top"><span class="icon-circle"><i data-icon="wheat"></i></span><span class="t">\uBCBC \uC7AC\uBC30\uBA74\uC801</span><span class="tag">2025</span></div>
              <div class="mid"><div class="vrow"><span class="v" data-count="11115" data-delay="1120">11,115</span><span class="u">ha</span></div><div class="d">2025\uB144 \uC7AC\uBC30\uBA74\uC801 \uC9D1\uACC4</div></div>
              <div class="ft"><span>\uB17C \uBA74\uC801</span><b>12,422ha</b><span>\xB7 2024</span></div>
            </div>
            <div class="card tile" data-reveal data-delay="1240">
              <div class="top"><span class="icon-circle"><i data-icon="sprout"></i></span><span class="t">\uC2DC\uC124\uD558\uC6B0\uC2A4</span><span class="tag gold"><i data-icon="award"></i> \uC804\uBD81 1\uC704</span></div>
              <div class="mid"><div class="vrow"><span class="v" data-count="1260" data-delay="1240">1,260</span><span class="u">ha</span></div><div class="d">\uC804\uBD81 \uC804\uCCB4 \uC2DC\uC124\uD558\uC6B0\uC2A4\uC758 <b>22%</b></div></div>
              <div class="ft"><span>\uC804\uBD81 \uB0B4 \uBE44\uC911</span><div class="bar" data-bar="22" data-delay="1500"><i></i></div><b>22%</b></div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="card trend" data-reveal="right" data-delay="1600">
          <div class="card-title"><span class="icon-circle dn"><i data-icon="trending-down"></i></span>\uB18D\uAC00\uC778\uAD6C, 2009 \u2192 2024</div>
          <div class="cap">\uC9D1\uACC4 \uAE30\uC900 \uC0C1\uC774 \xB7 \uCC38\uACE0\uCE58</div>
          <div class="brow old" data-reveal data-delay="1800"><span class="y">2009\uB144</span><div class="bar" data-bar="100" data-delay="1900"><i></i></div><span class="n">24,478\uBA85</span></div>
          <div class="brow" data-reveal data-delay="2050"><span class="y">2024\uB144</span><div class="bar" data-bar="61.5" data-delay="2150"><i></i></div><span class="n">15,050\uBA85</span></div>
          <div class="delta" data-reveal="scale" data-delay="2450"><b>\u221238%</b><span>\uC57D 38% \uAC10\uC18C<small>\uB18D\uAC00\uC778\uAD6C 24,478\uBA85 \u2192 15,050\uBA85</small></span></div>
        </div>
        <div class="card tint life" data-reveal="right" data-delay="2700">
          <span class="icon-circle up"><i data-icon="trending-up"></i></span>
          <div><div class="t">\uC0DD\uD65C\uC778\uAD6C</div><div class="vrow"><span class="v" data-count="42" data-delay="2700">42</span><span class="u">\uB9CC \uBA85</span></div><div class="d">2025-05 \xB7 2\uB144 \uC5F0\uC18D \uC99D\uAC00</div></div>
        </div>
        <div class="card solid why" data-reveal data-delay="2950">
          <div class="k"><i data-icon="lightbulb"></i> \uC774 \uC22B\uC790\uC758 \uB73B</div>
          <p>\uC8FC\uBBFC\uC740 \uC904\uACE0, \uBC29\uBB38\uAC1D\xB7\uC0AC\uC5C5\uC740 \uB298\uC5B4\uB09C\uB2E4</p>
          <b>\uC801\uC740 \uC778\uC6D0\uC73C\uB85C \uB354 \uB9CE\uC740 \uC77C = AI\uB97C \uC4F0\uB294 \uC774\uC720</b>
        </div>
      </div>
    </div>
<!-- CSS (per-slide) -->
<style>
/* ---- layout ---- */
.wrap{display:grid;grid-template-columns:minmax(0,1fr) 560px;gap:26px;flex:1;min-height:0}
.left{display:grid;grid-template-rows:1fr 1fr;gap:20px;min-height:0}
.grp{display:flex;flex-direction:column;gap:12px;min-height:0}
.gh{display:flex;align-items:center;gap:12px;padding:0 4px;flex:none}
.gh .icon-circle{width:38px;height:38px}
.gh .icon-circle .ic{width:20px;height:20px}
.gh b{font-size:21px;font-weight:800;color:var(--ink)}
.gh .s{font-size:16px;font-weight:600;color:var(--muted)}
.gh .chip{margin-left:4px}
.chip .ic{width:16px;height:16px}
.chip.dn{background:var(--danger-100);color:var(--danger)}
.chip.up{background:var(--ok-100);color:var(--ok)}
.icon-circle.dn{background:var(--danger-100);color:var(--danger)}
.icon-circle.up{background:var(--ok-100);color:var(--ok)}
/* ---- KPI tiles ---- */
.tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;flex:1;min-height:0}
.tile{padding:22px 26px;display:flex;flex-direction:column;min-height:0}
.tile .top{display:flex;align-items:center;gap:12px;flex:none}
.tile .top .icon-circle{width:48px;height:48px}
.tile .top .icon-circle .ic{width:24px;height:24px}
.tile .top .t{font-size:19px;font-weight:700;color:var(--muted);line-height:1.25}
.tile .top .tag{margin-left:auto;font-size:16px;font-variant-numeric:tabular-nums;white-space:nowrap}
.tile .top .tag.gold{background:var(--gold-100);color:var(--gold);display:inline-flex;align-items:center;gap:5px}
.tile .top .tag .ic{width:15px;height:15px}
.tile .mid{margin-top:auto;padding-top:10px}
.vrow{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.vrow .v{font-size:60px;font-weight:800;color:var(--ink);letter-spacing:-.03em;line-height:1.05;font-variant-numeric:tabular-nums}
.vrow .u{font-size:24px;font-weight:700;color:var(--f)}
.tile .d{font-size:17px;color:var(--muted);line-height:1.45;margin-top:6px}
.tile .d b{color:var(--ink);font-variant-numeric:tabular-nums}
.tile .ft{margin-top:auto;padding-top:14px;display:flex;align-items:center;gap:10px;font-size:16px;color:var(--muted);flex:none}
.tile .ft.col{flex-direction:column;align-items:stretch;gap:8px}
.tile .ft .bar{flex:1;height:10px}
.tile .ft b{color:var(--ink);font-variant-numeric:tabular-nums}
.tile .bar>i{transition-delay:var(--d,0ms)}
.seg{display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--card-3)}
.seg i{display:block;height:100%}
.seg .a{width:53%;background:var(--f)}
.seg .b{width:47%;background:color-mix(in srgb,var(--f) 38%,var(--card-3))}
.lg{display:flex;justify-content:space-between;gap:12px;font-size:16px;color:var(--muted)}
.lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px;background:var(--f)}
.lg i.b{background:color-mix(in srgb,var(--f) 38%,var(--card-3))}
/* ---- right column ---- */
.right{display:flex;flex-direction:column;gap:18px;min-height:0}
.trend{flex:1;min-height:0;display:flex;flex-direction:column;padding:24px 28px}
.trend .card-title{font-size:25px;margin-bottom:4px}
.trend .card-title .icon-circle{width:48px;height:48px}
.trend .card-title .icon-circle .ic{width:24px;height:24px}
.trend .cap{font-size:16px;color:var(--muted);margin-bottom:auto}
.brow{display:grid;grid-template-columns:72px minmax(0,1fr) 100px;align-items:center;gap:12px;margin-top:18px}
.brow .y{font-size:18px;font-weight:700;color:var(--muted)}
.brow .n{font-size:19px;font-weight:800;color:var(--ink);text-align:right;font-variant-numeric:tabular-nums}
.brow .bar{height:16px}
.brow.old .bar>i{background:var(--line-2)}
.brow .bar>i{transition-delay:var(--d,0ms)}
.delta{display:flex;align-items:center;gap:18px;margin-top:auto;padding-top:22px}
.delta b{font-size:54px;font-weight:800;color:var(--danger);letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}
.delta span{font-size:18px;color:var(--text);line-height:1.4;font-weight:600}
.delta span small{display:block;font-size:16px;color:var(--faint);font-weight:500}
.life{display:flex;align-items:center;gap:20px;padding:20px 28px;flex:none}
.life .icon-circle{width:60px;height:60px}
.life .icon-circle .ic{width:30px;height:30px}
.life .t{font-size:18px;font-weight:700;color:var(--muted)}
.life .vrow .v{font-size:46px}
.life .vrow .u{font-size:22px;color:var(--ok)}
.life .d{font-size:16px;color:var(--muted);margin-top:2px}
.why{flex:none;padding:24px 28px;display:flex;flex-direction:column;gap:8px}
.why .k{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:rgba(255,255,255,.82);letter-spacing:.02em}
.why .k .ic{width:18px;height:18px}
.why p{font-size:20px;color:rgba(255,255,255,.9);line-height:1.45}
.why b{font-size:27px;color:#fff;line-height:1.35;letter-spacing:-.01em}
</style>
`},"gochang-07-section":{id:"gochang-07-section",title:"\uC139\uC158 \uAC04\uC9C0(\uC2DC\uB124\uB9C8\uD2F1): \uC0AC\uC9C4 \uBC31\uB4DC\uB86D + \uB85C\uB9C8\uC22B\uC790 + \uC139\uC158\uBA85 + \uCE69 + \uC139\uC158 \uC9C4\uD589 \uD45C\uC2DC",kinds:["section"],text:`<!-- EXEMPLAR: \uC139\uC158 \uAC04\uC9C0 \u2014 \uC2DC\uB124\uB9C8\uD2F1 \uC0AC\uC9C4 \uBC31\uB4DC\uB86D + \uB85C\uB9C8\uC22B\uC790 + \uC139\uC158\uBA85 + \uC774 \uC139\uC158\uC5D0\uC11C \uB2E4\uB8F0 \uAC83 -->
<!-- \uBB34\uB300 \uD074\uB798\uC2A4: stage f-common cine no-rail (cine = \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300) -->
<!-- HTML (\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC74C \u2014 <main class="stage"> \uC548 \uC804\uCCB4) -->
<div class="backdrop kb" data-allow-bleed><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="" style="--pos:50% 50%;--view:inset(0 0 0 15%)"><div class="credit">\uC0AC\uC9C4: Oleg Alexandrov \xB7 CC BY-SA 4.0 (Wikimedia Commons)</div></div>
  <section class="body">
    <div class="hero">
      <div class="eyebrow" data-reveal data-delay="100">SECTION</div>
      <div class="sec-num" data-reveal="scale" data-delay="150">\u2161</div>
      <h1 class="hero-title" data-reveal data-delay="380">2026 AI\uC758 <em>\uD604\uC7AC</em></h1>
      <p class="hero-sub" data-reveal data-delay="600">\uC9C0\uB09C 60\uC77C, \uC138\uC0C1\uC740 \uC774\uB807\uAC8C \uBC14\uB00C\uC5C8\uB2E4</p>
      <svg class="rule" viewBox="0 0 150 6" aria-hidden="true"><line x1="3" y1="3" x2="147" y2="3" stroke="currentColor" stroke-width="6" stroke-linecap="round" data-draw data-delay="760"/></svg>
      <div class="chips">
        <span class="chip" data-reveal="scale" data-delay="900"><i data-icon="sparkles"></i> \uBAA8\uB378 \uC5F0\uD45C</span>
        <span class="chip" data-reveal="scale" data-delay="1000"><i data-icon="bot"></i> \uC5D0\uC774\uC804\uD2B8</span>
        <span class="chip" data-reveal="scale" data-delay="1100"><i data-icon="map-pin"></i> \uD55C\uAD6D\uACFC \uC804\uB0A8\uAD11\uC8FC</span>
      </div>
    </div>
    <div class="secs" style="--p:22%">
      <span class="s done" data-reveal="fade" data-delay="1300">\u2160</span>
      <span class="s on" data-reveal="fade" data-delay="1360">\u2161 <b>2026 AI\uC758 \uD604\uC7AC</b></span>
      <span class="s" data-reveal="fade" data-delay="1420">\u2162</span>
      <span class="s" data-reveal="fade" data-delay="1480">\u2163</span>
      <span class="s" data-reveal="fade" data-delay="1540">\u2164</span>
      <span class="s" data-reveal="fade" data-delay="1600">\u2165</span>
      <span class="s" data-reveal="fade" data-delay="1660">\u2166</span>
    </div>
  </section>

<!-- CSS (per-slide) -->
<style>
/* section divider \u2014 lead layout shared by 07 \xB7 18 \xB7 34 \xB7 46 */
.body{position:relative}
.hero{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;max-width:1020px;padding-bottom:36px}
.hero .eyebrow{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700;letter-spacing:.08em;color:var(--f);margin-bottom:18px}
.hero .eyebrow::before{content:'';width:10px;height:10px;border-radius:3px;background:var(--f)}
.hero .sec-num{font-size:150px;line-height:1.05;margin-left:-4px;margin-bottom:20px}
.backdrop img{object-view-box:var(--view,none)}
.hero .hero-title{font-size:88px}
.hero .hero-sub{font-size:30px;margin-top:14px}
.rule{display:block;width:150px;height:6px;color:var(--f);margin:30px 0 28px;overflow:visible}
.chips{display:flex;flex-wrap:wrap;gap:12px 12px;max-width:1000px}
.chips .chip{font-size:19px;padding:10px 20px 10px 16px;gap:9px;line-height:1.3}
.chips .chip .ic{width:22px;height:22px}
/* section progress (7 sections, current one named) */
.secs{position:relative;display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:auto;flex:none;max-width:1020px}
.secs::before{content:'';position:absolute;left:18px;right:18px;top:50%;height:3px;margin-top:-1.5px;background:var(--line-2);border-radius:2px}
.secs::after{content:'';position:absolute;left:18px;top:50%;height:3px;margin-top:-1.5px;width:var(--p,0%);background:var(--f);border-radius:2px}
.secs .s{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;height:36px;min-width:36px;padding:0 13px;border-radius:999px;background:var(--card);border:1px solid var(--line-2);color:var(--faint);font-size:16px;font-weight:700;letter-spacing:.02em;white-space:nowrap;box-shadow:var(--shadow)}
.secs .s.done{background:var(--f-100);border-color:transparent;color:var(--f)}
.secs .s.on{background:var(--f);border-color:transparent;color:#fff;padding:0 18px 0 14px}
.secs .s.on b{color:#fff;font-weight:700}
</style>
`},"gochang-10-three-companies":{id:"gochang-10-three-companies",title:"3\uC5F4 \uBE44\uAD50 \uCE74\uB4DC(\uC131\uACA9\xB7\uAC15\uC810\xB7\uC218\uCE58) + \uD558\uB2E8 \uACB0\uB860 \uBC34\uB4DC",kinds:["compare","concept"],text:`<!-- EXEMPLAR: \uC138 \uD68C\uC0AC, \uC138 \uAC00\uC9C0 \uC131\uACA9 \u2014 3\uC5F4 \uBE44\uAD50 \uCE74\uB4DC + \uD558\uB2E8 \uACB0\uB860 -->
<!-- HTML (goes inside <section class="body">) -->
<div class="wrap">
      <div class="trio">
        <div class="card co" data-reveal data-delay="250">
          <div class="top"><span class="mark openai"><svg class="ic logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg></span><div class="nm"><b>ChatGPT</b><span>OpenAI</span></div></div>
          <div class="trait" data-reveal data-delay="500"><small>\uC131\uACA9</small>\uAC00\uC7A5 \uB9CE\uC740 \uC0AC\uB78C\uC774 \uC4F0\uB294 AI</div>
          <ul>
            <li data-reveal data-delay="850"><span class="ico"><i data-icon="users"></i></span><div class="t"><b>\uC774\uC6A9\uC790</b></div><span class="n"><span data-count="12" data-suffix="\uC5B5" data-delay="850">12\uC5B5</span><small>/\uC8FC</small></span></li>
            <li data-reveal data-delay="950"><span class="ico"><i data-icon="sparkles"></i></span><div class="t"><b>\uB3C4\uAD6C \uBA54\uB274</b> \uC2EC\uCE35 \uB9AC\uC11C\uCE58 \xB7 \uC774\uBBF8\uC9C0 \xB7 \uC5D0\uC774\uC804\uD2B8</div></li>
            <li data-reveal data-delay="1050"><span class="ico"><i data-icon="bot"></i></span><div class="t"><b>\uC0C1\uC2DC \uC5D0\uC774\uC804\uD2B8 'Dots'</b></div><span class="tag">9/29</span></li>
          </ul>
          <div class="wm"><svg class="ic logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg></div>
        </div>
        <div class="card co" data-reveal data-delay="400">
          <div class="top"><span class="mark claude"><svg class="ic logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="12" x2="12.00" y2="2.50"/><line x1="12" y1="12" x2="15.25" y2="6.37"/><line x1="12" y1="12" x2="19.36" y2="7.75"/><line x1="12" y1="12" x2="19.00" y2="12.00"/><line x1="12" y1="12" x2="20.23" y2="16.75"/><line x1="12" y1="12" x2="15.25" y2="17.63"/><line x1="12" y1="12" x2="12.00" y2="20.50"/><line x1="12" y1="12" x2="8.50" y2="18.06"/><line x1="12" y1="12" x2="3.77" y2="16.75"/><line x1="12" y1="12" x2="5.50" y2="12.00"/><line x1="12" y1="12" x2="4.64" y2="7.75"/><line x1="12" y1="12" x2="8.50" y2="5.94"/></svg></span><div class="nm"><b>Claude</b><span>Anthropic</span></div></div>
          <div class="trait" data-reveal data-delay="650"><small>\uC131\uACA9</small>\uBB38\uC11C \xB7 \uCF54\uB4DC \xB7 \uAE34 \uC790\uB8CC\uC5D0 \uAC15\uD55C AI</div>
          <ul>
            <li data-reveal data-delay="1000"><span class="ico"><i data-icon="sparkles"></i></span><div class="t"><b>Cowork</b> \u201C\uC774\uC81C \uADF8\uB0E5 Claude\u201D</div></li>
            <li data-reveal data-delay="1100"><span class="ico"><i data-icon="cloud"></i></span><div class="t"><b>Duet</b></div><span class="tag">10/21 \uD504\uB9AC\uBDF0</span></li>
            <li data-reveal data-delay="1200"><span class="ico"><i data-icon="shield-check"></i></span><div class="t"><b>\uC548\uC804\uC7A5\uCE58</b> \uAC15\uC870</div></li>
          </ul>
          <div class="wm"><svg class="ic logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="12" x2="12.00" y2="2.50"/><line x1="12" y1="12" x2="15.25" y2="6.37"/><line x1="12" y1="12" x2="19.36" y2="7.75"/><line x1="12" y1="12" x2="19.00" y2="12.00"/><line x1="12" y1="12" x2="20.23" y2="16.75"/><line x1="12" y1="12" x2="15.25" y2="17.63"/><line x1="12" y1="12" x2="12.00" y2="20.50"/><line x1="12" y1="12" x2="8.50" y2="18.06"/><line x1="12" y1="12" x2="3.77" y2="16.75"/><line x1="12" y1="12" x2="5.50" y2="12.00"/><line x1="12" y1="12" x2="4.64" y2="7.75"/><line x1="12" y1="12" x2="8.50" y2="5.94"/></svg></div>
        </div>
        <div class="card co" data-reveal data-delay="550">
          <div class="top"><span class="mark gemini"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="gemg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs><path fill="url(#gemg)" d="M12 1.5c.55 5.75 4.75 9.95 10.5 10.5-5.75.55-9.95 4.75-10.5 10.5C11.45 16.75 7.25 12.55 1.5 12 7.25 11.45 11.45 7.25 12 1.5z"/></svg></span><div class="nm"><b>Gemini</b><span>Google</span></div></div>
          <div class="trait" data-reveal data-delay="800"><small>\uC131\uACA9</small>\uAD6C\uAE00\uACFC \uC5F0\uACB0\uB41C AI</div>
          <ul>
            <li data-reveal data-delay="1150"><span class="ico"><i data-icon="sparkles"></i></span><div class="t"><b>Gemini 4 Argon</b></div><span class="tag">10/13</span></li>
            <li data-reveal data-delay="1250"><span class="ico"><i data-icon="sparkles"></i></span><div class="t"><b>Gemini Notebook</b></div><span class="tag">\uAD6C NotebookLM \xB7 7/16 \uAC1C\uBA85</span></li>
            <li data-reveal data-delay="1350"><span class="ico"><i data-icon="sparkles"></i></span><div class="t"><b>\uAD6C\uAE00 \uBB38\uC11C \xB7 \uAC80\uC0C9</b>\uACFC \uC5F0\uACB0</div></li>
          </ul>
          <div class="wm"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="gemg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs><path fill="url(#gemg)" d="M12 1.5c.55 5.75 4.75 9.95 10.5 10.5-5.75.55-9.95 4.75-10.5 10.5C11.45 16.75 7.25 12.55 1.5 12 7.25 11.45 11.45 7.25 12 1.5z"/></svg></div>
        </div>
      </div>
      <div class="card tint ow" data-reveal data-delay="1550">
        <div class="lead"><span class="icon-circle solid"><i data-icon="sparkles"></i></span><div class="lt"><b>\uC624\uD508\uC6E8\uC774\uD2B8</b><span>\u201C\uB0B4\uB824\uBC1B\uC544 \uB0B4\uBD80\uB9DD\uC5D0\uC11C \uB3CC\uB9B4 \uC218 \uC788\uB294 \uBAA8\uB378\u201D</span></div></div>
        <div class="chips">
          <div class="m" data-reveal="scale" data-delay="1700"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#4D6BFE"/><path fill="#fff" d="M6 13.5c2-5 6-7 11.5-6.5-1 2.5-2.5 4-4.5 5 .5 1.5.2 3-.8 4.5-1-1-1.8-2.2-2.2-3.5-1.5.3-2.8.5-4 .5z"/></svg></span><div class="tx"><b>DeepSeek V4</b><span>4/24 \xB7 MIT</span></div></div>
          <div class="m" data-reveal="scale" data-delay="1800"><span class="lg mono">Q</span><div class="tx"><b>Qwen3.8</b><span>8/12</span></div></div>
          <div class="m" data-reveal="scale" data-delay="1900"><span class="lg mono">K</span><div class="tx"><b>Kimi K3</b><span>7/27</span></div></div>
          <div class="m" data-reveal="scale" data-delay="2000"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="4" height="4" fill="#F7D046"/><rect x="18" y="3" width="4" height="4" fill="#F7D046"/><rect x="2" y="7" width="8" height="4" fill="#F2A73B"/><rect x="14" y="7" width="8" height="4" fill="#F2A73B"/><rect x="2" y="11" width="20" height="4" fill="#EE792F"/><rect x="2" y="15" width="4" height="4" fill="#EB5829"/><rect x="10" y="15" width="4" height="4" fill="#EB5829"/><rect x="18" y="15" width="4" height="4" fill="#EB5829"/><rect x="2" y="19" width="4" height="2" fill="#EA3326"/><rect x="18" y="19" width="4" height="2" fill="#EA3326"/></svg></span><div class="tx"><b>Mistral Large 4</b><span>10/6</span></div></div>
        </div>
      </div>
    </div>
<!-- CSS (per-slide) -->
<style>
.wrap{display:grid;grid-template-rows:minmax(0,1fr) auto;gap:24px;flex:1;min-height:0}
.trio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;min-height:0}
.co{position:relative;display:flex;flex-direction:column;gap:22px;padding:30px 32px 30px;min-height:0}
.co .top{display:flex;align-items:center;gap:18px}
.co .mark{width:80px;height:80px;border-radius:24px;display:grid;place-items:center;flex:none;background:var(--card-2);border:1px solid var(--line)}
.co .mark .ic{width:44px;height:44px}
.co .mark.openai{background:var(--ink);color:var(--card);border-color:transparent}
.co .mark.claude{background:var(--mob);color:var(--card);border-color:transparent}
.co .mark.gemini{background:var(--card)}
.co .nm{display:flex;flex-direction:column;gap:3px;min-width:0}
.co .nm b{font-size:33px;font-weight:800;color:var(--ink);line-height:1.12;letter-spacing:-.015em}
.co .nm span{font-size:17px;color:var(--muted);font-weight:600}
.co .trait{padding:16px 20px;border-radius:var(--r-sm);background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 22%,var(--line));border-left:5px solid var(--f);font-size:24px;font-weight:800;color:var(--ink);line-height:1.35}
.co .trait small{display:block;font-size:16px;font-weight:700;color:var(--f);letter-spacing:.08em;margin-bottom:5px}
.co ul{display:flex;flex-direction:column;gap:14px;flex:1;min-height:0}
.co li{flex:1 1 0;min-height:0;display:flex;align-items:center;gap:14px;padding:10px 18px;border-radius:var(--r-xs);background:var(--card-2);border:1px solid var(--line);font-size:20px;color:var(--text);line-height:1.4}
.co li .ico{width:46px;height:46px;border-radius:50%;background:var(--f-100);color:var(--f);display:grid;place-items:center;flex:none}
.co li .ico .ic{width:23px;height:23px}
.co li .t{flex:1;min-width:0}
.co li .t b{color:var(--ink);font-weight:800}
.co li .tag{flex:none;white-space:nowrap;font-size:16px;padding:4px 11px}
.co li .n{flex:none;display:inline-flex;align-items:baseline;font-size:30px;font-weight:800;color:var(--f);letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums}
.co li .n small{font-size:17px;font-weight:700;color:var(--muted);margin-left:3px;letter-spacing:0}
.co .wm{right:28px;top:20px;bottom:auto;width:96px;height:96px;opacity:.07}
.ow{display:grid;grid-template-columns:auto 1fr;gap:30px;align-items:center;padding:22px 30px}
.ow .lead{display:flex;align-items:center;gap:16px;min-width:0}
.ow .lead .icon-circle{width:64px;height:64px}
.ow .lead .icon-circle .ic{width:32px;height:32px}
.ow .lead .lt b{display:block;font-size:25px;font-weight:800;color:var(--ink);line-height:1.2;white-space:nowrap}
.ow .lead .lt span{display:block;font-size:18px;color:var(--muted);margin-top:4px;white-space:nowrap}
.ow .chips{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.ow .m{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:var(--r-sm);background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow)}
.ow .m .lg{width:44px;height:44px;border-radius:50%;background:var(--f-100);display:grid;place-items:center;flex:none;color:var(--f);font-weight:800;font-size:19px}
.ow .m .lg .ic{width:27px;height:27px}
.ow .m .lg.mono{background:var(--f);color:var(--card)}
.ow .m .tx b{display:block;font-size:20px;color:var(--ink);line-height:1.2;white-space:nowrap}
.ow .m .tx span{display:block;font-size:17px;color:var(--muted);margin-top:3px;white-space:nowrap}
</style>
`},"gochang-12-chat-to-agent":{id:"gochang-12-chat-to-agent",title:"AS-IS/TO-BE \uBE44\uAD50: \uB450 \uD328\uB110\uC758 \uB2E8\uACC4 \uD750\uB984(\uC544\uC774\uCF58 \uCCB4\uC778) + \uC571 \uB85C\uADF8 \uBAA9\uC5C5 + \uC0AC\uB840 \uCE69 + \uD1B5\uACC4 \uCE74\uB4DC + \uBCF4\uB77C \uBA54\uC2DC\uC9C0 \uCE74\uB4DC",kinds:["compare","concept","demo","process"],text:`<!-- EXEMPLAR: \uCC44\uD305\u2192\uC5D0\uC774\uC804\uD2B8 \u2014 AS-IS/TO-BE \uB450 \uD328\uB110\uC758 \uB2E8\uACC4 \uD750\uB984 + \uC571 \uBAA9\uC5C5\uD615 \uB85C\uADF8 + \uC0AC\uB840 \uCE69 + \uD1B5\uACC4 \uCE74\uB4DC + \uBCF4\uB77C \uBA54\uC2DC\uC9C0 \uCE74\uB4DC -->
<!-- HTML (goes inside <section class="body">) -->
<div class="vs">
      <div class="card side f-danger" data-reveal="left" data-delay="150">
        <div class="side-head"><span class="chip solid">AS-IS \xB7 2024</span><b>\uCC44\uD305 \u2014 <em>\uBB3B\uACE0 \uB2F5\uD558\uAE30</em></b></div>
        <div class="flow">
          <div class="node" data-reveal data-delay="300"><span class="icon-circle"><i data-icon="message-square"></i></span><span class="who h">\uC0AC\uB78C</span><b>\uC9C8\uBB38</b></div>
          <i class="nx"><i data-icon="bot"></i></i>
          <div class="node" data-reveal data-delay="420"><span class="icon-circle"><i data-icon="bot"></i></span><span class="who a">AI</span><b>\uB2F5\uBCC0</b></div>
          <i class="nx"><i data-icon="user"></i></i>
          <div class="node" data-reveal data-delay="540"><span class="icon-circle"><i data-icon="file-text"></i></span><span class="who h">\uC0AC\uB78C</span><b>\uBCF5\uC0AC\xB7\uBD99\uC5EC\uB123\uAE30</b></div>
        </div>
        <div class="log">
          <div class="lh"><i data-icon="folder"></i> \uC9C8\uBB38: <b>\uBCF5\uBD84\uC790 \uCD9C\uD558 \uC548\uB0B4\uBB38 \uCD08\uC548 \uC368 \uC918</b><span class="tag">\uAC15\uC758\uC6A9 \uC608\uC2DC</span></div>
          <div class="ln" data-reveal data-delay="700"><span class="who a">AI</span><span class="tx">\uB2F5\uBCC0 \uC0DD\uC131</span><span class="st"><i data-icon="check"></i></span></div>
          <div class="ln" data-reveal data-delay="850"><span class="who h">\uC0AC\uB78C</span><span class="tx">\uB2F5\uBCC0 \uBCF5\uC0AC <span class="kbd">Ctrl+C</span></span><span class="st"><i data-icon="check"></i></span></div>
          <div class="ln" data-reveal data-delay="1000"><span class="who h">\uC0AC\uB78C</span><span class="tx">\uBA54\uC77C\xB7\uD55C\uAE00 \uBB38\uC11C\uC5D0 \uBD99\uC5EC\uB123\uAE30 <span class="kbd">Ctrl+V</span></span><span class="st"><i data-icon="check"></i></span></div>
          <div class="ln" data-reveal data-delay="1150"><span class="who h">\uC0AC\uB78C</span><span class="tx">\uC9C1\uC811 \uBC1C\uC1A1</span><span class="st"><i data-icon="check"></i></span></div>
          <div class="ln" data-reveal data-delay="1300"><span class="who h">\uC0AC\uB78C</span><span class="tx">\uB2E4\uC74C \uC791\uC5C5\uB9C8\uB2E4 \uCC98\uC74C\uBD80\uD130 \uBC18\uBCF5</span><span class="st loop"><i data-icon="refresh"></i></span></div>
        </div>
      </div>
      <div class="arrow" data-reveal="scale" data-delay="650"><span class="ring pulse"><i data-icon="arrow-right"></i></span></div>
      <div class="card side f-ok" data-reveal="right" data-delay="700">
        <div class="side-head"><span class="chip solid">TO-BE \xB7 2026</span><b>\uC5D0\uC774\uC804\uD2B8 \u2014 <em>\uB300\uC2E0 '\uD574\uC8FC\uB294' AI</em></b></div>
        <div class="flow">
          <div class="node" data-reveal data-delay="850"><span class="icon-circle"><i data-icon="target"></i></span><span class="who h">\uC0AC\uB78C</span><b>\uBAA9\uD45C</b></div>
          <i class="nx"><i data-icon="mail"></i></i>
          <div class="node" data-reveal data-delay="970"><span class="icon-circle"><i data-icon="check"></i></span><span class="who a">AI</span><b>\uD30C\uC77C\xB7\uBE0C\uB77C\uC6B0\uC800\xB7\uC571 \uC870\uC791</b></div>
          <i class="nx"><i data-icon="clipboard"></i></i>
          <div class="node key" data-reveal data-delay="1090"><span class="icon-circle pulse"><i data-icon="calendar"></i></span><span class="who h">\uC0AC\uB78C</span><b>\uC2B9\uC778</b></div>
          <i class="nx"><i data-icon="globe"></i></i>
          <div class="node" data-reveal data-delay="1210"><span class="icon-circle"><i data-icon="send"></i></span><span class="who a">AI</span><b>\uC644\uB8CC</b></div>
        </div>
        <div class="log">
          <div class="lh"><i data-icon="target"></i> \uBAA9\uD45C: <b>\uBCF5\uBD84\uC790 \uCD9C\uD558 \uC548\uB0B4\uBB38 \uC791\uC131 \uB4A4 \uB18D\uAC00 \uBC1C\uC1A1</b><span class="tag">\uC9C4\uD589 \uB85C\uADF8 \xB7 \uAC15\uC758\uC6A9 \uC608\uC2DC</span></div>
          <div class="ln" id="t1" data-reveal data-delay="1400"><span class="who a">AI</span><span class="tx"><i data-icon="folder"></i> \uD30C\uC77C \xB7 \uCD9C\uD558 \uC77C\uC815.xlsx \uC77D\uAE30</span><span class="st sw"><i class="spin" data-hide-at="#t2"><i data-icon="search"></i></i><i class="done" data-reveal="fade" data-at="#t2"><i data-icon="check"></i></i></span></div>
          <div class="ln" id="t2" data-reveal data-delay="1800"><span class="who a">AI</span><span class="tx"><i data-icon="globe"></i> \uBE0C\uB77C\uC6B0\uC800 \xB7 \uAD70 \uB204\uB9AC\uC9D1 \uC11C\uC2DD \uD655\uC778</span><span class="st sw"><i class="spin" data-hide-at="#t3"><i data-icon="zap"></i></i><i class="done" data-reveal="fade" data-at="#t3"><i data-icon="check"></i></i></span></div>
          <div class="ln" id="t3" data-reveal data-delay="2200"><span class="who a">AI</span><span class="tx"><i data-icon="layers"></i> \uC571 \xB7 \uD55C\uAE00 \uBB38\uC11C \uCD08\uC548 \uC791\uC131</span><span class="st sw"><i class="spin" data-hide-at="#t4"><i data-icon="shield-check"></i></i><i class="done" data-reveal="fade" data-at="#t4"><i data-icon="check"></i></i></span></div>
          <div class="ln key" id="t4" data-reveal data-delay="2600"><span class="who h">\uC0AC\uB78C</span><span class="tx"><i data-icon="message-square"></i> <b>\uC2B9\uC778</b> \xB7 \uBC1C\uC1A1 \uC804 \uB0B4\uC6A9 \uD655\uC778</span><span class="st sw2"><i class="pend" data-hide-at="#t5"><i data-icon="hourglass"></i> \uC2B9\uC778 \uB300\uAE30</i><i class="done" data-reveal="fade" data-at="#t5"><i data-icon="check"></i> \uC2B9\uC778\uB428</i></span></div>
          <div class="ln" id="t5" data-reveal data-delay="3100"><span class="who a">AI</span><span class="tx"><i data-icon="bot"></i> \uC644\uB8CC \xB7 \uC548\uB0B4\uBB38 \uBC1C\uC1A1</span><span class="st"><i data-icon="user"></i></span></div>
        </div>
      </div>
    </div>
    <div class="block">
      <div class="rowh" data-reveal data-delay="1500"><i data-icon="file-text"></i> 2026 \uC5D0\uC774\uC804\uD2B8 \uC0AC\uB840</div>
      <div class="cases">
        <div class="case" data-reveal data-delay="1600"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg></span><div class="t"><b>OpenAI Dots<span class="tag">9/29</span></b><span class="d">\uC0C1\uC2DC \uC120\uC81C \uC5D0\uC774\uC804\uD2B8</span></div></div>
        <div class="case" data-reveal data-delay="1700"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="12" x2="12.00" y2="2.50"/><line x1="12" y1="12" x2="15.25" y2="6.37"/><line x1="12" y1="12" x2="19.36" y2="7.75"/><line x1="12" y1="12" x2="19.00" y2="12.00"/><line x1="12" y1="12" x2="20.23" y2="16.75"/><line x1="12" y1="12" x2="15.25" y2="17.63"/><line x1="12" y1="12" x2="12.00" y2="20.50"/><line x1="12" y1="12" x2="8.50" y2="18.06"/><line x1="12" y1="12" x2="3.77" y2="16.75"/><line x1="12" y1="12" x2="5.50" y2="12.00"/><line x1="12" y1="12" x2="4.64" y2="7.75"/><line x1="12" y1="12" x2="8.50" y2="5.94"/></svg></span><div class="t"><b>Claude Cowork<span class="tag">1/12</span></b><span class="d">\uD504\uB9AC\uBDF0 \u2192 Pro\xB7Max \uAE30\uBCF8 \uC81C\uACF5</span></div></div>
        <div class="case" data-reveal data-delay="1800"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="12" x2="12.00" y2="2.50"/><line x1="12" y1="12" x2="15.25" y2="6.37"/><line x1="12" y1="12" x2="19.36" y2="7.75"/><line x1="12" y1="12" x2="19.00" y2="12.00"/><line x1="12" y1="12" x2="20.23" y2="16.75"/><line x1="12" y1="12" x2="15.25" y2="17.63"/><line x1="12" y1="12" x2="12.00" y2="20.50"/><line x1="12" y1="12" x2="8.50" y2="18.06"/><line x1="12" y1="12" x2="3.77" y2="16.75"/><line x1="12" y1="12" x2="5.50" y2="12.00"/><line x1="12" y1="12" x2="4.64" y2="7.75"/><line x1="12" y1="12" x2="8.50" y2="5.94"/></svg></span><div class="t"><b>Claude Duet<span class="tag">10/21</span></b><span class="d">\uAE30\uAE30 \uAEBC\uC838\uB3C4 \uC791\uC5C5 \xB7 \uBC1C\uC1A1 \uC804 \uC2B9\uC778</span></div></div>
        <div class="case" data-reveal data-delay="1900"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="gemg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs><path fill="url(#gemg)" d="M12 1.5c.55 5.75 4.75 9.95 10.5 10.5-5.75.55-9.95 4.75-10.5 10.5C11.45 16.75 7.25 12.55 1.5 12 7.25 11.45 11.45 7.25 12 1.5z"/></svg></span><div class="t"><b>Gemini Skills<span class="tag">9/30</span></b><span class="d">Google</span></div></div>
        <div class="case" data-reveal data-delay="2000"><span class="lg"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/></svg></span><div class="t"><b>Copilot Cowork<span class="tag">6/18</span></b><span class="d">Microsoft \xB7 \uC815\uC2DD \uCD9C\uC2DC</span></div></div>
      </div>
    </div>
    <div class="block">
      <div class="rowh" data-reveal data-delay="2100"><i data-icon="bar-chart"></i> McKinsey State of AI \xB7 2026-08</div>
      <div class="kpis">
        <div class="card" data-reveal data-delay="2200">
          <div class="kpi"><div class="v" data-count="40" data-suffix="%">40%</div><div class="l">\uB9E4\uCD9C 10\uC5B5 \uB2EC\uB7EC \uC774\uC0C1 \uAE30\uC5C5 \uC911 \uC5D0\uC774\uC804\uD2B8\uB97C \uC2A4\uCF00\uC77C\uB9C1\uD558\uB294 \uAE30\uC5C5</div></div>
          <div class="cmp">
            <div class="row prev"><span class="yr">\uC804\uB144</span><div class="bar" data-bar="27" data-delay="2400"><i></i></div><span class="val">27%</span></div>
            <div class="row"><span class="yr">2026</span><div class="bar" data-bar="40" data-delay="2500"><i></i></div><span class="val">40%</span></div>
          </div>
        </div>
        <div class="card" data-reveal data-delay="2350">
          <div class="kpi" style="max-width:none"><div class="v" data-count="37" data-suffix="%">37%</div><div class="l">EBIT(\uC601\uC5C5\uC774\uC775) \uAE30\uC5EC\uB97C \uBCF4\uACE0\uD55C \uAE30\uC5C5 <span class="chip gray"><i data-icon="folder"></i> \uC815\uCCB4</span></div></div>
        </div>
        <div class="card solid msg" data-reveal data-delay="2500">
          <span class="icon-circle"><i data-icon="mail"></i></span>
          <div><div class="l">\uACF5\uBB34\uC6D0\uC744 \uC704\uD55C \uBA54\uC2DC\uC9C0</div><b>"\uC2B9\uC778 \uB2E8\uACC4\uAC00 \uC788\uB294 \uB3C4\uAD6C\uB9CC \uC5C5\uBB34\uC5D0"</b></div>
        </div>
      </div>
    </div>

<!-- CSS (per-slide) -->
<style>
.body{gap:14px}
.vs{flex:1;min-height:0;grid-template-columns:.9fr 80px 1.1fr;grid-template-rows:minmax(0,1fr);gap:18px}
.vs .arrow .ring{width:72px;height:72px;border-radius:50%;background:var(--f-100);display:grid;place-items:center;color:var(--f)}
.vs .arrow .ring .ic{width:40px;height:40px}
.side{display:flex;flex-direction:column;padding:20px 24px;min-height:0}
.side-head{display:flex;align-items:center;gap:14px;margin-bottom:12px}
.side-head .chip{font-size:16px;padding:4px 13px}
.side-head b{font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-.01em;line-height:1.25}
.side-head b em{font-style:normal;color:var(--f)}
.flow{display:flex;align-items:flex-start;gap:4px;margin-bottom:12px}
.flow .node{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}
.flow .node .icon-circle{width:58px;height:58px}
.flow .node .icon-circle .ic{width:28px;height:28px}
.flow .node b{font-size:18px;line-height:1.3;color:var(--ink)}
.flow .node.key .icon-circle{--f:var(--gold);background:var(--gold);color:#fff}
.flow .nx{flex:none;width:24px;margin-top:17px;color:var(--line-2)}
.flow .nx .ic{width:24px;height:24px}
.who{display:inline-block;font-size:16px;font-weight:800;line-height:1.2;padding:2px 8px;border-radius:7px;letter-spacing:.02em}
.who.h{background:var(--navy-100);color:var(--navy)}
.who.a{background:var(--common-100);color:var(--common)}
.log{flex:1;min-height:0;display:flex;flex-direction:column;gap:6px;padding:10px 14px;border-radius:var(--r-sm);background:var(--card-2);border:1px solid var(--line);overflow:hidden}
.log .lh{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--muted);padding-bottom:6px;margin-bottom:1px;border-bottom:1px solid var(--line);min-height:32px}
.log .lh .ic{width:18px;height:18px;flex:none}
.log .lh b{color:var(--ink);font-weight:700}
.log .lh .tag{margin-left:auto;font-size:16px;padding:1px 8px;flex:none}
.log .ln{display:flex;align-items:center;gap:10px;min-height:34px;font-size:18px;line-height:1.3;color:var(--text);padding:0 6px;border-radius:9px}
.log .ln .who{flex:none;width:52px;text-align:center;padding:2px 0}
.log .ln .tx{display:flex;align-items:center;gap:7px;min-width:0}
.log .ln .tx .ic{width:18px;height:18px;color:var(--muted);flex:none}
.log .ln .st{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:6px;font-size:16px;font-weight:700;color:var(--ok)}
.log .ln .st .ic{width:18px;height:18px}
.log .ln .st.sw{position:relative;width:18px;height:18px}
.log .ln .st.sw i{position:absolute;inset:0;display:inline-flex;align-items:center;justify-content:center;font-style:normal}
.log .ln .st.sw .spin{color:var(--muted)}
.log .ln .st.sw .spin .ic{animation:spin 1s linear infinite}
.log .ln .st.sw2{position:relative;width:118px;height:24px}
.log .ln .st.sw2 i{position:absolute;right:0;top:0;height:24px;display:inline-flex;align-items:center;gap:5px;font-style:normal;white-space:nowrap}
.log .ln .st.sw2 .pend{color:var(--gold)}
.log .ln .st.loop{color:var(--danger)}
.log .ln.key{background:var(--gold-100);border:1px solid color-mix(in srgb,var(--gold) 40%,var(--line));padding:2px 8px}
.log .ln.key .tx b{color:var(--ink)}
.log .ln.key .tx .ic{color:var(--gold)}
.log .kbd{font-size:16px;padding:0 7px;line-height:1.3}
.block{display:flex;flex-direction:column;gap:8px}
.rowh{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:700;color:var(--muted);line-height:1.4}
.rowh .ic{width:18px;height:18px;color:var(--f)}
.cases{display:grid;grid-template-columns:.9fr 1.05fr 1.25fr .8fr 1fr;gap:14px}
.case{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-sm);box-shadow:var(--shadow);min-width:0}
.case .lg{width:42px;height:42px;border-radius:12px;background:var(--card-2);border:1px solid var(--line);display:grid;place-items:center;flex:none}
.case .lg .ic{width:24px;height:24px}
.case .t{min-width:0;display:flex;flex-direction:column;gap:2px}
.case .t b{font-size:18px;color:var(--ink);display:flex;align-items:center;gap:8px;line-height:1.25}
.case .t .tag{font-size:16px;padding:1px 7px;line-height:1.3;flex:none}
.case .t .d{font-size:16px;color:var(--muted);line-height:1.35}
.kpis{display:grid;grid-template-columns:1.15fr .85fr 1fr;gap:18px}
.kpis .card{padding:16px 22px;display:flex;align-items:center;gap:20px}
.kpis .kpi{flex:none;max-width:250px}
.kpis .kpi .v{font-size:38px}
.kpis .kpi .l{font-size:16px;line-height:1.35}
.kpis .kpi .l .chip{font-size:16px;padding:2px 10px;margin-left:6px;vertical-align:middle}
.kpis .cmp{flex:1;display:flex;flex-direction:column;gap:9px;min-width:0}
.kpis .cmp .row{display:flex;align-items:center;gap:10px;font-size:16px;color:var(--muted);font-weight:600}
.kpis .cmp .row .yr{width:48px;flex:none;white-space:nowrap}
.kpis .cmp .row .bar{flex:1;height:10px}
.kpis .cmp .row .val{width:40px;text-align:right;flex:none;color:var(--ink);font-weight:800;font-variant-numeric:tabular-nums}
.kpis .cmp .row.prev .bar>i{background:var(--line-2)}
.kpis .msg{gap:16px}
.kpis .msg .icon-circle{background:rgba(255,255,255,.2);color:#fff;width:52px;height:52px}
.kpis .msg .icon-circle .ic{width:26px;height:26px}
.kpis .msg .l{font-size:16px;opacity:.85;font-weight:600;margin-bottom:3px}
.kpis .msg b{font-size:23px;line-height:1.3;display:block;letter-spacing:-.01em}
</style>
`},"gochang-21-prompt-formula":{id:"gochang-21-prompt-formula",title:"4\uCE78(+1) \uACF5\uC2DD \u2192 \uC870\uB9BD\uB41C \uACB0\uACFC \uCEF4\uD3EC\uC800(\uC21C\uCC28 \uB4F1\uC7A5)",kinds:["process","concept"],text:`<!-- EXEMPLAR: \uD504\uB86C\uD504\uD2B8 \uACF5\uC2DD \u2014 4\uCE78 \uC21C\uCC28 \u2192 \uC870\uB9BD\uB41C \uD504\uB86C\uD504\uD2B8 \uCEF4\uD3EC\uC800 -->
<!-- HTML (goes inside <section class="body">) -->
<div class="wrap">
      <div class="formula">
        <div class="card fx" id="b1" data-reveal data-delay="150">
          <div class="hd"><span class="num">1</span><h3>\uC5ED\uD560</h3><span class="icon-circle"><i data-icon="user"></i></span></div>
          <p class="def">\uB2F9\uC2E0\uC740 \u25CB\u25CB\uC785\uB2C8\uB2E4</p>
          <div class="ex"><div class="exl"><i data-icon="quote"></i> \uC608\uC2DC</div><div class="tw"><p class="t" id="ex1" data-reveal data-delay="800">\uB2F9\uC2E0\uC740<br>\uACE0\uCC3D\uAD70\uB18D\uC5C5\uAE30\uC220\uC13C\uD130<br><span class="nb">\u25CB\u25CB\uD300 \uC8FC\uBB34\uAD00\uC785\uB2C8\uB2E4</span></p></div></div>
        </div>
        <div class="plus" data-reveal="scale" data-delay="300"><i><i data-icon="arrow-right"></i></i></div>
        <div class="card fx" id="b2" data-reveal data-delay="300">
          <div class="hd"><span class="num">2</span><h3>\uB9E5\uB77D</h3><span class="icon-circle"><i data-icon="layers"></i></span></div>
          <p class="def">\uC0C1\uD669\xB7\uC790\uB8CC\xB7\uB3C5\uC790</p>
          <div class="ex"><div class="exl"><i data-icon="quote"></i> \uC608\uC2DC</div><div class="chips"><span data-reveal="scale" data-delay="2020">\uD3ED\uC5FC</span><span data-reveal="scale" data-delay="2160">\uC218\uBC15 \uB18D\uAC00 200\uACF3</span></div></div>
        </div>
        <div class="plus" data-reveal="scale" data-delay="450"><i><i data-icon="arrow-right"></i></i></div>
        <div class="card fx" id="b3" data-reveal data-delay="450">
          <div class="hd"><span class="num">3</span><h3>\uACFC\uC5C5</h3><span class="icon-circle"><i data-icon="target"></i></span></div>
          <p class="def">\uBB34\uC5C7\uC744 \uB9CC\uB4E4\uC9C0</p>
          <div class="ex"><div class="exl"><i data-icon="quote"></i> \uC608\uC2DC</div><div class="chips"><span data-reveal="scale" data-delay="2460">\uC548\uB0B4\uBB38</span><span data-reveal="scale" data-delay="2600">\uB2F5\uBCC0</span><span data-reveal="scale" data-delay="2740">\uACC4\uD68D\uC11C \uBAA9\uCC28</span></div></div>
        </div>
        <div class="plus" data-reveal="scale" data-delay="600"><i><i data-icon="arrow-right"></i></i></div>
        <div class="card fx" id="b4" data-reveal data-delay="600">
          <div class="hd"><span class="num">4</span><h3>\uD615\uC2DD</h3><span class="icon-circle"><i data-icon="type"></i></span></div>
          <p class="def">\uBD84\uB7C9\xB7\uC5B4\uC870\xB7\uAD6C\uC870</p>
          <div class="ex"><div class="exl"><i data-icon="quote"></i> \uC608\uC2DC</div><div class="chips"><span data-reveal="scale" data-delay="3040">A4 1\uC7A5</span><span data-reveal="scale" data-delay="3180">\uC874\uB313\uB9D0</span><span data-reveal="scale" data-delay="3320">\uD45C</span></div></div>
        </div>
        <div class="plus solid" data-reveal="scale" data-delay="3500"><i class="pulse"><i data-icon="arrow-right"></i></i></div>
        <div class="card fx tint more" id="b5" data-reveal="scale" data-delay="3650">
          <div class="hd"><span class="num">+1</span><h3>\uAC80\uD1A0 \uAE30\uC900</h3><span class="icon-circle solid"><i data-icon="check-circle"></i></span></div>
          <p class="def">\uACF5\uBB34\uC6D0\uC6A9 \uD55C \uCE78 \uB354</p>
          <div class="ex"><div class="exl"><i data-icon="quote"></i> \uC608\uC2DC</div>
            <div class="cis">
              <div class="ci" data-reveal="left" data-delay="3920"><i data-icon="check"></i><span>\uD655\uC778\uC774 \uD544\uC694\uD55C \uC218\uCE58\uB294 [\uD655\uC778]\uC73C\uB85C \uD45C\uC2DC</span></div>
              <div class="ci" data-reveal="left" data-delay="4080"><i data-icon="check"></i><span>\uBC95\uB839 \uC870\uBB38\uC740 \uCD94\uC815 \uAE08\uC9C0</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="prompt" data-reveal data-delay="500">
        <div class="plab"><i data-icon="sparkles"></i> \uB2E4\uC12F \uCE78\uC744 \uC774\uC5B4 \uBD99\uC774\uBA74 \uD504\uB86C\uD504\uD2B8 \uD55C \uAC1C</div>
        <div class="ptext"><p>
          <span class="seg" data-reveal="fade" data-delay="1980"><i>1</i>\uB2F9\uC2E0\uC740 \uACE0\uCC3D\uAD70\uB18D\uC5C5\uAE30\uC220\uC13C\uD130 <span class="nb">\u25CB\u25CB\uD300 \uC8FC\uBB34\uAD00\uC785\uB2C8\uB2E4</span></span><span class="seg" data-reveal="fade" data-delay="2320"><i>2</i>\uD3ED\uC5FC, \uC218\uBC15 \uB18D\uAC00 200\uACF3</span><span class="seg" data-reveal="fade" data-delay="2900"><i>3</i>\uC548\uB0B4\uBB38</span><span class="seg" data-reveal="fade" data-delay="3480"><i>4</i>A4 1\uC7A5, \uC874\uB313\uB9D0, \uD45C</span><br><span class="seg hi" data-reveal="fade" data-delay="4220"><i>+1</i>\uD655\uC778\uC774 \uD544\uC694\uD55C \uC218\uCE58\uB294 [\uD655\uC778]\uC73C\uB85C \uD45C\uC2DC, \uBC95\uB839 \uC870\uBB38\uC740 \uCD94\uC815 \uAE08\uC9C0</span>
        </p></div>
        <div class="ptool"><span class="btn"><i data-icon="arrow-right"></i></span><span class="btn"><i data-icon="sparkles"></i></span><span class="send" data-reveal="scale" data-delay="4500"><i data-icon="sparkles"></i></span></div>
      </div>
      <div class="aux">
        <div class="card flat ax" id="ax1" data-reveal data-delay="1700">
          <div class="lead"><span class="chip">\uBCF4\uC870 \uACF5\uC2DD</span><b class="nm">RISEN</b><span class="use"><i data-icon="workflow"></i> \uB2E4\uB2E8\uACC4 \uBBFC\uC6D0 \uCC98\uB9AC</span></div>
          <div class="letters">
            <div class="lt" data-reveal="scale" data-delay="4020"><b>R</b><span>\uC5ED\uD560</span></div>
            <div class="lt" data-reveal="scale" data-delay="4100"><b>I</b><span>\uC9C0\uC2DC</span></div>
            <div class="lt" data-reveal="scale" data-delay="4180"><b>S</b><span>\uB2E8\uACC4</span></div>
            <div class="lt" data-reveal="scale" data-delay="4260"><b>E</b><span>\uBAA9\uD45C</span></div>
            <div class="lt" data-reveal="scale" data-delay="4340"><b>N</b><span>\uBC94\uC704</span></div>
          </div>
        </div>
        <div class="card flat ax" id="ax2" data-reveal data-delay="1850">
          <div class="lead"><span class="chip">\uBCF4\uC870 \uACF5\uC2DD</span><b class="nm">CO-STAR</b><span class="use"><i data-icon="sparkles"></i> \uBCF4\uB3C4\uC790\uB8CC</span></div>
          <div class="letters">
            <div class="lt" data-reveal="scale" data-delay="4020"><b>C</b><span>\uB9E5\uB77D</span></div>
            <div class="lt" data-reveal="scale" data-delay="4100"><b>O</b><span>\uBAA9\uD45C</span></div>
            <div class="lt" data-reveal="scale" data-delay="4180"><b>S</b><span>\uC2A4\uD0C0\uC77C</span></div>
            <div class="lt" data-reveal="scale" data-delay="4260"><b>T</b><span>\uC5B4\uC870</span></div>
            <div class="lt" data-reveal="scale" data-delay="4340"><b>A</b><span>\uB3C5\uC790</span></div>
            <div class="lt" data-reveal="scale" data-delay="4420"><b>R</b><span>\uC751\uB2F5</span></div>
          </div>
        </div>
      </div>
    </div>
<!-- CSS (per-slide) -->
<style>
/* 21 \xB7 \uD504\uB86C\uD504\uD2B8 \uACF5\uC2DD \u2014 4\uCE78(+1) \uC21C\uCC28 \u2192 \uC870\uB9BD\uB41C \uD504\uB86C\uD504\uD2B8(\uCEF4\uD3EC\uC800) \u2192 \uBCF4\uC870 \uACF5\uC2DD */
.wrap{flex:1;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) 236px 164px;gap:20px}
/* row 1: formula boxes + connectors */
.formula{display:grid;grid-template-columns:1fr 30px 1fr 30px 1fr 30px 1fr 30px 1fr;gap:8px;align-items:stretch;min-height:0}
.fx{position:relative;display:flex;flex-direction:column;padding:22px 22px 20px;min-height:0}
.fx .hd{display:flex;align-items:center;gap:12px}
.fx .hd .num{width:40px;height:40px;font-size:18px}
.fx .hd h3{font-size:29px;font-weight:800;color:var(--ink);line-height:1.1;letter-spacing:-.01em}
.fx .hd .icon-circle{margin-left:auto;width:48px;height:48px}
.fx .hd .icon-circle .ic{width:24px;height:24px}
.fx .def{margin-top:12px;font-size:19px;color:var(--muted);line-height:1.4;font-weight:500}
.fx .ex{margin-top:14px;flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:14px 16px 16px;border-radius:var(--r-sm);background:var(--f-50);border:1px solid color-mix(in srgb,var(--f) 18%,var(--line))}
.fx .ex .exl{display:flex;align-items:center;gap:6px;font-size:16px;font-weight:700;color:var(--f);letter-spacing:.02em}
.fx .ex .exl .ic{width:16px;height:16px}
.fx .ex .tw{flex:1;min-height:0;display:flex;align-items:center}
.fx .ex .t{font-size:22px;line-height:1.5;color:var(--ink);font-weight:600}
.fx .ex .chips{flex:1;min-height:0;display:flex;flex-wrap:wrap;gap:9px;align-content:center}
.fx .ex .chips span{display:inline-flex;align-items:center;height:40px;padding:0 15px;border-radius:999px;background:var(--card);border:1px solid color-mix(in srgb,var(--f) 32%,var(--line));box-shadow:var(--shadow);font-size:20px;font-weight:700;color:var(--ink);white-space:nowrap}
.fx .ex .cis{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:12px}
.fx .ex .ci{display:flex;align-items:flex-start;gap:8px;font-size:20px;line-height:1.45;color:var(--ink);font-weight:600}
.fx .ex .ci .ic{width:22px;height:22px;color:var(--f);margin-top:3px;flex:none}
/* the +1 box */
.fx.more{border:2px solid color-mix(in srgb,var(--f) 60%,var(--line));box-shadow:var(--shadow-lg)}
.fx.more .def{color:var(--f);font-weight:700}
.fx.more .ex{background:var(--card);border-color:color-mix(in srgb,var(--f) 28%,var(--line))}
.plus{display:grid;place-items:center}
.plus i{width:30px;height:30px;border-radius:50%;background:var(--f-100);color:var(--f);display:grid;place-items:center}
.plus i .ic{width:18px;height:18px}
.plus.solid i{background:var(--f);color:var(--card)}
.nb{white-space:nowrap}
/* row 2: assembled prompt, composer look */
.prompt{display:flex;flex-direction:column;gap:10px;padding:18px 22px 14px 26px;border-radius:26px;background:var(--card);border:1.5px solid var(--line-2);box-shadow:var(--shadow-lg);min-height:0}
.prompt .plab{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:700;color:var(--muted)}
.prompt .plab .ic{width:20px;height:20px;color:var(--f)}
.prompt .ptext{flex:1;min-height:0;display:flex;align-items:center;font-size:24px;line-height:1.6;color:var(--ink);font-weight:500}
.prompt .ptext p{margin:0}
.prompt .seg{display:inline;margin-right:18px}
.prompt .seg i{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 8px;border-radius:999px;background:var(--f);color:var(--card);font-size:16px;font-weight:800;font-style:normal;margin-right:8px;vertical-align:-4px;line-height:1}
.prompt .seg.hi{color:var(--f);font-weight:700}
.prompt .ptool{display:flex;align-items:center;gap:10px}
.prompt .ptool .btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--line-2);display:grid;place-items:center;color:var(--ink)}
.prompt .ptool .btn .ic{width:20px;height:20px}
.prompt .ptool .send{margin-left:auto;width:42px;height:42px;border-radius:50%;background:var(--ink);color:var(--bg);display:grid;place-items:center}
.prompt .ptool .send .ic{width:22px;height:22px}
/* row 3: helper formulas */
.aux{display:grid;grid-template-columns:1fr 1fr;gap:20px;min-height:0}
.ax{display:flex;align-items:center;gap:22px;padding:18px 26px;min-height:0}
.ax .lead{flex:none;width:206px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.ax .lead .nm{font-size:32px;font-weight:800;color:var(--ink);letter-spacing:.01em;line-height:1.1}
.ax .lead .use{display:flex;align-items:center;gap:8px;font-size:17px;color:var(--muted);font-weight:600}
.ax .lead .use .ic{width:20px;height:20px;color:var(--f)}
.ax .letters{flex:1;display:flex;gap:14px;justify-content:center}
.ax .lt{display:flex;flex-direction:column;align-items:center;gap:7px;min-width:64px}
.ax .lt b{width:56px;height:56px;border-radius:16px;background:var(--card);border:1px solid var(--line-2);color:var(--f);display:grid;place-items:center;font-size:27px;font-weight:800;box-shadow:var(--shadow)}
.ax .lt span{font-size:18px;color:var(--text);font-weight:600;white-space:nowrap}
</style>
`},"gochang-60-closing":{id:"gochang-60-closing",title:"\uB9C8\uBB34\uB9AC(\uC2DC\uB124\uB9C8\uD2F1): \uAC10\uC0AC \uC778\uC0AC + \uC9C8\uBB38/\uD1A0\uB860 \uC548\uB0B4 + \uC5F0\uB77D\uCC98",kinds:["closing"],text:`<!-- EXEMPLAR: \uB9C8\uBB34\uB9AC \u2014 \uC2DC\uB124\uB9C8\uD2F1 \uAC10\uC0AC \uC778\uC0AC + \uC9C8\uBB38/\uD1A0\uB860 \uC548\uB0B4 + \uC5F0\uB77D\uCC98 -->
<!-- \uBB34\uB300 \uD074\uB798\uC2A4: stage f-brand cine (cine = \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300) -->
<!-- HTML (\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC74C \u2014 <main class="stage"> \uC548 \uC804\uCCB4) -->
<div class="backdrop kb" data-allow-bleed><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="" style="--pos:50% 62%"><div class="credit dark">\uC0AC\uC9C4: Basile Morin \xB7 CC BY-SA 4.0 (Wikimedia Commons)</div></div>
  <section class="body">
    <div class="hero">
      <div class="eyebrow" data-reveal data-delay="100"><i data-icon="sparkles"></i> \u2166 \xB7 \uD074\uB85C\uC9D5 \xB7 AI\uC640 \uD568\uAED8 \uC77C\uD558\uB294 \uACE0\uCC3D \uB18D\uC5C5</div>
      <h1 class="hero-title" data-reveal data-delay="250">\uAC10\uC0AC\uD569\uB2C8\uB2E4</h1>
      <svg class="uline" viewBox="0 0 400 18" width="400" height="18" aria-hidden="true"><path d="M6 12 C 100 3, 280 3, 394 9" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" data-draw data-delay="650"/></svg>
      <div class="qa" data-reveal data-delay="500"><span class="icon-circle solid"><i data-icon="sparkles"></i></span><div class="t"><b>\uC9C8\uBB38\uACFC \uD1A0\uB860</b><span class="chip solid">Q&amp;A</span></div></div>
      <div class="speaker" data-reveal data-delay="700"><svg class="ic logo" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#C8102E"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff" font-family="Pretendard Variable,Malgun Gothic,Arial,sans-serif">GIST</text></svg><div class="n">\uC815\uC0C1\uD638 \uBC15\uC0AC<small>\uAD11\uC8FC\uACFC\uD559\uAE30\uC220\uC6D0 GIST</small></div><span class="avatar">\uC815</span></div>
      <div class="readme" data-reveal data-delay="860"><i data-icon="sparkles"></i><span>\uC790\uB8CC\uC758 \uC218\uCE58\xB7\uCD9C\uCC98 \uBAA9\uB85D\uC740 <b>README</b>\uC5D0</span></div>
    </div>
    <div class="keys">
      <div class="kl" data-reveal data-delay="980"><i data-icon="sparkles"></i> \uC624\uB298\uC758 \uD0A4\uC6CC\uB4DC</div>
      <div class="row">
        <div class="k" data-reveal data-delay="1080"><span class="icon-circle"><i data-icon="sparkles"></i></span>\uC5ED\uD560\xB7\uB9E5\uB77D\xB7\uACFC\uC5C5\xB7\uD615\uC2DD</div>
        <div class="k" data-reveal data-delay="1160"><span class="icon-circle"><i data-icon="smartphone"></i></span>AI \uC774\uC0AD\uC774 2.0</div>
        <div class="k" data-reveal data-delay="1240"><span class="icon-circle"><i data-icon="sparkles"></i></span>\uC804\uBD81AI</div>
        <div class="k" data-reveal data-delay="1320"><span class="icon-circle"><i data-icon="sparkles"></i></span>\uC870\uAE30\uACBD\uBCF4 5.4%</div>
        <div class="k" data-reveal data-delay="1400"><span class="icon-circle"><i data-icon="sparkles"></i></span>\uAC80\uC99D 10\uBD84</div>
        <div class="k" data-reveal data-delay="1480"><span class="icon-circle"><i data-icon="sparkles"></i></span>\uCD08\uC548\uC740 AI, \uCC45\uC784\uC740 \uC0AC\uB78C</div>
      </div>
    </div>
  </section>
  <div class="source">\uD0A4\uC6CC\uB4DC \uC218\uCE58\uC758 \uCD9C\uCC98: \uBCF8\uBB38 \uD574\uB2F9 \uC2AC\uB77C\uC774\uB4DC \xB7 README \uCD9C\uCC98 \uBAA9\uB85D</div>

<!-- CSS (per-slide) -->
<style>
.stage.cine .source{background:rgba(10,16,34,.55);color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.14);font-style:normal}.stage.cine .keys .k{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.16);color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 1px 0 rgba(255,255,255,.1) inset}.stage.cine .keys .k .icon-circle{background:rgba(255,255,255,.12);color:#fff}.stage.cine .keys .kl{color:#C9D8FF}.stage.cine .hero .eyebrow{color:#C9D8FF}.stage.cine .speaker{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);box-shadow:none}.stage.cine .speaker .n{color:#fff}.stage.cine .speaker .n small{color:rgba(255,255,255,.7)}.stage.cine .readme{color:rgba(255,255,255,.75)}.stage.cine .readme b{color:#C9D8FF}.stage.cine .readme .ic{color:#C9D8FF}.stage.cine .qa .t b{color:#C9D8FF}.stage.cine .qa .icon-circle{background:rgba(255,255,255,.12);color:#fff}
</style>
`},"ir-01-cover":{id:"ir-01-cover",title:"\uD45C\uC9C0(\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC74C): \uC81C\uD488 \uBAA9\uC5C5 \uC0AC\uC9C4 + \uD070 \uC81C\uBAA9 + KPI \uB760 + \uBC1C\uD45C\uC790/QR",kinds:["cover"],text:`<!-- EXEMPLAR: \uD45C\uC9C0 \u2014 \uC81C\uD488 \uBAA9\uC5C5 \uC0AC\uC9C4 + \uD070 \uC81C\uBAA9 + KPI \uB760 + \uBC1C\uD45C\uC790/QR (\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC774 \uBB34\uB300 \uC804\uCCB4 \uAD6C\uC131) -->
<!-- \uBB34\uB300 \uD074\uB798\uC2A4: stage f-brand (cine = \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300) -->
<!-- HTML (\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC74C \u2014 <main class="stage"> \uC548 \uC804\uCCB4) -->
<div class="amb" data-allow-bleed data-allow-scroll><canvas data-particles="70" data-area=".52,1" data-alpha=".9" data-seed="11"></canvas><i class="orb a"></i><i class="orb b"></i></div>
  <div class="irbar"><img class="lg" data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="Qpresen"><div class="rt">INVESTOR RELATIONS<i></i><b>2026</b></div></div>
  <div class="left">
    <div class="toprow" data-reveal>
      <span class="pill w"><span class="dot live"></span>qpresen.com \uC2E4\uC11C\uBE44\uC2A4 \uC6B4\uC601 \uC911</span>
      <span class="pill o">AI PRESENTATION PLATFORM</span>
    </div>
    <div class="lockup" data-reveal>
      <img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="Qpresen \uD050\uD504\uB9AC\uC820">
      <div class="kick">\uD050\uD504\uB9AC\uC820<b>INVESTOR DECK</b></div>
    </div>
    <h1 class="hero" data-reveal="up">AI\uAC00 \uB9CC\uB4E0 <span class="gtext">\uB3D9\uC801 \uBC1C\uD45C</span>\uB97C,<br>\uC2A4\uB9C8\uD2B8\uD3F0 \uD558\uB098\uB85C \uBB34\uB300 \uC704\uC5D0.</h1>
    <p class="lead" data-reveal>\uC790\uB8CC \uC0DD\uC131 \xB7 \uB77C\uC774\uBE0C \uC81C\uC5B4 \xB7 \uC2E4\uC2DC\uAC04 \uBC88\uC5ED \xB7 \uCCAD\uC911 \uCC38\uC5EC\uB97C <b>\uD558\uB098\uC758 \uC6F9 \uC138\uC158</b>\uC73C\uB85C.<br>\uC571 \uC124\uCE58 \uC5C6\uC774 <b>QR \uD55C \uBC88</b>\uC774\uBA74 \uC2DC\uC791\uB418\uB294 \uBB34\uC124\uCE58 AI \uD504\uB808\uC820\uD14C\uC774\uC158 \uD50C\uB7AB\uD3FC</p>
    <div class="kstrip" data-reveal>
      <div><div class="v live"><i></i>LIVE</div><div class="l">qpresen.com<br>\uC2E4\uC11C\uBE44\uC2A4 \uC6B4\uC601</div></div>
      <div><div class="v" data-count="11">11<small>/11</small></div><div class="l">\uD575\uC2EC \uAE30\uB2A5<br>\uD504\uB85C\uD1A0\uD0C0\uC785 \uAD6C\uD604</div></div>
      <div><div class="v" data-count="35">35<small>\uD56D</small></div><div class="l">\uD2B9\uD5C8 \uCD9C\uC6D0 \uCCAD\uAD6C\uD56D<br>+ \uC0C1\uD45C \uCD9C\uC6D0</div></div>
      <div><div class="v" data-count="2">2<small>\uC885</small></div><div class="l">\uC2A4\uB9C8\uD2B8\uAE00\uB798\uC2A4 \uC571<br>\uC2E4\uAE30 \uAC80\uC99D</div></div>
    </div>
    <div class="meta" data-reveal>
      <span><b>\uB300\uD45C \uC815\uC0C1\uD638</b>\uACF5\uD559\uBC15\uC0AC</span><span class="sep"></span>
      <span>\u321C\uD050\uD504\uB9AC\uC820 \uBC95\uC778 \uC124\uB9BD \uC608\uC815 2026.12</span><span class="sep"></span>
      <span>2026.11</span>
    </div>
  </div>
  <div class="comp">
    <div class="halo"></div>
    <div class="orbit o2"></div>
    <div class="orbit o1 spin-slow"><i class="sat"></i></div>
    <div class="scrbox" data-reveal="zoom" data-delay="250">
      <div class="screen" data-cycle="2800" id="scr" data-allow-scroll>
        <div class="shot" data-step><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="\uB3D9\uC801 HTML \uC2AC\uB77C\uC774\uB4DC \u2014 \uBC18\uB3C4\uCCB4 \uC138\uBBF8\uB098"></div>
        <div class="shot" data-step><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="\uB3D9\uC801 HTML \uC2AC\uB77C\uC774\uB4DC \u2014 \uACE0\uCC3D AI \uAD50\uC721"></div>
        <div class="shot" data-step><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="\uB3D9\uC801 HTML \uC2AC\uB77C\uC774\uB4DC \u2014 \uC218\uC728 \uC2DC\uBBAC\uB808\uC774\uC158"></div>
        <div class="shot" data-step><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="\uB3D9\uC801 HTML \uC2AC\uB77C\uC774\uB4DC \u2014 AI \uD604\uD669 \uCC28\uD2B8"></div>
        <canvas id="laser"></canvas>
        <span class="pill live"><span class="dot live"></span>LIVE \xB7 \uBC1C\uD45C \uC911</span>
      </div>
      <div class="screen-label">AUDITORIUM SCREEN</div>
    </div>
    <svg class="link" viewBox="0 0 870 900" aria-hidden="true">
      <defs><linearGradient id="lk01" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1A8CFF"/><stop offset="1" stop-color="#9B4DFF"/></linearGradient></defs>
      <path d="M190 300 C 200 210, 250 180, 300 170" fill="none" stroke="url(#lk01)" stroke-width="2.5" class="flow" opacity=".85"/>
      <circle r="5" fill="#5B63FF"><animateMotion dur="1.8s" repeatCount="indefinite" path="M190 300 C 200 210, 250 180, 300 170"/></circle>
    </svg>
    <div class="phonebox" data-reveal="up" data-delay="420">
      <div class="phone tilt" data-tilt="1"><i class="cam"></i><div class="scr"><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="Qpresen \uC2A4\uB9C8\uD2B8\uD3F0 \uB9AC\uBAA8\uCEE8 \uC2E4\uC81C \uD654\uBA74"><i class="tap off" id="tap"></i></div></div>
    </div>
    <div class="card glass capcard" data-reveal data-delay="700">
      <div class="h"><span class="k-eyebrow">LIVE CAPTION \xB7 \uC2E4\uC2DC\uAC04 \uBC88\uC5ED</span><span class="langs" id="langs"><span class="on">KO</span><span>EN</span><span>JA</span><span>VI</span></span></div>
      <div class="txt" id="cap">\uC548\uB155\uD558\uC2ED\uB2C8\uAE4C, \uD050\uD504\uB9AC\uC820 \uB300\uD45C \uC815\uC0C1\uD638\uC785\uB2C8\uB2E4.</div>
    </div>
    <div class="card glass chip-pin" data-reveal data-delay="820">
      <div class="ring" id="ring"><span id="sec">62</span></div>
      <div><div class="k-small">QR \xB7 PIN \uBB34\uC124\uCE58 \uC785\uC7A5</div><div class="pin">482 917</div></div>
    </div>
    <div class="card glass chip-poll" data-reveal data-delay="900">
      <div class="k-eyebrow" style="font-size:14px">LIVE POLL \xB7 \uCCAD\uC911 \uD22C\uD45C (\uC2DC\uC5F0)</div>
      <div class="row"><span>\uC2E4\uC2DC\uAC04 \uC790\uB9C9\uC774 \uD544\uC694\uD558\uB2E4</span><span id="pv">62%</span></div>
      <div class="bar" data-bar="62" id="pbar"><i></i></div>
    </div>
    <div class="hud hudchip" data-reveal data-delay="980">
      <div class="t"><span>GLASS \xB7 03/12</span><span>02:45</span></div>
      <div>\u25B6 \uCCAD\uC911\uC5D0\uAC8C QR \uC2A4\uCE94 \uC548\uB0B4</div>
    </div>
    <div class="card glass qrcard" data-reveal data-delay="1060">
      <div class="qr"><svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-label="qpresen.com QR"><path d="M0,0h1v1h-1zM1,0h1v1h-1zM2,0h1v1h-1zM3,0h1v1h-1zM4,0h1v1h-1zM5,0h1v1h-1zM6,0h1v1h-1zM9,0h1v1h-1zM11,0h1v1h-1zM12,0h1v1h-1zM14,0h1v1h-1zM18,0h1v1h-1zM19,0h1v1h-1zM20,0h1v1h-1zM21,0h1v1h-1zM22,0h1v1h-1zM23,0h1v1h-1zM24,0h1v1h-1zM0,1h1v1h-1zM6,1h1v1h-1zM8,1h1v1h-1zM9,1h1v1h-1zM13,1h1v1h-1zM14,1h1v1h-1zM16,1h1v1h-1zM18,1h1v1h-1zM24,1h1v1h-1zM0,2h1v1h-1zM2,2h1v1h-1zM3,2h1v1h-1zM4,2h1v1h-1zM6,2h1v1h-1zM8,2h1v1h-1zM9,2h1v1h-1zM10,2h1v1h-1zM11,2h1v1h-1zM12,2h1v1h-1zM14,2h1v1h-1zM18,2h1v1h-1zM20,2h1v1h-1zM21,2h1v1h-1zM22,2h1v1h-1zM24,2h1v1h-1zM0,3h1v1h-1zM2,3h1v1h-1zM3,3h1v1h-1zM4,3h1v1h-1zM6,3h1v1h-1zM8,3h1v1h-1zM9,3h1v1h-1zM10,3h1v1h-1zM11,3h1v1h-1zM13,3h1v1h-1zM16,3h1v1h-1zM18,3h1v1h-1zM20,3h1v1h-1zM21,3h1v1h-1zM22,3h1v1h-1zM24,3h1v1h-1zM0,4h1v1h-1zM2,4h1v1h-1zM3,4h1v1h-1zM4,4h1v1h-1zM6,4h1v1h-1zM11,4h1v1h-1zM12,4h1v1h-1zM13,4h1v1h-1zM16,4h1v1h-1zM18,4h1v1h-1zM20,4h1v1h-1zM21,4h1v1h-1zM22,4h1v1h-1zM24,4h1v1h-1zM0,5h1v1h-1zM6,5h1v1h-1zM9,5h1v1h-1zM11,5h1v1h-1zM14,5h1v1h-1zM18,5h1v1h-1zM24,5h1v1h-1zM0,6h1v1h-1zM1,6h1v1h-1zM2,6h1v1h-1zM3,6h1v1h-1zM4,6h1v1h-1zM5,6h1v1h-1zM6,6h1v1h-1zM8,6h1v1h-1zM10,6h1v1h-1zM12,6h1v1h-1zM14,6h1v1h-1zM16,6h1v1h-1zM18,6h1v1h-1zM19,6h1v1h-1zM20,6h1v1h-1zM21,6h1v1h-1zM22,6h1v1h-1zM23,6h1v1h-1zM24,6h1v1h-1zM8,7h1v1h-1zM9,7h1v1h-1zM10,7h1v1h-1zM14,7h1v1h-1zM15,7h1v1h-1zM16,7h1v1h-1zM0,8h1v1h-1zM6,8h1v1h-1zM8,8h1v1h-1zM10,8h1v1h-1zM11,8h1v1h-1zM17,8h1v1h-1zM18,8h1v1h-1zM21,8h1v1h-1zM22,8h1v1h-1zM23,8h1v1h-1zM0,9h1v1h-1zM2,9h1v1h-1zM3,9h1v1h-1zM4,9h1v1h-1zM11,9h1v1h-1zM13,9h1v1h-1zM14,9h1v1h-1zM15,9h1v1h-1zM16,9h1v1h-1zM17,9h1v1h-1zM19,9h1v1h-1zM20,9h1v1h-1zM21,9h1v1h-1zM22,9h1v1h-1zM23,9h1v1h-1zM2,10h1v1h-1zM3,10h1v1h-1zM4,10h1v1h-1zM5,10h1v1h-1zM6,10h1v1h-1zM10,10h1v1h-1zM13,10h1v1h-1zM14,10h1v1h-1zM15,10h1v1h-1zM18,10h1v1h-1zM19,10h1v1h-1zM21,10h1v1h-1zM23,10h1v1h-1zM24,10h1v1h-1zM0,11h1v1h-1zM3,11h1v1h-1zM5,11h1v1h-1zM7,11h1v1h-1zM8,11h1v1h-1zM13,11h1v1h-1zM15,11h1v1h-1zM16,11h1v1h-1zM18,11h1v1h-1zM21,11h1v1h-1zM24,11h1v1h-1zM1,12h1v1h-1zM2,12h1v1h-1zM3,12h1v1h-1zM6,12h1v1h-1zM7,12h1v1h-1zM10,12h1v1h-1zM12,12h1v1h-1zM13,12h1v1h-1zM16,12h1v1h-1zM18,12h1v1h-1zM24,12h1v1h-1zM0,13h1v1h-1zM1,13h1v1h-1zM3,13h1v1h-1zM9,13h1v1h-1zM10,13h1v1h-1zM15,13h1v1h-1zM16,13h1v1h-1zM17,13h1v1h-1zM19,13h1v1h-1zM23,13h1v1h-1zM0,14h1v1h-1zM4,14h1v1h-1zM6,14h1v1h-1zM9,14h1v1h-1zM11,14h1v1h-1zM12,14h1v1h-1zM15,14h1v1h-1zM16,14h1v1h-1zM18,14h1v1h-1zM19,14h1v1h-1zM20,14h1v1h-1zM21,14h1v1h-1zM23,14h1v1h-1zM24,14h1v1h-1zM0,15h1v1h-1zM2,15h1v1h-1zM3,15h1v1h-1zM4,15h1v1h-1zM5,15h1v1h-1zM11,15h1v1h-1zM19,15h1v1h-1zM21,15h1v1h-1zM22,15h1v1h-1zM24,15h1v1h-1zM0,16h1v1h-1zM3,16h1v1h-1zM6,16h1v1h-1zM11,16h1v1h-1zM15,16h1v1h-1zM16,16h1v1h-1zM17,16h1v1h-1zM18,16h1v1h-1zM19,16h1v1h-1zM20,16h1v1h-1zM22,16h1v1h-1zM8,17h1v1h-1zM9,17h1v1h-1zM12,17h1v1h-1zM13,17h1v1h-1zM14,17h1v1h-1zM16,17h1v1h-1zM20,17h1v1h-1zM0,18h1v1h-1zM1,18h1v1h-1zM2,18h1v1h-1zM3,18h1v1h-1zM4,18h1v1h-1zM5,18h1v1h-1zM6,18h1v1h-1zM9,18h1v1h-1zM10,18h1v1h-1zM11,18h1v1h-1zM16,18h1v1h-1zM18,18h1v1h-1zM20,18h1v1h-1zM24,18h1v1h-1zM0,19h1v1h-1zM6,19h1v1h-1zM9,19h1v1h-1zM12,19h1v1h-1zM13,19h1v1h-1zM15,19h1v1h-1zM16,19h1v1h-1zM20,19h1v1h-1zM23,19h1v1h-1zM0,20h1v1h-1zM2,20h1v1h-1zM3,20h1v1h-1zM4,20h1v1h-1zM6,20h1v1h-1zM9,20h1v1h-1zM10,20h1v1h-1zM12,20h1v1h-1zM14,20h1v1h-1zM15,20h1v1h-1zM16,20h1v1h-1zM17,20h1v1h-1zM18,20h1v1h-1zM19,20h1v1h-1zM20,20h1v1h-1zM22,20h1v1h-1zM24,20h1v1h-1zM0,21h1v1h-1zM2,21h1v1h-1zM3,21h1v1h-1zM4,21h1v1h-1zM6,21h1v1h-1zM10,21h1v1h-1zM14,21h1v1h-1zM15,21h1v1h-1zM17,21h1v1h-1zM18,21h1v1h-1zM23,21h1v1h-1zM24,21h1v1h-1zM0,22h1v1h-1zM2,22h1v1h-1zM3,22h1v1h-1zM4,22h1v1h-1zM6,22h1v1h-1zM10,22h1v1h-1zM11,22h1v1h-1zM12,22h1v1h-1zM15,22h1v1h-1zM21,22h1v1h-1zM22,22h1v1h-1zM24,22h1v1h-1zM0,23h1v1h-1zM6,23h1v1h-1zM10,23h1v1h-1zM11,23h1v1h-1zM14,23h1v1h-1zM15,23h1v1h-1zM16,23h1v1h-1zM17,23h1v1h-1zM18,23h1v1h-1zM19,23h1v1h-1zM20,23h1v1h-1zM24,23h1v1h-1zM0,24h1v1h-1zM1,24h1v1h-1zM2,24h1v1h-1zM3,24h1v1h-1zM4,24h1v1h-1zM5,24h1v1h-1zM6,24h1v1h-1zM8,24h1v1h-1zM10,24h1v1h-1zM13,24h1v1h-1zM14,24h1v1h-1zM16,24h1v1h-1zM18,24h1v1h-1zM21,24h1v1h-1zM24,24h1v1h-1z" fill="currentColor"/></svg></div>
      <div><b>\uC9C0\uAE08 \uCCB4\uD5D8</b><span>qpresen.com</span></div>
    </div>
  </div>

<!-- CSS (per-slide) -->
<style>
/* ===== slide 01 \xB7 cover ===== */
.stage{padding:0}
.irbar .lg{opacity:0}
.left{position:absolute;left:96px;top:150px;width:900px;display:flex;flex-direction:column}
.toprow{display:flex;gap:12px;align-items:center}
.lockup{margin-top:46px;display:flex;align-items:center;gap:22px}
.lockup img{height:92px;width:auto}
.lockup .kick{font-size:16px;font-weight:800;letter-spacing:.28em;color:var(--muted);padding-left:22px;border-left:1px solid var(--line-2);line-height:1.6}
.lockup .kick b{display:block;letter-spacing:.2em;color:var(--ink)}
h1.hero{margin-top:34px;font-size:78px;line-height:1.14;font-weight:800;letter-spacing:-.045em;color:var(--ink)}
.lead{margin-top:26px;font-size:24px;line-height:1.6;color:var(--muted);max-width:850px}
.lead b{color:var(--ink);font-weight:700}
.kstrip{margin-top:44px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.kstrip>div{padding:20px 22px 18px;position:relative}
.kstrip>div+div::before{content:'';position:absolute;left:0;top:22px;bottom:22px;width:1px;background:var(--line)}
.kstrip .v{font-size:40px;font-weight:800;letter-spacing:-.03em;color:var(--ink);line-height:1.05;font-variant-numeric:tabular-nums}
.kstrip .v small{font-size:20px;color:var(--q2);margin-left:3px;font-weight:800}
.kstrip .v.live{display:flex;align-items:center;gap:10px;font-size:34px;padding-top:4px}
.kstrip .v.live i{width:12px;height:12px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 6px rgba(34,197,94,.16);animation:blink 1.6s ease-in-out infinite}
.kstrip .l{margin-top:8px;font-size:16px;color:var(--muted);font-weight:600;line-height:1.4}
.meta{margin-top:30px;display:flex;align-items:center;gap:26px;font-size:18px;color:var(--muted)}
.meta b{color:var(--ink);font-weight:800;font-size:20px;margin-right:8px}
.meta .sep{width:1px;height:18px;background:var(--line-2)}

/* ---- right composition ---- */
.comp{position:absolute;left:1010px;top:96px;width:870px;height:900px}
.halo{position:absolute;left:150px;top:330px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--q2) 16%,transparent),transparent 68%)}
.orbit{position:absolute;border-radius:50%;border:1px dashed color-mix(in srgb,var(--q2) 34%,transparent)}
.orbit.o1{left:70px;top:250px;width:520px;height:520px}
.orbit.o2{left:10px;top:190px;width:640px;height:640px;border-style:solid;border-color:color-mix(in srgb,var(--q3) 14%,transparent)}
.orbit .sat{position:absolute;left:50%;top:-6px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--qg);box-shadow:0 0 0 5px color-mix(in srgb,var(--q2) 18%,transparent)}
.scrbox{position:absolute;left:176px;top:58px;width:690px}
.screen{aspect-ratio:16/9}
.screen .shot{position:absolute;inset:0;opacity:0;transition:opacity .9s var(--ease),scale 1.4s var(--ease);scale:1.03}
.screen .shot.on{opacity:1;scale:1}
.screen .shot img{width:100%;height:100%;object-fit:cover;display:block}
.screen canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.screen .live{position:absolute;left:14px;top:12px;z-index:3}
.screen .live.pill{height:28px;font-size:14px;padding:0 12px;background:rgba(255,255,255,.92);color:var(--ink);box-shadow:0 4px 14px rgba(10,20,60,.18)}
.screen-label{margin-top:22px;text-align:right;font-size:14px;font-weight:800;letter-spacing:.24em;color:var(--faint)}
.phonebox{position:absolute;left:36px;top:258px}
.phonebox .phone{--pw:262px}
.tap{left:81.5%;top:69.4%}
.link{position:absolute;left:0;top:0;width:870px;height:900px;overflow:visible;pointer-events:none}
.capcard{position:absolute;left:330px;top:500px;width:536px;padding:18px 22px;border-radius:18px}
.capcard .h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.capcard .h .k-eyebrow{font-size:14px}
.capcard .langs{display:flex;gap:6px}
.capcard .langs span{font-size:13px;font-weight:800;padding:3px 8px;border-radius:6px;background:var(--card-3);color:var(--muted);transition:all .3s}
.capcard .langs span.on{background:var(--qg);color:#fff}
.capcard .txt{font-size:21px;line-height:1.45;color:var(--ink);font-weight:600;min-height:62px}
.chip-pin{position:absolute;left:330px;top:640px;width:258px;padding:16px 18px;border-radius:18px;display:flex;align-items:center;gap:14px}
.ring{width:54px;height:54px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:14px;font-weight:800;color:var(--q2);
  background:conic-gradient(var(--q2) var(--pp,62%),var(--card-3) 0);position:relative}
.ring::before{content:'';position:absolute;inset:5px;border-radius:50%;background:var(--card)}
.ring span{position:relative}
.chip-pin .pin{font-size:27px;font-weight:800;letter-spacing:.14em;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1.1}
.chip-pin .k-small{font-size:15px}
.chip-poll{position:absolute;left:606px;top:640px;width:260px;padding:16px 18px;border-radius:18px}
.chip-poll .row{display:flex;justify-content:space-between;font-size:15px;font-weight:700;color:var(--text);margin-top:8px}
.chip-poll .bar{height:8px;margin-top:5px}
.chip-poll .bar>i{background:var(--qg)}
.hudchip{position:absolute;left:330px;top:762px;width:300px;padding:14px 18px;font-size:16px;line-height:1.5}
.hudchip .t{display:flex;justify-content:space-between;font-weight:800;opacity:.9;font-size:15px}
.qrcard{position:absolute;left:652px;top:762px;width:214px;padding:14px;border-radius:18px;display:flex;gap:12px;align-items:center}
.qrcard .qr{width:84px;height:84px;color:var(--ink);flex:none}
.qrcard .qr svg{width:100%;height:100%}
.qrcard b{display:block;font-size:16px;color:var(--ink)}
.qrcard span{font-size:14px;color:var(--muted);font-weight:600;line-height:1.35;display:block}
</style>

<!-- JS -->
<script>
document.addEventListener('deck:ready',function(e){
  var STATIC=e.detail.static;
  /* laser pointer on the auditorium screen */
  IR.laser(document.getElementById('laser'),[[.10,.30],[.34,.28],[.52,.42],[.40,.62],[.66,.66],[.86,.48],[.62,.30],[.10,.30]],{dur:5200,staticAt:.36});
  /* captions in four languages */
  var texts=['\uC548\uB155\uD558\uC2ED\uB2C8\uAE4C, \uD050\uD504\uB9AC\uC820 \uB300\uD45C \uC815\uC0C1\uD638\uC785\uB2C8\uB2E4.','Hello, I am Sangho Jung, CEO of Qpresen.','\u3053\u3093\u306B\u3061\u306F\u3001Qpresen\u4EE3\u8868\u306E\u30C1\u30E7\u30F3\u30FB\u30B5\u30F3\u30DB\u3067\u3059\u3002','Xin ch\xE0o, t\xF4i l\xE0 Jung Sangho, CEO c\u1EE7a Qpresen.'];
  var tags=[].slice.call(document.querySelectorAll('#langs span'));
  setTimeout(function(){ IR.type(document.getElementById('cap'),texts,{speed:34,hold:1500,onText:function(i){ tags.forEach(function(t,j){t.classList.toggle('on',j===i)}); }}); }, STATIC?0:1100);
  if(STATIC) return;
  /* PIN refresh ring (99s cycle shown as ring progress) */
  var s=62; IR.every(1000,function(){ s=s<=1?99:s-1; document.getElementById('sec').textContent=s; document.getElementById('ring').style.setProperty('--pp',(s/99*100).toFixed(1)+'%'); });
  /* live poll wobble */
  var vals=[62,64,67,66,69,71]; var vi=0; IR.every(2200,function(){ vi=(vi+1)%vals.length; document.getElementById('pv').textContent=vals[vi]+'%'; document.querySelector('#pbar>i').style.width=vals[vi]+'%'; });
  /* tap ripple on the phone's \uB2E4\uC74C button whenever the screen advances */
  var tap=document.getElementById('tap');
  document.getElementById('scr').addEventListener('cycle',function(){ tap.classList.remove('off'); setTimeout(function(){tap.classList.add('off')},700); });
});
<\/script>
`},"ir-04-market-slider":{id:"ir-04-market-slider",title:"\uC778\uD130\uB799\uD2F0\uBE0C \uB370\uBAA8: \uC815\uC801 \uD45C \u2194 SVG \uCC28\uD2B8 \uD1A0\uAE00 + \uC5F0\uB3C4 \uC2AC\uB77C\uC774\uB354 \uC790\uB3D9 \uC2A4\uC715 + \uC624\uB978\uCABD \uC21C\uD658 \uCE74\uB4DC",kinds:["chart","demo"],text:`<!-- EXEMPLAR: \uC2DC\uC7A5 \uC778\uB371\uC2A4 \u2014 \uC2AC\uB77C\uC774\uB354\uB85C \uC6C0\uC9C1\uC774\uB294 \uCC28\uD2B8 + \uC778\uC0AC\uC774\uD2B8 -->
<!-- HTML (goes inside <section class="body">) -->
<div class="card glass demo" data-reveal="zoom" data-delay="150">
      <div class="dh">
        <div class="k-eyebrow"><i class="lv"></i>LIVE DEMO \xB7 \uAC19\uC740 \uB0B4\uC6A9, \uB2E4\uB978 \uC804\uB2EC</div>
        <div class="rt">
          <span class="hint"><i data-icon="hand"></i>\uC9C1\uC811 \uB20C\uB7EC \uBE44\uAD50</span>
          <div class="seg g" id="seg04"><button data-m="0" class="on"><i data-icon="presentation"></i>\uC815\uC801 PPT</button><button data-m="1"><i data-icon="sparkles"></i>Qpresen \uB3D9\uC801</button></div>
        </div>
      </div>
      <div class="dt">
        <div class="tt">\uCCAD\uC911\uCC38\uC5EC \uC2DC\uC7A5 \uC131\uC7A5<span>2026=100 \uC9C0\uC218</span></div>
        <div class="lgd"><span><i class="sw"></i>\uCCAD\uC911\uCC38\uC5EC <b>\uC5F0 \uC57D 9%</b></span><span><i class="sl"></i>\uD504\uB808\uC820\uD14C\uC774\uC158 SW <b>\uC5F0 \uC57D 14%</b></span></div>
      </div>
      <div class="view" id="view04">
        <div class="lay ppt">
          <div class="ph"><b>Market Outlook \xB7 \uC2DC\uC7A5 \uC804\uB9DD</b><span class="kbd">PPT \xB7 \uC815\uC9C0 \uD654\uBA74</span></div>
          <ul>
            <li>\uCCAD\uC911\uCC38\uC5EC \uC2DC\uC7A5: \uC5F0 \uC57D 9% \uC131\uC7A5 \uAC00\uC815</li>
            <li>\uD504\uB808\uC820\uD14C\uC774\uC158 SW: \uC5F0 \uC57D 14% \uC131\uC7A5 \uAC00\uC815</li>
            <li>2031\uB144 \uC9C0\uC218: 154 / 193 (2026=100)</li>
          </ul>
          <table>
            <tr><th>\uC9C0\uC218(2026=100)</th><th>2026</th><th>2027</th><th>2028</th><th>2029</th><th>2030</th><th>2031</th></tr>
            <tr><td>\uCCAD\uC911\uCC38\uC5EC (9%)</td><td>100</td><td>109</td><td>119</td><td>130</td><td>141</td><td>154</td></tr>
            <tr><td>\uD504\uB808\uC820\uD14C\uC774\uC158 SW (14%)</td><td>100</td><td>114</td><td>130</td><td>148</td><td>169</td><td>193</td></tr>
          </table>
        </div>
        <div class="lay chart" id="chart04"><svg id="svg04" aria-label="\uC5F0\uB3C4\uBCC4 \uC131\uC7A5 \uC9C0\uC218 \uCC28\uD2B8"></svg></div>
      </div>
      <div class="ctl">
        <div class="yr"><small>YEAR</small><b class="num-g" id="yr04">2031</b></div>
        <div class="rg">
          <input type="range" class="rng" id="rng04" min="0" max="500" step="1" value="500" style="--p:100%" aria-label="\uC5F0\uB3C4 \uC2AC\uB77C\uC774\uB354 2026~2031">
          <div class="ends"><span>2026</span><span>\uB4DC\uB798\uADF8\uD574 \uC5F0\uB3C4\uB97C \uBC14\uAFD4 \uBCF4\uC138\uC694</span><span>2031</span></div>
        </div>
        <div class="ro">
          <div><span><i class="sw"></i>\uCCAD\uC911\uCC38\uC5EC</span><b id="va04">154</b></div>
          <div><span><i class="sl"></i>\uD504\uB808\uC820\uD14C\uC774\uC158 SW</span><b id="vb04">193</b></div>
        </div>
      </div>
    </div>
    <div class="why">
      <div class="whyh" data-reveal="right" data-delay="250"><span class="k-eyebrow">WHY NOW \xB7 \uC9C0\uAE08\uC774\uC5B4\uC57C \uD558\uB294 \uC774\uC720</span><span class="ln"></span></div>
      <div class="wlist" data-cycle="2800" id="why04">
        <article class="card lift wn f-violet" data-step data-reveal="right" data-delay="350">
          <span class="ic-sq lg"><i data-icon="bot"></i></span>
          <div class="tx"><div class="t">AI\uAC00 HTML\uC744 \uB9CC\uB4E0\uB2E4</div><div class="d">\uC0DD\uC131\uD615 AI\uAC00 \uCF54\uB4DC\xB7\uCC28\uD2B8\xB7\uC778\uD130\uB799\uC158\uC774 \uB4E0 \uB3D9\uC801 \uC2AC\uB77C\uC774\uB4DC\uB97C \uC0DD\uC131</div><div class="tags"><span class="pill">\uCF54\uB4DC</span><span class="pill">\uCC28\uD2B8</span><span class="pill">\uC778\uD130\uB799\uC158</span></div></div>
          <span class="no">01</span><span class="pg"><i></i></span>
        </article>
        <article class="card lift wn f-azure" data-step data-reveal="right" data-delay="470">
          <span class="ic-sq lg"><i data-icon="globe"></i></span>
          <div class="tx"><div class="t">\uBE0C\uB77C\uC6B0\uC800 \uD45C\uC900\uC758 \uC131\uC219</div><div class="d">WebRTC\xB7Realtime\uC73C\uB85C \uC571 \uC124\uCE58 \uC5C6\uC774 \uC74C\uC131 \uC911\uACC4\xB7\uC2E4\uC2DC\uAC04 \uB3D9\uAE30\uD654</div><div class="tags"><span class="pill">WebRTC</span><span class="pill">Realtime</span><span class="pill">\uBB34\uC124\uCE58</span></div></div>
          <span class="no">02</span><span class="pg"><i></i></span>
        </article>
        <article class="card lift wn f-teal" data-step data-reveal="right" data-delay="590">
          <span class="ic-sq lg"><i data-icon="glasses"></i></span>
          <div class="tx"><div class="t">\uC2E4\uC2DC\uAC04 \uB2E4\uAD6D\uC5B4\xB7\uC6E8\uC5B4\uB7EC\uBE14</div><div class="d">STT\xB7\uAE30\uACC4\uBC88\uC5ED \uB2E8\uAC00 \uD558\uB77D, \uC18C\uBE44\uC790\uC6A9 \uC2A4\uB9C8\uD2B8\uAE00\uB798\uC2A4 \uC0C1\uC6A9\uD654</div><div class="tags"><span class="pill">STT</span><span class="pill">\uAE30\uACC4\uBC88\uC5ED</span><span class="pill">\uC2A4\uB9C8\uD2B8\uAE00\uB798\uC2A4</span></div></div>
          <span class="no">03</span><span class="pg"><i></i></span>
        </article>
      </div>
    </div>
    <div class="card gborder callx" data-reveal="up" data-delay="700">
      <p><span class="q">\uB9CC\uB4DC\uB294 \uB3C4\uAD6C\uB294 \uB118\uCCD0\uB09C\uB2E4 \u2014</span> \uBE44\uC5B4 \uC788\uB294 \uAC83\uC740 \uB3D9\uC801 HTML \uBC1C\uD45C\uC758 <b class="gtext">'\uC6B4\uC601 \uD50C\uB7AB\uD3FC'</b>. \uADF8 \uC790\uB9AC\uB97C <b>Qpresen</b>\uC774 \uB9E1\uC2B5\uB2C8\uB2E4.</p>
    </div>
<!-- CSS (per-slide) -->
<style>
/* ===== slide 04 \xB7 insight ===== */
.body{display:grid;grid-template-columns:minmax(0,58fr) minmax(0,42fr);grid-template-rows:minmax(0,1fr) auto;gap:22px 34px;min-height:0}
/* ---- left: interactive demo panel ---- */
.demo{display:flex;flex-direction:column;gap:14px;padding:22px 28px 22px;min-height:0;min-width:0}
.dh{display:flex;align-items:center;justify-content:space-between;gap:16px}
.dh .k-eyebrow{display:flex;align-items:center;gap:10px}
.dh .k-eyebrow .lv{width:9px;height:9px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px color-mix(in srgb,var(--ok) 18%,transparent);animation:blink 1.6s ease-in-out infinite}
.dh .rt{display:flex;align-items:center;gap:14px}
.dh .hint{display:flex;align-items:center;gap:6px;font-size:16px;font-weight:600;color:var(--faint)}
.dh .hint .ic{width:18px;height:18px;color:var(--q2)}
.seg button{display:inline-flex;align-items:center;gap:7px}
.seg button .ic{width:17px;height:17px}
.seg button{position:relative}
.seg button.press04{animation:press04 .4s var(--ease)}
@keyframes press04{0%,100%{scale:1}50%{scale:1.06}}
.seg button .tap{left:50%;top:50%}
.dt{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.dt .tt{font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-.02em;white-space:nowrap}
.dt .tt span{font-size:18px;font-weight:600;color:var(--muted);letter-spacing:-.01em;margin-left:10px}
.dt .lgd{display:flex;align-items:center;gap:16px;font-size:16px;font-weight:700;color:var(--muted);white-space:nowrap}
.dt .lgd span{display:inline-flex;align-items:center;gap:7px}
.dt .lgd b{font-weight:800;color:var(--ink)}
.dt .lgd .sw{width:12px;height:12px;border-radius:4px;background:linear-gradient(180deg,var(--q2),var(--q1))}
.dt .lgd .sl{width:12px;height:12px;border-radius:50%;background:var(--card);box-shadow:inset 0 0 0 3px var(--violet)}
.view{position:relative;flex:1;min-height:0}
.lay{position:absolute;inset:0;transition:opacity .75s var(--ease),scale .75s var(--ease),filter .75s var(--ease)}
.view:not(.dyn) .chart{opacity:0;scale:.97;filter:blur(6px);pointer-events:none}
.view.dyn .ppt{opacity:0;scale:1.02;filter:blur(6px);pointer-events:none}
.view:not(.dyn)~.ctl{opacity:.38;pointer-events:none}
/* static "PPT" layer \u2014 grey, frozen, read-to-understand */
.ppt{display:flex;flex-direction:column;gap:10px;padding:18px 26px;border-radius:16px;background:var(--card-2);border:1px solid var(--line);box-shadow:inset 0 1px 0 var(--card);filter:grayscale(1)}
.ppt .ph{display:flex;align-items:center;justify-content:space-between}
.ppt .ph b{font-size:23px;font-weight:700;color:var(--muted);letter-spacing:-.02em}
.ppt .ph .kbd{font-size:16px}
.ppt ul{display:flex;flex-direction:column;gap:3px}
.ppt li{position:relative;padding-left:22px;font-size:17px;color:var(--muted);line-height:1.4}
.ppt li::before{content:'';position:absolute;left:4px;top:.6em;width:8px;height:8px;border-radius:2px;background:var(--faint)}
.ppt table{width:100%;border-collapse:collapse;font-size:16px;white-space:nowrap;color:var(--muted);font-variant-numeric:tabular-nums;margin-top:auto}
.ppt th,.ppt td{border:1px solid var(--line-2);padding:5px 10px;text-align:center;font-weight:600}
.ppt th{background:var(--card-3);font-weight:700}
.ppt td:first-child,.ppt th:first-child{text-align:left;width:220px}
/* dynamic chart layer */
.chart>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.chart .gl{stroke:var(--line);stroke-width:1;stroke-dasharray:3 6}
.chart .gl0{stroke:var(--line-2);stroke-width:1.5}
.chart .yt{font-size:15px;font-weight:600;fill:var(--faint)}
.chart .ax{font-size:16px;font-weight:700;fill:var(--faint)}
.chart .xt{font-size:17px;font-weight:700;fill:var(--faint);transition:fill .3s}
.chart .xt.cur{fill:var(--ink)}
.chart .gh{fill:none;stroke:var(--line-2);stroke-width:1.5;stroke-dasharray:5 6}
.chart .bv{font-size:18px;font-weight:800;fill:var(--card)}
.chart .band{fill:var(--q2);opacity:.06;transition:x .25s}
.chart .ln04{fill:none;stroke:var(--violet);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}
.chart .pt{fill:var(--card);stroke:var(--violet);stroke-width:3}
.chart .hd{fill:var(--violet)}
.chart .hdr{fill:none;stroke:var(--violet);stroke-width:2;opacity:.35}
.chart .lb rect{fill:var(--violet)}
.chart .lb text{font-size:17px;font-weight:800;fill:var(--card)}
.chart .bar{filter:drop-shadow(0 8px 14px color-mix(in srgb,var(--q2) 28%,transparent))}
/* slider row */
.ctl{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:20px;padding:14px 18px;border-radius:16px;background:var(--card-2);border:1px solid var(--line);transition:opacity .6s var(--ease)}
.ctl .yr{display:flex;flex-direction:column;line-height:1}
.ctl .yr small{font-size:16px;font-weight:800;letter-spacing:.14em;color:var(--faint)}
.ctl .yr b{margin-top:6px;font-size:38px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.ctl .rg{display:flex;flex-direction:column;gap:8px;min-width:0}
.ctl .rg .ends{display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:var(--faint)}
.ctl .ro{display:flex;gap:10px}
.ctl .ro div{display:flex;flex-direction:column;align-items:flex-start;padding:8px 14px;border-radius:12px;background:var(--card);border:1px solid var(--line);min-width:140px}
.ctl .ro span{font-size:16px;font-weight:700;color:var(--muted);display:flex;align-items:center;gap:7px;white-space:nowrap}
.ctl .ro b{font-size:28px;font-weight:800;letter-spacing:-.02em;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1.15}
.ctl .ro .sw{width:12px;height:12px;border-radius:4px;background:linear-gradient(180deg,var(--q2),var(--q1))}
.ctl .ro .sl{width:12px;height:12px;border-radius:50%;background:var(--card);box-shadow:inset 0 0 0 3px var(--violet)}
input.rng{cursor:pointer}
/* ---- right: why now ---- */
.why{display:flex;flex-direction:column;gap:14px;min-height:0;min-width:0}
.whyh{display:flex;align-items:center;gap:14px}
.whyh .ln{flex:1;height:1px;background:linear-gradient(90deg,var(--line-2),transparent)}
.wlist{flex:1;display:grid;grid-template-rows:repeat(3,minmax(0,1fr));gap:14px;min-height:0}
.wn{position:relative;overflow:hidden;display:grid;grid-template-columns:64px minmax(0,1fr);gap:20px;align-items:center;padding:18px 24px;min-height:0;transition:border-color .5s var(--ease),box-shadow .5s var(--ease)}
.wn .ic-sq{transition:background .5s var(--ease),color .5s var(--ease),box-shadow .5s var(--ease)}
.wn .tx{display:flex;flex-direction:column;gap:6px;min-width:0;padding-right:58px}
.wn .t{font-size:26px;font-weight:800;color:var(--ink);letter-spacing:-.02em;line-height:1.25}
.wn .d{font-size:18px;line-height:1.5;color:var(--text)}
.wn .tags{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap}
.wn .tags .pill{height:28px;padding:0 12px;font-size:16px}
.wn .no{position:absolute;right:22px;top:12px;font-size:60px;font-weight:800;letter-spacing:-.05em;line-height:1;background:var(--qg);-webkit-background-clip:text;background-clip:text;color:transparent;opacity:.16;transition:opacity .5s var(--ease)}
.wn .pg{position:absolute;left:0;right:0;bottom:0;height:3px;background:transparent}
.wn .pg i{display:block;height:100%;width:0;background:var(--f)}
.wn.on{border-color:color-mix(in srgb,var(--f) 48%,var(--line));box-shadow:var(--shadow-lg)}
.wn.on .ic-sq{background:var(--f);color:var(--card);box-shadow:0 10px 24px color-mix(in srgb,var(--f) 35%,transparent)}
.wn.on .no{opacity:.5}
.wn.on .pg i{animation:fill04 2.8s linear forwards}
@keyframes fill04{from{width:0}to{width:100%}}
/* ---- bottom callout ---- */
.callx{grid-column:1/-1;position:relative;overflow:hidden;display:flex;align-items:center;gap:22px;padding:18px 26px 18px 22px}
.callx .qi{width:46px;height:auto;flex:none;filter:drop-shadow(0 8px 16px color-mix(in srgb,var(--q2) 30%,transparent))}
.callx p{flex:1;min-width:0;font-size:23px;font-weight:600;color:var(--ink);letter-spacing:-.015em;line-height:1.4}
.callx p .q{color:var(--muted);font-weight:500}
.callx .nx{text-decoration:none;flex:none;gap:8px}
.callx .nx .ic{width:18px;height:18px}
.callx::before{content:'';position:absolute;top:0;bottom:0;left:-30%;width:28%;pointer-events:none;
  background:linear-gradient(100deg,transparent,color-mix(in srgb,var(--q2) 9%,transparent),transparent);animation:sheen04 5.5s var(--ease) 1.2s infinite}
@keyframes sheen04{0%{translate:0 0}60%,100%{translate:480% 0}}
html.static .callx::before{display:none}
</style>
<!-- JS (per-slide, runs after base runtime) -->
<script>
document.addEventListener('deck:ready',function(e){
  var STATIC=e.detail.static;
  var A=[100,109,119,130,141,154], L=[100,114,130,148,169,193], Y0=2026, VMAX=200;
  var NS='http://www.w3.org/2000/svg';
  var view=document.getElementById('view04'), box=document.getElementById('chart04'), svg=document.getElementById('svg04');
  var rng=document.getElementById('rng04'), yr=document.getElementById('yr04'), va=document.getElementById('va04'), vb=document.getElementById('vb04');
  var btns=[].slice.call(document.querySelectorAll('#seg04 button'));
  function mk(tag,at,par){ var n=document.createElementNS(NS,tag); for(var k in at) n.setAttribute(k,at[k]); if(par) par.appendChild(n); return n; }
  /* ---- geometry (1:1 px viewBox) ---- */
  var W=box.clientWidth||900, H=box.clientHeight||330;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var ml=50, mr=10, mt=46, mb=34, pw=W-ml-mr, ph=H-mt-mb, gw=pw/6, bw=Math.min(74,gw*.48);
  function X(i){ return ml+gw*(i+.5); }
  function Yv(v){ return mt+ph*(1-v/VMAX); }
  var defs=mk('defs',{},svg);
  var bg=mk('linearGradient',{id:'bg04',x1:0,y1:0,x2:0,y2:1},defs);
  mk('stop',{offset:0,'stop-color':'#5B63FF'},bg); mk('stop',{offset:1,'stop-color':'#1A8CFF'},bg);
  var ag=mk('linearGradient',{id:'ag04',x1:0,y1:0,x2:0,y2:1},defs);
  mk('stop',{offset:0,'stop-color':'#9B4DFF','stop-opacity':.16},ag); mk('stop',{offset:1,'stop-color':'#9B4DFF','stop-opacity':0},ag);
  /* grid + axis */
  [0,50,100,150,200].forEach(function(v){
    mk('line',{x1:ml,x2:W-mr,y1:Yv(v),y2:Yv(v),'class':v===0?'gl0':'gl'},svg);
    var t=mk('text',{x:ml-12,y:Yv(v)+5,'text-anchor':'end','class':'yt'},svg); t.textContent=v;
  });
  var axl=mk('text',{x:ml,y:18,'class':'ax'},svg); axl.textContent='\uC9C0\uC218(2026=100) \xB7 \uC131\uC7A5\uB960 \uAC00\uC815 \uAE30\uBC18 \uACC4\uC0B0';
  var band=mk('rect',{x:X(5)-gw/2,y:mt-8,width:gw,height:ph+8,rx:12,'class':'band'},svg);
  var xt=[], gh=[], bars=[], bv=[];
  for(var i=0;i<6;i++){
    gh.push(mk('rect',{x:X(i)-bw/2,y:Yv(A[i]),width:bw,height:ph+mt-Yv(A[i]),rx:10,'class':'gh'},svg));
    bars.push(mk('path',{d:'',fill:'url(#bg04)','class':'bar'},svg));
    var tv=mk('text',{x:X(i),y:0,'text-anchor':'middle','class':'bv'},svg); tv.textContent=A[i]; bv.push(tv);
    var tx=mk('text',{x:X(i),y:H-8,'text-anchor':'middle','class':'xt'},svg); tx.textContent=Y0+i; xt.push(tx);
  }
  var area=mk('path',{d:'',fill:'url(#ag04)'},svg);
  var line=mk('path',{d:'','class':'ln04'},svg);
  var pts=[]; for(var j=0;j<6;j++) pts.push(mk('circle',{cx:X(j),cy:Yv(L[j]),r:6,'class':'pt'},svg));
  var hdr=mk('circle',{r:13,'class':'hdr'},svg), hd=mk('circle',{r:7,'class':'hd'},svg);
  var lb=mk('g',{'class':'lb'},svg), lbr=mk('rect',{rx:9,height:28,width:52},lb), lbt=mk('text',{'text-anchor':'middle'},lb);
  function barPath(x,w,y0,y1,r){ var h=y1-y0; if(h<=.5) return ''; r=Math.min(r,h,w/2);
    return 'M'+x+' '+y1+'V'+(y0+r)+'Q'+x+' '+y0+' '+(x+r)+' '+y0+'H'+(x+w-r)+'Q'+(x+w)+' '+y0+' '+(x+w)+' '+(y0+r)+'V'+y1+'Z'; }
  var base=Yv(0);
  function render(t){
    t=Math.max(0,Math.min(5,t));
    var k=Math.floor(t+1e-6);
    for(var i=0;i<6;i++){
      var f=i===0?1:Math.max(0,Math.min(1,t-(i-1)));
      var top=base-(base-Yv(A[i]))*f;
      bars[i].setAttribute('d',barPath(X(i)-bw/2,bw,top,base,10));
      gh[i].style.opacity=f>=1?0:1;
      bv[i].setAttribute('y',Yv(A[i])+27); bv[i].style.opacity=f>=.98?1:0;
      xt[i].classList.toggle('cur',i===k);
      pts[i].style.opacity=i<=k?1:0;
    }
    /* comparison line up to t */
    var d='M'+X(0)+' '+Yv(L[0]), hx=X(0), hy=Yv(L[0]);
    for(var j=1;j<=5;j++){ if(t>=j){ d+='L'+X(j)+' '+Yv(L[j]); hx=X(j); hy=Yv(L[j]); } else if(t>j-1){ var r=t-(j-1); hx=X(j-1)+(X(j)-X(j-1))*r; hy=Yv(L[j-1])+(Yv(L[j])-Yv(L[j-1]))*r; d+='L'+hx+' '+hy; break; } else break; }
    line.setAttribute('d',d); area.setAttribute('d',d+'L'+hx+' '+base+'L'+X(0)+' '+base+'Z');
    hd.setAttribute('cx',hx); hd.setAttribute('cy',hy); hdr.setAttribute('cx',hx); hdr.setAttribute('cy',hy);
    /* label of the last reached year on the line */
    lbt.textContent=L[k]; var lx=X(k), ly=Yv(L[k])-22;
    lbr.setAttribute('x',lx-26); lbr.setAttribute('y',ly-20); lbt.setAttribute('x',lx); lbt.setAttribute('y',ly);
    band.setAttribute('x',X(k)-gw/2);
    yr.textContent=Y0+k; va.textContent=A[k]; vb.textContent=L[k];
    rng.value=Math.round(t*100); rng.style.setProperty('--p',(t/5*100).toFixed(1)+'%');
  }
  function setMode(m){ btns.forEach(function(b,i){ b.classList.toggle('on',i===m); }); view.classList.toggle('dyn',m===1); }
  if(STATIC){ setMode(1); render(5); return; }
  /* ---- live: auto demo (PPT \u2192 dynamic, slider sweeps 2026 \u2192 2031), stops on user input ---- */
  var tw=null, timers=[], user=false, loops=0;
  function sweep(from,to,ms,done){ clearInterval(tw); var t0=Date.now();
    tw=setInterval(function(){ var p=Math.min(1,(Date.now()-t0)/ms), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2; render(from+(to-from)*e); if(p>=1){ clearInterval(tw); tw=null; done&&done(); } },16); }
  function later(ms,fn){ timers.push(setTimeout(fn,ms)); }
  function stopAuto(){ user=true; clearInterval(tw); tw=null; timers.forEach(clearTimeout); timers=[]; }
  function press(b){ b.classList.remove('press04'); void b.offsetWidth; b.classList.add('press04');
    var tp=document.createElement('span'); tp.className='tap'; b.appendChild(tp); setTimeout(function(){ tp.remove(); b.classList.remove('press04'); },900); }
  function play(){ if(user) return; setMode(0); render(0);
    later(2000,function(){ press(btns[1]); setMode(1); later(250,function(){ sweep(0,5,1700,function(){ if(++loops>=2) return; later(5600,play); }); }); }); }
  render(0); play();
  btns.forEach(function(b,i){ b.addEventListener('click',function(){ stopAuto(); setMode(i); if(i===1){ render(0); sweep(0,5,1500); } }); });
  rng.addEventListener('input',function(){ stopAuto(); setMode(1); render(rng.value/100); });
  rng.addEventListener('change',function(){ var v=rng.value/100; sweep(v,Math.round(v),260); rng.blur(); });
  var ctl=document.querySelector('.ctl');
  ['touchstart','touchend'].forEach(function(ev){ ctl.addEventListener(ev,function(e){ e.stopPropagation(); },{passive:true}); });
});
<\/script>
`},"ir-13-market-targets":{id:"ir-13-market-targets",title:"\uC2DC\uC7A5\xB7\uD0C0\uAE43(\uB77C\uC774\uD2B8 \uBB34\uB300\uC758 \uD654\uC0AC\uD568): \uB3D9\uC2EC\uC6D0 TAM/SAM/SOM + \uADF8\uB77C\uB370\uC774\uC158 \uC131\uC7A5 \uB9C9\uB300 + \uBC88\uD638 \uD0C0\uAE43 \uCE74\uB4DC 3\uC7A5 + \uD070 \uADF8\uB77C\uB370\uC774\uC158 \uC22B\uC790",kinds:["numbers","story","list","chart"],text:`<!-- EXEMPLAR: \uC2DC\uC7A5\xB7\uD0C0\uAE43 \u2014 \uB3D9\uC2EC\uC6D0 TAM/SAM/SOM + \uC131\uC7A5\uB960 \uADF8\uB77C\uB370\uC774\uC158 \uB9C9\uB300 + \uBC88\uD638 \uD0C0\uAE43 \uCE74\uB4DC 3\uC7A5(\uD654\uC0AC\uD55C \uB77C\uC774\uD2B8 \uBB34\uB300, \uD070 \uADF8\uB77C\uB370\uC774\uC158 \uC22B\uC790) -->
<!-- HTML (goes inside <section class="body">) -->
<div class="m13-col m13-left">
      <div class="m13-mk" id="mk13" data-k="0" data-reveal="zoom" data-delay="150">
        <svg viewBox="0 0 664 538" aria-hidden="true">
          <defs>
            <linearGradient id="gs13" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A8CFF"/><stop offset=".52" stop-color="#5B63FF"/><stop offset="1" stop-color="#9B4DFF"/></linearGradient>
            <linearGradient id="gl13" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A8CFF"/><stop offset=".52" stop-color="#5B63FF"/><stop offset="1" stop-color="#9B4DFF"/></linearGradient>
            <radialGradient id="gh13" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#5B63FF" stop-opacity=".22"/><stop offset="1" stop-color="#5B63FF" stop-opacity="0"/></radialGradient>
          </defs>
          <g class="orbit spin-slow">
            <circle cx="332" cy="269" r="258" fill="none" style="stroke:var(--line-2)" stroke-width="1.2" stroke-dasharray="2 9"/>
          </g>
          <path id="op13" d="M332 11 A258 258 0 1 1 331.9 11" fill="none" stroke="none"/>
          <circle r="6" fill="url(#gs13)" id="sat13"><animateMotion dur="14s" repeatCount="indefinite" rotate="auto"><mpath href="#op13"/></animateMotion></circle>
          <circle r="4" style="fill:var(--azure)" opacity=".7"><animateMotion dur="14s" begin="-7s" repeatCount="indefinite"><mpath href="#op13"/></animateMotion></circle>
          <circle class="rf rf0" data-ring="0" cx="332" cy="269" r="244"/>
          <circle class="rf rf1" data-ring="1" cx="332" cy="269" r="163"/>
          <circle class="halo" cx="332" cy="269" r="118" fill="url(#gh13)"/>
          <circle class="som" data-ring="2" cx="332" cy="269" r="84" fill="url(#gs13)"/>
          <circle class="rs rs0" cx="332" cy="269" r="244" fill="none" style="stroke:var(--azure)" stroke-width="2" transform="rotate(-90 332 269)" data-draw data-delay="250"/>
          <circle class="rs rs1" cx="332" cy="269" r="163" fill="none" style="stroke:var(--brand)" stroke-width="2" transform="rotate(-90 332 269)" data-draw data-delay="520"/>
          <circle class="rs rs2" cx="332" cy="269" r="92" fill="none" stroke="url(#gl13)" stroke-width="2" transform="rotate(-90 332 269)" data-draw data-delay="780"/>
        </svg>
        <div class="m13-tl"><span class="k-eyebrow">MARKET SIZE</span><b>TAM \xB7 SAM \xB7 SOM</b></div>
        <div class="m13-tr"><span class="pill o f-brand" style="height:30px;font-size:15px;padding:0 13px">\uC0AC\uC5C5\uACC4\uD68D\uC11C \uAE30\uC900</span></div>
        <div class="m13-lb f-azure" data-lb="0" style="top:36px"><span class="e">TAM</span><span class="v"><i>\uC57D</i><span data-count="14" data-delay="400">14</span><small>\uC870\uC6D0</small></span></div>
        <div class="m13-usd f-azure" style="top:459px">$10.6B</div>
        <div class="m13-lb f-brand" data-lb="1" style="top:114px"><span class="e">SAM</span><span class="v"><i>\uC57D</i><span data-count="2" data-delay="650">2</span><small>\uC870\uC6D0</small></span></div>
        <div class="m13-usd f-brand" style="top:381px">$1.5B</div>
        <div class="m13-lb s" data-lb="2" style="top:226px"><span class="e">SOM</span><span class="v"><i>\uC57D</i><span data-count="600" data-delay="900">600</span><small>\uC5B5\uC6D0</small></span><span class="u">$45M</span></div>
        <i class="ring-ping" style="left:248px;top:185px;width:168px;height:168px;--f:var(--q2)"></i>
      </div>
      <div class="m13-def">
        <div class="card f-azure" data-def="0" data-reveal="up" data-delay="600"><div class="h"><i></i>TAM<span>\uC804\uCCB4 \uC2DC\uC7A5</span></div><p>\uD504\uB808\uC820\uD14C\uC774\uC158 SW<br>+ \uCCAD\uC911\uCC38\uC5EC</p></div>
        <div class="card f-brand" data-def="1" data-reveal="up" data-delay="700"><div class="h"><i></i>SAM</div><p>\uAD50\uC721\xB7\uAE30\uC5C5\xB7\uC774\uBCA4\uD2B8<br>\uB514\uC9C0\uD138 \uC778\uD130\uB799\uC158</p></div>
        <div class="card s f-violet" data-def="2" data-reveal="up" data-delay="800"><div class="h"><i></i>SOM</div><p>3\uB144 \uB0B4 \uAD6D\uB0B4 \uBC0F<br>\uCD08\uAE30 \uAE00\uB85C\uBC8C</p></div>
      </div>
    </div>
    <div class="m13-col">
      <div class="card glass m13-gr" id="gr13" data-reveal="up" data-delay="300">
        <div class="hd"><span class="k-eyebrow f-teal">GROWTH \xB7 \uC5F0 \uC131\uC7A5\uB960</span><i data-icon="trending-up"></i></div>
        <div class="m13-plot">
          <i class="gl" style="bottom:25%"></i><i class="gl" style="bottom:50%"></i><i class="gl" style="bottom:75%"></i>
          <div class="m13-bc"><div class="n"><em>\uC5F0 \uC57D</em><b class="g1" data-count="14" data-delay="700">14<small>%</small></b></div><div class="m13-bar b1" style="--h:168px;--bd:150ms"></div></div>
          <div class="m13-bc"><div class="n"><em>\uC5F0 \uC57D</em><b class="g2" data-count="9" data-delay="850">9<small>%</small></b></div><div class="m13-bar b2" style="--h:108px;--bd:320ms"></div></div>
        </div>
        <div class="m13-bl"><span>\uD504\uB808\uC820\uD14C\uC774\uC158 SW</span><span>\uCCAD\uC911\uCC38\uC5EC</span></div>
      </div>
      <div class="card m13-wn" data-reveal="up" data-delay="500">
        <span class="k-eyebrow">WHY NOW \xB7 \uC218\uC694 \uD655\uB300</span>
        <ul>
          <li><span class="ic-sq f-azure"><i data-icon="globe"></i></span><div><b>\uBE0C\uB77C\uC6B0\uC800 \uD45C\uC900 \uC131\uC219</b><span>WebRTC\xB7Realtime, \uC571 \uC124\uCE58 \uC5C6\uC774</span></div></li>
          <li><span class="ic-sq f-violet"><i data-icon="languages"></i></span><div><b>STT\xB7\uBC88\uC5ED \uB2E8\uAC00 \uD558\uB77D</b><span>\uC2E4\uC2DC\uAC04 \uB2E4\uAD6D\uC5B4 \uC790\uB9C9 \uBB38\uD131\u2193</span></div></li>
          <li><span class="ic-sq f-teal"><i data-icon="glasses"></i></span><div><b>\uC2A4\uB9C8\uD2B8\uAE00\uB798\uC2A4 \uC0C1\uC6A9\uD654</b><span>Even Realities G2 \xB7 Rokid RV101</span></div></li>
        </ul>
      </div>
    </div>
    <div class="m13-right" data-cycle="2800" data-static-step="0">
      <div class="card m13-tg f-azure" data-step data-reveal="right" data-delay="450">
        <span class="ghost">01</span>
        <span class="ic-sq lg"><i data-icon="graduation-cap"></i></span>
        <div>
          <div class="t"><span class="k-eyebrow">TARGET 01</span></div>
          <h3>\uAD50\uC721</h3>
          <div class="d">\uB300\uD559\xB7\uD559\uC6D0\xB7\uAE30\uC5C5\uAD50\uC721 \uB2F4\uB2F9\uC790(\uC720\uD559\uC0DD \uC218\uC5C5\xB7\uC138\uBBF8\uB098)</div>
          <div class="chips"><em>\uC18C\uAD6C</em><span class="pill"><i data-icon="graduation-cap"></i>\uB2E4\uAD6D\uC5B4 \uC790\uB9C9</span><i class="sep"></i><em>\uC9C4\uC785</em><span class="pill o">\uBB34\uB8CC \uD30C\uC77C\uB7FF \u2192 \uC720\uB8CC \uAD6C\uB3C5</span></div>
        </div>
      </div>
      <div class="card m13-tg f-teal" data-step data-reveal="right" data-delay="600">
        <span class="ghost">02</span>
        <span class="ic-sq lg"><i data-icon="building"></i></span>
        <div>
          <div class="t"><span class="k-eyebrow">TARGET 02</span></div>
          <h3>\uAE30\uC5C5 \xB7 \uAE30\uAD00</h3>
          <div class="d">\uC124\uBA85\uD68C\xB7\uCEE8\uD37C\uB7F0\uC2A4\xB7\uC9C0\uC5ED \uD589\uC0AC \uC6B4\uC601\uC790</div>
          <div class="chips"><em>\uC18C\uAD6C</em><span class="pill"><i data-icon="users"></i>\uCCAD\uC911 \uCC38\uC5EC 9\uC885</span><i class="sep"></i><em>\uC0C1\uD488</em><span class="pill o">\uC774\uBCA4\uD2B8 \uD328\uD0A4\uC9C0</span></div>
        </div>
      </div>
      <div class="card m13-tg f-violet" data-step data-reveal="right" data-delay="750">
        <span class="ghost">03</span>
        <span class="ic-sq lg"><i data-icon="globe"></i></span>
        <div>
          <div class="t"><span class="k-eyebrow">TARGET 03</span></div>
          <h3>\uAD6D\uC81C \xB7 \uB2E4\uBB38\uD654</h3>
          <div class="d">\uAD6D\uC81C \uCEE8\uD37C\uB7F0\uC2A4, \uB2E4\uBB38\uD654\uAC00\uC815 \uD559\uBD80\uBAA8 \uC124\uBA85\uD68C</div>
          <div class="chips"><em>\uC18C\uAD6C</em><span class="pill"><i data-icon="languages"></i>\uC2E4\uC2DC\uAC04 \uBC88\uC5ED \uC790\uB9C9</span><i class="sep"></i><em>\uAE30\uBC18</em><span class="pill o">UI 11\uAC1C \uC5B8\uC5B4</span></div>
        </div>
      </div>
    </div>

<!-- CSS (per-slide) -->
<style>
/* ===== slide 13 \xB7 market ===== */
.body{display:grid;grid-template-columns:664px 360px minmax(0,1fr);gap:0 34px;min-height:0}
.m13-col{display:flex;flex-direction:column;gap:16px;min-height:0;min-width:0}

/* --- left: TAM / SAM / SOM --- */
.m13-left{justify-content:space-between}
.m13-mk{position:relative;width:664px;height:538px;flex:none}
.m13-mk>svg{position:absolute;inset:0;width:664px;height:538px;overflow:visible}
.m13-mk .rf{transition:fill .7s var(--ease),fill-opacity .7s var(--ease);cursor:pointer}
.m13-mk .rf0{fill:var(--azure-50)}
.m13-mk .rf1{fill:var(--brand-50)}
.m13-mk[data-k="0"] .rf0{fill:var(--azure-100)}
.m13-mk[data-k="1"] .rf1{fill:var(--brand-100)}
.m13-mk .rs{transition:stroke-width .6s var(--ease),opacity .6s var(--ease);opacity:.55}
.m13-mk[data-k="0"] .rs0,.m13-mk[data-k="1"] .rs1,.m13-mk[data-k="2"] .rs2{stroke-width:4;opacity:1}
.m13-mk .halo{opacity:0;transition:opacity .7s var(--ease)}
.m13-mk[data-k="2"] .halo{opacity:1}
.m13-mk .som{filter:drop-shadow(0 18px 30px color-mix(in srgb,var(--q2) 34%,transparent));cursor:pointer}
.m13-mk .orbit{transform-origin:332px 269px}
.m13-lb{position:absolute;left:332px;translate:-50% 0;text-align:center;white-space:nowrap;pointer-events:none;transition:transform .6s var(--ease)}
.m13-lb .e{display:block;font-size:15px;font-weight:800;letter-spacing:.2em;color:var(--f);line-height:18px}
.m13-lb .v{display:block;margin-top:2px;font-size:38px;line-height:1;font-weight:800;letter-spacing:-.035em;color:var(--ink);font-variant-numeric:tabular-nums}
.m13-lb .v i{font-style:normal;font-size:18px;font-weight:700;color:var(--muted);margin-right:5px;letter-spacing:0}
.m13-lb .v small{font-size:20px;font-weight:800;margin-left:2px;letter-spacing:-.01em;color:var(--f)}
.m13-lb.on{transform:scale(1.08)}
.m13-lb.on .v span{background:var(--qg);-webkit-background-clip:text;background-clip:text;color:transparent}
.m13-usd{position:absolute;left:332px;translate:-50% 0;font-size:20px;font-weight:800;letter-spacing:-.01em;color:var(--f);pointer-events:none;font-variant-numeric:tabular-nums}
.m13-lb.s .e{color:rgba(255,255,255,.82)}
.m13-lb.s .v{font-size:34px;color:#fff}
.m13-lb.s .v i,.m13-lb.s .v small{color:rgba(255,255,255,.86)}
.m13-lb.s.on .v span{background:none;color:#fff}
.m13-lb.s .u{display:block;margin-top:5px;font-size:17px;font-weight:800;color:rgba(255,255,255,.9)}
.m13-tl{position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:6px}
.m13-tl .k-eyebrow{font-size:15px}
.m13-tl b{font-size:17px;color:var(--ink);font-weight:800;letter-spacing:-.01em}
.m13-tr{position:absolute;right:0;top:0}
.m13-def{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;flex:none}
.m13-def .card{padding:14px 18px 15px;border-radius:18px;cursor:pointer;transition:box-shadow .5s var(--ease),border-color .5s var(--ease),translate .5s var(--ease)}
.m13-def .card .h{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:800;color:var(--ink);letter-spacing:.06em}
.m13-def .card .h i{width:12px;height:12px;border-radius:50%;background:var(--f);flex:none}
.m13-def .card.s .h i{background:var(--qg)}
.m13-def .card .h span{font-size:16px;font-weight:700;color:var(--muted);letter-spacing:0;margin-left:2px}
.m13-def .card p{margin-top:6px;font-size:16px;line-height:1.45;color:var(--text);word-break:keep-all}
.m13-def .card.on{translate:0 -4px;box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--f) 50%,var(--line))}

/* --- middle: growth + why now --- */
.m13-gr{flex:1;display:flex;flex-direction:column;padding:22px 24px 20px;min-height:0}
.m13-gr .hd{display:flex;align-items:center;justify-content:space-between;gap:10px}
.m13-plot{position:relative;flex:1;min-height:0;margin-top:10px;display:flex;align-items:flex-end;justify-content:center;gap:46px;padding-bottom:0}
.m13-plot::before{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px;background:var(--line-2)}
.m13-plot .gl{position:absolute;left:0;right:0;height:0;border-top:1px dashed var(--line)}
.m13-bc{position:relative;width:104px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:1}
.m13-bc .n{text-align:center;margin-bottom:10px}
.m13-bc .n em{display:block;font-style:normal;font-size:16px;font-weight:700;color:var(--muted)}
.m13-bc .n b{display:block;font-size:46px;line-height:1;font-weight:800;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.m13-bc .n b small{font-size:22px;margin-left:1px}
.m13-bc .n b.g1{background:var(--qg);-webkit-background-clip:text;background-clip:text;color:transparent}
.m13-bc .n b.g1 small{-webkit-text-fill-color:transparent}
.m13-bc .n b.g2{color:var(--teal)}
.m13-bar{position:relative;width:100%;height:var(--h);border-radius:16px 16px 6px 6px;overflow:hidden;transform-origin:50% 100%;transition:scale 1.5s var(--ease);transition-delay:var(--bd,0ms)}
.m13-bar.b1{background:linear-gradient(180deg,var(--q3) 0%,var(--q2) 48%,var(--q1) 100%);box-shadow:0 18px 36px color-mix(in srgb,var(--q2) 30%,transparent)}
.m13-bar.b2{background:linear-gradient(180deg,var(--teal) 0%,color-mix(in srgb,var(--teal) 55%,var(--azure)) 100%);box-shadow:0 18px 36px color-mix(in srgb,var(--teal) 26%,transparent)}
.m13-bar::after{content:'';position:absolute;left:0;right:0;height:60%;top:100%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.38),transparent);animation:m13up 3.2s ease-in-out infinite}
.m13-bar.b2::after{animation-delay:1.1s}
@keyframes m13up{0%{top:100%}60%,100%{top:-60%}}
html.static .m13-bar::after{display:none}
html.js:not(.static) .m13-gr:not(.go) .m13-bar{scale:1 0}
.m13-bl{display:flex;justify-content:center;gap:0;margin-top:12px}
.m13-bl span{width:150px;text-align:center;font-size:16px;font-weight:800;color:var(--ink);line-height:1.3;word-break:keep-all}
.m13-wn{padding:20px 22px;flex:none}
.m13-wn ul{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column}
.m13-wn li{display:flex;align-items:center;gap:14px;padding:10px 0}
.m13-wn li+li{border-top:1px solid var(--line)}
.m13-wn .ic-sq{width:44px;height:44px;border-radius:13px}
.m13-wn .ic-sq .ic{width:22px;height:22px}
.m13-wn li>div>b{display:block;font-size:18px;color:var(--ink);letter-spacing:-.015em;line-height:1.3}
.m13-wn li>div>span{display:block;font-size:16px;color:var(--muted);line-height:1.35;word-break:keep-all}

/* --- right: target segments --- */
.m13-right{display:grid;grid-template-rows:repeat(3,minmax(0,1fr));gap:16px;min-height:0}
.m13-tg{position:relative;overflow:hidden;display:grid;grid-template-columns:64px minmax(0,1fr);gap:20px;align-items:center;padding:20px 28px 20px 26px;min-height:0;transition:box-shadow .6s var(--ease),border-color .6s var(--ease),translate .6s var(--ease)}
.m13-tg::after{content:'';position:absolute;left:0;top:18px;bottom:18px;width:4px;border-radius:0 4px 4px 0;background:var(--f);opacity:0;transition:opacity .5s var(--ease)}
.m13-tg .ghost{position:absolute;right:22px;top:6px;font-size:96px;font-weight:800;letter-spacing:-.05em;line-height:1;color:var(--f);opacity:.07;pointer-events:none;transition:opacity .6s var(--ease)}
.m13-tg .ic-sq{transition:background .5s var(--ease),color .5s var(--ease),box-shadow .5s var(--ease)}
.m13-tg .t{display:flex;align-items:baseline;gap:12px}
.m13-tg .t .k-eyebrow{font-size:15px}
.m13-tg h3{margin-top:4px;font-size:26px;font-weight:800;color:var(--ink);letter-spacing:-.02em;line-height:1.2}
.m13-tg .d{margin-top:6px;font-size:18px;line-height:1.45;color:var(--text);word-break:keep-all}
.m13-tg .chips{margin-top:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.m13-tg .chips em{font-style:normal;font-size:15px;font-weight:800;color:var(--faint);letter-spacing:.04em}
.m13-tg .chips .pill{height:32px;font-size:16px;padding:0 14px}
.m13-tg .chips .pill .ic{width:16px;height:16px}
.m13-tg .chips .sep{width:1px;height:18px;background:var(--line-2);margin:0 4px}
.m13-tg.on{translate:-4px 0;box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--f) 45%,var(--line))}
.m13-tg.on::after{opacity:1}
.m13-tg.on .ghost{opacity:.14}
.m13-tg.on .ic-sq{background:var(--f);color:#fff;box-shadow:0 12px 26px color-mix(in srgb,var(--f) 36%,transparent)}
</style>

<!-- JS (per-slide) -->
<script>
document.addEventListener('deck:ready',function(e){
  var STATIC=e.detail.static;
  var mk=document.getElementById('mk13'), gr=document.getElementById('gr13');
  var lbs=[].slice.call(mk.querySelectorAll('[data-lb]')), defs=[].slice.call(document.querySelectorAll('[data-def]'));
  var k=0;
  function set(i){
    k=i; mk.setAttribute('data-k',i);
    lbs.forEach(function(l){ l.classList.toggle('on',+l.getAttribute('data-lb')===i); });
    defs.forEach(function(d){ d.classList.toggle('on',+d.getAttribute('data-def')===i); });
  }
  [].slice.call(mk.querySelectorAll('[data-ring]')).forEach(function(c){ c.addEventListener('mouseenter',function(){ set(+c.getAttribute('data-ring')); }); });
  defs.forEach(function(d){ d.addEventListener('mouseenter',function(){ set(+d.getAttribute('data-def')); }); });
  var svg=mk.querySelector('svg');
  if(STATIC){
    set(2); gr.classList.add('go');
    try{ svg.pauseAnimations(); svg.setCurrentTime(2.2); }catch(err){}
    return;
  }
  set(0);
  setTimeout(function(){ gr.classList.add('go'); },500);
  IR.every(2400,function(){ set((k+1)%3); });
});
<\/script>
`},"ir-20-closing":{id:"ir-20-closing",title:"\uB9C8\uBB34\uB9AC: \uD575\uC2EC \uBA54\uC2DC\uC9C0 + QR/\uC5F0\uB77D\uCC98 + \uACC4\uD68D \uB3C4\uB11B + \uB9C8\uC77C\uC2A4\uD1A4 \uB760",kinds:["closing"],text:`<!-- EXEMPLAR: \uB9C8\uBB34\uB9AC \u2014 \uD575\uC2EC \uBA54\uC2DC\uC9C0 + QR/\uC5F0\uB77D\uCC98 + \uD22C\uC790 \uACC4\uD68D \uB3C4\uB11B + \uB9C8\uC77C\uC2A4\uD1A4 -->
<!-- \uBB34\uB300 \uD074\uB798\uC2A4: stage f-brand (cine = \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300) -->
<!-- HTML (\uC5D4\uC9C4 \uD5E4\uB354 \uC5C6\uC74C \u2014 <main class="stage"> \uC548 \uC804\uCCB4) -->
<div class="amb" data-allow-bleed data-allow-scroll><canvas data-particles="54" data-alpha=".85" data-seed="41"></canvas><i class="orb a"></i><i class="orb b"></i></div>
  <div class="irbar"><img class="lg" data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="Qpresen"><div class="rt">INVESTOR RELATIONS<i></i><b>2026</b></div></div>
  <section class="body">
    <div class="lcol">
      <div class="ey20" data-reveal><span class="no">14</span>INVESTMENT \xB7 \uD22C\uC790 \uC81C\uC548<span class="ln"></span></div>
      <h1 class="close20" data-reveal="up" data-delay="120">\uBC1C\uD45C\uAC00 \uB05D\uB098\uB3C4,<br><span class="rep20"><span class="gtext">\uB9E4\uCD9C\uC740 \uBC18\uBCF5</span><svg viewBox="0 0 360 22" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ul20" x1="0" x2="1"><stop offset="0" stop-color="#1A8CFF"/><stop offset=".5" stop-color="#5B63FF"/><stop offset="1" stop-color="#9B4DFF"/></linearGradient></defs><path d="M4 15 C 90 5, 200 4, 356 11" fill="none" stroke="url(#ul20)" stroke-width="5" stroke-linecap="round" opacity=".55" data-draw data-delay="700"/></svg></span>\uB418\uB3C4\uB85D.</h1>
      <p class="sub20" data-reveal data-delay="260"><b>2027\uB144 \uC0C1\uBC18\uAE30 \uC2DC\uB4DC \uD22C\uC790</b>\uB85C \uC81C\uD488 \uACE0\uB3C4\uD654 \xB7 \uCD08\uAE30 \uACE0\uAC1D \uD655\uBCF4 \xB7 \uBC18\uBCF5 \uB9E4\uCD9C \uAC80\uC99D\uC744 \uCD94\uC9C4\uD569\uB2C8\uB2E4<br>(\uADDC\uBAA8\xB7\uBC30\uBD84\xB7\uAE30\uAC04 \uD611\uC758)</p>
      <div class="card glass uof" id="uof" data-reveal="up" data-delay="380">
        <div class="donut">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <defs><linearGradient id="dg20" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A8CFF"/><stop offset=".5" stop-color="#5B63FF"/><stop offset="1" stop-color="#9B4DFF"/></linearGradient></defs>
            <circle cx="150" cy="150" r="112" fill="none" stroke="var(--card-3)" stroke-width="30"/>
            <circle cx="150" cy="150" r="138" fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 6"/>
            <path class="dn s0" stroke="url(#dg20)" d="M153.13 38.04 A112 112 0 0 1 218.34 238.74" data-draw data-delay="600"/>
            <path class="dn s1" d="M213.28 242.41 A112 112 0 0 1 61.26 218.34" data-draw data-delay="850"/>
            <path class="dn s2" d="M57.59 213.28 A112 112 0 0 1 81.66 61.26" data-draw data-delay="1050"/>
            <path class="dn s3" d="M86.72 57.59 A112 112 0 0 1 146.87 38.04" data-draw data-delay="1250"/>
          </svg>
          <div class="dc"><div><div class="t">\uBE44\uC911 (\uC548)</div><div class="v" id="dcv">40<small>%</small></div><div class="l" id="dcl">\uC81C\uD488\xB7\uAC1C\uBC1C<br>\uC778\uB825</div></div></div>
        </div>
        <div class="lg20">
          <div class="hd"><b>\uC2DC\uB4DC \uD22C\uC790\uAE08 \uD65C\uC6A9 \uACC4\uD68D (\uC548)</b><span class="pill o" style="height:30px;font-size:15px">\uC81C\uC548 \uBE44\uC911</span></div>
          <div class="lrow s0 f-brand" data-k="0"><i class="dot"></i><div class="nm">\uC81C\uD488\xB7\uAC1C\uBC1C \uC778\uB825<span>\uD504\uB860\uD2B8\uC5D4\uB4DC\xB7QA</span></div><div class="bar" data-bar="40"><i></i></div><div class="pc" data-count="40">40<small>%</small></div></div>
          <div class="lrow s1 f-violet" data-k="1"><i class="dot"></i><div class="nm">AI\xB7\uAE00\uB798\uC2A4\xB7\uD074\uB77C\uC6B0\uB4DC \uC6B4\uC601<span>AI\xB7\uAE00\uB798\uC2A4 \uC548\uC815\uD654 \xB7 \uD074\uB77C\uC6B0\uB4DC\xB7API</span></div><div class="bar" data-bar="25"><i></i></div><div class="pc" data-count="25">25<small>%</small></div></div>
          <div class="lrow s2 f-teal" data-k="2"><i class="dot"></i><div class="nm">\uC2E4\uC99D\xB7B2B \uC601\uC5C5\xB7\uB3C4\uC785<span>\uD604\uC7A5 \uC2E4\uC99D \xB7 \uB3C4\uC785 \uC9C0\uC6D0</span></div><div class="bar" data-bar="25"><i></i></div><div class="pc" data-count="25">25<small>%</small></div></div>
          <div class="lrow s3 f-amber" data-k="3"><i class="dot"></i><div class="nm">IP\xB7\uC6B4\uC601<span>\uD6C4\uC18D \uD2B9\uD5C8\xB7PCT</span></div><div class="bar" data-bar="10"><i></i></div><div class="pc" data-count="10">10<small>%</small></div></div>
        </div>
      </div>
      <div class="msh" data-reveal data-delay="560"><span class="k-eyebrow">MILESTONES \xB7 \uD22C\uC790 \uD6C4 \uC2E4\uD589 \uACBD\uB85C</span><span class="note-tag">\uBAA9\uD45C \xB7 \uACC4\uD68D</span></div>
      <div class="ms" data-cycle="1700" data-static-step="3" data-reveal="up" data-delay="640">
        <div class="chev" data-step><i class="bg"></i><div><span class="n">STEP 01</span><div class="x">\uC2E4\uC99D 5\uACF3 \xB7<br>\uCCAD\uC911 200\uBA85+</div></div></div>
        <div class="chev" data-step><i class="bg"></i><div><span class="n">STEP 02</span><div class="x">\uC720\uB8CC \uC804\uD658 \xB7<br>\uAE30\uAD00 \uACC4\uC57D</div></div></div>
        <div class="chev" data-step><i class="bg"></i><div><span class="n">STEP 03</span><div class="x">2027\u201328<br>\uAE30\uC5C5\xB7\uD589\uC0AC \uD655\uC7A5</div></div></div>
        <div class="chev goal" data-step><i class="bg"></i><div><span class="n">STEP 04</span><div class="x">2028 \uC0C1\uBC18\uAE30<br>BEP<span class="tg">\uBAA9\uD45C</span></div></div></div>
      </div>
    </div>
    <div class="rcol" data-reveal="right" data-delay="300">
      <div class="halo20"></div>
      <div class="card glass cc">
        <div class="wmbox" data-allow-bleed data-allow-scroll><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt=""></div>
        <div class="top"><img data-image="(\uC7A5\uBA74 \uBB18\uC0AC)" alt="Qpresen \uD050\uD504\uB9AC\uC820"><span class="pill w"><span class="dot live"></span>qpresen.com \uC6B4\uC601 \uC911</span></div>
        <div class="slogan">\uC7A5\uBE44 \xB7 \uC571 \xB7 \uC5B8\uC5B4\uC758 \uC7A5\uBCBD \uC5C6\uC774,<br><span class="gtext">\uB204\uAD6C\uB098 \uC5F0\uACB0\uB418\uB294 AI \uBC1C\uD45C \uD50C\uB7AB\uD3FC</span></div>
        <div class="qrrow">
          <div class="qrbox"><div class="qr"><svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-label="qpresen.com QR"><path d="M0,0h1v1h-1zM1,0h1v1h-1zM2,0h1v1h-1zM3,0h1v1h-1zM4,0h1v1h-1zM5,0h1v1h-1zM6,0h1v1h-1zM9,0h1v1h-1zM11,0h1v1h-1zM12,0h1v1h-1zM14,0h1v1h-1zM18,0h1v1h-1zM19,0h1v1h-1zM20,0h1v1h-1zM21,0h1v1h-1zM22,0h1v1h-1zM23,0h1v1h-1zM24,0h1v1h-1zM0,1h1v1h-1zM6,1h1v1h-1zM8,1h1v1h-1zM9,1h1v1h-1zM13,1h1v1h-1zM14,1h1v1h-1zM16,1h1v1h-1zM18,1h1v1h-1zM24,1h1v1h-1zM0,2h1v1h-1zM2,2h1v1h-1zM3,2h1v1h-1zM4,2h1v1h-1zM6,2h1v1h-1zM8,2h1v1h-1zM9,2h1v1h-1zM10,2h1v1h-1zM11,2h1v1h-1zM12,2h1v1h-1zM14,2h1v1h-1zM18,2h1v1h-1zM20,2h1v1h-1zM21,2h1v1h-1zM22,2h1v1h-1zM24,2h1v1h-1zM0,3h1v1h-1zM2,3h1v1h-1zM3,3h1v1h-1zM4,3h1v1h-1zM6,3h1v1h-1zM8,3h1v1h-1zM9,3h1v1h-1zM10,3h1v1h-1zM11,3h1v1h-1zM13,3h1v1h-1zM16,3h1v1h-1zM18,3h1v1h-1zM20,3h1v1h-1zM21,3h1v1h-1zM22,3h1v1h-1zM24,3h1v1h-1zM0,4h1v1h-1zM2,4h1v1h-1zM3,4h1v1h-1zM4,4h1v1h-1zM6,4h1v1h-1zM11,4h1v1h-1zM12,4h1v1h-1zM13,4h1v1h-1zM16,4h1v1h-1zM18,4h1v1h-1zM20,4h1v1h-1zM21,4h1v1h-1zM22,4h1v1h-1zM24,4h1v1h-1zM0,5h1v1h-1zM6,5h1v1h-1zM9,5h1v1h-1zM11,5h1v1h-1zM14,5h1v1h-1zM18,5h1v1h-1zM24,5h1v1h-1zM0,6h1v1h-1zM1,6h1v1h-1zM2,6h1v1h-1zM3,6h1v1h-1zM4,6h1v1h-1zM5,6h1v1h-1zM6,6h1v1h-1zM8,6h1v1h-1zM10,6h1v1h-1zM12,6h1v1h-1zM14,6h1v1h-1zM16,6h1v1h-1zM18,6h1v1h-1zM19,6h1v1h-1zM20,6h1v1h-1zM21,6h1v1h-1zM22,6h1v1h-1zM23,6h1v1h-1zM24,6h1v1h-1zM8,7h1v1h-1zM9,7h1v1h-1zM10,7h1v1h-1zM14,7h1v1h-1zM15,7h1v1h-1zM16,7h1v1h-1zM0,8h1v1h-1zM6,8h1v1h-1zM8,8h1v1h-1zM10,8h1v1h-1zM11,8h1v1h-1zM17,8h1v1h-1zM18,8h1v1h-1zM21,8h1v1h-1zM22,8h1v1h-1zM23,8h1v1h-1zM0,9h1v1h-1zM2,9h1v1h-1zM3,9h1v1h-1zM4,9h1v1h-1zM11,9h1v1h-1zM13,9h1v1h-1zM14,9h1v1h-1zM15,9h1v1h-1zM16,9h1v1h-1zM17,9h1v1h-1zM19,9h1v1h-1zM20,9h1v1h-1zM21,9h1v1h-1zM22,9h1v1h-1zM23,9h1v1h-1zM2,10h1v1h-1zM3,10h1v1h-1zM4,10h1v1h-1zM5,10h1v1h-1zM6,10h1v1h-1zM10,10h1v1h-1zM13,10h1v1h-1zM14,10h1v1h-1zM15,10h1v1h-1zM18,10h1v1h-1zM19,10h1v1h-1zM21,10h1v1h-1zM23,10h1v1h-1zM24,10h1v1h-1zM0,11h1v1h-1zM3,11h1v1h-1zM5,11h1v1h-1zM7,11h1v1h-1zM8,11h1v1h-1zM13,11h1v1h-1zM15,11h1v1h-1zM16,11h1v1h-1zM18,11h1v1h-1zM21,11h1v1h-1zM24,11h1v1h-1zM1,12h1v1h-1zM2,12h1v1h-1zM3,12h1v1h-1zM6,12h1v1h-1zM7,12h1v1h-1zM10,12h1v1h-1zM12,12h1v1h-1zM13,12h1v1h-1zM16,12h1v1h-1zM18,12h1v1h-1zM24,12h1v1h-1zM0,13h1v1h-1zM1,13h1v1h-1zM3,13h1v1h-1zM9,13h1v1h-1zM10,13h1v1h-1zM15,13h1v1h-1zM16,13h1v1h-1zM17,13h1v1h-1zM19,13h1v1h-1zM23,13h1v1h-1zM0,14h1v1h-1zM4,14h1v1h-1zM6,14h1v1h-1zM9,14h1v1h-1zM11,14h1v1h-1zM12,14h1v1h-1zM15,14h1v1h-1zM16,14h1v1h-1zM18,14h1v1h-1zM19,14h1v1h-1zM20,14h1v1h-1zM21,14h1v1h-1zM23,14h1v1h-1zM24,14h1v1h-1zM0,15h1v1h-1zM2,15h1v1h-1zM3,15h1v1h-1zM4,15h1v1h-1zM5,15h1v1h-1zM11,15h1v1h-1zM19,15h1v1h-1zM21,15h1v1h-1zM22,15h1v1h-1zM24,15h1v1h-1zM0,16h1v1h-1zM3,16h1v1h-1zM6,16h1v1h-1zM11,16h1v1h-1zM15,16h1v1h-1zM16,16h1v1h-1zM17,16h1v1h-1zM18,16h1v1h-1zM19,16h1v1h-1zM20,16h1v1h-1zM22,16h1v1h-1zM8,17h1v1h-1zM9,17h1v1h-1zM12,17h1v1h-1zM13,17h1v1h-1zM14,17h1v1h-1zM16,17h1v1h-1zM20,17h1v1h-1zM0,18h1v1h-1zM1,18h1v1h-1zM2,18h1v1h-1zM3,18h1v1h-1zM4,18h1v1h-1zM5,18h1v1h-1zM6,18h1v1h-1zM9,18h1v1h-1zM10,18h1v1h-1zM11,18h1v1h-1zM16,18h1v1h-1zM18,18h1v1h-1zM20,18h1v1h-1zM24,18h1v1h-1zM0,19h1v1h-1zM6,19h1v1h-1zM9,19h1v1h-1zM12,19h1v1h-1zM13,19h1v1h-1zM15,19h1v1h-1zM16,19h1v1h-1zM20,19h1v1h-1zM23,19h1v1h-1zM0,20h1v1h-1zM2,20h1v1h-1zM3,20h1v1h-1zM4,20h1v1h-1zM6,20h1v1h-1zM9,20h1v1h-1zM10,20h1v1h-1zM12,20h1v1h-1zM14,20h1v1h-1zM15,20h1v1h-1zM16,20h1v1h-1zM17,20h1v1h-1zM18,20h1v1h-1zM19,20h1v1h-1zM20,20h1v1h-1zM22,20h1v1h-1zM24,20h1v1h-1zM0,21h1v1h-1zM2,21h1v1h-1zM3,21h1v1h-1zM4,21h1v1h-1zM6,21h1v1h-1zM10,21h1v1h-1zM14,21h1v1h-1zM15,21h1v1h-1zM17,21h1v1h-1zM18,21h1v1h-1zM23,21h1v1h-1zM24,21h1v1h-1zM0,22h1v1h-1zM2,22h1v1h-1zM3,22h1v1h-1zM4,22h1v1h-1zM6,22h1v1h-1zM10,22h1v1h-1zM11,22h1v1h-1zM12,22h1v1h-1zM15,22h1v1h-1zM21,22h1v1h-1zM22,22h1v1h-1zM24,22h1v1h-1zM0,23h1v1h-1zM6,23h1v1h-1zM10,23h1v1h-1zM11,23h1v1h-1zM14,23h1v1h-1zM15,23h1v1h-1zM16,23h1v1h-1zM17,23h1v1h-1zM18,23h1v1h-1zM19,23h1v1h-1zM20,23h1v1h-1zM24,23h1v1h-1zM0,24h1v1h-1zM1,24h1v1h-1zM2,24h1v1h-1zM3,24h1v1h-1zM4,24h1v1h-1zM5,24h1v1h-1zM6,24h1v1h-1zM8,24h1v1h-1zM10,24h1v1h-1zM13,24h1v1h-1zM14,24h1v1h-1zM16,24h1v1h-1zM18,24h1v1h-1zM21,24h1v1h-1zM24,24h1v1h-1z" fill="currentColor"/></svg></div><i class="cn a"></i><i class="cn b"></i><i class="cn c"></i><i class="cn d"></i><i class="scan"></i></div>
          <div class="qrt">
            <div class="k-eyebrow">SCAN \xB7 \uBB34\uC124\uCE58 \uCCB4\uD5D8</div>
            <div class="h">\uC9C0\uAE08 \uD734\uB300\uD3F0\uC73C\uB85C \uCCB4\uD5D8</div>
            <div class="url gtext">qpresen.com</div>
            <div class="ct">
              <div><i data-icon="sparkles"></i><b>\uB300\uD45C \uC815\uC0C1\uD638</b></div>
              <div><i data-icon="sparkles"></i>swfs1@gist.ac.kr</div>
            </div>
          </div>
        </div>
        <div class="pts">
          <div class="k-eyebrow">INVESTMENT POINTS \xB7 \uD22C\uC790 \uD3EC\uC778\uD2B8</div>
          <div class="ptg" id="ptg">
            <div class="pt f-azure"><span class="pi"><i data-icon="layers"></i></span><i>01</i><b>\uD1B5\uD569 \uC81C\uD488<br>\uACBD\uC7C1\uB825</b></div>
            <div class="pt f-teal"><span class="pi"><i data-icon="sparkles"></i></span><i>02</i><b>\uC2E4\uC99D \uAE30\uBC18<br>\uAC80\uC99D</b></div>
            <div class="pt f-violet"><span class="pi"><i data-icon="repeat"></i></span><i>03</i><b>\uBC18\uBCF5 \uC218\uC775<br>\uAD6C\uC870</b></div>
            <div class="pt f-amber"><span class="pi"><i data-icon="trending-up"></i></span><i>04</i><b>\uACE0\uAC1D\xB7\uD310\uB85C<br>\uD655\uC7A5</b></div>
            <div class="pt f-brand"><span class="pi"><i data-icon="rocket"></i></span><i>05</i><b>\uAE30\uC220\xB7\uC2E4\uD589<br>\uC5ED\uB7C9</b></div>
          </div>
        </div>
        <div class="thx"><span class="gtext">\uAC10\uC0AC\uD569\uB2C8\uB2E4</span><span class="k-small">Qpresen \xB7 \uD050\uD504\uB9AC\uC820<br>Investor Relations 2026</span></div>
      </div>
    </div>
  </section>
  <div class="source">\uC815\uBD80\uC9C0\uC6D0\uAE08(\uACC4\uD68D) 1,000\uB9CC\uC6D0\uC740 \uC2DC\uB4DC\uC640 \uBCC4\uAC1C \xB7 \uD22C\uC790\uAE08 \uD65C\uC6A9 \uBE44\uC911\xB7\uB9C8\uC77C\uC2A4\uD1A4\uC740 \uC81C\uC548(\uC548)\xB7\uBAA9\uD45C</div>

<!-- CSS (per-slide) -->
<style>
/* ===== slide 20 \xB7 investment (closing) ===== */
.body{display:grid;grid-template-columns:minmax(0,1fr) 716px;gap:56px;min-height:0}
.lcol{display:flex;flex-direction:column;min-width:0;min-height:0;padding-top:14px}
.ey20{display:flex;align-items:center;gap:14px;font-size:16px;font-weight:800;letter-spacing:.2em;color:var(--f);text-transform:uppercase}
.ey20 .no{display:inline-grid;place-items:center;height:28px;min-width:44px;padding:0 10px;border-radius:999px;background:var(--qg);color:#fff;font-size:14px;letter-spacing:.06em}
.ey20 .ln{width:56px;height:2px;border-radius:2px;background:var(--qg);opacity:.5}
h1.close20{margin-top:26px;font-size:72px;line-height:1.16;font-weight:800;letter-spacing:-.045em;color:var(--ink)}
.rep20{position:relative;display:inline-block}
.rep20 .gtext{background:linear-gradient(100deg,var(--q1) 0%,var(--q2) 30%,var(--q3) 50%,var(--q2) 70%,var(--q1) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 7s linear infinite}
.rep20 svg{position:absolute;left:-4px;right:-4px;bottom:-14px;width:calc(100% + 8px);height:22px;overflow:visible}
.sub20{margin-top:24px;font-size:22px;line-height:1.55;color:var(--muted);font-weight:500;max-width:900px}
.sub20 b{color:var(--ink);font-weight:700}
/* use-of-funds panel */
.uof{margin-top:34px;display:grid;grid-template-columns:262px minmax(0,1fr);gap:34px;align-items:center;padding:24px 30px 24px 26px}
.donut{position:relative;width:262px;height:262px}
.donut>svg{width:100%;height:100%;overflow:visible}
.dn{fill:none;stroke-width:30;stroke-linecap:butt;transition:stroke-width .5s var(--ease),opacity .5s var(--ease)}
.dn.s1{stroke:var(--violet)}.dn.s2{stroke:var(--teal)}.dn.s3{stroke:var(--amber)}
.dn.on{stroke-width:38}
.uof.cyc .dn:not(.on){opacity:.5}
.dc{position:absolute;inset:0;display:grid;place-items:center;text-align:center;pointer-events:none}
.dc .v{font-size:46px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--ink);font-variant-numeric:tabular-nums}
.dc .v small{font-size:20px;color:var(--q2);margin-left:2px}
.dc .l{margin-top:7px;font-size:16px;line-height:1.3;font-weight:700;color:var(--muted)}
.dc .t{font-size:14px;font-weight:800;letter-spacing:.16em;color:var(--faint);margin-bottom:6px}
.lg20 .hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.lg20 .hd b{font-size:21px;color:var(--ink);letter-spacing:-.02em}
.lrow{display:grid;grid-template-columns:14px 250px minmax(0,1fr) 64px;align-items:center;gap:16px;padding:9px 12px;margin:0 -12px;border-radius:14px;cursor:default;transition:background .4s var(--ease)}
.lrow.on{background:var(--f-50)}
.lrow .dot{width:14px;height:14px;border-radius:5px;background:var(--f)}
.lrow.s0 .dot{background:var(--qg)}
.lrow .nm{font-size:19px;font-weight:800;color:var(--ink);line-height:1.25;letter-spacing:-.01em}
.lrow .nm span{display:block;font-size:16px;font-weight:600;color:var(--muted)}
.lrow .bar{height:8px}
.lrow.s0 .bar>i{background:var(--qg)}
.lrow .pc{font-size:26px;font-weight:800;color:var(--ink);text-align:right;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.lrow .pc small{font-size:16px;color:var(--f);margin-left:1px}
/* milestones */
.msh{margin-top:30px;display:flex;align-items:center;justify-content:space-between}
.msh .k-eyebrow{font-size:15px}
.ms{margin-top:14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.chev{position:relative;height:98px;display:flex;align-items:center;gap:12px;padding:0 30px 0 40px;color:var(--ink);transition:color .5s var(--ease)}
.chev:first-child{padding-left:24px}
.chev .bg{position:absolute;inset:0;background:var(--card-3);clip-path:polygon(0 0,calc(100% - 26px) 0,100% 50%,calc(100% - 26px) 100%,0 100%,26px 50%);transition:background .5s var(--ease)}
.chev:first-child .bg{clip-path:polygon(0 0,calc(100% - 26px) 0,100% 50%,calc(100% - 26px) 100%,0 100%)}
.chev .bg::after{content:'';position:absolute;inset:0;background:var(--qg);opacity:0;transition:opacity .5s var(--ease)}
.chev>*:not(.bg){position:relative}
.chev .n{font-size:14px;font-weight:800;letter-spacing:.14em;color:var(--q2);display:block;margin-bottom:3px;transition:color .5s}
.chev .x{font-size:18px;font-weight:800;line-height:1.3;letter-spacing:-.02em}
.chev.on{color:#fff}
.chev.on .bg::after{opacity:1}
.chev.on .n{color:rgba(255,255,255,.82)}
.chev.goal .bg{background:var(--amber-50);box-shadow:inset 0 0 0 1px var(--amber-100)}
.chev.goal .n{color:var(--amber)}
.chev.goal .bg::after{background:linear-gradient(115deg,var(--amber),var(--gold))}
.chev .tg{display:inline-block;margin-left:6px;font-size:14px;font-weight:800;padding:1px 7px;border-radius:6px;background:var(--amber-100);color:var(--amber);vertical-align:2px}
.chev.goal.on .n{color:rgba(255,255,255,.85)}
.chev.on .tg{background:rgba(255,255,255,.24);color:#fff}

/* ---- right: closing card ---- */
.rcol{position:relative;min-height:0;min-width:0;display:flex}
.halo20{position:absolute;left:40px;right:40px;top:120px;bottom:120px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--q2) 22%,transparent),transparent);filter:blur(30px);pointer-events:none}
.cc{position:relative;flex:1;display:flex;flex-direction:column;padding:40px 46px 34px;border-radius:30px;overflow:hidden;min-height:0}
.cc::before{content:'';position:absolute;left:0;right:0;top:0;height:4px;background:var(--qg)}
.wmbox{position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none}
.wmbox img{position:absolute;right:-70px;bottom:-60px;width:330px;opacity:.06;rotate:-12deg}
.cc .top{display:flex;align-items:center;justify-content:space-between}
.cc .top img{height:64px;width:auto}
.cc .slogan{margin-top:32px;font-size:30px;line-height:1.38;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.qrrow{margin-top:38px;display:grid;grid-template-columns:240px minmax(0,1fr);gap:30px;align-items:center}
.qrbox{position:relative;width:240px;height:240px;display:grid;place-items:center;border-radius:22px;background:var(--card);box-shadow:var(--shadow-lg)}
.qrbox .qr{width:200px;height:200px;color:var(--ink)}
.qrbox .qr svg{width:100%;height:100%}
.qrbox .cn{position:absolute;width:38px;height:38px;border:4px solid var(--q2);animation:cnb 2.4s var(--ease) infinite}
.qrbox .cn.a{left:-8px;top:-8px;border-right:0;border-bottom:0;border-radius:14px 0 0 0;border-color:var(--q1)}
.qrbox .cn.b{right:-8px;top:-8px;border-left:0;border-bottom:0;border-radius:0 14px 0 0;border-color:var(--q2);--tx:-1}
.qrbox .cn.c{left:-8px;bottom:-8px;border-right:0;border-top:0;border-radius:0 0 0 14px;border-color:var(--q2);--ty:-1}
.qrbox .cn.d{right:-8px;bottom:-8px;border-left:0;border-top:0;border-radius:0 0 14px 0;border-color:var(--q3);--tx:-1;--ty:-1}
@keyframes cnb{0%,100%{translate:0 0}50%{translate:calc(var(--tx,1)*6px) calc(var(--ty,1)*6px)}}
.qrbox .scan{position:absolute;left:14px;right:14px;top:20px;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,var(--q2),transparent);box-shadow:0 0 18px 4px color-mix(in srgb,var(--q2) 40%,transparent);animation:scan20 2.6s ease-in-out infinite}
@keyframes scan20{0%{top:20px;opacity:0}12%{opacity:1}88%{opacity:1}100%{top:216px;opacity:0}}
html.static .qrbox .scan{display:none}
.qrt .k-eyebrow{font-size:14px}
.qrt .h{margin-top:10px;font-size:25px;font-weight:800;color:var(--ink);letter-spacing:-.02em;line-height:1.3}
.qrt .url{margin-top:4px;font-size:32px;font-weight:800;letter-spacing:-.02em}
.qrt .ct{margin-top:20px;padding-top:18px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px}
.qrt .ct div{display:flex;align-items:center;gap:10px;font-size:18px;color:var(--text);font-weight:600}
.qrt .ct .ic{width:20px;height:20px;color:var(--q2)}
.qrt .ct b{color:var(--ink)}
.pts{margin-top:44px}
.pts .k-eyebrow{font-size:14px}
.ptg{margin-top:14px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.pt{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px 14px 16px;border-radius:18px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);transition:translate .45s var(--ease),box-shadow .45s var(--ease),border-color .45s var(--ease)}
.pt .pi{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--f-100);color:var(--f);transition:all .45s var(--ease)}
.pt .pi .ic{width:22px;height:22px}
.pt i{position:absolute;right:12px;top:12px;font-style:normal;font-size:14px;font-weight:800;letter-spacing:.06em;color:var(--faint)}
.pt b{font-size:18px;line-height:1.3;letter-spacing:-.02em;color:var(--ink)}
.pt.on{translate:0 -5px;border-color:color-mix(in srgb,var(--f) 45%,var(--line));box-shadow:0 14px 30px color-mix(in srgb,var(--f) 20%,transparent)}
.pt.on .pi{background:var(--f);color:#fff}
.thx{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;padding-top:20px}
.thx .gtext{font-size:44px;font-weight:800;letter-spacing:-.04em;line-height:1.1}
.thx .k-small{font-size:16px;text-align:right;line-height:1.45}
</style>

<!-- JS -->
<script>
document.addEventListener('deck:ready',function(e){
  var STATIC=e.detail.static;
  var segs=[].slice.call(document.querySelectorAll('.dn')), rows=[].slice.call(document.querySelectorAll('.lrow'));
  var uof=document.getElementById('uof'), dcv=document.getElementById('dcv'), dcl=document.getElementById('dcl');
  var P=[40,25,25,10], L=['\uC81C\uD488\xB7\uAC1C\uBC1C<br>\uC778\uB825','AI\xB7\uAE00\uB798\uC2A4<br>\uD074\uB77C\uC6B0\uB4DC \uC6B4\uC601','\uC2E4\uC99D\xB7B2B<br>\uC601\uC5C5\xB7\uB3C4\uC785','IP\xB7\uC6B4\uC601'];
  var k=0;
  function set(i){
    k=i;
    segs.forEach(function(s,j){s.classList.toggle('on',j===i)});
    rows.forEach(function(r,j){r.classList.toggle('on',j===i)});
    dcv.innerHTML=P[i]+'<small>%</small>'; dcl.innerHTML=L[i];
  }
  set(0);
  /* investment points: light up one by one */
  var pts=[].slice.call(document.querySelectorAll('#ptg .pt'));
  if(STATIC){ pts.forEach(function(p){p.classList.add('on')}); return; }
  rows.forEach(function(r,j){ r.addEventListener('mouseenter',function(){ set(j); }); });
  segs.forEach(function(s,j){ s.style.cursor='pointer'; s.addEventListener('mouseenter',function(){ set(j); }); });
  setTimeout(function(){ uof.classList.add('cyc'); IR.every(2400,function(){ set((k+1)%4); }); },1900);
  pts.forEach(function(p,j){ setTimeout(function(){ p.classList.add('on'); setTimeout(function(){ if(j<4) p.classList.remove('on'); },900); },1300+j*380); });
  setTimeout(function(){ var q=0; IR.every(1600,function(){ pts.forEach(function(p,j){p.classList.toggle('on',j===q)}); q=(q+1)%pts.length; }); },3600);
});
<\/script>
`}};function T(a){let t={numbers:["ir-13-market-targets","gochang-05-numbers"],chart:["ir-04-market-slider","ir-13-market-targets"],demo:["ir-04-market-slider","gochang-12-chat-to-agent"],process:["gochang-21-prompt-formula","gochang-12-chat-to-agent"],compare:["gochang-12-chat-to-agent","gochang-10-three-companies"],concept:["gochang-12-chat-to-agent","ir-13-market-targets"],story:["ir-13-market-targets","gochang-05-numbers"],list:["ir-13-market-targets","gochang-10-three-companies"],cover:["ir-01-cover","gochang-01-cover"],section:["gochang-07-section","gochang-01-cover"],closing:["ir-20-closing","gochang-60-closing"],agenda:["gochang-01-cover","gochang-21-prompt-formula"]};return(t[a]||t.story).map(e=>Z[e]).filter(Boolean)}var E=`[\uD558\uC6B0\uC2A4 \uC2A4\uD0C0\uC77C \u2014 \uB808\uD37C\uB7F0\uC2A4 \uB371 3\uC885(\uACE0\uCC3D AI\uD2B9\uAC15\xB7Qpresen IR\xB7800\uC870\uC758 \uBB38\uBC95)\uC5D0\uC11C \uCD94\uCD9C\uD55C '\uC138\uB828\uB418\uACE0 \uD654\uC0AC\uD558\uBA70 \uC0B4\uC544 \uC6C0\uC9C1\uC774\uB294' \uACB0. \uBAA8\uB4E0 \uC7A5\uC740 \uC774 \uACB0 \uC548\uC5D0\uC11C \uBCC0\uC8FC\uD55C\uB2E4]
- \uBB34\uB300: \uAE30\uBCF8\uC740 \uBC1D\uC740 \uD770 \uBB34\uB300 + \uBAA8\uC11C\uB9AC\uC758 \uC740\uC740\uD55C \uC624\uB85C\uB77C/\uADF8\uB77C\uB370\uC774\uC158 \uC6CC\uC2DC + \uB3C4\uD2B8 \uADF8\uB9AC\uB4DC \uC9C8\uAC10. \uC9D9\uC740 \uC2DC\uB124\uB9C8\uD2F1 \uBB34\uB300\uB294 \uC784\uD329\uD2B8 \uC7A5(\uD45C\uC9C0\xB7\uAC04\uC9C0\xB7\uD074\uB77C\uC774\uB9E5\uC2A4)\uC5D0\uB9CC.
- \uC0C9: \uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158(\uBCF4\uB77C\u2192\uD30C\uB791\u2192\uCCAD\uB85D)\uC774 \uC8FC\uC778\uACF5. \uAC15\uC870\uB294 \uADF8\uB77C\uB370\uC774\uC158 \uAE00\uC790(.gtext/.num-g)\uC640 \uADF8\uB77C\uB370\uC774\uC158 \uBA74(.pill.g, .ic-sq.g, .card.solid). \uBCF4\uC870\uC0C9 azure\xB7violet\xB7teal\xB7amber\xB7rose \uB294 '\uC5F0\uD55C \uBA74(-100/-50) + \uC9C4\uD55C \uAE00\uC790(-ink)' \uC870\uD569\uC73C\uB85C \uC544\uC774\uCF58 \uC6D0\xB7\uCE69\xB7\uD0DC\uADF8\uC5D0. \uD68C\uC0C9 \uD1A4\uC628\uD1A4\xB7\uAC00\uB294 \uC120 \uC704\uC8FC\uC758 '\uB9AC\uD3EC\uD2B8 \uB8E9'\uC740 \uAE08\uC9C0.
- \uBA74: \uD770 \uCE74\uB4DC(radius 22~24px, 1px \uC5F0\uD55C \uD14C\uB450\uB9AC, \uAE38\uACE0 \uBD80\uB4DC\uB7EC\uC6B4 \uADF8\uB9BC\uC790) + \uC720\uB9AC \uCE74\uB4DC(.card.glass: \uBC18\uD22C\uBA85\xB7\uBE14\uB7EC\xB7\uD558\uC774\uB77C\uC774\uD2B8 \uC120) + \uC5F0\uD55C \uD2F4\uD2B8 \uCE74\uB4DC(.card.tint). \uCE74\uB4DC \uC548\uC5D0\uB294 \uC544\uC774\uCF58 \uC6D0(.icon-circle)\xB7\uC81C\uBAA9\xB7\uC218\uCE58\xB7\uD0DC\uADF8\uAC00 \uD55C \uC138\uD2B8.
- \uD0C0\uC774\uD3EC: \uC81C\uBAA9 58px(em \uADF8\uB77C\uB370\uC774\uC158), \uCE74\uB4DC \uC81C\uBAA9 24~28px, \uBCF8\uBB38 18~20px, \uB77C\uBCA8 15~16px(\uB300\uBB38\uC790 \uC790\uAC04 .k-eyebrow). \uC22B\uC790\uB294 \uD06C\uAC8C(60~120px, \uADF8\uB77C\uB370\uC774\uC158 \uB610\uB294 --ink)\uC640 \uB2E8\uC704 \uBD84\uB9AC. \uC791\uC740 \uC0C9\uC778 \uB77C\uBCA8(I-01 \uAC19\uC740 \uB9AC\uD3EC\uD2B8\uC2DD \uBC88\uD638)\xB714px \uBBF8\uB9CC \uAE00\uC790\xB7\uD68C\uC0C9 \uC791\uC740 \uAE00\uC790 \uB2E4\uBC1C\uC740 \uAE08\uC9C0.
- \uC7A5\uCE58: \uB3D9\uC2EC\uC6D0\xB7\uAC8C\uC774\uC9C0\xB7\uADF8\uB77C\uB370\uC774\uC158 \uB9C9\uB300\xB7\uB2E8\uACC4 \uCCB4\uC778(\uC544\uC774\uCF58 \uC6D0 + \uD654\uC0B4\uD45C)\xB7\uC571/\uCC44\uD305 \uBAA9\uC5C5(.app \uD0A4\uD2B8)\xB7\uBC88\uD638\uAC00 \uBD99\uC740 \uD0C0\uAE43 \uCE74\uB4DC(01 02 03 \uC6CC\uD130\uB9C8\uD06C \uC22B\uC790)\xB7\uCE69 \uBB36\uC74C\xB7\uC9C4\uD589 \uBC14\xB7\uD638\uBC84 \uD2F8\uD2B8 \uCE74\uB4DC. \uC7A5\uB9C8\uB2E4 '\uB9CC\uC838\uBCF4\uACE0 \uC2F6\uC740' \uC7A5\uCE58 \uD558\uB098.
- \uC0AC\uC9C4: \uC2E4\uBB3C\uAC10\uC774 \uD544\uC694\uD55C \uC7A5\uC5D0\uC11C \uCE21\uBA74 \uD3EC\uD1A0 \uCE74\uB4DC(.photo) \uB610\uB294 \uCF04\uBC88\uC988 \uBC31\uB4DC\uB86D(\uBC1D\uC740 \uBB34\uB300\uC5D0\uC11C\uB294 fade\uB85C \uAE00\uC790 \uC601\uC5ED\uC744 \uD770\uC0C9\uC73C\uB85C \uD655\uBCF4). \uC0AC\uC9C4\uC744 \uC5B4\uB461\uAC8C \uB20C\uB7EC \uAE54\uACE0 \uC791\uC740 \uAE00\uC790\uB97C \uC5B9\uB294 '\uBB34\uAC70\uC6B4' \uC7A5\uBA74\uC740 \uAE08\uC9C0.
- \uBAA8\uC158(\uD544\uC218): \uC7A5\uB9C8\uB2E4 \uB4F1\uC7A5 \uC5F0\uC1C4 14\uAC1C \uC774\uC0C1(\uC694\uC18C\uB9C8\uB2E4 120~250ms \uB9AC\uB4EC, \uBE14\uB7EC\xB7\uD68C\uC804 3D \uB4F1\uC7A5), \uC22B\uC790\uB294 \uC804\uBD80 \uCE74\uC6B4\uD2B8\uC5C5(.pop), '\uC0B4\uC544\uC788\uB294 \uC694\uC18C' 1\uAC1C \uC774\uC0C1(\uC21C\uD658 \uAC15\uC870 data-cycle / \uD750\uB974\uB294 \uC810\uC120 / \uD384\uC2A4 \uC810 / \uC9C4\uD589 \uBC14 / \uCF04\uBC88\uC988 / \uD0C0\uC790 \uD6A8\uACFC), \uC0C1\uD638\uC791\uC6A9 1\uAC1C \uC774\uC0C1(\uD638\uBC84 \uC0C1\uD0DC \uBCC0\uD654 + \uD074\uB9AD\xB7\uD1A0\uAE00\xB7\uC2AC\uB77C\uC774\uB354\xB7\uC790\uB3D9 \uB370\uBAA8 \uC911 \uD558\uB098). \uAE34 \uC7A5\uBA74\uC740 data-after \uC5F0\uC1C4\uB098 gsap \uD0C0\uC784\uB77C\uC778\uC73C\uB85C \uC548\uBB34\uD55C\uB2E4. \uC815\uC9C0 \uD654\uBA74\uCC98\uB7FC \uBCF4\uC774\uB294 \uC7A5\uC740 \uC2E4\uD328\uB2E4.
- \uC815\uC801 \uC0C1\uD0DC\uC758 \uC644\uC131\uB3C4: \uC378\uB124\uC77C\xB7\uC778\uC1C4\xB7\uAC80\uC218\uB294 \uC560\uB2C8\uBA54\uC774\uC158\uC774 \uB05D\uB09C \uC815\uC9C0 \uD654\uBA74\uC744 \uBCF8\uB2E4 \u2014 \uADF8 \uC0C1\uD0DC\uC5D0\uC11C \uBAA8\uB4E0 \uCE74\uB4DC\uAC00 \uCC44\uC6CC\uC838 \uC788\uACE0, \uC21C\uD658 \uAC15\uC870(.on)\uB85C \uC704\uCE58\uAC00 \uB4E4\uB9AC\uAC70\uB098 \uB2E4\uB978 \uCE74\uB4DC\uAC00 \uBE44\uC5B4 \uC788\uC9C0 \uC54A\uC544\uC57C \uD55C\uB2E4(\uAC15\uC870\uB294 \uC0C9\xB7\uAE00\uB85C\uC6B0\uB9CC).`;function Q(a){return(a||"").replace(/([^{}]+)\{([^{}]*)\}/g,(t,i,e)=>{if(!i.split(",").some(s=>/^\s*(?:html\s+|body\s+)?\.stage(?:\.[\w-]+)*(?:::?before|::?after)?\s*$/.test(s)&&!/::?(before|after)/.test(s)))return t;let n=e.split(";").filter(s=>!/^\s*background(?:-color|-image)?\s*:/i.test(s)).join(";");return`${i}{${n}}`})}var Ra=`\uB2F9\uC2E0\uC740 Qpresen \uC2A4\uD29C\uB514\uC624 \uB371\uC758 \uC544\uD2B8 \uB514\uB809\uD130\uC774\uC790 \uD504\uB7F0\uD2B8\uC5D4\uB4DC \uB9AC\uB4DC\uB2E4. \uC7A5\uC744 \uADF8\uB9AC\uAE30 \uC804\uC5D0, \uC774 \uB371 \uD558\uB098\uB9CC\uC744 \uC704\uD55C \uC2DC\uAC01 \uC5B8\uC5B4\uB97C \uC815\uD55C\uB2E4 \u2014 \uB808\uD37C\uB7F0\uC2A4 \uB371\uB4E4\uC774 \uADF8\uB7AC\uB4EF \uB371 \uC804\uC6A9 \uB514\uC790\uC778 \uB808\uC774\uC5B4(CSS/JS)\uB97C \uBA3C\uC800 \uB9CC\uB4E4\uACE0 \uADF8 \uC704\uC5D0 \uBAA8\uB4E0 \uC7A5\uC744 \uC62C\uB9B0\uB2E4.

[\uC785\uB825] \uBE0C\uB9AC\uD504, \uB371 \uD50C\uB79C(\uC139\uC158\xB7\uC7A5\uBCC4 \uC81C\uBAA9\xB7kind\xB7signature), \uD14C\uB9C8 \uD1A0\uD070.
[\uCD9C\uB825 \u2014 \uC815\uD655\uD788 \uC138 \uAD6C\uAC04]
===JSON===
{
 "mood": "\uD55C \uC904 \uBB34\uB4DC \u2014 \uC774 \uB371\uC758 \uC8FC\uC81C\uC5D0\uC11C \uB04C\uC5B4\uB0B8 \uACE0\uC720\uD55C \uD45C\uD604(\uD615\uC2DD \uC608\uC2DC: '\uAE4A\uC740 \uBC14\uB2E4\uC758 \uB0A8\uCCAD\uC0C9 \uC704\uC5D0 \uD615\uAD11 \uB77C\uC784 \uD3EC\uC778\uD2B8, \uC5F0\uAD6C \uB178\uD2B8\uC758 \uC815\uBC00\uD568')",
 "concept": "\uC774 \uB371\uB9CC\uC758 \uC2DC\uAC01 \uC5B8\uC5B4 3~5\uBB38\uC7A5: \uC0C9\uC758 \uC5ED\uD560, \uD615\uD0DC(\uAC01\uC9C4/\uB465\uADFC), \uC120\xB7\uBA74\uC758 \uBE44\uC911, \uC0AC\uC9C4\uC758 \uC4F0\uC784, \uC22B\uC790\uC758 \uD45C\uD604, \uC5EC\uBC31\uC758 \uB9AC\uB4EC",
 "motifs": ["\uBC18\uBCF5 \uBAA8\uD2F0\uD504 3~5\uAC1C \u2014 \uC8FC\uC81C\uC5D0\uC11C \uC720\uB798\uD55C \uAC83(\uD615\uC2DD \uC608\uC2DC: \uB4F1\uACE0\uC120, \uB208\uAE08\uC790 \uB77C\uBCA8, \uD604\uBBF8\uACBD \uC6D0\uD615 \uD504\uB808\uC784)"],
 "brandStops": ["#1F3B8A","#1E88D9","#06B6D4"],  // \uC774 \uB371\uC758 \uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158 3\uC0C9(hex, \uC5B4\uB450\uC6B4\u2192\uBC1D\uC740 \uB610\uB294 \uC0C9\uC0C1 \uC804\uD658). \uC81C\uBAA9 \uAC15\uC870\xB7\uB300\uD615 \uC22B\uC790\xB7\uC54C\uC57D\xB7\uB808\uC77C\uC5D0 \uC4F0\uC778\uB2E4(--qg/--q1~3). \uC8FC\uC81C\uC5D0\uC11C \uB04C\uC5B4\uB0B8 \uC120\uBA85\uD55C \uCC44\uB3C4\uC758 \uC0C9 \u2014 \uBE0C\uB9AC\uD504\uC5D0 \uBE0C\uB79C\uB4DC \uC0C9\uC774 \uC788\uC73C\uBA74 \uADF8 \uC0C9\uC744 \uCCAB \uC2A4\uD1B1\uC73C\uB85C
 "brand": "#1E5BD8",                              // \uAE30\uBCF8 \uAC15\uC870\uC0C9(--brand: \uC544\uC774\uCF58 \uC6D0\xB7\uB9C1\uD06C\xB7\uD65C\uC131 \uC0C1\uD0DC). \uBC1D\uC740 \uBB34\uB300\uC5D0\uC11C \uD770 \uAE00\uC790\uAC00 \uC77D\uD788\uB294 \uC911\uAC04 \uBA85\uB3C4
 "sectionAccents": {"s1":"azure","s2":"teal"},   // \uC139\uC158 id \u2192 brand|azure|violet|teal|amber|rose|navy|ok|danger (\uC139\uC158\uB9C8\uB2E4 \uB2E4\uB974\uAC8C, \uC804\uCCB4 2~4\uC0C9)
 "darkSections": [],                              // \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300(.stage.cine)\uB85C \uADF8\uB9B4 \uC139\uC158 id (0~1\uAC1C \uAD8C\uC7A5; \uC784\uD329\uD2B8 \uC7A5\uBA74\xB7\uD074\uB77C\uC774\uB9E5\uC2A4)
 "photoStrategy": "none|backdrops|side|mixed",
 "images": [ {"id":"p03","role":"backdrop|side|mock|illustration","prompt":"\uC7A5\uBA74 \uBB18\uC0AC(\uD55C\uAD6D\uC5B4, \uAD6C\uCCB4\uC801\xB7\uC0AC\uC2E4\uC801)","ratio":"16:9|1:1|3:4|4:3"} ],  // \uCD5C\uB300 imageBudget \uC7A5. cover/section/image-hero \uC81C\uC678(\uC5D4\uC9C4\uC774 \uB530\uB85C \uC0DD\uC131)
 "motion": "\uBAA8\uC158 \uC5B8\uC5B4 2~3\uBB38\uC7A5(\uB4F1\uC7A5 \uB9AC\uB4EC\xB7\uAC15\uC870 \uBC29\uC2DD\xB7\uC778\uD130\uB799\uC158 \uD1A4)",
 "fx": ["aurora","rail","tilt","3d-in"],         // \uB371 \uC804\uCCB4 \uD6A8\uACFC: aurora(\uBC30\uACBD \uC624\uB85C\uB77C \uBE14\uB86D) rail(\uD478\uD130 \uC139\uC158 \uB808\uC77C) tilt(\uCE74\uB4DC 3D \uD2F8\uD2B8) 3d-in(\uBE14\uB7EC+\uD68C\uC804 \uB4F1\uC7A5). \uAE30\uBCF8\uAC12 \uBAA8\uB450 \uCF2C \u2014 \uBE84 \uC774\uC720\uAC00 \uBD84\uBA85\uD560 \uB54C\uB9CC \uC81C\uC678
 "helpers": [ {"class":"d-\u2026","purpose":"\u2026"} ],  // \uC544\uB798 CSS\uC5D0\uC11C \uC815\uC758\uD55C helper \uD074\uB798\uC2A4 3~8\uAC1C(\uC774\uB984\xB7\uC6A9\uB3C4\uB294 \uC774 \uB371\uC758 \uBAA8\uD2F0\uD504\uC5D0\uC11C)
 "typography": "\uC81C\uBAA9\xB7\uC22B\uC790\xB7\uB77C\uBCA8 \uCC98\uB9AC \uBA54\uBAA8 1~2\uBB38\uC7A5",
 "notes": "\uC7A5 \uC124\uACC4\uC790\uC5D0\uAC8C \uC8FC\uB294 \uC9C0\uC2DC 2~4\uBB38\uC7A5(\uD574\uC57C \uD560 \uAC83/\uD558\uC9C0 \uB9D0 \uAC83)"
}
===CSS===
(\uB371 \uB808\uC774\uC5B4 CSS, 2~6KB. \uBAA8\uB4E0 \uC7A5\uC5D0 \uBCA0\uC774\uC2A4 CSS \uB2E4\uC74C\uC5D0 \uC0BD\uC785\uB41C\uB2E4.
 - helper \uD074\uB798\uC2A4\uB294 \uBC18\uB4DC\uC2DC d- \uC811\uB450\uC0AC(.d-stamp .d-wire \u2026). \uD1A0\uD070(var(--f) \uB4F1)\uC73C\uB85C \uC0C9\uC744 \uC4F4\uB2E4.
 - \uC804\uC5ED \uBBF8\uC138 \uC870\uC815\uC740 \uCD5C\uB300 5\uAC1C \uADDC\uCE59(\uC608: .head h1 em \uADF8\uB77C\uB370\uC774\uC158, .card \uADF8\uB9BC\uC790 \uD1A4, .eyebrow \uC2A4\uD0C0\uC77C). .stage/.stage.cine \uC758 background \uB294 \uB36E\uC5B4\uC4F0\uC9C0 \uB9D0 \uAC83 \u2014 \uC9C8\uAC10\uC740 .stage::after \uAC19\uC740 \uD22C\uBA85 \uC624\uBC84\uB808\uC774\uB85C. cine\uC5D0\uC11C\uB294 --ink/--text\uAC00 \uBC1D\uC740 \uAE00\uC790\uC0C9\uC73C\uB85C, --bg/--card\uAC00 \uC5B4\uB450\uC6B4 \uC0C9\uC73C\uB85C \uBC18\uC804\uB41C\uB2E4(\uC5B4\uB450\uC6B4 \uBA74\uC740 var(--bg)\xB7var(--card)\uB85C). \uB808\uC774\uC544\uC6C3\uC744 \uAE68\uB294 \uC804\uC5ED \uBCC0\uACBD \uAE08\uC9C0(.body/.stage \uD06C\uAE30\xB7padding \uBCC0\uACBD \uAE08\uC9C0).
 - @import\xB7url(http\u2026)\xB7\uC6F9\uD3F0\uD2B8 \uAE08\uC9C0. @keyframes \uC774\uB984\uC740 d- \uC811\uB450\uC0AC.)
===JS===
(\uC120\uD0DD. \uB371 \uB808\uC774\uC5B4 JS 0~3KB \u2014 \uC5EC\uB7EC \uC7A5\uC774 \uACF5\uC720\uD560 \uC791\uC740 \uC720\uD2F8(\uC608: window.DeckFX = { ripple(el), countUpAll() })\uC744 deck:ready \uC774\uBCA4\uD2B8 \uB4A4\uC5D0 \uB178\uCD9C. \uC5C6\uC73C\uBA74 \uBE44\uC6CC \uB454\uB2E4. gsap \uC0AC\uC6A9 \uAC00\uB2A5(\uC4F0\uBA74 \uC790\uB3D9 \uD3EC\uD568).)

[\uB514\uC790\uC778 \uC2DC\uC2A4\uD15C \uC694\uC57D] \uD1A0\uD070: --ink --text --muted --faint --line --line-2 --bg --card --card-2 --card-3 --f(\uAC15\uC870) --f-100 --f-50 --f-ink --q1 --q2 --q3(\uADF8\uB77C\uB370\uC774\uC158 \uC2A4\uD1B1) --qg(\uADF8\uB77C\uB370\uC774\uC158) --r --r-sm --shadow --shadow-lg --ease --ease-out --ease-spring. \uBB34\uB300 1920\xD71080, \uBCF8\uBB38 \uBC15\uC2A4 1728\xD7~680.
\uCEF4\uD3EC\uB10C\uD2B8: .card(.tint .solid .glass .lift .edge) .pill .tag .chip(\uC5B4\uB450\uC6B4 \uBC14\uD0D5\uC6A9) .icon-circle .ic-sq .bullets .bar .tbl .callout .band .kpi .mega .big .num-g .gtext, \uD3EC\uD1A0 \uBC31\uB4DC\uB86D .backdrop(.kb .fade-r .fade-b .soft .dim)+.credit, \uC2DC\uB124\uB9C8\uD2F1 .stage.cine, \uC571 \uBAA9\uC5C5 \uD0A4\uD2B8 .app(.chrome .app-side .app-top .msg .composer .amenu), \uAC00\uC774\uB4DC \uD074\uB9AD \uC5D4\uC9C4 [data-guide].

[\uD558\uC6B0\uC2A4 \uC2A4\uD0C0\uC77C \u2014 \uBC18\uB4DC\uC2DC \uC774 \uC548\uC5D0\uC11C \uBCC0\uC8FC\uD55C\uB2E4]
${E}

[\uC6D0\uCE59]
- \uC8FC\uC81C\xB7\uCCAD\uC911\xB7\uBAA9\uC801\uC5D0 \uB9DE\uB294 '\uD558\uB098\uC758' \uAC15\uD55C \uC544\uC774\uB514\uC5B4\uB97C \uD558\uC6B0\uC2A4 \uC2A4\uD0C0\uC77C \uC704\uC5D0 \uC5B9\uB294\uB2E4: \uBAA8\uD2F0\uD504\xB7\uC0C9 \uBC30\uBD84\xB7\uC7A5\uCE58\uC758 \uC120\uD0DD\uC73C\uB85C \uB371\uC758 \uAC1C\uC131\uC744 \uB9CC\uB4E4\uB418, \uBC1D\uACE0 \uD654\uC0AC\uD558\uBA70 \uC0B4\uC544 \uC6C0\uC9C1\uC774\uB294 \uACB0\uC740 \uC720\uC9C0\uD55C\uB2E4. \uD68C\uC0C9 \uD1A4\uC758 '\uC587\uC740 \uC120 \uB9AC\uD3EC\uD2B8', \uC791\uC740 \uC0C9\uC778 \uB77C\uBCA8, \uC5B4\uB461\uAC8C \uB204\uB978 \uC0AC\uC9C4 \uC704\uC758 \uC791\uC740 \uAE00\uC790 \uAC19\uC740 '\uBB34\uAC81\uACE0 \uC815\uC801\uC778' \uBC29\uD5A5\uC740 \uC5B4\uB5A4 \uC8FC\uC81C\uC5D0\uC11C\uB3C4 \uD0DD\uD558\uC9C0 \uC54A\uB294\uB2E4.
- \uC0C9: \uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158\uC744 \uC8FC\uC778\uACF5\uC73C\uB85C \uB450\uACE0 \uC139\uC158\uBCC4 \uAC15\uC870\uC0C9(2~4\uC0C9)\uC744 \uBC30\uBD84\uD55C\uB2E4. \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uC139\uC158\uC740 \uCD5C\uB300 1\uAC1C(\uC784\uD329\uD2B8 \uC7A5\uBA74).
- \uC0AC\uC9C4: \uBA54\uC2DC\uC9C0\uB97C \uAC15\uD654\uD558\uB294 \uC7A5\uC5D0\uB9CC(\uD604\uC7A5\xB7\uC81C\uD488\xB7\uC0AC\uB78C\xB7\uACF5\uAC04) \u2014 \uBC1D\uC740 \uBB34\uB300\uC5D0\uC11C\uB294 \uCE21\uBA74 \uD3EC\uD1A0 \uCE74\uB4DC \uB610\uB294 \uD770\uC0C9\uC73C\uB85C \uD398\uC774\uB4DC\uB418\uB294 \uBC31\uB4DC\uB86D. imageBudget \uC548\uC5D0\uC11C.
- \uBAA8\uC158: \uB371 \uC804\uCCB4 \uD6A8\uACFC(fx)\uB294 \uAE30\uBCF8 \uB124 \uAC00\uC9C0\uB97C \uBAA8\uB450 \uCF20\uB2E4(aurora\xB7rail\xB7tilt\xB73d-in). \uBAA8\uC158 \uC5B8\uC5B4\uB294 '\uB9AC\uB4EC\xB7\uC0B4\uC544\uC788\uB294 \uC694\uC18C\xB7\uC0C1\uD638\uC791\uC6A9'\uC744 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC9C0\uC2DC\uD55C\uB2E4(\uC608: "\uC22B\uC790\uB294 \uCE74\uC6B4\uD2B8\uC5C5 \uD6C4 \uD31D, \uB2E8\uACC4 \uCCB4\uC778\uC740 400ms \uAC04\uACA9 \uC5F0\uC1C4, \uAC01 \uC7A5\uC5D0 \uC21C\uD658 \uAC15\uC870 1\uAC1C, \uCE74\uB4DC \uD638\uBC84 \uD2F8\uD2B8").
- JSON\uC740 compact\uD558\uAC8C, \uC124\uBA85 \uBB38\uC7A5\uC740 \uC9E7\uAC8C. \uAD6C\uBD84\uC120 \uBC16\uC5D0 \uB2E4\uB978 \uD14D\uC2A4\uD2B8 \uAE08\uC9C0.`;function Ba(a){let t=a.meta;return`theme=${t.theme||"signature-white"} purpose=${t.purpose||""} audience=${t.audience||""}`}async function la(a,t,i){let e=i.imageBudget??6,r=t.slides.map(p=>({id:p.id,section:p.section,type:p.type,kind:p.kind,title:p.title,signature:p.signature})),n=`[\uBE0C\uB9AC\uD504]
\uC8FC\uC81C: ${a.topic}
\uBAA9\uC801: ${a.purpose||""} / \uCCAD\uC911: ${a.audience||""} / \uD1A4: ${a.tone||""}
${a.extra?"\uCD94\uAC00 \uC9C0\uC2DC: "+a.extra+`
`:""}[\uD14C\uB9C8] ${Ba(t)}
[\uC139\uC158] ${JSON.stringify(t.sections)}
[\uC7A5 \uAC1C\uC694] ${JSON.stringify(r)}
[\uC774\uBBF8\uC9C0 \uC608\uC0B0] imageBudget=${e} (cover/section/image-hero/closing \uC81C\uC678\uD55C \uCF58\uD150\uCE20 \uC7A5 \uC911\uC5D0\uC11C \uACE0\uB978\uB2E4)

\uC704 \uB371\uC758 \uC544\uD2B8 \uB514\uB809\uC158\uC744 \uCD9C\uB825 \uD615\uC2DD\uB300\uB85C \uC791\uC131\uD558\uB77C.`,s=await u(i.provider,{system:Ra,messages:[{role:"user",content:n}],maxTokens:7e3,temperature:.6,json:!1,nudge:"(\uCD9C\uB825\uC774 \uC798\uB838\uB2E4. \uAC19\uC740 \uB514\uB809\uC158\uC744 \uB354 \uAC04\uACB0\uD558\uAC8C \u2014 CSS\uB294 \uD575\uC2EC helper\uB9CC, \uC138 \uAD6C\uAC04 \uBAA8\uB450 \u2014 \uB2E4\uC2DC \uCD9C\uB825\uD558\uB77C.)"});i.log?.(`[direct] ${s.model} ${s.ms}ms out=${s.usage?.output??"?"} cost=${s.usage?.cost??"?"}`);let l=s.text.replace(/===\s*JSON\s*===/,"===META==="),o=z(l.includes("===HTML===")?l:l.replace("===CSS===",`===HTML===
(none)
===CSS===`)),{parts:h}=S({meta:o.meta,html:"",css:o.css,js:o.js}),d=o.meta||{},c=["brand","azure","violet","teal","amber","rose","navy","ok","danger"],v={};for(let[p,f]of Object.entries(d.sectionAccents||{}))c.includes(String(f))&&(v[p]=f);let g=["aurora","rail","tilt","3d-in"],m={mood:String(d.mood||""),concept:String(d.concept||""),motifs:Array.isArray(d.motifs)?d.motifs.map(String).slice(0,6):[],palette:{sectionAccents:v,notes:d.typography?String(d.typography):void 0,stops:Array.isArray(d.brandStops)&&d.brandStops.length===3&&d.brandStops.every(p=>/^#[0-9a-fA-F]{6}$/.test(String(p)))?d.brandStops.map(String):void 0,brand:/^#[0-9a-fA-F]{6}$/.test(String(d.brand||""))?String(d.brand):void 0},photoStrategy:["none","backdrops","side","mixed"].includes(d.photoStrategy)?d.photoStrategy:"mixed",imageBudget:e,motion:String(d.motion||""),fx:Array.isArray(d.fx)&&d.fx.length?d.fx.filter(p=>g.includes(p)):g,deckCss:Q(h.css.slice(0,12e3))||void 0,deckJs:h.js.slice(0,6e3)||void 0,helpers:Array.isArray(d.helpers)?d.helpers.map(p=>typeof p=="string"?p:`${p.class} \u2014 ${p.purpose||""}`).slice(0,10):[],images:(Array.isArray(d.images)?d.images:[]).filter(p=>p&&p.id&&p.prompt).slice(0,e).map(p=>({id:String(p.id),role:["backdrop","side","mock","illustration"].includes(p.role)?p.role:"side",prompt:String(p.prompt),ratio:["16:9","1:1","3:4","4:3"].includes(p.ratio)?p.ratio:void 0})),darkSections:Array.isArray(d.darkSections)?d.darkSections.map(String).slice(0,2):[]};return m.notes=d.notes?String(d.notes):void 0,m}function oa(a,t){t.deckCss&&(t.deckCss=Q(t.deckCss)),t.palette?.stops&&(a.meta.stops=t.palette.stops),t.palette?.brand&&!a.meta.brand&&(a.meta.brand=t.palette.brand),a.meta.direction=t,a.meta.fx=t.fx;let i=t.palette?.sectionAccents||{};(a.sections||[]).forEach(e=>{i[e.id]&&(e.accent=i[e.id])})}function L(a,t){if(!a)return"";let i=(a.images||[]).find(n=>n.id===t.id),e=t.section&&(a.darkSections||[]).includes(t.section),r=/^(cover|section|closing)$/.test(String(t.kind||t.type||""));return!i&&r&&a.photoStrategy!=="none"?`
[\uC544\uD2B8 \uB514\uB809\uC158 \u2014 \uC774 \uB371\uC758 \uC2DC\uAC01 \uC5B8\uC5B4, \uBC18\uB4DC\uC2DC \uB530\uB978\uB2E4]
\uBB34\uB4DC: ${a.mood}
\uCEE8\uC149: ${a.concept}
\uBAA8\uD2F0\uD504: ${(a.motifs||[]).join(" \xB7 ")}
\uBAA8\uC158: ${a.motion}
${a.palette?.stops?"\uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158(--qg \xB7 --q1/--q2/--q3): "+a.palette.stops.join(" \u2192 ")+(a.palette.brand?" \xB7 \uAC15\uC870\uC0C9(--brand) "+a.palette.brand:"")+` \u2014 \uC0C9\uC740 \uD1A0\uD070\uC73C\uB85C\uB9CC \uC4F4\uB2E4
`:""}${a.palette?.notes?"\uD0C0\uC774\uD3EC: "+a.palette.notes+`
`:""}${a.notes?"\uC9C0\uC2DC: "+a.notes+`
`:""}\uB371 \uB808\uC774\uC5B4 helper \uD074\uB798\uC2A4(\uC774\uBBF8 \uC815\uC758\uB428, \uADF8\uB300\uB85C \uC0AC\uC6A9): ${(a.helpers||[]).join(" / ")||"(\uC5C6\uC74C)"}
`+`\uC774 \uC7A5(${t.kind||t.type})\uC740 \uBB34\uB300 \uC804\uCCB4 \uAD6C\uC131\uC774\uB2E4: \uC8FC\uC81C\uB97C \uC0C1\uC9D5\uD558\uB294 \uC0AC\uC9C4 \uBC31\uB4DC\uB86D\uC744 \uB123\uC5B4\uB77C \u2014 <div class="backdrop kb"><img data-image="(\uD55C\uAD6D\uC5B4\uB85C \uAD6C\uCCB4\uC801\uC778 \uC7A5\uBA74 \uBB18\uC0AC)" alt="" style="--pos:50% 45%"><div class="credit">AI \uC0DD\uC131 \uC774\uBBF8\uC9C0</div></div> \uB97C \uCCAB \uC694\uC18C\uB85C. \uAE30\uBCF8 \uBC31\uB4DC\uB86D\uC740 \uC67C\uCABD\uC774 \uBC14\uD0D5\uC0C9\uC73C\uB85C \uD398\uC774\uB4DC\uB418\uBBC0\uB85C \uAE00\uC740 \uC67C\uCABD, \uC0AC\uC9C4\uC740 \uC624\uB978\uCABD(\uAE00\uC744 \uC624\uB978\uCABD\uC5D0 \uB450\uB824\uBA74 .fade-r). \uC2DC\uB124\uB9C8\uD2F1 \uBB34\uB300(cine)\uBA74 \uC5B4\uB450\uC6B4 \uC0AC\uC9C4 \uC704 \uD770 \uAE00\uC790. \uC774\uBBF8\uC9C0\uB294 \uC5D4\uC9C4\uC774 \uC0DD\uC131\uD574 \uCC44\uC6B4\uB2E4.
`:`
[\uC544\uD2B8 \uB514\uB809\uC158 \u2014 \uC774 \uB371\uC758 \uC2DC\uAC01 \uC5B8\uC5B4, \uBC18\uB4DC\uC2DC \uB530\uB978\uB2E4]
\uBB34\uB4DC: ${a.mood}
\uCEE8\uC149: ${a.concept}
\uBAA8\uD2F0\uD504: ${(a.motifs||[]).join(" \xB7 ")}
\uBAA8\uC158: ${a.motion}
${a.palette?.stops?"\uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158(--qg \xB7 --q1/--q2/--q3): "+a.palette.stops.join(" \u2192 ")+(a.palette.brand?" \xB7 \uAC15\uC870\uC0C9(--brand) "+a.palette.brand:"")+` \u2014 \uC0C9\uC740 \uD1A0\uD070\uC73C\uB85C\uB9CC \uC4F4\uB2E4
`:""}${a.palette?.notes?"\uD0C0\uC774\uD3EC: "+a.palette.notes+`
`:""}${a.notes?"\uC9C0\uC2DC: "+a.notes+`
`:""}\uB371 \uB808\uC774\uC5B4 helper \uD074\uB798\uC2A4(\uC774\uBBF8 \uC815\uC758\uB428, \uADF8\uB300\uB85C \uC0AC\uC6A9): ${(a.helpers||[]).join(" / ")||"(\uC5C6\uC74C)"}
${e?`\uC774 \uC7A5\uC740 \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300\uB2E4: \uC5D4\uC9C4\uC774 .stage.cine \uC744 \uC801\uC6A9\uD558\uBBC0\uB85C \uC5B4\uB450\uC6B4 \uBC14\uD0D5 \uC704 \uBC1D\uC740 \uAE00\uC790\xB7\uC720\uB9AC \uCE74\uB4DC\uB85C \uC124\uACC4\uD55C\uB2E4(\uD1A0\uD070\uC740 \uC790\uB3D9 \uBC18\uC804).
`:""}${i?`\uC774 \uC7A5\uC740 \uC0AC\uC9C4\uC744 \uC4F4\uB2E4 (role=${i.role}, ratio=${i.ratio||(i.role==="backdrop"?"16:9":"4:3")}): \uB808\uC774\uC544\uC6C3\uC5D0 <img data-image="${i.prompt.replace(/"/g,"'")}" alt="\u2026" class="\u2026"> \uB97C \uB123\uC5B4\uB77C. backdrop\uC774\uBA74 <div class="backdrop kb fade-r"><img data-image=\u2026 style="--pos:50% 40%"></div> \uB97C .body \uCCAB \uC694\uC18C\uB85C \uB450\uACE0 \uAE00\uC740 \uC67C\uCABD\uC5D0, side\uBA74 \uC624\uB978\uCABD \uC5F4(\u2265560px)\uC5D0 .photo \uCE74\uB4DC\uB85C. \uC774\uBBF8\uC9C0\uB294 \uC5D4\uC9C4\uC774 \uC0DD\uC131\uD574 \uCC44\uC6B4\uB2E4(\uC9C0\uAE08\uC740 \uD50C\uB808\uC774\uC2A4\uD640\uB354).
`:`\uC774 \uC7A5\uC5D0\uB294 \uC0AC\uC9C4\uC744 \uB123\uC9C0 \uC54A\uB294\uB2E4(\uB2E4\uC774\uC5B4\uADF8\uB7A8\xB7SVG\xB7\uC22B\uC790\uB85C \uD45C\uD604).
`}`}var Na=new Set(["cover","section","closing","agenda"]);function C(a){return!0}function B(a,t){let i=String(a||""),e=String(t||"");return i==="cover"?"cover":i==="section"?"section":i==="closing"?"closing":i==="agenda"?"agenda":/kpi|big-number/.test(i)?"numbers":/chart|table/.test(i)?"chart":/comparison|matrix|pricing/.test(i)?"compare":/process|timeline|checklist/.test(i)?"process":/mockup|annotated/.test(i)?"demo":/diagram|bullets|summary|team|cards/.test(i)?/사례|스토리|이야기/.test(e)?"story":"concept":"story"}var da=`${E}

[\uCD9C\uB825 \uC608\uC0B0] HTML\xB7CSS\xB7JS \uD569\uACC4 14KB \uC548\uC5D0\uC11C(\uCC38\uACE0 \uB371 \uC7A5\uB2F9 \uD3C9\uADE0 12KB). \uC7A5\uC2DD \uADDC\uCE59\uC744 \uB298\uB9AC\uAE30\uBCF4\uB2E4 \uC7A5\uCE58 \uD558\uB098\uB97C \uC815\uD655\uD558\uAC8C \u2014 \uC0DD\uC131 \uC2DC\uAC04 \uD55C\uB3C4(\uC57D 120\uCD08)\uAC00 \uC788\uB2E4.

[\uBB34\uB300 \uADDC\uACA9]
- \uC5D4\uC9C4\uC774 <main class="stage f-{accent}"> \uC548\uC5D0 \uC0C1\uB2E8 \uBC14\uC640 <header class="head">(eyebrow + h1 \uC81C\uBAA9 + p.sub)\uB97C \uADF8\uB824 \uC900\uB2E4. \uB2F9\uC2E0\uC740 <section class="body"> \uC548\uC5D0 \uB4E4\uC5B4\uAC08 \uB0B4\uC6A9\uB9CC \uC4F4\uB2E4.
- .body \uBC15\uC2A4: \uAC00\uB85C 1728px \xD7 \uC138\uB85C \uC57D 680px (sub\uAC00 \uC5C6\uC73C\uBA74 \uC57D 730px). \uBAA8\uB4E0 \uB0B4\uC6A9\uC740 \uC774 \uBC15\uC2A4 \uC548\uC5D0 \uB4E4\uC5B4\uAC00\uC57C \uD558\uACE0 \uB118\uCE58\uBA74 \uC548 \uB41C\uB2E4. \uC2A4\uD06C\uB864 \uAE08\uC9C0, \uBC15\uC2A4 \uBC16 \uC808\uB300 \uBC30\uCE58 \uAE08\uC9C0.
- .body \uAE30\uBCF8\uAC12: display:flex; flex-direction:column; flex:1; min-height:0. CSS\uC5D0\uC11C .body{display:grid;grid-template-columns:\u2026;grid-template-rows:minmax(0,1fr) auto;gap:\u2026;min-height:0} \uCC98\uB7FC \uC9C1\uC811 \uBC14\uAFD4 \uC368\uB3C4 \uB41C\uB2E4(\uAD8C\uC7A5).
- \uADF8\uB9AC\uB4DC/\uD50C\uB809\uC2A4 \uC790\uC2DD\uC5D0\uB294 min-height:0; min-width:0 \uC744 \uB123\uC5B4 \uB118\uCE68\uC744 \uB9C9\uB294\uB2E4. \uB192\uC774\uB294 1fr / flex:1 \uB85C \uB098\uB204\uACE0 \uACE0\uC815 px \uB192\uC774\uB294 \uC791\uC740 \uC694\uC18C\uC5D0\uB9CC \uC4F4\uB2E4. \uAE34 \uD14D\uC2A4\uD2B8 \uC694\uC18C\uC5D0\uB294 overflow:hidden \uC744 \uAC78\uC5B4 \uB454\uB2E4.
- \uAE00\uC790 \uD06C\uAE30 \uD558\uD55C: \uBCF8\uBB38 18px, \uCEA1\uC158\xB7\uD0DC\uADF8 15px(\uC808\uB300 \uCD5C\uC18C 14px). \uCE74\uB4DC \uC81C\uBAA9 24~28px, \uD070 \uC22B\uC790 60~120px(\uB2E8\uC704\uB294 22~28px \uBD84\uB9AC), \uACB0\uB860 \uBB38\uC7A5 22~27px. h1 \uC81C\uBAA9\uC740 \uC5D4\uC9C4\uC774 58px\uB85C \uADF8\uB9B0\uB2E4. \uD55C \uC7A5\uC5D0 15px \uC774\uD558 \uAE00\uC790\uB294 6\uAC1C \uC774\uD558.
- \uC5F4 \uD3ED: \uCE74\uB4DC\uAC00 \uB4E4\uC5B4\uAC00\uB294 \uC5F4\uC740 420px \uC774\uC0C1, \uCE74\uB4DC 2\uC5F4 \uC601\uC5ED\uC740 760px \uC774\uC0C1. \uD55C\uAE00 \uB2E8\uC5B4\uAC00 \uC138\uB85C\uB85C \uCABC\uAC1C\uC9C8 \uB9CC\uD07C \uC881\uC740 \uCE78\uC744 \uB9CC\uB4E4\uC9C0 \uC54A\uB294\uB2E4(\uB77C\uBCA8\uC5D0 word-break:keep-all). \uB0B4\uC6A9\uC774 \uB9CE\uC740 \uCABD\uC5D0 \uB354 \uB113\uC740 \uC5F4\uC744 \uC900\uB2E4.
- \uC22B\uC790\xB7\uAC12\uC740 HTML\uC5D0 \uCD5C\uC885\uAC12\uC744 \uC801\uC5B4 \uB454\uB2E4(data-count \uC694\uC18C\uC758 \uD14D\uC2A4\uD2B8 = \uCD5C\uC885\uAC12, JS\uAC00 \uAC31\uC2E0\uD558\uB294 \uAC12\uB3C4 \uCD08\uAE30 \uD45C\uAE30\uAC12 \uD544\uC218). \uC815\uC801 \uBAA8\uB4DC(\uC378\uB124\uC77C\xB7\uC778\uC1C4)\uC5D0\uC11C \uBE48\uCE78\uC774 \uBCF4\uC774\uBA74 \uC548 \uB41C\uB2E4.

[\uB514\uC790\uC778 \uD1A0\uD070 \u2014 \uC0C9\uC740 \uBC18\uB4DC\uC2DC var()\uB85C \uC4F4\uB2E4]
--ink(\uC81C\uBAA9 \uAE00\uC790) --text(\uBCF8\uBB38) --muted(\uBCF4\uC870) --faint(\uC544\uC8FC \uC5F0\uD568) --line / --line-2(\uD14C\uB450\uB9AC) --bg --card / --card-2 / --card-3(\uBA74 \uB2E8\uACC4)
--f(\uC774 \uC7A5\uC758 \uAC15\uC870\uC0C9: \uC139\uC158\uBCC4 \uC790\uB3D9) --f-100(\uC5F0\uD55C \uAC15\uC870\uBA74) --f-50 --f-ink(\uAE00\uC790\uC6A9 \uC9C4\uD55C \uAC15\uC870\uC0C9 \u2014 \uAC15\uC870 \uAE00\uC790\xB7\uC22B\uC790\uC5D0 \uC0AC\uC6A9; --f\uB294 \uBA74\xB7\uC544\uC774\uCF58\xB7\uB9C9\uB300\uC5D0)
--brand --azure --violet --teal --amber --rose --navy --ok --danger --gold (+ \uAC01\uAC01 -100 \uC5F0\uD55C \uBA74, -ink \uAE00\uC790\uC6A9)
--qg(\uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158) --q1 --q2 --q3(\uADF8\uB77C\uB370\uC774\uC158 \uC2A4\uD1B1 \uC0C9) --r(24px) --r-sm(16px) --r-xs(11px) --shadow --shadow-lg --ease
\uC694\uC18C\uC5D0 class="f-azure | f-violet | f-teal | f-amber | f-rose | f-navy | f-ok | f-danger" \uB97C \uC8FC\uBA74 \uADF8 \uD558\uC704\uC758 --f / --f-100 / --f-ink \uAC00 \uBC14\uB010\uB2E4(\uCE74\uB4DC\uBCC4 \uC0C9 \uAD6C\uBD84).
\uB2E4\uD06C \uD14C\uB9C8\uC5D0\uC11C\uB3C4 \uD1A0\uD070\uC774 \uC790\uB3D9 \uBC18\uC804\uB41C\uB2E4. \uACE0\uC815\uC0C9(#fff \uB4F1)\uC740 \uADF8\uB77C\uB370\uC774\uC158\xB7solid \uBA74 \uC704\uC758 \uD770 \uAE00\uC790\uC5D0\uB9CC \uC4F4\uB2E4.

[\uCEF4\uD3EC\uB10C\uD2B8 \uD074\uB798\uC2A4 \u2014 \uBCA0\uC774\uC2A4 CSS\uAC00 \uC81C\uACF5\uD55C\uB2E4. \uC815\uD655\uD55C \uB73B\uB300\uB85C\uB9CC \uC4F8 \uAC83(\uB2E4\uB978 \uB73B\uC73C\uB85C \uC4F0\uBA74 \uC2A4\uD0C0\uC77C\uC774 \uAF2C\uC778\uB2E4)]
.card(\uD770 \uCE74\uB4DC: --card \uBC14\uD0D5\xB7\uD14C\uB450\uB9AC\xB7\uADF8\uB9BC\uC790\xB7radius 24px\xB7padding 28px 30px) \uBCC0\uD615 .card.tint(--f-50 \uC5F0\uD55C \uBC14\uD0D5) .card.solid(--f-ink \uBC14\uD0D5\xB7\uD770 \uAE00\uC790) .card.flat(\uADF8\uB9BC\uC790 \uC5C6\uC74C) .card.glass(\uC720\uB9AC) .card.lift(hover \uC0C1\uC2B9) .card.dark(\uC9D9\uC740 \uB0A8\uC0C9) \xB7 .gborder(\uADF8\uB77C\uB370\uC774\uC158 \uD14C\uB450\uB9AC \uCE74\uB4DC) \xB7 .card-title(\uCE74\uB4DC \uC81C\uBAA9 \uC904)
\uC22B\uC790: .mega(120px) .big(64px) \u2014 \uB458 \uB2E4 --ink \uC0C9 \uAD75\uC740 \uC22B\uC790. \uADF8\uB77C\uB370\uC774\uC158 \uAE00\uC790\uB294 .gtext / .num-g. \u203B .num \uC740 \uC22B\uC790 \uAC12\uC774 \uC544\uB2C8\uB77C '\uBC88\uD638 \uC6D0 \uBC30\uC9C0'(44px \uC6D0, \uD770 \uAE00\uC790)\uB2E4 \u2014 \uAC12 \uD45C\uC2DC\uC5D0 \uC4F0\uC9C0 \uB9D0 \uAC83.
\uC544\uC774\uCF58 \uD2C0: .icon-circle(56px \uC6D0, --f-100 \uBC14\uD0D5 --f \uC544\uC774\uCF58) .ic-sq(52px \uC0AC\uAC01, .ic-sq.lg 64px, .ic-sq.g \uADF8\uB77C\uB370\uC774\uC158) .avatar(64px \uC6D0, \uADF8\uB77C\uB370\uC774\uC158, \uC774\uB2C8\uC15C)
\uB77C\uBCA8\uB958: .k-eyebrow(15px \uB300\uBB38\uC790 \uC790\uAC04 \uB77C\uBCA8, --f-ink) .label(17px \uAD75\uC740 --f-ink) .tag(15px, --card-3 \uBC14\uD0D5 --muted \uAE00\uC790) .pill(16px \uB465\uADFC \uC54C\uC57D, --f-100 \uBC14\uD0D5 --f-ink \uAE00\uC790; .pill.g \uADF8\uB77C\uB370\uC774\uC158 \uD770 \uAE00\uC790, .pill.o \uC544\uC6C3\uB77C\uC778) .delta(.up \uB179\uC0C9 / .down \uBE68\uAC15 / .flat \uD68C\uC0C9 \uC791\uC740 \uC54C\uC57D) .note(16px --faint \u2014 \uC911\uC694\uD55C \uAE00\uC5D4 \uC4F0\uC9C0 \uB9D0 \uAC83) .legend(15px --muted \uAC00\uB85C \uBC94\uB840)
\u203B .chip \uC740 \uC5B4\uB450\uC6B4 \uBC14\uD0D5\uC6A9 \uBC18\uD22C\uBA85 \uD770 \uCE69\uC774\uB2E4. \uBC1D\uC740 \uCE74\uB4DC \uC704\uC5D0\uC11C\uB294 .pill \uC774\uB098 .tag \uB97C \uC4F4\uB2E4.
\uBC15\uC2A4\uB958: .callout(--f-50 \uBC14\uD0D5 21px \uACB0\uB860 \uBC15\uC2A4, flex) .band(\uAC00\uB85C \uB760, 21px) .meta-bar(\uAC00\uB85C \uBA54\uD0C0 \uC904 19px) .kpi(\uC138\uB85C flex \uBB36\uC74C) .bullets>li(21px \uBD88\uB9BF, \uC810\uC740 --f) .tbl(\uD45C: th --card-3 \uBC14\uD0D5, td 18px) .divider / .hair(1px \uC120)
\uB9C9\uB300: <div class="bar" data-bar="42"><i></i></div> (\uB192\uC774 10px \uD2B8\uB799, \uC548\uC758 i\uAC00 --f \uC0C9\uC73C\uB85C 42%\uAE4C\uC9C0 \uCC38)
\uADF8\uB9AC\uB4DC: .grid-2 .grid-3 .grid-4 .grid-5 .grid-6 (gap 24px, \uC138\uB85C \uAF49 \uCC44\uC6C0)
\uCEE8\uD2B8\uB864: .seg>button(.on)(\uC138\uADF8\uBA3C\uD2B8 \uD1A0\uAE00; .seg.g) input.rng(\uC2AC\uB77C\uC774\uB354; style="--p:62%" \uB85C \uCC44\uC6C0 \uD45C\uC2DC) .toggle(.on) .btn(.btn.ghost) .kbd .tap(\uD0ED \uD6A8\uACFC \uC6D0)
\u203B \uC608\uC57D\uB41C \uC774\uB984(\uBCA0\uC774\uC2A4\uAC00 \uC804\uC5ED\uC73C\uB85C \uC815\uC758) \u2014 \uB2E4\uB978 \uB73B\uC73C\uB85C \uC7AC\uC0AC\uC6A9 \uAE08\uC9C0: num, chip, bar, grid, label, note, legend, img, art, source, float, pulse, caret, orb, wm, hair, kbd, seg, tap, toggle, btn, avatar, band, callout, delta, tag, pill, kpi, k-title, k-small, k-body. \uC0C8 \uD074\uB798\uC2A4\uB294 \uC774 \uBAA9\uB85D\uACFC \uACB9\uCE58\uC9C0 \uC54A\uB294 \uC774\uB984\uC73C\uB85C(\uC608: .mapbox, .tile5, .x-gauge).
\uC544\uC774\uCF58: <i data-icon="\uC774\uB984"></i> \uAC00 24px \uC120\uD615 SVG \uC544\uC774\uCF58\uC73C\uB85C \uCE58\uD658\uB41C\uB2E4(\uD06C\uAE30\uB294 \uBD80\uBAA8\uC758 .ic{width;height} \uADDC\uCE59\uC73C\uB85C). \uC774\uBAA8\uC9C0 \uAE08\uC9C0. \uC774\uB984\uC740 \uB2E4\uC74C \uC911\uC5D0\uC11C\uB9CC:
${I}

[\uBAA8\uC158 \u2014 \uBCA0\uC774\uC2A4 JS\uAC00 data-\uC18D\uC131\uC744 \uCC98\uB9AC\uD55C\uB2E4. JS \uC5C6\uC774\uB3C4 \uB3D9\uC791]
- data-reveal="" | "up" | "left" | "right" | "scale" | "fade" + data-delay="ms": \uB4F1\uC7A5 \uC560\uB2C8\uBA54\uC774\uC158(\uC9C0\uC815 \uC5C6\uC73C\uBA74 70ms \uAC04\uACA9 \uC790\uB3D9). \uC694\uC18C 10~25\uAC1C\uC5D0 \uB9AC\uB4EC \uC788\uAC8C \uB098\uB220 \uC900\uB2E4.
- data-count="12345" (+ data-decimals data-prefix data-suffix data-duration): \uC22B\uC790 \uCE74\uC6B4\uD2B8\uC5C5. \uC694\uC18C \uC548 \uD14D\uC2A4\uD2B8\uB294 \uCD5C\uC885\uAC12(\uC608: 12,345).
- data-type (+ data-speed): \uD0C0\uC790 \uD6A8\uACFC. \uB0B4\uBD80 \uD0DC\uADF8 \uC5C6\uB294 \uC21C\uC218 \uD14D\uC2A4\uD2B8 \uC694\uC18C\uC5D0\uB9CC.
- .bar data-bar="42" \uC548\uC758 <i></i> \uAC00 42%\uAE4C\uC9C0 \uCC28\uC624\uB984. svg path data-draw: \uC120 \uADF8\uB9AC\uAE30. data-grow: \uC790\uB77C\uB0A8.
- \uBD80\uBAA8 data-cycle="2800" \uC548\uC758 [data-step] \uC694\uC18C\uB97C \uCC28\uB840\uB85C .on \uCC98\uB9AC(\uC790\uB3D9 \uD558\uC774\uB77C\uC774\uD2B8, mouseenter\uB85C \uC120\uD0DD). \uC21C\uD658 \uAC15\uC870\uB294 \uC0C9\xB7\uAE00\uB85C\uC6B0\xB7\uD14C\uB450\uB9AC\xB7\uC0B4\uC9DD \uCEE4\uC9D0\uB9CC \uBC14\uAFBC\uB2E4 \u2014 \uB0B4\uC6A9\uC744 \uC811\uC5C8\uB2E4 \uD3B4\uB294 \uC544\uCF54\uB514\uC5B8/\uD0ED \uC804\uD658(.on \uC544\uB2CC \uCE74\uB4DC\uC758 \uBCF8\uBB38 \uC228\uAE40, \uD328\uB110 1\uAC1C\uB9CC \uD45C\uC2DC)\uC740 \uAE08\uC9C0: \uC815\uC801 \uD654\uBA74(\uC378\uB124\uC77C\xB7\uC778\uC1C4\xB7\uAC80\uC218)\uC5D0\uC11C \uBE48 \uCE74\uB4DC\xB7\uBE48 \uD328\uB110\uB85C \uBCF4\uC778\uB2E4. \uBAA8\uB4E0 \uCE74\uB4DC\xB7\uD328\uB110\uC740 \uD56D\uC0C1 \uB0B4\uC6A9\uC774 \uCC44\uC6CC\uC9C4 \uC0C1\uD0DC\uB85C \uBCF4\uC5EC\uC57C \uD55C\uB2E4.
- [data-mock] \uC548\uC758 [data-at="ms"] \uC694\uC18C\uAC00 \uC2DC\uAC04\uCC28\uB85C \uB098\uD0C0\uB0A8(\uCC44\uD305\xB7\uD654\uBA74 \uC2DC\uC5F0). data-click \uC774\uBA74 .cursor \uAC00 \uADF8 \uC704\uCE58\uB85C \uC774\uB3D9, data-type-text \uB294 \uD0C0\uC774\uD551, \uBD80\uBAA8 data-loop="ms" \uBA74 \uBC18\uBCF5.
- <canvas data-particles="60"></canvas>: \uD30C\uD2F0\uD074 \uBC30\uACBD.
- \uC0B4\uC544\uC788\uB294 \uC694\uC18C \uB9CC\uB4E4\uAE30: \uC21C\uD658 \uAC15\uC870 <div data-cycle="2600"><article data-step>\u2026</article>\u2026</div>(.on \uC5D0 \uC2A4\uD0C0\uC77C), \uD750\uB974\uB294 \uC810\uC120 <path class="flowline" data-draw> \uB610\uB294 stroke-dasharray + @keyframes dashflow, \uD384\uC2A4 \uC810 .pulse, \uC9C4\uD589 \uBC14 .bar data-bar, \uCF04\uBC88\uC988 .backdrop.kb, \uD0C0\uC790 data-type, \uCE74\uC6B4\uD2B8\uC5C5 data-count. \uC774 \uC911 \uD558\uB098\uB294 \uBC18\uB4DC\uC2DC \uB05D\uAE4C\uC9C0 \uC6C0\uC9C1\uC778\uB2E4(\uB4F1\uC7A5\uB9CC \uD558\uACE0 \uBA48\uCD94\uB294 \uC7A5 \uAE08\uC9C0).
- \uC815\uC801 \uBAA8\uB4DC(html.static: \uC378\uB124\uC77C\xB7\uC778\uC1C4)\uC5D0\uC11C\uB294 \uBAA8\uB4E0 reveal\uC774 \uC989\uC2DC \uC644\uB8CC \uC0C1\uD0DC\uB85C \uADF8\uB824\uC9C4\uB2E4. JS\uB3C4 e.detail.static \uC774\uBA74 \uCD5C\uC885 \uC0C1\uD0DC\uB97C \uC989\uC2DC \uADF8\uB9AC\uACE0 \uB05D\uB0B8\uB2E4.

- \uC5F0\uC1C4 \uB4F1\uC7A5: data-after="#\uC55E\uC694\uC18Cid" data-gap="ms" \u2192 \uC55E \uC694\uC18C\uC758 \uD0C0\uC774\uD551/\uCE74\uC6B4\uD2B8/\uB4F1\uC7A5\uC774 \uB05D\uB09C \uB4A4 \uC2DC\uC791(\uB808\uD37C\uB7F0\uC2A4 \uB371\uC758 \uB9AC\uB4EC). \uAE34 \uC7A5\uBA74\uC740 3~4\uB2E8\uACC4\uB85C \uC5F0\uC1C4.
- \uC0AC\uC9C4 \uBC31\uB4DC\uB86D: <div class="backdrop kb"><img data-image="\uC7A5\uBA74 \uBB18\uC0AC" style="--pos:50% 40%" alt=""><div class="credit">AI \uC0DD\uC131 \uC774\uBBF8\uC9C0</div></div> \u2014 .body \uCCAB \uC694\uC18C\uB85C \uB450\uBA74 \uD654\uBA74 \uC804\uCCB4(\uBB34\uB300 \uAC00\uC7A5\uC790\uB9AC\uAE4C\uC9C0) \uC0AC\uC9C4\uC774 \uAE54\uB9AC\uACE0, \uAE30\uBCF8(=.fade-l)\uC740 \uC67C\uCABD ~45%\uAC00 \uBB34\uB300 \uBC14\uD0D5\uC0C9\uC73C\uB85C \uD398\uC774\uB4DC\uB418\uC5B4 \uAE00\uC790 \uC601\uC5ED\uC774 \uB41C\uB2E4(\uAE00 \uC67C\uCABD \xB7 \uC0AC\uC9C4 \uC624\uB978\uCABD). \uAE00\uC744 \uC624\uB978\uCABD\uC5D0 \uB450\uB824\uBA74 .fade-r(\uC624\uB978\uCABD\uC774 \uBC14\uD0D5\uC0C9 \xB7 \uC0AC\uC9C4 \uC67C\uCABD), \uAE00\uC744 \uC704\uC5D0 \uB450\uB824\uBA74 .fade-b, \uC544\uB798\uC5D0 \uB450\uB824\uBA74 .fade-t. \uADDC\uCE59: \uAE00\uACFC \uC0AC\uC9C4\uC740 \uBC18\uB4DC\uC2DC \uBC18\uB300\uD3B8 \u2014 \uD398\uC774\uB4DC\uB418\uC9C0 \uC54A\uC740 \uC0AC\uC9C4 \uC704\uC5D0 \uBCF8\uBB38 \uAE00\uC790\uB97C \uC62C\uB9AC\uC9C0 \uB9D0 \uAC83(\uCE74\uB4DC/\uC720\uB9AC \uC548\uC5D0 \uB123\uB294 \uAC83\uC740 \uAC00\uB2A5). kb=\uCF04\uBC88\uC988. \uBC1D\uC740 \uBB34\uB300(light)\uC5D0\uC11C\uB294 dim/soft\uB97C \uC4F0\uC9C0 \uB9D0 \uAC83(\uAE00\uC790\uAC00 \uBB3B\uD78C\uB2E4) \u2014 \uC0AC\uC9C4\uC744 \uC5B4\uB461\uAC8C \uB204\uB974\uACE0 \uC2F6\uC73C\uBA74 META.stage="cine". \uC544\uD2B8 \uB514\uB809\uC158\uC774 \uC774 \uC7A5\uC5D0 \uC0AC\uC9C4\uC744 \uD5C8\uC6A9\uD560 \uB54C\uB9CC.
- \uC0AC\uC9C4 \uCE74\uB4DC: <figure class="photo card"><img data-image="\u2026" alt=""><figcaption class="cap">\uCEA1\uC158</figcaption></figure> (side \uC0AC\uC9C4). \uC774\uBBF8\uC9C0\uB294 \uC5D4\uC9C4\uC774 \uC0DD\uC131\xB7\uCE58\uD658\uD55C\uB2E4(src \uC4F0\uC9C0 \uB9D0 \uAC83).
- \uC571 \uD654\uBA74 \uBAA9\uC5C5 \uD0A4\uD2B8: <div class="app claude|gpt v2"> \uC548\uC5D0 .chrome(\uBE0C\uB77C\uC6B0\uC800 \uC0C1\uB2E8\uBC14: .tl \uC2E0\uD638\uB4F1, .url \uC8FC\uC18C) .app-row > .app-side(\uC0AC\uC774\uB4DC\uBC14 .it \uD56D\uBAA9) + .app-main(.app-top, .msg.user/.msg, .composer(.inp, .send)) \xB7 \uB4DC\uB86D\uB2E4\uC6B4 .amenu(.open) \xB7 \uC544\uD2F0\uD329\uD2B8 .art-card \xB7 \uC0AC\uC774\uB4DC \uD328\uB110 .app-panel. \uC2E4\uC81C SaaS \uD654\uBA74\uC744 \uC7AC\uD604\uD560 \uB54C.
- \uAC00\uC774\uB4DC \uD074\uB9AD \uC5D4\uC9C4: \uBAA9\uC5C5 \uB8E8\uD2B8\uC5D0 data-guide='[{"at":600,"do":"click","sel":"#btn","call":"\uC5EC\uAE30\uB97C \uB204\uB974\uBA74","num":1,"pos":"r"},{"at":1800,"do":"type","sel":"#inp","text":"\uC785\uB825\uD560 \uBB38\uC7A5","speed":22,"call":"\uC9C8\uBB38 \uC785\uB825","num":2},{"at":4200,"do":"show","show":".reply"},{"at":4500,"do":"point","sel":".reply","call":"\uB2F5\uC774 \uC774\uB807\uAC8C","num":3,"pos":"l"}]' \uB97C \uC8FC\uBA74 \uCEE4\uC11C\uAC00 \uC6C0\uC9C1\uC774\uBA70 \uBC88\uD638 \uCF5C\uC544\uC6C3\xB7\uB9C1\xB7\uD0C0\uC774\uD551\uC744 \uC790\uB3D9 \uC2DC\uC5F0\uD55C\uB2E4. do: click|type|point|show|hide|clear|call, \uC635\uC158 open/close(\uBA54\uB274 .open), step(\uC6B0\uCE21 \uB2E8\uACC4 \uBAA9\uB85D [data-step] \uAC15\uC870), hold. \uC815\uC801 \uBAA8\uB4DC\uB294 \uCD5C\uC885 \uC0C1\uD0DC+\uCF5C\uC544\uC6C3\uB9CC.
- \uB371 \uC804\uCCB4 \uD6A8\uACFC(\uC544\uD2B8 \uB514\uB809\uC158\uC774 \uCF2C): \uC624\uB85C\uB77C \uBE14\uB86D, \uD478\uD130 \uC139\uC158 \uB808\uC77C, \uCE74\uB4DC 3D \uD2F8\uD2B8(hover), \uBE14\uB7EC+\uD68C\uC804 \uB4F1\uC7A5 \u2014 \uC790\uB3D9. \uCE74\uB4DC\uC5D0 data-notilt \uB85C \uD2F8\uD2B8 \uC81C\uC678.
- \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300: \uC544\uD2B8 \uB514\uB809\uC158\uC774 \uC9C0\uC815\uD55C \uC139\uC158\uC740 .stage.cine(\uC5B4\uB450\uC6B4 \uBC30\uACBD, \uC720\uB9AC \uCE74\uB4DC, \uD770 \uAE00\uC790)\uC73C\uB85C \uB80C\uB354\uB41C\uB2E4 \u2014 \uADF8 \uC7A5\uC740 \uC5B4\uB450\uC6B4 \uBC14\uD0D5\uC5D0 \uB9DE\uAC8C \uC124\uACC4. cine\uC5D0\uC11C\uB294 \uD1A0\uD070\uC774 \uBC18\uC804\uB41C\uB2E4: --bg/--card/--line\uC740 \uC5B4\uB450\uC6B4 \uC0C9, --ink/--text\uB294 \uBC1D\uC740 \uAE00\uC790\uC0C9 (\uC989 --ink\uB294 '\uB0A8\uC0C9'\uC774 \uC544\uB2C8\uB77C '\uAE00\uC790\uC0C9'). \uBC30\uACBD\uC744 \uC5B4\uB461\uAC8C \uCE60\uD558\uB824\uACE0 var(--ink)\uB97C \uC4F0\uC9C0 \uB9D0\uACE0 var(--bg)\xB7var(--card)\uB97C \uC4F4\uB2E4. .stage.cine \uC758 background \uB294 \uC5D4\uC9C4\uC774 \uCE60\uD558\uBBC0\uB85C \uB36E\uC5B4\uC4F0\uC9C0 \uB9D0 \uAC83.
- \uB77C\uC774\uBE0C\uB7EC\uB9AC: gsap 3 \uC804\uC5ED \uC0AC\uC6A9 \uAC00\uB2A5(gsap.timeline / gsap.to / stagger \u2014 \uC4F0\uBA74 \uC790\uB3D9 \uD3EC\uD568, 20~50\uC904\uC758 \uC548\uBB34\uC5D0 \uAD8C\uC7A5). THREE(three.js r152) \uC804\uC5ED \uC0AC\uC6A9 \uAC00\uB2A5 \u2014 3D\uAC00 \uBA54\uC2DC\uC9C0\uC758 \uD575\uC2EC\uC77C \uB54C\uB9CC(\uBD80\uD488 \uAD6C\uC870\xB7\uACF5\uAC04\xB7\uD750\uB984), 100\uC904 \uC774\uB0B4, \uCE94\uBC84\uC2A4\uB294 .body \uC548 \uCEE8\uD14C\uC774\uB108\uC5D0 append, STATIC\uC774\uBA74 \uD55C \uD504\uB808\uC784\uB9CC \uB80C\uB354. \uADF8 \uC678 \uC678\uBD80 \uB77C\uC774\uBE0C\uB7EC\uB9AC \uAE08\uC9C0.

[\uBB34\uB300 \uC804\uCCB4 \uC7A5 \u2014 kind\uAC00 cover / section / closing / agenda \uC77C \uB54C]
- META.head="none": \uC5D4\uC9C4 \uD5E4\uB354\uAC00 \uC5C6\uC73C\uBBC0\uB85C \uC81C\uBAA9\xB7\uBD80\uC81C\xB7\uBA54\uD0C0\uB97C HTML \uC548\uC5D0 \uC9C1\uC811 \uC4F4\uB2E4. \uBB34\uB300 \uD328\uB529(\uC704 104 \xB7 \uC88C\uC6B0 96 \xB7 \uC544\uB798 100px) \uC548\uCABD\uC774 .body(1728\xD7876)\uC774\uACE0, <div class="backdrop \u2026"> \uB294 absolute\uB77C \uBB34\uB300 \uC804\uCCB4(1920\xD71080)\uB97C \uCC44\uC6B4\uB2E4.
- \uD45C\uC9C0(cover): \uC0AC\uC9C4 \uBC31\uB4DC\uB86D(.backdrop.kb \u2014 \uAE00 \uC67C\uCABD\xB7\uC0AC\uC9C4 \uC624\uB978\uCABD, \uB610\uB294 cine \uBB34\uB300) + \uD070 \uC81C\uBAA9 64~88px(.hero-title, em \uAC15\uC870) + \uBD80\uC81C + \uBA54\uD0C0 \uC904(.meta-line: \uC77C\uC2DC\xB7\uC7A5\uC18C\xB7\uCCAD\uC911) + \uBC1C\uD45C\uC790 \uBC30\uC9C0(.speaker) + \uD0A4\uC6CC\uB4DC \uCE69 + \uC624\uB978\uCABD/\uC544\uB798\uC5D0 \uBAA9\uCC28 \uB610\uB294 KPI \uB760. \uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC ir-01(\uC81C\uD488 \uBAA9\uC5C5\uD615)\xB7gochang-01(\uC2DC\uB124\uB9C8\uD2F1\uD615).
- \uAC04\uC9C0(section): \uB85C\uB9C8\uC22B\uC790 \uAC70\uB300 \uD0C0\uC774\uD3EC(.sec-num) + \uC139\uC158\uBA85(.hero-title) + \uC774 \uC139\uC158\uC5D0\uC11C \uB2E4\uB8F0 3~4\uAC1C(\uCE69/\uBAA9\uB85D) + \uC139\uC158 \uC9C4\uD589 \uD45C\uC2DC(.secs). cine \uAD8C\uC7A5. \uCC38\uACE0 gochang-07.
- \uB9C8\uBB34\uB9AC(closing): \uD575\uC2EC \uBA54\uC2DC\uC9C0 \uD55C \uBB38\uC7A5(60~80px) + \uC624\uB298\uC758 \uC22B\uC790 3\uAC1C + \uB2E4\uC74C \uD589\uB3D9/\uC5F0\uB77D\uCC98(.contact) + '\uC9C8\uBB38\xB7\uD1A0\uB860' \uC548\uB0B4. QR\uC740 \uC5D4\uC9C4\uC774 \uC81C\uACF5\uD558\uC9C0 \uC54A\uC73C\uBBC0\uB85C \uB123\uC9C0 \uC54A\uB294\uB2E4. \uCC38\uACE0 ir-20\xB7gochang-60.
- \uBAA9\uCC28(agenda): \uC139\uC158 3~6\uAC1C\uB97C \uBC88\uD638\xB7\uC81C\uBAA9\xB7\uD55C \uC904\xB7\uBD84\uB7C9(\uC7A5\uC218/\uBD84)\uC73C\uB85C, \uC67C\uCABD \uD070 \uBC88\uD638 \uD0C0\uC774\uD3EC + \uC624\uB978\uCABD \uC124\uBA85 \uCE74\uB4DC, \uB610\uB294 \uC138\uB85C \uC2A4\uD15D. \uAC01 \uD56D\uBAA9 \uB4F1\uC7A5 \uB9AC\uB4EC 120ms.
- \uC774 \uC7A5\uB4E4\uC5D0\uB3C4 \uC2DC\uADF8\uB2C8\uCC98(\uC0AC\uC9C4\xB7\uBAA9\uC5C5\xB7\uAC70\uB300 \uD0C0\uC774\uD3EC)\uB97C \uB450\uB418 \uAE00\uC790 \uC218\uB294 \uC801\uAC8C. \uBC1C\uD45C\uC790 \uC774\uB984\xB7\uC18C\uC18D\xB7\uD589\uC0AC\xB7\uC77C\uC2DC\uB294 \uB371 \uBA54\uD0C0\uC5D0\uC11C \uAC00\uC838\uC628\uB2E4(\uC5C6\uC73C\uBA74 \uC0DD\uB7B5).

[JS \uADDC\uCE59]
- \uC804\uBD80 document.addEventListener('deck:ready', function(e){ var STATIC=e.detail.static; \u2026 }) \uC548\uC5D0 \uC4F4\uB2E4. \uC804\uC5ED \uBCC0\uC218 \uAE08\uC9C0(window.DeckFX \uB4F1 \uB371 \uB808\uC774\uC5B4\uAC00 \uC81C\uACF5\uD55C \uAC83\uC740 \uC0AC\uC6A9 \uAC00\uB2A5).
- \uC790\uB3D9 \uB370\uBAA8: \uC544\uBB34\uAC83\uB3C4 \uB204\uB974\uC9C0 \uC54A\uC544\uB3C4 2~6\uCD08 \uC548\uC5D0 \uC6C0\uC9C1\uC784\uC774 \uBCF4\uC774\uACE0, \uC0AC\uC6A9\uC790\uAC00 \uD074\uB9AD\xB7\uC2AC\uB77C\uC774\uB354\xB7\uD1A0\uAE00\uC744 \uB9CC\uC9C0\uBA74 \uC790\uB3D9 \uB370\uBAA8\uB97C \uBA48\uCD98\uB2E4.
- \uAE08\uC9C0: alert/confirm/prompt, fetch/XHR, localStorage, location \uBCC0\uACBD, \uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4(\uBC1C\uD45C\uC790 \uD0A4\uC640 \uCDA9\uB3CC), \uC678\uBD80 \uB77C\uC774\uBE0C\uB7EC\uB9AC, document.write, \uB05D\uC5C6\uC774 \uB204\uC801\uB418\uB294 \uD0C0\uC774\uBA38.
- \uC2AC\uB77C\uC774\uB354\xB7\uB4DC\uB798\uADF8 \uCEE8\uD2B8\uB864\uC5D0\uB294 touchstart/touchend \uC5D0 stopPropagation (\uC2AC\uB77C\uC774\uB4DC \uB118\uAE40 \uBC29\uC9C0).
- SVG \uCC28\uD2B8\uB294 \uC9C1\uC811 \uADF8\uB9B0\uB2E4(viewBox\uB294 \uC2E4\uC81C px, \uCD95\xB7\uACA9\uC790\xB7\uAC12 \uB77C\uBCA8 \uD3EC\uD568). 150\uC904 \uC548\uCABD.

[\uCF58\uD150\uCE20 \uADDC\uCE59]
- \uC0AC\uC2E4\xB7\uC218\uCE58\uB294 \uBE0C\uB9AC\uD504\xB7\uC790\uB8CC\xB7\uD50C\uB79C\uC758 content_hints \uC5D0 \uC788\uB294 \uAC83\uC744 \uC6B0\uC120 \uC4F4\uB2E4. \uC790\uB8CC\uAC00 \uC5C6\uB294 \uC8FC\uC81C\uB77C\uBA74 \uB110\uB9AC \uC54C\uB824\uC9C4 \uACF5\uAC1C \uC0AC\uC2E4\xB7\uC218\uCE58(\uAE30\uAD00\xB7\uC5F0\uB3C4\uB97C \uBD99\uC774\uACE0 \uBD88\uD655\uC2E4\uD558\uBA74 '\uC57D'\xB7'\uCD94\uC815')\uB97C \uC368\uC11C \uC7A5\uC744 \uAD6C\uCCB4\uC801\uC73C\uB85C \uB9CC\uB4E0\uB2E4 \u2014 \uB9C9\uC5F0\uD55C \uC77C\uBC18\uB860("\uC911\uC694\uD558\uB2E4", "\uD544\uC694\uD558\uB2E4")\uC73C\uB85C \uCC44\uC6B0\uC9C0 \uC54A\uB294\uB2E4. \uCD9C\uCC98\xB7\uAE30\uC900\uC5F0\uB3C4\uB294 META.source \uC5D0. \uC218\uCE58\uB97C \uAFB8\uBA70\uB0B4\uC9C4 \uC54A\uB294\uB2E4.
- \uD55C \uC7A5 = \uD55C \uBA54\uC2DC\uC9C0. \uC81C\uBAA9\uC740 \uD50C\uB79C\uC758 \uAC83\uC744 \uC4F0\uB418 \uB354 \uB0A0\uCE74\uB85C\uC6B4 \uACB0\uB860\uD615\uC774\uBA74 \uB2E4\uB4EC\uC5B4\uB3C4 \uB41C\uB2E4(**\uAC15\uC870** 1\uAC1C, \u2264 28\uC790). sub \uB294 \uADFC\uAC70 1\uBB38\uC7A5(\u2264 60\uC790).
- \uBC00\uB3C4: \uCC38\uACE0 \uB371 \uC218\uC900\uC73C\uB85C \uAF49 \uCC28\uB418 \uC228 \uC274 \uC5EC\uBC31. \uCE74\uB4DC desc \u2264 45\uC790, \uB77C\uBCA8 \u2264 22\uC790, \uACB0\uB860 \uBB38\uC7A5 \u2264 60\uC790. \uC601\uC5B4 \uC57D\uC5B4\uC5D4 \uC9E7\uC740 \uD480\uC774.
- \uC774 \uC7A5\uC758 \uBA54\uC2DC\uC9C0\uC5D0 \uB9DE\uB294 '\uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC' \uD558\uB098\uB97C \uC911\uC2EC\uC5D0 \uB454\uB2E4(\uD070 \uC22B\uC790 \uBB36\uC74C / \uBE44\uAD50 / \uD750\uB984 / \uCC28\uD2B8 / \uC2DC\uC5F0 / \uAD6C\uC870\uB3C4). \uB2E4\uB978 \uC7A5\uACFC \uB808\uC774\uC544\uC6C3\uC774 \uACB9\uCE58\uC9C0 \uC54A\uAC8C \uD55C\uB2E4(\uC544\uB798 \uB371 \uAC1C\uC694\uC758 signature \uCC38\uACE0).
- \uD14D\uC2A4\uD2B8\uB294 \uD55C\uAD6D\uC5B4(\uBE0C\uB9AC\uD504\uAC00 \uB2E4\uB978 \uC5B8\uC5B4\uBA74 \uADF8 \uC5B8\uC5B4).`,ca=`[\uCD9C\uB825 \uD615\uC2DD \u2014 \uC815\uD655\uD788 \uC544\uB798 4\uAC1C \uAD6C\uBD84\uC120, \uADF8 \uBC16\uC758 \uC124\uBA85\xB7\uCF54\uB4DC\uD39C\uC2A4 \uAE08\uC9C0]
===META===
{"title":"\uACB0\uB860\uD615 \uC81C\uBAA9(**\uAC15\uC870**)","sub":"\uADFC\uAC70 \uD55C \uBB38\uC7A5","source":"\uCD9C\uCC98\xB7\uAE30\uC900\uC5F0\uB3C4(\uC5C6\uC73C\uBA74 \uBE48 \uBB38\uC790\uC5F4)","notes":{"t":45,"s":"\uBC1C\uD45C \uB300\uBCF8(\uAD6C\uC5B4\uCCB4 \uC874\uB313\uB9D0, 80~220\uC790)"},"signature":"\uC774 \uC7A5\uC758 \uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC \uD55C \uC904(\u2264 40\uC790)","head":"engine|none","stage":"light|cine"}
 - head: engine = \uC5D4\uC9C4\uC774 \uC0C1\uB2E8\uC5D0 \uBC88\uD638\xB7eyebrow\xB7h1 \uC81C\uBAA9\xB7sub\uB97C \uADF8\uB9B0\uB2E4(\uCF58\uD150\uCE20 \uC7A5 \uAE30\uBCF8). none = \uD45C\uC9C0\xB7\uAC04\uC9C0\xB7\uB9C8\uBB34\uB9AC\xB7\uBAA9\uCC28\uCC98\uB7FC \uBB34\uB300 \uC804\uCCB4\uB97C \uC9C1\uC811 \uAD6C\uC131(\uC81C\uBAA9\uB3C4 HTML \uC548\uC5D0 \uC9C1\uC811).
 - stage: cine = \uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300(\uD1A0\uD070 \uC804\uCCB4\uAC00 \uB2E4\uD06C\uB85C \uBC18\uC804; \uD45C\uC9C0\xB7\uAC04\uC9C0\xB7\uD074\uB77C\uC774\uB9E5\uC2A4\uC5D0 \uAD8C\uC7A5), light = \uAE30\uBCF8.
===HTML===
(section.body \uC548\uC5D0 \uB4E4\uC5B4\uAC08 HTML. <style>\xB7<script> \uD0DC\uADF8 \uAE08\uC9C0. \uC678\uBD80 \uB9AC\uC18C\uC2A4\xB7\uC774\uBBF8\uC9C0 URL\xB7base64 \uAE08\uC9C0. \uC544\uC774\uCF58\uC740 <i data-icon="\u2026"></i>)
===CSS===
(\uC774 \uC7A5\uB9CC\uC758 CSS. \uBCA0\uC774\uC2A4 \uD074\uB798\uC2A4\uB97C \uB36E\uC5B4\uC368\uB3C4 \uB41C\uB2E4. @import \xB7 url(http\u2026) \uAE08\uC9C0)
===JS===
(\uD544\uC694 \uC5C6\uC73C\uBA74 \uBE44\uC6CC \uB454\uB2E4)`;function N(a,t=[]){let e=T(a).map((r,n)=>`--- \uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC ${n+1}: ${r.title} ---
${r.text}`).join(`

`);return`\uB2F9\uC2E0\uC740 Qpresen \uD504\uB9AC\uBBF8\uC5C4 \uB371\uC758 \uC2AC\uB77C\uC774\uB4DC \uB514\uC790\uC774\uB108\uC774\uC790 \uD504\uB7F0\uD2B8\uC5D4\uB4DC \uC5D4\uC9C0\uB2C8\uC5B4\uB2E4. \uD15C\uD50C\uB9BF\uC744 \uCC44\uC6B0\uB294 \uAC83\uC774 \uC544\uB2C8\uB77C, \uC544\uB798 \uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC(\uC2E4\uC81C \uC218\uC791\uC5C5 \uB808\uD37C\uB7F0\uC2A4 \uB371\uC5D0\uC11C \uBC1C\uCDCC)\uC640 \uAC19\uC740 \uC218\uC900\uC73C\uB85C \uC774 \uC7A5 \uD558\uB098\uC758 HTML\xB7CSS\xB7JS\uB97C \uC9C1\uC811 \uC124\uACC4\uD55C\uB2E4. \uB514\uC790\uC778 \uC2DC\uC2A4\uD15C(\uD1A0\uD070\xB7\uD074\uB798\uC2A4\xB7\uBAA8\uC158)\uC744 \uADF8\uB300\uB85C \uC4F0\uB418 \uB808\uC774\uC544\uC6C3\uACFC \uC2DC\uAC01 \uC7A5\uCE58\uB294 \uC774 \uC7A5\uC758 \uBA54\uC2DC\uC9C0\uC5D0 \uB9DE\uCDB0 \uC0C8\uB85C \uC9E0\uB2E4.

${da}
${k(t,"fill")}
[\uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC \u2014 \uD488\uC9C8 \uAE30\uC900. \uAD6C\uC870\xB7\uBC00\uB3C4\xB7\uBAA8\uC158 \uB9AC\uB4EC\uC744 \uBC30\uC6B0\uB418, \uB0B4\uC6A9\uACFC \uB808\uC774\uC544\uC6C3\uC744 \uBCF5\uC0AC\uD558\uC9C0 \uB9D0 \uAC83]
${e}

${ca}`}function z(a){let t=a.replace(/\r/g,""),i=(o,h)=>{let d=new RegExp(`===\\s*${o}\\s*===\\s*\\n?([\\s\\S]*?)(?=\\n\\s*===\\s*(?:${h.join("|")})\\s*===|$)`),c=t.match(d);return c?c[1].replace(/^\s*```[a-z]*\s*\n/i,"").replace(/\n\s*```\s*$/i,"").trim():""},e=i("META",["HTML","CSS","JS"]),r=i("HTML",["CSS","JS","META"]),n=i("CSS",["JS","META","HTML"]),s=i("JS",["META","HTML","CSS"]),l={};try{let o=e.indexOf("{"),h=e.lastIndexOf("}");o>=0&&h>o&&(l=JSON.parse(e.slice(o,h+1)))}catch{l={}}if(!r)throw new Error("rich: HTML section missing ("+t.slice(0,160).replace(/\n/g," ")+")");return{meta:l,html:r,css:n,js:s}}function S(a){let t=[],{html:i,css:e,js:r}=a;return i=i.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(n,s)=>(e+=`
`+s,t.push("style-in-html"),"")),i=i.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,(n,s)=>(r+=`
`+s,t.push("script-in-html"),"")),/<link\b/i.test(i)&&(i=i.replace(/<link\b[^>]*>/gi,""),t.push("link-tag")),/<(iframe|video|audio|source|object|embed)\b/i.test(i)&&(i=i.replace(/<(iframe|video|audio|source|object|embed)\b[^>]*>(?:<\/\1>)?/gi,""),t.push("external-media")),/<img\b[^>]*\ssrc="(?!data:)/i.test(i)&&(i=i.replace(/<img\b([^>]*)\ssrc="(?!data:)[^"]*"([^>]*)>/gi,"<img$1$2>"),t.push("img-src")),/https?:\/\//i.test(i)&&(i=i.replace(/\s(?:src|href)="https?:\/\/[^"]*"/gi,""),t.push("url-in-html")),/@import/i.test(e)&&(e=e.replace(/@import[^;]*;/gi,""),t.push("css-import")),/url\(\s*['"]?https?:/i.test(e)&&(e=e.replace(/url\(\s*['"]?https?:[^)]*\)/gi,"none"),t.push("css-url")),/position\s*:\s*fixed/i.test(e)&&(e=e.replace(/position\s*:\s*fixed/gi,"position:absolute"),t.push("position-fixed")),/\d+(vh|vw)\b/.test(e)&&t.push("viewport-units"),/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.write|window\.open|location\.(href|assign|replace))\b/.test(r)&&(r=r.replace(/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.write|window\.open)\s*\(/g,"(void 0)("),t.push("js-forbidden-api")),/\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/.test(r)&&(r=r.replace(/\b(alert|confirm|prompt)\s*\(/g,"console.log("),t.push("js-dialog")),/<script\s[^>]*src=/i.test(r)&&t.push("js-script-src"),{parts:{meta:a.meta,html:i.trim(),css:e.trim(),js:r.trim()},problems:t}}function Ha(a,t=2e4){let e=[`\uC8FC\uC81C/\uC694\uCCAD: ${a.topic}`,a.purpose?`\uBAA9\uC801: ${a.purpose}`:"",a.audience?`\uCCAD\uC911: ${a.audience}`:"",a.durationMin?`\uBC1C\uD45C \uC2DC\uAC04: ${a.durationMin}\uBD84`:"",a.tone?`\uD1A4: ${a.tone}`:"",a.lang?`\uC5B8\uC5B4: ${a.lang}`:"\uC5B8\uC5B4: ko",a.presenter?`\uBC1C\uD45C\uC790: ${a.presenter.name}${a.presenter.org?" ("+a.presenter.org+")":""}`:"",a.extra?`\uCD94\uAC00 \uC9C0\uC2DC: ${a.extra}`:""].filter(Boolean).join(`
`);return a.materials&&(e+=`

[\uCC38\uACE0 \uC790\uB8CC \u2014 \uC0AC\uC2E4\xB7\uC218\uCE58\uB294 \uC5EC\uAE30\uC11C\uB9CC]
${a.materials.slice(0,t)}`),e}function pa(a,t,i){let e=t.meta||{},r=e.notes&&typeof e.notes=="object"?{t:Number(e.notes.t)||a.t||45,s:String(e.notes.s||"")}:{t:a.t||45,s:typeof e.notes=="string"?e.notes:a.intent||""};return{id:a.id,section:a.section||void 0,title:String(e.title||a.title),sub:e.sub!=null?String(e.sub):a.sub,source:e.source?String(e.source):void 0,notes:r,body:{type:"custom",bare:!0,rich:!0,html:t.html,css:t.css||void 0,js:t.js||void 0,kind:a.kind,signature:e.signature||a.signature,description:e.signature?String(e.signature):void 0,noHead:e.head?e.head==="none":Na.has(String(a.kind||"")),cine:e.stage==="cine"},...i?{_model:i}:{}}}async function H(a,t,i,e){let r=String(i.kind||B(i.type,i.visual_hint)),n=N(r,e.rules||[]),s=t.slides.map(m=>({id:m.id,type:m.type,title:m.title,signature:m.signature||m.visual_hint||""})),l=t.slides.findIndex(m=>m.id===i.id),{direction:o,...h}=t.meta,d=`${Ha(a,e.materialsMax)}

[\uB371 \uBA54\uD0C0] ${JSON.stringify({...h,sections:t.sections})}${L(o,{...i,kind:r})}
[\uB371 \uAC1C\uC694 \u2014 \uB2E4\uB978 \uC7A5\uACFC \uB808\uC774\uC544\uC6C3\xB7\uC2DC\uADF8\uB2C8\uCC98\uAC00 \uACB9\uCE58\uC9C0 \uC54A\uAC8C]
${JSON.stringify(s)}

[\uC774\uBC88\uC5D0 \uC124\uACC4\uD560 \uC7A5: ${l+1}/${t.slides.length}\uC7A5, kind=${r}]
${JSON.stringify(i,null,1)}

\uC704 \uC7A5\uC758 META/HTML/CSS/JS \uB97C \uCD9C\uB825 \uD615\uC2DD\uB300\uB85C \uC791\uC131\uD558\uB77C.`,c=await u(e.provider,{system:n,messages:[{role:"user",content:d}],maxTokens:e.maxTokens||14e3,temperature:e.temperature??.5,json:!1,nudge:"(\uCD9C\uB825\uC774 \uC798\uB838\uB2E4. \uAC19\uC740 \uC124\uACC4\uB97C \uB354 \uAC04\uACB0\uD558\uAC8C \uB2E4\uC2DC \uCD9C\uB825\uD558\uB77C: CSS\uB294 \uAF2D \uD544\uC694\uD55C \uADDC\uCE59\uB9CC, JS\uB294 120\uC904 \uC774\uB0B4, \uB124 \uAD6C\uAC04 \uBAA8\uB450.)"});if(e.log?.(`[rich ${i.id}/${r}] ${c.model} ${c.ms}ms in=${c.usage?.input??"?"} cacheRead=${c.usage?.cacheRead??0} out=${c.usage?.output??"?"} cost=${c.usage?.cost??"?"}${c.truncated?" TRUNCATED":""}`),c.truncated)throw new Error("rich: output truncated");let{parts:v,problems:g}=S(z(c.text));if(g.length&&e.log?.(`[rich ${i.id}] sanitized: ${g.join(",")}`),v.html.length<400)throw new Error("rich: html too short");return pa({...i,kind:r},v,c.model)}var ja=`\uB2F9\uC2E0\uC740 Qpresen \uD504\uB9AC\uBBF8\uC5C4 \uB371\uC758 \uC2AC\uB77C\uC774\uB4DC \uC218\uC815\uC790\uB2E4. \uB9B0\uD2B8\xB7\uAC80\uC218\uC5D0\uC11C \uC9C0\uC801\uB41C \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB3C4\uB85D \uD55C \uC7A5\uC758 HTML/CSS/JS\uB97C \uCD5C\uC18C\uD55C\uC73C\uB85C \uACE0\uCE5C\uB2E4. \uB808\uC774\uC544\uC6C3 \uCEE8\uC149\uACFC \uB0B4\uC6A9\uC740 \uC720\uC9C0\uD55C\uB2E4.
- OVERFLOW_X(\uAC00\uB85C \uB118\uCE68): \uBD80\uBAA8 \uD3ED\uC774 \uC881\uC740 \uAC83\uC774 \uC6D0\uC778\uC774\uBA74(\uBD80\uBAA8 < 300px\uC778\uB370 \uCE74\uB4DC\xB7\uC81C\uBAA9\uC774 \uB4E4\uC5B4\uAC10) \uADF8\uB9AC\uB4DC \uC5F4 \uD3ED\uC744 \uBC14\uAFD4 \uADF8 \uC601\uC5ED\uC744 \uB113\uD78C\uB2E4(\uC5F4 \uAD50\uCCB4\xB72\uC5F4\u21921\uC5F4\xB7\uC0AC\uC774\uB4DC \uD328\uB110 \uCD95\uC18C). \uB9D0\uC904\uC784(text-overflow:ellipsis)\xB7nowrap\uC73C\uB85C \uC798\uB77C \uC228\uAE30\uB294 \uAC83\uC740 \uD574\uACB0\uC774 \uC544\uB2C8\uB2E4 \u2014 \uAE00\uC790\uAC00 \uB2E4 \uBCF4\uC5EC\uC57C \uD55C\uB2E4. \uC9E7\uC740 \uB77C\uBCA8\uC774\uBA74 \uC904\uBC14\uAFC8 \uD5C8\uC6A9(white-space:normal; word-break:keep-all).
- OVERFLOW_Y(\uC138\uB85C \uB118\uCE68)/OUTSIDE_STAGE: \uBC15\uC2A4(1728\xD7~680px)\uB97C \uB118\uCE5C \uAC83 \u2014 \uD56D\uBAA9 \uC218 \uCD95\uC18C, \uAE00\uC790 \uC218 \uCD95\uC18C, \uD589 \uB192\uC774 min-height:0 + flex:1 \uB85C \uBD84\uBC30, padding\xB7gap \uCD95\uC18C, \uAE00\uC790 \uD06C\uAE30 1~2px \uCD95\uC18C \uC21C\uC73C\uB85C.
- SMALL_FONT: 14px \uBBF8\uB9CC \uAE00\uC790\uB97C \uD0A4\uC6B4\uB2E4(\uCEA1\uC158 15px \uC774\uC0C1). LOW_CONTRAST: --muted/--faint \uB300\uC2E0 --text/--ink, \uBA74 \uC704 \uAE00\uC790\uB294 -ink \uD1A0\uD070.
- OVERLAP: \uACB9\uCE58\uB294 \uC694\uC18C\uC758 \uAC04\uACA9\xB7\uADF8\uB9AC\uB4DC \uC815\uC758\uB97C \uACE0\uCE5C\uB2E4. EMPTY/SPARSE: \uB0B4\uC6A9\uC744 \uBCF4\uAC15\uD558\uAC70\uB098 \uC694\uC18C\uB97C \uD0A4\uC6CC \uC5EC\uBC31\uC744 \uCC44\uC6B4\uB2E4. DENSE: \uC5EC\uBC31\xB7\uAC04\uACA9\uC744 \uB298\uB9AC\uACE0 \uB35C \uC911\uC694\uD55C \uC694\uC18C\uB97C \uBE80\uB2E4.
- \uC22B\uC790\uAC00 \uBE44\uC5B4 \uBCF4\uC774\uBA74(\uC815\uC801 \uBAA8\uB4DC) HTML\uC5D0 \uCD5C\uC885\uAC12\uC744 \uC368 \uB123\uB294\uB2E4.
- \uCE74\uB4DC/\uD328\uB110 \uD558\uB2E8\uC774 \uBE44\uC5B4 \uBCF4\uC774\uBA74: \uC21C\uD658(.on)\uC73C\uB85C \uD55C \uCE74\uB4DC\uB9CC \uD3BC\uCE58\uB294 \uAD6C\uC870\uB97C '\uBAA8\uB4E0 \uCE74\uB4DC\uAC00 \uD56D\uC0C1 \uCC44\uC6CC\uC9C4 \uAD6C\uC870'\uB85C \uBC14\uAFB8\uACE0(\uC544\uC774\uCF58 \uC6D0\xB7\uC81C\uBAA9\xB7\uC218\uCE58\xB7\uC124\uBA85\xB7\uD0DC\uADF8 \uC138\uD2B8), \uC21C\uD658\uC740 \uAC15\uC870\uB9CC \uB2F4\uB2F9\uD558\uAC8C \uD55C\uB2E4. \uCE74\uB4DC \uB192\uC774\uC5D0 \uB9DE\uAC8C \uB0B4\uC6A9\uC744 \uBCF4\uAC15\uD55C\uB2E4.
- MOTION_LOW / \uC815\uC801\uC73C\uB85C \uBCF4\uC784: \uB4F1\uC7A5 \uC5F0\uC1C4\uB97C 14\uAC1C \uC774\uC0C1\uC73C\uB85C \uB298\uB9AC\uACE0(data-reveal \uBCC0\uD615\uACFC data-delay \uB9AC\uB4EC), \uC22B\uC790\uC5D0 data-count, \uC0B4\uC544\uC788\uB294 \uC694\uC18C(data-cycle\xB7flowline\xB7pulse\xB7bar\xB7kb) 1\uAC1C\uC640 \uC0C1\uD638\uC791\uC6A9(hover/\uD074\uB9AD/\uD1A0\uAE00/\uC2AC\uB77C\uC774\uB354/\uC790\uB3D9 \uB370\uBAA8) 1\uAC1C\uB97C \uCD94\uAC00\uD55C\uB2E4. \uD544\uC694\uD558\uBA74 gsap \uD0C0\uC784\uB77C\uC778\uC73C\uB85C \uC548\uBB34.
- STYLE_OFF(\uD558\uC6B0\uC2A4 \uC2A4\uD0C0\uC77C \uC774\uD0C8: \uD68C\uC0C9 \uB9AC\uD3EC\uD2B8 \uB8E9\xB7\uC791\uC740 \uB77C\uBCA8 \uB2E4\uBC1C\xB7\uBB34\uAC70\uC6B4 \uC0AC\uC9C4): \uADF8\uB77C\uB370\uC774\uC158 \uC22B\uC790\xB7\uD2F4\uD2B8/\uC720\uB9AC \uCE74\uB4DC\xB7\uC544\uC774\uCF58 \uC6D0\xB7\uCE69\uC73C\uB85C \uBC14\uAFB8\uACE0 \uAE00\uC790\uB97C \uD0A4\uC6B4\uB2E4.
- TEXT_ON_PHOTO(\uD398\uC774\uB4DC\uB418\uC9C0 \uC54A\uC740 \uC0AC\uC9C4 \uC704\uC758 \uAE00\uC790): \uAE00\uACFC \uC0AC\uC9C4\uC740 \uBC18\uB300\uD3B8\uC774\uC5B4\uC57C \uD55C\uB2E4. \uAE30\uBCF8 .backdrop(=.fade-l)\uC740 \uC67C\uCABD\uC774 \uBC14\uD0D5\uC0C9\xB7\uC0AC\uC9C4 \uC624\uB978\uCABD \u2192 \uAE00\uC740 \uC67C\uCABD \uC5F4\uC5D0, .fade-r\uB294 \uC624\uB978\uCABD\uC774 \uBC14\uD0D5\uC0C9\xB7\uC0AC\uC9C4 \uC67C\uCABD \u2192 \uAE00\uC740 \uC624\uB978\uCABD \uC5F4\uC5D0. \uAE00\uC774 \uC67C\uCABD\uC778\uB370 .fade-r\uAC00 \uBD99\uC5B4 \uC788\uC73C\uBA74 .fade-r\uB97C \uBE80\uB2E4. \uC0AC\uC9C4 \uCABD\uC5D0 \uB0A8\uB294 \uAE00\uC740 .card/.glass \uC548\uC5D0 \uB123\uAC70\uB098 \uC0AC\uC9C4 \uBC18\uB300\uD3B8\uC73C\uB85C \uC62E\uAE30\uACE0, \uBE48 \uC0AC\uC9C4 \uCABD\uC740 \uC0AC\uC9C4\uC774 \uCC44\uC6B0\uB294 \uAC83\uC774 \uC815\uC0C1(\uC5B5\uC9C0\uB85C \uCC44\uC6B0\uC9C0 \uC54A\uB294\uB2E4).
- CINE_BG_LIGHT: cine \uBB34\uB300\uC5D0\uC11C var(--ink)\uB294 \uBC1D\uC740 \uAE00\uC790\uC0C9\uC774\uB2E4. .stage.cine \uC758 background \uB36E\uC5B4\uC4F0\uAE30\uB97C \uC9C0\uC6B0\uACE0, \uC5B4\uB450\uC6B4 \uBA74\uC774 \uD544\uC694\uD558\uBA74 var(--bg)\xB7var(--card).
- \uC0AC\uC6A9\uC790 \uCF54\uBA58\uD2B8\uB294 \uADF8 \uC9C0\uC2DC\uB97C \uB530\uB978\uB2E4.
${da}

${ca}
\uC218\uC815\uB41C \uC804\uCCB4(META/HTML/CSS/JS \uB124 \uAD6C\uAC04 \uBAA8\uB450)\uB97C \uCD9C\uB825\uD55C\uB2E4. \uBC14\uB00C\uC9C0 \uC54A\uC740 \uAD6C\uAC04\uB3C4 \uC804\uBD80 \uB2E4\uC2DC \uC4F4\uB2E4.`;function W(a){let t={};return{html:a.replace(/<img\b([^>]*)>/gi,(e,r)=>{let n=(r.match(/data-image="([^"]*)"/)||[])[1],s=(r.match(/\ssrc="(data:[^"]*)"/)||[])[1];return!n||!s?e:(t[n]=s,`<img${r.replace(/\ssrc="data:[^"]*"/,"")}>`)}),srcs:t}}function U(a,t){return a.replace(/<img\b([^>]*)>/gi,(i,e)=>{if(/\ssrc=/.test(e))return i;let r=(e.match(/data-image="([^"]*)"/)||[])[1];return r&&t[r]?`<img${e} src="${t[r]}">`:i})}async function ha(a,t,i,e){let r=a.body,{html:n,srcs:s}=W(String(r.html||"")),l=e?{...e}:{},o=l.direction;delete l.direction;let h=`===META===
${JSON.stringify({title:a.title,sub:a.sub,source:a.source,notes:a.notes,signature:r.signature,head:r.noHead?"none":"engine",stage:r.cine?"cine":"light"})}
===HTML===
${n}
===CSS===
${r.css||""}
===JS===
${r.js||""}`,d=f=>`- ${f.sev||""} ${f.code||""} ${f.el||""}${f.extra!=null?" ("+JSON.stringify(f.extra).slice(0,120)+(/OVERFLOW/.test(f.code||"")?"px \uB118\uCE68":"")+")":""}${f.box?" \uC694\uC18C\uD06C\uAE30="+f.box[0]+"\xD7"+f.box[1]+"px":""}${f.parent?" \uBD80\uBAA8="+f.parent:""}${f.text?' \uD14D\uC2A4\uD2B8="'+String(f.text).slice(0,40)+'"':""} ${f.what||""} ${f.fix?"\u2192 "+f.fix:""}`,c=`[\uB371 \uBA54\uD0C0] ${JSON.stringify(l)}${L(o,{id:a.id,section:a.section,kind:r.kind})}
[\uD604\uC7AC \uC2AC\uB77C\uC774\uB4DC]
${h}

[\uC9C0\uC801 \uC0AC\uD56D]
${t.map(d).join(`
`)}

\uC218\uC815\uB41C \uB124 \uAD6C\uAC04\uC744 \uCD9C\uB825 \uD615\uC2DD\uB300\uB85C \uC791\uC131\uD558\uB77C. (\uC774\uBBF8\uC9C0\uB294 <img data-image="\u2026"> \uD0DC\uADF8\uB97C \uAC19\uC740 \uD504\uB86C\uD504\uD2B8\uB85C \uC720\uC9C0\uD558\uBA74 \uAE30\uC874 \uC0DD\uC131 \uC774\uBBF8\uC9C0\uAC00 \uADF8\uB300\uB85C \uC4F0\uC778\uB2E4)`,v=await u(i.provider,{system:ja,messages:[{role:"user",content:c}],maxTokens:i.maxTokens||14e3,temperature:.3,json:!1,nudge:"(\uCD9C\uB825\uC774 \uC798\uB838\uB2E4. \uB124 \uAD6C\uAC04\uC744 \uB354 \uAC04\uACB0\uD558\uAC8C \uB2E4\uC2DC \uCD9C\uB825\uD558\uB77C.)"});i.log?.(`[rich-fix ${a.id}] ${v.model} ${v.ms}ms${v.truncated?" TRUNCATED":""}`);let{parts:g}=S(z(v.text));if(g.html.length<400)return a;g.html=U(g.html,s);let m=pa({id:a.id,section:a.section,type:"custom",title:a.title,sub:a.sub,t:a.notes?.t,kind:r.kind},g,v.model);g.meta?.title||(m.title=a.title,m.sub=a.sub,m.source=a.source,m.notes=a.notes);let p=m.body;return g.meta?.head||(p.noHead=!!r.noHead),g.meta?.stage||(p.cine=!!r.cine),m}var q=`
[\uD504\uB9AC\uBBF8\uC5C4 \uBAA8\uB4DC \u2014 \uCD94\uAC00 \uC9C0\uC2DC]
\uC774 \uB371\uC740 \uC7A5\uB9C8\uB2E4 \uB9DE\uCDA4 \uC124\uACC4(HTML \uC9C1\uC811 \uC791\uC131)\uB85C \uB9CC\uB4E4\uC5B4\uC9C4\uB2E4. \uAC01 slide \uAC1D\uCCB4\uC5D0 \uB2E4\uC74C \uB450 \uD544\uB4DC\uB97C \uB354\uD55C\uB2E4:
- "kind": "numbers"(\uC22B\uC790\xB7\uD604\uD669) | "chart"(\uCD94\uC138\xB7\uBD84\uD3EC \uCC28\uD2B8) | "compare"(\uBE44\uAD50\xB7\uC804\uD6C4\xB7\uC120\uD0DD\uC9C0) | "process"(\uB2E8\uACC4\xB7\uD750\uB984\xB7\uACF5\uC2DD) | "concept"(\uAD6C\uC870\xB7\uC6D0\uB9AC\xB7\uAC1C\uB150\uB3C4) | "demo"(\uD654\uBA74\xB7\uB300\uD654 \uC2DC\uC5F0) | "story"(\uC0AC\uB840\xB7\uC774\uC57C\uAE30) | "list"(\uC815\uB9AC\xB7\uCCB4\uD06C\uB9AC\uC2A4\uD2B8)
- "signature": \uC774 \uC7A5\uC758 \uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC\xB7\uC778\uD130\uB799\uC158 \uD55C \uC904(\u2264 40\uC790, \uC608: "\uC5F0\uB3C4 \uC2AC\uB77C\uC774\uB354\uB85C \uC6C0\uC9C1\uC774\uB294 \uC131\uC7A5 \uB9C9\uB300\uCC28\uD2B8", "\uC804/\uD6C4 \uD1A0\uAE00 \uBE44\uAD50 \uCE74\uB4DC 3\uC7A5")
cover/section/agenda/closing/quote/image-hero \uB294 kind \uC5C6\uC774 \uADF8\uB300\uB85C \uB454\uB2E4. \uC5F0\uC18D\uB41C \uC7A5\uC774 \uAC19\uC740 kind\xB7\uAC19\uC740 signature \uB97C \uC4F0\uC9C0 \uC54A\uAC8C \uD558\uACE0, \uB371 \uC804\uCCB4\uC5D0\uC11C kind \uAC00 5\uC885 \uC774\uC0C1 \uC11E\uC774\uAC8C \uD55C\uB2E4.
content_hints \uB294 4~6\uAC1C\uAE4C\uC9C0 \uB109\uB109\uD788: \uC790\uB8CC\uAC00 \uC788\uC73C\uBA74 \uC790\uB8CC\uC758 \uC218\uCE58\xB7\uACE0\uC720\uBA85\uC0AC\xB7\uC608\uC2DC\uB97C, \uC790\uB8CC\uAC00 \uC5C6\uC73C\uBA74 \uB110\uB9AC \uC54C\uB824\uC9C4 \uACF5\uAC1C \uC0AC\uC2E4\xB7\uC218\uCE58(\uAE30\uAD00\xB7\uC5F0\uB3C4 \uBA85\uC2DC, \uBD88\uD655\uC2E4\uD558\uBA74 '\uC57D'\xB7'\uCD94\uC815')\uB97C \uBF51\uC544 \uC7A5\uB9C8\uB2E4 \uAD6C\uCCB4\uC801\uC778 \uC7AC\uB8CC\uB97C \uC900\uB2E4. \uC77C\uBC18\uB860\uB9CC \uC788\uB294 \uC7A5\uC740 \uB9CC\uB4E4\uC9C0 \uC54A\uB294\uB2E4.`;async function va(a,t){let i=new Map;for(let e of a.slides){if(!C(e))continue;let r=String(e.kind||B(e.type,e.visual_hint)),n=T(r).map(s=>s.id).join("+");i.has(n)||i.set(n,r)}return await Promise.all([...i.values()].map(async e=>{try{await u(t.provider,{system:N(e,t.rules||[]),messages:[{role:"user",content:"OK"}],maxTokens:5,json:!1})}catch(r){t.log?.(`[warm ${e}] ${r.message}`)}})),i.size}var _a={"kpi-grid":[["items",6]],cards:[["items",8]],timeline:[["items",8]],process:[["steps",8]],"bullets-visual":[["bullets",5]],"annotated-image":[["hotspots",6]],pricing:[["plans",4]],team:[["members",6]],summary:[["takeaways",4]],agenda:[["items",10]],checklist:[["items",8]],comparison:[["columns",3],["rows",7]],table:[["rows",12],["columns",7]],question:[["options",5]],matrix:[["points",8],["quadrants",4]],diagram:[["nodes",8]],"big-number":[["compare",3]],cover:[["tags",6],["agenda",8],["stats",3]],closing:[["keywords",8]],section:[["bullets",4]]};function Va(a,t,i,e,r){Array.isArray(a[t])&&a[t].length>i&&(e.push(`${r}: ${t} ${a[t].length} \u2192 ${i}\uAC1C\uB85C \uCD95\uC57D`),a[t]=a[t].slice(0,i))}var Da=["kicker","tagline","meta","tags","agenda","visual","image","qr","stats","numeral","label","bullets","dark","items","question","hint","options","value","unit","prefix","context","compare","visualSide","callout","columns","style","footer","rows","verdict","orientation","nowIndex","steps","result","chart","insight","callouts","layout","highlightRow","highlightCol","caption","dense","align","aside","xLabel","yLabel","quadrants","points","kind","nodes","edges","center","quote","by","role","overlay","heading","hotspots","side","intro","mock","plans","members","groups","takeaways","cta","nextTitle","contact","keywords","thanks","html","css","js"],ga={title:"cover",titleslide:"cover",kpi:"kpi-grid",stats:"kpi-grid",numbers:"kpi-grid",bignumber:"big-number",big_number:"big-number",bullets:"bullets-visual","bullet-visual":"bullets-visual",list:"bullets-visual",grid:"cards",card:"cards",features:"cards",compare:"comparison",versus:"comparison",roadmap:"timeline",history:"timeline",steps:"process",flow:"process",graph:"chart",data:"chart",tbl:"table",quadrant:"matrix",architecture:"diagram",structure:"diagram",hero:"image-hero",image:"image-hero",photo:"image-hero",annotated:"annotated-image",demo:"mockup",plan:"pricing",people:"team",todo:"checklist",recap:"summary",conclusion:"summary",end:"closing",thanks:"closing",qa:"closing",divider:"section",chapter:"section",toc:"agenda",outline:"agenda"};function Fa(a,t,i){(!a.body||typeof a.body!="object")&&(a.body={}),!a.body.type&&a.type&&(a.body.type=a.type),a.body.type&&ga[String(a.body.type).toLowerCase()]&&(a.body.type=ga[String(a.body.type).toLowerCase()]),a.body.type&&(a.body.type=String(a.body.type).toLowerCase().replace(/_/g,"-"));for(let n of Da)a[n]!==void 0&&a.body[n]===void 0&&!["title","sub","notes","source","section","id","accent","eyebrow","dark","motion"].includes(n)&&(a.body[n]=a[n],delete a[n]);!a.title&&a.body.heading&&a.body.type!=="closing"&&a.body.type!=="image-hero"&&(a.title=a.body.heading),!a.title&&a.heading&&(a.title=a.heading),a.subtitle&&!a.sub&&(a.sub=a.subtitle),a.speakerNotes&&!a.notes&&(a.notes=a.speakerNotes),typeof a.notes=="string"&&(a.notes={s:a.notes}),a.notes&&a.notes.text&&!a.notes.s&&(a.notes.s=a.notes.text),a.notes&&a.notes.seconds&&!a.notes.t&&(a.notes.t=a.notes.seconds);let e=a.body,r=(n,s)=>n.map(l=>typeof l=="string"?{[s]:l}:l).filter(Boolean);if(Array.isArray(e.bullets)&&(e.bullets=r(e.bullets,e.type==="section"?"_":"title").map(n=>n._!==void 0?n._:n)),Array.isArray(e.items)&&((e.type==="cards"||e.type==="agenda")&&(e.items=r(e.items,e.type==="agenda"?"label":"title")),e.type==="kpi-grid"&&(e.items=e.items.map(n=>typeof n=="string"?{value:n,label:""}:n.title&&!n.label?{...n,label:n.title}:n)),e.type==="timeline"&&(e.items=e.items.map(n=>typeof n=="string"?{date:"",title:n}:{...n,date:String(n.date??n.year??n.when??""),title:n.title??n.label??""})),e.type==="checklist"&&(e.items=r(e.items,"text"),Array.isArray(e.aside)&&(e.aside={points:e.aside.map(String)}),e.aside&&typeof e.aside=="object"&&!e.aside.points&&!e.aside.title&&!e.aside.text&&(e.aside=JSON.stringify(e.aside)))),Array.isArray(e.steps)&&(e.steps=r(e.steps,"title")),Array.isArray(e.takeaways)&&(e.takeaways=r(e.takeaways,"title")),Array.isArray(e.options)&&(e.options=e.options.map(n=>typeof n=="string"?n:n.text||n.label||"")),Array.isArray(e.keywords)&&(e.keywords=e.keywords.map(n=>typeof n=="string"?n:n.text||n.label||"")),Array.isArray(e.tags)&&(e.tags=e.tags.map(n=>typeof n=="string"?n:n.text||n.label||"")),e.type==="chart"&&!e.chart&&(e.labels||e.series)&&(e.chart={kind:e.kind||"bar",labels:e.labels,series:e.series,unit:e.unit,title:e.chartTitle}),e.type==="chart"&&e.chart){let n=e.chart;!n.labels&&n.categories&&(n.labels=n.categories),!n.series&&n.data&&(n.series=Array.isArray(n.data)&&typeof n.data[0]=="number"?[{name:n.title||"\uAC12",values:n.data}]:n.data),Array.isArray(n.series)&&(n.series=n.series.map(s=>Array.isArray(s)?{name:"\uAC12",values:s}:s.values?s:{name:s.name||"\uAC12",values:s.data||[]})),n.type&&!n.kind&&(n.kind=n.type)}e.type==="comparison"&&Array.isArray(e.columns)&&(e.columns=e.columns.map(n=>typeof n=="string"?{label:n}:n)),e.type==="table"&&Array.isArray(e.columns)&&(e.columns=e.columns.map(n=>typeof n=="string"?n:n.label||n.title||"")),e.type==="diagram"&&Array.isArray(e.nodes)&&(e.nodes=e.nodes.map((n,s)=>typeof n=="string"?{id:String(s+1),label:n}:n)),e.type==="mockup"&&!e.mock&&e.steps&&(e.mock={app:e.app||"chat",steps:e.steps},delete e.steps),e.type==="quote"&&!e.quote&&e.text&&(e.quote=e.text),e.type==="big-number"&&e.value===void 0&&e.number!==void 0&&(e.value=e.number),e.type==="pricing"&&Array.isArray(e.plans)&&(e.plans=e.plans.map(n=>({...n,features:Array.isArray(n.features)?n.features.map(s=>typeof s=="string"?s:s.text||""):[]})))}function j(a){let t=[],i=JSON.parse(JSON.stringify(a||{}));return i.meta=i.meta||{title:"\uC81C\uBAA9 \uC5C6\uC74C"},i.meta.title||(i.meta.title="\uC81C\uBAA9 \uC5C6\uC74C"),i.sections=Array.isArray(i.sections)?i.sections:[],i.slides=Array.isArray(i.slides)?i.slides.filter(Boolean):[],i.slides.length||(i.slides.push({title:i.meta.title,body:{type:"cover"}}),t.push("\uC2AC\uB77C\uC774\uB4DC\uAC00 \uC5C6\uC5B4 \uD45C\uC9C0 1\uC7A5\uC744 \uC0DD\uC131")),i.slides.forEach((e,r)=>{let n=`slide ${r+1}`;Fa(e,t,n),e.title||(e.title=`\uC2AC\uB77C\uC774\uB4DC ${r+1}`,t.push(`${n}: \uC81C\uBAA9 \uC5C6\uC74C`)),(!e.body||typeof e.body!="object"||!e.body.type)&&(e.body={type:"bullets-visual",bullets:[{title:e.sub||e.title}]},t.push(`${n}: body \uC5C6\uC74C \u2192 bullets-visual`));let s=e.body;if((_a[s.type]||[]).forEach(([l,o])=>Va(s,l,o,t,n)),s.type==="table"){s.columns=(s.columns||[]).map(String),s.rows=(s.rows||[]).map(o=>(Array.isArray(o)?o:[String(o)]).map(h=>String(h??"")));let l=s.columns.length;s.rows.forEach(o=>{for(;o.length<l;)o.push("");o.length>l&&(o.length=l)})}if(s.type==="comparison"){let l=(s.columns||[]).length;s.rows=(s.rows||[]).map(o=>({label:String(o.label??""),cells:(o.cells||[]).map(h=>String(h??""))})),s.rows.forEach(o=>{for(;o.cells.length<l;)o.cells.push("");o.cells.length>l&&(o.cells.length=l)})}if(s.type==="chart"){let l=s.chart||{};l.labels=(l.labels||[]).map(String),l.series=(l.series||[]).filter(o=>o&&Array.isArray(o.values)),l.series.forEach(o=>{for(o.values=o.values.map(h=>Number(h)||0);o.values.length<l.labels.length;)o.values.push(0)}),l.series.length||(l.series=[{name:"\uAC12",values:l.labels.map(()=>0)}],t.push(`${n}: \uCC28\uD2B8 \uC2DC\uB9AC\uC988 \uC5C6\uC74C`)),["bar","hbar","line","area","donut","stacked","pie"].includes(l.kind)||(l.kind="bar"),l.labels.length>12&&(t.push(`${n}: \uCC28\uD2B8 \uB77C\uBCA8 ${l.labels.length}\uAC1C \u2192 12\uAC1C`),l.labels=l.labels.slice(0,12),l.series.forEach(o=>o.values=o.values.slice(0,12))),s.chart=l}if(s.type==="kpi-grid"&&(s.items=(s.items||[]).map(l=>({...l,value:typeof l.value=="string"&&/^-?[\d,]+(\.\d+)?$/.test(l.value.trim())?Number(l.value.replace(/,/g,"")):l.value}))),s.type==="process"&&(!s.steps||s.steps.length<2)&&t.push(`${n}: \uD504\uB85C\uC138\uC2A4 \uB2E8\uACC4\uAC00 2\uAC1C \uBBF8\uB9CC`),s.type==="diagram"){s.nodes=(s.nodes||[]).map((o,h)=>({...o,id:String(o.id??h+1),label:String(o.label??"")}));let l=new Set(s.nodes.map(o=>o.id));s.edges=(s.edges||[]).filter(o=>l.has(String(o.from))&&l.has(String(o.to))).map(o=>({...o,from:String(o.from),to:String(o.to)})),["flow","hub","layers","cycle","funnel"].includes(s.kind)||(s.kind="flow")}if(s.type==="matrix"){for(;(s.quadrants||(s.quadrants=[])).length<4;)s.quadrants.push({title:""});(s.points||[]).forEach(l=>{l.x=Math.max(6,Math.min(94,Number(l.x)||50)),l.y=Math.max(7,Math.min(93,Number(l.y)||50));let o=Number(l.size);l.size=o?o<12?24+o*4:Math.max(18,Math.min(72,o)):28})}s.type==="annotated-image"&&(s.hotspots||[]).forEach(l=>{l.x=Math.max(3,Math.min(97,Number(l.x)||50)),l.y=Math.max(3,Math.min(97,Number(l.y)||50))}),s.type==="mockup"&&(s.mock=s.mock||{app:"chat",steps:[]},["chat","browser","phone","dashboard"].includes(s.mock.app)||(s.mock.app="chat"),s.mock.steps=(s.mock.steps||[]).slice(0,8)),s.type==="custom"&&typeof s.html!="string"&&(s.html='<div class="callout">custom \uC2AC\uB77C\uC774\uB4DC \uB0B4\uC6A9 \uC5C6\uC74C</div>',t.push(`${n}: custom html \uC5C6\uC74C`)),e.notes&&typeof e.notes=="string"&&(e.notes={s:e.notes}),e.notes&&e.notes.t!=null&&(e.notes.t=Math.max(5,Math.min(900,Number(e.notes.t)||0)))}),{spec:i,warnings:t}}function _(a){let i=[`\uC8FC\uC81C/\uC694\uCCAD: ${a.topic}`,a.purpose?`\uBAA9\uC801(purpose): ${a.purpose}`:"",a.audience?`\uCCAD\uC911: ${a.audience}`:"",a.durationMin?`\uBC1C\uD45C \uC2DC\uAC04: ${a.durationMin}\uBD84`:"",a.slideCount?`\uC694\uCCAD \uC7A5\uC218: ${a.slideCount}\uC7A5 (\uBC18\uB4DC\uC2DC \uC774 \uC7A5\uC218)`:"",a.tone?`\uD1A4: ${a.tone}`:"",a.theme?`\uD14C\uB9C8: ${a.theme}`:"",a.lang?`\uC5B8\uC5B4: ${a.lang}`:"\uC5B8\uC5B4: ko",a.presenter?`\uBC1C\uD45C\uC790: ${a.presenter.name}${a.presenter.org?" ("+a.presenter.org+")":""}`:"",a.event?`\uD589\uC0AC: ${a.event}`:"",a.date?`\uC77C\uC790: ${a.date}`:"",a.place?`\uC7A5\uC18C: ${a.place}`:"",a.extra?`\uCD94\uAC00 \uC9C0\uC2DC: ${a.extra}`:""].filter(Boolean).join(`
`);return a.materials&&(i+=`

[\uCC38\uACE0 \uC790\uB8CC \u2014 \uC0AC\uC2E4\xB7\uC218\uCE58\uB294 \uC5EC\uAE30\uC11C\uB9CC \uAC00\uC838\uC62C \uAC83]
${a.materials.slice(0,6e4)}`),i}async function K(a,t){t.onProgress?.({stage:"plan",msg:"\uB371 \uAD6C\uC870 \uC124\uACC4 \uC911"});let i=R+(t.premium?q:"")+k(t.rules||[],"plan"),e=await u(t.provider,{system:i,messages:[{role:"user",content:_(a)+`

\uC704 \uBE0C\uB9AC\uD504\uB85C \uB371 \uD50C\uB79C JSON\uC744 \uC791\uC131\uD558\uB77C.`}],maxTokens:12e3,temperature:.5});t.log?.(`[plan] ${e.model} ${e.ms}ms`);let r=b(e.text);if(!r.slides?.length)throw new Error("plan has no slides");return r.slides.forEach((n,s)=>{n.id||(n.id="p"+String(s+1).padStart(2,"0"))}),r.sections=r.sections||[],a.theme&&(r.meta.theme=a.theme),a.brand&&(r.meta.brand=a.brand),a.presenter&&!r.meta.presenter&&(r.meta.presenter=a.presenter),a.slideCount&&r.slides.length!==a.slideCount&&t.log?.(`[plan] requested ${a.slideCount} got ${r.slides.length}`),r}var Ja=`
[\uB300\uD615 \uB371 \u2014 1\uB2E8\uACC4: \uAC1C\uC694\uB9CC]
\uC774 \uB371\uC740 \uC7A5\uC218\uAC00 \uB9CE\uC544 \uB450 \uB2E8\uACC4\uB85C \uC124\uACC4\uD55C\uB2E4. \uC9C0\uAE08\uC740 meta, sections, \uADF8\uB9AC\uACE0 slides \uC758 \uAC01 \uD56D\uBAA9\uC5D0 id \xB7 section \xB7 type \xB7 title \xB7 intent (\uD504\uB9AC\uBBF8\uC5C4\uC774\uBA74 kind \xB7 signature \uAE4C\uC9C0) \uB9CC \uC4F4\uB2E4. sub \xB7 content_hints \xB7 visual_hint \uB294 \uC4F0\uC9C0 \uC54A\uB294\uB2E4(2\uB2E8\uACC4\uC5D0\uC11C \uCC44\uC6B4\uB2E4). \uC81C\uBAA9\uC740 \uACB0\uB860\uD615(**\uAC15\uC870**)\uC73C\uB85C \uC644\uC131\uD574\uC11C \uC4F4\uB2E4.`,Ya=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uB371 \uD50C\uB798\uB108"\uB2E4. \uC774\uBBF8 \uD655\uC815\uB41C \uB371 \uAC1C\uC694(\uC139\uC158\xB7\uC7A5 \uC81C\uBAA9\xB7\uC720\uD615)\uC758 \uC77C\uBD80 \uC7A5\uC5D0 \uB300\uD574 \uC0C1\uC138 \uACC4\uD68D\uB9CC \uCC44\uC6B4\uB2E4. \uB514\uC790\uC778\uC740 \uD558\uC9C0 \uC54A\uB294\uB2E4.
\uAC01 \uC7A5\uC5D0 \uB300\uD574: "sub"(\uADFC\uAC70 \uD55C \uBB38\uC7A5), "content_hints"(\uC774 \uC7A5\uC5D0 \uB123\uC744 \uC0AC\uC2E4\xB7\uC218\uCE58\xB7\uC608\uC2DC 4~6\uAC1C, \uAC01 \u2264 40\uC790 \u2014 \uC790\uB8CC\uAC00 \uC788\uC73C\uBA74 \uC790\uB8CC\uC758 \uC218\uCE58\xB7\uACE0\uC720\uBA85\uC0AC\xB7\uC608\uC2DC\uB97C, \uC5C6\uC73C\uBA74 \uB110\uB9AC \uC54C\uB824\uC9C4 \uACF5\uAC1C \uC0AC\uC2E4\xB7\uC218\uCE58(\uAE30\uAD00\xB7\uC5F0\uB3C4 \uBA85\uC2DC, \uBD88\uD655\uC2E4\uD558\uBA74 '\uC57D'\xB7'\uCD94\uC815')), "visual_hint"(\uCC28\uD2B8/\uB2E4\uC774\uC5B4\uADF8\uB7A8/\uC774\uBBF8\uC9C0 \uC7A5\uBA74 \u2264 30\uC790). \uD504\uB9AC\uBBF8\uC5C4 \uB371\uC774\uBA74 "signature"(\uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC\xB7\uC778\uD130\uB799\uC158 \uD55C \uC904 \u2264 40\uC790, \uC55E\uB4A4 \uC7A5\uACFC \uACB9\uCE58\uC9C0 \uC54A\uAC8C)\uB3C4 \uCC44\uC6B4\uB2E4. id \xB7 title \xB7 type \xB7 kind \uB294 \uBC14\uAFB8\uC9C0 \uC54A\uB294\uB2E4.
\uCD9C\uB825 JSON: { "slides": [ { "id", "sub", "content_hints": [], "visual_hint", "signature"? } ] } \u2014 \uC694\uCCAD\uBC1B\uC740 \uC7A5\uB9CC, \uC694\uCCAD \uC21C\uC11C\uB300\uB85C. JSON\uB9CC \uCD9C\uB825.`;async function ma(a,t){t.onProgress?.({stage:"plan",msg:"\uB371 \uAC1C\uC694 \uC124\uACC4 \uC911"});let i=R+(t.premium?q:"")+Ja+k(t.rules||[],"plan"),e=await u(t.provider,{system:i,messages:[{role:"user",content:_(a)+`

\uC704 \uBE0C\uB9AC\uD504\uB85C \uB371 \uD50C\uB79C JSON(1\uB2E8\uACC4: \uAC1C\uC694)\uC744 \uC791\uC131\uD558\uB77C.`}],maxTokens:9e3,temperature:.5});t.log?.(`[plan:outline] ${e.model} ${e.ms}ms`);let r=b(e.text);if(!r.slides?.length)throw new Error("plan has no slides");return r.slides.forEach((n,s)=>{n.id||(n.id="p"+String(s+1).padStart(2,"0"))}),r.sections=r.sections||[],a.theme&&(r.meta.theme=a.theme),a.brand&&(r.meta.brand=a.brand),a.presenter&&!r.meta.presenter&&(r.meta.presenter=a.presenter),r.outlineOnly=!0,r}async function xa(a,t,i,e){let r=t.slides.filter(d=>i.includes(d.id));if(!r.length)return[];let n=t.slides.map(d=>({id:d.id,section:d.section,type:d.type,kind:d.kind,title:d.title})),s=`${_(a)}

[\uB371 \uAC1C\uC694]
${JSON.stringify({meta:t.meta,sections:t.sections,outline:n})}

[\uC774\uBC88\uC5D0 \uC0C1\uC138\uB97C \uCC44\uC6B8 \uC7A5]
${JSON.stringify(r.map(d=>({id:d.id,section:d.section,type:d.type,kind:d.kind,title:d.title,intent:d.intent})))}${e.premium?`
(\uD504\uB9AC\uBBF8\uC5C4 \uB371: signature \uD3EC\uD568)`:""}`,l=await u(e.provider,{system:Ya+k(e.rules||[],"plan"),messages:[{role:"user",content:s}],maxTokens:Math.min(9e3,700*r.length+800),temperature:.5});e.log?.(`[plan:detail ${i.join(",")}] ${l.model} ${l.ms}ms`);let h=(b(l.text).slides||[]).filter(Boolean);return r.map(d=>{let c=h.find(g=>g.id===d.id)||{},v={...d};return c.sub&&(v.sub=String(c.sub)),Array.isArray(c.content_hints)&&(v.content_hints=c.content_hints.map(String).slice(0,6)),c.visual_hint&&(v.visual_hint=String(c.visual_hint)),c.signature&&(v.signature=String(c.signature)),v})}async function aa(a,t,i,e){let r=F+k(e.rules||[],"fill"),n=JSON.stringify({meta:t.meta,sections:t.sections,outline:t.slides.map(c=>({id:c.id,section:c.section,type:c.type,title:c.title}))}),s=t.slides.filter(c=>i.includes(c.id)),l=`${_(a)}

[\uB371 \uD50C\uB79C \uC694\uC57D]
${n}

[\uC774\uBC88\uC5D0 \uC791\uC131\uD560 \uC7A5 \u2014 \uAC01 \uC7A5\uC758 \uC644\uC804\uD55C \uC2A4\uD399\uC744 \uC368\uB77C]
${JSON.stringify(s,null,1)}`,o=await u(e.provider,{system:r,messages:[{role:"user",content:l}],maxTokens:Math.min(16e3,2600*s.length+1500),temperature:.4});e.log?.(`[fill ${i.join(",")}] ${o.model} ${o.ms}ms`);let d=(b(o.text).slides||[]).filter(Boolean);return i.map(c=>{let v=d.find(m=>m.id===c);if(v)return v;let g=s.find(m=>m.id===c);return e.log?.(`[fill] missing ${c}, using fallback`),{id:c,section:g.section||void 0,title:g.title,sub:g.sub,notes:{t:g.t||40,s:g.intent||""},body:{type:"bullets-visual",bullets:(g.content_hints||[g.intent||g.title]).slice(0,5).map(m=>({title:m.slice(0,40)}))}}})}async function fa(a,t,i){let e=i||await K(a,t),r=t.batchSize||3,n=t.concurrency||4,s={},l=e.slides.map(x=>x.id);if(t.premium){let x=e.slides.filter(C).map(y=>y.id);l=l.filter(y=>!x.includes(y));let A=0,M=0,w=t.richConcurrency||4;t.onProgress?.({stage:"rich",done:0,total:x.length});let $=async()=>{for(;M<x.length;){let y=x[M++],ka=e.slides.find(V=>V.id===y);try{s[y]=await H(a,e,ka,{...t,provider:t.richProvider||t.provider})}catch(V){t.log?.(`[rich] ${y} failed: ${V.message} \u2192 standard fill`),l.push(y)}A++,t.onProgress?.({stage:"rich",done:A,total:x.length})}};await Promise.all(Array.from({length:Math.min(w,x.length)},$)),l=e.slides.map(y=>y.id).filter(y=>l.includes(y))}let o=[];for(let x=0;x<l.length;x+=r)o.push(l.slice(x,x+r));let h=0;t.onProgress?.({stage:"fill",done:0,total:l.length});let d=0,c=async()=>{for(;d<o.length;){let x=o[d++];try{(await aa(a,e,x,t)).forEach(M=>s[M.id]=M)}catch(A){t.log?.(`[fill] batch ${x.join(",")} failed: ${A.message}`),x.forEach(M=>{let w=e.slides.find($=>$.id===M);s[M]={id:M,section:w.section||void 0,title:w.title,sub:w.sub,notes:{t:w.t||40,s:w.intent||""},body:{type:"bullets-visual",bullets:(w.content_hints||[w.title]).slice(0,5).map($=>({title:$.slice(0,40)}))}}})}h+=x.length,t.onProgress?.({stage:"fill",done:h,total:l.length})}};await Promise.all(Array.from({length:Math.min(n,o.length)},c));let v=e.slides.map(x=>s[x.id]).filter(Boolean),g=new Set((e.sections||[]).map(x=>x.id));v.forEach(x=>{x.section&&!g.has(x.section)&&(x.section=void 0)});let m={meta:e.meta,sections:e.sections,slides:v},{spec:p,warnings:f}=j(m);return{spec:p,plan:e,warnings:f}}async function ua(a,t,i,e){let r=`[\uB371 \uBA54\uD0C0] ${JSON.stringify(e||{})}
[\uD604\uC7AC \uC2AC\uB77C\uC774\uB4DC \uC2A4\uD399]
${JSON.stringify(a,null,1)}

[\uC9C0\uC801 \uC0AC\uD56D]
${t.map(l=>`- ${l.sev||""} ${l.code||""} ${l.el||""} ${l.extra!=null?"("+l.extra+")":""} ${l.what||""} ${l.fix?"\u2192 "+l.fix:""}`).join(`
`)}

\uC218\uC815\uB41C \uC2AC\uB77C\uC774\uB4DC JSON\uB9CC \uCD9C\uB825.`,n=await u(i.provider,{system:J,messages:[{role:"user",content:r}],maxTokens:6e3,temperature:.3});i.log?.(`[fix ${a.id}] ${n.model} ${n.ms}ms`);let s=b(n.text);return!s||!s.body?a:(s.id=a.id,s)}async function ya(a,t,i,e){let r=a.match(/^data:(image\/[a-z]+);base64,(.*)$/s),n=r?r[1]:e?.mime||"image/jpeg",s=r?r[2]:a,l=t.body,o=e?.motion,h=o?`\uB4F1\uC7A5 \uC694\uC18C ${o.reveals}\uAC1C \xB7 \uCE74\uC6B4\uD2B8\uC5C5 ${o.counters}/${o.numbers}(\uC22B\uC790 \uC218) \xB7 \uC0B4\uC544\uC788\uB294 \uC694\uC18C ${(o.living||[]).join("+")||"\uC5C6\uC74C"} \xB7 \uC0C1\uD638\uC791\uC6A9 ${(o.interactive||[]).join("+")||"\uC5C6\uC74C"} \xB7 \uC7A5 \uC804\uC6A9 \uC2A4\uD06C\uB9BD\uD2B8 ${o.scripts>0?"\uC788\uC74C":"\uC5C6\uC74C"}`:"(\uC815\uBCF4 \uC5C6\uC74C)",d=l.cine||e?.cine?"\uC2DC\uB124\uB9C8\uD2F1 \uB2E4\uD06C \uBB34\uB300(cine) \u2014 \uC544\uD2B8 \uB514\uB809\uC158\uC774 \uC758\uB3C4\uD55C \uC5B4\uB450\uC6B4 \uC139\uC158\uC774\uBBC0\uB85C \uB2E4\uD06C \uBB34\uB300 \uAE30\uC900(\uC720\uB9AC \uCE74\uB4DC\xB7\uD770 \uAE00\uC790\xB7\uB124\uC628 \uD3EC\uC778\uD2B8, 800\uC870 \uB371\uCC98\uB7FC)\uC73C\uB85C \uD3C9\uAC00\uD558\uACE0, \uC5B4\uB461\uB2E4\uB294 \uC774\uC720\uB85C \uAC10\uC810\uD558\uC9C0 \uB9D0 \uAC83":"\uBC1D\uC740 \uBB34\uB300(light)",c=`\uC2AC\uB77C\uC774\uB4DC ${t.id} (${l.type}${l.kind?"/"+l.kind:""}) "${t.title}"${l.signature?" \u2014 \uC2DC\uADF8\uB2C8\uCC98: "+l.signature:""}${e?.direction?`
[\uC544\uD2B8 \uB514\uB809\uC158] `+e.direction:""}
[\uBB34\uB300] ${d}
[\uBAA8\uC158 \uC778\uBCA4\uD1A0\uB9AC] ${h}${e?.lint?.length?`
[\uC790\uB3D9 \uB9B0\uD2B8\uAC00 \uCC3E\uC740 \uBB38\uC81C] `+JSON.stringify(e.lint).slice(0,1200):""}
\uC774 \uC2A4\uD06C\uB9B0\uC0F7(\uC815\uC801 \uBAA8\uB4DC: \uC560\uB2C8\uBA54\uC774\uC158 \uC644\uB8CC \uC0C1\uD0DC)\uC744 \uD3C9\uAC00\uD558\uB77C.`,v=await u(i.provider,{system:Y,messages:[{role:"user",content:[{type:"text",text:c},{type:"image",mime:n,base64:s}]}],maxTokens:2500,temperature:.2});return i.log?.(`[review ${t.id}] ${v.model} ${v.ms}ms cost=${v.usage?.cost??"?"}`),b(v.text)}async function ba(a,t,i){let e=`[\uAE30\uC874 \uADDC\uCE59]
${t.map(s=>`- (${s.scope}) ${s.text}`).join(`
`)||"(\uC5C6\uC74C)"}

[\uB204\uC801 \uD53C\uB4DC\uBC31]
${JSON.stringify(a).slice(0,6e4)}

\uC0C8 \uADDC\uCE59 JSON\uB9CC \uCD9C\uB825.`,r=await u(i.provider,{system:G,messages:[{role:"user",content:e}],maxTokens:3e3,temperature:.2});return(b(r.text).rules||[]).filter(s=>s&&s.text)}function Ga(a){let t=a.body;if(t.type!=="custom"||typeof t.html!="string")return[];let i=[],e=/<img\b([^>]*?)>/gi,r,n=0;for(;(r=e.exec(t.html))&&n<2;){let s=r[1];if(!/data-image=/.test(s)||/\ssrc=/.test(s))continue;let l=(s.match(/data-image="([^"]*)"/)||[])[1]||"";if(!l.trim())continue;let o=(s.match(/data-ratio="([^"]*)"/)||[])[1]||"",h=t.html.slice(0,r.index),d=/class="[^"]*\bbackdrop\b[^"]*"[^>]*>\s*$/.test(h.slice(-400))||/\bbackdrop\b/.test(s),c=o==="1:1"?"1024x1024":o==="3:4"?"1024x1536":o==="16:9"||o==="4:3"||d?"1536x1024":"1024x1024",v=r[0],g={prompt:l,alt:(s.match(/alt="([^"]*)"/)||[])[1]||""};i.push({slide:a,ref:g,role:d?"hero":"visual",size:c,priority:d?2:5,apply:m=>{t.html=t.html.replace(v,v.replace(/<img\b/,`<img src="${m}"`))}}),n++}return i}function ea(a){let t=[];for(let i of a.slides){let e=i.body,r=(n,s,l,o)=>{!n||n.src||!(n.prompt||n.alt)||t.push({slide:i,ref:n,role:s,size:l,priority:o})};switch(e.type){case"cover":(e.visual==="photo"||e.visual==="art"||!e.visual)&&!e.image&&(e.image={prompt:`${a.meta.title||""} \u2014 \uC8FC\uC81C\uB97C \uC0C1\uC9D5\uD558\uB294 \uC7A5\uBA74`,alt:a.meta.title||""}),e.image&&r(e.image,e.visual==="photo"?"cover":"visual",e.visual==="photo"?"1536x1024":"1024x1024",0);break;case"image-hero":r(e.image,"hero","1536x1024",1);break;case"annotated-image":r(e.image,"annot","1536x1024",2);break;case"section":r(e.image,"section","1024x1024",3);break;case"quote":r(e.image,"quote","1024x1024",4);break;case"bullets-visual":e.visual?.kind==="image"&&r(e.visual.image,"visual","1024x1024",5);break;case"question":r(e.image,"visual","1536x1024",6);break;case"custom":t.push(...Ga(i));break}}return t.sort((i,e)=>i.priority-e.priority)}var Xa="\uC0AC\uC9C4\uCC98\uB7FC \uC0AC\uC2E4\uC801\uC778 \uACE0\uD574\uC0C1\uB3C4 \uC774\uBBF8\uC9C0, \uC2DC\uB124\uB9C8\uD2F1 \uC790\uC5F0\uAD11, \uAE4A\uC774\uAC10 \uC788\uB294 \uAD6C\uB3C4, \uCC28\uBD84\uD55C \uC0C9\uAC10. \uAE00\uC790\xB7\uC22B\uC790\xB7\uB85C\uACE0\xB7\uC6CC\uD130\uB9C8\uD06C\xB7\uB9D0\uD48D\uC120 \uC5C6\uC74C. \uC0AC\uB78C \uC5BC\uAD74\uC740 \uD074\uB85C\uC988\uC5C5\uD558\uC9C0 \uC54A\uC74C.",Za={cover:"\uBC1C\uD45C \uD45C\uC9C0 \uBC30\uACBD\uC6A9. \uC67C\uCABD \uC544\uB798\uC5D0 \uAE00\uC790\uAC00 \uB193\uC774\uBBC0\uB85C \uC67C\uCABD\uC740 \uB2E8\uC21C\uD558\uACE0 \uC5B4\uB461\uAC8C, \uC2DC\uAC01\uC801 \uCD08\uC810\uC740 \uC624\uB978\uCABD.",hero:"\uD654\uBA74 \uC804\uCCB4\uB97C \uCC44\uC6B0\uB294 \uBC30\uACBD \uC0AC\uC9C4. \uC544\uB798\uCABD\uC5D0 \uAE00\uC790\uAC00 \uB193\uC774\uBBC0\uB85C \uC544\uB798 1/3\uC740 \uB2E8\uC21C\uD558\uAC8C.",annot:"\uC124\uBA85 \uD56B\uC2A4\uD31F\uC744 \uC62C\uB9B4 \uC7A5\uBA74 \uC0AC\uC9C4. \uC8FC\uC694 \uB300\uC0C1\uC774 \uC911\uC559\uC5D0 \uD06C\uAC8C, \uBC30\uACBD\uC740 \uB2E8\uC21C\uD558\uAC8C.",section:"\uC139\uC158 \uAC04\uC9C0 \uBCF4\uC870 \uC774\uBBF8\uC9C0. \uC0C1\uC9D5\uC801\uC774\uACE0 \uC5EC\uBC31\uC774 \uC788\uB294 \uAD6C\uB3C4.",quote:"\uC778\uC6A9 \uC7A5 \uBCF4\uC870 \uC774\uBBF8\uC9C0. \uBD84\uC704\uAE30 \uC911\uC2EC, \uC8FC\uC81C\uAC00 \uC740\uADFC\uD788 \uB4DC\uB7EC\uB098\uB294 \uC7A5\uBA74.",visual:"\uBCF8\uBB38 \uC606 \uBCF4\uC870 \uC774\uBBF8\uC9C0. \uC8FC\uC81C\uB97C \uC9C1\uAD00\uC801\uC73C\uB85C \uBCF4\uC5EC\uC8FC\uB294 \uC7A5\uBA74, \uC911\uC559 \uAD6C\uB3C4."};function ta(a,t){let i=(a.ref.prompt||a.ref.alt||"").trim(),e=t.meta.title?`\uBC1C\uD45C \uC8FC\uC81C: ${t.meta.title}.`:"";return`${i}. ${Za[a.role]} ${e} ${Xa}`.replace(/\s+/g," ").trim()}async function Qa(a,t,i,e){let r=(a.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/images/generations",n={model:e.model||"openai/gpt-image-2",prompt:t,size:i,quality:e.quality||"low",output_format:"webp",output_compression:60,n:1},s=new AbortController,l=setTimeout(()=>s.abort(),e.timeoutMs||9e4);try{let o=await fetch(r,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${a.apiKey}`},body:JSON.stringify(n),signal:s.signal});if(!o.ok)throw new Error(`images ${o.status}: ${(await o.text()).slice(0,200)}`);let h=await o.json(),d=h.data?.[0];if(d?.b64_json)return`data:image/${h.output_format||"webp"};base64,${d.b64_json}`;if(d?.url)return d.url;throw new Error("images: empty result")}finally{clearTimeout(l)}}async function Ma(a,t,i={}){let e=ea(a).slice(0,i.max??4),r=[],n=0;return i.onProgress?.({done:0,total:e.length}),await Promise.all(e.map(async s=>{let l=ta(s,a),o=Date.now();try{s.ref.src=await Qa(t,l,s.size,i),s.apply&&s.apply(s.ref.src),i.log?.(`[image ${s.slide.id}/${s.role}] ${Date.now()-o}ms ${(s.ref.src.length/1024).toFixed(0)}KB`)}catch(h){r.push(`${s.slide.id}: ${String(h?.message||h).slice(0,120)}`),i.log?.(`[image ${s.slide.id}] failed: ${h?.message}`)}n++,i.onProgress?.({done:n,total:e.length,slide:s.slide.id})})),{generated:e.length-r.length,failed:r}}var Wa=`\uB2F9\uC2E0\uC740 \uBC1C\uD45C \uC790\uB8CC\uB97C \uC704\uD55C \uB9AC\uC11C\uCE58 \uC5D0\uB514\uD130\uB2E4. \uBE0C\uB9AC\uD504(\uC8FC\uC81C\xB7\uCCAD\uC911\xB7\uBAA9\uC801)\uB97C \uC77D\uACE0, \uC7A5\uC744 \uC124\uACC4\uD558\uB294 \uC0AC\uB78C\uB4E4\uC774 \uBC14\uB85C \uC4F8 \uC218 \uC788\uB294 '\uC790\uB8CC\uC9D1'\uC744 \uD55C\uAD6D\uC5B4\uB85C \uC4F4\uB2E4.
\uAD6C\uC131(\uCD1D 3,000~5,000\uC790, \uB9C8\uD06C\uB2E4\uC6B4 \uC18C\uC81C\uBAA9):
1) \uD575\uC2EC \uBA54\uC2DC\uC9C0 3\uAC1C(\uD55C \uC904\uC529) 2) \uC0AC\uC2E4\xB7\uC218\uCE58 12~20\uAC1C \u2014 \uAC01 \uD56D\uBAA9: \uC218\uCE58, \uB2E8\uC704, \uAE30\uC900\uC5F0\uB3C4, \uCD9C\uCC98 \uAE30\uAD00(\uACF5\uAC1C\uB41C \uC0AC\uC2E4\uB9CC, \uBD88\uD655\uC2E4\uD558\uBA74 '\uC57D' \uB610\uB294 '(\uCD94\uC815)'), \uD55C \uC904 \uC758\uBBF8 3) \uACE0\uC720\uBA85\uC0AC\xB7\uC0AC\uB840 8~12\uAC1C(\uAE30\uAD00\xB7\uAE30\uC5C5\xB7\uC81C\uD488\xB7\uC815\uCC45\xB7\uC0AC\uC5C5\uBA85 + \uD55C \uC904 \uC124\uBA85) 4) \uBE44\uAD50\xB7\uB300\uC870 \uD3EC\uC778\uD2B8 3~5\uAC1C(\uC804/\uD6C4, \uAD6D\uB0B4/\uD574\uC678, \uC120\uD0DD\uC9C0) 5) \uC804\uBB38 \uC6A9\uC5B4 6~10\uAC1C(\uC9E7\uC740 \uD480\uC774) 6) \uCCAD\uC911\uC774 \uBB3C\uC744 \uBC95\uD55C \uC9C8\uBB38 3\uAC1C\uC640 \uB2F5.
\uADDC\uCE59: \uC9C0\uC5B4\uB0B4\uC9C0 \uC54A\uB294\uB2E4 \u2014 \uBAA8\uB974\uB294 \uC218\uCE58\uB294 \uBC94\uC704\uB098 \uC815\uC131 \uD45C\uD604. \uB110\uB9AC \uC54C\uB824\uC9C4 \uACF5\uAC1C \uD1B5\uACC4\xB7\uACF5\uC2DC\xB7\uBCF4\uB3C4 \uC218\uC900\uC758 \uC0AC\uC2E4\uB9CC. \uCD9C\uCC98\uB294 \uAE30\uAD00\uBA85+\uC5F0\uB3C4. \uBB38\uC7A5\uC740 \uC9E7\uAC8C. \uB9C8\uD06C\uB2E4\uC6B4\uB9CC \uCD9C\uB825.`;async function wa(a,t){let i=`\uC8FC\uC81C/\uC694\uCCAD: ${a.topic}
\uBAA9\uC801: ${a.purpose||""} / \uCCAD\uC911: ${a.audience||""} / \uBC1C\uD45C \uC2DC\uAC04: ${a.durationMin||""}\uBD84
${a.extra?"\uCD94\uAC00 \uC9C0\uC2DC: "+a.extra+`
`:""}${a.materials?`[\uC774\uBBF8 \uC788\uB294 \uC790\uB8CC \u2014 \uBCF4\uC644\uB9CC]
`+a.materials.slice(0,4e3)+`
`:""}
\uC704 \uBE0C\uB9AC\uD504\uC758 \uC790\uB8CC\uC9D1\uC744 \uC791\uC131\uD558\uB77C.`,e=await u(t.provider,{system:Wa,messages:[{role:"user",content:i}],maxTokens:4500,temperature:.3,json:!1});return t.log?.(`[dossier] ${e.model} ${e.ms}ms out=${e.usage?.output??"?"} cost=${e.usage?.cost??"?"}`),e.text.trim()}return Ta(Ua);})();
