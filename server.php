<?php

use OpenSwoole\WebSocket\Server;
use OpenSwoole\Http\Request;
use OpenSwoole\WebSocket\Frame;

$server = new Server("127.0.0.1", 9501);
$stopHello = FALSE;

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
    echo "received message: {$frame->data}\n";
    $server->push($frame->fd, json_encode(["hello", time()]));
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
