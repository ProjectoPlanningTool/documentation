import { Route, Routes } from "react-router-dom";
import CreatePage from "./components/CreatePage";
import Login from "./components/Auth/Login";
import { useEffect, useState } from "react";
import NotAccess from "./components/NotAccess"
import axios from "axios";

function App() {
  const [login, setLogin] = useState(false);
  const [userData,setUserData] = useState({})
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
      const storedToken = localStorage.getItem("token"); // Replace with your actual token key
      if (!storedToken) {
        return setLogin(false);
      }
      setLogin(true);
    }
  }, []);

  useEffect(() => {
    // console.log("first",localStorage.getItem("token"))
    if (localStorage.getItem("token") && !localStorage.getItem("userData")) {
      (async () => {
        const response = await axios(`${import.meta.env.VITE_BASE_URL}/user/getInfo`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if(response.status === 200){
          setUserData(response?.data?.message?.user)
          localStorage.setItem("userData",JSON.stringify(response?.data?.message?.user));
          setDomainUrl({
            document:response?.data?.message?.documentationURls,
            blog:response?.data?.message?.blogUrls,
            workflow:response?.data?.message?.workFlowUrls,
          })
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
        <Route exact path="/" element={<CreatePage readOnly={true}/>} />
        <Route exact path="/create" element={<CreatePage />} />
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
      )}
    </>
  );
}

export default App;
