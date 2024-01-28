import React, { useState } from "react";
import axios from "axios";
import { Button, Input } from "antd";

const { TextArea } = Input;

function Editor({
  pageTitle,
  pageDescription,
  pageContent,
  pages,
  activePage,
  setLoading,
  apiUpdationRef,
}) {
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(false)
    } else {
      setIsEditing(true);
    }
  };

  const renderPage = (page) => {
    const isPageActive = activePage && page.uniqueId === activePage.uniqueId;
    return (
      <React.Fragment key={page.uniqueId}>
        {isPageActive && (
          <>
            <Button
              onClick={() => {
                pageHandler(page);
              }}
            >
              {!isEditing ? "edit" : "save"}
            </Button>
            {/* <VStack marginX={{ base: 0, lg: "65px" }}> */}
            <TextArea
              disabled={!isEditing}
              value={page.title}
              placeholder="Untitled Page"
              // fontSize="4xl"
              // _focusVisible={{ outline: "none" }}
              // variant="unstyled"
              // fontWeight="bold"
              // resize="none"
              onChange={(e) => pageTitle(page.uniqueId, e.target.value)}
              // rows={3}
            />
            <TextArea
              disabled={!isEditing}
              value={page.description}
              placeholder="Page Description (Optional)"
              // _focusVisible={{ outline: "none" }}
              // color="gray.300"
              // variant="unstyled"
              // resize="none"
              onChange={(e) => pageDescription(page.uniqueId, e.target.value)}
            />
            <TextArea
              disabled={!isEditing}
              placeholder="Enter your content here..."
              // _placeholder={{ color: "gray.300" }}
              // _focusVisible={{ outline: "none" }}
              // variant="unstyled"
              onChange={(e) => pageContent(page.uniqueId, e.target.value)}
              value={page.content}
              // resize="none"
            />
            {/* </VStack> */}
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
