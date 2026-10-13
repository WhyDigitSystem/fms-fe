import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, Chip, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MaterialReactTable } from "material-react-table";
import { useEffect, useState } from "react";
import ActionButton from "./ActionButton";

const CommonTable = ({
  data = [],
  columns = [],  // Ensure columns are passed correctly
  onEdit,
  onGeneratePdf,
  showEdit = true,
  showPdf = false,
}) => {
  const [tableData, setTableData] = useState(data);
  const theme = useTheme();

  const chipStyles = {
    success: {
      color: theme.palette.success.dark,
      backgroundColor: theme.palette.success.light,
      height: 28,
      padding: "0 6px",
    },
    error: {
      color: theme.palette.error.dark,
      backgroundColor: theme.palette.error.light,
      height: 28,
      padding: "0 6px",
    },
  };

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const enhancedColumns = columns?.map((column) => {
    if (column.accessorKey === "active") {
      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() === "Active" ? "Active" : "Inactive"}
            sx={
              cell.getValue() === "Active"
                ? chipStyles.success
                : chipStyles.error
            }
          />
        ),
      };
    }

    if (column.accessorKey === "currentFinYear") {
      return {
        ...column,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? "True" : "False"}
            sx={cell.getValue() ? chipStyles.success : chipStyles.error}
          />
        ),
      };
    }

    return column;
  });

  const renderRowActions = ({ row }) => (
    <Box sx={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      {showPdf && (
        <ActionButton
          title="PDF"
          icon={PictureAsPdfIcon}
          onClick={() => onGeneratePdf(row.original)} // Pass full row data
        />
      )}
      {showEdit && (
        <ActionButton
          title="Edit"
          icon={EditIcon}
          onClick={() => onEdit(row.original)} // Pass full row data
        />
      )}
    </Box>
  );

  return (
    <MaterialReactTable
      columns={enhancedColumns}  // Ensure enhanced columns are passed here
      data={tableData}
      enableColumnOrdering
      enableEditing
      renderRowActions={renderRowActions}
      displayColumnDefOptions={{
        "mrt-row-actions": {
          muiTableHeadCellProps: {
            align: "center",
          },
          size: 120,
        },
      }}
      renderTopToolbarCustomActions={() => (
        <Stack direction="row" spacing={2}>
          {/* Add any additional top toolbar actions here */}
        </Stack>
      )}
    />
  );
};

export default CommonTable;
