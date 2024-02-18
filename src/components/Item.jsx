import { DeleteOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Popover } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Item({
	page,
	addSubPage,
	setActivePage,
	activePage,
	setLoading,
	apiUpdationRef,
	readOnly,
}) {
	const [open, setOpen] = useState(false);
	const handleClick = (page) => {
		setActivePage(page);
	};
	const deletePageHandler = async (page) => {
		setLoading(true);
		try {
			const data = await axios.post(
				`${import.meta.env.VITE_BASE_URL}/docs/removePage`,
				page,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			apiUpdationRef.current = !apiUpdationRef.current;
		} catch (err) {
			console.log("err", err);
		}
		setLoading(false);
	};

	const onChange = (event) => {
		handleClick(page);
	};

	const handleOpenChange = (openChange) => {
		setOpen(openChange);
	};
	const isActive = activePage?.uniqueId === page.uniqueId;
	const content = (
		<>
			{!page.referenceId ? (
				<>
					<div>
						<Button
							onClick={() => {
								setOpen(false);
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
						setOpen(false);
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
						{!readOnly ? (
							<Popover
								trigger="click"
								placement="rightTop"
								content={subPageContent}
							>
								<MoreOutlined />
							</Popover>
						) : null}
					</Button>
				);
			}),
			extra: (
				<>
					{!readOnly ? (
						<Popover trigger="click" placement="rightTop" content={content}>
							<MoreOutlined
								onClick={(event) => {
									event.stopPropagation();
								}}
							/>
						</Popover>
					) : null}
				</>
			),
		},
	];

	return (
		<>
			{page.subPages.length ? (
				<Collapse
					style={{ width: "80%", margin: "15px 0" }}
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
							backgroundColor: isActive ? "#16213E" : "unset",
							width: "100%",
							color: isActive ? "white" : "black",
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<span>{page.title ? page.title : "Untitled Page"}</span>
						{!readOnly ? (
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
						) : null}
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
