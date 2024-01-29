import { Button } from 'antd'
import React from 'react'
import Item from '../Item'

const SideBar = ({
    addPage,
	pages,
	addSubPage,
	setActivePage,
	activePage,
    setLoading,
    apiUpdationRef,
    readOnly
}) => {
  return (
   <>
    {pages?.map((page) => (
        <React.Fragment key={page.uniqueId}>
            <Item
            readOnly={readOnly}
            apiUpdationRef={apiUpdationRef}
                page={page}
                addSubPage={addSubPage}
                setActivePage={setActivePage}
                activePage={activePage}
                setLoading={setLoading}
            />
        </React.Fragment>
    ))}
    <Button w={"100%"} onClick={addPage}>
        Add New Page
    </Button></>
  )
}

export default SideBar