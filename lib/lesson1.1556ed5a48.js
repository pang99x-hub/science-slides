(function(){'use strict';const {part}=window.Deck;
const mark=(r,n)=>{L1.steps(r,n,n===0?[1,2,3]:[1,2,3].filter(x=>x<n));L1.done(r,n===0);};
const single=r=>r.querySelectorAll('.share-opts button').forEach(b=>b.addEventListener('click',()=>r.querySelectorAll('.share-opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))));
const watch=(r,fn)=>{let t;return{setActive(on){clearInterval(t);if(on){fn();t=setInterval(fn,250);}}};};
const gallery=r=>{r.querySelector('.gv').addEventListener('gv-pick',e=>r.querySelectorAll('.lv-row').forEach(x=>x.classList.toggle('on',x.dataset.k===e.detail.b.dataset.row)));return RxT.gallery(r);};
const join=(...ps)=>RxT.join(...ps);

part('cover',r=>{single(r);return SparrowField.mount(r);});
part('web',r=>EcoWeb3D.mount(r));
part('pyramid',r=>EcoPyr3D.mount(r));
part('recover',r=>RxT.stepper(r));
part('foodweb',r=>{const m=FoodWeb.mount(r);return join(m,watch(r,()=>mark(r,r._fw.n<1?1:r._fw.n<2?2:r.querySelector('#fw-mode').getAttribute('aria-pressed')==='true'?0:3)));});
part('balance',r=>{const m=EcoBalance.mount(r);let small=false,gone=false,back=false;r.querySelector('#bl-back').addEventListener('click',()=>back=true);return join(m,watch(r,()=>{if(r._bl.extinct)gone=true;if(r._bl.v[2]>.05&&r._bl.v[2]<.9&&!gone)small=true;mark(r,!small?1:!gone?2:!back?3:0);}));});
part('kaibab',r=>{const m=Kaibab.mount(r);return join(m,watch(r,()=>{const y=+r.querySelector('#kb-year').value;mark(r,y<1918?1:y<1929?2:0);}));});

part('game1',r=>window.EcoGame.mount(r,{"id": "212-l1", "title": "영양 단계 빨리 고르기", "seconds": 40, "intro": "카드를 보고 근거를 찾아 고르자.<br>«게임 시작»을 누르자", "endSay": "헷갈린 카드는 근거를 붙여 다시 설명하자", "items": [{"q": "벼 → 메뚜기: 메뚜기는?", "a": "c1", "why": "벼는 생산자. 그 벼를 바로 먹은 첫 소비 단계다."}, {"q": "벼 → 메뚜기 → 참새: 참새는?", "a": "c2", "why": "메뚜기는 첫 소비 단계, 이를 먹은 참새는 그다음이다."}, {"q": "벼의 이삭을 먹은 참새", "a": "c1", "why": "참새가 생산자의 양분을 바로 먹었다."}, {"q": "강아지풀 → 쥐: 쥐는?", "a": "c1", "why": "생산자인 풀을 직접 먹었다."}, {"q": "풀 → 메뚜기 → 개구리: 개구리는?", "a": "c2", "why": "첫 소비자인 곤충을 잡아먹는 차례다."}, {"q": "풀 → 메뚜기 → 개구리 → 뱀: 뱀은?", "a": "c3", "why": "생산자 다음으로 세 번째 소비 단계다."}, {"q": "광합성으로 양분을 만든 벼", "a": "p", "why": "스스로 양분을 만들어 먹이 길을 시작한다."}, {"q": "광합성하는 강아지풀", "a": "p", "why": "잎이 빛을 받아 양분을 만든다."}, {"q": "풀 → 토끼 → 매: 매는?", "a": "c2", "why": "토끼가 첫 소비 단계이므로 그 토끼를 먹은 매는 두 번째다."}, {"q": "풀 → 쥐 → 뱀: 뱀은?", "a": "c2", "why": "같은 뱀도 먹이 경로에 따라 단계가 다르다."}, {"q": "벼 → 메뚜기 → 참새 → 매: 매는?", "a": "c3", "why": "그 경로에서 세 번째로 다른 생물을 먹는다."}, {"q": "풀 → 쥐 → 뱀 → 올빼미: 올빼미는?", "a": "c3", "why": "쥐, 뱀 다음에 오는 세 번째 소비 단계다."}]}));
part('sum1',r=>RxT.sum(r));part('check1',r=>LessonParts.mountWrap(r));
})();
