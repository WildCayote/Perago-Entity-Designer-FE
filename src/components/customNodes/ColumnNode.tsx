import { Handle, Position } from "reactflow";
import style from "./css/ColumnNode.module.css";
import { useCallback } from "react";

const ColumnNode = ({
  data,
}: {
  data: { name: string; type?: string; isPrimary: boolean; isForiegn: boolean };
}) => {
  return (
    <>
      {data.isPrimary && <Handle type="target" position={Position.Right} />}
      {data.isForiegn && <Handle type="source" position={Position.Right} />}
      <div className={data.isPrimary ? style.container : style.containerNormal}>
        <div className={style.info}>
          {data.isPrimary && "PK"}
          {data.isForiegn && "FK"}
        </div>
        <div className={style.main}>
          {data.name} ({data.type})
        </div>
      </div>
    </>
  );
};

export default ColumnNode;
