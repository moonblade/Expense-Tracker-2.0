import { useLocalStorageState } from '@toolpad/core/useLocalStorageState';
import React, { useEffect } from 'react';
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
import { AuthenticationContext, SessionContext } from '@toolpad/core/AppProvider'; // Import Authentication and Session Contexts
import SignIn from './SignIn';

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
    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
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
  const { user, login, logout } = React.useContext(LoginContext); // Use LoginContext
  const [storedPage, setStoredPage] = useLocalStorageState('page', '/transactions');
  const router = useDemoRouter(storedPage);
  const demoWindow = window !== undefined ? window() : undefined;

  // Set up session and authentication context
  const [session, setSession] = React.useState(user);

  const authentication = React.useMemo(() => {
    return {
      signOut: () => {
        setSession(null);
        logout();
      },
    };
  }, [user, logout]);

  useEffect(() => {
    setSession({
      "user": {
        "name": user?.displayName,
        "email": user?.email,
        "image": user?.photoURL,
      }
    });
  }, [user]);

  useEffect(() => {
    // Store the page in local storage when pathname changes
    setStoredPage(router.pathname);
  }, [router.pathname, setStoredPage]);

  if (!user) {
    return <SignIn />;
  }

  return (
    <AuthenticationContext.Provider value={authentication}> {/* Provide AuthenticationContext */}
      <SessionContext.Provider value={session}> {/* Provide SessionContext */}
        <AppProvider 
          navigation={NAVIGATION} 
          branding={{
            title: 'Expense Tracker',
            homeUrl: '/transactions',
          }}
          router={router} 
          theme={demoTheme} 
          window={demoWindow}
          session={session}
          authentication={authentication}
        >
          <DashboardLayout>
            <PageContent pathname={router.pathname} />
          </DashboardLayout>
        </AppProvider>
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}

MainContent.propTypes = {
  window: PropTypes.func,
};

export default MainContent;

