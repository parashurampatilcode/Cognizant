import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { getPDPData } from "../services/api";

function PDPList() {
  const [pdpData, setPDPData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPDPData();
        setPDPData(data);
      } catch (error) {
        console.error("Error fetching PDP data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Employee Name</TableCell>
            <TableCell align="right">Grade</TableCell>
            <TableCell align="right">Primary Skill</TableCell>
            <TableCell align="right">Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pdpData.map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.EmployeeName}
              </TableCell>
              <TableCell align="right">{row.Grade}</TableCell>
              <TableCell align="right">{row.PrimarySkill}</TableCell>
              <TableCell align="right">{row.Location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PDPList;
