sap.ui.define([
	"zreporteventas/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"zreporteventas/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"zreporteventas/model/chartFormatter"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator, chartFormatter) {
	"use strict";
	return BaseController.extend("zreporteventas.controller.Worklist", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			this.setModel(oViewModel, "worklistView");
			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true
					}
				},
				valueAxis: {
					label: {},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: true,
					text: "Ventas Totales Diarias en M USD"
				}
			});
			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			this.getView().addEventDelegate({
				onBeforeFirstShow: function() {
					this.getView().byId("FlattenedD").getBinding("data").attachDataReceived(function(oEvent) {
						this.calculoTotales.call(this, oEvent);
					}.bind(this));

					this.getView().byId("idVizFrame").setBusy(true);
					this.aFiltersVd = [
						new Filter("Sociedad", FilterOperator.EQ, "106"),
						new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)),
						//new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"),
						new Filter("Negocio", FilterOperator.EQ, "TISS")
					];
					this.aFiltersVd_pu = [
						new Filter("UnidadMedida", FilterOperator.EQ, "MON"),
						new Filter("Moneda", FilterOperator.EQ, "USD")
					];
					var aFilterVdLocal = this.aFiltersVd.concat(this.aFiltersVd_pu);
					this.getView().byId("FlattenedD").getBinding("data").filter(aFilterVdLocal);
					this.aFiltersVn = [
						new Filter("Sociedad", FilterOperator.EQ, "106"),
						new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)),
						//  new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"),
						new Filter("Negocio", FilterOperator.EQ, "TISS")
					];
					this.aFiltersVn_pu = [
						new Filter("UnidadMedida", FilterOperator.EQ, "MON"),
						new Filter("Moneda", FilterOperator.EQ, "USD")
					];
					var aFilterVnLocal = this.aFiltersVn.concat(this.aFiltersVn_pu);
					this.getView().byId("__list0").getBinding("items").filter(aFilterVnLocal);
					this.aFiltersTc = [
						new Filter("Sociedad", FilterOperator.EQ, "106"),
						new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)),
						//new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"),
						new Filter("Negocio", FilterOperator.EQ, "TISS")
					];
					this.aFiltersTc_pu = [
						new Filter("UnidadMedida", FilterOperator.EQ, "MON"),
						new Filter("Moneda", FilterOperator.EQ, "USD"),
						new Filter("CantTop", FilterOperator.EQ, "10")
					];
					this.aFiltersBc = [
						new Filter("Sociedad", FilterOperator.EQ, "106"),
						new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)),
						//new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"),
						new Filter("Negocio", FilterOperator.EQ, "TISS")
					];
					this.aFiltersBc_pu = [
						new Filter("UnidadMedida", FilterOperator.EQ, "MON"),
						new Filter("Moneda", FilterOperator.EQ, "USD"),
						new Filter("CantTop", FilterOperator.EQ, "10")
					];

					this.getView().getModel("Title").setProperty("/Fecha1", this.formatDate(this.getDateAgo(7)));
					this.getView().getModel("Title").setProperty("/Fecha2", this.formatDate(this.getDateAgo(0)));
					var aFilterTcLocal = this.aFiltersTc.concat(this.aFiltersTc_pu);
					var aFilterBcLocal = this.aFiltersBc.concat(this.aFiltersBc_pu);
					this.getView().byId("__table0").getBinding("items").filter(aFilterTcLocal);
					this.getView().byId("__table1").getBinding("items").filter(aFilterBcLocal);
					if (!this._oViewSettingsDialog) {
						this._oViewSettingsDialog = sap.ui.xmlfragment("zreporteventas.view.ViewSettingsDialog", this);
						this.getView().addDependent(this._oViewSettingsDialog);
						// forward compact/cozy style into Dialog
						this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					}
					sap.ui.getCore().byId("FiltroNegocio").getBinding("items").filter(new sap.ui.model.Filter("Sociedad", "EQ", "106"));
					if (!this._oViewSettingsDialog2) {
						this._oViewSettingsDialog2 = sap.ui.xmlfragment("zreporteventas.view.PreferenciasUsuario", this);
						this.getView().addDependent(this._oViewSettingsDialog2);
						// forward compact/cozy style into Dialog
						this._oViewSettingsDialog2.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					}
					/*
														this.getView().byId("Filtros").fireConfirm({
															filterItems: this.getView().byId("Filtros").getSelectedFilterItems()
														});

														this.getView().byId("PrefUsuario").fireConfirm({
															filterItems: this.getView().byId("PrefUsuario").getSelectedFilterItems()
														});*/
				}.bind(this)
			});
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {},
		onZoomIn: function() {
			var oViz = this.getView().byId("idVizFrame");
			oViz.zoom({
				direction: "in"
			});
		},
		onZoomOut: function() {
			var oViz = this.getView().byId("idVizFrame");
			oViz.zoom({
				direction: "out"
			});
		},
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {},
		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function() {
			history.go(-1);
			/*		var sPreviousHash = History.getInstance().getPreviousHash(),
								oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

							if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
								history.go(-1);
							} else {
								oCrossAppNavigator.toExternal({
									target: {
										shellHash: "#Shell-home"
									}
								});
							}*/
		},
		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},
		onTabFilerSelect: function(oEvent) {
			if (oEvent.getParameters().selectedKey !== "VDiarias") {
				this.getView().byId("chartContainer").setVisible(false);
				this.getView().byId("idPopOver").setVisible(false);
				this.getView().byId("idVizFrame").setVisible(false);
			} else {
				this.getView().byId("chartContainer").setVisible(true);
				this.getView().byId("idPopOver").setVisible(true);
				this.getView().byId("idVizFrame").setVisible(true);
			}
		},
		onOpenViewSettings: function() {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("zreporteventas.view.ViewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			sap.ui.getCore().byId("Filtros").setBusy(true);
			var oItems = sap.ui.getCore().byId("FiltroSociedad").getItems();
			for (var i = 0; i < oItems.length; i++) {
				if (oItems[i].getSelected()) {
					sap.ui.getCore().byId("FiltroNegocio").getBinding("items").filter(new sap.ui.model.Filter("Sociedad", "EQ", oItems[i].getKey()));
					sap.ui.getCore().byId("FiltroNegocio").getBinding("items").attachDataReceived(function(oEvent) {
						sap.ui.getCore().byId("Filtros").setBusy(false);
					});
				}
			}
			this._oViewSettingsDialog.setFilterSearchCallback(null).setFilterSearchOperator(sap.m.StringFilterOperator.Contains).open();
		},
		onOpenPrefUsuario: function() {
			if (!this._oViewSettingsDialog2) {
				this._oViewSettingsDialog2 = sap.ui.xmlfragment("zreporteventas.view.PreferenciasUsuario", this);
				this.getView().addDependent(this._oViewSettingsDialog2);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog2.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this._oViewSettingsDialog2.open();
		},
		onActionSheet: function(oEvent) {
			var oButton = oEvent.getSource();
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment("zreporteventas.view.ActionSheet", this);
				this.getView().addDependent(this._actionSheet);
			}
			this._actionSheet.openBy(oButton);
		},
		onVentasPress: function(oEvent) {
			this.getView().byId("chartContainer").setVisible(true);
			this.getView().byId("idPopOver").setVisible(true);
			this.getView().byId("idVizFrame").setVisible(true);
			this.getView().byId("__list0").setVisible(false);
			this.getView().byId("__table0").setVisible(false);
			this.getView().byId("__table1").setVisible(false);
			this.getView().getModel("Title").setProperty("/Vista", "Ventas Diarias");
		},
		onVentasNegPress: function(oEvent) {
			this.getView().byId("chartContainer").setVisible(false);
			this.getView().byId("idPopOver").setVisible(false);
			this.getView().byId("idVizFrame").setVisible(false);
			this.getView().byId("__list0").setVisible(true);
			this.getView().byId("__table0").setVisible(false);
			this.getView().byId("__table1").setVisible(false);
			this.getView().getModel("Title").setProperty("/Vista", "Ventas por Negocio");
			this.getView().byId("__list0").getBinding("items").attachDataReceived(function(oEvent) {
				this.calculoTotales.call(this, oEvent);
			}.bind(this));

		},
		onTopClientesPress: function(oEvent) {
			this.getView().byId("chartContainer").setVisible(false);
			this.getView().byId("idPopOver").setVisible(false);
			this.getView().byId("idVizFrame").setVisible(false);
			this.getView().byId("__list0").setVisible(false);
			this.getView().byId("__table0").setVisible(true);
			this.getView().byId("__table1").setVisible(false);
			var sTop = "Top Clientes " + sap.ui.getCore().byId("TOP").getValue();
			this.getView().getModel("Title").setProperty("/Vista", sTop);
			this.getView().byId("__table0").getBinding("items").attachDataReceived(function(oEvent) {
				this.calculoTotales.call(this, oEvent);
			}.bind(this));

		},

		onBottomClientesPress: function(oEvent) {
			this.getView().byId("chartContainer").setVisible(false);
			this.getView().byId("idPopOver").setVisible(false);
			this.getView().byId("idVizFrame").setVisible(false);
			this.getView().byId("__list0").setVisible(false);
			this.getView().byId("__table0").setVisible(false);
			this.getView().byId("__table1").setVisible(true);
			var sTop = "Bottom Clientes " + sap.ui.getCore().byId("BOTTOM").getValue();
			this.getView().getModel("Title").setProperty("/Vista", sTop);
			this.getView().byId("__table1").getBinding("items").attachDataReceived(function(oEvent) {
				this.calculoTotales.call(this, oEvent);
			}.bind(this));
		},
		getDateAgo: function(iDays) {
			var oDate = new Date();
			oDate.setDate(oDate.getDate() - iDays);
			var iMonth = oDate.getMonth() + 1;
			if (iMonth < 10) {
				var sDate = oDate.getFullYear().toString() + '0' + iMonth.toString() + oDate.getDate().toString();
			} else {
				var sDate = oDate.getFullYear().toString() + iMonth.toString() + oDate.getDate().toString();

			}
			return sDate;
		},
		onConfirmViewSettingsDialog: function(oEvent) {
			var aFilterItems = oEvent.getParameters().filterItems;
			if (oEvent.getSource().getId() === "Filtros") {
				this.aFiltersVd = [];
				this.aFiltersVn = [];
				this.aFiltersTc = [];
				this.aFiltersBc = [];
			} else {
				this.aFiltersVd_pu = [];
				this.aFiltersVn_pu = [];
				this.aFiltersTc_pu = [];
				this.aFiltersBc_pu = [];
				var aCaptions = [];
			}
			var bFechaSel = false;
			// update filter state:
			// combine the filter array and the filter string
			aFilterItems.forEach(function(oItem) {
				switch (oItem.getKey()) {
					case "Semana":
						/*	this.aFiltersVd.push(new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"));
							this.aFiltersVn.push(new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"));
							this.aFiltersTc.push(new Filter("Fecha", FilterOperator.BT, "20160101", "20160107"));*/
						this.getView().getModel("Title").setProperty("/Fecha1", this.formatDate(this.getDateAgo(7)));
						this.getView().getModel("Title").setProperty("/Fecha2", this.formatDate(this.getDateAgo(0)));
						this.aFiltersVd.push(new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)));
						this.aFiltersVn.push(new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)));
						this.aFiltersTc.push(new Filter("Fecha", FilterOperator.BT, this.getDateAgo(7), this.getDateAgo(0)));
						bFechaSel = true;
						break;
					case "Mes":
						this.aFiltersVd.push(new Filter("Fecha", FilterOperator.BT, this.getDateAgo(30), this.getDateAgo(0)));
						this.aFiltersVn.push(new Filter("Fecha", FilterOperator.BT, this.getDateAgo(30), this.getDateAgo(0)));
						this.aFiltersTc.push(new Filter("Fecha", FilterOperator.BT, this.getDateAgo(30), this.getDateAgo(0)));
						this.getView().getModel("Title").setProperty("/Fecha1", this.formatDate(this.getDateAgo(30)));
						this.getView().getModel("Title").setProperty("/Fecha2", this.formatDate(this.getDateAgo(0)));
						bFechaSel = true;
						break;
					case "Monto":
						this.aFiltersVd_pu.push(new Filter("UnidadMedida", FilterOperator.EQ, "MON"));
						this.aFiltersVn_pu.push(new Filter("UnidadMedida", FilterOperator.EQ, "MON"));
						this.aFiltersTc_pu.push(new Filter("UnidadMedida", FilterOperator.EQ, "MON"));
						break;
					case "Volumen":
						this.aFiltersVn_pu.push(new Filter("UnidadMedida", FilterOperator.EQ, "VOL"));
						this.aFiltersVd_pu.push(new Filter("UnidadMedida", FilterOperator.EQ, "VOL"));
						this.aFiltersTc_pu.push(new Filter("UnidadMedida", FilterOperator.EQ, "VOL"));
						break;
					case "USD":
						this.aFiltersVd_pu.push(new Filter("Moneda", FilterOperator.EQ, "USD"));
						this.aFiltersVn_pu.push(new Filter("Moneda", FilterOperator.EQ, "USD"));
						this.aFiltersTc_pu.push(new Filter("Moneda", FilterOperator.EQ, "USD"));
						break;
					case "CLP":
						this.aFiltersVd_pu.push(new Filter("Moneda", FilterOperator.EQ, "CLP"));
						this.aFiltersVn_pu.push(new Filter("Moneda", FilterOperator.EQ, "CLP"));
						this.aFiltersTc_pu.push(new Filter("Moneda", FilterOperator.EQ, "CLP"));
						break;
					default:
						if (oItem.getParent().getId() === "FiltroSociedad") {
							this.aFiltersVd.push(new Filter("Sociedad", FilterOperator.EQ, oItem.getKey()));
							this.aFiltersVn.push(new Filter("Sociedad", FilterOperator.EQ, oItem.getKey()));
							this.aFiltersTc.push(new Filter("Sociedad", FilterOperator.EQ, oItem.getKey()));
							this.getView().getModel("Title").setProperty("/Sociedad", oItem.getText());
						}
						if (oItem.getParent().getId() === "FiltroNegocio") {
							this.aFiltersVd.push(new Filter("Negocio", FilterOperator.EQ, oItem.getKey()));
							this.aFiltersVn.push(new Filter("Negocio", FilterOperator.EQ, oItem.getKey()));
							this.aFiltersTc.push(new Filter("Negocio", FilterOperator.EQ, oItem.getKey()));
							this.getView().getModel("Title").setProperty("/Negocio", oItem.getText());
						}
						break;
				}
			}.bind(this));

			if (!bFechaSel) {
				this.aFiltersVd.push(new Filter("Fecha", FilterOperator.BT, this.formatODate(sap.ui.getCore().byId("RangoF2").getDateValue()),
					this.formatODate(sap.ui.getCore().byId(
						"RangoF2").getSecondDateValue())));
				this.aFiltersVn.push(new Filter("Fecha", FilterOperator.BT, this.formatODate(sap.ui.getCore().byId("RangoF2").getDateValue()),
					this.formatODate(sap.ui.getCore().byId(
						"RangoF2").getSecondDateValue())));
				this.aFiltersTc.push(new Filter("Fecha", FilterOperator.BT, this.formatODate(sap.ui.getCore().byId("RangoF2").getDateValue()),
					this.formatODate(sap.ui.getCore().byId(
						"RangoF2").getSecondDateValue())));

				this.getView().getModel("Title").setProperty("/Fecha1", this.formatDate(this.formatODate(sap.ui.getCore().byId("RangoF2").getDateValue())));
				this.getView().getModel("Title").setProperty("/Fecha2", this.formatDate(this.formatODate(sap.ui.getCore().byId("RangoF2").getSecondDateValue())));

			}
			this.aFiltersBc_pu = this.aFiltersTc_pu.slice();
			this.aFiltersBc_pu.push(new Filter("CantTop", FilterOperator.EQ, sap.ui.getCore().byId("BOTTOM").getValue()));
			this.aFiltersTc_pu.push(new Filter("CantTop", FilterOperator.EQ, sap.ui.getCore().byId("TOP").getValue()));
			if (this.getView().byId("__table0").getVisible()) {
				var sTop = "Top Clientes " + sap.ui.getCore().byId("TOP").getValue();
				this.getView().getModel("Title").setProperty("/Vista", sTop);
			}
			if (this.getView().byId("__table1").getVisible()) {
				var sTop = "Bottom Clientes " + sap.ui.getCore().byId("BOTTOM").getValue();
				this.getView().getModel("Title").setProperty("/Vista", sTop);
			}
			this.aFiltersBc = this.aFiltersTc.slice();
			var aFilterlocVd = this.aFiltersVd.concat(this.aFiltersVd_pu);
			var aFilterlocVn = this.aFiltersVn.concat(this.aFiltersVn_pu);
			var aFilterlocTc = this.aFiltersTc.concat(this.aFiltersTc_pu);
			var aFilterlocBc = this.aFiltersBc.concat(this.aFiltersBc_pu);
			this.getView().byId("idVizFrame").setBusy(true);
			this.getView().byId("FlattenedD").getBinding("data").filter(aFilterlocVd);
			this.getView().byId("__list0").getBinding("items").filter(aFilterlocVn);
			this.getView().byId("__table0").getBinding("items").filter(aFilterlocTc);
			this.getView().byId("__table1").getBinding("items").filter(aFilterlocBc);
		},

		calculoTotales: function(oEvent) {
			if (oEvent.getParameters().hasOwnProperty("data")) {
				var oResults = oEvent.getParameters().data.results;
				var iTotal = 0;
				var sUnidad = "";
				this.getView().byId("idVizFrame").setBusy(false);
				for (var i = 0; i < oResults.length; i++) {
					iTotal += parseFloat(oResults[i].Total);
					sUnidad = oResults[i].Unidad;
				}
				this.getView().getModel("Totales").setProperty("/TotalV", this.formatCurrency(iTotal, sUnidad));
				this.getView().getModel("Totales").setProperty("/Unidad", sUnidad);
				var sTitle = "Ventas Totales Diarias en " + sUnidad;
				this.getView().byId("idVizFrame").setVizProperties({
					title: {
						visible: true,
						text: sTitle
					}
				});
			}
		},
		handleChangeRf: function(oEvent) {
			sap.ui.getCore().byId("Semana").setSelected(false);
			sap.ui.getCore().byId("Mes").setSelected(false);

		},
		onFFechaChange: function(oEvent) {

		},
		onTopChange: function(oEvent) {

			}
			/**
			 *@memberOf zreporteventas.controller.Worklist
			 */

	});
});