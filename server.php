<?php

use OpenSwoole\WebSocket\Server;
use OpenSwoole\Http\Request;
use OpenSwoole\WebSocket\Frame;

//$server = new Server("127.0.0.1", 9501, OpenSwoole\Server::POOL_MODE, OpenSwoole\Constant::SOCK_TCP | OpenSwoole\Constant::SSL);
//$server = new Swoole\Server('0.0.0.0', 9501, SWOOLE_PROCESS, SWOOLE_SOCK_TCP | SWOOLE_SSL);
$server = new Server('0.0.0.0', 9501);
$stopHello = FALSE;
$ser = NULL;
$req = NULL;
/*
$server->set([
    'open_tcp_keepalive' => true,
    'ssl_cert_file' => __DIR__ . '/config/ssl-cert-snakeoil.pem',
    'ssl_key_file' => __DIR__ . '/config/ssl-cert-snakeoil.key',
    'ssl_allow_self_signed' => true,
]);
*/
$server->on("Start", function($server)
{
    echo "OpenSwoole WebSocket Server is started at http://127.0.0.1:9501\n";
});
/*
$server->on('Receive', function ($server, $fd, $reactor_id, $data) {
    // Handle incoming data here
    echo "Received data from client {$fd}: {$data}\n";
    // You can process the received data here and send back a response if needed
    $server->send($fd, 'Server received your message: ' . $data);
});
*/

class contact{
    public $name;
    public $id;

    public function __construct($name, $id, $status){
        $this->name = $name;
        $this->id = $id;
        $this->status = $status;
    }
}

class message{
    public $me;
    public $id;
    public $msg;
    public $msg_date;

    public function __construct($me, $id, $msg, $msg_date){
        $this->me = $me;
        $this->id = $id;
        $this->msg = $msg;
        $this->msg_date = $msg_date;
    }
}

$contacts = array();
$contacts[] = new contact("John Doe", "123456", "on");
$contacts[] = new contact("Jane Smith", "789012","off");
$contacts[] = new contact("Michael Johnson", "456789", "off");
$contacts[] = new contact("Emily Brown", "987654", "off");
$contacts[] = new contact("David Lee", "654321", "off");

$msgs = array();
$msgs[] = new message(true, "123456", "oi", "24/02/2024 8:18");
$msgs[] = new message(false, "123456", "[received]", "24/02/2024 8:18");
$msgs[] = new message(false, "123456", "bora?", "24/02/2024 8:20");
$msgs[] = new message(false, "123456", "vai ou não?", "24/02/2024 8:21");
$msgs[] = new message(true, "123456", "vo não", "24/02/2024 8:23");
$msgs[] = new message(true, "123456", "ce vai?", "24/02/2024 8:23");
$msgs[] = new message(false, "123456", "[received]", "24/02/2024 8:23");

$settings = array("command" => "settings",
                "name" => "Rene",
                "id" => "aaaaaa",
                "dx" => true,
                "color" => "AF0087",
                "brightness" => 1);

function contactsJSON(){
    global $contacts;
    $data = array("command" => "contacts","contacts" => $contacts);
    $json_data = json_encode($data);
    return $json_data;
}

function settingsJSON(){
    global $settings;
    $json_data = json_encode($settings);
    return $json_data;
}

function getCurrentDateTime() {
    // Get current timestamp
    date_default_timezone_set(date_default_timezone_get());
    $timestamp = time();

    // Format date and time
    $date = date('d/m/Y', $timestamp); // Format date as dd/mm/yyyy
    $time = date('H:i', $timestamp);   // Format time as hh:mm

    // Return formatted date and time
    return $date . ' ' . $time;
}

function new_rssi_snr($timerId, $s, $r) {
    // Generate random RSSI value between -120 and 0
    $randomRSSI = mt_rand(-120, 0);
    
    // Generate random SNR value between 0 and 20
    $randomSNR = mt_rand(0, 20);

    // Get current time
    $currentTime = date("Y-m-d H:i:s");

    if($s->isEstablished($r->fd))
        $s->push($r->fd, json_encode([
            "command" => "rssi_snr",
            "time" => $currentTime,
            "rssi" => $randomRSSI,
            "snr" => $randomSNR
        ]));
}

