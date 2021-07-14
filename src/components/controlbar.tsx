import {
  CameraButton,
  ControlBar,
  EndCallButton,
  FluentThemeProvider,
  MicrophoneButton
} from '@azure/communication-react';
import React from 'react';
import { CallEndIcon } from '@fluentui/react-northstar';


export const CustomControlBarStylesExample: () => JSX.Element = () => {
  const controlBarStyle = {
    root: {
      justifyContent: 'center'
    }
  };
  const CustomEndCallButton: () => JSX.Element = () => {
    const customStyles = {
      root: {
        height: 'inherit',
        background: 'darkorange',
        color: 'white',
        width: '10rem',

      },
      rootHovered: {
        background: 'darkred',
        color: 'white'
      },
      flexContainer: { flexFlow: 'row' }
    };




    return (
      <EndCallButton
        styles={customStyles}
        showLabel={true}
        onRenderIcon={() => <CallEndIcon key={'hangupBtnIconKey'} />}
        onRenderText={() => (
          <span key={'hangupBtnTextKey'} style={{ marginLeft: '0.5rem' }}>
            End Call
          </span>
        )}
        onClick={() => {
          /* handle hangup */
        }}
      />
    );
  };



  return (
    <FluentThemeProvider>
      <ControlBar layout={'floatingBottom'} styles={controlBarStyle}>
        <CameraButton />
        <MicrophoneButton />
        <CustomEndCallButton />
      </ControlBar>
    </FluentThemeProvider>
  );
};