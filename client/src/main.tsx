import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { iniciarMedicion } from "./lib/medicion";

iniciarMedicion();

createRoot(document.getElementById("root")!).render(<App />);
