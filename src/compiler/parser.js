lib(['inspect', 'compiler', 'config', 'addRunner', 'events'],
function CompilerParser(inspect, compiler, configManager, addRunner, events) {
    var processors = [];

    var config = configManager.parser = {
        startContainer: document,
        parseLineRegex: /^(assign|as|data-assign|data-as)(-[^-]+)*/
    };

    compiler.parser = {
        processors: processors,
        getParseLines: getParseLines,
        parse: parseAll,
        addProcessor: addProcessor
    };

    var eventList = compiler.parser.events = events.createGroup([
        'beforeFirstRun',
        'afterFirstRun'
    ], compiler.parser);

    var instanceConfig = this.instanceConfig;

    addRunner(function (config) {
        if (!eventList.beforeFirstRun.trigger()) {
           return;
        }

        var container = instanceConfig.container ?
            document.querySelector(instanceConfig.container) : null;

        parseAll(container);

        eventList.afterFirstRun.trigger();
    });

    function addProcessor(processor) {
        processors.push(processor);
        processors.sort(compareProcessors);

        function compareProcessors(a, b) {
            return b.priority - a.priority;
        }
    }

    function parseAll(startContainer) {
        var container = startContainer || config.startContainer;
        for(var i = 0; i < processors.length; i++) {
            processors[i].parseAll(container);
        }
    }

    function getParseLines(element) {
        var lines = [], i, j;
        var attributes = element.attributes;

        for(i = 0; i < attributes.length; i++) {
            var match = attributes[i].name.match(config.parseLineRegex);
            if (!match) {
               continue;
            }

            if (match[2]) {
              var skip = false;
              for(j = 0; j < processors.length; j++) {
                  if (processors[j].lines && processors[j].lines.indexOf(match[2]) !== -1) {
                     skip = true;
                     break;
                  }
              }

              if (skip) {
                 continue;
              }
            }

            lines.push(attributes[i].value);
        }

        return lines;
    }
});
