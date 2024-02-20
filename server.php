<?php

use OpenSwoole\WebSocket\Server;
use OpenSwoole\Http\Request;
use OpenSwoole\WebSocket\Frame;

$server = new Server("127.0.0.1", 9501, OpenSwoole\Server::POOL_MODE, OpenSwoole\Constant::SOCK_TCP | OpenSwoole\Constant::SSL);

$stopHello = FALSE;

$server->set([
    'open_tcp_keepalive' => true,
    'ssl_cert_file' => __DIR__ . '/config/ssl-cert-snakeoil.pem',
    'ssl_key_file' => __DIR__ . '/config/ssl-cert-snakeoil.key',
    'ssl_allow_self_signed' => true,
]);

$server->on("Start", function(Server $server)
{
    echo "OpenSwoole WebSocket Server is started at http://127.0.0.1:9501\n";
});

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

$server->on('Open', function(Server $server, OpenSwoole\Http\Request $request)
{
    global $stopHello;
    $stopHello = FALSE;
    echo "connection open: {$request->fd}\n";
    $server->tick(1000, "hello", $server, $request);
});

$server->on('Message', function(Server $server, Frame $frame)
{
    if($frame->opcode == 0x08)
    {
        echo "Close frame received: Code {$frame->code} Reason {$frame->reason}\n";
    }
    else
    {
        echo "Message received: {$frame->data}\n";
    }
});

$server->on('Close', function(Server $server, int $fd)
{   
    global $stopHello;
    $stopHello = TRUE;
    echo "connection close: {$fd}\n";
});

$server->on('Disconnect', function(Server $server, int $fd)
{
    echo "connection disconnect: {$fd}\n";
});

$server->start();
