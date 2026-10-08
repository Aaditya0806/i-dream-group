This below integration code of Core PHP to Selldo CRM:

1) Just copy & peaste this code into your action php file
2) Just replace with "HTML_FORM_FIELD_NAME" to respective your form field name
    i)   Line number 14, replace with "name" your form field name (required)
    ii)  Line number 15, replace with "phone number" your form field name (required)
    iii) Line number 16, replace with "email" your form field name (required)
    iv)  Line number 17, replace with "message" your form field name (optional)

3) At line number 19, just replace "xxxxxxx" with default SRD value (optional)
4) At line number 20, just replace "xxxxxxx" with Selldo Api Key (required)


$name=$_POST['HTML_FORM_FIELD_NAME']; //required
$phone=$_POST['HTML_FORM_FIELD_NAME']; //required
$email=$_POST['HTML_FORM_FIELD_NAME']; //required
$message=$_POST['HTML_FORM_FIELD_NAME']; //optional

$srd="xxxxxxx"; //optional (add default srd value otherwise leave it blank)
$apikey="xxxxxxx"; //reaquired

$leaddata = array (
    "sell_do" => array(
        "analytics" => array("utm_content" => '', "utm_term" =>'',"utm_source"=>''), //all parameteres are optional
        "campaign" => array("srd" => $srd),
        "form" => array(
            "requirement" => array("property_type" => "flat"), 
            "custom" => array(),  
            "note" => array("content"=>$message), //optional
            "lead" => array ("name" =>$name, "phone"=>$phone,"email"=>$email) //all parameteres are required
        )
    ),
    "api_key" =>$apikey
);
$ch = curl_init('https://app.sell.do/api/leads/create.json');
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leaddata));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$response = curl_exec($ch);
curl_close($ch);
//echo "<pre>";print_r(json_decode($response));echo "</pre>";