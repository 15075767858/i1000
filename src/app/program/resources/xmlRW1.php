<?php
$fn = $_POST['fileName'];
$rw = $_POST['rw'];

$ip = $_SERVER["SERVER_ADDR"];
if ($ip != "127.0.0.1") {
    if (file_exists($fn)) {
        //chmod($fn, 0777);
        system("chmod 777 ".$fn);
    }

}

if ($rw == 'r') {
    $isFile = file_exists($fn);
    if ($isFile == false) {
        echo "null";
        return;
    }

    $fp = fopen($fn, 'r');
    while (!feof($fp)) {
        echo fgets($fp);
    }
} else {
    $content = $_POST["content"];
    $isHave = file_exists($fn);
    if (!$isHave) {

    }
    echo file_put_contents($fn, $content);
    //$fp = fopen($fn, 'w') or die("Unable to open file!");
    //fwrite($fp, $content);
    //fclose($fp);
}
//chmod($fn,0777);

?>