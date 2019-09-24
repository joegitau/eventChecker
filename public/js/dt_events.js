$(document).ready(function() {
  $("#eventsDataTable").dataTable({
    dom:
      "<'row'<'col-sm-6 col-lg-6 my-3'f><'col-sm-6 col-lg-6 my-3'B>>" +
      "<'row'<'col-sm-12 col-lg-12 mb-4'tr>>" +
      "<'row'<'col-sm-3 col-lg-3'l><'col-sm-4 col-lg-4 justify-content-center'i><'col-sm-5 col-lg-5'p>>",
    responsive: {
      details: {
        display: $.fn.dataTable.Responsive.display.modal({
          header: function(row) {
            var data = row.data();
            return "Event info of " + data[2];
          }
        }),
        renderer: $.fn.dataTable.Responsive.renderer.tableAll({
          tableClass: "table"
        })
      }
    },
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search event's title, venue, dates ..."
    },
    buttons: [
      {
        extend: "excelHtml5",
        title: "Events' Information",
        messageBottom: "with much 💜 by Joseph Gitau."
      },
      {
        extend: "pdfHtml5",
        title: "Events' Information",
        messageBottom: "with much 💜 by Joseph Gitau."
      },
      {
        extend: "print",
        title: "Events' Information",
        messageBottom: "with much 💜 by Joseph Gitau."
      }
    ]
  });
});
