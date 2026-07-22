import React, { useState } from 'react';
import { MilkingRecord, MilkOutflowRecord, Cow } from '../../types';
import { jsPDF } from 'jspdf';
import { exportToCsv } from '../../utils/csvHelper';
import { toIsoDate } from '../../utils/dateHelper';
import { Plus, Download, FileSpreadsheet, FileDown, Edit, Trash2 } from 'lucide-react';

interface LactationLedgerProps {
  cows: Cow[];
  milkRecords: MilkingRecord[];
  milkOutflow: MilkOutflowRecord[];
  onAddMilkRecord: (record: MilkingRecord) => void;
  onEditMilkRecord: (id: string, record: MilkingRecord) => void;
  onDeleteMilkRecord: (id: string) => void;
  onAddOutflowRecord: (record: MilkOutflowRecord) => void;
  onEditOutflowRecord: (id: string, record: MilkOutflowRecord) => void;
  onDeleteOutflowRecord: (id: string) => void;
}

export default function LactationLedger({
  cows,
  milkRecords,
  milkOutflow,
  onAddMilkRecord,
  onEditMilkRecord,
  onDeleteMilkRecord,
  onAddOutflowRecord,
  onEditOutflowRecord,
  onDeleteOutflowRecord
}: LactationLedgerProps) {


  return (
    <>
    </>
  );
}