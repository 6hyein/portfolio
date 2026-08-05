/**
 *  ÆË¾÷
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
// Å¸ÀÌ¸Ó
function startCountdown() {
    var now = new Date();
    var target = new Date();
    target.setHours(18, 0, 0, 0); // 18½Ã 0ºÐ 0ÃÊ
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }
    var diff = target - now;
    var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var m = Math.floor((diff / (1000 * 60)) % 60);
    var s = Math.floor((diff / 1000) % 60);

    // 6. µÎ ÀÚ¸® ¼ö ¸ÂÃß±â (05, 09 µî)
    var hString = (h < 10) ? "0" + h : h;
    var mString = (m < 10) ? "0" + m : m;
    var sString = (s < 10) ? "0" + s : s;

    // 7. È­¸é¿¡ Ãâ·Â
    $('.timer .hour').text(hString);
    $('.timer .minte').text(mString); 
    $('.timer .sec').text(sString);
}
// input ÀÌ¸§ Ã¼Å©
function cdcheck(obj) {
    if (window.event) {
        var pressedKey = String.fromCharCode(window.event.keyCode).toLowerCase();
        if (window.event.ctrlKey && (pressedKey == "c" || pressedKey == "v")) {
            window.event.returnValue = false;
            return; // ´ÜÃàÅ°¸é ¿©±â¼­ ÇÔ¼ö Á¾·á
        }
    }
    obj.value = obj.value.replace(/[^°¡-ÆR¤¡-¤¾¤¿-¤Ó\u318D\u119E\u11A2]/g, ''); // "ÇÑ±Û(¿Ï¼ºÇü, ÀÚÀ½, ¸ðÀ½)ÀÌ ¾Æ´Ñ ±ÛÀÚ°¡ µé¾î¿À¸é ºóÄ­À¸·Î ¹Ù²ã¶ó"
} 
function Auto_focus_next(check_focus, next_focus, length_size) {
    if (check_focus.value.length >= length_size) next_focus.focus();
}
// ÀüÈ­¹øÈ£
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
        alert("¼º¸íÀ» ÀÔ·ÂÇÏ¼¼¿ä.");
        fm.M_name.focus();
    } else if (!tel_NUM_check && !phone_NUM_check) {
        alert("ÈÞ´ëÆù¹øÈ£¿¡´Â ¼ýÀÚ¸¸ ÀÔ·ÂÇØÁÖ¼¼¿ä.");
        if (fm.M_phone1) {
        fm.M_phone1.focus();
        }
    } else if (!tel_OK_check && !phone_OK_check) {
        alert("ÈÞ´ëÆù¹øÈ£¸¦ ÀÔ·ÂÇÏ¼¼¿ä.");
        if (fm.M_phone1) {
        fm.M_phone1.focus();
        }
    } else if (Agree_check) {
        alert("ÀÌ¿ë ¾à°ü¿¡ µ¿ÀÇ ÇØÁÖ¼¼¿ä.");
    } else {
        if (
        fm.M_data0.value.length > 1 ||
        fm.M_data1.value.length > 1 ||
        fm.M_job.value.length > 1
        ) {
        var M_data = "";
        if (fm.M_data0.value.length > 1) {
            M_data += " »ç¾÷ÀÚ : " + fm.M_data0.value;
        }
        if (fm.M_job.value.length > 1) {
            M_data += " ¾÷Á¾ : " + fm.M_job.value;
        }
        if (fm.M_data1.value.length > 1) {
            M_data += " ÀÚ±Ý¿ëµµ : " + fm.M_data1.value;
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
// ½ÇÇà
$(document).ready(function(){
    // AOS.init();
    var inputs = document.querySelectorAll("input[type='tel']")
    for(input of inputs){
        input.setAttribute("autocomplete", "off");
    }
    autoScrollList('.sec1 .infoList');
    autoScrollList('.sec4 .infoList');
    setInterval(startCountdown, 1000); // 1ÃÊ¸¶¾Æ ½ÇÇà
    startCountdown();
    // ÆË¾÷ 
    $(".modalArea").click(function(){
        popupClose();
    });
    $("article.modal").click(function(e){
        e.stopPropagation();
    });
    // ¼ýÀÚ 
    const aN1 = $('#aN1').text();
    const aN2 = $('#aN2').text();
    const aN3 = $('#aN3').text();
    const aN4 = $('#aN4').text();
    var executed = false;

    $(window).scroll(function() {
        var sec4Top = $('.sec3 .boxArea2').offset().top;
        var windowBottom = $(window).scrollTop() + $(window).height();
        if (!executed && windowBottom > sec4Top) {
            $('#aN1').animateNumber({ number: aN1, easing: 'easeInQuad' }, 1800);
            $('#aN2').animateNumber({ number: aN2, easing: 'easeInQuad' }, 1800);
            $('#aN3').animateNumber({ number: aN3, easing: 'easeInQuad' }, 1800);
            $('#aN4').animateNumber({
                number: aN4,
                easing: 'easeInQuad',
                numberStep: $.animateNumber.numberStepFactories.separator(',')
            }, 1800);
            executed = true;
        }
    });
    // µ¿ÀÇ³»¿ë
    $('.agreeLine').click(function(){
        $('.agreeArea .slideDown').slideToggle();
    });

    // Ã¼Å©¹Ú½º
    $('.check input[type="radio"]').change(function() {
        if ($(this).is(':checked')) {
            var $group = $(this).closest('.check');
            $group.find('label').removeClass('on');
            $(this).parent('label').addClass('on');
        } 
    });
});