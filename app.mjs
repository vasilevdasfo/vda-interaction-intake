import * as F from './flow.mjs';
const $=id=>document.getElementById(id),view=$('view'),status=$('status');
let state=F.initial();
const owner=window.InteractionIntakeConfig?.owner||'Дмитрий';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 status.textContent='';
 $('progress').textContent=state.stage==='route'?'Начало':state.stage==='detail'?'Выбор формата':state.stage==='review'?'Проверка':'Вопрос '+(state.index+1)+' из 2';
 if(state.stage==='route')view.innerHTML=`<h1 id="question-title">С чем вы пришли?</h1><p>Выберите вариант или напишите своими словами.</p><div class="choices">${F.ROUTES.map(r=>`<button class="choice" data-route="${r.id}" type="button"><span class="mark" aria-hidden="true">${r.mark}</span><span><strong>${esc(r.label)}</strong><small>${esc(r.hint)}</small></span></button>`).join('')}</div><button class="text-action" id="free" type="button">Сразу написать своими словами</button>`;
 else if(state.stage==='detail')view.innerHTML=`<h1 id="question-title">Какой формат ближе?</h1><p>Выбрано: ${esc(F.label(state))}</p><div class="choices">${F.DETAILS[state.route].map(r=>`<button class="choice" data-detail="${r.id}" type="button"><strong>${esc(r.label)}</strong></button>`).join('')}</div><button class="text-action" id="back" type="button">Назад</button>`;
 else if(state.stage==='question'){const [q,hint]=F.currentQuestion(state);view.innerHTML=`<h1 id="question-title">${esc(q)}</h1><p class="hint">${esc(hint)}</p><form id="answer-form"><label for="answer">Ваш ответ</label><textarea id="answer" name="answer" maxlength="1200" required minlength="2">${esc(state.answers[state.index]||'')}</textarea><div class="actions"><button class="primary" type="submit">${state.index===0?'Далее':'Посмотреть черновик'}</button><button class="text-action" id="back" type="button">Назад</button></div></form>`;}
 else view.innerHTML=`<h1 id="question-title">Правильно вас поняли?</h1><p>Черновик готов. Он ещё не отправлен.</p><div class="review" id="summary">${esc(F.summary(state,{owner}))}</div><details><summary>Добавить срок или расширенный вариант — необязательно</summary><label for="extra">Если всё сложится, чего ещё вы ожидаете?</label><textarea id="extra" maxlength="1000">${esc(state.extra)}</textarea></details><div class="actions"><button class="primary" id="copy" type="button">Скопировать обращение</button><button class="secondary" id="download" type="button">Сохранить текст</button><button class="text-action" id="back" type="button">Исправить</button></div><p class="hint" style="margin-top:20px">Вставьте текст в ваше сообщение ${esc(owner==='Дмитрий'?'Дмитрию':owner)}. Условия следующего шага согласуются отдельно.</p>`;
 if(state.stage!=='route')$('question-title').setAttribute('tabindex','-1');
}
function transition(next){state=next;render();$('question-title').focus?.({preventScroll:true});}
view.addEventListener('click',async e=>{
 const r=e.target.closest('[data-route]'),d=e.target.closest('[data-detail]');
 if(r)transition(F.selectRoute(r.dataset.route));
 else if(d)transition(F.selectDetail(state,d.dataset.detail));
 else if(e.target.id==='free')transition(F.selectRoute('free'));
 else if(e.target.id==='back')transition(F.back(state));
 else if(e.target.id==='copy'){try{await navigator.clipboard.writeText(F.summary(state,{owner}));status.textContent='Скопировано. Отправьте текст в вашем сообщении.';}catch{status.textContent='Копирование недоступно. Выделите текст выше или сохраните его.';}}
 else if(e.target.id==='download'){const blob=new Blob([F.summary(state,{owner})],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-request.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Текст сохранён на вашем устройстве. Он не отправлен.';}
});
view.addEventListener('submit',e=>{e.preventDefault();try{transition(F.answer(state,$('answer').value));}catch{status.textContent='Опишите запрос хотя бы двумя символами, не более 1200.';}});
view.addEventListener('input',e=>{if(e.target.id==='extra'){state={...state,extra:e.target.value.slice(0,1000)};$('summary').textContent=F.summary(state,{owner});}});
// Mini App host adapter: no login or delivery claims; no trust in initDataUnsafe.
if(new URLSearchParams(location.search).get('surface')==='telegram'){
 const script=document.createElement('script');script.src='https://telegram.org/js/telegram-web-app.js';
 script.onload=()=>{const tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand();$('surface').textContent='Telegram Mini App · обращение пока копируется вручную';}};
 document.head.append(script);
}
render();
