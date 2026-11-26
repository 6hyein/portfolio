/* =========================================================
   작업 모음 페이지 스크립트 (뮤자인 지원용)
   jQuery: 화면 그리기, 이벤트 / GSAP + ScrollTrigger: 움직임

   0. 데이터(works-data.js)로 화면 그리기
   1. 스크롤 진행 바
   2. 인트로: 공이 이름 위를 튕기다가, 스크롤하면 커져서 화면을 덮고 소개로 넘어감
   3. 대표 작업: PC에서 세로 스크롤을 가로 이동으로 바꾸기 (pin + scrub)
   4. 전체 작업: 회사별 필터와 등장 효과
   5. 배너: 끝없이 흐르는 두 줄, 스크롤이 빠를수록 빨라짐
   6. 이메일 복사
   ========================================================= */

$(function () {
    gsap.registerPlugin(ScrollTrigger);

    // 움직임 줄이기 설정을 켠 사용자에게는 애니메이션 없이 내용만 보여 준다
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 가로 스크롤은 넓은 화면에서만. 모바일은 세로로 쌓인 카드 그대로
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    const pad = (n) => String(n).padStart(2, '0');
    // 배너 파일 이름 앞 6자리(260901)를 날짜(2026.09.01)로
    const bannerDate = (name) => `20${name.slice(0, 2)}.${name.slice(2, 4)}.${name.slice(4, 6)}`;


    /* ---------------------------------------------------------
       0. 데이터로 화면 그리기
       --------------------------------------------------------- */

    // 대표 작업 카드
    const featuredHtml = FEATURED.map((work, i) => {
        const media = work.image
            ? `<img src="${work.image}" alt="${work.title} 화면">`
            : `<span>${work.title}</span>`;

        return `
        <article class="work">
            <a class="work__media ${work.image ? '' : 'work__media--text'}" href="${work.url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
                <span class="work__no">${pad(i + 1)}</span>${media}
            </a>
            <div class="work__body">
                <p class="work__meta"><span>${work.company}</span><span>${work.period}</span></p>
                <h3 class="work__title">${work.title}</h3>
                <ul class="work__lines">${work.lines.map((line) => `<li>${line}</li>`).join('')}</ul>
                <ul class="work__tech">${work.tech.map((t) => `<li>${t}</li>`).join('')}</ul>
                <a class="work__link" href="${work.url}" target="_blank" rel="noopener">사이트 보기 <span aria-hidden="true">&rarr;</span></a>
            </div>
        </article>`;
    }).join('');

    $('.js-track').html(featuredHtml);
    $('.js-total').text(pad(FEATURED.length));

    // 전체 작업 목록 (필터를 누를 때마다 다시 그림)
    function renderArchive(filter) {
        const items = filter === 'all' ? ARCHIVE : ARCHIVE.filter((item) => item.key === filter);

        const html = items.map((item) => {
            let body;

            if (item.sub) {
                // 시리즈 작업: 하위 목록을 펼쳐서 전부 보여 준다
                const links = item.sub.map((s) => s.url
                    ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}<em>${s.period}</em></a>`
                    : `<span class="is-off">${s.title}<em>${s.period}</em></span>`
                ).join('');
                body = `<div class="row__sub">${links}</div>`;
            } else {
                const link = item.url
                    ? `<a href="${item.url}" target="_blank" rel="noopener">사이트 보기</a>`
                    : `<span>${item.note}</span>`;
                body = `<p class="row__single"><span>${item.period}</span>${link}</p>`;
            }

            return `
            <article class="row">
                <p class="row__company">${item.company}</p>
                <h3 class="row__title">${item.title}${item.sub ? `<small>${item.sub.length}</small>` : ''}</h3>
                <p class="row__role">${item.role}</p>
                ${body}
            </article>`;
        }).join('');

        $('.js-archive').html(html);
    }
    renderArchive('all');

    // 인트로 숫자: 직접 세지 않고 데이터 개수로 계산한다
    const counts = {
        landing: ARCHIVE.filter((g) => g.landing).reduce((sum, g) => sum + g.sub.length, 0),
        banner: BANNERS.length,
        featured: FEATURED.length
    };
    $('.js-banner-total').text(counts.banner);

    // 배너 두 줄 채우기: 매번 섞어서 18장씩
    const picks = gsap.utils.shuffle([...BANNERS]).slice(0, 36);
    $('.js-marquee').each(function (i) {
        const list = picks.slice(i * 18, i * 18 + 18);
        const imgs = (withAlt) => list.map((name) =>
            `<img src="../images/banner/${name}.webp" alt="${withAlt ? '광고 배너 ' + bannerDate(name) : ''}" width="200" height="200">`
        ).join('');
        // 같은 묶음을 두 번 이어 붙여야 끊김 없이 돈다 (두 번째 묶음은 스크린리더가 읽지 않게 alt 비움)
        $(this).html(imgs(true) + imgs(false));
    });

    // 인트로 글자 준비 (애니메이션을 끈 사용자에게도 필요해서 여기서 처리)
    // 1) 공이 밟을 줄은 글자마다 <span class="ch"> 로 쪼갠다
    $('.js-bounce-line, .js-last-line').each(function () {
        const chars = $(this).text().split('').map((ch) =>
            ch === ' ' ? '<span class="ch ch--space">&nbsp;</span>' : `<span class="ch">${ch}</span>`
        ).join('');
        // 끝에 크기 0짜리 표시를 붙여서 글자 기준선(baseline) 위치를 잴 수 있게 한다
        $(this).html(chars + '<i class="baseline"></i>');
    });

    // 2) 줄마다 글자 크기를 화면 너비에 꽉 차게 맞춘다
    //    100px 로 놓고 잰 너비와 실제 너비의 비율만큼 키우거나 줄인다
    function fitLines() {
        const width = $('.intro__name').width();
        $('.js-fit').each(function () {
            this.style.fontSize = '100px';
            this.style.fontSize = (100 * width / this.offsetWidth) + 'px';
        });
    }
    fitLines();

    // 6. 이메일 복사 (애니메이션과 상관없어서 먼저 연결)
    $('.js-copy').on('click', async function () {
        const $btn = $(this);
        try {
            await navigator.clipboard.writeText($btn.data('copy'));
            $btn.text('복사했습니다');
        } catch (e) {
            $btn.text($btn.data('copy'));
        }
        setTimeout(() => $btn.text('이메일 복사'), 2000);
    });

    // 필터 버튼 상태 바꾸기 (애니메이션 유무와 상관없이 공통)
    function setActiveFilter($btn) {
        $('.filter').removeClass('is-active').attr('aria-pressed', 'false');
        $btn.addClass('is-active').attr('aria-pressed', 'true');
    }

    if (reduceMotion) {
        $('.js-count').each(function () {
            $(this).text(counts[$(this).data('count-from')]);
        });
        $('.marquee').css({ width: 'auto', overflowX: 'auto' });
        $('.filter').on('click', function () {
            setActiveFilter($(this));
            renderArchive($(this).data('filter'));
        });
        $(window).on('resize', fitLines);
        return; // 아래 애니메이션은 모두 건너뜀
    }


    /* ---------------------------------------------------------
       1. 스크롤 진행 바: 문서 맨 위 0%, 맨 아래 100%
       --------------------------------------------------------- */
    gsap.to('.progress__bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });


    /* ---------------------------------------------------------
       2. 인트로
       --------------------------------------------------------- */
    const intro = document.querySelector('.js-intro');
    const ball = document.querySelector('.js-ball');
    $(intro).addClass('is-animated'); // 한 화면 고정 레이아웃으로 바꿈 (CSS 참고)

    const hopChars = $('.js-bounce-line .ch').not('.ch--space').toArray(); // Y O O K H Y E I N
    const lastChar = $('.js-last-line .ch').not('.ch--space').last()[0];   // 마지막 줄 끝 글자 R
    const measure = document.createElement('canvas').getContext('2d');      // 글자 높이 재는 용도

    // 공이 글자 ch 위에 올라섰을 때의 좌표 (인트로 섹션 왼쪽 위 기준)
    //  - x: 글자 가운데
    //  - y: 기준선에서 그 글자의 실제 높이만큼 올라간 곳 (O 처럼 둥근 글자는 조금 더 높음)
    function landing(ch) {
        const line = ch.parentElement;
        const style = getComputedStyle(line);
        measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const glyphTop = measure.measureText(ch.textContent).actualBoundingBoxAscent;

        const box = intro.getBoundingClientRect();
        const rect = ch.getBoundingClientRect();
        const baseline = line.querySelector('.baseline').getBoundingClientRect().top;
        const size = ball.offsetWidth;

        return {
            x: rect.left - box.left + rect.width / 2 - size / 2,
            y: baseline - glyphTop - box.top - size
        };
    }

    // 착지: 공은 납작해졌다 돌아오고, 밟힌 글자는 살짝 눌렸다 튀어 오른다
    function squash(ch) {
        return gsap.timeline()
            .to(ball, { scaleX: 1.4, scaleY: 0.6, transformOrigin: '50% 100%', duration: 0.06 })
            .to(ch, { yPercent: 6, duration: 0.06 }, 0)
            .to(ball, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
            .to(ch, { yPercent: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' }, '<');
    }

    // 한 번 뛰기: 옆으로는 일정하게(ease none), 위아래는 올라갈 때 느려지고 떨어질 때 빨라지게
    function hop(ch, duration) {
        const height = () => ball.offsetWidth * 2.6;
        // 꼭대기 = 지금 위치와 도착 위치 중 더 높은 쪽에서 height 만큼 위
        const peak = () => Math.min(gsap.getProperty(ball, 'y'), landing(ch).y) - height();

        return gsap.timeline()
            .to(ball, { x: () => landing(ch).x, duration: duration, ease: 'none' }, 0)
            .to(ball, { y: peak, duration: duration / 2, ease: 'power2.out' }, 0)
            .to(ball, { y: () => landing(ch).y, duration: duration / 2, ease: 'power2.in' }, duration / 2);
    }

    // 첫 화면 타임라인. 좌표는 함수로 넘겨서 "그 동작이 시작되는 순간" 재도록 했다
    // (글꼴이 늦게 불러와져 글자 크기가 바뀌어도 맞는 자리에 떨어짐)
    const bounceTl = gsap.timeline({ paused: true });
    bounceTl.from('.fit-line', { yPercent: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 });

    // 공이 위에서 첫 글자(Y)로 떨어짐
    bounceTl.set(ball, { opacity: 1, x: () => landing(hopChars[0]).x, y: -80 }, '-=0.2')
        .to(ball, { y: () => landing(hopChars[0]).y, duration: 0.55, ease: 'power2.in' });

    // t: 타임라인 위 현재 시간. 뛰기 -> 착지 -> 다음 뛰기 순서로 시간을 직접 쌓는다
    let t = bounceTl.duration();
    bounceTl.add(squash(hopChars[0]), t);
    t += 0.08;

    // 첫 줄 나머지 글자를 차례로 밟고, 마지막엔 크게 뛰어 마지막 줄 끝 글자에 착지
    hopChars.slice(1).concat(lastChar).forEach((ch) => {
        const duration = ch === lastChar ? 0.75 : 0.32;
        bounceTl.add(hop(ch, duration), t);
        t += duration;
        bounceTl.add(squash(ch), t);
        t += 0.08;
    });
    bounceTl.from('.js-scroll-hint', { opacity: 0, duration: 0.6 }, t + 0.3);

    // 글꼴이 준비되면 크기를 다시 맞추고 시작 (글꼴이 늦어도 1.5초 뒤엔 시작)
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
        fitLines();
        ScrollTrigger.refresh();
        bounceTl.play();
    });

    // 숫자를 0부터 목표값까지 올린다 (한 번만)
    let counted = false;
    function countUp() {
        if (counted) return;
        counted = true;
        $('.js-count').each(function () {
            const $el = $(this);
            const counter = { value: 0 };
            gsap.to(counter, {
                value: counts[$el.data('count-from')],
                duration: 1.4,
                ease: 'power2.out',
                onUpdate: () => $el.text(Math.round(counter.value))
            });
        });
    }

    // 스크롤: 인트로를 고정한 채, 공 자리에서 주황색 원이 퍼져 화면을 덮고 소개가 올라온다
    // 작은 공을 scale 로 키우면 가장자리가 흐려져서, 화면 전체 크기의 덮개(.js-cover)를
    // clip-path: circle() 로 동그렇게 잘라 두고 반지름을 키우는 방식으로 했다
    const cover = document.querySelector('.js-cover');
    const ballCenter = () => {
        const p = landing(lastChar);
        const r = ball.offsetWidth / 2;
        return { x: p.x + r, y: p.y + r, r: r };
    };

    const coverTl = gsap.timeline({
        scrollTrigger: {
            trigger: intro,
            start: 'top top',
            end: '+=160%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // 튕기는 중에 스크롤하면 튕기기를 바로 끝내고 스크롤 동작으로 넘어감
                // (0 이 아니라 0.01 과 비교: 처음 계산할 때 0.0000007 같은 값이 나올 수 있음)
                if (self.progress > 0.01 && bounceTl.progress() < 1) bounceTl.progress(1);
                $('.header').toggleClass('is-light', self.progress > 0.35);
            }
        }
    });

    // 고정이 풀린 뒤에도 주황 화면이 헤더 밑을 지나가므로, 다음 섹션이 헤더에 닿을 때 원래 색으로
    ScrollTrigger.create({
        trigger: '.featured',
        start: 'top top+=64',
        onEnter: () => $('.header').removeClass('is-light'),
        onLeaveBack: () => $('.header').addClass('is-light')
    });

    coverTl
        // 스크롤 0 일 때는 덮개를 숨겨 둔다 (튕기는 동안 원이 미리 보이지 않게)
        .fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0)
        .fromTo(cover,
            { clipPath: () => { const c = ballCenter(); return `circle(${c.r}px at ${c.x}px ${c.y}px)`; } },
            {
                // 화면 대각선 길이를 반지름으로 쓰면 어느 위치에서든 화면이 다 덮인다
                clipPath: () => `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${window.innerWidth / 2}px ${window.innerHeight / 2}px)`,
                duration: 1,
                ease: 'power2.in'
            }, 0)
        .to('.js-scroll-hint', { opacity: 0, duration: 0.2 }, 0)
        .fromTo('.js-about', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.85)
        .add(countUp, 1)
        .to({}, { duration: 0.6 }); // 소개 화면을 읽을 시간만큼 고정 유지

    // 창 크기가 바뀌면 글자 크기를 다시 맞추고, 멈춰 있는 공도 새 자리로
    let resizeTimer;
    $(window).on('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            fitLines();
            if (bounceTl.progress() === 1 && coverTl.scrollTrigger.progress === 0) {
                gsap.set(ball, { x: landing(lastChar).x, y: landing(lastChar).y });
            }
            ScrollTrigger.refresh();
        }, 200);
    });


    /* ---------------------------------------------------------
       3. 대표 작업: 가로 스크롤
       --------------------------------------------------------- */
    if (isDesktop) {
        const track = document.querySelector('.js-track');
        // 움직일 거리 = 카드 줄 전체 너비 - 화면 너비
        const getDistance = () => track.scrollWidth - window.innerWidth;

        gsap.to(track, {
            x: () => -getDistance(),
            ease: 'none',
            scrollTrigger: {
                trigger: '.featured',
                start: 'top top',
                end: () => '+=' + getDistance(), // 가로로 움직이는 만큼 세로 스크롤 길이를 확보
                pin: true,                       // 그동안 섹션을 화면에 고정
                scrub: 1,                        // 스크롤에 1초 정도 부드럽게 따라옴
                invalidateOnRefresh: true,       // 창 크기가 바뀌면 거리를 다시 계산
                onUpdate: (self) => {
                    const index = Math.min(FEATURED.length - 1, Math.floor(self.progress * FEATURED.length));
                    $('.js-current').text(pad(index + 1));
                }
            }
        });
    } else {
        // 모바일: 카드가 화면에 들어올 때 하나씩 올라온다
        gsap.utils.toArray('.work').forEach((work) => {
            gsap.from(work, {
                y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: work, start: 'top 85%' }
            });
        });
    }


    /* ---------------------------------------------------------
       4. 전체 작업
       --------------------------------------------------------- */

    // 처음: 줄이 화면에 들어오는 만큼씩 묶어서 차례로 등장
    gsap.set('.js-archive .row', { opacity: 0, y: 30 });
    ScrollTrigger.batch('.js-archive .row', {
        start: 'top 90%',
        once: true,
        onEnter: (rows) => gsap.to(rows, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 })
    });

    // 필터: 지금 목록을 위로 살짝 빼고 -> 새로 그린 뒤 -> 아래에서 올림
    let isFiltering = false;
    $('.filter').on('click', function () {
        const $btn = $(this);
        if (isFiltering || $btn.hasClass('is-active')) return; // 연타 방지
        isFiltering = true;
        setActiveFilter($btn);

        gsap.to('.js-archive .row', {
            opacity: 0, y: -12, duration: 0.25, stagger: 0.02,
            onComplete: () => {
                renderArchive($btn.data('filter'));
                gsap.fromTo('.js-archive .row',
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05,
                        onComplete: () => { isFiltering = false; }
                    }
                );
                ScrollTrigger.refresh(); // 목록 길이가 바뀌어서 아래 섹션 위치를 다시 잡음
            }
        });
    });


    /* ---------------------------------------------------------
       5. 배너
       --------------------------------------------------------- */

    // 같은 묶음이 두 번 붙어 있으니, 절반(-50%)만큼 가면 처음 모습과 같아진다 -> repeat 로 무한 반복
    const loops = gsap.utils.toArray('.js-marquee').map((row) => {
        const toLeft = row.dataset.direction === 'left';
        return gsap.fromTo(row,
            { xPercent: toLeft ? 0 : -50 },
            { xPercent: toLeft ? -50 : 0, duration: 60, ease: 'none', repeat: -1 }
        );
    });

    // 스크롤 속도(px/초)를 재서 빠를수록 흐름을 빠르게, 멈추면 원래 속도로
    ScrollTrigger.create({
        trigger: '.banners',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
            const speed = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5);
            loops.forEach((loop) => {
                gsap.to(loop, {
                    timeScale: speed,
                    duration: 0.2,
                    overwrite: true,
                    onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.2 })
                });
            });
        }
    });

    // 이미지가 다 불러와지면 높이가 바뀌므로 위치 다시 계산
    $(window).on('load', () => ScrollTrigger.refresh());
});
