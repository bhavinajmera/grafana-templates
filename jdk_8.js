// All commented lines are entirely optional, and only included to illustrate
//  the correct usage thereof

jdk_8 = function(hostname, prefix, aggregate, nodeNum) {

    prefix = prefix + ".";

    shortHostname = hostname.split(".")[0];

    var panels = [];

    defaults = {
        "type": "graph",
        "datasource": "influxdb",
        "stack": true,
        "nullPointMode": "null as zero",
        "fill": 0.5,
        "legend": aggregate ? false : true
    };

    if (!aggregate) {
        panels.push({
            "title": "-",
            "type": "text",
            "span": 1,
            "mode": "html",
            "content": "<center><H1><br>" + (nodeNum > 9 ? nodeNum : "0" + nodeNum) + "</H1></center>"
        });
    }

    panels.push({
        "title": "JVM Memory",
        "type": defaults["type"],
        "datasource": defaults["datasource"],
        "stack": defaults["stack"],
        "nullPointMode": defaults["nullPointMode"],
        "fill": defaults["fill"],
        "y_formats": ["bytes"],
        "span": aggregate ? 4 : 3,
        "legend": defaults["legend"],
        "grid": {
            "leftMin": null,
            "leftMax": null,
            "rightMin": null,
            "rightMax": null,
            // "threshold1": 100, // example: "warn" threshold
            // "threshold1Color": "rgba(216, 200, 27, 0.17)",
            // "threshold2": 200, // example: "critical" threshold
            // "threshold2Color": "rgba(234, 112, 112, 0.17)",
        },
        // "thresholdLine": false,
        // "lines": true,
        // "linewidth": 1,
        // "points": false,
        // "pointradius": 3,
        // "bars": false,
        // "barwidth": 1,
        // "steppedLine": false,

        "targets": [{
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.MemoryPoolImpl.MemoryPool.Par Survivor Space.Usage.used",
            "column": "value",
            "alias": "Survivor"
        }, {
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.MemoryPoolImpl.MemoryPool.CMS Old Gen.Usage.used",
            "column": "value",
            "alias": "Old"
        }, {
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.MemoryPoolImpl.MemoryPool.Par Eden Space.Usage.used",
            "column": "value",
            "alias": "Eden"
        }]
    }, {
        "title": "JVM Threads",
        "type": defaults["type"],
        "datasource": defaults["datasource"],
        "stack": !defaults["stack"],
        "nullPointMode": defaults["nullPointMode"],
        "fill": defaults["fill"],
        "y_formats": ["short"],
        "span": 2,
        "legend": defaults["legend"],
        "grid": {
            "leftMin": 0,
            "leftMax": null,
            "rightMin": 0,
            "rightMax": null,
        },
        "targets": [{
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.ThreadImpl.Threading.ThreadCount",
            "column": "value",
            "alias": "Total"
        }, {
            "function": "derivative",
            "interval": "30s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.ThreadImpl.Threading.TotalStartedThreadCount",
            "column": "value",
            "alias": "Started"
        }, {
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.ThreadImpl.Threading.PeakThreadCount",
            "column": "value",
            "alias": "Peak"
        }]
    }, {
        "title": "Old Gen GC",
        "type": defaults["type"],
        "datasource": defaults["datasource"],
        "stack": !defaults["stack"],
        "nullPointMode": defaults["nullPointMode"],
        "fill": defaults["fill"],
        "y_formats": ["short"],
        "span": 2,
        "legend": defaults["legend"],
        "grid": {
            "leftMin": null,
            "leftMax": null,
            "rightMin": null,
            "rightMax": null,
        },
        "targets": [{
            "function": "derivative",
            "interval": "30s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.GarbageCollectorImpl.GarbageCollector.ConcurrentMarkSweep.CollectionCount",
            "column": "value*60",
            "alias": "Count"
        }, {
            "function": "derivative",
            "interval": "30s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.GarbageCollectorImpl.GarbageCollector.ConcurrentMarkSweep.CollectionTime",
            "column": "value*-1*60/1000",
            "alias": "Time (s)"
        }]
    }, {
        "title": "Total Compilation Time",
        "type": defaults["type"],
        "datasource": defaults["datasource"],
        "stack": !defaults["stack"],
        "nullPointMode": defaults["nullPointMode"],
        "fill": defaults["fill"],
        "y_formats": ["short"],
        "span": 2,
        "legend": defaults["legend"],
        "grid": {
            "leftMin": null,
            "leftMax": null,
            "rightMin": null,
            "rightMax": null,
        },
        "targets": [{
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.CompilationImpl.Compilation.TotalCompilationTime",
            "column": "value/1000",
            "alias": "Time (s)"
        }]
    }, {
        "title": "Code Cache",
        "type": defaults["type"],
        "datasource": defaults["datasource"],
        "stack": !defaults["stack"],
        "nullPointMode": defaults["nullPointMode"],
        "fill": defaults["fill"],
        "y_formats": ["bytes"],
        "span": 2,
        "legend": defaults["legend"],
        "grid": {
            "leftMin": null,
            "leftMax": null,
            "rightMin": null,
            "rightMax": null,
        },
        "targets": [{
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.MemoryPoolImpl.MemoryPool.Code Cache.Usage.used",
            "column": "value",
            "alias": "Used"
        }, {
            "function": "mean",
            "interval": "15s",
            "groupby_field_add": aggregate,
            "groupby_field": aggregate ? "hostname" : null,
            "condition_filter": true,
            "condition_add": "and",
            "condition_key": "hostname",
            "condition_op": "=~",
            "condition_value": "/" + hostname + "/",
            "series": prefix + "sun.management.MemoryPoolImpl.MemoryPool.Code Cache.Usage.max",
            "column": "value",
            "alias": "Max"
        }]
    });

    return panels;
};