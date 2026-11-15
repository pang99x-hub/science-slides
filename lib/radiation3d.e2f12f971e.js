/* #comp의 Orbit.make → 이름표 누르면 풀이 → 처음 시점 형식. */
(function(){'use strict';
 function mount(root){
 const stage=root.querySelector('.rad-stage'),cv=stage.querySelector('canvas'),cap=root.querySelector('.rad-cap');
 const s=Orbit.make(stage,cv,{view:{yaw:0,pitch:.16,dist:16,target:[0,0,0]},min:11,max:25,bg:'#e4eff6',click:e=>{const h=s.pick(e,targets);if(h)pick(h.object.userData.k);}});
 Orbit.chrome(stage,s);if(!s.ok)return s;
 const {T,scene}=s, targets=[],labels=[],G=new T.Group();scene.add(G);
 const sphere=new T.Mesh(new T.SphereGeometry(2.5,64,40),s.mat('#3788b9'));G.add(sphere);
 // 대륙 모양은 구면의 위치 관계를 위한 모식도.
 const landmat=s.mat('#75a454');
 [[-.7,.8,2.3,1.2,.55],[.8,-.7,2.3,.65,1.1],[-1.5,-.6,1.85,.65,.45],[.6,1.45,1.8,.8,.5]].forEach(([x,y,z,a,b])=>{const m=new T.Mesh(new T.SphereGeometry(.6,18,12),landmat);m.scale.set(a,b,.16);m.position.set(x,y,z);G.add(m);});
 const air=new T.Mesh(new T.SphereGeometry(2.85,48,32),new T.MeshStandardMaterial({color:'#aaccdf',transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false}));scene.add(air);
 const desc={sun:'태양 복사: 지표와 대기가 받아들이는 에너지의 근원.',up:'지표 복사: 따뜻한 지표가 적외선 복사를 내보낸다.',back:'대기 복사: 흡수한 뒤 여러 방향으로 내며 일부는 지표로 향한다.'};
 const pick=k=>{cap.textContent=desc[k];labels.forEach(x=>x.el.classList.toggle('o3-pick',x.k===k));};
 function arrow(k,a,b,c,name,at){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),ar=new T.ArrowHelper(d.clone().normalize(),av,d.length(),c,.45,.27);scene.add(ar);ar.line.userData.k=k;ar.cone.userData.k=k;targets.push(ar.line,ar.cone);const el=document.createElement('button');el.type='button';el.className='o3-lab rad-lab';el.textContent=name;el.style.borderColor=c;stage.append(el);s.label(el,new T.Vector3(...at));el.onclick=()=>pick(k);labels.push({el,k});return ar;}
 arrow('sun',[-5,3,0],[-2.1,1,0],'#f2b632','태양 복사',[-3.7,3.3,0]);
 arrow('up',[1.7,1.6,0],[4.4,4,0],'#d9483b','지표 → 우주',[3.4,4.7,0]);
 const ret=arrow('back',[3.2,.8,.7],[2,-.7,1.1],'#9b4794','대기 → 지표',[4.1,.8,1]);
 const out=arrow('back',[3.2,.8,.7],[5.3,1.8,.7],'#9b4794','대기 → 우주',[4.9,2.4,.7]);
 function set(v){air.visible=!!v;ret.visible=out.visible=!!v;labels.filter(x=>x.k==='back').forEach(x=>x.el.hidden=!v);root.querySelectorAll('.rad-show button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.k===v)));cap.textContent=v?'대기 있음: 지표로 돌아오는 복사가 있어 더 따뜻한 상태에서 평형을 이룬다.':'대기 없음: 지표가 낸 복사는 우주로 곧바로 향한다.';s.render();}
 root.querySelectorAll('.rad-show button').forEach(b=>b.onclick=()=>set(+b.dataset.k));set(0);root._rad={set,s,pick};return s;
 }window.Radiation3D={mount};
})();
