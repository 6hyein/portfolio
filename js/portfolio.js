$(document).ready(function(){
    $("#menuBtn").click(function(){
        $("#menuBtn").toggleClass("menuClick");
        $(".menuList").slideToggle().css("display","flex");
    });
    // 버튼 클릭시 링크 이동
    let btn = document.querySelectorAll(".btn");
    btn.forEach((element) => {
        // 버튼인 경우만
        if(element.tagName === "BUTTON"){
            element.onclick = () => {
                // 해당 링크로 페이지 이동
                let btnHref = element.getAttribute('href');
                window.location.href = btnHref;
            }
        }
    });
});
