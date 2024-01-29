import { Route, Routes } from "react-router-dom";
import CreatePage from "./components/CreatePage";
import Login from "./components/Auth/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CreatePage readOnly={true}/>} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
