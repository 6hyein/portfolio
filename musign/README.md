# musign / 뮤자인 지원용 포트폴리오

(주)뮤자인 웹퍼블리셔/프론트엔드 개발 공고(2026.11)에 맞춰 만든 폴더입니다.
저장소 루트의 기존 포트폴리오(index.html, js/script.js 등)는 건드리지 않았습니다.

## 파일

- `works.html` 작업 모음 페이지
- `css/works.css` 스타일
- `js/works-data.js` 작업, 배너 데이터 (작업을 추가할 때는 이 파일만 고치면 됨)
- `js/works.js` 화면 그리기와 애니메이션

## 사용한 것

- jQuery 3.7: 데이터로 화면 그리기, 필터, 복사 버튼
- GSAP 3.13 + ScrollTrigger: 스크롤 애니메이션

## 애니메이션 목록 (js/works.js 번호와 같음)

1. 스크롤 진행 바
2. 인트로: 글자를 쪼개 차례로 올리기, 숫자 세기, 스크롤하면 제목이 흐려짐
3. 대표 작업: PC에서 세로 스크롤을 가로 이동으로 바꾸기 (pin + scrub)
4. 전체 작업: 회사별 필터, 화면에 들어올 때 차례로 등장 (ScrollTrigger.batch)
5. 배너: 끝없이 흐르는 두 줄, 스크롤이 빠를수록 빨라짐 (getVelocity, timeScale)

움직임 줄이기 설정(prefers-reduced-motion)을 켠 사용자에게는 애니메이션 없이 내용만 보여 줍니다.
모바일(1024px 미만)에서는 가로 스크롤 대신 세로로 쌓인 카드가 하나씩 올라옵니다.

## 주소

https://6hyein.github.io/portfolio/musign/works.html
