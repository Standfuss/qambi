import qambi, {
  getMIDIInputs,
  SimpleSynth,
  getNoteData,
  MIDIEvent,
  MIDIEventTypes,
  ConvolutionReverb,
  Delay,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"


document.addEventListener('DOMContentLoaded', function(){

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    // piano: {
    //   type: 'Instrument',
    //   url: '../../instruments/heartbeat/city-piano-light.json'
    // }
  })
  .then(main)
})


function main(data){

  let {song, piano} = data
  let synth = new SimpleSynth('sine')

  song.getTracks().forEach(track => {
    // track.setInstrument(piano)
    track.setInstrument(synth)
    // listen to all connected MIDI input devices
    track.connectMIDIInputs(...getMIDIInputs())
    // enable monitor (like in Logic and Cubase)
    track.monitor = true
  })

  let btnPlay = document.getElementById('play')
  let btnPause = document.getElementById('pause')
  let btnStop = document.getElementById('stop')
  let btnReverb = document.getElementById('reverb')
  let btnDelay = document.getElementById('delay')
  let divLoading = document.getElementById('loading')
  let rangePanner = document.getElementById('panning')
  let rangeReverb = document.getElementById('reverb_amount')
  let rangeDelay = document.getElementById('delay_amount')
  divLoading.innerHTML = ''

  btnPlay.disabled = false
  btnPause.disabled = false
  btnStop.disabled = false
  btnReverb.disabled = false
  btnDelay.disabled = false

  btnPlay.addEventListener('click', function(){
    song.play()
  })

  btnPause.addEventListener('click', function(){
    song.pause()
  })

  btnStop.addEventListener('click', function(){
    song.stop()
  })


  // create convolution reverb
  let hasReverb = false
  let reverb = new ConvolutionReverb()
  reverb.loadBuffer('../data/100-Reverb.mp3')
  .then(
    () => {
      btnReverb.disabled = false
    },
    e => console.log(e)
  )

  btnReverb.addEventListener('click', function(){
    hasReverb = !hasReverb
    if(hasReverb){
      song.getTracks().forEach(t => {
        t.insertEffect(reverb)
      })
      btnReverb.innerHTML = 'remove reverb'
      rangeReverb.disabled = false
    }else{
      song.getTracks().forEach(t => {
        t.removeEffect(reverb)
        //t.removeEffectAt(0)
      })
      btnReverb.innerHTML = 'add reverb'
      rangeReverb.disabled = true
      //rangeReverb.value = 0
      //reverb.setAmount(0)
    }
  })


  // create delay
  let hasDelay = false
  let delay = new Delay()

  btnDelay.addEventListener('click', function(){
    hasDelay = !hasDelay
    if(hasDelay){
      song.getTracks().forEach(t => {
        t.insertEffect(delay)
      })
      btnDelay.innerHTML = 'remove delay'
      rangeDelay.disabled = false
    }else{
      song.getTracks().forEach(t => {
        t.removeEffect(delay)
        //t.removeEffectAt(0)
      })
      btnDelay.innerHTML = 'add delay'
      rangeDelay.disabled = true
    }
  })


  // very rudimental on-screen keyboard
  let track = song.getTracks()[0]
  let keys = new Map();
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'].forEach(key => {

    let btnKey = document.getElementById(key)
    keys.set(key, btnKey)

    btnKey.addEventListener('mousedown', startNote, false)
    btnKey.addEventListener('mouseup', stopNote, false)
    btnKey.addEventListener('mouseout', stopNote, false)
  })

  function startNote(){
    let noteNumber = getNoteData({fullName: this.id}).number
    track.processMIDIEvent(new MIDIEvent(0, MIDIEventTypes.NOTE_ON, noteNumber, 100))
  }

  function stopNote(){
    let noteNumber = getNoteData({fullName: this.id}).number
    track.processMIDIEvent(new MIDIEvent(0, MIDIEventTypes.NOTE_OFF, noteNumber))
  }

  // add listeners for all noteon and noteoff events
  song.addEventListener('noteOn', e => {
    // console.log(e.data)
    let btn = keys.get(e.data.fullNoteName)
    // check if this key exists on the on-screen keyboard
    if(btn){
      btn.className = 'key-down'
    }
  })

  song.addEventListener('noteOff', e => {
    // console.log(e.data)
    let btn = keys.get(e.data.fullNoteName)
    if(btn){
      btn.className = 'key-up'
    }
  })

  // set all keys of the on-screen keyboard to the up state when the song stops or pauses
  song.addEventListener('stop', () => {
    keys.forEach(key => {
      key.className = 'key-up'
    })
  })

  song.addEventListener('pause', () => {
    keys.forEach(key => {
      key.className = 'key-up'
    })
  })

  function setPanning(e){
    song.getTracks().forEach(t => {
      t.setPanning(e.target.valueAsNumber)
    })
    //song.setPanning(e.target.valueAsNumber)
    //console.log(e.target.valueAsNumber)
  }

  rangePanner.addEventListener('mousedown', e => {
    rangePanner.addEventListener('mousemove', setPanning, false)
  })

  rangePanner.addEventListener('mouseup', e => {
    rangePanner.removeEventListener('mousemove', setPanning, false)
  })


  function setReverb(e){
    if(hasReverb === false){
      return
    }
    reverb.setAmount(e.target.valueAsNumber)
    //console.log(e.target.valueAsNumber)
  }

  rangeReverb.addEventListener('mousedown', e => {
    rangeReverb.addEventListener('mousemove', setReverb, false)
  })

  rangeReverb.addEventListener('mouseup', e => {
    rangeReverb.removeEventListener('mousemove', setReverb, false)
  })


  function setDelay(e){
    if(hasDelay === false){
      return
    }
    delay.setAmount(e.target.valueAsNumber)
    //console.log(e.target.valueAsNumber)
  }

  rangeDelay.addEventListener('mousedown', e => {
    rangeDelay.addEventListener('mousemove', setDelay, false)
  })

  rangeDelay.addEventListener('mouseup', e => {
    rangeDelay.removeEventListener('mousemove', setDelay, false)
  })
}