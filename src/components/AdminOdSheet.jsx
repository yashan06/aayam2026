import React, { useState, useEffect, useRef } from 'react';

const LOGO_KU = '/karnavati_logo.png';
const LOGO_UIT = '/uit_logo.png';
const LOGO_AY = '/aayam_logo.png';

const CATS = [
  "Management",
  "Media",
  "Technical",
  "Creatives",
  "Sports",
  "Cultural",
  "Communication",
  "Hospitality",
  "Decor",
  "Promotion",
  "Other (Editable)"
];

const DEFAULT_MASTER = [
  { name: "YASHAN OSWAL", qid: "KU2407U448", sem: 5, cls: "B.TECH CYBER" },
  { name: "Manush Patel", qid: "KU2407U425", sem: 5, cls: "Cyber- 5th" },
  { name: "Parth Patel", qid: "KU2407U644", sem: 5, cls: "Cyber- 5th" },
  { name: "Het Thaker", qid: "KU2507U0139", sem: 3, cls: "DS HONS- 3rd" },
  { name: "Suhani Killa", qid: "KU2407U382", sem: 5, cls: "AIML-C/5th" },
  { name: "Devam Patel", qid: "KU2507U0484", sem: 3, cls: "AI-ML (B)- 3rd" },
  { name: "Shaan Patel", qid: "KU2507U0584", sem: 3, cls: "AI-ML (B)- 3rd" },
  { name: "Param Patel", qid: "KU2507U0678", sem: 3, cls: "CSE A- 3rd" },
  { name: "Brij Dalsaniya", qid: "2000016522", sem: 3, cls: "CSE- DS- 3rd" },
  { name: "Chirag Odedara", qid: "KU2507U0329", sem: 3, cls: "CSE- DS- 3rd" },
  { name: "Dhvanit Dave", qid: "KU202604183", sem: 1, cls: "Gen-AI (B)- 1st" },
  { name: "Meet Padaspagar", qid: "2000017269", sem: 1, cls: "CSE CORE-C- 1st" },
  { name: "Shivam Thakkar", qid: "KU202606448", sem: 1, cls: "BTech Mechanical- 1st" },
  { name: "Rishampreet Kaur", qid: "KU202603552", sem: 1, cls: "CSE-DS- 1st" },
  { name: "Aeshna Jain", qid: "KU202607569", sem: 1, cls: "CSE A- 1st" },
  { name: "Ayush Vankar", qid: "2000017101", sem: 1, cls: "ECE B- 1st" },
  { name: "Satvik Joshi", qid: "KU2407U439", sem: 5, cls: "Cyber- 5th" },
  { name: "Shashank Kumar", qid: "KU2407U370", sem: 5, cls: "Ai-ML C / 5th" },
  { name: "Dev Suthar", qid: "KU2507U0804", sem: 3, cls: "AI-ML C / 3rd" },
  { name: "Aeshva Rao", qid: "KU2507U0801", sem: 3, cls: "AI-ML C / 3rd" },
  { name: "Diya Makwana", qid: "KU202608436", sem: 1, cls: "CSE DS(H.)" },
  { name: "Labdhi Jain", qid: "KU202607850", sem: 1, cls: "Cse-(Gen-AI)- 1st" },
  { name: "Deval Patoriya", qid: "KU2507U0237", sem: 3, cls: "CSE -cloud-3rd" },
  { name: "Jinesh Soni", qid: "KU2507U0241", sem: 3, cls: "CSE-CLOUD-3rd" },
  { name: "Jiya Rawal", qid: "KU202604351", sem: 1, cls: "CSE hons cloud 1st" },
  { name: "Varsha Sharma", qid: "KU2507U0383", sem: 3, cls: "3RD CSE DS HONS" },
  { name: "Kavaiya Het", qid: "KU2507U0502", sem: 3, cls: "CSE - B / 3 SEM" },
  { name: "Jiya Dudani", qid: "KU2407U400", sem: 5, cls: "Cyber- 5th" },
  { name: "Saagar", qid: "KU2507U0400", sem: 3, cls: "Gen ai b" },
  { name: "Himani Raveshiya", qid: "KU2507U0701", sem: 3, cls: "CSE DS - 3rd" },
  { name: "Jainil Kansara", qid: "KU2507U0757", sem: 3, cls: "CSE - CYBER - 3rd" },
  { name: "Vaishnavi Patel", qid: "KU2507U0104", sem: 3, cls: "CSE-DS-HONS-3rd" },
  { name: "Man Jetani", qid: "KU2507U0546", sem: 3, cls: "CSE-B 3rd" },
  { name: "Jay Patel", qid: "ACPCB2026477", sem: 1, cls: "ECE-B 1st" },
  { name: "Dasadiya Rudra", qid: "KU202604813", sem: 1, cls: "GEN AI -A" },
  { name: "Brinda", qid: "KU2507U0680", sem: 3, cls: "CSE-A 3rd" },
  { name: "Deev Dosi", qid: "KU2507U0044", sem: 3, cls: "CSE-Cyber" },
  { name: "Avika Hingad", qid: "KU202607918", sem: 1, cls: "CYBER 1st" },
  { name: "Shivangi Tiwari", qid: "2000016300", sem: 1, cls: "CSE B Core-1st" },
  { name: "Mahim Barot", qid: "KU2507U0504", sem: 3, cls: "3-CSE-A" },
  { name: "Dhvanit Sachdev", qid: "KU2507U0673", sem: 3, cls: "3 CSE A" },
  { name: "Muskan Sharma", qid: "KU2507U0270", sem: 3, cls: "3 CS DS" },
  { name: "Priyank Darji", qid: "KU2407U966", sem: 5, cls: "cse aiml D-5th sem" },
  { name: "Jiya Shah", qid: "KU2507U0642", sem: 3, cls: "3 CSE A" },
  { name: "Kathan Shah", qid: "KU2407U311", sem: 5, cls: "BTECH AIML A" },
  { name: "Gohel Bhavya", qid: "KU2507U0557", sem: 3, cls: "Cse B" },
  { name: "Shah Keval DevendraKumar", qid: "ACPCD2026168", sem: 3, cls: "CSE-AIML-C" },
  { name: "Agamudaliyar Kiran karnan", qid: "2000016794", sem: 1, cls: "B.tech hons cloud" },
  { name: "VINEET SHIINDE", qid: "KU2407U447", sem: 5, cls: "CYBER" },
  { name: "Aman Chordia", qid: "KU2407U501", sem: 5, cls: "CSE-CYBER" },
  { name: "Harshika Goyal", qid: "KU2407U287", sem: 5, cls: "Aiml-B" },
  { name: "Paree Mistry", qid: "KU2507U0143", sem: 3, cls: "CSE DS Hons" },
  { name: "Dharmangi Shah", qid: "KU2507U0310", sem: 3, cls: "DA-A" },
  { name: "Mantra Shah", qid: "KU2507U0341", sem: 3, cls: "Gen-AI(A)" },
  { name: "Darshil Bharucha", qid: "ACPCB2026637", sem: 1, cls: "CSE AIML B" },
  { name: "Ayush Rupawala", qid: "KU202609112", sem: 1, cls: "ECE-A" },
  { name: "Dhanvi Virani", qid: "KU2507U0223", sem: 3, cls: "CSE DS Hons" },
  { name: "Jeel Patel", qid: "KU2507U0177", sem: 3, cls: "CSE-DS (Hons)" },
  { name: "Henil Goswami", qid: "KU2407U290", sem: 5, cls: "AIML - A" },
  { name: "Shrida Patel", qid: "KU2407U911", sem: 5, cls: "AIML-D" },
  { name: "Diya Patel", qid: "KU2407U933", sem: 5, cls: "AIML-D" }
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const formatDate = (val) => {
  if (!val) return '—';
  const parts = val.split('-');
  if (parts.length !== 3) return val;
  const [y, m, d] = parts;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[parseInt(m, 10) - 1] || m;
  return `${d}-${mon}-${y}`;
};

export default function AdminOdSheet() {
  const [subTab, setSubTab] = useState('create'); // 'create' | 'master'

  // Event Details
  const [eventDetails, setEventDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('aayam.od.event.v1');
      return saved ? JSON.parse(saved) : { name: '', date: '', time: '', venue: '' };
    } catch (e) {
      return { name: '', date: '', time: '', venue: '' };
    }
  });

  // Master Volunteers
  const [masterVolunteers, setMasterVolunteers] = useState(() => {
    try {
      const saved = localStorage.getItem('aayam.od.master.v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
      return DEFAULT_MASTER;
    } catch (e) {
      return DEFAULT_MASTER;
    }
  });

  // Active OD List
  const [odList, setOdList] = useState(() => {
    try {
      const saved = localStorage.getItem('aayam.od.list.v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Search & Picker State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [dropdownMatches, setDropdownMatches] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Bulk Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState(CATS[0]);
  const [bulkCustomCategory, setBulkCustomCategory] = useState('');
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkSem, setBulkSem] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  const [selectedBulkQids, setSelectedBulkQids] = useState(new Set());

  // Add / Edit Volunteer Modal (in Master list)
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [editingQid, setEditingQid] = useState(null);
  const [volunteerForm, setVolunteerForm] = useState({ name: '', qid: '', sem: 1, cls: '' });
  const [volunteerFormErr, setVolunteerFormErr] = useState('');

  // Master List Filters
  const [masterSearch, setMasterSearch] = useState('');
  const [masterSemFilter, setMasterSemFilter] = useState('');
  const [masterClassFilter, setMasterClassFilter] = useState('');

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState({ text: '', type: 'info', visible: false });

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type, visible: true });
    setTimeout(() => {
      setToastMessage(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  // Save Event Details
  const handleEventChange = (field, value) => {
    const updated = { ...eventDetails, [field]: value };
    setEventDetails(updated);
    try {
      localStorage.setItem('aayam.od.event.v1', JSON.stringify(updated));
    } catch (e) {}
  };

  // Sort OD List Helper
  const sortOdList = (listToSort) => {
    return [...listToSort].sort((a, b) => {
      const ca = (a.cat || "").trim();
      const cb = (b.cat || "").trim();
      const ia = CATS.indexOf(ca);
      const ib = CATS.indexOf(cb);
      const orderA = ia !== -1 ? ia : 999;
      const orderB = ib !== -1 ? ib : 999;
      if (orderA !== orderB) return orderA - orderB;
      if (ca.toLowerCase() !== cb.toLowerCase()) return ca.localeCompare(cb);
      return (a.name || "").localeCompare(b.name || "");
    });
  };

  // Save OD List
  const updateAndSaveOdList = (newList) => {
    const sorted = sortOdList(newList);
    setOdList(sorted);
    try {
      localStorage.setItem('aayam.od.list.v2', JSON.stringify(sorted));
    } catch (e) {}
  };

  // Save Master List
  const updateAndSaveMaster = (newMaster) => {
    setMasterVolunteers(newMaster);
    try {
      localStorage.setItem('aayam.od.master.v3', JSON.stringify(newMaster));
    } catch (e) {}
  };

  // Autocomplete Search
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setDropdownMatches([]);
      setIsDropdownOpen(false);
      return;
    }
    const usedQids = new Set(odList.map(v => v.qid.toLowerCase()));
    const matches = masterVolunteers
      .filter(v => !usedQids.has(v.qid.toLowerCase()) && (v.name.toLowerCase().includes(q) || v.qid.toLowerCase().includes(q)))
      .slice(0, 8);
    setDropdownMatches(matches);
    setHighlightedIndex(matches.length > 0 ? 0 : -1);
    setIsDropdownOpen(true);
  }, [searchQuery, masterVolunteers, odList]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addVolunteerFromPicker = (vol) => {
    if (!vol) return;
    const cat = selectedCategory === "Other (Editable)"
      ? (customCategory.trim() || "Other")
      : selectedCategory;
    const updated = [...odList, { ...vol, cat }];
    updateAndSaveOdList(updated);
    setSearchQuery('');
    setIsDropdownOpen(false);
    showToast(`Added ${vol.name} to OD Sheet!`, 'success');
  };

  const removeVolunteerFromList = (index) => {
    const removed = odList[index];
    const updated = odList.filter((_, i) => i !== index);
    updateAndSaveOdList(updated);
    showToast(`Removed ${removed.name}.`, 'warning');
  };

  const changeCategory = (index, newCat) => {
    let finalCat = newCat;
    if (newCat === "Other (Editable)") {
      const custom = window.prompt("Enter custom work category for " + odList[index].name + ":", odList[index].cat || "");
      if (custom && custom.trim()) {
        finalCat = custom.trim();
      } else {
        return;
      }
    }
    const updated = [...odList];
    updated[index] = { ...updated[index], cat: finalCat };
    updateAndSaveOdList(updated);
  };

  const editCustomCategory = (index) => {
    const custom = window.prompt("Edit work category for " + odList[index].name + ":", odList[index].cat || "");
    if (custom && custom.trim()) {
      const updated = [...odList];
      updated[index] = { ...updated[index], cat: custom.trim() };
      updateAndSaveOdList(updated);
      showToast(`Updated category for ${odList[index].name}.`, 'info');
    }
  };

  const clearOdList = () => {
    if (!odList.length) {
      showToast("The OD list is already empty.", 'warning');
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Clear OD List",
      message: "Are you sure you want to remove all students from this OD sheet?",
      onConfirm: () => {
        updateAndSaveOdList([]);
        showToast("OD list cleared.", 'warning');
      }
    });
  };

  // Bulk Modal Actions
  const openBulkModalHandler = () => {
    setSelectedBulkQids(new Set());
    setBulkCategory(selectedCategory || CATS[0]);
    setBulkCustomCategory(customCategory || '');
    setBulkSearch('');
    setBulkSem('');
    setBulkClass('');
    setShowBulkModal(true);
  };

  const filteredBulkList = masterVolunteers.filter(v => {
    const inList = odList.some(l => l.qid.toLowerCase() === v.qid.toLowerCase());
    if (inList) return false;
    if (bulkSem && String(v.sem) !== String(bulkSem)) return false;
    if (bulkClass && v.cls !== bulkClass) return false;
    if (bulkSearch) {
      const txt = (v.name + " " + v.qid + " " + v.cls).toLowerCase();
      if (!txt.includes(bulkSearch.toLowerCase())) return false;
    }
    return true;
  });

  const toggleBulkSelectAll = (checked) => {
    const updated = new Set(selectedBulkQids);
    filteredBulkList.forEach(v => {
      if (checked) updated.add(v.qid.toLowerCase());
      else updated.delete(v.qid.toLowerCase());
    });
    setSelectedBulkQids(updated);
  };

  const toggleBulkSelectOne = (qid) => {
    const updated = new Set(selectedBulkQids);
    const q = qid.toLowerCase();
    if (updated.has(q)) updated.delete(q);
    else updated.add(q);
    setSelectedBulkQids(updated);
  };

  const handleAddBulkSelected = () => {
    if (!selectedBulkQids.size) return;
    const cat = bulkCategory === "Other (Editable)"
      ? (bulkCustomCategory.trim() || "Other")
      : bulkCategory;
    const newItems = [];
    selectedBulkQids.forEach(qLower => {
      const vol = masterVolunteers.find(v => v.qid.toLowerCase() === qLower);
      if (vol && !odList.some(l => l.qid.toLowerCase() === qLower)) {
        newItems.push({ ...vol, cat });
      }
    });
    const updated = [...odList, ...newItems];
    updateAndSaveOdList(updated);
    setShowBulkModal(false);
    showToast(`Added ${newItems.length} students as ${cat}!`, 'success');
  };

  // Master List Actions
  const openAddVolunteerModal = () => {
    setEditingQid(null);
    setVolunteerForm({ name: '', qid: '', sem: 1, cls: '' });
    setVolunteerFormErr('');
    setShowVolunteerModal(true);
  };

  const openEditVolunteerModal = (vol) => {
    setEditingQid(vol.qid);
    setVolunteerForm({ name: vol.name, qid: vol.qid, sem: vol.sem, cls: vol.cls });
    setVolunteerFormErr('');
    setShowVolunteerModal(true);
  };

  const handleSaveVolunteer = (e) => {
    e.preventDefault();
    const name = volunteerForm.name.trim();
    const qid = volunteerForm.qid.trim();
    const cls = volunteerForm.cls.trim();
    const sem = parseInt(volunteerForm.sem, 10);
    if (!name || !qid || !cls) {
      setVolunteerFormErr("Name, KU ID, and Class are required.");
      return;
    }
    const duplicate = masterVolunteers.some(
      v => v.qid.toLowerCase() === qid.toLowerCase() && (!editingQid || v.qid.toLowerCase() !== editingQid.toLowerCase())
    );
    if (duplicate) {
      setVolunteerFormErr(`KU ID ${qid} already exists in master database.`);
      return;
    }
    const rec = { name, qid, sem, cls };
    if (editingQid) {
      const updatedMaster = masterVolunteers.map(v => v.qid.toLowerCase() === editingQid.toLowerCase() ? rec : v);
      updateAndSaveMaster(updatedMaster);
      // update in active list if present
      const updatedList = odList.map(l => l.qid.toLowerCase() === editingQid.toLowerCase() ? { ...l, ...rec } : l);
      updateAndSaveOdList(updatedList);
      showToast("Volunteer updated.", 'success');
    } else {
      updateAndSaveMaster([...masterVolunteers, rec]);
      showToast("Volunteer added to master list.", 'success');
    }
    setShowVolunteerModal(false);
  };

  const handleDeleteVolunteer = (vol) => {
    setConfirmDialog({
      open: true,
      title: "Delete Volunteer",
      message: `Delete ${vol.name} (${vol.qid}) from Master Database?`,
      onConfirm: () => {
        const updated = masterVolunteers.filter(v => v.qid.toLowerCase() !== vol.qid.toLowerCase());
        updateAndSaveMaster(updated);
        showToast("Volunteer deleted.", 'warning');
      }
    });
  };

  // CSV Export & Import
  const downloadCsv = (filename, content) => {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleExportCsv = () => {
    const header = "Name,QID,Semester,Class\r\n";
    const rows = masterVolunteers.map(v => `"${v.name.replace(/"/g, '""')}","${v.qid.replace(/"/g, '""')}",${v.sem},"${v.cls.replace(/"/g, '""')}"`).join("\r\n");
    downloadCsv(`aayam_master_volunteers_${new Date().toISOString().slice(0, 10)}.csv`, header + rows);
    showToast("Master volunteers exported to CSV.", 'success');
  };

  const handleDownloadTemplate = () => {
    const template = "Name,QID,Semester,Class\r\nAsha Patel,KU2507U0001,3,CSE-A\r\nRahul Sharma,KU2507U0002,5,CSE-CYBER\r\n";
    downloadCsv("aayam_volunteers_template.csv", template);
    showToast("CSV Template downloaded.", 'info');
  };

  const handleImportCsv = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result).replace(/^\uFEFF/, "");
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) throw new Error("CSV file is empty or missing data rows.");
        const header = lines[0].toLowerCase().split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (header.join(',') !== "name,qid,semester,class") {
          throw new Error("Header must be: Name,QID,Semester,Class");
        }
        let added = 0;
        let skipped = 0;
        const currentQids = new Set(masterVolunteers.map(v => v.qid.toLowerCase()));
        const newVolunteers = [...masterVolunteers];

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 4) {
            const [name, qid, semStr, cls] = parts;
            const sem = parseInt(semStr.replace(/\D/g, ''), 10);
            if (name && qid && cls && sem >= 1 && sem <= 8 && !currentQids.has(qid.toLowerCase())) {
              newVolunteers.push({ name, qid, sem, cls });
              currentQids.add(qid.toLowerCase());
              added++;
            } else {
              skipped++;
            }
          }
        }
        updateAndSaveMaster(newVolunteers);
        showToast(`Imported ${added} volunteers (${skipped} skipped/duplicates).`, added > 0 ? 'success' : 'warning');
      } catch (err) {
        showToast("Import failed: " + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Master Filter Options
  const masterClasses = [...new Set(masterVolunteers.map(v => v.cls))].sort();
  const filteredMaster = masterVolunteers.filter(v => {
    if (masterSemFilter && String(v.sem) !== String(masterSemFilter)) return false;
    if (masterClassFilter && v.cls !== masterClassFilter) return false;
    if (masterSearch) {
      const q = masterSearch.toLowerCase();
      if (!(v.name + " " + v.qid + " " + v.cls).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Handle Print Action
  const handlePrint = () => {
    if (!odList.length) {
      showToast("Warning: Printing an empty list.", 'warning');
    }
    showToast("Opening Print / PDF dialog...", 'info');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="admin-od-sheet-wrapper" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* SCOPED PRINT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #od-sheet-print-area, #od-sheet-print-area * {
            visibility: visible !important;
          }
          #od-sheet-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 10mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .noprint, .admin-header, .navbar, footer, .stats-grid-admin {
            display: none !important;
          }
        }
        .od-sheet-table th, .od-sheet-table td {
          border: 1px solid #000;
          padding: 5px 8px;
          font-size: 11px;
        }
        .od-sheet-table th {
          background: #eadfd0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-weight: 700;
        }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toastMessage.visible && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          background: toastMessage.type === 'error' ? '#dc2626' : toastMessage.type === 'warning' ? '#d97706' : '#0f1b3c',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <span>{toastMessage.type === 'error' ? '❌' : toastMessage.type === 'warning' ? '⚠️' : '✨'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="noprint" style={{
        background: 'linear-gradient(135deg, #1c1815 0%, #2b221a 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '18px',
        marginBottom: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold-pale, #e8a93a)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            ACADEMIC ON-DUTY SYSTEM
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: '#ffffff' }}>
            AAYAM OD Attendance Sheet Generator
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
            UIT Students Committee · Karnavati University · Official Academic On-Duty Attendance Generator
          </p>
        </div>

        {/* SUBTABS */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '30px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setSubTab('create')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              background: subTab === 'create' ? '#ffffff' : 'transparent',
              color: subTab === 'create' ? 'var(--navy, #0f1b3c)' : '#ffffff',
              boxShadow: subTab === 'create' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            📋 Create OD Sheet ({odList.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('master')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              background: subTab === 'master' ? '#ffffff' : 'transparent',
              color: subTab === 'master' ? 'var(--navy, #0f1b3c)' : '#ffffff',
              boxShadow: subTab === 'master' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            👥 Master Volunteers ({masterVolunteers.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CREATE OD LIST & LIVE A4 PREVIEW */}
      {/* ======================================================== */}
      {subTab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 460px) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: CONTROLS & EVENT DETAILS */}
          <div className="noprint" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* CARD 1: EVENT DETAILS */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e8dfd1', boxShadow: '0 4px 16px rgba(15,27,60,0.04)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: 'var(--navy)', fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>
                📅 1. Event Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Event Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Tech Fest 2026 / Hackathon"
                    value={eventDetails.name}
                    onChange={(e) => handleEventChange('name', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Event Date</label>
                    <input
                      type="date"
                      value={eventDetails.date}
                      onChange={(e) => handleEventChange('date', e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Time Slot / Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM – 05:00 PM"
                      value={eventDetails.time}
                      onChange={(e) => handleEventChange('time', e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Venue / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium / Lab Complex"
                    value={eventDetails.venue}
                    onChange={(e) => handleEventChange('venue', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: ADD VOLUNTEERS */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e8dfd1', boxShadow: '0 4px 16px rgba(15,27,60,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--navy)', fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>
                  🔍 2. Add Volunteers
                </h3>
                <button
                  type="button"
                  onClick={openBulkModalHandler}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid var(--navy)',
                    background: '#f8fafc',
                    color: 'var(--navy)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  👥 Select Multiple
                </button>
              </div>

              {/* Autocomplete Input */}
              <div ref={searchContainerRef} style={{ position: 'relative', marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Search by Student Name or KU ID
                </label>
                <input
                  type="text"
                  placeholder="Type student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (dropdownMatches.length) setIsDropdownOpen(true); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsDropdownOpen(false);
                    if (!dropdownMatches.length || !isDropdownOpen) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex((highlightedIndex + 1) % dropdownMatches.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex((highlightedIndex - 1 + dropdownMatches.length) % dropdownMatches.length);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (highlightedIndex >= 0 && highlightedIndex < dropdownMatches.length) {
                        addVolunteerFromPicker(dropdownMatches[highlightedIndex]);
                      }
                    }
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />

                {/* Dropdown Results */}
                {isDropdownOpen && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    margin: '4px 0 0',
                    padding: 0,
                    listStyle: 'none',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    maxHeight: '230px',
                    overflowY: 'auto',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 50
                  }}>
                    {dropdownMatches.length > 0 ? (
                      dropdownMatches.map((v, i) => (
                        <li
                          key={v.qid}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addVolunteerFromPicker(v);
                          }}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                            background: i === highlightedIndex ? '#faf6f0' : '#ffffff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--navy)', fontSize: '13px' }}>{v.name}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{v.qid} · Sem {v.sem} · {v.cls}</div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>+ Add</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        No matching student found.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Work Category Selection */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  Assign Work Department / Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  {CATS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {selectedCategory === "Other (Editable)" && (
                  <input
                    type="text"
                    placeholder="Type custom category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ width: '100%', marginTop: '8px', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #c8922a', fontSize: '13px', outline: 'none' }}
                  />
                )}
              </div>
            </div>

            {/* CARD 3: ACTIVE OD LIST */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e8dfd1', boxShadow: '0 4px 16px rgba(15,27,60,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--navy)', fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>
                  📋 Active List ({odList.length})
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', background: '#faf6f0', padding: '3px 10px', borderRadius: '12px', border: '1px solid #e8dfd1' }}>
                  Sorted by Category
                </span>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                {odList.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 5 }}>
                      <tr style={{ borderBottom: '1.5px solid #cbd5e1' }}>
                        <th style={{ padding: '8px', width: '30px', textAlign: 'center' }}>#</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Student</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Category</th>
                        <th style={{ padding: '8px', width: '30px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {odList.map((v, i) => {
                        const isCustom = !CATS.includes(v.cat);
                        const categoryOptions = isCustom ? [v.cat, ...CATS] : CATS;
                        return (
                          <tr key={v.qid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>{i + 1}</td>
                            <td style={{ padding: '8px' }}>
                              <strong style={{ color: 'var(--navy)' }}>{v.name}</strong>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>{v.qid}</div>
                            </td>
                            <td style={{ padding: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <select
                                  value={v.cat}
                                  onChange={(e) => changeCategory(i, e.target.value)}
                                  style={{ padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                                >
                                  {categoryOptions.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => editCustomCategory(i)}
                                    title="Edit custom category"
                                    style={{ padding: '2px 5px', fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    ✎
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => removeVolunteerFromList(i)}
                                title="Remove student"
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No students added yet. Search above or click <strong>Select Multiple</strong>.
                  </div>
                )}
              </div>

              {/* BOTTOM ACTIONS */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={clearOdList}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Clear List
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--navy)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15,27,60,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🖨️ Print / Save as PDF
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE A4 PREVIEW CONTAINER */}
          <div>
            <div className="noprint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--navy)' }}>
                📄 Official A4 Print Preview
              </div>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--navy)',
                  background: '#ffffff',
                  color: 'var(--navy)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🖨️ Print Document
              </button>
            </div>

            {/* PREVIEW WRAPPER */}
            <div style={{
              background: '#e8dfd2',
              padding: '16px',
              borderRadius: '16px',
              overflowX: 'auto',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
            }}>
              {/* THE PRINTABLE SHEET */}
              <div
                id="od-sheet-print-area"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  width: '210mm',
                  minHeight: '297mm',
                  margin: '0 auto',
                  padding: '12mm',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                  boxSizing: 'border-box',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {/* SHEET HEADER */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  borderBottom: '2px solid #000000',
                  paddingBottom: '8px'
                }}>
                  {/* Left Logos: Karnavati University + UIT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '18mm' }}>
                    <div style={{ width: '46mm', height: '18mm', display: 'flex', alignItems: 'center' }}>
                      <img src={LOGO_KU} alt="Karnavati University" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ width: '1px', height: '14mm', background: '#000000', opacity: 0.35 }}></div>
                    <div style={{ width: '16mm', height: '18mm', display: 'flex', alignItems: 'center' }}>
                      <img src={LOGO_UIT} alt="UIT" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  </div>

                  {/* Center Text */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 6px' }}>
                    <b style={{ fontSize: '16px', display: 'block', textTransform: 'uppercase' }}>Karnavati University</b>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>UNITEDWORLD INSTITUTE OF TECHNOLOGY</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#222222' }}>AAYAM – UIT Students Committee</div>
                  </div>

                  {/* Right Logo: AAYAM */}
                  <div style={{ width: '22mm', height: '22mm', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <img src={LOGO_AY} alt="AAYAM" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                </div>

                {/* SHEET TITLE */}
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', margin: '10px 0', textDecoration: 'underline', letterSpacing: '0.4px' }}>
                  STUDENT ON-DUTY (OD) ATTENDANCE SHEET
                </div>

                {/* EVENT DETAILS TABLE */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '15%', padding: '4px 6px', border: '1px solid #000', fontWeight: 700, background: '#f7f2ea' }}>Event</td>
                      <td style={{ padding: '4px 6px', border: '1px solid #000' }}>{eventDetails.name || '—'}</td>
                      <td style={{ width: '15%', padding: '4px 6px', border: '1px solid #000', fontWeight: 700, background: '#f7f2ea' }}>Date</td>
                      <td style={{ width: '25%', padding: '4px 6px', border: '1px solid #000' }}>{formatDate(eventDetails.date)}</td>
                    </tr>
                    <tr>
                      <td style={{ width: '15%', padding: '4px 6px', border: '1px solid #000', fontWeight: 700, background: '#f7f2ea' }}>Time</td>
                      <td style={{ padding: '4px 6px', border: '1px solid #000' }}>{eventDetails.time || '—'}</td>
                      <td style={{ width: '15%', padding: '4px 6px', border: '1px solid #000', fontWeight: 700, background: '#f7f2ea' }}>Venue</td>
                      <td style={{ width: '25%', padding: '4px 6px', border: '1px solid #000' }}>{eventDetails.venue || '—'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* VOLUNTEER LIST TABLE */}
                <table className="od-sheet-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>Sr. No.</th>
                      <th style={{ width: '32%', textAlign: 'left' }}>Student Name</th>
                      <th style={{ width: '22%', textAlign: 'left' }}>KU ID / Roll No</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Semester</th>
                      <th style={{ width: '13%', textAlign: 'left' }}>Class</th>
                      <th style={{ width: '15%', textAlign: 'left' }}>Work / Dept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {odList.length > 0 ? (
                      odList.map((v, i) => (
                        <tr key={v.qid} style={{ pageBreakInside: 'avoid' }}>
                          <td style={{ textAlign: 'center' }}>{i + 1}</td>
                          <td><strong>{v.name}</strong></td>
                          <td><code>{v.qid}</code></td>
                          <td style={{ textAlign: 'center' }}>{v.sem}</td>
                          <td>{v.cls}</td>
                          <td>{v.cat}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                          No volunteers added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* SIGNATURE BLOCK */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '28px',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}>
                  <div style={{ flex: 1, border: '1px solid #000', height: '28mm', padding: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 700 }}>
                    Faculty Coordinator
                    <span style={{ fontWeight: 400, fontSize: '10px' }}>Sign &amp; date</span>
                  </div>
                  <div style={{ flex: 1, border: '1px solid #000', height: '28mm', padding: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 700 }}>
                    Student Head / Lead (AAYAM)
                    <span style={{ fontWeight: 400, fontSize: '10px' }}>Sign &amp; date</span>
                  </div>
                  <div style={{ flex: 1.3, border: '1px solid #000', height: '28mm', padding: '6px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 700 }}>
                    Dean / HOD
                    <span style={{ fontWeight: 400, fontSize: '10px' }}>Sign, date &amp; stamp</span>
                  </div>
                </div>

                {/* FOOTER */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '6px',
                  borderTop: '1px solid #000',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#334155'
                }}>
                  <span>Generated on {formatDate(new Date().toISOString().slice(0, 10))}</span>
                  <span>AAYAM – UIT Students Committee · Karnavati University</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAGE MASTER VOLUNTEERS DATABASE */}
      {/* ======================================================== */}
      {subTab === 'master' && (
        <div className="noprint" style={{ background: '#ffffff', borderRadius: '18px', padding: '28px', border: '1px solid #e8dfd1', boxShadow: '0 4px 20px rgba(15,27,60,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--navy)', fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>
                👥 Master Volunteers Database ({filteredMaster.length} of {masterVolunteers.length})
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                All registered UIT student volunteers available for OD sheet creation. You can add, edit, import or export records.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openAddVolunteerModal}
                style={{ padding: '9px 18px', background: 'var(--navy)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Volunteer
              </button>
              <label style={{ padding: '9px 16px', background: '#f8fafc', color: 'var(--navy)', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                📥 Import CSV
                <input type="file" accept=".csv,text/csv" onChange={handleImportCsv} style={{ display: 'none' }} />
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                style={{ padding: '9px 16px', background: '#f8fafc', color: 'var(--navy)', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                📄 CSV Template
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                style={{ padding: '9px 16px', background: '#f8fafc', color: 'var(--navy)', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                📤 Export CSV
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search name, KU ID, class..."
              value={masterSearch}
              onChange={(e) => setMasterSearch(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
            <select
              value={masterSemFilter}
              onChange={(e) => setMasterSemFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
            <select
              value={masterClassFilter}
              onChange={(e) => setMasterClassFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
            >
              <option value="">All Classes</option>
              {masterClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* MASTER TABLE */}
          <div style={{ maxHeight: '520px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 5 }}>
                <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>KU ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Sem</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Class / Branch</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaster.length > 0 ? (
                  filteredMaster.map(v => (
                    <tr key={v.qid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: 'var(--navy)' }}>{v.name}</strong>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <code>{v.qid}</code>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', fontSize: '11px', fontWeight: 700 }}>
                          Sem {v.sem}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{v.cls}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openEditVolunteerModal(v)}
                            style={{ padding: '4px 10px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVolunteer(v)}
                            style={{ padding: '4px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      No volunteers match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BULK SELECTION MODAL */}
      {/* ======================================================== */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '20px', fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>
                👥 Select Multiple Students for OD Sheet
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {/* CATEGORY ASSIGNMENT PANEL */}
            <div style={{ background: '#faf6f0', padding: '14px', borderRadius: '12px', border: '1px solid #e8dfd1', marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: '6px' }}>
                Assign Work Category to All Selected Students:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: bulkCategory === "Other (Editable)" ? '1fr 1fr' : '1fr', gap: '10px' }}>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                >
                  {CATS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {bulkCategory === "Other (Editable)" && (
                  <input
                    type="text"
                    placeholder="Type custom category name..."
                    value={bulkCustomCategory}
                    onChange={(e) => setBulkCustomCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #c8922a', fontSize: '13px', outline: 'none' }}
                  />
                )}
              </div>
            </div>

            {/* BULK SEARCH & FILTERS */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Search name, KU ID, class..."
                value={bulkSearch}
                onChange={(e) => setBulkSearch(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
              <select
                value={bulkSem}
                onChange={(e) => setBulkSem(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              >
                <option value="">All Semesters</option>
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
              <select
                value={bulkClass}
                onChange={(e) => setBulkClass(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
              >
                <option value="">All Classes</option>
                {masterClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* SELECTION BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={filteredBulkList.length > 0 && filteredBulkList.every(v => selectedBulkQids.has(v.qid.toLowerCase()))}
                  onChange={(e) => toggleBulkSelectAll(e.target.checked)}
                />
                Select / Deselect all visible ({filteredBulkList.length})
              </label>
              <strong style={{ color: 'var(--navy)' }}>
                {selectedBulkQids.size} {selectedBulkQids.size === 1 ? 'student' : 'students'} selected
              </strong>
            </div>

            {/* BULK LIST TABLE */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 5 }}>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ width: '36px', textAlign: 'center', padding: '6px' }}>✓</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>KU ID</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Sem</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBulkList.length > 0 ? (
                    filteredBulkList.map(v => {
                      const isChecked = selectedBulkQids.has(v.qid.toLowerCase());
                      return (
                        <tr
                          key={v.qid}
                          onClick={() => toggleBulkSelectOne(v.qid)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            background: isChecked ? '#f0fdf4' : '#ffffff'
                          }}
                        >
                          <td style={{ textAlign: 'center', padding: '6px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}><strong>{v.name}</strong></td>
                          <td style={{ padding: '8px' }}><code>{v.qid}</code></td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>Sem {v.sem}</td>
                          <td style={{ padding: '8px' }}>{v.cls}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        No available volunteers match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL BOTTOM ACTIONS */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                style={{ padding: '10px 18px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedBulkQids.size === 0}
                onClick={handleAddBulkSelected}
                style={{
                  padding: '10px 22px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedBulkQids.size > 0 ? 'var(--navy)' : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: selectedBulkQids.size > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: selectedBulkQids.size > 0 ? '0 4px 12px rgba(15,27,60,0.25)' : 'none'
                }}
              >
                {selectedBulkQids.size > 0 ? `Add ${selectedBulkQids.size} Selected to OD Sheet` : 'Select students to add'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT VOLUNTEER MODAL */}
      {/* ======================================================== */}
      {showVolunteerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '20px', fontFamily: "'Playfair Display', serif", fontWeight: 800 }}>
                {editingQid ? '✏️ Edit Volunteer' : '👤 Add Volunteer'}
              </h3>
              <button
                type="button"
                onClick={() => setShowVolunteerModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveVolunteer}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Full Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Shah"
                    value={volunteerForm.name}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>KU ID / Roll No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KU2507U0123"
                    value={volunteerForm.qid}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, qid: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Semester</label>
                    <select
                      value={volunteerForm.sem}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, sem: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                    >
                      {SEMESTERS.map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Class / Branch *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSE-A / AIML"
                      value={volunteerForm.cls}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, cls: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                {volunteerFormErr && (
                  <div style={{ color: '#dc2626', fontSize: '12px', background: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                    ⚠️ {volunteerFormErr}
                  </div>
                )}

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowVolunteerModal(false)}
                    style={{ padding: '9px 16px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 20px', background: 'var(--navy)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save Record
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {confirmDialog.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.75)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--navy)', fontSize: '18px', fontWeight: 800 }}>
              {confirmDialog.title}
            </h4>
            <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, open: false });
                }}
                style={{ padding: '8px 18px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
