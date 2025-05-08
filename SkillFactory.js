import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import portalService from '../services/portalService';
import { notify, exportExcelFile, uploadFile } from '../services/helperService';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import NewUserDialog from '../components/AddNewEmp';

function SkillFactory(){
    const defaultColumns = ["Employee  ID", "Employee Type", "Employee Name", "Learning Path", "Skill Factory", "Learning Path Completed?"];
    
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
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [productDialog, setProductDialog] = useState(false);
    const [newUser, setNewUser] = useState({
    "Employee Type": "","Employee  ID": "","Employee Name": "","Primary Skills": "","Training Skills": "","Role": "","Current Activity": "","Total Years of Experience": "","Projects Supported": "","Month of joining": "","Month of leaving": "","Learning Path": "","Learning Path Completed?": "","Skill Factory": "","Current BBR Status": "","Initial Feedback": "","Initial Feedback Date": "","Last Feedback": "","Last Feedback Date": "","Overall Performance": ""
    });
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
            const data = await portalService.getSkills();
            if (data !== null) {
                const originalData = data.data.map((item, index) => ({ ...item, id: item["Employee  ID"] || index }));//Add unique id
                console.log("Fetched Data:", originalData); // Log fetched data
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
        //     setLoading(false);
        }
    };
    const deleteUser = () => {
        let _products;
        if (userToDelete) {
            _products = products.filter(val => val["_id"] !== userToDelete["_id"]);
            portalService.deleteSkillfactory(userToDelete["_id"])
                .then(response => {
                    console.log(response.data.message);
                    notify("User deleted successfully!");
                })
                .catch(error => {
                    console.error("There was an error deleting the user!", error);
                    notify(`Error deleting user: ${error.response ? error.response.data.message : error.message}`);
                });
            setUserToDelete(null);
        } else {
            _products = products.filter(val => !selectedProducts.includes(val));
            selectedProducts.forEach(user => {
                portalService.deleteSkillfactory(user["_id"])
                    .then(response => {
                        console.log(response.data.message);
                    })
                    .catch(error => {
                        console.error("There was an error deleting the user!", error);
                        notify(`Error deleting user: ${error.response ? error.response.data.message : error.message}`);
                    });
            });
            setSelectedProducts([]);
            notify("Users deleted successfully!");
        }
        setProducts(_products);
        setFilterRecords(_products);
        setDeleteDialog(false);
    };

    const hideDeleteDialog = () => {
        setDeleteDialog(false);
        setUserToDelete(null);
    };

    const confirmDeleteUser = (user=null) => {
        if (user) {
            setUserToDelete(user);
        }else if (selectedProducts.length === 1) {
            setUserToDelete(selectedProducts[0]);
        }else {
            setUserToDelete(null);
        }
        setDeleteDialog(true);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={()=>confirmDeleteUser()} disabled={!selectedProducts || !selectedProducts.length} /> 
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportExcel} />
                <Button label="Import" icon="pi pi-download" className="p-button-info" onClick={handleChooseFile} />
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            </React.Fragment>
        );
    };
 
    const openNew = () => {
        setNewUser({
            "Employee Type": "","Employee  ID": "","Employee Name": "","Primary Skills": "","Training Skills": "","Role": "","Current Activity": "","Total Years of Experience": "","Projects Supported": "","Month of joining": "","Month of leaving": "","Learning Path": "","Learning Path Completed?": "","Skill Factory": "","Current BBR Status": "","Initial Feedback": "",
            "Initial Feedback Date": "","Last Feedback": "","Last Feedback Date": "","Overall Performance": ""
        });
        setProductDialog(true);
    };
    
    const hideDialog = () => {
        setProductDialog(false);
    };
    const exportExcel = () => {
        exportExcelFile(products, 'products');
    };
    const columns = [
        { field: 'Employee  ID', header: 'Employee  ID' },
        { field: 'Employee Type', header: 'Employee Type' },
        { field: 'Employee Name', header: 'Employee Name' },
        { field: 'Primary Skills', header: 'Primary Skills' },
        { field: 'Training Skills', header: 'Training Skills' },
        { field: 'Role', header: 'Role' },
        { field: 'Current Activity', header: 'Current Activity' },
        { field: 'Total Years of Experience', header: 'Total Years of Experience' },
        { field: 'Projects Supported', header: 'Projects Supported' },
        { field: 'Month of joining', header: 'Month of joining' },
        { field: 'Month of leaving', header: 'Month of leaving' },
        { field: 'Learning Path', header: 'Learning Path' },
        { field: 'Learning Path Completed?', header: 'Learning Path Completed?' },
        { field: 'Skill Factory', header: 'Skill Factory' },
        { field: 'Current BBR Status', header: 'Current BBR Status' },
        { field: 'Initial Feedback', header: 'Initial Feedback' },
        { field: 'Initial Feedback Date', header: 'Initial Feedback Date' },
        { field: 'Last Feedback', header: 'Last Feedback' },
        { field: 'Last Feedback Date', header: 'Last Feedback Date' },
        { field: 'Overall Performance', header: 'Overall Performance' }
    ];

    const handleDropdownChange = (e) => {
        setSelectedColumns(e.value);
    };  

      const header = (
            <div className="table-header"style={{ display: 'flex', justifyContent: 'space-between', flexWrap:'wrap',gap:'10px' }}>
                <span className="p-input-icon-left" style={{display:'flex',alignItems:'center',flex:window.innerWidth<=768?'1 1 100%':'1 1 100px',marginBottom:'10px',maxWidth:'300px'}}>
                    <i className="pi pi-search" style={{marginRight:'10px',paddingLeft:'10px'}}/>
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder=" Search..."  style={{ paddingLeft: '30px',height:'2.5rem' }}/>
                </span>
                <MultiSelect value={selectedColumns} options={columns} optionLabel="header" optionValue="field" onChange={handleDropdownChange} display="chip" placeholder="Select Columns"  filter dropdownIcon="pi pi-chevron-down" style={{ flex:window.innerWidth<=768?'1 1 100%':'1 1 100px',maxWidth:'300px',fontSize:'0.5rem',height:'2.5rem'}} panelStyle={{ maxHeight: '250px',width:'300px' }}/>
            </div>
        );
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

    const editUser = (product) => {
        setNewUser({ ...product });
        setProductDialog(true);
    };

    const actionBodyTemplate = (rowData) => {
            return (
                <React.Fragment>
                    <Button icon="pi pi-pencil" rounded text className="mr-2" onClick={() => {editUser(rowData)}} />
                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => {confirmDeleteUser(rowData)}} />
                </React.Fragment>
            );
        };
        console.log('pro',products)
