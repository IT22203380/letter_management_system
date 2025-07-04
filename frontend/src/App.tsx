import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import Routes from "./routes";
import { AppContextProvider } from './contexts/AppContext';
import { LetterProvider } from './contexts/LetterContext';
import './i18n';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AuthProvider>
  <AppContextProvider>
    <LetterProvider>
      <Routes/>
    </LetterProvider>
  </AppContextProvider>
</AuthProvider>
    </div>
  );
}

export default App;
