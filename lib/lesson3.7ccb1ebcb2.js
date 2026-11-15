(function(){'use strict'; const {part}=window.Deck; const join=(...m)=>RxT.join(...m);
 function cover(root,mod){ root.querySelectorAll('.share-opts button').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('.share-opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));return mod.mount(root); }
 function gal(root){root.querySelector('.gv').addEventListener('gv-pick',e=>root.querySelectorAll('.ab-row').forEach(x=>x.classList.toggle('on',x.dataset.k===e.detail.b.dataset.row)));return RxT.gallery(root);}
 function exp(root,mod){return ClimateUI.mount(root,mod);}
 part('cover',r=>cover(r,window.Coast));
part('future',r=>RxT.stepper(r));
part('impacts',gal);
part('response',gal);
part('korea',r=>exp(r,()=>window.Korea.mount(r)));
part('adapt',r=>exp(r,()=>window.Adapt.mount(r)));
part('draw',r=>exp(r,()=>window.Scenario.mount(r)));
part('news',r=>exp(r,()=>window.News.mount(r)));
part('game3',r=>EcoGame.mount(r,{"id": "l3", "title": "대처 방안 가르기", "seconds": 40, "intro": "단서를 읽고 분류해 보자<br>게임 시작을 누르자", "endSay": "헷갈린 카드의 근거를 다시 말해 보자", "items": [{"q": "석탄 발전을 풍력 발전으로 바꾸기", "a": "mit", "why": "발전 과정의 배출을 줄이려는 목적."}, {"q": "폭염 쉼터를 늘리기", "a": "ad", "why": "이미 오는 더위의 건강 피해를 줄인다."}, {"q": "이산화 탄소를 포집해 저장하기", "a": "mit", "why": "대기로 가는 탄소를 줄인다."}, {"q": "집중호우에 대비해 배수로 넓히기", "a": "ad", "why": "물 피해를 줄이도록 시설을 바꾼다."}, {"q": "대중교통으로 연료 사용 줄이기", "a": "mit", "why": "교통의 온실 기체 배출을 줄인다."}, {"q": "가뭄에 견디는 작물로 바꾸기", "a": "ad", "why": "물 부족 조건에 농업을 맞춘다."}, {"q": "산림의 탄소 흡수 기능 지키기", "a": "mit", "why": "공기에서 탄소를 거두는 기능을 보전한다."}, {"q": "침수 위험 지역의 대피 체계 만들기", "a": "ad", "why": "피해에 앞서 사람을 보호한다."}]}));part('sum3',r=>RxT.sum(r));part('check3',r=>LessonParts.mountWrap(r));
})();