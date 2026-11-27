/* =========================================================
   스킬 섹션 등장 움직임
   - 왼쪽 칩은 숙련도 줄마다 차례로, 오른쪽 항목은 하나씩 아래에서 올라온다
   - 움직임 줄이기를 켠 사용자, GSAP 이 없는 경우에는 아무것도 하지 않는다 (내용은 그대로 보임)
   ========================================================= */
$(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('.js-skills');
    if (!section) return;

    // 제목
    gsap.from(section.querySelector('.skills__title'), {
        yPercent: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true }
    });

    // 숙련도 줄: 칩이 왼쪽부터 톡톡 올라온다
    gsap.utils.toArray(section.querySelectorAll('.skills__tier')).forEach((tier) => {
        gsap.from(tier.querySelectorAll('li'), {
            y: 14, opacity: 0, duration: 0.45, ease: 'back.out(2)', stagger: 0.025,
            scrollTrigger: { trigger: tier, start: 'top 85%', once: true }
        });
    });

    // 해 온 일: 화면에 들어온 것부터 하나씩 올라온다
    const items = section.querySelectorAll('.skills__item');
    gsap.set(items, { y: 40, opacity: 0 });
    ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 })
    });

    // 스킬 섹션을 지나는 동안 헤더 뒤에 주황 바탕을 깔아 글이 헤더 글자와 겹쳐 보이지 않게
    ScrollTrigger.create({
        trigger: section, start: 'top top+=64', end: 'bottom top+=64',
        onToggle: (self) => $('.header').toggleClass('is-on-skills', self.isActive)
    });

    // 위쪽 섹션(인트로 고정)이 끝난 뒤 자리를 다시 잰다
    $(window).on('load', () => ScrollTrigger.refresh());
});
