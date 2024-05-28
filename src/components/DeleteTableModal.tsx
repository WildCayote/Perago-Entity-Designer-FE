import { Button } from '@mantine/core'
import React from 'react'

const DeleteTableModal = ({
  tableId,
  handleDelete,
} : {

  tableId: string,
  handleDelete : (tableId : string) => void
}) => {
  return (
    <div>
      <p className='text-center'>Are you sure you want to delete this Table</p>
      <div className='flex justify-center'> 
      <Button className='mt-3' color='green' onClick={() => handleDelete(tableId)}>Delete</Button>
      </div>

    </div>
  )
}

export default DeleteTableModal