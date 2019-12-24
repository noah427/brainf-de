const Event = require("events");

class Machine {
  constructor(name, source) {
    this.name = name;
    this.stateChange = new Event();
    this.source = source;
    this.sourceIndex = 0;
    this.ptr = 0;
    this.mem = new Array(200).fill(0, 0, 200);
    this.output = new Event();
  }

  runCmd(cmd) {
    switch (this.source[this.sourceIndex]) {
      case "+":
        this.mem[this.ptr]++;
        break;
      case "-":
        this.mem[this.ptr]--;
        break;
      case ">":
        this.ptr++;
        break;
      case "<":
        this.ptr--;
        break;
      case ".":
        this.output.emit("output", this.mem[this.ptr]);

      default:
        break;
    }
  }

  clean() {
    this.sourceIndex = 0;
    this.ptr = 0;
    this.mem = new Array(200).fill(0, 0, 200);
    this.stateChange.emit("memUpdate");
  }

  executionLoop() {
    for (; this.sourceIndex < this.source.length; this.sourceIndex++) {
      this.runCmd(this.source[this.sourceIndex]);
    }
    this.stateChange.emit("memUpdate");
  }
}

class Display {
  constructor() {
    this.codeInput = document.getElementById("codeBox");
    this.runButton = document.getElementById("run");
    this.cleanButton = document.getElementById("clean");
    this.outputDis = document.getElementById("outputDis");

    this.codeInput.addEventListener("input", this.swapCode.bind(this));

    this.Machine = new Machine(
      "Default",
      this.codeInput.innerHTML,
      this.output
    );

    this.runButton.addEventListener(
      "click",
      this.Machine.executionLoop.bind(this.Machine)
    );

    this.cleanButton.addEventListener(
      "click",
      this.Machine.clean.bind(this.Machine)
    );

    this.Machine.stateChange.on("memUpdate", this.render.bind(this));

    this.Machine.stateChange.on("output", info => {
      console.log("this runs");
      this.outputDis.innerHTML += info + "\n";
    });

    this.memDis = document.getElementById("memDis");
  }

  render() {
    while (this.memDis.firstChild) {
      this.memDis.firstChild.remove();
    }

    let memSlots = [];

    this.Machine.mem.forEach(v => {
      let elem = document.createElement("button");
      elem.innerText = v;
      elem.classList.add("memSlot");
      elem.disabled = true;
      memSlots.push(elem);
    });

    for (let slot of memSlots) {
      this.memDis.appendChild(slot);
    }
  }

  swapCode() {
    this.Machine.source = this.codeInput.value;
  }

  output(val) {
    console.log(`machine outputted ${val}`);
  }
}

var display = new Display();
