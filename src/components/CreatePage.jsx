import {
  Button,
  Col,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Steps,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebounce } from "./customHooks/debounce";
import Editor from "./Editor";
import SideBar from "./SideBar";
import axios from "axios";
import ShortUniqueId from "short-unique-id";

const CreatePage = ({ readOnly }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [subDomain, setSubDomain] = useState("");
  const [cName, setCName] = useState("");
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const apiUpdationRef = useRef(false);
  const uniqueId = new ShortUniqueId({ length: 10 }).rnd();
  localStorage.setItem(
    "userData",
    JSON.stringify({
      ...{
        _id: "65b7d6e9176e92c945fe1114",
        firstName: "yogi",
        lastName: "singh",
        email: "yogi@gmail.com",
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjViN2Q2ZTkxNzZlOTJjOTQ1ZmUxMTE0In0sImlhdCI6MTcwNzI5MDIwNiwiZXhwIjoxNzA5ODgyMjA2fQ.QqMAKWGxgPuIeCIBf5HraphPpBou6Y_djRLi7mbWKI0",
      },
      isLoggedin: true,
    })
  );
  // useEffect(() => {
  //   const loggedInUser = JSON.parse(
  //     localStorage.getItem("userData")
  //   )?.isLoggedin;
  //   if (!loggedInUser) {
  //     navigate("/login");
  //   }
  // }, [location.pathname]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/docs/read`,
          {
            userId: JSON.parse(localStorage.getItem("userData"))?._id,
            documentId: localStorage.getItem("documentId"),
            subDomain: localStorage.getItem("subDomain"),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (data.status === 200) {
          if (data && data.data && data.data.message) {
            setPages(data.data.message);
            setActivePage(data.data.message[0]);
          }
        }
      } catch (err) {
        message.error(err.response.data.message);
      }
      setLoading(false);
    })();
  }, [apiUpdationRef.current]);

  useEffect(() => {
    if (searchValue) {
      try {
        (async () => {
          const data = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/docs/search`,
            {
              userId: JSON.parse(localStorage.getItem("userData"))?._id,
              documentId: localStorage.getItem("documentId"),
              subDomain: localStorage.getItem("subDomain"),
              title: searchValue,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const optionsData = data?.data?.message.map((val) => {
            return {
              label: val.title,
              value: JSON.stringify(val),
            };
          });
          setOptions(optionsData);
        })();
      } catch (err) {
        console.log("🚀 ~ useEffect ~ err:", err);
      }
    } else {
      setOptions([]);
    }
  }, [debouncedSearchTerm]);
  const selectHandler = (value, record) => {
    setActivePage(JSON.parse(value.value));
    setSearchValue("");
  };
  const searchHandler = (event) => {
    if (event) {
      setSearchValue(event);
    } else {
      setSearchValue("");
    }
  };

  const addPage = async () => {
    const newPage = {
      uniqueId: Date.now(),
      title: `Untitled Page`,
      description: "",
      content: "",
      referenceId: null,
      emoji: "😀",
      subPages: [],
      user: JSON.parse(localStorage.getItem("userData"))?._id,
      documentId: localStorage.getItem("documentId"),
      subDomain: localStorage.getItem("subDomain"),
    };
    setLoading(true);
    try {
      const data = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/docs/create`,
        newPage,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPages((prevPages) => [...prevPages, newPage]);
      setActivePage(newPage);
      apiUpdationRef.current = !apiUpdationRef.current;
    } catch (err) {
      console.log("erropr", err);
    }
    setLoading(false);
  };

  const addSubPage = async (parentPage) => {
    if (parentPage?.subPages) {
      const newSubPage = {
        uniqueId: Date.now(),
        title: `Untitled Sub Page`,
        description: "",
        content: "",
        referenceId: parentPage.uniqueId,
        subDomain: localStorage.getItem("subDomain"),
        emoji: "😄",
        subPages: [],
      };
      setLoading(true);
      try {
        const subPagesData = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/docs/create`,
          newSubPage,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedPages = [...pages];
        parentPage?.subPages?.push(newSubPage);
        setPages(updatedPages);
        setActivePage(newSubPage);
        apiUpdationRef.current = !apiUpdationRef.current;
      } catch (err) {
        console.log("error", err);
      }
      setLoading(false);
    }
  };

  const updateProperty = (pages, pageId, property, value) => {
    return pages.map((page) => {
      if (page.uniqueId === pageId) {
        return { ...page, [property]: value };
      }
      if (page.subPages && page.subPages.length > 0) {
        return {
          ...page,
          subPages: updateProperty(page.subPages, pageId, property, value),
        };
      }
      return page;
    });
  };

  const pageTitle = (pageId, title) => {
    setPages((prevPages) => updateProperty(prevPages, pageId, "title", title));
  };

  const pageDescription = (pageId, description) => {
    setPages((prevPages) =>
      updateProperty(prevPages, pageId, "description", description)
    );
  };

  const pageContent = (pageId, content) => {
    setPages((prevPages) =>
      updateProperty(prevPages, pageId, "content", content)
    );
  };

  const handleTitleChange = (pageId, newTitle) => {
    pageTitle(pageId, newTitle);
  };

  const handleDescriptionChange = (pageId, newDescription) => {
    pageDescription(pageId, newDescription);
  };

  const handleContentChange = (pageId, newContent) => {
    pageContent(pageId, newContent);
  };

  const handleOK = async () => {
    if (currentStep === 0) {
      const isSubDomain = subDomain.split(".").length;
      if (isSubDomain === 3) {
        setCName(`${subDomain.split(".")[0]}-${uniqueId}.yogendersingh.tech`);
        setCurrentStep(currentStep + 1);
      } else {
        message.error("Not a valid subdomain");
      }
    }
    if (currentStep === 1) {
      setLoading(true);
      try {
        const data = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/docs/save-cname`,
          {
            cnameTarget: cName,
            url: subDomain,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (data.status === 200) {
          message.success(data.data.message);
          setCurrentStep(currentStep + 1);
        }
      } catch (err) {
        message.error(err.response.data.message);
      }
      setLoading(false);
    }
    if (currentStep === 2) {
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    setShareModal(false);
  };
  const currentHost = window.location.host;
  const subdomainPattern = /^[^.]+\.[^.]+$/;
  console.log(":", readOnly);
  // if (!readOnly) {
  //   const isSubdomain = subdomainPattern.test(currentHost);
  //   if (isSubdomain) {
  //     return <>this is not a valid subdomain</>;
  //   }
  // } else {
  //   const isSubdomain = subdomainPattern.test(currentHost);
  //   if (!isSubdomain) {
  //     navigate("/create");
  //   }
  // }
  return (
    <Spin spinning={loading}>
      <Select
        placeholder="Search document title"
        allowClear
        showSearch
        filterOption={false}
        labelInValue
        style={{ width: "200px" }}
        notFoundContent={false ? <Spin size="small" /> : null}
        options={options}
        onSearch={searchHandler}
        onSelect={selectHandler}
      />
      {/* {!readOnly ? (
        <Button
          onClick={() => {
            setShareModal(true);
          }}
        >
          Share
        </Button>
      ) : null} */}
      <Row>
        <Col span={18} push={6}>
          <Editor
            readOnly={readOnly}
            apiUpdationRef={apiUpdationRef}
            setLoading={setLoading}
            pageTitle={handleTitleChange}
            pageDescription={handleDescriptionChange}
            pageContent={handleContentChange}
            pages={pages}
            activePage={activePage}
          />
        </Col>
        <Col span={6} pull={18}>
          <SideBar
            readOnly={readOnly}
            apiUpdationRef={apiUpdationRef}
            setLoading={setLoading}
            addPage={addPage}
            pages={pages}
            addSubPage={addSubPage}
            setActivePage={setActivePage}
            activePage={activePage}
          />
        </Col>
      </Row>
      <Modal open={shareModal} onOk={handleOK} onCancel={handleCancel}>
        <Steps
          current={currentStep}
          items={[
            {
              title: "Sub-Domain Name",
              description: "Share Subdomain name",
            },
            {
              title: "CName Enter",
            },
            {
              title: "Waiting",
            },
          ]}
        />
        {currentStep === 0 ? (
          <>
            <Input
              placeholder="Enter your subdomain"
              value={subDomain}
              onChange={(event) => {
                setSubDomain(event.target.value);
              }}
            />
          </>
        ) : currentStep === 1 ? (
          <>
            <Input disabled={true} value={subDomain.split(".")[0]} />
            <Input disabled={true} value={cName} />
          </>
        ) : (
          "waiting for the response"
        )}
      </Modal>
    </Spin>
  );
};

export default CreatePage;
