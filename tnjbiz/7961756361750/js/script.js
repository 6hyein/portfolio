/* 숫자 랜덤 생성 */
const randomFn = (min, max) => { // 최대값 제외
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
// 현재 시간을 기준으로 7개의 이전 시간을 생성하는 함수
const generatePreviousTimes = (num) => {
    const now = new Date();
    const times = [];

    // 첫 번째 시간은 정확히 한 시간 전
    const oneHourAgo = new Date(now);
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    times.push(oneHourAgo);

    for (let i = 1; i < num; i++) {
    // 복사된 현재 시간 객체 생성
    const randomTime = new Date(now);

    // 시간, 분, 초를 랜덤하게 감소시킴
    const randomHours = Math.floor(Math.random() * 3); // 0~2시간 감소
    const randomMinutes = Math.floor(Math.random() * 60); // 0~59분 감소
    const randomSeconds = Math.floor(Math.random() * 60); // 0~59초 감소

    randomTime.setHours(randomTime.getHours() - randomHours);
    randomTime.setMinutes(randomTime.getMinutes() - randomMinutes);
    randomTime.setSeconds(randomTime.getSeconds() - randomSeconds);

    times.push(randomTime);
    }

    // 내림차순 정렬
    times.sort((a, b) => b - a);

    // 포맷된 문자열로 변환 (한국 표준시 기준)
    return times.map((time) => {
    const kstTime = new Date(time.getTime() + 9 * 60 * 60 * 1000); // UTC -> KST
    return kstTime.toISOString().replace('T', ' ').split('.')[0];
    });
}
/* 비교견적 신청 현황 - 랜덤으로 100개 생성 */
const randomReview = () => {
    const count = Number($(".reviewList").attr("random")); // 반복 횟수
    const famillyNames = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권","황","안","송","전","홍","유"];
    const phoneMin = 0;
    const phoneMax = 10000;
    const Times = generatePreviousTimes(count);
    const target = $(".reviewList");
    for( let i = 1; i <= count; i++ ){
        const famillyName = famillyNames[randomFn(0,famillyNames.length)];
        const phone = String( randomFn(phoneMin, phoneMax) ).padStart(4,'0');
        target.append(`
        <li>
            <div class="name">${famillyName}** | 010-****-${phone}</div>
            <div class="msg">신청했습니다~</div>
            <div class="date">${Times[i - 1]}</div>
        </li>`);
    }
}
/**
 *  팝업
 */
const popupShow = (index) => {
    $("body").addClass("thouch-none");
    $("body").css("overflow-y","hidden");
    $(".modalArea").fadeIn();
    $("#pop"+index).fadeIn();
}
const popupClose = () => {
    $("body").removeClass("thouch-none");
    $("body").css("overflow-y","initial");
    $(".modalArea").fadeOut();
    $(".modalArea article").fadeOut();
}
// 실행
$(document).ready(function(){
    randomReview();
    // 팝업 
    $(".modalArea").click(function(){
        popupClose();
    });
    $("article.modal").click(function(e){
        e.stopPropagation();
    });

    // 비교견적 신청 현황 - 슬라이드
    $(".reviewList").slick({
        autoplay : true,
        arrows : false,
        cssEase : "linear",
        vertical : true,
        draggable: true,
        slidesToShow : 4,
        autoplaySpeed: 1000,
        speed: 1000,
    });
});