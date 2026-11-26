/* =========================================================
   작업 데이터 (뮤자인 지원용)
   - 카드 46장과 상세 창에 들어가는 내용.
   - 설명(points)은 노션 '작업내역' 페이지에 정리한 내용에서 옮겼다.
   - 썸네일은 tools/capture.mjs 를 돌리면 images/works/아이디.jpg 로 저장되고,
     링크가 살아 있는지는 js/works-status.js 에 기록된다.
   - thumb: 캡처가 없을 때 대신 쓸 이미지 (레포에 이미 있는 것)
   - dead: true 면 링크 확인 결과와 상관없이 '링크 없음'으로 보여 준다
   ========================================================= */

// 같은 묶음(시리즈) 랜딩페이지들이 함께 쓰는 설명
const SERIES = {
  cpa: {
    role: 'Adobe XD 시안 디자인, 반응형 퍼블리싱, 신청 폼 검증',
    points: [
      '마케팅 부서가 준 레퍼런스와 방향을 바탕으로 Adobe XD 시안을 만들고, 확인받은 뒤 퍼블리싱했습니다.',
      '숫자 카운팅(animateNumber.js, IntersectionObserver), 후기 슬라이더(Slick.js), 스크롤 모션(AOS.js)을 페이지에 맞춰 넣었습니다.',
      '하단 고정 접이식 신청 폼과 이름, 전화번호 검증을 만들고, 공통 파일(reset, rem, 애니메이션 설정)을 재사용해 새 캠페인을 빠르게 만들었습니다.'
    ],
    tech: ['Adobe XD', 'Photoshop', 'HTML5/CSS3', 'jQuery', 'AOS.js', 'Slick.js', 'animateNumber.js']
  },
  momo: {
    role: '디자인, 퍼블리싱',
    points: ['모모성형외과 서울점 남성 모발이식 랜딩페이지 시리즈를 디자인하고 퍼블리싱했습니다.'],
    tech: []
  }
};

// 시리즈 묶음을 카드 여러 장으로 펼치는 함수 (아이디: 접두어-01, 접두어-02 ...)
function seriesCards(prefix, series, seriesName, company, cat, list) {
  return list.map(([title, period, url], i) => ({
    id: `${prefix}-${String(i + 1).padStart(2, '0')}`,
    company, cat, title, period, url, series, seriesName
  }));
}

