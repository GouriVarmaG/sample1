import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import portalService from '../services/portalService';
import { exportExcelFile, uploadFile } from '../services/helperService';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';

function AssessmentDetails() {
    const defaultColumns = ["Employee ID", "Employee Name", "Skill Factory", "Overall Performance", "strength", "weakness"];
    const [products, setProducts] = useState([]);
    // const [originalProducts, setOriginalProducts] = useState([]);
    // const [totalRecords, setTotalRecords] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filterRecords, setFilterRecords] = useState([]);
    const [filters, setFilters] = useState({});
    const [selectedColumns, setSelectedColumns] = useState(defaultColumns);
    const fileInputRef = useRef(null);
    // const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    // const [deleteDialog, setDeleteDialog] = useState(false);
    // const [userToDelete, setUserToDelete] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    // const [productDialog, setProductDialog] = useState(false);
    // const [newUser, setNewUser] = useState({});
    const [editingRow, setEditingRow] = useState(null);
    const [originalRowSnapshot, setOriginalRowSnapshot] = useState(null);
    // const performanceOptions = ["V.Good", "Good", "Average", "Needs Improvement"];
    const performanceOptions = [
        { label: 'V.Good', value: 'V.Good' },
        { label: 'Good', value: 'Good' },
        { label: 'Average', value: 'Average' },
        { label: 'Needs Improvement', value: 'Needs Improvement' }
    ];
    useEffect(() => {
        fetchData();
        initFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initFilters = () => {
        let _filters = {};

        columns.forEach(col => {
            _filters[col.field] = { value: null, matchMode: 'contains' };
        });

        setFilters(_filters);
    };

    const fetchData = async () => {
        try {
            // setLoading(true);
            const data = await portalService.getInternAssessments();
            if (data !== null) {
                const originalData = data.data.map((item, index) => ({ ...item, id: item["Employee ID"] || index }));//Add unique id
                // setOriginalProducts(originalData);
                setProducts(originalData);
                setFilterRecords(originalData);
                // setTotalRecords(originalData.length);
                // setLoading(false);
            } else {
                console.log("Data is null");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            // setLoading(false);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch skills data', life: 3000 });
            // } finally {
            // setLoading(false);
        }
    };
    const columns = [
        { field: 'Employee ID', header: 'Employee  ID' },
        { field: 'Employee Name', header: 'Resource Name' },
        { field: 'Skill Factory', header: 'Skill Factory' },
        { field: 'Primary Skills', header: 'Technical Skills' },
        { field: 'strength', header: 'Strengths' },
        { field: 'weakness', header: 'Weakness' },
        { field: 'Overall Performance', header: 'Overall Performance' }
    ];
    const exportExcel = () => {
        exportExcelFile(products, 'products');
    };
    const handleChooseFile = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        try {
            await uploadFile(e);
        } catch (error) {
            console.error(error);
        } finally {
            fetchData();
            e.target.value = null;
        }
    };
    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportExcel} style={{ flex: '1 1 auto', margin: '5px' }} />
                    <Button label="Import" icon="pi pi-download" className="p-button-info" onClick={handleChooseFile} style={{ flex: '1 1 auto', margin: '5px' }} />
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} /></div>
                <style>
                    {`
                    @media (max-width: 600px) {
                      .p-button-help, .p-button-info {
                        flex: 1 1 100%;
                      }
                    }
                `}
                </style>

            </React.Fragment>
        );
    };

    const handleDropdownChange = (e) => {
        setSelectedColumns(e.value);
    };
    const header = (
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span className="p-input-icon-left" style={{ display: 'flex', alignItems: 'center', flex: window.innerWidth <= 768 ? '1 1 100%' : '1 1 100px', marginBottom: '10px', maxWidth: '300px' }}>
                <i className="pi pi-search" style={{ marginRight: '10px', paddingLeft: '10px' }} />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder=" Search..." style={{ paddingLeft: '30px', height: '2.5rem' }} />
            </span>
            <MultiSelect value={selectedColumns} options={columns} optionLabel="header" optionValue="field" onChange={handleDropdownChange} display="chip" placeholder="Select Columns" filter dropdownIcon="pi pi-chevron-down" style={{ flex: window.innerWidth <= 768 ? '1 1 100%' : '1 1 100px', maxWidth: '300px', fontSize: '0.5rem', height: '2.5rem' }} panelStyle={{ maxHeight: '250px', width: '300px' }} />
        </div>
    );
    const dynamicColumns = selectedColumns.length > 0
        ? columns.filter(col => selectedColumns.includes(col.field))
        : columns;

    const headerClassName = 'custom-header';
    useEffect(() => {
        const styleIcons = () => {
            const headers = document.querySelectorAll('.custom-header .pi-sort, .custom-header .pi-filter');
            headers.forEach(icon => {
                icon.style.color = 'gray';
            });
        };

        styleIcons();
    }, [filterRecords]);

    const getRowById = (id) => {
        return products.find((product) => product.id === id);
    };
    const onPerformanceChange = (e, rowData) => {
        const updatedProducts = products.map(product => {
            if (product.id === rowData.id) {
                return { ...product, 'Overall Performance': e.value };
            }
            return product;
        });
        // setProducts(updatedProducts);
        // setFilterRecords(updatedProducts);
        setProducts([...updatedProducts]);
        setFilterRecords([...updatedProducts]);
        setEditingRow(rowData.id)
    };
    const onEditorValueChange = (props, event) => {
        const { field, rowData } = props;
        const { value } = event.target;

        const updatedProducts = products.map(product =>
            product.id === rowData.id ? { ...product, [field]: value } : product
        );

        setProducts(updatedProducts);
        setFilterRecords(updatedProducts);
    };
    const inputTextEditor = (props, field) => {
        const row = getRowById(props.rowData.id); // Always get fresh data

        if (editingRow === props.rowData.id) {
            return (
                <InputText
                    type="text"
                    value={row?.[field] ?? ''}
                    onChange={(e) => onEditorValueChange(props, e)}
                />
            );
        } else {
            return row?.[field] ?? '';
        }
    };
    const performanceBodyTemplate = (rowData) => {
        if (editingRow === rowData.id) {
            return (
                <Dropdown
                    value={rowData['Overall Performance'] ?? ''}
                    options={performanceOptions}
                    onChange={(e) => onPerformanceChange(e, rowData)}
                    placeholder="Select Performance"
                    optionLabel="label"
                    optionValue="value"
                />
            );
        } else {
            return rowData['Overall Performance'] && rowData['Overall Performance'].trim() !== '' ? rowData['Overall Performance'] : '';
        }
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {editingRow === rowData.id ? (
                    <Button
                        icon="pi pi-check" rounded outlined className="mr-2" onClick={() => {
                            const currentRow = getRowById(rowData.id);
                            const isEqual = JSON.stringify(currentRow) === JSON.stringify(originalRowSnapshot);

                            if (isEqual) {
                                toast.current.show({
                                    severity: 'info',summary: 'No Change',detail: 'No changes detected.',life: 3000
                                });
                                setEditingRow(null);
                                return;
                            }

                            // Proceed with update
                            portalService.updateInternAssessment(currentRow, rowData.id)
                                .then(response => {
                                    toast.current.show({
                                        severity: 'success',summary: 'Success',detail: 'Editing completed',life: 3000
                                    });
                                    setEditingRow(null);
                                })
                                .catch(error => {
                                    console.error('Update Error:', error);
                                    toast.current.show({
                                        severity: 'error',summary: 'Error',detail: 'Editing failed',life: 3000
                                    });
                                    setEditingRow(null);
                                });
                        }}
                    />

                ) : (
                    <Button icon="pi pi-pencil" rounded text className="mr-2" onClick={() => {
                        const originalRow = getRowById(rowData.id);
                        setOriginalRowSnapshot(JSON.parse(JSON.stringify(originalRow))); setEditingRow(rowData.id)
                    }} />
                )}
            </React.Fragment>
        );
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#5C2399' }}>
                <h5 className="mx-0 my-1" style={{ fontSize: '24px', fontWeight: 'bold', padding: '10px' }}>Assessment Details</h5>
                <Toolbar className="mb-4" left={leftToolbarTemplate} style={{ backgroundColor: '#ffff', padding: '15px 0 0 0 ', border: 'none' }}></Toolbar>
            </div>
            <div className="card">
                <DataTable ref={dt} value={filterRecords} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
                    dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records" globalFilter={globalFilter} header={header} filters={filters} onFilter={(e) => setFilters(e.filters)}>
                    <Column />
                    {dynamicColumns.map((col, i) => (
                        <Column key={i} field={col.field} header={col.header} sortable filter showFilterMenu={true}
                            showFilterOperator={true}
                            headerClassName={headerClassName} style={{ minWidth: '12rem' }}
                            editor={col.field !== 'Overall Performance' ? (props) => inputTextEditor(props, col.field) : null}
                            body={col.field === 'Overall Performance' ? performanceBodyTemplate : null}
                        ></Column>
                    ))}
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
                <style>
                    {`
                    .custom-header {
                        color: #5C2399 !important;
                    }
                    .p-datatable-header{
                        background-color:rgb(238, 242, 255);
                    }
                    .p-paginator{ background-color:rgb(238, 242, 255);}
                    th{background-color:rgb(238, 242, 255);}
                    tr{background-color:rgb(252, 250, 255);}
                    .p-datatable .p-sortable-column .p-sortable-column-icon, .p-datatable .p-sortable-column .p-sortable-column-icon::before, .p-datatable .p-sortable-column .p-sortable-column-icon::after {
                      color: lightgrey !important;
                      width: 12px !important;
                      height:12px !important;
                      transition: all 0.3s ease;
                      
                  }
                    .p-datatable .p-sortable-column:hover .p-sortable-column-icon, .p-datatable .p-sortable-column .p-sortable-column-icon::before, .p-datatable .p-sortable-column .p-sortable-column-icon::after{
                    color: grey !important;
                  }
                   .p-datatable .p-column-filter-menu .p-icon{
                      color: lightgrey !important;
                      width: 12px !important;
                      height:12px !important;
                      transition: all 0.3s ease
                   }
                    .p-datatable .p-sortable-column:hover .p-column-filter-menu .p-icon{
                      color: grey !important
                    }
                `}
                </style>
            </div>
        </div>
    );
}
export default AssessmentDetails;

