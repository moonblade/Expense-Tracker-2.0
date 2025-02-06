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
import { useLocation, useNavigate } from 'react-router-dom';
import Senders from './Senders';
import Messages from './Messages';
import Pattern from './Pattern';
import Transactions from './Transactions';
import LoginContext from './LoginContext';
import { AuthenticationContext, SessionContext } from '@toolpad/core/AppProvider';
import SignIn from './SignIn';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Pages',
  },
  {
    segment: 'sendersui',
    title: 'Senders',
    icon: <AccountBalanceWalletIcon />,
  },
  {
    segment: 'messagesui',
    title: 'Messages',
    icon: <ReceiptLongIcon />,
  },
  {
    segment: 'patternsui',
    title: 'Patterns',
    icon: <SettingsIcon />,
  },
  {
    segment: 'transactionsui',
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
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
      }}
    >
      {pathname === '/senders' && <Senders />}
      {pathname === '/patterns' && <Pattern />}
      {pathname === '/messages' && <Messages />}
      {pathname === '/transactionsui' && <Transactions />}
    </Box>
  );
}

PageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function MainContent() {
  const { user, logout } = React.useContext(LoginContext);
  const location = useLocation();
  const navigate = useNavigate();

  // We now use the location and navigate hooks from react-router.
  // If you previously relied on local storage for page persistence, react-router's URL will handle that.
  const [session, setSession] = React.useState(user);

  const authentication = React.useMemo(() => {
    return {
      signOut: () => {
        setSession(null);
        logout();
      },
    };
  }, [logout]);

  useEffect(() => {
    if (!location.pathname || location.pathname === '/') {
      navigate('/transactionsui');
    }
  }, [location, navigate]);

  useEffect(() => {
    setSession({
      user: {
        name: user?.displayName,
        email: user?.email,
        image: user?.photoURL,
      },
    });
  }, [user]);

  if (!user) {
    return <SignIn />;
  }

  // Create a router-like object from react-router's hooks.
  const router = { 
    pathname: location.pathname, 
    navigate: (path) => navigate(path) 
  };

  return (
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <AppProvider
          navigation={NAVIGATION}
          branding={{
            title: 'Expense Tracker',
            homeUrl: '/transactionsui',
          }}
          router={router} // Passing our react-router based router object
          theme={demoTheme}
          session={session}
          authentication={authentication}
        >
          <DashboardLayout>
            <PageContent pathname={location.pathname} />
          </DashboardLayout>
        </AppProvider>
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}

export default MainContent;
