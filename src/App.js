/* global JitsiMeetJS config*/
// eslint-disable-next-line

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './App.css';
import $ from 'jquery'
import { Seat } from './components/Seat';
import { ConnectForm } from './components/ConnectForm';
import { Audio } from './components/Audio';
import useWindowSize from './hooks/useWindowSize'

import qs from 'qs'

window.$  = $
let connection = null;
let conference = null;
let room = null;
let localTrack = [];
let localAudioTrack = [] ;

const connect = async ({ domain, room, config }) => {
  const connectionConfig = Object.assign({}, config);
  let serviceUrl = connectionConfig.websocket || connectionConfig.bosh;

  serviceUrl += `?room=${room}`;
  if(serviceUrl.indexOf('//') === 0){
    serviceUrl = `https:${serviceUrl}`
  }
  connectionConfig.serviceUrl = connectionConfig.bosh = serviceUrl;
  
  return new Promise((resolve, reject) => {
    const connection = new JitsiMeetJS.JitsiConnection(null, undefined, connectionConfig);
    console.log('JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED', JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED)
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      () => resolve(connection));
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, reject);
    connection.connect();
  }) 
}

const join = async ({ connection, room }) => {
  const conference = connection.initJitsiConference(room, {});

  return new Promise(resolve => {
    conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => resolve(conference));
    conference.join();
  })
}

const connectandJoin = async ({ domain, room, config }) => {

  const connection = await connect({ domain, room, config })
  const localTracks = await JitsiMeetJS.createLocalTracks({ devices: ['video', 'audio'], facingMode: 'user'}, true);

  const conference = await join({ connection, room })
  const localTrack = localTracks.find(track => track.getType() === 'video')
  conference.addTrack(localTrack)
  const localAudioTrack = localTracks.find(track => track.getType() === 'audio')
  conference.addTrack(localAudioTrack)

  return { connection, conference, localTrack }
}

const loadAndConnect = ({ domain, room}) => {

    return new Promise(( resolve ) => {
      const script = document.createElement('script')
      script.onload = () => {
        JitsiMeetJS.init();

        const configScript = document.createElement('script')
        configScript.src = `https://${domain}/config.js`;
        document.querySelector('head').appendChild(configScript);
        configScript.onload = () => {
          connectandJoin({ domain, room, config }).then(resolve)
        }       
      };

      script.src = `https://${domain}/libs/lib-jitsi-meet.min.js`;
      document.querySelector('head').appendChild(script);
    })
}

const useTracks = () => {
  const [tracks, setTracks] = useState([])
  
  const addTrack = useCallback((track) => {
    setTracks((tracks) => {
      const hasTrack = tracks.find(_track => track.getId() === _track.getId())

      if(hasTrack) return tracks;

      return [...tracks, track]
      
    });
  }, [setTracks])

  const removeTrack = useCallback((track) => {
    setTracks((tracks) => tracks.filter(_track => track.getId() !== _track.getId()))
  }, [setTracks])

  return [tracks, addTrack, removeTrack]
}

const getDefaultParamsValue = () => {
  const params = document.location.search.length > 1 ? qs.parse(document.location.search.slice(1)) : {}
  debugger;
  return {
    room: params.room ?? 'daily_standup',
    domain: params.domain ?? 'virtual-darbar.centralindia.cloudapp.azure.com',
    autoJoin: params.autojoin ?? false,
  }
}

// on connection failed

function onConnectionFailed() {
    console.error('Connection Failed!');
} 
/*
function hangup(){
  if(connection){
    if(track.getType() === 'video') removeVideoTrack(track)
    if(track.getType() === 'audio') removeAudioTrack(track)

  }

  return new Promise(resolve => {
    conference.on(JitsiMeetJS.events.conference.leave, () => resolve(conference) );
    conference.leave();
  })

}*/
  
      





function App() {
                  
  useWindowSize()
  const defaultParams = useMemo(getDefaultParamsValue, [])

  const [mainState, setMainState] = useState('init')
  const [domain, setDomain] = useState(defaultParams.domain)
  const [room, setRoom] = useState(defaultParams.room)
  const [conference, setConference] = useState(null)
  const [videoTracks, addVideoTrack, removeVideoTrack] = useTracks();
  const [audioTracks, addAudioTrack, removeAudioTrack] = useTracks();
  
  const addTrack = useCallback((track) => {
    if(track.getType() === 'video') addVideoTrack(track)
    if(track.getType() === 'audio') addAudioTrack(track)
  }, [ addVideoTrack, addAudioTrack ])
    
  const removeTrack = useCallback((track) => {
    if(track.getType() === 'video') removeVideoTrack(track)
    if(track.getType() === 'audio') removeAudioTrack(track)
  }, [removeAudioTrack, removeVideoTrack])
     
  
  
       
  const connect = useCallback(async (e) => {
    e && e.preventDefault()
    setMainState('loading')
    const test = await loadAndConnect({ domain, room });
    connection = test.connection;
    setMainState('started')
    setConference(test.conference)
    addTrack(test.localTrack)
  }, [addTrack, domain, room]);
  
  const disconnect = useCallback(async(e)=>{

  })

  useEffect(() => {
    if(!conference) return

    conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, addTrack)
    conference.on(JitsiMeetJS.events.conference.TRACK_REMOVED, removeTrack)
    
  }, [addTrack, conference, removeTrack])

  useEffect(() => {
    if(defaultParams.autoJoin || defaultParams.autoJoin === ''){
      connect()
    }
  }, [connect, defaultParams.autoJoin])


  return (
    <div className="App">
      <header className="App-header">
        { mainState === 'init' && <ConnectForm connect={connect} domain={domain} room={room} setRoom={setRoom} setDomain={setDomain} /> }
        { mainState === 'loading' && 'Loading' }
        { mainState === 'started' &&
        <div style={{
          height: '100vh', width: '100vw', maxHeight: '100vw', maxWidth: '100vh',
          background: 'rgba(0, 100,100, 1)',
          position: 'relative',
          borderRadius: '100%'
      }}>
        
        {
          videoTracks.map((track, index) => <Seat track={track} index={index} length={videoTracks.length} key={track.getId()} />)
        }
        {
          audioTracks.map((track, index) => <Audio track={track} index={index} key={track.getId()} />)
        }
        
       </div>}
       
        
      </header>
      </div>
  );
}

export default App;



 /* 

//disconnect();
function disconnect(){
  console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        connection);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);}

  const hangup = new Promise((resolve)=> {
       
      if(connection){
        if(conference){

        }
      }
      function disconnect(){
  console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        connection);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);}
      connection.disconnect();

  });
  */
/*

    const disconnect =  new Promise((resolve)=>{
      if (connection) {
        if (conference){
          conference.leave();
          connection.disconnect();
        }
      }
      })*/ 
      
     
    


  

/*
 function hangup(){
      localTrack.dispose();
      localAudioTrack.dispose();
     


      conference.leave();
      connection.disconnect();}*/
 
/*
const leave = async () => {
  const promiseBatch = localTrack.map((track) => !track.disposed && track.dispose());
  //const promiseBatch = localAudioTrack.map((track)=> !track.dispose && track.dispose());

  await Promise.all(promiseBatch);
  await conference.leave();
  function disconnect() {
    console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        connect);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);}

  await connection.disconnect();}
  */



