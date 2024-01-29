import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { TextArea, Text } = Input;

function Editor({
  pageTitle,
  pageDescription,
  pageContent,
  pages,
  activePage,
  setLoading,
  apiUpdationRef,
  readOnly
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [modules, setModules] = useState({
    toolbar: [
      ["bold", "italic", "underline", "strike"], // default modules
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }], // custom modules
    ],
  });

  // useEffect(()=>{
  //   const quillBox = document.querySelector(".ql-container");
  //   // if(quillBox){
  //   //   quillBox.style.border = "none"
  //   // }
  // },[])

  const pageHandler = async (page) => {
    if (isEditing) {
      setLoading(true);
      try {
        const data = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/docs/editPage`,
          page
        );
        apiUpdationRef.current = !apiUpdationRef.current;
      } catch (err) {
        console.log("error", err);
      }
      setLoading(false);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  // const modules=

  const renderPage = (page) => {
    const isPageActive = activePage && page.uniqueId === activePage.uniqueId;
    return (
      <React.Fragment key={page.uniqueId}>
        {isPageActive && (
          <>
           {readOnly ? <Button
              onClick={() => {
                pageHandler(page);
              }}
            >
              {!isEditing ? "edit" : "save"}
            </Button> : null}
            <Input
              variant="borderless"
              size="large"
              disabled={!isEditing}
              value={page.title}
              placeholder="Write you Title here"
              onChange={(e) => pageTitle(page.uniqueId, e.target.value)}
            />
            <Input
              variant="borderless"
              size="medium"
              disabled={!isEditing}
              value={page.description}
              placeholder="Write description (Optional)"
              onChange={(e) => pageDescription(page.uniqueId, e.target.value)}
            />
           
           <Input
              variant="borderless"
              size="medium"
              disabled={!isEditing}
              value={page.content}
              placeholder="Write the content here"
              onChange={(e) => pageContent(page.uniqueId, e.target.value)}
            />
          </>
        )}
        {page?.subPages?.map((subPage) => (
          <Editor
            key={subPage.uniqueId}
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            pageContent={pageContent}
            pages={[subPage]}
            activePage={activePage}
            apiUpdationRef={apiUpdationRef}
            setLoading={setLoading}
          />
        ))}
      </React.Fragment>
    );
  };
  return (
    <>
      {pages.length ? (
        pages?.map((page) => (
          <React.Fragment key={page.uniqueId}>
            {renderPage(page)}
          </React.Fragment>
        ))
      ) : (
        <div>No data</div>
      )}
    </>
  );
}

export default Editor;
