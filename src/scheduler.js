'use strict';

import {typeString} from './util.js';
import getConfig from './config';
import createMIDIEvent from './midi_event';

let config = getConfig();

class Scheduler{

  constructor(song){
    this.song = song;
    this.looped = false;
    this.notes = {};
    this.audioEvents = {};
  }


  updateSong(){
    this.events = this.song.eventsMidiAudioMetronome;
    this.numEvents = this.events.length;
    this.index = 0;
    this.maxtime = 0;
    this.notes = {};
    this.audioEvents = this.song.audioEvents;
    this.numAudioEvents = this.audioEvents.length;
    this.scheduledAudioEvents = {};
    this.looped = false;
    this.setIndex(this.song.millis);
    //console.log('Scheduler.setIndex', this.index, this.numEvents);
  }


  setIndex(millis){
    let i = 0;
    for(let event of this.events){
      if(event.millis >= millis){
        this.index = i;
        break;
      }
      i++;
    }
    //console.log(millis);
    this.beyondLoop = false;
    if(millis > this.song.loopEnd){
      this.beyondLoop = true;
    }

    this.scheduledAudioEvents = {};
  }

  /*
    A dangling audio event start before, and ends after the current position of the playhead. We have to calculate the difference between
    the start of the sample (event.millis) and the position of the playhead (song.millis). This value is the playheadOffset, and the sample
    starts the number of seconds of the playheadOffset into the sample.

    Also the audio event is scheduled the number of milliseconds of the playhead later to keep it in sync with the rest of the song.

    The playheadOffset is applied to the audio sample in audio_track.js
  */
  getDanglingAudioEvents(millis, events){
    let num = 0;

    for(let event of this.audioEvents){
      if(event.millis < millis && event.endMillis > millis){
        event.playheadOffset = (millis - event.millis);
        event.time = this.startTime + event.millis - this.songStartMillis + event.playheadOffset;
        event.playheadOffset /= 1000;
        this.scheduledAudioEvents[event.id] = event;
        //console.log('getDanglingAudioEvents', event.id);
        events.push(event);
        num++;
      }else{
        event.playheadOffset = 0;
      }
      //console.log('playheadOffset', event.playheadOffset);
    }
    //console.log('getDanglingAudioEvents', num);
    return events;
  }


  getEvents(){
    var i, event, events = [], note, noteOn, noteOff, endMillis, endTicks, diff, buffertime, audioEvent;

    buffertime = config.bufferTime * 1000;
    if(this.song.doLoop === true && this.song.loopDuration < buffertime){
      this.maxtime = this.songMillis + this.song.loopDuration - 1;
      //console.log(maxtime, this.song.loopDuration);
    }

    if(this.song.doLoop === true){

      if(this.maxtime >= this.song.loopEnd && this.beyondLoop === false){
      //if(this.maxtime >= this.song.loopEnd && this.prevMaxtime < this.song.loopEnd){
      //if(this.maxtime >= this.song.loopEnd && this.song.jump !== true){

        diff = this.maxtime - this.song.loopEnd;
        this.maxtime = this.song.loopStart + diff;

        //console.log(maxtime, this.song.loopEnd, diff);
        if(this.looped === false){
          //console.log(this.song.millis, maxtime, diff);
          this.looped = true;
          //console.log('LOOP', this.song.loopEnd, this.maxtime);
          for(i = this.index; i < this.numEvents; i++){
            event = this.events[i];
            if(event.millis < this.song.loopEnd){
              //console.log('  ', event.track.name, maxtime, this.index, this.numEvents);
              event.time = this.startTime + event.millis - this.songStartMillis;
              events.push(event);
              this.index++;
            }else{
              break;
            }
          }

          // stop overflowing notes-> move the note off event to the position of the right locator (end of the loop)
          endTicks = this.song.loopEndTicks - 1;
          endMillis = this.song.getPosition('ticks', endTicks).millis;
          for(i in this.notes){
            if(this.notes.hasOwnProperty(i)){
              note = this.notes[i];
              noteOn = note.noteOn;
              noteOff = note.noteOff;
              if(noteOff.millis <= this.song.loopEnd){
                continue;
              }
              event = createMIDIEvent(endTicks, 128, noteOn.data1, 0);
              event.millis = endMillis;
              event.part = noteOn.part;
              event.track = noteOn.track;
              event.midiNote = noteOn.midiNote;
              event.time = this.startTime + event.millis - this.songStartMillis;
              events.push(event);
            }
          }
          // stop overflowing audio samples
          for(i in this.scheduledAudioEvents){
            if(this.scheduledAudioEvents.hasOwnProperty(i)){
              audioEvent = this.scheduledAudioEvents[i];
              if(audioEvent.endMillis > this.song.loopEnd){
                audioEvent.stopSample(this.song.loopEnd/1000);
                delete this.scheduledAudioEvents[i];
                //console.log('stopping audio event', i);
              }
            }
          }
          this.notes = {};
          this.setIndex(this.song.loopStart);
          this.song.startTime += this.song.loopDuration;
          this.startTime = this.song.startTime;
          // get the audio events that start before song.loopStart
          this.getDanglingAudioEvents(this.song.loopStart, events);
        }
      }else{
        this.looped = false;
      }
    }

    if(this.firstRun === true){
      this.getDanglingAudioEvents(this.song.millis, events);
      this.firstRun = false;
    }

    for(i = this.index; i < this.numEvents; i++){
      event = this.events[i];

      if(event.millis < this.maxtime){
        // if(this.song.bar >= 6 && event.track.name === 'Sonata # 3'){
        //     console.log('  song:', this.song.millis, 'event:', event.millis, ('(' + event.type + ')'), 'max:', maxtime, 'id:', event.midiNote.id);
        // }
        event.time = this.startTime + event.millis - this.songStartMillis;

        if(event.type === 144 || event.type === 128){
          if(event.midiNote !== undefined && event.midiNote.noteOff !== undefined){
            if(event.type === 144){
              this.notes[event.midiNote.id] = event.midiNote;
            }else if(event.type === 128){
              delete this.notes[event.midiNote.id];
            }
            events.push(event);
          }
        }else if(event.type === 'audio'){
          if(this.scheduledAudioEvents[event.id] !== undefined){
            // @TODO: delete the entry in this.scheduledAudioEvents after the sample has finished
            // -> this happens when you move the playhead outside a loop if doLoop is true
            //console.log('this shouldn\'t happen!');
            //continue;
            audioEvent = this.scheduledAudioEvents[event.id];
            if(audioEvent.sample !== undefined && audioEvent.sample.source !== undefined){
              audioEvent.stopSample(0);
            // }else{
            //     continue;
            }
          }
          this.scheduledAudioEvents[event.id] = event;
          //console.log('scheduling', event.id);
          // the scheduling time has to be compensated with the playheadOffset (in millis)
          event.time = event.time + (event.playheadOffset * 1000);
          events.push(event);
        }else{
          // controller events
          events.push(event);
        }
        this.index++;
      }else{
        break;
      }
    }
    return events;
  }