const WORKS = [
  /* ---------- 대표 작업 (겹친 카드 맨 앞) ---------- */
  {
    id: 'dokgong', company: '마이패스', cat: 'mypass', featured: true,
    title: '독한공무원 반응형 리뉴얼', period: '2021.02 - 2021.06',
    url: 'https://www.dokgong.com/', thumb: '../images/preview_main.png',
    role: '반응형 화면 전담, CI 보드 뷰에서 PHP, MySQL 작업',
    points: [
      '1200px 고정 폭 사이트에 반응형을 입히고(메인 2주), 교수진 목록과 교수님 홈, 수강후기, Q&A를 운영 중에 차례로 바꿨습니다.',
      'PC는 표, 모바일은 목록인 수강후기를 같은 마크업과 미디어쿼리로 나눠 같은 데이터를 두 번 불러오지 않게 했습니다.',
      'CI 보드 뷰 파일에서 PHP, MySQL로 검색과 후기 등록(AJAX)을 처리했습니다.'
    ],
    tech: ['HTML5/CSS3', 'jQuery', 'AJAX', '반응형', 'PHP', 'MySQL']
  },
  {
    id: 'bareunbiz-landing', company: '티앤제이비즈', cat: 'tnj', featured: true,
    title: '바른비즈 정책자금 랜딩페이지', period: '2026.04',
    url: 'https://bareunbiz.co.kr/basic', thumb: '../images/bareunbiz_thumb.jpg',
    role: 'Adobe XD 시안, 반응형 마크업, 신청 폼 검증, 메일 발송 연동',
    points: [
      'Adobe XD 시안부터 Tailwind CSS v4 반응형 마크업까지 맡았습니다. (기획은 제외)',
      '이름 한글 검증, 전화번호 다음 칸 자동 이동, 행정구역 JSON을 fetch로 불러온 시/도, 구/군 선택을 만들었습니다.',
      'PHPMailer와 하이웍스 SMTP(465, SSL)로 신청 메일이 담당자에게 발송되게 연결했습니다.'
    ],
    tech: ['Adobe XD', 'Tailwind CSS v4', 'jQuery', 'Fetch API', 'PHP', 'PHPMailer', 'AOS.js', 'WebP']
  },
  {
    id: 'tnjad', company: '티앤제이비즈', cat: 'tnj', featured: true,
    title: 'T&J AD 병원 마케팅 랜딩페이지', period: '2024.04 - 2024.05',
    url: 'https://tnjbiz1.mycafe24.com/intro/6811772779117/', thumb: '../images/preview_tnjad.png',
    role: '사내 디자이너 시안 기반 인터랙션 퍼블리싱, 신청 폼 DB 저장',
    points: [
      '사내 디자이너의 시안을 받아 약 2주 동안 퍼블리싱했습니다.',
      '병뚜껑이 날아가고 물줄기가 솟는 인트로를 영상 없이 CSS 트랜지션과 상태 클래스로 구현했습니다.',
      '본문은 모바일 기준으로, PC에서는 오른쪽 여백에 SNS 채널을 두는 2열 레이아웃을 만들고 신청 값을 DB에 저장했습니다.'
    ],
    tech: ['HTML5/CSS3', 'jQuery', 'CSS Keyframes', 'Slick.js', 'AOS.js', 'animateNumber.js']
  },
  {
    id: 'tnjbiz-home', company: '티앤제이비즈', cat: 'tnj', featured: true,
    title: '티앤제이비즈 홈페이지', period: '2025.04 - 2025.05',
    url: 'http://www.tnjbiz.co.kr/',
    role: 'XD 시안 디자인, 반응형 퍼블리싱, PHP 공통 템플릿, 문의 메일, 카카오맵',
    points: [
      'XD 시안 2종을 만들고, 확정된 시안으로 약 1개월 동안 사이트를 다시 구축했습니다.',
      'PC는 왼쪽 타이틀이 고정된 채 카드가 지그재그로 올라오고, 모바일은 같은 내용을 Swiper 슬라이더로 보여 주게 나눴습니다.',
      'header, footer를 PHP include로 나누고 AJAX 문의 메일과 카카오맵을 연결했습니다.'
    ],
    tech: ['Adobe XD', 'jQuery', 'Swiper 11', 'AOS.js', 'PHP', 'AJAX', 'Kakao Maps API']
  },
  {
    id: 'fruit-mbti', company: '팀 프로젝트 (4인)', cat: 'team', featured: true,
    title: '과일 MBTI 테스트', period: '2022.11 - 2022.12',
    url: 'https://fruitmbti.pages.dev/', thumb: '../images/preview_mbti.png',
    role: '프론트엔드',
    points: [
      '친구들과 4명이 만든 사이드 프로젝트에서 프론트엔드를 맡았습니다.',
      'Figma를 쓰며 HTML, CSS, JavaScript로 화면을 만들고, Git으로 커밋, 푸시하며 코드 리뷰를 주고받았습니다.'
    ],
    tech: ['HTML5/CSS3', 'JavaScript', 'Figma', 'Git']
  },

  /* ---------- 마이패스 ---------- */
  {
    id: 'webtest', company: '마이패스', cat: 'mypass',
    title: '웹테스트+ 온라인 모의고사', period: '2021.06 - 2022.04',
    url: 'https://job.dokgong.com/webtest/sample', thumb: '../images/preview_webtest.png',
    role: '수험생 화면, 답안 저장, 채점 (프론트, 백엔드)',
    points: [
      '3인 팀에서 수험생 화면을 화면부터 PHP, MySQL까지 맡았습니다. (약 10개월)',
      '화면 설정 10가지, 원형 타이머, 스크롤을 따라오는 OMR, AJAX 답안 임시 저장을 만들었습니다.',
      '종이 OMR과 엑셀 채점에 1~2일 걸리던 성적 산출을 시험 종료 즉시로 바꿨습니다.'
    ],
    tech: ['jQuery', 'Chart.js', 'AJAX', '반응형', 'PHP', 'MySQL']
  },
  {
    id: 'sobang-professor', company: '마이패스', cat: 'mypass',
    title: '독한소방 교수님 소개 페이지', period: '2021.04 - 2021.06',
    url: 'https://sobang.dokgong.com/professor',
    role: '퍼블리싱, 데이터 출력',
    points: ['HTML, CSS, jQuery로 퍼블리싱하고 PHP, MySQL로 카테고리에 맞는 데이터를 출력했습니다.'],
    tech: ['HTML5/CSS3', 'jQuery', 'PHP', 'MySQL']
  },
  {
    id: 'lecture-room', company: '마이패스', cat: 'mypass',
    title: '교육 사이트 6곳 내 강의실 개편', period: '2022.03 - 2022.09',
    url: '', note: '로그인 후 사용하는 페이지',
    role: '수강 기록, 수강확인증 기능 (프론트, 백엔드)',
    points: [
      '실제 시청 시간 기록과 수강률 판정 로직을 새로 만들었습니다.',
      '수강 기록에 구매 번호를 연결해 재구매, 과목 중복으로 강의가 막히던 문제를 줄였습니다.',
      '수강생이 직접 발급하는 수강확인증과 영수증, 교재 배송 내역을 만들어 6개 사이트에 적용했습니다.'
    ],
    tech: ['jQuery', 'AJAX', 'Video.js', 'PHP', 'MySQL']
  },
  {
    id: 'univ-solution', company: '마이패스', cat: 'mypass',
    title: '대학 콘텐츠 솔루션 구축', period: '2022.03 - 2023.03',
    url: '', note: '로그인 후 사용하는 페이지',
    role: '기획서, XD 시안 기반 학생 화면과 학교별 관리자 구현',
    points: [
      '기획서와 사내 디자이너의 XD 시안을 받아 학교 코드 구조, 학생 화면, 학교별 관리자를 화면부터 PHP, MySQL까지 구현했습니다.',
      '학교 코드로 메뉴와 데이터를 나눠, 학교가 늘어도 등록만 하면 되게 했습니다.',
      '학습왕, 성적왕 순위 자동 집계를 만들고, 디자이너가 없던 때라 카드 디자인과 퍼블리싱도 맡았습니다.'
    ],
    tech: ['HTML5/CSS3', 'jQuery', 'PHP', 'MySQL']
  },
  {
    id: 'payment-alimtalk', company: '마이패스', cat: 'mypass',
    title: '결제, 환불 관리자와 알림톡', period: '2022.07 - 2022.09',
    url: '', note: '관리자 페이지',
    role: '결제 대행사 교체, 환불액 자동 계산, 알림톡 연동',
    points: [
      '결제 대행사를 이니시스에서 토스페이먼츠로 바꾸고, 이전 결제 기록도 함께 보이게 했습니다.',
      '환불 규정에 맞게 환불액이 자동 계산되게 고치고, 구글 시트로 하던 환불 기록을 관리자 페이지로 옮겼습니다.',
      '퍼플북 알림톡 템플릿을 만들고, 결제 시 구매자와 관리자에게 알림톡이 가게 연결했습니다.'
    ],
    tech: ['jQuery', 'AJAX', 'PHP', 'MySQL', '토스페이먼츠', '퍼플북']
  },
  {
    id: 's3-banner', company: '마이패스', cat: 'mypass',
    title: 'AWS S3 배너 업로드', period: '2022.06 - 2022.08',
    url: '', note: '관리자 페이지',
    role: '관리자 배너 S3 업로드, 6개 사이트 적용',
    points: [
      'AWS SDK for PHP 문서를 찾아가며 관리자 배너 업로드를 S3에 연결했습니다.',
      '관리자 페이지에서 따로 테스트한 뒤 실제 배너 등록에 붙여 6개 사이트에 적용했습니다.'
    ],
    tech: ['PHP', 'AWS S3', 'MySQL']
  },

  /* ---------- 티앤제이비즈 사이트 ---------- */
  {
    id: 'brbiz-marketing', company: '티앤제이비즈', cat: 'tnj',
    title: '바른비즈 마케팅 원페이지', period: '2026.06',
    url: 'http://brbiz.co.kr/', dead: true, thumb: '../images/bareunbiz_marketing_thumb.jpg',
    role: '기획, 디자인, 퍼블리싱, PHP 도메인 분기',
    points: [
      '기획, 디자인, 퍼블리싱을 맡아 약 1주 만에 오픈했습니다.',
      'PC는 fullPage.js 원페이지 스크롤, 모바일은 IntersectionObserver로 같은 애니메이션이 실행되게 나눴습니다.',
      '호스팅을 추가하지 않고 한 Cafe24 계정에서 두 도메인을 다른 사이트로 보여 주도록 PHP로 분기했습니다.'
    ],
    tech: ['PHP', 'fullPage.js', 'Slick.js', 'IntersectionObserver', 'SEO/OG']
  },
  {
    id: 'tnjt', company: '티앤제이비즈', cat: 'tnj',
    title: '티앤제이티 기업 사이트 개편, 8개 언어 메뉴', period: '2024.10',
    url: 'http://www.tnjt.co.kr/',
    role: '콘텐츠 수정, 구글 번역 연동, 국기 드롭다운 메뉴',
    points: [
      '오래된 기업 사이트의 사업, 제품 정보를 기존 마크업을 지키며 고쳤습니다.',
      '구글 번역 스크립트를 연동하고 8개 언어 국기 드롭다운 메뉴를 만들었습니다.',
      '번역 후 글자가 font 태그로 감싸져 언어 변경이 멈추던 문제를 부모 요소를 거슬러 올라가 찾는 방식으로 고쳤습니다.'
    ],
    tech: ['HTML5/CSS3', 'JavaScript', 'jQuery', 'Google Translate']
  },
  {
    id: 'hankyungbiz', company: '티앤제이비즈', cat: 'tnj',
    title: '한경비즈', period: '2025.04',
    url: 'https://www.hankyungbiz.co.kr/',
    role: '자사, 파트너 사이트 구축과 유지보수',
    points: [],
    tech: []
  },

  /* ---------- 랜딩페이지 시리즈 ---------- */
  ...seriesCards('policy', SERIES.cpa, '정책자금 랜딩페이지', '티앤제이비즈', 'tnj', [
    ['사업자 맞춤 정책자금 컨설팅', '2026.08', '../tnjbiz/9351789000033/'],
    ['초기비용으로 나도 사장님', '2026.07', '../tnjbiz/9101784857017/'],
    ['2026년 하반기 정책자금', '2026.07', '../tnjbiz/9111784864921/'],
    ['막막한 자금조달', '2026.06', '../tnjbiz/9141785810064/'],
    ['기업 맞춤형 AI 정책자금', '2026.04', '../tnjbiz/8861775540900/'],
    ['소상공인 정책자금 변형', '2026.01', '../tnjbiz/8691767836995/'],
    ['정책자금 진단여부', '2025.12', '../tnjbiz/8651766968312/'],
    ['소상공인 정책자금', '2025.12', '../tnjbiz/8631766376733/'],
    ['정부 정책자금', '2025.12', '../tnjbiz/8571765514911/'],
    ['정책자금 대출 A', '2025.12', '../tnjbiz/8551765159065/'],
    ['정책자금 대출 B', '2025.12', '../tnjbiz/8561765164738/'],
    ['사업자 정책자금 2', '2024.09', '../tnjbiz/7391727316520/'],
    ['사업자 정책자금 1', '2024.02', '../tnjbiz/6891708410582/']
  ]),
  ...seriesCards('cancer', SERIES.cpa, '암보험 랜딩페이지', '티앤제이비즈', 'tnj', [
    ['피플 암보험', '2026.03', '../tnjbiz/7121773033695/'],
    ['키움 암보험 특약 (3종)', '2024.11', 'https://tnjtaboola.co.kr/intro/301731398476/'],
    ['암보험모아 3', '2024.06', 'https://kiwoomdb.co.kr/intro/151718944836/'],
    ['삼성 내돈내삼', '2024.06', 'https://kiwoomdb.co.kr/intro/91711093679/'],
    ['암보험모아 2', '2024.05', 'https://kiwoomdb.co.kr/intro/131715584355/'],
    ['암보험모아 1', '2024.05', 'https://kiwoomdb.co.kr/intro/121715311548/'],
    ['한화 암보험', '2024.03', 'https://kiwoomdb.co.kr/intro/81710993753/'],
    ['롯데 88플러스', '2024.03', 'https://kiwoomdb.co.kr/intro/61710740684'],
    ['삼성화재 56암', '2024.03', 'https://tnjbiz1.mycafe24.com/intro/6541711093739/'],
    ['암보험 1억 피플라이프', '2024.03', 'https://tnjtaboola.co.kr/intro/121710306671/']
  ]),
  ...seriesCards('momo', SERIES.momo, '모모성형외과 랜딩페이지', '티앤제이비즈', 'tnj', [
    ['남성 모발이식 5', '2025.09', '../tnjbiz/8001756872362/'],
    ['남성 모발이식 4', '2025.09', '../tnjbiz/8011756872376/'],
    ['남성 모발이식 3', '2025.09', '../tnjbiz/7991756872343/'],
    ['남성 모발이식 2', '2025.08', '../tnjbiz/7961756361750/'],
    ['남성 모발이식 1', '2025.08', 'https://tnjtaboola.co.kr/intro/451755584031/']
  ]),
  ...seriesCards('sangjo', SERIES.cpa, '상조 랜딩페이지', '티앤제이비즈', 'tnj', [
    ['상조 랜딩페이지 4', '2024.06', 'https://thedbpro.co.kr/intro/6791718077783/'],
    ['상조 랜딩페이지 3', '2024.05', 'https://thedbpro.co.kr/intro/6771716867573/'],
    ['상조 랜딩페이지 2', '2024.05', 'https://thedbpro.co.kr/intro/6751715845637/'],
    ['상조 랜딩페이지 1', '2024.02', 'https://thedbpro.co.kr/intro/6741715845618/']
  ])
];

// Node(캡처 프로그램)에서도 이 파일을 읽을 수 있게
if (typeof module !== 'undefined') module.exports = { WORKS, SERIES };
