import dotenv from 'dotenv'
dotenv.config();
import http from 'http';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import JZZ from 'jzz';

// 🎹 Connect to output MIDI device
var midi_output = null;
(async () => { midi_output = await JZZ().openMidiOut(process.env.MIDI_DEVICE_PORT).or('Cannot open MIDI Out port!'); })();


var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        // 🚨 Parse incomming Buffer
        data = JSON.parse('[' + data.toString() + ']')
        let midi_event = [decimalToHex(data[0]), data[1], Math.floor(data[2])];
        console.log(midi_event);

        try {
            midi_output.send(midi_event);


        } catch (e) { }

        // 📢 Broadcast event
        wss.clients.forEach(function each(client) {
            if (client._readyState === 1)
                client.send(JSON.stringify(data));

        });
    });

    // ws.send('something');
});

server.listen(8123);


// 🔧 Utils functions
function decimalToHex(dec) {
    return '0x' + (dec + 0x10000).toString(16).substr(-4).toUpperCase();
}
function midiPanic() {
    for (let midi_note = 0; midi_note <= 127; midi_note++) {
        let midi_event = [decimalToHex(144), midi_note, 0]
        midi_output.send(midi_event)
    }
}