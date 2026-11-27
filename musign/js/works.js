/* =========================================================
   작업 모음 페이지 스크립트 (뮤자인 지원용)
   jQuery: 화면 그리기, 이벤트 / GSAP + ScrollTrigger: 움직임

   0. 데이터(works-data.js, works-status.js)로 화면 그리기
   1. 스크롤 진행 바
   2. 인트로: 꼬마 악마가 Y, H 를 밟다가 H 에 쾅 내려찍으면 지진이 난 듯 글자가 무너진다.
      착지한 자리에 구멍이 생기고, 스크롤하면 구멍이 커지며 그 뒤의 소개와 숫자가 드러난다
   3. 작업 45개: PC에서 겹친 카드를 한 장씩 넘기다가, 끝까지 넘기면 콜라주로 흩어진다
      (카드 가로 세로 비율은 작업마다 다르다)
   4. 회사별 보기(색인 탭), 상세 창, 이메일 복사
   ========================================================= */

$(function () {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const pad = (n) => String(n).padStart(2, '0');
    const clamp = gsap.utils.clamp;           // clamp(최소, 최대, 값)
    const lerp = (a, b, t) => a + (b - a) * t;
    const status = (typeof WORK_STATUS !== 'undefined') ? WORK_STATUS : {};


    /* ---------------------------------------------------------
       0. 데이터로 화면 그리기
       --------------------------------------------------------- */

    // 썸네일: 직접 고른 이미지 > 캡처 프로그램이 찍은 이미지 > 없으면 제목 카드
    function thumbOf(work) {
        if (work.thumb) return work.thumb;
        if (status[work.id] && status[work.id].thumb) return `./images/works/${work.id}.jpg`;
        return '';
    }

    // 링크 상태: live(사이트로 이동) / dead(사이트가 바뀜) / none(로그인, 관리자 페이지)
    function linkOf(work) {
        if (!work.url) return 'none';
        if (work.dead) return 'dead';
        if (status[work.id] && status[work.id].ok === false) return 'dead';
        return 'live';
    }

    const textCard = (work) =>
        `<span class="card__text"><em>${work.company}</em><strong>${work.title}</strong></span>`;

    function mediaHtml(work) {
        const src = thumbOf(work);
        return src
            ? `<img src="${src}" alt="" loading="lazy" decoding="async">`
            : textCard(work);
    }

    // 같은 결과가 나오는 난수 (새로고침해도 카드 크기, 자리가 그대로)
    function seeded(seed) {
        let s = (seed + 1) * 9301 + 49297;
        return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    }

    // 카드 가로 비율(가로 / 세로). 높이는 모두 같고 가로만 작업 성격에 맞게 다르다
    //  - 직접 고른 이미지: 원본 비율 그대로 (800 x 600)
    //  - PC 사이트 캡처: 첫 화면을 가로로 넓게
    //  - 모바일 랜딩페이지 캡처: 세로로 길게, 장마다 조금씩 다르게
    //  - 이미지가 없는 작업(제목 카드): 정사각형 근처
    function ratioOf(work, i) {
        const pick = (list) => list[Math.floor(seeded(i * 17 + 3)() * list.length)];
        if (work.thumb) return 4 / 3;
        if (!thumbOf(work)) return pick([1, 0.82, 1.18]);
        if (work.series) return pick([0.75, 0.66, 0.58, 0.75]);
        return pick([1.6, 1.45]);
    }
    const ratios = WORKS.map(ratioOf);

    // 콜라주에 놓는 순서: 같은 묶음이 한 줄에 몰리지 않게 섞는다 (새로고침해도 같은 순서)
    const collageOrder = (() => {
        const rnd = seeded(99);
        const ids = WORKS.map((w, i) => i);
        for (let k = ids.length - 1; k > 0; k--) {
            const j = Math.floor(rnd() * (k + 1));
            [ids[k], ids[j]] = [ids[j], ids[k]];
        }
        return ids;
    })();

    const cardsHtml = WORKS.map((work, i) => `
        <button type="button" class="card${seeded(i * 7)() < 0.3 ? ' card--mat' : ''}" style="--r:${ratios[i].toFixed(3)}" data-index="${i}" data-cat="${work.cat}" aria-label="${work.title} 자세히 보기">
            <span class="card__inner">${mediaHtml(work)}<span class="card__no">${pad(i + 1)}</span></span>
            <span class="card__cap">${work.title}<small>${work.company}</small></span>
        </button>`).join('');

    $('.js-cards').html(cardsHtml);
    $('.js-total').text(pad(WORKS.length));

    // 회사별 보기 버튼에 개수 (위첨자)
    $('.filter').each(function () {
        const cat = $(this).data('filter');
        $(this).find('.js-n').text(cat === 'all' ? WORKS.length : WORKS.filter((w) => w.cat === cat).length);
    });

    // 이미지 파일이 없으면 제목 카드로 바꾼다
    $('.js-cards img').on('error', function () {
        const work = WORKS[$(this).closest('.card').data('index')];
        $(this).replaceWith(textCard(work));
    });

    // 인트로 숫자: 데이터 개수로 계산 (직접 세지 않음)
    const counts = {
        landing: WORKS.filter((w) => w.series).length,
        total: WORKS.length,
        featured: WORKS.filter((w) => w.featured).length
    };

    // 인트로 글자 준비: 글자마다 <span class="ch"><span class="ch__in">
    //  - .ch     : 쓰러질 때 움직이는 바깥 상자
    //  - .ch__in : 마우스에 반응하고, 밟히면 색이 바뀌는 안쪽 글자
    // 바깥과 안쪽을 나눠서, 쓰러진 글자도 마우스에 반응하게 했다
    const escapeChar = (c) => (c === '&' ? '&amp;' : c);
    $('.js-fit').each(function () {
        const chars = $(this).text().split('').map((c) =>
            c === ' ' ? '<span class="ch ch--space">&nbsp;</span>' : `<span class="ch"><span class="ch__in">${escapeChar(c)}</span></span>`
        ).join('');
        // 끝에 크기 0짜리 표시를 붙여 글자 기준선(baseline) 위치를 잰다
        $(this).html(chars + '<i class="baseline"></i>');
    });

    // 줄마다 글자 크기를 화면 너비에 꽉 차게: 100px 로 놓고 잰 너비 비율만큼 키운다
    function fitLines() {
        const width = $('.intro__name').width();
        $('.js-fit').each(function () {
            this.style.fontSize = '100px';
            this.style.fontSize = (100 * width / this.offsetWidth) + 'px';
        });
    }
    fitLines();

    // 이메일 복사
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


    /* ---------------------------------------------------------
       4-1. 상세 창
       --------------------------------------------------------- */
    const $modal = $('.js-modal');
    const panel = document.querySelector('.js-panel');
    let lastCard = null;

    function fillModal(work) {
        const meta = [`<span>${work.company}</span>`, `<span>${work.period}</span>`];
        if (work.seriesName) {
            const total = WORKS.filter((w) => w.seriesName === work.seriesName).length;
            meta.push(`<span class="is-series">${work.seriesName} ${total}개 중 하나</span>`);
        }
        $('.js-m-meta').html(meta.join(''));
        $('#modal-title').text(work.title);

        const role = work.role || (work.series && work.series.role) || '';
        const points = (work.points && work.points.length) ? work.points : (work.series ? work.series.points : []);
        const tech = (work.tech && work.tech.length) ? work.tech : (work.series ? work.series.tech : []);
        $('.js-m-role').text(role).toggle(!!role);
        $('.js-m-points').html(points.map((p) => `<li>${p}</li>`).join(''));
        $('.js-m-tech').html(tech.map((t) => `<li>${t}</li>`).join(''));

        const src = thumbOf(work);
        $('.js-m-media').html(src ? `<img src="${src}" alt="${work.title} 화면">` : textCard(work));
        $('.js-m-media img').on('error', function () { $(this).replaceWith(textCard(work)); });

        // 링크는 한 줄 따로. 살아 있으면 사이트로, 아니면 이유만 적는다
        const state = linkOf(work);
        let link;
        if (state === 'live') {
            link = `<a href="${work.url}" target="_blank" rel="noopener">사이트 보기 <span aria-hidden="true">&rarr;</span></a>`;
        } else if (state === 'dead') {
            link = '<span class="is-off">지금은 사이트가 바뀌어 링크를 걸지 않았습니다.</span>';
        } else {
            link = `<span class="is-off">${work.note || '공개되지 않은 페이지'}라 링크 대신 작업 내용을 정리했습니다.</span>`;
        }
        $('.js-m-link').html(link);
    }

    function openModal(card) {
        const work = WORKS[$(card).data('index')];
        lastCard = card;
        fillModal(work);
        $modal.prop('hidden', false);
        $('html').addClass('is-modal');
        panel.scrollTop = 0;
        panel.focus();

        if (reduceMotion) return;
        // 누른 카드 자리에서 창이 커지며 열린다
        const from = card.getBoundingClientRect();
        const to = panel.getBoundingClientRect();
        gsap.fromTo('.modal__backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(panel,
            {
                x: (from.left + from.width / 2) - (to.left + to.width / 2),
                y: (from.top + from.height / 2) - (to.top + to.height / 2),
                scale: Math.max(0.15, from.width / to.width),
                opacity: 0.3
            },
            { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
        // 사진은 크게 확대된 상태에서 천천히 제자리로, 글은 흐릿하다가 한 줄씩 또렷해진다
        gsap.fromTo('.js-m-media img', { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'power3.out' });
        gsap.fromTo('.modal__body > *',
            { opacity: 0, y: 18, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.07, delay: 0.25, ease: 'power2.out', clearProps: 'filter' });
    }

    function closeModal() {
        if ($modal.prop('hidden')) return;
        const done = () => {
            $modal.prop('hidden', true);
            $('html').removeClass('is-modal');
            if (lastCard) lastCard.focus({ preventScroll: true });
        };
        if (reduceMotion) return done();
        gsap.to('.modal__backdrop', { opacity: 0, duration: 0.3 });
        gsap.to(panel, { y: 40, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done });
    }

    $('.js-cards').on('click', '.card', function () { openModal(this); });
    $modal.on('click', '.js-close', closeModal);
    $(document).on('keydown', (e) => {
        if ($modal.prop('hidden')) return;
        if (e.key === 'Escape') closeModal();
        // 창 안에서만 Tab 이 돌게
        if (e.key === 'Tab') {
            const items = $(panel).find('a, button').filter(':visible').toArray();
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });


    /* ---------------------------------------------------------
       4-2. 회사별 보기
       - 모바일: 맞지 않는 카드를 숨긴다
       - PC: 맞는 카드만 콜라주로 다시 흩어 놓는다 (onFilter, 3번에서 넣음)
       --------------------------------------------------------- */
    let currentFilter = 'all';
    let onFilter = null;
    $('.filter').on('click', function () {
        const filter = $(this).data('filter');
        if (filter === currentFilter) return;
        currentFilter = filter;
        $('.filter').removeClass('is-active').attr('aria-pressed', 'false');
        $(this).addClass('is-active').attr('aria-pressed', 'true');
        // 맞지 않는 카드 표시 (모바일 슬라이드처럼 때를 늦춰 바꿔야 할 때가 있어 함수로 넘긴다)
        const apply = () => {
            $('.js-cards .card').each(function () {
                const off = filter !== 'all' && $(this).data('cat') !== filter;
                $(this).toggleClass('is-off', off).attr('tabindex', off ? -1 : null);
            });
        };
        if (onFilter) onFilter(filter, apply);
        else apply();
    });


    if (reduceMotion) {
        $('.js-count').each(function () { $(this).text(counts[$(this).data('count-from')]); });
        $('.js-replay').hide();
        $('.js-works').addClass('is-static');
        $('.js-odo').text('');
        $(window).on('resize', fitLines);
        return; // 아래 애니메이션은 모두 건너뜀
    }


    /* ---------------------------------------------------------
       1. 스크롤 진행 바
       --------------------------------------------------------- */
    gsap.to('.progress__bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });


    /* ---------------------------------------------------------
       2. 인트로
       - 꼬마 악마가 Y 를 밟고, H 로 튀면서 화면 쪽으로 조금 다가온다 (크기로 원근)
       - H 에서 높이 솟았다가 쾅 내려찍는다. 지진이 난 듯 화면이 흔들리고 글자가 한꺼번에 무너진다
       - 악마가 무너진 글자 더미 위에 착지하면 발밑에 동그란 구멍이 생긴다
       - 스크롤하면 악마가 구멍으로 쏙 빠지고, 구멍이 커지며 그 뒤에 있던 소개와 숫자가 드러난다
       - 공연하는 동안에는 스크롤을 막는다 (중간에 넘어가 깨진 화면이 보이지 않게)
       --------------------------------------------------------- */
    const intro = document.querySelector('.js-intro');
    const stage = document.querySelector('.js-stage');
    const devil = document.querySelector('.js-devil');
    const devilSvg = devil.querySelector('.devil__svg');
    const shadow = document.querySelector('.js-devil-shadow');
    const cracksSvg = document.querySelector('.js-cracks');
    const cover = document.querySelector('.js-cover');
    const about = document.querySelector('.js-about');
    $(intro).addClass('is-animated');

    const outers = $('.js-fit .ch').not('.ch--space').toArray();   // 무너지는 상자
    const inners = outers.map((o) => o.firstChild);                // 안쪽 글자
    const hopLine = $('.js-hop-line .ch').not('.ch--space').toArray(); // Y O O K H Y E I N
    const charY = hopLine[0];
    const charH = hopLine.find((c) => c.textContent === 'H');
    const measure = document.createElement('canvas').getContext('2d');

    gsap.set(devil, { transformPerspective: 600 });

    /* 스크롤 잠금 ------------------------------------------------
       공연하는 동안 휠, 터치, 키보드 스크롤을 막는다. 만약을 위해 9초 뒤에는 무조건 푼다 */
    let locked = false;
    let lockTimer = 0;
    const scrollKeys = [' ', 'Spacebar', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    window.addEventListener('wheel', (e) => { if (locked) e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (locked) e.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', (e) => { if (locked && scrollKeys.includes(e.key)) e.preventDefault(); });
    function lockScroll() {
        if (window.scrollY > 5) return; // 이미 내려와 있으면 막지 않는다
        locked = true;
        $('html').addClass('is-locked');
        clearTimeout(lockTimer);
        lockTimer = setTimeout(unlockScroll, 9000);
    }
    function unlockScroll() {
        locked = false;
        $('html').removeClass('is-locked');
        clearTimeout(lockTimer);
    }
    // 새로고침하면 항상 맨 위에서 시작 (브라우저가 이전 스크롤 위치를 되살리지 않게)
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    lockScroll();

    // 위치는 offsetLeft/offsetTop 으로 잰다 (무대 .intro__stage 기준)
    // transform 의 영향을 받지 않아서, 글자가 움직이는 중에 재도 원래 자리가 나온다
    function glyph(ch) {
        const line = ch.parentElement;
        const style = getComputedStyle(line);
        measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const ascent = measure.measureText(ch.textContent).actualBoundingBoxAscent; // 글자 실제 높이
        const baseline = line.offsetTop + line.querySelector('.baseline').offsetTop;
        return {
            cx: line.offsetLeft + ch.offsetLeft + ch.offsetWidth / 2,
            top: baseline - ascent,
            baseline: baseline,
            ascent: ascent,
            w: ch.offsetWidth,
            boxTop: line.offsetTop + ch.offsetTop,
            boxH: ch.offsetHeight
        };
    }

    // 악마가 글자 위에 섰을 때의 좌표. 발바닥(아래 가운데)을 기준으로 커지므로 크기와 상관없다
    function landing(ch) {
        const g = glyph(ch);
        return { x: g.cx - devil.offsetWidth / 2, y: g.top - devil.offsetHeight };
    }

    // 악마가 계속 하는 동작: 숨쉬기, 눈 깜빡임, 꼬리 흔들기
    gsap.to('.devil__bob', { scaleY: 0.96, scaleX: 1.03, transformOrigin: '50% 100%', duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.devil__tail', { rotation: 14, transformOrigin: '0% 100%', duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.timeline({ repeat: -1, repeatDelay: 2.4 })
        .to('.devil__eyes', { scaleY: 0.1, transformOrigin: '50% 60%', duration: 0.08, yoyo: true, repeat: 1 });

    // 그림자: 악마가 서 있는 바닥(surfaceY)에 깔린다. 높이 뜰수록 작고 흐려진다
    let surfaceY = null;
    let shadowOn = true;
    function drawShadow() {
        if (!shadowOn) { shadow.style.opacity = 0; return; }
        const alpha = gsap.getProperty(devil, 'opacity');
        if (surfaceY === null || alpha < 0.01) { shadow.style.opacity = 0; return; }
        const s = gsap.getProperty(devil, 'scale');
        const feet = gsap.getProperty(devil, 'y') + devil.offsetHeight;
        const air = Math.max(0, surfaceY - feet);
        const k = clamp(0, 1, 1 - air / (devil.offsetHeight * s * 2.2));
        gsap.set(shadow, {
            x: gsap.getProperty(devil, 'x') + devil.offsetWidth / 2,
            y: surfaceY,
            scale: s * (0.45 + 0.65 * k),
            opacity: alpha * (0.15 + 0.75 * k)
        });
    }
    gsap.ticker.add(drawShadow);

    // 착지: 살짝 눌렸다 돌아온다 (너무 납작해지지 않게 한도를 둔다)
    function squash(power) {
        const p = Math.min(power, 1.3);
        return gsap.timeline()
            .to(devilSvg, { scaleX: 1 + 0.18 * p, scaleY: 1 - 0.2 * p, transformOrigin: '50% 100%', duration: 0.05 })
            .to(devilSvg, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    }

    // 웅크리기 (뛰기 전)
    function crouch(time) {
        return gsap.timeline()
            .to(devilSvg, { scaleY: 0.82, scaleX: 1.1, transformOrigin: '50% 100%', duration: time, ease: 'power2.out' })
            .to(devilSvg, { scaleY: 1.05, scaleX: 0.96, duration: 0.08, ease: 'power2.in' })
            .to(devilSvg, { scaleY: 1, scaleX: 1, duration: 0.2 });
    }

    // 밟힌 글자: 주황색으로 바뀌고 눌렸다 튄다
    function stepOn(ch, power) {
        const inner = ch.firstChild;
        return gsap.timeline()
            .to(inner, { color: '#f0a63a', scaleY: 1 - 0.18 * power, scaleX: 1 + 0.05 * power, transformOrigin: '50% 100%', duration: 0.05 })
            .to(inner, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    }

    // 튀기: 옆으로는 부드럽게, 위아래는 올라갈 때 느려지고 떨어질 때 빨라지게.
    // 크기(scale)를 조금 키워 화면 쪽으로 다가오는 느낌만 준다
    function hop(ch, duration, height, peakScale, endScale) {
        const to = () => landing(ch);
        const peak = () => {
            const y = Math.min(gsap.getProperty(devil, 'y'), to().y) - height();
            return Math.max(y, devil.offsetHeight * (peakScale - 1) + 8); // 머리가 화면 밖으로 나가지 않게
        };
        const dir = () => (to().x >= gsap.getProperty(devil, 'x') ? 1 : -1);
        const half = duration / 2;
        return gsap.timeline()
            .to(devil, { x: () => to().x, duration: duration, ease: 'sine.inOut' }, 0)
            .to(devil, { y: peak, duration: half, ease: 'power2.out' }, 0)
            .to(devil, { y: () => to().y, duration: half, ease: 'power2.in' }, half)
            .to(devil, { scale: peakScale, duration: half, ease: 'sine.out' }, 0)
            .to(devil, { scale: endScale, duration: half, ease: 'sine.in' }, half)
            .to(devil, { rotation: () => dir() * 10, rotationX: -14, duration: half, ease: 'sine.out' }, 0)
            .to(devil, { rotation: 0, rotationX: 0, duration: half, ease: 'sine.in' }, half)
            .to('.devil__arm--l', { rotation: 35, svgOrigin: '19 76', duration: half, yoyo: true, repeat: 1 }, 0)
            .to('.devil__arm--r', { rotation: -35, svgOrigin: '81 76', duration: half, yoyo: true, repeat: 1 }, 0);
    }

    // 무너짐 계획: 글자마다 어느 쪽으로, 몇 도로, 어디까지 떨어질지 미리 정한다
    // (악마가 무너진 글자 더미 위에 설 높이도 여기서 계산)
    function planCollapse(impactCh) {
        const hit = glyph(impactCh);
        const floor = stage.clientHeight - Math.max(28, window.innerHeight * 0.06); // 바닥선
        const plan = outers.map((ch) => {
            const g = glyph(ch);
            const side = g.cx < hit.cx ? -1 : 1;                       // 내려찍은 곳에서 멀어지는 쪽으로
            const rot = side * gsap.utils.random(70, 110);
            const rad = rot * Math.PI / 180;
            // 돌아간 글자가 차지하는 세로 절반, 가로 절반
            const halfH = Math.abs(Math.cos(rad)) * g.ascent / 2 + Math.abs(Math.sin(rad)) * g.w / 2;
            const halfW = Math.abs(Math.sin(rad)) * g.ascent / 2 + Math.abs(Math.cos(rad)) * g.w / 2;
            const centerY = g.baseline - g.ascent / 2;                 // 글자 가운데 (회전 기준점)
            const dx = side * gsap.utils.random(0, g.w * 0.9);
            const dist = Math.hypot(g.cx - hit.cx, centerY - hit.top);
            return {
                x: dx,
                y: floor - halfH - centerY,
                rotation: rot,
                origin: `50% ${((centerY - g.boxTop) / g.boxH) * 100}%`,
                // 한꺼번에 무너지도록 지연은 아주 짧게 (가까운 글자가 아주 조금 먼저)
                delay: dist / 9000 + gsap.utils.random(0, 0.05),
                toss: gsap.utils.random(14, 40) * (1 - Math.min(1, dist / window.innerWidth)),
                left: g.cx + dx - halfW,
                right: g.cx + dx + halfW,
                top: floor - halfH * 2
            };
        });

        // 악마가 설 자리: 내려찍은 글자가 떨어진 자리에서, 그 아래 쌓인 글자 중 가장 높은 곳
        const restCx =  hit.cx;
        const below = plan.filter((p) => p.left < restCx && p.right > restCx);
        const pileTop = below.length ? Math.min(...below.map((p) => p.top)) : floor;
        const rest = { x: restCx - devil.offsetWidth / 2, y: pileTop - devil.offsetHeight * 0.92, floor: pileTop + devil.offsetHeight * 0.08 };
        return { plan, rest, hit };
    }

    // 지진: 처음엔 세게, 점점 잦아들게. 끝나면 transform 을 지워 무대가 겹침 순서를 따로 만들지 않게 한다
    // (그래야 악마가 구멍보다 위에 그려진다)
    function quake(power) {
        const tl = gsap.timeline();
        const steps = 20;
        for (let k = 0; k < steps; k++) {
            const a = power * Math.pow(1 - k / steps, 1.6);
            tl.to(stage, {
                x: gsap.utils.random(-1, 1) * a,
                y: gsap.utils.random(-1, 1) * a * 0.7,
                rotation: gsap.utils.random(-1, 1) * a * 0.035,
                duration: 0.045, ease: 'none'
            });
        }
        return tl.to(stage, { x: 0, y: 0, rotation: 0, duration: 0.08 }).set(stage, { clearProps: 'transform' });
    }

    // 잔금: 내려찍은 자리에서 사방으로 뻗는 가는 금. 선 길이만큼 dash 를 줘서 그려지듯 나타나게
    function drawCracks(cx, cy) {
        const W = intro.clientWidth;
        let html = '';
        const count = 9;
        for (let b = 0; b < count; b++) {
            let angle = (b / count) * Math.PI * 2 + gsap.utils.random(-0.3, 0.3);
            const len = W * gsap.utils.random(0.06, 0.2);
            let x = cx;
            let y = cy;
            let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
            const seg = 7;
            for (let k = 0; k < seg; k++) {
                angle += gsap.utils.random(-0.45, 0.45);
                x += Math.cos(angle) * len / seg;
                y += Math.sin(angle) * len / seg;
                d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            html += `<path d="${d}" stroke-width="${gsap.utils.random(1, 2.6).toFixed(1)}"/>`;
        }
        cracksSvg.innerHTML = html;
        const paths = cracksSvg.querySelectorAll('path');
        paths.forEach((p) => {
            const L = p.getTotalLength();
            p.style.strokeDasharray = L;
            p.style.strokeDashoffset = L;
        });
        return paths;
    }

    /* 구멍 --------------------------------------------------------
       hole.r0: 악마가 착지한 뒤 발밑에 생긴 작은 구멍의 반지름
       hole.p : 스크롤로 벌린 정도 (0 ~ 1). 1 이면 화면을 다 덮는다
       주황 판(.intro__cover)과 소개(.intro__about)에 같은 원을 잘라 넣어, 소개가 구멍 뒤에 있는 것처럼 보이게 */
    const hole = { r0: 0, p: 0 };
    let holeAt = { x: 0, y: 0 };
    function drawHole() {
        const w = intro.clientWidth;
        const h = intro.clientHeight;
        const far = Math.hypot(Math.max(holeAt.x, w - holeAt.x), Math.max(holeAt.y, h - holeAt.y)); // 가장 먼 모서리까지
        const r = lerp(hole.r0, far, hole.p);
        const clip = `circle(${r.toFixed(1)}px at ${holeAt.x.toFixed(1)}px ${holeAt.y.toFixed(1)}px)`;
        const visible = r > 0.5 ? 'visible' : 'hidden';
        cover.style.clipPath = clip;
        about.style.clipPath = clip;
        cover.style.visibility = visible;
        about.style.visibility = visible;
    }

    // 첫 등장 (한 번만): 글자가 아래에서 올라온다
    const entranceTl = gsap.timeline({ paused: true })
        .from('.fit-line', { yPercent: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 });

    // 숫자를 0부터 목표값까지 (한 번만)
    let counted = false;
    function countUp() {
        if (counted) return;
        counted = true;
        $('.js-count').each(function () {
            const $el = $(this);
            const counter = { value: 0 };
            gsap.to(counter, {
                value: counts[$el.data('count-from')], duration: 1.4, ease: 'power2.out',
                onUpdate: () => $el.text(Math.round(counter.value))
            });
        });
    }

    // 악마 공연 타임라인. 다시 세우기를 누를 때마다 새로 만든다
    let playTl = gsap.timeline({ paused: true });
    let collapse = null;
    let ready = false; // 글꼴이 준비되어 공연을 시작했는지

    function buildPlay() {
        const tl = gsap.timeline({ paused: true });
        collapse = planCollapse(charH);
        const hit = collapse.hit;
        holeAt = { x: collapse.rest.x + devil.offsetWidth / 2, y: collapse.rest.floor };
        hole.r0 = 0;
        drawHole();
        const crackPaths = drawCracks(holeAt.x, holeAt.y);
        const size = () => devil.offsetHeight;
        // 원근: 멀리(조금 작게) → 가까이(제 크기) → 높이 뛸 때 조금 더 크게
        const FAR = 0.78;
        const NEAR = 1;
        const UP = 1.4;
        const IMPACT = 1.08;

        // 위에서 Y 로 떨어짐
        tl.set(devil, { opacity: 1, rotation: 0, rotationX: 0, scale: FAR, x: () => landing(charY).x, y: () => -size() * 1.2 })
            .set(devilSvg, { y: 0, scale: 1, opacity: 1 })
            .call(() => { surfaceY = glyph(charY).top; })
            .to(devil, { y: () => landing(charY).y, duration: 0.38, ease: 'power2.in' });
        let t = tl.duration();
        tl.add(squash(0.8), t).add(stepOn(charY, 1), t);

        // 첫 번째 튕김: Y 에서 H 로, 화면 쪽으로 다가오며
        t += 0.06;
        tl.add(crouch(0.1), t);
        t += 0.12;
        tl.add(hop(charH, 0.6, () => size() * 1.5, 1.25, NEAR), t);
        t += 0.6;
        tl.add(squash(0.9), t).add(stepOn(charH, 1.2), t)
            .to(stage, { y: 4, duration: 0.04, yoyo: true, repeat: 1 }, t);

        // 두 번째: H 에서 높이 솟는다
        t += 0.08;
        tl.add(crouch(0.16), t);
        t += 0.2;
        const upY = () => Math.max(landing(charH).y - size() * 1.8, size() * 1.3);
        tl.to(devil, { y: upY, duration: 0.42, ease: 'power3.out' }, t)
            .to(devil, { scale: UP, rotationX: -16, rotation: -6, duration: 0.42, ease: 'power2.out' }, t)
            .to('.devil__arm--l', { rotation: 60, svgOrigin: '19 76', duration: 0.2 }, t)
            .to('.devil__arm--r', { rotation: -60, svgOrigin: '81 76', duration: 0.2 }, t);
        t += 0.42;
        tl.to(devil, { rotation: 6, duration: 0.06, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t);
        t += 0.14;
        // 쾅: 빠르게 내려찍는다
        tl.to(devil, { y: () => landing(charH).y, scale: IMPACT, rotationX: 0, rotation: 0, duration: 0.16, ease: 'power4.in' }, t)
            .to(['.devil__arm--l', '.devil__arm--r'], { rotation: 0, duration: 0.16 }, t);
        t += 0.16;

        // 충격: 지진, 잔금, 글자가 한꺼번에 튀었다가 무너진다
        tl.add(squash(1.3), t)
            .add(quake(24), t)
            .set(crackPaths, { opacity: 1 }, t)
            .to(crackPaths, { strokeDashoffset: 0, duration: 0.3, ease: 'power3.out', stagger: 0.02 }, t);
        outers.forEach((ch, i) => {
            const p = collapse.plan[i];
            const at = t + 0.03 + p.delay;
            tl.set(ch, { transformOrigin: p.origin }, t)
                .to(ch, { y: -p.toss, rotation: p.rotation * 0.08, duration: 0.1, ease: 'power2.out' }, at)
                .to(ch, { x: p.x, y: p.y, rotation: p.rotation, duration: gsap.utils.random(0.7, 1), ease: 'bounce.out' }, at + 0.1);
        });

        // 악마는 튕겨 올랐다가 무너진 글자 더미 위에 착지하고, 발밑에 동그란 구멍이 생긴다
        const up = t + 0.06;
        tl.to(devil, { y: () => landing(charH).y - size() * 1.1, scale: 1, duration: 0.3, ease: 'power2.out' }, up)
            .to(devil, { rotation: 16, duration: 0.3 }, up)
            .call(() => { surfaceY = collapse.rest.floor; }, null, up + 0.3)
            .to(devil, { y: collapse.rest.y, x: collapse.rest.x, duration: 0.4, ease: 'power2.in' }, up + 0.3)
            .to(devil, { rotation: 0, duration: 0.4 }, up + 0.3)
            .add(squash(0.9), up + 0.7)
            .to(hole, { r0: () => devil.offsetWidth * 0.85, duration: 0.45, ease: 'back.out(2.4)', onUpdate: drawHole }, up + 0.72)
            // 장난스럽게 좌우로 흔들며 웃기
            .to(devil, { rotation: 8, duration: 0.1, yoyo: true, repeat: 3, ease: 'sine.inOut' }, up + 0.95)
            .fromTo('.js-replay', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, up + 1)
            // 공연이 끝나면 스크롤을 풀고, 가만히 있으면 스크롤 안내를 띄운다
            .call(() => { unlockScroll(); armCue(); }, null, up + 1);

        return tl;
    }

    /* 스크롤 안내 --------------------------------------------------
       공연이 끝난 뒤 맨 위에서 스크롤하지 않고 가만히 있으면, 마우스 포인터 주변으로 동그라미가 퍼지며
       'Scroll' 안내가 나온다 (터치 화면에서는 화면 가운데) */
    const cue = document.querySelector('.js-scroll-cue');
    const cueRings = cue.querySelectorAll('.scroll-cue__ring');
    const ringTl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true })
        .fromTo(cueRings, { scale: 0.2, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.5, ease: 'power2.out', stagger: 0.28 });
    let cueOn = false;
    let cueTimer = 0;
    if (!hasMouse) cue.classList.add('is-touch');
    gsap.set(cue, { x: window.innerWidth / 2, y: window.innerHeight * 0.5 });

    function showCue() {
        if (cueOn || locked || playTl.progress() < 1 || coverTl.scrollTrigger.progress > 0.02 || !$modal.prop('hidden')) return;
        cueOn = true;
        cue.classList.add('is-on');
        ringTl.restart();
    }
    function hideCue() {
        clearTimeout(cueTimer);
        if (!cueOn) return;
        cueOn = false;
        cue.classList.remove('is-on');
        ringTl.pause();
    }
    function armCue() {
        clearTimeout(cueTimer);
        cueTimer = setTimeout(showCue, 1400);
    }
    if (hasMouse) {
        $(window).on('mousemove', (e) => {
            gsap.to(cue, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power3.out', overwrite: true });
        });
    }
    $(window).on('scroll', () => {
        hideCue();
        if (window.scrollY < 5 && !locked) armCue(); // 맨 위로 돌아오면 다시 기다린다
    });

    // 스크롤: 인트로를 고정한 채 악마가 구멍으로 빠지고, 구멍이 커지며 그 뒤의 소개와 숫자가 드러난다
    const coverTl = gsap.timeline({
        scrollTrigger: {
            trigger: intro,
            start: 'top top',
            end: '+=160%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // 잠금이 풀리기 전에 어떻게든 내려왔다면(스크롤바 끌기 등) 공연을 끝낸 상태로 맞춘다
                if (self.progress > 0.01 && ready) finishPlay();
                $(intro).toggleClass('is-covered', self.progress > 0.02);
                shadowOn = self.progress < 0.04;
                if (self.progress > 0.02) hideCue();
            }
        }
    });
    coverTl
        // 악마가 구멍으로 쏙 빠진다
        .fromTo(devilSvg, { y: 0, scale: 1, opacity: 1 }, {
            y: () => devil.offsetHeight * 0.9, scale: 0.3, opacity: 0, transformOrigin: '50% 100%',
            duration: 0.22, ease: 'power2.in', immediateRender: false
        }, 0)
        // 구멍이 커진다
        .fromTo(hole, { p: 0 }, { p: 1, duration: 1, ease: 'power2.in', immediateRender: false, onUpdate: drawHole }, 0)
        // 구멍 뒤의 소개가 살짝 올라오며 자리 잡는다
        .fromTo('.js-about > *', { y: 70 }, { y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.05, immediateRender: false }, 0.1)
        .add(countUp, 0.55)
        .to({}, { duration: 0.6 });

    // 공연을 바로 끝낸 상태로 (창 크기 변경, 스크롤바로 내려온 경우)
    function finishPlay() {
        if (entranceTl.progress() < 1) entranceTl.progress(1);
        if (playTl.progress() < 1) playTl.progress(1);
        unlockScroll();
    }

    // 글꼴이 준비되면 크기를 다시 맞추고 시작 (늦어도 1.5초 뒤엔 시작)
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
        fitLines();
        ScrollTrigger.refresh();
        ready = true;
        entranceTl.play();
        playTl = buildPlay();
        playTl.delay(0.6).play();
    });

    // 다시 세우기: 구멍이 닫히고, 무너진 글자가 일어서고, 악마가 다시 위에서 떨어진다
    $('.js-replay').on('click', function () {
        if (coverTl.scrollTrigger.progress > 0.01) return; // 0 이 아니라 0.01: 처음 계산 때 아주 작은 값이 나올 수 있음
        lockScroll();
        hideCue();
        playTl.kill();
        gsap.to(this, { autoAlpha: 0, duration: 0.2 });
        gsap.to(devil, { y: '-=' + (devil.offsetHeight * 3), opacity: 0, rotation: -40, duration: 0.4, ease: 'power2.in' });
        gsap.to(hole, { r0: 0, duration: 0.3, ease: 'power2.in', onUpdate: drawHole });
        gsap.to(cracksSvg.querySelectorAll('path'), { opacity: 0, duration: 0.3 });
        gsap.to(outers, {
            x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'back.out(1.4)',
            stagger: { each: 0.01, from: 'random' }
        });
        gsap.to([charY.firstChild, charH.firstChild], { color: getComputedStyle(charY.parentElement).color, duration: 0.5 });
        gsap.delayedCall(1.1, () => {
            playTl = buildPlay();
            playTl.play();
        });
    });

    // 마우스: 가까운 글자가 마우스를 피해 밀려나고 기울어진다. 악마 눈동자는 마우스를 따라본다
    if (hasMouse) {
        let mouse = null;
        let frame = 0;
        const pushed = outers.map(() => false);
        const pupils = gsap.utils.toArray('.devil__pupil');

        function react() {
            frame = 0;
            if (!mouse) return;
            const radius = Math.max(120, window.innerWidth * 0.11);
            outers.forEach((ch, i) => {
                const r = ch.getBoundingClientRect();
                const dx = (r.left + r.width / 2) - mouse.x;
                const dy = (r.top + r.height / 2) - mouse.y;
                const d = Math.hypot(dx, dy) || 1;
                const f = Math.max(0, 1 - d / radius);
                if (f === 0 && !pushed[i]) return;
                pushed[i] = f > 0;
                gsap.to(inners[i], {
                    x: dx / d * f * 26, y: dy / d * f * 26 - f * 12, rotation: dx / d * f * 22,
                    duration: 0.5, ease: 'power3.out', overwrite: 'auto'
                });
            });
            const box = devil.getBoundingClientRect();
            const angle = Math.atan2(mouse.y - (box.top + box.height * 0.55), mouse.x - (box.left + box.width / 2));
            gsap.to(pupils, { x: Math.cos(angle) * 2.6, y: Math.sin(angle) * 2.6, duration: 0.3, overwrite: 'auto' });
        }

        $(stage).on('mousemove', (e) => {
            mouse = { x: e.clientX, y: e.clientY };
            if (!frame) frame = requestAnimationFrame(react);
        }).on('mouseleave', () => {
            mouse = null;
            pushed.fill(false);
            gsap.to(inners, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
            gsap.to(pupils, { x: 0, y: 0, duration: 0.4 });
        });
    }

    // 창 크기가 바뀌면 글자 크기를 다시 맞추고, 공연이 끝난 상태로 새 크기에 맞게 다시 쌓는다
    let resizeTimer;
    let lastWidth = window.innerWidth;
    $(window).on('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth === lastWidth) return; // 모바일 주소창 때문에 높이만 바뀐 경우
            lastWidth = window.innerWidth;
            fitLines();
            if (ready) {
                playTl.kill();
                gsap.set(outers, { x: 0, y: 0, rotation: 0 });
                playTl = buildPlay();
                playTl.progress(1);
                unlockScroll();
            }
            ScrollTrigger.refresh();
            drawHole();
        }, 200);
    });


    /* ---------------------------------------------------------
       3. 작업 45개
       --------------------------------------------------------- */
    const section = document.querySelector('.js-works');
    const cards = gsap.utils.toArray('.card');
    const n = cards.length;
    const tabs = gsap.utils.toArray('.filter');

    // 밝은 판이 둥근 카드처럼 올라오다가 화면을 꽉 채운다 (clip-path inset 의 여백과 모서리를 0 으로)
    gsap.fromTo(section,
        { clipPath: 'inset(6vh 5vw 0vh 5vw round 56px)' },
        {
            clipPath: 'inset(0vh 0vw 0vh 0vw round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true }
        });

    // 헤더 글자색: 주황 구멍이 화면을 덮기 시작할 때부터 밝은 작업 판이 헤더 밑을 지나갈 때까지는 어둡게
    // lightEnd: 작업 판 아래쪽 끝이 헤더에 닿는 스크롤 위치
    function setupHeader(lightEnd) {
        const cover = coverTl.scrollTrigger;
        const update = () => {
            const y = window.scrollY;
            const from = cover.start + (cover.end - cover.start) * 0.35;
            $('.header').toggleClass('is-light', y >= from && y < lightEnd());
        };
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
        update();
    }

    if (!isDesktop) {
        // 모바일 1) 대표 작업 겹친 카드: 화면을 잠깐 고정하고, 아래에서 비스듬히 누워 기다리던 카드가
        //          한 장씩 올라와 똑바로 서고, 지나간 카드는 위로 젖혀지며 사라진다
        const featIds = WORKS.map((w, i) => i).filter((i) => WORKS[i].featured);
        const mstack = document.querySelector('.js-mstack');
        const mstage = mstack.querySelector('.js-mstack-stage');
        const minfo = mstack.querySelector('.js-mstack-info');
        // 대표 작업 카드를 복제해 쓴다 (아래 전체 목록에도 같은 카드가 있으므로 화면 읽기 프로그램에는 숨김)
        featIds.forEach((i) => {
            const clone = cards[i].cloneNode(true);
            clone.setAttribute('tabindex', '-1');
            clone.setAttribute('aria-hidden', 'true');
            mstage.appendChild(clone);
        });
        $(section).addClass('is-mstack');
        const mcards = gsap.utils.toArray(mstage.children);
        const mcount = mcards.length;
        $(mstage).on('click', '.card', function () { openModal(this); });
        gsap.set(mcards, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });

        const mstate = { p: 0 };
        let mcurrent = -1;
        function renderStack() {
            const H = mstage.clientHeight;
            mcards.forEach((card, i) => {
                const d = i - mstate.p;
                let y, z, rotationX, opacity, scale;
                if (d >= 0) {
                    // 기다리는 카드: 아래쪽에 뒤로 누운 채 겹쳐 있다
                    y = d * H * 0.07 + clamp(0, 1, d) * H * 0.08;
                    z = -d * 140;
                    rotationX = 48 * clamp(0, 1, d);
                    opacity = 1 - clamp(0, 1, d - 3);
                    scale = 1 - clamp(0, 1, d) * 0.06;
                } else {
                    // 지나간 카드: 위로 올라가며 앞으로 젖혀져 사라진다
                    const k = Math.max(d, -1.4);
                    y = k * H * 0.55;
                    z = -k * 60;
                    rotationX = 40 * k;
                    opacity = clamp(0, 1, 1 + d * 1.4);
                    scale = 1;
                }
                gsap.set(card, {
                    y: y, z: z, rotationX: rotationX, scale: scale, opacity: opacity,
                    visibility: opacity < 0.01 ? 'hidden' : 'visible',
                    zIndex: 100 - Math.round(Math.abs(d) * 2)
                });
            });
            const index = Math.round(clamp(0, mcount - 1, mstate.p));
            if (index !== mcurrent) {
                mcurrent = index;
                const w = WORKS[featIds[index]];
                minfo.innerHTML = `<p class="mstack__count">${pad(index + 1)} <span>/ ${pad(mcount)}</span> 대표 작업</p>
                    <h3 class="mstack__title">${w.title}</h3><p class="mstack__meta">${w.company} · ${w.period}</p>`;
                gsap.fromTo(minfo.children,
                    { opacity: 0, y: 12, filter: 'blur(6px)' },
                    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.05, ease: 'power2.out', overwrite: true });
            }
        }
        gsap.timeline({
            onUpdate: renderStack,
            scrollTrigger: {
                trigger: mstack,
                start: 'top top',
                end: () => '+=' + window.innerHeight * (0.7 * (mcount - 1) + 0.4),
                pin: true,
                pinSpacing: true, // 부모(.works)가 flex 라서 기본값이 false 가 된다. 고정된 동안 아래 목록이 밀려 내려가게
                scrub: 0.5,
                invalidateOnRefresh: true,
                onRefresh: renderStack
            }
        })
            .to(mstate, { p: mcount - 1, duration: mcount - 1, ease: 'none' })
            .to({}, { duration: 0.5 });
        renderStack();

        // 모바일 2) 전체 목록: 카드마다 다른 방향에서 비스듬히 들어와, 화면 위로 올라오면서 제자리에 선다
        const entries = [
            { rotationX: 58, y: 70, z: -160, transformOrigin: '50% 100%' },   // 아래에서 누운 채
            { rotationY: -62, x: -90, z: -120, transformOrigin: '0% 50%' },   // 왼쪽에서 문 열리듯
            { rotationY: 62, x: 90, z: -120, transformOrigin: '100% 50%' },   // 오른쪽에서 문 열리듯
            { rotationX: -50, y: -30, z: -140, transformOrigin: '50% 0%' },   // 위로 젖힌 채
            { scale: 0.55, rotation: -9, z: -220, transformOrigin: '50% 50%' } // 멀리서 돌며 다가옴
        ];
        cards.forEach((card, i) => {
            const from = entries[Math.floor(seeded(i * 5 + 2)() * entries.length)];
            gsap.fromTo(card,
                Object.assign({ opacity: 0 }, from),
                {
                    x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotation: 0, scale: 1, opacity: 1, ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 102%', end: 'top 64%', scrub: 0.5 }
                });
        });
        // 색인 탭: 전체 목록이 화면에 들어오면 아래에서 차례로 올라온다
        gsap.from(tabs, {
            yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: '.js-cards', start: 'top 80%', once: true }
        });
        // 회사별 보기: 지금 카드 묶음이 통째로 오른쪽으로 빠지고, 고른 회사 카드 묶음이 왼쪽에서 밀려 들어온다
        const list = document.querySelector('.js-cards');
        let sliding = null;
        onFilter = (filter, apply) => {
            if (sliding) sliding.progress(1);
            sliding = gsap.timeline({ onComplete: () => { sliding = null; } })
                .to(list, { xPercent: 110, opacity: 0, duration: 0.4, ease: 'power2.in' })
                .add(() => {
                    apply();
                    ScrollTrigger.refresh(); // 카드 수가 바뀌어 페이지 길이가 달라졌으니 다시 잰다
                    const top = list.getBoundingClientRect().top + window.scrollY - 90;
                    if (window.scrollY > top) window.scrollTo(0, top);
                })
                .fromTo(list, { xPercent: -110, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
        };
        const sectionEnd = ScrollTrigger.create({ trigger: section, start: 'bottom top+=64' });
        setupHeader(() => sectionEnd.start);
        $(window).on('load', () => ScrollTrigger.refresh());
        return;
    }

    const info = document.querySelector('.js-info');
    const track = document.querySelector('.js-steps-track');
    const stepItems = gsap.utils.toArray('.steps__item');
    const featuredCount = WORKS.filter((w) => w.featured).length; // 앞쪽 대표 작업 5장은 천천히
    const easeMorph = gsap.parseEase('power3.inOut');

    // state.p: 맨 앞 카드 번호 (0 ~ 45, 중간값 있음) / state.g: 콜라주로 펼쳐진 정도 (0 ~ 1)
    const state = { p: 0, g: 0 };
    const par = { x: 0, y: 0 };   // 마우스 위치에 따라 콜라주가 살짝 움직이는 양 (카드마다 깊이가 달라 입체감)
    let current = -1;
    let gridOn = false;
    let phase = -1;
    let hovered = -1;

    // 콜라주에서 마우스를 올린 카드: 2배로 커지고 주변 카드는 비켜난다
    // focus[i].k: 확대된 정도 (0 ~ 1). 다른 카드로 옮겨 가도 이전 카드가 부드럽게 돌아가게 카드마다 따로 둔다
    const focus = cards.map(() => ({ k: 0 }));
    const focusing = new Set(); // k 가 0 보다 큰 카드 번호
    function setHovered(idx) {
        if (idx === hovered) return;
        hovered = idx;
        focus.forEach((f, i) => {
            const to = i === idx ? 1 : 0;
            if (!to && !focusing.has(i)) return;
            focusing.add(i);
            gsap.to(f, {
                k: to, duration: to ? 0.55 : 0.45, ease: 'power3.out', overwrite: true,
                onUpdate: requestRender,
                onComplete: () => { if (!to) focusing.delete(i); }
            });
        });
        requestRender();
    }

    // 한 프레임에 한 번만 그리기: 스크롤, 필터, 마우스가 동시에 그려 달라고 해도 묶어서 처리
    let needsRender = false;
    const requestRender = () => { needsRender = true; };
    gsap.ticker.add(() => { if (needsRender) render(); });

    // 콜라주 칸: 카드마다 목표 위치(x, y), 크기(s), 투명도(o), 겹침 순서(z), 깊이(depth)
    const cells = cards.map(() => ({ x: 0, y: 0, s: 0.3, o: 1, z: 1, depth: 1, rot: 0 }));

    gsap.set(cards, { xPercent: -50, yPercent: -50, transformPerspective: 1400 });

    // 굴러가는 숫자 카운터: 두 자리 각각 0~9 를 세로로 쌓고 yPercent 로 옮긴다
    const odo = document.querySelector('.js-odo');
    odo.innerHTML = [0, 1].map(() =>
        `<span class="odo__col">${'0123456789'.split('').map((d) => `<span>${d}</span>`).join('')}</span>`
    ).join('');
    const odoCols = odo.querySelectorAll('.odo__col');
    function setCounter(num) {
        pad(num).split('').forEach((d, k) => {
            gsap.to(odoCols[k], { yPercent: -10 * Number(d), duration: 0.6, ease: 'power3.out', overwrite: true });
        });
    }

    // 콜라주 배치: 보이는 카드 수에 맞춰 칸을 나누고, 칸 안에서 위치와 크기, 기울기를 조금씩 흩트린다.
    // 카드 비율은 작업마다 그대로 두고(넓이를 기준으로 크기를 정함), 대표 작업은 크게(다른 카드 밑에 깔리게)
    let stackUnit = 300; // 겹친 카드 단계에서 카드 간격의 기준 (카드 높이의 3/4)
    let box = null;      // 콜라주 무대 크기 (확대한 카드가 화면 밖으로 나가지 않게 render 에서 씀)
    function layoutCollage(filter, animate) {
        const head = document.querySelector('.js-works-head');
        const filters = document.querySelector('.js-filters');
        const W = section.clientWidth;
        const H = section.clientHeight;
        const side = parseFloat(getComputedStyle(head).left);
        const top = head.offsetTop + head.offsetHeight + 24;
        const bottom = filters.offsetTop - 18;
        const areaW = W - side * 2;
        const areaH = bottom - top;
        const cardH = cards[0].offsetHeight; // 모든 카드의 원래 높이가 같다 (가로만 비율대로)
        stackUnit = cardH * 0.75;
        const ids = collageOrder.filter((i) => filter === 'all' || WORKS[i].cat === filter);
        const count = ids.length;
        // 칸이 정사각형에 가깝게 열 수를 정한다
        const cols = Math.min(count, Math.max(1, Math.round(Math.sqrt(count * areaW / areaH))));
        const rows = Math.ceil(count / cols);
        const cellW = areaW / cols;
        const cellH = areaH / rows;
        const baseArea = cellW * cellH * 0.48;
        // 카드의 원래 자리(가운데 기준) = 무대의 left 60%, top 56%
        const baseX = W * 0.6;
        const baseY = H * 0.56;
        box = { W, side, top, bottom, baseX, baseY, cardH };

        // 칸 배정: 큰 대표 작업은 한쪽에 몰리지 않게 대각선으로 흩어 놓고, 나머지는 빈 칸을 차례로 채운다
        const big = (i) => WORKS[i].featured && count > 6;
        const feats = ids.filter(big);
        const slots = new Array(count).fill(-1);
        feats.forEach((i, j) => {
            const r = Math.min(rows - 1, Math.floor(j * rows / feats.length));
            const c = Math.min(cols - 1, Math.floor((j + 0.5) * cols / feats.length));
            let slot = Math.min(count - 1, r * cols + c);
            while (slots[slot] !== -1) slot = (slot + 1) % count;
            slots[slot] = i;
        });
        let free = 0;
        ids.filter((i) => !big(i)).forEach((i) => {
            while (slots[free] !== -1) free += 1;
            slots[free] = i;
        });

        // 보기에서 빠지는 카드: 제자리에서 작아지며 사라진다
        const targets = cells.map((c) => ({ x: c.x, y: c.y, s: c.s * 0.6, o: 0, z: c.z, depth: c.depth, rot: c.rot }));
        slots.forEach((i, k) => {
            const rnd = seeded(i * 13 + 5);
            const row = Math.floor(k / cols);
            const col = k % cols;
            const inRow = row === rows - 1 ? count - row * cols : cols;
            const shift = (cols - inRow) * cellW / 2; // 마지막 줄은 가운데로
            const isBig = big(i);
            const factor = isBig ? 3.4 : (rnd() < 0.18 ? 1.8 : gsap.utils.interpolate(0.5, 1.15, rnd()));
            // 넓이로 크기를 정하면 가로로 긴 카드와 세로로 긴 카드가 비슷한 무게로 보인다
            let w = Math.sqrt(baseArea * factor * ratios[i]);
            let h = w / ratios[i];
            const capW = Math.min(areaW * 0.42, cellW * (isBig ? 2.6 : 1.6));
            const capH = Math.min(areaH * 0.85, cellH * (isBig ? 2.6 : 1.6));
            const fit = Math.min(1, capW / w, capH / h);
            w *= fit;
            h *= fit;
            const cx = clamp(side + w / 2, W - side - w / 2, side + shift + col * cellW + cellW / 2 + (rnd() - 0.5) * cellW * 0.5);
            const cy = clamp(top + h / 2, bottom - h / 2, top + row * cellH + cellH / 2 + (rnd() - 0.5) * cellH * 0.45);
            targets[i] = {
                x: cx - baseX, y: cy - baseY, s: h / cardH, o: 1,
                z: isBig ? 2 + k : 20 + Math.round(rnd() * 40),
                depth: gsap.utils.interpolate(0.4, 1.4, rnd()),
                rot: isBig ? (rnd() - 0.5) * 3 : (rnd() - 0.5) * 9
            };
        });

        cells.forEach((cell, i) => {
            if (!animate) {
                Object.assign(cell, targets[i]);
                return;
            }
            cell.z = targets[i].z;
            gsap.to(cell, {
                x: targets[i].x, y: targets[i].y, s: targets[i].s, o: targets[i].o, depth: targets[i].depth, rot: targets[i].rot,
                duration: 1, delay: Math.random() * 0.25, ease: 'power3.inOut', overwrite: true,
                onUpdate: requestRender
            });
        });
    }

    // 맨 앞 카드 설명 바꾸기 (흐릿하다가 또렷해지며 올라온다)
    function showInfo(index) {
        const w = WORKS[index];
        const badge = w.featured ? '<span class="info__badge">대표 작업</span>' : '';
        const role = w.role || (w.series && w.series.role) || '';
        info.innerHTML = `${badge}<p class="info__meta"><span>${w.company}</span><span>${w.period}</span></p>
            <h3 class="info__title">${w.title}</h3><p class="info__role">${role}</p>
            <p class="info__hint">카드를 누르면 작업 내용을 볼 수 있습니다</p>`;
        gsap.fromTo(info.children,
            { opacity: 0, y: 16, filter: 'blur(8px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.04, ease: 'power2.out', overwrite: true });
        setCounter(index + 1);
    }

    function render() {
        needsRender = false;
        const unit = stackUnit;
        const g = state.g;

        cards.forEach((card, i) => {
            const d = i - state.p; // 0: 맨 앞, 1: 바로 뒤, -1: 이미 넘어간 카드
            let x, y, z, rotationY, opacity;
            let rotation = 0;

            if (d >= 0) {
                // 뒤에서 기다리는 카드: 오른쪽 뒤로 비스듬히 줄 서 있다 (5장 넘게 뒤는 숨김)
                x = d * unit * 0.3;
                y = -d * 14;
                z = -d * 150;
                rotationY = -38 * clamp(0, 1, d);
                opacity = 1 - clamp(0, 1, d - 4);
            } else {
                // 넘어간 카드: 왼쪽으로 빠지며 사라진다 (너무 멀리 가지 않게 -1.5장에서 멈춤)
                const k = Math.max(d, -1.5);
                x = k * unit * 1.3;
                y = 0;
                z = 0;
                rotationY = 25 * clamp(0, 1, -k);
                opacity = clamp(0, 1, 1 + d * 1.5);
            }
            let scale = 1;
            let zIndex = 100 - Math.round(Math.abs(d) * 2);

            // 콜라주로 펼치기: 앞 번호 카드부터 차례로 제자리에 들어간다
            if (g > 0) {
                const t = easeMorph(clamp(0, 1, (g - (i / (n - 1)) * 0.5) / 0.5));
                const c = cells[i];
                x = lerp(x, c.x + par.x * c.depth, t);
                y = lerp(y, c.y + par.y * c.depth, t);
                z = lerp(z, 0, t);
                rotationY = lerp(rotationY, 0, t);
                rotation = c.rot * t;
                opacity = lerp(opacity, c.o, t);
                scale = lerp(1, c.s, t);
                if (g > 0.95) zIndex = i === hovered ? 500 : (focus[i].k > 0.02 ? 400 : c.z);

                // 마우스를 올린 카드와 그 주변
                if (g > 0.95 && focusing.size && box) {
                    const f = focus[i].k;
                    if (f > 0) {
                        // 2배로 (무대에 다 들어오는 만큼만). 커져도 무대 밖으로 나가지 않게 안쪽으로 당긴다
                        const w = card.offsetWidth * c.s;
                        const h = box.cardH * c.s;
                        const to = Math.max(1, Math.min(2, (box.bottom - box.top) * 0.92 / h, (box.W - box.side * 2) * 0.6 / w));
                        const ax = box.baseX + x;
                        const ay = box.baseY + y;
                        const hw = w * to / 2;
                        const hh = h * to / 2;
                        x += (clamp(box.side + hw, box.W - box.side - hw, ax) - ax) * f;
                        y += (clamp(box.top + hh, box.bottom - hh, ay) - ay) * f;
                        scale *= lerp(1, to, f);
                        rotation *= 1 - f;
                    }
                    // 커지는 카드 옆에 있으면: 그 카드에서 멀어지는 쪽으로, 주로 좌우로 밀리며 살짝 작아진다
                    focusing.forEach((j) => {
                        if (j === i) return;
                        const fj = focus[j].k;
                        const cj = cells[j];
                        const wj = cards[j].offsetWidth * cj.s;
                        const hj = box.cardH * cj.s;
                        const dx = c.x - cj.x;
                        const dy = c.y - cj.y;
                        const near = clamp(0, 1, 1 - Math.hypot(dx / (wj * 1.4), dy / (hj * 1.4)) / 2.2);
                        if (!near) return;
                        const amt = fj * near;
                        x += (dx < 0 ? -1 : 1) * wj * 0.75 * amt;
                        y += Math.sign(dy) * hj * 0.3 * amt;
                        scale *= 1 - 0.12 * amt;
                    });
                }
            }

            gsap.set(card, {
                x: x, y: y, z: z, rotationY: rotationY, rotation: rotation, scale: scale, opacity: opacity,
                visibility: opacity < 0.01 ? 'hidden' : 'visible',
                zIndex: zIndex
            });
        });

        // 겹친 카드 단계: 맨 앞 카드 설명
        const index = Math.round(clamp(0, n - 1, state.p));
        if (index !== current) { current = index; showInfo(index); }
        gsap.set([info, '.js-counter'], { autoAlpha: 1 - clamp(0, 1, g * 4) });
        // 색인 탭은 콜라주가 거의 펼쳐졌을 때 아래에서 차례로 올라오고, 바로 가기 버튼은 사라진다
        const rise = clamp(0, 1, (g - 0.55) * 2.5);
        tabs.forEach((tab, k) => gsap.set(tab, { yPercent: 115 * (1 - clamp(0, 1, rise * 1.6 - k * 0.2)) }));
        gsap.set('.js-skip', { autoAlpha: 1 - clamp(0, 1, g * 3) });

        // 단계 표시: Selected(대표 5장) / All works(나머지) / Index(콜라주)
        let ph;
        let prog;
        if (g > 0) { ph = 2; prog = g; }
        else if (state.p > featuredCount - 1) { ph = 1; prog = (state.p - (featuredCount - 1)) / (n - featuredCount); }
        else { ph = 0; prog = state.p / (featuredCount - 1); }
        stepItems.forEach((el, k) => el.style.setProperty('--p', (k < ph ? 100 : k === ph ? prog * 100 : 0) + '%'));
        if (ph !== phase) {
            const el = stepItems[ph];
            const x = -(el.offsetLeft + el.offsetWidth / 2); // 지금 단계를 가운데로
            if (phase === -1) gsap.set(track, { x: x });
            else gsap.to(track, { x: x, duration: 0.9, ease: 'power3.inOut', overwrite: true });
            phase = ph;
        }

        const on = g > 0.95;
        if (on !== gridOn) {
            gridOn = on;
            $(section).toggleClass('is-grid', on);
            if (!on) setHovered(-1);
            updateCursor();
        }
    }

    // 스크롤 길이(화면 높이 배수): 대표 작업은 장당 0.55, 나머지는 0.09, 콜라주 펼치기 1.6, 멈춤 0.5
    const SPEED = { featured: 0.55, rest: 0.09, grid: 1.6, hold: 0.5 };
    const TOTAL = (featuredCount - 1) * SPEED.featured + (n - featuredCount) * SPEED.rest + SPEED.grid + SPEED.hold;
    const worksTl = gsap.timeline({
        onUpdate: requestRender,
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + window.innerHeight * TOTAL,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: () => { layoutCollage(currentFilter, false); render(); }
        }
    });
    worksTl
        .to(state, { p: featuredCount - 1, duration: (featuredCount - 1) * SPEED.featured, ease: 'none' })
        .to(state, { p: n - 1, duration: (n - featuredCount) * SPEED.rest, ease: 'none' })
        .addLabel('grid')
        .to(state, { g: 1, duration: SPEED.grid, ease: 'none' })
        .addLabel('gridDone')
        .to({}, { duration: SPEED.hold });

    // 회사별 보기: 맞는 카드만 다시 흩어 놓는다
    onFilter = (filter, apply) => {
        apply();
        layoutCollage(filter, true);
    };

    // 전체 한눈에 보기: 콜라주가 다 펼쳐진 위치로 스크롤
    $('.js-skip').on('click', () => {
        const st = worksTl.scrollTrigger;
        const top = st.start + (st.end - st.start) * (worksTl.labels.gridDone / worksTl.duration());
        window.scrollTo({ top: top + 2, behavior: 'smooth' });
    });

    // 마우스 커서: 유리 원은 천천히 따라오고(Scroll / View), 콜라주 카드 위에서는 십자선과 작업 이름
    const cursor = document.querySelector('.js-cursor');
    const glass = document.querySelector('.js-cursor-glass');
    const pin = document.querySelector('.js-cursor-pin');
    const cursorText = document.querySelector('.js-cursor-text');
    const cursorLabel = document.querySelector('.js-cursor-label');
    let overCard = -1;
    let overButton = false;

    function updateCursor() {
        const onCard = overCard > -1;
        $(cursor)
            .toggleClass('is-card', onCard && gridOn)
            .toggleClass('is-hidden', overButton)
            .toggleClass('is-small', gridOn && !onCard && !overButton);
        cursorText.textContent = gridOn ? '' : (onCard ? 'View' : 'Scroll');
        if (onCard && gridOn) cursorLabel.textContent = WORKS[overCard].title;
    }

    if (hasMouse) {
        $('html').addClass('has-cursor');
        const move = (e, instant) => {
            const d = instant ? 0 : 1;
            gsap.to(pin, { x: e.clientX, y: e.clientY, duration: 0.15 * d, ease: 'power3.out', overwrite: true });
            gsap.to(glass, { x: e.clientX, y: e.clientY, duration: 0.7 * d, ease: 'power3.out', overwrite: true });
        };
        let mouse = null;

        // 마우스 아래에 무엇이 있는지 보고 커서 모양을 정한다
        // (마우스를 움직일 때뿐 아니라 스크롤할 때도: 가만히 있어도 카드가 지나가므로)
        function checkUnder() {
            if (!mouse) return;
            const box = section.getBoundingClientRect();
            const inside = mouse.x >= box.left && mouse.x <= box.right && mouse.y >= box.top && mouse.y <= box.bottom;
            cursor.classList.toggle('is-on', inside);
            const el = inside ? document.elementFromPoint(mouse.x, mouse.y) : null;
            const cardEl = el ? el.closest('.card') : null;
            const idx = cardEl ? Number(cardEl.dataset.index) : -1;
            const btn = !cardEl && !!(el && el.closest('button'));
            if (idx !== overCard || btn !== overButton) {
                overCard = idx;
                overButton = btn;
                setHovered(gridOn ? idx : -1);
                requestRender();
                updateCursor();
            }
        }
        let scrollFrame = 0;
        $(window).on('scroll', () => {
            if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; checkUnder(); });
        });

        $(section).on('mouseenter', (e) => {
            move(e, true);
        }).on('mouseleave', () => {
            cursor.classList.remove('is-on');
            mouse = null;
            overCard = -1;
            setHovered(-1);
            requestRender();
        }).on('mousemove', (e) => {
            mouse = { x: e.clientX, y: e.clientY };
            move(e, false);
            checkUnder();
            // 콜라주에서는 마우스 반대쪽으로 카드들이 깊이에 따라 조금씩 밀린다
            if (gridOn) {
                const box = section.getBoundingClientRect();
                gsap.to(par, {
                    x: -((e.clientX - box.left) / box.width - 0.5) * 40,
                    y: -((e.clientY - box.top) / box.height - 0.5) * 30,
                    duration: 1.2, ease: 'power3.out', overwrite: true, onUpdate: requestRender
                });
            }
        });
    }

    layoutCollage('all', false);
    render();
    updateCursor();
    // 고정이 풀린 뒤 작업 판 높이만큼 더 올라가면 판 아래쪽 끝이 헤더에 닿는다
    setupHeader(() => worksTl.scrollTrigger.end + section.offsetHeight - 64);
    $(window).on('load', () => ScrollTrigger.refresh());
});
