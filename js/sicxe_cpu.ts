class sic_rdfile{
	contents: number[];
	reading: boolean;
	writing: boolean;
	constructor(contents: number[]){
		this.contents = contents.map(val => {
			if (val < 0x00 || val > 0xFF){
				throw "val must be in range [0x00-0xFF]";
			}
		});
		this.reading = true;
		this.writing = false;
	}

	get(): number {
		return this.contents.shift();
	}

	eof(): boolean {
		return this.contents === undefined || this.contents.length == 0;
	}
}

class sic_wrfile{
	contents: number[];
	reading: boolean;
	writing: boolean;

	constructor(){
		this.contents = [];
		this.reading = false;
		this.writing = true;
	}

	push(val: number): void{
		if (number < 0x00 || number > 0xFF){
			throw "number must be in range [0x00-0xFF]";
		}
		contents.push(val);
	}
}

interface sic_file{
	reading: boolean;
	writing: boolean;
}

class sic_cpu{
	max_addr: number;
	xe: boolean;
	registers: number[];
	memory: number[];
	devices: sic_file[];
	opcodes: ((...args: any) => void)[];

	constructor(max_addr: number, xe: boolean){
		if (max_addr <= 0x0){
			throw "max_addr has to be at least 0x1"
		}
		if (max_addr > 0xFFFFF){
			throw "sic/xe machines can only address up to 0xFFFFF";
		}
		this.max_addr = max_addr;
		this.xe = xe;
		this.registers["A"]  = 0xFFFFFF; // accumulator
		this.registers["X"]  = 0xFFFFFF; // index (relative address)
		this.registers["L"]  = 0xFFFFFF; // linkage (return)
		this.registers["B"]  = 0xFFFFFF; // base (xe only)
		this.registers["S"]  = 0xFFFFFF; // general (xe only)
		this.registers["T"]  = 0xFFFFFF; // general (xe only)
		this.registers["F"]  = 0xFFFFFF; // floating point (xe only)
		this.registers["PC"] = 0x000000; // program-counter (instruction)
		this.registers["SW"] = 0x000000; // status-word (flag)
		this.memory = [];
		this.devices = [];
	}

	add_rddev(name: string, data: number[]): void{
		for (let n of data){
			if (n < 0x00 || n > 0xFF){
				throw "all bytes in data must be in range [0x00-0xFF]";
			}
		}
		if (this.devices[name] != null){
			throw "there's already a device with the name " + name;
		}
		this.devices[name] = new sic_rdfile(number);
	}

	rm_rddev(name: string): void{
		if (devices[name] == null){
			throw "device " + name + " does not exist";
		}
		delete devices[name];
	}

	add_wddev(name: string): void{
		if (devices[name] != null){
			throw "there's already a device with the name " + name;
		}
		devices[name] = new sic_wdfile(number);
	}

	rm_rddev(name: string): void{
		if (devices[name] == null){
			throw "device " + name + " does not exist";
		}
		delete devices[name];
	}

	__sic_validate_addr(mem_loc: number){
		if (mem_loc < 0x0 || mem_loc > this.max_addr){
			throw "mem_loc is outside the addressable range";
		}
	}

	__sic_validate_reg(reg: string){
		if (this.registers[reg] == null){
			throw "reg " + reg + " does not exist";
		}
	}

	__sic_validate_rddev(dev_name: string){
		if (this.devices[dev_name] == null){
			throw "device " + dev_name + " does not exist";
		}
		if (this.devices[dev_name].reading !== true){
			throw "device " + dev_name + " is not opened for reading";
		}
	}

	__sic_validate_wrdev(dev_name: string){
		if (this.devices[dev_name] == null){
			throw "device " + dev_name + " does not exist";
		}
		if (this.devices[dev_name].writing !== true){
			throw "device " + dev_name + " is not opened for writing"
		}
	}

