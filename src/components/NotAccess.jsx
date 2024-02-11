import React from "react";
import ForBiddenImage from "../assets/403 Error Forbidden.gif";

const loginHandler = () => {
	window.location.href = `https://auth.projecto.cloud/?redirectUrl=${window.location.origin}`;
};
const NotAccess = () => {
	return (
		<>
			<img src={ForBiddenImage} alt="no data" />
			<div>you are not authorized please try to login</div>
			<button onClick={loginHandler}>Login</button>
		</>
	);
};

export default NotAccess;
