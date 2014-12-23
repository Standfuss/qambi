(function() {

    'use strict';

    scope.navigation = {};

    scope.navigation.main = [
        {label: 'api', hash: 'api', url: '/api'},
        {label: 'docs', hash: 'docs', url: '/docs'},
        {label: 'code', hash:'extern', url: 'https://github.com/abudaan/heartbeat'},
        {label: 'examples', hash: 'examples', url: '/examples'}
    ];


    scope.navigation.api = [
        {label:'Sequencer', hash: 'sequencer', 'url': '/api/sequencer'},
        {label:'Song', hash: 'song', 'url': '/api/song'},
        {label:'Track', hash: 'track', 'url': '/api/track'},
        {label:'Part', hash: 'part', 'url': '/api/part'},
        {label:'MidiEvent', hash: 'midi-event', 'url': '/api/midi-event'},
        {label:'MidiNote', hash: 'midi-note', 'url': '/api/midi-note'}
        //{label:'KeyEditor', hash: 'key-editor', 'url': '/api/key-editor'}
    ];

    scope.navigation.docs = [
        {label:'About heartbeat', hash: 'about-heartbeat', url:'/docs/about-heartbeat'},
        {label:'Features', hash: 'features', url:'/docs/features'},
        {label:'Adding assets', hash: 'adding-assets', url:'/docs/adding-assets'},
        {label:'Instruments', hash: 'instruments', url:'/docs/instruments'},
        {label:'Create instruments', hash: 'create-instruments', url:'/docs/create-instruments'},
        {label:'Create notes', hash: 'create-note', url:'/docs/create-note'},
        {label:'Find events and notes', hash: 'find-events-and-notes', url:'/docs/find-events-and-notes'},
        {label:'Statistics', hash: 'statistics', url:'/docs/statistics'},
        {label:'Quantize & fixed length', hash: 'quantize-and-fixed-length', url:'/docs/quantize-and-fixed-length'}
    ];

    scope.navigation['tests'] = [];

    scope.navigation.api.sequencer = {"properties":["autoAdjustBufferTime","browser","bufferTime","debug","defaultInstrument","defaultPPQ","legacy","midiInputs","midiOutputs","minimalSongLength","noteNameMode","numMidiInputs","numMidiOutputs","os","overrulePPQ","pauseOnBlur","pitch","precision","restartOnFocus","storage","ua","ui","util"],"methods":["addAssetPack","addCallbackAfterTask","addInstrument","addMidiFile","addSamplePack","addTask","allNotesOff","checkEventType","configureMasterCompressor","convertPPQ","coordinatesToPosition","createAudioEvent","createBiQuadFilter","createCompressor","createDelay","createInstrument","createKeyEditor","createMidiEvent","createMidiNote","createNote","createPanner","createPanner2","createPart","createReverb","createSample","createSimpleSynth","createSong","createTrack","enableMasterCompressor","findEvent","findNote","fixedLength","getAssetPack","getAssetPacks","getCompressionReduction","getFrequency","getFullNoteName","getInstrument","getInstruments","getMasterVolume","getMicrosecondsFromBPM","getMidiFile","getMidiFiles","getMidiInputs","getMidiInputsAsDropdown","getMidiOutputs","getMidiOutputsAsDropdown","getMidiPortsAsDropdown","getNiceTime","getNoteName","getNoteNameFromNoteNumber","getNoteNumber","getNoteOctave","getSample","getSamplePack","getSamplePacks","getSamples","getSnapshot","getStats","getTime","gridToSong","isBlackKey","midiEventNameByNumber","midiEventNumberByName","play","positionToSong","processEvent","processEvents","quantize","ready","removeAssetPack","removeInstrument","removeMidiFile","removeSamplePack","saveSongAsMidiFile","setAnimationFrameType","setMasterVolume","songToGrid","startTaskQueue","stopProcessEvent","stopProcessEvents"]}
    scope.navigation.api.song = {"properties":["activeEvents","activeNotes","activeParts","allEvents","autoQuantize","bar","bars","barsAsString","beat","bpm","changedEvents","changedNotes","changedParts","className","defaultInstrument","denominator","doLoop","durationMillis","durationTicks","eventIndex","events","eventsById","factor","fixedLength","fixedLengthValue","followEvent","gainNode","grid","highestNote","hour","id","illegalLoop","instruments","lastBar","lastEvent","lastEventTmp","listeners","loop","loopEnd","loopStart","loopedTime","lowestNote","metronome","midiEventListeners","midiInputs","midiOutputs","millis","millisPerTick","millisRounded","millisecond","minute","name","newEvents","newNotes","newParts","nominator","notes","notesById","numEvents","numMidiInputs","numMidiOutputs","numNotes","numParts","numSixteenth","numTimeEvents","numTracks","parts","partsById","paused","percentage","pitchRange","playbackSpeed","playhead","playheadRecording","playing","positionType","ppq","precount","precounting","preroll","prerolling","quantizeValue","recordId","recordedEvents","recordedNotes","recording","recordingNotes","removedEvents","removedNotes","removedParts","scheduler","second","secondsPerTick","sixteenth","songAndMetronomeEvents","songAndTimeEvents","stopped","tempoEvent","tick","ticks","ticksPerBar","ticksPerBeat","ticksPerSixteenth","timeAsString","timeEvents","timeSignatureEvent","tracks","tracksById","tracksByName","useMetronome","volume"],"methods":["addEffect","addEvent","addEventListener","addEvents","addMidiEventListener","addPart","addParts","addSong","addSongs","addTimeEvent","addTimeEvents","addTrack","addTracks","allNotesOff","barsToMillis","barsToTicks","cleanUp","configureMetronome","connect","createGrid","disconnect","eventToGrid","findEvent","findEvents","findNote","findNotes","getMidiInputs","getMidiInputsAsDropdown","getMidiOutputs","getMidiOutputsAsDropdown","getNoteLengthName","getPart","getParts","getPosition","getStats","getTempoEvents","getTimeSignatureEvents","getTrack","getTracks","getVolume","gridToSong","millisToBars","millisToTicks","muteAllTracks","noteToGrid","pause","play","positionToGrid","quantize","quantizeRecording","record","remove","removeDoubleTimeEvents","removeEffect","removeEventListener","removeMidiEventListener","removeMidiEventListeners","removeTimeEvent","removeTimeEvents","removeTrack","removeTracks","resetExternalMidiDevices","resetMetronome","resetTempo","resetTimeSignature","setDurationInBars","setLeftLocator","setLoop","setMetronomeVolume","setMidiInput","setMidiOutput","setPitchRange","setPlaybackSpeed","setPlayhead","setPrecount","setRightLocator","setTempo","setTimeSignature","setTrackSolo","setVolume","startRecording","stop","stopRecording","ticksToBars","ticksToMillis","trim","undoQuantize","undoRecording","update","updateGrid","updatePlayheadAndLocators","updateTempoEvent","updateTimeSignatureEvent"]}
    scope.navigation.api.track = {"properties":["autoQuantize","channel","className","effects","enableRetrospectiveRecording","events","eventsById","fixedLengthValue","id","input","instrument","instrumentId","instrumentName","lastEffect","midiEventListeners","midiInputs","midiOutputs","monitor","mute","name","needsUpdate","notes","notesById","numEffects","numEvents","numParts","output","panner","parts","partsById","quantizeValue","recordEnabled","recordingNotes","retrospectiveRecording","routeToMidiOut","solo","song","type","volume"],"methods":["addEffect","addMidiEventListener","addPart","addPartAt","addParts","addPartsAt","connect","copy","copyPart","copyParts","disconnect","findEvent","findNote","getIndex","getPart","getPartAt","getPartBetween","getPartFromTo","getParts","getPartsAt","getPartsFromTo","getStats","getVolume","moveAllParts","movePart","movePartTo","moveParts","movePartsTo","prepareForRecording","quantize","quantizeRecording","removeAllEvents","removeEffect","removeEvent","removeEventAt","removeEvents","removeEventsAt","removeEventsFromTo","removeMidiEventListener","removePart","removeParts","reset","setEffectPosition","setInstrument","setMidiInput","setMidiOutput","setPanning","setPartSolo","setSolo","setVolume","stopRecording","transposePart","undoQuantize","undoRecording","update"]}
    scope.navigation.api.part = {"properties":["autoSize","className","dirtyEvents","dirtyNotes","duration","end","endPosition","events","eventsById","id","millis","moved","mute","name","needsUpdate","notes","notesById","numEvents","numNotes","partIndex","solo","song","start","startPosition","state","ticks","transposed"],"methods":["addEvent","addEvents","addEventsRelative","copy","findEvents","findNotes","getIndex","getStats","moveEvent","moveEvents","moveNote","removeEvents","reset","reverseByPitch","reverseByTicks","setSolo","transposeAllEvents","transposeEvents","transposeNote","update"]}
    scope.navigation.api['midi-note'] = {"properties":["className","endless","id","name","note","noteOn","number","ticks","type","velocity"],"methods":["addNoteOff","setDuration","setEnd","setPitch","setStart","setVelocity"]}

    scope.navigation.api['midi-event'] = {
        "properties":[
            "channel",
            "className",
            "command",
            "data1",
            "data2",
            "eventNumber",
            "frequency",
            "id",
            "isDirty",
            "muted",
            "note",
            "noteName",
            "noteNumber",
            "octave",
            "status",
            "ticks",
            "type",
            "velocity"
        ],
        "methods":[
            "copy",
            "reset",
            "setPitch",
            "transpose",
            "move",
            "moveTo",
        ]}

}());
