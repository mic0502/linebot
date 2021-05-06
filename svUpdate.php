<?php

$dsn = 'mysql:host=mysql10093.xserver.jp;dbname=xs311188_wt1;charset=utf8;'; // データソース
$user = 'xs311188_wt1';
$password = 'asdfasdf1';

try {
  $dbh = new PDO($dsn, $user, $password);
} catch (PDOException $e) {
	echo 'データベースにアクセスできません！' . $e->getMessage();
	exit;
}

//売り消し済みの商品の削除処理
$dir = __DIR__  . "/../../../../../linebot/sql/";
$dh = opendir($dir);
while(false !== ($fn = readdir($dh))){
	if($fn !== '.' && $fn !== '..' && !is_dir($dir.$fn)){
        $array = file($dir . $fn);
        // 不要な文字列を削除
        // $array[0] =str_replace("?", "",  mb_convert_encoding(trim($array[0]), "ASCII", "UTF-8"));
        $sql = "SELECT count(*) FROM TM_KOK WHERE login_id ='" . trim($array[1]) . "'";
        $stmt = $dbh->query($sql);

        // 登録済みの顧客かチェックしてSQL文生成
        if($stmt->fetchColumn() > 0){
            $sql = "UPDATE TM_KOK SET sys_name = '" . trim($array[2]) . "', rank = '" . trim($array[3]) . "', point = " . trim($array[4]) . ", birthday = '" . trim($array[5]) . "', recent_buy = '" . trim($array[6]) . "' WHERE login_id='" . trim($array[1]) . "'";
        }else{
            $sql = "INSERT INTO TM_KOK (login_id,sys_name,name,rank,point,birthday,recent_buy,login_password) VALUES ('" . trim($array[1]) . "','" . trim($array[2]) . "','" . trim($array[2]) . "','" . trim($array[3]) . "'," . trim($array[4]) . ",'" . trim($array[5]) . "','" . trim($array[6]) . "','" . trim($array[5]) . "')";
        }
        $stmt = $dbh->query($sql);
        unlink($dir . $fn); //ファイルを削除する
        sleep(3);   //３秒待つ
    }
}
closedir($dh);  //ディレクトリ閉じる

?>
