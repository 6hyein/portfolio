/* =========================================================
   작업 모음 페이지 스크립트 (뮤자인 지원용)
   jQuery: 화면 그리기, 이벤트 / GSAP + ScrollTrigger: 움직임

   0. 데이터(works-data.js, works-status.js)로 화면 그리기
   1. 스크롤 진행 바
   2. 인트로: 꼬마 악마가 Y, H 를 밟으며 화면 쪽으로 다가오다가 H 에 쾅 내려찍으면
      지진이 난 듯 글자가 무너지고 땅이 갈라진다. 스크롤하면 틈이 벌어져 작업 판으로 이어진다
   3. 작업 45개: PC에서 겹친 카드를 한 장씩 넘기다가, 끝까지 넘기면 콜라주로 펼쳐진다
      (카드는 높이만 같고 가로는 작업마다 다르다)
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
       - 꼬마 악마가 Y 를 밟고, H 로 튀면서 화면 쪽으로 다가온다 (크기로 원근)
       - H 에서 아주 높이 솟아 화면 바로 앞까지 왔다가 쾅 내려찍는다
       - 지진이 난 듯 화면이 흔들리고 글자가 한꺼번에 무너지며 땅이 갈라진다
       - 스크롤하면 갈라진 틈이 벌어지고, 틈 사이로 보이던 작업 판이 커지며 화면을 채운다
       --------------------------------------------------------- */
    const intro = document.querySelector('.js-intro');
    const stage = document.querySelector('.js-stage');
    const devil = document.querySelector('.js-devil');
    const devilSvg = devil.querySelector('.devil__svg');
    const shadow = document.querySelector('.js-devil-shadow');
    const cracksSvg = document.querySelector('.js-cracks');
    const rift = document.querySelector('.js-rift');
    const riftInner = document.querySelector('.js-rift-inner');
    $(intro).addClass('is-animated');

    const outers = $('.js-fit .ch').not('.ch--space').toArray();   // 무너지는 상자
    const inners = outers.map((o) => o.firstChild);                // 안쪽 글자
    const hopLine = $('.js-hop-line .ch').not('.ch--space').toArray(); // Y O O K H Y E I N
    const charY = hopLine[0];
    const charH = hopLine.find((c) => c.textContent === 'H');
    const measure = document.createElement('canvas').getContext('2d');

    gsap.set(devil, { transformPerspective: 600 });

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

    // 그림자: 악마가 서 있는 바닥(surfaceY)에 깔린다. 높이 뜰수록 작고 흐려지고, 악마가 커지면 같이 커진다
    let surfaceY = null;
    let shadowOn = true;
    function drawShadow() {
        if (!shadowOn) return;
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

    // 착지: 악마가 납작해졌다 돌아온다
    function squash(power) {
        return gsap.timeline()
            .to(devilSvg, { scaleX: 1 + 0.35 * power, scaleY: 1 - 0.4 * power, transformOrigin: '50% 100%', duration: 0.06 })
            .to(devilSvg, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    }

    // 웅크리기 (뛰기 전)
    function crouch(time) {
        return gsap.timeline()
            .to(devilSvg, { scaleY: 0.66, scaleX: 1.22, transformOrigin: '50% 100%', duration: time, ease: 'power2.out' })
            .to(devilSvg, { scaleY: 1.1, scaleX: 0.92, duration: 0.12, ease: 'power2.in' })
            .to(devilSvg, { scaleY: 1, scaleX: 1, duration: 0.3 });
    }

    // 밟힌 글자: 주황색으로 바뀌고 눌렸다 튄다
    function stepOn(ch, power) {
        const inner = ch.firstChild;
        return gsap.timeline()
            .to(inner, { color: '#f0a63a', scaleY: 1 - 0.2 * power, scaleX: 1 + 0.06 * power, transformOrigin: '50% 100%', duration: 0.06 })
            .to(inner, { scaleY: 1, scaleX: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    }

    // 튀기: 옆으로는 부드럽게, 위아래는 올라갈 때 느려지고 떨어질 때 빨라지게.
    // 크기(scale)를 키우면 화면 쪽으로 다가오는 것처럼 보인다. 앞으로 숙이는 각도(rotationX)도 함께
    function hop(ch, duration, height, peakScale, endScale) {
        const to = () => landing(ch);
        const peak = () => {
            const y = Math.min(gsap.getProperty(devil, 'y'), to().y) - height();
            return Math.max(y, devil.offsetHeight * (peakScale - 1) + 8); // 머리가 너무 잘리지 않게
        };
        const dir = () => (to().x >= gsap.getProperty(devil, 'x') ? 1 : -1);
        const half = duration / 2;
        return gsap.timeline()
            .to(devil, { x: () => to().x, duration: duration, ease: 'sine.inOut' }, 0)
            .to(devil, { y: peak, duration: half, ease: 'power2.out' }, 0)
            .to(devil, { y: () => to().y, duration: half, ease: 'power2.in' }, half)
            .to(devil, { scale: peakScale, duration: half, ease: 'sine.out' }, 0)
            .to(devil, { scale: endScale, duration: half, ease: 'sine.in' }, half)
            .to(devil, { rotation: () => dir() * 12, rotationX: -22, duration: half, ease: 'sine.out' }, 0)
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
                delay: dist / 9000 + gsap.utils.random(0, 0.06),
                toss: gsap.utils.random(14, 46) * (1 - Math.min(1, dist / window.innerWidth)),
                left: g.cx + dx - halfW,
                right: g.cx + dx + halfW,
                top: floor - halfH * 2
            };
        });

        // 악마가 설 자리: 내려찍은 글자가 떨어진 자리에서, 그 아래 쌓인 글자 중 가장 높은 곳
        const restCx = hit.cx + plan[outers.indexOf(impactCh)].x;
        const below = plan.filter((p) => p.left < restCx && p.right > restCx);
        const pileTop = below.length ? Math.min(...below.map((p) => p.top)) : floor;
        const rest = { x: restCx - devil.offsetWidth / 2, y: pileTop - devil.offsetHeight * 0.92, floor: pileTop + devil.offsetHeight * 0.08 };
        return { plan, rest, hit };
    }

    // 지진: 처음엔 세게, 점점 잦아들게. 무대와 갈라진 틈을 같이 흔든다
    function quake(power) {
        const tl = gsap.timeline();
        const steps = 22;
        for (let k = 0; k < steps; k++) {
            const a = power * Math.pow(1 - k / steps, 1.6);
            tl.to([stage, rift], {
                x: gsap.utils.random(-1, 1) * a,
                y: gsap.utils.random(-1, 1) * a * 0.7,
                rotation: gsap.utils.random(-1, 1) * a * 0.035,
                duration: 0.05, ease: 'none'
            });
        }
        return tl.to([stage, rift], { x: 0, y: 0, rotation: 0, duration: 0.1 });
    }

    /* 갈라진 틈 ----------------------------------------------------
       crack.pts: 화면 위에서 아래까지 내려찍은 자리를 지나는 들쭉날쭉한 선 (점마다 폭 비율 wf)
       riftState.o: 내려찍었을 때 벌어진 틈의 반쪽 폭(px). 0 이면 닫힘
       riftState.k: 스크롤로 벌린 정도 (0 ~ 1). 1 이면 crack.full 까지 벌어져 화면을 다 덮음
       (다 덮는 폭은 틈 모양마다 다르므로, 그릴 때마다 지금 틈으로 계산한다) */
    let crack = null;
    const riftState = { o: 0, k: 0 };

    function makeCrack(cx, cy) {
        const W = intro.clientWidth;
        const H = intro.clientHeight;
        const steps = 18;
        const pts = [];
        let walk = 0;
        for (let k = 0; k <= steps; k++) {
            const y = -30 + (H + 60) * k / steps;
            walk += (Math.random() - 0.5) * W * 0.06;
            const near = Math.min(1, Math.abs(y - cy) / (H * 0.12));   // 내려찍은 곳 가까이는 그 자리를 지나게
            const bulge = 1 + 1.4 * Math.exp(-Math.pow((y - cy) / (H * 0.16), 2)); // 내려찍은 곳이 가장 넓게
            pts.push({ x: cx + walk * near, y: y, l: (0.45 + Math.random()) * bulge, r: (0.45 + Math.random()) * bulge });
        }
        // 다 덮었을 때의 폭: 어느 점에서든 양쪽 화면 끝을 넘을 만큼
        const full = Math.max(...pts.map((p) => Math.max(p.x / p.l, (W - p.x) / p.r))) + 80;
        return { pts, full, cx, cy, W, H };
    }

    function drawRift() {
        const o = crack ? riftState.o + (crack.full - riftState.o) * riftState.k : 0;
        if (o < 0.2) {
            rift.style.visibility = 'hidden';
            return;
        }
        const left = crack.pts.map((p) => `${(p.x - o * p.l).toFixed(1)}px ${p.y.toFixed(1)}px`);
        const right = crack.pts.slice().reverse().map((p) => `${(p.x + o * p.r).toFixed(1)}px ${p.y.toFixed(1)}px`);
        rift.style.clipPath = `polygon(${left.concat(right).join(',')})`;
        rift.style.visibility = 'visible';
    }

    // 잔금: 내려찍은 자리에서 사방으로 뻗는 가는 금. 선 길이만큼 dash 를 줘서 그려지듯 나타나게
    function drawCracks(cx, cy) {
        const W = intro.clientWidth;
        let html = '';
        const count = 9;
        for (let b = 0; b < count; b++) {
            let angle = (b / count) * Math.PI * 2 + gsap.utils.random(-0.3, 0.3);
            const len = W * gsap.utils.random(0.08, 0.26);
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
            html += `<path d="${d}" stroke-width="${gsap.utils.random(1.2, 3.2).toFixed(1)}"/>`;
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

    // 틈 사이로 보이는 작업 판: 썸네일을 같은 높이로 줄지어 깐다
    function buildRift() {
        const W = intro.clientWidth;
        const H = intro.clientHeight;
        const pool = collageOrder.filter((i) => thumbOf(WORKS[i]));
        if (!pool.length) { riftInner.innerHTML = ''; return; }
        const h = Math.max(140, H * 0.3);
        const gap = Math.max(12, W * 0.014);
        let html = '';
        let idx = 0;
        let row = 0;
        for (let y = H * 0.03; y < H; y += h + gap * 1.6) {
            const rnd = seeded(row * 11 + 3);
            for (let x = -h * (0.15 + (row % 2) * 0.4); x < W; ) {
                const i = pool[idx % pool.length];
                idx += 1;
                const w = h * ratios[i];
                const dy = (rnd() - 0.5) * gap * 1.4;
                html += `<img class="rift__img" src="${thumbOf(WORKS[i])}" alt="" decoding="async" style="left:${x.toFixed(0)}px;top:${(y + dy).toFixed(0)}px;width:${w.toFixed(0)}px;height:${h.toFixed(0)}px">`;
                x += w + gap * (1 + rnd());
            }
            row += 1;
        }
        riftInner.innerHTML = html;
    }

    // 첫 등장 (한 번만): 글자가 아래에서 올라온다
    const entranceTl = gsap.timeline({ paused: true })
        .from('.fit-line', { yPercent: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 });

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

    function buildPlay() {
        const tl = gsap.timeline({ paused: true });
        collapse = planCollapse(charH);
        const hit = collapse.hit;
        crack = makeCrack(hit.cx, hit.top);
        riftState.o = 0;
        drawRift();
        gsap.set(riftInner, { transformOrigin: `${hit.cx}px ${hit.top}px`, scale: 0.82, opacity: 1 });
        const crackPaths = drawCracks(hit.cx, hit.top);
        const size = () => devil.offsetHeight;
        // 원근: 멀리(작게) → 가까이(크게)
        const FAR = 0.6;
        const NEAR = 1.05;
        const IMPACT = 1.25;

        // 위에서 Y 로 떨어짐 (아직 멀리 있어서 작다)
        tl.set(devil, { opacity: 1, rotation: 0, rotationX: 0, scale: FAR, x: () => landing(charY).x, y: () => -size() * 1.2 })
            .call(() => { surfaceY = glyph(charY).top; })
            .to(devil, { y: () => landing(charY).y, duration: 0.55, ease: 'power2.in' });
        let t = tl.duration();
        tl.add(squash(1), t).add(stepOn(charY, 1), t);

        // 첫 번째 튕김: Y 에서 H 로. 튀어 오르며 화면 쪽으로 다가온다
        t += 0.1;
        tl.add(crouch(0.18), t);
        t += 0.22;
        tl.add(hop(charH, 0.95, () => size() * 1.8, 1.7, NEAR), t);
        t += 0.95;
        tl.add(squash(1.1), t).add(stepOn(charH, 1.3), t)
            .to(stage, { y: 5, duration: 0.05, yoyo: true, repeat: 1 }, t);

        // 두 번째: H 에서 아주 높이, 화면 바로 앞까지 다가온다 (크게 + 앞으로 숙임)
        t += 0.12;
        tl.add(crouch(0.3), t);
        t += 0.34;
        const upY = () => Math.max(landing(charH).y - size() * 1.6, size() * 1.9);
        tl.to(devil, { y: upY, duration: 0.62, ease: 'power3.out' }, t)
            .to(devil, { x: () => lerp(landing(charH).x, stage.clientWidth / 2 - devil.offsetWidth / 2, 0.25), duration: 0.62, ease: 'sine.out' }, t)
            .to(devil, { scale: 2.9, rotationX: -30, rotation: -8, duration: 0.62, ease: 'power2.out' }, t)
            .to('.devil__arm--l', { rotation: 60, svgOrigin: '19 76', duration: 0.3 }, t)
            .to('.devil__arm--r', { rotation: -60, svgOrigin: '81 76', duration: 0.3 }, t);
        t += 0.62;
        // 잠깐 멈춰 장난스럽게 흔들기
        tl.to(devil, { rotation: 8, duration: 0.08, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t);
        t += 0.34;
        // 쾅: 빠르게 내려찍는다
        tl.to(devil, { y: () => landing(charH).y, x: () => landing(charH).x, scale: IMPACT, rotationX: 12, rotation: 0, duration: 0.22, ease: 'power4.in' }, t)
            .to(['.devil__arm--l', '.devil__arm--r'], { rotation: 0, duration: 0.22 }, t);
        t += 0.22;

        // 충격: 악마 납작, 지진, 잔금, 땅이 갈라짐, 글자가 한꺼번에 튀었다가 무너진다
        tl.add(squash(1.7), t)
            .set(devil, { rotationX: 0 }, t + 0.1)
            .add(quake(26), t)
            .to(crackPaths, { strokeDashoffset: 0, duration: 0.35, ease: 'power3.out', stagger: 0.02 }, t)
            .to(riftState, { o: () => Math.max(5, intro.clientWidth * 0.008), duration: 0.6, ease: 'power4.out', onUpdate: drawRift }, t + 0.05);
        outers.forEach((ch, i) => {
            const p = collapse.plan[i];
            const at = t + 0.04 + p.delay;
            tl.set(ch, { transformOrigin: p.origin }, t)
                .to(ch, { y: -p.toss, rotation: p.rotation * 0.08, duration: 0.12, ease: 'power2.out' }, at)
                .to(ch, { x: p.x, y: p.y, rotation: p.rotation, duration: gsap.utils.random(0.8, 1.15), ease: 'bounce.out' }, at + 0.12);
        });

        // 악마는 튕겨 올랐다가 무너진 글자 더미 위에 선다
        const up = t + 0.1;
        tl.to(devil, { y: () => landing(charH).y - size() * 1.4, scale: 1.1, duration: 0.4, ease: 'power2.out' }, up)
            .to(devil, { rotation: 20, duration: 0.4 }, up)
            .call(() => { surfaceY = collapse.rest.floor; }, null, up + 0.4)
            .to(devil, { y: collapse.rest.y, x: collapse.rest.x, duration: 0.55, ease: 'power2.in' }, up + 0.4)
            .to(devil, { rotation: 0, duration: 0.55 }, up + 0.4)
            .add(squash(1), up + 0.95)
            // 장난스럽게 좌우로 흔들며 웃기
            .to(devil, { rotation: 8, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, up + 1.4)
            // 무너져서 빈 위쪽에 소개가 나타난다
            .fromTo('.js-about', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, up + 1.1)
            .add(countUp, up + 1.2)
            .fromTo('.js-replay', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, up + 1.6)
            .fromTo('.js-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.6 }, up + 1.6);

        return tl;
    }

    // 글꼴이 준비되면 크기를 다시 맞추고 시작 (늦어도 1.5초 뒤엔 시작)
    let ready = false;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
        fitLines();
        buildRift();
        ScrollTrigger.refresh();
        ready = true;
        entranceTl.play();
        playTl = buildPlay();
        playTl.delay(0.9).play();
    });

    // 스크롤: 인트로를 고정한 채, 갈라진 틈이 벌어지며 틈 사이 작업 판이 커져 화면을 채운다
    // 글자 무대는 카메라가 틈 속으로 들어가듯 커지며 흐려진다
    const riftTl = gsap.timeline({
        scrollTrigger: {
            trigger: intro,
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // 공연 중에 스크롤하면 공연을 바로 끝내고(글자가 무너진 상태) 스크롤 동작으로
                if (self.progress > 0.01 && ready) {
                    if (entranceTl.progress() < 1) entranceTl.progress(1);
                    if (playTl.progress() < 1) playTl.progress(1);
                }
                $(intro).toggleClass('is-covered', self.progress > 0.02);
                shadowOn = self.progress < 0.6;
            }
        }
    });
    riftTl
        .fromTo(riftState, { k: 0 }, { k: 1, duration: 1, ease: 'power2.in', immediateRender: false, onUpdate: drawRift }, 0)
        .fromTo(riftInner, { scale: 0.82 }, { scale: 1.06, duration: 1, ease: 'power1.inOut', immediateRender: false }, 0)
        .to('.js-about', { autoAlpha: 0, y: -20, duration: 0.25 }, 0)
        .to(stage, { scale: 1.3, opacity: 0.2, duration: 0.9, ease: 'power1.in', transformOrigin: () => (crack ? `${crack.cx}px ${crack.cy}px` : '50% 50%') }, 0.05)
        // 다 벌어지면 썸네일은 사라지고 밝은 판만 남아 작업 영역으로 이어진다
        .to(riftInner, { opacity: 0, duration: 0.25 }, 0.95)
        .to({}, { duration: 0.15 });

    // 다시 세우기: 틈이 닫히고, 무너진 글자가 일어서고, 악마가 다시 위에서 떨어진다
    $('.js-replay').on('click', function () {
        if (riftTl.scrollTrigger.progress > 0.01) return; // 0 이 아니라 0.01: 처음 계산 때 아주 작은 값이 나올 수 있음
        playTl.kill();
        gsap.to(this, { autoAlpha: 0, duration: 0.2 });
        gsap.to('.js-about', { autoAlpha: 0, y: 24, duration: 0.3 });
        gsap.to(devil, { y: '-=' + (devil.offsetHeight * 3), opacity: 0, rotation: -40, duration: 0.45, ease: 'power2.in' });
        gsap.to(riftState, { o: 0, duration: 0.5, ease: 'power2.in', onUpdate: drawRift });
        gsap.to(cracksSvg.querySelectorAll('path'), { opacity: 0, duration: 0.4 });
        gsap.to(outers, {
            x: 0, y: 0, rotation: 0, duration: 0.9, ease: 'back.out(1.4)',
            stagger: { each: 0.012, from: 'random' }
        });
        gsap.to([charY.firstChild, charH.firstChild], { color: getComputedStyle(charY.parentElement).color, duration: 0.6 });
        gsap.delayedCall(1.3, () => {
            gsap.set(devil, { scale: 0.6, rotation: 0 });
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

    // 창 크기가 바뀌면 글자 크기를 다시 맞추고, 공연이 끝난 상태라면 새 크기로 다시 쌓는다
    let resizeTimer;
    let lastWidth = window.innerWidth;
    $(window).on('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth === lastWidth) return; // 모바일 주소창 때문에 높이만 바뀐 경우
            lastWidth = window.innerWidth;
            fitLines();
            buildRift();
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
       3. 작업 45개
       --------------------------------------------------------- */
    const section = document.querySelector('.js-works');
    const cards = gsap.utils.toArray('.card');
    const n = cards.length;
    const tabs = gsap.utils.toArray('.filter');

    // 헤더 글자색: 틈이 벌어져 밝은 작업 판이 헤더 밑까지 오면, 작업 판이 지나갈 때까지 어둡게
    // lightEnd: 작업 판 아래쪽 끝이 헤더에 닿는 스크롤 위치
    function setupHeader(lightEnd) {
        const cover = riftTl.scrollTrigger;
        const update = () => {
            const y = window.scrollY;
            const from = cover.start + (cover.end - cover.start) * 0.6;
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
        // 색인 탭: 작업 영역이 화면에 들어오면 아래에서 차례로 올라온다
        gsap.from(tabs, {
            yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: section, start: 'top 75%', once: true }
        });
        // 회사별 보기를 누르면 작업 영역 처음으로 올라가고, 남은 카드가 다시 차례로 올라온다
        onFilter = () => {
            ScrollTrigger.refresh(); // 카드 수가 바뀌어 페이지 길이가 달라졌으니 먼저 다시 잰다
            const top = section.getBoundingClientRect().top + window.scrollY - 64;
            if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
            gsap.fromTo(cards.filter((c) => !c.classList.contains('is-off')),
                { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.03, overwrite: true });
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

    // 콜라주 배치: 모든 카드를 같은 높이(h)로 줄지어 놓는다. 가로는 카드마다 비율대로 제각각.
    // 줄이 영역 안에 다 들어가는 가장 큰 h 를 찾고, 줄마다 남는 공간을 카드 사이에 고르지 않게 나눠
    // 콜라주처럼 보이게 한다. 위아래로도 조금씩 어긋나게.
    let stackUnit = 300; // 겹친 카드 단계에서 카드 간격의 기준 (카드 높이의 3/4)
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
        const cardH = cards[0].offsetHeight; // 모든 카드 높이가 같다
        stackUnit = cardH * 0.75;
        const ids = collageOrder.filter((i) => filter === 'all' || WORKS[i].cat === filter);
        const gapX = Math.max(10, areaW * 0.011);
        const gapY = gapX * 1.7;

        // 높이 h 로 왼쪽부터 채우다 넘치면 다음 줄
        function pack(h) {
            const rows = [];
            let row = [];
            let width = 0;
            ids.forEach((i) => {
                const w = h * ratios[i];
                if (row.length && width + gapX + w > areaW) {
                    rows.push({ items: row, w: width });
                    row = [];
                    width = 0;
                }
                width += (row.length ? gapX : 0) + w;
                row.push(i);
            });
            if (row.length) rows.push({ items: row, w: width });
            return rows;
        }
        // 다 들어가는 가장 큰 높이 (이분 탐색). 한두 장일 때 너무 커지지 않게 위쪽 한계를 둔다
        let lo = 12;
        let hi = Math.min(areaH * 0.78, cardH * 1.5);
        for (let k = 0; k < 26; k++) {
            const mid = (lo + hi) / 2;
            const rows = pack(mid);
            const fits = rows.length * mid + (rows.length - 1) * gapY <= areaH && rows.every((r) => r.w <= areaW);
            if (fits) lo = mid; else hi = mid;
        }
        const h = lo;
        const rows = pack(h);
        const totalH = rows.length * h + (rows.length - 1) * gapY;
        // 카드의 원래 자리(가운데 기준) = 무대의 left 60%, top 56%
        const baseX = W * 0.6;
        const baseY = H * 0.56;

        // 보기에서 빠지는 카드: 제자리에서 작아지며 사라진다
        const targets = cells.map((c) => ({ x: c.x, y: c.y, s: c.s * 0.6, o: 0, z: c.z, depth: c.depth }));
        let rowY = top + (areaH - totalH) / 2 + h / 2;
        rows.forEach((row, r) => {
            const rnd = seeded(r * 31 + row.items[0] * 7);
            const free = areaW - row.w;
            const gaps = row.items.length - 1;
            // 남는 가로 공간: 카드 사이에 제각각 나누고(한 칸에 최대 카드 높이의 0.6), 나머지는 줄 양끝 여백
            const weights = row.items.slice(1).map(() => 0.2 + rnd());
            const wsum = weights.reduce((a, b) => a + b, 0) || 1;
            const between = gaps ? Math.min(free * 0.8, gaps * h * 0.6) : 0;
            const margin = free - between;
            let x = side + margin * (0.25 + rnd() * 0.5);
            row.items.forEach((i, k) => {
                if (k > 0) x += gapX + between * weights[k - 1] / wsum;
                const w = h * ratios[i];
                const cy = clamp(top + h / 2, bottom - h / 2, rowY + (rnd() - 0.5) * gapY * 0.9);
                targets[i] = {
                    x: x + w / 2 - baseX, y: cy - baseY, s: h / cardH, o: 1,
                    z: 10 + Math.round(rnd() * 40),
                    depth: gsap.utils.interpolate(0.4, 1.4, rnd())
                };
                x += w;
            });
            rowY += h + gapY;
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
        const unit = stackUnit;
        const g = state.g;

        cards.forEach((card, i) => {
            const d = i - state.p; // 0: 맨 앞, 1: 바로 뒤, -1: 이미 넘어간 카드
            let x, y, z, rotationY, opacity;

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
