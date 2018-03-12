// let map = new WeakMap();
// let internal = function (object) {
//     if (!map.has(object))
//         map.set(object, {});
//     return map.get(object);
// }
class IUser {
    constructor(id, name, email, password, img) {
        this._idUser = id;
        this._name = name;
        this._email = email;
        this._password = password;
        this._img = img;
    }

    setID(id) {
        this._idUser = id;
    }
    setName(name) {
        this._name = name;
    }
    setEmail(email) {
        this._email = email;
    }
    setPassword(password) {
        this._password = password;
    }
    setImg(img) {
        this._img = img;
    }

    getID() {
        return this._idUser;
    }
    getName() {
        return this._name;
    }
    getEmail() {
        return this._email;
    }
    getPassword() {
        return this._password;
    }
    getImg() {
        return this._img;
    }
}
module.exports = IUser;