"use strict";
const opcua = require("node-opcua");


const server = new opcua.OPCUAServer({
    port: 19090,        // the port of the listening socket of the server
    buildInfo: {
        productName: "Sample NodeOPCUA Server1",

        buildNumber: "7658",
        buildDate: new Date(2020, 12, 9)
    },

    resourcePath: "/UA/MyLittleServer", //path to be added to endpoint resource name

});

function post_initialize(){
    console.log("initialized");
    function constructAddressSpace(server) {

        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        // we create a new folder under RootFolder
        const myDevice = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "MyDevice"
        })

        // now let's add first variable in folder
        // the addVariableInFolder
        let variable1 = 10.0;
        let variable2 = 0.5;
        let variable3 = "Yeeeee"

        //emulate variable1 changing every 500ms
        //setInterval(function(){variable+=1},500);

        server.nodeVariable1 = namespace.addVariable({
            componentOf: myDevice,
            nodeId: "s=Temperature",
            browseName: "Temperature",
            dataType: "Double",
            value: {
                get: () => {
                    const t = Math.round(Date.now() / 6000)/3;
                    const value = variable1 + 10.0 * Math.sin(t);
                    return new opcua.Variant({ dataType: opcua.DataType.Double, value: value });
                }
            }
        });

        server.nodeVariable2 = namespace.addVariable({
            componentOf: myDevice,
            browseName: "Capacity",
            dataType: "Double",
            value: {
                get: function () {
                    //const t = new Date() / 10000.0;
                    //const value = 0.5* Math.sin(t);
                    const value = variable2;
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: value });
                },
                set: function (variant) {
                    variable2 = parseFloat(variant.value);
                    return opcua.StatusCodes.Good;
                }
            }
        });

        server.nodeVariable3 = namespace.addVariable({
            componentOf: myDevice,
            nodeId: "s=Name",
            browseName: "Name",
            dataType: "String",
            value: {
                get: function () {
                    const value = variable3;
                    console.log("get Name: " + variable3);
                    return new opcua.Variant({dataType: opcua.DataType.String, value: value });
                },
                set: function (variant) {
                    console.log("set Name " + variable3);
                    variable3 = String(variant.value);
                    console.log("after set Name " + variable3);
                    return opcua.StatusCodes.Good;
                }
            }
        });

    /*  better check out what the access levels are even for 

        const nodeVariable3 = namespace.addVariable({
            componentOf: myDevice,
            browseName: "MyVariable3",
            dataType: "Double",
            arrayDimensions: [3],
            accessLevel: "CurrentRead | CurrentWrite",
            userAccessLevel: "CurrentRead | CurrentWrite",
            valueRank: 1

        });
        nodeVariable3.setValueFromSource({
            dataType: DataType.Double,
            arrayType: VariantArrayType.Array,
            value: [1.0, 2.0, 3.0]
        });
    */
        const os = require("os");
        const nodeVariable4 = namespace.addVariable({
            componentOf: myDevice,
            nodeId: "s=memory_used",
            browseName: "Percentage Memory Used",
            dataType: "Double",
            minimumSamplingInterval: 1000,
            value: {
                get: () => {
                    // const value = process.memoryUsage().heapUsed / 1000000;
                    const percentageMemUsed = 1.0 - (os.freemem() / os.totalmem());
                    const value = percentageMemUsed * 100;
                    return new opcua.Variant({ dataType: opcua.DataType.Double, value: value });
                }
            }
        });

    }
    constructAddressSpace(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}
server.initialize(post_initialize);