import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Checkbox,
  Modal,
  Select,
  Input,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

import { createColumnAPI, getModelColumns } from "@/services/columnService";
import { ColumnInterface, useColumnStore } from "@/zustandStore/columnStore";
import useTableStore from "@/zustandStore/tableStore";

const schema = yup.object({
  name: yup.string().required(),
  type: yup.string().required(),
  default_value: yup.string(),
  is_primarykey: yup.boolean(),
  is_foreignkey: yup.boolean(),
  relation: yup
    .object({
      referencedColumnId: yup.string(),
      name: yup.string(),
      type: yup.string(),
      eager: yup.boolean(),
      nullable: yup.boolean(),
    })
    .nullable(),
});

const AddColumnModal = ({ projectId, id }) => {
  const { tables } = useTableStore((state) => state);
  const tableId = id;
  const [opened, { open, close }] = useDisclosure(false);
  const { addColumn } = useColumnStore();
  const [foreignKeySelections, setForeignKeySelections] = useState({});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const columnData = {
      name: data.name,
      type: data.type,
      isPrimary: data.is_primarykey,
      isForiegn: data.is_foreignkey,
      relation: data.relation,
    };

    console.log("The data submited is as follows: ", columnData);

    try {
      const response = await createColumnAPI(tableId, columnData);
      addColumn(response.data);
      close();
    } catch (error) {
      alert("Couldn't add the column to the table");
      close();
    }
  };

  const handleForeignKeyChange = (index) => (e) => {
    const isChecked = e.target.checked;
    setForeignKeySelections((prevState) => ({
      ...prevState,
      [index]: isChecked,
    }));
  };

  const [columnOptions, setColumnOptions] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const allColumns = [] as ColumnInterface[];
      for (const table of tables) {
        if (table.projectId === projectId) {
          const tableColumns = await getModelColumns(table.id);
          allColumns.push(...tableColumns.filter((column) => column.isPrimary));
        }
      }

      let options = [] as { value: string; label: string }[];

      allColumns.forEach((column) => {
        let modelId = column.modelId;
        let model = tables.find((table) => table.id == modelId);
        let modelName = model?.name;

        options.push({
          value: column.id,
          label: `${modelName}`,
        });
      });

      setColumnOptions(options);
    };

    fetchData();
  }, [projectId, tables]);

  return (
    <>
      <Button onClick={open} color="green" size="xs" variant="transparent">
        <IconPlus />
      </Button>
      <Modal opened={opened} onClose={close} title="Add Column">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <Input.Wrapper label="Name" withAsterisk>
            <TextInput
              placeholder="Name"
              {...register("name")}
              error={errors.name?.message}
              className={errors.name ? "error-input" : ""}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Type" withAsterisk>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  data={["number", "string", "bool", "jsonb", "any", "Date"]}
                  {...field}
                />
              )}
            />
          </Input.Wrapper>

          <Input.Wrapper label="Default value">
            <TextInput
              placeholder="default value"
              {...register("default_value")}
            />
          </Input.Wrapper>

          <div>
            <Input.Wrapper label="Primary key">
              <Checkbox placeholder="pk" {...register("is_primarykey")} />
            </Input.Wrapper>
            <Input.Wrapper label="Foreign key">
              <Checkbox
                placeholder="fk"
                {...register("is_foreignkey")}
                onChange={handleForeignKeyChange(0)}
              />
            </Input.Wrapper>
          </div>

          {foreignKeySelections[0] && (
            <div>
              <Input.Wrapper label="Referenced column">
                <Controller
                  control={control}
                  name="relation.referencedColumnId"
                  render={({ field }) => (
                    <Select
                      placeholder="Referenced column"
                      data={columnOptions}
                      {...field}
                    />
                  )}
                />
              </Input.Wrapper>

              <Input.Wrapper label="Reverse Name">
                <TextInput placeholder="name" {...register("relation.name")} />
              </Input.Wrapper>

              <Input.Wrapper label="Relation Type">
                <Controller
                  control={control}
                  name="relation.type"
                  render={({ field }) => (
                    <Select
                      placeholder="Relation type"
                      data={["one-to-one", "many-to-one", "one-to-many"]}
                      {...field}
                    />
                  )}
                />
              </Input.Wrapper>

              <Input.Wrapper label="Eager">
                <Checkbox {...register("relation.eager")} />
              </Input.Wrapper>

              <Input.Wrapper label="Nullable">
                <Checkbox {...register("relation.nullable")} />
              </Input.Wrapper>
            </div>
          )}

          <Button color="green" type="submit">
            Create
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default AddColumnModal;
