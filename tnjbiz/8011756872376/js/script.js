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
function checkMaxLength(object){
    if(object.value.length > object.maxLength){
        object.value = object.value.slice(0, object.maxLength);
    }
}
// 실행
$(document).ready(function(){    
    // 탑
    $(function(){
        var $root = $('header.textSlider');
        var $line = $root.find('.line');
        var $text = $line.find('.text').first();

        // 템플릿 보존(리사이즈 때 다시 채울 용도)
        var $tpl = $text.clone();
        // 트랙 만들기
        var $track = $('<div class="track"/>');
        $line.append($track);
        $text.remove(); // 원본은 빼두고 트랙에 템플릿으로만 채움

        var speed = parseFloat($root.data('speed')) || 80; // px/s

        function fillTrack(){
            $track.empty();

            // 일단 1개 넣고 폭 측정
            var $unit = $tpl.clone();
            $track.append($unit);
            var unitW = $unit.outerWidth(true);     // 패딩 포함한 한 세트 폭
            var needW = $line.innerWidth() * 3;     // 컨테이너의 3배 정도 채움(여유)
            var count = Math.max(3, Math.ceil(needW / unitW));

            for (var i = 1; i < count; i++) {
            $track.append($tpl.clone());
            }
        }

        function loop(){
            // 한 바퀴 기준은 "첫 세트 폭"
            var step = $track.children().eq(0).outerWidth(true);
            if (!step || !speed) return;

            var durMs = (step / speed) * 1000;

            // 0 → -step으로 이동하되, -step을 넘는 순간 즉시 뒤로 보내고 위치 보정
            $track.stop(true, false).css({ marginLeft: 0 }).animate(
            { marginLeft: -step },
            {
                duration: durMs,
                easing: 'linear',
                step: function(now){
                if (now <= -step) {
                    // 맨 앞 요소를 뒤로 보내고 현재 위치를 +step 보정
                    $track.append($track.children().eq(0));
                    $track.css('marginLeft', now + step);
                }
                },
                complete: loop
            }
            );
        }

        function rebuild(){
            // 트랙 다시 채우고 애니메이션 재시작
            $track.stop(true, true);
            fillTrack();
            loop();
        }

        // 초기 실행
        rebuild();

        // 리사이즈 시 재구성(약간의 디바운스)
        var t;
        $(window).on('resize', function(){
            clearTimeout(t);
            t = setTimeout(rebuild, 120);
        });
    });

    // 팝업 
    $(".modalArea").click(function(){
        popupClose();
    });
    $("article.modal").click(function(e){
        e.stopPropagation();
    });
});