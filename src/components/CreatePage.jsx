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
      const data = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/docs/read`,
        {
          userId: localStorage.getItem("userId"),
          documentId: localStorage.getItem("documentId"),
        }
      );
      setLoading(false);
      if (data && data.data && data.data.message) {
        setPages(data.data.message);
        setActivePage(data.data.message[0]);
      }
    })();
  }, [apiUpdationRef.current]);

  useEffect(() => {
    if (searchValue) {
      try {
        (async () => {
          const data = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/docs/search`,
            {
              userId: localStorage.getItem("userId"),
              documentId: localStorage.getItem("documentId"),
              title: searchValue,
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
      user: localStorage.getItem("userId"),
      documentId: localStorage.getItem("documentId"),
    };
    setLoading(true);
    try {
      const data = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/docs/createPage`,
        newPage
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
        emoji: "😄",
        subPages: [],
      };
      setLoading(true);
      try {
        const subPagesData = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/docs/createPage`,
          newSubPage
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
  console.log(":",readOnly)
if(!readOnly){
    const isSubdomain = subdomainPattern.test(currentHost);
    if (isSubdomain) {
      return (<>this is not a valid subdomain</>)
    }
}
else{
  const isSubdomain = subdomainPattern.test(currentHost);
  if (!isSubdomain) {
    navigate("/create")
  }
}
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
      {!readOnly ? (
        <Button
          onClick={() => {
            setShareModal(true);
          }}
        >
          Share
        </Button>
      ) : null}
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
