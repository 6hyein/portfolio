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
    const myChart2 = document.getElementById("myChart");
    const chartArea = myChart2.getContext('2d');
    let labelsList = myChart2.children;
    let labels = Array();
    let datas = Array(); 
    let backgroundColors = Array(); 
    let colors = Array();

    for (let val in labelsList){
        if( !isNaN(val) ){
            labels.push(labelsList[val].getAttribute('data_text'));
            datas.push(labelsList[val].getAttribute('data-value'));
            colors.push("rgb("+labelsList[val].getAttribute('data-color')+")");
            backgroundColors.push("rgba("+labelsList[val].getAttribute('data-color')+",0.2)");
        }
    }
    var myChart = new Chart(chartArea, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'skill level',
                data: datas,
                backgroundColor: backgroundColors,
                borderColor: colors,
                borderRadius: 10,
                barThickness:30,
                borderWidth: 2
            }]
        },
        options: {
            responsive: false, // 크기 조정 
            maintainAspectRatio: false, // 가로 세로 종횡비 유지
            indexAxis: 'y',
            plugins:{
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false // <-- this option disables tooltips
                }
            },
            scales: {
                x: {
                    ticks:{
                        color: '#fff'
                    }
                },
                y: {
                    ticks:{
                        color: '#fff',
                        categoryPercentage: 0.7,
                        maxBarThickness: 20,
                    }
                }
            }
        }
    });
});
