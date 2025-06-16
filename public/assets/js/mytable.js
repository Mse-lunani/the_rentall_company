$(function () {
    var dt_basic_table = $('.datatables-basic');
    var tableTitle = dt_basic_table.closest('.card').find('.card-title').text().trim();
    console.log("title",tableTitle);
    if (dt_basic_table.length) {
        dt_basic_table.DataTable({
            order: [[0, 'asc']], // Sort by first column
            dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            displayLength: 7,
            lengthMenu: [7, 10, 25, 50, 75, 100],
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
        $('div.head-label').html('<h5 class="mb-0">'+tableTitle+'</h5>');
        dt_basic_table.closest('.card').find('.card-title').hide();
    }
});
