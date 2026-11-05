"use strict";var QE=(()=>{var V=Object.defineProperty;var ga=Object.getOwnPropertyDescriptor;var ma=Object.getOwnPropertyNames;var xa=Object.prototype.hasOwnProperty;var K=(t,e)=>{for(var n in e)V(t,n,{get:e[n],enumerable:!0})},va=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of ma(e))!xa.call(t,l)&&l!==n&&V(t,l,{get:()=>e[l],enumerable:!(a=ga(e,l))||a.enumerable});return t};var ua=t=>va(V({},"__esModule",{value:!0}),t);var Ra={};K(Ra,{EXEMPLARS:()=>D,PLAN_PREMIUM_ADDON:()=>H,buildImagePrompt:()=>G,buildSpec:()=>la,chat:()=>u,distillRules:()=>ca,exemplarsFor:()=>T,extractJson:()=>b,fillSlideRich:()=>O,fillSlides:()=>X,fixSlide:()=>oa,fixSlideRich:()=>na,generateImages:()=>pa,imageTargets:()=>W,isRichTarget:()=>E,kindForType:()=>Y,listModels:()=>Q,parseRich:()=>C,planDeck:()=>F,prompts:()=>J,reviewSlide:()=>da,richSystem:()=>Z,sanitizeRich:()=>P,validateSpec:()=>R});function ya(t){let e=t.toLowerCase();if(!/anthropic|claude/.test(e))return[];let n={type:"between_tools"},a={type:"disabled"};return/haiku|opus|claude-4|-4\.|4-5|4\.5|sonnet-4/.test(e)?[a,n]:[n,a]}var fa=t=>new Promise(e=>setTimeout(e,t));async function u(t,e){let n=[t.model,...t.fallbackModels||[]],a=null;for(let l of n)for(let i=0;i<=(t.maxRetries??2);i++){let s=Date.now();try{let r=t.kind==="anthropic"?await Ma(t,l,e):await ka(t,l,e),o=r.finish==="length"||r.finish==="max_tokens";if(o&&e.json!==!1&&i===0&&(e.maxTokens||8e3)<32e3){e={...e,maxTokens:Math.min(32e3,(e.maxTokens||8e3)*2),messages:[...e.messages,{role:"user",content:"(\uCD9C\uB825\uC774 \uC798\uB838\uB2E4. \uAC19\uC740 \uB0B4\uC6A9\uC744 \uB4E4\uC5EC\uC4F0\uAE30 \uC5C6\uB294 compact JSON\uC73C\uB85C, \uC124\uBA85 \uBB38\uC7A5\uC740 \uB354 \uC9E7\uAC8C \uB2E4\uC2DC \uCD9C\uB825\uD558\uB77C.)"}]},a=new Error("truncated");continue}return{text:r.text,model:l,ms:Date.now()-s,finish:r.finish,usage:r.usage,truncated:o}}catch(r){a=r;let o=String(r?.message||r);if(!/429|5\d\d|timeout|abort|ECONN|overloaded/i.test(o))break;await fa(800*(i+1))}}throw a||new Error("LLM call failed")}function ba(t){return typeof t=="string"?t:t.map(e=>e.type==="text"?{type:"text",text:e.text}:{type:"image",source:{type:"base64",media_type:e.mime,data:e.base64}})}function wa(t){return typeof t=="string"?t:t.map(e=>e.type==="text"?{type:"text",text:e.text}:{type:"image_url",image_url:{url:`data:${e.mime};base64,${e.base64}`}})}async function U(t,e,n){let a=new AbortController,l=setTimeout(()=>a.abort(),n);try{return await fetch(t,{...e,signal:a.signal})}finally{clearTimeout(l)}}async function Ma(t,e,n){let a=(t.baseUrl||"https://api.anthropic.com").replace(/\/$/,"")+"/v1/messages",l={model:e,max_tokens:n.maxTokens||8e3,messages:n.messages.filter(o=>o.role!=="system").map(o=>({role:o.role,content:ba(o.content)}))},i=[n.system,...n.messages.filter(o=>o.role==="system").map(o=>typeof o.content=="string"?o.content:"")].filter(Boolean).join(`

`);i&&(l.system=i),n.temperature!=null&&(l.temperature=n.temperature);let s=await U(a,{method:"POST",headers:{"content-type":"application/json","x-api-key":t.apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify(l)},t.timeoutMs||18e4);if(!s.ok)throw new Error(`anthropic ${s.status}: ${(await s.text()).slice(0,300)}`);let r=await s.json();return{text:(r.content||[]).filter(o=>o.type==="text").map(o=>o.text).join(""),finish:r.stop_reason,usage:{input:r.usage?.input_tokens,output:r.usage?.output_tokens}}}async function ka(t,e,n){let a=(t.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/chat/completions",l=[];n.system&&l.push({role:"system",content:n.system});for(let m of n.messages)l.push({role:m.role,content:wa(m.content)});let i={model:e,messages:l,max_tokens:n.maxTokens||8e3,stream:!1};n.temperature!=null&&(i.temperature=n.temperature);let s=t.thinking==="auto"?[void 0]:[...ya(e),void 0],r=null,o="";for(let m=0;m<s.length;m++){let A=s[m],M={...i};if(A?M.thinking=A:delete M.thinking,r=await U(a,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${t.apiKey}`},body:JSON.stringify(M)},t.timeoutMs||18e4),r.ok)break;if(o=(await r.text()).slice(0,300),!(r.status===400&&/thinking|reasoning/i.test(o)&&m<s.length-1))throw new Error(`openai-compat ${r.status}: ${o}`)}if(!r||!r.ok)throw new Error(`openai-compat ${r?.status}: ${o}`);let d=await r.json();if(d.error)throw new Error(`openai-compat error: ${JSON.stringify(d.error).slice(0,300)}`);let c=d.choices?.[0],h=c?.message?.content,g={input:d.usage?.prompt_tokens,output:d.usage?.completion_tokens};if(typeof h=="string"&&h.trim())return{text:h,finish:c?.finish_reason,usage:g};if(Array.isArray(h))return{text:h.map(m=>m.text||"").join(""),finish:c?.finish_reason,usage:g};let x=c?.message?.reasoning_content;if(typeof x=="string"&&x.trim())return{text:x,finish:c?.finish_reason,usage:g};throw new Error(`empty completion (finish=${c?.finish_reason||"?"})`)}function b(t){let e=(t||"").trim(),n=e.match(/```(?:json)?\s*([\s\S]*?)```/i);n?e=n[1].trim():e=e.replace(/^```(?:json)?\s*/i,"");let a=Math.min(...["{","["].map(i=>{let s=e.indexOf(i);return s<0?1/0:s}));if(a===1/0)throw new Error("no JSON in reply: "+JSON.stringify(e.slice(0,160)));e=e.slice(a);let l=Math.max(e.lastIndexOf("}"),e.lastIndexOf("]"));e=e.slice(0,l+1);try{return JSON.parse(e)}catch{let s=e.replace(/,\s*([}\]])/g,"$1");try{return JSON.parse(s)}catch(r){let o=Sa(s);try{return JSON.parse(o)}catch{throw new Error("JSON parse failed: "+String(r?.message).slice(0,80)+" | tail="+JSON.stringify(e.slice(-120)))}}}}function Sa(t){let e=Math.max(t.lastIndexOf("},"),t.lastIndexOf("],"),t.lastIndexOf('"},'),t.lastIndexOf(`}
`));e<t.length*.5?e=t.length:e+=1;let n=t.slice(0,e).replace(/,\s*$/,""),a=[],l=!1,i=!1;for(let s of n){if(l){i?i=!1:s==="\\"?i=!0:s==='"'&&(l=!1);continue}s==='"'?l=!0:s==="{"?a.push("}"):s==="["?a.push("]"):(s==="}"||s==="]")&&a.pop()}for(l&&(n+='"'),n=n.replace(/,\s*$/,"").replace(/:\s*$/,":null");a.length;)n+=a.pop();return n}async function Q(t){return t.kind==="anthropic"?((await(await fetch((t.baseUrl||"https://api.anthropic.com").replace(/\/$/,"")+"/v1/models",{headers:{"x-api-key":t.apiKey,"anthropic-version":"2023-06-01"}})).json()).data||[]).map(i=>i.id):((await(await fetch((t.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/models",{headers:{authorization:`Bearer ${t.apiKey}`}})).json()).data||[]).map(a=>a.id)}var J={};K(J,{ARCHETYPE_CATALOG:()=>L,DISTILL_SYSTEM:()=>B,FILL_SYSTEM:()=>I,FIX_SYSTEM:()=>j,ICON_NAMES:()=>$,PLAN_SYSTEM:()=>q,REVIEW_SYSTEM:()=>_,STYLE_RULES:()=>z,rulesBlock:()=>w});var aa={sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',"trending-up":'<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',"trending-down":'<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',"bar-chart":'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',"pie-chart":'<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',"line-chart":'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',activity:'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',building:'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',"map-pin":'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',calendar:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',check:'<path d="M20 6 9 17l-5-5"/>',"check-circle":'<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',"x-circle":'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',"alert-triangle":'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',lightbulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',brain:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',cpu:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',wifi:'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',smartphone:'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',laptop:'<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',volume:'<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',"message-circle":'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',"external-link":'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',sliders:'<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',filter:'<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',layers:'<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',"layout-grid":'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',list:'<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',"file-text":'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',folder:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',"book-open":'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',"graduation-cap":'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',briefcase:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',"shield-check":'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',key:'<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',award:'<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',"dollar-sign":'<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',"credit-card":'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',coins:'<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',percent:'<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',calculator:'<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',sprout:'<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',"cloud-rain":'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',thermometer:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',droplets:'<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',wind:'<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',tractor:'<path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/>',factory:'<path d="M12 16h.01"/><path d="M16 16h.01"/><path d="M3 19a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"/><path d="M8 16h.01"/><path d="M17 11V5a1 1 0 0 0-1.6-.8l-4 3A1 1 0 0 0 11 8v3"/><path d="M8 11V5a1 1 0 0 0-1.6-.8l-4 3A1 1 0 0 0 2 8v3"/>',truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',package:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',"shopping-cart":'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',hospital:'<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',stethoscope:'<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',flask:'<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',microscope:'<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',atom:'<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',battery:'<rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/><line x1="14" x2="14" y1="11" y2="13"/>',plug:'<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',ship:'<path d="M12 10.189V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',compass:'<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',map:'<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',navigation:'<polygon points="3 11 22 2 13 21 11 13 3 11"/>',"arrow-right":'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',"arrow-up-right":'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',"arrow-down-right":'<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',"arrow-left-right":'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',"chevrons-right":'<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',play:'<polygon points="6 3 20 12 6 21 6 3"/>',download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',"qr-code":'<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',languages:'<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',type:'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',pen:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',"clipboard-check":'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',bell:'<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',megaphone:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',headphones:'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',glasses:'<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/><path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>',hand:'<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',"thumbs-up":'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',puzzle:'<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',boxes:'<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',"git-branch":'<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',network:'<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',workflow:'<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',"circle-dot":'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',hexagon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',bot:'<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',scale:'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',landmark:'<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',school:'<path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/>',wheat:'<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',presentation:'<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',projector:'<path d="M5 7 3 5"/><path d="M9 6V3"/><path d="m13 7 2-2"/><circle cx="9" cy="13" r="3"/><path d="M11.83 12H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2.17"/><path d="M16 16h2"/>',timer:'<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',hourglass:'<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',gauge:'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',radar:'<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',satellite:'<path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/>',circuit:'<path d="M11 9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4"/><path d="M4 11h8"/><path d="M19 12v5a1 1 0 0 1-1 1h-5"/><circle cx="13" cy="20" r="2"/><circle cx="4" cy="11" r="2"/><circle cx="13" cy="4" r="2"/>',binary:'<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>',coffee:'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',handshake:'<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',recycle:'<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>',infinity:'<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',crosshair:'<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',quote:'<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',baby:'<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',egg:'<path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"/>',fish:'<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/>',bug:'<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',drone:'<path d="M10 10 7 7"/><path d="m10 14-3 3"/><path d="m14 10 3-3"/><path d="m14 14 3 3"/><path d="M14.205 4.139a4 4 0 1 1 5.439 5.863"/><path d="M19.637 14a4 4 0 1 1-5.432 5.868"/><path d="M4.367 10a4 4 0 1 1 5.438-5.862"/><path d="M9.796 19.866a4 4 0 1 1-5.429-5.873"/><rect x="10" y="8" width="4" height="8" rx="1"/>'};var $=Object.keys(aa).join(", "),L=`
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
`,z=`
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
`.replace("${ICONS}",$),q=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uB371 \uD50C\uB798\uB108"\uB2E4. \uC785\uB825 \uBE0C\uB9AC\uD504\uB97C \uC77D\uACE0 \uBC1C\uD45C\uC758 \uC11C\uC0AC \uAD6C\uC870(\uC139\uC158)\uC640 \uC7A5\uBCC4 \uACC4\uD68D\uC744 JSON\uC73C\uB85C \uC124\uACC4\uD55C\uB2E4. \uB514\uC790\uC778\uC740 \uD558\uC9C0 \uC54A\uB294\uB2E4 \u2014 \uBB34\uC5C7\uC744 \uC5B4\uB5A4 \uC720\uD615\uC73C\uB85C \uBCF4\uC5EC\uC904\uC9C0\uB9CC \uC815\uD55C\uB2E4.

[\uBAA9\uC801\uBCC4 \uAE30\uBCF8 \uC11C\uC0AC]
- lecture(\uAD50\uC721/\uD2B9\uAC15): cover \u2192 agenda \u2192 question(\uD6C4\uD0B9) \u2192 [section \u2192 \uD604\uD669(kpi-grid/timeline) \u2192 \uAC1C\uB150(bullets-visual/diagram) \u2192 \uC0AC\uB840(image-hero/annotated-image/mockup) \u2192 \uC801\uC6A9(cards/checklist)]\xD7N \u2192 \uC8FC\uC758/\uC548\uC804 \u2192 summary \u2192 closing
- ir(\uD22C\uC790/\uC0AC\uC5C5): cover \u2192 kpi-grid(\uC694\uC57D) \u2192 \uBB38\uC81C(bullets-visual) \u2192 \uC65C \uC9C0\uAE08(timeline) \u2192 \uC194\uB8E8\uC158(diagram) \u2192 \uC81C\uD488(cards/mockup) \u2192 \uAE30\uC220(diagram/layers) \u2192 \uD2B8\uB799\uC158(kpi-grid) \u2192 \uC2DC\uC7A5(chart) \u2192 \uACBD\uC7C1(comparison/matrix) \u2192 BM(diagram) \u2192 \uAC00\uACA9(pricing) \u2192 GTM(process) \u2192 \uC7AC\uBB34(chart/table) \u2192 \uD300(team) \u2192 closing(\uD22C\uC790 \uC81C\uC548)
- seminar/report(\uC138\uBBF8\uB098/\uBCF4\uACE0): cover \u2192 agenda \u2192 \uBC30\uACBD \uC22B\uC790(kpi-grid/chart) \u2192 [section \u2192 \uC6D0\uB9AC(diagram) \u2192 \uADFC\uAC70(chart/table) \u2192 \uD574\uC11D(quote/big-number)]\xD7N \u2192 \uC2DC\uC0AC\uC810(matrix/comparison) \u2192 \uC81C\uC548(process/checklist) \u2192 closing
- proposal(\uC81C\uC548/\uAE30\uD68D): cover \u2192 \uBC30\uACBD\xB7\uD544\uC694\uC131(kpi-grid/bullets-visual) \u2192 \uBAA9\uD45C(big-number) \u2192 \uCD94\uC9C4\uCCB4\uACC4(diagram) \u2192 \uC138\uBD80\uACFC\uC81C(cards) \u2192 \uC77C\uC815(timeline) \u2192 \uC608\uC0B0(table/chart) \u2192 \uAE30\uB300\uD6A8\uACFC(kpi-grid) \u2192 closing
- product(\uC81C\uD488 \uC18C\uAC1C): cover \u2192 \uBB38\uC81C(question/bullets-visual) \u2192 \uC194\uB8E8\uC158(diagram) \u2192 \uAE30\uB2A5(cards/mockup) \u2192 \uD6A8\uACFC(kpi-grid/chart) \u2192 \uAC00\uACA9(pricing) \u2192 \uB3C4\uC785 \uC808\uCC28(process) \u2192 closing

[\uC7A5\uC218 \uAC00\uC774\uB4DC] \uBC1C\uD45C\uC2DC\uAC04(\uBD84) \xD7 (lecture 1.0 / ir 0.8 / seminar 1.2 / report 0.9 / proposal 0.9 / product 0.8). \uC0AC\uC6A9\uC790\uAC00 \uC7A5\uC218\uB97C \uC9C0\uC815\uD558\uBA74 \uADF8 \uAC12\uC744 \uB530\uB978\uB2E4. \uC139\uC158 \uAC04\uC9C0(section)\uB294 10\uC7A5 \uBBF8\uB9CC\uC774\uBA74 0\uC7A5, 10~16\uC7A5\uC774\uBA74 \uCD5C\uB300 1\uC7A5, \uADF8 \uC774\uC0C1\uC740 5~12\uC7A5\uB9C8\uB2E4 1\uC7A5.

${L}

[\uCD9C\uB825 JSON]
{
  "meta": { "title", "subtitle"?, "event"?, "date"?, "place"?, "presenter"?: {"name","org"?}, "audience"?, "purpose", "theme": "signature-white"|"editorial-navy"|"vivid-photo"|"dark-stage", "lang":"ko", "durationMin" },
  "sections": [ { "id":"s1", "label":"\uC139\uC158\uBA85", "numeral":"\u2160" } ],
  "slides": [ { "id":"p01", "section":"s1"|null, "type":"<\uC544\uD0A4\uD0C0\uC785>", "title":"\uACB0\uB860\uD615 \uC81C\uBAA9(**\uAC15\uC870**)", "sub":"\uADFC\uAC70 \uD55C \uBB38\uC7A5", "intent":"\uC774 \uC7A5\uC774 \uCCAD\uC911\uC5D0\uAC8C \uB0A8\uAE38 \uD55C \uAC00\uC9C0(\u2264 40\uC790)", "content_hints":["\uC774 \uC7A5\uC5D0 \uB123\uC744 \uC0AC\uC2E4\xB7\uC218\uCE58\xB7\uC608\uC2DC(\uBE0C\uB9AC\uD504\uC5D0\uC11C \uCD94\uCD9C), \uAC01 \u2264 40\uC790, 2~4\uAC1C"], "visual_hint":"\uCC28\uD2B8 \uC885\uB958/\uB2E4\uC774\uC5B4\uADF8\uB7A8 \uC885\uB958/\uC774\uBBF8\uC9C0 \uC7A5\uBA74 \uB4F1(\u2264 30\uC790)", "t": \uAD8C\uC7A5\uCD08 } ]
}
theme \uAE30\uBCF8\uAC12: lecture\u2192vivid-photo, ir/product\u2192signature-white, seminar/report/proposal\u2192editorial-navy, keynote\u2192dark-stage. \uC0AC\uC6A9\uC790\uAC00 \uC9C0\uC815\uD558\uBA74 \uADF8 \uAC12.
${z}`,I=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uC2AC\uB77C\uC774\uB4DC \uC791\uC131\uC790"\uB2E4. \uB371 \uD50C\uB79C\uC758 \uD2B9\uC815 \uC7A5\uB4E4\uC744 \uBC1B\uC544 \uAC01 \uC7A5\uC758 \uC644\uC804\uD55C \uC2A4\uD399(JSON)\uC744 \uC4F4\uB2E4. \uB80C\uB354\uB7EC\uAC00 \uB514\uC790\uC778\xB7\uB808\uC774\uC544\uC6C3\xB7\uBAA8\uC158\uC744 \uB2F4\uB2F9\uD558\uBBC0\uB85C \uB2F9\uC2E0\uC740 \uB0B4\uC6A9\uC758 \uC815\uD655\uC131, \uAD6C\uC870(\uC544\uD0A4\uD0C0\uC785 \uC2A4\uD0A4\uB9C8 \uC900\uC218), \uAE00\uC790 \uC218 \uC0C1\uD55C, \uBC1C\uD45C \uB178\uD2B8\uC5D0 \uC9D1\uC911\uD55C\uB2E4.

