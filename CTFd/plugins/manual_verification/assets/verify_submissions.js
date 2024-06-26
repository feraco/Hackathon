if (CTFd.lib.$) {
  $ = CTFd.lib.$;
}

function htmlentities(string) {
  return $("<div/>")
    .text(string)
    .html();
}

function ezgrade(args) {
  var modal =
    '<div class="modal fade" tabindex="-1" role="dialog">' +
    '  <div class="modal-dialog" role="document">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <h5 class="modal-title">{0}</h5>' +
    '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
    '          <span aria-hidden="true">&times;</span>' +
    "        </button>" +
    "      </div>" +
    '      <div class="modal-body">' +
    "        <p>{1}</p>" +
    "      </div>" +
    '      <div class="modal-footer">' +
    "      </div>" +
    "    </div>" +
    "  </div>" +
    "</div>";
  var res = modal.format(args.title, args.body);
  var obj = $(res);
  var deny = $(
    '<button type="button" class="btn btn-danger" data-dismiss="modal">Mark Incorrect</button>'
  );
  var confirm = $(
    '<button type="button" class="btn btn-success" data-dismiss="modal">Mark Correct</button>'
  );
  var award = $(
    '<button type="button" class="btn btn-secondary" data-dismiss="modal">Award Points</button>'
  );

  obj.find(".modal-footer").append(deny);
  obj.find(".modal-footer").append(confirm);
  obj.find(".modal-footer").append(award);

  $("main").append(obj);

  $(obj).on("hidden.bs.modal", function(e) {
    $(this).modal("dispose");
  });

  $(confirm).click(function() {
    args.success();
  });

  $(deny).click(function() {
    args.error();
  });

  $(award).click(function() {
    args.award();
  });

  obj.modal("show");

  return obj;
}

// TODO: Replace this with CTFd JS library
$(document).ready(function() {
  $(".grade-submission").click(function() {
    var elem = $(this)
      .parent()
      .parent();
    var chal = elem.find(".chal").attr("id");
    var chal_name = elem
      .find(".chal")
      .text()
      .trim();
    var team = elem.find(".team").attr("id");
    var team_name = elem
      .find(".team")
      .text()
      .trim();
    var submission = elem.find(".submission").attr("id");
    var submission_content = elem
      .find(".flag")
      .text()
      .trim();
    var key_id = elem.find(".flag").attr("id");

    var td_row = $(this)
      .parent()
      .parent();

    ezgrade({
      title: "Grade Submission",
      body: "Grade {0}'s submission for {1}: {2}".format(
        "<strong>" + htmlentities(team_name) + "</strong>",
        "<strong>" + htmlentities(chal_name) + "</strong>",
        "<pre>" + htmlentities(submission_content) + "</pre>"
      ),
      success: function() {
        CTFd.ui.ezq.ezQuery({
          title: "Mark Challenge Correct",
          body:
            "<p>Are you sure you want to mark this submission correct?<p><p>This will delete all other pending submissions on this challenge for this user and the user will no longer be able to submit any further submissions for this challenge.</p> <p>If you want to allow further submissions, you should award points instead.</p>",
          success: function() {
            CTFd.fetch("/admin/verify_submissions/" + key_id + "/solve", {
              method: "POST"
            })
              .then(function(response) {
                return response.json();
              })
              .then(function(response) {
                if (response.success) {
                  td_row.remove();
                  location.reload();
                }
              });
          }
        });
      },
      error: function() {
        CTFd.fetch("/admin/verify_submissions/" + key_id + "/fail", {
          method: "POST"
        })
          .then(function(response) {
            return response.json();
          })
          .then(function(response) {
            if (response.success) {
              td_row.remove();
            }
          });
      },
      award: function() {
        var resp = prompt("How many points to award?");
        if (resp === null) {
          return;
        }
        var points = parseInt(resp) || null;
        if (points === null) {
          alert("Invalid point amount")
          return;
        }

        var url =
          "/admin/verify_submissions/" + key_id + "/award?value=" + points;
        CTFd.fetch(url, {
          method: "POST"
        })
          .then(function(response) {
            return response.json();
          })
          .then(function(response) {
            if (response.success) {
              td_row.remove();
            }
          });
      }
    });
  });
});
