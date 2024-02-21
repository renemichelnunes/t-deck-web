<?php

use OpenSwoole\WebSocket\Server;
use OpenSwoole\Http\Request;
use OpenSwoole\WebSocket\Frame;

//$server = new Server("127.0.0.1", 9501, OpenSwoole\Server::POOL_MODE, OpenSwoole\Constant::SOCK_TCP | OpenSwoole\Constant::SSL);
//$server = new Swoole\Server('0.0.0.0', 9501, SWOOLE_PROCESS, SWOOLE_SOCK_TCP | SWOOLE_SSL);
$server = new Server('0.0.0.0', 9501);
$stopHello = FALSE;
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

function parse($data){
    $decoded_data = json_decode($data, true);
    if ($decoded_data === null && json_last_error() !== JSON_ERROR_NONE) {
        echo $data;
    } else {
        print_r ($decoded_data);
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
    $stopHello = FALSE;
    echo "connection open: {$request->fd}\n";
    $server->tick(1000, "hello", $server, $request);
});

$server->on('Message', function($server, Frame $frame)
{
    if($frame->opcode == 0x08)
    {
        echo "Close frame received: Code {$frame->code} Reason {$frame->reason}\n";
    }
    else
    {
        parse($frame->data);
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
