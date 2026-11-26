/* =========================================================
   작업 모음 데이터 (뮤자인 지원용)
   - 원본 js/script.js 의 projectData 를 옮겨 왔다.
   - 회사 표기(T&J biz -> 티앤제이비즈), 기간, 끊긴 링크는
     노션 '작업내역' DB 를 기준으로 고쳤다.
   - 화면 그리는 코드(works.js)와 분리해 두어서,
     작업을 추가할 때는 이 파일만 고치면 된다.
   ========================================================= */

// 대표 작업: 겹친 카드 섹션에 들어가는 5개
const FEATURED = [
  {
    company: '마이패스',
    title: '독한공무원 반응형 리뉴얼',
    period: '2021.02 - 2021.06',
    lines: [
      'PC 화면만 있던 사이트에 모바일 화면을 더해 반응형으로 바꿨습니다.',
      '교수님 홈, 수강후기, Q&A 화면을 맡았고 CI 보드 뷰 파일에서 PHP, MySQL 작업도 함께 했습니다.'
    ],
    tech: ['HTML5/CSS3', 'jQuery', 'AJAX', '반응형', 'PHP', 'MySQL'],
    url: 'https://www.dokgong.com/',
    image: '../images/preview_main.png'
  },
  {
    company: '티앤제이비즈',
    title: '바른비즈 정책자금 랜딩페이지',
    period: '2026.04',
    lines: [
      '시안 디자인부터 퍼블리싱까지 혼자 맡았습니다.',
      '신청 폼 입력값을 jQuery로 검증하고, PHPMailer와 하이웍스 SMTP로 신청 메일이 발송되게 연결했습니다.'
    ],
    tech: ['Tailwind CSS v4', 'jQuery', 'PHP', 'AOS.js', 'WebP'],
    url: 'https://bareunbiz.co.kr/basic',
    image: '../images/bareunbiz_thumb.jpg'
  },
  {
    company: '티앤제이비즈',
    title: 'T&J AD 병원 마케팅 랜딩페이지',
    period: '2024.04 - 2024.05',
    lines: [
      '사내 디자이너의 시안을 받아 인터랙션을 붙여 퍼블리싱했습니다.',
      '병뚜껑 인트로 모션과 모바일 우선 레이아웃을 만들고, 신청 폼 내용을 DB에 저장했습니다.'
    ],
    tech: ['HTML5/CSS3', 'jQuery', 'Slick.js', 'AOS.js', 'CSS Keyframes'],
    url: 'https://tnjbiz1.mycafe24.com/intro/6811772779117/',
    image: '../images/preview_tnjad.png'
  },
  {
    company: '티앤제이비즈',
    title: '티앤제이비즈 홈페이지',
    period: '2025.04 - 2025.05',
    lines: [
      'XD로 시안을 만들고 반응형으로 퍼블리싱했습니다. 스크롤에 고정되는 타이틀, 지그재그 카드, 모바일 메뉴를 구현했습니다.',
      '공통 영역을 PHP 템플릿으로 나누고 문의 메일 발송과 카카오맵을 연결했습니다.'
    ],
    tech: ['Adobe XD', 'jQuery', 'Swiper', 'AOS.js', 'PHP', 'Kakao Maps API'],
    url: 'http://www.tnjbiz.co.kr/',
    image: '' // 썸네일 없음 -> 글자 카드로 표시
  },
  {
    company: '팀 프로젝트 (4인)',
    title: '과일 MBTI 테스트',
    period: '2022.11 - 2022.12',
    lines: [
      '친구들과 4명이 만든 사이드 프로젝트에서 프론트엔드를 맡았습니다.',
      'Figma를 쓰며 HTML, CSS, JavaScript로 화면을 만들었고, Git으로 커밋, 푸시하며 코드 리뷰를 주고받았습니다.'
    ],
    tech: ['HTML5/CSS3', 'JavaScript', 'Figma', 'Git'],
    url: 'https://fruitmbti.pages.dev/',
    image: ''
  }
];

