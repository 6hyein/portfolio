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
   
     // 스킬바
    const skillsTop = $("#skills").offset().top-300;
    const projectsTop = $("#projects").offset().top;
    let scrollTop = $(document).scrollTop();
    let scrollEvn = (newTop) => {
        scrollTop = newTop ? newTop : scrollTop;
        if(skillsTop <= scrollTop && projectsTop >= scrollTop){
            $(".bar").each((idx,item)=>{                
                let barWidth = $(item).attr("bar-width");
                $(item).css("width",barWidth);
            });
        }else{
            $(".bar").css("width",0);
        }
    }
    scrollEvn();

    // 메뉴 고정
    const menuTop = $(".section1").offset().top;
    let menuEvn = (newTop) => {
        console.log(scrollTop,menuTop);
        scrollTop = newTop ? newTop : scrollTop;
        if(scrollTop >= menuTop){
            $("#menuFix").addClass("positionFix");
        }else{
            $("#menuFix").removeClass("positionFix");
        }
    }
    menuEvn();
    $(document).scroll(function(){
        let newTop = $(document).scrollTop();
        scrollEvn(newTop); // 스킬바
        menuEvn(newTop); // 메뉴고정
    });
 
});
