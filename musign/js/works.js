/* =========================================================
   작업 모음 페이지 스크립트 (뮤자인 지원용)
   jQuery: 화면 그리기, 이벤트 / GSAP + ScrollTrigger: 움직임

   0. 데이터(works-data.js, works-status.js)로 화면 그리기
   1. 스크롤 진행 바
   2. 인트로: 꼬마 악마가 이름 위를 뛰어다니고, 가운데 줄을 밟으면 글자가 전부 쓰러진다
      스크롤하면 악마 자리에서 원이 퍼져 화면을 덮고 소개로 넘어간다
   3. 작업 46개: PC에서 겹친 카드를 한 장씩 넘기다가, 끝까지 넘기면 콜라주로 흩어져 펼쳐진다
   4. 필터, 상세 창, 이메일 복사
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

    const cardsHtml = WORKS.map((work, i) => `
        <button type="button" class="card${seeded(i * 7)() < 0.3 ? ' card--mat' : ''}" data-index="${i}" data-cat="${work.cat}" aria-label="${work.title} 자세히 보기">
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
        $('.card').each(function () {
            const off = filter !== 'all' && $(this).data('cat') !== filter;
            $(this).toggleClass('is-off', off).attr('tabindex', off ? -1 : null);
        });
        if (onFilter) onFilter(filter);
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
       --------------------------------------------------------- */
    const intro = document.querySelector('.js-intro');
    const stage = document.querySelector('.js-stage');
    const devil = document.querySelector('.js-devil');
    const devilSvg = devil.querySelector('.devil__svg');
    $(intro).addClass('is-animated');

    const outers = $('.js-fit .ch').not('.ch--space').toArray();   // 쓰러지는 상자
    const inners = outers.map((o) => o.firstChild);                // 안쪽 글자
    const hopChars = $('.js-hop-line .ch').not('.ch--space').toArray();     // Y O O K H Y E I N
    const stompLine = $('.js-stomp-line .ch').not('.ch--space').toArray();  // W E B P U B L I S H E R
    const measure = document.createElement('canvas').getContext('2d');

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

    // 악마가 글자 위에 섰을 때의 좌표 (발바닥 = 글자 꼭대기)
    function landing(ch) {
        const g = glyph(ch);
        return { x: g.cx - devil.offsetWidth / 2, y: g.top - devil.offsetHeight };
    }

    // 악마가 계속 하는 동작: 숨쉬기, 눈 깜빡임, 꼬리 흔들기
    gsap.to('.devil__bob', { scaleY: 0.96, scaleX: 1.03, transformOrigin: '50% 100%', duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.devil__tail', { rotation: 14, transformOrigin: '0% 100%', duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.timeline({ repeat: -1, repeatDelay: 2.4 })
        .to('.devil__eyes', { scaleY: 0.1, transformOrigin: '50% 60%', duration: 0.08, yoyo: true, repeat: 1 });

    // 착지: 악마가 납작해졌다 돌아온다
    function squash(power) {
        return gsap.timeline()
            .to(devilSvg, { scaleX: 1 + 0.35 * power, scaleY: 1 - 0.4 * power, transformOrigin: '50% 100%', duration: 0.06 })
            .to(devilSvg, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' });
    }

    // 밟힌 글자: 주황색으로 바뀌고 눌렸다 튄다
    function stepOn(ch) {
        const inner = ch.firstChild;
        return gsap.timeline()
            .to(inner, { color: '#f0a63a', scaleY: 0.82, transformOrigin: '50% 100%', duration: 0.06 })
            .to(inner, { scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    }

    // 한 번 뛰기: 옆으로는 일정하게, 위아래는 올라갈 때 느려지고 떨어질 때 빨라지게
    // 뛰는 방향으로 몸을 기울이고 팔을 든다
    function hop(ch, duration, height) {
        const to = () => landing(ch);
        const peak = () => Math.min(gsap.getProperty(devil, 'y'), to().y) - height();
        const dir = () => (to().x >= gsap.getProperty(devil, 'x') ? 1 : -1);
        return gsap.timeline()
            .to(devil, { x: () => to().x, duration: duration, ease: 'none' }, 0)
            .to(devil, { y: peak, duration: duration / 2, ease: 'power2.out' }, 0)
            .to(devil, { y: () => to().y, duration: duration / 2, ease: 'power2.in' }, duration / 2)
            .to(devil, { rotation: () => dir() * 10, duration: duration / 2, ease: 'sine.out' }, 0)
            .to(devil, { rotation: 0, duration: duration / 2, ease: 'sine.in' }, duration / 2)
            .to('.devil__arm--l', { rotation: 30, svgOrigin: '19 76', duration: duration / 2, yoyo: true, repeat: 1 }, 0)
            .to('.devil__arm--r', { rotation: -30, svgOrigin: '81 76', duration: duration / 2, yoyo: true, repeat: 1 }, 0);
    }

    // 와장창 계획: 글자마다 어느 쪽으로, 몇 도로, 어디까지 떨어질지 미리 정한다
    // (악마가 쓰러진 글자 더미 위에 앉을 높이도 여기서 계산)
    function planCollapse(impactCh) {
        const hit = glyph(impactCh);
        const floor = stage.clientHeight - Math.max(28, window.innerHeight * 0.07); // 바닥선
        const plan = outers.map((ch) => {
            const g = glyph(ch);
            const side = g.cx < hit.cx ? -1 : 1;                       // 밟힌 곳에서 멀어지는 쪽으로
            const rot = side * gsap.utils.random(72, 108);
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
                delay: dist / 2600,
                left: g.cx + dx - halfW,
                right: g.cx + dx + halfW,
                top: floor - halfH * 2
            };
        });

        // 악마가 앉을 자리: 밟은 글자가 쓰러진 자리에서, 그 아래 쌓인 글자 중 가장 높은 곳
        // (밟은 곳 바로 아래는 글자가 양쪽으로 갈라져 비어 있을 수 있어서)
        const restCx = hit.cx + plan[outers.indexOf(impactCh)].x;
        const below = plan.filter((p) => p.left < restCx && p.right > restCx);
        const pileTop = below.length ? Math.min(...below.map((p) => p.top)) : floor;
        const rest = { x: restCx - devil.offsetWidth / 2, y: pileTop - devil.offsetHeight * 0.92 };
        return { plan, rest };
    }

    // 화면 흔들기
    function shake() {
        const tl = gsap.timeline();
        [-16, 13, -10, 7, -4, 2, 0].forEach((x, i) => tl.to(stage, { x: x, y: i % 2 ? -x / 2 : x / 3, duration: 0.045 }));
        return tl;
    }

    // 첫 등장 (한 번만): 글자가 아래에서 올라온다
    const entranceTl = gsap.timeline({ paused: true })
        .from('.fit-line', { yPercent: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 });

    // 악마 공연 타임라인. 다시 세우기를 누를 때마다 새로 만든다
    let playTl = gsap.timeline({ paused: true });
    let collapse = null;

    function buildPlay() {
        const tl = gsap.timeline({ paused: true });
        const impactCh = stompLine.reduce((best, ch) =>
            Math.abs(glyph(ch).cx - stage.clientWidth / 2) < Math.abs(glyph(best).cx - stage.clientWidth / 2) ? ch : best
        );
        collapse = planCollapse(impactCh);
        const size = () => devil.offsetHeight;

        // 위에서 첫 글자(Y)로 떨어짐
        tl.set(devil, { opacity: 1, rotation: 0, x: () => landing(hopChars[0]).x, y: () => -size() * 1.5 })
            .to(devil, { y: () => landing(hopChars[0]).y, duration: 0.55, ease: 'power2.in' });

        let t = tl.duration();
        tl.add(squash(1), t).add(stepOn(hopChars[0]), t);
        t += 0.1;

        // 첫 줄을 차례로 밟는다
        hopChars.slice(1).forEach((ch) => {
            tl.add(hop(ch, 0.34, () => size() * 0.9), t);
            t += 0.34;
            tl.add(squash(0.8), t).add(stepOn(ch), t);
            t += 0.08;
        });

        // 마지막 글자에서 한 번 웅크렸다가 높이 뛰어, 한 바퀴 돌며 가운데 줄로 내려찍는다
        tl.to(devilSvg, { scaleY: 0.7, scaleX: 1.2, transformOrigin: '50% 100%', duration: 0.25, ease: 'power2.out' }, t + 0.15);
        t += 0.4;
        tl.to(devilSvg, { scaleY: 1, scaleX: 1, duration: 0.2 }, t)
            .to(devil, { x: () => landing(impactCh).x, duration: 0.9, ease: 'power1.inOut' }, t)
            .to(devil, { y: () => Math.min(0, landing(hopChars[0]).y) - size() * 1.2, duration: 0.5, ease: 'power2.out' }, t)
            .to(devil, { rotation: -360, duration: 0.9, ease: 'power1.inOut' }, t)
            .to(devil, { y: () => landing(impactCh).y, duration: 0.4, ease: 'power3.in' }, t + 0.5)
            .set(devil, { rotation: 0 }, t + 0.9);
        t += 0.9;

        // 쾅: 악마 납작, 화면 흔들림, 글자가 밟힌 곳에서부터 차례로 쓰러져 바닥에 쌓인다
        tl.add(squash(1.3), t).add(shake(), t);
        outers.forEach((ch, i) => {
            const p = collapse.plan[i];
            tl.set(ch, { transformOrigin: p.origin }, t)
                .to(ch, { x: p.x, y: p.y, rotation: p.rotation, duration: gsap.utils.random(0.9, 1.3), ease: 'bounce.out' }, t + 0.05 + p.delay);
        });

        // 악마는 튕겨 올랐다가 쓰러진 글자 더미 위에 앉는다
        const up = t + 0.12;
        tl.to(devil, { y: () => landing(impactCh).y - size() * 2.2, duration: 0.45, ease: 'power2.out' }, up)
            .to(devil, { rotation: 25, duration: 0.45 }, up)
            .to(devil, { y: collapse.rest.y, x: collapse.rest.x, duration: 0.6, ease: 'power2.in' }, up + 0.45)
            .to(devil, { rotation: 0, duration: 0.6 }, up + 0.45)
            .add(squash(1), up + 1.05)
            // 장난스럽게 좌우로 흔들며 웃기
            .to(devil, { rotation: 8, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, up + 1.5)
            .fromTo('.js-replay', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, up + 1.6)
            .fromTo('.js-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.6 }, up + 1.6);

        return tl;
    }

    // 글꼴이 준비되면 크기를 다시 맞추고 시작 (늦어도 1.5초 뒤엔 시작)
    let ready = false;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
        fitLines();
        ScrollTrigger.refresh();
        ready = true;
        entranceTl.play();
        playTl = buildPlay();
        playTl.delay(0.9).play();
    });

    // 다시 세우기: 쓰러진 글자가 일어서고, 악마가 다시 위에서 떨어진다
    $('.js-replay').on('click', function () {
        if (coverTl.scrollTrigger.progress > 0.01) return; // 0 이 아니라 0.01: 처음 계산 때 아주 작은 값이 나올 수 있음
        playTl.kill();
        gsap.to(this, { autoAlpha: 0, duration: 0.2 });
        gsap.to(devil, { y: '-=' + (devil.offsetHeight * 3), opacity: 0, rotation: -40, duration: 0.45, ease: 'power2.in' });
        gsap.to(outers, {
            x: 0, y: 0, rotation: 0, duration: 0.9, ease: 'back.out(1.4)',
            stagger: { each: 0.012, from: 'random' }
        });
        gsap.to(hopChars.map((c) => c.firstChild), { color: getComputedStyle(hopChars[0].parentElement).color, duration: 0.6 });
        gsap.delayedCall(1.3, () => {
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

    // 스크롤: 인트로를 고정한 채, 악마 자리에서 주황색 원이 퍼져 화면을 덮는다
    // 원 크기(0~1)만 트윈하고, 그릴 때마다 악마의 지금 위치를 읽어 clip-path 를 만든다
    const cover = document.querySelector('.js-cover');
    const coverState = { p: 0 };
    function drawCover() {
        const cx = gsap.getProperty(devil, 'x') + devil.offsetWidth / 2;
        const cy = gsap.getProperty(devil, 'y') + devil.offsetHeight / 2;
        const w = intro.clientWidth;
        const h = intro.clientHeight;
        const far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)); // 가장 먼 모서리까지
        const r = lerp(devil.offsetWidth * 0.3, far, coverState.p);
        cover.style.clipPath = `circle(${r}px at ${cx}px ${cy}px)`;
        cover.style.visibility = coverState.p > 0.001 ? 'visible' : 'hidden';
    }

    const coverTl = gsap.timeline({
        scrollTrigger: {
            trigger: intro,
            start: 'top top',
            end: '+=160%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // 공연 중에 스크롤하면 공연을 바로 끝내고(글자가 쓰러진 상태) 스크롤 동작으로
                if (self.progress > 0.01 && ready) {
                    if (entranceTl.progress() < 1) entranceTl.progress(1);
                    if (playTl.progress() < 1) playTl.progress(1);
                }
                $(intro).toggleClass('is-covered', self.progress > 0.02);
            }
        }
    });

    coverTl
        .to(coverState, { p: 1, duration: 1, ease: 'power2.in', onUpdate: drawCover }, 0)
        .fromTo('.js-about', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.85)
        .add(countUp, 1)
        .to({}, { duration: 0.6 });

    // 창 크기가 바뀌면 글자 크기를 다시 맞추고, 공연이 끝난 상태라면 새 크기로 다시 쌓는다
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
            }
            ScrollTrigger.refresh();
        }, 200);
    });


    /* ---------------------------------------------------------
       3. 작업 46개
       --------------------------------------------------------- */
    const section = document.querySelector('.js-works');
    const cards = gsap.utils.toArray('.card');
    const n = cards.length;

    // 밝은 판이 둥근 카드처럼 올라오다가 화면을 꽉 채운다 (clip-path inset 의 여백과 모서리를 0 으로)
    gsap.fromTo(section,
        { clipPath: 'inset(6vh 5vw 0vh 5vw round 56px)' },
        {
            clipPath: 'inset(0vh 0vw 0vh 0vw round 0px)',
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true }
        });

    // 헤더 글자색: 주황 소개 화면부터 밝은 작업 판이 헤더 밑을 지나갈 때까지는 어둡게
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
        // 모바일: 화면에 들어오는 만큼씩 묶어서 차례로 등장
        gsap.set(cards, { opacity: 0, y: 40 });
        ScrollTrigger.batch(cards, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 })
        });
        // 회사별 보기를 누르면 남은 카드가 다시 차례로 올라온다
        onFilter = () => {
            gsap.fromTo(cards.filter((c) => !c.classList.contains('is-off')),
                { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.03, overwrite: true });
            ScrollTrigger.refresh();
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

    // 한 프레임에 한 번만 그리기: 스크롤, 필터, 마우스가 동시에 그려 달라고 해도 묶어서 처리
    let needsRender = false;
    const requestRender = () => { needsRender = true; };
    gsap.ticker.add(() => { if (needsRender) render(); });

    // 콜라주 칸: 카드마다 목표 위치(x, y), 크기(s), 투명도(o), 겹침 순서(z), 깊이(depth)
    const cells = cards.map(() => ({ x: 0, y: 0, s: 0.3, o: 1, z: 1, depth: 1 }));

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

    // 콜라주 배치: 보이는 카드 수에 맞춰 칸을 나누고, 칸 안에서 위치와 크기를 조금씩 흩트린다
    // 대표 작업은 크게(다른 카드 밑에 깔리게), 몇 장은 조금 크게
    function layoutCollage(filter, animate) {
        const head = document.querySelector('.js-works-head');
        const filters = document.querySelector('.js-filters');
        const W = section.clientWidth;
        const H = section.clientHeight;
        const side = parseFloat(getComputedStyle(head).left);
        const top = head.offsetTop + head.offsetHeight + 24;
        const bottom = filters.offsetTop - 16;
        const areaW = W - side * 2;
        const areaH = bottom - top;
        const cardW = cards[0].offsetWidth;
        const ratio = cards[0].offsetHeight / cardW;
        const ids = cards.map((c, i) => i).filter((i) => filter === 'all' || WORKS[i].cat === filter);
        const count = ids.length;
        // 칸 가로:세로 = 0.68 정도가 되도록 열 수를 정한다
        const cols = Math.min(count, Math.max(1, Math.round(Math.sqrt(count * (areaW / areaH) / 0.68))));
        const rows = Math.ceil(count / cols);
        const cellW = areaW / cols;
        const cellH = areaH / rows;
        const base = Math.min(cellW * 0.78, cellH * 0.78 / ratio);
        const maxW = Math.min(areaW * 0.45, areaH * 0.92 / ratio);
        // 카드의 원래 자리(가운데 기준) = 무대의 left 60%, top 56%
        const baseX = W * 0.6;
        const baseY = H * 0.56;

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
        const targets = cells.map((c) => ({ x: c.x, y: c.y, s: c.s * 0.6, o: 0, z: c.z, depth: c.depth }));
        slots.forEach((i, k) => {
            const rnd = seeded(i * 13 + 5);
            const row = Math.floor(k / cols);
            const col = k % cols;
            const inRow = row === rows - 1 ? count - row * cols : cols;
            const shift = (cols - inRow) * cellW / 2; // 마지막 줄은 가운데로
            const isBig = big(i);
            const factor = isBig ? 2.3 : (rnd() < 0.15 ? 1.4 : gsap.utils.interpolate(0.65, 1, rnd()));
            const w = Math.min(base * factor, maxW);
            const h = w * ratio;
            const cx = clamp(side + w / 2, W - side - w / 2, side + shift + col * cellW + cellW / 2 + (rnd() - 0.5) * cellW * 0.4);
            const cy = clamp(top + h / 2, bottom - h / 2, top + row * cellH + cellH / 2 + (rnd() - 0.5) * cellH * 0.3);
            targets[i] = {
                x: cx - baseX, y: cy - baseY, s: w / cardW, o: 1,
                z: isBig ? 2 + k : 20 + Math.round(rnd() * 40),
                depth: gsap.utils.interpolate(0.4, 1.4, rnd())
            };
        });

        cells.forEach((cell, i) => {
            if (!animate) {
                Object.assign(cell, targets[i]);
                return;
            }
            cell.z = targets[i].z;
            gsap.to(cell, {
                x: targets[i].x, y: targets[i].y, s: targets[i].s, o: targets[i].o, depth: targets[i].depth,
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
        const cardW = cards[0].offsetWidth;
        const g = state.g;

        cards.forEach((card, i) => {
            const d = i - state.p; // 0: 맨 앞, 1: 바로 뒤, -1: 이미 넘어간 카드
            let x, y, z, rotationY, opacity;

            if (d >= 0) {
                // 뒤에서 기다리는 카드: 오른쪽 뒤로 비스듬히 줄 서 있다 (5장 넘게 뒤는 숨김)
                x = d * cardW * 0.3;
                y = -d * 14;
                z = -d * 150;
                rotationY = -38 * clamp(0, 1, d);
                opacity = 1 - clamp(0, 1, d - 4);
            } else {
                // 넘어간 카드: 왼쪽으로 빠지며 사라진다 (너무 멀리 가지 않게 -1.5장에서 멈춤)
                const k = Math.max(d, -1.5);
                x = k * cardW * 1.2;
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
                opacity = lerp(opacity, c.o, t);
                scale = lerp(1, c.s, t);
                if (g > 0.95) zIndex = i === hovered ? 500 : c.z;
            }

            gsap.set(card, {
                x: x, y: y, z: z, rotationY: rotationY, scale: scale, opacity: opacity,
                visibility: opacity < 0.01 ? 'hidden' : 'visible',
                zIndex: zIndex
            });
        });

        // 겹친 카드 단계: 맨 앞 카드 설명
        const index = Math.round(clamp(0, n - 1, state.p));
        if (index !== current) { current = index; showInfo(index); }
        gsap.set([info, '.js-counter'], { autoAlpha: 1 - clamp(0, 1, g * 4) });
        // 회사별 보기는 콜라주가 거의 펼쳐졌을 때 나타나고, 바로 가기 버튼은 사라진다
        gsap.set('.js-filters', { autoAlpha: clamp(0, 1, (g - 0.6) * 4) });
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
            if (!on) hovered = -1;
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
    onFilter = (filter) => layoutCollage(filter, true);

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
                hovered = gridOn ? idx : -1;
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
            hovered = -1;
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
