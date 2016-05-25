import {context} from './init_audio.js'
import {getEqualPowerCurve} from './util.js'

export class Sample{

  constructor(sampleData, event){
    this.event = event
    this.sampleData = sampleData
  }

  start(time){
    let {sustainStart, sustainEnd} = this.sampleData
    //console.log(sustainStart, sustainEnd)
    if(sustainStart && sustainEnd){
      this.source.loop = true
      this.source.loopStart = sustainStart
      this.source.loopEnd = sustainEnd
    }
    this.source.start(time);
  }

  stop(time, cb){
    let {releaseDuration, releaseEnvelope, releaseEnvelopeArray} = this.sampleData
    //console.log(releaseDuration, releaseEnvelope)
    this.source.onended = cb

    if(releaseDuration && releaseEnvelope){
      this.startReleasePhase = time
      this.releaseFunction = () => {
        fadeOut(this.output, {
          releaseDuration,
          releaseEnvelope,
          releaseEnvelopeArray,
        })
      }
      this.source.stop(time + releaseDuration)
      this.checkPhase()
    }else{
      this.source.stop(time)
    }
  }

  checkPhase(){
    //console.log(context.currentTime, this.startReleasePhase)
    if(context.currentTime >= this.startReleasePhase){
      this.releaseFunction()
      return
    }
    requestAnimationFrame(this.checkPhase.bind(this))
  }
}


export function fadeOut(gainNode, settings){
  let now = context.currentTime
  let values, i, maxi

  //console.log(settings)
  switch(settings.releaseEnvelope){

    case 'linear':
      gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now)
      gainNode.gain.linearRampToValueAtTime(0.0, now + settings.releaseDuration)
      break

    case 'equal power':
    case 'equal_power':
      values = getEqualPowerCurve(100, 'fadeOut', gainNode.gain.value)
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration)
      break

    case 'array':
      maxi = settings.releaseEnvelopeArray.length
      values = new Float32Array(maxi)
      for(i = 0; i < maxi; i++){
        values[i] = settings.releaseEnvelopeArray[i] * gainNode.gain.value
      }
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration)
      break

    default:
  }
}
