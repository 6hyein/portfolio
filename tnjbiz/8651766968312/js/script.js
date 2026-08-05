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
// infoList on class
function autoScrollList(containerSelector) {
    var $listItems = $(containerSelector + ' > li');
    setInterval(function() {
        var $current = $listItems.filter('.on');
        var $next = $current.next('li');
        if ($next.length === 0) {
            $next = $listItems.first();
        }
        $current.removeClass('on');
        $next.addClass('on');
    }, 1000);
}
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
// input 이름 체크
function cdcheck(obj) {
    const regExp = /[^가-힣ㄱ-ㅎㅏ-ㅣ\u318D\u119E\u11A2]/g;
    if (regExp.test(obj.value)) {
        obj.value = obj.value.replace(regExp, '');
    }
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
// 실행
$(document).ready(function(){
    $('.sec2 .box1 .infoList').slick({
        slidesToShow: 3,
        arrows : false,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 4000,
        vertical: true
    });
    $('.sec2 .box3 .infoList').slick({
        slidesToShow: 3,      // 한 화면에 보여질 개수 (위, 중간, 아래)
        slidesToScroll: 1,    // 스크롤 시 넘어갈 개수
        centerMode: true,     // 중앙 정렬 모드 (필수)
        vertical: true,       // 세로 방향 슬라이드 (필수)
        verticalSwiping: true, // 세로 스와이프 허용
        focusOnSelect: true,  // 클릭 시 해당 슬라이드로 이동
        arrows: false,        // 화살표 숨김 (디자인에 따라 선택)
        infinite: true,       // 무한 반복
        centerPadding: '0px', // 중앙 슬라이드 패딩 제거
        autoplay: true,       // 자동 재생
    });
    $('.sec2 .step .infoList').slick({
        autoplay: true,
        arrows: false, 
        autoplaySpeed: 1000, 
        speed: 500,
    });
    var inputs = document.querySelectorAll("input[type='tel']")
    for(input of inputs){
        input.setAttribute("autocomplete", "off");
    }
    autoScrollList('.sec1 .infoList');
    autoScrollList('.sec4 .infoList');
    setInterval(startCountdown, 1000); // 1초마아 실행
    startCountdown();
    // 팝업 
    $(".modalArea").click(function(){
        popupClose();
    });
    $("article.modal").click(function(e){
        e.stopPropagation();
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
});