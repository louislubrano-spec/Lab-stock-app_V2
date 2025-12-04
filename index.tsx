import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Save, ArrowLeft, Upload, Download, ClipboardList, User, Calendar, Hash, FileSpreadsheet, Trash2, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarcodeScanner } from './BarcodeScanner';

// --- Types ---

type MovementType = 'IN' | 'OUT' | 'INVENTORY';

interface StockRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  reference: string;
  quantity: number;
  comment: string;
  user: string;
  type: MovementType;
}

// --- Excel Service ---

const exportToExcel = (inList: StockRecord[], outList: StockRecord[], invList: StockRecord[]) => {
  const wb = XLSX.utils.book_new();

  const createSheetData = (records: StockRecord[], type: MovementType) => {
    // Requirements: Rows 1-6 (indices 0-5) are headers/padding. Data starts Row 7 (index 6).
    // We will place a header row at Row 6 (index 5) for readability.
    
    const data: any[][] = [];
    
    // Rows 1-5 (Indices 0-4): Title/Metadata info
    data.push([`Stock Export - ${type}`]); // Row 1
    data.push([`Generated: ${new Date().toLocaleString()}`]); // Row 2
    data.push([]); // Row 3
    data.push([]); // Row 4
    data.push([]); // Row 5

    // Row 6 (Index 5): Headers
    if (type === 'INVENTORY') {
      data.push(['Date', 'Reference', 'Counted Qty', 'Comment']);
    } else {
      data.push(['Date', 'Reference', 'Quantity', 'Comment', 'User']);
    }

    // Row 7+ (Index 6+): Data
    records.forEach(r => {
      if (type === 'INVENTORY') {
        // Inventory Columns: Date(0), Ref(1), Qty(2), Comment(3)
        data.push([r.date, r.reference, r.quantity, r.comment || '']);
      } else {
        // IN/OUT Columns: Date(0), Ref(1), Qty(2), Comment(3), User(4)
        data.push([r.date, r.reference, r.quantity, r.comment || '', r.user]);
      }
    });

    return data;
  };

  const inData = createSheetData(inList, 'IN');
  const outData = createSheetData(outList, 'OUT');
  const invData = createSheetData(invList, 'INVENTORY');

  // Create sheets
  const wsIn = XLSX.utils.aoa_to_sheet(inData);
  const wsOut = XLSX.utils.aoa_to_sheet(outData);
  const wsInv = XLSX.utils.aoa_to_sheet(invData);

  // Append sheets with strict names
  XLSX.utils.book_append_sheet(wb, wsIn, "ITEM_IN");
  XLSX.utils.book_append_sheet(wb, wsOut, "ITEM_OUT");
  XLSX.utils.book_append_sheet(wb, wsInv, "INVENTORY");

  // Generate filename
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  XLSX.writeFile(wb, `Stock_Movements_${dateStr}.xlsx`);
};

// --- Components ---

