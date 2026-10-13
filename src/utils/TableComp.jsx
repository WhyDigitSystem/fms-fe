import EditIcon from "@mui/icons-material/Edit";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

const TableComp = ({ headers, data, onEdit }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        {/* Table Header */}
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={index}>{header}</TableCell>
            ))}
            <TableCell>Actions</TableCell> {/* Extra column for actions */}
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {headers.map((header, headerIndex) => (
                <TableCell key={headerIndex}>{row[header]}</TableCell>
              ))}
              <TableCell>
                <IconButton
                  onClick={() => onEdit(row)} // Call onEdit with the row data
                  aria-label="edit"
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComp;
