// Call the dataTables jQuery plugin
$(document).ready(function() {
  // $('#dataTable').DataTable();

  $('#dataTable').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json',
    },
    order: [[6, 'desc']]
  });

  $('#dataTable_order').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json',
    },
    order: [[2, 'desc']]
  }); 
});
