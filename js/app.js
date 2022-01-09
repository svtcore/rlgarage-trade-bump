/**
 * Load data from storage to popup page of extension
 */

$(document).ready(function() {
    chrome.storage.sync.get("offerData", function(obj) {
        if (typeof obj.offerData != 'undefined') {
            var offdata = JSON.parse(obj.offerData);
            $("#username").text(offdata[0].name);
            $("#mode").prop("checked", offdata[0].mode);
            for (let i = 1; i <= offdata.length; i++) {
                $("#trade-id-" + i).val(offdata[i - 1].id);
                $("#trade-comment-" + i).val(offdata[i - 1].comment);
                $("#trade-status-" + i).prop("checked", offdata[i - 1].status);
                if (offdata[i - 1].status) {
                    $("#trade-id-" + i).prop("disabled", true);
                    $("#trade-comment-" + i).prop("disabled", false);
                } else {
                    $("#trade-id-" + i).prop("disabled", true);
                    $("#trade-comment-" + i).prop("disabled", true);
                }
            }
        } else {
            createEmpty()
        }
    });
});

function createEmpty() {
    var pluginArrayArg = new Array();
    var jsonArg = new Object();
    jsonArg.id = ""
    jsonArg.comment = ""
    jsonArg.status = 1
    jsonArg.name = $(".rlg-trade__username").text();
    jsonArg.mode = 0
    pluginArrayArg.push(jsonArg);
    var jsonArray = JSON.stringify(pluginArrayArg);
    chrome.storage.sync.set({ "offerData": jsonArray }, function() {
        console.log("Created empty key")
    });
}

/**
 * Save data to storage when edit something
 */
function saveData() {
    var pluginArrayArg = new Array();
    for (let i = 1; i <= 15; i++) {
        var jsonArg = new Object();
        jsonArg.id = $("#trade-id-" + i).val();
        jsonArg.comment = $("#trade-comment-" + i).val();
        jsonArg.status = $("#trade-status-" + i).prop("checked");
        jsonArg.name = $("#username").text();
        jsonArg.mode = $("#mode").prop("checked");
        pluginArrayArg.push(jsonArg);
    }
    var jsonArray = JSON.stringify(pluginArrayArg);
    chrome.storage.sync.set({ "offerData": jsonArray }, function() {
        $("#save_data").text("Saved");
        $("#save_data").css("background-color", "lightgrey");
    });
}

/**
 * Catch event when user edit state checkboxes
 * and call save data function
 */
$("input[type='checkbox']").change(function() {
    if (this.checked) {
        var data = $(this).attr('id');
        var id = data.split("-")[2];
        $("#trade-id-" + id).prop("disabled", true);
        $("#trade-comment-" + id).prop("disabled", false);
        saveData();
    } else {
        var data = $(this).attr('id');
        var id = data.split("-")[2];
        $("#trade-id-" + id).prop("disabled", true);
        $("#trade-comment-" + id).prop("disabled", true);
        saveData();
    }
});
/**
 * Catch event when user edit input
 * and call save data function
 */
$('input').on('input', function() {
    saveData();
});

$("#mode").change(function() {
    $("#mode_message").text("Refresh page to apply mode")
});