${L}

[\uCD9C\uB825 JSON] { "slides": [ { "id":"p03", "section":"s1", "type":"...", "title":"...", "sub":"...", "source":"...", "notes":{"t":45,"s":"..."}, "body":{ ...type\uBCC4 \uD544\uB4DC... } } ] }
- \uC694\uCCAD\uBC1B\uC740 id\uC758 \uC7A5\uB9CC, \uC694\uCCAD \uC21C\uC11C\uB300\uB85C, \uC804\uBD80 \uCD9C\uB825\uD55C\uB2E4. type\uC740 \uD50C\uB79C\uC758 type\uC744 \uB530\uB974\uB418 \uB0B4\uC6A9\uC0C1 \uB354 \uC801\uD569\uD55C \uC720\uD615\uC774 \uBD84\uBA85\uD558\uBA74 \uBC14\uAFD4\uB3C4 \uB41C\uB2E4(\uAC19\uC740 \uC7A5\uC218 \uC720\uC9C0).
- \uD50C\uB79C\uC758 content_hints\uC640 \uBE0C\uB9AC\uD504 \uC790\uB8CC\uC758 \uC0AC\uC2E4\xB7\uC218\uCE58\uB97C \uCD5C\uB300\uD55C \uD65C\uC6A9\uD55C\uB2E4. \uC5C6\uB294 \uC218\uCE58\uB294 \uB9CC\uB4E4\uC9C0 \uC54A\uB294\uB2E4.
- \uD14D\uC2A4\uD2B8\uB294 \uD55C\uAD6D\uC5B4(\uBE0C\uB9AC\uD504\uAC00 \uB2E4\uB978 \uC5B8\uC5B4\uBA74 \uADF8 \uC5B8\uC5B4). \uC804\uBB38 \uC6A9\uC5B4\uB294 \uC9E7\uC740 \uD480\uC774\uB97C \uAD04\uD638\uB85C.
${z}`,j=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uC218\uC815\uC790"\uB2E4. \uB80C\uB354 \uB9B0\uD2B8/\uAC80\uC218\uC5D0\uC11C \uC9C0\uC801\uB41C \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB3C4\uB85D \uC2AC\uB77C\uC774\uB4DC \uC2A4\uD399(JSON)\uC744 \uCD5C\uC18C\uD55C\uC73C\uB85C \uACE0\uCE5C\uB2E4.
- OVERFLOW/DENSE: \uAE00\uC790 \uC218\uB97C \uC904\uC774\uAC70\uB098(\uC0C1\uD55C \uC900\uC218), \uD56D\uBAA9 \uC218\uB97C \uC904\uC774\uAC70\uB098(\uCE74\uB4DC \u22646, \uBD88\uB9BF \u22645, \uD45C \u22648\uD589), \uB354 \uAC00\uBCBC\uC6B4 \uC720\uD615\uC73C\uB85C \uBC14\uAFBC\uB2E4.
- SPARSE: \uB0B4\uC6A9\uC744 \uBCF4\uAC15(\uD56D\uBAA9 \uCD94\uAC00, desc \uCD94\uAC00, visual \uCD94\uAC00)\uD558\uAC70\uB098 \uB354 \uAF49 \uCC2C \uC720\uD615(cards/kpi-grid)\uC73C\uB85C \uBC14\uAFBC\uB2E4.
- SMALL_FONT/LOW_CONTRAST: \uB80C\uB354\uB7EC \uBB38\uC81C\uC77C \uC218 \uC788\uC73C\uB2C8 \uD14D\uC2A4\uD2B8 \uAE38\uC774\uB9CC \uC904\uC778\uB2E4.
- \uB9AC\uBDF0 \uCF54\uBA58\uD2B8(design review)\uB294 \uADF8 \uC9C0\uC2DC\uB97C \uB530\uB978\uB2E4.
\uCD9C\uB825\uC740 \uC218\uC815\uB41C slide \uAC1D\uCCB4(JSON) \uD558\uB098\uB9CC. \uAC19\uC740 id \uC720\uC9C0.
${L}
${z}`,_=`\uB2F9\uC2E0\uC740 \uD504\uB808\uC820\uD14C\uC774\uC158 \uB514\uC790\uC778 \uB514\uB809\uD130\uC774\uC790 \uD504\uB7F0\uD2B8\uC5D4\uB4DC QA\uB2E4. \uC2AC\uB77C\uC774\uB4DC \uC2A4\uD06C\uB9B0\uC0F7(1920\xD71080)\uC744 \uBCF4\uACE0 "\uC0AC\uB78C \uB208" \uAE30\uC900\uC73C\uB85C \uD3C9\uAC00\uD55C\uB2E4.
\uD3C9\uAC00 \uCD95(\uAC01 1~5\uC810): hierarchy(\uC704\uACC4\xB7\uCD08\uC810), balance(\uC5EC\uBC31\xB7\uBC00\uB3C4\xB7\uC815\uB82C), readability(\uAE00\uC790 \uD06C\uAE30\xB7\uB300\uBE44\xB7\uC904\uBC14\uAFC8), consistency(\uB371 \uB0B4 \uC77C\uAD00\uC131), impact(\uD55C\uB208\uC5D0 \uBA54\uC2DC\uC9C0 \uC804\uB2EC), correctness(\uACB9\uCE68\xB7\uC798\uB9BC\xB7\uAE68\uC9D0 \uC5C6\uC74C).
\uCD9C\uB825 JSON: { "score": 1~5(\uC885\uD569), "axes": {hierarchy, balance, readability, consistency, impact, correctness}, "issues": [ {"sev":"error"|"warn"|"nit", "what":"\uAD6C\uCCB4\uC801 \uBB38\uC81C", "where":"\uC704\uCE58/\uC694\uC18C", "fix":"\uC2A4\uD399 \uC218\uC815 \uC81C\uC548(\uC720\uD615 \uBCC0\uACBD\xB7\uD14D\uC2A4\uD2B8 \uCD95\uC18C\xB7\uD56D\uBAA9 \uC218 \uB4F1)"} ], "keep": ["\uC798\uB41C \uC810"], "rule_candidates": ["\uC774 \uB371\uC744 \uB118\uC5B4 \uC77C\uBC18\uD654\uD560 \uC218 \uC788\uB294 \uADDC\uCE59 \uD55C \uC904"] }
JSON\uB9CC \uCD9C\uB825.`,B=`\uB2F9\uC2E0\uC740 Qpresen Deck Engine\uC758 "\uADDC\uCE59 \uC99D\uB958\uAE30"\uB2E4. \uB204\uC801\uB41C \uAC80\uC218 \uD53C\uB4DC\uBC31(\uB9B0\uD2B8 \uD1B5\uACC4, \uBE44\uC804 \uB9AC\uBDF0, \uC0AC\uC6A9\uC790 \uCF54\uBA58\uD2B8)\uC744 \uC77D\uACE0, \uB2E4\uC74C \uC0DD\uC131\uC5D0 \uC801\uC6A9\uD560 \uC77C\uBC18 \uADDC\uCE59\uC744 \uBF51\uB294\uB2E4.
- \uAE30\uC874 \uADDC\uCE59\uACFC \uC911\uBCF5\uB418\uBA74 \uC81C\uC678. \uD2B9\uC815 \uB371\uC5D0\uB9CC \uD574\uB2F9\uD558\uB294 \uB0B4\uC6A9 \uC81C\uC678. \uD55C \uC904(\u2264 80\uC790) \uBA85\uB839\uBB38.
- scope: "plan"(\uAD6C\uC131\xB7\uC720\uD615 \uC120\uD0DD) | "fill"(\uD14D\uC2A4\uD2B8\xB7\uB0B4\uC6A9) | "render"(\uB80C\uB354\uB7EC/CSS \uAC1C\uC120 \uC694\uCCAD \u2014 \uAC1C\uBC1C\uC790\uC6A9).
\uCD9C\uB825 JSON: { "rules": [ {"scope":"plan"|"fill"|"render", "text":"...", "evidence":"\uADFC\uAC70 \uC694\uC57D", "weight":1~3} ] }`;function w(t,e){let n=t.filter(a=>a.scope===e||a.scope==="all");return n.length?`
[\uB204\uC801 \uAC80\uC218\uC5D0\uC11C \uD559\uC2B5\uB41C \uCD94\uAC00 \uADDC\uCE59 \u2014 \uC6B0\uC120 \uC801\uC6A9]
${n.map((a,l)=>`${l+1}. ${a.text}`).join(`
`)}
`:""}var D={"gochang-05-numbers":{id:"gochang-05-numbers",title:"\uC22B\uC790 \uCE74\uB4DC 2\uD589(\uADF8\uB8F9 \uD5E4\uB354+KPI \uD0C0\uC77C) + \uC624\uB978\uCABD \uCD94\uC138 \uD328\uB110 + \uACB0\uB860 \uCE74\uB4DC",kinds:["numbers","story","list"],text:`<!-- EXEMPLAR: \uC0AC\uB78C\uC740 \uC904\uACE0, \uC77C\uC740 \uB298\uC5B4\uB09C\uB2E4 \u2014 \uC22B\uC790 \uCE74\uB4DC 2\uD589 + \uC624\uB978\uCABD \uACB0\uB860 \uD328\uB110 -->
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
`}};function T(t){let e={numbers:["gochang-05-numbers","ir-04-market-slider"],chart:["ir-04-market-slider","gochang-05-numbers"],demo:["ir-04-market-slider","gochang-21-prompt-formula"],process:["gochang-21-prompt-formula","gochang-05-numbers"],compare:["gochang-10-three-companies","gochang-05-numbers"],concept:["gochang-10-three-companies","gochang-21-prompt-formula"],story:["gochang-05-numbers","gochang-10-three-companies"],list:["gochang-10-three-companies","gochang-05-numbers"]};return(e[t]||e.story).map(a=>D[a]).filter(Boolean)}var Aa=new Set(["cover","section","agenda","closing","quote","image-hero"]);function E(t){return!Aa.has(String(t.type||""))}function Y(t,e){let n=String(t||""),a=String(e||"");return/kpi|big-number/.test(n)?"numbers":/chart|table/.test(n)?"chart":/comparison|matrix|pricing/.test(n)?"compare":/process|timeline|checklist/.test(n)?"process":/mockup|annotated/.test(n)?"demo":/diagram|bullets|summary|team|cards/.test(n)?/사례|스토리|이야기/.test(a)?"story":"concept":"story"}var ta=`[\uBB34\uB300 \uADDC\uACA9]
- \uC5D4\uC9C4\uC774 <main class="stage f-{accent}"> \uC548\uC5D0 \uC0C1\uB2E8 \uBC14\uC640 <header class="head">(eyebrow + h1 \uC81C\uBAA9 + p.sub)\uB97C \uADF8\uB824 \uC900\uB2E4. \uB2F9\uC2E0\uC740 <section class="body"> \uC548\uC5D0 \uB4E4\uC5B4\uAC08 \uB0B4\uC6A9\uB9CC \uC4F4\uB2E4.
- .body \uBC15\uC2A4: \uAC00\uB85C 1728px \xD7 \uC138\uB85C \uC57D 680px (sub\uAC00 \uC5C6\uC73C\uBA74 \uC57D 730px). \uBAA8\uB4E0 \uB0B4\uC6A9\uC740 \uC774 \uBC15\uC2A4 \uC548\uC5D0 \uB4E4\uC5B4\uAC00\uC57C \uD558\uACE0 \uB118\uCE58\uBA74 \uC548 \uB41C\uB2E4. \uC2A4\uD06C\uB864 \uAE08\uC9C0, \uBC15\uC2A4 \uBC16 \uC808\uB300 \uBC30\uCE58 \uAE08\uC9C0.
- .body \uAE30\uBCF8\uAC12: display:flex; flex-direction:column; flex:1; min-height:0. CSS\uC5D0\uC11C .body{display:grid;grid-template-columns:\u2026;grid-template-rows:minmax(0,1fr) auto;gap:\u2026;min-height:0} \uCC98\uB7FC \uC9C1\uC811 \uBC14\uAFD4 \uC368\uB3C4 \uB41C\uB2E4(\uAD8C\uC7A5).
- \uADF8\uB9AC\uB4DC/\uD50C\uB809\uC2A4 \uC790\uC2DD\uC5D0\uB294 min-height:0; min-width:0 \uC744 \uB123\uC5B4 \uB118\uCE68\uC744 \uB9C9\uB294\uB2E4. \uB192\uC774\uB294 1fr / flex:1 \uB85C \uB098\uB204\uACE0 \uACE0\uC815 px \uB192\uC774\uB294 \uC791\uC740 \uC694\uC18C\uC5D0\uB9CC \uC4F4\uB2E4. \uAE34 \uD14D\uC2A4\uD2B8 \uC694\uC18C\uC5D0\uB294 overflow:hidden \uC744 \uAC78\uC5B4 \uB454\uB2E4.
- \uAE00\uC790 \uD06C\uAE30 \uD558\uD55C: \uBCF8\uBB38 17px, \uCEA1\uC158\xB7\uD0DC\uADF8 15px(\uC808\uB300 \uCD5C\uC18C 14px). \uCE74\uB4DC \uC81C\uBAA9 22~28px, \uD070 \uC22B\uC790 46~72px, \uACB0\uB860 \uBB38\uC7A5 22~27px. h1 \uC81C\uBAA9\uC740 \uC5D4\uC9C4\uC774 58px\uB85C \uADF8\uB9B0\uB2E4.

[\uB514\uC790\uC778 \uD1A0\uD070 \u2014 \uC0C9\uC740 \uBC18\uB4DC\uC2DC var()\uB85C \uC4F4\uB2E4]
--ink(\uC81C\uBAA9 \uAE00\uC790) --text(\uBCF8\uBB38) --muted(\uBCF4\uC870) --faint(\uC544\uC8FC \uC5F0\uD568) --line / --line-2(\uD14C\uB450\uB9AC) --bg --card / --card-2 / --card-3(\uBA74 \uB2E8\uACC4)
--f(\uC774 \uC7A5\uC758 \uAC15\uC870\uC0C9: \uC139\uC158\uBCC4 \uC790\uB3D9) --f-100(\uC5F0\uD55C \uAC15\uC870\uBA74) --f-50 --f-ink(\uAE00\uC790\uC6A9 \uC9C4\uD55C \uAC15\uC870\uC0C9 \u2014 \uAC15\uC870 \uAE00\uC790\xB7\uC22B\uC790\uC5D0 \uC0AC\uC6A9; --f\uB294 \uBA74\xB7\uC544\uC774\uCF58\xB7\uB9C9\uB300\uC5D0)
--brand --azure --violet --teal --amber --rose --navy --ok --danger --gold (+ \uAC01\uAC01 -100 \uC5F0\uD55C \uBA74, -ink \uAE00\uC790\uC6A9)
--qg(\uBE0C\uB79C\uB4DC \uADF8\uB77C\uB370\uC774\uC158) --q1 --q2 --q3(\uADF8\uB77C\uB370\uC774\uC158 \uC2A4\uD1B1 \uC0C9) --r(24px) --r-sm(16px) --r-xs(11px) --shadow --shadow-lg --ease
\uC694\uC18C\uC5D0 class="f-azure | f-violet | f-teal | f-amber | f-rose | f-navy | f-ok | f-danger" \uB97C \uC8FC\uBA74 \uADF8 \uD558\uC704\uC758 --f / --f-100 / --f-ink \uAC00 \uBC14\uB010\uB2E4(\uCE74\uB4DC\uBCC4 \uC0C9 \uAD6C\uBD84).
\uB2E4\uD06C \uD14C\uB9C8\uC5D0\uC11C\uB3C4 \uD1A0\uD070\uC774 \uC790\uB3D9 \uBC18\uC804\uB41C\uB2E4. \uACE0\uC815\uC0C9(#fff \uB4F1)\uC740 \uADF8\uB77C\uB370\uC774\uC158\xB7solid \uBA74 \uC704\uC758 \uD770 \uAE00\uC790\uC5D0\uB9CC \uC4F4\uB2E4.

[\uCEF4\uD3EC\uB10C\uD2B8 \uD074\uB798\uC2A4 \u2014 \uBCA0\uC774\uC2A4 CSS\uAC00 \uC81C\uACF5\uD55C\uB2E4. \uADF8\uB300\uB85C \uC4F0\uBA74 \uB371 \uC804\uCCB4\uC758 \uC77C\uAD00\uC131\uC774 \uC0DD\uAE34\uB2E4]
.card(\uD770 \uCE74\uB4DC: \uD14C\uB450\uB9AC\xB7\uADF8\uB9BC\uC790\xB7radius) \uBCC0\uD615 .card.tint(--f-100 \uBC14\uD0D5) .card.solid(--f \uBC14\uD0D5\xB7\uD770 \uAE00\uC790) .card.edge(\uC67C\uCABD \uC0C9 \uB760) .card.glass(\uC720\uB9AC) .card.lift(hover \uC0C1\uC2B9) .gborder(\uADF8\uB77C\uB370\uC774\uC158 \uD14C\uB450\uB9AC) .card-title(\uCE74\uB4DC \uC81C\uBAA9 \uC904)
.k-eyebrow(\uC791\uC740 \uB300\uBB38\uC790 \uB77C\uBCA8) .k-title .k-body .k-small \xB7 .mega(\uCD08\uB300\uD615 \uC22B\uC790) .big .num(\uC22B\uC790 \uAE00\uAF34) .num-g / .gtext(\uADF8\uB77C\uB370\uC774\uC158 \uAE00\uC790)
.icon-circle(\uC6D0\uD615 \uC544\uC774\uCF58 \uBC30\uACBD 48px, \uD558\uC704 .ic 24px) .ic-sq(\uC0AC\uAC01 52px; .ic-sq.lg 64px; .ic-sq.g \uADF8\uB77C\uB370\uC774\uC158) \xB7 .chip .pill(.pill.g \uADF8\uB77C\uB370\uC774\uC158, .pill.o \uC544\uC6C3\uB77C\uC778) .tag .label .kpi .delta(.up/.down)
.bullets>li(\uBD88\uB9BF) .bar>i(\uAC00\uB85C \uB9C9\uB300, data-bar) .grid-2 .grid-3 .grid-4 .tbl(\uD45C) .callout(\uACB0\uB860 \uBC15\uC2A4) .band(\uAC00\uB85C \uB760) .note .avatar .divider
.seg>button(.on)(\uC138\uADF8\uBA3C\uD2B8 \uD1A0\uAE00, .seg.g) input.rng(\uC2AC\uB77C\uC774\uB354, --p \uB85C \uCC44\uC6C0 \uD45C\uC2DC) .toggle(.on) .btn(.btn.ghost) .kbd .tap(\uD0ED \uD6A8\uACFC \uC6D0)
\uC544\uC774\uCF58: <i data-icon="\uC774\uB984"></i> \uAC00 24px \uC120\uD615 SVG \uC544\uC774\uCF58\uC73C\uB85C \uCE58\uD658\uB41C\uB2E4(\uD06C\uAE30\uB294 \uBD80\uBAA8\uC758 .ic{width;height} \uADDC\uCE59\uC73C\uB85C). \uC774\uBAA8\uC9C0 \uAE08\uC9C0. \uC774\uB984\uC740 \uB2E4\uC74C \uC911\uC5D0\uC11C\uB9CC:
${$}

[\uBAA8\uC158 \u2014 \uBCA0\uC774\uC2A4 JS\uAC00 data-\uC18D\uC131\uC744 \uCC98\uB9AC\uD55C\uB2E4. JS \uC5C6\uC774\uB3C4 \uB3D9\uC791]
- data-reveal="" | "up" | "left" | "right" | "scale" | "fade" + data-delay="ms": \uB4F1\uC7A5 \uC560\uB2C8\uBA54\uC774\uC158(\uC9C0\uC815 \uC5C6\uC73C\uBA74 70ms \uAC04\uACA9 \uC790\uB3D9). \uC694\uC18C 10~25\uAC1C\uC5D0 \uB9AC\uB4EC \uC788\uAC8C \uB098\uB220 \uC900\uB2E4.
- data-count="12345" (+ data-decimals data-prefix data-suffix data-duration): \uC22B\uC790 \uCE74\uC6B4\uD2B8\uC5C5. \uC694\uC18C \uC548 \uD14D\uC2A4\uD2B8\uB294 \uCD5C\uC885\uAC12(\uC608: 12,345).
- data-type (+ data-speed): \uD0C0\uC790 \uD6A8\uACFC. \uB0B4\uBD80 \uD0DC\uADF8 \uC5C6\uB294 \uC21C\uC218 \uD14D\uC2A4\uD2B8 \uC694\uC18C\uC5D0\uB9CC.
- .bar data-bar="42" \uC548\uC758 <i></i> \uAC00 42%\uAE4C\uC9C0 \uCC28\uC624\uB984. svg path data-draw: \uC120 \uADF8\uB9AC\uAE30. data-grow: \uC790\uB77C\uB0A8.
- \uBD80\uBAA8 data-cycle="2800" \uC548\uC758 [data-step] \uC694\uC18C\uB97C \uCC28\uB840\uB85C .on \uCC98\uB9AC(\uC790\uB3D9 \uD558\uC774\uB77C\uC774\uD2B8, mouseenter\uB85C \uC120\uD0DD).
- [data-mock] \uC548\uC758 [data-at="ms"] \uC694\uC18C\uAC00 \uC2DC\uAC04\uCC28\uB85C \uB098\uD0C0\uB0A8(\uCC44\uD305\xB7\uD654\uBA74 \uC2DC\uC5F0). data-click \uC774\uBA74 .cursor \uAC00 \uADF8 \uC704\uCE58\uB85C \uC774\uB3D9, data-type-text \uB294 \uD0C0\uC774\uD551, \uBD80\uBAA8 data-loop="ms" \uBA74 \uBC18\uBCF5.
- <canvas data-particles="60"></canvas>: \uD30C\uD2F0\uD074 \uBC30\uACBD.
- \uC815\uC801 \uBAA8\uB4DC(html.static: \uC378\uB124\uC77C\xB7\uC778\uC1C4)\uC5D0\uC11C\uB294 \uBAA8\uB4E0 reveal\uC774 \uC989\uC2DC \uC644\uB8CC \uC0C1\uD0DC\uB85C \uADF8\uB824\uC9C4\uB2E4. JS\uB3C4 e.detail.static \uC774\uBA74 \uCD5C\uC885 \uC0C1\uD0DC\uB97C \uC989\uC2DC \uADF8\uB9AC\uACE0 \uB05D\uB0B8\uB2E4.

[JS \uADDC\uCE59]
- \uC804\uBD80 document.addEventListener('deck:ready', function(e){ var STATIC=e.detail.static; \u2026 }) \uC548\uC5D0 \uC4F4\uB2E4. \uC804\uC5ED \uBCC0\uC218 \uAE08\uC9C0.
- \uC790\uB3D9 \uB370\uBAA8: \uC544\uBB34\uAC83\uB3C4 \uB204\uB974\uC9C0 \uC54A\uC544\uB3C4 2~6\uCD08 \uC548\uC5D0 \uC6C0\uC9C1\uC784\uC774 \uBCF4\uC774\uACE0, \uC0AC\uC6A9\uC790\uAC00 \uD074\uB9AD\xB7\uC2AC\uB77C\uC774\uB354\xB7\uD1A0\uAE00\uC744 \uB9CC\uC9C0\uBA74 \uC790\uB3D9 \uB370\uBAA8\uB97C \uBA48\uCD98\uB2E4.
- \uAE08\uC9C0: alert/confirm/prompt, fetch/XHR, localStorage, location \uBCC0\uACBD, \uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4(\uBC1C\uD45C\uC790 \uD0A4\uC640 \uCDA9\uB3CC), \uC678\uBD80 \uB77C\uC774\uBE0C\uB7EC\uB9AC, document.write, \uB05D\uC5C6\uC774 \uB204\uC801\uB418\uB294 \uD0C0\uC774\uBA38.
- \uC2AC\uB77C\uC774\uB354\xB7\uB4DC\uB798\uADF8 \uCEE8\uD2B8\uB864\uC5D0\uB294 touchstart/touchend \uC5D0 stopPropagation (\uC2AC\uB77C\uC774\uB4DC \uB118\uAE40 \uBC29\uC9C0).
- SVG \uCC28\uD2B8\uB294 \uC9C1\uC811 \uADF8\uB9B0\uB2E4(viewBox\uB294 \uC2E4\uC81C px, \uCD95\xB7\uACA9\uC790\xB7\uAC12 \uB77C\uBCA8 \uD3EC\uD568). 150\uC904 \uC548\uCABD.

[\uCF58\uD150\uCE20 \uADDC\uCE59]
- \uC0AC\uC2E4\xB7\uC218\uCE58\uB294 \uBE0C\uB9AC\uD504\xB7\uC790\uB8CC\xB7\uD50C\uB79C\uC758 content_hints \uC5D0 \uC788\uB294 \uAC83\uC744 \uC6B0\uC120 \uC4F4\uB2E4. \uC790\uB8CC\uAC00 \uC5C6\uB294 \uC8FC\uC81C\uB77C\uBA74 \uB110\uB9AC \uC54C\uB824\uC9C4 \uACF5\uAC1C \uC0AC\uC2E4\xB7\uC218\uCE58(\uAE30\uAD00\xB7\uC5F0\uB3C4\uB97C \uBD99\uC774\uACE0 \uBD88\uD655\uC2E4\uD558\uBA74 '\uC57D'\xB7'\uCD94\uC815')\uB97C \uC368\uC11C \uC7A5\uC744 \uAD6C\uCCB4\uC801\uC73C\uB85C \uB9CC\uB4E0\uB2E4 \u2014 \uB9C9\uC5F0\uD55C \uC77C\uBC18\uB860("\uC911\uC694\uD558\uB2E4", "\uD544\uC694\uD558\uB2E4")\uC73C\uB85C \uCC44\uC6B0\uC9C0 \uC54A\uB294\uB2E4. \uCD9C\uCC98\xB7\uAE30\uC900\uC5F0\uB3C4\uB294 META.source \uC5D0. \uC218\uCE58\uB97C \uAFB8\uBA70\uB0B4\uC9C4 \uC54A\uB294\uB2E4.
- \uD55C \uC7A5 = \uD55C \uBA54\uC2DC\uC9C0. \uC81C\uBAA9\uC740 \uD50C\uB79C\uC758 \uAC83\uC744 \uC4F0\uB418 \uB354 \uB0A0\uCE74\uB85C\uC6B4 \uACB0\uB860\uD615\uC774\uBA74 \uB2E4\uB4EC\uC5B4\uB3C4 \uB41C\uB2E4(**\uAC15\uC870** 1\uAC1C, \u2264 28\uC790). sub \uB294 \uADFC\uAC70 1\uBB38\uC7A5(\u2264 60\uC790).
- \uBC00\uB3C4: \uCC38\uACE0 \uB371 \uC218\uC900\uC73C\uB85C \uAF49 \uCC28\uB418 \uC228 \uC274 \uC5EC\uBC31. \uCE74\uB4DC desc \u2264 45\uC790, \uB77C\uBCA8 \u2264 22\uC790, \uACB0\uB860 \uBB38\uC7A5 \u2264 60\uC790. \uC601\uC5B4 \uC57D\uC5B4\uC5D4 \uC9E7\uC740 \uD480\uC774.
- \uC774 \uC7A5\uC758 \uBA54\uC2DC\uC9C0\uC5D0 \uB9DE\uB294 '\uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC' \uD558\uB098\uB97C \uC911\uC2EC\uC5D0 \uB454\uB2E4(\uD070 \uC22B\uC790 \uBB36\uC74C / \uBE44\uAD50 / \uD750\uB984 / \uCC28\uD2B8 / \uC2DC\uC5F0 / \uAD6C\uC870\uB3C4). \uB2E4\uB978 \uC7A5\uACFC \uB808\uC774\uC544\uC6C3\uC774 \uACB9\uCE58\uC9C0 \uC54A\uAC8C \uD55C\uB2E4(\uC544\uB798 \uB371 \uAC1C\uC694\uC758 signature \uCC38\uACE0).
- \uD14D\uC2A4\uD2B8\uB294 \uD55C\uAD6D\uC5B4(\uBE0C\uB9AC\uD504\uAC00 \uB2E4\uB978 \uC5B8\uC5B4\uBA74 \uADF8 \uC5B8\uC5B4).`,ea=`[\uCD9C\uB825 \uD615\uC2DD \u2014 \uC815\uD655\uD788 \uC544\uB798 4\uAC1C \uAD6C\uBD84\uC120, \uADF8 \uBC16\uC758 \uC124\uBA85\xB7\uCF54\uB4DC\uD39C\uC2A4 \uAE08\uC9C0]
===META===
{"title":"\uACB0\uB860\uD615 \uC81C\uBAA9(**\uAC15\uC870**)","sub":"\uADFC\uAC70 \uD55C \uBB38\uC7A5","source":"\uCD9C\uCC98\xB7\uAE30\uC900\uC5F0\uB3C4(\uC5C6\uC73C\uBA74 \uBE48 \uBB38\uC790\uC5F4)","notes":{"t":45,"s":"\uBC1C\uD45C \uB300\uBCF8(\uAD6C\uC5B4\uCCB4 \uC874\uB313\uB9D0, 80~220\uC790)"},"signature":"\uC774 \uC7A5\uC758 \uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC \uD55C \uC904(\u2264 40\uC790)"}
===HTML===
(section.body \uC548\uC5D0 \uB4E4\uC5B4\uAC08 HTML. <style>\xB7<script> \uD0DC\uADF8 \uAE08\uC9C0. \uC678\uBD80 \uB9AC\uC18C\uC2A4\xB7\uC774\uBBF8\uC9C0 URL\xB7base64 \uAE08\uC9C0. \uC544\uC774\uCF58\uC740 <i data-icon="\u2026"></i>)
===CSS===
(\uC774 \uC7A5\uB9CC\uC758 CSS. \uBCA0\uC774\uC2A4 \uD074\uB798\uC2A4\uB97C \uB36E\uC5B4\uC368\uB3C4 \uB41C\uB2E4. @import \xB7 url(http\u2026) \uAE08\uC9C0)
===JS===
(\uD544\uC694 \uC5C6\uC73C\uBA74 \uBE44\uC6CC \uB454\uB2E4)`;function Z(t,e=[]){let a=T(t).map((l,i)=>`--- \uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC ${i+1}: ${l.title} ---
${l.text}`).join(`

`);return`\uB2F9\uC2E0\uC740 Qpresen \uD504\uB9AC\uBBF8\uC5C4 \uB371\uC758 \uC2AC\uB77C\uC774\uB4DC \uB514\uC790\uC774\uB108\uC774\uC790 \uD504\uB7F0\uD2B8\uC5D4\uB4DC \uC5D4\uC9C0\uB2C8\uC5B4\uB2E4. \uD15C\uD50C\uB9BF\uC744 \uCC44\uC6B0\uB294 \uAC83\uC774 \uC544\uB2C8\uB77C, \uC544\uB798 \uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC(\uC2E4\uC81C \uC218\uC791\uC5C5 \uB808\uD37C\uB7F0\uC2A4 \uB371\uC5D0\uC11C \uBC1C\uCDCC)\uC640 \uAC19\uC740 \uC218\uC900\uC73C\uB85C \uC774 \uC7A5 \uD558\uB098\uC758 HTML\xB7CSS\xB7JS\uB97C \uC9C1\uC811 \uC124\uACC4\uD55C\uB2E4. \uB514\uC790\uC778 \uC2DC\uC2A4\uD15C(\uD1A0\uD070\xB7\uD074\uB798\uC2A4\xB7\uBAA8\uC158)\uC744 \uADF8\uB300\uB85C \uC4F0\uB418 \uB808\uC774\uC544\uC6C3\uACFC \uC2DC\uAC01 \uC7A5\uCE58\uB294 \uC774 \uC7A5\uC758 \uBA54\uC2DC\uC9C0\uC5D0 \uB9DE\uCDB0 \uC0C8\uB85C \uC9E0\uB2E4.

${ta}
${w(e,"fill")}
[\uCC38\uACE0 \uC2AC\uB77C\uC774\uB4DC \u2014 \uD488\uC9C8 \uAE30\uC900. \uAD6C\uC870\xB7\uBC00\uB3C4\xB7\uBAA8\uC158 \uB9AC\uB4EC\uC744 \uBC30\uC6B0\uB418, \uB0B4\uC6A9\uACFC \uB808\uC774\uC544\uC6C3\uC744 \uBCF5\uC0AC\uD558\uC9C0 \uB9D0 \uAC83]
${a}

${ea}`}function C(t){let e=t.replace(/\r/g,""),n=(o,d)=>{let c=new RegExp(`===\\s*${o}\\s*===\\s*\\n?([\\s\\S]*?)(?=\\n\\s*===\\s*(?:${d.join("|")})\\s*===|$)`),h=e.match(c);return h?h[1].replace(/^\s*```[a-z]*\s*\n/i,"").replace(/\n\s*```\s*$/i,"").trim():""},a=n("META",["HTML","CSS","JS"]),l=n("HTML",["CSS","JS","META"]),i=n("CSS",["JS","META","HTML"]),s=n("JS",["META","HTML","CSS"]),r={};try{let o=a.indexOf("{"),d=a.lastIndexOf("}");o>=0&&d>o&&(r=JSON.parse(a.slice(o,d+1)))}catch{r={}}if(!l)throw new Error("rich: HTML section missing ("+e.slice(0,160).replace(/\n/g," ")+")");return{meta:r,html:l,css:i,js:s}}function P(t){let e=[],{html:n,css:a,js:l}=t;return n=n.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,(i,s)=>(a+=`
`+s,e.push("style-in-html"),"")),n=n.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,(i,s)=>(l+=`
`+s,e.push("script-in-html"),"")),/<link\b/i.test(n)&&(n=n.replace(/<link\b[^>]*>/gi,""),e.push("link-tag")),/<(img|iframe|video|audio|source|object|embed)\b/i.test(n)&&(n=n.replace(/<(img|iframe|video|audio|source|object|embed)\b[^>]*>(?:<\/\1>)?/gi,""),e.push("external-media")),/https?:\/\//i.test(n)&&(n=n.replace(/\s(?:src|href)="https?:\/\/[^"]*"/gi,""),e.push("url-in-html")),/@import/i.test(a)&&(a=a.replace(/@import[^;]*;/gi,""),e.push("css-import")),/url\(\s*['"]?https?:/i.test(a)&&(a=a.replace(/url\(\s*['"]?https?:[^)]*\)/gi,"none"),e.push("css-url")),/position\s*:\s*fixed/i.test(a)&&(a=a.replace(/position\s*:\s*fixed/gi,"position:absolute"),e.push("position-fixed")),/\d+(vh|vw)\b/.test(a)&&e.push("viewport-units"),/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.write|window\.open|location\.(href|assign|replace))\b/.test(l)&&(l=l.replace(/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|document\.write|window\.open)\s*\(/g,"(void 0)("),e.push("js-forbidden-api")),/\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/.test(l)&&(l=l.replace(/\b(alert|confirm|prompt)\s*\(/g,"console.log("),e.push("js-dialog")),/<script\s[^>]*src=/i.test(l)&&e.push("js-script-src"),{parts:{meta:t.meta,html:n.trim(),css:a.trim(),js:l.trim()},problems:e}}function $a(t,e=2e4){let a=[`\uC8FC\uC81C/\uC694\uCCAD: ${t.topic}`,t.purpose?`\uBAA9\uC801: ${t.purpose}`:"",t.audience?`\uCCAD\uC911: ${t.audience}`:"",t.durationMin?`\uBC1C\uD45C \uC2DC\uAC04: ${t.durationMin}\uBD84`:"",t.tone?`\uD1A4: ${t.tone}`:"",t.lang?`\uC5B8\uC5B4: ${t.lang}`:"\uC5B8\uC5B4: ko",t.presenter?`\uBC1C\uD45C\uC790: ${t.presenter.name}${t.presenter.org?" ("+t.presenter.org+")":""}`:"",t.extra?`\uCD94\uAC00 \uC9C0\uC2DC: ${t.extra}`:""].filter(Boolean).join(`
`);return t.materials&&(a+=`

