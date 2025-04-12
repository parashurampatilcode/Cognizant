
import {IconButton} from "@mui/material";
import {   FileDownload,  Image,   ContentCopy} from "@mui/icons-material";
import * as XLSX from "xlsx";
import * as htmlToImage from "html-to-image";
const primaryColor = "#005EB8";

function ExportIcon ({exportRows, exportColumns, exportTableRef, reportName}){
  

    const handleExportExcel = () => {
        console.log("rows1",exportRows);
        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, reportName+" Data");
        XLSX.writeFile(workbook, reportName+"_data.xlsx");
      };
    
      const handleExportImage = async () => {
        if (exportTableRef.current) {
          try {
            const dataUrl = await htmlToImage.toPng(exportTableRef.current);
            const link = document.createElement("a");
            link.download = reportName+"_table.png";
            link.href = dataUrl;
            link.click();
          } catch (error) {
            console.error("Error exporting image:", error);
          }
        }
      };
    
      const handleCopyData = async () => {
        try {
          const data = exportRows.map((row) => {
            const rowData = {};
            exportColumns.forEach((col) => {
              rowData[col.headerName] = row[col.field];
            });
            return rowData;
          });
          await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
          alert("Data copied to clipboard!");
        } catch (err) {
          console.error("Error copying data:", err);
        }
      };
    
      

    return (
        <>
        <IconButton
        onClick={handleExportExcel}
        title="Export Excel"
        sx={{ color: primaryColor }}
      >
        <FileDownload />
      </IconButton>
      <IconButton
        onClick={handleExportImage}
        title="Export Image"
        sx={{ color: primaryColor }}
      >
        <Image />
      </IconButton>
      <IconButton
        onClick={handleCopyData}
        title="Copy Data"
        sx={{ color: primaryColor }}
      >
        <ContentCopy />
      </IconButton>
      </>

    );
}


export default ExportIcon;