function parse($data, $server, $frame){
    global $contacts, $msgs, $settings;
    $exists = false;
    $decoded_data = json_decode($data, true);
    if ($decoded_data === null && json_last_error() !== JSON_ERROR_NONE) {
        echo $data;
    } else {
        print_r ($decoded_data);
        if($decoded_data["command"] === "sel_contact"){
            echo "ID " . $decoded_data["id"] . "\n";
            $msgl = array("command" => "msg_list", "messages" => $msgs);
            $server->push($frame->fd, json_encode($msgl));
        }else if($decoded_data["command"] === "del_contact"){
            foreach($contacts as $key => $c)
                if($c->id == $decoded_data["id"]){
                    unset($contacts[$key]);
                    $contacts = array_values($contacts);
                    $server->push($frame->fd, contactsJSON());
                    break;
                }
        }else if($decoded_data["command"] === "edit_contact"){
            foreach($contacts as $key => $c){
                foreach($contacts as $d){
                    if($d->id == $decoded_data["newid"]){
                        $exists = true;
                        $server->push($frame->fd, json_encode(array("command" => "notification", "message" => "ID already in use.")));
                        break;
                    }
                }
                if($exists)
                    break;
                if($c->id == $decoded_data["id"]){
                    if($decoded_data["newid"] !== "")
                        $contacts[$key]->id = $decoded_data["newid"];
                    if($decoded_data["newname"] !== "")
                        $contacts[$key]->name = $decoded_data["newname"];
                        $server->push($frame->fd, json_encode(array("command" => "notification", "message" => "Contact updated.")));
                        $server->push($frame->fd, contactsJSON());
                    break;
                }
            }
        }else if($decoded_data["command"] === "new_contact"){
            $exists = false;
            foreach($contacts as $d){
                if($d->id == $decoded_data["id"]){
                    $exists = true;
                    $server->push($frame->fd, json_encode(array("command" => "notification", "message" => "ID already in use.")));
                    break;
                }
                if($d->name == $decoded_data["name"]){
                    $exists = true;
                    $server->push($frame->fd, json_encode(array("command" => "notification", "message" => "Name already in use.")));
                    break;
                }
            }
            if(!$exists){
                $contacts[] = new contact($decoded_data["name"], $decoded_data["id"], "off");
                $server->push($frame->fd, contactsJSON());
                $server->push($frame->fd, json_encode(array("command" => "notification", "message" => "Contact added.")));
            }
        }else if($decoded_data["command"] === "send"){
            $msgs[] = new message(true, $decoded_data["id"], $decoded_data["msg"], getCurrentDateTime());
        }else if($decoded_data["command"] === "contacts"){
            $server->push($frame->fd, contactsJSON());
        }else if($decoded_data["command"] === "read_settings"){
            $server->push($frame->fd, settingsJSON());
        }else if($decoded_data["command"] === "set_name_id"){
            $settings["name"] = $decoded_data["name"];
            $settings["id"] = $decoded_data["id"];
            $server->push($frame->fd, "{\"command\" : \"notification\", \"message\" : \"Name  and ID saved.\"}");
        }else if($decoded_data["command"] === "set_ui_color"){
            $settings["color"] = $decoded_data["color"];
            print_r($decoded_data["color"]);
            print_r($settings["color"]);
            print_r(settingsJSON());
            $server->push($frame->fd, "{\"command\" : \"notification\", \"message\" : \"Color saved.\"}");
        }else if($decoded_data["command"] === "set_dx_mode"){
            $settings["dx"] = $decoded_data["dx"];
            $server->push($frame->fd, "{\"command\" : \"notification\", \"message\" : \"DX mode saved.\"}");
        }else if($decoded_data["command"] === "set_brightness"){
            $settings["brightness"] = $decoded_data["brightness"];
            $server->push($frame->fd, "{\"command\" : \"notification\", \"message\" : \"Brightness saved.\"}");
        }
    }
};

function hello($timerId, $s, $r){
    global $stopHello;

    if($stopHello)
        if(OpenSwoole\Timer::clear($timerId))
            echo "Timer cleared\n";
        else
            echo "Timer not cleared";
    if($s->isEstablished($r->fd))
        $s->push($r->fd, json_encode(["hello", time()]));
}

$server->on('Open', function($server, OpenSwoole\Http\Request $request)
{
    global $stopHello;
    global $req;

    $stopHello = FALSE;
    echo "connection open: {$request->fd}\n";
    if($server->isEstablished($request->fd)){
        
    }
    $server->tick(1000, "new_rssi_snr", $server, $request);
});

$server->on('Message', function($server, Frame $frame)
{
    if($frame->opcode == 0x08)
    {
        echo "Close frame received: Code {$frame->code} Reason {$frame->reason}\n";
    }
    else
    {
        parse($frame->data, $server, $frame);
    }
});

$server->on('Close', function($server, int $fd)
{   
    global $stopHello;
    $stopHello = TRUE;
    echo "connection close: {$fd}\n";
});

$server->on('Disconnect', function($server, int $fd)
{
    echo "connection disconnect: {$fd}\n";
});

$server->start();