[\uCC38\uACE0 \uC790\uB8CC \u2014 \uC0AC\uC2E4\xB7\uC218\uCE58\uB294 \uC5EC\uAE30\uC11C\uB9CC]
${t.materials.slice(0,e)}`),a}function ia(t,e,n){let a=e.meta||{},l=a.notes&&typeof a.notes=="object"?{t:Number(a.notes.t)||t.t||45,s:String(a.notes.s||"")}:{t:t.t||45,s:typeof a.notes=="string"?a.notes:t.intent||""};return{id:t.id,section:t.section||void 0,title:String(a.title||t.title),sub:a.sub!=null?String(a.sub):t.sub,source:a.source?String(a.source):void 0,notes:l,body:{type:"custom",bare:!0,rich:!0,html:e.html,css:e.css||void 0,js:e.js||void 0,kind:t.kind,signature:a.signature||t.signature,description:a.signature?String(a.signature):void 0},...n?{_model:n}:{}}}async function O(t,e,n,a){let l=String(n.kind||Y(n.type,n.visual_hint)),i=Z(l,a.rules||[]),s=e.slides.map(g=>({id:g.id,type:g.type,title:g.title,signature:g.signature||g.visual_hint||""})),r=e.slides.findIndex(g=>g.id===n.id),o=`${$a(t,a.materialsMax)}