// 전체 작업: 회사(key)별 묶음. sub 가 있으면 시리즈 작업
const ARCHIVE = [
  {
    key: 'tnj', company: '티앤제이비즈', title: '정책자금 랜딩페이지', role: '디자인, 퍼블리싱, 폼 검증', landing: true,
    sub: [
      { title: '사업자 맞춤 정책자금 컨설팅', period: '26.08.04 - 26.08.05', url: '../tnjbiz/9351789000033/' },
      { title: '초기비용으로 나도 사장님', period: '26.07.23 - 26.07.24', url: '../tnjbiz/9101784857017/' },
      { title: '2026년 하반기 정책자금', period: '26.07.06 - 26.07.07', url: '../tnjbiz/9111784864921/' },
      { title: '막막한 자금조달', period: '26.06.15 - 26.06.16', url: '../tnjbiz/9141785810064/' },
      { title: '기업 맞춤형 AI 정책자금', period: '26.04.07', url: '../tnjbiz/8861775540900/' },
      { title: '소상공인 정책자금 변형', period: '26.01.05 - 26.01.08', url: '../tnjbiz/8691767836995/' },
      { title: '정책자금 진단여부', period: '25.12.23 - 25.12.29', url: '../tnjbiz/8651766968312/' },
      { title: '소상공인 정책자금', period: '25.12.17 - 25.12.22', url: '../tnjbiz/8631766376733/' },
      { title: '정부 정책자금', period: '25.12.10 - 25.12.12', url: '../tnjbiz/8571765514911/' },
      { title: '정책자금 대출 A', period: '25.12.03 - 25.12.09', url: '../tnjbiz/8551765159065/' },
      { title: '정책자금 대출 B', period: '25.12.03 - 25.12.09', url: '../tnjbiz/8561765164738/' },
      { title: '사업자 정책자금 2', period: '24.09.25 - 24.09.27', url: '../tnjbiz/7391727316520/' },
      { title: '사업자 정책자금 1', period: '24.02.15 - 24.02.20', url: '../tnjbiz/6891708410582/' }
    ]
  },
  {
    key: 'tnj', company: '티앤제이비즈', title: '암보험 랜딩페이지', role: '디자인, 퍼블리싱', landing: true,
    sub: [
      { title: '피플 암보험', period: '26.03.09 - 26.03.10', url: '../tnjbiz/7121773033695/' },
      { title: '키움 암보험 특약 (3종)', period: '24.11.12 - 24.11.20', url: 'https://tnjtaboola.co.kr/intro/301731398476/' },
      { title: '암보험모아 3', period: '24.06.21', url: 'https://kiwoomdb.co.kr/intro/151718944836/' },
      { title: '삼성 내돈내삼', period: '24.06.17 - 24.06.19', url: 'https://kiwoomdb.co.kr/intro/91711093679/' },
      { title: '암보험모아 2', period: '24.05.13', url: 'https://kiwoomdb.co.kr/intro/131715584355/' },
      { title: '암보험모아 1', period: '24.05.07 - 24.05.10', url: 'https://kiwoomdb.co.kr/intro/121715311548/' },
      { title: '한화 암보험', period: '24.03.19 - 24.03.21', url: 'https://kiwoomdb.co.kr/intro/81710993753/' },
      { title: '롯데 88플러스', period: '24.03.13 - 24.03.18', url: 'https://kiwoomdb.co.kr/intro/61710740684' },
      { title: '삼성화재 56암', period: '24.03.11 - 24.03.22', url: 'https://tnjbiz1.mycafe24.com/intro/6541711093739/' },
      { title: '암보험 1억 피플라이프', period: '24.03.04 - 24.03.13', url: 'https://tnjtaboola.co.kr/intro/121710306671/' }
    ]
  },
  {
    key: 'tnj', company: '티앤제이비즈', title: '모모성형외과 랜딩페이지', role: '디자인, 퍼블리싱', landing: true,
    sub: [
      { title: '남성 모발이식 5', period: '25.09.02 - 25.09.03', url: '../tnjbiz/8001756872362/' },
      { title: '남성 모발이식 4', period: '25.09.02 - 25.09.03', url: '../tnjbiz/8011756872376/' },
      { title: '남성 모발이식 3', period: '25.09.02 - 25.09.03', url: '../tnjbiz/7991756872343/' },
      { title: '남성 모발이식 2', period: '25.08.29', url: '../tnjbiz/7961756361750/' },
      { title: '남성 모발이식 1', period: '25.08.21 - 25.08.25', url: 'https://tnjtaboola.co.kr/intro/451755584031/' }
    ]
  },
  {
    key: 'tnj', company: '티앤제이비즈', title: '상조 랜딩페이지', role: '디자인, 퍼블리싱', landing: true,
    sub: [
      { title: '상조 랜딩페이지 4', period: '24.06.07 - 24.06.11', url: 'https://thedbpro.co.kr/intro/6791718077783/' },
      { title: '상조 랜딩페이지 3', period: '24.05.28 - 24.06.05', url: 'https://thedbpro.co.kr/intro/6771716867573/' },
      { title: '상조 랜딩페이지 2', period: '24.05.16 - 24.05.17', url: 'https://thedbpro.co.kr/intro/6751715845637/' },
      { title: '상조 랜딩페이지 1', period: '24.02.20 - 24.02.29', url: 'https://thedbpro.co.kr/intro/6741715845618/' }
    ]
  },
  {
    key: 'tnj', company: '티앤제이비즈', title: '자사, 파트너 사이트', role: '구축, 유지보수, 번역',
    sub: [
      { title: '바른비즈 마케팅 원페이지', period: '26.06.10 - 26.06.15', url: '' }, // 퇴사 후 회사가 사이트를 바꿔 링크가 끊김
      { title: '바른비즈 정책자금 랜딩페이지', period: '26.04.06 - 26.04.29', url: 'https://bareunbiz.co.kr/basic' },
      { title: '티앤제이비즈 홈페이지', period: '25.04.23 - 25.05.27', url: 'http://www.tnjbiz.co.kr/' },
      { title: '한경비즈', period: '25.04.09 - 25.04.21', url: 'https://www.hankyungbiz.co.kr/' },
      { title: '티앤제이티 콘텐츠 개편, 번역 메뉴', period: '24.10.07 - 24.10.17', url: 'http://www.tnjt.co.kr/' },
      { title: 'T&J AD 병원 마케팅 랜딩페이지', period: '24.04.23 - 24.05.08', url: 'https://tnjbiz1.mycafe24.com/intro/6811772779117/' }
    ]
  },
  { key: 'mypass', company: '마이패스', title: '독한공무원 반응형 리뉴얼', role: '반응형 퍼블리싱, PHP', period: '21.02.22 - 21.06.03', url: 'https://www.dokgong.com/' },
  { key: 'mypass', company: '마이패스', title: '독한소방 교수님 소개 페이지', role: '퍼블리싱, 데이터 출력', period: '21.04.09 - 21.06.03', url: 'https://sobang.dokgong.com/professor' },
  { key: 'mypass', company: '마이패스', title: '웹테스트+ 온라인 모의고사', role: '응시 화면, 자동 채점, 결과표', period: '21.06.01 - 22.04.18', url: 'https://job.dokgong.com/webtest/sample' },
  { key: 'mypass', company: '마이패스', title: '교육 사이트 6곳 내 강의실 개편', role: '수강 기록, 수강확인증', period: '22.03.28 - 22.09.30', url: '', note: '로그인 후 사용 페이지' },
  { key: 'mypass', company: '마이패스', title: '대학 콘텐츠 솔루션 구축', role: '학교별 사이트, 관리자', period: '22.03.28 - 23.03.31', url: '', note: '로그인 후 사용 페이지' },
  { key: 'mypass', company: '마이패스', title: 'AWS S3 배너 업로드', role: '관리자 배너 관리', period: '22.06.30 - 22.08.05', url: '', note: '관리자 페이지' },
  { key: 'mypass', company: '마이패스', title: '결제, 환불 관리자와 알림톡', role: '토스페이먼츠 전환, 알림톡 연동', period: '22.07.25 - 22.09.06', url: '', note: '관리자 페이지' },
  { key: 'team', company: '팀 프로젝트', title: '과일 MBTI 테스트', role: '프론트엔드', period: '22.11.13 - 22.12.15', url: 'https://fruitmbti.pages.dev/' }
];
