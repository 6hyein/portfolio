$(document).ready(function(){
    $("#menuBtn").click(function(){
        $("#menuBtn").toggleClass("menuClick");
        $(".menuList").slideToggle().css("display","flex");
    });
});