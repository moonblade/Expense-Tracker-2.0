import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import LoginContext from './LoginContext';

// preview-start
const providers = [
  { id: 'google', name: 'Google' },
];

// preview-end

export default function SignIn() {
  const { login } = React.useContext(LoginContext); // Use LoginContext
  const theme = useTheme();
  return (
    // preview-start
    <AppProvider theme={theme}>
      <SignInPage signIn={login} providers={providers} />
    </AppProvider>
    // preview-end
  );
}
