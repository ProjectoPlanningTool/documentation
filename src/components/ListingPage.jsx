import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Modal, Form, Input } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const ListingComponent = () => {
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://api.yogendersingh.tech/v2/apis/docs/read-doc",
          {
            userId: "65b7d6e9176e92c945fe1114",
            subDomain: "docs.yogendersingh.tech",
            limit: 50,
            page: 1,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjViN2Q2ZTkxNzZlOTJjOTQ1ZmUxMTE0In0sImlhdCI6MTcwNzI5MDIwNiwiZXhwIjoxNzA5ODgyMjA2fQ.QqMAKWGxgPuIeCIBf5HraphPpBou6Y_djRLi7mbWKI0",
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

    if (action === "read") {
      navigate("/read");
    } else if (action === "edit") {
      navigate("/create");
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

      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      const response = await axios.post(
        "http://api.yogendersingh.tech/v2/apis/docs/create-doc",
        {
          userId: userId,
          subDomain: values.subDomain,
          title: values.title,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjViN2Q2ZTkxNzZlOTJjOTQ1ZmUxMTE0In0sImlhdCI6MTcwNzI5MDIwNiwiZXhwIjoxNzA5ODgyMjA2fQ.QqMAKWGxgPuIeCIBf5HraphPpBou6Y_djRLi7mbWKI0",
          },
        }
      );

      console.log("Document created successfully:", response.data);
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
          display: "inline-flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Project Docs</h1>
        <Button type="primary" onClick={handleCreateNew}>
          Create New Documentation
        </Button>
      </div>
      <Row gutter={[16, 16]} justify="center">
        {data.map((item) => (
          <Col key={item._id} xs={24} sm={12} md={8} lg={6} xl={4}>
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
        visible={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subDomain"
            label="Subdomain"
            rules={[{ required: true, message: "Please enter the subdomain" }]}
          >
            <Input placeholder="Enter Subdomain" />
          </Form.Item>
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
