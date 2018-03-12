let map = new WeakMap();
let internal = function (object) {
    if (!map.has(object))
        map.set(object, {});
    return map.get(object);
}

class IFriend {
    constructor(idFriend, idUser) {
        this._idFriend = idFriend;
        this._idUser = idUser;
        this._friends = [];
    }

    setIDFreind(idFriend) {
        this._idFriend = idFriend;
    }
    setIdUser(idUser) {
        this._idUser = idUser;
    }
    setFriends(friends) {
        this._friends = friends;
    }

    getIDFreind() {
        return this._idFriend;
    }
    getIdUser() {
        return this._idUser;
    }
    getFriends() {
        return this._friends;
    }
}

module.exports = IFriend;