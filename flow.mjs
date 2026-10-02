export const VERSION='1.0.0';
export const ROUTES=[
 {id:'help',label:'Нужна помощь',hint:'Совет, поддержка или работа',mark:'↗'},
 {id:'contact',label:'Нужен контакт',hint:'Кого ищете и для чего',mark:'◎'},
 {id:'partner',label:'Хочу сотрудничать',hint:'Совместный шаг или предложение',mark:'⇄'},
 {id:'feedback',label:'Есть идея / замечание',hint:'Критика, пожелание, улучшение',mark:'+'},
 {id:'existing',label:'Уже договорились',hint:'Продолжить принятое обязательство',mark:'✓'}
];
export const DETAILS={help:[{id:'support',label:'Помощь'},{id:'advice',label:'Совет'},{id:'work',label:'Работа'}],feedback:[{id:'criticism',label:'Критика'},{id:'wish',label:'Пожелание'},{id:'solution',label:'Предлагаю решение'}]};
const questions={
 help:[['Что происходит и что нужно от меня?','Например: помогите разобраться с одним вопросом.'],['Какой небольшой результат уже поможет?','Например: понять, с чего начать.']],
 contact:[['Кого ищете и для какой задачи?','Например: разработчика бота для записи клиентов.'],['Что нужно: направление поиска, контакт или знакомство?','Например: познакомить с подходящим исполнителем.']],
 partner:[['Что предлагаете и кому это поможет?','Например: вместе проверить идею полезного сервиса.'],['Что даёт каждый и с какого шага начнём?','Например: я подготовлю пример, от вас нужен разбор.']],
 feedback:[['Что хотите улучшить? Покажите пример.','Например: на телефоне трудно найти нужный раздел.'],['Какой результат или поправку предлагаете?','Например: оставить три понятные кнопки.']],
 existing:[['О чём договорились и какой срок?','Например: письменный разбор одной страницы к пятнице.'],['Какой шаг сейчас нужен?','Например: уточнить статус обещанного результата.']],
 free:[['Что хотите сказать или получить?','Можно своими словами, без выбора категории.'],['Какой небольшой результат уже поможет?','Если не знаете, так и напишите.']]
};
export function initial(){return {version:VERSION,route:null,detail:null,stage:'route',index:0,answers:[],extra:''};}
export function selectRoute(id){if(!questions[id])throw Error('unknown_route');const s=initial();return {...s,route:id,stage:DETAILS[id]?'detail':'question'};}
export function selectDetail(s,id){if(!DETAILS[s.route]?.some(x=>x.id===id))throw Error('unknown_detail');return {...s,detail:id,stage:'question',answers:[],index:0,extra:''};}
export function currentQuestion(s){return questions[s.route]?.[s.index]||null;}
export function answer(s,text){if(s.stage!=='question')throw Error('not_question');const t=String(text).trim();if(t.length<2||t.length>1200)throw Error('answer_length');const answers=s.answers.slice(0,s.index);answers.push(t);return {...s,answers,index:s.index+1,stage:s.index+1===questions[s.route].length?'review':'question',extra:''};}
export function back(s){if(s.stage==='review')return {...s,stage:'question',index:questions[s.route].length-1,extra:''};if(s.stage==='question'&&s.index>0)return {...s,index:s.index-1};if(s.stage==='question'&&DETAILS[s.route])return {...s,stage:'detail',answers:[],index:0,detail:null,extra:''};return initial();}
export function label(s){const route=ROUTES.find(x=>x.id===s.route)?.label||'Свободное обращение';const detail=DETAILS[s.route]?.find(x=>x.id===s.detail)?.label;return route+(detail?' · '+detail:'');}
export function summary(s,{owner='Дмитрий'}={}){if(s.stage!=='review')throw Error('not_ready');return [`Кому: ${owner}`,`Формат: ${label(s)}`,...s.answers.map((a,i)=>`${questions[s.route][i][0]}\n${a}`),s.extra?`Если всё сложится / дополнительные условия:\n${s.extra}`:'','Получение обращения не означает согласия выполнить работу.'].filter(Boolean).join('\n\n');}
export function record(s){if(s.stage!=='review')throw Error('not_ready');return {schema:'interaction-intake/1',version:VERSION,route:s.route,detail:s.detail,answers:[...s.answers],extra:s.extra,status:'draft'};}
