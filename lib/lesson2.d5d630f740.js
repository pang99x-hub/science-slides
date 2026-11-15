(function(){'use strict';const {part}=window.Deck;
const mark=(r,n)=>{L1.steps(r,n,n===0?[1,2,3]:[1,2,3].filter(x=>x<n));L1.done(r,n===0);};
const single=r=>r.querySelectorAll('.share-opts button').forEach(b=>b.addEventListener('click',()=>r.querySelectorAll('.share-opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))));
const watch=(r,fn)=>{let t;return{setActive(on){clearInterval(t);if(on){fn();t=setInterval(fn,250);}}};};
const gallery=r=>{r.querySelector('.gv').addEventListener('gv-pick',e=>r.querySelectorAll('.lv-row').forEach(x=>x.classList.toggle('on',x.dataset.k===e.detail.b.dataset.row)));return RxT.gallery(r);};
const join=(...ps)=>RxT.join(...ps);

part('cover',r=>{single(r);return PredSketch.mount(r)||{};});
part('model',gallery);part('rules',gallery);
part('toss',r=>{const m=LidToss.mount(r);return join(m,watch(r,()=>mark(r,r._th.gen>=2?0:r._th.gen>=1?3:r._th.thrown>=3?2:1)));});
part('popsim',r=>{const m=PopSim.mount(r);let seen=false,pred=false,repeated=false; r.querySelector('#ps-pred').addEventListener('click',()=>pred=true);r.querySelector('#ps-seed').addEventListener('click',()=>{if(seen)repeated=true;});return join(m,watch(r,()=>{if(r._ps.gen>=40)seen=true;mark(r,!seen?1:!pred?2:!repeated?3:0);}));});
part('cycleTheory',r=>RxT.stepper(r));
part('cycle',r=>{const m=CycleDial.mount(r);return join(m,watch(r,()=>mark(r,r._cy.phase<.25?1:r._cy.phase<1?2:0)));});

part('game2',r=>window.EcoGame.mount(r,{"id": "212-l2", "title": "평형 회복 순서", "seconds": 40, "intro": "카드를 보고 근거를 찾아 고르자.<br>«게임 시작»을 누르자", "endSay": "헷갈린 카드는 근거를 붙여 다시 설명하자", "items": [{"q": "참새가 적어져 덜 잡아먹힌다. 다음은?", "a": "hi", "why": "덜 먹히는 메뚜기가 많아질 수 있다."}, {"q": "메뚜기가 많아 먹이가 넉넉하다. 다음은?", "a": "si", "why": "참새의 생존과 번식에 유리해진다."}, {"q": "많아진 참새가 사냥한다. 다음은?", "a": "hd", "why": "잡아먹히는 메뚜기가 줄어든다."}, {"q": "메뚜기가 적어 먹이가 모자란다. 다음은?", "a": "sd", "why": "먹이가 모자라 참새의 생존·번식이 어려워진다."}, {"q": "포식이 약해졌다. 먼저 일어날 변화는?", "a": "hi", "why": "먹히는 쪽이 덜 잡히므로 늘 수 있다."}, {"q": "피식자가 먼저 늘었다. 뒤따를 변화는?", "a": "si", "why": "먹이가 늘어난 뒤 참새가 늘 수 있다."}, {"q": "포식자가 늘어 먹이를 더 잡는다. 다음은?", "a": "hd", "why": "많이 잡히는 메뚜기의 감소가 뒤따른다."}, {"q": "포식자의 먹이가 줄었다. 다음은?", "a": "sd", "why": "참새가 유지되기 어려워진다."}, {"q": "참새가 줄어든 뒤 고리가 다시 시작된다. 다음은?", "a": "hi", "why": "메뚜기가 덜 먹혀 다시 늘 수 있다."}, {"q": "사냥이 줄어 클립이 더 살아남는다. 다음은?", "a": "hi", "why": "이 모형에서 클립은 메뚜기를 뜻한다."}, {"q": "살아남아 번식하는 뚜껑이 많아진다. 다음은?", "a": "si", "why": "뚜껑은 참새의 개체를 대신한다."}, {"q": "살아남을 먹이를 못 얻은 뚜껑이 많다. 다음은?", "a": "sd", "why": "참새가 적어지는 방향이다."}]}));
part('sum2',r=>RxT.sum(r));part('check2',r=>LessonParts.mountWrap(r));
})();
