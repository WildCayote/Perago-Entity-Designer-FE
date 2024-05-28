import React, { useEffect, useState } from "react";
import { Input, Button, Checkbox, Table, Select } from "@mantine/core";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { v4 } from "uuid";
import { useDispatch } from "react-redux";
import { createTable } from "@/store/slices/workSpaceSlice";
import { createTableAPI } from "@/services/tableService";
import useTableStore from "@/zustandStore/tableStore";
import {
  ColumnDto,
  createColumnsAPI,
  getModelColumns,
} from "@/services/columnService";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string(),
  columns: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Column name is required"),
      type: yup.string(),
      defaultValue: yup.string(),
      is_primarykey: yup.boolean(),
      is_foreignkey: yup.boolean(),
      relation: yup
        .object()
        .shape({
          name: yup.string(),
          type: yup.string(),
          referencedColumnId: yup.string(),
          eager: yup.boolean(),
          nullable: yup.boolean(),
        })
        .nullable(),
    })
  ),
});

const CreateTableDrawer = ({ onClose, projectId }) => {
  const dispatch = useDispatch();
  const [foreignKeySelections, setForeignKeySelections] = useState({});
  const { tables } = useTableStore((state) => state);

  const handleForeignKeyChange =
    (index: number) => (e: { target: { checked: any } }) => {
      const isChecked = e.target.checked;
      setForeignKeySelections((prevState) => ({
        ...prevState,
        [index]: isChecked,
      }));
    };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      columns: [],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "columns",
  });

  const { addTable } = useTableStore();

  const onSubmit = async (data) => {
    const id = v4();
    const newTable = {
      id,
      name: data.name,
      description: data.description || "",
      columns: data.columns.map((column) => ({
        id: v4(),
        name: column.name,
        type: column.type,
        defaultValue: column.defaultValue,
        is_primarykey: column.is_primarykey || false,
        is_foreignkey: column.is_foreignkey || false,
        relation: column.relation || null,
      })),
    };

    try {
      const newTableAPI = {
        name: data.name,
      };

      const tableRequestResult = await createTableAPI(projectId, newTableAPI);
      const createdTable = tableRequestResult.data;

      if (data.columns != undefined) {
        let newColumnsAPI = data.columns.map((column) => ({
          name: column.name,
          type: column.type,
          isPrimary:
            column.is_primarykey == undefined ? false : column.is_primarykey,
          isForiegn:
            column.is_foreignkey == undefined ? false : column.is_foreignkey,
          relation: column.relation || {},
        }));
        await createColumnsAPI(createdTable.id, newColumnsAPI as ColumnDto[]);
        console.log("will be sent to api: ", newColumnsAPI);
      }
      addTable(createdTable);
      console.log(createdTable);
      onClose();
    } catch (error) {
      alert("Couldn't create table");
      onClose();
    }

    console.log(newTable);
    dispatch(createTable({ newTable, projectId }));
    onClose();
  };

  const addColumn = () => {
    append({
      name: "",
      type: "",
      defaultValue: "",
      is_primarykey: false,
      is_foreignkey: false,
      relation: null,
    });
  };

  let datas = [];
  const [dataState, setData] = useState([]);
  useEffect(() => {
    tables.forEach((table) => {
      if (table.projectId == projectId)
        getModelColumns(table.id).then(
          (response) => {
            for (const column of response) {
              if (column.isPrimary) {
                let duplicate = datas.find(
                  (data) => data.columnId == column.id
                );
                if (duplicate == undefined)
                  datas.push({
                    columnId: column.id,
                    tableName: table.name,
                  });

                console.log("there is a duplicate at", duplicate);
              }
              setData(datas);
            }
          },
          () => {}
        );
    });

    setData(datas);
  }, []);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-4 sm:px-6 space-y-10 py-6 border-b-2">
          <Input.Wrapper label="Name" withAsterisk>
            <Input placeholder="Name" {...register("name")} />
            {errors.name && <p>{errors.name.message}</p>}
          </Input.Wrapper>
          <Input.Wrapper label="Description">
            <Input placeholder="Optional" {...register("description")} />
          </Input.Wrapper>
        </div>
        <div className="px-4 sm:px-6 space-y-10 py-6 border-b-2">
          <h2>Columns</h2>
          {fields.map((field, index) => (
            <div key={field.id}>
              <Table withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Input.Wrapper label="Name" withAsterisk>
                        <Input
                          placeholder="name"
                          {...register(`columns.${index}.name`)}
                        />
                        {errors.columns?.[index]?.name && (
                          <p>{errors.columns[index].name.message}</p>
                        )}
                      </Input.Wrapper>
                    </Table.Th>
                    <Table.Th>
                      <Controller
                        control={control}
                        name={`columns.${index}.type`}
                        render={({ field }) => (
                          <Select
                            label="Data type"
                            withAsterisk
                            data={["number", "string", "boolean"]}
                            {...field}
                          />
                        )}
                      />
                    </Table.Th>
                    <Table.Th>
                      <Input.Wrapper label="Default value">
                        <Input {...register(`columns.${index}.defaultValue`)} />
                      </Input.Wrapper>
                    </Table.Th>
                    <Table.Th>
                      <Input.Wrapper label="PK">
                        <Checkbox
                          {...register(`columns.${index}.is_primarykey`)}
                        />
                      </Input.Wrapper>
                    </Table.Th>
                    <Table.Th>
                      <Input.Wrapper label="FK">
                        <Checkbox
                          {...register(`columns.${index}.is_foreignkey`)}
                          onChange={handleForeignKeyChange(index)}
                        />
                      </Input.Wrapper>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
              </Table>

              {foreignKeySelections[index] && (
                <div className="grid-cols-3">
                  <div className="m-1">
                    <Input.Wrapper label="Referenced Column">
                      <Controller
                        control={control}
                        name={`columns.${index}.relation.referencedColumnId`}
                        render={({ field }) => (
                          <Select
                            placeholder="Referenced column"
                            data={dataState.map((data) => ({
                              value: data.columnId,
                              label: data.tableName,
                            }))}
                            {...field}
                          />
                        )}
                      />
                    </Input.Wrapper>
                  </div>

                  <div className="m-1">
                    <Input.Wrapper label="Rerverse Name">
                      <Input
                        placeholder="name"
                        {...register(`columns.${index}.relation.name`)}
                      />
                    </Input.Wrapper>
                  </div>

                  <div className="m-1">
                    <Input.Wrapper label="Relation Type">
                      <Controller
                        control={control}
                        name={`columns.${index}.relation.type`}
                        render={({ field }) => (
                          <Select
                            placeholder="Relation type"
                            data={["one-to-one", "many-to-one", "one-to-many"]}
                            {...field}
                          />
                        )}
                      />
                    </Input.Wrapper>
                  </div>

                  <div>
                    <Input.Wrapper label="Eager">
                      <Checkbox
                        {...register(`columns.${index}.relation.eager`)}
                      />
                    </Input.Wrapper>
                  </div>

                  <div>
                    <Input.Wrapper label="Nullable">
                      <Checkbox
                        {...register(`columns.${index}.relation.nullable`)}
                      />
                    </Input.Wrapper>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="col-span-4 space-y-4 rounded-lg border border-green-500 border-dashed m-8 p-0 text-center">
            <div className="space-y-1">
              <Button
                variant="transparent"
                type="button"
                color="green"
                onClick={addColumn}
                size="xs"
              >
                Add Column
              </Button>
            </div>
          </div>
        </div>

        <div className="relative bottom-0 right-0 mt-6 justify-center flex">
          <Button type="submit" color="green">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTableDrawer;
