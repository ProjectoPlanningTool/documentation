import Icon, { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "./Editor.css";
import modules from "./toolbar";

const { TextArea, Text } = Input;

function Editor({
	pageTitle,
	pageDescription,
	pageContent,
	pages,
	activePage,
	setLoading,
	apiUpdationRef,
	readOnly,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState("");
	// const [modules, setModules] = useState({
	// 	toolbar: [
	// 		["bold", "italic", "underline", "strike"], // default modules
	// 		["blockquote", "code-block"],
	// 		[{ header: 1 }, { header: 2 }], // custom modules
	// 	],
	// });

	// useEffect(()=>{
	//   const quillBox = document.querySelector(".ql-container");
	//   // if(quillBox){
	//   //   quillBox.style.border = "none"
	//   // }
	// },[])

	const titleRef = useRef();

	const pageHandler = async (page) => {
		if (isEditing) {
			setLoading(true);
			try {
				const data = await axios.post(
					`${import.meta.env.VITE_BASE_URL}/docs/editPage`,
					page,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					},
				);
				apiUpdationRef.current = !apiUpdationRef.current;
			} catch (err) {
				console.log("error", err);
			}
			setLoading(false);
			setIsEditing(false);
		} else {
			setIsEditing(true);
			titleRef.current.focus();
		}
	};

	const renderPage = (page) => {
		const isPageActive = activePage && page.uniqueId === activePage.uniqueId;
		return (
			<React.Fragment key={page.uniqueId}>
				{isPageActive && (
					<>
						{!readOnly ? (
							<Button
								onClick={() => {
									pageHandler(page);
								}}
								style={{
									position: "absolute",
									right: 0,
									zIndex: 1,
									margin: "17px 10px",
								}}
							>
								{!isEditing ? <EditOutlined /> : <SaveOutlined />}
							</Button>
						) : null}

						<Input
							variant="borderless"
							size="large"
							readOnly={!isEditing}
							ref={titleRef}
							value={page.title}
							placeholder="Write you Title here"
							style={{
								fontSize: "35px",
								fontWeight: "bold",
								padding: "10px",
							}}
							onChange={(e) => pageTitle(page.uniqueId, e.target.value)}
						/>
						<Input
							variant="borderless"
							size="medium"
							disabled={!isEditing}
							value={page.description}
							placeholder="Write description (Optional)"
							style={{ padding: "0 13px" }}
							onChange={(e) => pageDescription(page.uniqueId, e.target.value)}
						/>
						<ReactQuill
							theme="snow"
							value={page.content}
							onChange={(e) => pageContent(page.uniqueId, e.target.value)}
							placeholder="Write the content here"
							modules={modules}
							readOnly={!isEditing}
							style={{
								textAlign: "center",
							}}
						/>
						{/* <Input
							variant="borderless"
							size="medium"
							disabled={!isEditing}
							value={page.content}
							placeholder="Write the content here"
							onChange={(e) => pageContent(page.uniqueId, e.target.value)}
						/> */}
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
