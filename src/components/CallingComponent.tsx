/* tslint:disable */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
 
import {
  CameraButton,
  ControlBar,
  EndCallButton,
  GridLayout,
  MicrophoneButton,
  OptionsButton,
  ScreenShareButton,
  VideoTile
} from '@azure/communication-react';
 
import { IContextualMenuProps, mergeStyles, Stack } from '@fluentui/react';
import React, { useState } from 'react';
 
export const CallingComponents = ({track}) => {
  
  const controlBarStyle = {
    root: {
      justifyContent: 'center'
    }
  };
  
  
 
  return (
    <Stack className={mergeStyles({ height: '100%', width: '100%'})}>
      {/* GridLayout Component relies on the parent's height and width, so it's required to set the height and width on its parent. */}
      <div style={{ height: '30rem', width: '30rem', border: '1px solid' }}>
        <GridLayout>
          <VideoTile isVideoReady={true} 
          renderElement= 
          {<video 
          style = {{ height:'100%', width: '100%'}}
          autoPlay={true} key={`track_${track.getId()}`} 
          ref={(ref) => ref && track.attach(ref)} />} 
          
          
          />
        </GridLayout>
      </div>
 
    </Stack>
  );
};
