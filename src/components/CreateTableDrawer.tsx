import React from 'react';
import { Input, Button, Checkbox, Table } from '@mantine/core';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {v4} from "uuid";
import { useDispatch } from 'react-redux';
import { createTable } from '@/slices/workSpaceSlice';



const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    description: yup.string(),
    columns: yup.array().of(
        yup.object().shape({
            name: yup.string().required("Column name is required"),
            type: yup.string(),
            defaultValue: yup.string(),
            is_primarykey: yup.boolean(),
        })
    )
});

const CreateTableDrawer = ({ isOpen, onClose, projectId }) => {
    const dispatch = useDispatch()
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            columns: []
        }
    });

    const { fields, append } = useFieldArray({
        control,
        name: "columns"
    });

    // Function to handle form submission
    const onSubmit = async (data) => { 
        const id = v4();
        const newTable = {
            id,
            name: data.name,
            description: data.description || "",
            columns: data.columns.map((column) =>({
                ...column,
                is_primarykey: !!column.is_primarykey
            }))
        }

        console.log(newTable)
         dispatch(createTable({newTable, projectId}))
        onClose()

       
    };

    // function to add an array of colums to the field
    const addColumn = () => {
        append({ name: "", type: "", defaultValue:"",is_primarykey: false });
    };

    return (
        <div className='relative'>
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
                            <Table  withRowBorders={false}>
                                <Table.Thead>
                                    <Table.Tr>
                                    <Table.Th>
                                        <Input.Wrapper label="Name" withAsterisk>
                                            <Input placeholder="name" {...register(`columns.${index}.name`)}/>
                                            {errors.name && <p>{errors.name.message}</p>}
                                        </Input.Wrapper>
                                    </Table.Th>
                                    <Table.Th>
                                        <Input.Wrapper label="type" withAsterisk>
                                            <Input placeholder="Type" {...register(`columns.${index}.type`)} />
                                        </Input.Wrapper>
                                    </Table.Th>
                                    <Table.Th> 
                                        <Input.Wrapper label="Default value">
                                            <Input {...register(`columns.${index}.defaultValue`)} />
                                        </Input.Wrapper>
                                    </Table.Th>
                                    <Table.Th> 
                                        <Input.Wrapper label="PK">
                                            <Checkbox {...register(`columns.${index}.is_primarykey`)} />
                                        </Input.Wrapper>
                                    </Table.Th>
    
                                    </Table.Tr>
                                </Table.Thead>
    
                                </Table>
                           
                           
                        </div>
                    ))}

                        <div className="col-span-4 space-y-4 rounded-lg border  border-green-500 border-dashed m-8 p-0 text-center">
                            <div className="space-y-1">
                                <Button variant="transparent" type="button" color='green'onClick={addColumn} size='xs'>add column</Button>
                            </div>

                        </div>
                    
                </div>

                
                <div className='relative bottom-0  right-0 mt-6 justify-center flex'>
                    <Button type="submit" color="green" >Create</Button>
                </div>
                
            </form>
        </div>
    );
}

export default CreateTableDrawer;