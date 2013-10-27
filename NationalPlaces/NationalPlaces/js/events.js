/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />

var events = WinJS.Namespace.define("Events", {
    attachEvents: function () {
        var showRegister = document.getElementById("showRegister");
        var showLogin = document.getElementById("showLogin");
        var errors = document.getElementById("errorMessage");

        var loginButton = document.getElementById("btnLogin");
        loginButton.addEventListener("click", function () {
            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;

            var escapedUsername = escapeSting(username);
            var authCode = CryptoJS.SHA1(password).toString();

            WinJS.xhr({
                type: "POST",
                url: "http://100NationalPlaces.apphb.com/api/users/login/",
                headers: { "Content-type": "application/json" },
                data: JSON.stringify({ Username: escapedUsername, AuthCode: authCode })
            }).then(
                function (success) {
                    var applicationData = Windows.Storage.ApplicationData.current;
                    var localSettings = applicationData.localSettings;
                    var sessionKey = localSettings.values["sessionKey"] =
                        JSON.parse(success.responseText).SessionKey;
                    
                    ui.generateUI();
                },
                function (error) {
                    var messageDialog = new Windows.UI.Popups.MessageDialog(error.responseText);
                    messageDialog.showAsync();
                });

        });

        var registerButton = document.getElementById("btnRegister");
        registerButton.addEventListener("click", function () {
            var username = document.getElementById("regUsername").value;
            var name = document.getElementById("fullName").value;
            var password = document.getElementById("regPassword").value;
            var picture = document.getElementById("profile-image-container").src;
            var escapedUsername = escapeSting(username);
            var escapedName = escapeSting(name);
            var authCode = CryptoJS.SHA1(password).toString();
            WinJS.xhr({
                type: "POST",
                url: "http://100NationalPlaces.apphb.com/api/users/register/",
                headers: { "Content-type": "application/json" },
                data: JSON.stringify({ Username: escapedUsername, AuthCode: authCode, Name: escapedName, ProfilePictureUrl: picture })
            }).then(
                function (success) {
                    var applicationData = Windows.Storage.ApplicationData.current;
                    var localSettings = applicationData.localSettings;
                    var sessionKey = localSettings.values["sessionKey"] =
                        JSON.parse(success.responseText).SessionKey;
                   
                    ui.generateUI();
                },
                function (error) {
                    var messageDialog = new Windows.UI.Popups.MessageDialog(error.responseText);
                    messageDialog.showAsync();
                });
        });

        var logoutButton = document.getElementById("btnLogout");
        logoutButton.addEventListener("click", function () {

            var applicationData = Windows.Storage.ApplicationData.current;
            var localSettings = applicationData.localSettings;
            var sessionKey = localSettings.values["sessionKey"];
            WinJS.xhr({
                type: "PUT",
                url: "http://100NationalPlaces.apphb.com/api/users/logout/" + sessionKey,
                headers: { "Content-type": "application/json" },
            }).then(
               function (success) {
                   var sessionKey = localSettings.values["sessionKey"] = "";
                   document.getElementById("placesContent").style.visibility = "hidden";
                   document.getElementById("appBarContainer").style.display = "none";
                   ui.generateUI();
               },
               function (error) {
                   var messageDialog = new Windows.UI.Popups.MessageDialog(error.responseText);
                   messageDialog.showAsync();
               });
        });

        var fromCameraButton = document.getElementById("btnCamera");
        fromCameraButton.addEventListener("click", function (ev) {
            var captureUI = new Windows.Media.Capture.CameraCaptureUI();
            captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (capturedItem) {
                if (capturedItem) {
                    var container = document.getElementById("profile-image-container");
                    container.style.display = "inline";
                    container.src = "images/loading.gif";

                    uploadImage(capturedItem).then(function (url) {
                        container.setAttribute("src", url);
                    });
                }
            });
        });

        var checkInButton = document.getElementById("btnCheckIn");
        checkInButton.addEventListener("click", function () {
            var applicationData = Windows.Storage.ApplicationData.current;
            var localSettings = applicationData.localSettings;
            var sessionKey = localSettings.values["sessionKey"];
            var loc = null;
            if (loc == null) {
                loc = new Windows.Devices.Geolocation.Geolocator();
            }
            if (loc != null) {
                loc.getGeopositionAsync().then(getPositionHandler, errorHandler);
            }

            function getPositionHandler(pos) {
                WinJS.xhr({
                    type: "POST",
                    url: "http://100nationalplaces.apphb.com/api/places/checkIn/" + sessionKey + "?longitude=" + pos.coordinate.longitude + "&latitude=" + pos.coordinate.latitude,
                    headers: { "Content-type": "application/json" },
                }).then(
               function (success) {
                   var messageDialog = new Windows.UI.Popups.MessageDialog(success.responseText);
                   messageDialog.showAsync();
               },
               function (error) {
                   var messageDialog = new Windows.UI.Popups.MessageDialog("Error!");
                   messageDialog.showAsync();
               });
            }

            function errorHandler(e) {
                var messageDialog = new Windows.UI.Popups.MessageDialog("Your location can't be found!");
                messageDialog.showAsync();
            }
        });

        var profileButton = document.getElementById("myProfile");
        profileButton.addEventListener("click", function () {
            
            var menu = document.getElementById("menu-id").winControl;
            menu.show();
        });

        WinJS.Utilities.id("btnUploadPicture").listen("click", function () {
            var openPicker = Windows.Storage.Pickers.FileOpenPicker();
            var applicationData = Windows.Storage.ApplicationData.current;
            var localSettings = applicationData.localSettings;
            var sessionKey = localSettings.values["sessionKey"];
            openPicker.fileTypeFilter.append(".jpg");
            var successMessageDialog = new Windows.UI.Popups.MessageDialog("Снимките качени успешно!");
            var errorMessageDialog = new Windows.UI.Popups.MessageDialog("Проблем при качването!");
            openPicker.pickMultipleFilesAsync().then(function (files) {
                var done = false;
                for (var i = 0; i < files.length; i++) {
                    uploadImage(files[i]).then(function (image) {

                        WinJS.xhr({
                            type: "POST",
                            url: "http://100nationalplaces.apphb.com/api/users/addPicture/" + sessionKey + "?url=" + image,
                            headers: { "Content-type": "application/json" },
                        }).then(
                            function(success) {
                                done = true;
                                PicturesData.itemList.push({ picture: image });
                                //console.log(success.responseText);
                            },
                            function(error) {
                                done = false;
                                //console.log(error.responseText);
                            }).done(function() {
                                if (done) {
                                    showNotification("Снимкaтa каченa успешно!");
                                } else {
                                   
                                    showNotification("Проблем при качването!");
                                }
                            });
                            
                    });
                }
                
            });
        });
       
        var areShowed = false;
        document.getElementById("btnShowPictures").addEventListener("click", function() {
            
            if (!areShowed) {
                areShowed = true;
                document.getElementById("placesContent").style.visibility = "hidden";
                document.getElementById("placesContent").style.height = "0";

                var picturesContainer = document.getElementById("pictiresContainer");
                picturesContainer.style.visibility = "visible";
                document.getElementById("btnShowPictures").innerHTML = "Назад";
                
            } else {
                areShowed = false;
                document.getElementById("placesContent").style.visibility = "visible";
                document.getElementById("placesContent").style.height = "100%";
                var containerPictures = document.getElementById("pictiresContainer");
                containerPictures.style.visibility = "hidden";
                document.getElementById("btnShowPictures").innerHTML = "Снимки";
               
            }
            //args.setPromise(WinJS.UI.processAll());
        });

        //SHARE CODE
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", shareTextHandler);

        function shareTextHandler(e) {
            var request = e.request;
            request.data.properties.title = "";
            request.data.properties.description = "";
            request.data.setText("Въведете текст");
        }
    }
});

