sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime information for the device the UI5 app is running on as a JSONModel.
             * @returns {sap.ui.model.json.JSONModel} The device model.
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            createViewModel: function () {
                var oViewModel = new JSONModel({
                    dashboardCount: 0,
                    filterData: {
                        "Sno": "",
                        "Pernr": null,
                        "Createdon": null,
                        "Status": "",
                    },
                    formDetails: {
                        Status: "",
                        StatusText: ""
                    },
                    valueState: {
                        Pernr:"None",
                        Empname:"None",
                        ShareNo: "None",
                        ConsiderationValue: "None",
                        Remarks: "None",
                        Waivercommdate: "None",
                        Waiverreason: "None",
                        Relativename: "None"
                    },
                    valueStateText: {
                        Pernr:"",
                        Empname:"",
                        ShareNo: "",
                        ConsiderationValue: "",
                        Remarks: "",
                        Waivercommdate: "",
                        Waiverreason: "",
                        Relativename: ""
                    }
                });
                oViewModel.setDefaultBindingMode("TwoWay");
                return oViewModel;
            },
        };

    });