class IWFriend {
    constructor(idWFriend, idUser) {
        this._idWFriend = idWFriend;
        this._idUser = idUser;
        this._WFriends = [];
    }

    setIDFreind(_idWFriend) {
        this._idWFriend = _idWFriend;
    }
    setIdUser(idUser) {
        this._idUser = idUser;
    }
    setFriends(_WFriends) {
        this._WFriends = _WFriends;
    }

    getIDFreind() {
        return this._idWFriend;
    }
    getIdUser() {
        return this._idUser;
    }
    getFriends() {
        return this._WFriends;
    }
}

module.exports = IWFriend;