var socket = io({ transports: ["websocket"], upgrade: false });
socket.emit("connecting", { uuid: $(".user-profile").data("uuid") });
var upload;

function prepareTextMsgBubble(data) {
    return (
        `<div class="msg ` +
        data.msg_class +
        `">
            <div class="msg-img" style="background-image: url('/images/male_avatar.png');"></div>
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name"> ` +
        data.username +
        `</div>
                    <div class="msg-info-time">` +
        new Date().getHours().toString().padStart(2, "0") +
        ":" +
        new Date().getMinutes().toString().padStart(2, "0") +
        `</div>
                </div>
                <div class="msg-text">` +
        data.txt_msg +
        `</div>
            </div>
        </div>`
    );
}

function prepareFileMsgBubble(data) {
    return (
        `<div class="msg ` +
        data.msg_class +
        `">
            <div class="msg-img" style="background-image: url('/images/male_avatar.png');"></div>
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name"> ` +
        data.username +
        `</div>
                    <div class="msg-info-time">` +
        new Date().getHours().toString().padStart(2, "0") +
        ":" +
        new Date().getMinutes().toString().padStart(2, "0") +
        `</div>
                </div>
                <div class="msg-text">` +
        data.file_msg +
        `</div>
            </div>
        </div>`
    );
}

function capitalizeText(text) {
    return text.replace(/^\w/, (c) => c.toUpperCase());
}

function scrollChatBox() {
    $(".msger-chat")
        .stop()
        .animate(
            {
                scrollTop: $(".msger-chat")[0].scrollHeight,
            },
            800
        );
}

function moveChat(data) {
    let elem = $(`li[data-uuid="${data.uuid}"]`)
    $(elem).find('.last-message').html(data.message.slice(0, 40) + (data.message.length > 40 ? "..." : ""))
    $(elem).find('.last-message-date').html(new Date().getHours().toString().padStart(2, "0")+':'+new Date().getMinutes().toString().padStart(2, "0"))
    $(elem).detach().prependTo('.friend-wrapper');
}


function appendTextMsgBubble(data) {
    $(".msger-chat").append(prepareTextMsgBubble(data));
}

function appendFileMsgBubble(data) {
    $(".msger-chat").append(prepareFileMsgBubble(data));
}

function clearTextArea() {
    $(".msger-input").val("");
}

function fileUploadPreview() {
    $.getScript('/js/file-upload-with-preview.min.js', function () {
        upload = new FileUploadWithPreview('myUploader', {
            showDeleteButtonOnImages: true
        })
    });
}

function clearSpeechInput() {
    final_transcript = "";
    // ignore_onend = false;
    final_span.innerHTML = "";
    interim_span.innerHTML = "";
    addAttributeToSpeechControls(true)

}

function editSpeechInput() {
    // recognition.onend()
    recognition.stop()
    placeCaretAtEnd(document.getElementById('final_span'));
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function sendSpeechInput() {
    // recognition.onend()
    recognition.stop()
    $('.msger-input').val(final_span.innerHTML)

    clearSpeechInput()
    $('.speech_to_text').hide()
    setTimeout(() => {
        $('.msger-send-btn').trigger('click')
    }, 1000);
}

function hideSpeechInput(params) {
    recognition.stop()
    $('.speech_to_text').hide()
}

function addAttributeToSpeechControls(action) {
    if (action) {
        $('.stt-send-btn').attr("disabled", true)
        $('.stt-clear-btn').attr("disabled", true)
        $('.stt-edit-btn').attr("disabled", true)
    }
    else {
        $('.stt-send-btn').removeAttr("disabled")
        $('.stt-clear-btn').removeAttr("disabled")
        $('.stt-edit-btn').removeAttr("disabled")
    }
}

var final_transcript = "";
var recognizing = false;
var ignore_onend;
var recognition;

function speechToText() {
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
        $('.microphone').removeClass('fa-microphone-slash')
        $('.microphone').addClass('fa-microphone')
    };

    recognition.onerror = function (event) {
        ignore_onend = true;
    };

    recognition.onend = function () {
        recognizing = false;
        addAttributeToSpeechControls(false)
        $('.microphone').removeClass('fa-microphone')
        $('.microphone').addClass('fa-microphone-slash')
        if (ignore_onend) {
            return;
        }
        if (!final_transcript) {
            return;
        }
    };

    recognition.onresult = function (event) {
        var interim_transcript = "";
        if (typeof event.results == "undefined") {
            recognition.onend = null;
            recognition.stop();
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_span.innerHTML = final_transcript;
        interim_span.innerHTML = interim_transcript;
    };
}

function startButton() {
    if (!("webkitSpeechRecognition" in window)) {
        console.log("Not Supported")
    }
    else {
        recognition = new webkitSpeechRecognition();
        $('.speech_to_text').show()
        addAttributeToSpeechControls(true)
        speechToText()
        if (recognizing) {
            recognition.stop();
            return;
        }
        final_transcript = "";
        recognition.start();
        ignore_onend = false;
        final_span.innerHTML = "";
        interim_span.innerHTML = "";
    }
}

function uploadFilesToServer(callback) {
    let formElement = document.getElementById('entry-form');
    let formData = new FormData(formElement);
    for (key in upload.cachedFileArray) {
        formData.append(upload.cachedFileArray[key].name, upload.cachedFileArray[key]);
    }

    $.ajax({
        url: "/upload/files",
        type: "POST",
        dataType: "json",
        async: true,
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        success: function (data) {
            callback(data)
        },
        error: function (error) {
            console.log(error)
        },
    })
}

var debounceRefreshFriendListTimeout = null;
var debounceRefreshClientCallback = function (socket_data) {
    var refreshFriendList = function (socket_data) {
        $.ajax({
            type: "POST",
            url: "/compile/template/friend-list",
            success: function (data) {
                $(".left-wrap .friend-wrapper").replaceWith(data.html);
            },
            error: function (error) {
                console.log(error);
            },
        });
    };

    clearTimeout(debounceRefreshFriendListTimeout);
    debounceRefreshFriendListTimeout = setTimeout(refreshFriendList, 0);
};
socket.on("connect_client", debounceRefreshClientCallback);
socket.on("disconnect_client", debounceRefreshClientCallback); // Todo: online / offline flag

var updateUserOnlineStatus = function (data) {
    $(`li[data-uuid="${data.userDetails.userid}"] .online-status`).removeClass('fa-toggle-off').addClass('fa-toggle-on');
};

var appendTextMessageBubble = function (data) {
    appendTextMsgBubble({
        msg_class: "left-msg",
        username: capitalizeText(data.name),
        txt_msg: data.message,
    });
    $(`li[data-uuid="${data.senderUuid}"] .friend-chat-head`).css('font-weight', 'bolder');
    moveChat({message: data.message, uuid: data.senderUuid})
};

var appendFileMessageBubble = function (data) {
    appendFileMsgBubble({
        msg_class: "left-msg",
        username: capitalizeText(data.name),
        file_msg: data.message,
    });
    moveChat({message: data.message, uuid: data.senderUuid})
};

socket.on('new_user_online', updateUserOnlineStatus);
socket.on("trigger_text_message", appendTextMessageBubble);
socket.on("trigger_file_message", appendFileMessageBubble);

var sendMessage = function (data) {
    if (data.data.friendDetails.uuid != $(".friend-details").data("uuid")) {
        $.ajax({
            type: "POST",
            url: "/compile/template/chat-interface",
            headers: {
                "content-type": "application/json",
            },
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                $(".right-wrap").html(result.html);
                scrollChatBox();
                fileUploadPreview();
            },
            error: function (error) {
                console.log(error);
            },
        });
    }
};