	__sic_deref24(mem_loc: number){
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x2) {
			throw "mem_loc is outside the addressable range";
		}
		return this.memory[mem_loc] << 16 + this.memory[mem_loc + 1] << 8 + this.memory[mem_loc + 2];
	}

	__sic_deref16(mem_loc: number){
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x1) {
			throw "mem_loc is outside the addressable range";
		}
		return this.memory[mem_loc] << 8 + this.memory[mem_loc + 1];
	}

	__sic_deref8(mem_loc: number){
		if (mem_loc < 0x0 || mem_loc > this.max_addr) {
			throw "mem_loc is outside the addressable range";
		}
		return this.memory[mem_loc];
	}

	let sic_cpu.prototype.__sic_place24 = (val, mem_loc) => {
		if (typeof val !== "number") {
			throw "val is not a number";
		}
		if (typeof mem_loc !== "number") {
			throw "mem_loc is not a number";
		}
		if (val < 0x0 || val > 0xFFFFFF) {
			throw "val is outside a 24-bit range";
		}
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x2) {
			throw "mem_loc is outside the addressable range";
		}

		this.memory[mem_loc] = val & 0xFF0000 >> 16;
		this.memory[mem_loc + 1] = val & 0xFF00 >> 8;
		this.memory[mem_loc + 2] = val & 0xFF;
	}

	let sic_cpu.prototype.__sic_place16 = (val, mem_loc) => {
		if (typeof val !== "number") {
			throw "val is not a number";
		}
		if (typeof mem_loc !== "number") {
			throw "mem_loc is not a number";
		}
		if (val < 0x0 || val > 0xFFFF) {
			throw "val is outside a 16-bit range";
		}
		if (mem_loc < 0x0 || mem_loc > this.max_addr - 0x1) {
			throw "mem_loc is outside the addressable range";
		}

		this.memory[mem_loc] = val & 0xFF00 >> 8;
		this.memory[mem_loc + 1] = val & 0xFF;
	}

	let sic_cpu.prototype.__sic_place8 = (val, mem_loc) => {
		if (typeof val !== "number") {
			throw "val is not a number";
		}
		if (typeof mem_loc !== "number") {
			throw "mem_loc is not a number";
		}
		if (val < 0x0 || val > 0xFF) {
			throw "val is outside an 8-bit range";
		}
		if (mem_loc < 0x0 || mem_loc > this.max_addr) {
			throw "mem_loc is outside the addressable range";
		}

		this.memory[mem_loc] = val;
	}

	let sic_cpu.prototype.__sic_correct_flow = (reg) => {
		this.__sic_validate_reg(reg);

		var x = this.registers["reg"];
		while (x < 0xFFFFFF) {
			x += 0xFFFFFF;
		}
		x %= 0xFFFFFF;
		this.registers["reg"] = x;
	}

	let sic_cpu.prototype.opcodes["ADD"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] += this.__sic_deref24(mem_loc);
		this.__sic_correct_flow("A");
	}

	let sicxe_cpu.prototype.opcodes["ADDR"] = (reg1, reg2) => {
		this.__sic_validate_reg(reg1);
		this.__sic_validate_reg(reg2);

		this.registers[reg2] += this.registers[reg1];
		this.__sic_correct_flow(reg2);
	}

	let sic_cpu.prototype.opcodes["AND"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] &= this.__sic_deref24(mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["CLEAR"] = (reg) => {
		this.__sic_validate_reg(reg);

		this.registers[reg] = 0x0;
	}

	let sic_cpu.prototype.opcodes["COMP"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		var x = this.registers["A"]
		var y = this.__sic_deref24(mem_loc);
		if (x > y) {
			this.registers["SW"] = '>';
		}
		else if (x < y) {
			this.registers["SW"] = '<';
		}
		else {
			this.registers["SW"] = '=';
		}
	}

	let sicxe_cpu.prototype.opcodes["COMPR"] = (reg1, reg2) => {
		this.__sic_validate_reg(reg1);
		this.__sic_validate_reg(reg2);

		var x = this.registers["A"]
		var y = this.registers["B"]
		if (x === undefined || y === undefined) {
			throw "One or more registers do not exist";
		}
		if (x > y) {
			this.registers["SW"] = '>';
		}
		else if (x < y) {
			this.registers["SW"] = '<';
		}
		else {
			this.registers["SW"] = '=';
		}
	}

	let sic_cpu.prototype.opcodes["DIV"] = (mem_loc) => {
		this.registers["A"] = Math.floor(this.registers["A"] / this.__sic_deref24(mem_loc));
	}

	let sicxe_cpu["DIVR"] = (reg1, reg2) => {
		this.__sic_validate_reg(reg1);
		this.__sic_validate_reg(reg2);

		this.registers[reg2] = Math.floor(this.registers[reg2] / this.registers[reg1]);
	}

	let sic_cpu.prototype.opcodes["J"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["PC"] = mem_loc;
	}

	let sic_cpu.prototype.opcodes["JEQ"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		if (this.registers["SW"] === '=') {
			this.opcodes["J"](mem_loc);
		}
	}

	let sic_cpu.prototype.opcodes["JGT"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		if (this.registers["SW"] === '>') {
			this.opcodes["J"](mem_loc);
		}
	}

	let sic_cpu.prototype.opcodes["JLE"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		if (this.registers["SW"] === '<') {
			this.opcodes["J"](mem_loc);
		}
	}

	let sic_cpu.prototype.opcodes["JSUB"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["L"] = this.registers["PC"];
		this.registers["PC"] = mem_loc;
	}

	let sic_cpu.prototype.opcodes["LDA"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] = this.__sic_deref24(mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["LDB"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["B"] = this.__sic_deref24(mem_loc);
	}

	let sic_cpu.prototype.opcodes["LDCH"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] = this.registers["A"] & 0xFFFF00 + this.__sic_deref8(mem_loc);
	}

	let sic_cpu.prototype.opcodes["LDL"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["L"] = this.__sic_deref24(mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["LDS"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["S"] = this.__sic_deref24(mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["LDT"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["T"] = this.__sic_deref24(mem_loc);
	}

	let sic_cpu.prototype.opcodes["LDX"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["X"] = this.__sic_deref24(mem_loc);
	}

	let sic_cpu.prototype.opcodes["MUL"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] *= this.__sic_deref24(mem_loc);
		this.__sic_correct_flow("A");
	}

	let sicxe_cpu.prototype.opcodes["MULR"] = (reg1, reg2) => {
		this.__sic_validate_reg(reg1);
		this.__sic_validate_reg(reg2);

		this.registers[reg2] *= this.registers[reg1];
		this.__sic_correct_flow(reg2);
	}

	let sic_cpu.prototype.opcodes["OR"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] |= this.__sic_deref24(mem_loc);
	}

	let sic_cpu.prototype.opcodes["RD"] = (dev_name) => {
		this.__sic_validate_rddev(dev_name);

		var dev = this.devices[dev_name];
		var ch = dev.get();

		if (ch === undefined) {
			throw "There is no data left in " + dev_name;
		}

		this.opcodes["LDCH"](ch);
	}

	let sicxe_cpu.prototype.opcodes["RMO"] = (reg1, reg2) => {
		this.__sic_validate_reg(reg1);
		this.__sic_validate_reg(reg2);

		this.registers[reg2] = this.registers[reg1];
	}

	let sic_cpu.prototype.opcodes["RSUB"] = () => {
		this.registers["PC"] = this.registers["L"];
	}

	let sicxe_cpu.prototype.opcodes["SHIFTL"] = (reg, n) => {
		this.__sic_validate_reg(reg);
		if (typeof n !== "number") {
			throw "n must be a number";
		}

		// circular shift. not regular bitshift
		for (var i = 0; i < n; ++i) {
			var tmp = reg & 0x800000 >>> 23;
			this.registers[reg] <<= 1;
			this.registers[reg] += tmp;
		}
	}

	let sicxe_cpu.prototype.opcodes["SHIFTR"] = (reg, n) => {
		this.__sic_validate_reg(reg);
		if (typeof n !== "number") {
			throw "n must be a number";
		}

		// >> does sign extension, >>> does zero extension
		this.registers[reg] >>= n;
	}

	let sic_cpu.prototype.opcodes["STA"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.__sic_place24(this.registers["A"], mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["STB"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.__sic_place24(this.registers["B"], mem_loc);
	}

	let sic_cpu.prototype.opcodes["STCH"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.__sic_place8(this.registers["A"] & 0xFF, mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["STI"] = (mem_loc) => {
		throw "sti not implemented yet";
	}

	let sic_cpu.prototype.opcodes["STL"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.__sic_place24(this.registers["L"], mem_loc);
	}

	let sic_cpu.prototype.opcodes["STSW"] = (mem_loc) => {
		throw "stsw not implemented yet";
	}

	let sicxe_cpu.prototype.opcodes["STT"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.__sic_place24(this.registers["T"], mem_loc);
	}

	let sic_cpu.prototype.opcodes["STX"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.__sic_place24(this.registers["X"], mem_loc);
	}

	let sic_cpu.prototype.opcodes["SUB"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["A"] -= this.__sic_deref24(mem_loc);
		this.__sic_correct_flow("A");
	}

	let sicxe_cpu.prototype.opcodes["SUBR"] = (reg1, reg2) => {
		this.__sic_validate_reg(reg1);
		this.__sic_validate_reg(reg2);

		this.registers[reg2] -= this.registers[reg1];
		this.__sic_correct_flow(reg2);
	}

	let sicxe_cpu.prototype.opcodes["SVC"] = (n) => {
		throw "svc not implemented yet";
	}

	let sic_cpu.prototype.opcodes["TD"] = (dev_name) => {
		if (typeof dev_name !== "string") {
			throw "dev_name must be a string";
		}
		if (this.devices[dev_name] === undefined) {
			throw "dev " + dev_name + " does not exist";
		}

		if (this.devices[dev_name].writing) {
			return true;
		}

		if (this.devices[dev_name].contents[0] === undefined) {
			return false;
		}
		return true;
	}

	let sic_cpu.prototype.opcodes["TIX"] = (mem_loc) => {
		this.__sic_validate_addr(mem_loc);

		this.registers["X"]++;
		this.opcodes["COMP"](mem_loc);
	}

	let sicxe_cpu.prototype.opcodes["TIXR"] = (reg) => {
		this.__sic_validate_reg(reg);

		this.registers["X"]++;
		this.opcodes["COMPR"](reg);
	}

	let sic_cpu.prototype.opcodes["WD"] = (dev_name) => {
		this.__sic_validate_wrdev(dev_name);

		devices[dev_name].push(this.registers["A"] & 0xFF);
	}

	let __sic_hex_to_opcode = (m_byte) => {
		if (typeof m_byte !== "number") {
			throw "m_byte is not a number";
		}
		if (m_byte < 0x00 || m_byte > 0xFF) {
			throw "m_byte has to be in range [0x00-0xFF]"
		}

		switch (m_byte) {
		case 0x18:
			return ["ADD", [3, 4]];
		case 0x58:
			return ["ADDF", [3, 4]];
		case 0x90:
			return ["ADDR", [2]];
		case 0x40:
			return ["AND", [3, 4]];
		case 0xB4:
			return ["CLEAR", [2]];
		case 0x28:
			return ["COMP", [3, 4]];
		case 0x88:
			return ["COMPF", [3, 4]];
		case 0xA0:
			return ["COMPR", [2]];
		case 0x24:
			return ["DIV", [3, 4]];
		case 0x64:
			return ["DIVF", [3, 4]];
		case 0x9C:
			return ["DIVR", [2]];
		case 0xC4:
			return ["FIX", [1]];
		case 0xC0:
			return ["FLOAT", [1]];
		case 0xF4:
			return ["HIO", [1]];
		case 0x3C:
			return ["J", [3, 4]];
		case 0x30:
			return ["JEQ", [3, 4]];
		case 0x38:
			return ["JLT", [3, 4]];
		case 0x48:
			return ["JSUB", [3, 4]];
		case 0x00:
			return ["LDA", [3, 4]];
		case 0x68:
			return ["LDB", [3, 4]];
		case 0x50:
			return ["LDCH", [3, 4]];
		case 0x70:
			return ["LDF", [3, 4]];
		case 0x08:
			return ["LDL", [3, 4]];
		case 0x6C:
			return ["LDS", [3, 4]];
		case 0x74:
			return ["LDT", [3, 4]];
		case 0x04:
			return ["LDX", [3, 4]];
		case 0xD0:
			return ["LPS", [3, 4]];
		case 0x20:
			return ["MUL", [3, 4]];
		case 0x60:
			return ["MULF", [3, 4]];
		case 0x98:
			return ["MULR", [2]];
		case 0xC8:
			return ["NORM", [1]];
		case 0x44:
			return ["OR", [3, 4]];
		case 0xD8:
			return ["RD", [3, 4]];
		case 0xAC:
			return ["RMO", [2]];
		case 0x4C:
			return ["RSUB", [3, 4]];
		case 0xA4:
			return ["SHIFTL", [2]];
		case 0xA8:
			return ["SHIFTR", [2]];
		case 0xF0:
			return ["SIO", [1]];
		case 0xEC:
			return ["SSK", [3, 4]];
		case 0x0C:
			return ["STA", [3, 4]];
		case 0x78:
			return ["STB", [3, 4]];
		case 0x54:
			return ["STCH", [3, 4]];
		case 0x80:
			return ["STF", [3, 4]];
		case 0xD4:
			return ["STI", [3, 4]];
		case 0x14:
			return ["STL", [3, 4]];
		case 0x7C:
			return ["STS", [3, 4]];
		case 0xE8:
			return ["STSW", [3, 4]];
		case 0x84:
			return ["STT", [3, 4]];
		case 0x10:
			return ["STX", [3, 4]];
		case 0x1C:
			return ["SUB", [3, 4]];
		case 0x5C:
			return ["SUBF", [3, 4]];
		case 0x94:
			return ["SUBR", [2]];
		case 0xB0:
			return ["SVC", [2]];
		case 0xE0:
			return ["TD", [3, 4]];
		case 0xF8:
			return ["TIO", [1]];
		case 0x2C:
			return ["TIX", [3, 4]];
		case 0xB8:
			return ["TIXR", [2]];
		case 0xDC:
			return ["WD", [3, 4]];
		default:
			throw "unknown opcode";
		}
	}

};
