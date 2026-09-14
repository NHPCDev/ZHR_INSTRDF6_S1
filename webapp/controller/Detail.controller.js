sap.ui.define([
    "com/nhpc/zhrinstrdf6s1/controller/BaseController",
    "com/nhpc/zhrinstrdf6s1/utils/formatter",
    "com/nhpc/zhrinstrdf6s1/utils/messenger",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/ui/table/Column",
    "sap/m/Label",
    "sap/m/Column",
    "sap/m/Text"
], (BaseController, formatter, messenger, BusyIndicator, Filter, FilterOperator, NumberFormat, JSONModel, SearchField, UIColumn, Label, MColumn, Text) => {
    "use strict";

    return BaseController.extend("com.nhpc.zhrinstrdf6s1.controller.Detail", {
        formatter: formatter,
        onInit() {
            this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onRoutePatternMatched, this);
        },
        _onRoutePatternMatched: async function (oEvent) {
            let oArgs = oEvent.getParameter("arguments");
            this.oEmployeeModel = new JSONModel(sap.ui.require.toUrl("com/nhpc/zhrinstrdf6s1/model") + "/employee.json");
            let sEmployeeId = oArgs.employeeId;
            let sSno = oArgs.Sno;
            if (!sEmployeeId || !sSno) {
                messenger.error(this.getResourceBundle().getText("InvalidRouteParameters"), () => {
                    this.getRouter().navTo("RouteDashboard", {}, {}, true);
                });
                return;
            }
            let oViewModel = this.getModel("viewModel");
            oViewModel.setProperty("/EmployeeId", sEmployeeId);
            oViewModel.setProperty("/Sno", sSno);
            BusyIndicator.show(0);
            try {
                await this.resetValueStates();
                await this.getDefaultEmployeeDetails();
                const oBinding = this.byId("idRelativeName").getBinding("items");
                let sPernrName = sEmployeeId;
                if (sPernrName) {
                    await new Promise((resolve) => {
                        oBinding.attachEventOnce("dataReceived", resolve);
                        oBinding.filter([
                            new Filter(
                                "Pernr",
                                FilterOperator.EQ,
                                sPernrName
                            )
                        ]);
                    });
                } else {
                    oBinding.filter([]);
                }
                await this.setTransactionData();
            } catch (error) {
                messenger.error(error, () => {
                    this.getRouter().navTo("RouteDashboard", {}, {}, true);
                });
            } finally {
                BusyIndicator.hide();
            }
        },
        resetValueStates: function () {
            let oViewModel = this.getModel("viewModel");
            oViewModel.setProperty("/valueState", {
                Pernr: "None",
                Empname: "None",
                ShareNo: "None",
                ConsiderationValue: "None",
                Remarks: "None"
            });
            oViewModel.setProperty("/valueStateText", {
                Pernr: "",
                Empname: "",
                ShareNo: "",
                ConsiderationValue: "",
                Remarks: ""
            });
        },
        getDefaultEmployeeDetails: async function () {
            let oModel = this.getModel(),
                oViewModel = this.getModel("viewModel"),
                Createdby = oViewModel.getProperty("/formDetails/Createdby") || "X";
            let aFilters = [];
            if (Createdby !== "X") {
                aFilters = [
                    new Filter(
                        "USRID",
                        FilterOperator.EQ,
                        Createdby
                    )
                ];
            } else {
                aFilters = [
                    new Filter(
                        "DFLT",
                        FilterOperator.EQ,
                        Createdby
                    )
                ];
            }
            return new Promise((resolve, reject) => {
                oModel.read("/ZFI_GH_USER_F4", {
                    filters: aFilters,
                    success: function (oResp) {
                        if (oResp.results && oResp.results.length > 0) {
                            var oViewModel = this.getModel("viewModel");
                            oViewModel.setProperty("/formDetails/EmployeeId", oResp.results[0].PERNR);
                            oViewModel.setProperty("/formDetails/EmployeeName", oResp.results[0].ENAME);
                            oViewModel.setProperty("/formDetails/CompanyCode", oResp.results[0].BUKRS);
                            oViewModel.setProperty("/formDetails/EmployeeGrade", oResp.results[0].GRADE);
                            oViewModel.setProperty("/formDetails/EmployeeSubgrp", oResp.results[0].SUB_GROUP);
                            oViewModel.setProperty("/formDetails/EmployeeSubgrpText", oResp.results[0].GRADE);
                            oViewModel.setProperty("/formDetails/PersonnelSubArea", oResp.results[0].WERKS);
                            oViewModel.setProperty("/formDetails/PersonnelSubAreaText", oResp.results[0].PLANT);
                            oViewModel.setProperty("/formDetails/EmployeeDepartment", `${oResp.results[0].DEP_CODE} - ${oResp.results[0].DEP}`);
                            oViewModel.setProperty("/formDetails/PositionText", oResp.results[0].DESIG);
                        }
                        resolve();
                    }.bind(this),
                    error: function (oError) {
                        messenger.error(JSON.parse(oError.responseText).error.message.value, function () {
                            this.getRouter().navTo("RouteDashboard", {}, {}, true);
                        }.bind(this));
                        reject(oError);
                    }.bind(this)
                });
            });
        },
        setTransactionData: async function () {
            let oModel = this.getModel(),
                oViewModel = this.getModel("viewModel"),
                oResourceBundle = this.getResourceBundle(),
                Sno = oViewModel.getProperty("/Sno"),
                sEmployeeId = oViewModel.getProperty("/EmployeeId");
            let aFilters = [
                new Filter(
                    "Sno",
                    FilterOperator.EQ,
                    Sno
                ),
                new Filter(
                    "Pernr",
                    FilterOperator.EQ,
                    sEmployeeId
                )
            ];
            if (sEmployeeId !== "New") {
                this.byId("objPageHeader").setText(oResourceBundle.getText("detailPageTitle", Sno));
                this.byId("objPageHeader1").setText(oResourceBundle.getText("detailPageTitle", Sno));
                await new Promise((resolve, reject) => {
                    oModel.read(`/WaiverregisterSet`, {
                        filters: aFilters,
                        success: function (oResp) {
                            if (oResp) {
                                oViewModel.setProperty("/formDetails", oResp.results[0]);
                                oViewModel.setProperty("/formDetails/Shareno", Number(oResp.results[0].Shareno)?.toString())
                            }
                            resolve();
                        },
                        error: function (oError) {
                            messenger.error(JSON.parse(oError.responseText).error.message.value, function () {
                                this.getRouter().navTo("RouteDashboard", {}, {}, true);
                            }.bind(this));
                            reject(oError);
                        }
                    });
                });
            } else {
                oViewModel.setProperty("/formDetails", {
                    Status: "New"
                });
                this.byId("objPageHeader").setText(oResourceBundle.getText("createManageWaiverRequest"));
                this.byId("objPageHeader1").setText(oResourceBundle.getText("createManageWaiverRequest"));
                return;
            }
        },
        handleSubmitBtnPress: function (oEvent) {
            var oResourceBundle = this.getResourceBundle(),
                sTitle = oResourceBundle.getText("CONFIRM_TITLE"),
                sText = oResourceBundle.getText("CONFIRM_TEXT_FINAL_REQUEST"),
                bProceed = this.validateSubmitRequestDetails();
            var oModel = this.getModel();
            if (bProceed) {
                messenger.confirm(sTitle, sText, "Confirm", null, function () {
                    BusyIndicator.show(0);
                    this.sActionFlag = "Submitted";
                    let oPayload = this.createRequestPayload();
                    oModel.create("/WaiverregisterSet", oPayload, {
                        success: function (oResp) {
                            BusyIndicator.hide();
                            messenger.success(oResourceBundle.getText("manageWaiverFinalSuccessMsg", oResp.Sno), () => {
                                this.getRouter().navTo("RouteDashboard", {}, {}, true);
                            });
                        }.bind(this),
                        error: function (oError) {
                            BusyIndicator.hide();
                            messenger.error(JSON.parse(oError.responseText).error.message.value);
                        }.bind(this)
                    });
                }.bind(this));
            }
        },
        handleSaveBtnPress: function (oEvent) {
            var oResourceBundle = this.getResourceBundle(),
                sTitle = oResourceBundle.getText("CONFIRM_TITLE"),
                sText = oResourceBundle.getText("CONFIRM_TEXT_SAVE_REQUEST");
            var oModel = this.getModel();
            messenger.confirm(sTitle, sText, "Confirm", null, function () {
                BusyIndicator.show(0);
                this.sActionFlag = "Saved";
                let oPayload = this.createRequestPayload();
                oModel.create("/WaiverregisterSet", oPayload, {
                    success: function (oResp) {
                        BusyIndicator.hide();
                        messenger.success(oResourceBundle.getText("manageWaiverFinalSaveMsg", oResp.Sno), () => {
                            this.getRouter().navTo("RouteDashboard", {}, {}, true);
                        });
                    }.bind(this),
                    error: function (oError) {
                        BusyIndicator.hide();
                        messenger.error(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this)
                });
            }.bind(this));
        },
        createRequestPayload: function () {
            var oViewModel = this.getModel("viewModel"),
                oFormDetails = oViewModel.getProperty("/formDetails");
            var oPayload = {
                Status: this.sActionFlag,
                Pernr: oFormDetails.Pernr,
                Empname: oFormDetails.Empname,
                Designation: oFormDetails.Designation,
                Dept: oFormDetails.Dept,
                Relativename: oFormDetails.Relativename,
                Shareno: oFormDetails.Shareno,
                Considrationvalue: oFormDetails.Considrationvalue,
                Waiverreason: oFormDetails.Waiverreason,
                Waivercommdate: oFormDetails.Waivercommdate,
                Remarks: oFormDetails.Remarks,
                RelativePAN: oFormDetails.RelativePAN,
                DateprvTxn: oFormDetails.DateprvTxn,
                NatureprvTxn: oFormDetails.NatureprvTxn,
                NatureofSecurity: oFormDetails.NatureofSecurity,
                WaiverReqDate: oFormDetails.WaiverReqDate
            };
            if (oFormDetails.Sno) {
                oPayload.Sno = oFormDetails.Sno;
            }
            return oPayload;
        },
        validateSubmitRequestDetails: function () {
            const oViewModel = this.getModel("viewModel");
            const oResourceBundle = this.getResourceBundle();
            const oFormDetails = oViewModel.getProperty("/formDetails");
            const aErrors = [];
            if (!oFormDetails.Pernr) {
                aErrors.push(oResourceBundle.getText("pernrNoErrorMsg"));
                oViewModel.setProperty("/valueState/Pernr", "Error");
                oViewModel.setProperty("/valueStateText/Pernr", oResourceBundle.getText("pernrNoErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/Pernr", "None");
                oViewModel.setProperty("/valueStateText/Pernr", "");
            }
            if (!oFormDetails.Empname) {
                aErrors.push(oResourceBundle.getText("empNameErrorMsg"));
                oViewModel.setProperty("/valueState/Empname", "Error");
                oViewModel.setProperty("/valueStateText/Empname", oResourceBundle.getText("empNameErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/Empname", "None");
                oViewModel.setProperty("/valueStateText/Empname", "");
            }
            if (!oFormDetails.Shareno) {
                aErrors.push(oResourceBundle.getText("shareNoErrorMsg"));
                oViewModel.setProperty("/valueState/ShareNo", "Error");
                oViewModel.setProperty("/valueStateText/ShareNo", oResourceBundle.getText("shareNoErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/ShareNo", "None");
                oViewModel.setProperty("/valueStateText/ShareNo", "");
            }
            if (!oFormDetails.Considrationvalue) {
                aErrors.push(oResourceBundle.getText("considerationValueErrorMsg"));
                oViewModel.setProperty("/valueState/ConsiderationValue", "Error");
                oViewModel.setProperty("/valueStateText/ConsiderationValue", oResourceBundle.getText("considerationValueErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/ConsiderationValue", "None");
                oViewModel.setProperty("/valueStateText/ConsiderationValue", "");
            }
            if (!oFormDetails.Remarks) {
                aErrors.push(oResourceBundle.getText("remarksErrorMsg"));
                oViewModel.setProperty("/valueState/Remarks", "Error");
                oViewModel.setProperty("/valueStateText/Remarks", oResourceBundle.getText("remarksErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/Remarks", "None");
                oViewModel.setProperty("/valueStateText/Remarks", "");
            }
            if (!oFormDetails.Relativename) {
                aErrors.push(oResourceBundle.getText("relativeNameErrorMsg"));
                oViewModel.setProperty("/valueState/Relativename", "Error");
                oViewModel.setProperty("/valueStateText/Relativename", oResourceBundle.getText("relativeNameErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/Relativename", "None");
                oViewModel.setProperty("/valueStateText/Relativename", "");
            }
            if (!oFormDetails.Waiverreason) {
                aErrors.push(oResourceBundle.getText("waiverReasonErrorMsg"));
                oViewModel.setProperty("/valueState/Waiverreason", "Error");
                oViewModel.setProperty("/valueStateText/Waiverreason", oResourceBundle.getText("waiverReasonErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/Waiverreason", "None");
                oViewModel.setProperty("/valueStateText/Waiverreason", "");
            }
            if (!oFormDetails.Waivercommdate) {
                aErrors.push(oResourceBundle.getText("waiverCommdateErrorMsg"));
                oViewModel.setProperty("/valueState/Waivercommdate", "Error");
                oViewModel.setProperty("/valueStateText/Waivercommdate", oResourceBundle.getText("waiverCommdateErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/Waivercommdate", "None");
                oViewModel.setProperty("/valueStateText/Waivercommdate", "");
            }
            if (!oFormDetails.DateprvTxn) {
                aErrors.push(oResourceBundle.getText("dateOfPrvTxnErrorMsg"));
                oViewModel.setProperty("/valueState/DateprvTxn", "Error");
                oViewModel.setProperty("/valueStateText/DateprvTxn", oResourceBundle.getText("dateOfPrvTxnErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/DateprvTxn", "None");
                oViewModel.setProperty("/valueStateText/DateprvTxn", "");
            }
            if (!oFormDetails.NatureprvTxn) {
                aErrors.push(oResourceBundle.getText("natureOfPrvTxnErrorMsg"));
                oViewModel.setProperty("/valueState/NatureprvTxn", "Error");
                oViewModel.setProperty("/valueStateText/NatureprvTxn", oResourceBundle.getText("natureOfPrvTxnErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/NatureprvTxn", "None");
                oViewModel.setProperty("/valueStateText/NatureprvTxn", "");
            }
            if (!oFormDetails.NatureofSecurity) {
                aErrors.push(oResourceBundle.getText("natureOfSecuritiesErrorMsg"));
                oViewModel.setProperty("/valueState/NatureofSecurity", "Error");
                oViewModel.setProperty("/valueStateText/NatureofSecurity", oResourceBundle.getText("natureOfSecuritiesErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/NatureofSecurity", "None");
                oViewModel.setProperty("/valueStateText/NatureofSecurity", "");
            }
            if (!oFormDetails.WaiverReqDate) {
                aErrors.push(oResourceBundle.getText("dateOfWaiverRequestErrorMsg"));
                oViewModel.setProperty("/valueState/WaiverReqDate", "Error");
                oViewModel.setProperty("/valueStateText/WaiverReqDate", oResourceBundle.getText("dateOfWaiverRequestErrorMsg"));
            } else {
                oViewModel.setProperty("/valueState/WaiverReqDate", "None");
                oViewModel.setProperty("/valueStateText/WaiverReqDate", "");
            }
            if (aErrors.length > 0) {
                messenger.error(oResourceBundle.getText("validationErrorMsg"));
                return false;
            }
            return true;
        },
        onAmountChange: function (oEvent) {
            var oSrc = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                oResourceBundle = this.getResourceBundle(),
                oFormatter = NumberFormat.getCurrencyInstance(),
                oViewModel = this.getModel("viewModel"),
                sPath = oSrc.data("path");
            if (!sValue) {
                return;
            }
            oViewModel.setProperty("/valueState/ConsiderationValue", "None");
            oViewModel.setProperty("/valueStateText/ConsiderationValue", "");

            let sParsedValue = sValue;
            if (sParsedValue.includes("INR")) {
                const aParsed = oFormatter.parse(sParsedValue);
                sParsedValue = aParsed ? aParsed[0].toString() : "";
            }
            const oRegex = /^\d+(\.\d{0,2})?$/
            if (!oRegex.test(sParsedValue)) {
                oSrc.setValue("");
                oViewModel.setProperty("/formDetails/Considrationvalue", "");
                oViewModel.setProperty("/valueState/ConsiderationValue", "Error");
                oViewModel.setProperty("/valueStateText/ConsiderationValue", oResourceBundle.getText("errMsgPositiveValue"));
                messenger.error(
                    oResourceBundle.getText("errMsgPositiveValue")
                );
                return;
            }
            let sFormattedValue = parseFloat(sParsedValue)
                .toFixed(2)
                .toString();
            oSrc.setValue(
                formatter.formatAmountToINR(sFormattedValue)
            );
            if (sPath) {
                oViewModel.setProperty(sPath, sFormattedValue);
            }
        },
        onValueHelpOkPress: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            var sValueHelpName = oEvent.getSource().sValueHelpName;
            var oValueHelp = this.fnGetValueHelpDetails(sValueHelpName);
            var oViewModel = this.getModel("viewModel");
            if (aTokens) {
                if (sValueHelpName == "EmployeeNumber") {
                    let Empid = aTokens[0].getCustomData()[0].getValue().Empid;
                    oViewModel.setProperty("/formDetails/Pernr", Empid);
                    this.onPernrSelect(Empid);
                }
            }
            this._oValueHelpDialog.close();
        },
        onValueHelpCancelPress: function () {
            this._oValueHelpDialog.close();
        },
        onValueHelpAfterClose: function () {
            this._oValueHelpDialog.destroy();
        },
        onValueHelpRequest: function (oEvent) {
            var oController = this;
            let oSource = oEvent.getSource();
            oController._currInputId = oSource.getId();
            oController._currSource = oSource;
            var sValueHelpName = oSource.data("valuehelp");
            var oValueHelp = this.fnGetValueHelpDetails(sValueHelpName);
            var aCols = oValueHelp.model.getData().cols;
            this._oBasicSearchField = new SearchField();
            this.loadFragment({
                name: oValueHelp.ValueHelpFragmentPath,
            }).then(function (oDialog) {

                this._oValueHelpDialog = oDialog;
                this.getView().addDependent(this._oValueHelpDialog);

                var oFilterBar = this._oValueHelpDialog.getFilterBar();
                // Set Basic Search for FilterBar
                oFilterBar.setFilterBarExpanded(false);
                oFilterBar.setBasicSearch(this._oBasicSearchField);

                // Trigger filter bar search when the basic search is fired
                this._oBasicSearchField.attachSearch(function (oEvent) {
                    oController.onFilterSearch(oEvent, sValueHelpName);
                });
                this._oBasicSearchField.setMaxLength(oValueHelp.maxLength);
                //this._oBasicSearchField.setPlaceholder("Please Provide "+sValueHelpName);
                this._configureProperties(this._oValueHelpDialog, sValueHelpName);

                this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.getModel());
                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", {
                            path: oValueHelp.bindingpath,
                            events: {
                                dataReceived: function () {
                                    oController._oValueHelpDialog.update();
                                }
                            }
                        });
                        for (var i = 0; i < aCols.length; i++) {
                            var oCol = aCols[i];
                            var oText = new Text({
                                text: {
                                    path: oCol.template
                                },
                                wrapping: false
                            });
                            var oColumn = new UIColumn({
                                label: new Label({
                                    text: oCol.label
                                }),
                                template: oText
                            });
                            oTable.addColumn(oColumn);
                        }
                    }

                    // For Mobile the default table is sap.m.Table

                    if (oTable.bindItems) {
                        // Bind items to the ODataModel and add columns
                        oTable.bindAggregation("items", {
                            path: oValueHelp.bindingpath,
                            template: new ColumnListItem({
                                //cells: [new Label({text: "{ProductCode}"}), new Label({text: "{ProductName}"})]
                                cells: [aCols.map(function (column) { return new Label({ text: "{" + column.template + "}" }) })]
                            }),
                            events: {
                                dataReceived: function () {
                                    oController._oValueHelpDialog.update();
                                }
                            }
                        });
                        for (var i = 0; i < aCols.length; i++) {
                            let labelText = aCols[i].label;
                            let tableColumn = new MColumn({ header: new Label({ text: labelText }) });
                            oTable.addColumn(tableColumn);
                        }
                    }
                    this._oValueHelpDialog.update();
                }.bind(this));


                //this._oValueHelpDialog.setTokens(oValueHelp.input.getTokens());
                this._oValueHelpDialog.open();

            }.bind(this));

        },
        fnGetValueHelpDetails: function (sValueHelp) {
            var oValueHelp = {};
            var sPath = "com.nhpc.zhrinstrdf6s1.";
            var sMultiInputValueHelpFragmentPath = "fragment.MultiInputValueHelp";
            var oLocationPath = '/ZHR_CDS_IT_EMPLOYEE_F4H';
            if (sValueHelp === "EmployeeNumber") {
                oValueHelp = {
                    "model": this.oEmployeeModel,
                    "ValueHelpFragmentPath": sPath + sMultiInputValueHelpFragmentPath,
                    "bindingpath": oLocationPath,
                    "input": this._currSource,
                    "maxLength": 100
                }
            }
            return oValueHelp;
        },
        _configureProperties: function (oValueHelp, sValueHelp) {
            oValueHelp.sValueHelpName = sValueHelp;
            if (sValueHelp === 'EmployeeNumber') {
                oValueHelp.setTitle("EmployeeNumber");
                oValueHelp.setKey("Empid");
                oValueHelp.setDescriptionKey("FullName");
                oValueHelp.setSupportMultiselect(false);
                oValueHelp.setSupportRanges(false);
            }
        },
        //Event triggerd on click of Go in Value help Search Filters              
        onFilterBarSearch: function (oEvent) {
            var sValueHelpName = oEvent.getSource().getParent().getParent().getParent().getParent().sValueHelpName;
            var sSearchQuery = this._oBasicSearchField.getValue()
            this._performVHSearch(sSearchQuery, sValueHelpName);
        },

        //Event triggered for Search bar in valuehelp of Filters                
        onFilterSearch: function (oEvent, valuehelpname) {
            let sValue = oEvent.getSource().getValue();
            this._performVHSearch(sValue, valuehelpname)
        },
        _performVHSearch: function (sValue, sValueHelpName) {
            if (sValueHelpName === "EmployeeNumber") {
                var oFilter = new Filter({
                    filters: [
                        new Filter({
                            path: "Empid",
                            operator: FilterOperator.Contains,
                            value1: sValue
                        }),
                        new Filter({
                            path: "FullName",
                            operator: FilterOperator.Contains,
                            value1: sValue
                        })
                    ],
                    and: false
                });

                this._filterTable(oFilter);
            }
        },
        _filterTable: function (oFilter) {
            var oValueHelpDialog = this._oValueHelpDialog;
            oValueHelpDialog.getTableAsync().then(function (oTable) {
                if (oTable.bindRows) {
                    oTable.getBinding("rows").filter(oFilter);
                }

                if (oTable.bindItems) {
                    oTable.getBinding("items").filter(oFilter);
                }

                oValueHelpDialog.update();
            });
        },
        onValueHelpChange: function (oEvent) {
            var sEmpId = oEvent.getParameter("value");
            var oInput = oEvent.getSource();
            if (!sEmpId) {
                this.getModel("filterModel").setProperty("/EmpId", "");
                return;
            }
            if (!/^\d+$/.test(sEmpId)) {
                oInput.setValue("");
                this.getModel("filterModel").setProperty("/EmpId", "");
                return;
            }
            this.getModel().read("/ZHR_CDS_IT_EMPLOYEE_F4H", {
                filters: [
                    new Filter(
                        "Empid",
                        FilterOperator.EQ,
                        sEmpId
                    )
                ],
                success: function (oData) {
                    if (oData.results.length > 0) {
                        this.getModel("viewModel")
                            .setProperty("/formDetails/Pernr", oData.results[0].Empid);
                        this.onPernrSelect(oData.results[0].Empid);
                    } else {
                        oInput.setValue("");
                        this.getModel("viewModel")
                            .setProperty("/formDetails/Pernr", "");
                    }
                }.bind(this),
                error: function () {
                    oInput.setValue("");
                    this.getModel("viewModel")
                        .setProperty("/formDetails/Pernr", "");
                }.bind(this)
            });
        },
        onPernrSelect: function (sPernr) {
            let sValue = sPernr;
            const oBinding = this.byId("idRelativeName").getBinding("items");
            if (sPernr) {
                oBinding.filter([
                    new Filter(
                        "Pernr",
                        FilterOperator.EQ,
                        sPernr
                    )
                ]);
            } else {
                oBinding.filter([]);
            }
            let oModel = this.getModel(),
                oViewModel = this.getModel("viewModel"),
                Createdby = oViewModel.getProperty("/formDetails/Createdby") || "X";
            let aFilters = [
                new Filter(
                    "PERNR",
                    FilterOperator.EQ,
                    sValue
                )
            ];
            return new Promise((resolve, reject) => {
                BusyIndicator.show(0);
                oModel.read("/ZFI_GH_USER_F4", {
                    filters: aFilters,
                    success: function (oResp) {
                        if (oResp.results && oResp.results.length > 0) {
                            oViewModel.setProperty("/formDetails/Pernr", oResp.results[0].PERNR);
                            oViewModel.setProperty("/formDetails/Empname", oResp.results[0].ENAME);
                            oViewModel.setProperty("/formDetails/Designation", oResp.results[0].DESIG);
                            oViewModel.setProperty("/formDetails/Dept", `${oResp.results[0].DEP_CODE} - ${oResp.results[0].DEP}`);
                            oViewModel.setProperty("/valueState/Pernr", "None");
                            oViewModel.setProperty("/valueStateText/Pernr", "");
                        }
                        BusyIndicator.hide();
                        resolve();
                    }.bind(this),
                    error: function (oError) {
                        oViewModel.setProperty("/formDetails/Pernr", "");
                        oViewModel.setProperty("/formDetails/Empname", "");
                        oViewModel.setProperty("/formDetails/Designation", "");
                        oViewModel.setProperty("/formDetails/Dept", "");
                        BusyIndicator.hide();
                        messenger.error(JSON.parse(oError.responseText).error.message.value, function () {
                            this.getRouter().navTo("RouteDashboard", {}, {}, true);
                        }.bind(this));
                        reject(oError);
                    }.bind(this)
                });
            });
        },
        onRelativeChange: async function (oEvent) {
            await this.onComboboxChange(oEvent);
            let that = this;
            let oModel = this.getModel();
            let oViewModel = this.getModel("viewModel");
            let sRelative = oEvent.getSource().getSelectedKey().trim();
            if (!sRelative) {
                return;
            }
            var oData = oEvent.getSource().getSelectedItem()?.getBindingContext().getObject();
            oViewModel.setProperty("/formDetails/RelativePAN", oData.PanOfImmediateRelative);

        },
    });
});