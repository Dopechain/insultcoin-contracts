export default class PureEthAddress {
    address: string

    constructor(str: string) {
        let reg = /^0x([0-9a-f][0-9a-f])*$/gi
        if (!str.startsWith("0x") && str.length < 42) { str = "0x".concat(str)}
        str = str.padEnd(42, "0")
        if (!reg.test(str)) { throw "EthAddress: String is not an address" }
        this.address = str
    }

    get() {
        return this.address
    }

    toString() {
        return this.get()
    }
}

export { PureEthAddress }