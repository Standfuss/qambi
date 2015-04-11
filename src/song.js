'use strict';

import {addEventListener, removeEventListener, dispatchEvent} from './song_add_eventlistener';
import {log, info, warn, error, typeString} from './util';
import getConfig from './config';
import {Track} from './track';
import {Part} from './part';
import {MIDIEvent} from './midi_event';
import {initMidiSong, setMidiInputSong, setMidiOutputSong} from './init_midi';


let songId = 0,
  config = getConfig(),
  defaultSong = config.get('defaultSong');


export class Song{

  /*
    @param settings is a Map or an Object
  */
  constructor(settings){

    this.id = 'S' + songId++ + Date.now();
    this.name = this.id;
    this._tracks = [];
    this._parts = [];
    this._tracksMap = new Map();

    this._events = []; // all midi and audio events
    this._allEvents = []; //
    this._timeEvents = []; // all tempo and time signature events

    this.needsUpdate = false;

    // first add all settings from the default song
///*
    defaultSong.forEach(function(value, key){
      this[key] = value;
    }, this);
//*/
/*
    // or:
    for(let[value, key] of defaultSong.entries()){
      ((key, value) => {
        this[key] = value;
      })(key, value);
    }
*/


    if(settings.timeEvents){
      this.timeEvents = Array.from(settings.timeEvents);
      delete settings.timeEvents;
    }

    if(settings.tracks){
      for(let track of settings.tracks){
        this.addTrack(track);
      }
      delete settings.tracks;
    }


    // then override settings by provided settings
    if(typeString(settings) === 'object'){
      Object.keys(settings).forEach(function(key){
        this[key] = settings[key];
      }, this);
    }else if(settings !== undefined){
      settings.forEach(function(value, key){
        this[key] = value;
      }, this);
    }

    // initialize midi for this song: add Maps for midi in- and outputs, and add eventlisteners to the midi inputs
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    initMidiSong(this); // @see: init_midi.js

    this.lastBar = this.bars;
    this.pitchRange = this.highestNote - this.lowestNote + 1;
    this.factor = 4/this.denominator;
    this.ticksPerBeat = this.ppq * this.factor;
    this.ticksPerBar = this.ticksPerBeat * this.nominator;
    this.millisPerTick = (60000/this.bpm/this.ppq);
    this.recordId = -1;
    this.doLoop = false;
    this.illegalLoop = true;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.loopDuration = 0;
    this.audioRecordingLatency = 0;
    this.grid = undefined;

    config.get('activeSongs')[this.id] = this;


    //console.log(this);
/*
    if(settings.timeEvents && settings.timeEvents.length > 0){
      this.timeEvents = Array.from(settings.timeEvents);

      this.tempoEvent = getTimeEvents(sequencer.TEMPO, this)[0];
      this.timeSignatureEvent = getTimeEvents(sequencer.TIME_SIGNATURE, this)[0];

      if(this.tempoEvent === undefined){
        this.tempoEvent = new MIDIEvent(0, sequencer.TEMPO, this.bpm);
        this.timeEvents.unshift(this.tempoEvent);
      }else{
        this.bpm = this.tempoEvent.bpm;
      }
      if(this.timeSignatureEvent === undefined){
        this.timeSignatureEvent = new MIDIEvent(0, sequencer.TIME_SIGNATURE, this.nominator, this.denominator);
        this.timeEvents.unshift(this.timeSignatureEvent);
      }else{
        this.nominator = this.timeSignatureEvent.nominator;
        this.denominator = this.timeSignatureEvent.denominator;
      }
      //console.log(1, this.nominator, this.denominator, this.bpm);
    }else{
      // there has to be a tempo and time signature event at ticks 0, otherwise the position can't be calculated, and moreover, it is dictated by the MIDI standard
      this.tempoEvent = new MIDIEvent(0, sequencer.TEMPO, this.bpm);
      this.timeSignatureEvent = new MIDIEvent(0, sequencer.TIME_SIGNATURE, this.nominator, this.denominator);
      this.timeEvents = [
        this.tempoEvent,
        this.timeSignatureEvent
      ];
    }

    // TODO: A value for bpm, nominator and denominator in the config overrules the time events specified in the config -> maybe this should be the other way round

    // if a value for bpm is set in the config, and this value is different from the bpm value of the first
    // tempo event, all tempo events will be updated to the bpm value in the config.
    if(config.timeEvents !== undefined && config.bpm !== undefined){
      if(this.bpm !== config.bpm){
        this.setTempo(config.bpm, false);
      }
    }

    // if a value for nominator and/or denominator is set in the config, and this/these value(s) is/are different from the values
    // of the first time signature event, all time signature events will be updated to the values in the config.
    // @TODO: maybe only the first time signature event should be updated?
    if(config.timeEvents !== undefined && (config.nominator !== undefined || config.denominator !== undefined)){
      if(this.nominator !== config.nominator || this.denominator !== config.denominator){
        this.setTimeSignature(config.nominator || this.nominator, config.denominator || this.denominator, false);
      }
    }

    //console.log(2, this.nominator, this.denominator, this.bpm);

    this.tracks = [];
    this.parts = [];
    this.notes = [];
    this.events = [];//.concat(this.timeEvents);
    this.allEvents = []; // all events plus metronome ticks

    this.tracksById = {};
    this.tracksByName = {};
    this.partsById = {};
    this.notesById = {};
    this.eventsById = {};

    this.activeEvents = null;
    this.activeNotes = null;
    this.activeParts = null;

    this.recordedNotes = [];
    this.recordedEvents = [];
    this.recordingNotes = {}; // notes that don't have their note off events yet

    this.numTracks = 0;
    this.numParts = 0;
    this.numNotes = 0;
    this.numEvents = 0;
    this.instruments = [];

    this.playing = false;
    this.paused = false;
    this.stopped = true;
    this.recording = false;
    this.prerolling = false;
    this.precounting = false;
    this.preroll = true;
    this.precount = 0;
    this.listeners = {};

    this.playhead = createPlayhead(this, this.positionType, this.id, this);//, this.position);
    this.playheadRecording = createPlayhead(this, 'all', this.id + '_recording');
    this.scheduler = createScheduler(this);
    this.followEvent = createFollowEvent(this);

    this.volume = 1;
    this.gainNode = context.createGainNode();
    this.gainNode.gain.value = this.volume;
    this.metronome = createMetronome(this, dispatchEvent);
    this.connect();


    if(config.className === 'MidiFile' && config.loaded === false){
      if(sequencer.debug){
        console.warn('midifile', config.name, 'has not yet been loaded!');
      }
    }

    //if(config.tracks && config.tracks.length > 0){
    if(config.tracks){
      this.addTracks(config.tracks);
    }

    if(config.parts){
      this.addParts(config.parts);
    }

    if(config.events){
      this.addEvents(config.events);
    }

    if(config.events || config.parts || config.tracks){
      //console.log(config.events, config.parts, config.tracks)
      // the length of the song will be determined by the events, parts and/or tracks that are added to the song
      if(config.bars === undefined){
        this.lastBar = 0;
      }
      this.lastEvent = new MIDIEvent([this.lastBar, sequencer.END_OF_TRACK]);
    }else{
      this.lastEvent = new MIDIEvent([this.bars * this.ticksPerBar, sequencer.END_OF_TRACK]);
    }
    //console.log('update');
    this.update(true);

    this.numTimeEvents = this.timeEvents.length;
    this.playhead.set('ticks', 0);
    this.midiEventListeners = {};
    //console.log(this.timeEvents);

*/
  }