[\uB371 \uBA54\uD0C0] ${JSON.stringify({...e.meta,sections:e.sections})}
[\uB371 \uAC1C\uC694 \u2014 \uB2E4\uB978 \uC7A5\uACFC \uB808\uC774\uC544\uC6C3\xB7\uC2DC\uADF8\uB2C8\uCC98\uAC00 \uACB9\uCE58\uC9C0 \uC54A\uAC8C]
${JSON.stringify(s)}

[\uC774\uBC88\uC5D0 \uC124\uACC4\uD560 \uC7A5: ${r+1}/${e.slides.length}\uC7A5, kind=${l}]
${JSON.stringify(n,null,1)}

\uC704 \uC7A5\uC758 META/HTML/CSS/JS \uB97C \uCD9C\uB825 \uD615\uC2DD\uB300\uB85C \uC791\uC131\uD558\uB77C.`,d=await u(a.provider,{system:i,messages:[{role:"user",content:o}],maxTokens:a.maxTokens||14e3,temperature:a.temperature??.5});a.log?.(`[rich ${n.id}/${l}] ${d.model} ${d.ms}ms out=${d.usage?.output??"?"}${d.truncated?" TRUNCATED":""}`);let{parts:c,problems:h}=P(C(d.text));if(h.length&&a.log?.(`[rich ${n.id}] sanitized: ${h.join(",")}`),c.html.length<400)throw new Error("rich: html too short");return ia({...n,kind:l},c,d.model)}var La=`\uB2F9\uC2E0\uC740 Qpresen \uD504\uB9AC\uBBF8\uC5C4 \uB371\uC758 \uC2AC\uB77C\uC774\uB4DC \uC218\uC815\uC790\uB2E4. \uB9B0\uD2B8\xB7\uAC80\uC218\uC5D0\uC11C \uC9C0\uC801\uB41C \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB3C4\uB85D \uD55C \uC7A5\uC758 HTML/CSS/JS\uB97C \uCD5C\uC18C\uD55C\uC73C\uB85C \uACE0\uCE5C\uB2E4. \uB808\uC774\uC544\uC6C3 \uCEE8\uC149\uACFC \uB0B4\uC6A9\uC740 \uC720\uC9C0\uD55C\uB2E4.
- OVERFLOW/OUTSIDE_STAGE: \uBC15\uC2A4(1728\xD7~680px)\uB97C \uB118\uCE5C \uAC83 \u2014 \uAE00\uC790 \uC218 \uCD95\uC18C, \uD56D\uBAA9 \uC218 \uCD95\uC18C, \uD589 \uB192\uC774 min-height:0/overflow:hidden, \uAE00\uC790 \uD06C\uAE30 1~2px \uCD95\uC18C \uC21C\uC73C\uB85C.
- SMALL_FONT: 14px \uBBF8\uB9CC \uAE00\uC790\uB97C \uD0A4\uC6B4\uB2E4(\uCEA1\uC158 15px \uC774\uC0C1). LOW_CONTRAST: --muted/--faint \uB300\uC2E0 --text/--ink, \uBA74 \uC704 \uAE00\uC790\uB294 -ink \uD1A0\uD070.
- OVERLAP: \uACB9\uCE58\uB294 \uC694\uC18C\uC758 \uAC04\uACA9\xB7\uADF8\uB9AC\uB4DC \uC815\uC758\uB97C \uACE0\uCE5C\uB2E4. EMPTY/SPARSE: \uB0B4\uC6A9\uC744 \uBCF4\uAC15\uD558\uAC70\uB098 \uC694\uC18C\uB97C \uD0A4\uC6CC \uC5EC\uBC31\uC744 \uCC44\uC6B4\uB2E4.
- \uC0AC\uC6A9\uC790 \uCF54\uBA58\uD2B8\uB294 \uADF8 \uC9C0\uC2DC\uB97C \uB530\uB978\uB2E4.
${ta}

