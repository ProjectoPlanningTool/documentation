import { Button, Card, Col, Form, Input, Modal, Row } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { DiffOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ListingPage.scss";

const { Meta } = Card;

const ListingComponent = () => {
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const userId = userData?._id;
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          console.error("User ID or token not found in local storage");
          return;
        }

        const response = await axios.post(
          "http://api.yogendersingh.tech/v2/apis/docs/read-doc",
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

      const response = await axios.post(
        "http://api.yogendersingh.tech/v2/apis/docs/create-doc",
        {
          userId: userId,
          subDomain: localStorage.getItem("subDomain"),
          title: values.title,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.setItem("documentId", response.data.message._id);
      navigate(`/create?documentId=${response.data.message._id}`);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <div className="ListingContainer">
      <div className="listingHeader">
        <h1 style={{ textAlign: "center" }}>
          Project.<span>Docs</span>
        </h1>
        <Button type="primary" onClick={handleCreateNew}>
          <DiffOutlined /> Documentation
        </Button>
      </div>
      <Row gutter={[16, 16]} justify="center" className="listingGrid">
        {data.map((item) => (
          <Col key={item._id} xs={24} sm={24} md={12} lg={12} xl={6}>
            <Card
              className="docCard"
              title={item.title}
              style={{ marginBottom: 16 }}
              actions={[
                <Button onClick={() => handleButtonClick(item, "Read")}>
                  Read
                </Button>,
                <Button onClick={() => handleButtonClick(item, "Edit")}>
                  Edit
                </Button>,
              ]}
            ></Card>
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
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Document Name"
            rules={[
              { required: true, message: "Please enter the document name" },
            ]}
          >
            <Input placeholder="Enter Document Name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListingComponent;
