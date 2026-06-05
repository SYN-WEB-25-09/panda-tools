import Layout from "./Layout.js"
import Router from "./Router.js"
import { ThemeProvider } from "./context/ThemeContext.js";
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext.js"

function App() {

  return (
    <>
      <FirebaseAuthProvider>
        <ThemeProvider>
          <Layout>
            <Router />
          </Layout>
        </ThemeProvider>
      </FirebaseAuthProvider>
    </>
  )
}

export default App
