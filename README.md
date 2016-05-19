###qambi

Qambi is a rebuild of [heartbeat](https://abudaan.github.io/heartbeat) in es6 and still work in progress. Not all functionality has been ported yet. If you need a well-tested sequencer for your project you'd better use heartbeat.

Missing features compared to heartbeat:

 - audio events
 - audio recording
 - save as binary MIDI file


In the next code example we load a binary MIDI file and create a qambi song of it. Then we loop over all tracks of this song and add an instrument. By calling the Instrument constructor without arguments we create a simple sinewave synth.

```javascript
import qambi, {
  Song,
  Instrument,
} from 'qambi'


qambi.init()
.then({
  Song.fromMIDIFileAsync('path/to/minute_waltz.mid')
  .then(song => {
      song.getTracks().forEeach(track => {
        track.setInstrument(new Instrument())
      })
      song.play()
    },
    e => console.log(e)
  )
})
```

More [examples](http://abudaan.github.io/qambi/)

