import { Button, Card, Col, Form, Input, Modal, Row, Upload } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  DiffOutlined,
  UploadOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ListingPage.scss";
import defaultImage from "../assets/default.jpg";

const { Meta } = Card;


const ListingComponent = () => {
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [shortDescription, setShortDescription] = useState("");
  const navigate = useNavigate();
  const { Search } = Input;
  const fetchData = async () => {
    try {
      if (localStorage.getItem("token") && !localStorage.getItem("userData")) {
          const response = await axios(
            `${import.meta.env.VITE_BASE_URL}/user/getInfo`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (response.status === 200) {
            // setUserData(response?.data?.message?.user);
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
      }
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData?._id;
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error("User ID or token not found in local storage");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/docs/read-doc`,
        {
          userId: userId,
          subDomain: localStorage.getItem("subDomain"),
          limit: 50,
          page: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data &&
        response.data.message &&
        response.data.message.docs
      ) {
        setData(response.data.message.docs);
      } else {
        console.error("Unexpected API response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if(!storedToken){
      navigate("/not-access")
    }

    fetchData();
  }, []);

  

  const handleButtonClick = (document, action) => {
    localStorage.setItem("documentId", document._id);
    if (action === "Read") {
      navigate(`/read?documentId=${document._id}&name=${document.title}`);
      console.log("first");
    } else if (action === "Edit") {
      navigate(`/create?documentId=${document._id}&name=${document.title}`);
    }
  };

  const handleCreateNew = () => {
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData?._id;
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error("User ID or token not found in local storage");
        return;
      }

      const requestData = {
        userId: userId,
        subDomain: localStorage.getItem("subDomain"),
        title: values.title,
        shortDescription: shortDescription,
      };

      if (imageFile) {
        requestData.image = imageFile;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/docs/create-doc`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("documentId", response.data.message._id);
      navigate(`/create?documentId=${response.data.message._id}`);
      setModalVisible(false);
      form.resetFields();
      setImageFile(null);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };
  const onSearch = (value, _e, info) => console.log(info?.source, value);

  return (
    <div className="ListingContainer">
      <div className="listingHeader">
        <h1 style={{ textAlign: "center" }}>
          Project.<span>Docs</span>
        </h1>
        <Search
          placeholder="input search text"
          onSearch={onSearch}
          enterButton
        />
        <Button type="primary" onClick={handleCreateNew}>
          <DiffOutlined /> Documentation
        </Button>
      </div>
      <Row gutter={[16, 16]} justify="center" className="listingGrid">
        {data.map((item) => (
          <Col key={item._id} xs={24} sm={24} md={12} lg={12} xl={6}>
            <Card className="docCard" style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                {item.image ? (
                  <img
                    alt={item.title}
                    src={item.image}
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <img
                    alt="Default Image"
                    src={defaultImage}
                    style={{ width: "100%", height: "auto" }}
                  />
                )}
                <div
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    zIndex: 1,
                  }}
                >
                  <Button onClick={() => handleButtonClick(item, "Read")}>
                    <EyeOutlined />
                  </Button>
                  <Button onClick={() => handleButtonClick(item, "Edit")}>
                    <EditOutlined />
                  </Button>
                </div>
              </div>
              <Meta
                title={item.title}
                description="LoremIpsum short description with some added text for testing project documentation"
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="New Documentation"
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Name"
            rules={[
              { required: true, message: "Please enter the document name" },
            ]}
          >
            <Input placeholder="Enter Document Name" />
          </Form.Item>
          <Form.Item
            name="shortDescription"
            label="Description"
            rules={[
              {
                required: true,
                message: "Please enter the document description",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Enter a short description"
              rows={3}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="image"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload
              beforeUpload={(file) => {
                setImageFile(file);
                return false;
              }}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload Cover image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListingComponent;
