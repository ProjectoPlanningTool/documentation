import { Route, Routes } from "react-router-dom";
import CreatePage from "./components/CreatePage";
import ListingPage from "./components/ListingPage";
import Login from "./components/Auth/Login";
import { useEffect, useState } from "react";
import NotAccess from "./components/NotAccess";
import axios from "axios";

function App() {
  const [login, setLogin] = useState(false);
  const [userData, setUserData] = useState({});
  const [domainUrl, setDomainUrl] = useState({
    document: [],
    blog: [],
    workflow: [],
  });

  useEffect(() => {
    const tokenInUrl = new URLSearchParams(location.search);
    const token = tokenInUrl.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setLogin(true);
    } else {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        return setLogin(false);
      }
      setLogin(true);
    }
  }, []);

  useEffect(() => {
    // console.log("first",localStorage.getItem("token"))
    console.log("first,",localStorage.getItem("token") && !localStorage.getItem("userData"))
    if (localStorage.getItem("token") && !localStorage.getItem("userData")) {
      (async () => {
        const response = await axios(
          `${import.meta.env.VITE_BASE_URL}/user/getInfo`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          setUserData(response?.data?.message?.user);
          localStorage.setItem(
            "userData",
            JSON.stringify(response?.data?.message?.user)
          );
          localStorage.setItem(
            "subDomain",
          "docs.yogendersingh.tech"
          );
          setDomainUrl({
            document: response?.data?.message?.documentationURls,
            blog: response?.data?.message?.blogUrls,
            workflow: response?.data?.message?.workFlowUrls,
          });
        }
      })();
    }
  }, []);
  return (
    <>
      {!login ? (
        <NotAccess />
      ) : (
        <Routes>
          <Route exact path="/" element={<ListingPage />} />
          <Route exact path="/read" element={<CreatePage readOnly={true} />} />
          <Route exact path="/create" element={<CreatePage readOnly={false}/>} />
        </Routes>
      )}
    </>
  );
}

export default App;
