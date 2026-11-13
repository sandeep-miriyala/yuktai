import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { mountAssistant } from "@yuktishaalaa/assistant"

function App() {
  useEffect(() => {
    const assistant = mountAssistant({ features: ["ask", "a11y"], level: "AA" })
    return () => assistant.destroy()
  }, [])
  return (
    <main>
      <h1>వేమన శతకం</h1>
      <p>ఉప్పు కప్పురంబు నొక్కపోలికనుండు, చూడ చూడ రుచుల జాడ వేరు.</p>
      <p>Meaning: salt and camphor look alike, but taste tells them apart.</p>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)
