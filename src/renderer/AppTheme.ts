import { makeStyles } from '@mui/styles';
import { createTheme } from "@mui/material/styles";

export const AppTheme = createTheme({
  palette: {
    mode: 'dark',
  }
});

export const AppStyles = makeStyles({
  '@global': {
    '.Page': {
      height: '100%',
      backgroundColor: '#121212'
    },
    '.FormContainer': {
      backgroundColor: '#121212'
    },
    '.ChatLeft': {
      backgroundColor: '#121212'
    },
    '.ChatRight': {
      backgroundColor: '#121212'
    },
  }
});