  update(){
    var i,
      event,
      numEvents,
      events,
      track,
      channel;

    this.prevMaxtime = this.maxtime;

    if(this.song.precounting === true){
      this.songMillis = this.song.metronome.millis;
      this.maxtime = this.songMillis + (config.bufferTime * 1000);
      events = Array.from(this.song.metronome.getPrecountEvents(this.maxtime));

      if(this.maxtime > this.song.metronome.endMillis){
        // start scheduling events of the song -> add the first events of the song
        this.songMillis = 0;//this.song.millis;
        this.maxtime = this.song.millis + (config.bufferTime * 1000);
        this.startTime = this.song.startTime;
        this.startTime2 = this.song.startTime2;
        this.songStartMillis = this.song.startMillis;
        events = this.getEvents();
      }
    }else{
      this.songMillis = this.song.millis;
      this.maxtime = this.songMillis + (config.bufferTime * 1000);
      this.startTime = this.song.startTime;
      this.startTime2 = this.song.startTime2;
      this.songStartMillis = this.song.startMillis;
      events = this.getEvents();
    }

    numEvents = events.length;

    //for(i = events.length - 1; i >= 0; i--){
    for(i = 0; i < numEvents; i++){
      event = events[i];
      track = event.track;
      //console.log(track);
      if(
        track === undefined ||
        event.mute === true ||
        event.part.mute === true ||
        event.track.mute === true ||
        (event.track.type === 'metronome' && this.song.useMetronome === false)
        )
      {
        continue;
      }

      if(event.type === 'audio'){
        event.time /= 1000;
        track.audio.processEvent(event);
      }else{

        if(track.routeToMidiOut === false){
          // if(event.type === 144){
          //     console.log(event.time/1000, sequencer.getTime(), event.time/1000 - sequencer.getTime());
          // }
          event.time /= 1000;
          //console.log('scheduled', event.type, event.time, event.midiNote.id);
          //console.log(track.instrument.processEvent);
          track.instrument.processEvent(event);
        }else{
          channel = track.channel;
          if(channel === 'any' || channel === undefined || isNaN(channel) === true){
            channel = 0;
          }
          for(let key in Object.keys(track.midiOutputs)){
            let midiOutput = track.midiOutputs[key];
            if(event.type === 128 || event.type === 144 || event.type === 176){
              //midiOutput.send([event.type, event.data1, event.data2], event.time + sequencer.midiOutLatency);
              midiOutput.send([event.type + channel, event.data1, event.data2], event.time);
            }else if(event.type === 192 || event.type === 224){
              midiOutput.send([event.type + channel, event.data1], event.time);
            }
          }
          // needed for Song.resetExternalMidiDevices()
          this.lastEventTime = event.time;
        }
      }
    }
  }


  unschedule(){
    var args = Array.prototype.slice.call(arguments),
      events = [],
      i, e, track, instrument;

    let loop = function(data, i, maxi, events){
      var arg;
      for(i = 0; i < maxi; i++){
        arg = data[i];
        if(arg === undefined){
          continue;
        }else if(arg.className === 'MidiEvent'){
          events.push(arg);
        }else if(arg.className === 'MidiNote'){
          events.push(arg.noteOn);
        }else if(typeString(arg) === 'array'){
          loop(arg, 0, arg.length);
        }
      }
    };


    loop(args, 0, args.length, events);

    for(i = events.length - 1; i >= 0; i--){
      e = events[i];
      track = e.track;
      instrument = track.instrument;
      if(instrument){
        instrument.unscheduleEvent(e);
      }
    }
  }


  reschedule(){
    var i, track,
      numTracks = this.song.numTracks,
      tracks = this.song.tracks;

    for(i = 0; i < numTracks; i++){
      track = tracks[i];
      track.instrument.reschedule(this.song);
    }
  }
}


export function createScheduler(song) {
  return new Scheduler(song);
}
