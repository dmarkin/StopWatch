'use strict';
(function () {
    function MainTimer(node) {
        this.laps = [];
        this.node = node;
        this.startMoment = 0;
        this.stopMoment = 0;
        this.timerId = null;
        this.createDOM(this.node);
        this.timerTable = this.node.querySelector('.' + this.node.className + ' .stopwatch-current');
        this.loadTimerButton = this.node.querySelector('.btn-primary');
        this.lapTimerButton = this.node.querySelector('.btn-info');
        this.resetTimerButton = this.node.querySelector('.btn-lg');
        this.initEvents();
        this.elapsedTime = 0;
        this.instance = {};
    }

    //build DOM for timer
    MainTimer.prototype.createDOM = function () {
        var containerDiv = this.node;
        var rowDiv = newDivInDiv(containerDiv, 'row');
        var timerDiv = newDivInDiv(rowDiv, 'col-xs-4');
        var timerButtonsDiv = newDivInDiv(rowDiv, 'col-xs-4 stopwatch-controls');
        var timerDivH2 = timerDiv.appendChild(document.createElement('h2'));
        timerDivH2.className += 'stopwatch-current timer';
        timerDivH2.textContent = '00:00:00:000';
        var stopTimer = newDivInDiv(timerDiv, 'stopwatch-laps');
        var innerTimerButtonsDiv = newDivInDiv(timerButtonsDiv, 'btn-group btn-group-lg');
        innerTimerButtonsDiv.innerHTML = '<button class="btn btn-primary">Start</button><button class="btn btn-info">Lap</button>';
        timerButtonsDiv.innerHTML += '<button class="btn btn-danger btn-lg">Reset</button>';
    }

    //initialize event listeners
    MainTimer.prototype.initEvents = function () {
        this.loadTimerButton.addEventListener('click', this.loadTimer.bind(this), false);
        this.lapTimerButton.addEventListener('click', this.lapTimer.bind(this), false);
        this.resetTimerButton.addEventListener('click', this.resetTimer.bind(this), false);
        document.addEventListener('mouseover', this.keyMappingOnDiv.bind(this), false);
        document.addEventListener('keyup', this.keyMapping.bind(this), false);
    }

    //search instance of timer
    MainTimer.prototype.keyMappingOnDiv = function (event) {
        var _thisNode = this.node;
        this.instance = topWalker(event.target, function (node) {
            return _thisNode === node;
        });
    }

    //get current time
    MainTimer.prototype.getTimer = function () {
        var nowMoment = (new Date()).getTime();
        return (nowMoment - this.startMoment + this.elapsedTime);
    }

    //watch current time on table
    MainTimer.prototype.watchTimer = function () {
        this.timerTable.textContent = new MillisecondsToTime(this.getTimer()).watchformat;
    }

    //action on start and stop button
    MainTimer.prototype.loadTimer = function () {
        //if timer is stopped, we are start
        if (this.loadTimerButton.textContent === 'Start') {
            this.startMoment = (new Date()).getTime();
            this.loadTimerButton.textContent = 'Stop';
            this.timerId = setInterval(this.watchTimer.bind(this), 16);
        }
        //if timer is running, we are stop
        else {
            this.stopMoment = (new Date()).getTime();
            clearInterval(this.timerId);
            this.timerId = null;
            this.elapsedTime += this.stopMoment - this.startMoment;
            this.loadTimerButton.textContent = 'Start';
            this.timerTable.textContent = new MillisecondsToTime(this.elapsedTime).watchformat;
        }
    }

    //action in lap button
    MainTimer.prototype.lapTimer = function () {
        var newStampMs = this.getTimer();
        var newStamp = 0;

        if (this.startMoment) {
            if (this.loadTimerButton.textContent === 'Stop') {
                newStamp = new MillisecondsToTime(newStampMs);
            }
            else { // give a visible discrepancy
                newStamp = new MillisecondsToTime(this.elapsedTime);
            }
        }
        else {
            newStamp = new MillisecondsToTime(0);
        }
        this.laps.push(newStamp);
        console.log(newStamp);

        this.showNewLap(newStamp);
    }

    //action on reset button
    MainTimer.prototype.resetTimer = function () {
        clearInterval(this.timerId);
        this.timerId = null;
        this.laps = [];
        this.startMoment = 0;
        this.elapsedTime = 0;
        this.timerTable.textContent = '00:00:00:000';
        this.loadTimerButton.textContent = 'Start';
        if (this.node.querySelector('.alert-info')) {
            var elem = this.node.querySelector('.alert-info').parentNode;
            while (elem.lastChild) {
                elem.removeChild(elem.lastChild);
            }
        }
    }

    //show new lap
    MainTimer.prototype.showNewLap = function (stamp) {
        var watchDiv = newDivInDiv(this.node.querySelector('.stopwatch-laps'), 'alert alert-info');
        watchDiv.id = 'id-' + this.laps.length;
        watchDiv.innerHTML = '<span>' + stamp.watchformat + '</span><span class="label label-danger">×</span>';
        this.node.querySelector('#' + watchDiv.id + ' .label').addEventListener('click', this.hideLap.bind(this), false);
    }

    //close chosen lap
    MainTimer.prototype.hideLap = function (event) {
        var lapIndex = event.target.parentNode.id.slice(3);
        var elem = this.node.querySelector('#' + event.target.parentNode.id);
        elem.parentNode.removeChild(elem);
        this.laps[lapIndex - 1] = null;
    }

    //action on keys press
    MainTimer.prototype.keyMapping = function (event) {
        if (this.instance) {

            console.log(this.instance);

            if (event.keyCode === 83) {
                event.preventDefault();
                this.loadTimer();
            }
            ;

            if (event.keyCode === 76) {
                event.preventDefault();
                this.lapTimer();
            }
            ;

            if (event.keyCode === 82) {
                event.preventDefault();
                this.resetTimer();
            }
            ;
        }
    }

    //utility function for DOM building
    function newDivInDiv(parentDiv, className) {
        var childContainer = document.createElement('div');
        childContainer.className += className;
        return parentDiv.appendChild(childContainer);
    }

    //transfer time in ms to time in hh:mm:ss:ms
    function MillisecondsToTime(milli) {
        this.milliseconds = Math.floor(milli % 1000);
        this.seconds = outputFormatNumber((Math.floor(milli / 1000)) % 60);
        this.minutes = outputFormatNumber((Math.floor(milli / (60 * 1000)) % 60));
        this.hours = outputFormatNumber(Math.floor(milli / (60 * 60 * 1000)));
        this.watchformat = this.hours + ':' + this.minutes + ':' + this.seconds + ':' + this.milliseconds;
    }

    function outputFormatNumber(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function topWalker(node, testFunc, lastParent) {
        while (node && node !== lastParent) {
            if (testFunc(node)) {
                return node;
            }
            node = node.parentNode;
        }
        return false;
    }

    window.MainTimer = MainTimer;
})();