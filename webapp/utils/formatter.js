sap.ui.define(["sap/ui/core/IconPool",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
], function (IconPool, NumberFormat, DateFormat) {
    'use strict';

    return {
        formatAttachmentIcon: function (mime) {
            if (mime !== null || mime !== "") {
                return sap.ui.core.IconPool.getIconForMimeType(mime);
            }
        },
        formatStatusState: function (status) {
            if (status) {
                if (status === "02" || status === "Submitted") {
                    return "Success";
                } else if (status === "New") {
                    return "Information";
                } else if (status === "01" || status === "Pending") {
                    return "Warning";
                } else {
                    return "Warning"
                }
            }
        },
        formatDate: function (sDate) {
            if (sDate) {
                if (sDate.length === 8) {
                    var sYear = sDate.substring(0, 4);
                    var sMonth = sDate.substring(4, 6);
                    var sDay = sDate.substring(6, 8);
                    return sDay + "." + sMonth + "." + sYear;
                } else {
                    return sDate;
                }
            }
            return "";
        },
        formatTime: function (sTime) {
            if (sTime) {
                if (sTime.length === 6) {
                    var sHours = sTime.substring(0, 2);
                    var sMinutes = sTime.substring(2, 4);
                    var sSeconds = sTime.substring(4, 6);
                    return sHours + ":" + sMinutes + ":" + sSeconds;
                } else {
                    return sTime;
                }
            }
            return "";
        },
        formatBlankValue: function (value) {
            if (!value) {
                return "-";
            } else {
                return value;
            }
        },
        formatAmountToINR: function (sValue) {
            if (!sValue) return "";
            // Convert string to number and format as INR
            var oLocale = new sap.ui.core.Locale("en-IN");
            var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                decimals: 2
            }, oLocale);

            return oCurrencyFormat.format(parseFloat(sValue), "INR");
        },
        formatNumbers: function(sValue){
            let sNumber = Number(sValue)?.toString();
            if(sNumber){
                return sNumber;
            }
            return sValue
        }
    }
});