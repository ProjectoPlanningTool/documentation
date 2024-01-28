import axios from "axios";
import { MoreOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Popover } from "antd";
import { useState } from "react";

function Item({ page, addSubPage, setActivePage, activePage,setLoading,apiUpdationRef }) {
  const [open,setOpen] = useState(false)
  const handleClick = (page) => {
    setActivePage(page);
  };
  const deletePageHandler = async (page) => {
    setLoading(true)
    try {
      const data = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/docs/removePage`,
        page
      );
      apiUpdationRef.current = !apiUpdationRef.current
    } catch (err) {
      console.log("err", err);
    }
    setLoading(false)
  };

  const onChange = (event) => {
    handleClick(page);
  };

  const handleOpenChange = (openChange)=>{
    setOpen(openChange)
  }
  const isActive = activePage?.uniqueId === page.uniqueId;
  const content = (
    <>
      {!page.referenceId ? (
        <>
          <div>
            <Button
              onClick={() => {
                setOpen(false)
                addSubPage(page);
              }}
            >
              <PlusOutlined /> Add Sub Page
            </Button>
          </div>
        </>
      ) : null}

      <div>
        <Button
          onClick={() => {
            setOpen(false)
            deletePageHandler(page);
          }}
        >
          <DeleteOutlined /> Delete
        </Button>
      </div>
    </>
  );
  

  const items = [
    {
      key: page.uniqueId,
      label: page.title,
      children: page.subPages.map((val) => {
        const subPageContent = (
          <div>
            <Button
              onClick={() => {
                deletePageHandler(val);
              }}
            >
              <DeleteOutlined /> Delete
            </Button>
          </div>
        );

        return (
          <Button
            onClick={() => {
              handleClick(val);
            }}
            key={val.uniqueId}
          >
            {val.title ? val.title : "Untitled Page"}
            <Popover
              trigger="click"
              placement="rightTop"
              content={subPageContent}
            >
              <MoreOutlined />
            </Popover>
          </Button>
        );
      }),
      extra: (
        <Popover trigger="click" placement="rightTop" content={content}>
          <MoreOutlined
            onClick={(event) => {
              event.stopPropagation();
            }}
          />
        </Popover>
      ),
    },
  ];

  
  return (
    <>
      {page.subPages.length ? (
        <Collapse
          style={{ width: "80%" }}
          onChange={onChange}
          expandIconPosition={"start"}
          items={items}
        />
      ) : (
        <div style={{ marginTop: "1rem", width: "80%" }}>
          <Button
            onClick={() => {
              handleClick(page);
            }}
            style={{
              backgroundColor: isActive ? "grey" : "unset",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{page.title ? page.title : "Untitled Page"}</span>
            <span>
              {" "}
              <Popover
                style={{ backgroundColor: isActive ? "grey" : "unset" }}
                onOpenChange={handleOpenChange}
                open={open}
                trigger="click"
                placement="rightTop"
                content={content}
              >
                <MoreOutlined
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                />
              </Popover>
            </span>
          </Button>
        </div>
      )}
      {/* <ul className="sidebar-list">
        {page?.subPages?.map((item) => (
          <li key={item.uniqueId}>
            <Item
              page={item}
              addSubPage={addSubPage}
              setActivePage={setActivePage}
              activePage={activePage}
            />
          </li>
        ))}
      </ul> */}
    </>
  );
}

export default Item;
