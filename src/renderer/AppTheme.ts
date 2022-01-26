import { makeStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';
import { Manager } from 'renderer/helpers';
import { Theme } from 'types/enums';

const LightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#D9D9D9',
      paper: '#ffffff',
    },
  },
});

const DarkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#212121',
      paper: '#292B2E',
    },
  },
});

export function AppTheme() {
  const theme = Manager.ReadSetting<number>('Theme');
  if (theme != null) return Manager.ReadSetting<number>('Theme') == Theme.Dark ? DarkTheme : LightTheme;
  return DarkTheme;
}

export function AppStyles() {
  return makeStyles({
    '@global': {
      '#root, html, body': {
        height: '100%',
        overflow: 'hidden',
        margin: '0',
        backgroundColor: AppTheme().palette.background.default,
      },
      '::-webkit-scrollbar': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        width: '0.65rem',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgb(150, 150, 150)',
        borderRadius: '30px',
      },
      '.Hidden': {
        display: 'none !important',
      },
      '.Page': {
        width: '100%',
        height: '100%',
        backgroundColor: AppTheme().palette.background.default,
      },
      '.FormContainer': {
        color: AppTheme().palette.text.primary,
        backgroundColor: AppTheme().palette.background.paper,
      },
      '.ChannelView': {
        background: AppTheme().palette.background.default,
      },
      '.SelectedChannel': {
        background: `${AppTheme().palette.mode == 'dark' ? AppTheme().palette.grey.A700 : AppTheme().palette.grey.A100} !important`,
      },
      '.ChannelInner': {
        color: AppTheme().palette.text.primary,
      },
      '.Chat_Page_Bottom': {
        background: AppTheme().palette.background.paper,
      },
      '.FileUploadSummary': {
        background: AppTheme().palette.background.paper,
      },
      '.MessageCanvas': {
        background: AppTheme().palette.background.paper,
      },
      '.Message': {
        color: AppTheme().palette.text.primary,
      },
      '.Message_Right': {
        background: AppTheme().palette.background.default,
      },
      '.Message_Hover': {
        backgroundColor: AppTheme().palette.action.hover,
      },
      '.Header': {
        color: AppTheme().palette.text.primary,
      },
      'Chat_Page_Bottom': {
        backgroundColor: AppTheme().palette.background.default,
      },
      '.Settings_Section': {
        borderBottom: 10,
        borderColor: AppTheme().palette.text.primary,
        color: AppTheme().palette.text.primary,
      },
      '.AdaptiveText': {
        color: AppTheme().palette.text.primary,
      },
      '.StatusPrompt': {
        textAlign: 'center',
      },
      '.NoInternetWarningContainer': {
        position: 'absolute',
        background: 'rgba(200, 0, 0, 0.8)',
        borderRadius: '5px',
        padding: '5px',
        marginTop: '5px',
        left: '50%',
        transform: 'translate(-50%, 0)',
        color: 'white',
        textAlign: 'center',
        zIndex: '1000'
      }
    },
  });
}
