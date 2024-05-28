"use client";
import React, { useState } from "react";
import SideBar from "@/components/SideBar";

import SearchBar from "@/components/SearchBar";

import { IconPlus } from "@tabler/icons-react";
import { Button, Modal } from "@mantine/core";
import CreateProjectModal from "@/components/CreateProjectModal";
import { useDisclosure } from "@mantine/hooks";

const Main = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  
  return (
    <div className="flex h-screen">
      <div className="mr-56">
        <SideBar />
      </div>
      <div className="scrollable-div flex-grow ml-1 bg-gray-100 overflow-auto">
        <div
          className=" bg-green-600
          bg-no-repeat h-24 flex items-center justify-end text-center pr-40 mb-1"
        >
        </div>

        <div>
          <div className="col-span-4 space-y-4 rounded-lg border border-green-500 border-dashed m-8 p-6 text-center">
            <div className="space-y-1">
              <p className="text-sm text-foreground-light">
                Start a new Project?
              </p>
            </div>
            <Modal
              color="green"
              opened={opened}
              onClose={close}
              title="Create New Project"
              centered
            >
              <CreateProjectModal isOpen={open} onClose={close} />
            </Modal>
            <Button
              color="green"
              onClick={open}
              rightSection={<IconPlus size={14} />}
              className="sm:w-full md:w-auto"
            >
              New Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
