sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function() {
			var fnGetUser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetUser ? fnGetUser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createTotalModel: function() {
			var oModel = new JSONModel({
				TotalV: 0.00 ,
				Unidad: ""
			});
			return oModel;

		},
		createPrefUs: function(){
		var oModel = new JSONModel({
			CantTop: 10
			
		})	;
			
			
		},
		createTitleModel : function (){
			var oModel = new JSONModel({ 
			Unidad: "ML USD",	
			Negocio: "Tissue",
			Sociedad:"CMPC Tissue S.A",
			Fecha1: "",
			Fecha2: "",
			Vista: "Ventas Diarias"
			} );
			return oModel;
			
		}

	};

});