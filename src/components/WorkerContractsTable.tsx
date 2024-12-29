import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Contract } from '../types/Contract';

interface WorkerContractsTableProps {
  contracts: Contract[];
}

export function WorkerContractsTable({ contracts }: WorkerContractsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Hours Per Period</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.type}</TableCell>
              <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
              <TableCell>
                {contract.endDate 
                  ? new Date(contract.endDate).toLocaleDateString()
                  : 'Ongoing'}
              </TableCell>
              <TableCell>{contract.hoursPerPeriod}</TableCell>
              <TableCell>
                {new Date(contract.endDate) < new Date() ? 'Completed' : 'Active'}
              </TableCell>
            </TableRow>
          ))}
          {contracts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No contracts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default WorkerContractsTable;