${ea}
\uC218\uC815\uB41C \uC804\uCCB4(META/HTML/CSS/JS \uB124 \uAD6C\uAC04 \uBAA8\uB450)\uB97C \uCD9C\uB825\uD55C\uB2E4. \uBC14\uB00C\uC9C0 \uC54A\uC740 \uAD6C\uAC04\uB3C4 \uC804\uBD80 \uB2E4\uC2DC \uC4F4\uB2E4.`;async function na(t,e,n,a){let l=t.body,i=`===META===
${JSON.stringify({title:t.title,sub:t.sub,source:t.source,notes:t.notes,signature:l.signature})}
===HTML===
${l.html}
===CSS===
${l.css||""}
===JS===
${l.js||""}`,s=`[\uB371 \uBA54\uD0C0] ${JSON.stringify(a||{})}
[\uD604\uC7AC \uC2AC\uB77C\uC774\uB4DC]
${i}

[\uC9C0\uC801 \uC0AC\uD56D]
${e.map(c=>`- ${c.sev||""} ${c.code||""} ${c.el||""} ${c.extra!=null?"("+JSON.stringify(c.extra).slice(0,200)+")":""} ${c.what||""} ${c.fix?"\u2192 "+c.fix:""}`).join(`
`)}

\uC218\uC815\uB41C \uB124 \uAD6C\uAC04\uC744 \uCD9C\uB825 \uD615\uC2DD\uB300\uB85C \uC791\uC131\uD558\uB77C.`,r=await u(n.provider,{system:La,messages:[{role:"user",content:s}],maxTokens:n.maxTokens||14e3,temperature:.3});n.log?.(`[rich-fix ${t.id}] ${r.model} ${r.ms}ms${r.truncated?" TRUNCATED":""}`);let{parts:o}=P(C(r.text));if(o.html.length<400)return t;let d=ia({id:t.id,section:t.section,type:"custom",title:t.title,sub:t.sub,t:t.notes?.t,kind:l.kind},o,r.model);return o.meta?.title||(d.title=t.title,d.sub=t.sub,d.source=t.source,d.notes=t.notes),d}var H=`
[\uD504\uB9AC\uBBF8\uC5C4 \uBAA8\uB4DC \u2014 \uCD94\uAC00 \uC9C0\uC2DC]
\uC774 \uB371\uC740 \uC7A5\uB9C8\uB2E4 \uB9DE\uCDA4 \uC124\uACC4(HTML \uC9C1\uC811 \uC791\uC131)\uB85C \uB9CC\uB4E4\uC5B4\uC9C4\uB2E4. \uAC01 slide \uAC1D\uCCB4\uC5D0 \uB2E4\uC74C \uB450 \uD544\uB4DC\uB97C \uB354\uD55C\uB2E4:
- "kind": "numbers"(\uC22B\uC790\xB7\uD604\uD669) | "chart"(\uCD94\uC138\xB7\uBD84\uD3EC \uCC28\uD2B8) | "compare"(\uBE44\uAD50\xB7\uC804\uD6C4\xB7\uC120\uD0DD\uC9C0) | "process"(\uB2E8\uACC4\xB7\uD750\uB984\xB7\uACF5\uC2DD) | "concept"(\uAD6C\uC870\xB7\uC6D0\uB9AC\xB7\uAC1C\uB150\uB3C4) | "demo"(\uD654\uBA74\xB7\uB300\uD654 \uC2DC\uC5F0) | "story"(\uC0AC\uB840\xB7\uC774\uC57C\uAE30) | "list"(\uC815\uB9AC\xB7\uCCB4\uD06C\uB9AC\uC2A4\uD2B8)
- "signature": \uC774 \uC7A5\uC758 \uC2DC\uADF8\uB2C8\uCC98 \uBE44\uC8FC\uC5BC\xB7\uC778\uD130\uB799\uC158 \uD55C \uC904(\u2264 40\uC790, \uC608: "\uC5F0\uB3C4 \uC2AC\uB77C\uC774\uB354\uB85C \uC6C0\uC9C1\uC774\uB294 \uC131\uC7A5 \uB9C9\uB300\uCC28\uD2B8", "\uC804/\uD6C4 \uD1A0\uAE00 \uBE44\uAD50 \uCE74\uB4DC 3\uC7A5")
cover/section/agenda/closing/quote/image-hero \uB294 kind \uC5C6\uC774 \uADF8\uB300\uB85C \uB454\uB2E4. \uC5F0\uC18D\uB41C \uC7A5\uC774 \uAC19\uC740 kind\xB7\uAC19\uC740 signature \uB97C \uC4F0\uC9C0 \uC54A\uAC8C \uD558\uACE0, \uB371 \uC804\uCCB4\uC5D0\uC11C kind \uAC00 5\uC885 \uC774\uC0C1 \uC11E\uC774\uAC8C \uD55C\uB2E4.
content_hints \uB294 4~6\uAC1C\uAE4C\uC9C0 \uB109\uB109\uD788: \uC790\uB8CC\uAC00 \uC788\uC73C\uBA74 \uC790\uB8CC\uC758 \uC218\uCE58\xB7\uACE0\uC720\uBA85\uC0AC\xB7\uC608\uC2DC\uB97C, \uC790\uB8CC\uAC00 \uC5C6\uC73C\uBA74 \uB110\uB9AC \uC54C\uB824\uC9C4 \uACF5\uAC1C \uC0AC\uC2E4\xB7\uC218\uCE58(\uAE30\uAD00\xB7\uC5F0\uB3C4 \uBA85\uC2DC, \uBD88\uD655\uC2E4\uD558\uBA74 '\uC57D'\xB7'\uCD94\uC815')\uB97C \uBF51\uC544 \uC7A5\uB9C8\uB2E4 \uAD6C\uCCB4\uC801\uC778 \uC7AC\uB8CC\uB97C \uC900\uB2E4. \uC77C\uBC18\uB860\uB9CC \uC788\uB294 \uC7A5\uC740 \uB9CC\uB4E4\uC9C0 \uC54A\uB294\uB2E4.`;var za={"kpi-grid":[["items",6]],cards:[["items",8]],timeline:[["items",8]],process:[["steps",8]],"bullets-visual":[["bullets",5]],"annotated-image":[["hotspots",6]],pricing:[["plans",4]],team:[["members",6]],summary:[["takeaways",4]],agenda:[["items",10]],checklist:[["items",8]],comparison:[["columns",3],["rows",7]],table:[["rows",12],["columns",7]],question:[["options",5]],matrix:[["points",8],["quadrants",4]],diagram:[["nodes",8]],"big-number":[["compare",3]],cover:[["tags",6],["agenda",8],["stats",3]],closing:[["keywords",8]],section:[["bullets",4]]};function Ta(t,e,n,a,l){Array.isArray(t[e])&&t[e].length>n&&(a.push(`${l}: ${e} ${t[e].length} \u2192 ${n}\uAC1C\uB85C \uCD95\uC57D`),t[e]=t[e].slice(0,n))}var Ea=["kicker","tagline","meta","tags","agenda","visual","image","qr","stats","numeral","label","bullets","dark","items","question","hint","options","value","unit","prefix","context","compare","visualSide","callout","columns","style","footer","rows","verdict","orientation","nowIndex","steps","result","chart","insight","callouts","layout","highlightRow","highlightCol","caption","dense","align","aside","xLabel","yLabel","quadrants","points","kind","nodes","edges","center","quote","by","role","overlay","heading","hotspots","side","intro","mock","plans","members","groups","takeaways","cta","nextTitle","contact","keywords","thanks","html","css","js"],sa={title:"cover",titleslide:"cover",kpi:"kpi-grid",stats:"kpi-grid",numbers:"kpi-grid",bignumber:"big-number",big_number:"big-number",bullets:"bullets-visual","bullet-visual":"bullets-visual",list:"bullets-visual",grid:"cards",card:"cards",features:"cards",compare:"comparison",versus:"comparison",roadmap:"timeline",history:"timeline",steps:"process",flow:"process",graph:"chart",data:"chart",tbl:"table",quadrant:"matrix",architecture:"diagram",structure:"diagram",hero:"image-hero",image:"image-hero",photo:"image-hero",annotated:"annotated-image",demo:"mockup",plan:"pricing",people:"team",todo:"checklist",recap:"summary",conclusion:"summary",end:"closing",thanks:"closing",qa:"closing",divider:"section",chapter:"section",toc:"agenda",outline:"agenda"};function Ca(t,e,n){(!t.body||typeof t.body!="object")&&(t.body={}),!t.body.type&&t.type&&(t.body.type=t.type),t.body.type&&sa[String(t.body.type).toLowerCase()]&&(t.body.type=sa[String(t.body.type).toLowerCase()]),t.body.type&&(t.body.type=String(t.body.type).toLowerCase().replace(/_/g,"-"));for(let i of Ea)t[i]!==void 0&&t.body[i]===void 0&&!["title","sub","notes","source","section","id","accent","eyebrow","dark","motion"].includes(i)&&(t.body[i]=t[i],delete t[i]);!t.title&&t.body.heading&&t.body.type!=="closing"&&t.body.type!=="image-hero"&&(t.title=t.body.heading),!t.title&&t.heading&&(t.title=t.heading),t.subtitle&&!t.sub&&(t.sub=t.subtitle),t.speakerNotes&&!t.notes&&(t.notes=t.speakerNotes),typeof t.notes=="string"&&(t.notes={s:t.notes}),t.notes&&t.notes.text&&!t.notes.s&&(t.notes.s=t.notes.text),t.notes&&t.notes.seconds&&!t.notes.t&&(t.notes.t=t.notes.seconds);let a=t.body,l=(i,s)=>i.map(r=>typeof r=="string"?{[s]:r}:r).filter(Boolean);if(Array.isArray(a.bullets)&&(a.bullets=l(a.bullets,a.type==="section"?"_":"title").map(i=>i._!==void 0?i._:i)),Array.isArray(a.items)&&((a.type==="cards"||a.type==="agenda")&&(a.items=l(a.items,a.type==="agenda"?"label":"title")),a.type==="kpi-grid"&&(a.items=a.items.map(i=>typeof i=="string"?{value:i,label:""}:i.title&&!i.label?{...i,label:i.title}:i)),a.type==="timeline"&&(a.items=a.items.map(i=>typeof i=="string"?{date:"",title:i}:{...i,date:String(i.date??i.year??i.when??""),title:i.title??i.label??""})),a.type==="checklist"&&(a.items=l(a.items,"text"),Array.isArray(a.aside)&&(a.aside={points:a.aside.map(String)}),a.aside&&typeof a.aside=="object"&&!a.aside.points&&!a.aside.title&&!a.aside.text&&(a.aside=JSON.stringify(a.aside)))),Array.isArray(a.steps)&&(a.steps=l(a.steps,"title")),Array.isArray(a.takeaways)&&(a.takeaways=l(a.takeaways,"title")),Array.isArray(a.options)&&(a.options=a.options.map(i=>typeof i=="string"?i:i.text||i.label||"")),Array.isArray(a.keywords)&&(a.keywords=a.keywords.map(i=>typeof i=="string"?i:i.text||i.label||"")),Array.isArray(a.tags)&&(a.tags=a.tags.map(i=>typeof i=="string"?i:i.text||i.label||"")),a.type==="chart"&&!a.chart&&(a.labels||a.series)&&(a.chart={kind:a.kind||"bar",labels:a.labels,series:a.series,unit:a.unit,title:a.chartTitle}),a.type==="chart"&&a.chart){let i=a.chart;!i.labels&&i.categories&&(i.labels=i.categories),!i.series&&i.data&&(i.series=Array.isArray(i.data)&&typeof i.data[0]=="number"?[{name:i.title||"\uAC12",values:i.data}]:i.data),Array.isArray(i.series)&&(i.series=i.series.map(s=>Array.isArray(s)?{name:"\uAC12",values:s}:s.values?s:{name:s.name||"\uAC12",values:s.data||[]})),i.type&&!i.kind&&(i.kind=i.type)}a.type==="comparison"&&Array.isArray(a.columns)&&(a.columns=a.columns.map(i=>typeof i=="string"?{label:i}:i)),a.type==="table"&&Array.isArray(a.columns)&&(a.columns=a.columns.map(i=>typeof i=="string"?i:i.label||i.title||"")),a.type==="diagram"&&Array.isArray(a.nodes)&&(a.nodes=a.nodes.map((i,s)=>typeof i=="string"?{id:String(s+1),label:i}:i)),a.type==="mockup"&&!a.mock&&a.steps&&(a.mock={app:a.app||"chat",steps:a.steps},delete a.steps),a.type==="quote"&&!a.quote&&a.text&&(a.quote=a.text),a.type==="big-number"&&a.value===void 0&&a.number!==void 0&&(a.value=a.number),a.type==="pricing"&&Array.isArray(a.plans)&&(a.plans=a.plans.map(i=>({...i,features:Array.isArray(i.features)?i.features.map(s=>typeof s=="string"?s:s.text||""):[]})))}function R(t){let e=[],n=JSON.parse(JSON.stringify(t||{}));return n.meta=n.meta||{title:"\uC81C\uBAA9 \uC5C6\uC74C"},n.meta.title||(n.meta.title="\uC81C\uBAA9 \uC5C6\uC74C"),n.sections=Array.isArray(n.sections)?n.sections:[],n.slides=Array.isArray(n.slides)?n.slides.filter(Boolean):[],n.slides.length||(n.slides.push({title:n.meta.title,body:{type:"cover"}}),e.push("\uC2AC\uB77C\uC774\uB4DC\uAC00 \uC5C6\uC5B4 \uD45C\uC9C0 1\uC7A5\uC744 \uC0DD\uC131")),n.slides.forEach((a,l)=>{let i=`slide ${l+1}`;Ca(a,e,i),a.title||(a.title=`\uC2AC\uB77C\uC774\uB4DC ${l+1}`,e.push(`${i}: \uC81C\uBAA9 \uC5C6\uC74C`)),(!a.body||typeof a.body!="object"||!a.body.type)&&(a.body={type:"bullets-visual",bullets:[{title:a.sub||a.title}]},e.push(`${i}: body \uC5C6\uC74C \u2192 bullets-visual`));let s=a.body;if((za[s.type]||[]).forEach(([r,o])=>Ta(s,r,o,e,i)),s.type==="table"){s.columns=(s.columns||[]).map(String),s.rows=(s.rows||[]).map(o=>(Array.isArray(o)?o:[String(o)]).map(d=>String(d??"")));let r=s.columns.length;s.rows.forEach(o=>{for(;o.length<r;)o.push("");o.length>r&&(o.length=r)})}if(s.type==="comparison"){let r=(s.columns||[]).length;s.rows=(s.rows||[]).map(o=>({label:String(o.label??""),cells:(o.cells||[]).map(d=>String(d??""))})),s.rows.forEach(o=>{for(;o.cells.length<r;)o.cells.push("");o.cells.length>r&&(o.cells.length=r)})}if(s.type==="chart"){let r=s.chart||{};r.labels=(r.labels||[]).map(String),r.series=(r.series||[]).filter(o=>o&&Array.isArray(o.values)),r.series.forEach(o=>{for(o.values=o.values.map(d=>Number(d)||0);o.values.length<r.labels.length;)o.values.push(0)}),r.series.length||(r.series=[{name:"\uAC12",values:r.labels.map(()=>0)}],e.push(`${i}: \uCC28\uD2B8 \uC2DC\uB9AC\uC988 \uC5C6\uC74C`)),["bar","hbar","line","area","donut","stacked","pie"].includes(r.kind)||(r.kind="bar"),r.labels.length>12&&(e.push(`${i}: \uCC28\uD2B8 \uB77C\uBCA8 ${r.labels.length}\uAC1C \u2192 12\uAC1C`),r.labels=r.labels.slice(0,12),r.series.forEach(o=>o.values=o.values.slice(0,12))),s.chart=r}if(s.type==="kpi-grid"&&(s.items=(s.items||[]).map(r=>({...r,value:typeof r.value=="string"&&/^-?[\d,]+(\.\d+)?$/.test(r.value.trim())?Number(r.value.replace(/,/g,"")):r.value}))),s.type==="process"&&(!s.steps||s.steps.length<2)&&e.push(`${i}: \uD504\uB85C\uC138\uC2A4 \uB2E8\uACC4\uAC00 2\uAC1C \uBBF8\uB9CC`),s.type==="diagram"){s.nodes=(s.nodes||[]).map((o,d)=>({...o,id:String(o.id??d+1),label:String(o.label??"")}));let r=new Set(s.nodes.map(o=>o.id));s.edges=(s.edges||[]).filter(o=>r.has(String(o.from))&&r.has(String(o.to))).map(o=>({...o,from:String(o.from),to:String(o.to)})),["flow","hub","layers","cycle","funnel"].includes(s.kind)||(s.kind="flow")}if(s.type==="matrix"){for(;(s.quadrants||(s.quadrants=[])).length<4;)s.quadrants.push({title:""});(s.points||[]).forEach(r=>{r.x=Math.max(6,Math.min(94,Number(r.x)||50)),r.y=Math.max(7,Math.min(93,Number(r.y)||50));let o=Number(r.size);r.size=o?o<12?24+o*4:Math.max(18,Math.min(72,o)):28})}s.type==="annotated-image"&&(s.hotspots||[]).forEach(r=>{r.x=Math.max(3,Math.min(97,Number(r.x)||50)),r.y=Math.max(3,Math.min(97,Number(r.y)||50))}),s.type==="mockup"&&(s.mock=s.mock||{app:"chat",steps:[]},["chat","browser","phone","dashboard"].includes(s.mock.app)||(s.mock.app="chat"),s.mock.steps=(s.mock.steps||[]).slice(0,8)),s.type==="custom"&&typeof s.html!="string"&&(s.html='<div class="callout">custom \uC2AC\uB77C\uC774\uB4DC \uB0B4\uC6A9 \uC5C6\uC74C</div>',e.push(`${i}: custom html \uC5C6\uC74C`)),a.notes&&typeof a.notes=="string"&&(a.notes={s:a.notes}),a.notes&&a.notes.t!=null&&(a.notes.t=Math.max(5,Math.min(900,Number(a.notes.t)||0)))}),{spec:n,warnings:e}}function ra(t){let n=[`\uC8FC\uC81C/\uC694\uCCAD: ${t.topic}`,t.purpose?`\uBAA9\uC801(purpose): ${t.purpose}`:"",t.audience?`\uCCAD\uC911: ${t.audience}`:"",t.durationMin?`\uBC1C\uD45C \uC2DC\uAC04: ${t.durationMin}\uBD84`:"",t.slideCount?`\uC694\uCCAD \uC7A5\uC218: ${t.slideCount}\uC7A5 (\uBC18\uB4DC\uC2DC \uC774 \uC7A5\uC218)`:"",t.tone?`\uD1A4: ${t.tone}`:"",t.theme?`\uD14C\uB9C8: ${t.theme}`:"",t.lang?`\uC5B8\uC5B4: ${t.lang}`:"\uC5B8\uC5B4: ko",t.presenter?`\uBC1C\uD45C\uC790: ${t.presenter.name}${t.presenter.org?" ("+t.presenter.org+")":""}`:"",t.event?`\uD589\uC0AC: ${t.event}`:"",t.date?`\uC77C\uC790: ${t.date}`:"",t.place?`\uC7A5\uC18C: ${t.place}`:"",t.extra?`\uCD94\uAC00 \uC9C0\uC2DC: ${t.extra}`:""].filter(Boolean).join(`
`);return t.materials&&(n+=`

