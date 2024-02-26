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
    public $msg;
    public $msg_date;

    public function __construct($msg, $msg_date){
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

function contactsJSON(){
    global $contacts;
    $data = array("command" => "contacts","contacts" => $contacts);
    $json_data = json_encode($data);
    return $json_data;
}

function parse($data, $server, $frame){
    global $contacts;
    $decoded_data = json_decode($data, true);
    if ($decoded_data === null && json_last_error() !== JSON_ERROR_NONE) {
        echo $data;
    } else {
        print_r ($decoded_data);
        if($decoded_data["command"] === "sel_contact"){
            echo "ID " . $decoded_data["id"] . "\n";
            $msgs = array();
            $msgs[] = new message("oi", "24/02/2024 8:18");
            $msgs[] = new message("bora?", "24/02/2024 8:20");
            $msgs[] = new message("vai ou não?", "24/02/2024 8:21");
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
        $server->push($request->fd, contactsJSON());
    }
    //$server->tick(1000, "hello", $server, $request);
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
