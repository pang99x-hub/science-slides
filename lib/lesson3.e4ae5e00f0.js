(function(){'use strict';const {part}=window.Deck;
const mark=(r,n)=>{L1.steps(r,n,n===0?[1,2,3]:[1,2,3].filter(x=>x<n));L1.done(r,n===0);};
const single=r=>r.querySelectorAll('.share-opts button').forEach(b=>b.addEventListener('click',()=>r.querySelectorAll('.share-opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))));
const watch=(r,fn)=>{let t;return{setActive(on){clearInterval(t);if(on){fn();t=setInterval(fn,250);}}};};
const gallery=r=>{r.querySelector('.gv').addEventListener('gv-pick',e=>r.querySelectorAll('.lv-row').forEach(x=>x.classList.toggle('on',x.dataset.k===e.detail.b.dataset.row)));return RxT.gallery(r);};
const join=(...ps)=>RxT.join(...ps);

part('cover',r=>{single(r);return GlacierWipe.mount(r)||{};});
part('change',r=>join(gallery(r),RxPeek.mount(r)));part('threatTheory',gallery);
part('threats',r=>{const m=EcoThreats.mount(r);let compared=false;r.querySelector('#hz-reset').addEventListener('click',()=>{if(r._hz.placed)compared=true;});return join(m,watch(r,()=>mark(r,!r._hz.placed?1:!compared?2:r._hz.placed<1?3:0)));});
part('conserve',r=>{const st=RxT.stepper(r);RxBet.mount(r,k=>k>=1);return st;});
part('corridor',r=>{const m=EcoCorridor.mount(r);let far=false,near=false;r.querySelector('.co-svg').addEventListener('pointerup',()=>{});return join(m,watch(r,()=>{if(r._co.x<300||r._co.x>800)far=true;if(Math.abs(r._co.x-720)<100)near=true;mark(r,!far?1:!near?2:0);}));});
part('greencity',r=>{const m=GreenCity.mount(r);return join(m,watch(r,()=>mark(r,r._gr.cover>=.999?0:r._gr.cover>.6?3:r._gr.cover>.2?2:1)));});

part('game3',r=>window.EcoGame.mount(r,{"id": "212-l3", "title": "위협 원인 가르기", "seconds": 40, "intro": "카드를 보고 근거를 찾아 고르자.<br>«게임 시작»을 누르자", "endSay": "헷갈린 카드는 근거를 붙여 다시 설명하자", "items": [{"q": "숲을 베어 공장 부지를 넓혔다.", "a": "h", "why": "생물이 살던 공간을 직접 없앴다."}, {"q": "생활 하수가 강으로 흘러들었다.", "a": "p", "why": "물의 조건을 나쁘게 하는 오염이 시작점이다."}, {"q": "어린 물고기까지 회복할 틈 없이 잡았다.", "a": "o", "why": "번식과 회복보다 과한 포획이다."}, {"q": "다른 지역에서 들여온 가시박이 번졌다.", "a": "i", "why": "외부에서 온 생물이 토종 식물을 덮을 수 있다."}, {"q": "매립으로 갯벌의 살 곳이 사라졌다.", "a": "h", "why": "생물이 이용하던 공간의 손실이다."}, {"q": "도로가 숲의 이동 길을 끊었다.", "a": "h", "why": "살 곳을 나누어 이동을 어렵게 했다."}, {"q": "공장 폐수가 물고기 서식지에 들어왔다.", "a": "p", "why": "유해한 물질이 물의 조건을 바꿨다."}, {"q": "쓰레기에서 유해한 성분이 흙에 스며들었다.", "a": "p", "why": "토양 조건을 악화시키는 오염이다."}, {"q": "번식할 개체가 모자랄 만큼 동물을 잡았다.", "a": "o", "why": "지나친 포획이 회복을 막는다."}, {"q": "희귀 식물을 번식할 틈 없이 캐 갔다.", "a": "o", "why": "동물을 잡는 것뿐 아니라 과도한 채집도 포함한다."}, {"q": "외부에서 온 동물이 토종 먹이를 빠르게 줄였다.", "a": "i", "why": "들어온 생물로 먹이 관계가 바뀌었다."}, {"q": "낯선 지역의 수생식물을 놓아 퍼지게 했다.", "a": "i", "why": "그곳에 없던 생물을 들여온 것이 출발점이다."}]}));
part('sum3',r=>RxT.sum(r));part('check3',r=>LessonParts.mountWrap(r));
})();
