# 움직이는 과학 수업

교과서 개념을 손으로 움직여 보며 배우는 인터랙티브 수업 슬라이드 모음. 차시마다 HTML 파일 하나이고, 전자칠판·노트북·태블릿·휴대폰 브라우저에서 바로 열린다.

- 첫 화면: `index.html` (단원·차시 목록)
- 차시: `<과목>/<단원>/<차시>/student.html`(학생용), `teacher.html`(교사용: 발표자 메모·발표자 화면), `slides.pdf`(장마다 마지막 단계까지 연 화면 모음, A4 가로)
- 목록 자료: `lessons.json` — 단원 빌드가 고쳐 쓴다. 첫 화면은 `node make-index.mjs`로 다시 만든다.

## 이 저장소에 올리는 것

- 빌드한 슬라이드와 목록만 올린다. 교과서·참고서 PDF, 학습지 원본, 쪽 사진은 올리지 않는다.
- 교과서·참고서 문장은 옮겨 쓰지 않고 다시 써서 넣는다. 교과서 쪽수와 그림 번호는 «미래엔 통합과학2 기준»으로 적고, 단원마다 성취기준 코드를 단다.
- 학생 개인정보는 없다(로그인·기록 없음).

## 수업방

교사용에서 «수업방 열기»를 누르면 Cloudflare 워커(`science-room.pang99x.workers.dev`)에 방이 생긴다. 참여 코드 네 자리와 QR로 학생이 들어오고, 선생님 화면만 가진 진행 열쇠로 넘김을 보낸다. 오가는 것은 장 번호와 방 상태뿐이고, 마지막 활동 뒤 세 시간이면 방이 닫힌다.

## 라이선스

수업자료(슬라이드의 글·그림·애니메이션)는 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ko). 출처를 밝히면 비영리 목적으로 고쳐 쓰고 나눌 수 있고, 고친 것도 같은 조건으로 나눈다.

슬라이드 안에 함께 묶인 도구는 각자의 라이선스를 따른다: reveal.js·reveal.js-plugins(MIT), GSAP(Webflow 무료 라이선스), Three.js(MIT), Manim Community(MIT, 표지 영상 렌더), 글꼴 Hahmlet·IBM Plex Sans KR·IBM Plex Mono·Nanum Pen Script(SIL OFL, Google Fonts).
