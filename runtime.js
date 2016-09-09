// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.scormc2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.scormc2.prototype;

	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.isInitialising = false;
		this.isScormInitialised = false;
		this.isOnError = false;
		this.tracker = null;
		this.lastError = "";
		this.lastErrorID = 0;

		// any other properties you need, e.g...
		// this.myValue = 0;
	};

	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
	};

	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};

	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};

	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};

	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};

	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};

	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property

				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};

	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	//Return true if scorm is initialised
	Cnds.prototype.isScormInitialised = function (myparam)
	{
		if (pluginProto.isScormInitialised){
			return pluginProto.isScormInitialised;
		} else {
			if(pluginProto.tracker.LMSIsInitialized()){
				pluginProto.isScormInitialised = true;
			}
			return pluginProto.isScormInitialised;
		}
	};

	//Return true if scorm is isInitialising
	Cnds.prototype.isScormInitialising = function (myparam)
	{
		return pluginProto.isScormInitialising;
	};

	//Return true if scorm is on error state
	Cnds.prototype.isScormOnError = function (myparam)
	{
		return pluginProto.isOnError;
	};

	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	//Launch scorm init
	Acts.prototype.initialiseLMS = function ()
	{
		var result = pluginProto.tracker.doLMSInitialize();
		if (result == "true"){
			pluginProto.isInitialising = true;
		} else {
			pluginProto.isOnError = true;
			pluginProto.isInitialising = false;
		}
	};

	//Send a value to scorm
	//For the possible ID, refer to scorm documentation
	Acts.prototype.setLMSValue = function(pID, pValue){
		if (pluginProto.isScormInitialised){
			pluginProto.tracker.doLMSSetValue(pID, pValue);
		}
	}

	//Commit all the values sent since the last commit
	Acts.prototype.doLMSCommit = function(){
		if (pluginProto.isScormInitialised){
			pluginProto.tracker.doLMSCommit();
		}
	}

	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	//Get the last scorm error message as string
	Exps.prototype.getLastError = function (ret)
	{
		ret.set_string(pluginProto.lastError);
	};

	//Get the last scorm error ID as an integer
	Exps.prototype.getLastErrorID = function (ret)
	{
		ret.set_int(pluginProto.lastErrorID);
	};

	//Get a value from scorm
	//Refer to the scorm documentation for the possible values for ID
	Exps.prototype.getLMSValue = function (ret, pID)
	{
		ret.set_int(pluginProto.tracker.doLMSGetValue(pID));
	};

	pluginProto.exps = new Exps();

}());
