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

    read(query){
        return this._database.read(query)
    }
    update(id, item){
        return this._database.update(id, item)
    }

    delete(id){
        return this._database.delete(id)
    }
    isConnected(){
        return this._database.isConnected()
    }
}

module.exports = ContextStrategy;