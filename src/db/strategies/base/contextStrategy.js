const ICrud = require('./../interfaces/interfaceCrud')

class ContextStrategy extends ICrud{
    /* o construtor receberá qual a estratégia de banco de dados */
    constructor(strategy){
        super()
        this._database = strategy
    }

    /* As estratégias devem possuir os métodos implementados, 
    caso contrário entrará na excessão*/

    create(item){
        return this._database.create(item)
    }

    read(item, skip, limit){
        return this._database.read(item, skip, limit)
    }
    update(id, item){
        return this._database.update(id, item)
    }

    delete(id){
        return this._database.delete(id)
    }
    static connect(){
        return this._database.connect()
    }
    isConnected(){
        return this._database.isConnected()
    }
}

module.exports = ContextStrategy;