document.addEventListener('DOMContentLoaded', () => {
            
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('block');
                c.classList.add('hidden');
            });

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            targetContent.classList.remove('hidden');
            targetContent.classList.add('block');
        });
    });


    const expBtns = document.querySelectorAll('.exp-btn');
    const expDetails = document.querySelectorAll('.exp-detail');

    expBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            expBtns.forEach(b => b.classList.remove('active', 'border-l-4', 'border-b45309', 'bg-fef3c7'));
            
            btn.classList.add('active');

            expDetails.forEach(d => {
                d.classList.remove('block');
                d.classList.add('hidden');
            });

            const targetId = btn.getAttribute('data-target');
            const targetDetail = document.getElementById(targetId);
            targetDetail.classList.remove('hidden');
            targetDetail.classList.add('block');
        });
    });


    const ctx = document.getElementById('skillsChart').getContext('2d');
    const skillsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Frontend', 'Backend', 'Design', 'Tools & DevOps'],
            datasets: [{
                label: 'Skill Level',
                data: [95, 65, 85, 75], 
                backgroundColor: 'rgba(180, 83, 9, 0.2)', 
                borderColor: 'rgba(180, 83, 9, 1)', 
                pointBackgroundColor: 'rgba(180, 83, 9, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(180, 83, 9, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    pointLabels: {
                        font: { size: 14, family: "'Noto Sans KR', sans-serif", weight: 'bold' },
                        color: '#292524'
                    },
                    suggestedMin : 50,
                    suggestedMax : 100,
                    ticks :{
                        stepSize : 10
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '역량 평가: ' + context.raw + '/100';
                        }
                    }
                }
            }
        }
    });

    // 1. 데이터
    const projectData = [                
        {
            category: 't&j biz', title: '정책자금 대출 랜딩(8)', desc: '소상공인 및 정부 정책자금 진단/대출 랜딩', detail: '디자인 & 퍼블리싱',
            subList: [
                { title: '소상공인 정책자금 변형', period: '26.01.05~26.01.08', url:'https://www.ins-leaders.co.kr/intro/8691767836995/' },
                { title: '정책자금 진단여부', period: '25.12.23~25.12.29', url:'https://www.ins-leaders.co.kr/intro/8651766968312/' },
                { title: '소상공인 정책자금', period: '25.12.17~25.12.22', url:'http://ins-leaders.co.kr/intro/8631766376733/' },
                { title: '정부 정책자금', period: '25.12.10~25.12.12', url:'http://ins-leaders.co.kr/intro/8571765514911/' },
                { title: '정책자금 대출', period: '25.12.03~25.12.09', url:'http://ins-leaders.co.kr/intro/8551765159065/' },
                { title: '정책자금 대출', period: '25.12.03~25.12.09', url:'http://ins-leaders.co.kr/intro/8561765164738/' },
                { title: '사업자정책자금', period: '24.09.25~24.09.27', url:'http://ins-leaders.co.kr/intro/7391727316520/' },
                { title: '사업자정책자금', period: '24.02.15~24.02.20', url:'http://ins-leaders.co.kr/intro/6891708410582/' },
            ]
        },
        {
            category: 't&j biz', title: '자사, 파트너 사이트(4)', desc: '자사 랜딩/사이트 구축, 유지보수, 수정, 번역', detail: '시스템 관리',
            subList: [
                { title: 'T&J biz 홈페이지', period: '24.04.11~25.05.27', url:'http://www.tnjbiz.co.kr/' },
                { title: 'T&J AD 랜딩페이지', period: '24.04.23~24.05.08', url:'https://tnjbiz1.co.kr/intro/6811772779117/' },
                { title: '한경비즈', period: '25.04.09~25.04.21', url:'https://www.hankyungbiz.co.kr/' },
                { title: 'T&JT 사이트 수정/번역', period: '24.10.07~24.10.17', url:'http://www.tnjt.co.kr/' },
            ]
        },
        {
            category: 't&j biz', title: '모모성형외과 랜딩(5)', desc: '서울점 남성모발이식 랜딩페이지 시리즈 제작', detail: '디자인 & 퍼블리싱',
            subList: [
                { title: '남성모발이식5', period: '25.09.02~25.09.03', url:'http://ins-leaders.co.kr/intro/8001756872362/' },
                { title: '남성모발이식4', period: '25.09.02~25.09.03', url:'http://ins-leaders.co.kr/intro/8011756872376/' },
                { title: '남성모발이식3', period: '25.09.02~25.09.03', url:'http://ins-leaders.co.kr/intro/7991756872343/' },
                { title: '남성모발이식2', period: '25.08.29~25.08.29', url:'http://ins-leaders.co.kr/intro/7961756361750/' },
                { title: '남성모발이식1', period: '25.08.21~25.08.25', url:'https://tnjtaboola.co.kr/intro/451755584031/' },
            ]
        },
        { 
            category: 't&j biz', title: '암보험 랜딩 페이지(10)', desc: '암 광고 랜딩페이지', detail: '디자인 & 퍼블리싱',
            subList: [
                { title: '피플 암보험', period: '26.03.09~26.03.10', url:'https://thedbpro.co.kr/intro/7121773033695/' },
                { title: '키움암보험특약(3)', period: '24.11.12~24.11.20', url:'https://tnjtaboola.co.kr/intro/301731398476/' },
                { title: '암보험모아3', period: '24.06.21~24.06.21', url:'https://kiwoomdb.co.kr/intro/151718944836/' },
                { title: '삼성 내돈내삼', period: '24.06.17~24.06.19', url:'https://kiwoomdb.co.kr/intro/91711093679/' },
                { title: '암보험모아2', period: '24.05.13~24.05.13', url:'https://kiwoomdb.co.kr/intro/131715584355/' },
                { title: '암보험모아1', period: '24.05.07~24.05.10', url:'https://kiwoomdb.co.kr/intro/121715311548/' },
                { title: '한화 암보험', period: '24.03.19~24.03.21', url:'https://kiwoomdb.co.kr/intro/81710993753/' },
                { title: '롯데88플러스', period: '24.03.13~24.03.18', url:'https://kiwoomdb.co.kr/intro/61710740684' },
                { title: '삼성화재56암', period: '24.03.11~24.03.22', url:'https://tnjbiz1.co.kr/intro/6541711093739/' },
                { title: '암보험1억-피플라이프', period: '24.03.04~24.03.13', url:'https://tnjtaboola.co.kr/intro/121710306671/' },
                
            ]
        },
        { 
            category: 't&j biz', title: '상조 랜딩 페이지(4)', desc: '상조 광고 랜딩페이지', detail: '디자인 & 퍼블리싱',
            subList: [
                { title: '상조랜딩페이지4', period: '24.06.07~24.06.11', url:'https://thedbpro.co.kr/intro/6791718077783/' },
                { title: '상조랜딩페이지3', period: '24.05.28~24.06.05', url:'https://thedbpro.co.kr/intro/6771716867573/' },
                { title: '상조랜딩페이지2', period: '24.05.16~24.05.17', url:'https://thedbpro.co.kr/intro/6751715845637/' },
                { title: '상조랜딩페이지1', period: '24.02.20~24.02.29', url:'https://thedbpro.co.kr/intro/6741715845618/' },
            ]
        },
        // 팀
        { category: 'team', title: '과일 MBTI 테스트', desc: '개발자/디자이너 4인 협업 프로젝트. GitHub 활용 프론트엔드 개발 담당', detail: '웹 프론트엔드 협업', url: 'https://fruitmbti.pages.dev/', period: '22.11.13~22.12.15' },
        // 마이패스
        { category: 'mypass', title: '웹테스트, OMR, 채점', desc: 'HTML, CSS, jQuery 이용해 퍼블리싱 php, MySql 이용해 OMR 채점 및 결과표 산출 문제와 답을 등록할 수 있는 관리자 페이지', detail: '웹 시스템 개발', url:'https://job.dokgong.com/webtest/sample', period: '21.06.01~22.04.18' },
        { category: 'mypass', title: '교수님 소개 페이지', desc: 'HTML, CSS, jQuery 이용해 퍼블리싱 php, MySql 사용해 카테고리에 맞는 데이터 출력', detail: '데이터 구현', url:'https://sobang.dokgong.com/professor', period: '21.04.09~21.06.03' },
        { category: 'mypass', title: '전체 사이트 반응형 리뉴얼', desc: '기존 데스크탑 위주의 사이트를 모바일 친화적 반응형으로 전면 개편, 메인 배너 S3 주소 연결', detail: '프론트엔드 퍼블리싱', url : 'https://www.dokgong.com/', period: '21.02.22~21.03.05' }
    ];

    // 2. DOM 요소 선택 (여기서 filterBtns를 정의합니다!)
    const projectGrid = document.getElementById('project-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // 3. 카드 렌더링 함수
    function renderProjects(filterValue) {
        projectGrid.innerHTML = '';
        const filtered = filterValue === 'all' ? projectData : projectData.filter(p => p.category === filterValue);
        
        filtered.forEach((p, index) => {
            let catColor = p.category === 't&j biz' ? 'bg-amber-100 text-amber-800' : 
                        p.category === 'mypass' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800';
            let catName = p.category === 't&j biz' ? 'T&J biz' : p.category === 'mypass' ? '마이패스' : '팀 프로젝트';

            let periodHtml = '';
            if (p.subList) {
                let listItems = p.subList.map(sub => {
                    // url이 있으면 클릭 이벤트와 마우스오버 효과 추가
                    const clickAction = sub.url ? `onclick="window.open('${sub.url}', '_blank'); event.stopPropagation();"` : '';
                    const hoverStyle = sub.url ? 'cursor-pointer hover:bg-stone-200 hover:text-stone-800' : '';
                    
                    return `
                    <li class="flex justify-between items-center py-1.5 px-1 border-b border-stone-100 last:border-0 rounded transition ${hoverStyle}" ${clickAction}>
                        <span class="text-stone-600 truncate mr-2 font-medium">${sub.title}</span>
                        <span class="text-stone-400 shrink-0">${sub.period}</span>
                    </li>
                    `;
                }).join('');
                periodHtml = `<ul class="mt-3 max-h-32 overflow-y-auto text-xs font-mono pr-2 custom-scrollbar bg-stone-50 p-2 rounded border border-stone-100">${listItems}</ul>`;
            } else if (p.period) {
                periodHtml = `<p class="text-stone-400 text-xs mt-2 font-mono">${p.period}</p>`;
            }

            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition duration-300 flex flex-col animate-fade-in-up cursor-pointer';
            
            if(p.url) {
                card.onclick = () => window.open(p.url, '_blank');
            }

            card.style.animationDelay = `${index * 50}ms`;
            card.innerHTML = `
                <div class="flex-grow">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-2 py-1 rounded text-xs font-bold ${catColor}">${catName}</span>
                        <span class="text-stone-400 text-sm">💡 ${p.detail}</span>
                    </div>
                    <h3 class="text-xl font-bold text-stone-800 mb-1">${p.title}</h3>
                    <p class="text-stone-600 text-sm leading-relaxed">${p.desc}</p>
                    ${periodHtml}
                </div>
            `;
            projectGrid.appendChild(card);
        });
    }

    // 4. 필터 버튼 클릭 이벤트
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // e.currentTarget 사용!
            const targetBtn = e.currentTarget; 
            const filterValue = targetBtn.getAttribute('data-filter');

            // 기존 버튼 스타일 초기화
            filterBtns.forEach(b => {
                // 클래스명은 HTML에 맞춰 조정했습니다 (active 클래스 제어)
                b.classList.remove('active', 'bg-stone-800', 'text-white');
                b.classList.add('text-stone-600', 'hover:bg-stone-200');
            });
            
            // 클릭된 버튼 스타일 적용
            targetBtn.classList.add('active', 'bg-stone-800', 'text-white');
            targetBtn.classList.remove('text-stone-600', 'hover:bg-stone-200');
            
            renderProjects(filterValue);
        });
    });

    // 5. 초기 렌더링
    renderProjects('all');

    // --- 배너 포트폴리오 로직 ---
    const marqueeContainer = document.getElementById('marquee-container');
    const modalGrid = document.getElementById('modal-grid');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const bannerModal = document.getElementById('banner-modal');
    const bannerData = [
        { url: '/images/banner/260309_2.jpg', year: '2026.03.09' },
        { url: '/images/banner/260309_1.jpg', year: '2026.03.09' },
        { url: '/images/banner/251210_3.png', year: '2025.12.10' },
        { url: '/images/banner/251210_2.png', year: '2025.12.10' },
        { url: '/images/banner/251210_1.png', year: '2025.12.10' },
        { url: '/images/banner/251119_3.png', year: '2025.11.19' },
        { url: '/images/banner/251119_2.png', year: '2025.11.19' },
        { url: '/images/banner/251119_1.png', year: '2025.11.19' },
        { url: '/images/banner/251117_1.png', year: '2025.11.17' },
        { url: '/images/banner/251112_1.png', year: '2025.11.12' },
        { url: '/images/banner/251107_5.png', year: '2025.11.07' },
        { url: '/images/banner/251107_4.png', year: '2025.11.07' },
        { url: '/images/banner/251107_3.png', year: '2025.11.07' },
        { url: '/images/banner/251107_2.png', year: '2025.11.07' },
        { url: '/images/banner/251107_1.png', year: '2025.11.07' },
        { url: '/images/banner/251106_1.png', year: '2025.11.06' },
        { url: '/images/banner/251104_1.png', year: '2025.11.04' },
        { url: '/images/banner/250825_1.jpg', year: '2025.08.25' },
        { url: '/images/banner/250731_1.png', year: '2025.07.31' },
        { url: '/images/banner/250714_4.png', year: '2025.07.14' },
        { url: '/images/banner/250714_3.png', year: '2025.07.14' },
        { url: '/images/banner/250714_2.png', year: '2025.07.14' },
        { url: '/images/banner/250714_1.png', year: '2025.07.14' },
        { url: '/images/banner/250604_2.png', year: '2025.06.04' },
        { url: '/images/banner/250604_1.png', year: '2025.06.04' },
        { url: '/images/banner/250523_3.png', year: '2025.05.23' },
        { url: '/images/banner/250523_2.png', year: '2025.05.23' },
        { url: '/images/banner/250523_1.png', year: '2025.05.23' },
        { url: '/images/banner/250423_4.png', year: '2025.04.23' },
        { url: '/images/banner/250423_3.png', year: '2025.04.23' },
        { url: '/images/banner/250423_2.png', year: '2025.04.23' },
        { url: '/images/banner/250423_1.png', year: '2025.04.23' },
        { url: '/images/banner/250321_4.png', year: '2025.03.21' },
        { url: '/images/banner/250321_3.png', year: '2025.03.21' },
        { url: '/images/banner/250321_2.png', year: '2025.03.21' },
        { url: '/images/banner/250321_1.png', year: '2025.03.21' },
        { url: '/images/banner/250317_3.png', year: '2025.02.17' },
        { url: '/images/banner/250317_2.png', year: '2025.02.17' },
        { url: '/images/banner/250317_1.png', year: '2025.02.17' },
        { url: '/images/banner/250211_21.png', year: '2025.02.11' },
        { url: '/images/banner/250211_20.png', year: '2025.02.11' },
        { url: '/images/banner/250211_19.png', year: '2025.02.11' },
        { url: '/images/banner/250211_18.png', year: '2025.02.11' },
        { url: '/images/banner/250211_17.png', year: '2025.02.11' },
        { url: '/images/banner/250211_16.png', year: '2025.02.11' },
        { url: '/images/banner/250211_15.png', year: '2025.02.11' },
        { url: '/images/banner/250211_14.png', year: '2025.02.11' },
        { url: '/images/banner/250211_13.png', year: '2025.02.11' },
        { url: '/images/banner/250211_12.png', year: '2025.02.11' },
        { url: '/images/banner/250211_11.png', year: '2025.02.11' },
        { url: '/images/banner/250211_10.png', year: '2025.02.11' },
        { url: '/images/banner/250211_9.png', year: '2025.02.11' },
        { url: '/images/banner/250211_8.png', year: '2025.02.11' },
        { url: '/images/banner/250211_7.png', year: '2025.02.11' },
        { url: '/images/banner/250211_6.png', year: '2025.02.11' },
        { url: '/images/banner/250211_5.png', year: '2025.02.11' },
        { url: '/images/banner/250211_4.png', year: '2025.02.11' },
        { url: '/images/banner/250211_3.png', year: '2025.02.11' },
        { url: '/images/banner/250211_2.png', year: '2025.02.11' },
        { url: '/images/banner/250211_1.png', year: '2025.02.11' },
        { url: '/images/banner/241226_1.jpg', year: '2024.12.26' },
        { url: '/images/banner/241205_4.jpg', year: '2024.12.05' },
        { url: '/images/banner/241205_3.jpg', year: '2024.12.05' },
        { url: '/images/banner/241205_2.jpg', year: '2024.12.05' },
        { url: '/images/banner/241205_1.jpg', year: '2024.12.05' },
        { url: '/images/banner/241112_4.png', year: '2024.11.12' },
        { url: '/images/banner/241112_3.png', year: '2024.11.12' },
        { url: '/images/banner/241112_2.png', year: '2024.11.12' },
        { url: '/images/banner/241112_1.png', year: '2024.11.12' },
        { url: '/images/banner/241108_2.png', year: '2024.11.08' },
        { url: '/images/banner/241108_1.png', year: '2024.11.08' },
        { url: '/images/banner/241027_6.png', year: '2024.10.27' },
        { url: '/images/banner/241027_5.png', year: '2024.10.27' },
        { url: '/images/banner/241027_4.png', year: '2024.10.27' },
        { url: '/images/banner/241027_2.png', year: '2024.10.27' },
        { url: '/images/banner/241027_1.png', year: '2024.10.27' },
        { url: '/images/banner/241025_21.png', year: '2024.10.25' },
        { url: '/images/banner/241025_20.png', year: '2024.10.25' },
        { url: '/images/banner/241025_19.png', year: '2024.10.25' },
        { url: '/images/banner/241025_18.png', year: '2024.10.25' },
        { url: '/images/banner/241025_17.png', year: '2024.10.25' },
        { url: '/images/banner/241025_16.png', year: '2024.10.25' },
        { url: '/images/banner/241025_15.png', year: '2024.10.25' },
        { url: '/images/banner/241025_14.png', year: '2024.10.25' },
        { url: '/images/banner/241025_13.png', year: '2024.10.25' },
        { url: '/images/banner/241025_12.png', year: '2024.10.25' },
        { url: '/images/banner/241025_11.png', year: '2024.10.25' },
        { url: '/images/banner/241025_10.png', year: '2024.10.25' },
        { url: '/images/banner/241025_9.png', year: '2024.10.25' },
        { url: '/images/banner/241025_8.png', year: '2024.10.25' },
        { url: '/images/banner/241025_7.png', year: '2024.10.25' },
        { url: '/images/banner/241025_6.png', year: '2024.10.25' },
        { url: '/images/banner/241025_5.png', year: '2024.10.25' },
        { url: '/images/banner/241025_4.png', year: '2024.10.25' },
        { url: '/images/banner/241025_3.png', year: '2024.10.25' },
        { url: '/images/banner/241025_2.png', year: '2024.10.25' },
        { url: '/images/banner/241025_1.png', year: '2024.10.25' },
        { url: '/images/banner/241024_29.png', year: '2024.10.24' },
        { url: '/images/banner/241024_28.png', year: '2024.10.24' },
        { url: '/images/banner/241024_27.png', year: '2024.10.24' },
        { url: '/images/banner/241024_26.png', year: '2024.10.24' },
        { url: '/images/banner/241024_25.png', year: '2024.10.24' },
        { url: '/images/banner/241024_24.png', year: '2024.10.24' },
        { url: '/images/banner/241024_23.png', year: '2024.10.24' },
        { url: '/images/banner/241024_22.png', year: '2024.10.24' },
        { url: '/images/banner/241024_21.png', year: '2024.10.24' },
        { url: '/images/banner/241024_20.png', year: '2024.10.24' },
        { url: '/images/banner/241024_19.png', year: '2024.10.24' },
        { url: '/images/banner/241024_18.png', year: '2024.10.24' },
        { url: '/images/banner/241024_17.png', year: '2024.10.24' },
        { url: '/images/banner/241024_16.png', year: '2024.10.24' },
        { url: '/images/banner/241024_15.png', year: '2024.10.24' },
        { url: '/images/banner/241024_14.png', year: '2024.10.24' },
        { url: '/images/banner/241024_13.png', year: '2024.10.24' },
        { url: '/images/banner/241024_12.png', year: '2024.10.24' },
        { url: '/images/banner/241024_11.png', year: '2024.10.24' },
        { url: '/images/banner/241024_10.png', year: '2024.10.24' },
        { url: '/images/banner/241024_9.png', year: '2024.10.24' },
        { url: '/images/banner/241024_8.png', year: '2024.10.24' },
        { url: '/images/banner/241024_7.png', year: '2024.10.24' },
        { url: '/images/banner/241024_6.png', year: '2024.10.24' },
        { url: '/images/banner/241024_5.png', year: '2024.10.24' },
        { url: '/images/banner/241024_4.png', year: '2024.10.24' },
        { url: '/images/banner/241024_3.png', year: '2024.10.24' },
        { url: '/images/banner/241024_2.png', year: '2024.10.24' },
        { url: '/images/banner/241024_1.png', year: '2024.10.24' },
        { url: '/images/banner/241023_30.png', year: '2024.10.23' },
        { url: '/images/banner/241023_29.png', year: '2024.10.23' },
        { url: '/images/banner/241023_28.png', year: '2024.10.23' },
        { url: '/images/banner/241023_27.png', year: '2024.10.23' },
        { url: '/images/banner/241023_26.png', year: '2024.10.23' },
        { url: '/images/banner/241023_25.png', year: '2024.10.23' },
        { url: '/images/banner/241023_24.png', year: '2024.10.23' },
        { url: '/images/banner/241023_23.png', year: '2024.10.23' },
        { url: '/images/banner/241023_22.png', year: '2024.10.23' },
        { url: '/images/banner/241023_21.png', year: '2024.10.23' },
        { url: '/images/banner/241023_20.png', year: '2024.10.23' },
        { url: '/images/banner/241023_19.png', year: '2024.10.23' },
        { url: '/images/banner/241023_18.png', year: '2024.10.23' },
        { url: '/images/banner/241023_17.png', year: '2024.10.23' },
        { url: '/images/banner/241023_16.png', year: '2024.10.23' },
        { url: '/images/banner/241023_15.png', year: '2024.10.23' },
        { url: '/images/banner/241023_14.png', year: '2024.10.23' },
        { url: '/images/banner/241023_13.png', year: '2024.10.23' },
        { url: '/images/banner/241023_12.png', year: '2024.10.23' },
        { url: '/images/banner/241023_11.png', year: '2024.10.23' },
        { url: '/images/banner/241023_10.png', year: '2024.10.23' },
        { url: '/images/banner/241023_9.png', year: '2024.10.23' },
        { url: '/images/banner/241023_8.png', year: '2024.10.23' },
        { url: '/images/banner/241023_7.png', year: '2024.10.23' },
        { url: '/images/banner/241023_6.png', year: '2024.10.23' },
        { url: '/images/banner/241023_5.png', year: '2024.10.23' },
        { url: '/images/banner/241023_4.png', year: '2024.10.23' },
        { url: '/images/banner/241023_3.png', year: '2024.10.23' },
        { url: '/images/banner/241023_2.png', year: '2024.10.23' },
        { url: '/images/banner/241023_1.png', year: '2024.10.23' },
        { url: '/images/banner/241022_20.png', year: '2024.10.22' },
        { url: '/images/banner/241022_19.png', year: '2024.10.22' },
        { url: '/images/banner/241022_18.png', year: '2024.10.22' },
        { url: '/images/banner/241022_17.png', year: '2024.10.22' },
        { url: '/images/banner/241022_16.png', year: '2024.10.22' },
        { url: '/images/banner/241022_15.png', year: '2024.10.22' },
        { url: '/images/banner/241022_14.png', year: '2024.10.22' },
        { url: '/images/banner/241022_13.png', year: '2024.10.22' },
        { url: '/images/banner/241022_12.png', year: '2024.10.22' },
        { url: '/images/banner/241022_11.png', year: '2024.10.22' },
        { url: '/images/banner/241022_10.png', year: '2024.10.22' },
        { url: '/images/banner/241022_9.png', year: '2024.10.22' },
        { url: '/images/banner/241022_8.png', year: '2024.10.22' },
        { url: '/images/banner/241022_7.png', year: '2024.10.22' },
        { url: '/images/banner/241022_6.png', year: '2024.10.22' },
        { url: '/images/banner/241022_5.png', year: '2024.10.22' },
        { url: '/images/banner/241022_4.png', year: '2024.10.22' },
        { url: '/images/banner/241022_3.png', year: '2024.10.22' },
        { url: '/images/banner/241022_2.png', year: '2024.10.22' },
        { url: '/images/banner/241022_1.png', year: '2024.10.22' },
        { url: '/images/banner/241015_3.png', year: '2024.10.15' },
        { url: '/images/banner/241015_2.png', year: '2024.10.15' },
        { url: '/images/banner/241015_1.png', year: '2024.10.15' },
        { url: '/images/banner/240905_1.png', year: '2024.09.05' },
        { url: '/images/banner/240731_39.png', year: '2024.07.31' },
        { url: '/images/banner/240731_38.png', year: '2024.07.31' },
        { url: '/images/banner/240731_37.png', year: '2024.07.31' },
        { url: '/images/banner/240731_36.png', year: '2024.07.31' },
        { url: '/images/banner/240731_35.png', year: '2024.07.31' },
        { url: '/images/banner/240731_34.png', year: '2024.07.31' },
        { url: '/images/banner/240731_33.png', year: '2024.07.31' },
        { url: '/images/banner/240731_32.png', year: '2024.07.31' },
        { url: '/images/banner/240731_31.png', year: '2024.07.31' },
        { url: '/images/banner/240731_30.png', year: '2024.07.31' },
        { url: '/images/banner/240731_29.png', year: '2024.07.31' },
        { url: '/images/banner/240731_28.png', year: '2024.07.31' },
        { url: '/images/banner/240731_26.png', year: '2024.07.31' },
        { url: '/images/banner/240731_25.png', year: '2024.07.31' },
        { url: '/images/banner/240731_24.png', year: '2024.07.31' },
        { url: '/images/banner/240731_23.png', year: '2024.07.31' },
        { url: '/images/banner/240731_22.png', year: '2024.07.31' },
        { url: '/images/banner/240731_21.png', year: '2024.07.31' },
        { url: '/images/banner/240731_20.png', year: '2024.07.31' },
        { url: '/images/banner/240731_19.png', year: '2024.07.31' },
        { url: '/images/banner/240731_18.png', year: '2024.07.31' },
        { url: '/images/banner/240731_17.png', year: '2024.07.31' },
        { url: '/images/banner/240731_16.png', year: '2024.07.31' },
        { url: '/images/banner/240731_14.png', year: '2024.07.31' },
        { url: '/images/banner/240731_13.png', year: '2024.07.31' },
        { url: '/images/banner/240731_12.png', year: '2024.07.31' },
        { url: '/images/banner/240731_11.png', year: '2024.07.31' },
        { url: '/images/banner/240731_10.png', year: '2024.07.31' },
        { url: '/images/banner/240731_9.png', year: '2024.07.31' },
        { url: '/images/banner/240731_8.png', year: '2024.07.31' },
        { url: '/images/banner/240731_7.png', year: '2024.07.31' },
        { url: '/images/banner/240731_6.png', year: '2024.07.31' },
        { url: '/images/banner/240731_5.png', year: '2024.07.31' },
        { url: '/images/banner/240731_4.png', year: '2024.07.31' },
        { url: '/images/banner/240731_3.png', year: '2024.07.31' },
        { url: '/images/banner/240731_2.png', year: '2024.07.31' },
        { url: '/images/banner/240731_1.png', year: '2024.07.31' },
        { url: '/images/banner/240726_2.jpg', year: '2024.07.26' },
        { url: '/images/banner/240726_1.jpg', year: '2024.07.26' },
        { url: '/images/banner/240620_3.png', year: '2024.06.20' },
        { url: '/images/banner/240620_2.png', year: '2024.06.20' },
        { url: '/images/banner/240620_1.png', year: '2024.06.20' },
        { url: '/images/banner/240426_2.jpg', year: '2024.04.26' },
        { url: '/images/banner/240426_1.jpg', year: '2024.04.26' },
        { url: '/images/banner/240327_1.jpg', year: '2024.03.27' },
        { url: '/images/banner/240326_1.jpg', year: '2024.03.26' },
        { url: '/images/banner/240322_1.jpg', year: '2024.03.22' },
        { url: '/images/banner/240311_1.jpg', year: '2024.03.11' },
        { url: '/images/banner/240311_2.jpg', year: '2024.03.11' },
        { url: '/images/banner/240223_1.jpg', year: '2024.02.23' },
        { url: '/images/banner/240223_2.jpg', year: '2024.02.23' },
        { url: '/images/banner/240223_3.jpg', year: '2024.02.23' },
        { url: '/images/banner/240211_1.png', year: '2024.02.11' },
        { url: '/images/banner/240211_2.png', year: '2024.02.11' },
        { url: '/images/banner/240211_3.png', year: '2024.02.11' },
        { url: '/images/banner/240211_4.png', year: '2024.02.11' },
        { url: '/images/banner/240211_5.png', year: '2024.02.11' },        
    ];
    document.getElementById('banner-count').textContent = `(${bannerData.length}개)`;
    // 2. 무한 스크롤(Marquee)에 삽입 (div로 감싸서 이미지+연도 출력)
    const shuffledData = [...bannerData].sort(() => Math.random() - 0.5);
    const doubleData = [...shuffledData, ...shuffledData]; 
    
    marqueeContainer.innerHTML = doubleData.map(item => `
        <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <img src="${item.url}" class="w-[200px] h-[200px] object-cover rounded-lg border border-stone-200 shadow-sm cursor-zoom-in hover:scale-105 transition" loading="lazy" alt="banner">
            <span class="text-xs font-mono text-stone-500">${item.year}</span>
        </div>
    `).join('');

    // 3. 모달 열기 및 모달 내 이미지 렌더링
    btnOpenModal.addEventListener('click', () => {
        bannerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
        
        if (modalGrid.innerHTML.trim() === '') {
            modalGrid.innerHTML = bannerData.map(item => `
                <div class="flex flex-col items-center gap-2">
                    <img src="${item.url}" class="w-full h-auto object-cover rounded-lg border border-stone-200 shadow-sm hover:scale-105 transition cursor-zoom-in" loading="lazy" alt="banner">
                    <span class="text-xs font-mono text-stone-500">${item.year}</span>
                </div>
            `).join('');
        }
    });
    
    // 흐르는 배너(Marquee)에서 이미지 클릭 시 크게 보기 창 띄우기
    marqueeContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            viewerImage.src = e.target.src; // 클릭한 이미지 주소 복사
            imageViewerModal.classList.remove('hidden'); // 크게 보기 창 열기
        }
    });

    // 4. 모달 닫기
    const closeModal = () => {
        bannerModal.classList.add('hidden');
        document.body.style.overflow = ''; 
    };

    btnCloseModal.addEventListener('click', closeModal);
    
    bannerModal.addEventListener('click', (e) => {
        if (e.target === bannerModal) closeModal();
    });

    // ==========================================
    // 5. 이미지 크게 보기 (Lightbox) 로직 추가
    // ==========================================
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const viewerImage = document.getElementById('viewer-image');

    // 모달 내부의 그리드에서 클릭 이벤트 감지 (이벤트 위임)
    modalGrid.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            viewerImage.src = e.target.src; // 클릭한 이미지 주소를 복사
            imageViewerModal.classList.remove('hidden');
        }
    });

    // 크게 보기 모달 닫기 함수
    const closeViewer = () => {
        imageViewerModal.classList.add('hidden');
        viewerImage.src = ''; // 안 보일 때 이미지 주소 비우기
    };

    // 닫기 버튼 또는 배경/이미지 클릭 시 닫히도록 설정
    imageViewerModal.addEventListener('click', closeViewer);


    btnCloseModal.addEventListener('click', closeModal);
    bannerModal.addEventListener('click', (e) => {
        if(e.target === bannerModal) closeModal(); // 배경 클릭 시 닫기
    });
});