[\uCC38\uACE0 \uC790\uB8CC \u2014 \uC0AC\uC2E4\xB7\uC218\uCE58\uB294 \uC5EC\uAE30\uC11C\uB9CC \uAC00\uC838\uC62C \uAC83]
${t.materials.slice(0,6e4)}`),n}async function F(t,e){e.onProgress?.({stage:"plan",msg:"\uB371 \uAD6C\uC870 \uC124\uACC4 \uC911"});let n=q+(e.premium?H:"")+w(e.rules||[],"plan"),a=await u(e.provider,{system:n,messages:[{role:"user",content:ra(t)+`

\uC704 \uBE0C\uB9AC\uD504\uB85C \uB371 \uD50C\uB79C JSON\uC744 \uC791\uC131\uD558\uB77C.`}],maxTokens:12e3,temperature:.5});e.log?.(`[plan] ${a.model} ${a.ms}ms`);let l=b(a.text);if(!l.slides?.length)throw new Error("plan has no slides");return l.slides.forEach((i,s)=>{i.id||(i.id="p"+String(s+1).padStart(2,"0"))}),l.sections=l.sections||[],t.theme&&(l.meta.theme=t.theme),t.brand&&(l.meta.brand=t.brand),t.presenter&&!l.meta.presenter&&(l.meta.presenter=t.presenter),t.slideCount&&l.slides.length!==t.slideCount&&e.log?.(`[plan] requested ${t.slideCount} got ${l.slides.length}`),l}async function X(t,e,n,a){let l=I+w(a.rules||[],"fill"),i=JSON.stringify({meta:e.meta,sections:e.sections,outline:e.slides.map(h=>({id:h.id,section:h.section,type:h.type,title:h.title}))}),s=e.slides.filter(h=>n.includes(h.id)),r=`${ra(t)}

