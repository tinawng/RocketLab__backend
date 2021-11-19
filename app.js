import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { WebSocketServer, createWebSocketStream } from 'ws';
import JZZ from 'jzz';
import AudioRecorder from 'node-audiorecorder';

// 🎤 Init audio recorder.
// const audio_input = new AudioRecorder({
//     channels: 1,
//     device: "plughw:1,0",
//     program: 'arecord',
//     format: 'S16_LE',
//     rate: 44100,
//     silence: 0
// }, console);

// 🎹 Connect to output MIDI device
var midi_output = null;
(async () => { midi_output = await JZZ().openMidiOut(process.env.MIDI_DEVICE_PORT).or('Cannot open MIDI Out port!'); })();

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws, req) {
    let user_ip = req.socket.remoteAddress;
    if (!user_list.includes(user_ip)) user_list.push(user_ip);
    let user_name = fruits[user_list.indexOf(user_ip)];

    ws.on('message', function message(message) {
        // 🚨 Parse incomming Buffer
        message = JSON.parse(message.toString());

        if (message.type === 'midi-event') {
            let midi_event = [decimalToHex(message.data[0]), message.data[1], Math.floor(message.data[2])];

            try { midi_output.send(midi_event); } catch (e) { }

            // 📢 Broadcast event
            wss.clients.forEach(function each(client) {
                if (client._readyState === 1) {
                    client.send(JSON.stringify({ user_name: user_name, midi: message.data }));
                }

            });
        }
        if (message.type === 'ask-stream') {
            const stream = createWebSocketStream(ws);
            audio_input.start().stream().pipe(stream);
        }
    });
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

var user_list = [];
const fruits = ["Raspberries", "Pummelo", "Melon", "Papaya", "Elderberries", "Pineapple", "Mango", "Strawberries", "Clementine", "Tamarind", "Watermelon", "Kiwifruit", "Jackfruit", "Mangosteen", "Honeydew", "Durian", "Cherimoya", "Kumquat", "Avocado", "Plantain", "Feijoa", "Persimmon", "Mandarin", "Cherries", "Gooseberries", "Loquat", "Blueberries", "Cantaloupe", "Figs", "Blackberries", "Sapodilla", "Orange", "Pitanga", "Plums", "Nectarine", "Tangerine", "Peaches", "Lime", "Blackcurrant", "Carambola", "Pear", "Guava", "Grapes", "Pomegranate", "Olives", "Cranberries", "Lemon", "Coconut", "Prunes", "Breadfruit", "Grapefruit", "Date Fruit", "Lychee", "Rhubarb", "Quince", "Soursop", "Banana", "Longan", "Mulberries"]