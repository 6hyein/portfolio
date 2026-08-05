// input 이름 체크
function cdcheck(obj) {
    if (window.event) {
        var pressedKey = String.fromCharCode(window.event.keyCode).toLowerCase();
        if (window.event.ctrlKey && (pressedKey == "c" || pressedKey == "v")) {
            window.event.returnValue = false;
            return; // 단축키면 여기서 함수 종료
        }
    }
    obj.value = obj.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\u318D\u119E\u11A2]/g, ''); // "한글(완성형, 자음, 모음)이 아닌 글자가 들어오면 빈칸으로 바꿔라"
} 
function Auto_focus_next(check_focus, next_focus, length_size) {
    if (check_focus.value.length >= length_size) next_focus.focus();
}
// 전화번호
function check_NUM(input_number) {
    var regexp = /[0-9]/;
    for (var i = 0; i < input_number.length; i++) {
        if (
        input_number.charAt(i) != " " &&
        regexp.test(input_number.charAt(i)) == false
        )
        return false;
    }
    return true;
}
function Request_Now_input_check(fm) {
    phone_OK_check = 0;
    tel_OK_check = 0;
    phone_NUM_check = 0;
    tel_NUM_check = 0;
    job_check = 0;
    area_check = 0;
    if (fm.M_phone1) {
        if (
        fm.M_phone1.value.trim().length > 2 &&
        fm.M_phone2.value.trim().length > 3 &&
        fm.M_phone3.value.trim().length > 3
        )
        phone_OK_check = 1;
        if (
        check_NUM(fm.M_phone1.value.trim()) &&
        check_NUM(fm.M_phone2.value.trim()) &&
        check_NUM(fm.M_phone3.value.trim())
        )
        phone_NUM_check = 1;
    }

    Agree_check = 0;
    if (fm.M_agree) {
        if (fm.M_agree.checked == false) Agree_check = 1;
    }

    in_check = 1;
    if (fm.M_name.value.trim() == "") {
        alert("성명을 입력하세요.");
        fm.M_name.focus();
    } else if (!tel_NUM_check && !phone_NUM_check) {
        alert("휴대폰번호에는 숫자만 입력해주세요.");
        if (fm.M_phone1) {
        fm.M_phone1.focus();
        }
    } else if (!tel_OK_check && !phone_OK_check) {
        alert("휴대폰번호를 입력하세요.");
        if (fm.M_phone1) {
        fm.M_phone1.focus();
        }
    } else if (Agree_check) {
        alert("이용 약관에 동의 해주세요.");
    } else {
        if (
        fm.M_data0.value.length > 1 ||
        fm.M_data1.value.length > 1 ||
        fm.M_job.value.length > 1
        ) {
        var M_data = "";
        if (fm.M_data0.value.length > 1) {
            M_data += " 사업자 : " + fm.M_data0.value;
        }
        if (fm.M_job.value.length > 1) {
            M_data += " 업종 : " + fm.M_job.value;
        }
        if (fm.M_data1.value.length > 1) {
            M_data += " 자금용도 : " + fm.M_data1.value;
        }

        var input = document.createElement("input");
        input.type = "hidden";
        input.name = "M_data";
        input.value = M_data;
        Write_form.appendChild(input);
        }
        fm.submit();
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
    // 팝업 
    $(".modalArea").click(function(){
        popupClose();
    });
    $("article.modal").click(function(e){
        e.stopPropagation();
    });
});
$(document).ready(function(){
    AOS.init();
        new WOW().init();
        var inputs = document.querySelectorAll("input[type='tel']")
        for(input of inputs){
            input.setAttribute("autocomplete", "off");
        }
        // 숫자 
        const aN1 = $('#aN1').text();
        const aN2 = $('#aN2').text();
        const aN3 = $('#aN3').text();
        var executed = false;

        $(window).scroll(function() {
            var sec4Top = $('.sec4').offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();
            if (!executed && windowBottom > sec4Top) {
                $('#aN1').animateNumber({ number: aN1, easing: 'easeInQuad' }, 1800);
                $('#aN2').animateNumber({ number: aN2, easing: 'easeInQuad' }, 1800);
                $('#aN3').animateNumber({ number: aN3, easing: 'easeInQuad' }, 1800);
                executed = true;
            }
        });
        // 동의내용
        $('.agreeLine').click(function(){
            $('.agreeArea .slideDown').slideToggle();
        });

        // 체크박스
        $('.check input[type="radio"]').change(function() {
            if ($(this).is(':checked')) {
                var $group = $(this).closest('.check');
                $group.find('label').removeClass('on');
                $(this).parent('label').addClass('on');
            } 
        });

        // 타이머
        function startCountdown() {
            var now = new Date();
            var target = new Date();
            target.setHours(18, 0, 0, 0); // 18시 0분 0초
            if (now > target) {
                target.setDate(target.getDate() + 1);
            }
            var diff = target - now;
            var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            var m = Math.floor((diff / (1000 * 60)) % 60);
            var s = Math.floor((diff / 1000) % 60);

            // 6. 두 자리 수 맞추기 (05, 09 등)
            var hString = (h < 10) ? "0" + h : h;
            var mString = (m < 10) ? "0" + m : m;
            var sString = (s < 10) ? "0" + s : s;

            // 7. 화면에 출력
            $('.timer .hour').text(hString);
            $('.timer .minte').text(mString); 
            $('.timer .sec').text(sString);
        }
        setInterval(startCountdown, 1000); // 1초마아 실행
        startCountdown();
        
});