[\uB371 \uD50C\uB79C \uC694\uC57D]
${i}

[\uC774\uBC88\uC5D0 \uC791\uC131\uD560 \uC7A5 \u2014 \uAC01 \uC7A5\uC758 \uC644\uC804\uD55C \uC2A4\uD399\uC744 \uC368\uB77C]
${JSON.stringify(s,null,1)}`,o=await u(a.provider,{system:l,messages:[{role:"user",content:r}],maxTokens:Math.min(16e3,2600*s.length+1500),temperature:.4});a.log?.(`[fill ${n.join(",")}] ${o.model} ${o.ms}ms`);let c=(b(o.text).slides||[]).filter(Boolean);return n.map(h=>{let g=c.find(m=>m.id===h);if(g)return g;let x=s.find(m=>m.id===h);return a.log?.(`[fill] missing ${h}, using fallback`),{id:h,section:x.section||void 0,title:x.title,sub:x.sub,notes:{t:x.t||40,s:x.intent||""},body:{type:"bullets-visual",bullets:(x.content_hints||[x.intent||x.title]).slice(0,5).map(m=>({title:m.slice(0,40)}))}}})}async function la(t,e,n){let a=n||await F(t,e),l=e.batchSize||3,i=e.concurrency||4,s={},r=a.slides.map(p=>p.id);if(e.premium){let p=a.slides.filter(E).map(v=>v.id);r=r.filter(v=>!p.includes(v));let k=0,y=0,f=e.richConcurrency||4;e.onProgress?.({stage:"rich",done:0,total:p.length});let S=async()=>{for(;y<p.length;){let v=p[y++],ha=a.slides.find(N=>N.id===v);try{s[v]=await O(t,a,ha,{...e,provider:e.richProvider||e.provider})}catch(N){e.log?.(`[rich] ${v} failed: ${N.message} \u2192 standard fill`),r.push(v)}k++,e.onProgress?.({stage:"rich",done:k,total:p.length})}};await Promise.all(Array.from({length:Math.min(f,p.length)},S)),r=a.slides.map(v=>v.id).filter(v=>r.includes(v))}let o=[];for(let p=0;p<r.length;p+=l)o.push(r.slice(p,p+l));let d=0;e.onProgress?.({stage:"fill",done:0,total:r.length});let c=0,h=async()=>{for(;c<o.length;){let p=o[c++];try{(await X(t,a,p,e)).forEach(y=>s[y.id]=y)}catch(k){e.log?.(`[fill] batch ${p.join(",")} failed: ${k.message}`),p.forEach(y=>{let f=a.slides.find(S=>S.id===y);s[y]={id:y,section:f.section||void 0,title:f.title,sub:f.sub,notes:{t:f.t||40,s:f.intent||""},body:{type:"bullets-visual",bullets:(f.content_hints||[f.title]).slice(0,5).map(S=>({title:S.slice(0,40)}))}}})}d+=p.length,e.onProgress?.({stage:"fill",done:d,total:r.length})}};await Promise.all(Array.from({length:Math.min(i,o.length)},h));let g=a.slides.map(p=>s[p.id]).filter(Boolean),x=new Set((a.sections||[]).map(p=>p.id));g.forEach(p=>{p.section&&!x.has(p.section)&&(p.section=void 0)});let m={meta:a.meta,sections:a.sections,slides:g},{spec:A,warnings:M}=R(m);return{spec:A,plan:a,warnings:M}}async function oa(t,e,n,a){let l=`[\uB371 \uBA54\uD0C0] ${JSON.stringify(a||{})}
[\uD604\uC7AC \uC2AC\uB77C\uC774\uB4DC \uC2A4\uD399]
${JSON.stringify(t,null,1)}

