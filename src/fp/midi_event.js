// @flow

import {getStore} from './create_store'
import {
  CREATE_MIDI_EVENT,
  CREATE_MIDI_NOTE,
  UPDATE_MIDI_EVENT,
  UPDATE_MIDI_NOTE,
} from './action_types'

const store = getStore()
let midiEventIndex = 0
let midiNoteIndex = 0

export function createMIDIEvent(ticks: number, type: number, data1: number, data2: number = -1){
  let id = `ME_${midiEventIndex++}_${new Date().getTime()}`
  store.dispatch({
    type: CREATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
      type,
      data1,
      data2
    }
  })
  return id
}

export function moveMIDIEvent(id: string, ticks_to_move: number){
  let state = store.getState()
  let event = state.midiEvents[id]
  let ticks = event.ticks + ticks_to_move
  //console.log(ticks, event.ticks)
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
    }
  })
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}

export function moveMIDIEventTo(id: string, ticks: number){
  let state = store.getState()
  let event = state.midiEvents[id]
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
    }
  })
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}

function updateMIDINote(id, state = store.getState()){
  let note = state.midiNotes[id]
  let events = state.midiEvents
  let start = events[note.noteon]
  let end = events[note.noteoff]

  store.dispatch({
    type: UPDATE_MIDI_NOTE,
    payload: {
      id,
      start: start.ticks,
      end: end.ticks,
      durationTicks: end.ticks - start.ticks
    }
  })
}

export function createMIDINote(noteon: string, noteoff: string){
  let id = `MN_${midiNoteIndex++}_${new Date().getTime()}`
  let events = store.getState().midiEvents
  let on = events[noteon]
  let off = events[noteoff]
  store.dispatch({
    type: CREATE_MIDI_NOTE,
    payload: {
      id,
      noteon,
      noteoff,
      start: on.ticks,
      end: off.ticks,
      durationTicks: off.ticks - on.ticks
    }
  })
  return id
}
