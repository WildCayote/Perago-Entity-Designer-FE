import style from "./css/TableNode.module.css";

const TableNode = ({ data }: { data: { name: string } }) => {
  return (
    <>
      <div className={style.container}>{data.name}</div>
    </>
  );
};

export default TableNode;