// 1. Home Screen
const HomeScreen = ({ 
  user, 
  setUser, 
  onNavigate 
}: { 
  user: string; 
  setUser: (u: string) => void; 
  onNavigate: (screen: string) => void;
}) => {
  const [userInput, setUserInput] = useState(user);

  const handleSetUser = () => {
    if (userInput.trim()) setUser(userInput.trim());
  };

  const handleLogout = () => {
    setUser('');
    setUserInput('');
  };

  const attemptNavigate = (screen: string) => {
    if (!user) {
      alert("Please select a user before recording movements.");
      return;
    }
    onNavigate(screen);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Stock Manager</h1>
          <p className="text-gray-500">Laboratory Stock Tracking</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
            <User className="w-5 h-5" />
            Current User
          </h2>
          
          {user ? (
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 text-lg">{user}</span>
              <button 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                onClick={handleSetUser}
                disabled={!userInput.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                Set
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => attemptNavigate('IN')}
            className="flex items-center p-5 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-8 h-8 mr-4" />
            <div className="text-left">
              <div className="font-bold text-xl">IN Movement</div>
              <div className="text-green-100 text-sm">Record stock entry</div>
            </div>
          </button>

          <button 
             onClick={() => attemptNavigate('OUT')}
             className="flex items-center p-5 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition-colors"
          >
            <Upload className="w-8 h-8 mr-4" />
            <div className="text-left">
              <div className="font-bold text-xl">OUT Movement</div>
              <div className="text-orange-100 text-sm">Record stock withdrawal</div>
            </div>
          </button>

          <button 
             onClick={() => attemptNavigate('INV')}
             className="flex items-center p-5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors"
          >
            <ClipboardList className="w-8 h-8 mr-4" />
            <div className="text-left">
              <div className="font-bold text-xl">Inventory</div>
              <div className="text-blue-100 text-sm">Count stock items</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigate('LIST')}
             className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-xl border-2 border-dashed border-gray-300 hover:bg-gray-200 transition-colors mt-4"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            View Lists & Export
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Generic Movement Form
const MovementForm = ({ 
  type, 
  defaultUser, 
  onSave, 
  onBack,
  onViewList
}: { 
  type: MovementType; 
  defaultUser: string; 
  onSave: (record: StockRecord) => void; 
  onBack: () => void;
  onViewList: () => void;
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [qty, setQty] = useState('');
  const [comment, setComment] = useState('');
  const [user, setUser] = useState(defaultUser);
  const [isScanning, setIsScanning] = useState(false);

  // Focus quantity input ref
  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  const handleScanDetected = (code: string) => {
    setReference(code);
    setIsScanning(false);
    // Beep or visual feedback could be added here
    // Focus quantity field next for speed
    setTimeout(() => {
        qtyInputRef.current?.focus();
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference) {
      alert("Item number cannot be empty.");
      return;
    }
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) {
      alert("Please enter a valid positive quantity.");
      return;
    }
    if (!user && type !== 'INVENTORY') {
      alert("User is required.");
      return;
    }

    onSave({
      id: Date.now().toString(),
      date,
      reference,
      quantity: q,
      comment,
      user,
      type
    });

    // Reset form for next entry
    setReference('');
    setQty('');
    setComment('');
    // Keep user and date
  };

  return (
    <>
      {isScanning && (
        <BarcodeScanner 
          onDetected={handleScanDetected} 
          onCancel={() => setIsScanning(false)} 
        />
      )}
      
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm sticky top-0 z-10">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg text-gray-800">
            {type === 'IN' ? 'IN Movement' : type === 'OUT' ? 'OUT Movement' : 'Inventory'}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
            
            {/* Date */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="flex-1 font-medium text-gray-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Reference */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase">Item Reference</label>
              </div>
              
              <div className="flex gap-2">
                 <div className="flex-1 flex items-center gap-2 border-b pb-2 border-gray-200 focus-within:border-blue-500">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={reference} 
                      onChange={e => setReference(e.target.value)}
                      placeholder="Enter ID"
                      className="flex-1 text-lg font-medium bg-transparent focus:outline-none placeholder-gray-300"
                    />
                 </div>
                 
                 <button 
                   type="button"
                   onClick={() => setIsScanning(true)}
                   className="flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                   title="Scan Barcode"
                 >
                   <Camera className="w-6 h-6" />
                 </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</label>
               <input 
                  ref={qtyInputRef}
                  type="number" 
                  value={qty} 
                  onChange={e => setQty(e.target.value)}
                  placeholder="0"
                  className="w-full text-3xl font-bold text-gray-800 focus:outline-none placeholder-gray-200"
               />
            </div>

            {/* Comment */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Comment (Optional)</label>
               <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={2}
                  className="w-full text-gray-700 focus:outline-none resize-none"
                  placeholder="Add notes..."
               />
            </div>

            {/* User Override */}
            {type !== 'INVENTORY' && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Operator</label>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={user} 
                    onChange={e => setUser(e.target.value)}
                    className="flex-1 font-medium text-gray-800 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <button 
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 ${
                type === 'IN' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                type === 'OUT' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Add {type === 'INVENTORY' ? 'Inventory Line' : 'Movement'}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={onViewList}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 underline"
              >
                View Pending List
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

// 3. Lists & Export Screen
const ListScreen = ({ 
  movements, 
  onDelete, 
  onBack 
}: { 
  movements: StockRecord[]; 
  onDelete: (id: string) => void; 
  onBack: () => void; 
}) => {
  const [activeTab, setActiveTab] = useState<MovementType>('IN');

  const filtered = movements.filter(m => m.type === activeTab);

  const handleExport = () => {
    if (movements.length === 0) {
      alert("No data to export.");
      return;
    }
    const inList = movements.filter(m => m.type === 'IN');
    const outList = movements.filter(m => m.type === 'OUT');
    const invList = movements.filter(m => m.type === 'INVENTORY');
    exportToExcel(inList, outList, invList);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
       <div className="bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-800">Pending Exports</h1>
        <button 
          onClick={handleExport}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
          title="Export to Excel"
        >
          <Save className="w-6 h-6" />
        </button>
      </div>

      <div className="flex border-b bg-white">
        {(['IN', 'OUT', 'INVENTORY'] as MovementType[]).map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`flex-1 py-3 text-sm font-bold border-b-2 ${
               activeTab === tab 
               ? 'border-blue-600 text-blue-600' 
               : 'border-transparent text-gray-400 hover:text-gray-600'
             }`}
           >
             {tab}
           </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
         {filtered.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 mt-20">
             <ClipboardList className="w-16 h-16 opacity-20" />
             <p>No {activeTab} records yet.</p>
           </div>
         ) : (
           <div className="space-y-3">
             {filtered.map(item => (
               <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-baseline gap-2">
                       <span className="font-bold text-lg text-gray-800">{item.reference}</span>
                       <span className="text-sm font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">Qty: {item.quantity}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.date} • {item.user || 'No User'}
                    </div>
                    {item.comment && (
                      <div className="text-sm text-gray-400 italic mt-1">
                        "{item.comment}"
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
             ))}
           </div>
         )}
      </div>

      <div className="p-4 bg-white border-t">
        <button 
          onClick={handleExport}
          disabled={movements.length === 0}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export to Excel
        </button>
      </div>
    </div>
  );
};

// --- Main App Container ---

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [user, setUser] = useState('');
  const [movements, setMovements] = useState<StockRecord[]>([]);

  // Simple Router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen user={user} setUser={setUser} onNavigate={setCurrentScreen} />;
      case 'IN':
        return <MovementForm 
                  type="IN" 
                  defaultUser={user} 
                  onSave={(m) => {
                    setMovements([...movements, m]);
                    alert("Movement saved!");
                  }}
                  onBack={() => setCurrentScreen('HOME')}
                  onViewList={() => setCurrentScreen('LIST')}
               />;
      case 'OUT':
        return <MovementForm 
                  type="OUT" 
                  defaultUser={user} 
                  onSave={(m) => {
                     setMovements([...movements, m]);
                     alert("Movement saved!");
                  }}
                  onBack={() => setCurrentScreen('HOME')}
                  onViewList={() => setCurrentScreen('LIST')}
               />;
      case 'INV':
        return <MovementForm 
                  type="INVENTORY" 
                  defaultUser={user} 
                  onSave={(m) => {
                     setMovements([...movements, m]);
                     alert("Inventory line saved!");
                  }}
                  onBack={() => setCurrentScreen('HOME')}
                  onViewList={() => setCurrentScreen('LIST')}
               />;
      case 'LIST':
        return <ListScreen 
                  movements={movements} 
                  onDelete={(id) => setMovements(movements.filter(m => m.id !== id))}
                  onBack={() => setCurrentScreen('HOME')}
               />;
      default:
        return <HomeScreen user={user} setUser={setUser} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);