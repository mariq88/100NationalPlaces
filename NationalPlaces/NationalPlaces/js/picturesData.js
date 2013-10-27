(function () {
    "use strict";
    var dataArray = [];
    var itemList = new WinJS.Binding.List(dataArray);
    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var sessionKey = localSettings.values["sessionKey"];
    WinJS.xhr({
        type: "GET",
        url: "http://100nationalplaces.apphb.com/api/users/getPictures/"+sessionKey,
        headers: { "Content-type": "application/json" },
    }).done(
              function (success) {
                  var pics = JSON.parse(success.responseText);
                  for (var i = 0; i < pics.length; i++) {
                      itemList.push({ picture: pics[i] });
                  }
                  
              },
               function (error) {
                   console.log(error.responseText);
               });

    

    WinJS.Namespace.define("PicturesData", {
        itemList: itemList
    });

})();