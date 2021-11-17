const JZZ = require('jzz');

var port = 0;
var midi_device = null;

(async function main() {
  while (true) {

    try {
      midi_device = await JZZ().openMidiOut(port);
    } catch (error) {
      return;
    }

    console.log(port, midi_device._info.name);
    ++port;
  }
})();