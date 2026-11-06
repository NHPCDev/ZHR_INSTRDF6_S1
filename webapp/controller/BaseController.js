sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/nhpc/zhrinstrdf6s1/utils/messenger",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/Fragment",
    "sap/m/SearchField",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/MessageBox"
],
    /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       */
    function (
        Controller,
        messenger,
        BusyIndicator,
        Filter,
        FilterOperator,
        ValueState,
        DateFormat,
        Fragment,
        SearchField,
        SelectDialog,
        StandardListItem,
        Column,
        MColumn,
        ColumnListItem,
        Label,
        Text,
        MessageBox
    ) {
        "use strict";

        return Controller.extend("com.nhpc.zhrinstprcls1.controller.BaseController", {

            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },

            /* =========================================================== */
            /* Model Methods                                              */
            /* =========================================================== */

            /**
             * Convenience method for getting the view model by name.
             * @public
             * @param {string} [sName] the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {

                if (this.getView()) {
                    var oModel = this.getView().getModel(sName);
                    if (oModel) {
                        return oModel;
                    }
                }

                return this.getOwnerComponent().getModel(sName);
            },

            /**
             * Convenience method for setting the view model.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Clears model and specific property if provided
             * @param {string} sModelName Model name
             * @param {string} sProperty Property
             * @public
             */
            clearModel: function (sModelName, sProperty) { },

            /**
             * Getter for the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            fileNameLengthExceeded: function () {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                messenger.error(oResourceBundle.getText("FileLengthExceededErrMsg"), () => { });
            },

            onFileSizeExceed: function (oEvent) {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("fileSizeExceedErrorMsg"), () => { });
            },
            getText: function (sKey, aArgs) {
                return this.getResourceBundle().getText(sKey, aArgs);
            },
            navTo: function (sRoute, oParameters) {
                this.getRouter().navTo(sRoute, oParameters);
            },
            onFileTypeMismatch: function (oEvent) {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("fileTypeMisMatchErrorMsg"), () => { });
            },

            formatDate: function (oDate) {
                var oDateFormat = DateFormat.getDateInstance({
                    pattern: "dd.MM.yyyyy"
                });
                return oDateFormat.format(oDate);
            },

            showSuccess: function (oResp) {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                var sSuccessTxt = oResourceBundle.getText("SuccessTxt", [oResp.REQ_NO]);
                BusyIndicator.hide();
                messenger.success(sSuccessTxt, function () {
                    this.getRouter().navTo("RouteDashboard");
                    // this.setDefaults();
                }.bind(this));
            },

            showError: function (oError, navBack) {
                const sErrorMsg = JSON.parse(oError.responseText).error.message.value;
                BusyIndicator.hide();
                messenger.error(sErrorMsg, function () {
                    if (navBack) {
                        this.getRouter().navTo("RouteDashboard");
                        // this.setDefaults();
                    }
                }.bind(this));
            },
            onStatusChange: function (oEvent) {

                var oCombo = oEvent.getSource();
                var sKey = oCombo.getSelectedKey();
                var sValue = oCombo.getValue();

                if (sValue && !sKey) {

                    oCombo.setValue("");

                    this.getModel("filterModel").setProperty(
                        "/Status",
                        ""
                    );

                    this.getModel("filterModel").setProperty(
                        "/valueState/Status",
                        "Error"
                    );

                    this.getModel("filterModel").setProperty(
                        "/valueStateText/Status",
                        "Please select a valid status."
                    );

                    return;
                }

                this.getModel("filterModel").setProperty(
                    "/valueState/Status",
                    "None"
                );

                this.getModel("filterModel").setProperty(
                    "/valueStateText/Status",
                    ""
                );
            }, onDateChange: function (oEvent) {
                let oResourceBundle = this.getResourceBundle();
                var oDatePicker = oEvent.getSource();

                if (oEvent.getParameter("valid")) {

                    oDatePicker.setValueState(ValueState.None);
                    oDatePicker.setValueStateText("");

                } else {

                    oDatePicker.setValue("");
                    messenger.error(oResourceBundle.getText("dateFormatError"));
                    oDatePicker.setValueState(ValueState.Error);
                    oDatePicker.setValueStateText(
                        this.getResourceBundle().getText("dateFormatError")
                    );
                }

            },
            onFinancialYearValueHelp: function () {

                console.log(
                    "FinancialyearF4HSet :",
                    this.getModel().getProperty("/FinancialyearF4HSet")
                );

                if (!this._pFinancialYearVH) {

                    this._pFinancialYearVH = Fragment.load({
                        id: this.getView().getId(),
                        name: "com.nhpc.zhrinstprcls1.fragments.FinancialYearVH",
                        controller: this
                    }).then(function (oDialog) {

                        this.getView().addDependent(oDialog);
                        return oDialog;

                    }.bind(this));
                }

                this._pFinancialYearVH.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onFinancialYearSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("value") ||
                    oEvent.getParameter("newValue");

                var oBinding =
                    oEvent.getSource().getBinding("items");

                if (!oBinding) {
                    return;
                }

                if (!sValue) {
                    oBinding.filter([]);
                    return;
                }

                var aFilters = [
                    new Filter(
                        "Year",
                        FilterOperator.Contains,
                        sValue
                    )
                ];

                oBinding.filter(aFilters, "Application");
            },
            onFinancialYearConfirm: function (oEvent) {

                var oItem = oEvent.getParameter("selectedItem");

                if (oItem) {

                    this.getModel("filterModel")
                        .setProperty("/Year", oItem.getTitle());

                    var oInput = this.byId("idFinancialYearInput");

                    oInput.setValueState(ValueState.None);
                    oInput.setValueStateText("");
                }
            },
            onFinancialYearCancel: function () {

                this._pFinancialYearVH.then(function (oDialog) {
                    oDialog.close();
                });
            },
            onFinancialYearChange: function (oEvent) {

                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();

                var aData = this.getModel()
                    .getProperty("/FinancialyearF4HSet") || [];

                var bFound = aData.some(function (oItem) {
                    return oItem.Year === sValue;
                });

                if (sValue && !bFound) {

                    oInput.setValue("");
                    this.getModel("filterModel")
                        .setProperty("/Year", "");

                    oInput.setValueState(ValueState.Error);
                    oInput.setValueStateText(
                        this.getResourceBundle()
                            .getText("financialYearValueStateText")
                    );
                } else {
                    oInput.setValueState(ValueState.None);
                    oInput.setValueStateText("");
                }
            },
            onFilterClear: function () {

                this.getModel("filterModel").setData({
                    Year: "",


                    valueState: {
                        Year: ValueState.None,

                    },

                    valueStateText: {
                        Year: "",

                    }
                });
            },
            _getEmployeeDetails: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oVM = this.getModel("viewModel");

                var aFilters = [
                    new Filter(
                        "DFLT",
                        FilterOperator.EQ,
                        "X"
                    )
                ];

                oModel.read("/ZFI_GH_USER_F4", {
                    filters: aFilters,
                    success: function (oData) {

                        if (oData.results.length > 0) {

                            var oEmp = oData.results[0];

                            oVM.setProperty("/EmpDetails", oEmp);

                            var oPreClear =
                                oVM.getProperty("/PreClearDetails") || {};

                            oPreClear.EmployeeName =
                                oPreClear.EmployeeName || oEmp.ENAME;

                            oPreClear.Pernr =
                                oPreClear.Pernr || oEmp.PERNR;

                            oPreClear.Designation =
                                oPreClear.Designation || oEmp.DESIG;

                            oPreClear.DateOfJoiningDP =
                                oPreClear.DateOfJoiningDP ||
                                oEmp.DateOfJoining;

                            oVM.setProperty(
                                "/PreClearDetails",
                                oPreClear
                            );
                        }
                    }.bind(this),

                    error: function (oError) {
                        console.log("Employee Details Error", oError);
                    }
                });
            },
            _validateInput: function (
                oEvent,
                sProperty,
                sModelPath
            ) {
                var sValue = oEvent.getParameter("value");
                var oInput = oEvent.getSource();
                var oModel = this.getOwnerComponent().getModel();
                var oFilterModel = this.getModel("filterModel");

                if (!sValue) {
                    oFilterModel.setProperty(sModelPath, "");
                    return;
                }

                var aFilters = [
                    new Filter(
                        sProperty,
                        FilterOperator.EQ,
                        sValue
                    )
                ];

                oModel.read("/PreClearSet", {
                    filters: aFilters,

                    success: function (oData) {

                        if (oData.results.length === 0) {
                            oInput.setValue("");
                            oFilterModel.setProperty(
                                sModelPath,
                                ""
                            );
                        }

                    }.bind(this),

                    error: function () {
                        oInput.setValue("");
                        oFilterModel.setProperty(
                            sModelPath,
                            ""
                        );
                    }.bind(this)
                });
            },
            onDateOfJoiningChange: function (oEvent) {

                var oDatePicker = oEvent.getSource();

                if (oEvent.getParameter("valid")) {

                    oDatePicker.setValueState(ValueState.None);
                    oDatePicker.setValueStateText("");

                } else {

                    oDatePicker.setValue("");

                    oDatePicker.setValueState(ValueState.Error);
                    oDatePicker.setValueStateText(
                        this.getResourceBundle().getText("invalidDate")
                    );
                }

            },
            _validatePreClearDialog: function () {

                var bValid = true;
                var oBundle = this.getResourceBundle();

                var aControls = [
                    {
                        id: "idNoOfSecurities",
                        label: oBundle.getText("noOfSecurities")
                    },
                    {
                        id: "idFolioNo",
                        label: oBundle.getText("folioNo")
                    },
                    {
                        id: "idNatureOfApproval",
                        label: oBundle.getText("natureOfApproval")
                    },
                    {
                        id: "idEstimatedNo",
                        label: oBundle.getText("estimatedNo")
                    },
                    {
                        id: "idEstimatedValue",
                        label: oBundle.getText("estimatedValue")
                    },
                    {
                        id: "idWhetherProposed",
                        label: oBundle.getText("whetherProposed")
                    },
                    {
                        id: "idImmediateRelativeName",
                        label: oBundle.getText("nameOfImmediateRelatives")
                    },
                    {
                        id: "idDateOfPurchase",
                        label: oBundle.getText("dateOfPurchase")
                    },
                    {
                        id: "idPreviousApprovalDate",
                        label: oBundle.getText("previousApproval")
                    },
                    {
                        id: "idOfficialAddress",
                        label: oBundle.getText("officialAddress")
                    },
                    {
                        id: "idTelephone",
                        label: oBundle.getText("telephone")
                    },
                    {
                        id: "idEmail",
                        label: oBundle.getText("email")
                    },
                    {
                        id: "idInterCom",
                        label: oBundle.getText("interCom")
                    },
                    {
                        id: "idMobile",
                        label: oBundle.getText("mobile")
                    }
                ];

                aControls.forEach(function (oItem) {

                    var oControl = this.byId(oItem.id);

                    if (!oControl) {
                        return;
                    }

                    var vValue;

                    if (oControl.isA("sap.m.DatePicker")) {
                        vValue = oControl.getDateValue();
                    } else if (oControl.isA("sap.m.ComboBox")) {
                        vValue = oControl.getSelectedKey();
                    } else {
                        vValue = oControl.getValue();
                    }

                    if (!vValue) {

                        oControl.setValueState("Error");
                        oControl.setValueStateText(
                            oBundle.getText(
                                "mandatoryField",
                                [oItem.label]
                            )
                        );

                        bValid = false;

                    } else {
                        oControl.setValueState("None");
                    }

                }.bind(this));

                return bValid;
            },
            onComboboxChange: function (oEvent) {
                var oSrc = oEvent.getSource(),
                    sValue = oSrc.getSelectedKey();
                if (!sValue) {
                    oSrc.setValue(null);
                } else {
                    oSrc.setValueState(ValueState.None);
                    oSrc.setValueStateText(null);
                }
            },
            onMandatoryChange: function (oEvent) {

                var oControl = oEvent.getSource();
                var vValue;

                if (oControl.isA("sap.m.DatePicker")) {
                    vValue = oControl.getDateValue();
                } else if (oControl.isA("sap.m.ComboBox")) {
                    vValue = oControl.getSelectedKey();
                } else {
                    vValue = oControl.getValue();
                }

                if (!vValue) {
                    // oControl.setValueState("Error");
                    // oControl.setValueStateText(
                    //     this.getResourceBundle().getText("mandatoryField")
                    // );
                } else {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            },
            onNumberInputChange: function (oEvent) {
                let sValue = oEvent.getParameter("value");
                var oControl = oEvent.getSource();
                oControl.setValueState("None");
                oControl.setValueStateText("");
                sValue = sValue.replace(/\D/g, "");
                oEvent.getSource().setValue(sValue);
            },

            openPreview: function (oEvent) {
                const oSource = oEvent.getSource();
                const oBindingContext = oSource.getBindingContext("viewModel");

                if (oBindingContext && this.oUploadPlugin) {
                    this.oUploadPlugin.openFilePreview(oBindingContext);
                }
            },

            readAttachmentsData: function () {
                var oViewModel = this.getView().getModel("viewModel"),
                    oModel = this.getModel(),
                    sApplicationNo = oViewModel.getProperty("/Sno"),
                    sPernr = oViewModel.getProperty("/formDetails/Pernr");
                var aFilters = [];
                aFilters.push(new Filter("ApplicationNo", FilterOperator.EQ, sApplicationNo));
                aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
                aFilters.push(new Filter("Form", FilterOperator.EQ, "6"));
                BusyIndicator.show();
                oModel.read(`/AttachmentEntitySet`, {
                    filters: aFilters,
                    success: function (oResp) {
                        if (oResp.results && oResp.results.length > 0) {
                            for (var i = 0; i < oResp.results.length; i++) {
                                var sFileName = oResp.results[i].Filename;
                                var sDocId = oResp.results[i].DocID;
                                var sApplicationNo = oResp.results[i].ApplicationNo;
                                var sPernr = oResp.results[i].Pernr;

                                oResp.results[i].previewable = true;
                                oResp.results[i].trustedSource = true;
                                oResp.results[i].Url = this.getDownloadUrl(sApplicationNo, sPernr, sFileName, sDocId);
                            }
                        }
                        BusyIndicator.hide();
                        oViewModel.setProperty("/attachmentList", oResp.results);
                        oViewModel.setProperty("/canEdit", oResp.results.length === 0);
                    }.bind(this),
                    error: function (oError) {
                        BusyIndicator.hide();
                        oViewModel.setProperty("/attachmentList", []);
                        messenger.error(JSON.parse(oError.responseText).error.message.value);
                    }.bind(this)
                });



            },

            getDownloadUrl: function (sApplicationNo, sPernr, sFileName, sDocId) {
                var oModel = this.getModel();
                var sUrl = oModel.sServiceUrl + "/AttachmentEntitySet(ApplicationNo='" + sApplicationNo + "',Pernr='" + sPernr + "',Form='" + '5' + "')/$value";
                return sUrl;
            },

            onRemoveAttachment: function (oEvent) {
                var oSource = oEvent.getSource();
                const oContext = oSource.getBindingContext("viewModel");
                this.removeItem(oContext);
            },
            removeItem: function (oContext) {
                var oResourceBundle = this.getResourceBundle(),
                    oViewModel = this.getModel("viewModel"),
                    sPath = oContext.getPath(),
                    sFileName = oViewModel.getProperty(sPath + "/Filename"),
                    sTitle = oResourceBundle.getText("CONFIRM_TITLE");

                var sMessage = oResourceBundle.getText(
                    "removeDocumentWarningMsg",
                    sFileName
                );
                messenger.confirm(sTitle, sMessage, "Confirm", null, function () {
                    if (sPath.split("/")[2]) {
                        var index = sPath.split("/")[2];
                        var data = oViewModel.getProperty("/attachmentList");
                        this.oItemsProcessor.splice(index, 1);
                        data.splice(index, 1);
                        oViewModel.setProperty("/attachmentList", data);
                        //Start of Change: 06.11.2026: Balamurugan : UploadButton and PAN Bug Fix
                        oViewModel.setProperty("/canEdit", data.length === 0);
                        //End of Change: 06.11.2026: Balamurugan : UploadButton and PAN Bug Fix
                        oViewModel.refresh(true);
                    }
                }.bind(this));
            },
            onDeleteAttachment: function (oEvent) {

                var oSource = oEvent.getSource();
                const oContext = oSource.getBindingContext("viewModel");

                var oResourceBundle = this.getResourceBundle(),
                    oViewModel = this.getModel("viewModel"),
                    sPath = oContext.getPath(),
                    objectAtt = oViewModel.getProperty(sPath),
                    sFileName = oViewModel.getProperty(sPath + "/Filename"),
                    sTitle = oResourceBundle.getText("CONFIRM_TITLE");

                var sMessage = oResourceBundle.getText(
                    "deleteDocumentWarningMsg",
                    sFileName
                );

                messenger.confirm(sTitle, sMessage, "Confirm", null, function () {
                    this.deleteAttachment(objectAtt);
                }.bind(this));
            },

            deleteAttachment: function (objectAtt) {
                var oResourceBundle = this.getResourceBundle(),
                    oModel = this.getModel();
                var that = this;
                var sUrl = oModel.createKey("/AttachmentEntitySet", {
                    ApplicationNo: objectAtt.ApplicationNo,
                    Pernr: objectAtt.Pernr,
                    Form: "6"
                });

                BusyIndicator.show();

                oModel.remove(sUrl, {
                    success: function () {

                        BusyIndicator.hide();
                        that.readAttachmentsData();

                        messenger.success(
                            oResourceBundle.getText("postAttDelSuccMessage")
                        );

                    }.bind(this),

                    error: function (oError) {

                        BusyIndicator.hide();

                        messenger.error(
                            JSON.parse(oError.responseText).error.message.value
                        );

                    }.bind(this)
                });
            },

            onUploadTableFinished: function () {
                var oViewModel = this.getModel("viewModel"),
                    aAttachmentList = oViewModel.getProperty("/attachmentList") || [],
                    iCount = aAttachmentList.length;
                var sText = "Document (" + iCount + ")";
                this.byId("idAttachmentCount").setText(sText);
            },
            onPluginActivated: function (oEvent) {

                this.oItemsProcessor = [];
                this.iNoOfAttachments = 0;
                this.iUploadCount = 0;
                this.sUploadMessage = "";

                this.oUploadPlugin = oEvent.getParameter("oPlugin");

                var oUploadActionBtn = this.byId("uploadButton"),
                    oUploadBtn = oUploadActionBtn.getAggregation("_actionButton");

                oUploadBtn.setIcon("sap-icon://upload");
                oUploadBtn.setStyle("Emphasized");
                oUploadBtn.setIconFirst(true);
            },
            onAfterRendering: function () {
                this.getView().addStyleClass("sapUiSizeCompact");
            },
            onFileNameLengthExceed: function () {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("FileLengthExceededErrMsg"));
            },
            onFileSizeExceed: function () {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("fileSizeExceedErrorMsg"));
            },

            onFileTypeMismatch: function () {
                var oResourceBundle = this.getResourceBundle();
                messenger.error(oResourceBundle.getText("fileTypeMisMatchErrorMsg"));
            },
            itemValidationCallback: function (oItemInfo) {

                var oItemDetails = oItemInfo.oItem,
                    oViewModel = this.getModel("viewModel"),
                    aAttachmentList = oViewModel.getProperty("/attachmentList") || [];

                if (
                    oItemDetails.getFileName() !== null &&
                    oItemDetails.getFileName() !== undefined &&
                    oItemDetails.getFileName().endsWith(".msg")
                ) {
                    let fileType = "application/vnd.ms-outlook";
                    oItemDetails.setMediaType(fileType);
                }

                aAttachmentList.push({
                    "Filename": oItemDetails.getFileName(),
                    "Mimetype": oItemDetails.getMediaType(),
                    "CreatedBy": sap.ushell.Container.getUser().getFullName(),
                    "CreatedOn": this.formatDate(new Date())
                });

                oViewModel.setProperty("/attachmentList", aAttachmentList);
                oViewModel.setProperty("/canEdit",false);

                const { oItem } = oItemInfo;

                var oItemPromise = new Promise((resolve, reject) => {

                    this.oItemsProcessor.push({
                        item: oItem,
                        resolve: resolve,
                        reject: reject
                    });

                });

                // Required
                this.checkMalwareValidation(oItemInfo);

                return oItemPromise;
            },
            checkMalwareValidation: function (oItemInfo) {

                var oResourceBundle = this.getResourceBundle(),
                    oFileObject = oItemInfo.oItem.getFileObject();

                if (oFileObject) {

                    var reader = new FileReader();

                    reader.onload = function (event) {

                        var aArrayBuffer = event.currentTarget.result;
                        var sBinaryString = this.convertArratBufferToBinary(aArrayBuffer);

                        var sUrl = this.getBaseURL() + "/malware_api/scan";

                        BusyIndicator.show();

                        jQuery.ajax({
                            url: sUrl,
                            type: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            data: sBinaryString,

                            success: function (oResp) {

                                if (oResp.malwareDetected) {
                                    this.removeMalwareFile();
                                    messenger.error(
                                        oResourceBundle.getText("malwareFileDetectedErrorMsg")
                                    );
                                } else {
                                    BusyIndicator.hide();
                                }

                            }.bind(this),

                            error: function () {

                                BusyIndicator.hide();
                                this.removeMalwareFile();

                                messenger.error(
                                    oResourceBundle.getText("malwareScanFailedErrorMsg")
                                );

                            }.bind(this)
                        });

                    }.bind(this);

                    reader.readAsArrayBuffer(oFileObject);
                }
            },

            convertArratBufferToBinary: function (aArrayBufferObject) {

                var binary = "";

                const bytes = new Uint8Array(aArrayBufferObject);
                const len = bytes.byteLength;

                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }

                return binary;
            },

            removeMalwareFile: function () {

                var oViewModel = this.getModel("viewModel"),
                    aAttachmentList = oViewModel.getProperty("/attachmentList");

                aAttachmentList.pop();
                this.oItemsProcessor.pop();

                oViewModel.setProperty("/attachmentList", aAttachmentList);
                oViewModel.refresh();

                BusyIndicator.hide();
            },

            onUploadComplete: function (oEvent) {

                var oResourceBundle = this.getResourceBundle(),
                    staus = oEvent.getParameter("status");

                this.iUploadCount = this.iUploadCount + 1;

                if (staus === 500 || staus === 400 || staus === 415) {

                    this.isAttachmentFail = true;

                    var oParser = new DOMParser();
                    var oResponse = oParser.parseFromString(
                        oEvent.getParameter("response"),
                        "text/xml"
                    );

                    var aMessages = oResponse.getElementsByTagName("message");

                    if (aMessages && aMessages.length > 0) {
                        var sMessage = aMessages[0].innerHTML;
                        this.sUploadMessage = sMessage + "\n";
                    }
                }

                if (this.iNoOfAttachments === this.iUploadCount) {

                    BusyIndicator.hide();

                    if (this.isAttachmentFail) {

                        messenger.error(this.sUploadMessage);

                    } else {

                        if (this.sStatusCode === "DF") {

                            messenger.success(
                                oResourceBundle.getText(
                                    "SavedMessage"
                                ),
                                function () {
                                    this.onNavBack();
                                }.bind(this)
                            );

                        } else if (this.sStatusCode === "SB") {

                            messenger.success(
                                oResourceBundle.getText(
                                    "SubmittedMessage"
                                ),
                                function () {
                                    this.onNavBack();
                                }.bind(this)
                            );

                        }
                    }
                }
            },
            fileUpload: function (aAttachmentList, sButtonPress, Sno) {
                var oModel = this.getModel(),
                    aAttachments = this.oItemsProcessor,
                    oResourceBundle = this.getResourceBundle(),
                    sUrl = oModel.sServiceUrl;
                var oViewModel = this.getModel("viewModel");
                let sApplicationNo = Sno;
                let sPernr = oViewModel.getProperty("/formDetails/Pernr");
                var sType = "";
                // //Set the Message
                var sMessage = "";
                if (sButtonPress === 'Save') {
                    sMessage = oResourceBundle.getText("SavedSuccessMsg");
                }
                else if (sButtonPress === 'Submit') {
                    sMessage = oResourceBundle.getText("SubmittedSuccessMsg");
                }
                //Loop And upload the files
                if (aAttachments && aAttachments.length > 0) {
                    this.iNoOfAttachments = aAttachments.length;
                    var sAttachmentLength = aAttachments.length;
                    for (var i = 0; i < aAttachments.length; i++) {
                        var oAttachment = aAttachments[i].item;
                        oAttachment.addHeaderField(new sap.ui.core.Item({
                            key: "slug",
                            text: sApplicationNo + "/" + sPernr + "/" + oAttachment.getFileName()
                        }));
                        oAttachment.addHeaderField(new sap.ui.core.Item({
                            key: "X-CSRF-Token",
                            text: oModel.getSecurityToken()
                        }));
                        console.log(oModel.getSecurityToken());
                        this.oUploadPlugin.setUploadUrl(sUrl + "/AttachmentEntitySet");

                        sAttachmentLength = sAttachmentLength - 1;
                        aAttachments[i].resolve(oAttachment);
                    }
                }

                else {
                    messenger.success(sMessage, function () {
                        this.getRouter().navTo("RouteDashboard", {}, {}, true);
                    }.bind(this));
                }
            },
            getBaseURL: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath;
            },
        });
    });