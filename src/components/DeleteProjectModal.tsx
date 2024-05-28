import { Button } from "@mantine/core";
import React from "react";

const DeleteProjectModal = ({
  projectId,
  projectName,
  handleDelete,
}: {
  projectId: string;
  projectName: string;
  handleDelete: (projectId: string) => void;
}) => {
  return (
    <>
      <p className="text-center">Are you sure you want to delete this project</p>
      <div className="flex justify-center">
      <Button className="mt-2" color="green" onClick={() => handleDelete(projectId)}>
        Delete
      </Button>
      </div>
   
    </>
  );
};

export default DeleteProjectModal;