// Event Listeners
$(document).on("click", "li.friend-list", function (evt) {
    sendMessage({
        data: {
            friendDetails: {
                uuid: $($(evt.target).parents("li.friend-list:first")).data("uuid"),
            },
            selfDetails: {
                uuid: $(".user-profile").data("uuid"),
            },
        },
    });
});

$(document).on("click", ".msger-send-btn", function (evt) {
    evt.preventDefault();

    let messageData;
    if (upload && upload.currentFileCount) {

        uploadFilesToServer(function (data) {
            appendFileMsgBubble({
                msg_class: "right-msg",
                username: "You",
                file_msg: data.data.join(' , '),
            });
            messageData = {
                friendDetails: {
                    uuid: $(".friend-details").data("uuid"),
                },
                selfDetails: {
                    uuid: $(".user-profile").data("uuid"),
                },
                msgDetails: {
                    messageType: "file",
                    message: data.data.join(' , '),
                },
            }
            socket.emit("send_file_message", messageData)
            upload.clearPreviewPanel();
            $(".custom-file-container").trigger('DOMSubtreeModified')
            moveChat({ message: messageData.msgDetails.message, uuid: messageData.friendDetails.uuid })
        });

        return;
    }
    else {
        appendTextMsgBubble({
            msg_class: "right-msg",
            username: "You",
            txt_msg: $(".msger-input").val(),
        });

        messageData = {
            friendDetails: {
                uuid: $(".friend-details").data("uuid"),
            },
            selfDetails: {
                uuid: $(".user-profile").data("uuid"),
            },
            msgDetails: {
                messageType: "text",
                message: $(".msger-input").val(),
            },
        }

        socket.emit("send_text_message", messageData);
    }
    moveChat({ message: messageData.msgDetails.message, uuid: messageData.friendDetails.uuid })

    clearTextArea();
    scrollChatBox();
});

$(document).on("click", "#file-upload", function (evt) {
    $('.custom-file-container__custom-file__custom-file-input').trigger('click')
});

$(document).on("click", ".stt-clear-btn", clearSpeechInput);
$(document).on("click", ".stt-edit-btn", editSpeechInput);
$(document).on("click", ".stt-send-btn", sendSpeechInput);
$(document).on("click", ".microphone", startButton);
$(document).on("click", ".stt-close-btn", hideSpeechInput);

var refreshMessageList = function () {
    $.ajax({
        type: "POST",
        url: "/compile/template/chat-body",
        headers: {
            "content-type": "application/json",
        },
        data: JSON.stringify({
            data: {
                friendDetails: {
                    uuid: $(".friend-details").data("uuid"),
                },
                selfDetails: {
                    uuid: $(".user-profile").data("uuid"),
                },
            },
        }),
        dataType: "json",
        success: function (data1) {
            $(".chat-interface-body").replaceWith(data1.html);
        },
        error: function (error) {
            console.log(error);
        },
    });
};

$(document).on("DOMSubtreeModified", ".custom-file-container", function () {
    if (upload != undefined && upload.currentFileCount) {
        $(".custom-file-container").show()
    }
    else {
        $(".custom-file-container").hide()
    }
});