return (
    <div>
        <Toast ref={toast} />
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mx-0 my-1" style={{fontSize:'24px',fontWeight:'bold',padding:'10px'}}>Skill Factory & Learning Portal</h5>
        </div>
        <div className="card">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

            <DataTable ref={dt} value={filterRecords} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
                dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records" globalFilter={globalFilter} header={header}filters={filters} onFilter={(e) => setFilters(e.filters)}>
                <Column selectionMode="multiple" exportable={false}></Column>
                {dynamicColumns.map((col, i) => (
                    <Column key={i} field={col.field} header={col.header}  sortable filter showFilterMenu={true}
                    showFilterOperator={true}
                     headerClassName={headerClassName} style={{ minWidth: '12rem' }}
                     ></Column>
                     
                ))}
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
            </DataTable>
            <style>
                {`
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
        <NewUserDialog visible={productDialog}onHide={hideDialog}user={newUser}products={products}setProducts={setProducts}setFilterRecords={setFilterRecords}fetchData={fetchData}/>
<Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={
    <>
        <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
        <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteUser} />
    </>
} onHide={hideDeleteDialog}>
    <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
        {userToDelete?( <span>Are you sure you want to delete <b>{userToDelete["Employee Name"]}</b>?</span>
        ):(
            <span>Are you sure you want to delete the selected users?</span>
        )}
    </div>
</Dialog>
    </div>
);
}

export default SkillFactory;

