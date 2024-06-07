import React, { useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { SmartBezierEdge } from "@tisoap/react-flow-smart-edge";
import { v4 as uuidv4 } from "uuid";

import style from "./ERDiagram.module.css";
import TableNode from "../customNodes/TableNode";
import ColumnNode from "../customNodes/ColumnNode";
import ClosingNode from "../customNodes/ClosingNode";

export interface ColumnItem {
  id: string;
  modelId: string;
  name: string;
  isForiegn: boolean;
  isPrimary: boolean;
  type: string;
}

export interface TableItem {
  id: string;
  name: string;
}

export interface RelationItem {
  id: string;
  columnId: string;
  referencedColumnId: string;
  type: string;
}

const GAP = 50; // gap between tables
const WIDTH = 200; // width of one table
const TITLE_HEIGHT = 27; // height of table title
const COL_HEIGHT = 30; // height of column
const CLOSING_HEIGHT = 3; // height of the closing column
const TABLES_PER_ROW = 4; // max amount of tables to put in the same row

const ERDiagram = ({
  tables,
  columns,
  relationships,
}: {
  tables: TableItem[];
  columns: ColumnItem[];
  relationships: RelationItem[];
}) => {
  const nodeTypes = useMemo(
    () => ({
      tableNode: TableNode,
      columnNode: ColumnNode,
      closingNode: ClosingNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      smart: SmartBezierEdge,
    }),
    []
  );

  const createTableNode = (table: TableItem, x: number, y: number): Node => ({
    id: table.id,
    type: "tableNode",
    data: { name: table.name },
    position: { x, y },
  });

  const createColumnNode = (
    column: ColumnItem,
    x: number,
    y: number
  ): Node => ({
    id: column.id,
    type: "columnNode",
    data: {
      name: column.name,
      isForiegn: column.isForiegn,
      isPrimary: column.isPrimary,
      type: column.type,
    },
    position: { x, y },
  });

  const createClosingNode = (id: string, x: number, y: number): Node => ({
    id,
    type: "closingNode",
    data: null,
    position: { x, y },
  });

  const finalNodes: Node[] = [];
  const finalEdges: Edge[] = [];

  let maxHeight = 0;
  let currentX = 0;
  let currentY = 0;
  let currentTable = 0;
  let level = 0;
  let levelHieght = 0;

  tables.forEach((table) => {
    const tableId = table.id;
    let tableHeight = TITLE_HEIGHT;

    finalNodes.push(createTableNode(table, currentX, currentY));
    currentY += TITLE_HEIGHT;

    const primaryCol = columns.find(
      (column) => column.isPrimary && column.modelId === tableId
    );
    if (primaryCol) {
      finalNodes.push(createColumnNode(primaryCol, currentX, currentY));
      currentY += COL_HEIGHT;
      tableHeight += COL_HEIGHT;
    }

    columns.forEach((column) => {
      if (column.modelId === tableId && !column.isPrimary) {
        finalNodes.push(createColumnNode(column, currentX, currentY));
        currentY += COL_HEIGHT;
        tableHeight += COL_HEIGHT;
      }
    });

    finalNodes.push(createClosingNode(uuidv4(), currentX, currentY));
    currentY += CLOSING_HEIGHT;
    tableHeight += CLOSING_HEIGHT;

    if (currentTable + 1 < TABLES_PER_ROW) {
      currentX += WIDTH + GAP;
      currentTable += 1;
      if (level <= 0) currentY = 0;
      currentY = levelHieght;
      if (tableHeight > maxHeight) maxHeight = tableHeight;
    } else {
      currentX = 0;
      currentTable = 0;
      level += 1;
      currentY = maxHeight + GAP;
      levelHieght = currentY;
      maxHeight = 0;
    }
  });

  relationships.forEach((relation) => {
    finalEdges.push({
      id: relation.id,
      source: relation.columnId,
      target: relation.referencedColumnId,
      type: "smart",
    });
  });

  return (
    <div className={style.graphContainer}>
      <ReactFlow
        nodes={finalNodes}
        edges={finalEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <MiniMap nodeStrokeWidth={3} />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ERDiagram;
