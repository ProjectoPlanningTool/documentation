import { Col, Row, Select, Spin } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebounce } from "./customHooks/debounce";
import Editor from "./Editor";
import SideBar from "./SideBar";
import axios from "axios";

const CreatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const apiUpdationRef = useRef(false);
  useEffect(() => {
    const loggedInUser = JSON.parse(
      localStorage.getItem("userData")
    )?.isLoggedin;
    if (!loggedInUser) {
      navigate("/login");
    }
  }, [location.pathname]);

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
      try{(async()=>{
        const data = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/docs/search`,
          {
            userId: localStorage.getItem("userId"),
            documentId: localStorage.getItem("documentId"),
            title:searchValue
          }
        );
        const optionsData = data?.data?.message.map((val)=>{
          return {
            label:val.title,
            value:JSON.stringify(val)
          }
        })
        setOptions(optionsData);
      })()
      }catch(err){
        console.log("🚀 ~ useEffect ~ err:", err)
      }
    } else {
      setOptions([]);
    }
  }, [debouncedSearchTerm]);
  const selectHandler = (value, record) => {
    console.log("🚀 ~ selectHandler ~ value, record:", value, record)
    setActivePage(JSON.parse(value.value));
    setSearchValue("")
  };
  const searchHandler = (event) => {
    console.log("🚀 ~ searchHandler ~ event:", event)
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
      <Row>
        <Col span={18} push={6}>
          <Editor
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
    </Spin>
  );
};

export default CreatePage;
