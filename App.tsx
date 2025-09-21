
import React, { useState, useCallback, useEffect } from 'react';
import { Employee, CommissionRecord, View, PendingGPRecord } from './types';
import Header from './components/Header';
import DataEntry from './components/DataEntry';
import AdminReport from './components/Dashboard';
import StructureBuilder from './components/FileUpload';
import LogSale from './components/LogSale';
import FinalizeGP from './components/FinalizeGP';

const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Mason Lenz',
    roles: 'Sales Manager',
    employeeId: '0123',
    clawback: { allowNegativeDeltas: true, maxAgeDays: 90 },
    commissionStructures: [
      {
        id: 'cs-1-1',
        name: 'Sales GP Tier',
        trigger: 'on_close (project completed by the crew)',
        basis: 'final (uses final gross profit % after all costs are posted)',
        calcType: 'Tiered GP',
        formulaDetails: {
          tiers: [
            { from: 40, to: 49.99, rate: 10 },
            { from: 50, to: 54.99, rate: 15 },
            { from: 55, to: 59.99, rate: 20 },
            { from: 60, to: null, rate: 20 },
          ]
        },
        eligibleJobs: 'All projects Mason sells/oversees',
        split: '100% to Mason',
        payoutTiming: 'Every 2 weeks on payroll cycle',
        notes: 'Uses gross profit after all actual costs are posted.'
      },
      {
        id: 'cs-1-2',
        name: 'Self-Generated Lead Bonus',
        trigger: 'on_close',
        basis: 'final',
        calcType: 'Percent of Revenue',
        formulaDetails: { rate: 2.5 },
        eligibleJobs: 'Jobs where the closed lead source is flagged as “self-gen”',
        split: '100% to Mason',
        payoutTiming: 'Same 2-week payroll cycle',
        notes: 'Requires lead source = self-generated in project data.'
      },
      {
        id: 'cs-1-3',
        name: 'Upsell Commission',
        trigger: 'on_close of upsold item',
        basis: 'final revenue',
        calcType: 'Percent of Revenue',
        formulaDetails: { rate: 7 },
        eligibleJobs: 'Any upsold items. Rate is split if another employee is involved.',
        split: '7% Solo / 3.5% Split',
        payoutTiming: 'Paid with the job’s commission cycle',
        notes: 'System automatically splits to 3.5% if Malakai has an upsell on the same Job ID.'
      }
    ]
  },
  {
    id: 'emp-2',
    name: 'Malakai',
    roles: 'Project Manager',
    employeeId: '1432',
    clawback: { allowNegativeDeltas: true, maxAgeDays: 90 },
    commissionStructures: [
       {
        id: 'cs-2-1',
        name: 'Base GP Tier',
        trigger: 'on_close (project completed)',
        basis: 'final (uses final gross profit %)',
        calcType: 'Tiered GP',
        formulaDetails: {
          tiers: [
            { from: 0, to: 49.99, rate: 0 },
            { from: 50, to: 54.99, rate: 3 },
            { from: 55, to: null, rate: 5 },
          ]
        },
        eligibleJobs: 'All projects Malakai manages',
        split: '100% to Malakai (except where upsell rules apply)',
        payoutTiming: 'Every 2 weeks on payroll cycle',
        notes: 'Works alongside monthly salary.'
      },
       {
        id: 'cs-2-3',
        name: 'Upsell Commission',
        trigger: 'on_close of upsold item',
        basis: 'final revenue',
        calcType: 'Percent of Revenue',
        formulaDetails: { rate: 7 },
        eligibleJobs: 'Any upsold items. Rate is split if another employee is involved.',
        split: '7% Solo / 3.5% Split',
        payoutTiming: 'Paid with the job’s commission cycle',
        notes: 'System automatically splits to 3.5% if Mason has an upsell on the same Job ID.'
      },
      {
        id: 'cs-2-4',
        name: 'Self-Generated Lead Bonus',
        trigger: 'on_close',
        basis: 'final',
        calcType: 'Percent of Revenue',
        formulaDetails: { rate: 5 },
        eligibleJobs: 'Projects where the lead source is flagged “self-gen” for Malakai',
        split: '100% to Malakai',
        payoutTiming: 'Every 2 weeks on payroll cycle',
        notes: 'Must be confirmed as PM-sourced lead.'
      }
    ]
  }
];

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        return defaultValue;
    }
};

// Main App Component
const App: React.FC = () => {
  const [view, setView] = useState<View>('data_entry');
  
  const [employees, setEmployees] = useState<Employee[]>(() => getFromLocalStorage('commission_employees', initialEmployees));
  const [records, setRecords] = useState<CommissionRecord[]>(() => getFromLocalStorage('commission_records', []));
  const [pendingGPRecords, setPendingGPRecords] = useState<PendingGPRecord[]>(() => getFromLocalStorage('commission_pending_gp', []));
  
  useEffect(() => {
    localStorage.setItem('commission_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('commission_records', JSON.stringify(records));
  }, [records]);
  
  useEffect(() => {
    localStorage.setItem('commission_pending_gp', JSON.stringify(pendingGPRecords));
  }, [pendingGPRecords]);

  const handleUpdateEmployees = useCallback((updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
  }, []);

  const renderView = () => {
    switch(view) {
      case 'data_entry':
        return <DataEntry employees={employees} records={records} setRecords={setRecords} />;
      case 'admin_report':
        return <AdminReport records={records} setRecords={setRecords} />;
      case 'structure_builder':
        return <StructureBuilder employees={employees} onUpdateEmployees={handleUpdateEmployees} />;
      case 'log_sale':
        return <LogSale employees={employees} setPendingGPRecords={setPendingGPRecords} />;
      case 'finalize_gp':
        return <FinalizeGP 
                    employees={employees}
                    pendingGPRecords={pendingGPRecords}
                    setPendingGPRecords={setPendingGPRecords}
                    setRecords={setRecords}
                />;
      default:
        return <DataEntry employees={employees} records={records} setRecords={setRecords} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header currentView={view} setView={setView} />
      <main className="container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
