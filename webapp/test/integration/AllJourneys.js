jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"zreporteventas/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"zreporteventas/test/integration/pages/Worklist",
		"zreporteventas/test/integration/pages/Object",
		"zreporteventas/test/integration/pages/NotFound",
		"zreporteventas/test/integration/pages/Browser",
		"zreporteventas/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zreporteventas.view."
	});

	sap.ui.require([
		"zreporteventas/test/integration/WorklistJourney",
		"zreporteventas/test/integration/ObjectJourney",
		"zreporteventas/test/integration/NavigationJourney",
		"zreporteventas/test/integration/NotFoundJourney",
		"zreporteventas/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});