import React, { useEffect, useState } from "react";

import { Button, Menu, Modal, NavLink } from "@mantine/core";
import {
  IconFolder,
  IconMenu2,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import useProjects from "@/hooks/projectHooks";
import useProjectStore from "@/zustandStore/projectStore";
import DeleteProjectModal from "./DeleteProjectModal";
import EditProjectModal from "./EditProjectModal";
import { deleteProjectAPI, updateProjectAPI } from "@/services/projectService";

const SideBar = () => {
  const {
    isLoading,
    projects,
    setLoading,
    setProjects,
    removeProject,
    updateProject,
  } = useProjectStore((state) => state);
  const { data, error } = useProjects();

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const handleOpenEditModal = (projectName: string, projectId: string) => {
    setSelectedProjectName(projectName);
    setSelectedProjectId(projectId);
    setEditModalOpened(true);
  };

  const handleCloseEditModal = () => {
    setSelectedProjectName("");
    setSelectedProjectId("");
    setEditModalOpened(false);
  };

  const handleEdit = (projectId: string, newName: string) => {
    updateProjectAPI(projectId, newName).then(
      () => {
        alert("Project name updated successfully!");
        updateProject(projectId, newName);
      },
      () => {
        alert("Update unsuccessful!");
      }
    );
    handleCloseEditModal();
  };

  const handleOpenDeleteModal = (projectName: string, projectId: string) => {
    setSelectedProjectName(projectName);
    setSelectedProjectId(projectId);
    setDeleteModalOpened(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedProjectName("");
    setSelectedProjectId("");
    setDeleteModalOpened(false);
  };

  const handleDelete = (projectId: string) => {
    deleteProjectAPI(projectId).then(
      () => {
        alert("Successfully deleted project!");
        removeProject(projectId);
        console.log("project with id ", projectId, " deleted!");
      },
      (reason) => {
        alert(
          "It seems like the project has tables in it. Please delete those first"
        );
      }
    );
    handleCloseDeleteModal();
  };

  useEffect(() => {
    if (data) {
      setProjects(data);
      setLoading(false);
    }
  }, [data]);

  return (
    <div className="fixed top-0 left-0 h-screen w-56 bg-gray-100 grid-cols-1 border border-r-2 border-white ">
      <div className="flex justify-start p-3  h-24 mt-5">
        <p className="head_text">
          <span
            className="bg-green-500 font-bold text-white italic  
        pr-3 pl-1.5 rounded-lg mr-1"
          >
            P
          </span>
          erago
        </p>
      </div>

      <div className="mt-10 h-screen" >
        <div className="project-list">
          <NavLink
            defaultOpened
            leftSection={<IconFolder />}
            label="Projects"
            childrenOffset={28}
          >
            {projects &&
              projects.map((project) => (
                <div key={project.id} className="flex">
                  <NavLink
                    leftSection={<IconFolder size={16} />}
                    label={project.name}
                    href={`/workSpace/${project.id}`}
                  />
                  <div className="mt-2.5 mr-1">
                    <Menu trigger="hover" openDelay={100} closeDelay={400}>
                      <Menu.Target>
                        <IconMenu2 size={16} />
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconPencil size={14} />}>
                          <Button
                            variant="transparent"
                            color="black"
                            onClick={() =>
                              handleOpenEditModal(project.name, project.id)
                            }
                          >
                            Edit
                          </Button>
                        </Menu.Item>
                        <Menu.Item leftSection={<IconTrash size={14} />}>
                          <Button
                            variant="transparent"
                            color="black"
                            onClick={() =>
                              handleOpenDeleteModal(project.name, project.id)
                            }
                          >
                            Delete
                          </Button>
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </div>
              ))}
          </NavLink>
          <Modal
            color="green"
            opened={editModalOpened}
            onClose={handleCloseEditModal}
            title="Edit Project"
            centered
          >
            {selectedProjectName != "" && (
              <EditProjectModal
                projectName={selectedProjectName}
                projectId={selectedProjectId}
                submit={handleEdit}
              />
            )}
          </Modal>
          <Modal
            color="red"
            opened={deleteModalOpened}

            onClose={handleCloseDeleteModal}
          
            centered
            
          >
            {selectedProjectName != "" && (
              <DeleteProjectModal
                projectName={selectedProjectName}
                projectId={selectedProjectId}
                handleDelete={handleDelete}
              />
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
