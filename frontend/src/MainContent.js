import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { createTheme } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import Senders from './Senders';
import Messages from './Messages';
import Pattern from './Pattern';
import Transactions from './Transactions';
import LoginContext from './LoginContext';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Pages',
  },
  {
    segment: 'senders',
    title: 'Senders',
    icon: <AccountBalanceWalletIcon />, 
  },
  {
    segment: 'messages',
    title: 'Messages',
    icon: <ReceiptLongIcon />,
  },
  {
    segment: 'patterns',
    title: 'Patterns',
    icon: <SettingsIcon />,
  },
  {
    segment: 'transactions',
    title: 'Transactions',
    icon: <MonetizationOnIcon />,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function PageContent({ pathname }) {
  return (
    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {pathname === '/senders' && <Senders />}
      {pathname === '/patterns' && <Pattern />}
      {pathname === '/messages' && <Messages />}
      {pathname === '/transactions' && <Transactions />}
    </Box>
  );
}

PageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function MainContent(props) {
  const { window } = props;
  const { user, login } = React.useContext(LoginContext);
  const router = useDemoRouter('/senders');
  const demoWindow = window !== undefined ? window() : undefined;

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw">
        <button onClick={login}>Login</button>
      </Box>
    );
  }

  return (
    <AppProvider 
      navigation={NAVIGATION} 
      branding={{
        title: 'Expense Tracker',
        homeUrl: '/senders',
      }}
      router={router} 
      theme={demoTheme} 
      window={demoWindow}
    >
      <DashboardLayout>
        <PageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

MainContent.propTypes = {
  window: PropTypes.func,
};

export default MainContent;

