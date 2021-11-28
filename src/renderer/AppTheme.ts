import { makeStyles } from '@mui/styles';
import { createTheme } from "@mui/material/styles";
import GLOBALS from 'shared/globals';
import { Theme } from 'types/enums'

const LightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#D9D9D9',
      paper: '#ffffff'
    }
  }
});

const DarkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#292B2E'
    }
  },
});

export const AppTheme = GLOBALS.theme == Theme.Dark ? DarkTheme : LightTheme;

export const AppStyles = makeStyles({
  '@global': {
    '#root, html, body': {
      height: '100%',
      overflow: 'hidden',
      margin: '0',
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
      display: 'none',
    },
    '.Page': {
      width: '100%',
      height: '100%',
      backgroundColor: AppTheme.palette.background.default
    },
    '.FormContainer': {
      color: AppTheme.palette.text.primary,
      backgroundColor: AppTheme.palette.background.paper
    },
    '.ChannelView': {
      background: AppTheme.palette.background.default,
    },
    '.Channel': {
      background: AppTheme.palette.background.paper,
    },
    '.MessageCanvas': {
      background: AppTheme.palette.background.paper,
    },
    '.Message': {
      color: AppTheme.palette.text.primary,
    },
    '.Message_Hover': {
      backgroundColor: AppTheme.palette.action.hover,
    },
    '.Header': {
      color: AppTheme.palette.text.primary,
    },
    'Chat_Page_Bottom': {
      backgroundColor: AppTheme.palette.background.default,
    }
  }
});
