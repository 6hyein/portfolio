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
// 사업개시연도
let isTyping = false; // 키보드 입력 여부 확인용 플래그

function handleInput(el) {
    const today = new Date().getFullYear();
    const minVal = el.getAttribute('min');
    const val = el.value;

    if (!isTyping && (val === '1' || val === '-1' || val === minVal)) {
        el.value = today;
        return;
    }

    if (val.length > 4) {
        el.value = val.slice(0, 4);
    }

    if (parseInt(el.value) > today) {
        el.value = today;
    }
}

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
    // 초기화
    var phone_OK_check = 0;
    var phone_NUM_check = 0;
    var tel_OK_check = 0; // 기존 코드 유지용
    var tel_NUM_check = 0; // 기존 코드 유지용
    var today = new Date().getFullYear();

    // 휴대폰 번호 체크 로직
    if (fm.M_phone1) {
        if (
            fm.M_phone1.value.trim().length > 2 &&
            fm.M_phone2.value.trim().length > 3 &&
            fm.M_phone3.value.trim().length > 3
        ) phone_OK_check = 1;

        if (
            check_NUM(fm.M_phone1.value.trim()) &&
            check_NUM(fm.M_phone2.value.trim()) &&
            check_NUM(fm.M_phone3.value.trim())
        ) phone_NUM_check = 1;
    }

    // 약관 동의 체크
    var Agree_check = 0;
    if (fm.M_agree && fm.M_agree.checked == false) {
        Agree_check = 1;
    }

    // --- 유효성 검사 시작 ---

    if (fm.M_name.value.trim() == "") {
        alert("성명을 입력하세요.");
        fm.M_name.focus();
    } 
    else if (!phone_NUM_check) { // 휴대폰 숫자 체크
        alert("휴대폰번호에는 숫자만 입력해주세요.");
        if (fm.M_phone1) fm.M_phone1.focus();
    } 
    else if (!phone_OK_check) { // 휴대폰 자리수 체크
        alert("휴대폰번호를 올바르게 입력하세요.");
        if (fm.M_phone1) fm.M_phone1.focus();
    } 
    else if (fm.M_data0.value.trim().length < 2) {
        alert("사업자 종류를 선택하세요.");
        fm.M_data0[0].focus();
    } 
    // else if (fm.M_year.value.trim() == "") {
    //     alert("사업개시연도를 입력하세요.");
    //     fm.M_year.focus();
    // }
    // else if (parseInt(fm.M_year.value) < 1900 || parseInt(fm.M_year.value) > today) {
    //     alert("사업개시연도를 1900년에서 " + today + "년 사이로 입력하세요.");
    //     fm.M_year.value = "";
    //     fm.M_year.focus();
    // }
   
    else if (fm.M_job.value.trim().length < 2) {
        alert("업종을 선택하세요.");
        fm.M_job[0].focus();
    }    
    else if (fm.M_pay.value.trim().length < 2) {
        alert("연매출을 선택하세요.");
        fm.M_job[0].focus();
    }
    // else if (fm.M_data1.value.trim().length < 2) {
    //     alert("자금용도를 선택하세요.");
    //     fm.M_data1[0].focus();
    // } 
    else if (Agree_check) {
        alert("이용 약관에 동의 해주세요.");
    } 
    else {
        // 모든 관문 통과 시 데이터 결합 및 전송
        var M_data = "";
        M_data += " 사업자 : " + fm.M_data0.value;
        // M_data += " / 사업개시연도 : " + fm.M_year.value;
        M_data += " / 업종 : " + fm.M_job.value;
        M_data += " / 연매출 : " + fm.M_pay.value;
        // M_data += " / 자금용도 : " + fm.M_data1.value;

        // 중복 생성을 방지하기 위해 기존 hidden 필드가 있는지 확인 후 처리
        var hiddenInput = fm.querySelector('input[name="M_data"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.name = "M_data";
            fm.appendChild(hiddenInput);
        }
        hiddenInput.value = M_data;

        fm.submit();
    }
}
// modal
function popup( num ){
    $(".modalWrap").show();
    $("#modal_"+num).show();
}
function popClose(){
    $(".modalWrap").hide();
    $(".modalWrap article").hide();
}
// 실행
$(document).ready(function(){
    AOS.init();
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
    // 사업개시연도
    const currentYear = new Date().getFullYear();
    const $input = $('#businessYear');
    
    $input.attr('max', currentYear);
});