[\uC9C0\uC801 \uC0AC\uD56D]
${e.map(r=>`- ${r.sev||""} ${r.code||""} ${r.el||""} ${r.extra!=null?"("+r.extra+")":""} ${r.what||""} ${r.fix?"\u2192 "+r.fix:""}`).join(`
`)}

\uC218\uC815\uB41C \uC2AC\uB77C\uC774\uB4DC JSON\uB9CC \uCD9C\uB825.`,i=await u(n.provider,{system:j,messages:[{role:"user",content:l}],maxTokens:6e3,temperature:.3});n.log?.(`[fix ${t.id}] ${i.model} ${i.ms}ms`);let s=b(i.text);return!s||!s.body?t:(s.id=t.id,s)}async function da(t,e,n){let a=await u(n.provider,{system:_,messages:[{role:"user",content:[{type:"text",text:`\uC2AC\uB77C\uC774\uB4DC ${e.id} (${e.body.type}) "${e.title}" \uC2A4\uD06C\uB9B0\uC0F7\uC744 \uD3C9\uAC00\uD558\uB77C.`},{type:"image",mime:"image/jpeg",base64:t}]}],maxTokens:2e3,temperature:.2});return b(a.text)}async function ca(t,e,n){let a=`[\uAE30\uC874 \uADDC\uCE59]
${e.map(s=>`- (${s.scope}) ${s.text}`).join(`
`)||"(\uC5C6\uC74C)"}

[\uB204\uC801 \uD53C\uB4DC\uBC31]
${JSON.stringify(t).slice(0,6e4)}

\uC0C8 \uADDC\uCE59 JSON\uB9CC \uCD9C\uB825.`,l=await u(n.provider,{system:B,messages:[{role:"user",content:a}],maxTokens:3e3,temperature:.2});return(b(l.text).rules||[]).filter(s=>s&&s.text)}function W(t){let e=[];for(let n of t.slides){let a=n.body,l=(i,s,r,o)=>{!i||i.src||!(i.prompt||i.alt)||e.push({slide:n,ref:i,role:s,size:r,priority:o})};switch(a.type){case"cover":(a.visual==="photo"||a.visual==="art"||!a.visual)&&!a.image&&(a.image={prompt:`${t.meta.title||""} \u2014 \uC8FC\uC81C\uB97C \uC0C1\uC9D5\uD558\uB294 \uC7A5\uBA74`,alt:t.meta.title||""}),a.image&&l(a.image,a.visual==="photo"?"cover":"visual",a.visual==="photo"?"1536x1024":"1024x1024",0);break;case"image-hero":l(a.image,"hero","1536x1024",1);break;case"annotated-image":l(a.image,"annot","1536x1024",2);break;case"section":l(a.image,"section","1024x1024",3);break;case"quote":l(a.image,"quote","1024x1024",4);break;case"bullets-visual":a.visual?.kind==="image"&&l(a.visual.image,"visual","1024x1024",5);break;case"question":l(a.image,"visual","1536x1024",6);break}}return e.sort((n,a)=>n.priority-a.priority)}var Pa="\uC0AC\uC9C4\uCC98\uB7FC \uC0AC\uC2E4\uC801\uC778 \uACE0\uD574\uC0C1\uB3C4 \uC774\uBBF8\uC9C0, \uC2DC\uB124\uB9C8\uD2F1 \uC790\uC5F0\uAD11, \uAE4A\uC774\uAC10 \uC788\uB294 \uAD6C\uB3C4, \uCC28\uBD84\uD55C \uC0C9\uAC10. \uAE00\uC790\xB7\uC22B\uC790\xB7\uB85C\uACE0\xB7\uC6CC\uD130\uB9C8\uD06C\xB7\uB9D0\uD48D\uC120 \uC5C6\uC74C. \uC0AC\uB78C \uC5BC\uAD74\uC740 \uD074\uB85C\uC988\uC5C5\uD558\uC9C0 \uC54A\uC74C.",Oa={cover:"\uBC1C\uD45C \uD45C\uC9C0 \uBC30\uACBD\uC6A9. \uC67C\uCABD \uC544\uB798\uC5D0 \uAE00\uC790\uAC00 \uB193\uC774\uBBC0\uB85C \uC67C\uCABD\uC740 \uB2E8\uC21C\uD558\uACE0 \uC5B4\uB461\uAC8C, \uC2DC\uAC01\uC801 \uCD08\uC810\uC740 \uC624\uB978\uCABD.",hero:"\uD654\uBA74 \uC804\uCCB4\uB97C \uCC44\uC6B0\uB294 \uBC30\uACBD \uC0AC\uC9C4. \uC544\uB798\uCABD\uC5D0 \uAE00\uC790\uAC00 \uB193\uC774\uBBC0\uB85C \uC544\uB798 1/3\uC740 \uB2E8\uC21C\uD558\uAC8C.",annot:"\uC124\uBA85 \uD56B\uC2A4\uD31F\uC744 \uC62C\uB9B4 \uC7A5\uBA74 \uC0AC\uC9C4. \uC8FC\uC694 \uB300\uC0C1\uC774 \uC911\uC559\uC5D0 \uD06C\uAC8C, \uBC30\uACBD\uC740 \uB2E8\uC21C\uD558\uAC8C.",section:"\uC139\uC158 \uAC04\uC9C0 \uBCF4\uC870 \uC774\uBBF8\uC9C0. \uC0C1\uC9D5\uC801\uC774\uACE0 \uC5EC\uBC31\uC774 \uC788\uB294 \uAD6C\uB3C4.",quote:"\uC778\uC6A9 \uC7A5 \uBCF4\uC870 \uC774\uBBF8\uC9C0. \uBD84\uC704\uAE30 \uC911\uC2EC, \uC8FC\uC81C\uAC00 \uC740\uADFC\uD788 \uB4DC\uB7EC\uB098\uB294 \uC7A5\uBA74.",visual:"\uBCF8\uBB38 \uC606 \uBCF4\uC870 \uC774\uBBF8\uC9C0. \uC8FC\uC81C\uB97C \uC9C1\uAD00\uC801\uC73C\uB85C \uBCF4\uC5EC\uC8FC\uB294 \uC7A5\uBA74, \uC911\uC559 \uAD6C\uB3C4."};function G(t,e){let n=(t.ref.prompt||t.ref.alt||"").trim(),a=e.meta.title?`\uBC1C\uD45C \uC8FC\uC81C: ${e.meta.title}.`:"";return`${n}. ${Oa[t.role]} ${a} ${Pa}`.replace(/\s+/g," ").trim()}async function Ha(t,e,n,a){let l=(t.baseUrl||"https://api.openai.com/v1").replace(/\/$/,"")+"/images/generations",i={model:a.model||"openai/gpt-image-2",prompt:e,size:n,quality:a.quality||"low",output_format:"webp",output_compression:60,n:1},s=new AbortController,r=setTimeout(()=>s.abort(),a.timeoutMs||9e4);try{let o=await fetch(l,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${t.apiKey}`},body:JSON.stringify(i),signal:s.signal});if(!o.ok)throw new Error(`images ${o.status}: ${(await o.text()).slice(0,200)}`);let d=await o.json(),c=d.data?.[0];if(c?.b64_json)return`data:image/${d.output_format||"webp"};base64,${c.b64_json}`;if(c?.url)return c.url;throw new Error("images: empty result")}finally{clearTimeout(r)}}async function pa(t,e,n={}){let a=W(t).slice(0,n.max??4),l=[],i=0;return n.onProgress?.({done:0,total:a.length}),await Promise.all(a.map(async s=>{let r=G(s,t),o=Date.now();try{s.ref.src=await Ha(e,r,s.size,n),n.log?.(`[image ${s.slide.id}/${s.role}] ${Date.now()-o}ms ${(s.ref.src.length/1024).toFixed(0)}KB`)}catch(d){l.push(`${s.slide.id}: ${String(d?.message||d).slice(0,120)}`),n.log?.(`[image ${s.slide.id}] failed: ${d?.message}`)}i++,n.onProgress?.({done:i,total:a.length,slide:s.slide.id})})),{generated:a.length-l.length,failed:l}}return ua(Ra);})();
