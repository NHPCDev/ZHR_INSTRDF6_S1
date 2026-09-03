sap.ui.define([
    "com/nhpc/zhrinstrdf6s1/controller/BaseController",
    "com/nhpc/zhrinstrdf6s1/utils/formatter",
    "com/nhpc/zhrinstrdf6s1/utils/messenger",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/ui/table/Column",
    "sap/m/Label",
    "sap/m/Column",
    "sap/m/Text"
], (BaseController, formatter, messenger, Filter, FilterOperator, Spreadsheet, Fragment,JSONModel, SearchField, UIColumn, Label, MColumn, Text) => {
    "use strict";

    return BaseController.extend("com.nhpc.zhrinstrdf6s1.controller.Dashboard", {
        formatter: formatter,
        onInit() {
            this.getRouter().getRoute("RouteDashboard").attachPatternMatched(this._onRoutePatternMatched, this);
        },
        _onRoutePatternMatched: function (oEvent) {
            this.getModel().refresh();
            this.oEmployeeModel = new JSONModel(sap.ui.require.toUrl("com/nhpc/zhrinstrdf6s1/model") + "/employee.json");
            const oTable = this.byId("idDashboardTable");
            const oBinding = oTable.getBinding("rows");
            oBinding.attachEventOnce("dataReceived", () => {
                const iCount = oBinding.getLength();
                this.getModel("viewModel").setProperty("/dashboardCount", iCount);
                const oRowMode = oTable.getRowMode();
                if (iCount > 0) {
                    oRowMode.setRowCount(Math.min(iCount, 6));
                }
            });
        },
        onAddPress: function () {
            this.getRouter().navTo("RouteDetail", {
                employeeId: "New",
                Sno: "New"
            });
        },
        onListItemPress: function (oEvent) {
            const oTable = oEvent.getSource();
            const iRowIndex = oEvent.getParameter("rowIndex");
            const oContext = oTable.getContextByIndex(iRowIndex);
            if (!oContext) {
                return;
            }
            const sEmployeeId = oContext.getProperty("Pernr");
            const sSno = oContext.getProperty("Sno");
            this.getRouter().navTo("RouteDetail", {
                employeeId: sEmployeeId,
                Sno: sSno
            });
        },
        onSearchBtn: function (oEvent) {
            var oTable = this.byId("idDashboardTable");
            let oFilterData = this._getTableFilters();
            oTable.getBinding("rows").filter(oFilterData.aFilters);
            const oBinding = oTable.getBinding("rows");
            oBinding.attachEventOnce("dataReceived", () => {
                const iCount = oBinding.getLength();
                this.getModel("viewModel").setProperty("/dashboardCount", iCount);
                const oRowMode = oTable.getRowMode();
                if (iCount > 0) {
                    oRowMode.setRowCount(Math.min(iCount, 6));
                }
            });
        },
        _getTableFilters: function (oEvent) {
            var oViewModel = this.getModel("viewModel"),
                oFilterData = oViewModel.getProperty("/filterData"),
                aSearchFilter = [];
            if (oFilterData.Sno) {
                let aFilters = [];
                aFilters.push(new Filter("Sno", FilterOperator.Contains, oFilterData.Sno));
                aSearchFilter.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
            if (oFilterData.Pernr) {
                let aFilters = [];
                aFilters.push(new Filter("Pernr", FilterOperator.Contains, oFilterData.Pernr));
                aSearchFilter.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
            if (oFilterData.Createdon) {
                let aFilters = [];
                aFilters.push(new Filter("Createdon", FilterOperator.EQ, oFilterData.Createdon));
                aSearchFilter.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
            if (oFilterData.Status) {
                let aFilters = [];
                aFilters.push(new Filter("Status", FilterOperator.EQ, oFilterData.Status));
                aSearchFilter.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
            return {
                aFilters: [new Filter({
                    filters: aSearchFilter,
                    and: true
                })]
            }
        },
        onDownload: function () {
            var oTable = this.byId("idDashboardTable");
            var oBinding = oTable.getBinding("rows");
            var aData = oBinding.getContexts().map(function (oContext) {
                var oData = Object.assign({}, oContext.getObject());
                oData.Waivercommdate = formatter.formatDate(oData.Waivercommdate);
                oData.Createdon = formatter.formatDate(oData.Createdon);
                return oData;
            });
            var aCols = this.createColumnConfig();
            var oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileType: "xlsx",
                fileName: this.getResourceBundle().getText("title")
            };
            var oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .finally(function () {
                    oSheet.destroy();
                });
        },
        createColumnConfig: function () {
            var aCols = [];
            aCols.push({
                label: this.getResourceBundle().getText("sno"),
                property: "Sno"
            });
            aCols.push({
                label: this.getResourceBundle().getText("empNo"),
                property: "Pernr"
            });
            aCols.push({
                label: this.getResourceBundle().getText("name"),
                property: "Empname"
            });
            aCols.push({
                label: this.getResourceBundle().getText("designation"),
                property: "Designation"
            });
            aCols.push({
                label: this.getResourceBundle().getText("department"),
                property: "Dept"
            });
            aCols.push({
                label: this.getResourceBundle().getText("nameOfTheImmediateRelative"),
                property: "Relativename"
            });
            aCols.push({
                label: this.getResourceBundle().getText("numberOfSharesSecurities"),
                property: "Shareno"
            });
            aCols.push({
                label: this.getResourceBundle().getText("considerationValue"),
                property: "Considrationvalue"
            });
            aCols.push({
                label: this.getResourceBundle().getText("reasonsForWaiver"),
                property: "Waiverreason"
            });
            aCols.push({
                label: this.getResourceBundle().getText("dateOfCommunication"),
                property: "Waivercommdate"
            });
            aCols.push({
                label: this.getResourceBundle().getText("remarks"),
                property: "Remarks"
            });
            aCols.push({
                label: this.getResourceBundle().getText("createdOn"),
                property: "Createdon"
            });
            aCols.push({
                label: this.getResourceBundle().getText("status"),
                property: "Status"
            });
            return aCols;
        },
        onValueHelpOkPress: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            var sValueHelpName = oEvent.getSource().sValueHelpName;
            var oValueHelp = this.fnGetValueHelpDetails(sValueHelpName);
            var oViewModel = this.getModel("viewModel");

            if (aTokens) {
                if (sValueHelpName == "EmployeeNumber") {
                    let Empid = aTokens[0].getCustomData()[0].getValue().Empid;
                    oViewModel.setProperty("/filterData/Pernr", Empid);
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
                            .setProperty("/filterData/Pernr", oData.results[0].Empid);
                    } else {
                        oInput.setValue("");
                        this.getModel("viewModel")
                            .setProperty("/filterData/Pernr", "");
                    }
                }.bind(this),
                error: function () {
                    oInput.setValue("");
                    this.getModel("viewModel")
                        .setProperty("/filterData/Pernr", "");
                }.bind(this)
            });
        },
    });
});