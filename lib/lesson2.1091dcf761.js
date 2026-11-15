(function(){'use strict'; const {part}=window.Deck; const join=(...m)=>RxT.join(...m);
 function cover(root,mod){ root.querySelectorAll('.share-opts button').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('.share-opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));return mod.mount(root); }
 function gal(root){root.querySelector('.gv').addEventListener('gv-pick',e=>root.querySelectorAll('.ab-row').forEach(x=>x.classList.toggle('on',x.dataset.k===e.detail.b.dataset.row)));return RxT.gallery(root);}
 function exp(root,mod){return ClimateUI.mount(root,mod);}
 part('cover',r=>cover(r,window.Aral));
part('circulation',r=>RxT.stepper(r));
part('dryland',gal);
part('nino',r=>join(Nino.mount(r),RxPeek.mount(r)));
part('globe',r=>exp(r,()=>window.Globe.mount(r)));
part('desert',r=>exp(r,()=>window.Desert.mount(r)));
part('lens',r=>exp(r,()=>window.Lens.mount(r)));
part('game2',r=>EcoGame.mount(r,{"id": "l2", "title": "엘니뇨·라니냐 빨리 가르기", "seconds": 40, "intro": "단서를 읽고 분류해 보자<br>게임 시작을 누르자", "endSay": "헷갈린 카드의 근거를 다시 말해 보자", "items": [{"q": "무역풍이 평소보다 약하다", "a": "nino", "why": "서쪽으로 물을 미는 힘이 약해진다."}, {"q": "동태평양의 용승이 강해졌다", "a": "nina", "why": "강한 바람으로 찬물이 더 올라온다."}, {"q": "동쪽 적도 바다가 평년보다 따뜻하다", "a": "nino", "why": "동쪽의 찬물 솟음이 약해졌다."}, {"q": "무역풍이 평소보다 강하다", "a": "nina", "why": "따뜻한 표층 물을 서쪽으로 더 민다."}, {"q": "동쪽 적도 수온이 평년보다 낮다", "a": "nina", "why": "강한 용승과 연결한다."}, {"q": "동쪽에 큰비, 서쪽에 가뭄 경향", "a": "nino", "why": "따뜻한 물과 비구름의 중심이 동쪽으로 옮겨간다."}]}));part('sum2',r=>RxT.sum(r));part('check2',r=>LessonParts.mountWrap(r));
})();