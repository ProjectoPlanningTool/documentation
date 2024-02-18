import { Route, Routes } from "react-router-dom";
import CreatePage from "./components/CreatePage";
import ListingPage from "./components/ListingPage";
import Login from "./components/Auth/Login";
import { useEffect, useState } from "react";
import NotAccess from "./components/NotAccess";
import axios from "axios";
import NotFound from "./components/NotFound";

function App() {
  const [login, setLogin] = useState(false);
  // const [userData, setUserData] = useState({});
  // const [domainUrl, setDomainUrl] = useState({
  //   document: [],
  //   blog: [],
  //   workflow: [],
  // });

  return (
    <>
        <Routes>
          <Route exact path="/" element={<ListingPage />} />
          <Route exact path="/read" element={<CreatePage readOnly={true} />} />
          <Route exact path="/create" element={<CreatePage readOnly={false}/>} />
          <Route exact path="/not-access" element={<NotAccess/>} />
          <Route exact path="/*" element={<NotFound/>} />
        </Routes>
    </>
  );
}

export default App;
