import qambi, {
  Song,
  Track,
  Instrument,
  getMIDIInputs,
} from '../../src/qambi'


document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
    initUI()
  })

  function initUI(){
    let song = new Song()
    let track = new Track()
    track.setRecordEnabled('midi')
    track.setInstrument(new Instrument()) // by passing a new Instrument, the simple sinewave synth is used for instrument
    song.addTracks(track)
    song.update()

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let btnRecord = document.getElementById('record')
    let btnUndoRecord = document.getElementById('record-undo')
    let btnMetronome = document.getElementById('metronome')
    let divTempo = document.getElementById('tempo')
    let divPosition = document.getElementById('position')
    let divPositionTime = document.getElementById('position_time')
    let rangePosition = document.getElementById('playhead')
    let selectMIDIIn = document.getElementById('midiin')
    let userInteraction = false

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false
    btnRecord.disabled = false
    btnMetronome.disabled = false


    let MIDIInputs = getMIDIInputs()
    let html = '<option id="-1">select MIDI in</option>'
    MIDIInputs.forEach(port => {
      html += `<option id="${port.id}">${port.name}</option>`
    })
    selectMIDIIn.innerHTML = html

    selectMIDIIn.addEventListener('change', e => {
      let portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id
      track.disconnectMIDIInputs() // no arguments means disconnect from all inputs
      track.connectMIDIInputs(portId)
    })

    btnMetronome.addEventListener('click', function(){
      song.setMetronome() // if no arguments are provided it simply toggles
      btnMetronome.innerHTML = song.useMetronome ? 'metronome on' : 'metronome off'
    })

    btnPlay.addEventListener('click', function(){
      song.play()
    })

    btnPause.addEventListener('click', function(){
      song.pause()
    })

    btnStop.addEventListener('click', function(){
      song.stop()
    })

    btnRecord.addEventListener('click', function(){
      if(song.recording === false){
        song.startRecording()
        btnRecord.className = 'recording'
      }else{
        song.stopRecording()
        btnRecord.className = 'neutral'
      }
    })

    btnUndoRecord.addEventListener('click', function(){
      if(btnUndoRecord.innerHTML === 'undo record'){
        song.undoRecording()
        btnUndoRecord.innerHTML = 'redo record'
      }else{
        song.redoRecording()
        btnUndoRecord.innerHTML = 'undo record'
      }
    })

    let position = song.getPosition()
    divPosition.innerHTML = position.barsAsString
    divPositionTime.innerHTML = position.timeAsString
    divTempo.innerHTML = `tempo: ${position.bpm} bpm`

    song.addEventListener('position', event => {
      divPosition.innerHTML = event.data.barsAsString
      divPositionTime.innerHTML = event.data.timeAsString
      divTempo.innerHTML = `tempo: ${event.data.bpm} bpm`
      if(!userInteraction){
        rangePosition.value = event.data.percentage
      }
    })

    song.addEventListener('stop_recording', e => {
      btnUndoRecord.disabled = false
    })

    song.addEventListener('start_recording', e => {
      btnUndoRecord.disabled = true
    })

    rangePosition.addEventListener('mouseup', e => {
      rangePosition.removeEventListener('mousemove', rangeListener)
      userInteraction = false
    })

    rangePosition.addEventListener('mousedown', e => {
      setTimeout(function(){
        song.setPosition('percentage', e.target.valueAsNumber)
      }, 0)
      rangePosition.addEventListener('mousemove', rangeListener)
      userInteraction = true
    })

    const rangeListener = function(e){
      song.setPosition('percentage', e.target.valueAsNumber)
    }
  }

})