  stop(){
    dispatchEvent('stop');
  }

  play(){
    dispatchEvent('play');
  }

  setMidiInput(id, flag = true){
    setMidiInputSong(this, id, flag);
  }

  setMidiOutput(id, flag = true){
    setMidiOutputSong(this, id, flag);
  }

  addMidiEventListener(...args){
    addMidiEventListener(this, ...args);
  }


  addTrack(track){
    if(track instanceof Track){
      track.state = 'new';
      track.needsUpdate = true;
      this.needsUpdate = true;
      this._tracksMap.set(track.id, track);
      this._numberOfTracksChanged = true;
      return this; // make it chainable
    }
  }

  removeTrack(track){
    if(this._tracksMap.has(track.id)){
      track.state = 'removed';
      this.needsUpdate = true;
      this._numberOfTracksChanged = true;
      return this; // make it chainable
    }
  }

  getTracks(){
    if(this.needsUpdate){
      this.update();
    }
    return _tracks;
  }

  update(){

    if(this._numberOfTracksChanged === true){
      this._tracks = [];
      Array.from(this._tracksMap.values()).every((track) => {
        if(track.state === 'removed'){
          this._tracksMap.delete(track.id);
        }else{
          track.state = 'clean';
          this._tracks.push(track);
        }
      });
      this._numberOfTracksChanged = false;
    }

    if(this._numberOfPartsChanged === true){
      this._parts = [];
      Array.from(this._partsMap.values()).every((part) => {
        if(part.state === 'removed'){
          this._partsMap.delete(part.id);
        }else{
          part.state = 'clean';
          this._parts.push(part);
        }
      });
      this._numberOfPartsChanged = false;
    }

    if(this._numberOfEventsChanged === true){
      this._events = [];
      Array.from(this._eventsMap.values()).every((event) => {
        if(event.state === 'removed'){
          this._eventsMap.delete(event.id);
        }else{
          part.state = 'clean';
          this._events.push(event);
        }
      });
      this._numberOfEventsChanged = false;
    }


    for(let track of this._tracks){
      for(let event in track._newEvents){
        this._events.push(event);
      }
      track._newEvents.clear();

      for(let part in track._newParts){
        this._parts.push(part);
      }
      track._newParts.clear();
    }


    this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);

    this.needsUpdate = false;
  }
}

Song.prototype.addEventListener = addEventListener;
Song.prototype.removeEventListener = removeEventListener;
Song.prototype.dispatchEvent = dispatchEvent;


export function createSong(settings){
  return new Song(settings);
}