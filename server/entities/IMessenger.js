// let map = new WeakMap();
// let internal = function (object) {
// if (!map.has(object))
// map.set(object, {});
// return map.get(object);
// }
class IMessage {
    constructor(idMessage, fromIdUser, toIdUser, message, dateSent, dateRead) {
        this._idMessage = idMessage;
        this._fromIdUser = fromIdUser;
        this._toIdUser = toIdUser;
        this._message = message;
        this._dateSent = dateSent;
        this._dateRead = dateRead;
        this._status = status;
    }

    setIdMessage(idMessage) {
        this._idMessage = idMessage;
    }
    setFromIdUser(fromIdUser) {
        this._fromIdUser = fromIdUser;
    }
    setToIdUser(toIdUser) {
        this._toIdUser = toIdUser;
    }
    setMessage(message) {
        this._message = message;
    }
    setDataSent(dateSent) {
        this._dateSent = dateSent;
    }
    setDataRead(dateRead) {
        this._dateRead = dateRead;
    }
    setStatus(status) {
        this._status = status;
    }

    getIdMessage() {
        return this._idMessage;
    }
    getFromIdUser() {
        return this._fromIdUser;
    }
    getToIdUser() {
        return this._toIdUser;
    }
    getMessage() {
        return this._message;
    }
    getDataSent() {
        return this._dateSent;
    }
    getDataRead() {
        return this._dateRead;
    }
    getStatus() {
        return this._status;
    }
}
module.exports = IMessage;