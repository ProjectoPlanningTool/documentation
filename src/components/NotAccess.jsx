import React from "react";
import {Button, Result} from "antd"

const loginHandler = () => {
	window.location.href = `https://auth.projecto.cloud/?redirectUrl=${window.location.origin}`;
};
const NotAccess = () => {
	return (
		 <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={<Button type="primary" onClick={loginHandler}>Login</Button>}
  />
	);
};

export default NotAccess;