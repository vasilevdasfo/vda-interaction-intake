// Pure turn adapter: no Telegram API, no tokens, no external effects.
import * as F from './flow.mjs';
export function prompt(s){
 if(s.stage==='route')return {text:'Чего вы хотите от общения? Выберите вариант или напишите своими словами.',choices:F.ROUTES.map(({id,label})=>({id,label}))};
 if(s.stage==='detail')return {text:'Какой формат ближе?',choices:F.DETAILS[s.route]};
 if(s.stage==='question'){const [text,hint]=F.currentQuestion(s);return {text,hint,choices:[]};}
 return {text:F.summary(s),choices:[{id:'edit',label:'Исправить'}],status:'draft'};
}
export function turn(s=F.initial(),input){
 let next=s;
 if(input.command==='back'||input.command==='edit')next=F.back(s);
 else if(input.command==='restart')next=F.initial();
 else if(s.stage==='route'){next=input.choice?F.selectRoute(input.choice):F.answer(F.selectRoute('free'),input.text);}
 else if(s.stage==='detail')next=F.selectDetail(s,input.choice);
 else if(s.stage==='question')next=F.answer(s,input.text);
 else throw Error('confirmation_requires_owner_transport');
 return {state:next,message:prompt(next)};
}
// Persist state and deduplicate chat/message IDs in the existing backend.
// Route delivery through an explicitly configured owner transport.
