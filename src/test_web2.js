import fetch from 'isomorphic-fetch'
import qambi, {
  setMasterVolume,
  getMasterVolume,
  createMIDIEvent,
  createMIDIEvents,
  moveMIDIEvent,
  moveMIDIEventTo,
  createMIDINote,
  getEvents,
  createSong,
  addTracks,
  createTrack,
  addParts,
  createPart,
  addMIDIEvents,
  updateSong,
  startSong,
  stopSong,
  parseMIDIFile,
  songFromMIDIFile,
  getTrackIds,
  Instrument,
  setInstrument,
  getMIDIOutputIds,
  setMIDIOutputIds,
  parseSamples,
  getData,
} from './qambi'

qambi.getMasterVolume()
//qambi.log('functions')
qambi.init().then(function(data){
  console.log(data, qambi.getMasterVolume())
  setMasterVolume(0.5)
})

document.addEventListener('DOMContentLoaded', function(){

  let buttonStart = document.getElementById('start')
  let buttonStop = document.getElementById('stop')
  let buttonMove = document.getElementById('move')
  buttonStart.disabled = true
  buttonStop.disabled = true

  let test = 4
  let noteon, noteoff, note, songId, track, part1, part2

  if(test === 1){

    songId = createSong({name: 'My First Song', playbackSpeed: 1, loop: true, bpm: 60})
    track = createTrack({name: 'guitar', songId})
    part1 = createPart({name: 'solo1', track})
    part2 = createPart({name: 'solo2', track})
    //noteon = createMIDIEvent(960, 144, 60, 100)
    //noteoff = createMIDIEvent(1020, 128, 60, 0)
    //addMIDIEvents(part1, noteon, noteoff)

    //note = createMIDINote(noteon, noteoff)


    let events = []
    let ticks = 0
    let type = 144

    for(let i = 0; i < 100; i++){
      events.push(createMIDIEvent(ticks, type, 60, 100))
      if(i % 2 === 0){
        type = 128
        ticks += 960
      }else{
        type = 144
        ticks += 960
      }
    }
    addMIDIEvents(part1, ...events)

    addParts(track, part1, part2)
    addTracks(songId, track)
    updateSong(songId)
    buttonStart.disabled = false
  }

/*
  //startSong(song)
  // let song2 = createSong()

  // setTimeout(function(){
  //   startSong(song2, 5000)
  // }, 1000)

//   setTimeout(function(){
//     stopSong(song)
// //    stopSong(song2)
//   }, 200)
*/

  if(test === 2){
    //fetch('mozk545a.mid')
    fetch('minute_waltz.mid')
    .then(
      (response) => {
        return response.arrayBuffer()
      },
      (error) => {
        console.error(error)
      }
    )
    .then((ab) => {
      //songId = songFromMIDIFile(parseMIDIFile(ab))
      let mf = parseMIDIFile(ab)
      songId = songFromMIDIFile(mf)
      let instrument = new Instrument()
      getTrackIds(songId).forEach(function(trackId){
        setInstrument(trackId, instrument)
        setMIDIOutputIds(trackId, ...getMIDIOutputIds())
      })
      //console.log('header:', mf.header)
      //console.log('# tracks:', mf.tracks.size)
      buttonStart.disabled = false
      buttonStop.disabled = false
    })
  }


  if(test === 3){
    let instrument = new Instrument()
    parseSamples({
      c4: '../data/TP01d-ElectricPiano-000-060-c3.wav'
    }).then(
      function onFulfilled(buffers){
        //console.log(buffers);
        instrument.addSampleData(60, buffers.c4, {
          sustain: [0],
          release: [4, 'equal power'],
        });
        let e = createMIDIEvents([0, 144, 60, 100], [120, 128, 60, 0], [240, 144, 60, 100], [2400, 128, 60, 0])
        instrument.processMIDIEvent({ticks: 0, type: 144, data1: 60, data2: 100})
        instrument.processMIDIEvent({ticks: 200, type: 128, data1: 60, data2: 0})
        // instrument.processMIDIEvent({ticks: 240, type: 144, data1: 60, data2: 100})
        // instrument.processMIDIEvent({ticks: 440, type: 128, data1: 60, data2: 0})
        // instrument.processMIDIEvent({ticks: 480, type: 144, data1: 60, data2: 100})
        // instrument.processMIDIEvent({ticks: 720, type: 128, data1: 60, data2: 0})
        qambi.log('state')
      },
      function onRejected(e){
        console.warn(e);
      }
    )
  }

  let ticks = 0
  let midiEventId = 0

  if(test === 4){
    //fetch('mozk545a.mid')
    fetch('minute_waltz.mid')
    .then(
      (response) => {
        return response.arrayBuffer()
      },
      (error) => {
        console.error(error)
      }
    )
    .then((ab) => {
      //songId = songFromMIDIFile(parseMIDIFile(ab))
      let mf = parseMIDIFile(ab)
      songId = songFromMIDIFile(mf)
      let instrument = new Instrument()
      qambi.log('state')
      getTrackIds(songId).forEach(function(trackId){
        setInstrument(trackId, instrument)
        setMIDIOutputIds(trackId, ...getMIDIOutputIds())
      })
      //console.log('header:', mf.header)
      //console.log('# tracks:', mf.tracks.size)
      buttonStart.disabled = false
      buttonStop.disabled = false
      let s = createSong()
      updateSong(s)
      let r = getEvents(songId, ['data1 > 100'])
      console.log(r)
      let {
        data1, data2, ticks, barsAsString
      } = getData(r[0], 'data1', 'data2', 'ticks', 'barsAsString')
      //console.log(getData(r[0], 'data1', 'data2', 'ticks', 'barsAsString'))
      //console.log(getEvents(songId))
      console.log(data1, data2, ticks, barsAsString)
      //midiEventId = getEvent
      console.log(getData(songId, 'name', 'midiEvents'))
    })
  }

  buttonStart.addEventListener('click', function(){
    startSong(songId, 0)
  })

  buttonStop.addEventListener('click', function(){
    stopSong(songId)
  })

  buttonMove.addEventListener('click', function(){
    //moveMIDIEvent(midiEventId, ++ticks)
    moveMIDIEvent(songId, ++ticks)
    updateSong(songId)
  })

})