// Global function to initialize DataTables
window.initDataTable = function() {
    $('.datatables-basic').each(function() {
        const table = $(this);
        if (!table.hasClass('dataTable')) {
            // Get title from data-name attribute or fallback to card-title
            const customTitle = table.data('name');
            const cardTitle = table.closest('.card').find('.card-title').text().trim();
            const tableTitle = customTitle || cardTitle || 'Data Table';
            
            console.log("Initializing DataTable with title:", tableTitle);
            
            table.DataTable({
                order: [[1, 'asc']], // Sort by first data column (Name)
                dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                displayLength: 7,
                lengthMenu: [7, 10, 25, 50, 75, 100],
                responsive: {
                    details: {
                        type: 'column',
                        target: 'tr'
                    }
                },
                columnDefs: [
                    {
                        className: 'dtr-control',
                        orderable: false,
                        targets: 0, // First column for control
                        width: '15px',
                        data: null,
                        defaultContent: ''
                    }
                ],
                buttons: [
                    {
                        extend: 'collection',
                        className: 'btn btn-label-primary dropdown-toggle me-2',
                        text: '<i class="bx bx-export me-sm-1"></i> <span class="d-none d-sm-inline-block">Export</span>',
                        buttons: [
                            {
                                extend: 'print',
                                text: '<i class="bx bx-printer me-1"></i>Print',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: ':visible' // Export all visible columns
                                }
                            },
                            {
                                extend: 'csv',
                                text: '<i class="bx bx-file me-1"></i>Csv',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: ':visible' // Export all visible columns
                                }
                            },
                            {
                                extend: 'excel',
                                text: '<i class="bx bxs-file-export me-1"></i>Excel',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: ':visible' // Export all visible columns
                                }
                            },
                            {
                                extend: 'pdf',
                                text: '<i class="bx bxs-file-pdf me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: ':visible' // Export all visible columns
                                }
                            },
                            {
                                extend: 'copy',
                                text: '<i class="bx bx-copy me-1"></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: ':visible' // Export all visible columns
                                }
                            }
                        ]
                    }
                ]
            });
            
            // Set the title in the DataTable header
            table.closest('.card').find('div.head-label').html('<h5 class="mb-0">' + tableTitle + '</h5>');
            table.closest('.card').find('.card-title').hide();
        }
    });
};

// Auto-initialize on page load
$(function () {
    window.initDataTable();
});
