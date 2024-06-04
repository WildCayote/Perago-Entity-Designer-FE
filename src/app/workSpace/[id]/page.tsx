"use client";

import WorkSpaceSideBar from "@/components/WorkSpaceSideBar";
import { useParams } from "next/navigation";
import {
  IconTable,
  IconDownload,
  IconCode,
  IconTrash,
  IconPencil,
  IconGraph,
} from "@tabler/icons-react";
import { Button, Drawer, Modal } from "@mantine/core";

import CreateTableDrawer from "@/components/CreateTableDrawer";
import { useState, useEffect } from "react";
import AddColumnModal from "@/components/AddColumnModal";
import { IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import useTables from "@/hooks/tableHooks";
import useTableStore, { TableInterface } from "@/zustandStore/tableStore";
import { deleteColumnAPI, getModelColumns } from "@/services/columnService";
import { ColumnInterface, useColumnStore } from "@/zustandStore/columnStore";
import {
  addGenerateJob,
  downloadProject,
  openWebSocket,
} from "@/services/extractService";
import DeleteTableModal from "@/components/DeleteTableModal";
import { deleteTableAPI } from "@/services/tableService";
import EditTableModal from "@/components/EditTableModal";

import { updateTableAPI } from "@/services/tableService";
import ERDiagram from "@/components/ERDiagram";
import {
  ColumnItem,
  RelationItem,
  TableItem,
} from "@/components/ERDiagram/ERDiagram";

const Page = () => {
  const [opened, { open, close }] = useDisclosure(false);

  const { removeTable, editTable } = useTableStore((state) => state);
  const { deleteColumn } = useColumnStore((state) => state);
  const { id } = useParams();
  const projectId = id;

  const { data, isLoading } = useTables(projectId.toString());

  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [erOpened, setErOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedTableName, setSelectedTableName] = useState("");

  const [erTables, setErTables] = useState<TableItem[]>([]);
  const [erColumns, setErColumns] = useState<ColumnItem[]>([]);
  const [erRelations, setErRelations] = useState<RelationItem[]>([]);

  const handleOpenDeleteModal = (tableId: string) => {
    setDeleteModalOpened(true);
    setSelectedTableId(tableId);
  };

  const handleDelete = (tableId: string) => {
    console.log(`table with this id - ${tableId} 
    is going to get deleted`);

    deleteTableAPI(projectId, tableId).then(
      () => {
        removeTable(tableId);
        alert("Successfully deleted Table!");
      },
      (reason) => {
        alert("It seems like you cant delete this table");
      }
    );
    handleCloseDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpened(false);
    setSelectedTableId("");
  };

  const handleOpenEditModal = (tableId: string, tableName: string) => {
    setSelectedTableName(tableName);
    setSelectedTableId(tableId);
    setEditModalOpened(true);
  };

  const handleEdit = (tableId: string, newName: string) => {
    updateTableAPI(projectId, tableId, newName).then(
      () => {
        alert("successfully updated the table");
        editTable(tableId, newName);
      },
      (reason) => {
        alert("it seems like you were not able to edit the table");
      }
    );

    handleCloseEditModal();
  };

  const handleCloseEditModal = () => {
    setEditModalOpened(false);
    setSelectedTableId("");
    setSelectedTableName("");
  };

  const getColumnParetn = (columnId: string) => {};

  const {
    tables: storeTables,
    isLoading: storeLoading,
    setTables,
  } = useTableStore();

  useEffect(() => {
    setTables(data as TableInterface[]);
  }, [isLoading]);

  const [tableId, setTableId] = useState();
  const [isDisabled, setDisabled] = useState(true);
  const [jobId, setJobId] = useState("");

  const { columns, setColumns } = useColumnStore();

  const handleColumnDelete = (event) => {
    const buttonId = event.currentTarget.id;
    const column = columns.find((c) => c.id == buttonId);
    const modelId = column?.modelId ?? "";
    const columnId = column?.id ?? "";
    deleteColumnAPI(modelId, columnId).then(
      () => {
        alert("Column deleted successfully!");
        deleteColumn(buttonId);
      },
      () => {
        alert("Couldn't delete column");
      }
    );
  };

  const notifyUser = (jobId: string) => {
    alert(
      "The generation of your task has been done! You can now use the `Download Code` button."
    );
    setDisabled(false);
    setJobId(jobId);
  };

  const handleButtonClick = async (event) => {
    const buttonId = event.currentTarget.id;
    const tableId = buttonId;

    try {
      const apiColumns = await getModelColumns(tableId);
      console.log(apiColumns);
      setTableId(tableId);

      // see if the columns are already there
      let allColumns = [] as ColumnInterface[];
      apiColumns.forEach((c) => {
        if (columns.find((column) => c.id === column.id) == undefined)
          allColumns.push(c);
      });
      allColumns = allColumns.concat(columns);
      setColumns(allColumns);
    } catch (err) {
      console.log(err);
    }

    console.log(`Button with ID ${tableId} was clicked`);
  };

  const handleGenerateClick = async (event) => {
    try {
      setDisabled(true);
      const response = await addGenerateJob(projectId as string);
      alert(response.message);
      openWebSocket(response.jobId, notifyUser);
    } catch (error) {
      alert("Couldn't place job");
    }
  };

  const handleDownloadClick = () => {
    downloadProject(jobId);
  };

  const handleErOpen = async () => {
    // get the tables ready
    let tabels = [] as TableItem[];
    storeTables.forEach((table) => {
      tabels.push({
        id: table.id,
        name: table.name,
      });
    });

    // get the columns and relations ready
    let columns = [] as ColumnItem[];
    let relations = [] as RelationItem[];
    for (let table of storeTables) {
      let tableColumns = await getModelColumns(table.id);
      tableColumns.forEach((col) => {
        columns.push({
          id: col.id,
          modelId: col.modelId,
          name: col.name,
          isForiegn: col.isForiegn,
          isPrimary: col.isPrimary,
          type: col.type,
        });

        if (col.isForiegn) {
          relations.push({
            id: col.relation?.id,
            columnId: col.relation?.columnId,
            referencedColumnId: col.relation?.referencedColumnId,
            type: col.relation?.type,
          });
        }
      });
    }

    setErColumns(columns);
    setErTables(tabels);
    setErRelations(relations);
    setErOpened(true);
  };

  const handlErClose = () => {
    setErOpened(false);
  };

  return (
    <div className="grid-cols-custom">
      <div className="h-screen bg-green-900 border border-r-2">
        <WorkSpaceSideBar />
      </div>

      <div className="h-screen bg-gray-200 border-r-2 border-white">
        <div className="border border-b-2 border-b-white h-14">
          <p className="p-3 text-3x1 font-semibold text-green-700">
            Table Editor
          </p>
        </div>

        <div className="justify-center project-list flex flex-col h-screen">
          <div className="flex justify-center border border-r-2 border-b-white mt-2">
            <Drawer
              opened={opened}
              onClose={close}
              position="right"
              size="40rem"
              title="Create a new table"
              overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            >
              <CreateTableDrawer
                isOpen={open}
                onClose={close}
                projectId={projectId}
              />
            </Drawer>
            <Button
              className="mb-4"
              leftSection={<IconPlus size={14} />}
              color="green"
              size="xs"
              onClick={open}
            >
              New Table
            </Button>
          </div>

          <div className="grid-cols-1 overflow-y-auto">
            {storeTables?.length > 0 && (
              <div>
                {storeTables.map(
                  (table) =>
                    table && (
                      <div key={table.id} className="flex">
                        <Button
                          justify="left"
                          fullWidth
                          color="green"
                          leftSection={<IconTable />}
                          variant="transparent"
                          onClick={handleButtonClick}
                          id={table.id}
                        >
                          {table.name}
                        </Button>

                        <Button
                          variant="transparent"
                          id={table.id}
                          onClick={() => handleOpenDeleteModal(table.id)}
                        >
                          <IconTrash color="green" />
                        </Button>
                        <Button
                          variant="transparent"
                          id={table.id}
                          onClick={() =>
                            handleOpenEditModal(table.id, table.name)
                          }
                        >
                          <IconPencil color="green" />
                        </Button>

                        <Modal
                          color="green"
                          opened={deleteModalOpened}
                          onClose={() => handleCloseDeleteModal()}
                          centered
                        >
                          {table && (
                            <DeleteTableModal
                              tableId={selectedTableId}
                              handleDelete={handleDelete}
                            />
                          )}
                        </Modal>
                        <Modal
                          color="green"
                          opened={editModalOpened}
                          onClose={() => handleCloseEditModal()}
                          centered
                        >
                          {table && (
                            <EditTableModal
                              tableName={selectedTableName}
                              tableId={selectedTableId}
                              handleEdit={handleEdit}
                            />
                          )}
                        </Modal>

                        <Modal
                          color="green"
                          opened={erOpened}
                          onClose={handlErClose}
                          className="flex items-center"
                          centered
                          fullScreen
                        >
                          <ERDiagram
                            tables={erTables}
                            columns={erColumns}
                            relationships={erRelations}
                          />
                        </Modal>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
          {storeTables?.length > 0 && (
            <div className="mt-auto ml-3">
              <div>
                <Button
                  leftSection={<IconCode />}
                  color="green"
                  size="xs"
                  onClick={handleGenerateClick}
                >
                  Generate Code
                </Button>
              </div>
              <div className="mt-3">
                <Button
                  onClick={handleErOpen}
                  leftSection={<IconGraph />}
                  color="green"
                  size="xs"
                >
                  ER Diagram
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-screen">
        {/* we will write the colomun code here */}

        <div className="relative h-14 bg-gray-200 border-b-2 border-white">
          <div className="absolute right-2 top-2">
            <Button
              rightSection={<IconDownload />}
              variant="transparent"
              color="green"
              disabled={isDisabled}
              onClick={handleDownloadClick}
            >
              Download Code
            </Button>
          </div>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                    Type
                  </th>
                  <th className="py-3 px-6 text-left text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                    Primary Key
                  </th>
                  <th className="py-3 px-6 text-left text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                    Is Foriegn
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {columns.map(
                  (column) =>
                    column.modelId == tableId && (
                      <tr
                        key={column.id}
                        className="hover:bg-gray-100 transition-colors duration-200"
                      >
                        <td className="py-4 px-6 border-b border-gray-200">
                          {column.name}
                        </td>
                        <td className="py-4 px-6 border-b border-gray-200">
                          {column.type}
                        </td>
                        <td className="py-4 px-6 border-b border-gray-200">
                          {column.isPrimary ? "Yes" : "No"}
                        </td>
                        <td className="py-4 px-6 border-b border-gray-200">
                          {column.isForiegn ? "Yes" : "No"}
                        </td>
                        <td>
                          <Button
                            variant="transparent"
                            onClick={handleColumnDelete}
                            id={column.id}
                          >
                            <IconTrash color="green" />
                          </Button>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>

          <div className="col-span-full">
            <AddColumnModal
              projectId={projectId as string}
              id={tableId ?? ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
