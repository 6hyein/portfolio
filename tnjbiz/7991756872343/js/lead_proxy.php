<?php

$data = $_POST ? $_POST : array(); // JS에서 보낸 값 받기
$data['api_key'] = 'winaid_ql4djdi6rzas9uodue';  
$data['agency'] = 'winaid';  

$ch = curl_init('https://momoprs.com/landing/cl_api/landing.php');
curl_setopt($ch, CURLOPT_POST, true);
// ★ 헤더 지정 필요 없음(기본이 x-www-form-urlencoded)
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data)); // 폼 인코딩
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
// 테스트만
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$http     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err      = curl_error($ch);
curl_close($ch);

// 파일 로그
file_put_contents(
    __DIR__.'/proxy.log',
    date('c')."\tHTTP=".$http."\tRESULT=".($err?$err:'-')."\t".$response."\tDATA=".http_build_query($data)."\n",
    FILE_APPEND
);

// AJAX로 그대로 반환 (응답이 JSON일 수도/문자열일 수도 있으니 타입 고정 X)
header((isset($_SERVER['SERVER_PROTOCOL'])?$_SERVER['SERVER_PROTOCOL']:'HTTP/1.1').' '.$http, true, $http);
echo $response;
exit;
?>