var uploadImage = function (storageFile) {
    return new WinJS.Promise(function (success) {
        var file = MSApp.createFileFromStorageFile(storageFile);

        if (!file || !file.type.match(/image.*/)) {
            return;
        }

        var fd = new FormData();
        fd.append("image", file);
        fd.append("key", "6528448c258cff474ca9701c5bab6927");
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://api.imgur.com/2/upload.json");

        xhr.onload = function () {
            var imgUrl = JSON.parse(xhr.responseText).upload.links.imgur_page + ".jpg";
            success(imgUrl);
        };

        xhr.send(fd);
    });
};

function showNotification (message) {

    var notifications = Windows.UI.Notifications;

    var template = notifications.ToastTemplateType.toastText01;
    var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);

    var toastTextElements = toastXml.getElementsByTagName("text");
    toastTextElements[0].innerText = message;
    var toast = new notifications.ToastNotification(toastXml);
    var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
    toastNotifier.show(toast);
};

var escapeSting = (function () {
    var chr = {
        '"': '&quot;', '&': '&amp;', "'": '&#39;',
        '/': '&#47;', '<': '&lt;', '>': '&gt;'
    };
    return function (text) {
        return text.replace(/[\"&'\/<>]/g, function (a) { return chr[a]; });
    };
}());

