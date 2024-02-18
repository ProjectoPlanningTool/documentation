import React, { useState } from "react";
import { Button, Form, Input, message, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();
  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const { username, password } = values;
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/login`,
        { email: username, password }
      );
      message.success("you are logged in successfully");
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...{
            id: "65b7d6e9176e92c945fe1114",
            firstName: "yogi",
            lastName: "singh",
            email: "yogi@gmail.com",
            token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjViN2Q2ZTkxNzZlOTJjOTQ1ZmUxMTE0In0sImlhdCI6MTcwNzI5MDIwNiwiZXhwIjoxNzA5ODgyMjA2fQ.QqMAKWGxgPuIeCIBf5HraphPpBou6Y_djRLi7mbWKI0",
          },
          isLoggedin: true,
        })
      );
      navigation("/");
      setIsLoading(false);
    } catch (error) {
      message.error(error?.response?.data?.message);
      setIsLoading(false);
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin spinning={isLoading}>
        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item>Login PAGE</Form.Item>
          <Form.Item
            label="Email"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default Login;
