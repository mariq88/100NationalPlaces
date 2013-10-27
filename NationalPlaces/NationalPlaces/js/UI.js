/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
var ui = WinJS.Namespace.define("UI", {
    generateUI: function () {
        var applicationData = Windows.Storage.ApplicationData.current;
        var localSettings = applicationData.localSettings;

        var sessionKey = localSettings.values["sessionKey"];

        if (sessionKey == null || sessionKey == "") {
            var messageDialog = new Windows.UI.Popups.MessageDialog("Не сте влезли в профила си.");
            messageDialog.commands.append(new Windows.UI.Popups.UICommand("Вход", function () {
                document.getElementById("loginForm").style.display = "block";
            }));
            messageDialog.commands.append(new Windows.UI.Popups.UICommand("Регистрация", function () {
                document.getElementById("loginForm").style.display = "none";
                document.getElementById("registerForm").style.display = "block";
            }));
            messageDialog.commands.append(new Windows.UI.Popups.UICommand("Продължи без логин", function () {
                document.getElementById("loginForm").style.display = "none";
                document.getElementById("registerForm").style.display = "none";
                document.getElementById("placesContent").style.visibility = "visible";
            }));
            messageDialog.showAsync();
        }
        else {
         
            document.getElementById("registerForm").style.display = "none";
            document.getElementById("loginForm").style.display = "none";
            document.getElementById("placesContent").style.visibility = "visible";
            document.getElementById("appBarContainer").style.display = "block";
        }
    }
});