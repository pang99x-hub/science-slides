(function(){'use strict'; const {part}=window.Deck; const join=(...m)=>RxT.join(...m);
 function cover(root,mod){ root.querySelectorAll('.share-opts button').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('.share-opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));return mod.mount(root); }
 function gal(root){root.querySelector('.gv').addEventListener('gv-pick',e=>root.querySelectorAll('.ab-row').forEach(x=>x.classList.toggle('on',x.dataset.k===e.detail.b.dataset.row)));return RxT.gallery(root);}
 function exp(root,mod){return ClimateUI.mount(root,mod);}
 part('cover',r=>cover(r,window.SeaIce));
part('warming',r=>join(RxT.stepper(r),RxPeek.mount(r)));
part('balance',r=>RxT.stepper(r));
part('radiation',r=>Radiation3D.mount(r));
part('ghouse',r=>exp(r,()=>window.GreenHouse.mount(r)));
part('trend',r=>exp(r,()=>window.Trend.mount(r)));
part('hbal',r=>exp(r,()=>window.Budget.audit(r)));
part('hvar',r=>exp(r,()=>window.Budget.valve(r)));
part('game1',r=>EcoGame.mount(r,{"id": "l1", "title": "온실 기체 고르기", "seconds": 40, "intro": "단서를 읽고 분류해 보자<br>게임 시작을 누르자", "endSay": "헷갈린 카드의 근거를 다시 말해 보자", "items": [{"q": "이산화 탄소", "a": "yes", "why": "지표의 적외선 복사를 흡수한다."}, {"q": "수증기", "a": "yes", "why": "자연적 온실 효과에서 중요한 기체."}, {"q": "메테인", "a": "yes", "why": "온실 효과에 기여하는 기체."}, {"q": "오존", "a": "yes", "why": "적외선을 흡수하는 온실 기체."}, {"q": "질소", "a": "no", "why": "대기에 많아도 주요 온실 기체로 분류하지 않는다."}, {"q": "산소", "a": "no", "why": "질소와 함께 공기의 큰 몫이지만 주요 온실 기체는 아니다."}]}));part('sum1',r=>RxT.sum(r));part('check1',r=>LessonParts.mountWrap(r));
})();