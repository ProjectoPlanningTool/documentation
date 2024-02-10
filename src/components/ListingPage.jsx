import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Modal, Form, Input } from "antd";
import axios from "axios";
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

  const handleButtonClick = (documentId, action) => {
    localStorage.setItem("documentId", documentId);

    if (action === "Read") {
      navigate(`/read?documentId=${documentId}`);
      console.log("first");
    } else if (action === "Edit") {
      navigate(`/create?documentId=${documentId}`);
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
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-between",
        }}
        className="listingHeader"
      >
        <h1 style={{ textAlign: "center" }}>Project Docs</h1>
        <Button type="primary" onClick={handleCreateNew}>
          Create New Documentation
        </Button>
      </div>
      <Row gutter={[16, 16]} justify="center">
        {data.map((item) => (
          <Col key={item._id} xs={24} sm={24} md={12} lg={12} xl={8}>
            <Card
              title={item.title}
              style={{ marginBottom: 16 }}
              actions={[
                <Button onClick={() => handleButtonClick(item._id, "Read")}>
                  Read
                </Button>,
                <Button onClick={() => handleButtonClick(item._id, "Edit")}>
                  Edit
                </Button>,
              ]}
            ></Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Create New Documentation"
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText="Submit"
        cancelText="Cancel"
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
