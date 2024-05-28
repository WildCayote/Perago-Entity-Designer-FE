import { Button, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { yupResolver } from "@hookform/resolvers/yup";


const schema = yup.object({
  name: yup.string().required(),
});

const EditProjectModal = ({
  tableId,
  tableName,
  handleEdit,
}: {
  tableId: string;
  tableName: string;
  handleEdit: (tableId: string, newName: string) => void;
}) => {
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: tableName }, 
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    const newName = data.name;
    if (newName != tableName) {
      console.log("now i will call the submit function");
      handleEdit(tableId, newName);
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        placeholder={tableName}
        {...register("name")}
        error={errors.name?.message}
        className={errors.name ? "error-input" : ""}
      />
      <Button color="green" type="submit">
        Edit
      </Button>
    </form>
  );
};

export default EditProjectModal;
