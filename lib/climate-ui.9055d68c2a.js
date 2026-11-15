/* 체험 진도는 누른 횟수 대신 관찰한 상태·완료 결과로 읽는다. */
(function(){'use strict';
 function mount(root,build){
 const mod=build()||{},seen=new Set();let timer=0;
 function update(){let n=1;const k=root.id;
 if(k==='ghouse'){const d=root._ghProgress||{};if(d.nitrogen)seen.add('nitrogen');if(d.greenhouse)seen.add('gas');n=!seen.has('nitrogen')?1:!seen.has('gas')?2:d.returned?0:3;}
 else if(k==='trend'){const d=root._trState||{};n=!d.moved?1:!d.avg?2:0;}
 else if(k==='hbal'){const d=root.querySelectorAll('.hb-tab td.on').length;n=d===6?0:d>=2?3:root.querySelector('.hb-reg').textContent.includes('장부')?2:1;}
 else if(k==='hvar'){const now=root.querySelector('.hv-now');if(root._hv&&Math.abs(root._hv.state.f-132/144)>.0001)seen.add('moved');n=!seen.has('moved')?1:now&&now.classList.contains('done')?0:3;}
 else if(k==='globe'){const lat=+(root.dataset.latitude||0);if(lat<6)seen.add('eq');if(lat>=25&&lat<=34)seen.add('dry');if(lat>=36&&lat<=44)seen.add('cold');n=!seen.has('eq')?1:!seen.has('dry')?2:!seen.has('cold')?3:0;}
 else if(k==='desert'){const d=root._dsState||{};if(d.used)seen.add('used');if(d.des>.4)seen.add('bare');n=!seen.has('used')?1:!seen.has('bare')?2:d.restoring?0:3;}
 else if(k==='lens'){const d=root._lensSeen||[];if(d.some(t=>t.includes('인도네시아')))seen.add('west');if(d.some(t=>t.includes('페루')||t.includes('동태평양')))seen.add('east');n=!seen.has('west')?1:!seen.has('east')?2:d.length>=3?0:3;}
 else if(k==='korea'){const t=+root.querySelector('#kr-t').value;n=t<20?1:t<35?2:0;}
 else if(k==='adapt'){const d=root._adState||{};if(d.mit<.5&&d.ad>.6)seen.add('mit');if(d.ad<.5&&d.mit>.6)seen.add('ad');n=!seen.has('mit')?1:!seen.has('ad')?2:d.mit<.5&&d.ad<.5?0:3;}
 else if(k==='draw'){const d=root._scProgress||{};if(d.high)seen.add('high');if(d.low)seen.add('low');n=!seen.has('high')?1:!seen.has('low')?2:0;}
 else if(k==='news'){const ok=root.querySelector('.nw-now').classList.contains('done');root.classList.toggle('news-ready',ok);const draft=root.querySelector('textarea').value.trim();n=!ok?2:draft.length<12?3:0;}
 L1.steps(root,n,n===0?[1,2,3]:[1,2,3].filter(x=>x<n));L1.done(root,n===0);
 }
 root.addEventListener('input',update);root.addEventListener('click',()=>queueMicrotask(update));update();
 return {setActive(on){mod.setActive&&mod.setActive(on);clearInterval(timer);if(on){update();timer=setInterval(update,250);}},fit(){mod.fit&&mod.fit();},fragment(f,on){mod.fragment&&mod.fragment(f,on);}};
 }window.ClimateUI={mount};
})();
