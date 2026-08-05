/* js/script.js */

// ===================== 모달 제어 =====================
window.popup = function (num) {
    const modalWrap = document.querySelector(".modalWrap");
    const targetModal = document.getElementById("modal_" + num);
    
    if (modalWrap) modalWrap.style.display = "flex"; 
    if (targetModal) targetModal.style.display = "flex"; 
    
    // 모달 떴을 때 뒤에 배경 스크롤 방지
    document.body.style.overflow = "hidden"; 
};

window.popClose = function () {
    const modalWrap = document.querySelector(".modalWrap");
    if (modalWrap) modalWrap.style.display = "none";

    document.querySelectorAll(".modalWrap article").forEach(function (article) {
        article.style.display = "none";
    });

    // 배경 스크롤 다시 허용
    document.body.style.overflow = "auto";
};
// ===================== 약관 내용 (textarea) 슬라이드 토글 =====================
document.addEventListener('DOMContentLoaded', function() {
    const agreeShow = document.querySelector('.agreeShow');
    const agreement = document.querySelector('.agreement');

    // 1. 페이지 로딩 시 약관 내용 숨겨두기
    if (agreement) {
        agreement.style.display = 'none';
    }

    if (agreeShow && agreement) {
        agreeShow.addEventListener('click', function () {
            // 현재 숨겨져 있는 상태라면 -> 스르륵 열기 (Slide Down)
            if (window.getComputedStyle(agreement).display === 'none') {
                agreement.style.display = 'block';
                agreement.style.overflow = 'hidden';
                
                const height = agreement.offsetHeight;; // 실제 내용물의 높이 계산
                agreement.style.height = '0px';
                agreement.style.paddingTop = '0px';
                agreement.style.paddingBottom = '0px';
                
                // 브라우저 렌더링 강제 업데이트 (애니메이션을 위해 필수)
                agreement.offsetHeight; 
                
                agreement.style.transition = 'all 0.3s ease-out';
                agreement.style.height = height + 'px';
                agreement.style.paddingTop = ''; // 원래 CSS 패딩 값으로 복구
                agreement.style.paddingBottom = '';

                // 애니메이션(0.3초)이 끝나면 스타일 초기화
                setTimeout(() => {
                    agreement.style.height = ''; 
                    agreement.style.overflow = '';
                    agreement.style.transition = '';
                }, 300);
            } 
            // 현재 열려 있는 상태라면 -> 스르륵 닫기 (Slide Up)
            else {
                agreement.style.height = agreement.scrollHeight + 'px';
                agreement.style.overflow = 'hidden';
                agreement.style.transition = 'all 0.3s ease-out';
                
                agreement.offsetHeight; 
                
                agreement.style.height = '0px';
                agreement.style.paddingTop = '0px';
                agreement.style.paddingBottom = '0px';

                // 닫힌 후 display: none 처리 및 스타일 초기화
                setTimeout(() => {
                    agreement.style.display = 'none';
                    agreement.style.height = '';
                    agreement.style.paddingTop = '';
                    agreement.style.paddingBottom = '';
                    agreement.style.overflow = '';
                    agreement.style.transition = '';
                }, 300);
            }
        });
    }
});
// ===================== 폼 전송 및 유효성 검사 =====================

// 이름: 한글만 입력 가능하도록 제어
window.cdcheck = function (obj) {
    if (window.event) {
        var pressedKey = String.fromCharCode(window.event.keyCode).toLowerCase();
        if (window.event.ctrlKey && (pressedKey == "c" || pressedKey == "v")) {
            window.event.returnValue = false;
            return;
        }
    }
    obj.value = obj.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\u318D\u119E\u11A2]/g, ''); 
};

// 연락처: 4자리 입력 시 다음 칸으로 자동 이동
window.Auto_focus_next = function (check_focus, next_focus, length_size) {
    if (check_focus.value.length >= length_size) next_focus.focus();
};

// 연락처: 숫자만 들어왔는지 체크하는 정규식
function check_NUM(input_number) {
    var regexp = /^[0-9]+$/;
    return regexp.test(input_number);
}

// 최종 폼 전송 전 빈칸 검사
window.Request_Now_input_check = function (fm) {
    var phone_OK_check = 0;
    var phone_NUM_check = 0;

    Agree_check = 0;
    if (fm.M_agree) {
        if (fm.M_agree.checked == false) Agree_check = 1;
    }

    if (fm.M_phone1 && fm.M_phone2 && fm.M_phone3) {
        if (fm.M_phone1.value.trim().length > 2 && fm.M_phone2.value.trim().length > 3 && fm.M_phone3.value.trim().length > 3) {
            phone_OK_check = 1;
        }
        if (check_NUM(fm.M_phone1.value.trim()) && check_NUM(fm.M_phone2.value.trim()) && check_NUM(fm.M_phone3.value.trim())) {
            phone_NUM_check = 1;
        }
    }

    if (fm.M_name.value.trim() == "") {
        alert("성명을 입력하세요.");
        fm.M_name.focus();
    } else if (!phone_NUM_check) {
        alert("휴대폰번호에는 숫자만 입력해주세요.");
        if (fm.M_phone2) fm.M_phone2.focus();
    } else if (!phone_OK_check) {
        alert("휴대폰번호를 정확히 입력하세요.");
        if (fm.M_phone2) fm.M_phone2.focus();
    }
    else if (Agree_check) {
        alert("이용 약관에 동의 해주세요.");
    } 
    else {
        if (
            fm.M_data0.value.length > 1 ||
            // fm.M_data1.value.length > 1 ||
            fm.M_job.value.length > 1
        ) {
            var M_data = "";
            if (fm.M_data0.value.length > 1) {
                M_data += " 사업자 : " + fm.M_data0.value;
            }
            if (fm.M_job.value.length > 1) {
                M_data += " 업종 : " + fm.M_job.value;
            }
            //   if (fm.M_data1.value.length > 1) {
            //     M_data += " 자금용도 : " + fm.M_data1.value;
            //   }

            var input = document.createElement("input");
            input.type = "hidden";
            input.name = "M_data";
            input.value = M_data;
            Write_form.appendChild(input);
        }
        // 모든 검사 통과 시 폼 제출!
        fm.submit();
    }
};