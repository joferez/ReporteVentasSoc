sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("zreporteventas.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		formatDate: function(sDate) {
			var oDateFormatter = sap.ui.core.format.DateFormat.getInstance({
				style: "short",
				pattern: "dd/MM/yyyy"
			});
			var oDate = new Date();
			oDate.setFullYear(sDate.substring(0, 4));
			if (sDate.length === 8) {
				oDate.setMonth(parseInt(sDate.substring(4, 6)) - 1);
				oDate.setDate(sDate.substring(6, 8));
			} else {
				oDate.setMonth(parseInt(sDate.substring(4, 5)) - 1);
				oDate.setDate(sDate.substring(5, 7));

			}

			return oDateFormatter.format(oDate);

		},
		formatODate: function(oDate) {

			var oDateForm = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd",
				style: "short"
			});
			return oDateForm.format(oDate);

		},
		formatCurrency: function(sCurrency, sMoneda) {
			var oCurrency = sap.ui.core.format.NumberFormat.getCurrencyInstance();
			return oCurrency.format(sCurrency, sMoneda);

		}

	});

});