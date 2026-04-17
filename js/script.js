document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    const { createTimeline, animate, stagger } = anime;
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    let isAnimFinished = false;
    let heroStarted = false; 
    // 1. 애니메이션 설정 (autoplay: false로 스크롤에 제어권을 넘깁니다)
    const animations = {
        colud1: animate('#colud1', { translateX: ['-11%', '-11%'], translateY: ['-29%', '-150%'], opacity: [1, 0], autoplay: false, ease: 'outQuart' }),
        colud4: animate('#colud4', { translateX: ['0%', '0%'], translateY: ['28%', '150%'], opacity: [1, 0], autoplay: false, ease: 'outQuart' }),
        colud5: animate('#colud5', { translateX: ['-15%', '-150%'], translateY: ['0%', '0%'], opacity: [1, 0], autoplay: false, ease: 'outQuart' }),
        colud3: animate('#colud3', { translateX: ['18%', '150%'], translateY: ['8%', '8%'], opacity: [1, 0], autoplay: false, ease: 'outQuart' }),
        colud2: animate('#colud2', { translateX: ['7%', '150%'], translateY: ['-3%', '-3%'], opacity: [1, 0], autoplay: false, ease: 'outQuart' }),
        container: animate('#colud-container', { scale: [1, 2.5], opacity: [1, 0], autoplay: false, ease: 'inOutQuart' }),
        moon: animate('#moon', { scale: [1, 30], filter: ['brightness(1)', 'brightness(5)'], autoplay: false, ease: 'inQuart' })
    };

    // 2. 스크롤 이벤트 연동
   window.addEventListener('scroll', () => {
        if (isAnimFinished) return;

        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const isMobile = window.innerWidth < 768;
        const scrollRange = isMobile ? vh * 3 : vh * 5; // 모바일 
        let progress = Math.min(scrollY / scrollRange, 1);

        // [0% ~ 70%] 구름 연출 (스크롤 비례)
        let cloudProgress = Math.min(progress / 0.7, 1);
        Object.values(animations).forEach(anim => anim.seek(cloudProgress * 1000));

        // [💡 70% 지점] 히어로 애니메이션 "한 번만" 트리거
        if (progress > 0.7 && !heroStarted) {
            heroStarted = true;
            const heroEl = document.getElementById('hero');
            
            heroEl.classList.remove('opacity-0'); // 투명도 락 해제
            heroEl.style.opacity = "1";           // 판 깔기
            
            playHeroAnimation(); // 대장님이 좋아하시는 그 엇박자 함수 실행!
        }

        // [100% 도달 시] 연출 종료 및 본문 연결
        if (progress >= 1) {
            isAnimFinished = true;
            animate('#scroll-indicator', {
                opacity: 0,
                duration: 300,
                easing: 'linear'
            });
            animate('#landing-scene', {
                opacity: 0,
                duration: 400,
                complete: () => {
                    document.getElementById('landing-scene').style.display = 'none';
                    document.getElementById('hero-spacer').style.display = 'none';
                    
                    const hero = document.getElementById('hero');
                    hero.classList.remove('fixed', 'inset-0', 'pointer-events-none','z-[60]');
                    hero.classList.add('relative', 'z-10');
                    
                    window.scrollTo(0, 0);
                    startSectionObservers(); 
                }
            });
        }
    });

    // 페이지 로드 시 맨 위로 강제 이동 (새로고침 시 꼬임 방지)
    window.onbeforeunload = function () {
        window.scrollTo(0, 0);
    };



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

            // 클릭할 때마다 상세 내용이 오른쪽에서 슥- 등장
            animate(targetDetail, {
                translateX: [30, 0],
                opacity: [0, 1],
                duration: 600,
                ease: 'outQuart'
            });
            
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
            category: 't&j biz', title: 'T&J AD 랜딩페이지', desc: '사내 디자이너와 협업하여 광고 랜딩 페이지 퍼블리싱을 전담했습니다. 스크롤 위치에 반응하는 동적인 인터랙션 애니메이션을 구현하여 사용자 몰입도를 높였습니다.', detail: '퍼블리싱', url:'https://tnjbiz1.co.kr/intro/6811772779117/', period: '24.04.23~24.05.08', isBest: true,
            image: '../images/preview_tnjad.png',
            tech: ['HTML5', 'CSS3', 'jQuery', 'Scroll Animation']
        },{
            category: 'mypass', title: '독한공무원 전체 사이트 반응형 리뉴얼', desc: '기존 데스크탑 위주의 사이트를 모바일 친화적 반응형으로 전면 개편했습니다. 메인 배너의 S3 연결 및 로딩 최적화를 진행했습니다.', detail: '프론트엔드 퍼블리싱', url : 'https://www.dokgong.com/', period: '21.02.22~21.03.05', isBest: true,
            image: '../images/preview_main.png',
            tech: ['HTML5', 'CSS3', 'jQuery', 'Responsive']
        },
        {
            category: 'team', title: '과일 MBTI 테스트 (팀 프로젝트)', desc: '개발자/디자이너 4인 협업 프로젝트입니다. GitHub를 활용한 협업 프로세스를 경험했으며 메인 프론트엔드 개발을 담당했습니다.', detail: '프론트엔드 협업', url: 'https://fruitmbti.pages.dev/', period: '22.11.13~22.12.15', isBest: true,
            image: '../images/preview_mbti.png',
            tech: ['HTML5', 'CSS3', 'JavaScript','GitHub', 'Collaboration']
        },             
        {
            category: 't&j biz', title: '정책자금 대출 랜딩(8)', desc: '소상공인 및 정부 정책자금 진단/대출 랜딩', detail: '디자인 & 퍼블리싱',
            subList: [
                { title: '기업 맞춤형AI 정책자금', period: '26.04.07~26.04.07', url:'https://www.ins-leaders.co.kr/intro/8861775540900/' },
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
    const filterBtns = document.querySelectorAll('.filter-btn');

    // 3. 카드 렌더링 함수
    function renderFeatured() {
        const container = document.getElementById('featured-projects');
        if(!container) return;
        const bestOnes = projectData.filter(p => p.isBest);
        container.innerHTML = bestOnes.map((p, i) => `
            <div class="featured-card group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-200 flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}">
                <div class="md:w-1/2 bg-stone-100 overflow-hidden h-72 md:h-auto relative">
                    <img src="${p.image}" alt="${p.title}" class="project-image w-full h-full object-cover transition-transform duration-1000">
                    <div class="absolute top-6 left-6 bg-amber-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Best Work 0${i+1}</div>
                </div>
                <div class="p-10 md:w-1/2 flex flex-col justify-center">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-xs font-mono text-amber-700 font-bold">${p.period}</span>
                        <span class="text-stone-300">|</span>
                        <span class="text-xs text-stone-400 font-medium">${p.detail}</span>
                    </div>
                    <h3 class="text-3xl font-bold text-stone-900 mb-5 leading-tight">${p.title}</h3>
                    <p class="text-stone-600 mb-8 text-base leading-relaxed italic">"${p.desc}"</p>
                    <div class="flex flex-wrap gap-2 mb-10">
                        ${p.tech.map(t => `<span class="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-semibold">#${t}</span>`).join('')}
                    </div>
                    <a href="${p.url}" target="_blank" class="group/btn inline-flex items-center text-amber-900 font-bold border-b-2 border-amber-900 pb-1 self-start hover:text-amber-600 hover:border-amber-600 transition">
                        사이트 바로가기 
                        <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"></path></svg>
                    </a>
                </div>
            </div>
        `).join('');
    }
    // --- 페이징 설정 ---
    let currentFilter = 'all';
    let currentPage = 1;
    const itemsPerPage = 3; // 보여줄 카드 수

    function renderProjects(filterValue) {
        // 1. 넘어온 필터값이 있으면 전역 변수 업데이트
        if (filterValue) currentFilter = filterValue;
        
        const grid = document.getElementById('project-grid');
        const paginationContainer = document.getElementById('pagination');
        
        // 2. 🚨 가장 중요: 화면을 그리기 전에 기존 카드 싹 지우기
        grid.innerHTML = '';

        const filtered = currentFilter === 'all' 
            ? projectData.filter(p => !p.isBest) 
            : projectData.filter(p => p.category === currentFilter && !p.isBest);

        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);
        
        // 3. 🚨 수정: filtered가 아닌 3개씩 자른 'paginatedData'를 순회!
        paginatedData.forEach((p, index) => {
            let catColor = p.category === 't&j biz' ? 'bg-amber-100 text-amber-800' : 
                        p.category === 'mypass' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800';
            let catName = p.category === 't&j biz' ? 'T&J biz' : p.category === 'mypass' ? '마이패스' : '팀 프로젝트';

            let periodHtml = '';
            if (p.subList) {
                let listItems = p.subList.map(sub => {
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
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col cursor-pointer';
            
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
            grid.appendChild(card);
        });

        paginationContainer.innerHTML = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                // 현재 페이지 버튼 색상 처리 추가
                btn.className = `page-btn w-8 h-8 rounded-full border border-stone-300 text-xs font-bold transition ${i === currentPage ? 'active bg-stone-800 text-white' : 'bg-white text-stone-600 hover:bg-stone-200'}`;
                btn.onclick = () => {
                    currentPage = i;
                    // 4. 🚨 수정: 없는 함수가 아니라 renderProjects를 다시 호출
                    renderProjects(currentFilter);
                    playProjectAnimation(); // 페이지 넘길 때 애니메이션 실행
                };
                paginationContainer.appendChild(btn);
            }
        }
    }

    // 4. 필터 버튼 클릭 이벤트
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterValue = e.currentTarget.getAttribute('data-filter');
            
            // 버튼 스타일 처리
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-stone-800', 'text-white');
                b.classList.add('text-stone-600', 'hover:bg-stone-200');
            });
            e.currentTarget.classList.add('active', 'bg-stone-800', 'text-white');
            e.currentTarget.classList.remove('text-stone-600', 'hover:bg-stone-200');

            // 🚨 중요: 필터가 바뀌면 무조건 1페이지로 초기화
            currentPage = 1; 

            renderProjects(filterValue);
            playProjectAnimation(); 
        });
    });

    // 5. 초기 렌더링
    renderFeatured();
    renderProjects('all');

    // --- 배너 포트폴리오 로직 ---
    const marqueeContainer = document.getElementById('marquee-container');
    const modalGrid = document.getElementById('modal-grid');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const bannerModal = document.getElementById('banner-modal');
    const BASE_IMG_PATH = '/portfolio/images/banner/';
    const bannerData = [
        { url: '260309_2.jpg', year: '2026.03.09' },
        { url: '260309_1.jpg', year: '2026.03.09' },
        { url: '251210_3.png', year: '2025.12.10' },
        { url: '251210_2.png', year: '2025.12.10' },
        { url: '251210_1.png', year: '2025.12.10' },
        { url: '251119_3.png', year: '2025.11.19' },
        { url: '251119_2.png', year: '2025.11.19' },
        { url: '251119_1.png', year: '2025.11.19' },
        { url: '251117_1.png', year: '2025.11.17' },
        { url: '251112_1.png', year: '2025.11.12' },
        { url: '251107_5.png', year: '2025.11.07' },
        { url: '251107_4.png', year: '2025.11.07' },
        { url: '251107_3.png', year: '2025.11.07' },
        { url: '251107_2.png', year: '2025.11.07' },
        { url: '251107_1.png', year: '2025.11.07' },
        { url: '251106_1.png', year: '2025.11.06' },
        { url: '251104_1.png', year: '2025.11.04' },
        { url: '250825_1.jpg', year: '2025.08.25' },
        { url: '250731_1.png', year: '2025.07.31' },
        { url: '250714_4.png', year: '2025.07.14' },
        { url: '250714_3.png', year: '2025.07.14' },
        { url: '250714_2.png', year: '2025.07.14' },
        { url: '250714_1.png', year: '2025.07.14' },
        { url: '250604_2.png', year: '2025.06.04' },
        { url: '250604_1.png', year: '2025.06.04' },
        { url: '250523_3.png', year: '2025.05.23' },
        { url: '250523_2.png', year: '2025.05.23' },
        { url: '250523_1.png', year: '2025.05.23' },
        { url: '250423_4.png', year: '2025.04.23' },
        { url: '250423_3.png', year: '2025.04.23' },
        { url: '250423_2.png', year: '2025.04.23' },
        { url: '250423_1.png', year: '2025.04.23' },
        { url: '250321_4.png', year: '2025.03.21' },
        { url: '250321_3.png', year: '2025.03.21' },
        { url: '250321_2.png', year: '2025.03.21' },
        { url: '250321_1.png', year: '2025.03.21' },
        { url: '250317_3.png', year: '2025.02.17' },
        { url: '250317_2.png', year: '2025.02.17' },
        { url: '250317_1.png', year: '2025.02.17' },
        { url: '250211_21.png', year: '2025.02.11' },
        { url: '250211_20.png', year: '2025.02.11' },
        { url: '250211_19.png', year: '2025.02.11' },
        { url: '250211_18.png', year: '2025.02.11' },
        { url: '250211_17.png', year: '2025.02.11' },
        { url: '250211_16.png', year: '2025.02.11' },
        { url: '250211_15.png', year: '2025.02.11' },
        { url: '250211_14.png', year: '2025.02.11' },
        { url: '250211_13.png', year: '2025.02.11' },
        { url: '250211_12.png', year: '2025.02.11' },
        { url: '250211_11.png', year: '2025.02.11' },
        { url: '250211_10.png', year: '2025.02.11' },
        { url: '250211_9.png', year: '2025.02.11' },
        { url: '250211_8.png', year: '2025.02.11' },
        { url: '250211_7.png', year: '2025.02.11' },
        { url: '250211_6.png', year: '2025.02.11' },
        { url: '250211_5.png', year: '2025.02.11' },
        { url: '250211_4.png', year: '2025.02.11' },
        { url: '250211_3.png', year: '2025.02.11' },
        { url: '250211_2.png', year: '2025.02.11' },
        { url: '250211_1.png', year: '2025.02.11' },
        { url: '241226_1.jpg', year: '2024.12.26' },
        { url: '241205_4.png', year: '2024.12.05' },
        { url: '241205_3.png', year: '2024.12.05' },
        { url: '241205_2.png', year: '2024.12.05' },
        { url: '241205_1.png', year: '2024.12.05' },
        { url: '241112_4.png', year: '2024.11.12' },
        { url: '241112_3.png', year: '2024.11.12' },
        { url: '241112_2.png', year: '2024.11.12' },
        { url: '241112_1.png', year: '2024.11.12' },
        { url: '241108_2.png', year: '2024.11.08' },
        { url: '241108_1.png', year: '2024.11.08' },
        { url: '241027_6.png', year: '2024.10.27' },
        { url: '241027_5.png', year: '2024.10.27' },
        { url: '241027_4.png', year: '2024.10.27' },
        { url: '241027_2.png', year: '2024.10.27' },
        { url: '241027_1.png', year: '2024.10.27' },
        { url: '241025_21.png', year: '2024.10.25' },
        { url: '241025_20.png', year: '2024.10.25' },
        { url: '241025_19.png', year: '2024.10.25' },
        { url: '241025_18.png', year: '2024.10.25' },
        { url: '241025_17.png', year: '2024.10.25' },
        { url: '241025_16.png', year: '2024.10.25' },
        { url: '241025_15.png', year: '2024.10.25' },
        { url: '241025_14.png', year: '2024.10.25' },
        { url: '241025_13.png', year: '2024.10.25' },
        { url: '241025_12.png', year: '2024.10.25' },
        { url: '241025_11.png', year: '2024.10.25' },
        { url: '241025_10.png', year: '2024.10.25' },
        { url: '241025_9.png', year: '2024.10.25' },
        { url: '241025_8.png', year: '2024.10.25' },
        { url: '241025_7.png', year: '2024.10.25' },
        { url: '241025_6.png', year: '2024.10.25' },
        { url: '241025_5.png', year: '2024.10.25' },
        { url: '241025_4.png', year: '2024.10.25' },
        { url: '241025_3.png', year: '2024.10.25' },
        { url: '241025_2.png', year: '2024.10.25' },
        { url: '241025_1.png', year: '2024.10.25' },
        { url: '241024_29.png', year: '2024.10.24' },
        { url: '241024_28.png', year: '2024.10.24' },
        { url: '241024_27.png', year: '2024.10.24' },
        { url: '241024_26.png', year: '2024.10.24' },
        { url: '241024_25.png', year: '2024.10.24' },
        { url: '241024_24.png', year: '2024.10.24' },
        { url: '241024_23.png', year: '2024.10.24' },
        { url: '241024_22.png', year: '2024.10.24' },
        { url: '241024_21.png', year: '2024.10.24' },
        { url: '241024_20.png', year: '2024.10.24' },
        { url: '241024_19.png', year: '2024.10.24' },
        { url: '241024_18.png', year: '2024.10.24' },
        { url: '241024_17.png', year: '2024.10.24' },
        { url: '241024_16.png', year: '2024.10.24' },
        { url: '241024_15.png', year: '2024.10.24' },
        { url: '241024_14.png', year: '2024.10.24' },
        { url: '241024_13.png', year: '2024.10.24' },
        { url: '241024_12.png', year: '2024.10.24' },
        { url: '241024_11.png', year: '2024.10.24' },
        { url: '241024_10.png', year: '2024.10.24' },
        { url: '241024_9.png', year: '2024.10.24' },
        { url: '241024_8.png', year: '2024.10.24' },
        { url: '241024_7.png', year: '2024.10.24' },
        { url: '241024_6.png', year: '2024.10.24' },
        { url: '241024_5.png', year: '2024.10.24' },
        { url: '241024_4.png', year: '2024.10.24' },
        { url: '241024_3.png', year: '2024.10.24' },
        { url: '241024_2.png', year: '2024.10.24' },
        { url: '241024_1.png', year: '2024.10.24' },
        { url: '241023_30.png', year: '2024.10.23' },
        { url: '241023_29.png', year: '2024.10.23' },
        { url: '241023_28.png', year: '2024.10.23' },
        { url: '241023_27.png', year: '2024.10.23' },
        { url: '241023_26.png', year: '2024.10.23' },
        { url: '241023_25.png', year: '2024.10.23' },
        { url: '241023_24.png', year: '2024.10.23' },
        { url: '241023_23.png', year: '2024.10.23' },
        { url: '241023_22.png', year: '2024.10.23' },
        { url: '241023_21.png', year: '2024.10.23' },
        { url: '241023_20.png', year: '2024.10.23' },
        { url: '241023_19.png', year: '2024.10.23' },
        { url: '241023_18.png', year: '2024.10.23' },
        { url: '241023_17.png', year: '2024.10.23' },
        { url: '241023_16.png', year: '2024.10.23' },
        { url: '241023_15.png', year: '2024.10.23' },
        { url: '241023_14.png', year: '2024.10.23' },
        { url: '241023_13.png', year: '2024.10.23' },
        { url: '241023_12.png', year: '2024.10.23' },
        { url: '241023_11.png', year: '2024.10.23' },
        { url: '241023_10.png', year: '2024.10.23' },
        { url: '241023_9.png', year: '2024.10.23' },
        { url: '241023_8.png', year: '2024.10.23' },
        { url: '241023_7.png', year: '2024.10.23' },
        { url: '241023_6.png', year: '2024.10.23' },
        { url: '241023_5.png', year: '2024.10.23' },
        { url: '241023_4.png', year: '2024.10.23' },
        { url: '241023_3.png', year: '2024.10.23' },
        { url: '241023_2.png', year: '2024.10.23' },
        { url: '241023_1.png', year: '2024.10.23' },
        { url: '241022_20.png', year: '2024.10.22' },
        { url: '241022_19.png', year: '2024.10.22' },
        { url: '241022_18.png', year: '2024.10.22' },
        { url: '241022_17.png', year: '2024.10.22' },
        { url: '241022_16.png', year: '2024.10.22' },
        { url: '241022_15.png', year: '2024.10.22' },
        { url: '241022_14.png', year: '2024.10.22' },
        { url: '241022_13.png', year: '2024.10.22' },
        { url: '241022_12.png', year: '2024.10.22' },
        { url: '241022_11.png', year: '2024.10.22' },
        { url: '241022_10.png', year: '2024.10.22' },
        { url: '241022_9.png', year: '2024.10.22' },
        { url: '241022_8.png', year: '2024.10.22' },
        { url: '241022_7.png', year: '2024.10.22' },
        { url: '241022_6.png', year: '2024.10.22' },
        { url: '241022_5.png', year: '2024.10.22' },
        { url: '241022_4.png', year: '2024.10.22' },
        { url: '241022_3.png', year: '2024.10.22' },
        { url: '241022_2.png', year: '2024.10.22' },
        { url: '241022_1.png', year: '2024.10.22' },
        { url: '241015_3.png', year: '2024.10.15' },
        { url: '241015_2.png', year: '2024.10.15' },
        { url: '241015_1.png', year: '2024.10.15' },
        { url: '240905_1.png', year: '2024.09.05' },
        { url: '240731_39.png', year: '2024.07.31' },
        { url: '240731_38.png', year: '2024.07.31' },
        { url: '240731_37.png', year: '2024.07.31' },
        { url: '240731_36.png', year: '2024.07.31' },
        { url: '240731_35.png', year: '2024.07.31' },
        { url: '240731_34.png', year: '2024.07.31' },
        { url: '240731_33.png', year: '2024.07.31' },
        { url: '240731_32.png', year: '2024.07.31' },
        { url: '240731_31.png', year: '2024.07.31' },
        { url: '240731_30.png', year: '2024.07.31' },
        { url: '240731_29.png', year: '2024.07.31' },
        { url: '240731_28.png', year: '2024.07.31' },
        { url: '240731_26.png', year: '2024.07.31' },
        { url: '240731_25.png', year: '2024.07.31' },
        { url: '240731_24.png', year: '2024.07.31' },
        { url: '240731_23.png', year: '2024.07.31' },
        { url: '240731_22.png', year: '2024.07.31' },
        { url: '240731_21.png', year: '2024.07.31' },
        { url: '240731_20.png', year: '2024.07.31' },
        { url: '240731_19.png', year: '2024.07.31' },
        { url: '240731_18.png', year: '2024.07.31' },
        { url: '240731_17.png', year: '2024.07.31' },
        { url: '240731_16.png', year: '2024.07.31' },
        { url: '240731_14.png', year: '2024.07.31' },
        { url: '240731_13.png', year: '2024.07.31' },
        { url: '240731_12.png', year: '2024.07.31' },
        { url: '240731_11.png', year: '2024.07.31' },
        { url: '240731_10.png', year: '2024.07.31' },
        { url: '240731_9.png', year: '2024.07.31' },
        { url: '240731_8.png', year: '2024.07.31' },
        { url: '240731_7.png', year: '2024.07.31' },
        { url: '240731_6.png', year: '2024.07.31' },
        { url: '240731_5.png', year: '2024.07.31' },
        { url: '240731_4.png', year: '2024.07.31' },
        { url: '240731_3.png', year: '2024.07.31' },
        { url: '240731_2.png', year: '2024.07.31' },
        { url: '240731_1.png', year: '2024.07.31' },
        { url: '240726_2.jpg', year: '2024.07.26' },
        { url: '240726_1.jpg', year: '2024.07.26' },
        { url: '240620_3.png', year: '2024.06.20' },
        { url: '240620_2.png', year: '2024.06.20' },
        { url: '240620_1.png', year: '2024.06.20' },
        { url: '240426_2.jpg', year: '2024.04.26' },
        { url: '240426_1.jpg', year: '2024.04.26' },
        { url: '240327_1.jpg', year: '2024.03.27' },
        { url: '240326_1.jpg', year: '2024.03.26' },
        { url: '240322_1.jpg', year: '2024.03.22' },
        { url: '240311_1.jpg', year: '2024.03.11' },
        { url: '240311_2.jpg', year: '2024.03.11' },
        { url: '240223_1.jpg', year: '2024.02.23' },
        { url: '240223_2.jpg', year: '2024.02.23' },
        { url: '240223_3.jpg', year: '2024.02.23' },
        { url: '240211_1.png', year: '2024.02.11' },
        { url: '240211_2.png', year: '2024.02.11' },
        { url: '240211_3.png', year: '2024.02.11' },
        { url: '240211_4.png', year: '2024.02.11' },
        { url: '240211_5.png', year: '2024.02.11' },        
    ];
    document.getElementById('banner-count').textContent = `(${bannerData.length}개)`;
    
    // 2. 무한 스크롤(Marquee)에 삽입 (div로 감싸서 이미지+연도 출력)
    const shuffledData = [...bannerData].sort(() => Math.random() - 0.5);
    const doubleData = [...shuffledData, ...shuffledData]; 
    
    marqueeContainer.innerHTML = doubleData.map(item => `
        <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <img src="${BASE_IMG_PATH}${item.url}" class="w-[200px] h-[200px] object-cover rounded-lg border border-stone-200 shadow-sm cursor-zoom-in hover:scale-105 transition" loading="lazy" alt="banner">
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
                    <img src="${BASE_IMG_PATH}${item.url}" class="w-full h-auto object-cover rounded-lg border border-stone-200 shadow-sm hover:scale-105 transition cursor-zoom-in" loading="lazy" alt="banner">
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
    // 이미지 크게 보기 (Lightbox) 로직 추가
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

    // ==========================================
    // 불펌 방지 (우클릭, 복사, 드래그 차단)
    // ==========================================
    document.addEventListener('contextmenu', e => e.preventDefault()); // 마우스 우클릭 방지
    document.addEventListener('dragstart', e => e.preventDefault()); // 이미지 꾹 눌러서 끌어당기기 방지
    document.addEventListener('selectstart', e => e.preventDefault()); // 텍스트 드래그 선택 방지
    document.addEventListener('copy', e => e.preventDefault()); // Ctrl+C 복사 방지

    // ==========================================
    // 애니메이션
    // ==========================================
    function playHeroAnimation() {
        // 1. 이름 (H1) 등장
       animate('#hero h1', {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 1000,
            easing: 'outExpo'
        });

        // 2. 설명 문구 (P)
        animate('#hero p', {
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 500, // 이름 나오고 0.5초 뒤
            easing: 'outQuad'
        });

        // 3. 💡 스크롤 아이콘 (마지막에 슬쩍)
        animate('#scroll-indicator', {
            opacity: [0, 1],
            translateY: [10, 0],
            delay: 1000, // 설명 문구까지 나오고 나서 0.5초 더 뒤 (총 1초)
            easing: 'outQuad'
        });
    }
    // 개별 카드용 감시자 설정
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 💡 화면에 들어온 그 "카드"만 애니메이션 실행!
                animate(entry.target, {
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 600,
                    easing: 'outExpo'
                });
                cardObserver.unobserve(entry.target); // 한 번 보이면 감시 종료
            }
        });
    }, { 
        rootMargin: '0px 0px -50px 0px', // 약간 미리 올라오게 설정
        threshold: 0.1 
    });
    function startSectionObservers() {
        // 모든 섹션 감시 시작
        document.querySelectorAll('section').forEach(sec => observer.observe(sec));
        document.querySelectorAll('#project-grid > div').forEach(card => {
            cardObserver.observe(card);
        });
    }

    // 섹션별 등장 애니메이션 함수들
    const sectionAnims = {
        about: () => animate('#about', { opacity: [0, 1], translateY: [40, 0], duration: 1000 }),
        skills: () => animate('#skills span', { scale: [0, 1], delay: stagger(50), ease: 'outBack' }),
        experience: () => {
            // 1. 타임라인 생성
            const tl = createTimeline({
                defaults: {
                    duration: 1000,
                    ease: 'outExpo' // 시원하게 뻗는 느낌
                }
            });

            // 2. 제목 & 설명: 위에서 아래로
            tl.add('#experience .border-b, #experience > p', {
                translateY: [-50, 0],
                opacity: [0, 1],
                delay: stagger(100)
            })
            // 3. 왼쪽 탭 리스트: 왼쪽에서 오른쪽으로 (-=800은 이전 애니메이션 끝나기 0.8초 전에 시작하라는 뜻)
            .add('#exp-list', {
                translateX: [-100, 0],
                opacity: [0, 1]
            }, '-=800')
            // 4. 오른쪽 상세 내용 박스: 오른쪽에서 왼쪽으로
            .add('#exp-info', {
                translateX: [100, 0],
                opacity: [0, 1]
            }, '-=800')
            // 5. 하단 자격증 박스: 아래에서 위로 슥-
            .add('#exp-certi', {
                translateY: [40, 0],
                opacity: [0, 1]
            }, '-=600');
        }
    };

    // 감시자 설정
    const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            if (sectionAnims[id]) sectionAnims[id](); // 해당 섹션 함수 실행
            observer.unobserve(entry.target); // 실행 후 감시 종료
        }
    });
    }, { rootMargin: '0px 0px -150px 0px', threshold: 0.3 });

    // 프로젝트 카드
    function playProjectAnimation() {
        animate('#project-grid > div', {
            opacity: [0, 1],
            translateY: [20, 0],
            delay: stagger(40),
            duration: 500,
            ease: 'outExpo'
        });
    }

    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 프로젝트 섹션이 화면에 30% 이상 들어왔을 때 실행
            if (entry.isIntersecting) {
                playProjectAnimation();
                projectObserver.unobserve(entry.target); // 한 번만 실행
            }
        });
    }, {rootMargin: '0px 0px -150px 0px', threshold: 0.4 });

    projectObserver.observe(document.getElementById('projects'));

    // 필터 버튼 클릭 이벤트 리스너 내부
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterValue = e.currentTarget.getAttribute('data-filter');
            renderProjects(filterValue);
            playProjectAnimation(); // 필터 클릭 시에는 즉시 실행!
        });
    });
});
